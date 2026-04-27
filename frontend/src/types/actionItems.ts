
import type { User } from './auth';
import type { Incident, Priority } from './incidents';

import type { Investigation } from './investigations';


export interface ActionItem {
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
}
