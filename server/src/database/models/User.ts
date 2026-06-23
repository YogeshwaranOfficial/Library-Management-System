import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import sequelize from "../connection/database.js";

class User extends Model<InferAttributes<User>,  InferCreationAttributes<User> > {
  declare uuid: string;

  declare name: string;

  declare gmail: string;

  declare password: string;

  declare phone_number: string | null;

  declare readonly created_at: Date;

  declare readonly updated_at: Date;

  declare role: string;
}

User.init(
  {
    uuid: {
      type: DataTypes.UUID,

      defaultValue: DataTypes.UUIDV4,

      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(100),

      allowNull: false,
    },

    gmail: {
      type: DataTypes.STRING(150),

      allowNull: false,

      unique: true,
    },

    password: {
      type: DataTypes.STRING(255),

      allowNull: false,
    },

    phone_number: {
      type: DataTypes.STRING(20),

      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,

      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,

      defaultValue: DataTypes.NOW,
    },
    role: {
      type: DataTypes.STRING,

      allowNull: false,
      
      defaultValue: "LIBRARIAN",
    },
  },

  {
    sequelize,

    tableName: "users",

    timestamps: false,
  }
);

export default User;