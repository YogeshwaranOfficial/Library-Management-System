import app from "./app.js";
import logger from "./utils/logger.js";
import env from "./config/env.js";
import { sequelize, syncDatabase } from "./database/index.js";

const startServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();

    logger.info("✅ Database connected successfully");

    await syncDatabase();

    app.listen(env.PORT, () => {
      console.log(
        `🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`
      );
    });
  } catch (error) {
    logger.error("Server startup failed", error);

    process.exit(1);
  }
};

void startServer();