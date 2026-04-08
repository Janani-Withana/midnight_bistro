import { success, created, noContent } from "../../common/utils/response.js";
import * as categoriesService from "./categories.service.js";

export async function list(req, res, next) {
  try {
    const categories = await categoriesService.list();
    return success(res, { categories });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const category = await categoriesService.getById(req.params.id);
    return success(res, category);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const category = await categoriesService.create(req.body);
    return created(res, category);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const category = await categoriesService.update(req.params.id, req.body);
    return success(res, category);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await categoriesService.remove(req.params.id);
    return noContent(res);
  } catch (err) {
    next(err);
  }
}
