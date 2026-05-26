import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import sequelize from "../connection/database.js";

class Member extends Model<
  InferAttributes<Member>,
  InferCreationAttributes<Member>
> {
  declare member_id: string;

  declare user_id: string;

  declare membership_plan_id: string;

  declare start_date: Date;

  declare expiry_date: Date;

  declare membership_status: string;

  declare readonly created_at: Date;

  declare readonly updated_at: Date;
}

Member.init(
  {
    member_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
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

    membership_status: {
      type: DataTypes.ENUM("ACTIVE", "EXPIRED"),
      defaultValue: "ACTIVE",
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
    tableName: "members",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Member;