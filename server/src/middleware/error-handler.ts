import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'sequelize';
import { isProduction } from '../config/env';
import { HttpError } from '../utils/http-error';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error instanceof ValidationError) {
    res.status(400).json({ error: error.errors.map((item) => item.message).join(', ') });
    return;
  }

  if (!isProduction) {
    console.error(error);
  }

  res.status(500).json({
    error: 'Internal server error',
    detail: isProduction ? undefined : error.message,
  });
};
