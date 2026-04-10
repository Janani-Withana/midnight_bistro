/** Normalize role from DB or JWT for comparisons (handles whitespace / casing). */
export function normalizeRole(role) {
  return String(role ?? "")
    .trim()
    .toLowerCase() || "user";
}

export function isAdminRole(role) {
  return normalizeRole(role) === "admin";
}
