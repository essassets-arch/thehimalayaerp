import { SuperAdminService } from './super-admin.service';

// Isolated fixtures; never connects to the application database.
describe('Super admin dispatch analytics', () => {
  const row = (id: string, date: string | null, extra: any = {}): any => ({
    id, dispatchNo: id, salesOrderId: 'order', dispatchCategory: 'D1', status: 'DISPATCHED',
    dispatchedAt: date ? new Date(date) : null, createdAt: new Date('2026-08-01'),
    freightAmount: null, totalWeight: null, packageCount: 99,
    salesOrder: { id: 'order', customerId: 'customer', customer: { companyId: 'tenant', branchId: 'branch', companyName: 'Customer' }, items: [], sourceQuotation: null },
    items: [{ quantity: 3, salesOrderItemId: 'item', salesOrderItem: { productId: 'product', product: { name: 'Actual product', dispatchCategory: 'D1' } } }],
    ...extra,
  });
  function setup(rows: any[] = []) {
    const prisma: any = {};
    for (const model of ['dispatch', 'salesOrder', 'salesOrderAllocation', 'sampleRequest', 'replacementRequest', 'salesReturn', 'finishedGoods', 'stockHistory', 'branch', 'customer', 'product', 'user']) {
      prisma[model] = { findMany: jest.fn().mockResolvedValue([]) };
    }
    prisma.dispatch.findMany.mockImplementation(async ({ where }: any) => rows.filter(d => d.salesOrder.customer.companyId === where.salesOrder.customer.companyId));
    return { service: new SuperAdminService(prisma), prisma };
  }
  const range = { from: '2026-09-01', to: '2026-09-30' };

  it('scopes combined filters, uses India-time shipment dates and excludes drafts', async () => {
    const { service, prisma } = setup([
      row('first', '2026-08-31T18:30:00Z'), row('last', '2026-09-30T18:29:59Z'),
      row('october', '2026-09-30T18:30:00Z'), row('draft', null),
      row('foreign', '2026-09-15T00:00:00Z', { salesOrder: { customer: { companyId: 'other' } } }),
    ]);
    const result = await service.getDispatchAnalytics({ ...range, branchId: 'branch', customerId: 'customer' }, 'tenant');
    expect(result.dispatches.map(d => d.id)).toEqual(['first', 'last']);
    expect(result.dailyDispatch.summary.totalQuantity).toBe(6);
    expect(result.dailyDispatch.trends.reduce((n, d) => n + d.qty, 0)).toBe(6);
    expect(result.flow.inTransit.count).toBe(2);
    expect(result.categories.dispatch1.qtyDispatched).toBe(6);
    expect(prisma.salesOrder.findMany.mock.calls[0][0].where.customer).toEqual({ companyId: 'tenant', branchId: 'branch' });
    for (const model of ['salesOrderAllocation', 'replacementRequest', 'salesReturn']) {
      expect(prisma[model].findMany.mock.calls[0][0].where.salesOrder.customer.companyId).toBe('tenant');
    }
  });

  it('does not invent vehicle, driver, weight, freight, POD or SLA', async () => {
    const { service } = setup([row('unknown', '2026-09-01T12:00:00Z', { status: 'DELIVERED' })]);
    const report = await service.getDispatchAnalytics(range, 'tenant');
    expect(report.dispatches[0]).toMatchObject({ quantity: 3, packageCount: 99, totalWeight: null, freightAmount: null, vehicleNumber: 'Not recorded', driverName: 'Not recorded', podStatus: 'Not recorded', sla: 'Not recorded' });
    expect(report.transportCost.actualTransportCost).toBeNull();
    expect(report.transportCost.expectedTransportCost).toBeNull();
    expect(report.transportCost.varianceAmount).toBeNull();
    expect(report.delivery.summary.onTimeDeliveryRate).toBeNull();
    expect(report.categories.dispatch1.onTimePct).toBeNull();
  });

  it('excludes unknown SLA and counts split-order baselines and daily orders once', async () => {
    const first = row('on-time', '2026-09-01T12:00:00Z', { status: 'DELIVERED', freightAmount: 20, deliveredAt: new Date('2026-09-03'), eta: new Date('2026-09-04') });
    first.salesOrder.sourceQuotation = { expectedTransportationCost: 100 };
    const { service } = setup([first, { ...first, id: 'unknown', eta: null, freightAmount: 30 }]);
    const report = await service.getDispatchAnalytics(range, 'tenant');
    expect(report.transportCost.expectedTransportCost).toBe(100);
    expect(report.transportCost.actualTransportCost).toBe(50);
    expect(report.delivery.summary.onTimeDeliveryRate).toBe(100);
    expect(report.delivery.transporters[0].onTimePct).toBe(100);
    expect(report.dailyDispatch.trends.find(d => d.dispatches === 2)?.orders).toBe(1);
  });

  it('applies customer, category, transporter and status filters', async () => {
    const { service } = setup([row('match', '2026-09-01T12:00:00Z', { transporterName: 'Carrier' })]);
    for (const filter of [{ transporterId: 'Other' }, { dispatchStatus: 'DELIVERED' }, { customerId: 'other' }, { categoryId: 'D2' }]) {
      expect((await service.getDispatchAnalytics({ ...range, ...filter }, 'tenant')).dispatches).toEqual([]);
    }
  });

  it('supports all-time without fixed years, validates dates and propagates failures', async () => {
    const { service, prisma } = setup([row('old', '2019-01-01T12:00:00Z')]);
    expect((await service.getDispatchAnalytics({ period: 'All Time' }, 'tenant')).dailyDispatch.trends).toHaveLength(1);
    await expect(service.getDispatchAnalytics(range, '')).rejects.toThrow('Company context');
    await expect(service.getDispatchAnalytics({ from: '2026-02-30', to: '2026-03-01' }, 'tenant')).rejects.toThrow('Invalid date');
    prisma.dispatch.findMany.mockRejectedValueOnce(new Error('Database unavailable'));
    await expect(service.getDispatchAnalytics(range, 'tenant')).rejects.toThrow('Database unavailable');
  });
});
