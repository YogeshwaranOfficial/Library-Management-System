import type { Response } from "express";

interface ApiResponse<T> {
  success: boolean;

  message: string;

  data?: T;

  meta?: {
    total?: number;

    page?: number;

    limit?: number;
  };
}



const sendResponse = <T>(
  res: Response,
  statusCode: number,
  responseData: ApiResponse<T>
): void => {
  res.status(statusCode).json(responseData);
};



export default sendResponse;
