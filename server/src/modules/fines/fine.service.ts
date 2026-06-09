import httpStatus from "http-status-codes";
import AppError from "../../utils/AppError.js";
import fineRepository from "./fine.repository.js";
import { sequelize } from "../../database/index.js";
import Issue from "../../database/models/Issue.js";
import Member from "../../database/models/Member.js";
import MembershipPlan from "../../database/models/MembershipPlan.js";
import Fine from "../../database/models/Fine.js";
import { v4 as uuidv4 } from "uuid";


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
      
      memberName: fRaw.memberName || "Unknown Member",
      memberEmail: fRaw.memberEmail || "N/A",
      memberPhone: fRaw.memberPhone || "N/A",
      book_id: fRaw.book_id || "N/A",
      bookTitle: fRaw.bookTitle || "Unknown Book Title",
      bookAuthor: fRaw.bookAuthor || "Unknown Author",
      borrowedDate: fRaw.borrowed_date || null,
      actualReturnDate: fRaw.returned_date || fRaw.actual_return_date || null,
      actualReturnDueDate: fRaw.due_date || null,
      
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
      payment_method: paymentMethod
    };

    const updatedRecord = await fineRepository.payFine(fine_id, paymentUpdates);
    return this.transformFineRecord(updatedRecord);
  }

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

  async restoreFine(fine_id: string) {
    if (!fine_id) {
      throw new AppError("Fine unique identifier parameter is missing", httpStatus.BAD_REQUEST);
    }

    const fine = await fineRepository.getFineById(fine_id);
    if (!fine) {
      throw new AppError("Fine registry record not found for restoration", httpStatus.NOT_FOUND);
    }

    try {
      await fineRepository.restoreFine(fine_id);
      const updatedRecord = await fineRepository.getFineById(fine_id);
      return this.transformFineRecord(updatedRecord);
    } catch (error: any) {
      throw new AppError(`Ledger Restoration Error: ${error.message}`, httpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * ⏰ BACKGROUND DAEMON AUTOMATED ENGINE
   * Runs nightly to dynamically calculate accrual amounts across your split-rate structure:
   * Days inside Active Plan window -> ₹10/day | Days outside/after Plan Expiry -> ₹20/day
   */
/**
   * ⏰ DUAL-TRIGGER FINE ACCRUAL SYNC ENGINE
   * Can be triggered globally by midnight cron, or targeted via member_id for instant manual overrides!
   */
  async runFineAccrualSync(targetMemberId?: string) {
    console.log(`🚀 Starting Fine Accrual Sync (${targetMemberId ? `Targeted: ${targetMemberId}` : 'Global Midnight Run'})...`);
    const today = new Date();

    await sequelize.transaction(async (t) => {
      // 🟢 Build dynamic conditions based on target
      const issueConditions: any = {
        returned_date: null,
        due_date: { [Symbol.for("lte") as any]: today }
      };

      // If triggered manually by a librarian update, lock it down to just this member
      if (targetMemberId) {
        issueConditions.member_id = targetMemberId;
      }

      const overdueIssues = await Issue.findAll({
        where: issueConditions,
        include: [
          {
            model: Member,
            as: "member",
            include: [{ model: MembershipPlan, as: "membership_plan" }]
          }
        ],
        transaction: t
      });

      for (const issue of overdueIssues) {
        const member = (issue as any).member;
        const planExpiryDateStr = member?.expiry_date;
        const planStatusStr = member?.membership_status || "ACTIVE";

        const expiryDate = planExpiryDateStr ? new Date(planExpiryDateStr) : null;
        const isPlanActiveNow = planStatusStr === "ACTIVE" && (expiryDate ? expiryDate >= today : true);

        const dueDateObj = new Date(issue.due_date);
        const msPerDay = 24 * 60 * 60 * 1000;
        const totalDelayedDays = Math.ceil((today.getTime() - dueDateObj.getTime()) / msPerDay);
        
        let withinPlanDays = totalDelayedDays;
        let outsidePlanDays = 0;

        if (!isPlanActiveNow && expiryDate) {
          if (expiryDate > dueDateObj) {
            withinPlanDays = Math.max(0, Math.floor((expiryDate.getTime() - dueDateObj.getTime()) / msPerDay));
            outsidePlanDays = Math.max(0, totalDelayedDays - withinPlanDays);
          } else {
            withinPlanDays = 0;
            outsidePlanDays = totalDelayedDays;
          }
        }

        const totalComputedFineAmount = (withinPlanDays * 10) + (outsidePlanDays * 20);

        const existingFine = await Fine.findOne({
          where: { issue_id: issue.issue_id },
          transaction: t
        });

        if (!existingFine) {
          await Fine.create({
            fine_id: uuidv4(),
            issue_id: issue.issue_id,
            delayed_days: totalDelayedDays,
            fine_amount: totalComputedFineAmount,
            paid_status: false
          }, { transaction: t });
        } else if (!existingFine.paid_status) {
          await existingFine.update({
            delayed_days: totalDelayedDays,
            fine_amount: totalComputedFineAmount
          }, { transaction: t });
        }
      }
    });
  }
}

export default new FineService();