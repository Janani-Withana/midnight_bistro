import { success, created, noContent } from "../../common/utils/response.js";
import * as menuItemsService from "./menuItems.service.js";

export async function list(req, res, next) {
  try {
    const categoryId = req.query.categoryId ?? null;
    const menuItems = await menuItemsService.list(categoryId);
    return success(res, { menuItems });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const menuItem = await menuItemsService.getById(req.params.id);
    return success(res, menuItem);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const menuItem = await menuItemsService.create(req.body);
    return created(res, menuItem);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const menuItem = await menuItemsService.update(req.params.id, req.body);
    return success(res, menuItem);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await menuItemsService.remove(req.params.id);
    return noContent(res);
  } catch (err) {
    next(err);
  }
}
