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
import { backendFetch } from '@/lib/backendFetch';

type SalesOrderListPayload = {
  data?: unknown[];
  pagination?: unknown;
};

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

    const body = await backendFetch<SalesOrderListPayload | unknown[]>(
      `/api/backend/sales/orders?${searchParams.toString()}`,
    );

    return {
      data: !Array.isArray(body) && Array.isArray(body.data)
        ? body.data.map(normalizeSalesOrder)
        : Array.isArray(body)
          ? body.map(normalizeSalesOrder)
          : [],
      pagination: normalizePagination(Array.isArray(body) ? undefined : body.pagination),
    };
  },

  async getOrder(orderId: string): Promise<SalesOrder> {
    const order = await backendFetch<unknown>(`/api/backend/sales/orders/${orderId}`);
    return normalizeSalesOrder(order);
  },

  async getOrderTimeline(orderId: string): Promise<SalesOrderTimelineEvent[]> {
    const timeline = await backendFetch<unknown>(
      `/api/backend/sales/orders/${orderId}/timeline`,
    );
    return Array.isArray(timeline) ? timeline.map(normalizeSalesOrderTimelineEvent) : [];
  },
};
