import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 5000,

  jwtSecret: process.env.JWT_SECRET || "",

  jwtExpiresIn:
    process.env.JWT_EXPIRES_IN || "7d",
};



export default config;