import api from './api';

export interface Role {
  id: number;
  name: string;
  permissions: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export const roleApi = {
  getRoles: () => api.get<{ success: boolean; data: Role[] }>('/roles'),
  createRole: (data: { name: string; permissions: Record<string, boolean> }) => 
    api.post<{ success: boolean; data: Role }>('/roles', data),
  updateRole: (id: number, data: { name?: string; permissions?: Record<string, boolean> }) => 
    api.put<{ success: boolean; data: Role }>(`/roles/${id}`, data),
  deleteRole: (id: number) => api.delete<{ success: boolean }>(`/roles/${id}`),
};
