import { User } from './auth';
import { Location, IncidentType, IncidentSubcategory, IncidentConsequence } from './reference';

export type IncidentStatus = 'open' | 'under_investigation' | 'closed' | 'archived';
export type SeverityLevel = 1 | 2 | 3 | 4 | 5;
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Incident {
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
  investigations?: any[]; // Use any to break circularity
  actionItems?: any[]; // Use any to break circularity
  createdAt?: string;
  updatedAt?: string;
}

export interface IncidentDetail {
  id: number;
  incidentId: number;
  assetLossDetails?: string | null;
  environmentalDetails?: string | null;
  injuryIllnessDetails?: string | null;
  securityDetails?: string | null;
  transportationDetails?: string | null;
  tierCategory?: string | null;
  pseFlags?: string | null;
}

export interface IncidentFormData {
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
}
