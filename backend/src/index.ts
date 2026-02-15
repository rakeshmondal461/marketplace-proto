import dotenv from "dotenv";
import { app } from "./app";
import { initDb } from "./database/dbConfig";

dotenv.config();

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  await initDb();

  app.listen(PORT, () => {
    console.log(`Backend API running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});

