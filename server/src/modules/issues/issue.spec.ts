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

describe("borrowBook", () => {
  const payload = {
    memberId: "member-1",
    bookId: "book-1",
    dueDate: "2099-01-20",
  };

  const plan = {
    plan_name: "Premium",
    max_books_allowed: 5,
  };

  const member = {
    member_id: "member-1",
    membership_status: "ACTIVE",
    membership_plan: plan,
  };

  const book = {
    book_id: "book-1",
    available_copies: 10,
    decrement: jest.fn(),
    increment: jest.fn(),
  };

  beforeEach(() => {
    mockSequelize.transaction.mockImplementation(
      async (callback: any) =>
        callback(mockTransaction)
    );
  });

  it("should borrow book successfully", async () => {
    mockMember.findByPk.mockResolvedValue(
      member
    );

    mockIssue.count.mockResolvedValue(1);

    mockBook.findByPk.mockResolvedValue(
      book
    );

    mockIssueRepository.getActiveIssue.mockResolvedValue(
      null
    );

    const createdIssue = {
      issue_id: "issue-1",
    };

    mockIssueRepository.createIssue.mockResolvedValue(
      createdIssue
    );

    const result =
      await issueService.borrowBook(
        payload
      );

    expect(
      mockIssueRepository.createIssue
    ).toHaveBeenCalled();

    expect(
      book.decrement
    ).toHaveBeenCalledWith(
      "available_copies",
      expect.any(Object)
    );

    expect(
      book.increment
    ).toHaveBeenCalledWith(
      "lending_count",
      expect.any(Object)
    );

    expect(result).toEqual(
      createdIssue
    );
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
      ...member,
      membership_status: "EXPIRED",
    });

    await expect(
      issueService.borrowBook(payload)
    ).rejects.toMatchObject({
      message:
        "Membership is not active",
    });
  });

  it("should throw when no plan attached", async () => {
    mockMember.findByPk.mockResolvedValue({
      ...member,
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
    mockMember.findByPk.mockResolvedValue(
      member
    );

    mockIssue.count.mockResolvedValue(5);

    await expect(
      issueService.borrowBook(payload)
    ).rejects.toMatchObject({
      message:
        "Borrow limit reached. Your Premium plan only allows up to 5 books out at a time.",
    });
  });

  it("should throw when book not found", async () => {
    mockMember.findByPk.mockResolvedValue(
      member
    );

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
    mockMember.findByPk.mockResolvedValue(
      member
    );

    mockIssue.count.mockResolvedValue(0);

    mockBook.findByPk.mockResolvedValue({
      ...book,
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
    mockMember.findByPk.mockResolvedValue(
      member
    );

    mockIssue.count.mockResolvedValue(0);

    mockBook.findByPk.mockResolvedValue(
      book
    );

    mockIssueRepository.getActiveIssue.mockResolvedValue(
      {
        issue_id: "existing",
      }
    );

    await expect(
      issueService.borrowBook(payload)
    ).rejects.toMatchObject({
      message:
        "Book already borrowed and not returned yet",
    });
  });
});

describe("getMemberIssues", () => {
  it("should return member issues", async () => {
    const issues = [
      {
        issue_id: "issue-1",
      },
    ];

    mockIssueRepository.getMemberIssues.mockResolvedValue(
      issues
    );

    const result =
      await issueService.getMemberIssues(
        "member-1"
      );

    expect(
      mockIssueRepository.getMemberIssues
    ).toHaveBeenCalledWith(
      "member-1"
    );

    expect(result).toEqual(
      issues
    );
  });
});


describe("updateIssueParameters", () => {
  it("should throw when issue not found", async () => {
    mockIssueRepository.findIssueById.mockResolvedValue(null);

    await expect(
      issueService.updateIssueParameters(
        "issue-1",
        {}
      )
    ).rejects.toMatchObject({
      message:
        "Issue asset context instance not found",
    });
  });

  it("should update active issue successfully", async () => {
    const futureDate = new Date(
      Date.now() + 86400000
    );

    mockIssueRepository.findIssueById.mockResolvedValue({
      issue_id: "issue-1",
      member_id: "member-1",
      book_id: "book-1",
      borrowed_date: new Date(),
      due_date: futureDate,
      issue_status: "BORROWED",
    });

    mockIssueRepository.updateIssue.mockResolvedValue({
      issue_id: "issue-1",
    });

    const result =
      await issueService.updateIssueParameters(
        "issue-1",
        {
          dueDate:
            futureDate.toISOString(),
        }
      );

    expect(
      mockIssueRepository.updateIssue
    ).toHaveBeenCalled();

    expect(result).toEqual({
      issue_id: "issue-1",
    });
  });

  it("should reject editing returned issue without status override", async () => {
    mockIssueRepository.findIssueById.mockResolvedValue({
      issue_id: "issue-1",
      issue_status: "RETURNED",
      member_id: "member-1",
      book_id: "book-1",
      borrowed_date: new Date(),
      due_date: new Date(),
    });

    await expect(
      issueService.updateIssueParameters(
        "issue-1",
        {
          dueDate: "2026-01-10",
        }
      )
    ).rejects.toMatchObject({
      message:
        "Cannot change data parameters of a closed transactional history log.",
    });
  });

  it("should restore returned issue back to borrowed", async () => {
    const book = {
      available_copies: 5,
      decrement: jest.fn(),
    };

    mockIssueRepository.findIssueById.mockResolvedValue({
      issue_id: "issue-1",
      issue_status: "RETURNED",
      member_id: "member-1",
      book_id: "book-1",
      borrowed_date: new Date(),
      due_date: new Date(),
    });

    mockBook.findByPk.mockResolvedValue(
      book
    );

    mockFine.findOne.mockResolvedValue({
      update: jest.fn(),
    });

    mockIssueRepository.updateIssue.mockResolvedValue({
      issue_id: "issue-1",
      issue_status: "BORROWED",
    });

    const result =
      await issueService.updateIssueParameters(
        "issue-1",
        {
          status: "BORROWED",
        }
      );

    expect(
      book.decrement
    ).toHaveBeenCalled();

    expect(
      mockIssueRepository.updateIssue
    ).toHaveBeenCalled();

    expect(result).toEqual({
      issue_id: "issue-1",
      issue_status: "BORROWED",
    });
  });

  it("should throw when restoring and book unavailable", async () => {
    mockIssueRepository.findIssueById.mockResolvedValue({
      issue_id: "issue-1",
      issue_status: "RETURNED",
      member_id: "member-1",
      book_id: "book-1",
      borrowed_date: new Date(),
      due_date: new Date(),
    });

    mockBook.findByPk.mockResolvedValue({
      available_copies: 0,
    });

    await expect(
      issueService.updateIssueParameters(
        "issue-1",
        {
          status: "BORROWED",
        }
      )
    ).rejects.toMatchObject({
      message:
        "Cannot undo! This book's shelf slot is fully allocated right now.",
    });
  });
});

describe("deleteSingleIssue", () => {
  it("should delete active issue and restore inventory", async () => {
    const book = {
      increment: jest.fn(),
    };

    mockIssueRepository.findIssueById.mockResolvedValue({
      issue_id: "issue-1",
      book_id: "book-1",
      returned_date: null,
    });

    mockBook.findByPk.mockResolvedValue(
      book
    );

    mockIssueRepository.deleteIssueById.mockResolvedValue(
      1
    );

    const result =
      await issueService.deleteSingleIssue(
        "issue-1"
      );

    expect(
      book.increment
    ).toHaveBeenCalled();

    expect(
      mockFine.destroy
    ).toHaveBeenCalled();

    expect(
      mockIssueRepository.deleteIssueById
    ).toHaveBeenCalledWith(
      "issue-1",
      expect.any(Object)
    );

    expect(result).toBe(1);
  });

  it("should delete returned issue without inventory update", async () => {
    mockIssueRepository.findIssueById.mockResolvedValue({
      issue_id: "issue-1",
      book_id: "book-1",
      returned_date: new Date(),
    });

    mockIssueRepository.deleteIssueById.mockResolvedValue(
      1
    );

    await issueService.deleteSingleIssue(
      "issue-1"
    );

    expect(
      mockBook.findByPk
    ).not.toHaveBeenCalled();

    expect(
      mockIssueRepository.deleteIssueById
    ).toHaveBeenCalled();
  });

  it("should throw when issue not found", async () => {
    mockIssueRepository.findIssueById.mockResolvedValue(
      null
    );

    await expect(
      issueService.deleteSingleIssue(
        "issue-1"
      )
    ).rejects.toMatchObject({
      message:
        "Issue log element not found",
    });
  });
});

describe("clearAllReturnedHistory", () => {
  it("should return 0 when no returned issues exist", async () => {
    mockIssue.findAll.mockResolvedValue([]);

    const result =
      await issueService.clearAllReturnedHistory();

    expect(result).toBe(0);

    expect(
      mockIssueRepository.deleteManyIssues
    ).not.toHaveBeenCalled();
  });

  it("should clear returned history successfully", async () => {
    mockIssue.findAll.mockResolvedValue([
      {
        issue_id: "issue-1",
      },
      {
        issue_id: "issue-2",
      },
    ]);

    mockIssueRepository.deleteManyIssues.mockResolvedValue(
      2
    );

    const result =
      await issueService.clearAllReturnedHistory();

    expect(
      mockFine.destroy
    ).toHaveBeenCalled();

    expect(
      mockIssueRepository.deleteManyIssues
    ).toHaveBeenCalledWith(
      ["issue-1", "issue-2"],
      expect.any(Object)
    );

    expect(result).toBe(2);
  });
});

})