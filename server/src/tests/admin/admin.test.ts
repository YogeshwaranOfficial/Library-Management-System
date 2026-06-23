import request from "supertest";
import { describe, it, expect, afterAll, beforeAll } from "@jest/globals";
import app from "../../app.js";
import sequelize from "../../database/connection/database.js";
import User from "../../database/models/User.js";
import { Op } from "sequelize";

describe("👥 Admin Module Integration Tests", () => {
  let adminAuthToken = "";
  let createdReaderId = "";
  let createdLibrarianId = "";

  // 🌟 Dynamic tokens using STRICT lowercase characters to pass Zod regex criteria
  const timestamp = Date.now();
  const adminEmail = `isolatedadmin${timestamp}@gmail.com`;
  const readerEmail = `testreader${timestamp}@gmail.com`;
  const librarianEmail = `testlibrarian${timestamp}@gmail.com`;
  const validationFailEmail = `bademail${timestamp}@gmail.com`;
  const commonPassword = "Password@123";

  beforeAll(async () => {
    // 1. Provision an isolated administrative account with appropriate role permissions
    try {
      await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Suite Root Admin",
          gmail: adminEmail,
          password: commonPassword
        });
      
      // Upgrade role mapping explicitly inside the test pool database connection
      await User.update(
        { role: "ADMIN" },
        { where: { gmail: adminEmail } }
      );
    } catch (e) {
      // Catch exceptions cleanly
    }

    // 2. Authenticate the admin session to extract our runtime authorization token
    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({
        gmail: adminEmail,
        password: commonPassword,
      });

    adminAuthToken = loginResponse.body.data?.token || "";
  });

  afterAll(async () => {
    try {
      // Clean up all testing artifacts completely
      await User.destroy({
        where: {
          gmail: {
            [Op.in]: [adminEmail, readerEmail, validationFailEmail, librarianEmail]
          }
        },
        force: true
      });
    } catch (error) {
      console.warn("Post-suite admin module cleanup warning:", error);
    }
    await sequelize.close();
  });

  // ==========================================================================
  // 🟢 HAPPY PATHS (READERS & LIBRARIANS CRUD OPERATIONS)
  // ==========================================================================
  describe("👥 READER DIRECTORY OPERATIONS - Success Cases", () => {
    it("✔ should provision a fresh user reader account successfully when attributes match validation layouts", async () => {
      const response = await request(app)
        .post("/api/v1/admin/add-user")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          name: "Test Integration Reader",
          gmail: readerEmail,
          password: commonPassword,
          phone_number: "9876543210",
          role: "READER"
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("New user account provisioned successfully.");
      expect(response.body.data).toHaveProperty("user_id");
      
      createdReaderId = response.body.data.user_id;
    });

    it("✔ should fetch a paginated readers directory directory feed successfully", async () => {
      const response = await request(app)
        .get("/api/v1/admin/readers")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .query({ limit: 5, offset: 0, search: "Test Integration" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Readers directory compiled successfully.");
    });

    it("✔ should synchronize user reader context metrics over PATCH requests updates", async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/user/${createdReaderId}`)
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          name: "Test Integration Reader Updated",
          phone_number: "1111222233"
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("User context metrics synchronized successfully.");
    });
  });

  describe("🛠️ LIBRARIAN DIRECTORY OPERATIONS - Success Cases", () => {
    it("✔ should provision a fresh operational librarian profile successfully", async () => {
      const response = await request(app)
        .post("/api/v1/admin/add-librarian")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          name: "Test Integration Librarian",
          gmail: librarianEmail,
          password: commonPassword,
          phone_number: "8887776665"
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("New administrative terminal clearance provisioned.");
      expect(response.body.data).toHaveProperty("user_id");

      createdLibrarianId = response.body.data.user_id;
    });

    it("✔ should fetch a paginated librarians directory feed successfully", async () => {
      const response = await request(app)
        .get("/api/v1/admin/librarians")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .query({ limit: 10, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Librarians directory compiled successfully.");
    });

    it("✔ should update existing librarian operational parameters via resource ID", async () => {
      const response = await request(app)
        .patch(`/api/v1/admin/librarian/${createdLibrarianId}`)
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          name: "Officer Account Updated"
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Officer metrics updated successfully.");
    });
  });

  // ==========================================================================
  // 🔴 SAD PATHS & VALIDATION FAILURES (ZOD SCHEMA TESTING)
  // ==========================================================================
  describe("❌ INVALID PAYLOAD INJECTION RUNS - Validation Matrix Defenses", () => {
    it("❌ should block account creation if full name consists of blank spaces", async () => {
      const response = await request(app)
        .post("/api/v1/admin/add-user")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          name: "   ",
          gmail: validationFailEmail,
          password: commonPassword,
          phone_number: "9998887776"
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("❌ should reject non-compliant structural layouts that violate @gmail.com restrictions", async () => {
      const response = await request(app)
        .post("/api/v1/admin/add-user")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          name: "Malformed Gmail Profile",
          gmail: "badlyformedhandle@outlook.com",
          password: commonPassword,
          phone_number: "9998887776"
        });

      expect(response.status).toBe(400);
    });

    it("❌ should reject insecure security passwords that lack uppercase components or numerical digits", async () => {
      const response = await request(app)
        .post("/api/v1/admin/add-user")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          name: "Insecure Node Profile",
          gmail: validationFailEmail,
          password: "lowercaseonlypass",
          phone_number: "9998887776"
        });

      expect(response.status).toBe(400);
    });

    it("❌ should reject phone number configurations failing the 10-digit limit block threshold", async () => {
      const response = await request(app)
        .post("/api/v1/admin/add-user")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          name: "Invalid Line Parameter",
          gmail: validationFailEmail,
          password: commonPassword,
          phone_number: "12345"
        });

      expect(response.status).toBe(400);
    });

    it("❌ should reject modifications containing strict payload structural layout parameter overflows", async () => {
      // 🌟 FIXED: Passes a valid structural UUID template instead of an empty variable string
      const temporaryUuidNode = "a0000000-b000-c000-d000-e00000000000";
      const response = await request(app)
        .patch(`/api/v1/admin/user/${temporaryUuidNode}`)
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          name: "Overextended Properties User",
          illegal_system_override_attribute: "Breaching strict validation boundaries"
        });

      expect(response.status).toBe(400);
    });

    it("❌ should reject patch updates where the route URL identifier fails validation format checks", async () => {
      const response = await request(app)
        .patch("/api/v1/admin/user/not-a-valid-uuid-format")
        .set("Authorization", `Bearer ${adminAuthToken}`)
        .send({
          name: "Format Failure Test Execution"
        });

      expect(response.status).toBe(400);
    });
  });

  // ==========================================================================
  // 💀 DESTRUCTION FLOWS (PURGING ACCOUNTS)
  // ==========================================================================
  describe("💀 DESTRUCTION FLOWS - Execution Segments", () => {
    it("✔ should securely delete reader accounts, completely purging user details from the core registry matrix", async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/user/${createdReaderId}`)
        .set("Authorization", `Bearer ${adminAuthToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User account file purged from registry matrix completely.");
    });

    it("✔ should execute a hard-purge on librarian security configurations from core systems", async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/librarian/${createdLibrarianId}`)
        .set("Authorization", `Bearer ${adminAuthToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Librarian security profile wiped from core systems.");
    });
  });
});