import { Router } from "express";
import * as categoriesController from "./categories.controller.js";

const router = Router();

router.get("/", categoriesController.list);
router.get("/:id", categoriesController.getById);

export default router;
