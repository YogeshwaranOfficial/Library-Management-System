import dashboardRepository from "./dashboard.repository.js";
import { RecentIssue } from "./dashboard.types.js";

class DashboardService {
  async getOverview() {
    return dashboardRepository.getOverview();
  }

  async getPopularBooks() {
    return dashboardRepository.getPopularBooks();
  }

  async getRecentIssues(): Promise<RecentIssue[]> {
    const rawIssues = await dashboardRepository.getRecentIssues();
    
    // Flatten out the Sequelize nested model structures into your exact frontend Type
    return rawIssues.map((issue: any) => ({
      issue_id: issue.issue_id,
      member_name: issue.member?.user?.name || "Unknown Member",
      book_name: issue.book?.book_name || "Unknown Book",
      borrowed_date: issue.borrowed_date,
      due_date: issue.due_date,
    }));
  }

  async getMonthlyFineCollection() {
    return dashboardRepository.getMonthlyFineCollection();
  }
}

export default new DashboardService();