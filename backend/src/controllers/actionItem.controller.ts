import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import '../types/index';
import prisma from '../config/database';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { getPaginationParams, getPaginationSkip, buildPaginatedResult } from '../utils/pagination';

const actionItemSchema = z.object({
  incidentId: z.number().int(),
  investigationId: z.number().int().optional(),
  correctiveActionsTaken: z.string().optional(),
  suggestionsRecommendations: z.string().optional(),
  assignedToId: z.number().int().optional(),
  dueDate: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'overdue']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
});

const includeRelations = {
  incident: { select: { id: true, incidentNo: true, briefDescription: true } },
  assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
  investigation: { select: { id: true, status: true } },
};

export const getActionItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, sortBy, sortOrder } = getPaginationParams(req);
    const { status, priority, assignedToId } = req.query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = parseInt(assignedToId as string);

    const [data, total] = await Promise.all([
      prisma.actionItem.findMany({
        where,
        include: includeRelations,
        orderBy: { [sortBy!]: sortOrder },
        skip: getPaginationSkip(page, limit),
        take: limit,
      }),
      prisma.actionItem.count({ where }),
    ]);

    return sendPaginated(res, buildPaginatedResult(data, total, page, limit));
  } catch (err) {
    next(err);
  }
};

export const getOverdueActionItems = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.actionItem.findMany({
      where: {
        dueDate: { lt: new Date() },
        status: { notIn: ['completed'] },
      },
      include: includeRelations,
      orderBy: { dueDate: 'asc' },
    });
    return sendSuccess(res, items);
  } catch (err) {
    next(err);
  }
};

export const getActionItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const item = await prisma.actionItem.findUnique({ where: { id }, include: includeRelations });
    if (!item) return sendError(res, 'Action item not found', 404);
    return sendSuccess(res, item);
  } catch (err) {
    next(err);
  }
};

export const createActionItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = actionItemSchema.parse(req.body);
    const item = await prisma.actionItem.create({
      data: {
        ...body,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
      include: includeRelations,
    });
    return sendSuccess(res, item, 'Action item created', 201);
  } catch (err) {
    next(err);
  }
};

export const updateActionItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const body = actionItemSchema.partial().parse(req.body);
    const data: Record<string, unknown> = {
      ...body,
      ...(body.dueDate ? { dueDate: new Date(body.dueDate) } : {}),
    };
    const item = await prisma.actionItem.update({ where: { id }, data, include: includeRelations });
    return sendSuccess(res, item, 'Action item updated');
  } catch (err) {
    next(err);
  }
};

export const updateActionItemStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = z.object({ status: z.enum(['pending', 'in_progress', 'completed', 'overdue']) }).parse(req.body);
    const data: Record<string, unknown> = { status };
    if (status === 'completed') data.completedAt = new Date();
    const item = await prisma.actionItem.update({ where: { id }, data, include: includeRelations });
    return sendSuccess(res, item, 'Status updated');
  } catch (err) {
    next(err);
  }
};
