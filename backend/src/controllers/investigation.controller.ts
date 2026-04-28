import { Request, Response, NextFunction } from 'express';
import '../types/index';
import { z } from 'zod';
import prisma from '../config/database';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { getPaginationParams, getPaginationSkip, buildPaginatedResult } from '../utils/pagination';

const investigationSchema = z.object({
  incidentId: z.number().int(),
  investigationDate: z.string().optional(),
  investigatorId: z.number().int().optional(),
  immediateCauses: z.string().optional(),
  rootCauses: z.string().optional(),
  findings: z.string().optional(),
  recommendations: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
});

const includeRelations = {
  incident: { select: { id: true, incidentNo: true, briefDescription: true, status: true, dateTimeOccurred: true, site: true, pearClass: true } },
  investigator: { select: { id: true, firstName: true, lastName: true, email: true } },
  actionItems: {
    include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } },
  },
};

export const getInvestigations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, sortBy, sortOrder } = getPaginationParams(req);
    const { status } = req.query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.investigation.findMany({
        where,
        include: includeRelations,
        orderBy: { [sortBy!]: sortOrder },
        skip: getPaginationSkip(page, limit),
        take: limit,
      }),
      prisma.investigation.count({ where }),
    ]);

    return sendPaginated(res, buildPaginatedResult(data, total, page, limit));
  } catch (err) {
    next(err);
  }
};

export const getInvestigationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const investigation = await prisma.investigation.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!investigation) return sendError(res, 'Investigation not found', 404);
    return sendSuccess(res, investigation);
  } catch (err) {
    next(err);
  }
};

export const getInvestigationsByIncident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const incidentId = parseInt(req.params.incidentId);
    const investigations = await prisma.investigation.findMany({
      where: { incidentId },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, investigations);
  } catch (err) {
    next(err);
  }
};

export const createInvestigation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = investigationSchema.parse(req.body);
    const investigation = await prisma.investigation.create({
      data: {
        ...body,
        investigatorId: body.investigatorId || req.user?.userId,
        investigationDate: body.investigationDate ? new Date(body.investigationDate) : new Date(),
      },
      include: includeRelations,
    });
    // Mark incident investigation done
    await prisma.incident.update({
      where: { id: body.incidentId },
      data: { investigationDone: true, status: 'under_investigation' },
    });
    return sendSuccess(res, investigation, 'Investigation created', 201);
  } catch (err) {
    next(err);
  }
};

export const updateInvestigation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const body = investigationSchema.partial().parse(req.body);
    const data: Record<string, unknown> = { ...body };
    if (body.status === 'completed') data.completedAt = new Date();
    const investigation = await prisma.investigation.update({
      where: { id },
      data,
      include: includeRelations,
    });
    return sendSuccess(res, investigation, 'Investigation updated');
  } catch (err) {
    next(err);
  }
};
