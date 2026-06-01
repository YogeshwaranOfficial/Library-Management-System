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
  async borrowBook(member_id: string, book_id: string) {
    const member = await Member.findByPk(member_id, {
      include: [
        {
          model: MembershipPlan,
          as: "membership_plan",
        },
      ],
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

    const allowedLimit = plan.max_books; 
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
      throw new AppError("Book unavailable", httpStatus.BAD_REQUEST);
    }

    const existingIssue = await issueRepository.getActiveIssue(member_id, book_id);

    if (existingIssue) {
      throw new AppError("Book already borrowed and not returned yet", httpStatus.BAD_REQUEST);
    }

    const borrowed_date = new Date(); // 💻 FIX: Define transaction date
    const due_date = new Date();
    due_date.setDate(due_date.getDate() + 14);

    // 💻 FIX: Pass the borrowed_date down to repository layer
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

  async returnBook(issue_id: string) {
    const issue = await issueRepository.findIssueById(issue_id);

    if (!issue) {
      throw new AppError("Issue record not found", httpStatus.NOT_FOUND);
    }

    if (issue.returned_date) {
      throw new AppError("Book already returned", httpStatus.BAD_REQUEST);
    }

    const returned_date = new Date();

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

      // 💻 FIX: Uses findOrCreate to prevent SequelizeUniqueConstraintError 
      // if seed data already maps an initial fine entry against this issue_id
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