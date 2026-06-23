import { z } from "zod";

const dateStringSchema = z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/));

// 1. Validates: POST /issues/borrow
export const createIssueSchema = z.object({
  body: z.object({
    memberId: z.string().uuid({ message: "Invalid Member UUID format" }),
    bookId: z.string().uuid({ message: "Invalid Book UUID format" }),
    borrowDate: dateStringSchema.optional(), // ✨ Synchronized with client payloads
    dueDate: dateStringSchema, 
  }),
});

// 2. Validates: PUT /issues/:id AND PATCH /issues/:id
export const updateIssueSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Invalid Issue ID format in URL path" }),
  }),
  body: z.object({
    // ✨ Changed to .optional() so PATCH requests don't require re-sending IDs
    memberId: z.string().uuid({ message: "Invalid Member UUID format" }).optional(),
    bookId: z.string().uuid({ message: "Invalid Book UUID format" }).optional(),
    borrowDate: dateStringSchema.optional(),
    dueDate: dateStringSchema.optional(), // ✨ Made optional for flexibility
    
    // ✨ NEW: Allow status to be modified during state restoration triggers
    status: z.enum(["BORROWED", "RETURNED", "OVERDUE"]).optional(),
    
    // ✨ NEW: Explicitly allow the client to send a valid date string OR a null literal
    returnedDate: dateStringSchema.nullable().optional(),
    condition: z.string().nullable().optional(),
    damage_description: z.string().nullable().optional()
  }),
});

// 3. Validates: POST /issues/return
export const returnBookSchema = z.object({
  body: z.object({
    issueId: z.string().uuid({ message: "Invalid Issue UUID format" }),
    returnedDate: z.string().optional(), 
  condition: z.enum(["GOOD", "DAMAGED"], "Condition state must be either GOOD or DAMAGED"),
    description: z
      .string()
      .max(255, { message: "Damage descriptions must be inside 255 characters limit" })
      .optional()
      .nullable(),
  }).refine(data => data.condition !== "DAMAGED" || (data.description && data.description.trim().length > 0), {
    message: "A detailed reason description is mandatory when marking books as DAMAGED",
    path: ["description"]
  }),
});

// 4. Validates Path Params: GET /issues/member-allowance/:memberId
export const getMemberAllowanceSchema = z.object({
  params: z.object({
    memberId: z.string().uuid({ message: "Invalid Member ID format in URL path" }),
  }),
});

// 5. Validates Path Params: GET /issues/member/:memberId
export const getMemberIssuesSchema = z.object({
  params: z.object({
    memberId: z.string().uuid({ message: "Invalid Member ID format in URL path" }),
  }),
});