export interface FineComplianceBreakdown {
  withinPlanDays: number;
  withinPlanFine: number;
  outsidePlanDays: number;
  outsidePlanFine: number;
  isPlanExpiredNow: boolean;
  expiryDate: string | null;
}

export interface FineRecord {
  fine_id: string;
  issue_id: string;
  member_id: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  book_id: string;
  bookTitle: string;
  bookAuthor: string;
  borrowedDate: string;
  actualReturnDate: string | null;
  delayed_days: number;
  fine_amount: number;
  paid_status: boolean;
  paid_date: string | null;
  membershipActive: boolean;
  breakdown?: FineComplianceBreakdown;

  // 🟢 Extra properties required by the new FinesPage component:
  actualReturnDueDate?: string; 
  paidDate?: string | null;
  paymentMethod?: "CASH" | "CARD" | "UPI" | null;
  collectedByLibrarian?: string | null;
}