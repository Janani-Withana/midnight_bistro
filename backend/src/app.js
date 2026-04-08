import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { authRoutes } from "./modules/auth/index.js";
import { usersRoutes } from "./modules/users/index.js";
import { categoriesRoutes } from "./modules/categories/index.js";
import { menuItemsRoutes } from "./modules/menu/index.js";
import {
  ordersRoutes,
  reservationsRoutes,
} from "./modules/orders/index.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import galleryRoutes from "./modules/gallery/index.js";
import { errorHandler, notFound } from "./common/middlewares/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

const uploadsDir = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsDir));

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/menu-items", menuItemsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/reservations", reservationsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
