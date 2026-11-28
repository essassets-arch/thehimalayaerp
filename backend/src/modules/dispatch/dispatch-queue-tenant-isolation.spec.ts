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

  it('normalizes user.dispatchCategory "Category 1" to D1 so Dispatch 1 queue never returns empty', async () => {
    const handedOffWorkOrder = {
      id: 'work-order-d1',
      workOrderNumber: 'WO-2026-00999',
      status: 'READY_FOR_DISPATCH',
      productionStatus: 'READY_FOR_DISPATCH',
      sentToDispatchAt: new Date('2026-10-13T10:00:00Z'),
      quantity: 10,
      salesOrderItemId: 'soi-1',
      salesOrderItem: {
        id: 'soi-1',
        productId: 'prod-1',
        orderedQuantity: 10,
        unit: 'PCS',
        product: { id: 'prod-1', companyId: 'tenant-a', dispatchCategory: 'D1', isTrading: false },
      },
      productionPlan: {
        salesOrder: {
          id: 'so-1',
          orderNumber: 'SO-2026-999',
          status: 'READY_FOR_DISPATCH',
          customer: { companyId: 'tenant-a', companyName: 'D1 Client' },
        },
      },
    };
    const service = new DispatchService({
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'u-d1', email: 'ravikant.t@himalayaerp.com', dispatchCategory: 'Category 1' }) },
      salesOrderAllocation: { findMany: jest.fn().mockResolvedValue([]) },
      workOrder: { findMany: jest.fn().mockResolvedValue([handedOffWorkOrder]) },
      finishedGoods: { findMany: jest.fn().mockResolvedValue([]) },
      salesOrder: { findMany: jest.fn().mockResolvedValue([]) },
      dispatchItem: { groupBy: jest.fn().mockResolvedValue([]) },
    } as any, {} as any, {} as any, {} as any);

    const queue = await service.getDispatchQueue('u-d1', 'Dispatch Executive', 'tenant-a');
    expect(Array.isArray(queue)).toBe(true);
    expect(queue).toHaveLength(1);
    expect((queue as any)[0].items[0].remainingQuantity).toBe(10);
  });

  it('batches finished-goods-history lookup in 1 query instead of N+1 findFirst queries', async () => {
    const fgFindMany = jest.fn().mockResolvedValue([
      { productId: 'p1', availableQuantity: 20, product: { sku: 'SKU-1' } },
      { productId: 'p2', availableQuantity: 5, product: { sku: 'SKU-2' } },
    ]);
    const fgFindFirst = jest.fn();
    const service = new DispatchService({
      dispatch: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'd1',
            dispatchNo: 'DISP-1',
            salesOrderId: 'so1',
            vehicleNumber: 'GJ01',
            dispatchedAt: new Date(),
            createdAt: new Date(),
            createdById: 'u1',
            salesOrder: { orderNumber: 'SO-1', customer: { companyName: 'Acme' } },
            items: [
              { id: 'i1', quantity: 4, salesOrderItem: { productId: 'p1', productNameSnapshot: 'Prod 1', product: { id: 'p1', name: 'Prod 1', sku: 'SKU-1', category: 'FRP', unit: 'PCS' } } },
              { id: 'i2', quantity: 2, salesOrderItem: { productId: 'p2', productNameSnapshot: 'Prod 2', product: { id: 'p2', name: 'Prod 2', sku: 'SKU-2', category: 'FRP', unit: 'PCS' } } },
            ],
          },
        ]),
      },
      stockHistory: { findMany: jest.fn().mockResolvedValue([]) },
      finishedGoods: { findMany: fgFindMany, findFirst: fgFindFirst },
      product: { findMany: jest.fn().mockResolvedValue([]) },
    } as any, {} as any, {} as any, {} as any);

    const res: any = await service.getFinishedGoodsHistory({ page: 1, limit: 10 });
    expect(fgFindFirst).not.toHaveBeenCalled();
    expect(fgFindMany).toHaveBeenCalledTimes(1);
    expect(res.data).toHaveLength(2);
    expect(res.pagination.total).toBe(2);
    expect(res.data[0].quantityAfter).toBe(20);
    expect(res.data[0].quantityBefore).toBe(24);
  });

  it('supports server-side pagination and slim select in listDispatches', async () => {
    const findMany = jest.fn().mockResolvedValue([
      {
        id: 'd-1',
        dispatchNo: 'DISP-101',
        status: 'DELIVERED',
        deliveryAddress: 'Ahmedabad',
        salesOrder: { orderNumber: 'SO-101', customer: { companyName: 'Alpha Infra' } },
        items: [],
      },
    ]);
    const count = jest.fn().mockResolvedValue(451);
    const service = new DispatchService({
      dispatch: { findMany, count },
    } as any, {} as any, {} as any, {} as any);

    const result: any = await service.listDispatches('u1', 'SUPER_ADMIN', 'DELIVERED', 'D1', {
      page: 2,
      limit: 25,
      search: 'Alpha',
    });

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 25, take: 25 }));
    expect(result.data).toHaveLength(1);
    expect(result.pagination).toEqual({ page: 2, limit: 25, total: 451, totalPages: 19 });
  });

  it('returns trading products sales orders in Dispatch 2 queue for confirmed or active orders', async () => {
    const tradingSalesOrder = {
      id: 'so-trading-1',
      orderNumber: 'SO-TRADING-2026-001',
      status: 'CONFIRMED',
      orderDate: new Date('2026-11-20T10:00:00Z'),
      createdAt: new Date('2026-11-20T10:00:00Z'),
      requestedDeliveryDate: new Date('2026-11-25T10:00:00Z'),
      freightAmount: 0,
      customer: { companyName: 'Trading Client Ltd', phone: '9876543210' },
      salesExecutive: { id: 'sales-1', name: 'Sales Exec', email: 'sales1@himalayaerp.com' },
      items: [
        {
          id: 'soi-trading-1',
          productId: 'prod-trading-1',
          orderedQuantity: 50,
          unit: 'PCS',
          productCodeSnapshot: 'WCB-40MM',
          productNameSnapshot: 'Wire Cover Block 40MM',
          product: {
            id: 'prod-trading-1',
            name: 'Wire Cover Block 40MM',
            sku: 'WCB-40MM',
            category: 'COVERBLOCK',
            isTrading: true,
            dispatchCategory: 'D2',
            unit: 'PCS',
          },
          workOrders: [],
        },
      ],
      productionPlans: [],
    };

    const service = new DispatchService({
      salesOrderAllocation: { findMany: jest.fn().mockResolvedValue([]) },
      workOrder: { findMany: jest.fn().mockResolvedValue([]) },
      finishedGoods: { findMany: jest.fn().mockResolvedValue([]) },
      salesOrder: { findMany: jest.fn().mockResolvedValue([tradingSalesOrder]) },
      dispatchItem: { groupBy: jest.fn().mockResolvedValue([]) },
    } as any, {} as any, {} as any, {} as any);

    const queue: any = await service.getDispatchQueue('u-sahad', 'DISPATCH_2', 'tenant-a', 'D2');
    expect(Array.isArray(queue)).toBe(true);
    expect(queue).toHaveLength(1);
    expect(queue[0].salesOrderId).toBe('so-trading-1');
    expect(queue[0].customerName).toBe('Trading Client Ltd');
    expect(queue[0].customer.companyName).toBe('Trading Client Ltd');
    expect(queue[0].items[0].productName).toBe('Wire Cover Block 40MM');
    expect(queue[0].items[0].dispatchCategory).toBe('D2');
    expect(queue[0].items[0].isTrading).toBe(true);
    expect(queue[0].items[0].remainingQuantity).toBe(50);
  });

  it('resolves actual customer name from lead/quotation or address JSON and never defaults to "Trading Customer"', async () => {
    const tradingSalesOrderWithLead = {
      id: 'so-trading-2',
      orderNumber: 'SO-TRADING-2026-002',
      status: 'CONFIRMED',
      orderDate: new Date('2026-11-20T10:00:00Z'),
      createdAt: new Date('2026-11-20T10:00:00Z'),
      customer: null,
      sourceQuotation: {
        lead: {
          companyName: 'Apex Builders & Infra',
        },
      },
      items: [
        {
          id: 'soi-trading-2',
          productId: 'prod-trading-2',
          orderedQuantity: 100,
          unit: 'PCS',
          productCodeSnapshot: 'FRC-600',
          productNameSnapshot: 'FRC Chamber Cover 600',
          product: {
            id: 'prod-trading-2',
            name: 'FRC Chamber Cover 600',
            sku: 'FRC-600',
            category: 'FRC COVER',
            isTrading: true,
            dispatchCategory: 'D2',
            unit: 'PCS',
          },
          workOrders: [],
        },
      ],
      productionPlans: [],
    };

    const service = new DispatchService({
      salesOrderAllocation: { findMany: jest.fn().mockResolvedValue([]) },
      workOrder: { findMany: jest.fn().mockResolvedValue([]) },
      finishedGoods: { findMany: jest.fn().mockResolvedValue([]) },
      salesOrder: { findMany: jest.fn().mockResolvedValue([tradingSalesOrderWithLead]) },
      dispatchItem: { groupBy: jest.fn().mockResolvedValue([]) },
    } as any, {} as any, {} as any, {} as any);

    const queue: any = await service.getDispatchQueue('u-sahad', 'DISPATCH_2', 'tenant-a', 'D2');
    expect(queue).toHaveLength(1);
    expect(queue[0].customerName).toBe('Apex Builders & Infra');
    expect(queue[0].customer.companyName).toBe('Apex Builders & Infra');
    expect(queue[0].customerName).not.toBe('Trading Customer');
  });
});
