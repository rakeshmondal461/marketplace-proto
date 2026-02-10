import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../infra/database";
import { User } from "../user/user.model";
import { Product } from "../product/product.model";

type OrderType = "buy" | "sell";

interface OrderAttributes {
  id: number;
  type: OrderType;
  buyerId: number;
  sellerId: number;
  productId: number;
  quantity: number;
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type OrderCreationAttributes = Optional<OrderAttributes, "id">;

export class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes
{
  public id!: number;
  public type!: OrderType;
  public buyerId!: number;
  public sellerId!: number;
  public productId!: number;
  public quantity!: number;
  public totalPrice!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM("buy", "sell"),
      allowNull: false,
    },
    buyerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    sellerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
  }
);

User.hasMany(Order, { foreignKey: "buyerId", as: "buyerOrders" });
User.hasMany(Order, { foreignKey: "sellerId", as: "sellerOrders" });
Order.belongsTo(User, { foreignKey: "buyerId", as: "buyer" });
Order.belongsTo(User, { foreignKey: "sellerId", as: "seller" });

Product.hasMany(Order, { foreignKey: "productId", as: "orders" });
Order.belongsTo(Product, { foreignKey: "productId", as: "product" });

