import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  CreationOptional
} from "sequelize";

import sequelize from "../connection/database.js";

class Book extends Model<
  InferAttributes<Book>,
  InferCreationAttributes<Book>
> {
  declare book_id: string;

  declare category_id: string;

  declare book_name: string;

  declare book_author: string;

  declare total_copies: number;

  declare available_copies:number;

  declare language: CreationOptional<string>;
  declare lending_count: CreationOptional<number>; // Defaults to 0 in database
  declare readonly created_at: CreationOptional<Date>; // Handled by timestamps
  declare readonly updated_at: CreationOptional<Date>;
}

Book.init(
  {
    book_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    book_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    book_author: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    total_copies: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    available_copies: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    lending_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    language: {
      type: DataTypes.STRING(100),
      allowNull: true, // Kept true for migration safety, managed by defaults
      defaultValue: "English",
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
    tableName: "books",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Book;