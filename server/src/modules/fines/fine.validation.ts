import { z } from "zod";

// Base reusable date format validator string block
const dateStringSchema = z
  .string({ error: "Date parameter is required" })
  .datetime({ offset: true })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD layout format"));

// 1. Validates: PATCH /fines/pay
export const payFineSchema = z.object({
  body: z.object({
    // 🔒 Aligned to snake_case to capture the frontend mutation hook precisely
    fine_id: z.string().uuid({ message: "Invalid fine identifier format" }),
    
    // Captures custom parameters emitted out from the modal calendar fields
    paidDate: dateStringSchema,

    // 🟢 FIXED: Removed the dual params config object to satisfy Zod v4 core runner engine
    paymentMethod: z.enum(["CASH", "CARD", "UPI"] as const, {
      message: "Payment method must be explicitly CASH, CARD, or UPI",
    }),
  }),
});
// 2. Validates Path Params: PATCH /fines/restore/:id
export const restoreFineSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Invalid fine identifier format in path parameters" }),
  }),
});

// 3. Validates Path Params: DELETE /fines/:id
// ✨ NEW: Added to fully catch parameters passed by the purgeFineMutation hook
export const purgeFineSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Invalid invoice identifier format in path parameters" }),
  }),
});

// 4. Validates Path Params: GET /fines/member/:memberId
// ✨ NEW: Secures individual user records from malicious parameter injections
export const getMemberFinesSchema = z.object({
  params: z.object({
    memberId: z.string().uuid({ message: "Invalid member identifier format in path parameters" }),
  }),
});