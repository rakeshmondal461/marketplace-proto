import { Router } from "express";
import { Order } from "./order.model";
import { Product } from "../product/product.model";
import { authenticateJwt, AuthRequest } from "../../middleware/auth";

export const orderRouter = Router();

// Buyer creates order
orderRouter.post("/", authenticateJwt, async (req: AuthRequest, res) => {
  const { productId, quantity } = req.body as {
    productId: number;
    quantity: number;
  };

  const user = req.user!;
  const product = await Product.findByPk(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const qty = quantity && quantity > 0 ? quantity : 1;
  const totalPrice = product.price * qty;

  const order = await Order.create({
    type: "buy",
    buyerId: user.id,
    sellerId: product.sellerId,
    productId: product.id,
    quantity: qty,
    totalPrice,
  });

  res.status(201).json(order);
});

// Buyer sees own orders
orderRouter.get("/me", authenticateJwt, async (req: AuthRequest, res) => {
  const orders = await Order.findAll({
    where: { buyerId: req.user!.id },
    include: [{ model: Product, as: "product" }],
  });
  res.json(orders);
});

