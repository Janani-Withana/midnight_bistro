import { success, created, noContent } from "../../common/utils/response.js";
import * as ordersService from "./orders.service.js";

// Orders
export async function listOrders(req, res, next) {
  try {
    const orders = await ordersService.listOrders();
    return success(res, { orders });
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await ordersService.getOrderById(req.params.id);
    return success(res, order);
  } catch (err) {
    next(err);
  }
}

export async function createOrder(req, res, next) {
  try {
    const order = await ordersService.createOrder(req.body);
    return created(res, order);
  } catch (err) {
    next(err);
  }
}

export async function updateOrder(req, res, next) {
  try {
    const order = await ordersService.updateOrder(req.params.id, req.body);
    return success(res, order);
  } catch (err) {
    next(err);
  }
}

// Reservations
export async function listReservations(req, res, next) {
  try {
    const reservations = await ordersService.listReservations();
    return success(res, { reservations });
  } catch (err) {
    next(err);
  }
}

export async function getReservationById(req, res, next) {
  try {
    const reservation = await ordersService.getReservationById(req.params.id);
    return success(res, reservation);
  } catch (err) {
    next(err);
  }
}

export async function createReservation(req, res, next) {
  try {
    const reservation = await ordersService.createReservation(req.body);
    return created(res, {
      message: "Reservation confirmed",
      reservation: {
        id: reservation.id,
        date: reservation.date,
        time: reservation.time,
        guests: reservation.guests,
      },
    });
  } catch (err) {
    next(err);
  }
}
