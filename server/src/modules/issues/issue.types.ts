export interface CreateIssuePayload {
  member_id: string;
  book_id: string;
}

export interface ReturnBookPayload {
  issue_id: string;
}