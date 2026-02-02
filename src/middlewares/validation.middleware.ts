import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import { ValidationError } from "../utils/error.util";

/**
 * Validation Middleware
 * Validates request data against Zod schema
 */
export const validate = (schema: ZodObject<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};

        error.errors.forEach((err) => {
          const path = err.path.join(".");
          errors[path] = err.message;
        });

        next(
          new ValidationError("Validation failed", errors)
        );
      } else {
        next(error);
      }
    }
  };
};