// Cache stub. Wire to Redis, etc. later.
const memory = new Map();

export function get(key) {
  return memory.get(key);
}

export function set(key, value, ttlSeconds) {
  memory.set(key, value);
  if (ttlSeconds) {
    setTimeout(() => memory.delete(key), ttlSeconds * 1000);
  }
}

export function del(key) {
  memory.delete(key);
}
