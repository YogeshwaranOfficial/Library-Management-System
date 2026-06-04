import httpStatus from "http-status-codes";
import AppError from "../../utils/AppError.js";
import fineRepository from "./fine.repository.js";

class FineService {
  /**
   * DEFENSIVE RECORD MAPPING:
   * Uses safe fallbacks (`|| {}`) and defaults for every field to ensure 
   * that if an association object is missing, the code doesn't crash with a 500 error.
   */
  private transformFineRecord(f: any) {
    // 1. Convert to plain JS object safely
    const fRaw = f && typeof f.toJSON === "function" ? f.toJSON() : (f || {});
    
    // 2. Safely extract nested properties with fallback objects
    const issue = fRaw.issue || {};
    const member = issue.member || {};
    const book = issue.book || {};
    const plan = member.membership_plan || {};

    // 3. Fallback date parser logic
    const today = new Date();
    const planExpiryDateStr = member.expiry_date || member.end_date || null; 
    const planStatusStr = member.membership_status || member.status || "ACTIVE"; 

    const expiryDate = planExpiryDateStr ? new Date(planExpiryDateStr) : null;
    const isPlanActive = planStatusStr === "ACTIVE" && (expiryDate ? expiryDate >= today : true);

    // 4. Calculate overdue periods safely
    let withinPlanDays = Number(fRaw.delayed_days || 0);
    let outsidePlanDays = 0;

    if (!isPlanActive && expiryDate && issue.due_date) {
      const dueDateObj = new Date(issue.due_date);
      if (expiryDate > dueDateObj) {
        const msPerDay = 24 * 60 * 60 * 1000;
        withinPlanDays = Math.max(0, Math.floor((expiryDate.getTime() - dueDateObj.getTime()) / msPerDay));
        outsidePlanDays = Math.max(0, Number(fRaw.delayed_days || 0) - withinPlanDays);
      } else {
        withinPlanDays = 0;
        outsidePlanDays = Number(fRaw.delayed_days || 0);
      }
    }

    // 5. Build clean frontend representation payload contract
    return {
      fine_id: fRaw.fine_id || "N/A",
      issue_id: fRaw.issue_id || "N/A",
      member_id: issue.member_id || "N/A",
      memberName: member.name || "Unknown Member",
      memberEmail: member.email || "N/A",
      memberPhone: member.phone_number || member.phone || "N/A",
      book_id: issue.book_id || "N/A",
      bookTitle: book.title || "Unknown Book Title",
      bookAuthor: book.author || "Unknown Author",
      borrowedDate: issue.borrowed_date || null,
      actualReturnDate: issue.returned_date || issue.actual_return_date || null,
      delayed_days: Number(fRaw.delayed_days || 0),
      fine_amount: Number(fRaw.fine_amount || 0), 
      paid_status: Boolean(fRaw.paid_status || false),
      paid_date: fRaw.paid_date || null,
      membershipActive: isPlanActive,
      breakdown: {
        withinPlanDays,
        withinPlanFine: withinPlanDays * 10,
        outsidePlanDays,
        outsidePlanFine: outsidePlanDays * 20,
        isPlanExpiredNow: !isPlanActive,
        expiryDate: planExpiryDateStr
      }
    };
  }

  async getAllFines() {
    try {
      const fines = await fineRepository.getAllFines();
      return fines.map((f: any) => this.transformFineRecord(f));
    } catch (error: any) {
      throw new AppError(`DB Query failed: ${error.message}`, httpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPendingFines() {
    try {
      const fines = await fineRepository.getPendingFines();
      return fines.map((f: any) => this.transformFineRecord(f));
    } catch (error: any) {
      // Exposes the exact Sequelize SQL compile message back to the network response stream
      throw new AppError(`Pending Fines Query Error: ${error.message}`, httpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getMemberFines(member_id: string) {
    if (!member_id) {
      throw new AppError("Member identifier parameter missing", httpStatus.BAD_REQUEST);
    }
    try {
      const fines = await fineRepository.getMemberFines(member_id);
      return fines.map((f: any) => this.transformFineRecord(f));
    } catch (error: any) {
      throw new AppError(`Member Fines Query Error: ${error.message}`, httpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async payFine(fine_id: string, paidDate: string | Date | null) {
    const fine = await fineRepository.getFineById(fine_id);

    if (!fine) {
      throw new AppError("Fine registry record not found", httpStatus.NOT_FOUND);
    }

    if (fine.paid_status) {
      throw new AppError("This fine has already been settled", httpStatus.BAD_REQUEST);
    }

    const validatedExecutionDate = paidDate ? new Date(paidDate) : new Date();

    const paymentUpdates = {
      paid_status: true,
      paid_date: validatedExecutionDate,
    };

    const updatedRecord = await fineRepository.payFine(fine_id, paymentUpdates);
    return this.transformFineRecord(updatedRecord);
  }
}

export default new FineService();