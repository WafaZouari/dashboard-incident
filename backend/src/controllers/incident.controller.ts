import { Request, Response, NextFunction } from 'express';
import '../types/index';
import { z } from 'zod';
import prisma from '../config/database';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { getPaginationParams, getPaginationSkip, buildPaginatedResult } from '../utils/pagination';

const incidentSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    dateOccurred: z.string().or(z.date()),
    timeOccurred: z.string().optional(),
    locationId: z.number().int().optional(),
    incidentTypeId: z.number().int().optional(),
    incidentSubcategoryId: z.number().int().optional(),
    consequenceId: z.number().int().optional(),
    actualSeverity: z.number().min(1).max(5).optional(),
    potentialSeverity: z.number().min(1).max(5).optional(),
    isHighPotential: z.boolean().default(false),
    responsibleSupervisorId: z.number().int().optional(),
    incidentLeaderId: z.number().int().optional(),
    reportedById: z.number().int().optional(),
    status: z.enum(['open', 'under_investigation', 'closed', 'archived']).default('open'),
});

const includeRelations = {
    location: true,
    incidentType: true,
    incidentSubcategory: true,
    consequence: true,
    responsibleSupervisor: { select: { id: true, firstName: true, lastName: true, email: true } },
    incidentLeader: { select: { id: true, firstName: true, lastName: true, email: true } },
    reportedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
    createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
};

export const getIncidents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit, sortBy, sortOrder } = getPaginationParams(req);
        const { status, incidentTypeId, locationId, severity, dateFrom, dateTo, search, isHighPotential } = req.query;

        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (incidentTypeId) where.incidentTypeId = parseInt(incidentTypeId as string);
        if (locationId) where.locationId = parseInt(locationId as string);
        if (severity) where.actualSeverity = parseInt(severity as string);
        if (isHighPotential === 'true') where.isHighPotential = true;
        if (dateFrom || dateTo) {
            where.dateOccurred = {
                ...(dateFrom ? { gte: new Date(dateFrom as string) } : {}),
                ...(dateTo ? { lte: new Date(dateTo as string) } : {}),
            };
        }
        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
                { incidentId: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            prisma.incident.findMany({
                where,
                include: includeRelations,
                orderBy: { [sortBy!]: sortOrder },
                skip: getPaginationSkip(page, limit),
                take: limit,
            }),
            prisma.incident.count({ where }),
        ]);

        return sendPaginated(res, buildPaginatedResult(data, total, page, limit));
    } catch (err) {
        next(err);
    }
};

export const getIncidentStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const [total, open, underInvestigation, highPotential, closed, thisMonth] = await Promise.all([
            prisma.incident.count(),
            prisma.incident.count({ where: { status: 'open' } }),
            prisma.incident.count({ where: { status: 'under_investigation' } }),
            prisma.incident.count({ where: { isHighPotential: true } }),
            prisma.incident.count({ where: { status: 'closed' } }),
            prisma.incident.count({
                where: {
                    dateOccurred: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
        ]);

        return sendSuccess(res, { total, open, underInvestigation, highPotential, closed, thisMonth });
    } catch (err) {
        next(err);
    }
};

export const getIncidentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        const incident = await prisma.incident.findUnique({
            where: { id },
            include: {
                ...includeRelations,
                details: true,
                investigations: {
                    include: { investigator: { select: { id: true, firstName: true, lastName: true } } },
                },
                actionItems: {
                    include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } },
                },
                attachments: {
                    include: { uploadedBy: { select: { id: true, firstName: true, lastName: true } } },
                },
            },
        });
        if (!incident) return sendError(res, 'Incident not found', 404);
        return sendSuccess(res, incident);
    } catch (err) {
        next(err);
    }
};

export const createIncident = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = incidentSchema.parse(req.body);
        const year = new Date().getFullYear();
        const count = await prisma.incident.count();
        const incidentId = `INC-${year}-${String(count + 1).padStart(4, '0')}`;

        const incident = await prisma.incident.create({
            data: {
                ...body,
                incidentId,
                dateOccurred: new Date(body.dateOccurred),
                createdById: req.user?.userId,
            },
            include: includeRelations,
        });
        return sendSuccess(res, incident, 'Incident created', 201);
    } catch (err) {
        next(err);
    }
};

export const updateIncident = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        const body = incidentSchema.partial().parse(req.body);
        const incident = await prisma.incident.update({
            where: { id },
            data: {
                ...body,
                ...(body.dateOccurred ? { dateOccurred: new Date(body.dateOccurred) } : {}),
            },
            include: includeRelations,
        });
        return sendSuccess(res, incident, 'Incident updated');
    } catch (err) {
        next(err);
    }
};

export const deleteIncident = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.incident.update({ where: { id }, data: { status: 'archived' } });
        return sendSuccess(res, null, 'Incident archived');
    } catch (err) {
        next(err);
    }
};

export const exportIncidents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const incidents = await prisma.incident.findMany({
            include: {
                location: true,
                incidentType: true,
                consequence: true,
                reportedBy: { select: { firstName: true, lastName: true } },
            },
            orderBy: { dateOccurred: 'desc' },
        });

        const rows = incidents.map((i: any) => ({
            ID: i.incidentId,
            Title: i.title,
            Date: i.dateOccurred.toISOString().split('T')[0],
            Location: i.location?.name || '',
            Type: i.incidentType?.name || '',
            Severity: i.actualSeverity,
            Status: i.status,
            'High Potential': i.isHighPotential ? 'Yes' : 'No',
            'Reported By': i.reportedBy ? `${i.reportedBy.firstName} ${i.reportedBy.lastName}` : '',
        }));

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=incidents.json');
        return res.json(rows);
    } catch (err) {
        next(err);
    }
};
