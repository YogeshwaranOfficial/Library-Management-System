import Member from "../../database/models/Member.js";
import User from "../../database/models/User.js";
import MembershipPlan from "../../database/models/MembershipPlan.js";
import { CreateMemberPayload, UpdateMemberPayload, MemberQuery } from "./member.types.js";
import { Op } from "sequelize";

export const createMemberRepository = async (payload: CreateMemberPayload) => {
  return await Member.create(payload as any);
};

export const getAllMembersRepository = async (query: MemberQuery) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const offset = (page - 1) * limit;

  // Bulk update expired records cleanly
  await Member.update(
    { membership_status: "EXPIRED" },
    {
      where: {
        expiry_date: { [Op.lt]: new Date() },
        membership_status: { [Op.ne]: "EXPIRED" }
      }
    }
  );

  return await Member.findAndCountAll({
    limit,
    offset,
    include: [
      { 
        model: User, 
        as: "user", 
        attributes: ["uuid", "name", "gmail"] 
      },
      { 
        model: MembershipPlan, 
        as: "membership_plan", 
        attributes: ["membership_plan_id", "plan_name", "price"]
      }
    ],
    order: [["created_at", "DESC"]]
  });
};

export const getMemberByIdRepository = async (memberId: string) => {
  return await Member.findByPk(memberId, {
    include: [
      { 
        model: User, 
        as: "user", // ✅ Added alias matching your association file
        attributes: ["uuid", "name", "gmail"] 
      },
      { 
        model: MembershipPlan, 
        as: "membership_plan",
        attributes: ["membership_plan_id", "plan_name"]
      }
    ]
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