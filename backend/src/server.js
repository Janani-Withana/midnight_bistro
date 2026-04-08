import "dotenv/config";
import app from "./app.js";
import config from "./config/index.js";
import { initSchema } from "./infrastructure/database/initDb.js";

async function start() {
  try {
    await initSchema();
    console.log("Database schema ready");
  } catch (err) {
    console.error("Database init failed:", err.message);
    process.exit(1);
  }
  app.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}`);
  });
}

start();
