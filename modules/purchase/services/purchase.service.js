import { apiClient } from '../../../lib/apiClient';

// ===================== VENDOR API =====================
export const getVendors = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await apiClient.get(`/purchase/vendors?${params}`);
  return response.data;
};

export const getVendorById = async (id) => {
  const response = await apiClient.get(`/purchase/vendors/${id}`);
  return response.data;
};

export const createVendor = async (data) => {
  const response = await apiClient.post('/purchase/vendors', data);
  return response.data;
};

export const updateVendor = async (id, data) => {
  const response = await apiClient.put(`/purchase/vendors/${id}`, data);
  return response.data;
};

export const deleteVendor = async (id) => {
  const response = await apiClient.delete(`/purchase/vendors/${id}`);
  return response.data;
};

// ===================== PURCHASE ORDER API =====================
export const getPurchaseOrders = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await apiClient.get(`/purchase/orders?${params}`);
  return response.data;
};

export const getPurchaseOrderById = async (id) => {
  const response = await apiClient.get(`/purchase/orders/${id}`);
  return response.data;
};

export const createPurchaseOrder = async (data) => {
  const response = await apiClient.post('/purchase/orders', data);
  return response.data;
};

export const updatePurchaseOrder = async (id, data) => {
  const response = await apiClient.put(`/purchase/orders/${id}`, data);
  return response.data;
};

export const deletePurchaseOrder = async (id) => {
  const response = await apiClient.delete(`/purchase/orders/${id}`);
  return response.data;
};

// ===================== GRN API =====================
export const getGRNs = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await apiClient.get(`/purchase/grns?${params}`);
  return response.data;
};

export const getGRNById = async (id) => {
  const response = await apiClient.get(`/purchase/grns/${id}`);
  return response.data;
};

export const createGRN = async (data) => {
  const response = await apiClient.post('/purchase/grns', data);
  return response.data;
};

export const updateGRN = async (id, data) => {
  const response = await apiClient.put(`/purchase/grns/${id}`, data);
  return response.data;
};

export const updateInventoryFromGRN = async (id) => {
  const response = await apiClient.post(`/purchase/grns/${id}/update-inventory`);
  return response.data;
};

export const deleteGRN = async (id) => {
  const response = await apiClient.delete(`/purchase/grns/${id}`);
  return response.data;
};

// ===================== HELPER API =====================
export const getProducts = async () => {
  const response = await apiClient.get('/purchase/products');
  return response.data;
};

export const getWarehouses = async () => {
  const response = await apiClient.get('/purchase/warehouses');
  return response.data;
};
