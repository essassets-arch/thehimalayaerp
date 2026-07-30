import { useAuthStore } from '../store/authStore';

const API_BASE = '/api/backend/brand-analysis';
const UPLOAD_API = '/api/backend/uploads/brand-analysis';

export interface BrandAnalysisRequest {
  id: string;
  requestNo: string;
  productName: string;
  brandName: string;
  quantity: number;
  quantityUnit: string;
  imageUrl: string;
  reason: string;
  status: string;
  version: number;
  createdAt: string;
  [key: string]: any;
}

const getHeaders = () => {
  const token = useAuthStore.getState().accessToken;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorData.error || errorMsg;
    } catch (e) {
      // Ignore
    }
    throw new Error(errorMsg);
  }
  const json = await response.json();
  return json.data !== undefined ? json.data : json;
};

export const brandAnalysisService = {
  async getStoreRequests(): Promise<BrandAnalysisRequest[]> {
    const res = await fetch(`${API_BASE}/my-requests`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getSuperAdminRequests(): Promise<BrandAnalysisRequest[]> {
    const res = await fetch(`${API_BASE}/super-admin/requests`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getFinanceRequests(): Promise<BrandAnalysisRequest[]> {
    const res = await fetch(`${API_BASE}/finance/requests`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getRequestById(id: string): Promise<BrandAnalysisRequest> {
    const res = await fetch(`${API_BASE}/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async createRequest(data: any): Promise<BrandAnalysisRequest> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async approveRequest(id: string, version: number, remarks?: string): Promise<BrandAnalysisRequest> {
    const res = await fetch(`${API_BASE}/${id}/approve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ version, remarks })
    });
    return handleResponse(res);
  },

  async rejectRequest(id: string, version: number, reason: string): Promise<BrandAnalysisRequest> {
    const res = await fetch(`${API_BASE}/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ version, reason })
    });
    return handleResponse(res);
  },

  async startAnalysis(id: string, version: number, remarks?: string): Promise<BrandAnalysisRequest> {
    const res = await fetch(`${API_BASE}/${id}/start-analysis`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ version, remarks })
    });
    return handleResponse(res);
  },

  async completeAnalysis(id: string, version: number, data: any): Promise<BrandAnalysisRequest> {
    const res = await fetch(`${API_BASE}/${id}/complete-analysis`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ version, ...data })
    });
    return handleResponse(res);
  },

  async uploadImage(file: File): Promise<{ url: string; originalName: string }> {
    const token = useAuthStore.getState().accessToken;
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(UPLOAD_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    return handleResponse(res);
  }
};
