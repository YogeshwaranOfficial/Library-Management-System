import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import sendResponse from "../../utils/SendResponse.js";
import fineService from "./fine.service.js";

interface PayFinePayload {
  fine_id: string;
  paidDate: string;
  paymentMethod: "CASH" | "CARD" | "UPI";
}

// 1. Fetch Collected Paid Fines History Controller
export const getCollectedFinesController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await fineService.getCollectedFines();
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Fines historical collection database records fetched successfully",
      data: result,
    });
  }
);

// 2. Pay Fine Controller
// 🟢 FIXED: Clean type parameters configuration to eliminate error 1117
export const payFineController = asyncHandler(
  async (req: Request<any, any, PayFinePayload>, res: Response) => {
    const { fine_id, paidDate, paymentMethod } = req.body;

    if (!fine_id) {
      res.status(400).json({
        success: false,
        message: "Fine identification parameter (fine_id) is required."
      });
      return;
    }

    const result = await fineService.payFine(fine_id, paidDate || null, paymentMethod);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "💸 Invoice Ledger Balanced Successfully!",
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

// 5. Purge/Hard Delete Fine Entry Controller
export const purgeFineController = asyncHandler(
  async (req: Request, res: Response) => {
    const fineId = req.params.id as string;
    const result = await fineService.purgeFine(fineId);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Invoice dropped completely from runtime ledger caches.",
      data: result,
    });
  }
);

// 6. Restore Settled Fine Controller
export const restoreFineController = asyncHandler(
  async (req: Request, res: Response) => {
    const fineId = req.params.id as string;

    if (!fineId) {
      res.status(400).json({
        success: false,
        message: "Fine unique identifier parameter is required."
      });
      return;
    }

    const result = await fineService.restoreFine(fineId);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Invoice restored to active ledger successfully.",
      data: result,
    });
  }
);