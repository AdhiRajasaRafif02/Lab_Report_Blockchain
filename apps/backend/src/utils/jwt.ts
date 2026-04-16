import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { JwtPayloadUser } from "../types/common.js";

export const signAccessToken = (payload: JwtPayloadUser) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export const verifyAccessToken = (token: string) => jwt.verify(token, env.JWT_SECRET) as JwtPayloadUser;
