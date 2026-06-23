import { z } from "zod";

/**
 * Validates query parameters for compiling the core dynamic statement
 * Target: GET /api/v1/reports
 */
export const generateReportValidation = z.object({
  query: z.object({
    pivot: z.enum(["MEMBER", "BOOK"]),
    
    primaryId: z
      .string({ error: "Primary validation index ID is required" })
      .uuid({ message: "Invalid parameter format. Must be a valid UUID string" }),
    
    secondaryId: z
      .string()
      .uuid({ message: "Invalid cross-reference parameter format. Must be a valid UUID string" })
      .optional()
      .or(z.literal("")),
    
    duration: z
      .enum(["ALL", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional()
      .default("ALL"),
  }),
});

/**
 * Validates query parameters for cross-reference dropdown bindings
 * Target: GET /api/v1/reports/dependent-options
 */
export const getDependentOptionsValidation = z.object({
  query: z.object({
    pivot: z.enum(["MEMBER", "BOOK"]),
    
    primaryId: z
      .string({ error: "Primary validation index ID is required" })
      .uuid({ message: "Invalid parameter format. Must be a valid UUID string" }),
  }),
});

// Infer types if needed elsewhere in your code architecture
export type GenerateReportInput = z.infer<typeof generateReportValidation>;
export type GetDependentOptionsInput = z.infer<typeof getDependentOptionsValidation>;