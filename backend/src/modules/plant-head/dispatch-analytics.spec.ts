import { dispatchAnalyticsPeriod, dispatchDay } from './dispatch-analytics-period';
import { PlantHeadService } from './plant-head.service';

describe('Dispatch analytics calendar', () => {
  it('uses exclusive India-time month boundaries', () => {
    const september = dispatchAnalyticsPeriod(undefined, undefined, undefined, '2026-09');
    const october = dispatchAnalyticsPeriod(undefined, undefined, undefined, '2026-10');
    expect(september.startDate.toISOString()).toBe('2026-08-31T18:30:00.000Z');
    expect(september.endDate).toEqual(october.startDate);
    expect(dispatchDay(october.startDate)).toBe('2026-10-01');
  });
  it('resolves current and previous months across year boundaries', () => {
    const now = new Date('2027-01-15T00:00:00Z');
    expect(dispatchAnalyticsPeriod('This Month', undefined, undefined, undefined, undefined, now).periodLabel).toBe('January 2027');
    expect(dispatchAnalyticsPeriod('Last Month', undefined, undefined, undefined, undefined, now).periodLabel).toBe('December 2026');
  });
  it('supports leap years and rejects invalid or reversed periods', () => {
    const period = dispatchAnalyticsPeriod(undefined, undefined, undefined, '2028-02');
    expect((period.endDate.getTime() - period.startDate.getTime()) / 86400000).toBe(29);
    expect(() => dispatchAnalyticsPeriod(undefined, undefined, undefined, '2026-13')).toThrow();
    expect(() => dispatchAnalyticsPeriod('Custom', '2026-02-30', '2026-03-01')).toThrow();
    expect(() => dispatchAnalyticsPeriod('Custom', '2026-10-02', '2026-10-01')).toThrow();
  });
});

describe('Dispatch analytics aggregation', () => {
  const item = (name: string, quantity: number) => ({ quantity, salesOrderItem: { product: { name }, specifications: {} } });
  const dispatch = (id: string, category: string, date: string, items: any[], companyId = 'tenant') => ({
    id, dispatchNo: id, dispatchCategory: category, dispatchedAt: new Date(date), createdAt: new Date('2026-09-01T00:00:00Z'),
    totalWeight: 100, freightAmount: null, packageCount: 999, items, status: 'DISPATCHED',
    salesOrder: { customerId: id, customer: { id, companyId, companyName: id }, salesExecutive: { name: 'Actual rep' } },
  });
  const rows = [
    dispatch('one', 'D1', '2026-09-15T00:00:00Z', [item('MHC', 2), item('RCS', 8)]),
    dispatch('two', 'D2', '2026-09-30T18:29:59Z', [item('Industrial tank', 3)]),
    dispatch('october', 'D2', '2026-09-30T18:30:00Z', [item('Industrial tank', 7)]),
    dispatch('foreign', 'D1', '2026-09-15T00:00:00Z', [item('MHC', 500)], 'other'),
    { ...dispatch('draft', 'D1', '2026-09-15T00:00:00Z', [item('MHC', 500)]), dispatchedAt: null },
  ];
  function setup() {
    const findMany = jest.fn(async ({ where }) => rows.filter(row => {
      if (row.salesOrder.customer.companyId !== where.salesOrder.customer.companyId || !row.dispatchedAt) return false;
      const range = where.dispatchedAt;
      return (!range.gte || row.dispatchedAt >= range.gte) && (!range.lt || row.dispatchedAt < range.lt);
    }));
    const prisma = { dispatch: { findMany }, salesOrder: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) } };
    return { service: new PlantHeadService(prisma as any, {} as any), findMany };
  }
  it('combines D1 and D2, scopes tenant, excludes drafts and counts actual quantities', async () => {
    const { service, findMany } = setup();
    const result = await service.getDispatchAnalytics('tenant', undefined, undefined, undefined, '2026-09');
    expect(result.summary.totalQuantity).toBe(13);
    expect(result.summary.totalTrips).toBe(2);
    expect(result.products.find(p => p.product === 'MHC')?.quantity).toBe(2);
    expect(result.products.find(p => p.product === 'RCS')?.quantity).toBe(8);
    expect(result.products.find(p => p.product === 'Industrial tank')?.quantity).toBe(3);
    expect(result.products.find(p => p.product === 'Mixed / unallocated')?.weight).toBe(100);
    expect(result.dispatchOrders[0].vehicle).toBe('Not recorded');
    expect(result.kpis.deliverySLA).toBe('Not available');
    for (const [query] of findMany.mock.calls) expect(query.where.salesOrder.customer.companyId).toBe('tenant');
    expect(result.products.reduce((sum, p) => sum + p.quantity, 0)).toBe(13);
    expect(result.products.reduce((sum, p) => sum + p.weight, 0)).toBe(200);
  });
  it('assigns a September-created October shipment only to October', async () => {
    const { service } = setup();
    const result = await service.getDispatchAnalytics('tenant', undefined, undefined, undefined, '2026-10');
    expect(result.summary.totalQuantity).toBe(7);
    expect(result.dispatchOrders.map(d => d.id)).toEqual(['october']);
  });
  it('returns truthful empty results and propagates database failures', async () => {
    const { service, findMany } = setup();
    expect((await service.getDispatchAnalytics('tenant', undefined, undefined, undefined, '2026-11')).hasData).toBe(false);
    expect((await service.getDispatchAnalytics('tenant', undefined, undefined, undefined, '2026-09', undefined, undefined, 'unknown')).hasData).toBe(false);
    findMany.mockRejectedValueOnce(new Error('Database unavailable'));
    await expect(service.getDispatchAnalytics('tenant')).rejects.toThrow('Database unavailable');
    await expect(service.getDispatchAnalytics('')).rejects.toThrow('Company is required');
  });
});
