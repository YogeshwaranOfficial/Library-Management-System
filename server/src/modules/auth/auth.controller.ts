import { Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler.js";

import sendResponse from "../../utils/SendResponse.js";

import {
  loginUserService,
  registerUserService,
} from "./auth.service.js";

export const registerUserController =
  asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const result =
        await registerUserService(req.body);

    sendResponse(res, {
      success: true, 
      statusCode: 201,
      message: "User registered successfully",
      data: result,
    });
    }
  );

export const loginUserController =
  asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const result =
        await loginUserService(req.body);

      sendResponse(res, {
      success: true, 
      statusCode: 200,
      message: "User logged in duccessfully",
      data: result,
    });
    }
  );

export const getProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Profile fetched successfully",
      data: req.user!,
    });
  }
);