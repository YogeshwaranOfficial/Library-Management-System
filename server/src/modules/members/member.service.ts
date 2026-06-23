import httpStatus from "http-status-codes";
import AppError from "../../utils/AppError.js";
import {
  createMemberRepository,
  deleteMemberRepository,
  getAllMembersRepository,
  getMemberByIdRepository,
  updateMemberRepository,
  searchMembersByNameRepository,
  getEligibleUsersForMemberRepository,
  getAllPlansWithMetrics, // 💡 ADDED: Importing the new metric repository function
} from "./member.repository.js";
import {
  CreateMemberPayload,
  UpdateMemberPayload,
  MemberQuery
} from "./member.types.js";
import Member from "../../database/models/Member.js";
import MembershipPlan from "../../database/models/MembershipPlan.js"; // 💡 ADDED: To fetch duration rules
import "../../database/models/User.js";

export const getEligibleUsersForMemberService = async () => {
  return await getEligibleUsersForMemberRepository();
};

// ⭐ FIXED: Calculates subscription timeline based on selected plan duration
export const createMemberService = async (payload: CreateMemberPayload) => {
  const existingMember = await Member.findOne({ where: { user_id: payload.user_id } });
  if (existingMember) {
    throw new AppError("This user is already registered as an active library member.", httpStatus.CONFLICT);
  }

  // 1. Fetch the chosen membership plan from DB to get its duration
  const plan = await MembershipPlan.findByPk(payload.membership_plan_id);
  if (!plan) {
    throw new AppError("The selected membership plan does not exist.", httpStatus.NOT_FOUND);
  }

  // 2. Compute dynamic start and expiry dates
  const startDate = new Date(); // Today
  const expiryDate = new Date();
  expiryDate.setDate(startDate.getDate() + plan.duration_days); // 💡 Automatically add duration (e.g., 16, 30, or 365 Days)

  // 3. Construct enriched payload matching DB columns cleanly
  const enrichedPayload = {
    user_id: payload.user_id,
    membership_plan_id: payload.membership_plan_id,
    start_date: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
    expiry_date: expiryDate.toISOString().split('T')[0],
    membership_status: "ACTIVE" // Defaults to active on fresh creation
  };

  return await createMemberRepository(enrichedPayload as any);
};

// 🛠️ PATCHED: Using direct numbers from our upgraded query object layer
export const getAllMembersService = async (query: MemberQuery) => {
  const members = await getAllMembersRepository(query);
  
  return {
    meta: {
      total: members.count,
      globalActive: members.totalActive,
      globalExpired: members.totalExpired,
      page: query.page,   
      limit: query.limit, 
    },
    data: members.rows, // ✅ This will now cleanly carry the frontend-ready LibraryMember[] records
  };
};

export const getMemberByIdService = async (memberId: string) => {
  const member = await getMemberByIdRepository(memberId);
  if (!member) {
    throw new AppError("Member not found", httpStatus.NOT_FOUND);
  }
  return member;
};

export const updateMemberService = async (memberId: string, payload: UpdateMemberPayload) => {
  const member = await Member.findByPk(memberId);
  if (!member) {
    throw new AppError("Member record not found", httpStatus.NOT_FOUND);
  }

  // 1. Initialize the target update payload explicitly matching the type constraints
  const enrichedPayload: UpdateMemberPayload = {};

  // 2. Map existing payload optional values if they exist
  if (payload.membership_status) enrichedPayload.membership_status = payload.membership_status;
  if (payload.membership_plan_id) enrichedPayload.membership_plan_id = payload.membership_plan_id;

  // 3. If a new plan is assigned, calculate the parameters cleanly
  if (payload.membership_plan_id) {
    const plan = await MembershipPlan.findByPk(payload.membership_plan_id);
    if (!plan) {
      throw new AppError("The selected membership plan does not exist.", httpStatus.NOT_FOUND);
    }

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(startDate.getDate() + plan.duration_days);

    // 💡 Fix: Directly assign absolute strings. No undefined values can leak here!
    enrichedPayload.start_date = startDate.toISOString().split('T')[0];
    enrichedPayload.expiry_date = expiryDate.toISOString().split('T')[0];
    enrichedPayload.membership_status = "ACTIVE";
  } else {
    if (payload.start_date) enrichedPayload.start_date = payload.start_date!;
    if (payload.expiry_date) enrichedPayload.expiry_date = payload.expiry_date!;
  }

  // 4. Pass the pristine payload to your repository layer
  const updatedMember = await updateMemberRepository(memberId, enrichedPayload);
  if (!updatedMember) {
    throw new AppError("Member not found", httpStatus.NOT_FOUND);
  }

  return updatedMember;
};

export const deleteMemberService = async (memberId: string) => {
  const deletedMember = await deleteMemberRepository(memberId);
  if (!deletedMember) {
    throw new AppError("Member not found", httpStatus.NOT_FOUND);
  }
  return deletedMember;
};

export const searchMembersByNameService = async (searchToken: string) => {
  if (!searchToken || !searchToken.trim()) {
    return [];
  }
  return await searchMembersByNameRepository(searchToken.trim());
};

// =========================================================
// NEW: PLANS WITH MEMBERS MEMBERSHIP METRICS SERVICE
// =========================================================
export const getAllPlansWithMetricsService = async (searchTerm?: string) => {
  const { plans, globalActiveMembers, globalInactiveMembers } = await getAllPlansWithMetrics(searchTerm);
  
  return {
    meta: {
      total: plans.length,
      globalActiveMembers,
      globalInactiveMembers
    },
    data: plans
  };
};