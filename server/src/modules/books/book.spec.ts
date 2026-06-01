import { jest } from "@jest/globals";
import httpStatus from "http-status-codes";
import AppError from "../../utils/AppError.js";

// 1. Mock modules using the ESM-compliant mock module system (Fully expanded for all methods)
jest.unstable_mockModule("./book.repository.js", () => ({
  default: {
    createBook: jest.fn(),
    getBooks: jest.fn(),
    getBookById: jest.fn(),
    updateBook: jest.fn(),
    deleteBook: jest.fn(),
  }
}));

jest.unstable_mockModule("../../database/models/Category.js", () => ({
  default: {
    findByPk: jest.fn(),
  }
}));

// 2. Dynamically import your service AFTER the modules are mocked
const { default: bookService } = await import("./book.service.js");
const { default: bookRepository } = await import("./book.repository.js");
const { default: Category } = await import("../../database/models/Category.js");

// 3. Cast them safely using the single generic function signature
const mockedFindByPk = Category.findByPk as unknown as jest.Mock<(...args: any[]) => any>;
const mockedCreateBook = bookRepository.createBook as unknown as jest.Mock<(...args: any[]) => any>;
const mockedGetBooks = bookRepository.getBooks as unknown as jest.Mock<(...args: any[]) => any>;
const mockedGetBookById = bookRepository.getBookById as unknown as jest.Mock<(...args: any[]) => any>;
const mockedUpdateBook = bookRepository.updateBook as unknown as jest.Mock<(...args: any[]) => any>;
const mockedDeleteBook = bookRepository.deleteBook as unknown as jest.Mock<(...args: any[]) => any>;

describe("🧪 Books Service Unit Tests (Isolated System Logic)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockBookId = "b1111111-fa21-11ee-8391-4321abcdef12";
  const mockCategoryId = "a3fa8d20-fa21-11ee-8391-4321abcdef12";
  
  const mockBookRecord = {
    book_id: mockBookId,
    book_name: "Test Execution Suite",
    book_author: "Jest Expert",
    category_id: mockCategoryId,
    total_copies: 3,
    available_copies: 3,
  };

  // ==========================================
  // 🟢 1. createBook Context
  // ==========================================
  describe("createBook Context", () => {
    it("✔ Should call repository layer once valid entity configuration checks pass", async () => {
      mockedFindByPk.mockResolvedValue({ category_id: mockCategoryId, category_name: "Tech" });
      mockedCreateBook.mockResolvedValue(mockBookRecord);

      const result = await bookService.createBook(mockBookRecord);

      expect(Category.findByPk).toHaveBeenCalledWith(mockCategoryId);
      expect(bookRepository.createBook).toHaveBeenCalledWith(mockBookRecord);
      expect(result).toHaveProperty("book_id", mockBookId);
    });

    it("❌ Should short-circuit and throw an AppError if the foreign category is absent", async () => {
      mockedFindByPk.mockResolvedValue(null);

      await expect(bookService.createBook(mockBookRecord)).rejects.toThrow(
        new AppError("Category not found", httpStatus.NOT_FOUND)
      );

      expect(bookRepository.createBook).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // 🟢 2. getBooks Context
  // ==========================================
  describe("getBooks Context", () => {
    it("✔ Should fetch books matching paginated structure from repository layer", async () => {
      const mockPaginationResponse = { count: 1, rows: [mockBookRecord] };
      mockedGetBooks.mockResolvedValue(mockPaginationResponse);

      const result = await bookService.getBooks(1, 10, "Test", mockCategoryId);

      expect(bookRepository.getBooks).toHaveBeenCalledWith(1, 10, "Test", mockCategoryId);
      expect(result).toEqual(mockPaginationResponse);
    });
  });

  // ==========================================
  // 🟢 3. getBookById Context
  // ==========================================
  describe("getBookById Context", () => {
    it("✔ Should successfully return a single book object if found", async () => {
      mockedGetBookById.mockResolvedValue(mockBookRecord);

      const result = await bookService.getBookById(mockBookId);

      expect(bookRepository.getBookById).toHaveBeenCalledWith(mockBookId);
      expect(result).toEqual(mockBookRecord);
    });

    it("❌ Should throw a 404 AppError if the database lookup comes back empty", async () => {
      mockedGetBookById.mockResolvedValue(null);

      await expect(bookService.getBookById("invalid-id")).rejects.toThrow(
        new AppError("Book not found", httpStatus.NOT_FOUND)
      );
    });
  });

  // ==========================================
  // 🟢 4. updateBook Context
  // ==========================================
  describe("updateBook Context", () => {
    const updatePayload = { book_name: "Updated Book Title" };

    it("✔ Should update and return book properties if target exists", async () => {
      mockedGetBookById.mockResolvedValue(mockBookRecord);
      mockedUpdateBook.mockResolvedValue({ ...mockBookRecord, ...updatePayload });

      const result = await bookService.updateBook(mockBookId, updatePayload);

      expect(bookRepository.getBookById).toHaveBeenCalledWith(mockBookId);
      expect(bookRepository.updateBook).toHaveBeenCalledWith(mockBookId, updatePayload);
      expect(result!.book_name).toBe("Updated Book Title");
    });

    it("❌ Should throw a 404 AppError if trying to update a missing record", async () => {
      mockedGetBookById.mockResolvedValue(null);

      await expect(bookService.updateBook("invalid-id", updatePayload)).rejects.toThrow(
        new AppError("Book not found", httpStatus.NOT_FOUND)
      );

      expect(bookRepository.updateBook).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // 🟢 5. deleteBook Context
  // ==========================================
  describe("deleteBook Context", () => {
    it("✔ Should trigger repository purge mechanism when record execution is verified", async () => {
      mockedGetBookById.mockResolvedValue(mockBookRecord);
      mockedDeleteBook.mockResolvedValue(1); // Assuming repository returns rows affected count

      const result = await bookService.deleteBook(mockBookId);

      expect(bookRepository.getBookById).toHaveBeenCalledWith(mockBookId);
      expect(bookRepository.deleteBook).toHaveBeenCalledWith(mockBookId);
      expect(result).toBe(1);
    });

    it("❌ Should throw a 404 AppError if trying to delete an already missing record", async () => {
      mockedGetBookById.mockResolvedValue(null);

      await expect(bookService.deleteBook("invalid-id")).rejects.toThrow(
        new AppError("Book not found", httpStatus.NOT_FOUND)
      );

      expect(bookRepository.deleteBook).not.toHaveBeenCalled();
    });
  });
});