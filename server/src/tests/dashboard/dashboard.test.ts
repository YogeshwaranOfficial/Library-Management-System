import request from "supertest";
import app from "../../app.js";
import { getAuthToken } from "../helpers/testAuth.helper.js";

describe("⚙️ Dashboard Module - Integration Tests", () => {
  let authToken: string;

  beforeAll(async () => {
    // Generate valid authorization token using helper system
    authToken = await getAuthToken();
  });

  describe("GET /api/v1/dashboard/overview", () => {
    it("❌ Should reject request with 401 Unauthorized if token is missing", async () => {
      const response = await request(app).get("/api/v1/dashboard/overview");
      expect(response.status).toBe(401);
    });

    it("✅ Should fetch system wide summary counts successfully with 200", async () => {
      const response = await request(app)
        .get("/api/v1/dashboard/overview")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("overview fetched successfully");
      
      // Confirm all metrics are numeric aggregates
      const { data } = response.body;
      expect(data).toHaveProperty("totalBooks");
      expect(typeof data.totalBooks).toBe("number");
      expect(data).toHaveProperty("unpaidFines");
      expect(typeof data.unpaidFines).toBe("number");
    });
  });

  describe("GET /api/v1/dashboard/analytics/popular-books", () => {
    it("✅ Should fetch top high-demand rental books array", async () => {
      const response = await request(app)
        .get("/api/v1/dashboard/analytics/popular-books")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty("book_name");
        expect(response.body.data[0]).toHaveProperty("lending_count");
      }
    });
  });

  describe("GET /api/v1/dashboard/analytics/recent-issues", () => {
    it("✅ Should return recent logs flattened ready for frontend UI ingestion", async () => {
      const response = await request(app)
        .get("/api/v1/dashboard/analytics/recent-issues")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        const firstIssue = response.body.data[0];
        // Confirm data fields match frontend expectations and are NOT nested deep model layouts
        expect(firstIssue).toHaveProperty("issue_id");
        expect(firstIssue).toHaveProperty("member_name");
        expect(firstIssue).toHaveProperty("book_name");
        expect(typeof firstIssue.member_name).toBe("string");
        expect(firstIssue.member).toBeUndefined(); // Assures mapping occurred successfully
      }
    });
  });

  describe("GET /api/v1/dashboard/reports/monthly-fines", () => {
    it("✅ Should fetch dynamic timeline series calculations for charts", async () => {
      const response = await request(app)
        .get("/api/v1/dashboard/reports/monthly-fines")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});