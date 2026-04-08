import * as ordersRepo from "../../infrastructure/database/ordersRepository.js";
import * as reservationsRepo from "../../infrastructure/database/reservationsRepository.js";
import { NotFoundError, BadRequestError } from "../../common/errors/AppError.js";

// --- Orders (food orders) ---
export async function listOrders() {
  return ordersRepo.list();
}

export async function getOrderById(id) {
  const order = await ordersRepo.getById(id);
  if (!order) throw new NotFoundError("Order");
  return order;
}

export async function createOrder(data) {
  const { userId, items, tableNumber, notes } = data;
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new BadRequestError("At least one item is required");
  }
  return ordersRepo.create({ userId, items, tableNumber, notes });
}

export async function updateOrder(id, data) {
  const existing = await ordersRepo.getById(id);
  if (!existing) throw new NotFoundError("Order");
  const updated = await ordersRepo.update(id, data);
  return updated ?? existing;
}

// --- Reservations ---
export async function listReservations() {
  return reservationsRepo.list();
}

export async function getReservationById(id) {
  const r = await reservationsRepo.getById(id);
  if (!r) throw new NotFoundError("Reservation");
  return r;
}

export async function createReservation(data) {
  const { name, email, phone, date, time, guests, occasion = "", notes = "" } = data;
  if (!name || !email || !phone || !date || !time || !guests) {
    throw new BadRequestError(
      "Missing required fields: name, email, phone, date, time, guests"
    );
  }
  return reservationsRepo.create({
    name,
    email,
    phone,
    date,
    time,
    guests,
    occasion,
    notes,
  });
}
