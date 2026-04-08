/**
 * API client for Midnight Bistro backend.
 * Uses VITE_API_URL (default http://localhost:3001) for base URL.
 */

const getBaseUrl = () => import.meta.env?.VITE_API_URL || "http://localhost:3001";

export function getAuthToken() {
  try {
    return localStorage.getItem("admin_token") || null;
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) localStorage.setItem("admin_token", token);
    else localStorage.removeItem("admin_token");
  } catch {}
}

export async function request(path, options = {}) {
  const url = `${getBaseUrl()}${path}`;
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const err = new Error(data?.message || data?.error || res.statusText || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
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
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(url, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const err = new Error(data?.message || data?.error || res.statusText || "Upload failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
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
