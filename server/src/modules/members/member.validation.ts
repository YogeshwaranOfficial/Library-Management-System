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

// 4. Get All Members Query Parameters Validation Schema (UPDATED FOR GLOBAL SORTING)
export const getMembersQueryValidation = z.object({
  query: z.object({
    // Preprocesses strings, parses to integers, and defaults to 1 if missing or invalid
    page: z
      .preprocess((val) => (val ? parseInt(String(val), 10) : 1), z.number().int().min(1))
      .default(1),
    
    // Preprocesses strings, parses to integers, and defaults to 10 if missing or invalid
    limit: z
      .preprocess((val) => (val ? parseInt(String(val), 10) : 10), z.number().int().min(1))
      .default(10),

    search: z.string().optional().or(z.literal("")),
    plan: z.string().optional().or(z.literal("")),
    status: z.string().optional().or(z.literal("")),
    membership_status: z.enum(["ACTIVE", "EXPIRED"]).optional().or(z.literal("")),

    // 🚀 NEW: Whitelist valid sorting field options to match repository logic
    sort_by: z
      .enum(["name", "contact", "created_at"])
      .optional()
      .default("created_at"),
      
    // 🚀 NEW: Restrict ordering keywords safely 
    order: z
      .enum(["ASC", "DESC", "asc", "desc"])
      .optional()
      .default("DESC"),
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

// =========================================================
// NEW: GET ALL PLANS METRICS QUERY PARAMETERS VALIDATION (PATCHED FOR DYNAMIC LIMITS)
// =========================================================
export const getPlansQueryValidation = z.object({
  query: z.object({
    page: z
      .preprocess((val) => (val ? parseInt(String(val), 10) : 1), z.number().int().min(1))
      .default(1),
    limit: z
      .preprocess((val) => (val ? parseInt(String(val), 10) : 10), z.number().int().min(1))
      .default(10),
    search: z.string().optional(),
  }),
});

// 6. Param Request Validation Schema
export const getMemberByIdParamsValidation = z.object({
  params: z.object({
    id: z
      .string({ error: "Member parameter 'id' is required" })
      .uuid({ message: "Invalid parameter format. Must be a valid UUID string" }),
  }),
});