import { query } from "./connection.js";

function rowToGallery(row) {
  if (!row) return null;
  return {
    id: row.id,
    imageUrl: row.image_url,
    title: row.title ?? "",
    caption: row.caption ?? "",
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at?.toISOString?.() ?? row.created_at,
  };
}

export async function list() {
  const res = await query(
    "SELECT id, image_url, title, caption, sort_order, created_at FROM gallery ORDER BY sort_order ASC, id ASC"
  );
  return res.rows.map(rowToGallery);
}

export async function getById(id) {
  const numId = parseInt(id, 10);
  const res = await query(
    "SELECT id, image_url, title, caption, sort_order, created_at FROM gallery WHERE id = $1",
    [numId]
  );
  return rowToGallery(res.rows[0]) ?? null;
}

export async function create({ imageUrl, title, caption, sortOrder }) {
  const res = await query(
    `INSERT INTO gallery (image_url, title, caption, sort_order)
     VALUES ($1, $2, $3, $4)
     RETURNING id, image_url, title, caption, sort_order, created_at`,
    [imageUrl, title ?? "", caption ?? "", sortOrder ?? 0]
  );
  return rowToGallery(res.rows[0]);
}

export async function remove(id) {
  const numId = parseInt(id, 10);
  const res = await query("DELETE FROM gallery WHERE id = $1 RETURNING id", [numId]);
  return res.rowCount > 0;
}
