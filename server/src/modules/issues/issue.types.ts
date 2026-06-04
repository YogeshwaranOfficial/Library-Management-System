import { z } from "zod";
import { 
  createIssueSchema, 
  updateIssueSchema, 
  returnBookSchema 
} from "./issue.validation.js";

// ✨ Pro-Tip: Automatically infers pristine camelCase structures directly from schemas
export type CreateIssuePayload = z.infer<typeof createIssueSchema>["body"];
export type UpdateIssuePayload = z.infer<typeof updateIssueSchema>["body"];
export type ReturnBookPayload = z.infer<typeof returnBookSchema>["body"];

/* Inferred result breakdown for compilation safety:
  
  CreateIssuePayload & UpdateIssuePayload will map to:
  {
     memberId: string;
     bookId: string;
     dueDate: string;
  }

  ReturnBookPayload will map to:
  {
     issueId: string;
     returnedDate?: string;
  }
*/