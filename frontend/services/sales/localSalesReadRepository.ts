import { SalesReadRepository, SalesOrderListParams, SalesOrderListResponse, SalesOrder, SalesOrderTimelineEvent } from './salesReadRepository';
import { useERPStore } from '@/store/erpStore';

// Temporary local stub that reads from Zustand
export const localSalesReadRepository: SalesReadRepository = {
  async listOrders(params?: SalesOrderListParams): Promise<SalesOrderListResponse> {
    const store: any = useERPStore.getState();
    const orders = store.state?.sales?.orders || store.sales?.orders || [];
    
    // Convert old structure to SalesOrder interface loosely for UI compatibility
    const mapped: SalesOrder[] = orders.map((o: any) => ({
      id: o.id || o.orderNo || '',
      orderId: o.orderNo || o.id || '',
      customerId: o.customerId || '',
      customerName: o.customerName || (typeof o.customer === 'string' ? o.customer : o.customer?.name) || '',
      customerCode: null,
      items: (o.items || o.detailedItems || []).map((it: any) => ({
        id: it.id || '',
        productId: it.productId || '',
        productName: it.productName || it.name || '',
        productCode: it.code || null,
        orderedQuantity: it.quantity || it.qty || 1,
        unit: 'PCS',
        unitPrice: it.price || it.unitPrice || 0,
        lineTotal: (it.quantity || 1) * (it.price || it.unitPrice || 0),
        deliveredQuantity: 0,
        returnedQuantity: 0,
        replacedQuantity: 0,
      })),
      subtotal: o.totalAmount || 0,
      taxAmount: 0,
      totalAmount: o.totalAmount || o.grandTotal || 0,
      orderStatus: o.orderStatus || o.status || 'CONFIRMED',
      creditStatus: o.creditStatus || 'PENDING',
      allocationStatus: o.allocationStatus || 'NOT_ALLOCATED',
      productionStatus: o.productionStatus || o.overallStage || 'NOT_REQUIRED',
      qcStatus: o.qcStatus || 'NOT_REQUIRED',
      dispatchStatus: o.dispatchStatus || 'NOT_READY',
      invoiceStatus: o.invoiceStatus || 'PENDING',
      paymentStatus: o.paymentStatus || 'NOT_DUE',
      closureStatus: o.closureStatus || 'OPEN',
      createdAt: o.createdAt || new Date().toISOString(),
      updatedAt: o.updatedAt || new Date().toISOString(),
    }));

    return {
      data: mapped,
      pagination: {
        page: 1,
        pageSize: mapped.length || 25,
        total: mapped.length,
        totalPages: 1,
      }
    };
  },

  async getOrder(orderId: string): Promise<SalesOrder> {
    throw new Error('Not implemented locally');
  },

  async getOrderTimeline(orderId: string): Promise<SalesOrderTimelineEvent[]> {
    throw new Error('Not implemented locally');
  }
};
