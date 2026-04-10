import { query } from "./connection.js";

export async function insert({ userId, tokenHash, expiresAt }) {
  const res = await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [userId, tokenHash, expiresAt]
  );
  return res.rows[0]?.id ?? null;
}

export async function findValidByUserAndHash(userId, tokenHash) {
  const res = await query(
    `SELECT id FROM refresh_tokens
     WHERE user_id = $1 AND token_hash = $2 AND expires_at > NOW()`,
    [userId, tokenHash]
  );
  return res.rows[0] ?? null;
}

export async function deleteByHash(tokenHash) {
  const res = await query("DELETE FROM refresh_tokens WHERE token_hash = $1", [tokenHash]);
  return res.rowCount > 0;
}

export async function deleteExpired() {
  await query("DELETE FROM refresh_tokens WHERE expires_at <= NOW()");
}
