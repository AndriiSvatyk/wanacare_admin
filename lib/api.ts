import axios from 'axios';
import Cookies from 'js-cookie';

// Get API URL from environment, default to localhost:3000/api
let API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Normalize the URL: remove trailing slashes and ensure it ends with /api (not /api/api)
API_URL = API_URL.trim().replace(/\/+$/, ''); // Remove trailing slashes

// If URL already contains /api/api, fix it
if (API_URL.includes('/api/api')) {
  API_URL = API_URL.replace(/\/api\/api.*$/, '/api');
} else if (!API_URL.endsWith('/api')) {
  // If it doesn't end with /api, add it (but don't duplicate)
  API_URL = API_URL + '/api';
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug logging in development
if (typeof window !== 'undefined') {
  console.log('[API] Base URL configured as:', API_URL);
}

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
  logout: async () => {
    Cookies.remove('auth_token');
  },
  getMe: async () => {
    const response = await api.get('/me');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
  getProfessionals: async (params?: any) => {
    const response = await api.get('/admin/professionals', { params });
    return response.data;
  },
  getProfessionalById: async (id: number) => {
    const response = await api.get(`/admin/professionals/${id}`);
    return response.data;
  },
  getClients: async (params?: any) => {
    const response = await api.get('/admin/clients', { params });
    return response.data;
  },
  getClientById: async (id: number) => {
    const response = await api.get(`/admin/clients/${id}`);
    return response.data;
  },
  getServices: async (params?: any) => {
    const response = await api.get('/services', { params });
    return response.data;
  },
  getInvoices: async (params?: any) => {
    const response = await api.get('/invoices', { params });
    return response.data;
  },
  getNotifications: async (params?: any) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },
  validateProfessional: async (professionalId: number, enabledServices: number[]) => {
    const response = await api.post(`/admin/professionals/${professionalId}/validate`, {
      enabled_services: enabledServices,
    });
    return response.data;
  },
  rejectProfessional: async (professionalId: number, reason?: string) => {
    const response = await api.post(`/admin/professionals/${professionalId}/reject`, { reason });
    return response.data;
  },
  deleteUser: async (userId: number) => {
    const response = await api.post('/users/delete', { id: userId });
    return response.data;
  },
  toggleProfessionalServices: async (professionalId: number, enabled: boolean) => {
    // This would need to be implemented in the backend
    const response = await api.put(`/admin/professionals/${professionalId}/services`, { enabled });
    return response.data;
  },
  getProfessionalServiceTypes: async (professionalId: number) => {
    const response = await api.get(`/admin/professionals/${professionalId}/service-types`);
    return response.data;
  },
  updateProfessionalServiceTypes: async (professionalId: number, serviceTypes: Array<{ id: number; enabled: boolean }>) => {
    const response = await api.put(`/admin/professionals/${professionalId}/service-types`, { service_types: serviceTypes });
    return response.data;
  },
};

