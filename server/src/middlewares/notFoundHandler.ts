import type { Request, Response, NextFunction } from "express";

import AppError from "../utils/AppError.js";

const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};

export default notFoundHandler;