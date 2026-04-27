import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { sendSuccess } from '../utils/response';

export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalIncidents, openIncidents, highPotential, thisMonthCount,
      lastMonthCount, withInvestigation, avgSeverity, closed,
    ] = await Promise.all([
      prisma.incident.count(),
      prisma.incident.count({ where: { status: 'open' } }),
      prisma.incident.count({ where: { isHighPotential: true } }),
      prisma.incident.count({ where: { dateOccurred: { gte: thisMonthStart } } }),
      prisma.incident.count({ where: { dateOccurred: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      prisma.incident.count({ where: { hasInvestigation: true } }),
      prisma.incident.aggregate({ _avg: { actualSeverity: true } }),
      prisma.incident.count({ where: { status: 'closed' } }),
    ]);

    const changePercent = lastMonthCount > 0
      ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
      : 0;

    return sendSuccess(res, {
      totalIncidents,
      openIncidents,
      highPotential,
      thisMonthCount,
      lastMonthCount,
      changePercent,
      withInvestigation,
      avgSeverity: Math.round((avgSeverity._avg.actualSeverity || 0) * 10) / 10,
      closed,
      investigationRate: totalIncidents > 0 ? Math.round((withInvestigation / totalIncidents) * 100) : 0,
    });
  } catch (err) {
    next(err);
  }
};

export const getTrends = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const months = parseInt(req.query.months as string) || 12;
    const results = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      const start = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const end = new Date(date.getFullYear(), date.getMonth() - i + 1, 0);

      const [count, highPot, avg] = await Promise.all([
        prisma.incident.count({ where: { dateOccurred: { gte: start, lte: end } } }),
        prisma.incident.count({ where: { dateOccurred: { gte: start, lte: end }, isHighPotential: true } }),
        prisma.incident.aggregate({ where: { dateOccurred: { gte: start, lte: end } }, _avg: { actualSeverity: true } }),
      ]);

      results.push({
        month: start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        date: start.toISOString(),
        count,
        highPotential: highPot,
        avgSeverity: Math.round((avg._avg.actualSeverity || 0) * 10) / 10,
      });
    }

    return sendSuccess(res, results);
  } catch (err) {
    next(err);
  }
};

export const getByType = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const types = await prisma.incidentType.findMany({ where: { isActive: true } });
    const result = await Promise.all(
      types.map(async (type: any) => {
        const count = await prisma.incident.count({ where: { incidentTypeId: type.id } });
        return { id: type.id, name: type.name, category: type.category, count };
      })
    );
    return sendSuccess(res, result.filter((r) => r.count > 0).sort((a, b) => b.count - a.count));
  } catch (err) {
    next(err);
  }
};

export const getByLocation = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const locations = await prisma.location.findMany({ where: { isActive: true } });
    const result = await Promise.all(
      locations.map(async (loc: any) => {
        const count = await prisma.incident.count({ where: { locationId: loc.id } });
        return { id: loc.id, name: loc.name, site: loc.site, count };
      })
    );
    return sendSuccess(res, result.filter((r) => r.count > 0).sort((a, b) => b.count - a.count));
  } catch (err) {
    next(err);
  }
};

export const getBySeverity = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const severities = [1, 2, 3, 4, 5];
    const result = await Promise.all(
      severities.map(async (sev) => {
        const count = await prisma.incident.count({ where: { actualSeverity: sev } });
        return { severity: sev, count };
      })
    );
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const getRootCauses = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const investigations = await prisma.investigation.findMany({
      where: { rootCause: { not: null } },
      select: { rootCause: true, incident: { select: { incidentType: { select: { name: true } } } } },
    });
    return sendSuccess(res, investigations);
  } catch (err) {
    next(err);
  }
};
