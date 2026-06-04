const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: Number(process.env.PORT || 4000),
  dbUrl: process.env.DB_URL || "mongodb://127.0.0.1:27017/spenza",
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  clientUrl: process.env.CLIENT_URL || "*",
};

