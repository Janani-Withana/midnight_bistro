import { query } from "./connection.js";
import { normalizeRole } from "../../common/utils/roles.js";

function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    name: row.name,
    role: normalizeRole(row.role),
    createdAt: row.created_at?.toISOString?.() ?? row.created_at,
  };
}

export async function list() {
  const res = await query("SELECT id, email, password, name, role, created_at FROM users ORDER BY id");
  return res.rows.map(rowToUser);
}

export async function getById(id) {
  const numId = Number.parseInt(String(id).trim(), 10);
  if (!Number.isFinite(numId) || numId < 1) {
    return null;
  }
  const res = await query(
    "SELECT id, email, password, name, role, created_at FROM users WHERE id = $1",
    [numId]
  );
  return rowToUser(res.rows[0]) ?? null;
}

export async function getByEmail(email) {
  const res = await query(
    "SELECT id, email, password, name, role, created_at FROM users WHERE email = $1",
    [email]
  );
  return rowToUser(res.rows[0]) ?? null;
}

export async function create({ email, password, name, role = "user" }) {
  const res = await query(
    `INSERT INTO users (email, password, name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, password, name, role, created_at`,
    [email, password, name || email.split("@")[0], role]
  );
  return rowToUser(res.rows[0]);
}

export async function updateRole(id, role) {
  const numId = Number.parseInt(String(id).trim(), 10);
  if (!Number.isFinite(numId) || numId < 1) {
    return null;
  }
  const res = await query(
    `UPDATE users SET role = $1 WHERE id = $2
     RETURNING id, email, password, name, role, created_at`,
    [role, numId]
  );
  return rowToUser(res.rows[0]) ?? null;
}

export async function update(id, { name, email, password }) {
  const numId = parseInt(id, 10);
  const updates = [];
  const values = [];
  let i = 1;
  if (name !== undefined) {
    updates.push(`name = $${i++}`);
    values.push(name);
  }
  if (email !== undefined) {
    updates.push(`email = $${i++}`);
    values.push(email);
  }
  if (password !== undefined) {
    updates.push(`password = $${i++}`);
    values.push(password);
  }
  if (updates.length === 0) return getById(id);
  values.push(numId);
  const res = await query(
    `UPDATE users SET ${updates.join(", ")} WHERE id = $${i} RETURNING id, email, password, name, role, created_at`,
    values
  );
  return rowToUser(res.rows[0]) ?? null;
}

export async function remove(id) {
  const numId = parseInt(id, 10);
  const res = await query("DELETE FROM users WHERE id = $1 RETURNING id", [numId]);
  return res.rowCount > 0;
}
