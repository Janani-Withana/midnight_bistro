import { success, created, noContent } from "../../common/utils/response.js";
import * as authService from "./auth.service.js";
import { BadRequestError } from "../../common/errors/AppError.js";

export async function register(req, res, next) {
  try {
    const { email, password, name, adminSecret } = req.body;
    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }
    const result = await authService.register(email, password, name, adminSecret);
    return created(res, result);
  } catch (err) {
    next(err);
  }
}

/** 200 JSON: { user, token, refreshToken } — administrator accounts only. */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }
    const result = await authService.login(email, password);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function promoteToAdmin(req, res, next) {
  try {
    const { email, password, adminSecret } = req.body || {};
    const result = await authService.promoteToAdmin(email, password, adminSecret);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function refreshSession(req, res, next) {
  try {
    const { refreshToken } = req.body || {};
    const result = await authService.refreshSession(refreshToken);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body || {};
    await authService.logoutRefresh(refreshToken);
    return noContent(res);
  } catch (err) {
    next(err);
  }
}
