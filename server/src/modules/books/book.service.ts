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
    // 🚀 Note: The unpacked payload safely routes the mandatory 'isbn' down to the repository layer
    const completePayload = {
      ...payload,
      available_copies: payload.total_copies
    };

    return bookRepository.createBook(completePayload);
  }

  // 🌟 UPDATED: Added sort_by?: string and order?: string to your service layer method parameters
  async getBooks(
    page: number, 
    limit: number, 
    search?: string, 
    category_id?: string, 
    language?: string,
    sort_by?: string,   // <-- Handles sorting parameters (including 'isbn')
    order?: string      // <-- Handles ordering direction parameter
  ) {
    // 🌟 UPDATED: Forward the sorting parameters directly down to the repository execution contract
    return bookRepository.getBooks(page, limit, search, category_id, language, sort_by, order);
  }

  async getBookById(book_id: string) {
    const book = await bookRepository.getBookById(book_id);
    if (!book) {
      throw new AppError("Book not found", httpStatus.NOT_FOUND);
    }

    // Convert the Sequelize instance to a plain JavaScript object
    const rawBook = book.get({ plain: true }) as any;
    console.log(rawBook)

    // 🚀 Map the internal database issue objects into your clean frontend BorrowHistoryItem format
    const historyList = (rawBook.issues || []).map((issue: any) => ({
      member_name: issue.member?.user?.name || "Unknown Member",
      gmail: issue.member?.user?.gmail || "N/A",
      borrow_date: issue.issue_date || issue.created_at,
      return_date: issue.returned_date,
      status: issue.status === "RETURNED" ? "RETURNED" : "BORROWED",
      condition: issue.condition || " ",
      damage_description: issue.damage_description || "No Damage", // 🌟 Grabs your newly added condition tracking field!
    }));

    // Construct the payload matching EditingBookInventoryItem contract perfectly
    return {
      book_id: rawBook.book_id,
      book_name: rawBook.book_name,
      book_author: rawBook.book_author,
      total_copies: rawBook.total_copies,
      available_copies: rawBook.available_copies,
      language: rawBook.language,
      lending_count: rawBook.lending_count || 0,
      isbn: rawBook.isbn,
      created_at: rawBook.created_at,
      category: rawBook.category ? {
        category_id: rawBook.category.category_id,
        category_name: rawBook.category.category_name
      } : undefined,
      history: historyList
    };
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

    // 🚀 'finalPayload' seamlessly maps structural mutations (like modified isbn updates) down to storage layers
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