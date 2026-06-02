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
      overdueCount,
      fineAggregationResult,
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

      Fine.findOne({
        attributes: [
          [
            fn("COALESCE", fn("SUM", col("fine_amount")), 0), 
            "total_unpaid"
          ]
        ],
        where: {
          paid_status: false,
        },
        raw: true,
      }),
    ]);

    const unpaidFines = fineAggregationResult 
      ? Number((fineAggregationResult as any).total_unpaid) 
      : 0;

    // Professional Pattern: Return clean raw data parameters flat
    return {
      totalBooks,
      totalMembers,
      activeMembers,
      expiredMembers,
      issuedBooks,
      returnedBooks,
      overdueCount,
      unpaidFines,
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