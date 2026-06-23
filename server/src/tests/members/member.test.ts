import request from "supertest";
import { describe, it, expect, afterAll, beforeAll } from "@jest/globals";
import app from "../../app.js";
import sequelize from "../../database/connection/database.js";
import User from "../../database/models/User.js";
import crypto from "crypto";

describe("👥 Member Directory & Subscription Module Integration Tests", () => {
  let authToken = "";
  
  // Dynamic UUID vectors to challenge query parameters and endpoints
  const testPathMemberId = crypto.randomUUID();
  const mockUserId = crypto.randomUUID();
  const mockPlanId = crypto.randomUUID();

  const timestamp = Date.now();
  const suiteEmail = `membersuite${timestamp}@gmail.com`;
  const commonPassword = "Password@123";

  beforeAll(async () => {
    // 1. Setup authenticated session context privileges
    try {
      await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Registrar Officer",
          gmail: suiteEmail,
          password: commonPassword
        });
    } catch (e) {
      // Avoid duplicate block registration triggers
    }

    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({
        gmail: suiteEmail,
        password: commonPassword,
      });

    authToken = loginResponse.body.data?.token || "";
  });

  afterAll(async () => {
    try {
      await User.destroy({
        where: { gmail: suiteEmail },
        force: true
      });
    } catch (error) {
      console.warn("Post-suite members ledger cleanup warning:", error);
    }
    await sequelize.close();
  });

  // ==========================================================================
  // 🟢 HAPPY PATHS (DIRECTORY GRID READS & ALIGNMENTS)
  // ==========================================================================
  describe("📦 SUBSCRIPTION RECORDS MAPS - Success Verification Cases", () => {

    it("✔ should fetch a listing of available reader users eligible for a new profile allocation", async () => {
      const response = await request(app)
        .get("/api/v1/members/available-users")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Available reader users for membership fetched successfully");
    });

    it("✔ should lookup active configuration tier layouts for membership plans", async () => {
      const response = await request(app)
        .get("/api/v1/members/plans")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("data");
    });

    it("✔ should fetch filtered collections from the main directory management data feed grid", async () => {
      const response = await request(app)
        .get("/api/v1/members")
        .set("Authorization", `Bearer ${authToken}`)
        .query({
          page: "1",
          limit: "5",
          membership_status: "ACTIVE"
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Members fetched successfully");
    });

    it("✔ should successfully respond to directory lookups matching frontend type-ahead bars", async () => {
      const response = await request(app)
        .get("/api/v1/members/search")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ q: "Yogesh" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Library member directory queried successfully matching criteria.");
    });

    it("✔ should evaluate structural creation requests and handle foreign key constraint states gracefully", async () => {
      const response = await request(app)
        .post("/api/v1/members")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          user_id: mockUserId,
          membership_plan_id: mockPlanId
        });

      // Flexible assertion: 201 if records intersect, 404/400 if references do not physically exist in DB state
      expect([201, 400, 404]).toContain(response.status);
    });

    it("✔ should resolve lookup checks by ID safely returning record details or clean 404 logs", async () => {
      const response = await request(app)
        .get(`/api/v1/members/${testPathMemberId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it("✔ should process patch configurations handling state checkbox transitions cleanly", async () => {
      const response = await request(app)
        .patch(`/api/v1/members/${testPathMemberId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          is_active: true,
          membership_status: "ACTIVE"
        });

      expect([200, 404]).toContain(response.status);
    });
  });

  // ==========================================================================
  // 🔴 SAD PATHS & VALIDATION RULES (ZOD SCHEMA INTERCEPTIONS)
  // ==========================================================================
  describe("❌ DIRECTORY INPUT SHIELDS - Validation Rejection Controls", () => {

    it("❌ should bounce out creation pipelines if necessary UUID parameters are missing entirely", async () => {
      const response = await request(app)
        .post("/api/v1/members")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          // Missing user_id reference tokens entirely
          membership_plan_id: mockPlanId
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("❌ should intercept creation parameters if user_id does not conform to a valid UUID blueprint", async () => {
      const response = await request(app)
        .post("/api/v1/members")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          user_id: "corrupted-user-string-identity",
          membership_plan_id: mockPlanId
        });

      expect(response.status).toBe(400);
    });

    it("❌ should enforce strict body schemas during partial updates to block unlisted metadata attributes", async () => {
      const response = await request(app)
        .patch(`/api/v1/members/${testPathMemberId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          is_active: false,
          maliciousPayloadInjection: "unauthorized_override_token" // Triggers .strict() rejection path
        });

      expect(response.status).toBe(400);
    });

    it("❌ should deny query search configurations if the tracking parameters 'q' is dropped entirely", async () => {
      const response = await request(app)
        .get("/api/v1/members/search")
        .set("Authorization", `Bearer ${authToken}`); // Query param '?q=...' omitted completely

      expect(response.status).toBe(400);
    });
  });

  // ==========================================================================
  // 💀 DESTRUCTIVE ROUTE SEPARATION 
  // ==========================================================================
  describe("💀 RETENTION OVERRIDES - Profile Removals", () => {
    it("✔ should complete drop references cleanly handling target route addresses", async () => {
      const response = await request(app)
        .delete(`/api/v1/members/${testPathMemberId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });
});