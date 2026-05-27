import { Op } from "sequelize";

import Book from "../../database/models/Book.js";
import Category from "../../database/models/Category.js";

import {
  CreateBookPayload,
  UpdateBookPayload,
} from "./book.types.js";

class BookRepository {
  async createBook(payload: CreateBookPayload) {
    return Book.create({
      ...payload as any,
      available_copies: payload.total_copies,
    });
  }

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

        ...(category_id && { category_id }),
      },

      include: [
        {
          model: Category,
          as: "category",
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
}

export default new BookRepository();