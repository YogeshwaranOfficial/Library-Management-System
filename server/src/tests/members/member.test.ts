import "@jest/globals";
import request from "supertest";
import httpStatus from "http-status-codes";
import sequelize from "../../database/connection/database.js";

const { default: app } = await import("../../app.js"); 
const { default: Member } = await import("../../database/models/Member.js");
const { default: User } = await import("../../database/models/User.js");
const { default: MembershipPlan } = await import("../../database/models/MembershipPlan.js");
const { getAuthToken } = await import("../helpers/testAuth.helper.js");

describe("Member Module (End-to-End Integration Tests)", () => {
  let mockLibrarianToken: string = "";
  let testUserUuid: string = "";
  let validPlanUuid: string = "";
  let sharedMemberId: string = ""; // 🔑 Passes the created member ID down the pipeline

  beforeAll(async () => {
    // 1. Get the Librarian token for authorization
    mockLibrarianToken = await getAuthToken();
    
    // 2. Safely grab an existing, real seeded plan
    const plan = await MembershipPlan.findOne();
    if (!plan) {
      throw new Error("❌ Test Setup Failure: Zero records found in the MembershipPlans table.");
    }
    validPlanUuid = (plan.get("membership_plan_id") || plan.get("id") || (plan as any).membership_plan_id) as string;

    // 3. Create EXACTLY ONE clean test User (Reader) for this suite run
    const temporaryUser = await User.create({
      name: "Integration Test Reader",
      gmail: `test.reader.${Date.now()}@gmail.com`,
      password: "$2b$10$EixVaKV3ws1vEPb9JIJ40uN40Z9J0.W8Sshm68661vV3a6.83qbyG", // dummy hash
      role: "READER"
    } as any);

    testUserUuid = (temporaryUser.get("uuid") || temporaryUser.get("id") || (temporaryUser as any).uuid) as string;
    console.log("🚀 Created isolated test user for lifecycle pipeline:", testUserUuid);
  });

  afterAll(async () => {
    // Clean up in reverse order of foreign key dependency
    if (sharedMemberId) {
      await Member.destroy({ where: { member_id: sharedMemberId } }).catch(() => {});
    }
    if (testUserUuid) {
      await User.destroy({ where: { uuid: testUserUuid } }).catch(() => {});
      console.log("🧹 Cleanly purged test user and associated rows from database.");
    }
    await sequelize.close(); 
  });

  // ==========================================
  // 🔐 SECURITY & AUTHENTICATION GUARDRAILS
  // ==========================================
  describe("🔐 Auth Guardrail Scenario", () => {
    it("🔴 Sad Path: Should reject request with 401 Unauthorized if no token is passed", async () => {
      const response = await request(app).get("/api/v1/members").send();
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });  

  // ==========================================
  // 📥 POST (Step 1: Create)
  // ==========================================
  describe("📥 POST /api/v1/members", () => {
    it("🟢 Happy Path: Should cleanly register a member with valid tracking payloads", async () => {
      const validPayload = {
        user_id: testUserUuid,            
        membership_plan_id: validPlanUuid, 
        start_date: "2026-05-29",
        expiry_date: "2026-06-28"
      };

      const response = await request(app)
        .post("/api/v1/members")
        .set("Authorization", `Bearer ${mockLibrarianToken}`)
        .set("Content-Type", "application/json")
        .send(JSON.stringify(validPayload));    

      expect(response.status).toBe(httpStatus.CREATED);

      // Save this ID to use across all remaining test cases
      sharedMemberId = response.body.data?.member_id || response.body.data?.id;
      expect(sharedMemberId).toBeDefined();
    });
  });

  // ==========================================
  // 📤 GET (Step 2: Fetch list & Evaluate Auto-Expire)
  // ==========================================
  describe("📤 GET /api/v1/members", () => {
    it("🟢 Happy Path: Should fetch paginated records and accurately serialize meta payloads", async () => {
      const response = await request(app)
        .get("/api/v1/members")
        .set("Authorization", `Bearer ${mockLibrarianToken}`)
        .query({ page: 1, limit: 5 });

      expect(response.status).toBe(httpStatus.OK);

      const targetData = response.body.data?.data || response.body.data || response.body;
      expect(Array.isArray(targetData)).toBe(true);
    });

    it("⚡ Business Rule Validation: Should convert status to EXPIRED via Repository layer optimization", async () => {
      // Artificially age our shared test member in the DB to push them into the past
      await Member.update(
        {
          start_date: new Date("2025-01-01"),
          expiry_date: new Date("2025-12-31"),
          membership_status: "ACTIVE"
        },
        { where: { member_id: sharedMemberId } }
      );

      // Call GET endpoint to trigger the system's dynamic expiration evaluation hooks
      const response = await request(app)
        .get("/api/v1/members")
        .set("Authorization", `Bearer ${mockLibrarianToken}`)
        .send();

      expect(response.status).toBe(httpStatus.OK);
      
      // Verify that the record flipped to EXPIRED automatically
      const updatedRecord = await Member.findByPk(sharedMemberId);
      expect(updatedRecord?.membership_status).toBe("EXPIRED");
    });
  });

  // ==========================================
  // 🔍 GET /:id (Step 3: Single Read Check)
  // ==========================================
  describe("🔍 GET /api/v1/members/:id", () => {
    it("🔴 Sad Path: Should throw 404 AppError exception if member identifier does not exist", async () => {
      const response = await request(app)
        .get("/api/v1/members/99999999-9999-9999-9999-999999999999")
        .set("Authorization", `Bearer ${mockLibrarianToken}`)
        .send();

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });

  // ==========================================
  // 🔧 PATCH /:id (Step 4: Update)
  // ==========================================
  describe("🔧 PATCH /api/v1/members/:id", () => {
    it("🟢 Happy Path: Should modify properties smoothly if targeting existing profiles", async () => {
      const response = await request(app)
        .patch(`/api/v1/members/${sharedMemberId}`)
        .set("Authorization", `Bearer ${mockLibrarianToken}`)
        .send({ membership_status: "ACTIVE" }); // Restore status back to active

      expect(response.status).toBe(httpStatus.OK);
      
      const responseData = response.body.data || response.body;
      expect(responseData.membership_status).toBe("ACTIVE");
    });
  });

  // ==========================================
  // 🗑️ DELETE /:id (Step 5: Clean Registry Element)
  // ==========================================
  describe("🗑️ DELETE /api/v1/members/:id", () => {
    it("🟢 Happy Path: Should drop record cleanly from database", async () => {
      const response = await request(app)
        .delete(`/api/v1/members/${sharedMemberId}`)
        .set("Authorization", `Bearer ${mockLibrarianToken}`)
        .send();

      expect(response.status).toBe(httpStatus.OK);

      // Verify it is gone completely from the table
      const doubleCheck = await Member.findByPk(sharedMemberId);
      expect(doubleCheck).toBeNull();
      
      // Clear out the tracking ID string since it's already deleted
      sharedMemberId = "";
    });
  });
});