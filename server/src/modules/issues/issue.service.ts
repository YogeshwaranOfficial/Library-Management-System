import httpStatus from "http-status-codes";
import { CreationAttributes } from "sequelize";

import AppError from "../../utils/AppError.js";
import Member from "../../database/models/Member.js";
import Book from "../../database/models/Book.js";
import Fine from "../../database/models/Fine.js";
import Issue from "../../database/models/Issue.js";
import MembershipPlan from "../../database/models/MembershipPlan.js";
import { sequelize } from "../../database/index.js";

import issueRepository from "./issue.repository.js";

class IssueService {

  async getAllIssuesFeed() {
    const records = await issueRepository.getAllIssuesDetailed();

    return records.map((record: any) => {
      const formatIso = (dateVal: any) =>
        dateVal ? new Date(dateVal).toISOString().split("T")[0] : null;

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

    const plan = (memberProfile as any).membership_plan;
    const maxAllowed = plan ? plan.max_books_allowed : 0;

    return {
      currentBorrows: activeBorrowsCount,
      maxAllowed: maxAllowed
    };
  }

  async borrowBook(payload: { memberId: string; bookId: string; borrowDate?: string; dueDate: string }) {
    const { memberId: member_id, bookId: book_id, borrowDate, dueDate } = payload;

    return await sequelize.transaction(async (t) => {
      const member = await Member.findByPk(member_id, {
        include: [
          {
            model: MembershipPlan,
            as: "membership_plan",
          },
        ],
        transaction: t
      });

      if (!member) {
        throw new AppError("Member not found", httpStatus.NOT_FOUND);
      }

      if (member.membership_status !== "ACTIVE") {
        throw new AppError("Membership is not active", httpStatus.BAD_REQUEST);
      }

      const plan = (member as any).membership_plan; 
      if (!plan) {
        throw new AppError("No membership plan associated with this account", httpStatus.BAD_REQUEST);
      }

      const allowedLimit = plan.max_books_allowed;
      const planName = plan.plan_name || "Current";

      const activeIssuesCount = await Issue.count({
        where: { member_id, returned_date: null },
        transaction: t
      });

      if (activeIssuesCount >= allowedLimit) {
        throw new AppError(
          `Borrow limit reached. Your ${planName} plan only allows up to ${allowedLimit} books out at a time.`,
          httpStatus.BAD_REQUEST
        );
      }

      const book = await Book.findByPk(book_id, { 
        lock: t.LOCK.UPDATE,
        transaction: t 
      });

      if (!book) {
        throw new AppError("Book not found", httpStatus.NOT_FOUND);
      }

      if (book.available_copies <= 0) {
        throw new AppError("Book unavailable in current inventory slots", httpStatus.BAD_REQUEST);
      }

      const existingIssue = await issueRepository.getActiveIssue(member_id, book_id, { transaction: t });
      if (existingIssue) {
        throw new AppError("Book already borrowed and not returned yet", httpStatus.BAD_REQUEST);
      }

      const borrowed_date = borrowDate ? new Date(borrowDate) : new Date(); 
      const due_date = new Date(dueDate);

      const issue = await issueRepository.createIssue({
        member_id,
        book_id,
        borrowed_date,
        due_date,
      }, { transaction: t });

      await book.decrement("available_copies", { by: 1, transaction: t });
      await book.increment("lending_count", { by: 1, transaction: t });

      return issue;
    });
  }

  async returnBook(issue_id: string, returnedDateString?: string) {
    return await sequelize.transaction(async (t) => {
      const issue = await issueRepository.findIssueById(issue_id, { transaction: t });

      if (!issue) {
        throw new AppError("Issue record not found", httpStatus.NOT_FOUND);
      }

      if (issue.returned_date) {
        throw new AppError("Book already returned", httpStatus.BAD_REQUEST);
      }

      const returned_date = returnedDateString ? new Date(returnedDateString) : new Date();
      
      const updatedIssue = await issueRepository.returnBook(issue_id, returned_date, { transaction: t });

      const book = await Book.findByPk(issue.book_id, { transaction: t });
      if (book) {
        await book.increment("available_copies", { by: 1, transaction: t });
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
          } as CreationAttributes<Fine>,
          transaction: t
        });
      }

      return updatedIssue;
    });
  }

  async getMemberIssues(member_id: string) {
    return issueRepository.getMemberIssues(member_id);
  }

  // ✨ ADVANCED PARAMETER HANDLER: Cleanly placed inside the class block with Restoration/Undo mechanisms
  async updateIssueParameters(
    issue_id: string,
    payload: { 
      memberId: string; 
      bookId: string; 
      borrowDate?: string; 
      dueDate: string; 
      status?: string; 
      returnedDate?: string | null 
    }
  ) {
    return await sequelize.transaction(async (t) => {
      const issue = await issueRepository.findIssueById(issue_id, { transaction: t });
      if (!issue) {
        throw new AppError("Issue asset context instance not found", httpStatus.NOT_FOUND);
      }

      // 🔄 CHECK: Is this an UNDO action triggering from the ReturnedBooks page?
      if (issue.issue_status === "RETURNED" && payload.status === "BORROWED") {
        const book = await Book.findByPk(issue.book_id, { lock: t.LOCK.UPDATE, transaction: t });
        if (!book) {
          throw new AppError("Associated book inventory asset missing.", httpStatus.NOT_FOUND);
        }
        if (book.available_copies <= 0) {
          throw new AppError("Cannot undo! This book's shelf slot is fully allocated right now.", httpStatus.BAD_REQUEST);
        }

        // Recalculate dynamic recovery state based on original due target parameters
        const isPastDue = new Date() > new Date(issue.due_date);
        const dynamicRestoredStatus = isPastDue ? "OVERDUE" : "BORROWED";

        // Deduct copy count back out from availability matrix
        await book.decrement("available_copies", { by: 1, transaction: t });

        // Erase any accidental structural fines compiled for this issue ID
        await Fine.destroy({ where: { issue_id }, transaction: t });

        return await issueRepository.updateIssue(issue_id, {
          member_id: payload.memberId || issue.member_id,
          book_id: payload.bookId || issue.book_id,
          borrowed_date: payload.borrowDate ? new Date(payload.borrowDate) : issue.borrowed_date,
          due_date: new Date(payload.dueDate || issue.due_date),
          issue_status: dynamicRestoredStatus,
          returned_date: null
        }, { transaction: t });
      }

      // Standard operational safety checks for standard updates
      if (issue.issue_status === "RETURNED" && !payload.status) {
        throw new AppError("Cannot change data parameters of a closed transactional history log.", httpStatus.BAD_REQUEST);
      }

      return await issueRepository.updateIssue(issue_id, {
        member_id: payload.memberId,
        book_id: payload.bookId,
        borrowed_date: payload.borrowDate ? new Date(payload.borrowDate) : issue.borrowed_date,
        due_date: new Date(payload.dueDate)
      }, { transaction: t });
    });
  }

  // Permanent single records log erasure hook
  async deleteSingleIssue(issue_id: string) {
    return await sequelize.transaction(async (t) => {
      const issue = await issueRepository.findIssueById(issue_id, { transaction: t });
      if (!issue) {
        throw new AppError("Issue log element not found", httpStatus.NOT_FOUND);
      }

      if (!issue.returned_date) {
        const book = await Book.findByPk(issue.book_id, { transaction: t });
        if (book) {
          await book.increment("available_copies", { by: 1, transaction: t });
        }
      }

      await Fine.destroy({ where: { issue_id }, transaction: t });
      return await issueRepository.deleteIssueById(issue_id, { transaction: t });
    });
  }

  // Wipes out entire batch log matrices for returned histories
  async clearAllReturnedHistory() {
    return await sequelize.transaction(async (t) => {
      const completedIssues = await Issue.findAll({
        where: { issue_status: "RETURNED" },
        attributes: ["issue_id"],
        transaction: t
      });

      const ids = completedIssues.map((rec) => rec.issue_id);
      if (ids.length === 0) return 0;

      await Fine.destroy({ where: { issue_id: ids }, transaction: t });
      return await issueRepository.deleteManyIssues(ids, { transaction: t });
    });
  }
} // 👈 Class scope correctly terminates here

const issueService = new IssueService();
export default issueService;