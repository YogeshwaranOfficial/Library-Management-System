import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional
} from "sequelize";

import sequelize from "../connection/database.js";

class PlanHistory extends Model<
  InferAttributes<PlanHistory>,
  InferCreationAttributes<PlanHistory>
> {
  declare history_id: CreationOptional<string>;
  declare member_id: string;
  declare membership_plan_id: string;
  declare start_date: string;
  declare expiry_date: string;
  declare lending_count: CreationOptional<number>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
}

PlanHistory.init(
  {
    history_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    member_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    membership_plan_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    lending_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    tableName: "plan_histories",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default PlanHistory;