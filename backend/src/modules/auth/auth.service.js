import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../../config/index.js";
import * as usersRepo from "../../infrastructure/database/usersRepository.js";
import * as refreshTokensRepo from "../../infrastructure/database/refreshTokensRepository.js";
import {
  UnauthorizedError,
  BadRequestError,
  ForbiddenError,
} from "../../common/errors/AppError.js";
import { isAdminRole } from "../../common/utils/roles.js";

function adminSecretMatches(clientSecret) {
  const c = String(clientSecret ?? "").trim();
  const s = String(config.adminSecret ?? "").trim();
  return s.length > 0 && c === s;
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token, "utf8").digest("hex");
}

function signAccessTokenAdmin(payload) {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      role: payload.role || "admin",
    },
    config.jwtSecret,
    { expiresIn: config.jwtAccessExpiresIn }
  );
}

async function createAdminRefreshToken(safeUser) {
  const refreshToken = jwt.sign(
    { id: safeUser.id, typ: "refresh" },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn }
  );
  const decoded = jwt.decode(refreshToken);
  const expSec = decoded?.exp;
  const expiresAt = expSec
    ? new Date(expSec * 1000)
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  await refreshTokensRepo.insert({
    userId: safeUser.id,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });
  return refreshToken;
}

/**
 * Admin-only self-registration. Requires ADMIN_SECRET on the server and matching adminSecret in the body.
 */
export async function register(email, password, name, adminSecret) {
  const existing = await usersRepo.getByEmail(email);
  if (existing) {
    throw new BadRequestError("Email already registered");
  }
  const secretConfigured = String(config.adminSecret ?? "").trim().length > 0;
  if (!secretConfigured) {
    throw new BadRequestError(
      "Admin registration is disabled: set ADMIN_SECRET in the server environment"
    );
  }
  if (!adminSecretMatches(adminSecret)) {
    throw new BadRequestError(
      "Invalid admin secret: must match ADMIN_SECRET from the server environment"
    );
  }
  const user = await usersRepo.create({ email, password, name, role: "admin" });
  const { password: _, ...safe } = user;
  const token = signAccessTokenAdmin(safe);
  const refreshToken = await createAdminRefreshToken(safe);
  return { user: safe, token, refreshToken };
}

/** Grant admin to an existing account when email/password + ADMIN_SECRET match (no SQL needed). */
export async function promoteToAdmin(email, password, adminSecret) {
  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }
  if (!adminSecretMatches(adminSecret)) {
    throw new UnauthorizedError("Invalid credentials");
  }
  const user = await usersRepo.getByEmail(email);
  if (!user || user.password !== password) {
    throw new UnauthorizedError("Invalid credentials");
  }
  let record = user;
  if (!isAdminRole(user.role)) {
    const updated = await usersRepo.updateRole(user.id, "admin");
    if (!updated) {
      throw new UnauthorizedError("Invalid credentials");
    }
    record = updated;
  }
  const { password: _, ...safe } = record;
  const token = signAccessTokenAdmin(safe);
  const refreshToken = await createAdminRefreshToken(safe);
  return { user: safe, token, refreshToken };
}

/** Administrator sign-in only (same credentials as dashboard). */
export async function login(email, password) {
  const user = await usersRepo.getByEmail(email);
  if (!user || user.password !== password) {
    throw new UnauthorizedError("Invalid email or password");
  }
  const { password: _, ...safe } = user;
  if (!isAdminRole(safe.role)) {
    throw new ForbiddenError("Administrator sign-in only");
  }
  const token = signAccessTokenAdmin(safe);
  const refreshToken = await createAdminRefreshToken(safe);
  return { user: safe, token, refreshToken };
}

export async function refreshSession(refreshTokenRaw) {
  if (!refreshTokenRaw || typeof refreshTokenRaw !== "string") {
    throw new BadRequestError("Refresh token required");
  }
  let decoded;
  try {
    decoded = jwt.verify(refreshTokenRaw, config.jwtRefreshSecret);
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
  if (decoded.typ !== "refresh" || decoded.id == null) {
    throw new UnauthorizedError("Invalid refresh token");
  }
  const hash = hashToken(refreshTokenRaw);
  const row = await refreshTokensRepo.findValidByUserAndHash(decoded.id, hash);
  if (!row) {
    throw new UnauthorizedError("Refresh token revoked or invalid");
  }
  const user = await usersRepo.getById(decoded.id);
  if (!user || !isAdminRole(user.role)) {
    throw new UnauthorizedError("Invalid refresh token");
  }
  await refreshTokensRepo.deleteByHash(hash);
  const { password: _, ...safe } = user;
  const token = signAccessTokenAdmin(safe);
  const refreshToken = await createAdminRefreshToken(safe);
  return { user: safe, token, refreshToken };
}

export async function logoutRefresh(refreshTokenRaw) {
  if (!refreshTokenRaw || typeof refreshTokenRaw !== "string") {
    return;
  }
  try {
    jwt.verify(refreshTokenRaw, config.jwtRefreshSecret);
  } catch {
    return;
  }
  const hash = hashToken(refreshTokenRaw);
  await refreshTokensRepo.deleteByHash(hash);
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}
