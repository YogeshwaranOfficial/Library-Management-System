import Issue from "../../database/models/Issue.js";
import { CreationAttributes } from "sequelize";
class IssueRepository {
  async createIssue(data: {
    member_id: string;
    book_id: string;
    due_date: Date;
  }) {
    return Issue.create(data as CreationAttributes<Issue>);
  }

  async findIssueById(issue_id: string) {
    return Issue.findByPk(issue_id);
  }

  async getActiveIssue(
    member_id: string,
    book_id: string
  ) {
    return Issue.findOne({
      where: {
        member_id,
        book_id,
        returned_date: null,
      },
    });
  }

  async returnBook(
    issue_id: string,
    returned_date: Date
  ) {
    await Issue.update(
      {
        returned_date,
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