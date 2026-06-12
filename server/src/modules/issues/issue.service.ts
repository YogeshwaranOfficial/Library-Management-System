import httpStatus from "http-status-codes";
import { CreationAttributes, Op } from "sequelize";

import AppError from "../../utils/AppError.js";
import Member from "../../database/models/Member.js";
import Book from "../../database/models/Book.js";
import Fine from "../../database/models/Fine.js";
import Issue from "../../database/models/Issue.js";
import MembershipPlan from "../../database/models/MembershipPlan.js";
import { sequelize } from "../../database/index.js";

import issueRepository from "./issue.repository.js";

class IssueService {
  /**
   * 🟢 PRIVATE HELPER: Evaluates real-time state and updates database status if shifted.
   * Ensures the database matches operational truth automatically.
   */
  private async reconcileAndGetStatus(recordId: string, currentStatus: string, dueDate: Date): Promise<string> {
    if (currentStatus === "RETURNED") return "RETURNED";

    const isPastDue = new Date() > new Date(dueDate);
    const calculatedStatus = isPastDue ? "OVERDUE" : "BORROWED";

    if (currentStatus !== calculatedStatus) {
      await Issue.update(
        { issue_status: calculatedStatus },
        { where: { issue_id: recordId } }
      );
      return calculatedStatus;
    }

    return currentStatus;
  }

  // 1. Get Main Circulation Feed Logs (With Fine Context Injected Directly)
  async getAllIssuesFeed(): Promise<any> {
    const records = await issueRepository.getAllIssuesDetailed();

    return Promise.all(
      records.map(async (record: any) => {
        const formatIso = (dateVal: any) =>
          dateVal ? new Date(dateVal).toISOString().split("T")[0] : null;

        // Force synchronous real-time validation check straight down to the database row
        const sourceOfTruthStatus = await this.reconcileAndGetStatus(
          record.issue_id,
          record.issue_status,
          record.due_date
        );

        const memberInfo = record.member;
        const userInfo = memberInfo?.user;
        const bookInfo = record.book;

        // 🟢 Fetch associated fine directly from DB to enrich the payload mapping
        const fineRecord = await Fine.findOne({ where: { issue_id: record.issue_id } });

        // 🟢 ALL FIELDS RESTORED - This will perfectly return everything to the frontend now!
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
          status: sourceOfTruthStatus, // Sent directly as source-of-truth status to client UI
          
          // 🟢 ENRICHMENT FOR FRONTEND CHECKS:
          fineAmount: fineRecord ? fineRecord.fine_amount : 0,
          finePaidStatus: fineRecord ? fineRecord.paid_status : false,
        };
      })
    );
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
        include: [{ model: MembershipPlan, as: "membership_plan" }],
        transaction: t
      });

      if (!member) throw new AppError("Member not found", httpStatus.NOT_FOUND);
      if (member.membership_status !== "ACTIVE") throw new AppError("Membership is not active", httpStatus.BAD_REQUEST);

      const plan = (member as any).membership_plan; 
      if (!plan) throw new AppError("No membership plan associated with this account", httpStatus.BAD_REQUEST);

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

      const book = await Book.findByPk(book_id, { lock: t.LOCK.UPDATE, transaction: t });
      if (!book) throw new AppError("Book not found", httpStatus.NOT_FOUND);
      if (book.available_copies <= 0) throw new AppError("Book unavailable in current inventory slots", httpStatus.BAD_REQUEST);

      const existingIssue = await issueRepository.getActiveIssue(member_id, book_id, { transaction: t });
      if (existingIssue) throw new AppError("Book already borrowed and not returned yet", httpStatus.BAD_REQUEST);

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

      if (!issue) throw new AppError("Issue record not found", httpStatus.NOT_FOUND);
      if (issue.returned_date) throw new AppError("Book already returned", httpStatus.BAD_REQUEST);

      const returned_date = returnedDateString ? new Date(returnedDateString) : new Date();
      const dueDate = new Date(issue.due_date);

      if (returned_date > dueDate) {
        const associatedFine = await Fine.findOne({ where: { issue_id }, transaction: t });

        if (!associatedFine) {
          const difference = returned_date.getTime() - dueDate.getTime();
          const delayed_days = Math.ceil(difference / (1000 * 60 * 60 * 24));
          const fine_amount = delayed_days * 10;

          await Fine.create({
            issue_id: issue.issue_id,
            delayed_days,
            fine_amount,
            paid_status: false,
          } as CreationAttributes<Fine>, { transaction: t });

          throw new AppError(
            "Return Blocked: This book tracking log is past due. An active fine has been computed. Settle payment in fines dashboard to close checkout.",
            httpStatus.FORBIDDEN
          );
        }

        if (associatedFine && !associatedFine.paid_status) {
          throw new AppError(
            "Return Blocked: Outstanding fine detected for this volume checkout sequence. Process cash registration balances first.",
            httpStatus.FORBIDDEN
          );
        }
      }

      const updatedIssue = await issueRepository.returnBook(issue_id, returned_date, { transaction: t });

      const book = await Book.findByPk(issue.book_id, { transaction: t });
      if (book) {
        await book.increment("available_copies", { by: 1, transaction: t });
      }

      return updatedIssue;
    });
  }

  async getMemberIssues(member_id: string) {
    return issueRepository.getMemberIssues(member_id);
  }

  // 4. Update Settings (Includes Robust Integrated Return Undo Framework Engine)
  async updateIssueParameters(
    issue_id: string,
    payload: { 
      memberId?: string; 
      bookId?: string; 
      borrowDate?: string; 
      dueDate?: string; 
      status?: string; 
      returnedDate?: string | null 
    }
  ) {
    return await sequelize.transaction(async (t) => {
      const issue = await issueRepository.findIssueById(issue_id, { transaction: t });
      if (!issue) {
        throw new AppError("Issue asset context instance not found", httpStatus.NOT_FOUND);
      }

      /* -------------------------------------------------------------------------- */
      /* 🔄 DUAL-COMPLIANT REVERT RETURN LOGIC ACTIVATION                            */
      /* -------------------------------------------------------------------------- */
      if (issue.issue_status === "RETURNED" && payload.status === "BORROWED") {
        const book = await Book.findByPk(issue.book_id, { lock: t.LOCK.UPDATE, transaction: t });
        if (!book) throw new AppError("Associated book inventory asset missing.", httpStatus.NOT_FOUND);
        
        // Decrement available shelf inventory because the book is moving back out of the library
        if (book.available_copies <= 0) {
          throw new AppError("Cannot undo! This book's shelf slot is fully allocated right now.", httpStatus.BAD_REQUEST);
        }
        await book.decrement("available_copies", { by: 1, transaction: t });

        // 🧠 Dynamically calculate corrected status based on target date vs today
        const targetDueDate = payload.dueDate ? new Date(payload.dueDate) : new Date(issue.due_date);
        const dynamicRestoredStatus = new Date() > targetDueDate ? "OVERDUE" : "BORROWED";

        // 🟢 FIX: Update fine row instead of running Fine.destroy()
        const existingFine = await Fine.findOne({ where: { issue_id }, transaction: t });
        if (existingFine) {
          await existingFine.update({
            paid_status: false,
            paid_date: null,
            payment_method: null as any
          }, { transaction: t });
        }

        return await issueRepository.updateIssue(issue_id, {
          member_id: payload.memberId || issue.member_id,
          book_id: payload.bookId || issue.book_id,
          borrowed_date: payload.borrowDate ? new Date(payload.borrowDate) : issue.borrowed_date,
          due_date: targetDueDate,
          issue_status: dynamicRestoredStatus,
          returned_date: null // Wipe timestamp marker row
        }, { transaction: t });
      }

      if (issue.issue_status === "RETURNED" && !payload.status) {
        throw new AppError("Cannot change data parameters of a closed transactional history log.", httpStatus.BAD_REQUEST);
      }

     // 📈 DYNAMIC EXTENSION STATE HANDLING
      const finalTargetDueDate = payload.dueDate ? new Date(payload.dueDate) : new Date(issue.due_date);
      
      // Strip time from both objects for an accurate comparison check
      const today = new Date();
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const targetDueDateMidnight = new Date(finalTargetDueDate.getFullYear(), finalTargetDueDate.getMonth(), finalTargetDueDate.getDate());

      const isNowSafe = targetDueDateMidnight >= todayMidnight;
      const recalculatedStatus = isNowSafe ? "BORROWED" : "OVERDUE";

      if (isNowSafe) {
        await Fine.destroy({ where: { issue_id, paid_status: false }, transaction: t });
      }
      
      return await issueRepository.updateIssue(issue_id, {
        member_id: payload.memberId || issue.member_id,
        book_id: payload.bookId || issue.book_id,
        borrowed_date: payload.borrowDate ? new Date(payload.borrowDate) : issue.borrowed_date,
        due_date: finalTargetDueDate,
        issue_status: recalculatedStatus 
      }, { transaction: t });
    });
  }

  async deleteSingleIssue(issue_id: string) {
    return await sequelize.transaction(async (t) => {
      const issue = await issueRepository.findIssueById(issue_id, { transaction: t });
      if (!issue) throw new AppError("Issue log element not found", httpStatus.NOT_FOUND);

      if (!issue.returned_date) {
        const book = await Book.findByPk(issue.book_id, { transaction: t });
        if (book) await book.increment("available_copies", { by: 1, transaction: t });
      }

      await Fine.destroy({ where: { issue_id }, transaction: t });
      return await issueRepository.deleteIssueById(issue_id, { transaction: t });
    });
  }

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
}

const issueService = new IssueService();
export default issueService;