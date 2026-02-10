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
    await sequelize.sync({ alter: true });
    console.log("Database synced");
  } catch (err) {
    console.error("Unable to connect to the database:", err);
    throw err;
  }
}

