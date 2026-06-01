import { Sequelize } from "sequelize";
import cls from 'cls-hooked';
import dotenv from "dotenv";
import databaseConfig from '../config/database.js'; 

dotenv.config();

const namespace = cls.createNamespace('sequelize-test-namespace');
(Sequelize as any).useCLS(namespace);

// Pick the config based on NODE_ENV (defaults to 'development')
const env = process.env.NODE_ENV || 'development';
const config = (databaseConfig as any)[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: "postgres",
    port: config.port,
    logging: false,
  }
);

export default sequelize;