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
      message: "Circulation master log feed fetched successfully",
      data: result,
    });
  }
);


// 2. Fetch Member Checkout Limits and Real-Time Load (GET /issues/member-allowance/:memberId)
export const getMemberAllowanceMetricsController = asyncHandler(
  async (req: Request, res: Response) => {
    // 🛡️ FIX: Added "as string" to satisfy TypeScript type guards
    const memberId = req.params.memberId as string; 
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
    // 🛡️ Reading camelCase parameters sent directly from frontend saveMutation
    const { memberId, bookId, dueDate } = req.body;

    const result = await issueService.borrowBook({
      memberId,
      bookId,
      dueDate,
    });

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Book borrowed successfully",
      data: result,
    });
  }
);

// 4. Update Ongoing Active Asset Allocation Settings (PUT /issues/:id)
export const updateIssueParametersController = asyncHandler(
  async (req: Request, res: Response) => {
    // 🛡️ FIX: Added "as string" to satisfy TypeScript type guards
    const id = req.params.id as string;
    const { memberId, bookId, dueDate } = req.body;

    const result = await issueService.updateIssueParameters(id, {
      memberId,
      bookId,
      dueDate,
    });

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
    // 🛡️ Reading camelCase properties sent from returnBookMutation
    const { issueId, returnedDate } = req.body;

    const result = await issueService.returnBook(issueId, returnedDate);

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
    const memberId = req.params.memberId as string;
    const result = await issueService.getMemberIssues(memberId);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Issues fetched successfully",
      data: result,
    });
  }
);