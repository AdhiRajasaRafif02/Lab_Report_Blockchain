import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(12),
  JWT_EXPIRES_IN: z.string().default("1d"),
  UPLOAD_DIR: z.string().default("uploads"),
  HARDHAT_RPC_URL: z.string().url(),
  CONTRACT_ADDRESS: z.string().min(1),
  CHAIN_SIGNER_PRIVATE_KEY: z.string().min(1)
});

export const env = envSchema.parse(process.env);
