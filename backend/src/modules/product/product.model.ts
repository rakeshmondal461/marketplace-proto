import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../infra/database";
import { User } from "../user/user.model";
import { Category } from "../category/category.model";

interface ProductAttributes {
  id: number;
  title: string;
  description: string;
  price: number;
  sellerId: number;
  categoryId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type ProductCreationAttributes = Optional<ProductAttributes, "id">;

export class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  public id!: number;
  public title!: string;
  public description!: string;
  public price!: number;
  public sellerId!: number;
  public categoryId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    sellerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
  }
);

User.hasMany(Product, { foreignKey: "sellerId", as: "products" });
Product.belongsTo(User, { foreignKey: "sellerId", as: "seller" });

Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

