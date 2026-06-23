export interface OverdueRecord {
  id: string;
  title: string;
  borrowerName: string;
  memberId: string;
  dueDate: string;
  daysLate: number;
  fineAmount: number;
}

export interface DashboardSummaryMetrics {
  totalBooks: number;
  totalCopies: number;
  availableBooks: number;
  activeMembers: number;
  overdueCount: number;
  overduePercentage: number;
  totalOutstandingFines: number;
}

export interface DashboardApiResponse {
  summary: DashboardSummaryMetrics;
  overdueBooks: OverdueRecord[];
}