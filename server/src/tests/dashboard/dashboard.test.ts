import request from "supertest";
import { describe, it, expect, afterAll, beforeAll } from "@jest/globals";
import app from "../../app.js";
import sequelize from "../../database/connection/database.js";
import User from "../../database/models/User.js";

describe("📊 Central Dashboard Analytics Module Integration Tests", () => {
  let authToken = "";

  const timestamp = Date.now();
  // Compliant lowercase email to satisfy your authentication Zod rules cleanly
  const suiteEmail = `dashboardsuite${timestamp}@gmail.com`;
  const commonPassword = "Password@123";

  beforeAll(async () => {
    // 1. Set up an isolated session profile to satisfy the 'auth' middleware guard
    try {
      await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Analytics Auditor",
          gmail: suiteEmail,
          password: commonPassword
        });
    } catch (e) {
      // Clean bypass on registration hooks if any exist
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
      // 2. Clear out the temporary user account profile artifact
      await User.destroy({
        where: {
          gmail: suiteEmail
        },
        force: true
      });
    } catch (error) {
      console.warn("Post-suite dashboard analytics cleanup warning:", error);
    }
    await sequelize.close();
  });

  // ==========================================================================
  // 🟢 CORE ANALYTICS ENDPOINTS (METRICS & DATA FEED VISUALIZERS)
  // ==========================================================================
  describe("📉 ANALYTICAL WIDGET CHANNELS - Success Verification Cases", () => {
    
    it("✔ should fetch the combined analytical metrics and widget datasets summary logs cleanly", async () => {
      const response = await request(app)
        .get("/api/v1/dashboard/summary")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe("Dashboard summary logs generated cleanly.");
      expect(response.body).toHaveProperty("data");
    });

    it("✔ should retrieve the general catalog volume metrics overview layout successfully", async () => {
      const response = await request(app)
        .get("/api/v1/dashboard/metrics")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Dashboard overview fetched successfully");
      expect(response.body).toHaveProperty("data");
    });

    it("✔ should fetch a compiled dataset array representing popular book indices ranking records", async () => {
      const response = await request(app)
        .get("/api/v1/dashboard/analytics/popular-books")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Popular books fetched successfully");
      expect(response.body).toHaveProperty("data");
    });

    it("✔ should pull down recent log entry grids tracking active circulation cycles", async () => {
      const response = await request(app)
        .get("/api/v1/dashboard/analytics/recent-issues")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Recent issues fetched successfully");
      expect(response.body).toHaveProperty("data");
    });

    it("✔ should extract reporting sets charting monthly cash balance fine collection lines", async () => {
      const response = await request(app)
        .get("/api/v1/dashboard/reports/monthly-fines")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Monthly fine analytics fetched successfully");
      expect(response.body).toHaveProperty("data");
    });

  });

  // ==========================================================================
  // 🔴 SECURITY POLICIES & ROUTE ENFORCEMENTS
  // ==========================================================================
  describe("🛡️ SESSION GATE SECURITY MAPS - Authorization Enforcements", () => {
    
    it("❌ should reject dashboard metric pull requests if the client header token is completely absent", async () => {
      const response = await request(app)
        .get("/api/v1/dashboard/summary"); // Missing .set("Authorization") header wrapper completely

      expect(response.status).toBe(401); 
      expect(response.body.success).toBe(false);
    });

  });
});