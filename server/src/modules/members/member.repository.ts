import Member from "../../database/models/Member.js";
import User from "../../database/models/User.js";
import MembershipPlan from "../../database/models/MembershipPlan.js";
import { CreateMemberPayload, UpdateMemberPayload } from "./member.types.js";
import { Op, WhereOptions, Sequelize } from "sequelize";

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