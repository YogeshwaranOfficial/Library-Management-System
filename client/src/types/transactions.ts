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
  condition: "GOOD" | "DAMAGED";
  damageDescription?: string;
  
  // Optional metadata populated during joined lookups
  memberEmail?: string;
  memberPhone?: string;
  bookAuthor?: string;
  fineAmount?: number;      // Optional number for outstanding balances
  finePaidStatus?: boolean; // Optional boolean flag tracking payment state
}

export interface DetailedIssueItem {
  issue_id: string;
  status: "ISSUED" | "RETURNED" | "OVERDUE";
  issue_date: string;
  return_date: string | null;
  
  // 🚀 Your new UI audit tracking properties
  condition: "GOOD" | "DAMAGED"; 
  damage_description: string | null; 
  
  member: {
    member_id: string;
    user: {
      name: string;
      gmail: string;
      phone_number: string;
    };
  };
  book: {
    book_id: string;
    book_name: string;
    book_author: string;
    isbn: string;
  };
  created_at: string;
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