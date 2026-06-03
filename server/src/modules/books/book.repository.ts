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
      ...payload,
      available_copies: payload.total_copies,
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
    // Math block to ensure correct pagination skips across pages
    const offset = (page - 1) * limit;

    return Book.findAndCountAll({
      where: {
        // Handle search query criteria if present
        ...(search && {
          [Op.or]: [
            {
              book_name: {
                [Op.iLike]: `%${search}%`,
              },
            },
            {
              book_author: {
                [Op.iLike]: `%${search}%`,
              },
            },
          ],
        }),

        // Handle structural category ID filter matching if selected
        ...(category_id && { category_id }),
      },

      include: [
        {
          model: Category,
          as: "category",
          attributes: [
            ["category_id","id"],
            ["category_name","name"]
          ], // Explicitly pluck the required parameters
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
    await Book.update(payload, {
      where: { book_id },
    });

    return this.getBookById(book_id);
  }

  async deleteBook(book_id: string) {
    return Book.destroy({
      where: { book_id },
    });
  }

  async getCategories() {
    return Category.findAll({
      attributes: [
        ["category_id","id"],
        ["category_name","name"]
      ],
      order: [["category_name", "ASC"]], // Organized alphabetically
    });
  }
}

export default new BookRepository();