// @ts-nocheck
// Unified Prisma instance
import { Request, Response } from 'express';
import prisma from '../config/database';
import { z } from 'zod';
import { sendSuccess, sendError } from '../utils/response';



const assignmentSchema = z.object({
  guardianId: z.number().positive(),
  shiftId: z.number().positive(),
  date: z.string().transform(str => new Date(str)), // 'YYYY-MM-DD'
  site: z.string().optional().nullable(),
  zone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.string().optional().default('scheduled'),
});

export const getAssignments = async (req: Request, res: Response) => {
  try {
    const guardianId = req.query.guardianId ? parseInt(req.query.guardianId as string) : undefined;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const where: any = {};
    if (guardianId) where.guardianId = guardianId;
    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const assignments = await prisma.guardianAssignment.findMany({
      where,
      include: {
        guardian: true,
        shift: true,
      },
      orderBy: { date: 'asc' },
    });

    sendSuccess(res, assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    sendError(res, 'Failed to fetch assignments');
  }
};

export const getCalendarAssignments = async (req: Request, res: Response) => {
  try {
    const month = parseInt(req.query.month as string); // 1-12
    const year = parseInt(req.query.year as string); // YYYY

    if (!month || !year) {
      return sendError(res, 'Month and year are required', 400);
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const assignments = await prisma.guardianAssignment.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        guardian: {
          select: { id: true, fullName: true, badgeId: true, site: true },
        },
        shift: true,
      },
      orderBy: [
        { date: 'asc' },
        { shift: { startTime: 'asc' } },
      ],
    });

    // Group by date string (YYYY-MM-DD)
    const grouped: Record<string, any[]> = {};
    assignments.forEach(assignment => {
      const dateStr = assignment.date.toISOString().split('T')[0];
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(assignment);
    });

    sendSuccess(res, grouped);
  } catch (error) {
    console.error('Error fetching calendar assignments:', error);
    sendError(res, 'Failed to fetch calendar data');
  }
};

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const data = assignmentSchema.parse(req.body);

    const assignment = await prisma.guardianAssignment.create({
      data,
      include: { guardian: true, shift: true },
    });

    sendSuccess(res, assignment, 'Assignment created successfully', 201);
  } catch (error) {
    console.error('Error creating assignment:', error);
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation error', 400, error.errors);
    }
    sendError(res, 'Failed to create assignment');
  }
};

export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = assignmentSchema.parse(req.body);

    const assignment = await prisma.guardianAssignment.update({
      where: { id },
      data,
      include: { guardian: true, shift: true },
    });

    sendSuccess(res, assignment, 'Assignment updated successfully');
  } catch (error) {
    console.error('Error updating assignment:', error);
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation error', 400, error.errors);
    }
    sendError(res, 'Failed to update assignment');
  }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.guardianAssignment.delete({
      where: { id },
    });

    sendSuccess(res, null, 'Assignment deleted successfully');
  } catch (error) {
    console.error('Error deleting assignment:', error);
    sendError(res, 'Failed to delete assignment');
  }
};
