require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'marketplace_user',
    password: process.env.DB_PASSWORD || 'marketplace_pass',
    database: process.env.DB_NAME || 'marketplace_db',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: console.log,
  },
  staging: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    }
  }
};
