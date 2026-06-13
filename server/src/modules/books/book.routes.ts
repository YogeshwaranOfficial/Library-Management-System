/**
 * @swagger
 * /books:
 *   get:
 *     summary: Retrieve books with pagination and filtering
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search books by title or author
 *
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter books by category
 *
 *     responses:
 *       200:
 *         description: Books fetched successfully
 *
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             required:
 *               - book_name
 *               - book_author
 *               - category_id
 *               - total_copies
 *
 *             properties:
 *               book_name:
 *                 type: string
 *                 example: The Pragmatic Programmer
 *
 *               book_author:
 *                 type: string
 *                 example: Andrew Hunt
 *
 *               category_id:
 *                 type: string
 *                 format: uuid
 *                 example: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
 *
 *               total_copies:
 *                 type: integer
 *                 example: 5
 *
 *     responses:
 *       201:
 *         description: Book created successfully
 *
 *       400:
 *         description: Validation error
 *
 *       404:
 *         description: Category not found
 *
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /books/search:
 *   get:
 *     summary: Search books by keyword
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword
 *
 *     responses:
 *       200:
 *         description: Search results returned successfully
 *
 *       400:
 *         description: Invalid search query
 */

/**
 * @swagger
 * /books/categories:
 *   get:
 *     summary: Get all book categories
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /books/{bookId}:
 *   get:
 *     summary: Get book by ID
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Book fetched successfully
 *
 *       404:
 *         description: Book not found
 */

/**
 * @swagger
 * /books/{bookId}:
 *   patch:
 *     summary: Update book details
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             properties:
 *               book_name:
 *                 type: string
 *
 *               book_author:
 *                 type: string
 *
 *               category_id:
 *                 type: string
 *                 format: uuid
 *
 *               total_copies:
 *                 type: integer
 *
 *               available_copies:
 *                 type: integer
 *
 *     responses:
 *       200:
 *         description: Book updated successfully
 *
 *       404:
 *         description: Book not found
 */

/**
 * @swagger
 * /books/{bookId}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *
 *       404:
 *         description: Book not found
 */

import { Router } from "express";

import validate from "../../middlewares/validate.js";
import auth from "../../middlewares/auth.js";

import {
  createBookController,
  deleteBookController,
  getBookByIdController,
  getBooksController,
  searchBooksController,
  updateBookController,
  getCategoriesController,
  getLanguagesController
} from "./book.controller.js";

import {
  createBookSchema,
  updateBookSchema,
  searchBooksQueryValidation
} from "./book.validation.js";

const router = Router();

// =========================================================================
// 🚀 SYSTEM CATEGORY DROPDOWN CHANNELS
// =========================================================================
router.get(
  "/categories",
  auth,
  getCategoriesController
);

router.get(
  "/languages",
  auth,
  getLanguagesController
);

router.get(
  "/search",
  auth,
  validate(searchBooksQueryValidation),
  searchBooksController
);

// =========================================================================
// 🎯 BASE CRUD ROOT ROUTE
// =========================================================================
router.route("/")
  .get(auth, getBooksController)
  .post(auth, validate(createBookSchema), createBookController);

// =========================================================================
// 🆔 DYNAMIC PARAMETER CRUD ROUTE GROUP (PATCH Only for Updates)
// =========================================================================
router.route("/:bookId")
  .get(auth, getBookByIdController)
  .patch(auth, validate(updateBookSchema), updateBookController) // ✨ Pure partial edits
  .delete(auth, deleteBookController);

export default router;