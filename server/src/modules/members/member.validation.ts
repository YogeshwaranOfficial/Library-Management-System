import { z } from "zod";

// 1. Core Object Body Definition
const memberBodySchema = z.object({
  user_id: z
    .string()
    .uuid({ message: "Invalid user ID UUID format" }),

  membership_plan_id: z
    .string()
    .uuid({ message: "Invalid membership plan ID UUID format" }),

  start_date: z.string(),

  expiry_date: z.string(),
});

// 2. Export Wrapped version for your middleware runner setup
export const createMemberValidation = z.object({
  body: memberBodySchema
});

// 2. Update Member Validation Schema
export const updateMemberValidation = z.object({
  body: z.object({
    membership_plan_id: z
      .string()
      .uuid({ message: "Invalid membership plan ID" })
      .optional(),

    start_date: z.string().optional(),

    expiry_date: z.string().optional(),

    membership_status: z
      .enum(["ACTIVE", "EXPIRED", "CLOSED"])
      .optional(),
  }).strict(),
});

// 3. Get All Members Query Parameters Validation Schema (Fixed with preprocessing!)
export const getMembersQueryValidation = z.object({
  query: z.object({
    // Converts numeric query inputs from tests (like page: 1) into strings smoothly
    page: z.preprocess((val) => String(val), z.string()).optional(),

    limit: z.preprocess((val) => String(val), z.string()).optional(),

    search: z.string().optional(),

    membership_status: z
      .enum(["ACTIVE", "EXPIRED", "CLOSED"])
      .optional(),
  }),
});