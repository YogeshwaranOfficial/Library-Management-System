// 1. Body Payloads emitted out from the modal calendar inputs
export interface PayFinePayload {
  fine_id: string;
  paidDate: string | null; // Captures custom dates or defaults to current system date
  paymentMethod: "CASH" | "CARD" | "UPI"; // Enforces payment tracking values
}

// 2. Data Transfer Objects (DTO) returned back across the network to your React views
export interface FineLedgerBreakdown {
  withinPlanDays: number;
  withinPlanFine: number;
  outsidePlanDays: number;
  outsidePlanFine: number;
  isPlanExpiredNow: boolean;
  expiryDate: string | null;
}

export interface FineResponseDTO {
  fine_id: string;
  issue_id: string;
  member_id: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  book_id: string;
  bookTitle: string;
  bookAuthor: string;
  borrowedDate: string | null;
  actualReturnDate: string | null;
  actualReturnDueDate: string | null;
  delayed_days: number;
  fine_amount: number;
  paid_status: boolean;
  membershipActive: boolean;
  breakdown: FineLedgerBreakdown;
  paidDate: string | null;
  paymentMethod: "CASH" | "CARD" | "UPI" | null;
}