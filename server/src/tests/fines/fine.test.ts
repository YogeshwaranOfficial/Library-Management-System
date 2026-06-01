import "@jest/globals";
import request from "supertest";
import httpStatus from "http-status-codes";
import sequelize from "../../database/connection/database.js";

const { default: app } = await import("../../app.js"); 
const { default: Fine } = await import("../../database/models/Fine.js");
const { default: Issue } = await import("../../database/models/Issue.js");
const { getAuthToken } = await import("../helpers/testAuth.helper.js");

describe("Fine Module (End-to-End Integration Tests)", () => {
  let mockLibrarianToken: string = "";
  let dynamicMemberId: string = "";

  // Target explicit data points established by your SQL seeds
  const seedUnpaidFineId = "50000001-5555-4555-a555-555555555501";
  const seedPaidFineId = "50000003-5555-4555-a555-555555555503";
  const seedTargetIssueId = "40000011-4444-4444-a444-444444444411";

  beforeAll(async () => {
    mockLibrarianToken = await getAuthToken();

    // Dynamically look up the member_id tied to your seed issue to avoid breaking foreign key logic
    const issueRecord = await Issue.findByPk(seedTargetIssueId);
    if (issueRecord) {
      dynamicMemberId = (issueRecord.get("member_id") || (issueRecord as any).member_id) as string;
    }
  });

  afterAll(async () => {
    // REVERT MUTATION: Safely reset the modified seed record back to its original unpaid state
    await Fine.update(
      { paid_status: false, paid_date: null },
      { where: { fine_id: seedUnpaidFineId } }
    );
    await sequelize.close();
  });

  // ==========================================
  // 🔐 SECURITY & AUTHENTICATION GUARDRAILS
  // ==========================================
  describe("🔐 Auth Guardrail Check", () => {
    it("🔴 Sad Path: Should reject request with 401 Unauthorized if no token is passed", async () => {
      const response = await request(app).get("/api/v1/fines").send();
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  // ==========================================
  // 📥 GET /api/v1/fines
  // ==========================================
  describe("📤 GET /api/v1/fines", () => {
    it("🟢 Happy Path: Should fetch all records containing seeded structural data matching payload design", async () => {
      const response = await request(app)
        .get("/api/v1/fines")
        .set("Authorization", `Bearer ${mockLibrarianToken}`);

      expect(response.status).toBe(httpStatus.OK);
      const records = response.body.data || response.body;
      expect(Array.isArray(records)).toBe(true);
      expect(records.length).toBeGreaterThanOrEqual(5); // Confirms your 5 SQL seeds exist
    });
  });

  // ==========================================
  // 📥 GET /api/v1/fines/pending
  // ==========================================
  describe("📤 GET /api/v1/fines/pending", () => {
    it("🟢 Happy Path: Should extract exclusively unpaid balances", async () => {
      const response = await request(app)
        .get("/api/v1/fines/pending")
        .set("Authorization", `Bearer ${mockLibrarianToken}`);

      expect(response.status).toBe(httpStatus.OK);
      const records = response.body.data || response.body;
      
      expect(Array.isArray(records)).toBe(true);
      // Ensure all fetched entries are unpaid
      records.forEach((fine: any) => {
        expect(fine.paid_status).toBe(false);
      });
    });
  });

  // ==========================================
  // 📥 GET /api/v1/fines/member/:memberId
  // ==========================================
  describe("📤 GET /api/v1/fines/member/:memberId", () => {
    it("🟢 Happy Path: Should return member records across optimized join tables", async () => {
      if (!dynamicMemberId) {
        console.warn("⚠️ Warning: Skipping member lookup integration test due to missing seed issue mapping link.");
        return;
      }

      const response = await request(app)
        .get(`/api/v1/fines/member/${dynamicMemberId}`)
        .set("Authorization", `Bearer ${mockLibrarianToken}`);

      expect(response.status).toBe(httpStatus.OK);
      const records = response.body.data || response.body;
      expect(Array.isArray(records)).toBe(true);
    });
  });

  // ==========================================
  // 🔧 PATCH /api/v1/fines/pay
  // ==========================================
  describe("🔧 PATCH /api/v1/fines/pay", () => {
    it("🔴 Sad Path: Should reject if payload execution parameters break Zod validation rules", async () => {
      const response = await request(app)
        .patch("/api/v1/fines/pay")
        .set("Authorization", `Bearer ${mockLibrarianToken}`)
        .send({ fine_id: "not-a-valid-uuid" });

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("🔴 Sad Path: Should reject execution if fine is already marked as paid", async () => {
      const response = await request(app)
        .patch("/api/v1/fines/pay")
        .set("Authorization", `Bearer ${mockLibrarianToken}`)
        .send({ fine_id: seedPaidFineId });

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("🟢 Happy Path: Should successfully settle an open balance and record the payment date", async () => {
      const response = await request(app)
        .patch("/api/v1/fines/pay")
        .set("Authorization", `Bearer ${mockLibrarianToken}`)
        .send({ fine_id: seedUnpaidFineId });

      expect(response.status).toBe(httpStatus.OK);
      
      const responseData = response.body.data || response.body;
      expect(responseData.paid_status).toBe(true);
      expect(responseData.paid_date).not.toBeNull();
    });
  });
});