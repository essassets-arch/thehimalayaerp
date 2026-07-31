import axios from 'axios';

const API_URL = 'http://localhost:4000/api/v1';

// Create a basic axios instance to communicate with the real backend
const client = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to attach the JWT token if it exists
client.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token'); // Fallback if using localStorage
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
    // This was failing with 404 because there is no base GET /brand-analysis.
    // Finance should use /brand-analysis/finance/requests
    const params = new URLSearchParams(filters);
    const response = await client.get(`/brand-analysis/finance/requests?${params.toString()}`);
    return response.data.data || { data: [], meta: {} };
  },

  getFinanceSummary: async () => {
    // Calculate summary from the requests list since there's no backend summary endpoint
    const response = await client.get('/brand-analysis/finance/requests');
    const requests = response.data.data || [];
    
    return {
      pending: requests.filter(r => r.status === 'SUPER_ADMIN_APPROVED').length,
      reviewed: requests.filter(r => r.status === 'FINANCE_ANALYSIS_IN_PROGRESS').length,
      completed: requests.filter(r => r.status === 'FINANCE_ANALYSIS_COMPLETED').length
    };
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
  }
};
