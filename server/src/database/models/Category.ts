import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import sequelize from "../connection/database.js";

class Category extends Model<
  InferAttributes<Category>,
  InferCreationAttributes<Category>
> {
  declare category_id: string;

  declare category_name: string;

  declare readonly created_at: Date;

  declare readonly updated_at: Date;
}

Category.init(
  {
    category_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    category_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
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
    tableName: "categories",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Category;