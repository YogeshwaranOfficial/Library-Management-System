import { z } from "zod";

// 1. Core Object Body Definition (Aligned with what the React form sends!)
const memberBodySchema = z.object({
  user_id: z
    .string()
    .uuid({ message: "Invalid user ID UUID format" }),

  membership_plan_id: z
    .string()
    .uuid({ message: "Invalid membership plan ID UUID format" }),

  // 💡 REMOVED start_date and expiry_date from creation body requirement.
  // The backend controller will compute these automatically based on the plan!
});

// 2. Export Wrapped version for your middleware runner setup
export const createMemberValidation = z.object({
  body: memberBodySchema
});

// 3. Update Member Validation Schema
export const updateMemberValidation = z.object({
  body: z.object({
    // Allow user_id to pass through safely if sent by the mutation payload
    user_id: z.string().uuid().optional(),

    membership_plan_id: z
      .string()
      .uuid({ message: "Invalid membership plan ID" })
      .optional(),

    start_date: z.string().optional(),
    expiry_date: z.string().optional(),
    is_active: z.boolean().optional(), // 💡 ADDED: To accept your frontend checkbox toggle

    membership_status: z
      .enum(["ACTIVE", "EXPIRED", "CLOSED"])
      .optional(),
  }).strict(), // Strict is safe now because user_id and is_active are accounted for!
});

// 4. Get All Members Query Parameters Validation Schema
export const getMembersQueryValidation = z.object({
  query: z.object({
    page: z.preprocess((val) => String(val), z.string()).optional(),
    limit: z.preprocess((val) => String(val), z.string()).optional(),
    search: z.string().optional(),
    plan: z.string().optional(),
    status: z.string().optional(),
    membership_status: z.enum(["ACTIVE", "EXPIRED", "CLOSED"]).optional(),
  }),
});

// 5. Search Schema
export const searchMembersQueryValidation = z.object({
  query: z.object({
    q: z
      .string({ error: "Search lookup token 'q' is a required query parameter." })
      .min(1, { message: "Search criteria must contain at least 1 character." }),
  }),
});