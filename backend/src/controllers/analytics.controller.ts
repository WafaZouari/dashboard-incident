import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { sendSuccess } from '../utils/response';

function yearWhere(year?: string): Record<string, unknown> {
  const exclude2026 = {
    NOT: {
      dateTimeOccurred: {
        gte: new Date('2026-01-01'),
        lt: new Date('2027-01-01'),
      },
    },
  };

  if (!year) return exclude2026;
  const y = parseInt(year);
  if (isNaN(y)) return exclude2026;
  return {
    AND: [
      {
        dateTimeOccurred: {
          gte: new Date(y, 0, 1),
          lt: new Date(y + 1, 0, 1),
        },
      },
      exclude2026,
    ],
  };
}

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const year = req.query.year as string | undefined;
    const base = yearWhere(year);

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const baseWithoutYear = yearWhere();
    const [
      totalIncidents, openIncidents, withInvestigation, thisMonthCount,
      lastMonthCount, avgSeverity, closed, totalLtis
    ] = await Promise.all([
      prisma.incident.count({ where: base }),
      prisma.incident.count({ where: { ...base, status: 'open' } }),
      prisma.incident.count({ where: { ...base, investigationDone: true } }),
      prisma.incident.count({ where: { ...baseWithoutYear, dateTimeOccurred: { gte: thisMonthStart } } }),
      prisma.incident.count({ where: { ...baseWithoutYear, dateTimeOccurred: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      prisma.incident.aggregate({ where: base, _avg: { actualSeverity: true } }),
      prisma.incident.count({ where: { ...base, status: 'closed' } }),
      prisma.incident.count({ where: { ...base, OR: [{ incTypeIfInjury: 'LTI' }, { subCategory: 'LTI' }] } }),
    ]);

    const changePercent = lastMonthCount > 0
      ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
      : 0;

    // Assuming 1,000,000 hours worked per year for LTIFR calculation
    const ltifr = totalLtis;

    return sendSuccess(res, {
      totalIncidents,
      openIncidents,
      withInvestigation,
      thisMonthCount,
      lastMonthCount,
      changePercent,
      avgSeverity: Math.round(((avgSeverity._avg?.actualSeverity) || 0) * 10) / 10,
      closed,
      investigationRate: totalIncidents > 0 ? Math.round((withInvestigation / totalIncidents) * 100) : 0,
      ltifr,
    });
  } catch (err) {
    next(err);
  }
};

export const getTrends = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const year = req.query.year as string | undefined;
    const results = [];

    if (year) {
      const y = parseInt(year);
      if (y === 2026) return sendSuccess(res, []);
      
      for (let m = 0; m < 12; m++) {
        const start = new Date(y, m, 1);
        const end = new Date(y, m + 1, 0, 23, 59, 59);

        const [count, avg] = await Promise.all([
          prisma.incident.count({ where: { ...yearWhere(year), dateTimeOccurred: { gte: start, lte: end } } }),
          prisma.incident.aggregate({ where: { ...yearWhere(year), dateTimeOccurred: { gte: start, lte: end } }, _avg: { actualSeverity: true } }),
        ]);

        results.push({
          month: start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          date: start.toISOString(),
          count,
          avgSeverity: Math.round(((avg._avg?.actualSeverity) || 0) * 10) / 10,
        });
      }
    } else {
      const months = parseInt(req.query.months as string) || 12;
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        const start = new Date(date.getFullYear(), date.getMonth() - i, 1);
        const end = new Date(date.getFullYear(), date.getMonth() - i + 1, 0);

        if (start.getFullYear() === 2026) continue;

        const [count, avg] = await Promise.all([
          prisma.incident.count({ where: { ...yearWhere(), dateTimeOccurred: { gte: start, lte: end } } }),
          prisma.incident.aggregate({ where: { ...yearWhere(), dateTimeOccurred: { gte: start, lte: end } }, _avg: { actualSeverity: true } }),
        ]);

        results.push({
          month: start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          date: start.toISOString(),
          count,
          avgSeverity: Math.round(((avg._avg?.actualSeverity) || 0) * 10) / 10,
        });
      }
    }

    return sendSuccess(res, results);
  } catch (err) {
    next(err);
  }
};

export const getByType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const base = yearWhere(req.query.year as string | undefined);
    // Group by pearClass directly from incidents
    const incidents = await prisma.incident.findMany({
      where: { ...base, pearClass: { not: null, notIn: [''] } },
      select: { pearClass: true },
    });
    const counts: Record<string, number> = {};
    for (const inc of incidents) {
      const key = inc.pearClass || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    }
    const result = Object.entries(counts)
      .map(([name, count]) => ({ id: name, name, count }))
      .sort((a, b) => b.count - a.count);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const getByLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const base = yearWhere(req.query.year as string | undefined);
    const incidents = await prisma.incident.findMany({
      where: { ...base, site: { not: null, notIn: [''] } },
      select: { site: true, locationOnSite: true },
    });
    const counts: Record<string, number> = {};
    for (const inc of incidents) {
      const key = inc.site || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    }
    const result = Object.entries(counts)
      .map(([name, count]) => ({ id: name, name, count }))
      .sort((a, b) => b.count - a.count);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const getBySeverity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const base = yearWhere(req.query.year as string | undefined);
    const severities = [1, 2, 3, 4, 5];
    const result = await Promise.all(
      severities.map(async (sev) => {
        const count = await prisma.incident.count({ where: { ...base, actualSeverity: sev } });
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
      where: { 
        rootCauses: { not: null },
        incident: {
          NOT: {
            dateTimeOccurred: {
              gte: new Date('2026-01-01'),
              lt: new Date('2027-01-01'),
            }
          }
        }
      },
      select: {
        rootCauses: true,
        immediateCauses: true,
        incident: { select: { id: true, incidentNo: true, pearClass: true, site: true } }
      },
    });
    return sendSuccess(res, investigations);
  } catch (err) {
    next(err);
  }
};
