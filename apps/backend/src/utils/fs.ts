import fs from "node:fs";
import path from "node:path";

export const ensureDirectory = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const sanitizeFileName = (fileName: string) =>
  fileName.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");

export const extensionFromMime = (mimeType: string) => {
  if (mimeType === "application/pdf") return ".pdf";
  return ".bin";
};

export const absolutePath = (baseDir: string, fileName: string) => path.resolve(baseDir, fileName);
