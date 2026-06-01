import { jest } from "@jest/globals";
import dashboardService from "./dashboard.service.js";
import dashboardRepository from "./dashboard.repository.js";

// Import models to spy on their native Sequelize static methods
import Book from "../../database/models/Book.js";
import Member from "../../database/models/Member.js";
import Issue from "../../database/models/Issue.js";
import Fine from "../../database/models/Fine.js";

describe("⚙️ Dashboard Module - Unit Tests", () => {

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==========================================
  // 🏢 PART 1: Dashboard Service Layer Tests
  // ==========================================
  describe("📘 Dashboard Service", () => {
    
    describe("getOverview()", () => {
      it("✅ Should pass through data from repository unaltered", async () => {
        const mockOverview = {
          totalBooks: 100,
          totalMembers: 50,
          activeMembers: 40,
          expiredMembers: 10,
          issuedBooks: 30,
          returnedBooks: 70,
          overdueBooks: 5,
          unpaidFines: 150,
        };

        const spy = jest.spyOn(dashboardRepository, "getOverview").mockResolvedValue(mockOverview);

        const result = await dashboardService.getOverview();
        
        expect(result).toEqual(mockOverview);
        expect(spy).toHaveBeenCalledTimes(1);
      });
    });

    describe("getRecentIssues()", () => {
      it("✅ Should correctly flatten nested Sequelize model relations into standard frontend layout", async () => {
        const mockRawIssues = [
          {
            issue_id: "issue-uuid-1",
            borrowed_date: new Date("2026-01-01"),
            due_date: new Date("2026-01-15"),
            member: { user: { name: "John Doe" } },
            book: { book_name: "TypeScript Deep Dive" },
          },
          {
            issue_id: "issue-uuid-2",
            borrowed_date: new Date("2026-02-01"),
            due_date: new Date("2026-02-15"),
            member: null,
            book: null,
          }
        ] as any;

        jest.spyOn(dashboardRepository, "getRecentIssues").mockResolvedValue(mockRawIssues);

        const result = await dashboardService.getRecentIssues();

        expect(result).toHaveLength(2);
        
        const firstIssue = result[0]!;
        const secondIssue = result[1]!;

        expect(firstIssue).toEqual({
          issue_id: "issue-uuid-1",
          member_name: "John Doe",
          book_name: "TypeScript Deep Dive",
          borrowed_date: mockRawIssues[0]!.borrowed_date,
          due_date: mockRawIssues[0]!.due_date,
        });

        expect(secondIssue.member_name).toBe("Unknown Member");
        expect(secondIssue.book_name).toBe("Unknown Book");
      });
    });

    describe("getPopularBooks()", () => {
      it("✅ Should pass through popular book array data", async () => {
        const mockBooks = [
          { book_id: "1", book_name: "Book A", lending_count: 25 }
        ] as any;
        
        jest.spyOn(dashboardRepository, "getPopularBooks").mockResolvedValue(mockBooks);

        const result = await dashboardService.getPopularBooks();
        expect(result).toEqual(mockBooks);
      });
    });

    describe("getMonthlyFineCollection()", () => {
      it("✅ Should pass through financial collection tracking history", async () => {
        const mockFines = [
          { month: "2026-01-01", total: 450 }
        ] as any;
        
        jest.spyOn(dashboardRepository, "getMonthlyFineCollection").mockResolvedValue(mockFines);

        const result = await dashboardService.getMonthlyFineCollection();
        expect(result).toEqual(mockFines);
      });
    });
  });

  // ==========================================
  // 🗄️ PART 2: Dashboard Repository Layer Tests
  // ==========================================
  describe("📙 Dashboard Repository", () => {

    describe("getOverview()", () => {
      beforeEach(() => {
        // Mock the basic counting functions that execute inside Promise.all
        jest.spyOn(Book, "count").mockResolvedValue(10);
        jest.spyOn(Member, "count").mockResolvedValue(5);
        jest.spyOn(Issue, "count").mockResolvedValue(2);
      });

      it("✅ Should compile aggregate metrics correctly when fine records exist", async () => {
        // Mock Fine aggregation finding an active record sum output string
        jest.spyOn(Fine, "findOne").mockResolvedValue({ total_unpaid: "250" } as any);

        const overview = await dashboardRepository.getOverview();

        expect(overview.totalBooks).toBe(10);
        expect(overview.unpaidFines).toBe(250); // Confirms numeric conversion occurs smoothly
      });

      // ✨ NEW TEST CASE: Forces coverage of line 72's false branch condition (: 0)
      it("✅ Should fallback unpaidFines to 0 if fine collection query returns null", async () => {
        // Force the aggregation database response to resolve to null
        jest.spyOn(Fine, "findOne").mockResolvedValue(null);

        const overview = await dashboardRepository.getOverview();

        expect(overview.unpaidFines).toBe(0); // Proves line 72 fallback branch condition works perfectly
      });
    });

    describe("getPopularBooks()", () => {
      it("✅ Should execute Book query with descending limit criteria", async () => {
        const mockFindAll = jest.spyOn(Book, "findAll").mockResolvedValue([] as any);

        await dashboardRepository.getPopularBooks();

        expect(mockFindAll).toHaveBeenCalledWith(
          expect.objectContaining({
            limit: 5,
            order: [["lending_count", "DESC"]],
          })
        );
      });
    });

    describe("getRecentIssues()", () => {
      it("✅ Should fetch latest logs with deep relational model inclusion configurations", async () => {
        const mockFindAll = jest.spyOn(Issue, "findAll").mockResolvedValue([] as any);

        await dashboardRepository.getRecentIssues();

        expect(mockFindAll).toHaveBeenCalledWith(
          expect.objectContaining({
            limit: 10,
            order: [["created_at", "DESC"]],
            include: expect.any(Array),
          })
        );
      });
    });

    describe("getMonthlyFineCollection()", () => {
      it("✅ Should process historical grouped entries chronologically", async () => {
        const mockFindAll = jest.spyOn(Fine, "findAll").mockResolvedValue([] as any);

        await dashboardRepository.getMonthlyFineCollection();

        expect(mockFindAll).toHaveBeenCalledWith(
          expect.objectContaining({
            group: ["month"],
            order: expect.any(Array),
          })
        );
      });
    });
  });
});