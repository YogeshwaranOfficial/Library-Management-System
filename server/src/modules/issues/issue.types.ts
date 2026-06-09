import { z } from "zod";
import { 
  createIssueSchema, 
  updateIssueSchema, 
  returnBookSchema 
} from "./issue.validation.js";


// Infers body payload schemas dynamically from Zod setups
export type CreateIssuePayload = z.infer<typeof createIssueSchema>["body"];
export type UpdateIssuePayload = z.infer<typeof updateIssueSchema>["body"];
export type ReturnBookPayload = z.infer<typeof returnBookSchema>["body"];


// ==========================================
// 🛡️ STRICT SERVICE LAYER DTOs (Data Transfer Objects)
// ==========================================

export interface BorrowBookServiceDTO {
  memberId: string;
  bookId: string;
  borrowDate?: string; 
  dueDate: string;
}

export interface UpdateIssueServiceDTO {
  // ✨ FIXED: Marked structural parameters as optional to support partial PATCH operations
  memberId?: string;
  bookId?: string;
  borrowDate?: string;
  dueDate?: string;
  
  // ✨ NEW: Added restoration parameters to let controller inputs cross over safely
  status?: string;
  returnedDate?: string | null;
}