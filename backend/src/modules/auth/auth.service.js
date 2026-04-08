import jwt from "jsonwebtoken";
import config from "../../config/index.js";
import * as usersRepo from "../../infrastructure/database/usersRepository.js";
import { UnauthorizedError, BadRequestError } from "../../common/errors/AppError.js";

const DEFAULT_ROLE = "user";

export async function register(email, password, name, adminSecret) {
  const existing = await usersRepo.getByEmail(email);
  if (existing) {
    throw new BadRequestError("Email already registered");
  }
  const role =
    adminSecret && adminSecret === config.adminSecret ? "admin" : DEFAULT_ROLE;
  const user = await usersRepo.create({ email, password, name, role });
  const { password: _, ...safe } = user;
  return { user: safe, token: signToken(safe) };
}

export async function login(email, password) {
  const user = await usersRepo.getByEmail(email);
  if (!user || user.password !== password) {
    throw new UnauthorizedError("Invalid email or password");
  }
  const { password: _, ...safe } = user;
  return { user: safe, token: signToken(safe) };
}

function signToken(payload) {
  return jwt.sign(
    { id: payload.id, email: payload.email, role: payload.role || DEFAULT_ROLE },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}
