// ===================== AUTH =====================
export type User = {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: 'admin' | 'manager' | 'investigator' | 'viewer';
  department?: string | null;
  isActive?: boolean;
  createdAt?: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};

// ===================== INCIDENTS =====================
export type IncidentStatus = 'open' | 'under_investigation' | 'closed' | 'archived';
export type SeverityLevel = 1 | 2 | 3 | 4 | 5;
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type Incident = {
  id: number;
  sourceYear?: number | null;
  incidentNo: string;
  reportedBy?: string | null;
  site?: string | null;
  locationOnSite?: string | null;
  dateTimeOccurred?: string | null;
  pearClass?: string | null;
  subCategory?: string | null;
  briefDescription?: string | null;
  incTypeIfInjury?: string | null;
  assetIntegrityType?: string | null;
  damagedZone?: string | null;
  pseTiers?: string | null;
  actualSeverity?: number | null;
  potentialSeverity?: number | null;
  investigationDone: boolean;
  tir?: number | null;
  workingHours?: number | null;
  tifr?: number | null;
  status: IncidentStatus;
  createdById?: number | null;
  createdBy?: Partial<User> | null;
  investigations?: any[];
  actionItems?: any[];
  attachments?: any[];
  createdAt?: string;
  updatedAt?: string;
  aiAnalysis?: AIIncidentAnalysis | null;
};

export type AIIncidentAnalysis = {
  id: number;
  incidentId: number;
  analysis: AIAnalysisResult;
  createdAt: string;
  updatedAt: string;
};

export type IncidentFormData = {
  sourceYear?: number;
  incidentNo: string;
  reportedBy?: string;
  site?: string;
  locationOnSite?: string;
  dateTimeOccurred?: string;
  pearClass?: string;
  subCategory?: string;
  briefDescription?: string;
  incTypeIfInjury?: string;
  assetIntegrityType?: string;
  damagedZone?: string;
  pseTiers?: string;
  actualSeverity?: number;
  potentialSeverity?: number;
  investigationDone?: boolean;
  tir?: number;
  workingHours?: number;
  status: IncidentStatus;
};

// ===================== INVESTIGATIONS =====================
export type Investigation = {
  id: number;
  incidentId: number;
  investigationDate?: string | null;
  investigatorId?: number | null;
  immediateCauses?: string | null;
  rootCauses?: string | null;
  findings?: string | null;
  recommendations?: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  incident?: Partial<Incident>;
  investigator?: Partial<User> | null;
  actionItems?: any[];
};

// ===================== ACTION ITEMS =====================
export type ActionItem = {
  id: number;
  incidentId: number;
  investigationId?: number | null;
  correctiveActionsTaken?: string | null;
  suggestionsRecommendations?: string | null;
  assignedToId?: number | null;
  dueDate?: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: Priority;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  incident?: Partial<Incident>;
  assignedTo?: Partial<User> | null;
  investigation?: Partial<Investigation> | null;
};

// ===================== ANALYTICS =====================
export type DashboardStats = {
  totalIncidents: number;
  openIncidents: number;
  withInvestigation: number;
  thisMonthCount: number;
  lastMonthCount: number;
  changePercent: number;
  avgSeverity: number;
  closed: number;
  investigationRate: number;
  ltifr: number;
};

export type TrendDataPoint = {
  month: string;
  date: string;
  count: number;
  avgSeverity: number;
};

export type TypeDataPoint = {
  id: string;
  name: string;
  count: number;
};

export type LocationDataPoint = {
  id: string;
  name: string;
  count: number;
};

export type SeverityDataPoint = {
  severity: number;
  count: number;
};

export type PseTierDataPoint = {
  id: string;
  name: string;
  count: number;
};

export type AssetIntegrityDataPoint = {
  id: string;
  name: string;
  count: number;
};

// ===================== AI =====================
export type AIAnalysisResult = {
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
};

export type AIActionItem = {
  description: string;
  priority: Priority;
  estimatedDays: number;
};

export type AISimilarIncident = {
  id: number;
  similarityScore: number;
  reason: string;
};

export type AIPatternAnalysis = {
  trends: string[];
  hotspots: string[];
  recommendations: string[];
};

export type AIRootCauseAnalysis = {
  ishikawa: {
    manpower: string[];
    method: string[];
    machine: string[];
    material: string[];
    environment: string[];
    measurement: string[];
  };
  fiveWhys: Array<{ why: string; answer: string }>;
};

export type AIInsights = {
  trends: string[];
  hotspots: string[];
  recommendations: string[];
};

// ===================== API =====================
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type IncidentFilters = {
  status?: string;
  pearClass?: string;
  site?: string;
  severity?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  year?: string;
};
