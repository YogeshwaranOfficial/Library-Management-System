import { Op, fn, col, literal } from "sequelize";

import Book from "../../database/models/Book.js";
import Fine from "../../database/models/Fine.js";
import Issue from "../../database/models/Issue.js";
import Member from "../../database/models/Member.js";
import User from "../../database/models/User.js";

class DashboardRepository {
  async getOverview() {
    const [
      totalBooks,
      totalMembers,
      activeMembers,
      expiredMembers,
      issuedBooks,
      returnedBooks,
      overdueBooks,
      unpaidFines,
    ] = await Promise.all([
      Book.count(),

      Member.count(),

      Member.count({
        where: {
          membership_status: "ACTIVE",
        },
      }),

      Member.count({
        where: {
          membership_status: "EXPIRED",
        },
      }),

      Issue.count(),

      Issue.count({
        where: {
          returned_date: {
            [Op.not]: null,
          },
        },
      }),

      Issue.count({
        where: {
          returned_date: null,
          due_date: {
            [Op.lt]: new Date(),
          },
        },
      }),

      Fine.sum("fine_amount", {
        where: {
          paid_status: "UNPAID",
        },
      }),
    ]);

    return {
      totalBooks,
      totalMembers,
      activeMembers,
      expiredMembers,
      issuedBooks,
      returnedBooks,
      overdueBooks,
      unpaidFines: unpaidFines || 0,
    };
  }

  async getPopularBooks() {
    return Book.findAll({
      attributes: [
        "book_id",
        "book_name",
        "lending_count",
      ],

      order: [["lending_count", "DESC"]],

      limit: 5,
    });
  }

  async getRecentIssues() {
    return Issue.findAll({
      limit: 10,

      order: [["created_at", "DESC"]],

      include: [
        {
          model: Member,
          as: "member",

          include: [
            {
              model: User,
              as: "user",

              attributes: ["name"],
            },
          ],
        },

        {
          model: Book,
          as: "book",

          attributes: ["book_name"],
        },
      ],
    });
  }

  async getMonthlyFineCollection() {
    return Fine.findAll({
      attributes: [
        [fn("DATE_TRUNC", "month", col("created_at")), "month"],
        [fn("SUM", col("fine_amount")), "total"],
      ],

      group: ["month"],

      order: [[literal("month"), "ASC"]],
    });
  }
}

export default new DashboardRepository();