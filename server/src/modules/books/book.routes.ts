/**
 * @swagger
 * /books:
 *   get:
 *     summary: Retrieve books with pagination and filtering
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
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
 *         description: Search keyword matching against book title or author
 *
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter books by a specific category UUID
 *
 *     responses:
 *       200:
 *         description: Books successfully fetched
 *
 *       401:
 *         description: Unauthorized access token missing or invalid
 */

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new library book record
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
 *         description: Validation payload error
 *
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /books/{book_id}:
 *   put:
 *     summary: Update an existing book's details
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: book_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique UUID of the book to update
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
 *                 example: The Pragmatic Programmer (Revised)
 *
 *               book_author:
 *                 type: string
 *                 example: Andrew Hunt
 *
 *               category_id:
 *                 type: string
 *                 format: uuid
 *
 *               total_copies:
 *                 type: integer
 *                 example: 10
 *
 *               available_copies:
 *                 type: integer
 *                 example: 9
 *
 *     responses:
 *       200:
 *         description: Book updated successfully
 *
 *       404:
 *         description: Book record not found
 */

/**
 * @swagger
 * /books/{book_id}:
 *   delete:
 *     summary: Remove a book from the library catalog
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: book_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique UUID of the book to delete
 *
 *     responses:
 *       200:
 *         description: Book successfully deleted from inventory
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
  getCategoriesController, // 🚀 NEW: Import the category retrieval handler
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
// Note: Put this ABOVE the dynamic "/:bookId" route so Express doesn't 
// accidentally mistake the word "categories" for a book UUID string!
router.get(
  "/categories",
  auth,
  getCategoriesController
);


router.get(
  "/search",
  auth,
  validate(searchBooksQueryValidation),
  searchBooksController
);
// =========================================================================
// CORE BOOK CRUD ENDPOINTS
// =========================================================================
router.post(
  "/",
  auth,
  validate(createBookSchema),
  createBookController
);

router.get(
  "/",
  auth,
  getBooksController
);

router.get(
  "/:bookId",
  auth,
  getBookByIdController
);

// Changed to PUT or PATCH depending on your network protocol specification
router.put(
  "/:bookId",
  auth,
  validate(updateBookSchema),
  updateBookController
);

router.delete(
  "/:bookId",
  auth,
  deleteBookController
);

export default router;