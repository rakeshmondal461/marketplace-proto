import { Router } from "express";
import { generateJwt, authenticateJwt, AuthRequest } from "../../middleware/auth";
import { authController } from "./auth.controller";
import { oAuthController } from "./oAUth.controller";

export const authRouter = Router();

// Public: user signup (buyer or seller)
authRouter.post("/signup", authController.signup);

// Public: user login (includes admins if they use same endpoint)
authRouter.post("/login", authController.login);

// Admin-specific login (in case you prefer separate route)
authRouter.post("/admin/login", authController.adminLogin);

// Example: check current user
authRouter.get("/me", authenticateJwt, async (req: AuthRequest, res) => {
  return res.json({ user: req.user });
});


authRouter.get("/oauth/google/start", oAuthController.googleOAuthStart);
authRouter.get("/oauth/google/callback", oAuthController.googleOAuthCallback);

// ============================================================================
// FACEBOOK OAUTH ROUTES
// ============================================================================
authRouter.get("/oauth/facebook/start", oAuthController.facebookOAuthStart);
authRouter.get("/oauth/facebook/callback", oAuthController.facebookOAuthCallback);

// ============================================================================
// INSTAGRAM OAUTH ROUTES
// ============================================================================
authRouter.get("/oauth/instagram/start", oAuthController.instagramOAuthStart);
authRouter.get("/oauth/instagram/callback", oAuthController.instagramOAuthCallback);


