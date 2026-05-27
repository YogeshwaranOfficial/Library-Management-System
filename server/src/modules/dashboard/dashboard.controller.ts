import { Request, Response } from "express";
import httpStatus from "http-status-codes";

import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/SendResponse.js";

import dashboardService from "./dashboard.service.js";

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