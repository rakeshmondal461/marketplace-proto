import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { registerRoutes } from "./routes";

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint for Docker
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

registerRoutes(app);

