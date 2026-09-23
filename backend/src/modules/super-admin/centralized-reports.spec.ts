import { businessReportPeriod, centralizedCsv, loadCentralizedReport, reportSections } from './centralized-reports';

describe('Centralized business reports, isolated database fixtures', () => {
  const now = new Date('2026-09-23T12:00:00Z');
  const date = new Date('2026-09-10T12:00:00Z');
  const query = { rangePreset: 'THIS_MONTH' };
  function setup() {
    const db: any = {};
    for (const name of ['branch', 'customer', 'supplier', 'product', 'warehouse', 'salesOrder', 'customerPayment', 'salesInvoice', 'lead', 'quotation', 'sampleRequest', 'workOrder', 'qCInspection', 'materialRequest', 'purchaseIndent', 'purchaseOrder', 'rawMaterial', 'inventoryTransaction', 'employee', 'department', 'user', 'payrollRecord', 'dispatch']) {
      db[name] = { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) };
    }
    db.customer.findMany.mockResolvedValue([{ id: 'customer', companyName: 'Actual customer', branchId: 'branch' }]);
    return db;
  }
  it('returns genuine zero counts and unavailable ratios without seeded metrics', async () => {
    const report = await loadCentralizedReport(setup(), query, 'tenant', now);
    expect(report.sales.totalOrders).toBe(0);
    expect(report.sales.totalOrdersChangePercent).toBeNull();
    expect(report.production).toMatchObject({ workOrdersReleased: 0, batchesCompleted: 0, shopFloorYield: null, avgBatchDelayDays: null });
    expect(report.plantHead).toMatchObject({ materialRequestsPending: 0, scheduleAdherence: null, avgApprovalTatDays: null });
    expect(report.store).toMatchObject({ totalRawStockItems: 0, rawInventoryValue: 0 });
    expect(report.qc).toMatchObject({ approvedPassed: 0, rejectedFailed: 0, firstPassYield: null, defectRate: null });
    expect(report.dispatch).toMatchObject({ shipmentsDispatched: 0, onTimeDeliveryRate: null, podConfirmations: 0 });
    expect(report.finance).toMatchObject({ invoicesVerified: 0, outstandingReceivables: 0, collectionEfficiency: null });
    expect(report.hr).toMatchObject({ totalEmployees: 0, monthlyPayrollOutflow: 0 });
  });

  it('uses India-time calendar boundaries, equal prior ranges, and ignores stale custom dates for presets', () => {
    const month = businessReportPeriod({ ...query, startDate: '2020-01-01', endDate: '2020-02-01' }, now);
    expect(month.start.toISOString()).toBe('2026-08-31T18:30:00.000Z');
    expect(month.end.toISOString()).toBe('2026-09-23T18:29:59.999Z');
    const week = businessReportPeriod({ rangePreset: 'LAST_WEEK' }, new Date('2026-09-27T12:00:00Z'));
    expect(week.period.startDate).toBe('2026-09-14');
    expect(week.period.endDate).toBe('2026-09-20');
    expect(() => businessReportPeriod({ rangePreset: 'CUSTOM', startDate: '2026-02-30', endDate: '2026-03-01' }, now)).toThrow();
    expect(() => businessReportPeriod({ rangePreset: 'CUSTOM' }, now)).toThrow();
    expect(() => businessReportPeriod({ rangePreset: 'CUSTOM', startDate: '2026-09-30', endDate: '2026-09-01' }, now)).toThrow();
  });

  it('propagates database failures instead of producing successful zero reports', async () => {
    const db = setup(); db.qCInspection.findMany.mockRejectedValue(new Error('QC database unavailable'));
    await expect(loadCentralizedReport(db, query, 'tenant', now)).rejects.toThrow('QC database unavailable');
    await expect(loadCentralizedReport(db, query, '', now)).rejects.toThrow('Company context');
  });

  it('includes historical records in All Time without inventing a comparison period', async () => {
    const db = setup();
    db.salesOrder.findMany.mockResolvedValue([{ id: 'old-order', status: 'CONFIRMED' }]);
    db.customerPayment.findMany.mockResolvedValue([{ receivedAt: new Date('2010-01-01'), amount: 125, status: 'VERIFIED', allocations: [] }]);
    const report = await loadCentralizedReport(db, { rangePreset: 'ALL_TIME' }, 'tenant', now);
    expect(report.sales).toMatchObject({ totalOrders: 1, revenueCollected: 125, totalOrdersChangePercent: null });
    expect(report.period).toMatchObject({ startDate: 'all-time', comparisonStartDate: null, comparisonEndDate: null });
    expect(db.salesOrder.count).not.toHaveBeenCalled();
    expect(db.salesOrder.findMany.mock.calls[0][0].where.orderDate).toEqual({});
  });

  it('uses real QC outcomes in the same period and first inspections across rework', async () => {
    const db = setup();
    db.qCInspection.findMany.mockResolvedValue([
      { id: 'old', workOrderId: 'reworked', createdAt: new Date('2026-08-01'), status: 'FAILED', approvedQuantity: 0, rejectedQuantity: 10 },
      { id: 'retry', workOrderId: 'reworked', createdAt: date, status: 'PASSED', approvedQuantity: 10, rejectedQuantity: 0 },
      { id: 'fail', workOrderId: 'failed', createdAt: date, status: 'FAILED', approvedQuantity: 0, rejectedQuantity: 5 },
      { id: 'pass', workOrderId: 'passed', createdAt: date, status: 'APPROVED', approvedQuantity: 5, rejectedQuantity: 0 },
      { id: 'pending', workOrderId: 'pending', createdAt: date, status: 'PENDING', approvedQuantity: null, rejectedQuantity: null },
    ]);
    const report = await loadCentralizedReport(db, query, 'tenant', now);
    expect(report.qc).toMatchObject({ totalSamplesLogged: 4, approvedPassed: 2, rejectedFailed: 1, underTesting: 1, firstPassYield: 50, defectRate: 25 });
    expect(report.production.qcFailuresOrRework).toBe(1);
    expect(report.production.shopFloorYield).toBe(75);
  });

  it('does not substitute order balances for receipts or count orders as invoices', async () => {
    const db = setup();
    db.salesOrder.findMany.mockResolvedValue([{ status: 'CONFIRMED', totalAmount: 999999, paidAmount: 99999 }]);
    let report = await loadCentralizedReport(db, query, 'tenant', now);
    expect(report.sales.revenueCollected).toBe(0);
    expect(report.finance.invoicesVerified).toBe(0);
    expect(report.finance.outstandingReceivables).toBe(0);
    db.customerPayment.findMany.mockResolvedValue([{ receivedAt: date, amount: 80, status: 'VERIFIED', allocations: [{ amount: 30 }] }]);
    db.salesInvoice.findMany.mockResolvedValue([{ createdAt: date, totalAmount: 100, paymentAllocations: [{ amount: 30, payment: { status: 'VERIFIED' } }, { amount: 40, payment: { status: 'REJECTED' } }] }]);
    report = await loadCentralizedReport(db, query, 'tenant', now);
    expect(report.finance).toMatchObject({ revenueCollected: 80, outstandingReceivables: 70, advancePaymentsHeld: 50, invoicesVerified: 1, collectionEfficiency: 30 });
  });

  it('uses dispatch item values without counting a whole order per split shipment and requires real POD/SLA', async () => {
    const db = setup();
    const dispatch = { status: 'DELIVERED', freightAmount: 15, deliveredQuantity: 2, deliveredAt: date, eta: new Date('2026-09-11'), salesOrder: {}, items: [{ quantity: 2, salesOrderItem: { unitPrice: 25 } }], podStatus: null };
    db.dispatch.findMany.mockResolvedValue([dispatch, { ...dispatch, deliveredQuantity: 1, items: [{ quantity: 1, salesOrderItem: { unitPrice: 25 } }], eta: null, podStatus: 'APPROVED' }]);
    const report = await loadCentralizedReport(db, query, 'tenant', now);
    expect(report.dispatch).toMatchObject({ shipmentsDispatched: 2, totalDeliveredValue: 75, totalFreightCost: 30, podConfirmations: 1, onTimeDeliveryRate: 100 });
    db.dispatch.findMany.mockResolvedValue([{ ...dispatch, freightAmount: null, eta: null, deliveredQuantity: null }]);
    expect((await loadCentralizedReport(db, query, 'tenant', now)).dispatch).toMatchObject({ totalDeliveredValue: null, totalFreightCost: null, onTimeDeliveryRate: null });
  });

  it('scopes all operational queries and passes real vendor, branch and product filters', async () => {
    const db = setup();
    await loadCentralizedReport(db, { ...query, branchId: 'branch', customerId: 'customer', productId: 'product', vendorId: 'vendor' }, 'tenant', now);
    const salesWhere = db.salesOrder.findMany.mock.calls[0][0].where;
    expect(salesWhere.customer.companyId).toBe('tenant');
    expect(salesWhere.customerId.in).toEqual(['customer']);
    expect(salesWhere.items.some.productId).toBe('product');
    expect(db.dispatch.findMany.mock.calls[0][0].where.dispatchedAt).toBeDefined();
    expect(db.workOrder.findMany.mock.calls[0][0].where.productionPlan.salesOrder.customer.companyId).toBe('tenant');
    expect(db.materialRequest.findMany.mock.calls[0][0].where).toMatchObject({ companyId: 'tenant', branchId: 'branch' });
    expect(db.purchaseOrder.findMany.mock.calls[0][0].where.supplierId).toBe('vendor');
    for (const model of ['rawMaterial', 'inventoryTransaction', 'employee', 'payrollRecord']) expect(db[model].findMany.mock.calls[0][0].where.companyId).toBe('tenant');
  });

  it('counts employees separately from users and never estimates payroll from headcount', async () => {
    const db = setup(); db.employee.findMany.mockResolvedValue([{ status: 'CONFIRMED' }, { status: 'INACTIVE' }]); db.user.count.mockResolvedValue(32);
    const report = await loadCentralizedReport(db, query, 'tenant', now);
    expect(report.hr).toMatchObject({ totalEmployees: 2, currentlyActive: 1, monthlyPayrollOutflow: 0, erpSystemUsers: 32 });
  });

  it('merges raw product mirrors and uses recorded stock movements without invented prices', async () => {
    const db = setup();
    db.rawMaterial.findMany.mockResolvedValue([{ id: 'raw', sku: 'RESIN', unit: 'KG', minimumStock: 10 }]);
    db.product.findMany.mockResolvedValue([{ id: 'product', name: 'Resin', sku: 'RESIN', unit: 'kg', productType: 'RAW_MATERIAL', minimumStock: 10 }]);
    db.inventoryTransaction.findMany.mockResolvedValue([{ productId: 'product', type: 'IN', quantity: 8, createdAt: date }, { rawMaterialId: 'raw', type: 'OUT', quantity: 3, createdAt: date }]);
    db.purchaseOrder.findMany.mockResolvedValue([{ totalAmount: 100000 }]);
    const report = await loadCentralizedReport(db, query, 'tenant', now);
    expect(report.store).toMatchObject({ totalRawStockItems: 1, lowStockAlerts: 1, materialIssuances: 1, rawInventoryValue: null });
  });

  it('exports exactly the selected department metrics, retaining nulls, scope and UTF-8 BOM', async () => {
    const report = await loadCentralizedReport(setup(), query, 'tenant', now);
    const sections = reportSections(report, 'Plant Head');
    const csv = centralizedCsv({ ...report, sections });
    expect(sections).toHaveLength(1);
    expect(csv.content.startsWith('\uFEFF')).toBe(true);
    expect(csv.content).toContain('"Plant Head","Completed Work Orders On Schedule","Not recorded"');
    expect(csv.content).not.toContain('"Sales & CRM"');
    expect(() => reportSections(report, 'Unknown')).toThrow('Unknown department');
    expect(reportSections(report)).toHaveLength(8);
  });
});
