import { Request, Response, NextFunction } from 'express';
import '../types/index';
import { z } from 'zod';
import prisma from '../config/database';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { getPaginationParams, getPaginationSkip, buildPaginatedResult } from '../utils/pagination';

const incidentSchema = z.object({
    sourceYear: z.number().int().optional(),
    incidentNo: z.string().min(1),
    reportedBy: z.string().optional(),
    site: z.string().optional(),
    locationOnSite: z.string().optional(),
    dateTimeOccurred: z.string().or(z.date()).optional(),
    pearClass: z.string().optional(),
    subCategory: z.string().optional(),
    briefDescription: z.string().optional(),
    incTypeIfInjury: z.string().optional(),
    assetIntegrityType: z.string().optional(),
    damagedZone: z.string().optional(),
    pseTiers: z.string().optional(),
    actualSeverity: z.number().min(1).max(5).optional(),
    potentialSeverity: z.number().min(1).max(5).optional(),
    investigationDone: z.boolean().default(false),
    tir: z.number().optional().nullable(),
    workingHours: z.number().optional().nullable(),
    status: z.enum(['open', 'under_investigation', 'closed', 'archived']).default('open'),
});

const calculateTIFR = (body: any, existingIncident?: any) => {
    const pearClass = body.pearClass !== undefined ? body.pearClass : (existingIncident?.pearClass || null);
    if (pearClass === 'Injury/Illness') {
        const tir = body.tir !== undefined && body.tir !== null ? body.tir : (existingIncident?.tir ?? 1);
        const workingHours = body.workingHours !== undefined && body.workingHours !== null ? body.workingHours : (existingIncident?.workingHours ?? 1000000);
        const tifr = workingHours ? (tir * 1000000) / workingHours : 0;
        return { tir, workingHours, tifr };
    }
    return { tir: null, workingHours: null, tifr: null };
};

const includeRelations = {
    createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
};

export const getIncidents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = getPaginationParams(req);
        const { status, pearClass, site, severity, dateFrom, dateTo, search, year } = req.query;

        const where: any = {
            status: status ? status : { not: 'archived' },
            NOT: {
                dateTimeOccurred: {
                    gte: new Date('2026-01-01'),
                    lt: new Date('2027-01-01'),
                },
            },
        };
        if (pearClass) where.pearClass = pearClass;
        if (site) where.site = site;
        if (severity) where.actualSeverity = parseInt(severity as string);

        if (year) {
            const yearNum = parseInt(year as string);
            where.dateTimeOccurred = {
                gte: new Date(yearNum, 0, 1),
                lt: new Date(yearNum + 1, 0, 1),
            };
        } else if (dateFrom || dateTo) {
            where.dateTimeOccurred = {
                ...(dateFrom ? { gte: new Date(dateFrom as string) } : {}),
                ...(dateTo ? { lte: new Date(dateTo as string) } : {}),
            };
        }

        if (search) {
            where.OR = [
                { briefDescription: { contains: search as string, mode: 'insensitive' } },
                { incidentNo: { contains: search as string, mode: 'insensitive' } },
                { reportedBy: { contains: search as string, mode: 'insensitive' } },
                { site: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            prisma.incident.findMany({
                where,
                include: includeRelations,
                orderBy: { dateTimeOccurred: 'desc' },
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
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const baseWhere = {
            NOT: {
                dateTimeOccurred: {
                    gte: new Date('2026-01-01'),
                    lt: new Date('2027-01-01'),
                },
            },
        };

        const [total, open, underInvestigation, withInvestigation, closed, thisMonth] = await Promise.all([
            prisma.incident.count({ where: baseWhere }),
            prisma.incident.count({ where: { ...baseWhere, status: 'open' } }),
            prisma.incident.count({ where: { ...baseWhere, status: 'under_investigation' } }),
            prisma.incident.count({ where: { ...baseWhere, investigationDone: true } }),
            prisma.incident.count({ where: { ...baseWhere, status: 'closed' } }),
            prisma.incident.count({
                where: {
                    ...baseWhere,
                    dateTimeOccurred: { gte: thisMonthStart },
                },
            }),
        ]);

        return sendSuccess(res, { total, open, underInvestigation, withInvestigation, closed, thisMonth });
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
        const incidentNo = body.incidentNo || `INC-${year}-${String(count + 1).padStart(4, '0')}`;

        const tifrData = calculateTIFR(body);

        const incident = await prisma.incident.create({
            data: {
                ...body,
                ...tifrData,
                incidentNo,
                dateTimeOccurred: body.dateTimeOccurred ? new Date(body.dateTimeOccurred as string) : undefined,
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
        
        const existingIncident = await prisma.incident.findUnique({ where: { id } });
        if (!existingIncident) return sendError(res, 'Incident not found', 404);
        
        const tifrData = calculateTIFR(body, existingIncident);

        const incident = await prisma.incident.update({
            where: { id },
            data: {
                ...body,
                ...tifrData,
                ...(body.dateTimeOccurred ? { dateTimeOccurred: new Date(body.dateTimeOccurred as string) } : {}),
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
        await prisma.incident.delete({ where: { id } });
        return sendSuccess(res, null, 'Incident deleted permanently');
    } catch (err) {
        next(err);
    }
};

export const exportIncidents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const incidents = await prisma.incident.findMany({
            where: {
                NOT: {
                    dateTimeOccurred: {
                        gte: new Date('2026-01-01'),
                        lt: new Date('2027-01-01'),
                    },
                },
            },
            orderBy: { dateTimeOccurred: 'desc' },
        });

        const rows = incidents.map((i: any) => ({
            'Incident No.': i.incidentNo,
            'Source Year': i.sourceYear,
            'Reported By': i.reportedBy,
            'Site': i.site,
            'Location on Site': i.locationOnSite,
            'Date/Time': i.dateTimeOccurred?.toISOString().split('T')[0],
            'PEAR Class': i.pearClass,
            'Sub Category': i.subCategory,
            'Brief Description': i.briefDescription,
            'Inc Type if Injury': i.incTypeIfInjury,
            'Asset Integrity Type': i.assetIntegrityType,
            'Damaged Zone': i.damagedZone,
            'PSE Tiers': i.pseTiers,
            'Actual Severity': i.actualSeverity,
            'Potential Severity': i.potentialSeverity,
            'Investigation Done': i.investigationDone ? 'Yes' : 'No',
            'Status': i.status,
        }));

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=incidents.json');
        return res.json(rows);
    } catch (err) {
        next(err);
    }
};
