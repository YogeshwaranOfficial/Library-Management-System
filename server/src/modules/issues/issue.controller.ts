import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/SendResponse.js";
import issueService from "./issue.service.js";

// 1. Get Main Circulation Feed Logs (GET /issues)
export const getAllIssuesFeedController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await issueService.getAllIssuesFeed();

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "All issues returned to frontend successfully",
      data: result,
    });
  }
);

// 2. Fetch Member Checkout Limits and Real-Time Load (GET /issues/member-allowance/:memberId & GET /issues/member-stats/:memberId)
export const getMemberAllowanceMetricsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { memberId } = req.params as { memberId: string };
    const result = await issueService.getMemberAllowanceMetrics(memberId);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Member allowance metrics retrieved successfully",
      data: result,
    });
  }
);

// 3. Issue a Book Voucher / Borrow Action (POST /issues/borrow)
export const borrowBookController = asyncHandler(
  async (req: Request, res: Response) => {
    const { memberId, bookId, borrowDate, dueDate } = req.body as {
      memberId: string;
      bookId: string;
      borrowDate?: string;
      dueDate: string;
    };

    const servicePayload = {
      memberId,
      bookId,
      dueDate,
      ...(borrowDate ? { borrowDate } : {})
    };

    const result = await issueService.borrowBook(servicePayload);

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Book borrowed successfully",
      data: result,
    });
  }
);

// 4. Update Ongoing Active Asset Allocation Settings (PUT /issues/:id & PATCH /issues/:id)
export const updateIssueParametersController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { memberId, bookId, borrowDate, dueDate, status, returnedDate, condition, damageDescription } = req.body;

    const servicePayload = {
      ...(memberId ? { memberId } : {}),
      ...(bookId ? { bookId } : {}),
      ...(borrowDate ? { borrowDate } : {}),
      ...(dueDate ? { dueDate } : {}),
      ...(status ? { status } : {}),
      ...(returnedDate !== undefined ? { returnedDate } : {}),
      ...(condition ? {condition} : {}),
      ...(damageDescription ? {damageDescription} : {})
    };

    // This handles both regular adjustments AND the full return rollback engine seamlessly!
    const result = await issueService.updateIssueParameters(id, servicePayload);

    // Instant Fine Sync event triggers check here...
    const targetMemberId = result?.member_id;
    if (targetMemberId) {
      try {
        const { default: fineService } = await import("../fines/fine.service.js");
        await fineService.runFineAccrualSync(targetMemberId);
      } catch (err) {
        console.error("❌ Failed to calculate instant fine:", err);
      }
    }

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Circulation parameters synchronized successfully",
      data: result,
    });
  }
);
// 5. Close/Process Active Asset Return (POST /issues/return)
export const returnBookController = asyncHandler(
  async (req: Request, res: Response) => {
    const { 
      issueId, 
      returnedDate, 
      condition, 
      description 
    } = req.body as { 
      issueId: string; 
      returnedDate?: string; 
      condition: "GOOD" | "DAMAGED";
      description?: string;
    };

    // 🚀 Passing condition and description into service layer
    const result = await issueService.returnBook(issueId, returnedDate, condition, description);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Book returned safely! Moved to history records logs.",
      data: result,
    });
  }
);

// 6. Get Historical Ledger logs for individual Member (GET /issues/member/:memberId)
export const getMemberIssuesController = asyncHandler(
  async (req: Request, res: Response) => {
    const { memberId } = req.params as { memberId: string };
    const result = await issueService.getMemberIssues(memberId);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Issues fetched successfully",
      data: result,
    });
  }
);

// 7. Delete a single issue log permanently
export const deleteSingleIssueController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    
    await issueService.deleteSingleIssue(id);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Circulation record log removed permanently.",
      data: null,
    });
  }
);

// 8. Delete all returned history entries cleanly
export const clearReturnedHistoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const deletedCount = await issueService.clearAllReturnedHistory();

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: `History tracking table cleared cleanly. (${deletedCount} items purged)`,
      data: null,
    });
  }
);

