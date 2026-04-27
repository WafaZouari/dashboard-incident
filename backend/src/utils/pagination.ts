import { Request } from 'express';
import { PaginationParams } from '../types/index.js';

export const getPaginationParams = (req: Request): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = ((req.query.sortOrder as string) || 'desc') as 'asc' | 'desc';

  return { page, limit, sortBy, sortOrder };
};

export const getPaginationSkip = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

export const buildPaginatedResult = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) => ({
  data,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
});
