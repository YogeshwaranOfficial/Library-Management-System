import { Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/SendResponse.js";

import bookService from "./book.service.js";

export const createBookController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await bookService.createBook(req.body);

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
    // Safely extract parameters coming from frontend URL params
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search ? String(req.query.search).trim() : undefined;
    const category_id = req.query.category_id ? String(req.query.category_id).trim() : undefined;
   
    const result = await bookService.getBooks(
      page,
      limit,
      search,
      category_id
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Books fetched successfully",
      // Contains { count, rows }
      data: result, 
    });
  }
);

export const getBookByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await bookService.getBookById(
      req.params.bookId as any
    );

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
    const result = await bookService.updateBook(
      req.params.bookId as any,
      req.body
    );

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
    await bookService.deleteBook(req.params.bookId as any);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Book deleted successfully",
    });
  }
);

// =========================================================================
// 🚀 NEW SYSTEM CHANNEL CONTROLLER: FETCH ALL CATEGORIES
// =========================================================================
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

export const searchBooksController = asyncHandler(async (req: Request, res: Response) => {
  // 1. Capture the type-ahead search text token from 'q' safely
  const searchString = req.query.q as string;

  // 2. Fetch inventory records along with copy availability compliance metrics
  const structuredMatches = await bookService.searchBooks(searchString);

  // 3. Dispatch structured payload back to the TanStack frontend client hooks
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Library inventory search indices queried successfully matching criteria.",
    data: structuredMatches,
  });
});