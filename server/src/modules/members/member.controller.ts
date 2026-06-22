import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/SendResponse.js";
import { MemberQuery } from "./member.types.js";

import {
  createMemberService,
  deleteMemberService,
  getAllMembersService,
  getMemberByIdService,
  updateMemberService,
  searchMembersByNameService,
  getEligibleUsersForMemberService,
  getAllPlansWithMetricsService,
} from "./member.service.js";

// 💡 FEATURE UPDATED: Refactored to leverage clean service-to-repo patterns with explicit READER filter constraints
export const getAvailableUsersController = asyncHandler(async (req: Request, res: Response) => {
  const availableUsers = await getEligibleUsersForMemberService();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Available reader users for membership fetched successfully",
    data: availableUsers,
  });
});

export const createMemberController =
  asyncHandler(async (req: Request, res: Response) => {
    const result =
      await createMemberService(req.body);

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Member created successfully",
      data: result,
    });
  });

export const getAllMembersController = asyncHandler(async (req: Request, res: Response) => {
 
  const query = req.query as unknown as MemberQuery;

  const result = await getAllMembersService(query);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Members fetched successfully",
    data: result,
  });
});

export const getMemberByIdController = asyncHandler(async (req: Request, res: Response) => {
  const memberId = req.params.id as string;
  const result = await getMemberByIdService(memberId);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Member fetched successfully",
    data: result,
  });
});

export const updateMemberController =
  asyncHandler(async (req: Request, res: Response) => {
    const result =
      await updateMemberService(
        req.params.id as any,
        req.body
      );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Member updated successfully",
      data: result,
    });
  });

export const deleteMemberController =
  asyncHandler(async (req: Request, res: Response) => {
    const result =
      await deleteMemberService(
        req.params.id as any
      );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Member deleted successfully",
      data: result,
    });
  });

/**
 * ✨ NEW: Intercepts lookups sent by the TransactionModal dropdown suggestions query
 * Handles endpoint: GET /api/v1/members/search?q=...
 */
export const searchMembersByNameController = asyncHandler(async (req: Request, res: Response) => {
  const searchString = req.query.q as string;

  const detailedMatches = await searchMembersByNameService(searchString);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Library member directory queried successfully matching criteria.",
    data: detailedMatches,
  });
});

// ===================================================================================
// 🛠️ PATCHED: Keeping search string parameter mapping to resolve Error #2 compiler break
// ===================================================================================
export const getAllPlansWithMetricsController = asyncHandler(async (req: Request, res: Response) => {
  const searchTerm = req.query.search as string;

  // Passing just the search string back to your service to fix your second TypeScript parameter type restriction
  const result = await getAllPlansWithMetricsService(searchTerm);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Membership plans analytics dashboard matrices structural feed compiled.",
    data: result,
  });
});