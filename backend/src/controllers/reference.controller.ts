import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { sendSuccess } from '../utils/response';

export const getLocations = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const locations = await prisma.location.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    return sendSuccess(res, locations);
  } catch (err) { next(err); }
};

export const createLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({ name: z.string(), site: z.string().optional(), department: z.string().optional() }).parse(req.body);
    const location = await prisma.location.create({ data: body });
    return sendSuccess(res, location, 'Location created', 201);
  } catch (err) { next(err); }
};

export const getIncidentTypes = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const types = await prisma.incidentType.findMany({
      where: { isActive: true },
      include: { subcategories: { where: { isActive: true } } },
      orderBy: { name: 'asc' },
    });
    return sendSuccess(res, types);
  } catch (err) { next(err); }
};

export const createIncidentType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({ name: z.string(), description: z.string().optional(), category: z.string().optional() }).parse(req.body);
    const type = await prisma.incidentType.create({ data: body });
    return sendSuccess(res, type, 'Incident type created', 201);
  } catch (err) { next(err); }
};

export const getSubcategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const subcategories = await prisma.incidentSubcategory.findMany({
      where: { incidentTypeId: id, isActive: true },
      orderBy: { name: 'asc' },
    });
    return sendSuccess(res, subcategories);
  } catch (err) { next(err); }
};

export const getConsequences = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const consequences = await prisma.incidentConsequence.findMany({
      where: { isActive: true },
      orderBy: { severityWeight: 'desc' },
    });
    return sendSuccess(res, consequences);
  } catch (err) { next(err); }
};

export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, department: true },
      orderBy: { firstName: 'asc' },
    });
    return sendSuccess(res, users);
  } catch (err) { next(err); }
};
