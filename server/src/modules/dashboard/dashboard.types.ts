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
export interface OverdueRecord {
  id: string;
  title: string;
  borrowerName: string;
  memberId: string;
  dueDate: Date;
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

export interface DashboardSummaryResponse {
  summary: DashboardSummaryMetrics;
  overdueBooks: OverdueRecord[];
}

export interface WidgetAnalyticsData {
  peakHours: { day: string; count: number }[];
  criticalDeficit: { id: string; name: string; requests: number }[];
  fineVelocity: { collected: number };
  deadStock: { id: string; title: string; shelf: string }[];
  categoryPopularity: { name: string; value: number; color: string }[];
  returnForecast: { date: string; count: number }[];
  engagementLeaderboard: { id: string; name: string; loans: number; onTimeRate: number }[];
  retentionMetrics: { avgDays: number; threshold: number };
}

export interface CompleteDashboardSummaryResponse {
  summary: DashboardSummaryMetrics;
  widgets: WidgetAnalyticsData;
  overdueBooks: OverdueRecord[];
}