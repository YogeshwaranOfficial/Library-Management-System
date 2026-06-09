import categoryRepository from "./categories.repository.js";
import type { CreateCategoryDTO, UpdateCategoryDTO } from "./categories.types.js";

class CategoriesService {
  /**
   * Retrieves all categories along with aggregated counts for books and loans
   */
  async getAllCategoriesWithMetrics(
    page: number,
    limit: number,
    search?: string,
    bookSort?: "NONE" | "HIGH_TO_LOW" | "LOW_TO_HIGH",
    borrowSort?: "NONE" | "HIGH_TO_LOW" | "LOW_TO_HIGH"
  ) {
    const result = await categoryRepository.getCategoriesWithMetrics(
      page,
      limit,
      search,
      bookSort,
      borrowSort
    );

    // Because Sequelize 'group by' is active, findAndCountAll returns "count" 
    // as an array of grouped row lengths. We extract the accurate data length here:
    const totalCount = Array.isArray(result.count) ? result.count.length : result.count;

    return {
      rows: result.rows,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    };
  }

  /**
   * Business Logic: Creates a new category slot after verifying name uniqueness
   */
  async createCategory(payload: CreateCategoryDTO) {
    // 1. Enforce business constraint: Avoid naming collisions
    const existingCategory = await categoryRepository.findByName(payload.category_name);
    if (existingCategory) {
      const error = new Error(`A catalog category named "${payload.category_name}" already exists.`);
      (error as any).statusCode = 409; // Conflict
      throw error;
    }

    // 2. Persist to database if unique
    return await categoryRepository.createCategory(payload);
  }

  /**
   * Business Logic: Modifies an existing category name if it exists and doesn't conflict
   */
  async updateCategoryName(id: string, payload: UpdateCategoryDTO) {
    // 1. Confirm target asset existence first
    const currentCategory = await categoryRepository.findById(id);
    if (!currentCategory) {
      const error = new Error("Target category profile could not be found.");
      (error as any).statusCode = 404; // Not Found
      throw error;
    }

    // 2. Prevent updating to an existing category name used by a different row
    const targetNameMatch = await categoryRepository.findByName(payload.category_name);
    if (targetNameMatch && targetNameMatch.category_id !== id) {
      const error = new Error(`Another category named "${payload.category_name}" is already active.`);
      (error as any).statusCode = 409; // Conflict
      throw error;
    }

    // 3. Dispatch update modifications
    return await categoryRepository.updateCategoryName(id, payload);
  }

  /**
   * Business Logic: Executes a cascading deletion protocol
   */
  async deleteCategory(id: string) {
    // 1. Check if resource exists before purging
    const currentCategory = await categoryRepository.findById(id);
    if (!currentCategory) {
      const error = new Error("The category you are trying to delete does not exist.");
      (error as any).statusCode = 404; // Not Found
      throw error;
    }

    // 2. Trigger repository cascade action
    return await categoryRepository.deleteCategory(id);
  }
}

export default new CategoriesService();