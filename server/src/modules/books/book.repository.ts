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

  async searchBooks(searchToken: string) {
    // 1. Search catalog items matching book names or author strings
    const matches = await Book.findAll({
      where: {
        [Op.or]: [
          { book_name: { [Op.iLike]: `%${searchToken}%` } },
          { book_author: { [Op.iLike]: `%${searchToken}%` } }
        ]
      },
      attributes: ["book_id", "book_name", "book_author", "available_copies"],
      order: [["book_name", "ASC"]],
      limit: 15 // Capped to avoid blowing up the UI dropdown layout
    });

    // 2. Loop over inventory items to map business rules and compliance flags
    return matches.map((book: any) => {
      const stockCount = book.available_copies ?? 0;
      const outOfStock = stockCount <= 0;

      return {
        book_id: book.book_id,
        title: book.book_name,          // Mapped parameter to match 'bookSearch' tracking variables
        author: book.book_author || "Unknown Author",
        available_copies: stockCount,
        compliance: {
          status: outOfStock ? "OUT_OF_STOCK" : "AVAILABLE",
          message: outOfStock 
            ? "❌ Out of stock! All physical asset copies currently checked out." 
            : `✓ Available: ${stockCount} copies remaining inside the stack index.`,
          isBlocked: outOfStock        // Mapped straight to frontend dropdown 'disabled' attributes
        }
      };
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