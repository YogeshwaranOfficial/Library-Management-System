import { Op, Sequelize } from "sequelize";
import Member from "../../database/models/Member.js"; // Adjust paths to match your project root
import Book from "../../database/models/Book.js";
import Issue from "../../database/models/Issue.js";
import Fine from "../../database/models/Fine.js";
import User from "../../database/models/User.js"

export interface ReportQueryParams {
  pivot: "NONE" | "MEMBER" | "BOOK";
  primaryId: string;
  secondaryId?: string;
  duration: string;
}

export interface DependentOptionsParams {
  pivot: "NONE" | "MEMBER" | "BOOK";
  primaryId: string;
}

export class ReportRepository {

  /**
   * ✅ NEW METHOD: Pulls dynamic dependent lookup options.
   * If a Member is chosen as Step 1, it returns ONLY the books they have actually interacted with.
   * If a Book is chosen as Step 1, it returns ONLY the members who have interacted with it.
   */
  async getDependentOptions(params: DependentOptionsParams) {
  const { pivot, primaryId } = params;

  if (!primaryId || pivot === "NONE") {
    return [];
  }

  if (pivot === "MEMBER") {
    // Step 1 selected a Member -> Find all unique books this member has in their issue log
    const uniqueIssues = await Issue.findAll({
      where: { member_id: primaryId },
      include: [
        {
          model: Book,
          as: "book",
          attributes: ["book_id", "book_name", "book_author"],
        },
      ],
      // 1. Explicitly point to the column on the parent table using an array syntax pairing to avoid ambiguity
      attributes: [[Sequelize.col("Issue.book_id"), "book_id"]],
      // 2. Map group clauses to exactly match the target SQL schema fields compiled by Sequelize
      group: [
        "Issue.book_id", 
        "book.book_id", 
        "book.book_name", 
        "book.book_author"
      ],
    });

    return uniqueIssues
      .filter((issue: any) => issue.book)
      .map((issue: any) => ({
        id: issue.book.book_id,
        name: issue.book.book_name,
        subtext: issue.book.book_author,
      }));
  } else {
    // Step 1 selected a Book -> Find all unique members who have ever borrowed this specific book
    const uniqueIssues = await Issue.findAll({
      where: { book_id: primaryId },
      include: [
        {
          model: Member,
          as: "member",
          attributes: ["member_id"],
          include: [
            {
              model: User,
              as: "user", 
              attributes: ["name", "phone_number"],
            },
          ],
        },
      ],
      // 1. Explicitly point to the column on the parent table using an array syntax pairing to avoid ambiguity
      attributes: [[Sequelize.col("Issue.member_id"), "member_id"]],
      // 2. Map group clauses to exactly match the target SQL schema fields compiled by Sequelize
      group: [
        "Issue.member_id", 
        "member.member_id", 
        "member->user.uuid", // Make sure this references your User primary key column name (uuid or id)
        "member->user.name", 
        "member->user.phone_number"
      ],
    });

    return uniqueIssues
      .filter((issue: any) => issue.member)
      .map((issue: any) => ({
        id: issue.member.member_id,
        name: issue.member.user?.name || "Unknown Member",
        subtext: issue.member.user?.phone_number || "",
      }));
  }
}

  /**
   * Generates a structural transaction matrix matching runtime user selections.
   */

async generateDynamicReport(params: ReportQueryParams) {
  const { pivot, primaryId, secondaryId, duration } = params;

  // 1. Build a localized date window filter matching the statement period
  const todayString = new Date().toISOString().split("T")[0];
  let dateFilterClause: any = {};

  if (duration === "WEEKLY") {
    // Last 7 days
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);
    dateFilterClause = { borrowed_date: { [Op.gte]: pastDate.toISOString().split("T")[0] } };
  } else if (duration === "MONTHLY") {
    // Last 30 days
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);
    dateFilterClause = { borrowed_date: { [Op.gte]: pastDate.toISOString().split("T")[0] } };
  } else if (duration === "YEARLY") {
    // Last 365 days
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    dateFilterClause = { borrowed_date: { [Op.gte]: pastDate.toISOString().split("T")[0] } };
  }

  // 2. Pivot Processing Split Logic
  if (pivot === "MEMBER") {
    const profileHeader = await Member.findOne({
      where: { member_id: primaryId },
      include: [{ model: User, as: "user", attributes: ["name", "gmail", "phone_number"] }],
    });

    const issueWhere: any = { 
      member_id: primaryId,
      ...dateFilterClause 
    };
    if (secondaryId) {
      issueWhere.book_id = secondaryId; // Filter down if cross-referenced title chosen
    }

    const issues = await Issue.findAll({
      where: issueWhere,
      include: [
        { model: Book, as: "book", attributes: ["book_name", "book_author"] },
        { model: Fine, as: "fine", attributes: ["fine_amount"] }
      ],
      order: [["borrowed_date", "DESC"]],
    });

    return { pivot, duration, profile: profileHeader, records: issues };

  } else {
    // ----------------------------------------------------------------
    // 🚀 FIXED PIVOT === "BOOK" OPERATIONS SEGMENT
    // ----------------------------------------------------------------
    
    // Explicitly grab the targeted Volume details as profile master block
    const profileHeader = await Book.findOne({
      where: { book_id: primaryId },
      attributes: ["book_id", "book_name", "book_author", "isbn"]
    });

    // Isolate lookup parameters safely, avoiding column cross-corruption collisions
    const issueWhere: any = {
      book_id: primaryId, // Explicitly scope parent ledger row parameters
      ...dateFilterClause
    };

    // If secondary cross-reference filter was applied, limit query strictly to that specific member
    if (secondaryId) {
      issueWhere.member_id = secondaryId;
    }

    const issues = await Issue.findAll({
      where: issueWhere,
      include: [
        {
          model: Member,
          as: "member",
          attributes: ["member_id"],
          include: [
            { model: User, as: "user", attributes: ["name", "gmail", "phone_number"] }
          ]
        },
        {
          model: Book,
          as: "book",
          attributes: ["book_name", "book_author"]
        },
        { 
          model: Fine, 
          as: "fine", 
          attributes: ["fine_amount"] 
        }
      ],
      order: [["borrowed_date", "DESC"]],
    });

    return {
      pivot,
      duration,
      profile: profileHeader,
      records: issues,
    };
  }
}
}