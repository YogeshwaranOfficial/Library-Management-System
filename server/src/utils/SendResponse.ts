import { Response } from "express";



interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
}



const sendResponse = <T>(
  res: Response,
  responseData: ApiResponse<T>
): void => {
  const {
    success,
    statusCode,
    message,
    data,
  } = responseData;

  res.status(statusCode).json({
    success,
    message,
    data,
  });
};



export default sendResponse;