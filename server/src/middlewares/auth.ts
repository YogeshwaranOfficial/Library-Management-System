import {
  Request,
  Response,
  NextFunction,
} from "express";

import AppError from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";

const auth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader =
      req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(
        "Unauthorized access",
        401
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("Token missing", 401);
    }

    const decoded = verifyToken(token);

    if (typeof decoded === "string") {
      throw new AppError("Invalid token payload", 401);
    }

    req.user = decoded;

    next();
  } catch (error: any) {
    console.error("JWT Verification Crash Details:", error.message);
    next(
      new AppError(
        "Invalid or expired token",
        401
      )
    );
  }
};

export default auth;

