import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional
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

  declare paid_status: CreationOptional<boolean>;
  declare paid_date: CreationOptional<Date | null>;
  declare payment_method: CreationOptional<string | null>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;

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
      type: DataTypes.DATE,
      allowNull: true,
    },

    payment_method: {
      type: DataTypes.STRING,
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