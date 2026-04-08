import { Router } from "express";
import * as menuItemsController from "./menuItems.controller.js";

const router = Router();

router.get("/", menuItemsController.list);
router.get("/:id", menuItemsController.getById);

export default router;
