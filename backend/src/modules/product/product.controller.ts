import { AuthRequest } from "../../middleware/auth";
import { Product } from "./product.model";
import { Response } from "express";

class ProductController {
  constructor() {}

  createProduct = async (req: AuthRequest, res: Response) => {
    try {
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

      return res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  deleteProduct = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      await Product.destroy({ where: { id } });
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

export const productController = new ProductController();
