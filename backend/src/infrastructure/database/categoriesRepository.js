import { query } from "./connection.js";

function rowToCategory(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at?.toISOString?.() ?? row.created_at,
  };
}

export async function list() {
  const res = await query(
    "SELECT id, name, sort_order, created_at FROM categories ORDER BY sort_order ASC, id ASC"
  );
  return res.rows.map(rowToCategory);
}

export async function getById(id) {
  const numId = parseInt(id, 10);
  const res = await query(
    "SELECT id, name, sort_order, created_at FROM categories WHERE id = $1",
    [numId]
  );
  return rowToCategory(res.rows[0]) ?? null;
}

export async function create({ name, sortOrder }) {
  const res = await query(
    `INSERT INTO categories (name, sort_order)
     VALUES ($1, $2)
     RETURNING id, name, sort_order, created_at`,
    [name, sortOrder ?? 0]
  );
  return rowToCategory(res.rows[0]);
}

export async function update(id, { name, sortOrder }) {
  const numId = parseInt(id, 10);
  const updates = [];
  const values = [];
  let i = 1;
  if (name !== undefined) {
    updates.push(`name = $${i++}`);
    values.push(name);
  }
  if (sortOrder !== undefined) {
    updates.push(`sort_order = $${i++}`);
    values.push(Number(sortOrder));
  }
  if (updates.length === 0) return getById(id);
  values.push(numId);
  const res = await query(
    `UPDATE categories SET ${updates.join(", ")} WHERE id = $${i} RETURNING id, name, sort_order, created_at`,
    values
  );
  return rowToCategory(res.rows[0]) ?? null;
}

export async function remove(id) {
  const numId = parseInt(id, 10);
  const res = await query("DELETE FROM categories WHERE id = $1 RETURNING id", [numId]);
  return res.rowCount > 0;
}
