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

// ===================== REFERENCE DATA =====================
export type Location = {
  id: number;
  name: string;
  site?: string | null;
  department?: string | null;
  isActive: boolean;
};

export type IncidentType = {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  isActive: boolean;
  subcategories?: IncidentSubcategory[];
};

export type IncidentSubcategory = {
  id: number;
  incidentTypeId: number;
  name: string;
  description?: string | null;
};

export type IncidentConsequence = {
  id: number;
  name: string;
  description?: string | null;
  severityWeight?: number | null;
};

// ===================== INCIDENTS =====================
export type IncidentStatus = 'open' | 'under_investigation' | 'closed' | 'archived';
export type SeverityLevel = 1 | 2 | 3 | 4 | 5;
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type Incident = {
  id: number;
  incidentId?: string | null;
  title: string;
  description?: string | null;
  dateOccurred: string;
  timeOccurred?: string | null;
  status: IncidentStatus;
  actualSeverity?: number | null;
  potentialSeverity?: number | null;
  isHighPotential: boolean;
  hasInvestigation: boolean;
  locationId?: number | null;
  incidentTypeId?: number | null;
  consequenceId?: number | null;
  location?: Location | null;
  incidentType?: IncidentType | null;
  incidentSubcategory?: IncidentSubcategory | null;
  consequence?: IncidentConsequence | null;
  responsibleSupervisor?: Partial<User> | null;
  incidentLeader?: Partial<User> | null;
  reportedBy?: Partial<User> | null;
  createdBy?: Partial<User> | null;
  details?: IncidentDetail | null;
  investigations?: any[]; 
  actionItems?: any[]; 
  attachments?: any[]; 
  createdAt?: string;
  updatedAt?: string;
};

export type IncidentDetail = {
  id: number;
  incidentId: number;
  assetLossDetails?: string | null;
  environmentalDetails?: string | null;
  injuryIllnessDetails?: string | null;
  securityDetails?: string | null;
  transportationDetails?: string | null;
  tierCategory?: string | null;
  pseFlags?: string | null;
};

export type IncidentFormData = {
  title: string;
  description?: string;
  dateOccurred: string;
  timeOccurred?: string;
  locationId?: number;
  incidentTypeId?: number;
  incidentSubcategoryId?: number;
  consequenceId?: number;
  actualSeverity?: number;
  potentialSeverity?: number;
  isHighPotential: boolean;
  status: IncidentStatus;
  responsibleSupervisorId?: number;
  incidentLeaderId?: number;
  reportedById?: number;
};

// ===================== INVESTIGATIONS =====================
export type Investigation = {
  id: number;
  incidentId: number;
  investigationDate?: string | null;
  investigatorId?: number | null;
  rootCause?: string | null;
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
  description: string;
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
  highPotential: number;
  thisMonthCount: number;
  lastMonthCount: number;
  changePercent: number;
  withInvestigation: number;
  avgSeverity: number;
  closed: number;
  investigationRate: number;
};

export type TrendDataPoint = {
  month: string;
  date: string;
  count: number;
  highPotential: number;
  avgSeverity: number;
};

export type TypeDataPoint = {
  id: number;
  name: string;
  category?: string | null;
  count: number;
};

export type LocationDataPoint = {
  id: number;
  name: string;
  site?: string | null;
  count: number;
};

export type SeverityDataPoint = {
  severity: number;
  count: number;
};

// ===================== AI =====================
export type AIAnalysisResult = {
  rootCauseAnalysis: string;
  contributingFactors: string[];
  recommendations: string[];
  preventiveMeasures: string[];
  riskLevel: RiskLevel;
};

export type AISimilarIncident = {
  id: number;
  similarityScore: number;
  reason: string;
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
  incidentTypeId?: number;
  locationId?: number;
  severity?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  isHighPotential?: boolean;
};
