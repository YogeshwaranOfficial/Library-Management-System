import Member from "../../database/models/Member.js";
import Book from "../../database/models/Book.js";
import Fine from "../../database/models/Fine.js";
import User from "../../database/models/User.js";
import MembershipPlan from "../../database/models/MembershipPlan.js";
import PlanHistory from "../../database/models/PlanHistory.js"; // ✅ Imported PlanHistory
import { CreateMemberPayload, UpdateMemberPayload } from "./member.types.js";
import { Op, WhereOptions, Sequelize } from "sequelize";
import Issue from "../../database/models/Issue.js"; 


export const createMemberRepository = async (payload: CreateMemberPayload) => {
  return await Member.create(payload as any);
};

export const getAllMembersRepository = async (
  query: Record<string, any>
) => {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const offset = (page - 1) * limit;

  const todayString = new Date().toISOString().split("T")[0];

  // Auto-expire members whose date has passed
  await Member.update(
    { membership_status: "EXPIRED" },
    {
      where: {
        expiry_date: { [Op.lt]: todayString },
        membership_status: { [Op.ne]: "EXPIRED" },
      },
    }
  );

  const memberWhereClause: WhereOptions = {};

  if (query.status) {
    memberWhereClause.membership_status = query.status;
  } else if (query.membership_status) {
    memberWhereClause.membership_status = query.membership_status;
  }

  const userInclude: Record<string, any> = {
    model: User,
    as: "user",
    attributes: ["uuid", "name", "gmail", "phone_number"],
  };

  if (query.search) {
    userInclude.where = {
      name: {
        [Op.iLike]: `%${query.search}%`,
      },
    };
  }

  const planInclude: Record<string, any> = {
    model: MembershipPlan,
    as: "membership_plan",
    attributes: ["membership_plan_id", "plan_name", "price"],
  };

  if (query.plan) {
    planInclude.where = {
      plan_name: query.plan,
    };
  }

  // 🚀 DYNAMIC SORTING RESOLUTION SYSTEM
  // Define default values if params aren't passed
  const rawSortField = query.sort_by || "created_at";
  const activeOrderDirection = query.order?.toUpperCase() === "ASC" ? "ASC" : "DESC";

  let activeOrderClause: any[] = [["created_at", "DESC"]]; // Default fallback

  // If sorting by name or contact, we must reference columns nested inside the associated User model
  if (rawSortField === "name") {
    activeOrderClause = [[ { model: User, as: "user" }, "name", activeOrderDirection ]];
  } else if (rawSortField === "contact") {
    // Falls back to user email address field for sorting
    activeOrderClause = [[ { model: User, as: "user" }, "gmail", activeOrderDirection ]];
  } else if (rawSortField === "created_at") {
    activeOrderClause = [["created_at", activeOrderDirection]];
  }

  const result = await Member.findAndCountAll({
    where: memberWhereClause,
    limit,
    offset,
    include: [userInclude, planInclude],
    // !!! INJECT DETECTED ORDERING CLAUSE HERE !!!
    order: activeOrderClause,
    distinct: true,
  });

  // 👇 REFACTORED TRANSLATION BLOCK 👇
  const formattedRows = result.rows.map((memberInstance: any) => {
    const member = memberInstance.toJSON();

    const trueMemberId = member.id || member.member_id || "";
    const cleanUuidString = String(trueMemberId).replace(/-/g, "");
    const shortToken = cleanUuidString.slice(-4).toUpperCase();

    return {
      ...member,
      id: trueMemberId,
      userId: member.user?.uuid || member.user_id || "", 
      displayId: `MEMBER-${shortToken || "0000"}`,
      email: member.user?.gmail || "",
      phoneNumber: member.user?.phone_number || "",
      membershipPlanId: member.membership_plan?.membership_plan_id || member.membership_plan_id || "",
      isActive: member.membership_status === "ACTIVE",
    };
  });

  // Calculate Meta Counters
  let dashboardPlanWhere: any = {};

  if (query.plan) {
    const selectedPlan = await MembershipPlan.findOne({
      where: { plan_name: query.plan },
      attributes: ["membership_plan_id"],
    });

    if (selectedPlan) {
      dashboardPlanWhere.membership_plan_id = selectedPlan.get("membership_plan_id");
    }
  }

  const [dashboardTotal, totalActive, totalExpired] = await Promise.all([
    Member.count({ where: dashboardPlanWhere }),
    Member.count({
      where: {
        ...dashboardPlanWhere,
        membership_status: "ACTIVE",
      },
    }),
    Member.count({
      where: {
        ...dashboardPlanWhere,
        membership_status: "EXPIRED",
      },
    }),
  ]);

  return {
    count: dashboardTotal,
    totalActive,
    totalExpired,
    rows: formattedRows,
  };
};

export const getMemberByIdRepository = async (memberId: string) => {
  const memberData = await Member.findByPk(memberId, {
    attributes: ["member_id", "start_date", "expiry_date", "membership_status", "membership_plan_id"], 

    include: [
      {
        model: User,
        as: "user",
        attributes: ["uuid", "name", "gmail", "phone_number"]
      },
      {
        model: MembershipPlan,
        as: "membership_plan",
        attributes: ["membership_plan_id", "plan_name"]
      },
      {
        model: PlanHistory,
        as: "plan_histories",
        include: [
          {
            model: MembershipPlan,
            as: "membership_plan", // ✅ FIX: Added the missing alias here
            attributes: ["plan_name"]
          }
        ]
      },
      {
        model: Issue,
        as: "issues",
        attributes: ["issue_id", "borrowed_date", "returned_date", "issue_status"],
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["book_name"] 
          },
          {
            model: Fine,
            as: "fine",
            attributes: ["fine_amount", "paid_status"]
          }
        ]
      }
    ]
  });

  if (!memberData) return null;

  const raw = memberData.toJSON() as any;
  const activeIssues = raw.issues || [];
  const dbHistories = raw.plan_histories || [];

  // Map database histories to the structure expected by your UI
  const structuralHistory = dbHistories.map((hist: any) => ({
    // ✅ FIX: Access via alias property 'membership_plan' instead of capitalized model name
    name: hist.membership_plan?.plan_name || "Unknown Tier",
    start_date: hist.start_date,
    end_date: hist.expiry_date,
    books_borrowed_count: Number(hist.lending_count)
  }));

  // Append the current active plan on top of the list so historical sequences stay clear
  structuralHistory.unshift({
    name: raw.membership_plan?.plan_name || "Primary Tier",
    start_date: raw.start_date,
    end_date: raw.expiry_date,
    books_borrowed_count: activeIssues.filter((i: any) => {
      const borrowTime = new Date(i.borrowed_date);
      return borrowTime >= new Date(raw.start_date) && borrowTime <= new Date(raw.expiry_date);
    }).length
  });

  return {
    member_id: raw.member_id,
    name: raw.user?.name || "Unknown Member",
    email: raw.user?.gmail || "",
    phone: raw.user?.phone_number || "N/A",
    join_date: raw.start_date,
    current_plan: {
      name: raw.membership_plan?.plan_name || "No Active Plan",
      expiry_date: raw.expiry_date
    },
    
    plan_history: structuralHistory,

    borrowing_logs: activeIssues.map((issue: any) => {
      const fineRecord = issue.fine; 
      const fineAmount = fineRecord ? (Number(fineRecord.fine_amount)) : 0;
      const paidStatus = fineRecord ? (Boolean(fineRecord.paid_status)) : "Null";

      return {
        book_title: issue.book?.book_name || "Unknown Book",
        plan_context: raw.membership_plan?.plan_name || "Standard Scope",
        borrow_date: issue.borrowed_date,
        return_date: issue.returned_date || "Not Returned Yet",
        status: issue.issue_status || "GOOD",
        fine_paid: fineAmount,
        paid_status: paidStatus
      };
    })
  };
};

export const updateMemberRepository = async (memberId: string, payload: UpdateMemberPayload) => {
  const member = await Member.findByPk(memberId);
  if (!member) return null;

  // ✅ Step: Detect Plan Changes/Renewals before updating the members table row
  if (payload.membership_plan_id && payload.membership_plan_id !== member.get('membership_plan_id')) {
    
    // Calculate borrowing count for this specific plan cycle before shifting it out
    const totalBorrowedInCycle = await Issue.count({
      where: {
        member_id: memberId,
        borrowed_date: {
          [Op.gte]: member.get('start_date')
        }
      }
    });

    // Write the historical trace to the database snapshot table (Fixed with String casting)
    await PlanHistory.create({
      member_id: memberId,
      membership_plan_id: String(member.get('membership_plan_id')),
      start_date: String(member.get('start_date')),
      expiry_date: String(member.get('expiry_date')),
      lending_count: totalBorrowedInCycle
    });
  }
  
  await member.update(payload as any);
  return await getMemberByIdRepository(memberId);
};

export const deleteMemberRepository = async (memberId: string) => {
  const member = await Member.findByPk(memberId);
  if (!member) return null;
  
  await member.destroy();
  return member;
};

export const getEligibleUsersForMemberRepository = async () => {
  const activeMembers = await Member.findAll({
    attributes: ["user_id"],
    raw: true
  });

  const existingUserIds = activeMembers.map((m: any) => m.user_id).filter(Boolean);

  return await User.findAll({
    where: {
      role: "READER",
      uuid: {
        [Op.notIn]: existingUserIds.length > 0 ? existingUserIds : [""]
      }
    },
    attributes: [
      ["uuid", "id"], 
      "name", 
      ["gmail", "email"], 
      ["phone_number", "phoneNumber"] 
    ],
    order: [["name", "ASC"]]
  });
};

export const searchMembersByNameRepository = async (searchToken: string) => {
  const matches = await Member.findAll({
    include: [
      {
        model: User,
        as: "user",
        required: true, 
        where: {
          name: { [Op.iLike]: `%${searchToken}%` } 
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

  const today = new Date();

  const detailedResults = await Promise.all(
    matches.map(async (member: any) => {
      const activeBorrowsCount = await Issue.count({
        where: {
          member_id: member.member_id,
          returned_date: null 
        }
      });

      const maxAllowed = member.membership_plan?.max_books_allowed || 0;
      const planName = member.membership_plan?.plan_name || "No Plan";
      
      const isExpired = member.membership_status === "EXPIRED" || new Date(member.expiry_date) < today;

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
        isBlocked = false; 
      }

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
          status: dynamicStatus,
          message: statusMessage,
          isBlocked 
        }
      };
    })
  );

  return detailedResults;
};

export const getAllPlansWithMetrics = async (searchTerm?: string) => {
  const whereClause: any = {};
  
  if (searchTerm) {
    whereClause.plan_name = { [Op.iLike]: `%${searchTerm}%` };
  }

  const plans = await MembershipPlan.findAll({
    where: whereClause,
    attributes: {
      include: [
        [
          Sequelize.literal(`(
            SELECT COUNT(*)::int 
            FROM "members" AS m 
            WHERE m.membership_plan_id = "MembershipPlan".membership_plan_id 
            AND m.membership_status = 'ACTIVE'
          )`),
          'active_members_count'
        ],
        [
          Sequelize.literal(`(
            SELECT COUNT(*)::int 
            FROM "members" AS m 
            WHERE m.membership_plan_id = "MembershipPlan".membership_plan_id 
            AND m.membership_status = 'EXPIRED'
          )`),
          'inactive_members_count'
        ]
      ] // ✅ Fixed here: was an accidental closing curly brace instead of bracket
    },
    order: [["created_at", "DESC"]]
  });

  const [globalActiveMembers, globalInactiveMembers] = await Promise.all([
    Member.count({
      where: {
        membership_status: "ACTIVE"
      }
    }),
    Member.count({
      where: {
        membership_status: "EXPIRED"
      }
    })
  ]);

  return {
    plans,
    globalActiveMembers,
    globalInactiveMembers
  };
};