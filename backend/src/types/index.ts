// ======================= AUTH TYPES =======================
export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

// ======================= USER TYPES =======================
export interface UserDTO {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  department?: string | null;
  isActive: boolean;
  createdAt: Date;
}

// ======================= INCIDENT TYPES =======================
export type IncidentStatus = 'open' | 'under_investigation' | 'closed' | 'archived';
export type SeverityLevel = 1 | 2 | 3 | 4 | 5;
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IncidentFilters {
  status?: string;
  incidentTypeId?: number;
  locationId?: number;
  severity?: number;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  isHighPotential?: boolean;
}

// ======================= AI TYPES =======================
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AIAnalysisResult {
  rootCauseAnalysis: string;
  contributingFactors: string[];
  recommendations: string[];
  preventiveMeasures: string[];
  riskLevel: RiskLevel;
  ishikawa: {
    manpower: string[];
    method: string[];
    machine: string[];
    material: string[];
    environment: string[];
    measurement: string[];
  };
  fiveWhys: Array<{ why: string; answer: string }>;
  insights: {
    immediateRisks: string[];
    longTermImplications: string[];
    safetyCulture: string[];
  };
}

export interface AIActionItem {
  description: string;
  priority: Priority;
  estimatedDays: number;
}

export interface AISimilarIncident {
  id: number;
  similarityScore: number;
  reason: string;
}

export interface AIPatternAnalysis {
  trends: string[];
  hotspots: string[];
  recommendations: string[];
}

export interface AIRootCauseAnalysis {
  ishikawa: {
    manpower: string[];
    method: string[];
    machine: string[];
    material: string[];
    environment: string[];
    measurement: string[];
  };
  fiveWhys: Array<{ why: string; answer: string }>;
}

// ======================= REQUEST EXTENSIONS =======================
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
