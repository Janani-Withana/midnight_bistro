import { query } from "./connection.js";

function rowToMenuItem(row) {
  if (!row) return null;
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description ?? "",
    price: Number(row.price),
    imageUrl: row.image_url ?? null,
    available: row.available !== false,
    createdAt: row.created_at?.toISOString?.() ?? row.created_at,
  };
}

export async function list(categoryId = null) {
  if (categoryId != null) {
    const numId = parseInt(categoryId, 10);
  const res = await query(
    "SELECT id, category_id, name, description, price, image_url, available, created_at FROM menu_items WHERE category_id = $1 ORDER BY id",
    [numId]
  );
  return res.rows.map(rowToMenuItem);
  }
  const res = await query(
    "SELECT id, category_id, name, description, price, image_url, available, created_at FROM menu_items ORDER BY category_id, id"
  );
  return res.rows.map(rowToMenuItem);
}

export async function getById(id) {
  const numId = parseInt(id, 10);
  const res = await query(
    "SELECT id, category_id, name, description, price, image_url, available, created_at FROM menu_items WHERE id = $1",
    [numId]
  );
  return rowToMenuItem(res.rows[0]) ?? null;
}

export async function create({ categoryId, name, description, price, imageUrl, available }) {
  const res = await query(
    `INSERT INTO menu_items (category_id, name, description, price, image_url, available)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, category_id, name, description, price, image_url, available, created_at`,
    [categoryId, name, description ?? "", Number(price), imageUrl ?? null, available !== false]
  );
  return rowToMenuItem(res.rows[0]);
}

export async function update(id, { categoryId, name, description, price, imageUrl, available }) {
  const numId = parseInt(id, 10);
  const updates = [];
  const values = [];
  let i = 1;
  if (categoryId !== undefined) {
    updates.push(`category_id = $${i++}`);
    values.push(categoryId);
  }
  if (name !== undefined) {
    updates.push(`name = $${i++}`);
    values.push(name);
  }
  if (description !== undefined) {
    updates.push(`description = $${i++}`);
    values.push(description);
  }
  if (price !== undefined) {
    updates.push(`price = $${i++}`);
    values.push(Number(price));
  }
  if (imageUrl !== undefined) {
    updates.push(`image_url = $${i++}`);
    values.push(imageUrl);
  }
  if (available !== undefined) {
    updates.push(`available = $${i++}`);
    values.push(available);
  }
  if (updates.length === 0) return getById(id);
  values.push(numId);
  const res = await query(
    `UPDATE menu_items SET ${updates.join(", ")} WHERE id = $${i} RETURNING id, category_id, name, description, price, image_url, available, created_at`,
    values
  );
  return rowToMenuItem(res.rows[0]) ?? null;
}

export async function remove(id) {
  const numId = parseInt(id, 10);
  const res = await query("DELETE FROM menu_items WHERE id = $1 RETURNING id", [numId]);
  return res.rowCount > 0;
}
