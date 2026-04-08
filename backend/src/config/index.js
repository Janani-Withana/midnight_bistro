import "dotenv/config";

export default {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "midnight-bistro-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  adminSecret: process.env.ADMIN_SECRET || "",
  apiUrl: process.env.API_URL || "http://localhost:3001",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://localhost:5432/midnight_bistro",
};
