import sequelize from "../connection/database.js";

const syncDatabase = async (): Promise<void> => {
  try {
    await sequelize.sync();
    console.log("✅ Database synchronized successfully");
  } catch (error) {
    console.error("❌ Database synchronization failed:", error);
    process.exit(1);
  }
};

export default syncDatabase;