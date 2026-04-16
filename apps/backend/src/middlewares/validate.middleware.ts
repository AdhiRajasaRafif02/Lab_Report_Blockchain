import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../utils/app-error.js";

type ValidateTarget = "body" | "params" | "query";

export const validate = (schema: ZodSchema, target: ValidateTarget = "body") => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(new AppError("Validation failed", 400, "VALIDATION_ERROR", result.error.flatten()));
    }
    (req as Request & Record<ValidateTarget, unknown>)[target] = result.data;
    return next();
  };
};
