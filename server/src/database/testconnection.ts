import sequelize from "./connection/database.js";

const testConnection = async () => {
  try {
    await sequelize.authenticate();

    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed", error);
  }
};

testConnection();

//npx tsc src/database/testConnection.ts