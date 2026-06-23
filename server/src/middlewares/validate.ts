import {
  ZodSchema,
  ZodError,
} from "zod";

import {
  Request,
  Response,
  NextFunction,
} from "express";

import sendResponse from "../utils/SendResponse.js";



const validate =
  (schema: ZodSchema) =>
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.log("🎯 RAW ZOD ISSUES:", JSON.stringify(error.issues, null, 2));
        sendResponse(res, {
          success: false,
          statusCode: 400,
          message: "Validation failed",
          data: error.flatten(),
        });

        return;
      }

      next(error);
    }
  };



export default validate;