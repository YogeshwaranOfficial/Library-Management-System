import { fn, col, Op } from "sequelize";
import Category from "../../database/models/Category.js";
import Book from "../../database/models/Book.js";
import Issue from "../../database/models/Issue.js"; // 💡 Corrected import from IssuedBook to Issue
import type { CreateCategoryDTO, UpdateCategoryDTO } from "./categories.types.js";

class CategoryRepository {
  /**
   * Compiles analytical metrics by leveraging Sequelize's built-in grouping 
   * and aggregation function matrices.
   */
  async getCategoriesWithMetrics(
  page: number,
  limit: number,
  search?: string,
  bookSort?: "NONE" | "HIGH_TO_LOW" | "LOW_TO_HIGH",
  borrowSort?: "NONE" | "HIGH_TO_LOW" | "LOW_TO_HIGH"
) {
  const offset = (page - 1) * limit;

  // Define the dynamic ordering rules based on aggregate metrics aliases
  let orderClause: any[] = [["category_name", "ASC"]]; // Default alphabetical sort
  if (bookSort && bookSort !== "NONE") {
    orderClause = [[fn("COUNT", fn("DISTINCT", col("books.book_id"))), bookSort === "HIGH_TO_LOW" ? "DESC" : "ASC"]];
  } else if (borrowSort && borrowSort !== "NONE") {
    orderClause = [[fn("COUNT", col("books->issues.issue_id")), borrowSort === "HIGH_TO_LOW" ? "DESC" : "ASC"]];
  }

  return Category.findAndCountAll({
    attributes: [
      "category_id",
      "category_name",
      "created_at",
      "updated_at",
      // 1. Total distinct book titles/entries under this category
      [fn("COUNT", fn("DISTINCT", col("books.book_id"))), "booksCount"],
      
      // 2. Total physical stock copies combined across all books in this category
      [fn("COALESCE", fn("SUM", col("books.total_copies")), 0), "totalCopies"],
      
      // 3. Total historical borrow/lending transactions
      [fn("COUNT", col("books->issues.issue_id")), "lendingCount"]
    ],
    where: {
      ...(search && {
        category_name: { [Op.iLike]: `%${search.trim()}%` }
      })
    },
    include: [
      {
        model: Book,
        as: "books",
        attributes: [],
        required: false,
        include: [
          {
            model: Issue,
            as: "issues",
            attributes: [],
            required: false
          }
        ]
      }
    ],
    group: ["Category.category_id"],
    order: orderClause,
    limit,
    offset,
    subQuery: false, // Prevents Sequelize from placing limit/offset inside a nested subquery wrapper which messes up joins
    raw: true
  });
}

  /**
   * Look up an existing profile match by name (case-insensitive)
   */
  async findByName(name: string) {
    return Category.findOne({
      where: {
        category_name: {
          [Op.iLike]: name.trim()
        }
      }
    });
  }

  /**
   * Locate an existing profile match by unique primary key identifier
   */
  async findById(id: string) {
    return Category.findByPk(id);
  }

  /**
   * Persists a new category row instance setup inside your schema layout
   */
  async createCategory(payload: CreateCategoryDTO) {
    // 💡 This is now completely type-safe thanks to CreationOptional!
    return Category.create({
      category_name: payload.category_name.trim()
    });
  }

  /**
   * Alters the name string criteria of an existing active entry slot
   */
  async updateCategoryName(id: string, payload: UpdateCategoryDTO) {
    await Category.update(
      { category_name: payload.category_name.trim() },
      { where: { category_id: id } }
    );
    return this.findById(id);
  }

  /**
   * Deletes an isolated category row index
   */
  async deleteCategory(id: string): Promise<boolean> {
    const affectedRows = await Category.destroy({
      where: { category_id: id }
    });
    return affectedRows > 0;
  }
}

export default new CategoryRepository();