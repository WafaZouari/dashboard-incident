import { aiOrchestrator } from './ai/orchestrator.service';
import { AIAnalysisResult, AIActionItem, AISimilarIncident, AIPatternAnalysis } from '../types/index';

export const aiService = {
  async analyzeIncident(incidentData: {
    title: string;
    description?: string | null;
    incidentType?: string;
    location?: string;
    severity?: number | null;
    details?: Record<string, unknown>;
  }): Promise<AIAnalysisResult> {
    const prompt = `You are an expert safety engineer specializing in petrochemical industry incidents.

Analyze this incident and provide a detailed investigation report in JSON format:

INCIDENT DATA:
- Title: ${incidentData.title}
- Description: ${incidentData.description || 'No description provided'}
- Type: ${incidentData.incidentType || 'Unknown'}
- Location: ${incidentData.location || 'Unknown'}
- Severity (1-5): ${incidentData.severity || 'Unknown'}
- Additional Details: ${JSON.stringify(incidentData.details || {})}

Respond ONLY with valid JSON in this exact structure:
{
  "rootCauseAnalysis": "detailed root cause analysis...",
  "contributingFactors": ["factor 1", "factor 2", "factor 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "preventiveMeasures": ["measure 1", "measure 2", "measure 3"],
  "riskLevel": "low|medium|high|critical"
}`;

    const { text } = await aiOrchestrator.generateText(prompt);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in AI response');

    return JSON.parse(jsonMatch[0]) as AIAnalysisResult;
  },

  async generateActionItems(recommendations: string[]): Promise<AIActionItem[]> {
    const prompt = `You are a safety manager. Convert these recommendations into concrete action items with priorities and timelines.

RECOMMENDATIONS:
${recommendations.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

Respond ONLY with valid JSON array:
[
  {
    "description": "specific action item...",
    "priority": "low|medium|high|critical",
    "estimatedDays": 30
  }
]`;

    const { text } = await aiOrchestrator.generateText(prompt);

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in AI response');

    return JSON.parse(jsonMatch[0]) as AIActionItem[];
  },

  async findSimilarIncidents(
    currentIncident: { title: string; description?: string | null; type?: string },
    historicalIncidents: Array<{ id: number; title: string; description?: string | null }>
  ): Promise<AISimilarIncident[]> {
    if (historicalIncidents.length === 0) return [];

    const prompt = `Compare this incident to historical incidents and identify the most similar ones.

CURRENT INCIDENT:
Title: ${currentIncident.title}
Description: ${currentIncident.description || 'N/A'}
Type: ${currentIncident.type || 'N/A'}

HISTORICAL INCIDENTS:
${historicalIncidents.slice(0, 20).map((h: any) => `ID: ${h.id} | Title: ${h.title} | Desc: ${h.description?.slice(0, 100) || 'N/A'}`).join('\n')}

Respond ONLY with valid JSON array of the top 3 most similar (score 0-100):
[{"id": 1, "similarityScore": 85, "reason": "explanation"}]`;

    const { text } = await aiOrchestrator.generateText(prompt);

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    return JSON.parse(jsonMatch[0]) as AISimilarIncident[];
  },

  async analyzePatterns(incidents: Array<{ title: string; incidentType?: { name: string } | null; location?: { name: string } | null }>): Promise<AIPatternAnalysis> {
    const prompt = `Analyze these ${incidents.length} petrochemical incidents and identify patterns, trends, and strategic recommendations.

INCIDENTS SUMMARY:
${incidents.slice(0, 50).map((i: any) => `- ${i.title} | Type: ${i.incidentType?.name || 'N/A'} | Location: ${i.location?.name || 'N/A'}`).join('\n')}

Respond ONLY with valid JSON:
{
  "trends": ["trend 1", "trend 2"],
  "hotspots": ["hotspot 1", "hotspot 2"],
  "recommendations": ["strategic recommendation 1", "strategic recommendation 2"]
}`;

    const { text } = await aiOrchestrator.generateText(prompt);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in AI response');

    return JSON.parse(jsonMatch[0]) as AIPatternAnalysis;
  },
};
