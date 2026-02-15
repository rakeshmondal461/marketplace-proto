import { Sequelize } from "sequelize";

const dbName = process.env.DB_NAME || "marketplace_db";
const dbUser = process.env.DB_USER || "marketplace_user";
const dbPass = process.env.DB_PASSWORD || "marketplace_pass";
const dbHost = process.env.DB_HOST || "db";

export const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  dialect: "mysql",
  logging: false,
});

export async function initDb() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established");

    // In development, you can optionally sync models without alter
    // In production, migrations should be run separately before app starts
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    if (nodeEnv === 'development') {
      // Only sync in development, but don't alter tables
      // Migrations should be the source of truth
      await sequelize.sync({ alter: false });
      console.log("Database models synced (development mode)");
    } else {
      console.log("Production mode: Skipping sync. Ensure migrations are run before starting the app.");
    }
  } catch (err) {
    console.error("Unable to connect to the database:", err);
    throw err;
  }
}

