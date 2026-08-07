import { apiClient } from '../lib/apiClient';

export const financeSalesAnalyticsService = {
  getSummary: async (params = {}) => {
    return apiClient.get('/finance/sales/summary', { params });
  },

  getSalespersons: async (params = {}) => {
    return apiClient.get('/finance/sales/salespersons', { params });
  },

  getSalespersonDetail: async (id, params = {}) => {
    return apiClient.get(`/finance/sales/salespersons/${id}`, { params });
  },

  getSalespersonTimeline: async (id, params = {}) => {
    return apiClient.get(`/finance/sales/salespersons/${id}/activities`, { params });
  },

  getLeads: async (params = {}) => {
    return apiClient.get('/finance/sales/leads', { params });
  },

  getSamples: async (params = {}) => {
    return apiClient.get('/finance/sales/samples', { params });
  },

  getQuotations: async (params = {}) => {
    return apiClient.get('/finance/sales/quotations', { params });
  },

  getOrders: async (params = {}) => {
    return apiClient.get('/finance/sales/orders', { params });
  },

  getCollections: async (params = {}) => {
    return apiClient.get('/finance/sales/collections', { params });
  },

  getCustomers: async (params = {}) => {
    return apiClient.get('/finance/sales/customers', { params });
  },

  getActivities: async (params = {}) => {
    return apiClient.get('/finance/sales/activities', { params });
  },

  getComplaints: async (params = {}) => {
    return apiClient.get('/finance/sales/complaints', { params });
  },

  getReturns: async (params = {}) => {
    return apiClient.get('/finance/sales/returns', { params });
  },

  getReplacements: async (params = {}) => {
    return apiClient.get('/finance/sales/replacements', { params });
  },

  getCharts: async (params = {}) => {
    return apiClient.get('/finance/sales/charts', { params });
  },

  getLeaderboards: async (params = {}) => {
    return apiClient.get('/finance/sales/leaderboards', { params });
  },

  getExportData: async (params = {}) => {
    return apiClient.get('/finance/sales/export', { params });
  },
};
