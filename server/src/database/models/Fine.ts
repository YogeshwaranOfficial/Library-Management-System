import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import sequelize from "../connection/database.js";

class Fine extends Model<
  InferAttributes<Fine>,
  InferCreationAttributes<Fine>
> {
  declare fine_id: string;

  declare issue_id: string;

  declare delayed_days: number;

  declare fine_amount: number;

  declare paid_status: boolean;

  declare paid_date: Date | null;

  declare readonly created_at: Date;

  declare readonly updated_at: Date;
}

Fine.init(
  {
    fine_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    issue_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },

    delayed_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    fine_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    paid_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    paid_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
    },

    updated_at: {
      type: DataTypes.DATE,
    },
  },

  {
    sequelize,
    tableName: "fines",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Fine;