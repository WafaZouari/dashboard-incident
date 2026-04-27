import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { sendError } from '../utils/response';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        sendError(
          res,
          'Validation failed',
          400,
          err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }))
        );
        return;
      }
      next(err);
    }
  };
};
