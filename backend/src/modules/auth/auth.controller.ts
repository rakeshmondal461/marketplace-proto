import { NextFunction, Request, Response } from "express";
import { User } from "../user/user.model";
import { generateJwt } from "../../middleware/auth";
import bcrypt from "bcryptjs";

type signupRequestBody = {
  name: string;
  email: string;
  password: string;
  role?: "buyer" | "seller";
};

type loginRequestBody = { email: string; password: string };

class AuthController {
  constructor() {}

  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, role } = req.body as signupRequestBody;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        passwordHash,
        role: role === "seller" ? "seller" : "buyer",
      });

      const token = generateJwt(user);
      return res.status(201).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      next(error);
    }
  };
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as loginRequestBody;

      if (!email || !password) {
        return res.status(400).json({ message: "Missing credentials" });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateJwt(user);
      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      next(error);
    }
  };

  adminLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };

      const admin = await User.findOne({ where: { email, role: "admin" } });
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, admin.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateJwt(admin);
      return res.json({
        token,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (error) {
      console.error("Admin login error:", error);
      next(error);
    }
  };
}

// Dependency Injection
export const authController = new AuthController();
