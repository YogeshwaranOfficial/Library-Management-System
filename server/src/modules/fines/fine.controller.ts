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
// Update payFineController inside fine.controller.ts
export const payFineController = asyncHandler(
  async (req: Request<any, any, any>, res: Response) => {
    const { 
      fine_id, 
      paidDate, 
      paymentMethod, 
      condition,      // 🚀 Destructure new field
      damage_description   // 🚀 Destructure new field
    } = req.body;

    if (!fine_id) {
      res.status(400).json({
        success: false,
        message: "Fine identification parameter (fine_id) is required."
      });
      return;
    }

    // 🚀 Pass book_condition and damage_description along into the service call wrapper
    const result = await fineService.payFine(
      fine_id, 
      paidDate || null, 
      paymentMethod, 
      condition, 
      damage_description
    );

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

export const fineController = {
  async triggerForceRecalculate(req: Request, res: Response) {
    try {
      console.log("🔔 Manual API request received: Force sync master fine metrics...");
      const result = await fineService.forceRecalculateAllExistingFines();
      
      return res.status(200).json({
        success: true,
        message: "Master banking ledger metrics recalculated successfully.",
        data: result
      });
    } catch (error: any) {
      console.error("❌ Failed to force recalculate ledger matrices:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error execution lock fault."
      });
    }
  }
};