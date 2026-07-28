import {
  SalesReadRepository,
  SalesOrderListParams,
  SalesOrderListResponse,
  SalesOrder,
  SalesOrderTimelineEvent,
} from './salesReadRepository';
import {
  normalizeSalesOrder,
  normalizeSalesOrderTimelineEvent,
  normalizePagination,
} from './salesOrderMapper';

export const backendSalesReadRepository: SalesReadRepository = {
  async listOrders(params: SalesOrderListParams = {}): Promise<SalesOrderListResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set('page', String(params.page));
    if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
    if (params.search) searchParams.set('search', params.search);
    if (params.orderStatus) searchParams.set('orderStatus', params.orderStatus);
    if (params.productionStatus) searchParams.set('productionStatus', params.productionStatus);
    if (params.dispatchStatus) searchParams.set('dispatchStatus', params.dispatchStatus);
    if (params.paymentStatus) searchParams.set('paymentStatus', params.paymentStatus);
    if (params.closureStatus) searchParams.set('closureStatus', params.closureStatus);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('himalaya_token') : null;
    
    const response = await fetch(
      `/api/backend/sales/orders?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
      },
    );

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(
        body.message || `Unable to load sales orders: ${response.status}`,
      );
      Object.assign(error, { status: response.status, code: body.code });
      throw error;
    }

    return {
      data: Array.isArray(body.data?.data)
        ? body.data.data.map(normalizeSalesOrder)
        : Array.isArray(body.data) 
          ? body.data.map(normalizeSalesOrder) 
          : [],
      pagination: normalizePagination(body.data?.pagination || body.pagination),
    };
  },

  async getOrder(orderId: string): Promise<SalesOrder> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('himalaya_token') : null;
    const response = await fetch(`/api/backend/sales/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(
        body.message || `Unable to load sales order: ${response.status}`,
      );
      Object.assign(error, { status: response.status, code: body.code });
      throw error;
    }

    return normalizeSalesOrder(body.data);
  },

  async getOrderTimeline(orderId: string): Promise<SalesOrderTimelineEvent[]> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('himalaya_token') : null;
    const response = await fetch(`/api/backend/sales/orders/${orderId}/timeline`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(
        body.message || `Unable to load sales order timeline: ${response.status}`,
      );
      Object.assign(error, { status: response.status, code: body.code });
      throw error;
    }

    return Array.isArray(body.data) ? body.data.map(normalizeSalesOrderTimelineEvent) : [];
  },
};
