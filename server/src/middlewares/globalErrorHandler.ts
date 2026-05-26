import type {
  Request,
  Response,
  NextFunction,
} from "express";
import logger from "../utils/logger.js";
import AppError from "../utils/AppError.js";

const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;

  let message = "Internal Server Error";



  if (err instanceof AppError) {
    statusCode = err.statusCode;

    message = err.message;
  }

  logger.error(message, err);

  res.status(statusCode).json({
    success: false,
    message,
    stack:
      process.env.NODE_ENV === "development"
        ? err.stack
        : undefined,
  });
};

export default globalErrorHandler;