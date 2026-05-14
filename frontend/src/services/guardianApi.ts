import api from './api';
import type {
  Guardian,
  GuardianShift,
  GuardianAssignment,
  GuardianFormData,
  GuardianShiftFormData,
  GuardianAssignmentFormData,
  PaginatedGuardians
} from '../types/guardian';

export const guardianApi = {
  // --- GUARDIANS ---
  getWorkingHours: () =>
    api.get<{ success: boolean; data: { name: string; hours: number }[] }>('/guardians/hours'),

  getStats: () =>
    api.get<{ success: boolean; data: { total: number; active: number; inactive: number } }>('/guardians/stats'),

  getGuardians: (params?: { page?: number; limit?: number; search?: string; site?: string; isActive?: boolean }) =>
    api.get<PaginatedGuardians>('/guardians', { params }),

  getGuardianById: (id: number) =>
    api.get<{ success: boolean; data: Guardian }>(`/guardians/${id}`),

  createGuardian: (data: GuardianFormData) =>
    api.post<{ success: boolean; data: Guardian }>('/guardians', data),

  updateGuardian: (id: number, data: GuardianFormData) =>
    api.put<{ success: boolean; data: Guardian }>(`/guardians/${id}`, data),

  deleteGuardian: (id: number) =>
    api.delete<{ success: boolean; data: null }>(`/guardians/${id}`),

  // --- SHIFTS ---
  getShifts: () =>
    api.get<{ success: boolean; data: GuardianShift[] }>('/guardians/shifts'),

  createShift: (data: GuardianShiftFormData) =>
    api.post<{ success: boolean; data: GuardianShift }>('/guardians/shifts', data),

  updateShift: (id: number, data: GuardianShiftFormData) =>
    api.put<{ success: boolean; data: GuardianShift }>(`/guardians/shifts/${id}`, data),

  deleteShift: (id: number) =>
    api.delete<{ success: boolean; data: null }>(`/guardians/shifts/${id}`),

  // --- ASSIGNMENTS ---
  getAssignments: (params?: { guardianId?: number; startDate?: string; endDate?: string }) =>
    api.get<{ success: boolean; data: GuardianAssignment[] }>('/guardians/assignments', { params }),

  getCalendarAssignments: (month: number, year: number) =>
    api.get<{ success: boolean; data: Record<string, GuardianAssignment[]> }>('/guardians/assignments/calendar', {
      params: { month, year },
    }),

  createAssignment: (data: GuardianAssignmentFormData) =>
    api.post<{ success: boolean; data: GuardianAssignment }>('/guardians/assignments', data),

  updateAssignment: (id: number, data: GuardianAssignmentFormData) =>
    api.put<{ success: boolean; data: GuardianAssignment }>(`/guardians/assignments/${id}`, data),

  deleteAssignment: (id: number) =>
    api.delete<{ success: boolean; data: null }>(`/guardians/assignments/${id}`),
};
