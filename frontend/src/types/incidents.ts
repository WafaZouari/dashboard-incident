import { User } from './auth';

export type IncidentStatus = 'open' | 'under_investigation' | 'closed' | 'archived';
export type SeverityLevel = 1 | 2 | 3 | 4 | 5;
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Incident {
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
  status: IncidentStatus;
  createdById?: number | null;
  createdBy?: Partial<User> | null;
  investigations?: any[];
  actionItems?: any[];
  attachments?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IncidentFormData {
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
  status: IncidentStatus;
}
