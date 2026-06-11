import request from "supertest";
import { describe, it, expect, afterAll } from "@jest/globals";
import app from "../../app.js";
import sequelize from "../../database/connection/database.js";

describe("🛡️ Global Fallback Protection & Fallback Router Integration Tests", () => {
  
  afterAll(async () => {
    await sequelize.close();
  });

  // ==========================================================================
  // 🟢 ROUTE FALLBACK / DEAD-END DETECTION
  // ==========================================================================
  describe("🚷 UNHANDLED ENDPOINT INRECEPTIONS", () => {

    it("❌ should gracefully return a structured 404 JSON response when a non-existent route is hit", async () => {
      const deadEndRoute = "/api/v1/completely-made-up-ghost-route";
      
      const response = await request(app)
        .get(deadEndRoute);

      // Verifies that your notFoundHandler AND your globalErrorHandler work together perfectly
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body.message).toContain(`Route ${deadEndRoute} not found`);
    });

    it("❌ should respond with 404 for unhandled HTTP verbs on valid route roots", async () => {
      // Testing an invalid method action on a real root endpoint string fallback
      const response = await request(app)
        .post("/api/v1/dashboard/metrics"); // Dashboard metrics is a GET, POST should trigger fallback or rejection

      expect([404, 405]).toContain(response.status); 
    });
  });
});