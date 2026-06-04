import Issue from "../../database/models/Issue.js";
import Member from "../../database/models/Member.js";
import User from "../../database/models/User.js";
import Book from "../../database/models/Book.js";
import MembershipPlan from "../../database/models/MembershipPlan.js";
import { CreationAttributes } from "sequelize";

class IssueRepository {
  
  // 1. Create a brand new loan voucher
  async createIssue(data: {
    member_id: string;
    book_id: string;
    borrowed_date: Date;
    due_date: Date;
  }) {
    return Issue.create({
      ...data,
      issue_status: "BORROWED"
    } as CreationAttributes<Issue>);
  }

  // 2. Modify parameters of an existing active loan (For PUT /issues/:id)
  // 🛡️ FIX: Removed UpdateAttributes import, typed data object natively
  async updateIssue(
    issue_id: string, 
    data: { member_id: string; book_id: string; due_date: Date }
  ) {
    await Issue.update(data, { 
      where: { issue_id } 
    });
    return this.findIssueById(issue_id);
  }

  // 3. Find a single issue record by primary key
  async findIssueById(issue_id: string) {
    return Issue.findByPk(issue_id);
  }

  // 4. Check for an active duplicate loan
  async getActiveIssue(member_id: string, book_id: string) {
    return Issue.findOne({
      where: {
        member_id,
        book_id,
        returned_date: null,
      },
    });
  }

  // 5. Check-in/Return a book
  // 🛡️ FIX: Force cast the update body to any or force date object transformation 
  // to satisfy the strict model definition 'CreationOptional<Date | null>'
  async returnBook(issue_id: string, returned_date: Date | string) {
    const finalDate = typeof returned_date === "string" ? new Date(returned_date) : returned_date;

    await Issue.update(
      {
        returned_date: finalDate,
        issue_status: "RETURNED",
      },
      {
        where: { issue_id },
      }
    );
    return this.findIssueById(issue_id);
  }

 // 6. Main Feed Endpoint Query
  async getAllIssuesDetailed() {
    return Issue.findAll({
      include: [
        {
          model: Member,
          as: "member", // ✅ Verified matching associations file
          attributes: ["member_id"],
          include: [
            {
              model: User,
              as: "user", // ✅ Verified matching associations file
              attributes: ["name", "gmail", "phone_number"],
            }
          ]
        },
        {
          model: Book,
          as: "book", // ✅ Verified matching associations file
          attributes: ["book_id", "book_name", "book_author"],
        }
      ],
      order: [["created_at", "DESC"]],
    });
  }

  // 7. Allowance Metrics Query
  async getMemberAllowanceData(member_id: string) {
    const activeBorrowsCount = await Issue.count({
      where: {
        member_id,
        returned_date: null
      }
    });

    const memberProfile = await Member.findByPk(member_id, {
      attributes: ["membership_status", "expiry_date"],
      include: [
        {
          model: MembershipPlan,
          as: "membership_plan" // ✅ Verified matching associations file
        }
      ]
    });

    return {
      activeBorrowsCount,
      memberProfile
    };
  }

  async getMemberIssues(member_id: string) {
  return Issue.findAll({
    where: { member_id },
    order: [["created_at", "DESC"]],
  });
}
}

export default new IssueRepository();