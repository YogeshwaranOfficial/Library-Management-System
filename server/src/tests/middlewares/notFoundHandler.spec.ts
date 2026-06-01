import { jest } from "@jest/globals";
import type { Request, Response, NextFunction } from "express";
import notFoundHandler from "../../middlewares/notFoundHandler.js";
import AppError from "../../utils/AppError.js";

describe("notFoundHandler Unit Tests", () => {
  it("should catch an unhandled route and pass an AppError to next()", () => {
    const mockRequest = {
      originalUrl: "/api/v1/ghost-route",
    } as Request;

    const mockResponse = {} as Response;
    
    // Explicitly create the mock function via the imported jest instance
    const mockNext = jest.fn() as unknown as NextFunction;

    notFoundHandler(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);

    // Extracting the argument safely for type-checking assertions
    const errorPassed = (mockNext as any).mock.calls[0][0];
    
    expect(errorPassed).toBeInstanceOf(AppError);
    expect(errorPassed.message).toBe("Route /api/v1/ghost-route not found");
    expect(errorPassed.statusCode).toBe(404);
  });
});