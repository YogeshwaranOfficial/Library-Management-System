import httpStatus from "http-status-codes";

import AppError from "../../utils/AppError.js";
import { CreationAttributes } from "sequelize";
import Member from "../../database/models/Member.js";
import Book from "../../database/models/Book.js";
import Fine from "../../database/models/Fine.js";

import issueRepository from "./issue.repository.js";

class IssueService {
  async borrowBook(
    member_id: string,
    book_id: string
  ) {
    const member = await Member.findByPk(member_id);

    if (!member) {
      throw new AppError(       
        "Member not found", httpStatus.NOT_FOUND
      );
    }

    if (member.membership_status !== "ACTIVE") {
      throw new AppError(        
        "Membership expired",httpStatus.BAD_REQUEST
      );
    }

    const book = await Book.findByPk(book_id);

    if (!book) {
      throw new AppError(
        "Book not found", httpStatus.NOT_FOUND
      );
    }

    if (book.available_copies <= 0) {
      throw new AppError(
        "Book unavailable", httpStatus.BAD_REQUEST
      );
    }

    const existingIssue =
      await issueRepository.getActiveIssue(
        member_id,
        book_id
      );

    if (existingIssue) {
      throw new AppError(
        "Book already borrowed",httpStatus.BAD_REQUEST
      );
    }

    const due_date = new Date();

    due_date.setDate(due_date.getDate() + 14);

    const issue =
      await issueRepository.createIssue({
        member_id,
        book_id,
        due_date,
      });

    await Book.update(
      {
        available_copies:
          book.available_copies - 1,

        lending_count:
          book.lending_count + 1,
      },
      {
        where: {
          book_id,
        },
      }
    );

    return issue;
  }

  async returnBook(issue_id: string) {
    const issue =
      await issueRepository.findIssueById(issue_id);

    if (!issue) {
      throw new AppError(      
        "Issue record not found",  httpStatus.NOT_FOUND
      );
    }

    if (issue.returned_date) {
      throw new AppError(     
        "Book already returned", httpStatus.BAD_REQUEST
      );
    }

    const returned_date = new Date();

    const updatedIssue =
      await issueRepository.returnBook(
        issue_id,
        returned_date
      );

    const book = await Book.findByPk(issue.book_id);

    if (book) {
      await Book.update(
        {
          available_copies:
            book.available_copies + 1,
        },
        {
          where: {
            book_id: issue.book_id,
          },
        }
      );
    }

    const dueDate = new Date(issue.due_date);

    if (returned_date > dueDate) {
      const difference =
        returned_date.getTime() -
        dueDate.getTime();

      const delayed_days = Math.ceil(
        difference / (1000 * 60 * 60 * 24)
      );

      const fine_amount =
        delayed_days * 10;

      await Fine.create({
        issue_id: issue.issue_id,
        delayed_days,
        fine_amount,
      } as CreationAttributes<Fine>); //
    }

    return updatedIssue;
  }

  async getMemberIssues(member_id: string) {
    return issueRepository.getMemberIssues(
      member_id
    );
  }
}

export default new IssueService();