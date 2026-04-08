import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth, requireAdmin } from "../../common/middlewares/index.js";
import { success } from "../../common/utils/response.js";
import * as categoriesController from "../categories/categories.controller.js";
import * as menuItemsController from "../menu/menuItems.controller.js";
import * as usersController from "../users/users.controller.js";
import * as ordersController from "../orders/orders.controller.js";
import * as galleryController from "../gallery/gallery.controller.js";
import { uploadSingle, getUploadUrl } from "./upload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

router.use(requireAuth, requireAdmin);

// Current admin user
router.get("/me", (req, res) => {
  return success(res, { user: req.user });
});

// Upload image for menu items
router.post("/upload-image", (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      next(err);
      return;
    }
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }
    const url = getUploadUrl(req.file.filename);
    return success(res, { url });
  });
});

// Categories (full CRUD for admin)
router.get("/categories", categoriesController.list);
router.get("/categories/:id", categoriesController.getById);
router.post("/categories", categoriesController.create);
router.patch("/categories/:id", categoriesController.update);
router.delete("/categories/:id", categoriesController.remove);

// Menu items (full CRUD for admin)
router.get("/menu-items", menuItemsController.list);
router.get("/menu-items/:id", menuItemsController.getById);
router.post("/menu-items", menuItemsController.create);
router.patch("/menu-items/:id", menuItemsController.update);
router.delete("/menu-items/:id", menuItemsController.remove);

// Users, orders, reservations (read-only for dashboard)
router.get("/users", usersController.list);
router.get("/orders", ordersController.listOrders);
router.get("/reservations", ordersController.listReservations);

// Gallery (admin CRUD)
router.get("/gallery", galleryController.list);
router.post("/gallery", galleryController.create);
router.delete("/gallery/:id", galleryController.remove);

export default router;
