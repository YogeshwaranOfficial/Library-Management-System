import { jest } from "@jest/globals";
import httpStatus from "http-status-codes";

jest.unstable_mockModule("./member.repository.js", () => ({
  createMemberRepository: jest.fn(),
  getAllMembersRepository: jest.fn(),
  getMemberByIdRepository: jest.fn(),
  updateMemberRepository: jest.fn(),
  deleteMemberRepository: jest.fn(),
  searchMembersByNameRepository: jest.fn(),
  getEligibleUsersForMemberRepository: jest.fn(),
  getAllPlansWithMetrics: jest.fn(), // NEW
}));

jest.unstable_mockModule("../../database/models/Member.js", () => ({
  default: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.unstable_mockModule(
  "../../database/models/MembershipPlan.js",
  () => ({
    default: {
      findByPk: jest.fn(),
    },
  })
);

const {
  createMemberService,
  getAllMembersService,
  getMemberByIdService,
  updateMemberService,
  deleteMemberService,
  searchMembersByNameService,
  getEligibleUsersForMemberService,
} = await import("./member.service.js");

const {
  createMemberRepository,
  getAllMembersRepository,
  getMemberByIdRepository,
  updateMemberRepository,
  deleteMemberRepository,
  searchMembersByNameRepository,
  getEligibleUsersForMemberRepository,
  getAllPlansWithMetrics,
} = await import("./member.repository.js");

const { default: Member } =
  await import("../../database/models/Member.js");

const { default: MembershipPlan } =
  await import(
    "../../database/models/MembershipPlan.js"
  );

const { default: AppError } =
  await import("../../utils/AppError.js");

const mockCreateRepo =
  createMemberRepository as any;

const mockGetAllRepo =
  getAllMembersRepository as any;

const mockGetByIdRepo =
  getMemberByIdRepository as any;

const mockUpdateRepo =
  updateMemberRepository as any;

const mockDeleteRepo =
  deleteMemberRepository as any;

const mockSearchRepo =
  searchMembersByNameRepository as any;

const mockEligibleUsersRepo =
  getEligibleUsersForMemberRepository as any;

const mockMemberModel =
  Member as any;

const mockMembershipPlan =
  MembershipPlan as any;

describe("Member Service Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createMemberService", () => {
    const payload = {
      user_id: "user-1",
      membership_plan_id: "plan-1",
    } as any;

    it("should create member successfully", async () => {
      mockMemberModel.findOne.mockResolvedValue(
        null
      );

      mockMembershipPlan.findByPk.mockResolvedValue(
        {
          membership_plan_id: "plan-1",
          duration_days: 30,
        }
      );

      mockCreateRepo.mockResolvedValue({
        member_id: "member-1",
      });

      const result =
        await createMemberService(payload);

      expect(
        mockMemberModel.findOne
      ).toHaveBeenCalledWith({
        where: {
          user_id: payload.user_id,
        },
      });

      expect(
        mockMembershipPlan.findByPk
      ).toHaveBeenCalledWith(
        payload.membership_plan_id
      );

      expect(
        mockCreateRepo
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: payload.user_id,
          membership_plan_id:
            payload.membership_plan_id,
          membership_status: "ACTIVE",
        })
      );

      expect(result).toEqual({
        member_id: "member-1",
      });
    });

    it("should throw when member already exists", async () => {
      mockMemberModel.findOne.mockResolvedValue(
        {
          member_id: "member-1",
        }
      );

      await expect(
        createMemberService(payload)
      ).rejects.toThrow(
        new AppError(
          "This user is already registered as an active library member.",
          httpStatus.CONFLICT
        )
      );
    });

    it("should throw when plan not found", async () => {
      mockMemberModel.findOne.mockResolvedValue(
        null
      );

      mockMembershipPlan.findByPk.mockResolvedValue(
        null
      );

      await expect(
        createMemberService(payload)
      ).rejects.toThrow(
        new AppError(
          "The selected membership plan does not exist.",
          httpStatus.NOT_FOUND
        )
      );
    });
  });

  describe("getAllMembersService", () => {
    it("should return paginated members", async () => {
      mockGetAllRepo.mockResolvedValue({
        count: 2,
        rows: [
          { member_id: "1" },
          { member_id: "2" },
        ],
      });

      const result =
        await getAllMembersService({
          page: 1,
          limit: 10,
        } as any);

      expect(
        mockGetAllRepo
      ).toHaveBeenCalled();

      expect(result.meta.total).toBe(2);

      expect(result.data).toHaveLength(2);
    });
  });

  describe("getMemberByIdService", () => {
    it("should return member", async () => {
      mockGetByIdRepo.mockResolvedValue({
        member_id: "member-1",
      });

      const result =
        await getMemberByIdService(
          "member-1"
        );

      expect(result).toEqual({
        member_id: "member-1",
      });
    });

    it("should throw when member not found", async () => {
      mockGetByIdRepo.mockResolvedValue(
        null
      );

      await expect(
        getMemberByIdService(
          "member-1"
        )
      ).rejects.toThrow(
        new AppError(
          "Member not found",
          httpStatus.NOT_FOUND
        )
      );
    });
  });

  describe("updateMemberService", () => {
    it("should update member status", async () => {
      mockMemberModel.findByPk.mockResolvedValue(
        {
          member_id: "member-1",
        }
      );

      mockUpdateRepo.mockResolvedValue({
        member_id: "member-1",
        membership_status: "EXPIRED",
      });

      const result =
        await updateMemberService(
          "member-1",
          {
            membership_status:
              "EXPIRED",
          }
        );

      expect(
        mockUpdateRepo
      ).toHaveBeenCalledWith(
        "member-1",
        {
          membership_status:
            "EXPIRED",
        }
      );

      expect(
        result.membership_status
      ).toBe("EXPIRED");
    });

    it("should update membership plan and recalculate dates", async () => {
      mockMemberModel.findByPk.mockResolvedValue(
        {
          member_id: "member-1",
        }
      );

      mockMembershipPlan.findByPk.mockResolvedValue(
        {
          membership_plan_id:
            "plan-2",
          duration_days: 365,
        }
      );

      mockUpdateRepo.mockResolvedValue({
        member_id: "member-1",
      });

      await updateMemberService(
        "member-1",
        {
          membership_plan_id:
            "plan-2",
        }
      );

      expect(
        mockMembershipPlan.findByPk
      ).toHaveBeenCalledWith(
        "plan-2"
      );

      expect(
        mockUpdateRepo
      ).toHaveBeenCalledWith(
        "member-1",
        expect.objectContaining({
          membership_plan_id:
            "plan-2",
          membership_status:
            "ACTIVE",
        })
      );
    });

    it("should throw when member record missing", async () => {
      mockMemberModel.findByPk.mockResolvedValue(
        null
      );

      await expect(
        updateMemberService(
          "member-1",
          {}
        )
      ).rejects.toThrow(
        new AppError(
          "Member record not found",
          httpStatus.NOT_FOUND
        )
      );
    });

    it("should throw when selected plan does not exist", async () => {
      mockMemberModel.findByPk.mockResolvedValue(
        {
          member_id: "member-1",
        }
      );

      mockMembershipPlan.findByPk.mockResolvedValue(
        null
      );

      await expect(
        updateMemberService(
          "member-1",
          {
            membership_plan_id:
              "plan-2",
          }
        )
      ).rejects.toThrow(
        new AppError(
          "The selected membership plan does not exist.",
          httpStatus.NOT_FOUND
        )
      );
    });

    it("should throw when repository returns null", async () => {
      mockMemberModel.findByPk.mockResolvedValue(
        {
          member_id: "member-1",
        }
      );

      mockUpdateRepo.mockResolvedValue(
        null
      );

      await expect(
        updateMemberService(
          "member-1",
          {
            membership_status:
              "ACTIVE",
          }
        )
      ).rejects.toThrow(
        new AppError(
          "Member not found",
          httpStatus.NOT_FOUND
        )
      );
    });
  });

  describe("deleteMemberService", () => {
    it("should delete member", async () => {
      mockDeleteRepo.mockResolvedValue({
        member_id: "member-1",
      });

      const result =
        await deleteMemberService(
          "member-1"
        );

      expect(
        mockDeleteRepo
      ).toHaveBeenCalledWith(
        "member-1"
      );

      expect(result).toEqual({
        member_id: "member-1",
      });
    });

    it("should throw when member not found", async () => {
      mockDeleteRepo.mockResolvedValue(
        null
      );

      await expect(
        deleteMemberService(
          "member-1"
        )
      ).rejects.toThrow(
        new AppError(
          "Member not found",
          httpStatus.NOT_FOUND
        )
      );
    });
  });

  describe("searchMembersByNameService", () => {
    it("should return empty array when search token empty", async () => {
      const result =
        await searchMembersByNameService(
          ""
        );

      expect(result).toEqual([]);

      expect(
        mockSearchRepo
      ).not.toHaveBeenCalled();
    });

    it("should search members successfully", async () => {
      mockSearchRepo.mockResolvedValue([
        {
          member_id: "member-1",
          name: "John",
        },
      ]);

      const result =
        await searchMembersByNameService(
          " John "
        );

      expect(
        mockSearchRepo
      ).toHaveBeenCalledWith(
        "John"
      );

      expect(result).toHaveLength(1);
    });
  });

describe("getEligibleUsersForMemberService", () => {
  it("should return eligible users", async () => {
    const users = [
      {
        uuid: "user-1",
        name: "John Doe",
      },
    ];

    mockEligibleUsersRepo.mockResolvedValue(users);

    const result =
      await getEligibleUsersForMemberService();

    expect(
      mockEligibleUsersRepo
    ).toHaveBeenCalled();

    expect(result).toEqual(users);
  });
});
});