import httpStatus from "http-status-codes";
import { CreationAttributes } from "sequelize";

import AppError from "../../utils/AppError.js";
import Member from "../../database/models/Member.js";
import Book from "../../database/models/Book.js";
import Fine from "../../database/models/Fine.js";
import Issue from "../../database/models/Issue.js";
import MembershipPlan from "../../database/models/MembershipPlan.js";

import issueRepository from "./issue.repository.js";

class IssueService {

  async getAllIssuesFeed() {
    const records = await issueRepository.getAllIssuesDetailed();

    return records.map((record: any) => {
      const formatIso = (dateVal: any) =>
        dateVal ? new Date(dateVal).toISOString().split("T")[0] : null;

      // 🛡️ FIX: Accessing records via matching lowercase alias outputs
      const memberInfo = record.member; 
      const userInfo = memberInfo?.user; 
      const bookInfo = record.book; 

      return {
        id: record.issue_id,
        memberId: record.member_id,
        memberName: userInfo?.name || "Unknown Member",
        memberEmail: userInfo?.gmail || "",
        memberPhone: userInfo?.phone_number || "",
        bookId: record.book_id,
        bookTitle: bookInfo?.book_name || "Unknown Book",
        bookAuthor: bookInfo?.book_author || "Unknown Author",
        borrowedDate: formatIso(record.borrowed_date),
        dueDate: formatIso(record.due_date),
        returnedDate: formatIso(record.returned_date),
        status: record.issue_status,
      };
    });
  }

  async getMemberAllowanceMetrics(member_id: string) {
    const { activeBorrowsCount, memberProfile } = await issueRepository.getMemberAllowanceData(member_id);

    if (!memberProfile) {
      throw new AppError("Member record data not found", httpStatus.NOT_FOUND);
    }

    // 🛡️ FIX: Accessing the structural membership plan via lowercase property alias
    const plan = (memberProfile as any).membership_plan;
    const maxAllowed = plan ? plan.max_books_allowed : 0;

    return {
      currentBorrows: activeBorrowsCount,
      maxAllowed: maxAllowed
    };
  }

  // ✨ NEW: Updates existing parameters for the PUT request mutation handler
  async updateIssueParameters(
    issue_id: string,
    payload: { memberId: string; bookId: string; dueDate: string }
  ) {
    const issue = await issueRepository.findIssueById(issue_id);
    if (!issue) {
      throw new AppError("Issue asset context instance not found", httpStatus.NOT_FOUND);
    }

    if (issue.issue_status === "RETURNED") {
      throw new AppError("Cannot change data parameters of a closed transactional history log.", httpStatus.BAD_REQUEST);
    }

    // Convert date string safely into a JS Date object
    const updatedDueDate = new Date(payload.dueDate);

    return await issueRepository.updateIssue(issue_id, {
      member_id: payload.memberId,
      book_id: payload.bookId,
      due_date: updatedDueDate
    });
  }

  // Adjusted to use your real table names and parameters
  async borrowBook(payload: { memberId: string; bookId: string; dueDate: string }) {
    const { memberId: member_id, bookId: book_id, dueDate } = payload;

    const member = await Member.findByPk(member_id, {
      include: [
        {
          model: MembershipPlan,
        },
      ],
    });

    if (!member) {
      throw new AppError("Member not found", httpStatus.NOT_FOUND);
    }

    if (member.membership_status !== "ACTIVE") {
      throw new AppError("Membership is not active", httpStatus.BAD_REQUEST);
    }

    const plan = (member as any).MembershipPlan; 
    if (!plan) {
      throw new AppError("No membership plan associated with this account", httpStatus.BAD_REQUEST);
    }

    const allowedLimit = plan.max_books_allowed; // Correct column fix
    const planName = plan.plan_name || "Current";

    const activeIssuesCount = await Issue.count({
      where: {
        member_id,
        returned_date: null,
      },
    });

    if (activeIssuesCount >= allowedLimit) {
      throw new AppError(
        `Borrow limit reached. Your ${planName} plan only allows up to ${allowedLimit} books out at a time. (Currently borrowing: ${activeIssuesCount})`,
        httpStatus.BAD_REQUEST
      );
    }

    const book = await Book.findByPk(book_id);

    if (!book) {
      throw new AppError("Book not found", httpStatus.NOT_FOUND);
    }

    if (book.available_copies <= 0) {
      throw new AppError("Book unavailable in current inventory slots", httpStatus.BAD_REQUEST);
    }

    const existingIssue = await issueRepository.getActiveIssue(member_id, book_id);

    if (existingIssue) {
      throw new AppError("Book already borrowed and not returned yet", httpStatus.BAD_REQUEST);
    }

    const borrowed_date = new Date(); 
    const due_date = new Date(dueDate); // Explicitly trust frontend targeted date string bounds

    const issue = await issueRepository.createIssue({
      member_id,
      book_id,
      borrowed_date,
      due_date,
    });

    await Book.update(
      {
        available_copies: book.available_copies - 1,
        lending_count: book.lending_count + 1,
      },
      {
        where: { book_id },
      }
    );

    return issue;
  }

  // Adjusted checkout log updater with string/date structural handling
  async returnBook(issue_id: string, returnedDateString?: string) {
    const issue = await issueRepository.findIssueById(issue_id);

    if (!issue) {
      throw new AppError("Issue record not found", httpStatus.NOT_FOUND);
    }

    if (issue.returned_date) {
      throw new AppError("Book already returned", httpStatus.BAD_REQUEST);
    }

    // Fallback to current time if frontend does not send optional todayIso
    const returned_date = returnedDateString ? new Date(returnedDateString) : new Date();

    const updatedIssue = await issueRepository.returnBook(issue_id, returned_date);

    const book = await Book.findByPk(issue.book_id);

    if (book) {
      await Book.update(
        {
          available_copies: book.available_copies + 1,
        },
        {
          where: { book_id: issue.book_id },
        }
      );
    }

    const dueDate = new Date(issue.due_date);

    if (returned_date > dueDate) {
      const difference = returned_date.getTime() - dueDate.getTime();
      const delayed_days = Math.ceil(difference / (1000 * 60 * 60 * 24));
      const fine_amount = delayed_days * 10;

      await Fine.findOrCreate({
        where: { issue_id: issue.issue_id },
        defaults: {
          issue_id: issue.issue_id,
          delayed_days,
          fine_amount,
          paid_status: false, 
        } as CreationAttributes<Fine>
      });
    }

    return updatedIssue;
  }

  async getMemberIssues(member_id: string) {
    return issueRepository.getMemberIssues(member_id);
  }
}

export default new IssueService();