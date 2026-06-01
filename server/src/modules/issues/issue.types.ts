import { z } from "zod";
import { createIssueSchema, returnBookSchema } from "./issue.validation.js";

// ✨ Pro-Tip: Automatically infers types directly from your schemas
export type CreateIssuePayload = z.infer<typeof createIssueSchema>["body"];
export type ReturnBookPayload = z.infer<typeof returnBookSchema>["body"];