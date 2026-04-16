import path from "node:path";
import { env } from "./env.js";

export const API_PREFIX = "/api";
export const UPLOADS_DIR = path.resolve(process.cwd(), env.UPLOAD_DIR);
