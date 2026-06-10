import { jest } from "@jest/globals";

jest.unstable_mockModule("./issue.repository.js", () => ({
  default: {
    getAllIssuesDetailed: jest.fn(),
    getMemberAllowanceData: jest.fn(),
    getActiveIssue: jest.fn(),
    createIssue: jest.fn(),
    findIssueById: jest.fn(),
    returnBook: jest.fn(),
    updateIssue: jest.fn(),
    getMemberIssues: jest.fn(),
    deleteIssueById: jest.fn(),
    deleteManyIssues: jest.fn(),
  },
}));

jest.unstable_mockModule("../../database/models/Member.js", () => ({
  default: {
    findByPk: jest.fn(),
  },
}));

jest.unstable_mockModule("../../database/models/Book.js", () => ({
  default: {
    findByPk: jest.fn(),
  },
}));

jest.unstable_mockModule("../../database/models/Fine.js", () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.unstable_mockModule("../../database/models/Issue.js", () => ({
  default: {
    count: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
  },
}));

jest.unstable_mockModule(
  "../../database/models/MembershipPlan.js",
  () => ({
    default: {},
  })
);

jest.unstable_mockModule("../../database/index.js", () => ({
  sequelize: {
    transaction: jest.fn(),
  },
}));

const { default: issueService } =
  await import("./issue.service.js");

const { default: issueRepository } =
  await import("./issue.repository.js");

const { default: Member } =
  await import("../../database/models/Member.js");

const { default: Book } =
  await import("../../database/models/Book.js");

const { default: Fine } =
  await import("../../database/models/Fine.js");

const { default: Issue } =
  await import("../../database/models/Issue.js");

const { sequelize } =
  await import("../../database/index.js");

const mockIssueRepository =
  issueRepository as any;

const mockMember =
  Member as any;

const mockBook =
  Book as any;

const mockFine =
  Fine as any;

const mockIssue =
  Issue as any;

const mockSequelize =
  sequelize as any;

describe("IssueService Unit Tests", () => {
  const mockTransaction = {
    LOCK: {
      UPDATE: "UPDATE",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockSequelize.transaction.mockImplementation(
      async (callback: any) =>
        callback(mockTransaction)
    );
  });

  // ====================================================
  // getAllIssuesFeed
  // ====================================================

  describe("getAllIssuesFeed", () => {
    it("should return mapped issue feed", async () => {
      mockIssueRepository
        .getAllIssuesDetailed
        .mockResolvedValue([
          {
            issue_id: "issue-1",
            member_id: "member-1",
            book_id: "book-1",
            borrowed_date: "2026-01-01",
            due_date: "2099-01-10",
            returned_date: null,
            issue_status: "BORROWED",
            member: {
              user: {
                name: "John Doe",
                gmail: "john@gmail.com",
                phone_number: "9999999999",
              },
            },
            book: {
              book_name: "Clean Code",
              book_author: "Robert Martin",
            },
          },
        ]);

      mockFine.findOne.mockResolvedValue({
        fine_amount: 100,
        paid_status: false,
      });

      const result =
        await issueService.getAllIssuesFeed();

      expect(result).toHaveLength(1);

      expect(result[0]).toMatchObject({
        id: "issue-1",
        memberName: "John Doe",
        bookTitle: "Clean Code",
        fineAmount: 100,
      });
    });

    it("should use fallback values", async () => {
      mockIssueRepository
        .getAllIssuesDetailed
        .mockResolvedValue([
          {
            issue_id: "issue-1",
            issue_status: "BORROWED",
            due_date: "2099-01-01",
          },
        ]);

      mockFine.findOne.mockResolvedValue(null);

      const result =
        await issueService.getAllIssuesFeed();

      expect(
        result[0]?.memberName
      ).toBe("Unknown Member");

      expect(
        result[0]?.bookTitle
      ).toBe("Unknown Book");

      expect(
        result[0]?.fineAmount
      ).toBe(0);
    });
  });

  // ====================================================
  // getMemberAllowanceMetrics
  // ====================================================

  describe("getMemberAllowanceMetrics", () => {
    it("should return allowance metrics", async () => {
      mockIssueRepository
        .getMemberAllowanceData
        .mockResolvedValue({
          activeBorrowsCount: 2,
          memberProfile: {
            membership_plan: {
              max_books_allowed: 5,
            },
          },
        });

      const result =
        await issueService.getMemberAllowanceMetrics(
          "member-1"
        );

      expect(result).toEqual({
        currentBorrows: 2,
        maxAllowed: 5,
      });
    });

    it("should throw when member not found", async () => {
      mockIssueRepository
        .getMemberAllowanceData
        .mockResolvedValue({
          activeBorrowsCount: 0,
          memberProfile: null,
        });

      await expect(
        issueService.getMemberAllowanceMetrics(
          "member-1"
        )
      ).rejects.toMatchObject({
        message:
          "Member record data not found",
      });
    });
  });

  // ====================================================
  // borrowBook
  // ====================================================

  describe("borrowBook", () => {
    const payload = {
      memberId: "member-1",
      bookId: "book-1",
      dueDate: "2099-01-10",
    };

    it("should borrow book successfully", async () => {
      const decrement = jest.fn();
      const increment = jest.fn();

      mockMember.findByPk.mockResolvedValue({
        membership_status: "ACTIVE",
        membership_plan: {
          max_books_allowed: 5,
          plan_name: "Premium",
        },
      });

      mockIssue.count.mockResolvedValue(0);

      mockBook.findByPk.mockResolvedValue({
        available_copies: 10,
        decrement,
        increment,
      });

      mockIssueRepository
        .getActiveIssue
        .mockResolvedValue(null);

      mockIssueRepository
        .createIssue
        .mockResolvedValue({
          issue_id: "issue-1",
        });

      const result =
        await issueService.borrowBook(
          payload
        );

      expect(
        mockIssueRepository.createIssue
      ).toHaveBeenCalled();

      expect(decrement)
        .toHaveBeenCalled();

      expect(increment)
        .toHaveBeenCalled();

      expect(result.issue_id)
        .toBe("issue-1");
    });

    it("should throw when member not found", async () => {
      mockMember.findByPk.mockResolvedValue(
        null
      );

      await expect(
        issueService.borrowBook(payload)
      ).rejects.toMatchObject({
        message: "Member not found",
      });
    });

    it("should throw when membership inactive", async () => {
      mockMember.findByPk.mockResolvedValue({
        membership_status: "EXPIRED",
      });

      await expect(
        issueService.borrowBook(payload)
      ).rejects.toMatchObject({
        message:
          "Membership is not active",
      });
    });

    it("should throw when plan missing", async () => {
      mockMember.findByPk.mockResolvedValue({
        membership_status: "ACTIVE",
        membership_plan: null,
      });

      await expect(
        issueService.borrowBook(payload)
      ).rejects.toMatchObject({
        message:
          "No membership plan associated with this account",
      });
    });

    it("should throw when borrow limit reached", async () => {
      mockMember.findByPk.mockResolvedValue({
        membership_status: "ACTIVE",
        membership_plan: {
          max_books_allowed: 2,
          plan_name: "Basic",
        },
      });

      mockIssue.count.mockResolvedValue(2);

      await expect(
        issueService.borrowBook(payload)
      ).rejects.toMatchObject({
        message:
          expect.stringContaining(
            "Borrow limit reached"
          ),
      });
    });

    it("should throw when book not found", async () => {
      mockMember.findByPk.mockResolvedValue({
        membership_status: "ACTIVE",
        membership_plan: {
          max_books_allowed: 5,
        },
      });

      mockIssue.count.mockResolvedValue(0);

      mockBook.findByPk.mockResolvedValue(
        null
      );

      await expect(
        issueService.borrowBook(payload)
      ).rejects.toMatchObject({
        message: "Book not found",
      });
    });

    it("should throw when no copies available", async () => {
      mockMember.findByPk.mockResolvedValue({
        membership_status: "ACTIVE",
        membership_plan: {
          max_books_allowed: 5,
        },
      });

      mockIssue.count.mockResolvedValue(0);

      mockBook.findByPk.mockResolvedValue({
        available_copies: 0,
      });

      await expect(
        issueService.borrowBook(payload)
      ).rejects.toMatchObject({
        message:
          "Book unavailable in current inventory slots",
      });
    });

    it("should throw when already borrowed", async () => {
      mockMember.findByPk.mockResolvedValue({
        membership_status: "ACTIVE",
        membership_plan: {
          max_books_allowed: 5,
        },
      });

      mockIssue.count.mockResolvedValue(0);

      mockBook.findByPk.mockResolvedValue({
        available_copies: 5,
      });

      mockIssueRepository
        .getActiveIssue
        .mockResolvedValue({
          issue_id: "existing",
        });

      await expect(
        issueService.borrowBook(payload)
      ).rejects.toMatchObject({
        message:
          "Book already borrowed and not returned yet",
      });
    });
  });



})