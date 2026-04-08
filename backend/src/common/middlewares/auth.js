import { verifyToken } from "../../modules/auth/auth.service.js";
import { UnauthorizedError, ForbiddenError } from "../errors/AppError.js";

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

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return next(new ForbiddenError("Admin access required"));
  }
  next();
}
