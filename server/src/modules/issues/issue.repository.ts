import Issue from "../../database/models/Issue.js";
import Member from "../../database/models/Member.js";
import User from "../../database/models/User.js";
import Fine from "../../database/models/Fine.js";
import Book from "../../database/models/Book.js";
import MembershipPlan from "../../database/models/MembershipPlan.js";
import { CreationAttributes, Transaction } from "sequelize";

class IssueRepository {
  
  // Create a brand new record entry row
  async createIssue(
    data: {
      member_id: string;
      book_id: string;
      borrowed_date: Date;
      due_date: Date;
    },
    options?: { transaction?: Transaction }
  ) {
    return Issue.create(
      {
        ...data,
        issue_status: "BORROWED"
      } as CreationAttributes<Issue>,
      options
    );
  }

  // ✨ FIXED: Added optional string/date modifiers to prevent type parameters collision with PATCH handlers
  async updateIssue(
    issue_id: string, 
    data: { 
      member_id?: string;          // ✨ Made optional for partial PATCH operations
      book_id?: string;            // ✨ Made optional for partial PATCH operations
      borrowed_date?: Date; 
      due_date?: Date;             // ✨ Made optional for partial PATCH operations
      issue_status?: string;       // Can accept status updates (like BORROWED / OVERDUE on undo return)
      returned_date?: Date | null;  // Can accept date removals (wiping to null on undo return)
      
      // 🟢 NEW: Added type parameters matching your backend migrations
      condition?: string | null;
      damage_description?: string | null;
    },
    options?: { transaction?: Transaction }
  ) {
    await Issue.update(data, { 
      where: { issue_id },
      ...options
    });
    return this.findIssueById(issue_id, options);
  }

  // Allowed tracking down transaction isolations
  async findIssueById(issue_id: string, options?: { transaction?: Transaction }) {
    return Issue.findByPk(issue_id, options);
  }

  async getActiveIssue(member_id: string, book_id: string, options?: { transaction?: Transaction }) {
    return Issue.findOne({
      where: {
        member_id,
        book_id,
        returned_date: null,
      },
      ...options
    });
  }
  
  async returnBook(
  issue_id: string, 
  returned_date: Date | string, 
  book_condition: "GOOD" | "DAMAGED",
  damage_description?: string,
  options?: { transaction?: Transaction }
) {
  const finalDate = typeof returned_date === "string" ? new Date(returned_date) : returned_date;

  await Issue.update(
    {
      returned_date: finalDate,
      issue_status: "RETURNED",
      condition: book_condition,              // 🚀 Saved to column
      damage_description: damage_description || null // 🚀 Saved to column
    },
    {
      where: { issue_id },
      ...options
    }
  );
  return this.findIssueById(issue_id, options);
}

  async getAllIssuesDetailed() {
    return Issue.findAll({
      include: [
        {
          model: Member,
          as: "member",
          attributes: ["member_id"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["name", "gmail", "phone_number"],
            }
          ]
        },
        {
          model: Book,
          as: "book",
          attributes: ["book_id", "book_name", "book_author"],
        }
      ],
      order: [["created_at", "DESC"]],
    });
  }

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
          as: "membership_plan"
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

  // Delete a single record row permanently
  async deleteIssueById(issue_id: string, options?: { transaction?: Transaction }) {
    return await Issue.destroy({
      where: { issue_id },
      ...options
    });
  }

  // Delete multiple records at once (Batch cleanup operation)
  async deleteManyIssues(issue_ids: string[], options?: { transaction?: Transaction }) {
    return await Issue.destroy({
      where: { issue_id: issue_ids },
      ...options
    });
  }

  async hasActiveFine(issue_id: string, options?: { transaction?: Transaction }) {
    return await Fine.findOne({
      where: {
        issue_id,
        paid_status: false
      },
      ...options
    });
  }
}

export default new IssueRepository();