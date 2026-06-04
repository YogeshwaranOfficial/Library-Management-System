import Member from "../../database/models/Member.js";
import User from "../../database/models/User.js";
import MembershipPlan from "../../database/models/MembershipPlan.js";
import { CreateMemberPayload, UpdateMemberPayload } from "./member.types.js";
import { Op, WhereOptions, Sequelize } from "sequelize";
import Issue from "../../database/models/Issue.js"; 

export const createMemberRepository = async (payload: CreateMemberPayload) => {
  return await Member.create(payload as any);
};

export const getAllMembersRepository = async (query: Record<string, any>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const offset = (page - 1) * limit;

  // 1. Bulk update expired records cleanly before loading data
  await Member.update(
    { membership_status: "EXPIRED" },
    {
      where: {
        expiry_date: { [Op.lt]: new Date() },
        membership_status: { [Op.ne]: "EXPIRED" }
      }
    }
  );

  // 2. Build explicit Member level filter properties
  const memberWhereClause: WhereOptions = {};
  if (query.status) {
    memberWhereClause.membership_status = query.status;
  } else if (query.membership_status) {
    memberWhereClause.membership_status = query.membership_status;
  }

  // 3. Build dynamic configuration structures for association tables
  const userInclude: Record<string, any> = {
    model: User,
    as: "user",
    attributes: ["uuid", "name", "gmail", "phone_number"]
  };

  // Add the where parameter only if a search token exists
  if (query.search) {
    userInclude.where = {
      name: { [Op.iLike]: `%${query.search}%` } 
    };
  }

  const planInclude: Record<string, any> = {
    model: MembershipPlan,
    as: "membership_plan",
    attributes: ["membership_plan_id", "plan_name", "price"]
  };

  // Add the where parameter only if a plan filtering tier token exists
  if (query.plan) {
    planInclude.where = {
      plan_name: query.plan
    };
  }

  // 4. Fire final structured find query
  return await Member.findAndCountAll({
    where: memberWhereClause,
    limit,
    offset,
    include: [userInclude, planInclude],
    order: [["created_at", "DESC"]],
    distinct: true
  });
};

export const getMemberByIdRepository = async (memberId: string) => {
  return await Member.findByPk(memberId, {
    include: [
      { 
        model: User, 
        as: "user", 
        attributes: ["uuid", "name", "gmail"] 
      },
      { 
        model: MembershipPlan, 
        as: "membership_plan",
        attributes: ["membership_plan_id", "plan_name"]
      }
    ] // 💥 FIXED: Changed typo brace to proper closing bracket
  });
};

export const updateMemberRepository = async (memberId: string, payload: UpdateMemberPayload) => {
  const member = await Member.findByPk(memberId);
  if (!member) return null;
  
  await member.update(payload as any);
  return await getMemberByIdRepository(memberId);
};

export const deleteMemberRepository = async (memberId: string) => {
  const member = await Member.findByPk(memberId);
  if (!member) return null;
  
  await member.destroy();
  return member;
};

// 💡 UPDATED FEATURE: Returns users with role READER who are NOT already inside the members table
export const getEligibleUsersForMemberRepository = async () => {
  // 1. Gather all existing member user IDs
  const activeMembers = await Member.findAll({
    attributes: ["user_id"],
    raw: true
  });

  
  const existingUserIds = activeMembers.map((m: any) => m.user_id).filter(Boolean);

  // 2. Fetch users whose role is READER and are not in that list
  return await User.findAll({
    where: {
      role: "READER",
      uuid: {
        [Op.notIn]: existingUserIds.length > 0 ? existingUserIds : [""]
      }
    },
    attributes: [
      ["uuid", "id"], // 💡 Mapping 'uuid' to 'id' to match frontend expected SystemUser contract typing
      "name", 
      ["gmail", "email"], // 💡 Mapping 'gmail' to 'email' to match frontend contract expected SystemUser typing
      ["phone_number", "phoneNumber"] // 💡 Mapping 'phone_number' to 'phoneNumber'
    ],
    order: [["name", "ASC"]]
  });
};

export const searchMembersByNameRepository = async (searchToken: string) => {
  // 1. Fetch matching members based on nested user names
  const matches = await Member.findAll({
    include: [
      {
        model: User,
        as: "user",
        required: true, // Forces an INNER JOIN so we only get members with user records
        where: {
          name: { [Op.iLike]: `%${searchToken}%` } // Case-insensitive matching
        },
        attributes: ["name", "phone_number", "gmail"]
      },
      {
        model: MembershipPlan,
        as: "membership_plan",
        attributes: ["plan_name", "max_books_allowed"]
      }
    ]
  });

  // 2. Loop over matches to compute real-time borrow load statistics
  const detailedResults = await Promise.all(
    matches.map(async (member: any) => {
      // Count how many books this member currently has out of the building
      const activeBorrowsCount = await Issue.count({
        where: {
          member_id: member.member_id,
          returned_date: null // Not returned yet
        }
      });

      const maxAllowed = member.membership_plan?.max_books_allowed || 0;
      const planName = member.membership_plan?.plan_name || "No Plan";
      const isExpired = member.membership_status === "EXPIRED" || new Date(member.expiry_date) < new Date();

      // 🚦 Implement Business Logic Rule Matrix
      let dynamicStatus = "GOOD";
      let statusMessage = `✓ Safe: Holds ${activeBorrowsCount}/${maxAllowed} books under ${planName} tier.`;
      let isBlocked = false;

      if (isExpired) {
        dynamicStatus = "EXPIRED";
        statusMessage = "❌ Blocked: Membership plan has expired.";
        isBlocked = true;
      } else if (activeBorrowsCount >= maxAllowed) {
        dynamicStatus = "LIMIT_EXCEEDED";
        statusMessage = `⚠️ Blocked: Quota limit hit! (${activeBorrowsCount}/${maxAllowed} assets held).`;
        isBlocked = true;
      } else if (activeBorrowsCount + 1 === maxAllowed) {
        dynamicStatus = "WARNING_LAST_SLOT";
        statusMessage = `⚠️ Warning: Last open slot! (${activeBorrowsCount}/${maxAllowed} held).`;
        isBlocked = false; // Librarian can still select it, but gets a clear warning indicator!
      }

      // Return a flat structure tailored for dropdown presentation
      return {
        member_id: member.member_id,
        name: member.user?.name || "Unknown",
        phone_number: member.user?.phone_number || "No Contact",
        membership_status: isExpired ? "EXPIRED" : member.membership_status,
        expiry_date: member.expiry_date,
        plan_name: planName,
        maxAllowed,
        currentBorrows: activeBorrowsCount,
        compliance: {
          status: dynamicStatus,       // "GOOD" | "EXPIRED" | "LIMIT_EXCEEDED" | "WARNING_LAST_SLOT"
          message: statusMessage,      // Human-readable message
          isBlocked                    // true means dropdown blocks click selection
        }
      };
    })
  );

  return detailedResults;
};