import jwt from "jsonwebtoken";

import env from "../config/env.js";

import { JwtUserPayload } from "../types/express/index.js";

export const generateToken = (
  payload: JwtUserPayload
): string => {
  return jwt.sign(
    payload,
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any },
  );
};

export const verifyToken = (
  token: string
) : JwtUserPayload => {
  return jwt.verify(
    token,
    env.JWT_SECRET
  ) as JwtUserPayload;
};