import { jest } from "@jest/globals";

// ============================================================================
// MOCKS
// ============================================================================

const mockRepository: any = {
  getAllPlans: jest.fn(),
  findPlanById: jest.fn(),
  findPlanByName: jest.fn(),
  createPlan: jest.fn(),
  updatePlan: jest.fn(),
  deletePlan: jest.fn(),
};

jest.unstable_mockModule("./plans.repository.js", () => ({
  PlansRepository: jest.fn(() => mockRepository),
}));

jest.unstable_mockModule(
  "../../database/models/MembershipPlan.js",
  () => ({
    default: {
      findOne: jest.fn(),
    },
  })
);

// ============================================================================
// IMPORTS AFTER MOCKING
// ============================================================================

const { PlansService } = await import("./plans.service.js");

const { default: MembershipPlan } = await import(
  "../../database/models/MembershipPlan.js"
);

const mockMembershipPlan = MembershipPlan as any;

// ============================================================================
// TEST DATA
// ============================================================================

const samplePlan = {
  membership_plan_id: "plan-1",
  plan_name: "Premium",
  price: 999,
  duration_days: 365,
  max_books_allowed: 10,
};

describe("PlansService Unit Tests", () => {
  let plansService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    plansService = new PlansService();
  });

  // ==========================================================================
  // listAllPlans
  // ==========================================================================

  describe("listAllPlans", () => {
    it("should return all plans", async () => {
      mockRepository.getAllPlans.mockResolvedValue([
        samplePlan,
      ]);

      const result =
        await plansService.listAllPlans();

      expect(
        mockRepository.getAllPlans
      ).toHaveBeenCalledTimes(1);

      expect(result).toHaveLength(1);

      expect(result[0]).toMatchObject({
        membership_plan_id: "plan-1",
        plan_name: "Premium",
      });
    });
  });

  // ==========================================================================
  // addPlan
  // ==========================================================================

  describe("addPlan", () => {
    it("should create plan successfully", async () => {
      const payload = {
        plan_name: "Premium",
        price: 999,
        duration_days: 365,
        max_books_allowed: 10,
      };

      mockRepository.findPlanByName.mockResolvedValue(
        null
      );

      mockRepository.createPlan.mockResolvedValue(
        samplePlan
      );

      const result =
        await plansService.addPlan(payload);

      expect(
        mockRepository.findPlanByName
      ).toHaveBeenCalledWith("Premium");

      expect(
        mockRepository.createPlan
      ).toHaveBeenCalledWith(payload);

      expect(result).toEqual(samplePlan);
    });

    it("should throw when plan name already exists", async () => {
      mockRepository.findPlanByName.mockResolvedValue(
        samplePlan
      );

      await expect(
        plansService.addPlan({
          plan_name: "Premium",
          price: 999,
          duration_days: 365,
          max_books_allowed: 10,
        })
      ).rejects.toThrow(
        'A scheme model with profile descriptor name "Premium" already exists.'
      );
    });
  });

  // ==========================================================================
  // editPlan
  // ==========================================================================

  describe("editPlan", () => {
    it("should update plan successfully", async () => {
      const updatePayload = {
        membership_plan_id: "plan-1",
        plan_name: "Premium Plus",
        price: 1499,
        duration_days: 730,
        max_books_allowed: 20,
      };

      mockRepository.findPlanById
        .mockResolvedValueOnce(samplePlan)
        .mockResolvedValueOnce({
          ...samplePlan,
          ...updatePayload,
        });

      mockMembershipPlan.findOne.mockResolvedValue(
        null
      );

      mockRepository.updatePlan.mockResolvedValue([
        1,
      ]);

      const result =
        await plansService.editPlan(
          updatePayload
        );

      expect(
        mockRepository.findPlanById
      ).toHaveBeenCalledWith("plan-1");

      expect(
        mockMembershipPlan.findOne
      ).toHaveBeenCalled();

      expect(
        mockRepository.updatePlan
      ).toHaveBeenCalledWith("plan-1", {
        plan_name: "Premium Plus",
        price: 1499,
        duration_days: 730,
        max_books_allowed: 20,
      });

      expect(result.plan_name).toBe(
        "Premium Plus"
      );
    });

    it("should throw when target plan does not exist", async () => {
      mockRepository.findPlanById.mockResolvedValue(
        null
      );

      await expect(
        plansService.editPlan({
          membership_plan_id: "missing-plan",
          plan_name: "Premium",
          price: 999,
          duration_days: 365,
          max_books_allowed: 10,
        })
      ).rejects.toThrow(
        "Target strategy scheme payload reference record not found."
      );
    });

    it("should throw when name conflict exists", async () => {
      mockRepository.findPlanById.mockResolvedValue(
        samplePlan
      );

      mockMembershipPlan.findOne.mockResolvedValue(
        {
          membership_plan_id: "another-plan",
          plan_name: "Premium",
        }
      );

      await expect(
        plansService.editPlan({
          membership_plan_id: "plan-1",
          plan_name: "Premium",
          price: 999,
          duration_days: 365,
          max_books_allowed: 10,
        })
      ).rejects.toThrow(
        'Strategic name conflict framework. Profile alias "Premium" is assigned elsewhere.'
      );
    });
  });

  // ==========================================================================
  // purgePlan
  // ==========================================================================

  describe("purgePlan", () => {
    it("should delete plan successfully", async () => {
      mockRepository.findPlanById.mockResolvedValue(
        samplePlan
      );

      mockRepository.deletePlan.mockResolvedValue(
        1
      );

      await plansService.purgePlan("plan-1");

      expect(
        mockRepository.findPlanById
      ).toHaveBeenCalledWith("plan-1");

      expect(
        mockRepository.deletePlan
      ).toHaveBeenCalledWith("plan-1");
    });

    it("should throw when plan does not exist", async () => {
      mockRepository.findPlanById.mockResolvedValue(
        null
      );

      await expect(
        plansService.purgePlan(
          "missing-plan"
        )
      ).rejects.toThrow(
        "Target deletion operation rejected. Record already dead or dropped."
      );
    });
  });
});