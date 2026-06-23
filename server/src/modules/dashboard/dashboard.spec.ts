import { jest } from "@jest/globals";

jest.unstable_mockModule("./dashboard.repository.js", () => ({
  default: {
    getOverview: jest.fn(),
    getDashboardSummaryData: jest.fn(),
    getPopularBooks: jest.fn(),
    getRecentIssues: jest.fn(),
    getMonthlyFineCollection: jest.fn(),
  },
}));

const { default: dashboardService } =
  await import("./dashboard.service.js");

const { default: dashboardRepository } =
  await import("./dashboard.repository.js");

const mockGetOverview =
  dashboardRepository.getOverview as any;

const mockGetDashboardSummaryData =
  dashboardRepository.getDashboardSummaryData as any;

const mockGetPopularBooks =
  dashboardRepository.getPopularBooks as any;

const mockGetRecentIssues =
  dashboardRepository.getRecentIssues as any;

const mockGetMonthlyFineCollection =
  dashboardRepository.getMonthlyFineCollection as any;

describe("Dashboard Service Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getOverview", () => {
    it("should return overview metrics", async () => {
      const overview = {
        totalBooks: 100,
        totalMembers: 50,
        activeMembers: 40,
        expiredMembers: 10,
        issuedBooks: 25,
        returnedBooks: 20,
        overdueCount: 5,
        unpaidFines: 500,
      };

      mockGetOverview.mockResolvedValue(
        overview
      );

      const result =
        await dashboardService.getOverview();

      expect(
        mockGetOverview
      ).toHaveBeenCalled();

      expect(result).toEqual(overview);
    });
  });

  describe("getDashboardSummaryService", () => {
    it("should return dashboard summary data", async () => {
      const summary = {
        summary: {
          totalBooks: 100,
        },
        widgets: {},
        overdueBooks: [],
      };

      mockGetDashboardSummaryData.mockResolvedValue(
        summary
      );

      const result =
        await dashboardService.getDashboardSummaryService();

      expect(
        mockGetDashboardSummaryData
      ).toHaveBeenCalled();

      expect(result).toEqual(summary);
    });
  });

  describe("getPopularBooks", () => {
    it("should return popular books", async () => {
      const books = [
        {
          book_id: "book-1",
          book_name: "Clean Code",
          lending_count: 100,
        },
      ];

      mockGetPopularBooks.mockResolvedValue(
        books
      );

      const result =
        await dashboardService.getPopularBooks();

      expect(
        mockGetPopularBooks
      ).toHaveBeenCalled();

      expect(result).toEqual(books);
    });
  });

  describe("getRecentIssues", () => {
    it("should map recent issues correctly", async () => {
      const rawIssues = [
        {
          issue_id: "issue-1",
          borrowed_date: new Date(),
          due_date: new Date(),
          member: {
            user: {
              name: "John Doe",
            },
          },
          book: {
            book_name: "Clean Code",
          },
        },
      ];

      mockGetRecentIssues.mockResolvedValue(
        rawIssues
      );

      const result =
        await dashboardService.getRecentIssues();

      expect(
        mockGetRecentIssues
      ).toHaveBeenCalled();

      expect(result).toEqual([
        {
          issue_id: "issue-1",
          member_name: "John Doe",
          book_name: "Clean Code",
          borrowed_date:
            rawIssues[0]!.borrowed_date,

          due_date:
            rawIssues[0]!.due_date,
        },
      ]);
    });

    it("should use fallback values when nested data is missing", async () => {
      const rawIssues = [
        {
          issue_id: "issue-1",
          borrowed_date: new Date(),
          due_date: new Date(),
          member: null,
          book: null,
        },
      ];

      mockGetRecentIssues.mockResolvedValue(
        rawIssues
      );

      const result =
        await dashboardService.getRecentIssues();

      expect(result).toEqual([
        {
          issue_id: "issue-1",
          member_name:
            "Unknown Member",
          book_name:
            "Unknown Book",
          borrowed_date:
            rawIssues[0]!.borrowed_date,
          due_date:
            rawIssues[0]!.due_date,
        },
      ]);
    });

    it("should return empty array when no issues exist", async () => {
      mockGetRecentIssues.mockResolvedValue(
        []
      );

      const result =
        await dashboardService.getRecentIssues();

      expect(result).toEqual([]);
    });
  });

  describe("getMonthlyFineCollection", () => {
    it("should return monthly fine collection data", async () => {
      const fineData = [
        {
          month: "2026-06",
          total: 1200,
        },
      ];

      mockGetMonthlyFineCollection.mockResolvedValue(
        fineData
      );

      const result =
        await dashboardService.getMonthlyFineCollection();

      expect(
        mockGetMonthlyFineCollection
      ).toHaveBeenCalled();

      expect(result).toEqual(fineData);
    });
  });
});