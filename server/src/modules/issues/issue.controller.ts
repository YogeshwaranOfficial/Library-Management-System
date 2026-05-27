import { Request, Response } from "express";

import asyncHandler from "../../utils/asyncHandler.js";

import sendResponse from "../../utils/SendResponse.js";

import issueService from "./issue.service.js";

export const borrowBookController =
  asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const result =
        await issueService.borrowBook(
          req.body.member_id,
          req.body.book_id
        );

      sendResponse(res, {
        success: true,
        statusCode: 201,
        message:
          "Book borrowed successfully",
        data: result,
      });
    }
  );

export const returnBookController =
  asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const result =
        await issueService.returnBook(
          req.body.issue_id
        );

      sendResponse(res, {
        success: true,
        statusCode: 200,
        message:
          "Book returned successfully",
        data: result,
      });
    }
  );

export const getMemberIssuesController =
  asyncHandler(
    async (
      req: Request,
      res: Response
    ) => {
      const memberId = req.params.memberId as string;
      const result =
        await issueService.getMemberIssues(
          memberId
        );

      sendResponse(res, {
        success: true,
        statusCode: 200,
        message:
          "Issues fetched successfully",
        data: result,
      });
    }
  );