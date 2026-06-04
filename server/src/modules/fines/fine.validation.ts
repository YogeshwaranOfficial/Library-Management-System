import { z } from "zod";

export const payFineSchema = z.object({
  body: z.object({
    fine_id: z.string().uuid("Invalid fine identifier format"),
    
    // Optional parameter handling: if present, ensures it matches a valid ISO date timeline format
    paidDate: z
      .string()
      .datetime({ message: "Execution date must be a valid ISO string layout format" })
      .optional()
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format").optional()),
  }),
});