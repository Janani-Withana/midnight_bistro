import { Router } from "express";
import * as ordersController from "./orders.controller.js";

const router = Router();

router.get("/", ordersController.listReservations);
router.get("/:id", ordersController.getReservationById);
router.post("/", ordersController.createReservation);

export default router;
