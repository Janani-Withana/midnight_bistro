import { query } from "./connection.js";

function rowToOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    items: row.items ?? [],
    tableNumber: row.table_number,
    notes: row.notes ?? "",
    status: row.status ?? "pending",
    createdAt: row.created_at?.toISOString?.() ?? row.created_at,
  };
}

export async function list() {
  const res = await query(
    "SELECT id, user_id, items, table_number, notes, status, created_at FROM orders ORDER BY id"
  );
  return res.rows.map(rowToOrder);
}

export async function getById(id) {
  const numId = parseInt(id, 10);
  const res = await query(
    "SELECT id, user_id, items, table_number, notes, status, created_at FROM orders WHERE id = $1",
    [numId]
  );
  return rowToOrder(res.rows[0]) ?? null;
}

export async function create({ userId, items, tableNumber, notes }) {
  const res = await query(
    `INSERT INTO orders (user_id, items, table_number, notes)
     VALUES ($1, $2::jsonb, $3, $4)
     RETURNING id, user_id, items, table_number, notes, status, created_at`,
    [userId ?? null, JSON.stringify(items ?? []), tableNumber ?? null, notes ?? ""]
  );
  return rowToOrder(res.rows[0]);
}

export async function update(id, { status, items }) {
  const numId = parseInt(id, 10);
  const updates = [];
  const values = [];
  let i = 1;
  if (status !== undefined) {
    updates.push(`status = $${i++}`);
    values.push(status);
  }
  if (items !== undefined) {
    updates.push(`items = $${i++}::jsonb`);
    values.push(JSON.stringify(items));
  }
  if (updates.length === 0) return getById(id);
  values.push(numId);
  const res = await query(
    `UPDATE orders SET ${updates.join(", ")} WHERE id = $${i} RETURNING id, user_id, items, table_number, notes, status, created_at`,
    values
  );
  return rowToOrder(res.rows[0]) ?? null;
}
