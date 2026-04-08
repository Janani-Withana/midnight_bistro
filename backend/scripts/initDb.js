/**
 * Standalone script to create database tables.
 * Run from backend folder: node scripts/initDb.js
 * Or: npm run db:init
 */
import "dotenv/config";
import { initSchema } from "../src/infrastructure/database/initDb.js";

async function main() {
  try {
    await initSchema();
    console.log("Database schema initialized successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Init failed:", err.message);
    process.exit(1);
  }
}

main();
