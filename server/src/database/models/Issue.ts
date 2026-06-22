import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional
} from "sequelize";

import sequelize from "../connection/database.js";

class Issue extends Model<
  InferAttributes<Issue>,
  InferCreationAttributes<Issue>
> {
  declare issue_id: string;

  declare member_id: string;

  declare book_id: string;

  declare due_date: Date;

  declare borrowed_date: CreationOptional<Date>; 
  declare issue_status: CreationOptional<string>; 
  declare returned_date: CreationOptional<Date | null>;
  declare condition: CreationOptional<string | null>;
  declare damage_description: CreationOptional<string | null>;

  declare readonly created_at: CreationOptional<Date>;
  declare readonly updated_at: CreationOptional<Date>;
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
      defaultValue: DataTypes.NOW
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
  

    condition: {
      type: DataTypes.ENUM("GOOD", "DAMAGEd"),
      allowNull: true,
      defaultValue: null,

    },

    damage_description:{
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null

    }
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