import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import sequelize from "../connection/database.js";

class MembershipPlan extends Model<
  InferAttributes<MembershipPlan>,
  InferCreationAttributes<MembershipPlan>
> {
  declare membership_plan_id: string;

  declare plan_name: string;

  declare price: number;

  declare duration_days: number;

  declare readonly created_at: Date;

  declare readonly updated_at: Date;
}

MembershipPlan.init(
  {
    membership_plan_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    plan_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    duration_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: "membership_plans",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default MembershipPlan;