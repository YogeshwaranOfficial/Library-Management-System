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
}

// Minimal lookups required for populate selections
export interface MemberLookup { id: string; name: string; }
export interface BookLookup { id: string; title: string; }