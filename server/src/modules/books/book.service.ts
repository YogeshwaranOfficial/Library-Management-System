import httpStatus from "http-status-codes";
import AppError from "../../utils/AppError.js";
import Category from "../../database/models/Category.js";
import bookRepository from "./book.repository.js";
import { CreateBookPayload, UpdateBookPayload } from "./book.types.js";

class BookService {
  async createBook(payload: CreateBookPayload) {
    const category = await Category.findByPk(payload.category_id);
    if (!category) {
      throw new AppError("Category not found", httpStatus.NOT_FOUND);
    }

    // 💡 Best Practice: When creating a book, initial available copies MUST match total copies
    const completePayload = {
      ...payload,
      available_copies: payload.total_copies
    };

    return bookRepository.createBook(completePayload);
  }

 // 🌟 FIX: Add language?: string to your service layer method parameters
async getBooks(page: number, limit: number, search?: string, category_id?: string, language?: string) {
  // 🌟 FIX: Forward the language parameter directly down to the repository method execution context
  return bookRepository.getBooks(page, limit, search, category_id, language);
}

  async getBookById(book_id: string) {
    const book = await bookRepository.getBookById(book_id);
    if (!book) {
      throw new AppError("Book not found", httpStatus.NOT_FOUND);
    }
    return book;
  }

 async updateBook(book_id: string, payload: UpdateBookPayload) {
    const existingBook = await bookRepository.getBookById(book_id);
    if (!existingBook) {
      throw new AppError("Book not found", httpStatus.NOT_FOUND);
    }

    let finalPayload = { ...payload };

    if (payload.total_copies !== undefined) {
      // 💡 FIX: Access only the true database fields declared in models/Book.ts
      const currentTotal = Number(existingBook.total_copies || 0);
      const currentAvailable = Number(existingBook.available_copies || 0);
      
      // Compute how many books are currently checked out by readers
      const activeLendedCount = currentTotal - currentAvailable;

      // Prevent total copies from being dropped below what's currently in circulation
      if (payload.total_copies < activeLendedCount) {
        throw new AppError(
          `Cannot reduce total copies below active lent volumes (${activeLendedCount} books currently on-loan).`,
          httpStatus.BAD_REQUEST
        );
      }

      // Adjust shelf availability mathematically to line up with new total volume capacity
      finalPayload.available_copies = payload.total_copies - activeLendedCount;
    }

    return bookRepository.updateBook(book_id, finalPayload);
  }

  async deleteBook(book_id: string) {
    const existingBook = await bookRepository.getBookById(book_id);
    if (!existingBook) {
      throw new AppError("Book not found", httpStatus.NOT_FOUND);
    }
    return bookRepository.deleteBook(book_id);
  }

  async searchBooks(searchToken: string) {
    if (!searchToken || !searchToken.trim()) {
      return [];
    }
    return bookRepository.searchBooks(searchToken.trim());
  }

  // =========================================================================
  // 🚀 GET CATEGORIES FOR FILTERS
  // =========================================================================
  async getCategories() {
    return bookRepository.getCategories();
  }

  async getLanguages() {
    return bookRepository.getLanguages();
  }
}

export default new BookService();