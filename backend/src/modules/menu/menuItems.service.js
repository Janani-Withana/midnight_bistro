import * as menuItemsRepo from "../../infrastructure/database/menuItemsRepository.js";
import { NotFoundError, BadRequestError } from "../../common/errors/AppError.js";

export async function list(categoryId = null) {
  return menuItemsRepo.list(categoryId);
}

export async function getById(id) {
  const item = await menuItemsRepo.getById(id);
  if (!item) throw new NotFoundError("Menu item");
  return item;
}

export async function create(data) {
  const { categoryId, name, description, price, imageUrl, available } = data;
  if (!name || price == null) {
    throw new BadRequestError("Name and price are required");
  }
  if (!categoryId) {
    throw new BadRequestError("Category is required");
  }
  return menuItemsRepo.create({ categoryId, name, description, price, imageUrl, available });
}

export async function update(id, data) {
  const existing = await menuItemsRepo.getById(id);
  if (!existing) throw new NotFoundError("Menu item");
  const updated = await menuItemsRepo.update(id, data);
  return updated ?? existing;
}

export async function remove(id) {
  const deleted = await menuItemsRepo.remove(id);
  if (!deleted) throw new NotFoundError("Menu item");
  return true;
}
