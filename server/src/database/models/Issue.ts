import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import sequelize from "../connection/database.js";

class Issue extends Model<
  InferAttributes<Issue>,
  InferCreationAttributes<Issue>
> {
  declare issue_id: string;

  declare member_id: string;

  declare book_id: string;

  declare borrowed_date: Date;

  declare due_date: Date;

  declare returned_date: Date | null;

  declare issue_status: string;

  declare readonly created_at: Date;

  declare readonly updated_at: Date;
}

Issue.init(
  {
    issue_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    member_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    book_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    borrowed_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    returned_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    issue_status: {
      type: DataTypes.ENUM("BORROWED", "RETURNED", "OVERDUE"),
      defaultValue: "BORROWED",
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
    tableName: "issues",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Issue;