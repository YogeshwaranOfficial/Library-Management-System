import { Request, Response, NextFunction } from "express";
import { processBookCoverAI } from "./aiScanner.service.js";

export const scanBookCoverController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No book cover file uploaded." });
      return;
    }

    // Hand off processing payload logic to our underlying service module
    const aiResults = await processBookCoverAI(req.file.buffer);

    // Send flat keys and alternativeLines directly to match what the frontend expects
    res.status(200).json({
      success: true,
      message: "Azure cloud computing operation executed successfully.",
      title: aiResults.title,
      author: aiResults.author,
      language: aiResults.language, 
      category: aiResults.category,   
      overview: aiResults.overview,   
   });
  } catch (error) {
    next(error);
  }
};