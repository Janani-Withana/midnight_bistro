import pg from "pg";
import config from "../../config/index.js";

const { Pool } = pg;

function poolConfig() {
  const connectionString = config.databaseUrl;
  // Render Postgres requires SSL. Internal URLs use hostnames like dpg-xxxxx-a without ".render.com".
  const needsSsl =
    process.env.DATABASE_SSL === "true" ||
    process.env.RENDER === "true" ||
    /[?&]sslmode=require/i.test(connectionString) ||
    /\.render\.com|\.neon\.tech|\.supabase\.co/i.test(connectionString) ||
    connectionString.includes("dpg-");

  return {
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    ...(needsSsl && { ssl: { rejectUnauthorized: false } }),
  };
}

export const pool = new Pool(poolConfig());

export async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}
