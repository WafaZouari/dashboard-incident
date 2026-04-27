import { Response } from 'express';
import { PaginatedResult } from '../types/index.js';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export const sendPaginated = <T>(
  res: Response,
  result: PaginatedResult<T>,
  message = 'Success'
) => {
  return res.status(200).json({
    success: true,
    message,
    data: result.data,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
};
