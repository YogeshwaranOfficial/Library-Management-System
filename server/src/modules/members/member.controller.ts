import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/SendResponse.js";

import {
  createMemberService,
  deleteMemberService,
  getAllMembersService,
  getMemberByIdService,
  updateMemberService,
  getEligibleUsersForMemberService, // 💡 Imported the missing service engine link
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

export const getAllMembersController =
  asyncHandler(async (req: Request, res: Response) => {
    const query = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      search: req.query.search as string,
      plan: req.query.plan,      
      status: req.query.status,   
      membership_status:
        req.query.membership_status as
          | "ACTIVE"
          | "EXPIRED",
    };

    const result =
      await getAllMembersService(query);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Members fetched successfully",
      data: result,
    });
  });

export const getMemberByIdController =
  asyncHandler(async (req: Request, res: Response) => {
    const result =
      await getMemberByIdService(
        req.params.id as any
      );

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