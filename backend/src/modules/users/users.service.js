import * as usersRepo from "../../infrastructure/database/usersRepository.js";
import { NotFoundError, BadRequestError } from "../../common/errors/AppError.js";

function sanitize(user) {
  const { password, ...rest } = user;
  return rest;
}

export async function list() {
  const users = await usersRepo.list();
  return users.map(sanitize);
}

export async function getById(id) {
  const user = await usersRepo.getById(id);
  if (!user) throw new NotFoundError("User");
  return sanitize(user);
}

export async function create(data) {
  const { email, password, name } = data;
  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }
  if (await usersRepo.getByEmail(email)) {
    throw new BadRequestError("Email already registered");
  }
  const user = await usersRepo.create({ email, password, name, role: "user" });
  return sanitize(user);
}

export async function update(id, data) {
  const existing = await usersRepo.getById(id);
  if (!existing) throw new NotFoundError("User");
  const user = await usersRepo.update(id, data);
  return user ? sanitize(user) : sanitize(existing);
}

export async function remove(id) {
  const deleted = await usersRepo.remove(id);
  if (!deleted) throw new NotFoundError("User");
  return true;
}
