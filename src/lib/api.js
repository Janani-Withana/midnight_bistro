/**
 * API client for Midnight Bistro backend.
 * Uses VITE_API_URL (default http://localhost:3001) for base URL.
 *
 * **Admin session**
 * - `POST /api/auth/login` and `POST /api/auth/register` return `{ user, token, refreshToken }`.
 * - **token** (access JWT) is sent as `Authorization: Bearer <token>` on API calls.
 * - **refreshToken** is stored only in the client (localStorage); it is **not** attached to
 *   every request. It is used only for `POST /api/auth/refresh` to obtain new access + refresh
 *   tokens (automatic on 401, or shortly before access token expiry).
 */

const getBaseUrl = () => import.meta.env?.VITE_API_URL || "http://localhost:3001";

/** Log API responses in dev (set VITE_DEBUG_API=true to force in production builds). */
function shouldLogApi() {
  return Boolean(import.meta.env?.DEV || import.meta.env?.VITE_DEBUG_API === "true");
}

function redactForLog(value) {
  if (value == null || typeof value !== "object") return value;
  const sensitive = new Set(["token", "refreshToken", "password", "adminSecret"]);
  if (Array.isArray(value)) {
    return value.map((item) => redactForLog(item));
  }
  const out = { ...value };
  for (const key of Object.keys(out)) {
    if (sensitive.has(key)) {
      out[key] = out[key] ? "[redacted]" : out[key];
    } else if (out[key] && typeof out[key] === "object") {
      out[key] = redactForLog(out[key]);
    }
  }
  return out;
}

function logApiResponse(method, path, status, data, isError) {
  if (!shouldLogApi()) return;
  const tag = `[API] ${method} ${path} ${status}`;
  const payload = data !== undefined ? redactForLog(data) : undefined;
  if (isError) {
    console.warn(tag, payload);
  } else {
    console.log(tag, payload);
  }
}

const REFRESH_KEY = "admin_refresh_token";

/** Paths where 401 must not trigger refresh (e.g. wrong password on login). */
const AUTH_NO_REFRESH = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/logout",
]);

export function getAuthToken() {
  try {
    return localStorage.getItem("admin_token") || null;
  } catch {
    return null;
  }
}

export function getRefreshToken() {
  try {
    return localStorage.getItem(REFRESH_KEY) || null;
  } catch {
    return null;
  }
}

/** Store admin access + refresh tokens (admin sessions). */
export function setAuthTokens(accessToken, refreshToken) {
  try {
    if (accessToken) localStorage.setItem("admin_token", accessToken);
    else localStorage.removeItem("admin_token");
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    else localStorage.removeItem(REFRESH_KEY);
  } catch {}
}

/**
 * Persist tokens from `POST /api/auth/login`, `POST /api/auth/register`, or `POST /api/auth/refresh`.
 * @returns {boolean} true if an access token was saved
 */
export function applyAuthResponse(body) {
  if (!body || typeof body !== "object") return false;
  const token = body.token;
  const refreshToken = body.refreshToken;
  if (!token) return false;
  if (refreshToken) setAuthTokens(token, refreshToken);
  else setAuthToken(token);
  return true;
}

/** Backward compatible: clears both tokens when null. */
export function setAuthToken(token) {
  if (!token) {
    try {
      localStorage.removeItem("admin_token");
      localStorage.removeItem(REFRESH_KEY);
    } catch {}
    return;
  }
  try {
    localStorage.setItem("admin_token", token);
  } catch {}
}

function parseJsonBody(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function tryRefreshAccessToken() {
  const rt = getRefreshToken();
  if (!rt) return false;
  const path = "/api/auth/refresh";
  try {
    const res = await fetch(`${getBaseUrl()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    const text = await res.text();
    const data = parseJsonBody(text);
    if (!res.ok) {
      logApiResponse("POST", path, res.status, data, true);
      setAuthTokens(null, null);
      return false;
    }
    logApiResponse("POST", path, res.status, data, false);
    const token = data?.token;
    const refreshToken = data?.refreshToken;
    if (!token) {
      setAuthTokens(null, null);
      return false;
    }
    if (refreshToken) setAuthTokens(token, refreshToken);
    else setAuthToken(token);
    return true;
  } catch (e) {
    logApiResponse("POST", path, 0, { error: String(e?.message || e) }, true);
    setAuthTokens(null, null);
    return false;
  }
}

/** Renews the admin access token using the refresh token (also used on a timer). */
export async function refreshAdminSession() {
  return tryRefreshAccessToken();
}

/** Revokes the refresh token on the server and clears local storage. */
export async function logoutAdmin() {
  const rt = getRefreshToken();
  const path = "/api/auth/logout";
  try {
    const res = await fetch(`${getBaseUrl()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    const text = await res.text();
    const data = text ? parseJsonBody(text) : null;
    logApiResponse("POST", path, res.status, data ?? (text || "(empty)"), !res.ok);
  } catch (e) {
    logApiResponse("POST", path, 0, { error: String(e?.message || e) }, true);
    // still clear client session
  }
  setAuthTokens(null, null);
}

function shouldAttemptRefresh401(path, authRetry) {
  if (authRetry || !getRefreshToken()) return false;
  if (AUTH_NO_REFRESH.has(path)) return false;
  return true;
}

/** Read JWT `exp` (ms) from access token for proactive refresh. */
function accessTokenExpiresAtMs() {
  const t = getAuthToken();
  if (!t) return null;
  const parts = t.split(".");
  if (parts.length < 2) return null;
  try {
    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    const payload = JSON.parse(atob(b64));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** If access token expires soon, renew using refresh token (keeps session without waiting for 401). */
async function maybeRefreshBeforeExpiry() {
  if (!getRefreshToken()) return;
  const exp = accessTokenExpiresAtMs();
  if (exp == null) return;
  const bufferMs = 90 * 1000;
  if (Date.now() < exp - bufferMs) return;
  await tryRefreshAccessToken();
}

export async function request(path, options = {}) {
  const authRetry = options._authRetry === true;
  const opts = { ...options };
  delete opts._authRetry;

  if (!authRetry && !AUTH_NO_REFRESH.has(path)) {
    await maybeRefreshBeforeExpiry();
  }

  const method = (opts.method || "GET").toUpperCase();
  const url = `${getBaseUrl()}${path}`;
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...opts.headers,
  };
  const res = await fetch(url, { ...opts, headers });
  const text = await res.text();
  const data = parseJsonBody(text);

  if (res.status === 401 && shouldAttemptRefresh401(path, authRetry)) {
    const refreshed = await tryRefreshAccessToken();
    if (refreshed) {
      return request(path, { ...opts, _authRetry: true });
    }
  }

  if (!res.ok) {
    logApiResponse(method, path, res.status, data, true);
    const err = new Error(data?.message || data?.error || res.statusText || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  logApiResponse(method, path, res.status, data, false);
  return data;
}

// --- Public API (no auth) ---

export async function getHealth() {
  return request("/health");
}

export async function getCategories() {
  const data = await request("/api/categories");
  return data.categories || [];
}

export async function getMenuItems(categoryId = null) {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : "";
  const data = await request(`/api/menu-items${query}`);
  return data.menuItems || [];
}

export async function postReservation(body) {
  return request("/api/reservations", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getGallery() {
  const data = await request("/api/gallery");
  return data.gallery || [];
}

// --- Auth ---

export async function login(email, password) {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data;
}

export async function register(email, password, name, adminSecret) {
  const data = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name, adminSecret }),
  });
  return data;
}

// --- Admin API (requires auth token) ---

export async function getAdminMe() {
  return request("/api/admin/me");
}

export async function uploadAdminImage(file) {
  const url = `${getBaseUrl()}/api/admin/upload-image`;
  const path = "/api/admin/upload-image";

  const runUpload = async (authRetry) => {
    if (!authRetry) {
      await maybeRefreshBeforeExpiry();
    }
    const token = getAuthToken();
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(url, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const text = await res.text();
    const data = parseJsonBody(text);

    if (res.status === 401 && shouldAttemptRefresh401(path, authRetry)) {
      const refreshed = await tryRefreshAccessToken();
      if (refreshed) {
        return runUpload(true);
      }
    }

    if (!res.ok) {
      logApiResponse("POST", path, res.status, data, true);
      const err = new Error(data?.message || data?.error || res.statusText || "Upload failed");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    logApiResponse("POST", path, res.status, data, false);
    return data;
  };

  return runUpload(false);
}

export async function getAdminReservations() {
  const data = await request("/api/admin/reservations");
  return data.reservations || [];
}

export async function getAdminCategories() {
  const data = await request("/api/admin/categories");
  return data.categories || [];
}

export async function getAdminMenuItems(categoryId = null) {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : "";
  const data = await request(`/api/admin/menu-items${query}`);
  return data.menuItems || [];
}

export async function createAdminCategory(body) {
  return request("/api/admin/categories", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminCategory(id, body) {
  return request(`/api/admin/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteAdminCategory(id) {
  return request(`/api/admin/categories/${id}`, { method: "DELETE" });
}

export async function createAdminMenuItem(body) {
  return request("/api/admin/menu-items", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminMenuItem(id, body) {
  return request(`/api/admin/menu-items/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteAdminMenuItem(id) {
  return request(`/api/admin/menu-items/${id}`, { method: "DELETE" });
}

export async function getAdminGallery() {
  const data = await request("/api/admin/gallery");
  return data.gallery || [];
}

export async function createAdminGalleryImage(body) {
  return request("/api/admin/gallery", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function deleteAdminGalleryImage(id) {
  return request(`/api/admin/gallery/${id}`, { method: "DELETE" });
}
