import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../database/dbConfig";

interface CategoryAttributes {
  id: number;
  name: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type CategoryCreationAttributes = Optional<CategoryAttributes, "id">;

export class Category
  extends Model<CategoryAttributes, CategoryCreationAttributes>
  implements CategoryAttributes
{
  public id!: number;
  public name!: string;
  public slug!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "Category",
    tableName: "categories",
  }
);

