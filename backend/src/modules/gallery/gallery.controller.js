import { success, created, noContent } from "../../common/utils/response.js";
import * as galleryService from "./gallery.service.js";

export async function list(req, res, next) {
  try {
    const items = await galleryService.list();
    return success(res, { gallery: items });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const item = await galleryService.getById(req.params.id);
    return success(res, item);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const item = await galleryService.create(req.body);
    return created(res, item);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await galleryService.remove(req.params.id);
    return noContent(res);
  } catch (err) {
    next(err);
  }
}
