import { jest } from "@jest/globals";
import httpStatus from "http-status-codes";

// Import the actual models and repository so jest.spyOn can track types automatically
import Member from "../../database/models/Member.js";
import Book from "../../database/models/Book.js";
import Fine from "../../database/models/Fine.js";
import Issue from "../../database/models/Issue.js";
import issueRepository from "./issue.repository.js";

import issueService from "./issue.service.js";
import AppError from "../../utils/AppError.js";

describe("⚙️ Issues Module - Unit Tests (Service Layer)", () => {
  
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // ==========================================
  // 📘 1. borrowBook() Scenarios
  // ==========================================
  describe("borrowBook", () => {
    const memberId = "member-uuid-1111";
    const bookId = "book-uuid-2222";

    it("❌ Should throw 404 error if member is not found", async () => {
      jest.spyOn(Member, "findByPk").mockResolvedValue(null);

      await expect(issueService.borrowBook(memberId, bookId)).rejects.toThrow(
        new AppError("Member not found", httpStatus.NOT_FOUND)
      );
    });

    it("❌ Should throw 400 error if membership status is not ACTIVE", async () => {
      jest.spyOn(Member, "findByPk").mockResolvedValue({
        member_id: memberId,
        membership_status: "EXPIRED",
      } as any);

      await expect(issueService.borrowBook(memberId, bookId)).rejects.toThrow(
        new AppError("Membership is not active", httpStatus.BAD_REQUEST)
      );
    });

    it("❌ Should throw 400 error if no membership plan is attached to the member", async () => {
      jest.spyOn(Member, "findByPk").mockResolvedValue({
        member_id: memberId,
        membership_status: "ACTIVE",
        membership_plan: null,
      } as any);

      await expect(issueService.borrowBook(memberId, bookId)).rejects.toThrow(
        new AppError("No membership plan associated with this account", httpStatus.BAD_REQUEST)
      );
    });

    it("❌ Should throw 400 error if member has reached their active borrow plan limits", async () => {
      jest.spyOn(Member, "findByPk").mockResolvedValue({
        member_id: memberId,
        membership_status: "ACTIVE",
        membership_plan: { max_books: 3, plan_name: "Gold" },
      } as any);
      jest.spyOn(Issue, "count").mockResolvedValue(3);

      await expect(issueService.borrowBook(memberId, bookId)).rejects.toThrow(
        /Borrow limit reached. Your Gold plan only allows up to 3 books/
      );
    });

    it("❌ Should use 'Current' as a fallback plan name when the plan has no explicit name assigned", async () => {
      jest.spyOn(Member, "findByPk").mockResolvedValue({
        member_id: memberId,
        membership_status: "ACTIVE",
        membership_plan: { max_books: 2, plan_name: "" }, 
      } as any);
      jest.spyOn(Issue, "count").mockResolvedValue(2);

      await expect(issueService.borrowBook(memberId, bookId)).rejects.toThrow(
        /Your Current plan only allows up to 2 books/
      );
    });

    it("❌ Should throw 404 error if targeted book cannot be found", async () => {
      jest.spyOn(Member, "findByPk").mockResolvedValue({
        member_id: memberId,
        membership_status: "ACTIVE",
        membership_plan: { max_books: 5, plan_name: "Platinum" },
      } as any);
      jest.spyOn(Issue, "count").mockResolvedValue(1);
      jest.spyOn(Book, "findByPk").mockResolvedValue(null);

      await expect(issueService.borrowBook(memberId, bookId)).rejects.toThrow(
        new AppError("Book not found", httpStatus.NOT_FOUND)
      );
    });

    it("❌ Should throw 400 error if book has 0 available copies left", async () => {
      jest.spyOn(Member, "findByPk").mockResolvedValue({
        member_id: memberId,
        membership_status: "ACTIVE",
        membership_plan: { max_books: 5, plan_name: "Platinum" },
      } as any);
      jest.spyOn(Issue, "count").mockResolvedValue(1);
      jest.spyOn(Book, "findByPk").mockResolvedValue({ book_id: bookId, available_copies: 0 } as any);

      await expect(issueService.borrowBook(memberId, bookId)).rejects.toThrow(
        new AppError("Book unavailable", httpStatus.BAD_REQUEST)
      );
    });

    it("❌ Should throw 400 error if member is already borrowing an unreturned copy of this exact book", async () => {
      jest.spyOn(Member, "findByPk").mockResolvedValue({
        member_id: memberId,
        membership_status: "ACTIVE",
        membership_plan: { max_books: 5 },
      } as any);
      jest.spyOn(Issue, "count").mockResolvedValue(1);
      jest.spyOn(Book, "findByPk").mockResolvedValue({ book_id: bookId, available_copies: 5 } as any);
      jest.spyOn(issueRepository, "getActiveIssue").mockResolvedValue({ issue_id: "existing-issue" } as any);

      await expect(issueService.borrowBook(memberId, bookId)).rejects.toThrow(
        new AppError("Book already borrowed and not returned yet", httpStatus.BAD_REQUEST)
      );
    });

    it("✅ Should successfully issue a book, decrement copies, and increment lending count", async () => {
      jest.spyOn(Member, "findByPk").mockResolvedValue({
        member_id: memberId,
        membership_status: "ACTIVE",
        membership_plan: { max_books: 5 },
      } as any);
      jest.spyOn(Issue, "count").mockResolvedValue(0);
      jest.spyOn(Book, "findByPk").mockResolvedValue({ 
        book_id: bookId, 
        available_copies: 10,
        lending_count: 2 
      } as any);
      jest.spyOn(issueRepository, "getActiveIssue").mockResolvedValue(null);
      
      const createdIssuePayload = { issue_id: "new-issue-123", member_id: memberId, book_id: bookId };
      jest.spyOn(issueRepository, "createIssue").mockResolvedValue(createdIssuePayload as any);
      const bookUpdateSpy = jest.spyOn(Book, "update").mockResolvedValue([1]);

      const result = await issueService.borrowBook(memberId, bookId);

      expect(issueRepository.createIssue).toHaveBeenCalledWith(
        expect.objectContaining({ member_id: memberId, book_id: bookId })
      );
      expect(bookUpdateSpy).toHaveBeenCalledWith(
        { available_copies: 9, lending_count: 3 },
        { where: { book_id: bookId } }
      );
      expect(result).toEqual(createdIssuePayload);
    });
  });

  // ==========================================
  // 📘 2. returnBook() Scenarios
  // ==========================================
  describe("returnBook", () => {
    const issueId = "issue-uuid-9999";
    const bookId = "book-uuid-2222";

    it("❌ Should throw 404 error if issue record does not exist", async () => {
      jest.spyOn(issueRepository, "findIssueById").mockResolvedValue(null);

      await expect(issueService.returnBook(issueId)).rejects.toThrow(
        new AppError("Issue record not found", httpStatus.NOT_FOUND)
      );
    });

    it("❌ Should throw 400 error if book has already been marked as returned", async () => {
      jest.spyOn(issueRepository, "findIssueById").mockResolvedValue({
        issue_id: issueId,
        returned_date: new Date(),
      } as any);

      await expect(issueService.returnBook(issueId)).rejects.toThrow(
        new AppError("Book already returned", httpStatus.BAD_REQUEST)
      );
    });

    it("✅ Should return the book on-time without applying fine fees", async () => {
      const futureDueDate = new Date();
      futureDueDate.setDate(futureDueDate.getDate() + 5);

      jest.spyOn(issueRepository, "findIssueById").mockResolvedValue({
        issue_id: issueId,
        book_id: bookId,
        due_date: futureDueDate,
        returned_date: null,
      } as any);
      jest.spyOn(issueRepository, "returnBook").mockResolvedValue({ issue_id: issueId, returned_date: new Date() } as any);
      jest.spyOn(Book, "findByPk").mockResolvedValue({ book_id: bookId, available_copies: 2 } as any);
      const bookUpdateSpy = jest.spyOn(Book, "update").mockResolvedValue([1]);
      
      const fineFindOrCreateSpy = jest.spyOn(Fine, "findOrCreate").mockResolvedValue([{} as any, true]);

      const result = await issueService.returnBook(issueId);

      expect(bookUpdateSpy).toHaveBeenCalledWith(
        { available_copies: 3 },
        { where: { book_id: bookId } }
      );
      expect(fineFindOrCreateSpy).not.toHaveBeenCalled();
      expect(result).toHaveProperty("issue_id", issueId);
    });

    it("✅ Should safely record return info even if the book record was removed from the system completely", async () => {
      const futureDueDate = new Date();
      futureDueDate.setDate(futureDueDate.getDate() + 5);

      jest.spyOn(issueRepository, "findIssueById").mockResolvedValue({
        issue_id: issueId,
        book_id: bookId,
        due_date: futureDueDate,
        returned_date: null,
      } as any);
      jest.spyOn(issueRepository, "returnBook").mockResolvedValue({ issue_id: issueId, returned_date: new Date() } as any);
      
      jest.spyOn(Book, "findByPk").mockResolvedValue(null);
      const bookUpdateSpy = jest.spyOn(Book, "update").mockResolvedValue([0]);

      const result = await issueService.returnBook(issueId);

      expect(bookUpdateSpy).not.toHaveBeenCalled();
      expect(result).toHaveProperty("issue_id", issueId);
    });

    it("⚠️ Should generate a cash fine record when returned after the due_date limit", async () => {
      jest.useFakeTimers();
      const now = new Date('2026-01-05T12:00:00Z');
      jest.setSystemTime(now);

      const pastDueDate = new Date('2026-01-02T12:00:00Z'); 

      jest.spyOn(issueRepository, "findIssueById").mockResolvedValue({
        issue_id: issueId,
        book_id: bookId,
        due_date: pastDueDate,
        returned_date: null,
      } as any);
      
      jest.spyOn(issueRepository, "returnBook").mockResolvedValue({ issue_id: issueId, returned_date: now } as any);
      jest.spyOn(Book, "findByPk").mockResolvedValue({ book_id: bookId, available_copies: 2 } as any);
      jest.spyOn(Book, "update").mockResolvedValue([1]);
      
      const fineFindOrCreateSpy = jest.spyOn(Fine, "findOrCreate").mockResolvedValue([{} as any, true]);

      await issueService.returnBook(issueId);

      expect(fineFindOrCreateSpy).toHaveBeenCalledWith({
        where: { issue_id: issueId },
        defaults: {
          issue_id: issueId,
          delayed_days: 3,
          fine_amount: 30,
          paid_status: false,
        },
      });

      jest.useRealTimers();
    });

    // ✨ NEW TEST CASE FOR LINES 126-132: Handles pre-existing fine updates
    it("⚠️ Should update or handle an existing fine record if fine is already initialized", async () => {
      jest.useFakeTimers();
      const now = new Date('2026-01-05T12:00:00Z');
      jest.setSystemTime(now);

      const pastDueDate = new Date('2026-01-02T12:00:00Z'); 

      jest.spyOn(issueRepository, "findIssueById").mockResolvedValue({
        issue_id: issueId,
        book_id: bookId,
        due_date: pastDueDate,
        returned_date: null,
      } as any);
      
      jest.spyOn(issueRepository, "returnBook").mockResolvedValue({ issue_id: issueId, returned_date: now } as any);
      jest.spyOn(Book, "findByPk").mockResolvedValue({ book_id: bookId, available_copies: 2 } as any);
      jest.spyOn(Book, "update").mockResolvedValue([1]);
      
      // Mock fine to return created = false (Fine already exists in database)
     const mockExistingFine = { 
  update: jest.fn<() => Promise<any>>().mockResolvedValue({}) 
};
      jest.spyOn(Fine, "findOrCreate").mockResolvedValue([mockExistingFine as any, false]);

      await issueService.returnBook(issueId);

      expect(Fine.findOrCreate).toHaveBeenCalled();
      jest.useRealTimers();
    });
  });

  // ==========================================
  // 📘 3. getMemberIssues() Scenarios
  // ==========================================
  describe("getMemberIssues", () => {
    it("✅ Should safely call repository mapping to compile issue lists", async () => {
      const sampleIssues = [{ issue_id: "1" }, { issue_id: "2" }];
      jest.spyOn(issueRepository, "getMemberIssues").mockResolvedValue(sampleIssues as any);

      const result = await issueService.getMemberIssues("member-123");

      expect(issueRepository.getMemberIssues).toHaveBeenCalledWith("member-123");
      expect(result).toEqual(sampleIssues);
    });
  });
});