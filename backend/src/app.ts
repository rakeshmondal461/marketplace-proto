import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { registerRoutes } from "./routes";

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json());

registerRoutes(app);

