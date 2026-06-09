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