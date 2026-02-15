import { Request, Response } from "express";
import { Category } from "./category.model";

class CategoryController {
  constructor() {}

  createCategory = async (req: Request, res: Response) => {
    try {
      const { name, slug } = req.body;
      if (!name || !slug) {
        return res.status(400).json({ message: "Missing fields" });
      }
      const category = await Category.create({ name, slug });
      return res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  getCategories = async (req: Request, res: Response) => {
    try {
      const categories = await Category.findAll();
      return res.status(200).json(categories);
    } catch (error) {
      console.error("Error getting categories:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

export const categoryController = new CategoryController();
