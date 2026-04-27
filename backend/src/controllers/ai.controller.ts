import { Request, Response, NextFunction } from 'express';
import '../types/index';
import prisma from '../config/database';

import { aiService } from '../services/ai.service';
import { aiOrchestrator } from '../services/ai/orchestrator.service';
import { sendSuccess, sendError } from '../utils/response';

export const analyzeIncident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        location: true,
        incidentType: true,
        incidentSubcategory: true,
        consequence: true,
        details: true,
      },
    });
    if (!incident) return sendError(res, 'Incident not found', 404);

    const analysis = await aiService.analyzeIncident({
      title: incident.title,
      description: incident.description,
      incidentType: incident.incidentType?.name,
      location: incident.location?.name,
      severity: incident.actualSeverity,
      details: incident.details as Record<string, unknown> | undefined,
    });

    // Find similar incidents
    const historicalIncidents = await prisma.incident.findMany({
      where: { id: { not: id } },
      select: { id: true, title: true, description: true },
      take: 30,
    });

    const similarIncidents = await aiService.findSimilarIncidents(
      { title: incident.title, description: incident.description, type: incident.incidentType?.name },
      historicalIncidents
    );

    return sendSuccess(res, { analysis, similarIncidents });
  } catch (err) {
    next(err);
  }
};

export const createAIInvestigation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: { location: true, incidentType: true, details: true },
    });
    if (!incident) return sendError(res, 'Incident not found', 404);

    const analysis = await aiService.analyzeIncident({
      title: incident.title,
      description: incident.description,
      incidentType: incident.incidentType?.name,
      location: incident.location?.name,
      severity: incident.actualSeverity,
      details: incident.details as Record<string, unknown> | undefined,
    });

    // Create investigation
    const investigation = await prisma.investigation.create({
      data: {
        incidentId: id,
        investigatorId: req.user?.userId,
        investigationDate: new Date(),
        rootCause: analysis.rootCauseAnalysis,
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
        description: item.description,
        priority: item.priority,
        dueDate: new Date(now.getTime() + item.estimatedDays * 24 * 60 * 60 * 1000),
        status: 'pending',
      })),
    });

    // Update incident
    await prisma.incident.update({
      where: { id },
      data: { hasInvestigation: true, status: 'under_investigation' },
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
      include: { incidentType: true, location: true },
      orderBy: { dateOccurred: 'desc' },
      take: 100,
    });

    const patterns = await aiService.analyzePatterns(incidents);
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
