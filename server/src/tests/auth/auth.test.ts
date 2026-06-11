import request from "supertest";
import { describe, it, expect, afterAll } from "@jest/globals";
import app from "../../app.js";
import sequelize from "../../database/connection/database.js";
import User from "../../database/models/User.js"; 
import { Op } from "sequelize"; 

afterAll(async () => {
  try {
    await User.destroy({
      where: {
        gmail: {
          [Op.like]: "integration_test_%",
        },
      },
      force: true,
    });
  } catch (error) {
    console.warn("Post-suite cleanup warning:", error);
  }
  await sequelize.close();
});

// ... Rest of the test suite remains exactly the same as provided earlier
describe("🔐 Authentication & Authorization Module Integration Tests", () => {
  const timestamp = Date.now();
  const validEmail = `integration_test_${timestamp}@gmail.com`;
  const validPassword = "Password@123";
  const validName = "Valid Test User";
  const validPhone = "+1234567890";

  // ==========================================================================
  // 🟢 HAPPY PATHS
  // ==========================================================================
  describe("POST /api/v1/auth/register - Success Cases", () => {
    it("✔ should register a new user successfully with all fields provided", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: validName,
          gmail: validEmail,
          password: validPassword,
          phoneNumber: validPhone,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("message");
    });

    it("✔ should register a new user safely without optional phone number", async () => {
      const uniqueEmail = `integration_test_opt_${Date.now()}@gmail.com`;
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: validName,
          gmail: uniqueEmail,
          password: validPassword,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/v1/auth/login & GET /profile - Success Cases", () => {
    let authToken = "";

    it("✔ should login user successfully and return access data structures", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          gmail: validEmail,
          password: validPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("token");
      
      authToken = response.body.data.token;
    });

    it("✔ should fetch profile details using a valid authentication token", async () => {
      const response = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  // ==========================================================================
  // 🔴 SAD PATHS & VALIDATION FAILURES
  // ==========================================================================
  describe("POST /api/v1/auth/register - Validation & Conflict Failures", () => {
    it("❌ should reject registration if email conflict (already exists) occurs", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Duplicate User",
          gmail: validEmail,
          password: validPassword,
        });

      expect([400, 409]).toContain(response.status); // Accommodates either validation or unique-constraint handler statuses
      expect(response.body.success).toBe(false);
    });

    it("❌ should reject registration if mandatory elements are missing", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          gmail: "missing_fields@gmail.com",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("❌ should reject name values that contain digits or special characters", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "User123!",
          gmail: `integration_test_badname_${Date.now()}@gmail.com`,
          password: validPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("❌ should reject name lengths below 3 characters", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Ab",
          gmail: `integration_test_short_${Date.now()}@gmail.com`,
          password: validPassword,
        });

      expect(response.status).toBe(400);
    });

    it("❌ should reject email format variations missing the explicit @gmail.com suffix", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: validName,
          gmail: "tester_account@outlook.com",
          password: validPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("❌ should reject passwords that do not pass strength requirements", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: validName,
          gmail: `integration_test_weakpass_${Date.now()}@gmail.com`,
          password: "password123", // Missing capital letters and special characters
        });

      expect(response.status).toBe(400);
    });

    it("❌ should reject phone number entries that violate standard E.164 formats", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: validName,
          gmail: `integration_test_badphone_${Date.now()}@gmail.com`,
          password: validPassword,
          phoneNumber: "001-555-PHONE-NUMBER",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/login - Failures", () => {
    it("❌ should block login requests using emails not stored within system databases", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          gmail: "non_existent_ghost_profile@gmail.com",
          password: validPassword,
        });

      expect([400, 401, 404]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it("❌ should reject credentials with invalid or mismatched passwords", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          gmail: validEmail,
          password: "IncorrectPassword@999",
        });

      expect([400, 401]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it("❌ should fail schema checks if username/email parameters are missing entirely", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          password: validPassword,
        });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/v1/auth/profile - Security Failures", () => {
    it("❌ should deny profile access when no authorization header token is delivered", async () => {
      const response = await request(app)
        .get("/api/v1/auth/profile");

      expect([401, 403]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it("❌ should deny profile access when an altered or malformed token is provided", async () => {
      const response = await request(app)
        .get("/api/v1/auth/profile")
        .set("Authorization", "Bearer invalid_malformed_jwt_string_here");

      expect([401, 403]).toContain(response.status);
    });
  });
});