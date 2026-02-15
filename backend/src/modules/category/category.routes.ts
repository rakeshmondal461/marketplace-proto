import { Router } from "express";
import { Category } from "./category.model";
import { authenticateJwt, authorizeRoles } from "../../middleware/auth";
import { categoryController } from "./category.controller";

export const categoryRouter = Router();

// Public list categories
categoryRouter.get("/",authenticateJwt, categoryController.getCategories);

// Admin-only create category
categoryRouter.post(
  "/",
  authenticateJwt,
  authorizeRoles("admin"),
  categoryController.createCategory
);

