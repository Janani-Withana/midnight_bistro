import { success, created } from "../../common/utils/response.js";
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
