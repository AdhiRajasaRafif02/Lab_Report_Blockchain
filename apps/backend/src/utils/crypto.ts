import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

export const hashPassword = async (password: string) => bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

export const comparePassword = async (password: string, hash: string) => bcrypt.compare(password, hash);

export const sha256Hex = (buffer: Buffer) => createHash("sha256").update(buffer).digest("hex");
