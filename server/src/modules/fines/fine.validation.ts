import { z } from "zod";

export const payFineSchema = z.object({
  body: z.object({
    // 🔒 Back to snake_case to match your database column perfectly
    fine_id: z.string().uuid("Invalid fine identifier format"),
    
    // Validates the transaction date string passed down from the form/modal
    paidDate: z
      .string({ error: "Payment date is required" })
      .datetime({ message: "Execution date must be a valid ISO string layout format" })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format")),

    // Added payment method enum validator to support the balance ledger tracking
    // 🟢 Corrected Zod enum error handling configuration
  paymentMethod: z
      .string({ error: "Payment method is required" })
      .refine((val) => ["CASH", "CARD", "UPI"].includes(val), {
        message: "Payment method must be CASH, CARD, or UPI",
      }),
  }),
});


// 🟢 Validation schema for restoring a settled fine
export const restoreFineSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid fine identifier format"),
  }),
});