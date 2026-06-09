import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    category_name: z
      .string({ error: "Category name is required" })
      .trim()
      .min(1, "Category name cannot be empty")
      .regex(/^[A-Za-z\s]+$/, "Category name must only contain alphabet letters and spaces"),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string({ error: "Category ID parameter is required" }).uuid("Invalid ID format"),
  }),
  body: z.object({
    category_name: z
      .string({ error: "Category name is required" })
      .trim()
      .min(1, "Category name cannot be empty")
      .regex(/^[A-Za-z\s]+$/, "Category name must only contain alphabet letters and spaces"),
  }),
});

export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string({ error: "Category ID parameter is required" }).uuid("Invalid ID format"),
  }),
});