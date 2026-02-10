import { Express } from "express";
import { authRouter } from "./modules/auth/auth.routes";
import { productRouter } from "./modules/product/product.routes";
import { categoryRouter } from "./modules/category/category.routes";
import { orderRouter } from "./modules/order/order.routes";

export function registerRoutes(app: Express) {
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRouter);
  app.use("/api/products", productRouter);
  app.use("/api/categories", categoryRouter);
  app.use("/api/orders", orderRouter);
}

