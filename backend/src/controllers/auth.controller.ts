import { Request, Response, NextFunction } from 'express';
import '../types/index';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database';
import { sendSuccess, sendError } from '../utils/response';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['admin', 'manager', 'investigator', 'viewer']).default('viewer'),
  department: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const generateToken = (userId: number, email: string, role: string) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
  );
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return sendError(res, 'Email already registered', 409);
    }
    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role,
        department: body.department,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, department: true, createdAt: true },
    });
    const token = generateToken(user.id, user.email, user.role);
    return sendSuccess(res, { user, token }, 'Registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !user.isActive) {
      return sendError(res, 'Invalid credentials', 401);
    }
    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      return sendError(res, 'Invalid credentials', 401);
    }
    const token = generateToken(user.id, user.email, user.role);

    let permissions = {};
    const roleRecord = await prisma.role.findUnique({ where: { name: user.role } });
    if (roleRecord && roleRecord.permissions) {
      permissions = roleRecord.permissions;
    }

    return sendSuccess(res, {
      user: {
        id: user.id, email: user.email, firstName: user.firstName,
        lastName: user.lastName, role: user.role, department: user.department,
        permissions,
      },
      token,
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, department: true, isActive: true, createdAt: true },
    });
    if (!user) return sendError(res, 'User not found', 404);

    let permissions = {};
    const roleRecord = await prisma.role.findUnique({ where: { name: user.role } });
    if (roleRecord && roleRecord.permissions) {
      permissions = roleRecord.permissions;
    }

    return sendSuccess(res, { ...user, permissions });
  } catch (err) {
    next(err);
  }
};

export const logout = (_req: Request, res: Response) => {
  return sendSuccess(res, null, 'Logged out successfully');
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      department: z.string().optional(),
    });
    const body = schema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: body,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, department: true },
    });
    return sendSuccess(res, user, 'Profile updated');
  } catch (err) {
    next(err);
  }
};
