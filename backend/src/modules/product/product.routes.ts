import { Router } from "express";
import { Product } from "./product.model";
import { Category } from "../category/category.model";
import {
  authenticateJwt,
  authorizeRoles,
  AuthRequest,
} from "../../middleware/auth";
import { productController } from "./product.controller";

export const productRouter = Router();

// Public list products
productRouter.get("/", async (_req, res) => {
  const products = await Product.findAll({
    include: [{ model: Category, as: "category" }],
  });
  res.json(products);
});

// Seller creates product
productRouter.post(
  "/",
  authenticateJwt,
  authorizeRoles("seller"),
  productController.createProduct,
);

// Admin can delete any product
productRouter.delete(
  "/:id",
  authenticateJwt,
  authorizeRoles("admin"),
  productController.deleteProduct,
);
