import { z } from "zod";
import { 
  createIssueSchema, 
  updateIssueSchema, 
  returnBookSchema 
} from "./issue.validation.js";


// Infers: { memberId: string; bookId: string; borrowDate?: string; dueDate: string; }
export type CreateIssuePayload = z.infer<typeof createIssueSchema>["body"];

// Infers: { memberId: string; bookId: string; borrowDate?: string; dueDate: string; }
export type UpdateIssuePayload = z.infer<typeof updateIssueSchema>["body"];

// Infers: { issueId: string; returnedDate?: string; }
export type ReturnBookPayload = z.infer<typeof returnBookSchema>["body"];


// ==========================================
// 🛡️ STRICT SERVICE LAYER DTOs (Data Transfer Objects)
// ==========================================
// These explicitly satisfy exactOptionalPropertyTypes by defining 
// exactly how the service functions expect optional values.

export interface BorrowBookServiceDTO {
  memberId: string;
  bookId: string;
  borrowDate?: string; // Clear from undefined collision bounds
  dueDate: string;
}

export interface UpdateIssueServiceDTO {
  memberId: string;
  bookId: string;
  borrowDate?: string;
  dueDate: string;
}

