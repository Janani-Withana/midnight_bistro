import "dotenv/config";

export default {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "midnight-bistro-secret",
  /** Long-lived access for non-admin (e.g. future user accounts). */
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  /** Short-lived access token for admins (refreshed via refresh token). */
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || "midnight-bistro-refresh-secret",
  /** Admin session length until sign-out (refresh token TTL). */
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "365d",
  adminSecret: process.env.ADMIN_SECRET || "midnight-bistro-admin-secret",
  apiUrl: process.env.API_URL || "http://localhost:3001",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://localhost:5432/midnight_bistro",
};
