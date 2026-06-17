import httpStatus from "http-status-codes";
import AppError from "../../utils/AppError.js";
import fineRepository from "./fine.repository.js";
import { sequelize } from "../../database/index.js";
import Issue from "../../database/models/Issue.js";
import Book from "../../database/models/Book.js";
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

  // 🌟 START ACID TRANSACTION ATOMIC SHIELD
  const transaction = await sequelize.transaction();

  try {
    // 1. ✅ FIXED: Run the fine update directly via Fine model to keep TypeScript happy with the transaction context
    await Fine.update(paymentUpdates, {
      where: { fine_id }, // Check if your fine primary key is named fine_id or id
      transaction
    });

    // 2. Fetch the fresh state of the fine record to ensure synchronization
    const updatedRecord = await fineRepository.getFineById(fine_id);

    // 3. Cascade update the Issue ledger records if an issue_id is attached
    if (fine.issue_id) {
      // Look up using your explicit primary key: issue_id
      const associatedIssue = await Issue.findByPk(fine.issue_id, { transaction });

      // ✅ FIXED: Using 'issue_status' instead of 'status' to match your model declaration
      if (associatedIssue && associatedIssue.issue_status === "OVERDUE") {
        
        // A. Automatically update status from OVERDUE to RETURNED
        await Issue.update(
          { 
            issue_status: "RETURNED", // ✅ FIXED
            returned_date: validatedExecutionDate 
          },
          { 
            where: { issue_id: fine.issue_id }, // ✅ FIXED: Explicitly referencing the model primary key
            transaction 
          }
        );

        // B. Increment the stock of copies available on library shelves
        if (associatedIssue.book_id) {
          await Book.increment(
            { available_copies: 1 },
            { 
              where: { book_id: associatedIssue.book_id },
              transaction 
            }
          );
        }
      }
    }

    // Commit changes safely to the database
    await transaction.commit();
    
    return this.transformFineRecord(updatedRecord!);

  } catch (error) {
    // Roll back if any database error occurs
    await transaction.rollback();
    throw error;
  }
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

  // 🌟 ACID TRANSACTION SHIELD: If the book count decrement fails, the fine doesn't change
  const transaction = await sequelize.transaction();

  try {
    // 1. Reset the Fine metrics natively using the Fine model inside the transaction
    await Fine.update(
      {
        paid_status: false,
        paid_date: null,
        payment_method: null
      },
      {
        where: { fine_id },
        transaction
      }
    );

    // 2. Locate the linked Issue tracking record
    if (fine.issue_id) {
      const associatedIssue = await Issue.findByPk(fine.issue_id, { transaction });

      // We only reverse it if the current status is marked as RETURNED
      if (associatedIssue && associatedIssue.issue_status === "RETURNED") {
        
        // A. REVERSE STATUS: Shift from RETURNED back to OVERDUE and wipe out the returned_date timestamp
        await Issue.update(
          { 
            issue_status: "OVERDUE",
            returned_date: null // Book is no longer officially returned
          },
          { 
            where: { issue_id: fine.issue_id },
            transaction 
          }
        );

        // B. CORRECT SHELF STOCK: Decrement the copies back down by 1 since the book is still checked out
        if (associatedIssue.book_id) {
          await Book.decrement(
            { available_copies: 1 },
            { 
              where: { book_id: associatedIssue.book_id },
              transaction 
            }
          );
        }
      }
    }

    // Commit all changes simultaneously
    await transaction.commit();

    // Fetch and transform the fresh record state to send back to your frontend template
    const updatedRecord = await fineRepository.getFineById(fine_id);
    return this.transformFineRecord(updatedRecord!);

  } catch (error: any) {
    // Roll back changes cleanly if a database constraint locks up
    await transaction.rollback();
    throw new AppError(`Ledger Restoration Error: ${error.message}`, httpStatus.INTERNAL_SERVER_ERROR);
  }
}

  /**
   * ⏰ DUAL-TRIGGER FINE ACCRUAL SYNC ENGINE
   * Fixed to calculate pure calendar days, removing millisecond/hour offsets.
   */
  async runFineAccrualSync(targetMemberId?: string) {
    console.log(`🚀 Starting Fine Accrual Sync (${targetMemberId ? `Targeted: ${targetMemberId}` : 'Global Midnight Run'})...`);
    const today = new Date();

    await sequelize.transaction(async (t) => {
      // Look for any active issues where the book isn't returned yet, 
      // and the due_date is less than or equal to today.
      const issueConditions: any = {
        returned_date: null,
        due_date: { [Symbol.for("lte") as any]: today }
      };

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

        // 🧠 THE FIX: Strip out time values (hours, minutes, seconds) completely
        // Set both dates strictly to midnight (00:00:00) so we calculate pure calendar days.
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const dueDateObj = new Date(issue.due_date);
        const dueDateMidnight = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate());

        const msPerDay = 24 * 60 * 60 * 1000;
        
        // Use Math.floor on midnight values to get an exact mathematical calendar count
        const totalDelayedDays = Math.max(0, Math.floor((todayMidnight.getTime() - dueDateMidnight.getTime()) / msPerDay));
        
        // If they changed the due date to today or a future date, delayed days is 0. Skip it.
        if (totalDelayedDays === 0) continue;

        let withinPlanDays = totalDelayedDays;
        let outsidePlanDays = 0;

        if (!isPlanActiveNow && expiryDate) {
          const expiryMidnight = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
          if (expiryMidnight > dueDateMidnight) {
            withinPlanDays = Math.max(0, Math.floor((expiryMidnight.getTime() - dueDateMidnight.getTime()) / msPerDay));
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
          // If the fine record exists but isn't paid, recalculate it dynamically
          await existingFine.update({
            delayed_days: totalDelayedDays,
            fine_amount: totalComputedFineAmount
          }, { transaction: t });
        }
      }
    });
  }

  /**
   * 🔄 ONE-TIME MASTER LEDGER RECALCULATION TOOL
   * Loops through all existing unpaid fines to align old records perfectly 
   * with the corrected calendar-midnight layout mechanics.
   */
  async forceRecalculateAllExistingFines() {
    console.log("⚠️ Starting full database fine metrics recalculation sync...");
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const msPerDay = 24 * 60 * 60 * 1000;

    let updatedCount = 0;
    let purgedCount = 0;

    await sequelize.transaction(async (t) => {
      // 1. Fetch all unpaid fines along with their core issue and member context data
      const unpaidFines = await Fine.findAll({
        where: { paid_status: false },
        include: [
          {
            model: Issue,
            as: "issue", // Make sure this matches your Fine -> Issue association alias
            include: [
              {
                model: Member,
                as: "member",
                include: [{ model: MembershipPlan, as: "membership_plan" }]
              }
            ]
          }
        ],
        transaction: t
      });

      for (const fine of unpaidFines) {
        const issue = (fine as any).issue;
        
        // Safety Fallback: If the underlying issue record was missing, clean up the dead fine row
        if (!issue) {
          await fine.destroy({ transaction: t });
          purgedCount++;
          continue;
        }

        const member = issue.member;
        const planExpiryDateStr = member?.expiry_date;
        const planStatusStr = member?.membership_status || "ACTIVE";
        const expiryDate = planExpiryDateStr ? new Date(planExpiryDateStr) : null;
        const isPlanActiveNow = planStatusStr === "ACTIVE" && (expiryDate ? expiryDate >= today : true);

        // Calculate pure calendar days difference using standard midnights
        const dueDateObj = new Date(issue.due_date);
        const dueDateMidnight = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate());
        
        const totalDelayedDays = Math.max(0, Math.floor((todayMidnight.getTime() - dueDateMidnight.getTime()) / msPerDay));

        // 🧠 CRITICAL FIX: If the new math shows it shouldn't have a fine, purge the rogue record!
        if (totalDelayedDays === 0 || issue.returned_date !== null) {
          await fine.destroy({ transaction: t });
          purgedCount++;
          continue;
        }

        // Calculate tiered rates (Split values)
        let withinPlanDays = totalDelayedDays;
        let outsidePlanDays = 0;

        if (!isPlanActiveNow && expiryDate) {
          const expiryMidnight = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
          if (expiryMidnight > dueDateMidnight) {
            withinPlanDays = Math.max(0, Math.floor((expiryMidnight.getTime() - dueDateMidnight.getTime()) / msPerDay));
            outsidePlanDays = Math.max(0, totalDelayedDays - withinPlanDays);
          } else {
            withinPlanDays = 0;
            outsidePlanDays = totalDelayedDays;
          }
        }

        const totalComputedFineAmount = (withinPlanDays * 10) + (outsidePlanDays * 20);

        // Apply changes directly to database tracking states
        await fine.update({
          delayed_days: totalDelayedDays,
          fine_amount: totalComputedFineAmount
        }, { transaction: t });
        
        updatedCount++;
      }
    });

    console.log(`✅ Repair Finished! Recalculated: ${updatedCount} rows | Purged Stale Rows: ${purgedCount}`);
    return { recalculated: updatedCount, purged: purgedCount };
  }

}

export default new FineService();