// src/modules/reports/report.controller.ts
import { Request, Response } from "express";
import { ReportService } from "./report.service.js";
import { PivotMode, DurationWindow } from "./report.types.js";

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  generateReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { pivot, primaryId, secondaryId, duration } = req.query;

      if (!pivot || !primaryId) {
        res.status(400).json({
          success: false,
          message: "Bad Request: 'pivot' and 'primaryId' are mandatory parameters.",
        });
        return;
      }

      if (pivot !== "MEMBER" && pivot !== "BOOK") {
        res.status(400).json({
          success: false,
          message: "Invalid Configuration: 'pivot' must be either 'MEMBER' or 'BOOK'.",
        });
        return;
      }

      const selectedDuration = (duration as string) || "ALL";
      if (!["ALL", "WEEKLY", "MONTHLY", "YEARLY"].includes(selectedDuration)) {
        res.status(400).json({
          success: false,
          message: "Invalid Matrix Parameter: 'duration' must be ALL, WEEKLY, MONTHLY, or YEARLY.",
        });
        return;
      }

      // Calls service layer mapping function with sanitized query items
      const reportPayload = await this.reportService.getDynamicReport({
        pivot: pivot as PivotMode,
        primaryId: primaryId as string,
        secondaryId: typeof secondaryId === "string" && secondaryId.trim() !== "" ? secondaryId : undefined,
        duration: selectedDuration as DurationWindow,
      });

      res.status(200).json({
        success: true,
        data: reportPayload,
      });
    } catch (error: any) {
      console.error("CRITICAL REPORT COMPILER FAILURE:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error: Failed to compile target relational statement arrays.",
        error: error.message,
      });
    }
  };

  getDependentDropdownOptions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { pivot, primaryId } = req.query;

      if (!pivot || !primaryId) {
        res.status(400).json({
          success: false,
          message: "Bad Request: Both 'pivot' and 'primaryId' are required parameters.",
        });
        return;
      }

      if (pivot !== "MEMBER" && pivot !== "BOOK") {
        res.status(400).json({
          success: false,
          message: "Invalid Configuration: Target query 'pivot' must be 'MEMBER' or 'BOOK'.",
        });
        return;
      }

      // Calls cascading option lookup on service layer
      const options = await this.reportService.getDependentOptions({
        pivot: pivot as PivotMode,
        primaryId: primaryId as string
      });

      res.status(200).json({
        success: true,
        data: options,
      });
    } catch (error: any) {
      console.error("CASCADING DROPDOWN DISPATCH FAILURE:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error: Failed to pull dependent cascade lookup options.",
        error: error.message,
      });
    }
  };
}