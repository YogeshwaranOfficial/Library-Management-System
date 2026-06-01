import request from "supertest";
import app from "../../app.js";
import { getAuthToken } from "../helpers/testAuth.helper.js";
import Issue from "../../database/models/Issue.js";

describe("⚙️ Issues Module - Integration Tests", () => {
  let authToken: string;
  let newlyBorrowedIssueId: string;

  // Constants mapping directly to your provided SQL seed data
  const SEED_MEMBER_ID = "20000001-2222-4222-a222-222222222201"; // Historically returned member
  const SEED_BOOK_ID = "b0000001-3333-4333-a333-333333333301";   // Historically returned book (available)
  
  const ACTIVE_ISSUE_MEMBER_ID = "20000030-2222-4222-a222-222222222230"; // From row 16
  const ACTIVE_ISSUE_ID = "40000016-4444-4444-a444-444444444416";        // From row 16 (Clean item with NO pre-existing fine record)

  beforeAll(async () => {
    authToken = await getAuthToken();

    // Ensure the target row is reset back to active BORROWED status before running tests
    await Issue.update(
      { 
        returned_date: null,
        issue_status: "BORROWED"
      },
      { where: { issue_id: ACTIVE_ISSUE_ID } }
    );
  });

  afterAll(async () => {
    // Clean up only the entry generated dynamically by our borrow route test execution
    if (newlyBorrowedIssueId) {
      await Issue.destroy({ where: { issue_id: newlyBorrowedIssueId } });
    }
    
    // Reset our seed test row back to its default state for subsequent runs
    await Issue.update(
      { 
        returned_date: null,
        issue_status: "BORROWED"
      },
      { where: { issue_id: ACTIVE_ISSUE_ID } }
    );
  });

  describe("POST /api/v1/issues/borrow", () => {
    it("✅ Should successfully borrow a book and return 201", async () => {
      const response = await request(app)
        .post("/api/v1/issues/borrow")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          member_id: SEED_MEMBER_ID,
          book_id: SEED_BOOK_ID
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("issue_id");

      // Preserve id dynamically so afterAll hook drops it from test environment tables
      newlyBorrowedIssueId = response.body.data.issue_id;
    });

    it("❌ Should return 400 if validation fails", async () => {
      const response = await request(app)
        .post("/api/v1/issues/borrow")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ member_id: "not-a-uuid" });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/v1/issues/return", () => {
    it("✅ Should successfully return a book and return 200", async () => {
      const response = await request(app)
        .post("/api/v1/issues/return")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ issue_id: ACTIVE_ISSUE_ID });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/v1/issues/member/:memberId", () => {
    it("✅ Should fetch all issues for a specific member", async () => {
      const response = await request(app)
        .get(`/api/v1/issues/member/${ACTIVE_ISSUE_MEMBER_ID}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});