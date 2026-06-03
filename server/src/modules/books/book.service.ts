import httpStatus from "http-status-codes";

import AppError from "../../utils/AppError.js";

import Category from "../../database/models/Category.js";

import bookRepository from "./book.repository.js";

import {
  CreateBookPayload,
  UpdateBookPayload,
} from "./book.types.js";

class BookService {
  async createBook(payload: CreateBookPayload) {
    const category = await Category.findByPk(
      payload.category_id
    );

    if (!category) {
      throw new AppError(        
        "Category not found",httpStatus.NOT_FOUND
      );
    }

    return bookRepository.createBook(payload);
  }

  async getBooks(
    page: number,
    limit: number,
    search?: string,
    category_id?: string
  ) {
    return bookRepository.getBooks(
      page,
      limit,
      search,
      category_id
    );
  }

  async getBookById(book_id: string) {
    const book = await bookRepository.getBookById(book_id);

    if (!book) {
      throw new AppError(
        "Book not found",httpStatus.NOT_FOUND,
      );
    }

    return book;
  }

  async updateBook(
    book_id: string,
    payload: UpdateBookPayload
  ) {
    const existingBook =
      await bookRepository.getBookById(book_id);

    if (!existingBook) {
      throw new AppError(
        "Book not found",httpStatus.NOT_FOUND,
      );
    }

    return bookRepository.updateBook(book_id, payload);
  }

  async deleteBook(book_id: string) {
    const existingBook =
      await bookRepository.getBookById(book_id);

    if (!existingBook) {
      throw new AppError(
        "Book not found",httpStatus.NOT_FOUND,
      );
    }

    return bookRepository.deleteBook(book_id);
  }

  // =========================================================================
  // 🚀 NEW CHANNEL METHOD: GET CATEGORIES FOR FILTERS
  // =========================================================================
  async getCategories() {
    return bookRepository.getCategories();
  }
}

export default new BookService();