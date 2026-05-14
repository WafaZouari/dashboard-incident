import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { z } from 'zod';
import { sendSuccess, sendError } from '../utils/response';

export const getRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' },
    });
    return sendSuccess(res, roles);
  } catch (err) {
    next(err);
  }
};

const createRoleSchema = z.object({
  name: z.string().min(1).transform(val => val.toUpperCase()),
  permissions: z.record(z.boolean()).default({}),
});

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createRoleSchema.parse(req.body);
    
    const existing = await prisma.role.findUnique({ where: { name: body.name } });
    if (existing) {
      return sendError(res, 'Role already exists', 409);
    }

    const role = await prisma.role.create({
      data: {
        name: body.name,
        permissions: body.permissions,
      },
    });

    return sendSuccess(res, role, 'Role created successfully', 201);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return sendError(res, 'Validation error', 400, err.errors);
    }
    next(err);
  }
};

const updateRoleSchema = z.object({
  name: z.string().min(1).transform(val => val.toUpperCase()).optional(),
  permissions: z.record(z.boolean()).optional(),
});

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 'Invalid role ID', 400);

    const body = updateRoleSchema.parse(req.body);
    const existingRole = await prisma.role.findUnique({ where: { id } });

    if (!existingRole) {
      return sendError(res, 'Role not found', 404);
    }

    if (existingRole.name === 'ADMIN' && body.name && body.name !== 'ADMIN') {
      return sendError(res, 'Cannot rename ADMIN role', 403);
    }

    const role = await prisma.role.update({
      where: { id },
      data: {
        name: body.name,
        permissions: body.permissions ?? undefined,
      },
    });

    return sendSuccess(res, role, 'Role updated successfully');
  } catch (err) {
    if (err instanceof z.ZodError) {
      return sendError(res, 'Validation error', 400, err.errors);
    }
    next(err);
  }
};

export const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return sendError(res, 'Invalid role ID', 400);

    const existingRole = await prisma.role.findUnique({ where: { id } });
    if (!existingRole) {
      return sendError(res, 'Role not found', 404);
    }

    if (existingRole.name === 'ADMIN') {
      return sendError(res, 'Cannot delete ADMIN role', 403);
    }

    // Optional: check if users are using this role
    const usersWithRole = await prisma.user.count({
      where: { role: existingRole.name },
    });
    if (usersWithRole > 0) {
      return sendError(res, `Cannot delete role because ${usersWithRole} user(s) are assigned to it`, 400);
    }

    await prisma.role.delete({ where: { id } });

    return sendSuccess(res, null, 'Role deleted successfully');
  } catch (err) {
    next(err);
  }
};
