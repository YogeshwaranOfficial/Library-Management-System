import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/SendResponse.js";
import fineService from "./fine.service.js";

// Make sure your payload type interface supports the optional incoming paidDate property
interface PayFinePayload {
  fineId?: string;
  fine_id?: string;
  paidDate?: string;
}

// 1. Fetch All Fines Controller
export const getAllFinesController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await fineService.getAllFines();

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Fines historical database records fetched successfully",
      data: result,
    });
  }
);

// 2. Pay Fine Controller
// Inside backend/src/features/fines/fine.controller.ts
// 2. Pay Fine Controller
// Route Contract Target: PATCH /fines/pay
export const payFineController = asyncHandler(
  async (req: Request<{}, {}, PayFinePayload>, res: Response) => {
    const { fine_id, paidDate } = req.body;

    // Type Guard: Defends against undefined and satisfies strict TypeScript compilers
    if (!fine_id) {
      res.status(400).json({
        success: false,
        message: "Fine identification parameter (fine_id) is required."
      });
      return;
    }

    // TypeScript now knows with 100% certainty that fine_id is a string here
    const result = await fineService.payFine(fine_id, paidDate || null);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Fine paid successfully",
      data: result,
    });
  }
);
// 3. Fetch Pending Uncollected Fines Controller
export const getPendingFinesController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await fineService.getPendingFines();

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Pending invoices fetched successfully",
      data: result,
    });
  }
);

// 4. Fetch Fines by Specific Member Profile
export const getMemberFinesController = asyncHandler(
  async (req: Request, res: Response) => {
    const memberId = req.params.memberId as string;
    const result = await fineService.getMemberFines(memberId);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Member fine profile portfolio loaded successfully",
      data: result,
    });
  }
);