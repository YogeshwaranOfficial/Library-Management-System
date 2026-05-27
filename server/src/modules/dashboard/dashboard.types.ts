export interface DashboardOverview {
  totalBooks: number;
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  issuedBooks: number;
  returnedBooks: number;
  overdueBooks: number;
  unpaidFines: number;
}

export interface PopularBook {
  book_id: string;
  book_name: string;
  lending_count: number;
}

export interface RecentIssue {
  issue_id: string;
  member_name: string;
  book_name: string;
  borrowed_date: Date;
  due_date: Date;
}