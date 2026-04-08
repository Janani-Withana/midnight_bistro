import { success, created, noContent } from "../../common/utils/response.js";
import * as usersService from "./users.service.js";

export async function list(req, res, next) {
  try {
    const users = await usersService.list();
    return success(res, { users });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const user = await usersService.getById(req.params.id);
    return success(res, user);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const user = await usersService.create(req.body);
    return created(res, user);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const user = await usersService.update(req.params.id, req.body);
    return success(res, user);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await usersService.remove(req.params.id);
    return noContent(res);
  } catch (err) {
    next(err);
  }
}
