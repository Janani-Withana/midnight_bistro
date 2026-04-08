import { Router } from "express";
import * as ordersController from "./orders.controller.js";

const router = Router();

// Food orders
router.get("/", ordersController.listOrders);
router.get("/:id", ordersController.getOrderById);
router.post("/", ordersController.createOrder);
router.patch("/:id", ordersController.updateOrder);

export default router;
