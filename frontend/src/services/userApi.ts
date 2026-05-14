import api from './api';

export interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  department: string | null;
  isActive: boolean;
  createdAt: string;
  permissions?: Record<string, boolean>;
}

export interface PaginatedUsers {
  success: boolean;
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const userApi = {
  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<PaginatedUsers>('/users', { params }),

  updateUserRole: (id: number, role: string) =>
    api.put<{ success: boolean; data: { id: number; email: string; role: string } }>(`/users/${id}/role`, { role }),

  updateUserStatus: (id: number, isActive: boolean) =>
    api.put<{ success: boolean; data: { id: number; email: string; isActive: boolean } }>(`/users/${id}/status`, { isActive }),

  updateUserPassword: (id: number, password: string) =>
    api.put<{ success: boolean }>(`/users/${id}/password`, { password }),
};
