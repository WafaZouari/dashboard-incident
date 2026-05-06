export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AIAnalysisResult {
  rootCauseAnalysis: string;
  contributingFactors: string[];
  recommendations: string[];
  preventiveMeasures: string[];
  riskLevel: RiskLevel;
}

export interface AISimilarIncident {
  id: number;
  similarityScore: number;
  reason: string;
}

export interface AIInsights {
  trends: string[];
  hotspots: string[];
  recommendations: string[];
}
