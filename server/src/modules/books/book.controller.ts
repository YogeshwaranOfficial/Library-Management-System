import { Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/SendResponse.js";

import bookService from "./book.service.js";

export const createBookController = asyncHandler(
  async (req: Request, res: Response) => {
    const bookData = req.body.body || req.body;
    const result = await bookService.createBook(bookData);

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Book created successfully",
      data: result,
    });
  }
);

export const getBooksController = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search ? String(req.query.search).trim() : undefined;
    const category_id = req.query.category_id ? String(req.query.category_id).trim() : undefined;
    // 🌟 FIX: Extract the language query parameter securely from the request URL string
    const language = req.query.language ? String(req.query.language).trim() : undefined;
   
    // 🌟 FIX: Pass language as the 5th parameter into your service layer
    const result = await bookService.getBooks(
      page,
      limit,
      search,
      category_id,
      language 
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Books fetched successfully",
      data: result, 
    });
  }
);

export const getBookByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { bookId } = req.params;
    // 💡 FIX (Line 52): String coercion guarantees the service gets a strict string
    const result = await bookService.getBookById(String(bookId));

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Book fetched successfully",
      data: result,
    });
  }
);

export const updateBookController = asyncHandler(
  async (req: Request, res: Response) => {
    const { bookId } = req.params;
    const updateData = req.body.body || req.body;
    
    // 💡 FIX (Line 69): Coerce bookId parameter safely
    const result = await bookService.updateBook(String(bookId), updateData);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Book updated successfully",
      data: result,
    });
  }
);

export const deleteBookController = asyncHandler(
  async (req: Request, res: Response) => {
    const { bookId } = req.params;
    await bookService.deleteBook(String(bookId));

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Book deleted successfully",
    });
  }
);

export const getCategoriesController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await bookService.getCategories();

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Categories fetched successfully",
      data: result,
    });
  }
);

export const getLanguagesController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await bookService.getLanguages();

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Languages fetched successfully",
      data: result,
    });
  }
);

export const searchBooksController = asyncHandler(async (req: Request, res: Response) => {
  // 💡 FIX (Line 84): Cast req.query.q cleanly into a string primitive fallback 
  const searchString = String(req.query.q || "");
  const structuredMatches = await bookService.searchBooks(searchString);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Library inventory search indices queried successfully matching criteria.",
    data: structuredMatches,
  });
});