import * as categoriesRepo from "../../infrastructure/database/categoriesRepository.js";
import { NotFoundError, BadRequestError } from "../../common/errors/AppError.js";

export async function list() {
  return categoriesRepo.list();
}

export async function getById(id) {
  const category = await categoriesRepo.getById(id);
  if (!category) throw new NotFoundError("Category");
  return category;
}

export async function create(data) {
  const { name, sortOrder } = data;
  if (!name || name.trim() === "") {
    throw new BadRequestError("Category name is required");
  }
  return categoriesRepo.create({ name: name.trim(), sortOrder });
}

export async function update(id, data) {
  const existing = await categoriesRepo.getById(id);
  if (!existing) throw new NotFoundError("Category");
  const updated = await categoriesRepo.update(id, data);
  return updated ?? existing;
}

export async function remove(id) {
  const deleted = await categoriesRepo.remove(id);
  if (!deleted) throw new NotFoundError("Category");
  return true;
}
