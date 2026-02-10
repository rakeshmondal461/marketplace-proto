import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../user/user.model";
import { generateJwt, authenticateJwt, authorizeRoles, AuthRequest } from "../../middleware/auth";

export const authRouter = Router();

// Public: user signup (buyer or seller)
authRouter.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role?: "buyer" | "seller";
  };

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
});

// Public: user login (includes admins if they use same endpoint)
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body as {
    email: string;
    password: string;
  };

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
});

// Admin-specific login (in case you prefer separate route)
authRouter.post("/admin/login", async (req, res) => {
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
});

// Example: check current user
authRouter.get("/me", authenticateJwt, async (req: AuthRequest, res) => {
  return res.json({ user: req.user });
});

// Placeholder OAuth routes (to be wired with Google/Facebook/Instagram later)
authRouter.get("/oauth/:provider/start", (_req, res) => {
  return res.status(501).json({
    message:
      "OAuth start not implemented yet. Configure Google/Facebook/Instagram strategies here.",
  });
});

authRouter.get("/oauth/:provider/callback", (_req, res) => {
  return res.status(501).json({
    message:
      "OAuth callback not implemented yet. Handle provider response and issue JWT here.",
  });
});

