import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import config from "../../config/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../../../uploads"));
  },
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname) || ".jpg").toLowerCase();
    const safeName = Date.now() + "-" + (file.originalname || "image").replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 50);
    cb(null, safeName.endsWith(ext) ? safeName : safeName + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpe?g|png|gif|webp)$/i.test(file.originalname || "");
    if (allowed) cb(null, true);
    else cb(new Error("Only images (jpg, png, gif, webp) are allowed"));
  },
});

export const uploadSingle = upload.single("image");

export function getUploadUrl(filename) {
  const base = (config.apiUrl || "").replace(/\/$/, "");
  return `${base}/uploads/${filename}`;
}
