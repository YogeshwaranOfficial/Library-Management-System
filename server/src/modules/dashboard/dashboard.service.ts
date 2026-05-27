import dashboardRepository from "./dashboard.repository.js";

class DashboardService {
  async getOverview() {
    return dashboardRepository.getOverview();
  }

  async getPopularBooks() {
    return dashboardRepository.getPopularBooks();
  }

  async getRecentIssues() {
    return dashboardRepository.getRecentIssues();
  }

  async getMonthlyFineCollection() {
    return dashboardRepository.getMonthlyFineCollection();
  }
}

export default new DashboardService();