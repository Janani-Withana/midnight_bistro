import { verifyToken } from "../../modules/auth/auth.service.js";
import { UnauthorizedError, ForbiddenError } from "../errors/AppError.js";
import { isAdminRole } from "../utils/roles.js";
import * as usersRepo from "../../infrastructure/database/usersRepository.js";

/** Resolve numeric user id from access token payload (supports `id` or `sub`). */
function userIdFromAccessPayload(payload) {
  if (!payload || typeof payload !== "object") return null;
  const raw = payload.id != null ? payload.id : payload.sub;
  if (raw == null) return null;
  const n = Number.parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return n;
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Missing or invalid Authorization header"));
  }
  const token = authHeader.slice(7);
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Admin routes trust the database role. Missing user (e.g. after DB reset) must be
 * 401 so clients run refresh / clear session; only real non-admin users get 403.
 */
export async function requireAdmin(req, res, next) {
  const userId = userIdFromAccessPayload(req.user);
  if (userId == null) {
    return next(new UnauthorizedError("Invalid access token"));
  }
  try {
    const user = await usersRepo.getById(userId);
    if (!user) {
      return next(new UnauthorizedError("Invalid or expired session"));
    }
    if (!isAdminRole(user.role)) {
      return next(new ForbiddenError("Admin access required"));
    }
    const { password: _p, ...safe } = user;
    req.user = {
      id: safe.id,
      email: safe.email,
      name: safe.name,
      role: safe.role,
    };
    next();
  } catch (err) {
    next(err);
  }
}
