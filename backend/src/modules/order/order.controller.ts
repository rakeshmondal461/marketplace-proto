import { Op } from "sequelize";
import { AuthRequest } from "../../middleware/auth";
import { Product } from "../product/product.model";
import { User } from "../user/user.model";
import { Order } from "./order.model";
import { Request, Response } from "express";

type OrderType = "buy" | "sell";
type CreateOrderParams = {
    userId: number;
    productId: number;
    quantity?: number;
    type: OrderType;
  };
class OrderController {
  constructor() {}

  createBuyerOrder = async (req: AuthRequest, res: Response) => {
    try {
      const { productId, quantity } = req.body;
      const user = req.user;

      if (!productId || !quantity) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const order = await this.createOrderCommon({
        userId: user.id,
        productId,
        quantity,
        type: "buy",
      });
  
      return res.status(201).json(order);
    } catch (error: any) {
      if (error.message === "USER_NOT_FOUND") {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (error.message === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({ message: "Product not found" });
      }
  
      console.error("Error creating order:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  

  createSellerOrder = async (req: AuthRequest, res: Response) => {
    try {
      const { productId, quantity } = req.body;
      const user = req.user;
  
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const order = await this.createOrderCommon({
        userId: user.id,
        productId,
        quantity,
        type: "sell",
      });
  
      return res.status(201).json(order);
    } catch (error: any) {
      if (error.message === "USER_NOT_FOUND") {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (error.message === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({ message: "Product not found" });
      }
  
      console.error("Error creating order:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  

  private createOrderCommon = async ({
    userId,
    productId,
    quantity,
    type,
  }: CreateOrderParams) => {
    // Validate user
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
  
    // Validate product
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }
  
    const qty = quantity && quantity > 0 ? quantity : 1;
    const totalPrice = product.price * qty;
  
    let buyerId: number;
    let sellerId: number;
  
    if (type === "buy") {
      buyerId = userId;
      sellerId = product.sellerId;
    } else {
      sellerId = userId;
      buyerId = product.sellerId;
    }
  
    const order = await Order.create({
      type,
      buyerId,
      sellerId,
      productId: product.id,
      quantity: qty,
      totalPrice,
    });
  
    return order;
  };

  getBuyerOrders = async (req: AuthRequest, res: Response) => {
    try {
        const orders = await Order.findAll({
            where: { buyerId: req.user!.id },
            include: [{ model: Product, as: "product" }],
          });
          return res.json(orders);
    } catch (error) {
      console.error("Error getting orders:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  getSellerOrders = async (req: AuthRequest, res: Response) => {
    try {
        const orders = await Order.findAll({
            where: { sellerId: req.user!.id },
            include: [{ model: Product, as: "product" }],
          });
          return res.json(orders);
    } catch (error) {
      console.error("Error getting orders:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  getAllOrders = async (req: AuthRequest, res: Response) => {
    try {
        const orders = await Order.findAll({
            include: [{ model: Product, as: "product" }],
          });
          return res.json(orders);
    } catch (error) {
      console.error("Error getting orders:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

export const orderController = new OrderController();