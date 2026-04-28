import type { User } from './auth';
import type { Incident } from './incidents';
import type { Investigation } from './investigations';

export interface ActionItem {
  id: number;
  incidentId: number;
  investigationId?: number | null;
  correctiveActionsTaken?: string | null;
  suggestionsRecommendations?: string | null;
  assignedToId?: number | null;
  dueDate?: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: string;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  incident?: Partial<Incident>;
  assignedTo?: Partial<User> | null;
  investigation?: Partial<Investigation> | null;
}
