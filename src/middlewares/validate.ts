import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { AppError } from '../utils/appError.js';

export const validate =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (schema: ZodSchema<any>) =>
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      try {
        const result = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });

        if (result.body) {
          req.body = result.body;
        }

        if (result.query) {
          Object.defineProperty(req, 'query', {
            value: result.query,
            enumerable: true,
            configurable: true,
            writable: true,
          });
        }

        if (result.params) {
          req.params = result.params;
        }

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
