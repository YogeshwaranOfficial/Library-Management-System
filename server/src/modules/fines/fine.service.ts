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
    
    // 2. Fallback date parser logic using properties direct from repository literals
    const today = new Date();
    const planExpiryDateStr = fRaw.expiry_date || null; 
    const planStatusStr = fRaw.membership_status || "ACTIVE"; 

    const expiryDate = planExpiryDateStr ? new Date(planExpiryDateStr) : null;
    const isPlanActive = planStatusStr === "ACTIVE" && (expiryDate ? expiryDate >= today : true);

    // 3. Calculate overdue periods safely using the root-level due_date from subquery
    let withinPlanDays = Number(fRaw.delayed_days || 0);
    let outsidePlanDays = 0;

    if (!isPlanActive && expiryDate && fRaw.due_date) {
      const dueDateObj = new Date(fRaw.due_date);
      if (expiryDate > dueDateObj) {
        const msPerDay = 24 * 60 * 60 * 1000;
        withinPlanDays = Math.max(0, Math.floor((expiryDate.getTime() - dueDateObj.getTime()) / msPerDay));
        outsidePlanDays = Math.max(0, Number(fRaw.delayed_days || 0) - withinPlanDays);
      } else {
        withinPlanDays = 0;
        outsidePlanDays = Number(fRaw.delayed_days || 0);
      }
    }

    // 4. Build clean frontend representation payload contract matching repository fields
    return {
      fine_id: fRaw.fine_id || "N/A",
      issue_id: fRaw.issue_id || "N/A",
      member_id: fRaw.member_id || "N/A",
      
      // 🟢 Fixed: Pulling directly from repository subquery alias fields
      memberName: fRaw.memberName || "Unknown Member",
      memberEmail: fRaw.memberEmail || "N/A",
      memberPhone: fRaw.memberPhone || "N/A",
      book_id: fRaw.book_id || "N/A",
      bookTitle: fRaw.bookTitle || "Unknown Book Title",
      bookAuthor: fRaw.bookAuthor || "Unknown Author",
      borrowedDate: fRaw.borrowed_date || null,
      actualReturnDate: fRaw.returned_date || fRaw.actual_return_date || null,
      actualReturnDueDate: fRaw.due_date || null, // 🟢 Directly maps to repo 'due_date'
      
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
      },
      paidDate: fRaw.paid_date || null,
      paymentMethod: fRaw.payment_method || null
    };
  }

  // 🟢 Renamed from getAllFines to getCollectedFines to isolate settled balances
  async getCollectedFines() {
    try {
      const fines = await fineRepository.getCollectedFines();
      return fines.map((f: any) => this.transformFineRecord(f));
    } catch (error: any) {
      throw new AppError(`Collected Fines DB Query failed: ${error.message}`, httpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPendingFines() {
    try {
      const fines = await fineRepository.getPendingFines();
      return fines.map((f: any) => this.transformFineRecord(f));
    } catch (error: any) {
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

  // 🟢 Updated to accept and log the paymentMethod parameter string
  async payFine(fine_id: string, paidDate: string | Date | null, paymentMethod: "CASH" | "CARD" | "UPI") {
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
      payment_method: paymentMethod // 🟢 Logging our new transactional tracking method
    };

    const updatedRecord = await fineRepository.payFine(fine_id, paymentUpdates);
    return this.transformFineRecord(updatedRecord);
  }

  // 🟢 Added to handle the admin/manual override soft or hard deletion mechanics
  async purgeFine(fine_id: string) {
    if (!fine_id) {
      throw new AppError("Fine unique identifier parameter is missing", httpStatus.BAD_REQUEST);
    }

    const fine = await fineRepository.getFineById(fine_id);
    if (!fine) {
      throw new AppError("Fine registry record target not found for erasure", httpStatus.NOT_FOUND);
    }

    try {
      return await fineRepository.purgeFine(fine_id);
    } catch (error: any) {
      throw new AppError(`Invoice Ledger Clearance Error: ${error.message}`, httpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  // 🟢 Added to handle the manual restoration of a settled fine record
  async restoreFine(fine_id: string) {
    if (!fine_id) {
      throw new AppError("Fine unique identifier parameter is missing", httpStatus.BAD_REQUEST);
    }

    // 1. Verify existence
    const fine = await fineRepository.getFineById(fine_id);
    if (!fine) {
      throw new AppError("Fine registry record not found for restoration", httpStatus.NOT_FOUND);
    }

    // 2. Perform restoration logic
    try {
      await fineRepository.restoreFine(fine_id);
      
      // 3. Return the updated record for frontend UI state syncing
      const updatedRecord = await fineRepository.getFineById(fine_id);
      return this.transformFineRecord(updatedRecord);
    } catch (error: any) {
      throw new AppError(`Ledger Restoration Error: ${error.message}`, httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export default new FineService();