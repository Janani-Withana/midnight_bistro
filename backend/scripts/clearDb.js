/**
 * Deletes all rows from app tables (keeps schema). Run from backend: npm run db:clear
 */
import "dotenv/config";
import { pool } from "../src/infrastructure/database/connection.js";

const SQL = `
TRUNCATE TABLE
  refresh_tokens,
  orders,
  menu_items,
  gallery,
  reservations,
  categories,
  users
RESTART IDENTITY CASCADE;
`;

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(SQL);
    await client.query("COMMIT");
    console.log("Database cleared (all tables truncated, sequences reset).");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Clear failed:", err.message);
    process.exitCode = 1;
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
