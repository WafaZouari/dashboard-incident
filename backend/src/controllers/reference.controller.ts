import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { sendSuccess } from '../utils/response';

// Helper to get distinct non-null values from a string column in the Incident table
async function getDistinctValues(column: 'locationOnSite' | 'site' | 'pearClass' | 'subCategory') {
  const records = await prisma.incident.findMany({
    select: { [column]: true },
    where: { [column]: { not: null, notIn: [''] } },
    distinct: [column],
  });
  
  return records
    .map((r: any) => r[column])
    .filter(Boolean)
    .sort()
    .map((val: string) => ({ id: val, name: val }));
}

export const getLocations = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const locations = await getDistinctValues('locationOnSite');
    return sendSuccess(res, locations);
  } catch (err) { next(err); }
};

export const createLocation = async (req: Request, res: Response, next: NextFunction) => {
  // Not supported in flat schema, just return a mock success
  return sendSuccess(res, req.body, 'Location creation not supported directly', 201);
};

export const getIncidentTypes = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const types = await getDistinctValues('pearClass');
    // Map to the shape expected by frontend (which might include subcategories)
    const result = types.map(t => ({
      ...t,
      subcategories: []
    }));
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

export const createIncidentType = async (req: Request, res: Response, next: NextFunction) => {
  return sendSuccess(res, req.body, 'Type creation not supported directly', 201);
};

export const getSubcategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subcats = await getDistinctValues('subCategory');
    return sendSuccess(res, subcats);
  } catch (err) { next(err); }
};

export const getConsequences = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // We don't have consequence table, let's just use actualSeverity integers 1 to 5
    const consequences = [1, 2, 3, 4, 5].map(val => ({ id: val, name: `Severity ${val}` }));
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
