import { backendFetch } from '@/lib/backendFetch';

export const backendSamplesWriteRepository = {
  create: async (data: any, context?: any) => {
    const items = Array.isArray(data.items) && data.items.length > 0
      ? data.items.map((it: any) => ({
          productId: String(it.productId || it.product_id || it.id || 'PRD-1'),
          quantity: Number(it.quantity) || 1,
          specifications: String(it.specifications || it.specification || it.productName || it.product || '')
        }))
      : Array.isArray(data.products) && data.products.length > 0
      ? data.products.map((it: any) => ({
          productId: String(it.productId || it.product_id || it.id || 'PRD-1'),
          quantity: Number(it.quantity) || 1,
          specifications: String(it.specifications || it.specification || it.productName || it.product || '')
        }))
      : Array.isArray(data.sampleItems) && data.sampleItems.length > 0
      ? data.sampleItems.map((it: any) => ({
          productId: String(it.productId || it.product_id || it.id || 'PRD-1'),
          quantity: Number(it.quantity) || 1,
          specifications: String(it.specifications || it.specification || it.productName || it.product || '')
        }))
      : [{
          productId: String(data.productId || 'PRD-1'),
          quantity: Number(data.quantity) || 1,
          specifications: String(data.specifications || data.specification || data.product || 'Sample Item')
        }];

    const payload = {
      ...data,
      items,
      expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate).toISOString() : undefined,
    };

    return backendFetch<any>('/api/backend/sales/samples', {
      method: 'POST',
      body: payload,
      idempotencyKey: context?.idempotencyKey || String(Date.now()),
    });
  },

  update: async (id: string, data: any, context?: any) => {
    return backendFetch<any>(`/api/backend/sales/samples/${id}`, {
      method: 'PATCH',
      body: data,
      idempotencyKey: context?.idempotencyKey || String(Date.now()),
    });
  },

  updateStatus: async (id: string, status: string, expectedVersion: number, context?: any) => {
    return backendFetch<any>(`/api/backend/sales/samples/${id}/status`, {
      method: 'POST',
      body: { status, expectedVersion },
      idempotencyKey: context?.idempotencyKey || String(Date.now()),
    });
  }
};
