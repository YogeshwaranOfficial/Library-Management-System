import { z } from "zod";

// 1. Validates: POST /issues/borrow
export const createIssueSchema = z.object({
  body: z.object({
    memberId: z.string().uuid({ message: "Invalid Member UUID format" }),
    bookId: z.string().uuid({ message: "Invalid Book UUID format" }),
    dueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)), 
    // ^ Accepts both ISO timestamp strings or raw "YYYY-MM-DD" calendar date strings
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
    dueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  }),
});

// 3. Validates: POST /issues/return
export const returnBookSchema = z.object({
  body: z.object({
    issueId: z.string().uuid({ message: "Invalid Issue UUID format" }),
    returnedDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    // Optional because the service layer falls back to new Date() if omitted
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