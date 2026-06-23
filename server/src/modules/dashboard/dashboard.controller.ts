import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { CompleteDashboardSummaryResponse } from "./dashboard.types.js";
import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/SendResponse.js";
import dashboardService from "./dashboard.service.js";// Match your custom async wrapper utility

/**
 * @desc    Fetches the combined analytical metrics and widget datasets for the central dashboard
 * @route   GET /api/dashboard/summary
 * @access  Private (Librarian Only)
 */
export const getDashboardSummaryController = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    // 💡 Executing the centralized class instance method
    const result: CompleteDashboardSummaryResponse = await dashboardService.getDashboardSummaryService();
    // Return formatted using JSend convention format to feed TanStack query smoothly
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Dashboard summary logs generated cleanly.",
      data: result
    });
  }
);


export const getDashboardOverviewController = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await dashboardService.getOverview();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Dashboard overview fetched successfully",
      data,
    });
  }
);

export const getPopularBooksController = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await dashboardService.getPopularBooks();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Popular books fetched successfully",
      data,
    });
  }
);

export const getRecentIssuesController = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await dashboardService.getRecentIssues();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Recent issues fetched successfully",
      data,
    });
  }
);

export const getMonthlyFineCollectionController = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await dashboardService.getMonthlyFineCollection();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Monthly fine analytics fetched successfully",
      data,
    });
  }
);