// @ts-nocheck
// Unified Prisma instance
import { Request, Response } from 'express';
import prisma from '../config/database';
import { z } from 'zod';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';



const guardianSchema = z.object({
  badgeId: z.string().optional().nullable(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  rank: z.string().optional().nullable(),
  site: z.string().optional().nullable(),
  zone: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const getGuardians = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const site = req.query.site as string;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { badgeId: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (site) where.site = site;
    if (isActive !== undefined) where.isActive = isActive;

    const [guardians, total] = await Promise.all([
      prisma.guardian.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fullName: 'asc' },
      }),
      prisma.guardian.count({ where }),
    ]);

    sendPaginated(res, {
      data: guardians,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching guardians:', error);
    sendError(res, 'Failed to fetch guardians');
  }
};

export const getGuardianById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return sendError(res, 'Invalid guardian ID', 400);
    }
    const guardian = await prisma.guardian.findUnique({
      where: { id },
      include: {
        assignments: {
          include: { shift: true },
          take: 5,
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!guardian) {
      return sendError(res, 'Guardian not found', 404);
    }

    sendSuccess(res, guardian);
  } catch (error) {
    console.error('Error fetching guardian:', error);
    sendError(res, 'Failed to fetch guardian');
  }
};

export const createGuardian = async (req: Request, res: Response) => {
  try {
    const data = guardianSchema.parse(req.body);

    const guardian = await prisma.guardian.create({
      data: {
        ...data,
        fullName: `${data.firstName} ${data.lastName}`,
      },
    });

    sendSuccess(res, guardian, 'Guardian created successfully', 201);
  } catch (error) {
    console.error('Error creating guardian:', error);
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation error', 400, error.errors);
    }
    sendError(res, 'Failed to create guardian');
  }
};

export const updateGuardian = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return sendError(res, 'Invalid guardian ID', 400);
    }
    const data = guardianSchema.parse(req.body);

    const guardian = await prisma.guardian.update({
      where: { id },
      data: {
        ...data,
        fullName: `${data.firstName} ${data.lastName}`,
      },
    });

    sendSuccess(res, guardian, 'Guardian updated successfully');
  } catch (error) {
    console.error('Error updating guardian:', error);
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation error', 400, error.errors);
    }
    sendError(res, 'Failed to update guardian');
  }
};

export const deleteGuardian = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return sendError(res, 'Invalid guardian ID', 400);
    }

    // Soft delete
    await prisma.guardian.update({
      where: { id },
      data: { isActive: false },
    });

    sendSuccess(res, null, 'Guardian deactivated successfully');
  } catch (error) {
    console.error('Error deleting guardian:', error);
    sendError(res, 'Failed to delete guardian');
  }
};
