import { jest } from "@jest/globals";

jest.unstable_mockModule("./book.repository.js", () => ({
  default: {
    createBook: jest.fn(),
    getBooks: jest.fn(),
    getBookById: jest.fn(),
    updateBook: jest.fn(),
    deleteBook: jest.fn(),
    searchBooks: jest.fn(),
    getCategories: jest.fn(),
  },
}));

jest.unstable_mockModule(
  "../../database/models/Category.js",
  () => ({
    default: {
      findByPk: jest.fn(),
    },
  })
);

const { default: bookService } =
  await import("./book.service.js");

const { default: bookRepository } =
  await import("./book.repository.js");

const { default: Category } =
  await import(
    "../../database/models/Category.js"
  );

const mockBookRepository =
  bookRepository as any;

const mockCategory =
  Category as any;

describe("Book Service Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createBook", () => {
    const payload = {
      book_name: "Clean Code",
      book_author: "Robert Martin",
      category_id: "cat-1",
      total_copies: 10,
      language: "English",
    };

    it("should create book successfully", async () => {
      mockCategory.findByPk.mockResolvedValue({
        category_id: "cat-1",
      });

      mockBookRepository.createBook.mockResolvedValue(
        {
          book_id: "book-1",
          ...payload,
          available_copies: 10,
        }
      );

      const result =
        await bookService.createBook(payload);

      expect(
        mockCategory.findByPk
      ).toHaveBeenCalledWith(
        payload.category_id
      );

      expect(
        mockBookRepository.createBook
      ).toHaveBeenCalledWith({
        ...payload,
        available_copies: 10,
      });

      expect(result.book_id).toBe("book-1");
    });

    it("should throw when category does not exist", async () => {
      mockCategory.findByPk.mockResolvedValue(
        null
      );

      await expect(
        bookService.createBook(payload)
      ).rejects.toMatchObject({
        message: "Category not found",
        statusCode: 404,
      });

      expect(
        mockBookRepository.createBook
      ).not.toHaveBeenCalled();
    });

    it("should set available copies equal to total copies", async () => {
      mockCategory.findByPk.mockResolvedValue({
        category_id: "cat-1",
      });

      mockBookRepository.createBook.mockResolvedValue(
        {}
      );

      await bookService.createBook(payload);

      expect(
        mockBookRepository.createBook
      ).toHaveBeenCalledWith({
        ...payload,
        available_copies: 10,
      });
    });
  });

  describe("getBookById", () => {
    it("should return book", async () => {
      const book = {
        book_id: "book-1",
      };

      mockBookRepository.getBookById.mockResolvedValue(
        book
      );

      const result =
        await bookService.getBookById(
          "book-1"
        );

      expect(result).toEqual(book);
    });

    it("should throw when book not found", async () => {
      mockBookRepository.getBookById.mockResolvedValue(
        null
      );

      await expect(
        bookService.getBookById(
          "book-1"
        )
      ).rejects.toMatchObject({
        message: "Book not found",
        statusCode: 404,
      });
    });
  });

  describe("updateBook", () => {
    it("should update normal fields", async () => {
      const existingBook = {
        total_copies: 10,
        available_copies: 6,
      };

      mockBookRepository.getBookById.mockResolvedValue(
        existingBook
      );

      mockBookRepository.updateBook.mockResolvedValue(
        {
          book_id: "book-1",
        }
      );

      await bookService.updateBook(
        "book-1",
        {
          book_name: "Updated Book",
        }
      );

      expect(
        mockBookRepository.updateBook
      ).toHaveBeenCalledWith(
        "book-1",
        {
          book_name: "Updated Book",
        }
      );
    });

    it("should throw when book does not exist", async () => {
      mockBookRepository.getBookById.mockResolvedValue(
        null
      );

      await expect(
        bookService.updateBook(
          "book-1",
          {}
        )
      ).rejects.toMatchObject({
        message: "Book not found",
        statusCode: 404,
      });
    });

    it("should recalculate available copies when increasing total copies", async () => {
      mockBookRepository.getBookById.mockResolvedValue(
        {
          total_copies: 10,
          available_copies: 6,
        }
      );

      await bookService.updateBook(
        "book-1",
        {
          total_copies: 15,
        }
      );

      expect(
        mockBookRepository.updateBook
      ).toHaveBeenCalledWith(
        "book-1",
        {
          total_copies: 15,
          available_copies: 11,
        }
      );
    });

    it("should recalculate available copies when decreasing total copies", async () => {
      mockBookRepository.getBookById.mockResolvedValue(
        {
          total_copies: 10,
          available_copies: 6,
        }
      );

      await bookService.updateBook(
        "book-1",
        {
          total_copies: 8,
        }
      );

      expect(
        mockBookRepository.updateBook
      ).toHaveBeenCalledWith(
        "book-1",
        {
          total_copies: 8,
          available_copies: 4,
        }
      );
    });

    it("should throw when total copies goes below active loans", async () => {
      mockBookRepository.getBookById.mockResolvedValue(
        {
          total_copies: 10,
          available_copies: 6,
        }
      );

      await expect(
        bookService.updateBook(
          "book-1",
          {
            total_copies: 3,
          }
        )
      ).rejects.toMatchObject({
        statusCode: 400,
      });

      expect(
        mockBookRepository.updateBook
      ).not.toHaveBeenCalled();
    });
  });

  describe("deleteBook", () => {
    it("should delete book successfully", async () => {
      mockBookRepository.getBookById.mockResolvedValue(
        {
          book_id: "book-1",
        }
      );

      mockBookRepository.deleteBook.mockResolvedValue(
        1
      );

      await bookService.deleteBook(
        "book-1"
      );

      expect(
        mockBookRepository.deleteBook
      ).toHaveBeenCalledWith(
        "book-1"
      );
    });

    it("should throw when book not found", async () => {
      mockBookRepository.getBookById.mockResolvedValue(
        null
      );

      await expect(
        bookService.deleteBook(
          "book-1"
        )
      ).rejects.toMatchObject({
        message: "Book not found",
        statusCode: 404,
      });
    });
  });

  describe("searchBooks", () => {
    it("should return empty array for empty search", async () => {
      const result =
        await bookService.searchBooks(
          ""
        );

      expect(result).toEqual([]);
    });

    it("should trim search token before repository call", async () => {
      mockBookRepository.searchBooks.mockResolvedValue(
        []
      );

      await bookService.searchBooks(
        "  clean code  "
      );

      expect(
        mockBookRepository.searchBooks
      ).toHaveBeenCalledWith(
        "clean code"
      );
    });
  });

  describe("getCategories", () => {
    it("should return categories", async () => {
      const categories = [
        {
          id: "cat-1",
          name: "Programming",
        },
      ];

      mockBookRepository.getCategories.mockResolvedValue(
        categories
      );

      const result =
        await bookService.getCategories();

      expect(result).toEqual(
        categories
      );
    });
  });
});