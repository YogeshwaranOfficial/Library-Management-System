import httpStatus from "http-status-codes";
import AppError from "../../utils/AppError.js";
import {
  createMemberRepository,
  deleteMemberRepository,
  getAllMembersRepository,
  getMemberByIdRepository,
  updateMemberRepository,
} from "./member.repository.js";
import {
  CreateMemberPayload,
  UpdateMemberPayload,
  MemberQuery
} from "./member.types.js";
import Member from "../../database/models/Member.js";
import "../../database/models/User.js";

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