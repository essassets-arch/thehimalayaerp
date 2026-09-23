import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { businessReportPeriod } from './centralized-reports';

// Explicit reporting allowlist. Never expose arbitrary models or employee/authentication secrets.
type Register = { key: string; department: string; title: string; model: string; tenant: string; date?: string; fields: string; filters?: Record<string, string>; note?: string };
const sales = 'Sales & CRM', production = 'Production Floor', plant = 'Plant Head', store = 'Store / Procurement', qc = 'Quality Control', dispatch = 'Dispatch & Logistics', finance = 'Finance & Accounts', hr = 'HR & Payroll';
const commercial = { customerId: 'customerId', branchId: 'customer.branchId', productId: 'items.some.productId' };
const orderFilters = { customerId: 'salesOrder.customerId', branchId: 'salesOrder.customer.branchId', productId: 'salesOrder.items.some.productId' };
const workFilters = { customerId: 'productionPlan.salesOrder.customerId', branchId: 'productionPlan.salesOrder.customer.branchId', productId: 'salesOrderItem.productId' };
const procurement = { vendorId: 'supplierId', productId: 'items.some.productId', branchId: 'purchaseIndent.warehouseId' };
const reg = (key: string, department: string, title: string, model: string, tenant: string, date: string | undefined, fields: string, filters?: Record<string, string>, note?: string): Register => ({ key, department, title, model, tenant, date, fields: 'id ' + fields, filters, note });
export const businessRegisters: Register[] = [
  reg('customers', sales, 'Customers', 'Customer', 'companyId', undefined, 'customerCode companyName contactPerson status creditLimit creditDays createdAt', { customerId: 'id', branchId: 'branchId' }),
  reg('leads', sales, 'Leads', 'Lead', 'companyId', 'leadDate', 'leadNumber leadDate companyName projectName contactPerson source productInterest estimatedQuantity unit convertedAt lostAt nextReminder workflowState.name', { customerId: 'customerId' }),
  reg('quotations', sales, 'Quotations', 'Quotation', 'companyId', 'createdAt', 'quotationNumber createdAt customerId validUntil subtotal discount tax total approvedAt lostAt workflowState.name', { customerId: 'customerId', productId: 'items.some.productId' }),
  reg('quotationItems', sales, 'Quotation Items', 'QuotationItem', 'quotation.companyId', 'quotation.createdAt', 'quotation.quotationNumber product.name description quantity unitPrice discount tax lineTotal', { customerId: 'quotation.customerId', productId: 'productId' }),
  reg('orders', sales, 'Sales Orders — All Statuses', 'SalesOrder', 'customer.companyId', 'orderDate', 'orderNumber orderDate customer.companyName status requestedDeliveryDate subtotal discountAmount taxAmount freightAmount totalAmount paidAmount outstandingAmount paymentStatus', commercial, 'Recorded order balances are shown as stored; the finance summary reconciles posted invoices and verified allocations separately.'),
  reg('orderItems', sales, 'Sales Order Items', 'SalesOrderItem', 'salesOrder.customer.companyId', 'salesOrder.orderDate', 'salesOrder.orderNumber product.name productCodeSnapshot orderedQuantity unit unitPrice discountAmount taxableAmount taxAmount lineTotal', { ...orderFilters, productId: 'productId' }),
  reg('samples', sales, 'Sample Requests', 'SampleRequest', 'companyId', 'requestedDate', 'sampleNumber requestedDate projectName customer.companyName status expectedDeliveryDate dispatchDate deliveredAt transportCost sampleResult', commercial),
  reg('complaints', sales, 'Customer Complaints', 'CustomerComplaint', 'customer.companyId', 'complaintDate', 'complaintNo complaintDate customer.companyName order.orderNumber subject complaintType priority status originalBillAmount calculatedComplaintAmount financeApprovedReturnAmount', { customerId: 'customerId', branchId: 'customer.branchId', productId: 'productId' }),
  reg('returns', sales, 'Sales Returns', 'SalesReturn', 'salesOrder.customer.companyId', 'requestedAt', 'returnNumber salesOrder.orderNumber requestedAt status reasonCode resolutionType receivedAt closedAt', orderFilters),
  reg('replacements', sales, 'Replacement Requests', 'ReplacementRequest', 'salesOrder.customer.companyId', 'requestedAt', 'requestNumber salesOrder.orderNumber requestedAt status dispatchStatus reasonCode approvedAt completedAt', orderFilters),
  reg('salesTargets', sales, 'Sales Targets', 'SalesTarget', 'salesperson.companyId', 'startDate', 'salesperson.name targetPeriod startDate endDate revenueTarget status'),
  reg('plans', production, 'Production Plans', 'ProductionPlan', 'salesOrder.customer.companyId', 'createdAt', 'planNumber salesOrder.orderNumber status productionLine priority plannedStartDate plannedEndDate createdAt', orderFilters),
  reg('workOrders', production, 'Work Orders', 'WorkOrder', 'productionPlan.salesOrder.customer.companyId', 'createdAt', 'workOrderNumber productionPlan.planNumber status productionStatus quantity startedAt completedAt qcResult reworkCount createdAt', workFilters),
  reg('batches', production, 'Production Batches', 'ProductionBatch', 'workOrder.productionPlan.salesOrder.customer.companyId', 'createdAt', 'batchNumber workOrder.workOrderNumber quantity createdAt', { productId: 'workOrder.salesOrderItem.productId', customerId: 'workOrder.productionPlan.salesOrder.customerId', branchId: 'workOrder.productionPlan.salesOrder.customer.branchId' }),
  reg('productionDaily', production, 'Production Daily Reports', 'ProductionDailyReport', 'companyId', 'reportDate', 'reportNo reportDate shift supervisorName status totalCovers totalFrames totalSets totalWeight stockPostedAt', { productId: 'items.some.productId' }),
  reg('productionDailyItems', production, 'Production Daily Report Items', 'ProductionDailyReportItem', 'report.companyId', 'report.reportDate', 'report.reportNo report.reportDate product.name customProductName coverQty frameQty setQty extraCoverQty extraFrameQty totalWeight remarks', { productId: 'productId' }),
  reg('productionShifts', production, 'Production Shift Entries', 'ProductionShiftEntry', 'workOrder.productionPlan.salesOrder.customer.companyId', 'date', 'workOrder.workOrderNumber date shift supervisor targetQty producedQty rejectedQty reworkQty', { productId: 'workOrder.salesOrderItem.productId' }),
  reg('scrap', production, 'Scrap and Wastage', 'ProductionScrapEntry', 'workOrder.productionPlan.salesOrder.customer.companyId', 'date', 'workOrder.workOrderNumber date shift scrapQty wastageQty category remarks', { productId: 'workOrder.salesOrderItem.productId' }),
  reg('materialRequests', plant, 'Material Requests', 'MaterialRequest', 'companyId', 'requestDate', 'publicId requestDate workOrderNo status priority approvedAt createdAt', { branchId: 'branchId', productId: 'items.some.productId' }),
  reg('materialRequestItems', plant, 'Material Request Items', 'MaterialRequestItem', 'materialRequest.companyId', 'materialRequest.requestDate', 'materialRequest.publicId product.name quantity approvedQuantity issuedQuantity receivedQuantity consumedQuantity returnedQuantity unit status', { branchId: 'materialRequest.branchId', productId: 'productId' }),
  reg('brandAnalysis', plant, 'Brand Analysis Requests', 'BrandAnalysisRequest', 'requestedBy.companyId', 'createdAt', 'requestNo productName brandName quantity quantityUnit status requiredByDate approvedAt recommendation recommendedBrand estimatedUnitCost estimatedTotalCost', undefined, 'Estimated costs here are values explicitly entered in brand-analysis records, not substituted actual costs.'),
  reg('products', store, 'Product Catalog', 'Product', 'companyId', undefined, 'publicId sku name category productType unit unitPrice minimumStock reorderQuantity isActive', { productId: 'id', vendorId: 'preferredVendorId' }),
  reg('rawMaterials', store, 'Raw Material Catalog', 'RawMaterial', 'companyId', undefined, 'publicId sku name category unit minimumStock storageLocation isActive'),
  reg('suppliers', store, 'Suppliers', 'Supplier', 'companyId', undefined, 'publicId name contact email phone gstin isActive', { vendorId: 'id' }),
  reg('indents', store, 'Purchase Indents', 'PurchaseIndent', 'companyId', 'indentDate', 'indentNo indentDate department status requiredDate priority plantHeadApprovedAt closedAt', { branchId: 'warehouseId', productId: 'items.some.productId', vendorId: 'purchaseOrders.some.supplierId' }),
  reg('purchaseOrders', store, 'Purchase Orders', 'PurchaseOrder', 'companyId', 'createdAt', 'poNumber poNo draftPoNo supplier.name status totalAmount gstAmount freight otherCharges expectedDeliveryDate orderedAt closedAt createdAt', procurement),
  reg('purchaseItems', store, 'Purchase Order Items', 'PurchaseOrderItem', 'purchaseOrder.companyId', 'purchaseOrder.createdAt', 'purchaseOrder.poNumber product.name materialNameSnapshot uomSnapshot quantity unitPrice receivedQuantity acceptedQuantity lineSubtotal gstAmount lineTotal', { vendorId: 'purchaseOrder.supplierId', productId: 'productId', branchId: 'purchaseOrder.purchaseIndent.warehouseId' }),
  reg('grns', store, 'Goods Receipt Notes', 'GoodsReceiptNote', 'companyId', 'receivedAt', 'grnNumber purchaseOrder.poNumber warehouse.name status receivedAt inventoryPostedAt financeAuditedAt', { vendorId: 'purchaseOrder.supplierId', branchId: 'warehouse.branchId', productId: 'items.some.productId' }),
  reg('grnItems', store, 'Goods Receipt Items', 'GoodsReceiptNoteItem', 'goodsReceiptNote.companyId', 'goodsReceiptNote.receivedAt', 'goodsReceiptNote.grnNumber product.name receivedQuantity acceptedQuantity rejectedQuantity financeApprovedQuantity inspectionRemarks', { productId: 'productId', vendorId: 'goodsReceiptNote.purchaseOrder.supplierId', branchId: 'goodsReceiptNote.warehouse.branchId' }),
  reg('procurementDeliveries', store, 'Procurement Deliveries', 'ProcurementDelivery', 'companyId', 'createdAt', 'deliveryNumber purchaseOrder.poNumber supplier.name status expectedDeliveryDate actualDeliveryDate verifiedAt invoiceNumber deliveryChallanNo', { vendorId: 'supplierId', productId: 'items.some.productId', branchId: 'warehouse.branchId' }),
  reg('materialRejections', store, 'Material Rejections', 'MaterialRejection', 'companyId', 'createdAt', 'rejectionNumber supplier.name purchaseOrder.poNumber status invoiceNumber expectedResolutionDate resolvedAt resolutionType', { vendorId: 'supplierId', productId: 'items.some.productId' }),
  reg('procurementReplacements', store, 'Procurement Replacements', 'ProcurementReplacementRequest', 'companyId', 'createdAt', 'requestNumber supplier.name purchaseOrder.poNumber status expectedDeliveryDate completedAt', { vendorId: 'supplierId', productId: 'items.some.productId' }),
  reg('inventoryMovements', store, 'Inventory Movements', 'InventoryTransaction', 'companyId', 'createdAt', 'createdAt product.name rawMaterial.name warehouse.name type quantity referenceType referenceId', { productId: 'productId', branchId: 'warehouse.branchId' }),
  reg('finishedGoods', store, 'Finished Goods', 'FinishedGoods', 'product.companyId', undefined, 'product.name workOrder.workOrderNumber salesOrder.orderNumber quantity availableQuantity reservedQuantity unit status receivedAt', { productId: 'productId', customerId: 'salesOrder.customerId', branchId: 'salesOrder.customer.branchId' }),
  reg('stockHistory', store, 'Stock History', 'StockHistory', 'companyId', 'createdAt', 'product.name event quantity beforeQuantity afterQuantity beforeAvailableQuantity afterAvailableQuantity referenceNumber sourceType createdAt', { productId: 'productId' }),
  reg('qcInspections', qc, 'QC Inspections', 'QCInspection', 'workOrder.productionPlan.salesOrder.customer.companyId', 'createdAt', 'workOrder.workOrderNumber status approvedQuantity rejectedQuantity approvedAt createdAt remarks', { customerId: 'workOrder.productionPlan.salesOrder.customerId', branchId: 'workOrder.productionPlan.salesOrder.customer.branchId', productId: 'workOrder.salesOrderItem.productId' }),
  reg('testing', qc, 'Production Testing Records', 'ProductionTestingRecord', 'companyId', 'createdAt', 'referenceNo productName quantity previousQuantity remainingQuantity status reviewedAt remarks createdAt', { productId: 'productId' }),
  reg('dispatches', dispatch, 'Dispatches — All Statuses', 'Dispatch', 'salesOrder.customer.companyId', 'createdAt', 'dispatchNo salesOrder.orderNumber status createdAt dispatchedAt deliveredAt transporterName vehicleNumber freightAmount loadedQuantity deliveredQuantity shortQuantity damagedQuantity eta podStatus podReceivedAt closedAt', orderFilters, 'Date filter uses creation date so pending dispatches are included. The dispatch summary uses dispatch date.'),
  reg('dispatchItems', dispatch, 'Dispatch Items', 'DispatchItem', 'dispatch.salesOrder.customer.companyId', 'dispatch.createdAt', 'dispatch.dispatchNo salesOrderItem.productNameSnapshot quantity salesOrderItem.unitPrice createdAt', { productId: 'salesOrderItem.productId', customerId: 'dispatch.salesOrder.customerId', branchId: 'dispatch.salesOrder.customer.branchId' }),
  reg('dispatchDaily', dispatch, 'Dispatch Daily Reports', 'DispatchDailyReport', 'companyId', 'reportDate', 'reportNo reportDate shift dispatchExecutive dispatchType status totalCovers totalFrames totalSets totalWeight stockPostedAt', { productId: 'items.some.productId' }),
  reg('dispatchDailyItems', dispatch, 'Dispatch Daily Report Items', 'DispatchDailyReportItem', 'report.companyId', 'report.reportDate', 'report.reportNo report.reportDate product.name customProductName coverQty frameQty setQty extraCoverQty extraFrameQty totalWeight remarks', { productId: 'productId' }),
  reg('invoices', finance, 'Sales Invoices — All Statuses', 'SalesInvoice', 'salesOrder.customer.companyId', 'createdAt', 'invoiceNumber salesOrder.orderNumber status subtotal discountAmount taxableAmount taxAmount freightAmount roundingAmount totalAmount createdAt', orderFilters),
  reg('invoiceItems', finance, 'Sales Invoice Items', 'InvoiceItem', 'invoice.salesOrder.customer.companyId', 'invoice.createdAt', 'invoice.invoiceNumber salesOrderItem.productNameSnapshot quantity unitPrice discountAmount taxableAmount taxRate taxAmount lineTotal amount', { productId: 'salesOrderItem.productId', customerId: 'invoice.salesOrder.customerId', branchId: 'invoice.salesOrder.customer.branchId' }),
  reg('receipts', finance, 'Customer Receipts — All Statuses', 'CustomerPayment', 'customer.companyId', 'receivedAt', 'paymentNo customer.companyName salesOrder.orderNumber receivedAt amount status method transactionReference verifiedAt', { customerId: 'customerId', branchId: 'customer.branchId' }),
  reg('vendorInvoices', finance, 'Vendor Invoices', 'VendorInvoice', 'supplier.companyId', 'invoiceDate', 'invoiceNumber supplier.name purchaseOrder.poNumber invoiceDate dueDate status totalAmount paidAmount', { vendorId: 'supplierId', productId: 'items.some.productId' }),
  reg('vendorPayments', finance, 'Vendor Payments', 'VendorPayment', 'supplier.companyId', 'paymentDate', 'paymentNumber supplier.name paymentDate status paidAmount transactionId', { vendorId: 'supplierId' }),
  reg('expenses', finance, 'Expenses', 'Expense', 'companyId', 'expenseDate', 'expenseName expenseDate employeeId amount status hrApprovedAt superApprovedAt remarks'),
  reg('expenseClaims', finance, 'Expense Claims', 'ExpenseClaim', 'companyId', 'expenseDate', 'claimNumber expenseName employee.fullName expenseDate amount status hrApprovedAt superAdminApprovedAt financeProcessedAt paymentReference'),
  reg('employees', hr, 'Employee Directory', 'Employee', 'companyId', undefined, 'employeeCode fullName firstName lastName jobTitle department.name employmentType joiningDate status workEmail'),
  reg('departments', hr, 'Departments', 'Department', 'companyId', undefined, 'code name isActive createdAt'),
  reg('users', hr, 'ERP User Accounts', 'User', 'companyId', undefined, 'publicId name email role.name isActive createdAt'),
  reg('payroll', hr, 'Payroll — All Statuses', 'PayrollRecord', 'companyId', 'createdAt', 'payrollNumber employeeCodeSnapshot employeeNameSnapshot departmentSnapshot status grossEarnings totalDeductions netPayable paidAmount paidAt createdAt', undefined, 'Date filter uses payroll creation; paid outflow in the summary uses payment date.'),
  reg('attendance', hr, 'Attendance', 'Attendance', 'companyId', 'attendanceDate', 'employee.employeeCode employee.fullName attendanceDate status punchInAt punchOutAt workedMinutes lateMinutes earlyExitMinutes overtimeMinutes'),
  reg('leave', hr, 'Leave Requests', 'LeaveRequest', 'companyId', 'fromDate', 'employee.employeeCode employee.fullName department.name leaveType fromDate toDate totalDays status approvedAt'),
  reg('recruitment', hr, 'Recruitment Requests', 'RecruitmentRequest', 'companyId', 'createdAt', 'indentNumber designation department vacancies positionsFilled priority employmentType status requiredByDate fulfilledAt createdAt'),
  reg('candidates', hr, 'Recruitment Candidates', 'RecruitmentCandidate', 'recruitmentRequest.companyId', 'createdAt', 'candidateNumber recruitmentRequest.indentNumber name experience source status joiningDate createdAt'),
  reg('backOfficeDaily', hr, 'Back Office Daily Reports', 'BackOfficeDailyReport', 'companyId', 'reportDate', 'publicId user.name reportDate title summary tasksCompleted issuesOrBlockers planForTomorrow workingHours status'),
  reg('manualAr', finance, 'Manual AR Entries', 'HcpplArManualEntry', '$createdBy', 'invoiceDate', 'srNo invoiceNo invoiceDate partyName siteName basicAmount invoiceGstAmount paymentTerm ageingDays ageingBucket managementStatus dueStatus paymentStatus isArchived'),
  reg('sampleTracker', sales, 'Sample Tracker', 'SampleTrackerEntry', '$createdBy', 'dispatchDate', 'partyName sitePincode materialManually referencePerson dispatchDate transportMode transportAmount status remark isArchived'),
  reg('outwardRegister', dispatch, 'Outward Register', 'OutwardRegisterEntry', '$createdBy', 'outwardDate', 'outwardDate transporterName vehicleNo material quantity partyName salesPerson invoiceNo receivingManually remark isArchived'),
  reg('paymentFollowUps', finance, 'Payment Follow-ups', 'PaymentFollowUpEntry', '$createdBy', 'createdAt', 'partyName duePaymentAmount salesPerson remarks isArchived createdAt'),
  reg('replacementOrders', sales, 'Replacement Orders', 'ReplacementOrder', 'originalSalesOrder.customer.companyId', 'createdAt', 'replacementOrderNo originalSalesOrder.orderNumber status commercialValue deliveredAt closedAt createdAt', { customerId: 'originalSalesOrder.customerId', branchId: 'originalSalesOrder.customer.branchId', productId: 'items.some.productId' }),
  reg('productionTargets', production, 'Production Targets', 'ProductionTarget', '$createdBy', 'startDate', 'targetPeriod startDate endDate quantityTarget status plantId remarks'),
  reg('vendorReturns', store, 'Vendor Returns', 'VendorReturn', 'companyId', 'createdAt', 'publicId supplier.name status createdAt', { vendorId: 'supplierId', productId: 'items.some.productId' }),
  reg('supplierPayables', finance, 'Supplier Payables', 'SupplierPayable', 'companyId', 'createdAt', 'supplier.name purchaseOrderId amount status createdAt', { vendorId: 'supplierId' }),
  reg('receiptAllocations', finance, 'Receipt Allocations', 'PaymentAllocation', 'payment.customer.companyId', 'createdAt', 'payment.paymentNo payment.status invoice.invoiceNumber invoice.status amount createdAt', { customerId: 'payment.customerId', branchId: 'payment.customer.branchId', productId: 'invoice.items.some.salesOrderItem.productId' }),
  reg('customerLedger', finance, 'Customer Ledger', 'CustomerLedger', 'customer.companyId', 'createdAt', 'customer.companyName type amount debit credit referenceType referenceId reversalOfId description createdAt', { customerId: 'customerId', branchId: 'customer.branchId' }),
  reg('salaryPayments', hr, 'Salary Payments', 'SalaryPayment', 'payrollRecord.companyId', 'paymentDate', 'paymentNumber payrollRecord.payrollNumber payrollRecord.employeeNameSnapshot paymentDate paymentMode paidAmount utrNumber transactionReference'),
  reg('payrollPeriods', hr, 'Payroll Periods', 'PayrollPeriod', 'companyId', 'startDate', 'month year startDate endDate status lockedAt closedAt'),
  reg('monthlyAttendance', hr, 'Monthly Attendance Summaries', 'EmployeeMonthlyAttendanceSummary', 'employee.companyId', 'payrollPeriod.startDate', 'employee.employeeCode employee.fullName payrollPeriod.month payrollPeriod.year workingDays presentDays paidLeaveDays unpaidLeaveDays absentDays halfDays payableDays overtimeHours lateMarks calculatedAt'),
  reg('employeeComplaints', hr, 'Employee Complaints', 'EmployeeComplaint', 'companyId', 'createdAt', 'ticketCode employee.fullName category subject priority status resolvedAt createdAt'),
  reg('backOfficeAr', finance, 'Back Office AR Invoices', 'BackOfficeArInvoice', '$salesOrder', 'invoiceDate', 'entity invoiceNumber invoiceDate companyName siteName basicAmount invoiceAmount amtRcvd outstanding dueDate status ageingDays ageingBucket', undefined, 'Only invoices linked to a sales order in this company are included. Unlinked legacy invoices have no company ownership and cannot be included safely. Stored AR balances are separate from the posted-invoice ledger.'),
];

const models = Prisma.dmmf.datamodel.models;
function label(path: string) { return path.split('.').map(p => p.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase())).join(' / '); }
function fieldInfo(model: string, path: string) {
  let current = model; let field: any;
  for (const part of path.split('.')) {
    field = models.find(m => m.name === current)?.fields.find(f => f.name === part);
    if (!field) throw new Error(`Invalid reporting field: ${model}.${path}`);
    current = field.type;
  }
  return field;
}
function selectFields(config: Register) {
  const select: any = {};
  for (const path of config.fields.split(' ')) {
    let node = select;
    const parts = path.split('.');
    parts.forEach((part, index) => {
      if (index === parts.length - 1) node[part] = true;
      else { node[part] ||= { select: {} }; node = node[part].select; }
    });
  }
  return select;
}
const nest = (path: string, value: any): any => path.split('.').reverse().reduce((child, key) => ({ [key]: child }), value);
function flatten(row: any, path: string) {
  const value = path.split('.').reduce((v, key) => v?.[key], row);
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  // Preserve database decimal precision in exports and transport.
  return typeof value === 'object' || typeof value === 'bigint' ? String(value) : value;
}
export function registerCatalog(department?: string) {
  if (department && department !== 'All' && !businessRegisters.some(r => r.department === department)) throw new BadRequestException('Unknown department focus');
  return businessRegisters.filter(r => !department || department === 'All' || r.department === department).map(r => ({
    key: r.key, department: r.department, title: r.title,
    columns: r.fields.split(' ').map(key => ({ key, label: label(key), type: fieldInfo(r.model, key).type })),
    dateField: r.date ? label(r.date) : null, supportedFilters: Object.keys(r.filters || {}),
    scope: (r.date ? `Period filters ${label(r.date)}. ` : 'Current master records; date range does not apply. ') + 'Includes all workflow statuses. ' + (r.tenant === '$createdBy' ? 'Includes records created by company users; unowned legacy records cannot be attributed to this company. ' : '') + (r.note || ''),
  }));
}

async function registerWhere(db: Prisma.TransactionClient, config: Register, query: any, companyId: string) {
  const period = businessReportPeriod(query);
  const constraints: any[] = [];
  if (config.tenant === '$createdBy') {
    const users = await db.user.findMany({ where: { companyId }, select: { id: true } });
    constraints.push({ createdById: { in: users.map(u => u.id) } });
  } else if (config.tenant === '$salesOrder') {
    const orders = await db.salesOrder.findMany({ where: { customer: { companyId }, deletedAt: null }, select: { id: true } });
    constraints.push({ salesOrderId: { in: orders.map(o => o.id) } });
  } else constraints.push(nest(config.tenant, companyId));
  if (models.find(m => m.name === config.model)?.fields.some(f => f.name === 'deletedAt')) constraints.push({ deletedAt: null });
  // Child reports must not resurrect soft-deleted parent records.
  if (!config.tenant.startsWith('$')) {
    let model = config.model;
    const path: string[] = [];
    for (const part of config.tenant.split('.').slice(0, -1)) {
      const relation = models.find(m => m.name === model)!.fields.find(f => f.name === part)!;
      model = relation.type; path.push(part);
      if (models.find(m => m.name === model)?.fields.some(f => f.name === 'deletedAt')) constraints.push(nest([...path, 'deletedAt'].join('.'), null));
    }
  }
  if (config.date && !period.allTime) constraints.push(nest(config.date, period.inRange));
  for (const [filter, path] of Object.entries(config.filters || {})) {
    const value = query[filter];
    if (!value || value === 'All') continue;
    if (filter === 'branchId' && path.endsWith('warehouseId')) {
      const warehouses = await db.warehouse.findMany({ where: { companyId, branchId: value }, select: { id: true } });
      constraints.push(nest(path, { in: warehouses.map(w => w.id) }));
    } else constraints.push(nest(path, value));
  }
  return { where: { AND: constraints }, period: period.period };
}

export async function loadBusinessRegister(db: Prisma.TransactionClient, query: any, companyId: string, exportAll = false) {
  if (!companyId || ['null', 'undefined'].includes(companyId)) throw new BadRequestException('Company context is required');
  const config = businessRegisters.find(r => r.key === query.dataset);
  if (!config || (query.department && query.department !== 'All' && query.department !== config.department)) throw new BadRequestException('Choose a report in the selected department');
  const page = Number(query.page || 1), pageSize = Number(query.pageSize || 25);
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100 || !Number.isSafeInteger((page - 1) * pageSize)) throw new BadRequestException('Invalid report page (page size must be 1–100)');
  const { where, period } = await registerWhere(db, config, query, companyId);
  const delegate = (db as any)[config.model[0].toLowerCase() + config.model.slice(1)];
  const total = await delegate.count({ where });
  const metadata = registerCatalog(config.department).find(r => r.key === config.key)!;
  const rows: any[] = [];
  let cursor: string | undefined;
  do {
    const batch = await delegate.findMany({ where, select: selectFields(config), orderBy: { id: 'asc' },
      ...(exportAll ? { take: 500, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}) } : { take: pageSize, skip: (page - 1) * pageSize }),
    });
    rows.push(...batch.map((row: any) => Object.fromEntries(config.fields.split(' ').map(path => [path, flatten(row, path)]))));
    if (!exportAll || batch.length < 500) break;
    cursor = batch[batch.length - 1].id;
  } while (true);
  const ignoredFilters = ['branchId', 'customerId', 'vendorId', 'productId'].filter(key => query[key] && query[key] !== 'All' && !config.filters?.[key]);
  return { ...metadata, period, appliedFilters: query, ignoredFilters, generatedAt: new Date().toISOString(), total, page, pageSize, rows };
}

export function registerCsv(report: Awaited<ReturnType<typeof loadBusinessRegister>>) {
  const cell = (value: any) => {
    let text = value == null ? 'Not recorded' : String(value);
    if (/^[=+@\t\r]/.test(text) || (text.startsWith('-') && !Number.isFinite(Number(text)))) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  };
  const headers = [...report.columns.map(c => c.label), 'Report Period', 'Generated At', 'Scope', 'Applied Filters', 'Filters Not Applicable'];
  const rows = report.rows.map(row => [...report.columns.map(c => row[c.key]), report.period.label, report.generatedAt, report.scope, JSON.stringify(report.appliedFilters), report.ignoredFilters.join(', ')]);
  return { filename: `${report.key}-${report.period.startDate}-to-${report.period.endDate}.csv`, content: '\uFEFF' + [headers, ...rows].map(row => row.map(cell).join(',')).join('\r\n') };
}
