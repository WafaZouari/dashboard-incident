// @ts-nocheck
import { Request, Response } from 'express';
import prisma from '../config/database';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          department: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    sendPaginated(res, {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    sendError(res, 'Failed to fetch users');
  }
};

const updateRoleSchema = z.object({
  role: z.string().min(1, 'Role cannot be empty').transform(val => val.toUpperCase()),
});

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 'Invalid user ID', 400);

    const { role } = updateRoleSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true },
    });

    sendSuccess(res, user, 'User role updated successfully');
  } catch (error) {
    console.error('Error updating user role:', error);
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation error', 400, error.errors);
    }
    sendError(res, 'Failed to update user role');
  }
};

const updateStatusSchema = z.object({
  isActive: z.boolean(),
});

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 'Invalid user ID', 400);

    const { isActive } = updateStatusSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, email: true, isActive: true },
    });

    sendSuccess(res, user, `User ${isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    console.error('Error updating user status:', error);
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation error', 400, error.errors);
    }
    sendError(res, 'Failed to update user status');
  }
};

const updatePasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const updateUserPassword = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 'Invalid user ID', 400);

    const { password } = updatePasswordSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    sendSuccess(res, null, 'User password updated successfully');
  } catch (error) {
    console.error('Error updating user password:', error);
    if (error instanceof z.ZodError) {
      return sendError(res, 'Validation error', 400, error.errors);
    }
    sendError(res, 'Failed to update user password');
  }
};
