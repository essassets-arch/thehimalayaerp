import { DispatchService } from './dispatch.service';

describe('DispatchService queue tenant isolation', () => {
  it('returns a handoff-stamped DISPATCHED work order from its tenant scoped dispatch queue', async () => {
    const handedOffWorkOrder = {
      id: 'work-order-a',
      workOrderNumber: 'WO-2026-00615',
      status: 'DISPATCHED',
      productionStatus: 'DISPATCHED',
      sentToDispatchAt: new Date('2026-10-13T10:00:00Z'),
      quantity: 4,
      salesOrderItemId: 'sales-order-item-a',
      salesOrderItem: {
        id: 'sales-order-item-a',
        productId: 'product-a',
        unit: 'PCS',
        product: { id: 'product-a', companyId: 'tenant-a', dispatchCategory: 'D1', isTrading: false },
      },
      productionPlan: {
        salesOrder: {
          id: 'sales-order-a',
          orderNumber: 'SO-2026-001',
          status: 'READY_FOR_DISPATCH',
          customer: { companyId: 'tenant-a', companyName: 'Tenant A Customer' },
        },
      },
    };
    const allocationFindMany = jest.fn().mockResolvedValue([]);
    const workOrderFindMany = jest.fn().mockResolvedValue([handedOffWorkOrder]);
    const finishedGoodsFindMany = jest.fn().mockResolvedValue([]);
    const salesOrderFindMany = jest.fn().mockResolvedValue([]);
    const service = new DispatchService({
      salesOrderAllocation: { findMany: allocationFindMany },
      workOrder: { findMany: workOrderFindMany },
      finishedGoods: { findMany: finishedGoodsFindMany },
      salesOrder: { findMany: salesOrderFindMany },
    } as any, {} as any, {} as any, {} as any);

    const queue = await service.getDispatchQueue('user-a', 'SUPER_ADMIN', 'tenant-a', 'D1');

    expect(queue).toHaveLength(1);
    expect(queue[0].items[0].workOrderId).toBe('work-order-a');
    expect(workOrderFindMany.mock.calls[0][0].where.AND[1]).toEqual({
      OR: [
        { salesOrderItem: { product: { companyId: 'tenant-a' } } },
        { salesOrderItem: { salesOrder: { customer: { companyId: 'tenant-a' } } } },
        { productionPlan: { salesOrder: { customer: { companyId: 'tenant-a' } } } },
      ],
    });
    expect(finishedGoodsFindMany.mock.calls[0][0].where.product).toEqual({ companyId: 'tenant-a' });
  });
});
