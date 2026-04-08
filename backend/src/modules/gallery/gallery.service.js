import * as galleryRepo from "../../infrastructure/database/galleryRepository.js";
import { NotFoundError, BadRequestError } from "../../common/errors/AppError.js";

export async function list() {
  return galleryRepo.list();
}

export async function getById(id) {
  const item = await galleryRepo.getById(id);
  if (!item) throw new NotFoundError("Gallery image");
  return item;
}

export async function create(data) {
  const { imageUrl, title, caption, sortOrder } = data;
  if (!imageUrl || !imageUrl.trim()) {
    throw new BadRequestError("Image URL is required");
  }
  return galleryRepo.create({
    imageUrl: imageUrl.trim(),
    title: title?.trim(),
    caption: caption?.trim(),
    sortOrder,
  });
}

export async function remove(id) {
  const deleted = await galleryRepo.remove(id);
  if (!deleted) throw new NotFoundError("Gallery image");
  return true;
}
