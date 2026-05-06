// @ts-nocheck
// Unified Prisma instance
import { Request, Response } from 'express';
import prisma from '../config/database';
import { z } from 'zod';
import { sendSuccess, sendError } from '../utils/response';



const shiftSchema = z.object({
  name: z.string().min(1, 'Shift name is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  color: z.string().optional().default('#F59E0B'),
});

export const getShifts = async (req: Request, res: Response) => {
  try {
    const shifts = await prisma.guardianShift.findMany({
      orderBy: { startTime: 'asc' },
    });
    sendSuccess(res, shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    sendError(res, 'Failed to fetch shifts');
  }
};

export const createShift = async (req: Request, res: Response) => {
  try {
    const data = shiftSchema.parse(req.body);

    const shift = await prisma.guardianShift.create({
      data,
    });

    sendSuccess(res, shift, 'Shift created successfully', 201);
  } catch (error) {
    console.error('Error creating shift:', error);
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation error', 400, error.errors);
    }
    sendError(res, 'Failed to create shift');
  }
};

export const updateShift = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return sendError(res, 'Invalid shift ID', 400);
    }
    const data = shiftSchema.parse(req.body);

    const shift = await prisma.guardianShift.update({
      where: { id },
      data,
    });

    sendSuccess(res, shift, 'Shift updated successfully');
  } catch (error) {
    console.error('Error updating shift:', error);
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation error', 400, error.errors);
    }
    sendError(res, 'Failed to update shift');
  }
};

export const deleteShift = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return sendError(res, 'Invalid shift ID', 400);
    }

    // Check if shift is in use
    const assignmentCount = await prisma.guardianAssignment.count({
      where: { shiftId: id },
    });

    if (assignmentCount > 0) {
      return sendError(res, 'Cannot delete shift type because it is assigned to guardians', 400);
    }

    await prisma.guardianShift.delete({
      where: { id },
    });

    sendSuccess(res, null, 'Shift deleted successfully');
  } catch (error) {
    console.error('Error deleting shift:', error);
    sendError(res, 'Failed to delete shift');
  }
};
