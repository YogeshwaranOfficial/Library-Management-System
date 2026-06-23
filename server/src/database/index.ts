import sequelize from "./connection/database.js";

import "./associations/index.js";

import syncDatabase from "./sync/syncDatabase.js";

export { sequelize, syncDatabase };