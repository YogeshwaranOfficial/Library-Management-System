import request from "supertest";
import app from "../../app.js";
import { getAuthToken } from "../helpers/testAuth.helper.js";
import sequelize from '../../database/connection/database.js';
import Category from '../../database/models/Category.js'; 

describe("📚 Books Module Integration Tests (Isolated & Self-Cleaning)", () => {
  let librarianToken: string;
  let scienceCategoryId: string;  
  let createdBookId: string;
  let searchBookId: string; // Captured to prevent DB accumulation leaks
  
  const testBookName = `Clean Architecture v${Math.floor(Math.random() * 1000)}`;
  const searchKeyword = `SearchableBook-${Math.floor(Math.random() * 1000)}`;
  const nonExistentUuid = "00000000-0000-0000-0000-000000000000";

  beforeAll(async () => {
    // 1. Grab authorization token for Librarian
    const token = await getAuthToken();
    librarianToken = `Bearer ${token}`;

    try {
      // 2. Safely capture a real category ID from DB to link books to
      const realCategory = await Category.findOne(); 
      scienceCategoryId = realCategory ? (realCategory.get('category_id') as string) : nonExistentUuid;
    } catch (err) {
      scienceCategoryId = "075705f3-c7be-4585-85d1-b57616870f68";
    }
  });

  afterAll(async () => {
    // Safety Net Cleanup: If tests fail early, ensure dummy items are still scrubbed
    if (searchBookId) {
      await request(app)
        .delete(`/api/v1/books/${searchBookId}`)
        .set("Authorization", librarianToken);
    }
    if (createdBookId) {
      await request(app)
        .delete(`/api/v1/books/${createdBookId}`)
        .set("Authorization", librarianToken);
    }
    await sequelize.close();
  });

  // ==========================================
  // 🟢 1. POST /api/v1/books (CREATE)
  // ==========================================
  describe("POST /api/v1/books", () => {
    it("✅ Happy Path: Should let an authenticated Librarian create a book", async () => {
      const res = await request(app)
        .post("/api/v1/books")
        .set("Authorization", librarianToken)
        .send({
          book_name: testBookName,
          book_author: "Robert C. Martin",
          category_id: scienceCategoryId, 
          total_copies: 5,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("book_id");
      expect(res.body.data.book_name).toBe(testBookName);
      
      // Save this isolated ID for subsequent Read, Update, and Delete steps
      createdBookId = res.body.data.book_id;
    });

    it("❌ Sad Path: Should fail validation when body criteria are invalid (Zod)", async () => {
      const res = await request(app)
        .post("/api/v1/books")
        .set("Authorization", librarianToken)
        .send({
          book_name: "X", 
          book_author: "Valid Author",
          category_id: "invalid-uuid-format", 
          total_copies: 0, 
        });

      expect(res.status).toBe(400); 
      expect(res.body.success).toBe(false);
    });

    it("❌ Sad Path: Should throw 404 error if category UUID does not exist in DB", async () => {
      const res = await request(app)
        .post("/api/v1/books")
        .set("Authorization", librarianToken)
        .send({
          book_name: "Valid Book Title",
          book_author: "Valid Author",
          category_id: nonExistentUuid, 
          total_copies: 5,
        });

      expect(res.status).toBe(404); // Matches BookService AppError definition
    });

    it("❌ Sad Path: Should reject execution if authorization token is absent", async () => {
      const res = await request(app)
        .post("/api/v1/books")
        .send({
          book_name: "Unauthorized Book",
          book_author: "No Token",
          category_id: scienceCategoryId, 
          total_copies: 1,
        });

      expect(res.status).toBe(401);
    });
  });

  // ==========================================
  // 🟢 2. GET /api/v1/books (GET ALL & FILTERS)
  // ==========================================
  describe("GET /api/v1/books", () => {
    beforeAll(async () => {
      const res = await request(app)
        .post("/api/v1/books")
        .set("Authorization", librarianToken)
        .send({
          book_name: searchKeyword,
          book_author: "Unique Search Author",
          category_id: scienceCategoryId, 
          total_copies: 2,
        });
      
      // CAPTURING THIS ID: Prevents database bloat on repeated test runs
      searchBookId = res.body.data?.book_id;
    });

    afterAll(async () => {
      // Instantly delete the search test book right after this suite finishes
      if (searchBookId) {
        await request(app)
          .delete(`/api/v1/books/${searchBookId}`)
          .set("Authorization", librarianToken);
        searchBookId = ""; // Clear reference
      }
    });

    it("✅ Happy Path: Should fetch all books complete with default pagination maps", async () => {
      const res = await request(app)
        .get("/api/v1/books")
        .set("Authorization", librarianToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("rows");
      expect(res.body.data).toHaveProperty("count");
      expect(res.body.data.rows.length).toBeGreaterThanOrEqual(1);
    });

    it("✅ Happy Path: Should successfully return records filtered by search query", async () => {
      const res = await request(app)
        .get(`/api/v1/books?search=${searchKeyword}`)
        .set("Authorization", librarianToken);

      expect(res.status).toBe(200);
      expect(res.body.data.rows[0].book_name).toBe(searchKeyword);
    });

    it("✅ Happy Path: Should successfully filter results explicitly by category_id", async () => {
      const res = await request(app)
        .get(`/api/v1/books?category_id=${scienceCategoryId}`) 
        .set("Authorization", librarianToken);

      expect(res.status).toBe(200);
      expect(res.body.data.rows.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // 🟢 3. GET /api/v1/books/:bookId (GET SINGLE)
  // ==========================================
  describe("GET /api/v1/books/:bookId", () => {
    it("✅ Happy Path: Should return details of a single book by ID", async () => {
      const res = await request(app)
        .get(`/api/v1/books/${createdBookId}`)
        .set("Authorization", librarianToken);

      expect(res.status).toBe(200);
      expect(res.body.data.book_id).toBe(createdBookId);
    });

    it("❌ Sad Path: Should throw 404 error if book ID cannot be found", async () => {
      const res = await request(app)
        .get(`/api/v1/books/${nonExistentUuid}`)
        .set("Authorization", librarianToken);

      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // 🟢 4. PATCH /api/v1/books/:bookId (UPDATE)
  // ==========================================
  describe("PATCH /api/v1/books/:bookId", () => {
    it("✅ Happy Path: Should let an authorized Librarian update a book's details via PATCH", async () => {
      const updatedTitle = `Clean Architecture - Edited v${Math.floor(Math.random() * 1000)}`;

      const res = await request(app)
        .patch(`/api/v1/books/${createdBookId}`)
        .set("Authorization", librarianToken)
        .send({
          book_name: updatedTitle,
          book_author: "Robert C. Martin",
          category_id: scienceCategoryId,
          total_copies: 12,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.book_name).toBe(updatedTitle);
      expect(res.body.data.total_copies).toBe(12);
    });

    it("❌ Sad Path: Should fail validation when partial update criteria are invalid (Zod)", async () => {
      const res = await request(app)
        .patch(`/api/v1/books/${createdBookId}`)
        .set("Authorization", librarianToken)
        .send({
          book_name: "Y", 
          book_author: "", 
          category_id: "not-a-valid-uuid",
          total_copies: -5, 
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("❌ Sad Path: Should return 404 error if attempting to patch a non-existent book ID", async () => {
      const res = await request(app)
        .patch(`/api/v1/books/${nonExistentUuid}`)
        .set("Authorization", librarianToken)
        .send({
          book_name: "Ghost Book Modification",
          book_author: "Anonymous",
          category_id: scienceCategoryId,
          total_copies: 1,
        });

      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // 🟢 5. DELETE /api/v1/books/:bookId (DELETE)
  // ==========================================
  describe("DELETE /api/v1/books/:bookId", () => {
    it("❌ Sad Path: Should throw 404 error if target delete book ID cannot be found", async () => {
      const res = await request(app)
        .delete(`/api/v1/books/${nonExistentUuid}`)
        .set("Authorization", librarianToken);

      expect(res.status).toBe(404);
    });

    it("✅ Happy Path: Should successfully delete an existing book by its ID", async () => {
      const res = await request(app)
        .delete(`/api/v1/books/${createdBookId}`)
        .set("Authorization", librarianToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify removal directly matches your Service's getBookById 404 check
      const doubleCheckRes = await request(app)
        .get(`/api/v1/books/${createdBookId}`)
        .set("Authorization", librarianToken);

      expect(doubleCheckRes.status).toBe(404);
      
      // Nullify value so global safety net inside afterAll avoids duplicate calls
      createdBookId = ""; 
    });
  });
});