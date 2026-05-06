export interface Guardian {
  id: number;
  badgeId: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  rank: string | null;
  site: string | null;
  zone: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GuardianShift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuardianAssignment {
  id: number;
  guardianId: number;
  shiftId: number;
  date: string;
  site: string | null;
  zone: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  guardian?: Guardian;
  shift?: GuardianShift;
}

export interface GuardianFormData {
  badgeId?: string | null;
  firstName: string;
  lastName: string;
  rank?: string | null;
  site?: string | null;
  zone?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive?: boolean;
}

export interface GuardianShiftFormData {
  name: string;
  startTime: string;
  endTime: string;
  color?: string;
}

export interface GuardianAssignmentFormData {
  guardianId: number;
  shiftId: number;
  date: string;
  site?: string | null;
  zone?: string | null;
  notes?: string | null;
  status?: string;
}

export interface PaginatedGuardians {
  success: boolean;
  message: string;
  data: Guardian[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
