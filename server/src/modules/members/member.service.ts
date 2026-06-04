import httpStatus from "http-status-codes";
import AppError from "../../utils/AppError.js";
import {
  createMemberRepository,
  deleteMemberRepository,
  getAllMembersRepository,
  getMemberByIdRepository,
  updateMemberRepository,
  searchMembersByNameRepository,
  getEligibleUsersForMemberRepository, // 💡 Imported the new repository filter engine
} from "./member.repository.js";
import {
  CreateMemberPayload,
  UpdateMemberPayload,
  MemberQuery
} from "./member.types.js";
import Member from "../../database/models/Member.js";
import "../../database/models/User.js";

// 💡 NEW FEATURE ADDITION: Service layer middleware to bridge controllers and repos safely
export const getEligibleUsersForMemberService = async () => {
  console.log("=== SERVICE LAYER START ===");
  
  const eligibleUsers = await getEligibleUsersForMemberRepository();
  
  console.log("=== SERVICE LAYER RESULT SEEN ===", eligibleUsers);
  return eligibleUsers;
};

export const createMemberService = async (payload: CreateMemberPayload) => {
  const existingMember = await Member.findOne({ where: { user_id: payload.user_id } });
  if (existingMember) {
    throw new AppError("This user is already registered as an active library member.", httpStatus.CONFLICT);
  }
  return await createMemberRepository(payload);
};

export const getAllMembersService = async (query: MemberQuery) => {
  const members = await getAllMembersRepository(query);

  return {
    meta: {
      total: members.count,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
    },
    data: members.rows,
  };
};

// EXPORTED THIS SO YOUR SPEC FILE STOPS CRYING
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

  const updatedMember = await updateMemberRepository(memberId, payload);
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
  // 1. Guard check: If the query token is empty or completely whitespace, bail early with empty payload
  if (!searchToken || !searchToken.trim()) {
    return [];
  }

  // 2. Pass string cleanly to the repository to calculate status thresholds
  const structuredResults = await searchMembersByNameRepository(searchToken.trim());
  
  return structuredResults;
};