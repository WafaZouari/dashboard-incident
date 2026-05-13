import { Request, Response, NextFunction } from 'express';
import '../types/index';
import prisma from '../config/database';

import { aiService } from '../services/ai.service';
import { aiOrchestrator } from '../services/ai/orchestrator.service';
import { sendSuccess, sendError } from '../utils/response';

export const analyzeIncident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const forceRefresh = req.query.refresh === 'true';

    // 1. Check for existing analysis
    if (!forceRefresh) {
      const existing = await prisma.aIIncidentAnalysis.findUnique({
        where: { incidentId: id }
      });
      if (existing) {
        // Find similar incidents anyway as they are not stored
        const incident = await prisma.incident.findUnique({ where: { id } });
        const historical = await prisma.incident.findMany({
          where: { id: { not: id } },
          select: { id: true, incidentNo: true, briefDescription: true },
          take: 30,
        });
        const similarIncidents = await aiService.findSimilarIncidents(
          { title: incident!.incidentNo, description: incident!.briefDescription, type: incident!.pearClass || undefined },
          historical.map(h => ({ id: h.id, title: h.incidentNo, description: h.briefDescription }))
        );
        return sendSuccess(res, { analysis: existing.analysis, similarIncidents });
      }
    }

    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        investigations: true,
        actionItems: true,
      },
    });
    if (!incident) return sendError(res, 'Incident not found', 404);

    const analysisPromise = aiService.analyzeIncident({
      title: incident.incidentNo,
      description: incident.briefDescription ?? undefined,
      incidentType: incident.pearClass ?? undefined,
      location: `${incident.site || ''} — ${incident.locationOnSite || ''}`.trim(),
      severity: incident.actualSeverity,
    });

    const historicalIncidentsPromise = prisma.incident.findMany({
      where: { id: { not: id } },
      select: { id: true, incidentNo: true, briefDescription: true },
      take: 30,
    }).then(historical => aiService.findSimilarIncidents(
      { title: incident.incidentNo, description: incident.briefDescription ?? undefined, type: incident.pearClass ?? undefined },
      historical.map(h => ({ id: h.id, title: h.incidentNo, description: h.briefDescription ?? undefined }))
    ));

    const [analysis, similarIncidents] = await Promise.all([analysisPromise, historicalIncidentsPromise]);

    // 3. Store in database
    await prisma.aIIncidentAnalysis.upsert({
      where: { incidentId: id },
      update: { analysis: analysis as any },
      create: { incidentId: id, analysis: analysis as any }
    });

    return sendSuccess(res, { analysis, similarIncidents });
  } catch (err) {
    next(err);
  }
};

export const createAIInvestigation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) return sendError(res, 'Incident not found', 404);

    const analysis = await aiService.analyzeIncident({
      title: incident.incidentNo,
      description: incident.briefDescription ?? undefined,
      incidentType: incident.pearClass ?? undefined,
      location: `${incident.site || ''} — ${incident.locationOnSite || ''}`.trim(),
      severity: incident.actualSeverity,
    });

    // Create investigation
    const investigation = await prisma.investigation.create({
      data: {
        incidentId: id,
        investigatorId: req.user?.userId,
        investigationDate: new Date(),
        rootCauses: analysis.rootCauseAnalysis,
        findings: analysis.contributingFactors.join('\n'),
        recommendations: analysis.recommendations.join('\n'),
        status: 'in_progress',
      },
    });

    // Generate and create action items
    const aiActionItems = await aiService.generateActionItems(analysis.recommendations);
    const now = new Date();
    await prisma.actionItem.createMany({
      data: aiActionItems.map((item: any) => ({
        incidentId: id,
        investigationId: investigation.id,
        correctiveActionsTaken: item.description,
        suggestionsRecommendations: '',
        priority: item.priority,
        dueDate: new Date(now.getTime() + item.estimatedDays * 24 * 60 * 60 * 1000),
        status: 'pending',
      })),
    });

    // Update incident
    await prisma.incident.update({
      where: { id },
      data: { investigationDone: true, status: 'under_investigation' },
    });

    const fullInvestigation = await prisma.investigation.findUnique({
      where: { id: investigation.id },
      include: {
        actionItems: true,
        investigator: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return sendSuccess(res, { investigation: fullInvestigation, analysis }, 'AI investigation created', 201);
  } catch (err) {
    next(err);
  }
};

export const getAIInsights = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { dateTimeOccurred: 'desc' },
      take: 100,
    });

    // Map to the shape analyzePatterns expects
    const mapped = incidents.map(i => ({
      title: i.incidentNo,
      incidentType: i.pearClass ? { name: i.pearClass } : null,
      location: i.site ? { name: i.site } : null,
    }));

    const patterns = await aiService.analyzePatterns(mapped);
    return sendSuccess(res, patterns);
  } catch (err) {
    next(err);
  }
};

export const testAI = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return sendError(res, 'Prompt is required', 400);

    const result = await aiOrchestrator.generateText(prompt);

    return sendSuccess(res, result, 'AI Response generated successfully');
  } catch (err) {
    next(err);
  }
};

export const getAIRootCauseAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const year = req.query.year as string | undefined;
    const exclude2026 = {
      NOT: {
        dateTimeOccurred: {
          gte: new Date('2026-01-01'),
          lt: new Date('2027-01-01'),
        },
      },
    };
    
    let baseWhere: any = exclude2026;
    if (year) {
      const y = parseInt(year);
      if (!isNaN(y)) {
        baseWhere = {
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
    }

    const investigations = await prisma.investigation.findMany({
      where: { 
        rootCauses: { not: null },
        incident: baseWhere,
      },
      select: {
        rootCauses: true,
        immediateCauses: true,
        incident: { select: { incidentNo: true } }
      },
      take: 50,
      orderBy: { createdAt: 'desc' }
    });

    const mapped = investigations.map(i => ({
      incidentNo: i.incident?.incidentNo || 'Unknown',
      rootCauses: i.rootCauses,
      immediateCauses: i.immediateCauses,
    }));

    const analysis = await aiService.analyzeRootCauses(mapped);
    return sendSuccess(res, analysis);
  } catch (err) {
    next(err);
  }
};
