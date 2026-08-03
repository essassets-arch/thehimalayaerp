import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = 'http://localhost:4000/api/v1';

// Create a basic axios instance to communicate with the real backend
const client = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to attach the JWT token if it exists
client.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    let token = null;
    try {
      token = useAuthStore.getState().accessToken;
    } catch (e) {
      // Auth store fallback
    }
    if (!token) {
      token =
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token') ||
        localStorage.getItem('auth_token');
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const brandAnalysisService = {
  create: async (data) => {
    const response = await client.post('/brand-analysis', data);
    return response.data.data;
  },

  findAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await client.get(
        `/brand-analysis/finance/requests?${params.toString()}`,
      );
      return response.data.data || { data: [], meta: {} };
    } catch (err) {
      console.warn('Failed to fetch finance brand-analysis requests:', err?.message);
      return { data: [], meta: {} };
    }
  },

  getFinanceSummary: async () => {
    try {
      const response = await client.get('/brand-analysis/finance/requests');
      const requests = response.data?.data || [];

      return {
        pending: requests.filter((r) => r.status === 'SUPER_ADMIN_APPROVED').length,
        reviewed: requests.filter(
          (r) => r.status === 'FINANCE_ANALYSIS_IN_PROGRESS',
        ).length,
        completed: requests.filter(
          (r) => r.status === 'FINANCE_ANALYSIS_COMPLETED',
        ).length,
      };
    } catch (err) {
      console.warn('Failed to fetch finance brand-analysis summary:', err?.message);
      return { pending: 0, reviewed: 0, completed: 0 };
    }
  },

  findOne: async (id) => {
    const response = await client.get(`/brand-analysis/${id}`);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await client.patch(`/brand-analysis/${id}`, data);
    return response.data.data;
  },

  remove: async (id) => {
    const response = await client.delete(`/brand-analysis/${id}`);
    return response.data.data;
  },
};
