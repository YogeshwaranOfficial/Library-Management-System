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

// 2. Validates: PUT /issues/:id
export const updateIssueSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: "Invalid Issue ID format in URL path" }),
  }),
  body: z.object({
    memberId: z.string().uuid({ message: "Invalid Member UUID format" }),
    bookId: z.string().uuid({ message: "Invalid Book UUID format" }),
    borrowDate: dateStringSchema.optional(), // ✨ Synchronized with update queries
    dueDate: dateStringSchema,
  }),
});

// 3. Validates: POST /issues/return
export const returnBookSchema = z.object({
  body: z.object({
    issueId: z.string().uuid({ message: "Invalid Issue UUID format" }),
    returnedDate: dateStringSchema.optional(),
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