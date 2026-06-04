export type IssueStatus = "BORROWED" | "RETURNED" | "OVERDUE";

export interface BookIssueRecord {
  id: string; // Maps to issue_id
  memberId: string;
  memberName: string;
  bookId: string;
  bookTitle: string;
  borrowedDate: string;
  dueDate: string;
  returnedDate: string | null;
  status: IssueStatus;
  // Extra detailed profile contexts populated for the inspection popup card
  memberEmail?: string;
  memberPhone?: string;
  bookAuthor?: string;
}

export interface MemberLookup {
  member_id: string;
  name: string;
  phone_number: string;
  membership_status: "ACTIVE" | "EXPIRED";
  expiry_date: string;
}

export interface BookLookup {
  book_id: string;
  title: string;
  author: string;
}

export interface MemberAllowanceMetrics {
  currentBorrows: number;
  maxAllowed: number;
}