import { Op, CreationAttributes } from "sequelize";

import Book from "../../database/models/Book.js";
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
      // 💡 Now perfectly legal since we expanded the interface contract type!
      available_copies: payload.available_copies ?? payload.total_copies,
    } as CreationAttributes<Book>);
  }

  /**
   * 💡 Handles clean pagination limits, offsets, mixed title/author searches, 
   * and isolated category ID relational filtering.
   */
  async getBooks(
    page: number,
    limit: number,
    search?: string,
    category_id?: string
  ) {
    const offset = (page - 1) * limit;

    return Book.findAndCountAll({
      where: {
        ...(search && {
          [Op.or]: [
            { book_name: { [Op.iLike]: `%${search}%` } },
            { book_author: { [Op.iLike]: `%${search}%` } },
          ],
        }),
        ...(category_id && { category_id }),
      },

      include: [
        {
          model: Category,
          as: "category",
          attributes: [
            ["category_id", "id"],
            ["category_name", "name"]
          ],
        },
      ],

      limit,
      offset,
      order: [["created_at", "DESC"]],
    });
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
    // 💡 FIX: Safe, explicit assignments prevent accidental column drops on PATCH updates
    await Book.update({
      ...(payload.book_name && { book_name: payload.book_name }),
      ...(payload.book_author && { book_author: payload.book_author }),
      ...(payload.category_id && { category_id: payload.category_id }),
      ...(payload.total_copies !== undefined && { total_copies: payload.total_copies }),
      ...(payload.available_copies !== undefined && { available_copies: payload.available_copies }),
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
      attributes: ["book_id", "book_name", "book_author", "available_copies"],
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
}

export default new BookRepository();