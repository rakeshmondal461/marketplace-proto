import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, UserRole } from "../modules/user/user.model";

export interface AuthRequest extends Request {
  user?: Pick<User, "id" | "email" | "role">;
}

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";

export function generateJwt(user: User) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function authenticateJwt(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.substring("Bearer ".length);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: UserRole;
    };
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    } as any;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function authorizeRoles(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}

