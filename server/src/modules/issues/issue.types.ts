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

export interface IssueAttributes {
  issue_id: string;
  member_id: string;
  book_id: string;
  due_date: Date;
  returned_date?: Date | null;
  issue_status: string;
  // 🚀 ADD THESE TWO FIELDS HERE:
  book_condition: "GOOD" | "DAMAGED";
  damage_description?: string | null;
}