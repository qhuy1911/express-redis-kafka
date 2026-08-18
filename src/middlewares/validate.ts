import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { AppError } from '../utils/appError.js';

export const validate =
  (schema: ZodSchema) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map((issue) => {
            const path = issue.path.slice(1).join('.');
            return path ? `${path}: ${issue.message}` : issue.message;
          })
          .join(', ');

        next(new AppError(errorMessage, 400));
        return;
      }

      next(error);
    }
  };
