import { Request, Response, NextFunction } from "express";
import categoriesService from "./categories.service.js";

class CategoriesController {
  
  async getCategoriesWithMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 📥 Safely parse and fall back on sensible pagination defaults
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || undefined;
      const bookSort = (req.query.bookSort as "NONE" | "HIGH_TO_LOW" | "LOW_TO_HIGH") || "NONE";
      const borrowSort = (req.query.borrowSort as "NONE" | "HIGH_TO_LOW" | "LOW_TO_HIGH") || "NONE";

      // ⚙️ Invoke service layer with the query parameters
      const data = await categoriesService.getAllCategoriesWithMetrics(
        page,
        limit,
        search,
        bookSort,
        borrowSort
      );
      
      res.status(200).json({
        success: true,
        message: "Catalog paginated metrics compiled successfully.",
        data, // This will automatically match your new { rows, totalCount, totalPages, currentPage } structure
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /categories
   * Registers a new unique asset classification shelf row
   */
  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const newCategory = await categoriesService.createCategory(req.body);

      res.status(201).json({
        success: true,
        message: "New category configured successfully.",
        data: newCategory,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /categories/:id
   * Updates an existing category string name reference token identifier
   */
  async updateCategoryName(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 💡 Cast or assert parameter safely to guarantee it resolves as a string
      const id = req.params.id as string;
      const updatedCategory = await categoriesService.updateCategoryName(id, req.body);

      res.status(200).json({
        success: true,
        message: "Category updated successfully.",
        data: updatedCategory,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /categories/:id
   * Triggers cascading drop transaction sequence targeting a category record
   */
  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 💡 Cast or assert parameter safely to guarantee it resolves as a string
      const id = req.params.id as string;
      await categoriesService.deleteCategory(id);

      res.status(200).json({
        success: true,
        message: "Category and all associated database records cleared successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoriesController();