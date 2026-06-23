/**
 * @swagger
 * /categories/metrics:
 *   get:
 *     summary: Retrieve categories with analytics metrics
 *     tags: [Categories]
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
 *         description: Search category name
 *
 *       - in: query
 *         name: bookSort
 *         schema:
 *           type: string
 *           enum: [NONE, HIGH_TO_LOW, LOW_TO_HIGH]
 *         description: Sort categories by book count
 *
 *       - in: query
 *         name: borrowSort
 *         schema:
 *           type: string
 *           enum: [NONE, HIGH_TO_LOW, LOW_TO_HIGH]
 *         description: Sort categories by borrow count
 *
 *     responses:
 *       200:
 *         description: Categories metrics fetched successfully
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 *               properties:
 *                 success:
 *                   type: boolean
 *
 *                 message:
 *                   type: string
 *
 *                 data:
 *                   type: object
 *                   properties:
 *                     rows:
 *                       type: array
 *
 *                     totalCount:
 *                       type: integer
 *
 *                     totalPages:
 *                       type: integer
 *
 *                     currentPage:
 *                       type: integer
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
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
 *               - category_name
 *
 *             properties:
 *               category_name:
 *                 type: string
 *                 example: Science Fiction
 *
 *     responses:
 *       201:
 *         description: Category created successfully
 *
 *       409:
 *         description: Category already exists
 */

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Update category name
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
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
 *             required:
 *               - category_name
 *
 *             properties:
 *               category_name:
 *                 type: string
 *                 example: Tech Fiction
 *
 *     responses:
 *       200:
 *         description: Category updated successfully
 *
 *       404:
 *         description: Category not found
 *
 *       409:
 *         description: Category name already exists
 */

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete category (cascading delete)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Category deleted successfully with cascading cleanup
 *
 *       404:
 *         description: Category not found
 */

import { Router } from "express";
import categoriesController from "./categories.controller.js";
import validate from "../../middlewares/validate.js"; // 💡 Pointed directly to your existing file
import { 
  createCategorySchema, 
  updateCategorySchema, 
  deleteCategorySchema 
} from "./categories.validation.js";

const router = Router();

/**
 * @route   GET /api/categories/metrics
 * @desc    Retrieves full metrics overview containing volume structures
 */
router.get(
  "/metrics", 
  categoriesController.getCategoriesWithMetrics
);

/**
 * @route   POST /api/categories
 * @desc    Appends a new individual taxonomy tag slot asset
 */
router.post(
  "/", 
  validate(createCategorySchema), // 💡 Using your middleware cleanly
  categoriesController.createCategory
);

/**
 * @route   PATCH /api/categories/:id
 * @desc    Modifies string text naming properties of an isolated target category
 */
router.patch(
  "/:id", 
  validate(updateCategorySchema), // 💡 Using your middleware cleanly
  categoriesController.updateCategoryName
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Runs database cascade drop wiping underlying linked inventory records
 */
router.delete(
  "/:id", 
  validate(deleteCategorySchema), // 💡 Using your middleware cleanly
  categoriesController.deleteCategory
);

export default router;