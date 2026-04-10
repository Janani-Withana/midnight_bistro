-- Wipe all application data (schema unchanged). Usage: psql "$DATABASE_URL" -f scripts/clear-db.sql
BEGIN;
TRUNCATE TABLE
  refresh_tokens,
  orders,
  menu_items,
  gallery,
  reservations,
  categories,
  users
RESTART IDENTITY CASCADE;
COMMIT;
