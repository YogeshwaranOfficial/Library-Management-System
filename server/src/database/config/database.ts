import dotenv from "dotenv";
dotenv.config();

const databaseConfig = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: Number(process.env.DB_PORT || 5432),
  },
  test: {
    // These match the CI variables exactly
    username: process.env.DB_USER || 'test_user',
    password: process.env.DB_PASSWORD || 'test_password',
    database: process.env.DB_NAME || 'test_db',
    host: process.env.DB_HOST || 'localhost',
    dialect: "postgres",
    port: Number(process.env.DB_PORT || 5432),
  }
};

export default databaseConfig;