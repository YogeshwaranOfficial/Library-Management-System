import { fn, col, Op, CreationAttributes } from "sequelize";import Book from "../../database/models/Book.js";
import Category from "../../database/models/Category.js";

import {
  CreateBookPayload,
  UpdateBookPayload,
} from "./book.types.js";

class BookRepository {
 async createBook(payload: CreateBookPayload) {
    return Book.create({
      book_name: payload.book_name,
      book_author: payload.book_author,
      category_id: payload.category_id,
      total_copies: payload.total_copies,
      available_copies: payload.available_copies ?? payload.total_copies,
      language: payload.language
    } as CreationAttributes<Book>);
  }

  async getBooks(
  page: number,
  limit: number,
  search?: string,
  category_id?: string,
  language?: string
) {
  const offset = (page - 1) * limit;

  // 1. Build an isolated, strong where clause object literal
  const whereClause: any = {};

  // Handle fuzzy title/author searches
  if (search) {
    whereClause[Op.or] = [
      { book_name: { [Op.iLike]: `%${search}%` } },
      { book_author: { [Op.iLike]: `%${search}%` } },
    ];
  }

  // Handle direct relational category identifiers
  if (category_id) {
    whereClause.category_id = category_id;
  }

  // Explicit strict matching safeguarding string casing discrepancies
  if (language) {
    whereClause.language = {
      [Op.iLike]: language.trim()
    };
  }

  // 2. Concurrently fire the paginated rows query and the global meta aggregations
  // Using Promise.all keeps database round-trip costs optimally minimized.
  const [paginatedResult, metadataAggregation] = await Promise.all([
    // Main Paginated Data Engine Fetch
    Book.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: "category",
          attributes: [
            ["category_id", "id"],
            ["category_name", "name"]
          ],
          required: false
        },
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
      distinct: true, 
    }),

    // Global Aggregate Metrics Engine
    // Note: We deliberately pass the exact same whereClause parameters here so that 
    // the header indicators accurately reflect the currently filtered subset.
    Book.findAll({
      where: whereClause,
      attributes: [
        [fn("SUM", col("total_copies")), "globalTotalCopies"],
        [fn("SUM", col("available_copies")), "globalAvailableCopies"]
      ],
      raw: true
    })
  ]);

  // 3. Extract the computed sums safely out of the array response raw rows
  const metricsRow = metadataAggregation[0] as unknown as Record<string, string | null>;
  const globalTotalCopies = Number(metricsRow?.globalTotalCopies || 0);
  const globalAvailableCopies = Number(metricsRow?.globalAvailableCopies || 0);

  // 4. Return custom formatted metadata response payload structural block
  return {
    rows: paginatedResult.rows,
    count: paginatedResult.count,
    meta: {
      globalTotalCopies,
      globalAvailableCopies
    }
  };
  }

  async getBookById(book_id: string) {
    return Book.findByPk(book_id, {
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });
  }

  async updateBook(
    book_id: string,
    payload: UpdateBookPayload
  ) {
    await Book.update({
      ...(payload.book_name && { book_name: payload.book_name }),
      ...(payload.book_author && { book_author: payload.book_author }),
      ...(payload.category_id && { category_id: payload.category_id }),
      ...(payload.total_copies !== undefined && { total_copies: payload.total_copies }),
      ...(payload.available_copies !== undefined && { available_copies: payload.available_copies }),
      ...(payload.language && { language: payload.language })
    }, {
      where: { book_id },
    });

    return this.getBookById(book_id);
  }

  async deleteBook(book_id: string) {
    return Book.destroy({
      where: { book_id },
    });
  }

  async searchBooks(searchToken: string) {
    const matches = await Book.findAll({
      where: {
        [Op.or]: [
          { book_name: { [Op.iLike]: `%${searchToken}%` } },
          { book_author: { [Op.iLike]: `%${searchToken}%` } }
        ]
      },
      attributes: ["book_id", "book_name", "book_author", "available_copies", "language"],
      order: [["book_name", "ASC"]],
      limit: 15
    });

    return matches.map((book: any) => {
      const stockCount = book.available_copies ?? 0;
      const outOfStock = stockCount <= 0;

      return {
        book_id: book.book_id,
        title: book.book_name,
        author: book.book_author || "Unknown Author",
        language: book.language || "Not Mentioned",
        available_copies: stockCount,
        compliance: {
          status: outOfStock ? "OUT_OF_STOCK" : "AVAILABLE",
          message: outOfStock 
            ? "❌ Out of stock! All physical asset copies currently checked out." 
            : `✓ Available: ${stockCount} copies remaining inside the stack index.`,
          isBlocked: outOfStock
        }
      };
    });
  }

  async getCategories() {
    // 💡 FIX: Adding raw: true guarantees that Sequelize drops model wrapper metadata 
    // and outputs a pure JSON object array containing exactly your custom aliased keys!
    return Category.findAll({
      attributes: [
        ["category_id", "id"],
        ["category_name", "name"]
      ],
      raw: true,
      order: [["category_name", "ASC"]],
    });
  }

  async getLanguages() {
  const records = await Book.findAll({
    attributes: [
      [fn("DISTINCT", col("language")), "language"]
    ],
    where: {
      language: {
        [Op.not]: null as any
      }
    },
    raw: true,
    order: [["language", "ASC"]],
  });

  return records.map((r: any) => r.language);
}
}

export default new BookRepository();