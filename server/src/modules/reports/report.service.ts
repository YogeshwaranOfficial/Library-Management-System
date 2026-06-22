// src/modules/reports/report.service.ts
import { ReportRepository } from "./report.repository.js";
import { ReportQueryParams, DependentOptionsParams } from "./report.types.js";

export class ReportService {
  private reportRepository: ReportRepository;

  constructor() {
    this.reportRepository = new ReportRepository();
  }

  /**
   * Fetches step 2 dropdown elements from transaction logs
   */
  async getDependentOptions(params: DependentOptionsParams) {
    return await this.reportRepository.getDependentOptions(params);
  }

  /**
   * Compiles matrix values and translates structural formats for the frontend
   */
  async getDynamicReport(params: ReportQueryParams) {
    // 1. Fetch raw query blocks from the DB layer and explicitly handle type enforcement overrides
    const reportData: any = await this.reportRepository.generateDynamicReport(params as any);
    
    const { pivot, duration, profile, records } = reportData;

    // 2. Transform the profile block data contracts cleanly
    let formattedProfile: any = null;
    if (pivot === "MEMBER") {
      formattedProfile = {
        id: String(profile?.member_id || ""),
        name: profile?.user?.name || "Unknown Member Profile",
        phone: profile?.user?.phone_number || "N/A",
        email: profile?.user?.gmail || "N/A",
        extraIdentifier: `Membership Tier Status: ${profile?.membership_status || "INACTIVE"}`
      };
    } else {
      formattedProfile = {
        id: String(profile?.book_id || ""),
        name: profile?.book_name || "Unknown Title",
        phone: profile?.book_author || "Unknown Author",
        email: `ISBN: ${profile?.isbn || "N/A"}`,
      };
    }

    // 3. Map database ledger rows to match frontend specifications
    const formattedLogs = (records || []).map((issue: any) => ({
      id: String(issue.issue_id || issue.id),
      member: issue.member?.user?.name || "Unknown Member",
      book: issue.book?.book_name || "Unknown Book Title",
      date: issue.borrowed_date,
      dueDate: issue.due_date,
      returnDate: issue.returned_date || (issue.issue_status === "BORROWED" ? "Not Returned Yet" : "N/A"),
      status: issue.issue_status,
      condition: issue.condition || "Nil",
      fine: issue.fine ? `$${issue.fine.fine_amount}` : "No Fine",
    }));

    // 4. Return formatted data payload to the controller
    return {
      type: pivot,
      duration,
      profile: formattedProfile,
      logs: formattedLogs,
    };
  }
}