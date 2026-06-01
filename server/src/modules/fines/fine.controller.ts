import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/SendResponse.js";
import fineService from "./fine.service.js";
import { PayFinePayload } from "./fine.types.js";

export const getAllFinesController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await fineService.getAllFines();

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Fines fetched successfully",
      data: result,
    });
  }
);

export const payFineController = asyncHandler(
  async (req: Request<{}, {}, PayFinePayload>, res: Response) => {
    const result = await fineService.payFine(req.body.fine_id);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Fine paid successfully",
      data: result,
    });
  }
);

export const getPendingFinesController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await fineService.getPendingFines();

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Pending fines fetched successfully",
      data: result,
    });
  }
);

export const getMemberFinesController = asyncHandler(
  async (req: Request, res: Response) => {
    const memberId = req.params.memberId as string;
    const result = await fineService.getMemberFines(memberId);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Member fines fetched successfully",
      data: result,
    });
  }
);