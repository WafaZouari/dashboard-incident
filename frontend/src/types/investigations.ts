import type { User } from './auth';
import type { Incident } from './incidents';

export interface Investigation {
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
}
