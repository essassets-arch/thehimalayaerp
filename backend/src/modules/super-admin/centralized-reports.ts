import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { employedStatuses, hrDay, hrPeriod } from './hr-analytics';
import { materialMovement, materialUnit } from '../inventory/raw-material-read-model';

const ratio = (n: number, d: number) => d ? Number((100 * n / d).toFixed(1)) : null;
const sum = (rows: any[], field: string) => rows.reduce((n, row) => n + Number(row[field] ?? 0), 0);
const confirmed = ['CONFIRMED', 'SENT_TO_PLANT', 'SENT_TO_PLANT_HEAD', 'PLANT_APPROVED', 'READY_FOR_PRODUCTION', 'IN_PRODUCTION', 'READY_FOR_DISPATCH', 'COMPLETED'];
const delivered = ['DELIVERED', 'POD_RECEIVED', 'DISPATCH_CLOSED'];
const settledPayments = ['VERIFIED', 'PARTIALLY_ALLOCATED', 'ALLOCATED'];

const definitions = [
  ['sales', 'Sales & CRM', 'Sales & CRM Performance', [
    ['totalOrders', 'Confirmed Orders in Period', 'Orders'], ['totalOrdersChangePercent', 'Change vs Equal-Length Prior Period', '%'],
    ['revenueCollected', 'Verified Receipts in Period', 'INR'], ['leadsInFunnel', 'Open Leads Created in Period', 'Leads'],
    ['activeQuotations', 'Unconverted Quotes Created in Period', 'Quotes'], ['samplesPending', 'Pending Samples Requested in Period', 'Samples'], ['ordersClosedOrDispatched', 'Completed Orders from Period', 'Orders'],
  ]],
  ['production', 'Production Floor', 'Production Floor Telemetry', [
    ['workOrdersReleased', 'Work Orders Created in Period', 'Orders'], ['currentlyRunning', 'Currently Running', 'Orders'], ['batchesCompleted', 'Work Orders Completed in Period', 'Orders'],
    ['qcFailuresOrRework', 'Work Orders with Failed / Rework Inspections', 'Orders'], ['avgBatchDelayDays', 'Average Delay vs Planned End', 'Days'], ['shopFloorYield', 'Recorded QC Quantity Yield', '%'],
  ]],
  ['plantHead', 'Plant Head', 'Plant Head Approvals', [
    ['materialRequestsPending', 'Material Requests Pending Now', 'Requests'], ['materialRequestsApproved', 'Material Requests Approved in Period', 'Requests'], ['poApprovalsPending', 'POs Pending Plant Approval Now', 'POs'],
    ['totalClearancesIssued', 'Requests from Period with Issued Material', 'Requests'], ['scheduleAdherence', 'Completed Work Orders On Schedule', '%'], ['avgApprovalTatDays', 'Average Material Approval Time', 'Days'],
  ]],
  ['store', 'Store / Procurement', 'Store Raw Inventory', [
    ['totalRawStockItems', 'Active Raw Material Records', 'Materials'], ['rawInventoryValue', 'Raw Inventory Valuation', 'INR'], ['lowStockAlerts', 'Recorded Stock Below Minimum', 'Items'],
    ['poRequestsRaised', 'Purchase Indents Raised in Period', 'Requests'], ['materialIssuances', 'Recorded Stock Outflows in Period', 'Movements'],
  ]],
  ['qc', 'Quality Control', 'Quality Control (QC)', [
    ['totalSamplesLogged', 'Inspections Created in Period', 'Inspections'], ['approvedPassed', 'Approved / Passed', 'Inspections'], ['rejectedFailed', 'Failed / Rework', 'Inspections'],
    ['partial', 'Partially Passed', 'Inspections'], ['underTesting', 'Pending Inspection', 'Inspections'], ['firstPassYield', 'First Inspection Pass Rate', '%'], ['defectRate', 'Rejected Quantity Rate', '%'],
  ]],
  ['dispatch', 'Dispatch & Logistics', 'Dispatch & Logistics', [
    ['shipmentsDispatched', 'Shipments Dispatched in Period', 'Shipments'], ['currentlyInTransit', 'Period Shipments Still In Transit', 'Shipments'], ['totalDeliveredValue', 'Delivered Goods Value Before Tax / Discounts', 'INR'],
    ['totalFreightCost', 'Recorded Freight Cost', 'INR'], ['onTimeDeliveryRate', 'Measured On-Time Delivery Rate', '%'], ['podConfirmations', 'Approved PODs', 'Confirmations'],
  ]],
  ['finance', 'Finance & Accounts', 'Finance Receivables & Inflows', [
    ['revenueCollected', 'Verified Receipts in Period', 'INR'], ['outstandingReceivables', 'Current Posted-Invoice Receivables', 'INR'], ['advancePaymentsHeld', 'Current Unallocated Verified Receipts', 'INR'],
    ['invoicesVerified', 'Posted Invoices Created in Period', 'Invoices'], ['pendingVerification', 'Period Receipts Awaiting Verification', 'Payments'], ['collectionEfficiency', 'Current Invoice Collection Rate', '%'],
  ]],
  ['hr', 'HR & Payroll', 'HR Workforce Summary', [
    ['totalEmployees', 'Employee Records', 'Staff'], ['currentlyActive', 'Currently Employed', 'Staff'], ['onLeave', 'Employee Status: On Leave', 'Staff'], ['activeDepartments', 'Active Departments', 'Departments'],
    ['monthlyPayrollOutflow', 'Recorded Payroll Paid in Period', 'INR'], ['erpSystemUsers', 'ERP User Accounts', 'Accounts'],
  ]],
] as const;

export function reportSections(report: any, department?: string) {
  if (department && department !== 'All' && !definitions.some(d => d[1] === department)) throw new BadRequestException('Unknown department focus');
  return definitions.filter(d => !department || department === 'All' || d[1] === department).map(([key, department, title, metrics]) => ({
    key, department, title, scope: report.scope[key], metrics: metrics.map(([field, label, unit]) => ({ key: field, label, unit, value: report[key][field] })),
  }));
}

export function centralizedCsv(report: any) {
  const escape = (value: any) => {
    let text = String(value ?? 'Not recorded');
    if (/^[=+@\t\r]/.test(text) || (text.startsWith('-') && !Number.isFinite(Number(text)))) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  };
  const rows: any[][] = [['Department', 'Metric', 'Value', 'Unit', 'Start Date', 'End Date', 'Scope', 'Generated At', 'Applied Filters']];
  for (const section of report.sections) for (const metric of section.metrics) rows.push([
    section.department, metric.label, metric.value, metric.value == null ? '' : metric.unit, report.period.startDate, report.period.endDate, section.scope, report.generatedAt, JSON.stringify(report.appliedFilters),
  ]);
  return { filename: `centralized-business-report-${report.period.startDate}-to-${report.period.endDate}.csv`, content: '\uFEFF' + rows.map(row => row.map(escape).join(',')).join('\r\n') };
}

export function businessReportPeriod(query: any, now = new Date()) {
  const today = hrDay(now), date = new Date(today + 'T00:00:00Z');
  const y = date.getUTCFullYear(), m = date.getUTCMonth();
  const day = (d: Date) => d.toISOString().slice(0, 10);
  const shift = (n: number) => day(new Date(date.getTime() + n * 86400000));
  const preset = (query.rangePreset || 'THIS_MONTH').toUpperCase();
  const allTime = preset === 'ALL_TIME';
  let from = day(new Date(Date.UTC(y, m, 1))), to = today;
  if (preset === 'CUSTOM' || (!query.rangePreset && (query.startDate || query.from || query.endDate || query.to))) {
    from = query.startDate || query.from; to = query.endDate || query.to;
    if (!from || !to) throw new BadRequestException('Choose both custom report dates');
  } else if (preset === 'TODAY') from = today;
  else if (preset === 'YESTERDAY') from = to = shift(-1);
  else if (preset === 'THIS_WEEK' || preset === 'LAST_WEEK') {
    const sinceMonday = (date.getUTCDay() + 6) % 7;
    from = shift(-sinceMonday - (preset === 'LAST_WEEK' ? 7 : 0));
    if (preset === 'LAST_WEEK') to = shift(-sinceMonday - 1);
  } else if (preset === 'LAST_MONTH') {
    from = day(new Date(Date.UTC(y, m - 1, 1))); to = day(new Date(Date.UTC(y, m, 0)));
  } else if (preset === 'THIS_QUARTER') from = day(new Date(Date.UTC(y, Math.floor(m / 3) * 3, 1)));
  else if (preset === 'THIS_FINANCIAL_YEAR' || preset === 'LAST_FINANCIAL_YEAR') {
    const startYear = y - (m < 3 ? 1 : 0) - (preset === 'LAST_FINANCIAL_YEAR' ? 1 : 0);
    from = `${startYear}-04-01`;
    if (preset === 'LAST_FINANCIAL_YEAR') to = `${startYear + 1}-03-31`;
  } else if (preset !== 'THIS_MONTH' && !allTime) throw new BadRequestException('Unsupported report period');
  const { start, end } = hrPeriod({ from, to }, now);
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(start.getTime() - (end.getTime() - start.getTime() + 1));
  const clean = (key: string) => query[key] && query[key] !== 'All' ? query[key] : undefined;
  return {
    start, end, allTime, inRange: allTime ? {} : { gte: start, lte: end }, priorRange: { gte: previousStart, lte: previousEnd },
    branchId: clean('branchId'), customerId: clean('customerId'), productId: clean('productId'), vendorId: clean('vendorId'), department: clean('department'),
    period: { startDate: allTime ? 'all-time' : from, endDate: to, comparisonStartDate: allTime ? null : hrDay(previousStart), comparisonEndDate: allTime ? null : hrDay(previousEnd), label: allTime ? 'All recorded dates (stock through today)' : `${from} to ${to} (India time)` },
  };
}

export async function loadCentralizedReport(db: Prisma.TransactionClient, query: any, companyId: string, now = new Date()) {
  if (!companyId || ['null', 'undefined'].includes(companyId)) throw new BadRequestException('Company context is required');
  const f = businessReportPeriod(query, now);
  const within = (value: Date | null | undefined) => !!value && (f.allTime || (value >= f.start && value <= f.end));
  const [branches, customers, vendors, products, warehouses] = await Promise.all([
    db.branch.findMany({ where: { companyId, deletedAt: null }, select: { id: true, name: true } }),
    db.customer.findMany({ where: { companyId, deletedAt: null }, select: { id: true, companyName: true, branchId: true } }),
    db.supplier.findMany({ where: { companyId, isActive: true }, select: { id: true, name: true } }),
    db.product.findMany({ where: { companyId, isActive: true }, select: { id: true, name: true, sku: true, unit: true, productType: true, type: true, category: true, minimumStock: true } }),
    db.warehouse.findMany({ where: { companyId, ...(f.branchId ? { branchId: f.branchId } : {}) }, select: { id: true } }),
  ]);
  const customerIds = customers.filter(c => (!f.customerId || c.id === f.customerId) && (!f.branchId || c.branchId === f.branchId)).map(c => c.id);
  const orderWhere: Prisma.SalesOrderWhereInput = { deletedAt: null, customer: { companyId }, customerId: { in: customerIds }, ...(f.productId ? { items: { some: { productId: f.productId } } } : {}) };
  const workWhere: Prisma.WorkOrderWhereInput = { productionPlan: { salesOrder: orderWhere }, ...(f.productId ? { salesOrderItem: { productId: f.productId } } : {}) };
  const materialWhere: Prisma.MaterialRequestWhereInput = { companyId, ...(f.branchId ? { branchId: f.branchId } : {}), ...(f.productId ? { items: { some: { productId: f.productId } } } : {}) };
  const indentWhere: Prisma.PurchaseIndentWhereInput = { companyId, ...(f.branchId ? { warehouseId: { in: warehouses.map(w => w.id) } } : {}), ...(f.productId ? { items: { some: { productId: f.productId } } } : {}), ...(f.vendorId ? { purchaseOrders: { some: { companyId, supplierId: f.vendorId } } } : {}) };
  const [orders, priorOrders, payments, invoices, leads, quotes, samples, work, inspections, materials, indents, purchaseOrders, rawMaterials, transactions, employees, departments, users, payroll] = await Promise.all([
    db.salesOrder.findMany({ where: { ...orderWhere, orderDate: f.inRange }, select: { id: true, status: true, totalAmount: true, paidAmount: true } }),
    f.allTime ? Promise.resolve(0) : db.salesOrder.count({ where: { ...orderWhere, orderDate: f.priorRange, status: { in: confirmed as any } } }),
    db.customerPayment.findMany({ where: { customer: { companyId }, customerId: { in: customerIds } }, include: { allocations: true } }),
    db.salesInvoice.findMany({ where: { salesOrder: orderWhere, status: { in: ['POSTED', 'PARTIALLY_PAID', 'PAID'] } }, include: { paymentAllocations: { include: { payment: { select: { status: true } } } } } }),
    db.lead.count({ where: { companyId, deletedAt: null, convertedAt: null, lostAt: null, createdAt: f.inRange, ...((f.customerId || f.branchId) ? { customerId: { in: customerIds } } : {}) } }),
    db.quotation.count({ where: { companyId, deletedAt: null, lostAt: null, createdAt: f.inRange, salesOrder: null, sourceSalesOrders: { none: {} }, ...((f.customerId || f.branchId) ? { customerId: { in: customerIds } } : {}), ...(f.productId ? { items: { some: { productId: f.productId } } } : {}) } }),
    db.sampleRequest.count({ where: { companyId, deletedAt: null, requestedDate: f.inRange, status: { in: ['CREATED', 'PENDING_DISPATCH'] }, ...((f.customerId || f.branchId) ? { customerId: { in: customerIds } } : {}), ...(f.productId ? { items: { some: { productId: f.productId } } } : {}) } }),
    db.workOrder.findMany({ where: workWhere, include: { productionPlan: { select: { plannedEndDate: true } } } }),
    db.qCInspection.findMany({ where: { workOrder: workWhere }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] }),
    db.materialRequest.findMany({ where: materialWhere, include: { items: { select: { issuedQuantity: true } } } }),
    db.purchaseIndent.findMany({ where: indentWhere }),
    db.purchaseOrder.findMany({ where: { companyId, ...(f.vendorId ? { supplierId: f.vendorId } : {}), ...(f.productId ? { items: { some: { productId: f.productId } } } : {}), ...(f.branchId ? { purchaseIndent: { warehouseId: { in: warehouses.map(w => w.id) } } } : {}) } }),
    db.rawMaterial.findMany({ where: { companyId, isActive: true } }),
    db.inventoryTransaction.findMany({ where: { companyId, createdAt: { lte: f.end }, ...(f.branchId ? { warehouseId: { in: warehouses.map(w => w.id) } } : {}) } }),
    db.employee.findMany({ where: { companyId }, select: { id: true, status: true } }),
    db.department.count({ where: { companyId, isActive: true } }),
    db.user.count({ where: { companyId, deletedAt: null } }),
    db.payrollRecord.findMany({ where: { companyId, employee: { companyId }, status: 'PAID', paidAt: f.inRange }, select: { paidAmount: true } }),
  ]);
  const dispatches = await db.dispatch.findMany({ where: { salesOrder: orderWhere, dispatchedAt: f.inRange }, include: { items: { include: { salesOrderItem: { select: { unitPrice: true } } } }, salesOrder: { select: { requestedDeliveryDate: true, totalAmount: true } } } });
  const periodPayments = payments.filter(p => within(p.receivedAt));
  const collected = sum(periodPayments.filter(p => settledPayments.includes(p.status)), 'amount');
  const confirmedOrders = orders.filter(o => confirmed.includes(o.status));
  const periodWork = work.filter(w => within(w.createdAt) && w.status !== 'CANCELLED');
  const completedWork = work.filter(w => within(w.completedAt) && w.status !== 'CANCELLED');
  const measuredWork = completedWork.filter(w => w.productionPlan.plannedEndDate);
  const delays = measuredWork.map(w => Math.max(0, (w.completedAt!.getTime() - w.productionPlan.plannedEndDate!.getTime()) / 86400000));
  const periodInspections = inspections.filter(i => within(i.createdAt));
  const firstInspections = [...new Map([...inspections].reverse().map(i => [i.workOrderId, i])).values()].filter(i => within(i.createdAt));
  const pass = (i: any) => ['PASSED', 'APPROVED'].includes(i.status);
  const fail = (i: any) => ['FAILED', 'REWORK'].includes(i.status);
  const finalized = periodInspections.filter(i => i.status !== 'PENDING');
  const firstFinalized = firstInspections.filter(i => i.status !== 'PENDING');
  const approvedMaterials = materials.filter(m => within(m.approvedAt));
  const tat = approvedMaterials.filter(m => m.approvedAt! >= m.createdAt).map(m => (m.approvedAt!.getTime() - m.createdAt.getTime()) / 86400000);
  // Resolve the raw-material and product representations only inside this company.
  const rawProducts = products.filter(p => p.productType === 'RAW_MATERIAL' || p.type === 'RAW_MATERIAL' || p.category?.toLowerCase().includes('raw'));
  const used = new Set<string>();
  const catalog = rawMaterials.map(m => {
    const matches = rawProducts.filter(p => !used.has(p.id) && materialUnit(p.unit) === materialUnit(m.unit) && (m.sku ? p.sku?.trim().toLowerCase() === m.sku.trim().toLowerCase() : p.name.trim().toLowerCase() === m.name.trim().toLowerCase()));
    const product = matches.length === 1 ? matches[0] : null;
    if (product) used.add(product.id);
    return { id: m.id, aliases: [m.id, ...(product ? [product.id] : [])], minimumStock: Number(m.minimumStock) };
  });
  for (const p of rawProducts) if (!used.has(p.id)) catalog.push({ id: p.id, aliases: [p.id], minimumStock: Number(p.minimumStock) });
  const selectedMaterials = catalog.filter(m => !f.productId || m.aliases.includes(f.productId));
  const aliases = new Map(selectedMaterials.flatMap(m => m.aliases.map(id => [id, m.id] as const)));
  const balances = new Map<string, number>(); let unknownMovement = false;
  const materialTransactions = transactions.filter(tx => aliases.has(tx.rawMaterialId || '') || aliases.has(tx.productId || ''));
  for (const tx of materialTransactions) {
    const id = aliases.get(tx.rawMaterialId || '') || aliases.get(tx.productId || '')!;
    const movement = materialMovement(tx.type, Number(tx.quantity));
    if (movement.kind === 'UNKNOWN') unknownMovement = true;
    balances.set(id, (balances.get(id) || 0) + movement.delta);
  }
  const measuredInspections = finalized.filter(i => i.approvedQuantity != null && i.rejectedQuantity != null);
  const completedDispatches = dispatches.filter(d => delivered.includes(d.status));
  const measuredDispatches = completedDispatches.filter(d => d.deliveredAt && (d.eta || d.expectedDeliveryTime || d.salesOrder.requestedDeliveryDate));
  const onTime = measuredDispatches.filter(d => d.deliveredAt! <= (d.eta || d.expectedDeliveryTime || d.salesOrder.requestedDeliveryDate)!);
  const invoiceTotal = sum(invoices, 'totalAmount');
  const outstanding = invoices.reduce((n, i) => n + Math.max(0, Number(i.totalAmount) - sum(i.paymentAllocations.filter(a => settledPayments.includes(a.payment.status)), 'amount')), 0);
  const advances = payments.filter(p => settledPayments.includes(p.status)).reduce((n, p) => n + Math.max(0, Number(p.amount) - sum(p.allocations, 'amount')), 0);
  return {
    period: f.period, generatedAt: now.toISOString(), appliedFilters: { ...query, startDate: f.period.startDate, endDate: f.period.endDate },
    filters: { branches, customers: customers.map(c => ({ id: c.id, name: c.companyName })), vendors, products: products.map(p => ({ id: p.id, name: p.name })) },
    sales: {
      totalOrders: confirmedOrders.length,
      totalOrdersChangePercent: priorOrders ? Number(((confirmedOrders.length - priorOrders) / priorOrders * 100).toFixed(1)) : null,
      revenueCollected: f.productId ? null : collected, leadsInFunnel: f.productId ? null : leads,
      activeQuotations: quotes, samplesPending: samples,
      ordersClosedOrDispatched: confirmedOrders.filter(o => o.status === 'COMPLETED').length,
    },
    production: {
      workOrdersReleased: periodWork.length,
      currentlyRunning: work.filter(w => ['STARTED', 'PARTIALLY_COMPLETED'].includes(w.status)).length,
      batchesCompleted: completedWork.length, qcFailuresOrRework: new Set(periodInspections.filter(fail).map(i => i.workOrderId)).size,
      avgBatchDelayDays: delays.length ? Number((delays.reduce((a, b) => a + b, 0) / delays.length).toFixed(1)) : null,
      shopFloorYield: ratio(sum(measuredInspections, 'approvedQuantity'), sum(measuredInspections, 'approvedQuantity') + sum(measuredInspections, 'rejectedQuantity')),
    },
    plantHead: {
      materialRequestsPending: materials.filter(m => ['PENDING', 'PENDING_APPROVAL', 'PENDING_PLANT_HEAD_APPROVAL'].includes(m.status)).length,
      materialRequestsApproved: approvedMaterials.length,
      poApprovalsPending: purchaseOrders.filter(p => p.status === 'PENDING_PLANT_HEAD_PURCHASE_APPROVAL').length,
      totalClearancesIssued: materials.filter(m => within(m.requestDate) && m.items.some(i => Number(i.issuedQuantity) > 0)).length,
      scheduleAdherence: ratio(measuredWork.filter(w => w.completedAt! <= w.productionPlan.plannedEndDate!).length, measuredWork.length),
      avgApprovalTatDays: tat.length ? Number((tat.reduce((a, b) => a + b, 0) / tat.length).toFixed(1)) : null,
    },
    store: {
      totalRawStockItems: f.vendorId ? null : selectedMaterials.length,
      rawInventoryValue: f.vendorId || unknownMovement ? null : selectedMaterials.every(m => (balances.get(m.id) || 0) === 0) ? 0 : null,
      lowStockAlerts: f.vendorId || unknownMovement ? null : selectedMaterials.filter(m => m.minimumStock > 0 && (balances.get(m.id) || 0) < m.minimumStock).length,
      poRequestsRaised: indents.filter(i => within(i.indentDate)).length,
      materialIssuances: f.vendorId ? null : materialTransactions.filter(t => within(t.createdAt) && materialMovement(t.type, Number(t.quantity)).kind === 'OUT').length,
    },
    qc: {
      totalSamplesLogged: periodInspections.length, underTesting: periodInspections.filter(i => i.status === 'PENDING').length,
      approvedPassed: periodInspections.filter(pass).length, rejectedFailed: periodInspections.filter(fail).length,
      partial: periodInspections.filter(i => i.status === 'PARTIAL').length,
      firstPassYield: ratio(firstFinalized.filter(pass).length, firstFinalized.length),
      defectRate: ratio(sum(measuredInspections, 'rejectedQuantity'), sum(measuredInspections, 'approvedQuantity') + sum(measuredInspections, 'rejectedQuantity')),
    },
    dispatch: {
      shipmentsDispatched: dispatches.length,
      currentlyInTransit: dispatches.filter(d => ['DISPATCHED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(d.status)).length,
      totalDeliveredValue: completedDispatches.some(d => !d.items.length || d.deliveredQuantity == null || Number(d.deliveredQuantity) !== sum(d.items, 'quantity') || d.items.some(i => i.salesOrderItem?.unitPrice == null)) ? null : completedDispatches.reduce((n, d) => n + d.items.reduce((s, i) => s + Number(i.quantity) * Number(i.salesOrderItem.unitPrice), 0), 0),
      totalFreightCost: dispatches.some(d => d.freightAmount == null) ? null : sum(dispatches, 'freightAmount'),
      onTimeDeliveryRate: ratio(onTime.length, measuredDispatches.length),
      podConfirmations: dispatches.filter(d => d.podStatus === 'APPROVED').length,
    },
    finance: {
      revenueCollected: f.productId ? null : collected, outstandingReceivables: outstanding, advancePaymentsHeld: f.productId ? null : advances,
      invoicesVerified: invoices.filter(i => within(i.createdAt)).length,
      pendingVerification: f.productId ? null : periodPayments.filter(p => ['SUBMITTED', 'UNDER_VERIFICATION'].includes(p.status)).length,
      collectionEfficiency: ratio(invoiceTotal - outstanding, invoiceTotal),
    },
    hr: {
      totalEmployees: employees.length, currentlyActive: employees.filter(e => employedStatuses.includes(e.status)).length,
      onLeave: employees.filter(e => e.status === 'ON_LEAVE').length, activeDepartments: departments,
      monthlyPayrollOutflow: sum(payroll, 'paidAmount'), erpSystemUsers: users,
    },
    scope: {
      sales: 'Orders use order dates and confirmed workflow states. Leads, unconverted quotations and pending samples were created in the period. Product-level payment attribution is unavailable.',
      production: 'Created and completed work orders use their recorded event dates. Running orders are current. Yield uses measured QC quantities; delay compares completion against the plan end date.',
      plantHead: 'Pending approvals are current. Approvals use approvedAt; issued requests use request date. Schedule adherence uses completed work orders with recorded plan deadlines. Vendor filters affect POs only; customer filters do not affect material requests.',
      store: 'Company raw-material catalog and product mirrors, with stock movements through the period end. Valuation is unavailable without recorded inventory costs. Customer filters do not apply. Vendor filters apply to linked purchase indents, not stock balances.',
      qc: 'Inspection cohort uses creation dates. Passed, failed/rework, partial and pending are separate. First-pass yield uses the first recorded inspection per work order. Defect rate uses complete measured quantities.',
      dispatch: 'Shipments use dispatchedAt. Delivered goods value requires delivered quantity matching item totals and recorded unit prices, before tax and discounts. SLA excludes deliveries without both a target and delivery timestamp.',
      finance: 'Verified receipts use receivedAt. Receivables and unallocated receipts are current balances. Invoice collection rate uses allocations to posted invoices, not unrelated period receipts. Product filters select whole matching invoices; payment attribution is unavailable.',
      hr: 'Current employee, department and user records. Payroll outflow uses paidAt and paidAmount. Commercial branch, customer, vendor and product filters do not apply to HR.',
    },
  };
}
