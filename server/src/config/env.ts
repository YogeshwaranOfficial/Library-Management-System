import dotenv from "dotenv";

dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: process.env.PORT || "5000",

  DB_NAME: process.env.DB_NAME || "",

  DB_USER: process.env.DB_USER || "",

  DB_PASSWORD: process.env.DB_PASSWORD || "",

  DB_HOST: process.env.DB_HOST || "",

  DB_PORT: process.env.DB_PORT || "5432",

  JWT_SECRET: process.env.JWT_SECRET || "",

  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",

  DATABASE_URL: process.env.DATABASE_URL || "",

  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

};

export default env;