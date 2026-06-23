import { JwtPayload } from "jsonwebtoken";

// 1. Define your strict custom payload structure
export interface JwtUserPayload extends JwtPayload {
  userId: string;
  gmail: string;
  role: string;
}

// 2. Tell Express to use your custom payload for req.user
declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload; // Uses your exact type instead of the generic one!
    }
  }
}

export {};