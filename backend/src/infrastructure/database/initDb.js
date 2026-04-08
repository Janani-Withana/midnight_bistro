import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { pool } from "./connection.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function initSchema() {
  const sql = readFileSync(join(__dirname, "schema.sql"), "utf8");
  const statements = sql
    .split(";")
    .map((s) =>
      s
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim()
    )
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    try {
      await pool.query(stmt);
    } catch (err) {
      console.error("Schema statement failed:", err?.message || String(err));
      if (err?.code) console.error("PG code:", err.code);
      console.error("Statement:", stmt.slice(0, 200));
      throw err;
    }
  }

  await migrateProductsToMenuIfExists();
  await migrateAddOptionalColumns();
  await migrateGalleryTable();

  const tablesExist = await ensureCoreTablesExist();
  if (!tablesExist) {
    throw new Error("Core tables (e.g. users) could not be created. Check database connection and schema.");
  }

  await seedIfEmpty();
}

async function ensureCoreTablesExist() {
  const required = ["users", "categories", "menu_items", "orders", "reservations"];
  for (const table of required) {
    const res = await pool.query(
      "SELECT to_regclass($1::text) AS exists",
      ["public." + table]
    );
    if (!res.rows[0]?.exists) {
      console.error(`Table "${table}" is missing. Re-running schema for ${table}.`);
      await createTableIfMissing(table);
    }
  }
  return true;
}

async function createTableIfMissing(tableName) {
  const definitions = {
    users: `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    categories: `CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    menu_items: `CREATE TABLE IF NOT EXISTS menu_items (
      id SERIAL PRIMARY KEY,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(12, 2) NOT NULL,
      image_url VARCHAR(500),
      available BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    orders: `CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      items JSONB NOT NULL DEFAULT '[]',
      table_number INTEGER,
      notes TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    reservations: `CREATE TABLE IF NOT EXISTS reservations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      date VARCHAR(50) NOT NULL,
      time VARCHAR(50) NOT NULL,
      guests VARCHAR(20) NOT NULL,
      occasion TEXT,
      notes TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
  };
  const sql = definitions[tableName];
  if (sql) await pool.query(sql);
}

async function seedIfEmpty() {
  const countRes = await pool.query("SELECT COUNT(*) AS n FROM categories");
  if (Number(countRes.rows[0]?.n) > 0) return;
  const catRes = await pool.query(
    `INSERT INTO categories (name, sort_order) VALUES
     ('Starters', 0), ('Main Courses', 1), ('Signature Dishes', 2), ('Desserts', 3), ('Drinks', 4)
     RETURNING id, name`
  );
  const ids = {};
  for (const row of catRes.rows) {
    ids[row.name] = row.id;
  }
  const items = [
    [ids["Starters"], "Ember Tartare", "Hand-cut beef tenderloin with quail yolk, truffle oil, and capers", 28],
    [ids["Main Courses"], "Dry-Aged Ribeye", "45-day aged prime ribeye with bone marrow butter and roasted shallots", 95],
    [ids["Signature Dishes"], "Wagyu A5 Tenderloin", "Japanese wagyu with black truffle jus and seasonal vegetables", 165],
    [ids["Desserts"], "Chocolate Sphere", "Valrhona dark chocolate dome with gold leaf and espresso gelato", 32],
    [ids["Drinks"], "Smoke & Mirrors", "Mezcal, elderflower, activated charcoal, and lime with a smoke bubble", 22],
  ];
  for (const [categoryId, name, description, price] of items) {
    if (categoryId) {
      await pool.query(
        "INSERT INTO menu_items (category_id, name, description, price) VALUES ($1, $2, $3, $4)",
        [categoryId, name, description, price]
      );
    }
  }
}

async function migrateAddOptionalColumns() {
  await pool.query(
    "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)"
  );
  await pool.query(
    "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT true"
  );
  await pool.query(
    "ALTER TABLE reservations ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'"
  );
}

async function migrateGalleryTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS gallery (
      id SERIAL PRIMARY KEY,
      image_url VARCHAR(500) NOT NULL,
      title VARCHAR(255),
      caption VARCHAR(500),
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function migrateProductsToMenuIfExists() {
  const res = await pool.query(
    "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products')"
  );
  if (!res.rows[0]?.exists) return;
  const products = (await pool.query("SELECT id, name, description, price, category FROM products")).rows;
  const categoryNames = [...new Set(products.map((p) => p.category || "main"))];
  const nameToId = {};
  let sortOrder = 0;
  for (const name of categoryNames) {
    const ins = await pool.query(
      "INSERT INTO categories (name, sort_order) VALUES ($1, $2) RETURNING id",
      [name, sortOrder++]
    );
    if (ins.rows[0]) nameToId[name] = ins.rows[0].id;
  }
  for (const p of products) {
    const categoryId = nameToId[p.category || "main"] ?? categories[0]?.id;
    if (categoryId) {
      await pool.query(
        "INSERT INTO menu_items (category_id, name, description, price) VALUES ($1, $2, $3, $4)",
        [categoryId, p.name, p.description ?? "", p.price]
      );
    }
  }
  await pool.query("DROP TABLE IF EXISTS products");
}
