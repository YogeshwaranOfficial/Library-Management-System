import request from "supertest";
import { describe, it, expect, afterAll, beforeAll } from "@jest/globals";
import app from "../../app.js";
import sequelize from "../../database/connection/database.js";
import User from "../../database/models/User.js";
import Category from "../../database/models/Category.js";
import { Op } from "sequelize";

describe("🏷️ Categories Module Integration Tests", () => {
  let authToken = "";
  let createdCategoryId = "";

  const timestamp = Date.now();
  // Ensure the user email handles lowercase alphanumeric Zod constraints perfectly
  const suiteEmail = `categorysuite${timestamp}@gmail.com`;
  const commonPassword = "Password@123";

  // 🌟 FIX: Convert timestamp to pure alphabet characters to pass the /^[A-Za-z\s]+$/ regex
  const pureAlphaString = timestamp.toString(36).replace(/[0-9]/g, "X");
  const validCategoryName = `Integration Category ${pureAlphaString}`;
  const validCategoryUpdateName = `Integration Category Update ${pureAlphaString}`;

  beforeAll(async () => {
    // 1. Set up an isolated session identity to satisfy the 'auth' middleware
    try {
      await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Catalog Compliance Officer",
          gmail: suiteEmail,
          password: commonPassword
        });
    } catch (e) {
      // Clean bypass on registration hooks
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
      // 2. Automated clean-up: clear test data from the database
      await Category.destroy({
        where: {
          category_name: {
            [Op.like]: "Integration Category%",
          }
        },
        force: true
      });

      await User.destroy({
        where: {
          gmail: suiteEmail
        },
        force: true
      });
    } catch (error) {
      console.warn("Post-suite categories cleanup warning:", error);
    }
    await sequelize.close();
  });

  // ==========================================================================
  // 🟢 HAPPY PATHS (CRUD OPERATIONS)
  // ==========================================================================
  describe("📦 CORE CRUD OPERATIONS - Success Cases", () => {
    it("✔ should configure a fresh taxonomy asset slot row successfully", async () => {
      const response = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          category_name: validCategoryName
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("New category configured successfully.");
      expect(response.body.data).toHaveProperty("category_id");

      createdCategoryId = response.body.data.category_id;
    });

    it("✔ should compile a paginated, searchable aggregated category metrics grid feed", async () => {
      const response = await request(app)
        .get("/api/v1/categories/metrics")
        .set("Authorization", `Bearer ${authToken}`)
        .query({
          page: 1,
          limit: 5,
          search: "Integration",
          bookSort: "HIGH_TO_LOW",
          borrowSort: "NONE"
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Catalog paginated metrics compiled successfully.");
      expect(response.body).toHaveProperty("data");
    });

    it("✔ should modify the name string reference parameters of an active category", async () => {
      const response = await request(app)
        .patch(`/api/v1/categories/${createdCategoryId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          category_name: validCategoryUpdateName
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Category updated successfully.");
    });
  });

  // ==========================================================================
  // 🔴 SAD PATHS & VALIDATION FAILURES (ZOD ROUTE SHIELDS)
  // ==========================================================================
  describe("❌ SCHEMA ATTRIBUTE ENFORCEMENTS - Validation Defenses", () => {
    it("❌ should reject category creation if the name property contains numbers or symbols", async () => {
      const response = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          category_name: "Fiction 123!" // Violates regex /^[A-Za-z\s]+$/
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("❌ should reject category creation if the body parameter field is empty spaces", async () => {
      const response = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          category_name: "   " // Trims down to length 0, violating min(1)
        });

      expect(response.status).toBe(400);
    });

    it("❌ should intercept patch modifications if the target ID parameter is not a structural UUID token", async () => {
      const response = await request(app)
        .patch("/api/v1/categories/not-a-valid-uuid-string")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          category_name: "Valid Genre Form Name"
        });

      expect(response.status).toBe(400);
    });
  });

  // ==========================================================================
  // 💀 DESTRUCTION FLOWS (CASCADE DROP VERIFICATION)
  // ==========================================================================
  describe("💀 DATA PURGING TRANSACTIONS - Cleanup Execution", () => {
    it("✔ should trigger a transaction drop wiping out the category node completely", async () => {
      const response = await request(app)
        .delete(`/api/v1/categories/${createdCategoryId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Category and all associated database records cleared successfully.");
    });
  });
});