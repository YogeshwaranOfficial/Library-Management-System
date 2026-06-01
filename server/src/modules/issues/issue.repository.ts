import Issue from "../../database/models/Issue.js";
import { CreationAttributes } from "sequelize";

class IssueRepository {
  // 💻 FIX: Expanded types to accept borrowed_date and status assignment
  async createIssue(data: {
    member_id: string;
    book_id: string;
    borrowed_date: Date;
    due_date: Date;
  }) {
    return Issue.create({
      ...data,
      issue_status: "BORROWED" // Explicitly tracking current status
    } as CreationAttributes<Issue>);
  }

  async findIssueById(issue_id: string) {
    return Issue.findByPk(issue_id);
  }

  async getActiveIssue(member_id: string, book_id: string) {
    return Issue.findOne({
      where: {
        member_id,
        book_id,
        returned_date: null,
      },
    });
  }

  async returnBook(issue_id: string, returned_date: Date) {
    // 💻 FIX: Update both returned_date AND status enum flags cleanly together
    await Issue.update(
      {
        returned_date,
        issue_status: "RETURNED",
      },
      {
        where: {
          issue_id,
        },
      }
    );

    return this.findIssueById(issue_id);
  }

  async getMemberIssues(member_id: string) {
    return Issue.findAll({
      where: {
        member_id,
      },
      order: [["created_at", "DESC"]],
    });
  }
}

export default new IssueRepository();