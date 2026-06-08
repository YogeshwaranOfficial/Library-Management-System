export interface CategoryRow {
  category_id: string;
  category_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface CategoryMetricsRow extends CategoryRow {
  booksCount: number;
  lendingCount: number;
}

export interface CreateCategoryDTO {
  category_name: string;
}

export interface UpdateCategoryDTO {
  category_name: string;
}