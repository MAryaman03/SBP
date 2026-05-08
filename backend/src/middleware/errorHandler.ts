import { Request, Response, NextFunction } from 'express';
import { ApiError, sendError } from '../utils/errors';

export const errorHandler = (err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.message, err.data);
  }

  if (err.name === 'CastError') {
    return sendError(res, 400, 'Invalid ID format', err);
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values((err as any).errors).map((e: any) => e.message);
    return sendError(res, 400, messages.join(', '), err);
  }

  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    return sendError(res, 409, `${field} is already in use`, err);
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token', err);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired', err);
  }

  return sendError(res, 500, 'Internal Server Error', err);
};

export const notFoundHandler = (req: Request, res: Response) => {
  sendError(res, 404, `Route ${req.originalUrl} not found`);
};
