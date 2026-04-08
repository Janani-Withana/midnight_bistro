import { query } from "./connection.js";

function rowToReservation(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    date: row.date,
    time: row.time,
    guests: String(row.guests),
    occasion: row.occasion ?? "",
    notes: row.notes ?? "",
    status: row.status ?? "pending",
    createdAt: row.created_at?.toISOString?.() ?? row.created_at,
  };
}

export async function list() {
  const res = await query(
    "SELECT id, name, email, phone, date, time, guests, occasion, notes, status, created_at FROM reservations ORDER BY id"
  );
  return res.rows.map(rowToReservation);
}

export async function getById(id) {
  const numId = parseInt(id, 10);
  const res = await query(
    "SELECT id, name, email, phone, date, time, guests, occasion, notes, status, created_at FROM reservations WHERE id = $1",
    [numId]
  );
  return rowToReservation(res.rows[0]) ?? null;
}

export async function create({ name, email, phone, date, time, guests, occasion, notes }) {
  const res = await query(
    `INSERT INTO reservations (name, email, phone, date, time, guests, occasion, notes, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmed')
     RETURNING id, name, email, phone, date, time, guests, occasion, notes, status, created_at`,
    [
      name,
      email,
      phone,
      date,
      time,
      String(guests),
      occasion ?? "",
      notes ?? "",
    ]
  );
  return rowToReservation(res.rows[0]);
}
