import { Router } from "express";
import { Category } from "./category.model";
import { authenticateJwt, authorizeRoles } from "../../middleware/auth";

export const categoryRouter = Router();

// Public list categories
categoryRouter.get("/", async (_req, res) => {
  const categories = await Category.findAll();
  res.json(categories);
});

// Admin-only create category
categoryRouter.post(
  "/",
  authenticateJwt,
  authorizeRoles("admin"),
  async (req, res) => {
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const category = await Category.create({ name, slug });
    res.status(201).json(category);
  }
);

