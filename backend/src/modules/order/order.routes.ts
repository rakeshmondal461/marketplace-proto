import { Router } from "express";
import { authenticateJwt } from "../../middleware/auth";
import { orderController } from "./order.controller";

export const orderRouter = Router();

// Buyer creates order
orderRouter.post("/buyer/order", authenticateJwt, orderController.createBuyerOrder);

// Buyer sees own orders
orderRouter.get("/buyer/orders", authenticateJwt, orderController.getBuyerOrders);

// Seller sees own orders
orderRouter.get("/seller/orders", authenticateJwt, orderController.getSellerOrders);

// Seller sees all orders
orderRouter.get("/seller/orders/all", authenticateJwt, orderController.getAllOrders);

// Seller sees all orders
orderRouter.get("/seller/orders/all", authenticateJwt, orderController.getAllOrders);

