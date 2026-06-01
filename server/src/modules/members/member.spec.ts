import { jest } from "@jest/globals";
import httpStatus from "http-status-codes";

// =========================================================================
// 1. MOCKING THE LAYERS (This replaces real database & repository instances)
// =========================================================================
jest.unstable_mockModule("./member.repository.js", () => ({
  createMemberRepository: jest.fn(),
  getAllMembersRepository: jest.fn(),
  getMemberByIdRepository: jest.fn(),
  updateMemberRepository: jest.fn(),
  deleteMemberRepository: jest.fn(),
}));

jest.unstable_mockModule("../../database/models/Member.js", () => ({
  default: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
  }
}));

// 2. Dynamic asynchronous imports to cleanly fetch dependencies post-mocking
const {
  createMemberService,
  getAllMembersService,
  getMemberByIdService,
  updateMemberService,
  deleteMemberService,
} = await import("./member.service.js");

const {
  createMemberRepository,
  getAllMembersRepository,
  getMemberByIdRepository,
  updateMemberRepository,
  deleteMemberRepository,
} = await import("./member.repository.js");

const { default: Member } = await import("../../database/models/Member.js");
const { default: AppError } = await import("../../utils/AppError.js");

// 3. Cast mocks to 'any' so TypeScript allows jest-specific assertions (.mockResolvedValue)
const mockCreateRepo = createMemberRepository as any;
const mockGetAllRepo = getAllMembersRepository as any;
const mockGetByIdRepo = getMemberByIdRepository as any;
const mockUpdateRepo = updateMemberRepository as any;
const mockDeleteRepo = deleteMemberRepository as any;
const mockMemberModel = Member as any;

describe("👥 Member Service (Isolated Unit Tests)", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // CREATE MEMBER SUITE
  // ==========================================
  describe("📥 createMemberService Context", () => {
    it("🟢 Happy Path: Should hand off payload to repository if user is not a member yet", async () => {
      const samplePayload = {
        user_id: "10000001-1111-1111-1111-111111111111",
        membership_plan_id: "96479a54-3591-465c-9ed4-4dba4e0da49a",
        start_date: "2026-05-01",
        expiry_date: "2026-08-01",
      };

      // Tell Jest what the Member model & Repository should "pretend" to return
      mockMemberModel.findOne.mockResolvedValue(null); 
      mockCreateRepo.mockResolvedValue({ member_id: "20000001-2222-2222-2222-222222222222", ...samplePayload });

      const result = await createMemberService(samplePayload);

      expect(mockCreateRepo).toHaveBeenCalledWith(samplePayload);
      expect(result).toHaveProperty("member_id", "20000001-2222-2222-2222-222222222222");
    });

    it("🔴 Sad Path: Should reject with CONFLICT status if user is already a registered member", async () => {
      mockMemberModel.findOne.mockResolvedValue({ member_id: "20000001-2222-2222-2222-222222222222" });

      await expect(createMemberService({ user_id: "10000001-1111-1111-1111-111111111111" } as any))
        .rejects
        .toThrow(new AppError("This user is already registered as an active library member.", httpStatus.CONFLICT));
    });
  });

  // ==========================================
  // GET ALL MEMBERS SUITE
  // ==========================================
  describe("📤 getAllMembersService Context", () => {
    it("🟢 Happy Path: Should return paginated members list and metadata from repo", async () => {
      const mockQuery = { page: 1, limit: 10 };
      mockGetAllRepo.mockResolvedValue({
        count: 1,
        rows: [{ member_id: "20000001-2222-2222-2222-222222222222", membership_status: "ACTIVE" }],
      });

      const result = await getAllMembersService(mockQuery);

      expect(mockGetAllRepo).toHaveBeenCalledWith(mockQuery);
      expect(result.meta.total).toBe(1);
    });
  });

  // ==========================================
  // GET MEMBER BY ID SUITE
  // ==========================================
  describe("🔍 getMemberByIdService Context", () => {
    it("🟢 Happy Path: Should fetch single member record successfully", async () => {
      mockGetByIdRepo.mockResolvedValue({ member_id: "20000001-2222-2222-2222-222222222222", membership_status: "ACTIVE" });

      const result = await getMemberByIdService("20000001-2222-2222-2222-222222222222");

      expect(mockGetByIdRepo).toHaveBeenCalledWith("20000001-2222-2222-2222-222222222222");
      expect(result).toHaveProperty("member_id", "20000001-2222-2222-2222-222222222222");
    });

    it("🔴 Sad Path: Should throw a 404 AppError if member does not exist", async () => {
      mockGetByIdRepo.mockResolvedValue(null);

      await expect(getMemberByIdService("non-existent-id"))
        .rejects
        .toThrow(new AppError("Member not found", httpStatus.NOT_FOUND));
    });
  });

  // ==========================================
  // UPDATE MEMBER SUITE
  // ==========================================
  describe("🔧 updateMemberService Context", () => {
    it("🟢 Happy Path: Should run standard updates successfully", async () => {
      const patchData = { membership_status: "EXPIRED" as const };
      
      mockMemberModel.findByPk.mockResolvedValue({ member_id: "20000001-2222-2222-2222-222222222222" });
      mockUpdateRepo.mockResolvedValue({ member_id: "20000001-2222-2222-2222-222222222222", membership_status: "EXPIRED" });

      const result = await updateMemberService("20000001-2222-2222-2222-222222222222", patchData);

      expect(mockUpdateRepo).toHaveBeenCalledWith("20000001-2222-2222-2222-222222222222", patchData);
      expect(result.membership_status).toBe("EXPIRED");
    });

    it("🔴 Sad Path: Should throw 404 error if member record is missing", async () => {
      mockMemberModel.findByPk.mockResolvedValue(null);

      await expect(updateMemberService("non-existent-id", {}))
        .rejects
        .toThrow(new AppError("Member record not found", httpStatus.NOT_FOUND));
    });
  });

  // ==========================================
  // DELETE MEMBER SUITE
  // ==========================================
  describe("🗑️ deleteMemberService Context", () => {
    it("🟢 Happy Path: Should delete record clean from repository", async () => {
      mockDeleteRepo.mockResolvedValue({ member_id: "20000001-2222-2222-2222-222222222222" });

      const result = await deleteMemberService("20000001-2222-2222-2222-222222222222");

      expect(mockDeleteRepo).toHaveBeenCalledWith("20000001-2222-2222-2222-222222222222");
      expect(result).toHaveProperty("member_id", "20000001-2222-2222-2222-222222222222");
    });

    it("🔴 Sad Path: Should return 404 if record cannot be located", async () => {
      mockDeleteRepo.mockResolvedValue(null);

      await expect(deleteMemberService("non-existent-id"))
        .rejects
        .toThrow(new AppError("Member not found", httpStatus.NOT_FOUND));
    });
  });
});