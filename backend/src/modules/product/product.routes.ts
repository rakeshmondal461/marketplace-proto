import { Router } from "express";
import { Product } from "./product.model";
import { Category } from "../category/category.model";
import { authenticateJwt, authorizeRoles, AuthRequest } from "../../middleware/auth";

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
  async (req: AuthRequest, res) => {
    const { title, description, price, categoryId } = req.body;
    if (!title || !description || !price || !categoryId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const product = await Product.create({
      title,
      description,
      price,
      categoryId,
      sellerId: req.user!.id,
    });

    res.status(201).json(product);
  }
);

// Admin can delete any product
productRouter.delete(
  "/:id",
  authenticateJwt,
  authorizeRoles("admin"),
  async (req, res) => {
    const id = Number(req.params.id);
    await Product.destroy({ where: { id } });
    res.status(204).send();
  }
);

