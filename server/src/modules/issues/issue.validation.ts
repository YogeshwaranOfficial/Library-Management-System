import { z } from "zod";

export const createIssueSchema = z.object({
  body: z.object({
    member_id: z.uuid(),

    book_id: z.uuid(),
  }),
});

export const returnBookSchema = z.object({
  body: z.object({
    issue_id: z.uuid(),
  }),
});