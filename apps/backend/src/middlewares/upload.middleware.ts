import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { env } from "../config/env.js";
import { UPLOADS_DIR } from "../config/constants.js";
import { sanitizeFileName } from "../utils/fs.js";
import { AppError } from "../utils/app-error.js";

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".bin";
    const base = sanitizeFileName(path.basename(file.originalname, ext));
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});

export const uploadSinglePdf = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new AppError("Only PDF files are allowed", 400, "INVALID_FILE_TYPE"));
      return;
    }
    cb(null, true);
  }
}).single("file");
