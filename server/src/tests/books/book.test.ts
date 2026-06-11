import request from "supertest";
import { describe, it, expect, afterAll, beforeAll } from "@jest/globals";
import app from "../../app.js";
import sequelize from "../../database/connection/database.js";
import User from "../../database/models/User.js";
import Category from "../../database/models/Category.js"; // Seeding target relationship
import Book from "../../database/models/Book.js";
import { Op } from "sequelize";

describe("📚 Books Inventory Module Integration Tests", () => {
  let authToken = "";
  let seededCategoryId = "";
  let createdBookId = "";

  // Dynamic tokens to isolate parallel runner executions
  const timestamp = Date.now();
  const suiteEmail = `booksuite${timestamp}@gmail.com`;
  const commonPassword = "Password@123";

  beforeAll(async () => {
    // 1. Setup isolated session profile
    try {
      await request(app)
        .post("/api/v1/auth/register")
        .send({
          name: "Inventory Auditor",
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

    // 2. Production Step: Directly seed a parent category entry via Sequelize 
    // to fulfill foreign key constraints on `category_id` safely.
    const testCategory = await Category.create({
      category_name: `Test Genre ${timestamp}`,
      description: "Temporary genre classification category for structural testing runs."
    } as any);

    seededCategoryId = (testCategory as any).category_id;
  });

  afterAll(async () => {
    try {
      // 1. Purge all books deployed during this integration process run
      await Book.destroy({
        where: {
          book_name: {
            [Op.like]: "Integration Test Book%",
          }
        },
        force: true
      });

      // 2. Remove structural context category nodes
      await Category.destroy({
        where: {
          category_id: seededCategoryId
        },
        force: true
      });

      // 3. Vaporize testing credential identities safely
      await User.destroy({
        where: {
          gmail: suiteEmail
        },
        force: true
      });
    } catch (error) {
      console.warn("Post-suite books inventory cleanup warning:", error);
    }
    await sequelize.close();
  });

  // ==========================================================================
  // 🟢 HAPPY PATHS (INVENTORY CRUD & DATA COERCION MULTIPLEXING)
  // ==========================================================================
  describe("📦 CORE CRUD OPERATIONS - Success Cases", () => {
    it("✔ should create a new book item successfully and handle type coercion for total_copies", async () => {
      const response = await request(app)
        .post("/api/v1/books")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          book_name: `Integration Test Book ${timestamp}`,
          book_author: "Author Assignment Test Node",
          category_id: seededCategoryId,
          total_copies: "15" // Passed as string to verify Zod's `z.coerce.number()` handling
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Book created successfully");
      expect(response.body.data).toHaveProperty("book_id");
      
      createdBookId = response.body.data.book_id;
    });

    it("✔ should fetch a dashboard ledger list array matching default pagination constraints", async () => {
      const response = await request(app)
        .get("/api/v1/books")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ page: 1, limit: 10, search: "Integration Test" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Books fetched successfully");
      expect(response.body).toHaveProperty("data");
    });

    it("✔ should retrieve details for an isolated book item using its specific resource ID", async () => {
      const response = await request(app)
        .get(`/api/v1/books/${createdBookId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Book fetched successfully");
      expect(response.body.data.book_id).toBe(createdBookId);
    });

    it("✔ should process partial data updates over PATCH queries securely", async () => {
      const response = await request(app)
        .patch(`/api/v1/books/${createdBookId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          book_name: `Integration Test Book ${timestamp} Revised`,
          total_copies: 20
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Book updated successfully");
    });

    it("✔ should return a system categories dropdown listing feed data array cleanly", async () => {
      const response = await request(app)
        .get("/api/v1/books/categories")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Categories fetched successfully");
    });

    it("✔ should scan inventory text index matching strings over specific lookups successfully", async () => {
      const response = await request(app)
        .get("/api/v1/books/search")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ q: "Revised" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Library inventory search indices queried successfully matching criteria.");
    });
  });

  // ==========================================================================
  // 🔴 SAD PATHS & VALIDATION FAILURES (SCHEMA ASSERTS)
  // ==========================================================================
  describe("❌ SCHEMA ATTRIBUTE ENFORCEMENTS - Validation Defenses", () => {
    it("❌ should reject asset deployment if book title drops below the 2-character limit", async () => {
      const response = await request(app)
        .post("/api/v1/books")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          book_name: "X",
          book_author: "Valid Author Name",
          category_id: seededCategoryId,
          total_copies: 5
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("❌ should drop execution matrix calls if target category fails strict UUID layout verification", async () => {
      const response = await request(app)
        .post("/api/v1/books")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          book_name: "Valid Inventory Item Title",
          book_author: "Valid Author Name",
          category_id: "not-a-valid-uuid-structural-token",
          total_copies: 5
        });

      expect(response.status).toBe(400);
    });

    it("❌ should block creations declaring total copies counts assigned to zero values", async () => {
      const response = await request(app)
        .post("/api/v1/books")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          book_name: "Valid Inventory Item Title",
          book_author: "Valid Author Name",
          category_id: seededCategoryId,
          total_copies: 0 // Below the min(1) constraint line
        });

      expect(response.status).toBe(400);
    });

    it("❌ should return validation failures if query parameter 'q' is left empty on search routes", async () => {
      const response = await request(app)
        .get("/api/v1/books/search")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ q: "" }); // Violates min(1) requirements

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================================================
  // 💀 DESTRUCTION FLOWS (REMOVING ENTRIES)
  // ==========================================================================
  describe("💀 RESOURCE RETIREMENT CONTEXTS - Execution Blocks", () => {
    it("✔ should cleanly remove target items from active databases via DELETE operations", async () => {
      const response = await request(app)
        .delete(`/api/v1/books/${createdBookId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.message).toBe("Book deleted successfully");
    });
  });
});