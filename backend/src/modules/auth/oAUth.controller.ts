import { Request, Response } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import { User } from "../user/user.model";

// Environment variables you'll need to set:
// GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
// FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_REDIRECT_URI
// INSTAGRAM_CLIENT_ID, INSTAGRAM_CLIENT_SECRET, INSTAGRAM_REDIRECT_URI
// JWT_SECRET, FRONTEND_URL

interface OAuthUser {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  picture?: string;
}

// ============================================================================
// GOOGLE OAUTH
// ============================================================================

class OAuthController {
  constructor() {}
  googleOAuthStart = (req: Request, res: Response) => {
    const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || "",
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    });

    const authUrl = `${googleAuthUrl}?${params.toString()}`;
    return res.redirect(authUrl);
  };
  googleOAuthCallback = async (req: Request, res: Response) => {
    try {
      const { code } = req.query;

      if (!code || typeof code !== "string") {
        return res
          .status(400)
          .json({ error: "Authorization code is required" });
      }

      // Exchange code for access token
      const tokenResponse = await axios.post(
        "https://oauth2.googleapis.com/token",
        {
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI,
          grant_type: "authorization_code",
        },
      );

      const { access_token } = tokenResponse.data;

      // Get user info
      const userInfoResponse = await axios.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      );

      const googleUser = userInfoResponse.data;

      const oauthUser: OAuthUser = {
        provider: "google",
        providerId: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      };

      // TODO: Save or update user in your database here
      // const user = await findOrCreateUser(oauthUser);

      // Generate JWT
      const token = jwt.sign(
        {
          userId: oauthUser.providerId, // Replace with actual DB user ID
          email: oauthUser.email,
          provider: "google",
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" },
      );

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error("Google OAuth error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(
        `${frontendUrl}/auth/error?message=google_auth_failed`,
      );
    }
  };

  facebookOAuthStart = (req: Request, res: Response) => {
    const facebookAuthUrl = "https://www.facebook.com/v18.0/dialog/oauth";

    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID || "",
      redirect_uri: process.env.FACEBOOK_REDIRECT_URI || "",
      scope: "email,public_profile",
      response_type: "code",
      state: this.generateRandomState(), // CSRF protection
    });

    const authUrl = `${facebookAuthUrl}?${params.toString()}`;
    return res.redirect(authUrl);
  };

  facebookOAuthCallback = async (req: Request, res: Response) => {
    try {
      const { code } = req.query;

      if (!code || typeof code !== "string") {
        return res
          .status(400)
          .json({ error: "Authorization code is required" });
      }

      // Exchange code for access token
      const tokenResponse = await axios.get(
        "https://graph.facebook.com/v18.0/oauth/access_token",
        {
          params: {
            client_id: process.env.FACEBOOK_APP_ID,
            client_secret: process.env.FACEBOOK_APP_SECRET,
            redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
            code,
          },
        },
      );

      const { access_token } = tokenResponse.data;

      // Get user info
      const userInfoResponse = await axios.get(
        "https://graph.facebook.com/me",
        {
          params: {
            fields: "id,name,email,picture",
            access_token,
          },
        },
      );

      const facebookUser = userInfoResponse.data;

      const oauthUser: OAuthUser = {
        provider: "facebook",
        providerId: facebookUser.id,
        email: facebookUser.email || `${facebookUser.id}@facebook.com`, // Fallback if email not provided
        name: facebookUser.name,
        picture: facebookUser.picture?.data?.url,
      };

      // TODO: Save or update user in your database here
      // const user = await findOrCreateUser(oauthUser);

      // Generate JWT
      const token = jwt.sign(
        {
          userId: oauthUser.providerId, // Replace with actual DB user ID
          email: oauthUser.email,
          provider: "facebook",
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" },
      );

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error("Facebook OAuth error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(
        `${frontendUrl}/auth/error?message=facebook_auth_failed`,
      );
    }
  };
  instagramOAuthStart = (req: Request, res: Response) => {
    // Instagram Basic Display API
    const instagramAuthUrl = "https://api.instagram.com/oauth/authorize";

    const params = new URLSearchParams({
      client_id: process.env.INSTAGRAM_CLIENT_ID || "",
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || "",
      scope: "user_profile,user_media",
      response_type: "code",
    });

    const authUrl = `${instagramAuthUrl}?${params.toString()}`;
    return res.redirect(authUrl);
  };

  instagramOAuthCallback = async (req: Request, res: Response) => {
    try {
      const { code } = req.query;

      if (!code || typeof code !== "string") {
        return res
          .status(400)
          .json({ error: "Authorization code is required" });
      }

      // Exchange code for access token
      const formData = new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID || "",
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET || "",
        grant_type: "authorization_code",
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || "",
        code,
      });

      const tokenResponse = await axios.post(
        "https://api.instagram.com/oauth/access_token",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      const { access_token, user_id } = tokenResponse.data;

      // Get long-lived token (optional but recommended)
      const longLivedTokenResponse = await axios.get(
        "https://graph.instagram.com/access_token",
        {
          params: {
            grant_type: "ig_exchange_token",
            client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
            access_token,
          },
        },
      );

      const longLivedToken = longLivedTokenResponse.data.access_token;

      // Get user info
      const userInfoResponse = await axios.get(
        `https://graph.instagram.com/${user_id}`,
        {
          params: {
            fields: "id,username,account_type",
            access_token: longLivedToken,
          },
        },
      );

      const instagramUser = userInfoResponse.data;

      const oauthUser: OAuthUser = {
        provider: "instagram",
        providerId: instagramUser.id,
        email: `${instagramUser.username}@instagram.com`, // Instagram doesn't provide email
        name: instagramUser.username,
      };

      // TODO: Save or update user in your database here
      // const user = await findOrCreateUser(oauthUser);

      // Generate JWT
      const token = jwt.sign(
        {
          userId: oauthUser.providerId, // Replace with actual DB user ID
          email: oauthUser.email,
          provider: "instagram",
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" },
      );

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error("Instagram OAuth error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(
        `${frontendUrl}/auth/error?message=instagram_auth_failed`,
      );
    }
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  generateRandomState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  // TODO: Implement this function to save/update user in your database
  // findOrCreateUser = async (oauthUser: OAuthUser) => {
  //   // Check if user exists with this provider and providerId
  //   let user = await User.findOne({
  //     where: {
  //       provider: oauthUser.provider,
  //       providerId: oauthUser.providerId,
  //     },
  //   });
  
  //   if (!user) {
  //     // Create new user
  //     user = await User.create({
  //       provider: oauthUser.provider,
  //       email: oauthUser.email,
  //       name: oauthUser.name,
  //       passwordHash: "",
  //       role: "buyer",
  //     });
  //   } else {
  //     // Update existing user info
  //     user.name = oauthUser.name;
  //     user.picture = oauthUser.picture;
  //     await user.save();
  //   }
  
  //   return user;
  // }
}

export const oAuthController = new OAuthController();
