import request from "supertest";
import { describe, it, expect, afterAll, beforeAll } from "@jest/globals";
import app from "../../app.js";
import sequelize from "../../database/connection/database.js";
import MembershipPlan from "../../database/models/MembershipPlan.js";
import User from "../../database/models/User.js";
import { Op } from "sequelize";

describe("📋 Membership Plan Module Integration Tests", () => {
  let authToken = "";
  let createdPlanId = "";
  
  // 🌟 Dynamic production credentials to isolate the suite run
  const timestamp = Date.now();
  const dynamicTestEmail = `plan_suite_librarian_${timestamp}@gmail.com`;
  const testPassword = "Password@123";

  const testPlan = {
    plan_name: `Integration Test Tier ${timestamp}`,
    price: 49.99,
    duration_days: 30,
    max_books_allowed: 5,
  };

  beforeAll(async () => {
    // 1. Production Strategy: Create an isolated, dedicated test administrator account
    try {
      await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Global Master Librarian",
          gmail: dynamicTestEmail,
          password: testPassword
        });
    } catch (e) {
      // Catch layout conflicts safely
    }

    // 2. Perform the secure login flow using the isolated dynamic profile
    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({
        gmail: dynamicTestEmail,
        password: testPassword,
      });
      
    authToken = loginResponse.body.data?.token || "";
  });

  afterAll(async () => {
    try {
      // 1. Clean up testing strategy schema instances
      await MembershipPlan.destroy({
        where: {
          plan_name: {
            [Op.like]: "Integration Test Tier%",
          },
        },
        force: true,
      });

      // 2. 🌟 Vaporize the dynamic user account so zero records leak in the database
      await User.destroy({
        where: {
          gmail: dynamicTestEmail,
        },
        force: true,
      });
    } catch (error) {
      console.warn("Post-suite cleanup warning:", error);
    }
    await sequelize.close();
  });

  // ==========================================================================
  // 🟢 HAPPY PATHS
  // ==========================================================================
  describe("POST /api/v1/plan/create - Success Cases", () => {
    it("✔ should deploy a new membership strategy scheme framework when valid inputs match schema matrices", async () => {
      const response = await request(app)
        .post("/api/v1/plan/create") // 🌟 Corrected endpoint context prefix string matching structural path location
        .set("Authorization", `Bearer ${authToken}`)
        .send(testPlan);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("New structural strategy scheme framework deployed successfully.");
      expect(response.body.data).toHaveProperty("membership_plan_id");
      expect(response.body.data.plan_name).toBe(testPlan.plan_name);
      
      createdPlanId = response.body.data.membership_plan_id;
    });
  });

  describe("GET /api/v1/plan - Success Cases", () => {
    it("✔ should fetch active subscription scheme configuration tiers successfully", async () => {
      const response = await request(app)
        .get("/api/v1/plan")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Active subscription scheme configuration tiers successfully fetched.");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("PATCH /api/v1/plan/edit - Success Cases", () => {
    it("✔ should update target configuration parameters when valid payloads and structural fields match", async () => {
      const response = await request(app)
        .patch("/api/v1/plan/edit")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          membership_plan_id: createdPlanId,
          plan_name: `Integration Test Tier ${timestamp} Updated`,
          price: 59.99,
          duration_days: 60,
          max_books_allowed: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Target configuration parameters updated successfully.");
      expect(Number(response.body.data.price)).toBe(59.99);
      expect(response.body.data.duration_days).toBe(60);
    });
  });

  // ==========================================================================
  // 🔴 SAD PATHS & VALIDATION FAILURES
  // ==========================================================================
  describe("POST /api/v1/plan/create - Validation Failures", () => {
    it("❌ should reject plan creation if structural attributes violate unique constraints", async () => {
      const response = await request(app)
        .post("/api/v1/plan/create")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          plan_name: `Integration Test Tier ${timestamp} Updated`,
          price: 19.99,
          duration_days: 15,
          max_books_allowed: 2,
        });

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty("success", false);
    });

    it("❌ should reject empty plan names", async () => {
      const response = await request(app)
        .post("/api/v1/plan/create")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          ...testPlan,
          plan_name: "",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("❌ should reject plan names exceeding the 50-character ceiling boundary", async () => {
      const response = await request(app)
        .post("/api/v1/plan/create")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          ...testPlan,
          plan_name: "A".repeat(51),
        });

      expect(response.status).toBe(400);
    });

    it("❌ should reject price fields representing negative integers/floats", async () => {
      const response = await request(app)
        .post("/api/v1/plan/create")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          ...testPlan,
          price: -10.50,
        });

      expect(response.status).toBe(400);
    });

    it("❌ should reject duration values below 1 day timelines", async () => {
      const response = await request(app)
        .post("/api/v1/plan/create")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          ...testPlan,
          duration_days: 0,
        });

      expect(response.status).toBe(400);
    });

    it("❌ should reject max_books_allowed allocations assigned to zero or lower values", async () => {
      const response = await request(app)
        .post("/api/v1/plan/create")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          ...testPlan,
          max_books_allowed: -1,
        });

      expect(response.status).toBe(400);
    });
  });

  describe("PATCH /api/v1/plan/edit - Validation Failures", () => {
    it("❌ should reject patch updates failing strict property layout loops", async () => {
      const response = await request(app)
        .patch("/api/v1/plan/edit")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          membership_plan_id: createdPlanId,
          ...testPlan,
          stray_property_field: "Breaching strict parameters",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("❌ should fail if operational plan context identifier uuid format is invalid", async () => {
      const response = await request(app)
        .patch("/api/v1/plan/edit")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          membership_plan_id: "not-a-valid-uuid",
          ...testPlan,
        });

      expect(response.status).toBe(400);
    });
  });

  // ==========================================================================
  // 💀 DESTRUCTION FLOWS (EXECUTE LAST)
  // ==========================================================================
  describe("DELETE /api/v1/plan/delete - Execution", () => {
    it("❌ should reject plan extraction calls failing strict schema checks", async () => {
      const response = await request(app)
        .delete("/api/v1/plan/delete")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          membership_plan_id: createdPlanId,
          unauthorized_extra_field: true,
        });

      expect(response.status).toBe(400);
    });

    it("✔ should cleanly drop target subscription tracking structure from the database", async () => {
      const response = await request(app)
        .delete("/api/v1/plan/delete")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          membership_plan_id: createdPlanId,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Targeted plan tracking structure cleanly dropped from database.");
    });

    it("❌ should return an error if trying to drop a record context id that does not exist", async () => {
      const response = await request(app)
        .delete("/api/v1/plan/delete")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          membership_plan_id: "a0000000-b000-c000-d000-e00000000000",
        });

      expect([400, 404, 422]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });
  });
});