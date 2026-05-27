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
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const search = req.query.search as string;

    const category_id = req.query.category_id as string;

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