import { Request, Response } from "express";
import User from "../../database/models/User.js";
import Member from "../../database/models/Member.js";
import { Op } from "sequelize";
import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/SendResponse.js";

import {
  createMemberService,
  deleteMemberService,
  getAllMembersService,
  getMemberByIdService,
  updateMemberService,
} from "./member.service.js";

export const getAvailableUsersController = asyncHandler(async (req: Request, res: Response) => {
  // 1. Get all user IDs that are already registered in the Member table
  const activeMembers = await Member.findAll({
    attributes: ["user_id"],
    raw: true
  });
  const existingMemberUserIds = activeMembers.map(m => m.user_id);

  // 2. Find all Users whose ID is NOT in that list
  const availableUsers = await User.findAll({
    where: {
      uuid: {
        [Op.notIn]: existingMemberUserIds.length > 0 ? existingMemberUserIds : ["dummy-id"]
      }
    },
    attributes: ["id", "name", "gmail"] 
  });

  res.status(200).json({
    success: true,
    message: "Available users for membership fetched successfully",
    data: availableUsers
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