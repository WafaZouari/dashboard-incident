import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000, // Increased from 30s to 120s for slow local LLM generation
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===================== AUTH =====================
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: object) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (data: object) => api.put('/auth/profile', data),
};

// ===================== INCIDENTS =====================
export const incidentApi = {
  getAll: (params?: object) => api.get('/incidents', { params }),
  getById: (id: number) => api.get(`/incidents/${id}`),
  getStats: () => api.get('/incidents/stats'),
  create: (data: object) => api.post('/incidents', data),
  update: (id: number, data: object) => api.put(`/incidents/${id}`, data),
  delete: (id: number) => api.delete(`/incidents/${id}`),
  export: () => api.get('/incidents/export', { responseType: 'blob' }),
};

// ===================== ANALYTICS =====================
export const analyticsApi = {
  getDashboard: (year?: string) => api.get('/analytics/dashboard', { params: year && year !== 'all' ? { year } : {} }),
  getTrends: (months?: number, year?: string) => api.get('/analytics/trends', { params: { ...(year && year !== 'all' ? { year } : { months }) } }),
  getByType: (year?: string) => api.get('/analytics/by-type', { params: year && year !== 'all' ? { year } : {} }),
  getByLocation: (year?: string) => api.get('/analytics/by-location', { params: year && year !== 'all' ? { year } : {} }),
  getBySeverity: (year?: string) => api.get('/analytics/by-severity', { params: year && year !== 'all' ? { year } : {} }),
  getRootCauses: () => api.get('/analytics/root-causes'),
};

// ===================== INVESTIGATIONS =====================
export const investigationApi = {
  getAll: (params?: object) => api.get('/investigations', { params }),
  getById: (id: number) => api.get(`/investigations/${id}`),
  getByIncident: (incidentId: number) => api.get(`/investigations/incident/${incidentId}`),
  create: (data: object) => api.post('/investigations', data),
  update: (id: number, data: object) => api.put(`/investigations/${id}`, data),
};

// ===================== ACTION ITEMS =====================
export const actionItemApi = {
  getAll: (params?: object) => api.get('/action-items', { params }),
  getOverdue: () => api.get('/action-items/overdue'),
  getById: (id: number) => api.get(`/action-items/${id}`),
  create: (data: object) => api.post('/action-items', data),
  update: (id: number, data: object) => api.put(`/action-items/${id}`, data),
  updateStatus: (id: number, status: string) => api.patch(`/action-items/${id}/status`, { status }),
};

// ===================== REFERENCE DATA =====================
export const referenceApi = {
  getLocations: () => api.get('/locations'),
  createLocation: (data: object) => api.post('/locations', data),
  getIncidentTypes: () => api.get('/incident-types'),
  createIncidentType: (data: object) => api.post('/incident-types', data),
  getSubcategories: (typeId: number) => api.get(`/incident-types/${typeId}/subcategories`),
  getConsequences: () => api.get('/consequences'),
  getUsers: () => api.get('/users'),
};

// ===================== AI =====================
export const aiApi = {
  analyzeIncident: (id: number) => api.post(`/ai/analyze-incident/${id}`),
  createInvestigation: (id: number) => api.post(`/ai/create-investigation/${id}`),
  getInsights: () => api.get('/ai/insights'),
  getRootCauseAnalysis: (year?: string) => api.get('/ai/root-causes', { params: year && year !== 'all' ? { year } : {} }),
};

// ===================== IMPORT =====================
export const importApi = {
  uploadExcel: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
