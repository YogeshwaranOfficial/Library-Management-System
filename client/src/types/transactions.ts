// 🏷️ 1. Explicit Status Stratification
export type BaseIssueStatus = "BORROWED" | "RETURNED";
export type ComputedIssueStatus = BaseIssueStatus | "OVERDUE";

// 🏷️ 2. Comprehensive Compliance & Safety Systems
export type ComplianceStatus = 
  | "GOOD" 
  | "EXPIRED" 
  | "LIMIT_EXCEEDED" 
  | "WARNING_LAST_SLOT" 
  | "AVAILABLE" 
  | "OUT_OF_STOCK";

export interface SystemCompliance {
  status: ComplianceStatus;
  message: string;
  isBlocked: boolean;
}

// 🏷️ 3. Master Circulation Ledger Record
export interface BookIssueRecord {
  id: string; // Maps to issue_id on backend
  memberId: string;
  memberName: string;
  bookId: string;
  bookTitle: string;
  borrowedDate: string; // ISO string format YYYY-MM-DD
  dueDate: string;      // ISO string format YYYY-MM-DD
  returnedDate: string | null;
  status: BaseIssueStatus; // What the database recognizes
  
  // Optional metadata populated during joined lookups
  memberEmail?: string;
  memberPhone?: string;
  bookAuthor?: string;
}

// 🏷️ 4. Dynamic Auto-Suggest Lookup Models
export interface MemberLookup {
  member_id: string;
  name: string;
  phone_number: string;
  membership_status: "ACTIVE" | "EXPIRED";
  expiry_date: string;
  plan_name: string;
  maxAllowed: number;
  currentBorrows: number;
  compliance: SystemCompliance; // ✨ Added to support your modal's restriction blockades
}

export interface BookLookup {
  book_id: string;
  title: string;
  author: string;
  available_copies: number;
  compliance: SystemCompliance; // ✨ Added to safely lock down zero-stock selections
}

// 🏷️ 5. Real-time Allocation Limits Metrics
export interface MemberAllowanceMetrics {
  currentBorrows: number;
  maxAllowed: number;
  isExpired: boolean;
  expiryDate: string;
  complianceStatus: ComplianceStatus;
  complianceMessage: string;
}