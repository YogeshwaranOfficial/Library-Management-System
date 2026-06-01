import { jest } from "@jest/globals";
import dashboardService from "./dashboard.service.js";
import dashboardRepository from "./dashboard.repository.js";

describe("🧪 Dashboard Service - Unit Tests", () => {
  
  afterEach(() => {
    // Restores original functionality back to the repository after every test block
    jest.restoreAllMocks();
  });

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

      // 💡 FIX: Spy on the instance method directly at runtime
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

      // 💡 FIX: Spy on the recent issues method
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
      
      // 💡 FIX: Spy on the popular books method
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
      
      // 💡 FIX: Spy on the fine analytics collection method
      jest.spyOn(dashboardRepository, "getMonthlyFineCollection").mockResolvedValue(mockFines);

      const result = await dashboardService.getMonthlyFineCollection();
      expect(result).toEqual(mockFines);
    });
  });
});