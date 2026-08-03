// ──────────────────────────────────────────────────────────
// Himalaya ERP — Mock Data Seeds
// Orders at every stage so each department panel has live data
// ──────────────────────────────────────────────────────────

const now = new Date().toISOString();
const today = new Date().toISOString().split('T')[0];

export const mockNotifications: any[] = [];

function makeTimeline(events: any[]) {
  return events.map((e: any, i: number) => ({
    id: `EVT-${i + 1}`,
    status: e.status,
    event: e.event,
    action: e.action,
    timestamp: e.timestamp || now,
    actor: e.actor || 'System',
    department: e.department || 'Sales',
    notes: e.notes || ''
  }));
}

const baseItems = [
  {
    productId: 'PRD-001',
    productName: 'RCC Hume Pipe 600mm',
    productDetails: 'NP3 class, IS:458',
    quantity: 100,
    unitPrice: 1800,
    discount: 5,
    taxRate: 18,
    code: 'RCC-600-NP3'
  }
];

const baseCustomer = {
  id: 'CUST-001',
  name: 'ABC Infrastructure Pvt Ltd',
  companyName: 'ABC Infrastructure Pvt Ltd',
  contactPerson: 'Rajesh Kumar',
  mobile: '9876543210',
  email: 'rajesh@abcinfra.com',
  gstNumber: '27AAPCS1234F1Z5',
  gstName: 'ABC Infrastructure Private Limited'
};

function calcTotal(items: any[]) {
  return items.reduce((sum: number, it: any) => {
    const base = it.quantity * it.unitPrice;
    const disc = base * ((it.discount || 0) / 100);
    const taxable = base - disc;
    return sum + taxable * (1 + (it.taxRate || 18) / 100);
  }, 0);
}

const grandTotal = Math.round(calcTotal(baseItems));

// ── Seed Orders ────────────────────────────────────────────

// Transactional lead fixtures are intentionally empty. Leads are created only
// through the canonical state.sales.leads actions.
export const mockLeads = [];

export const mockQuotations = [
  {
    id: 'QT-001',
    quotationNo: 'QT-001',
    leadId: 'LEAD-001',
    customerName: 'ABC Infrastructure Pvt Ltd',
    customer: baseCustomer,
    deliveryAddress: 'Site No. 5, NH-44, Nagpur 440001',
    detailedItems: baseItems,
    subTotal: 180000,
    discountAmount: 9000,
    taxAmount: 30780,
    freightCharges: 5000,
    grandTotal: grandTotal + 5000,
    totalAmount: grandTotal + 5000,
    paymentTerms: '50% advance, 50% on delivery',
    quotationValidity: '2026-08-31',
    termsAndConditions: 'Standard Himalaya T&C apply',
    status: 'Converted to Order',
    createdDate: today
  }
];

export const mockOrders = [
  // ── 1. ORDER_CONFIRMED — visible in Sales Orders panel ──
  {
    id: 'ORD-001',
    orderNo: 'ORD-001',
    leadId: 'LEAD-001',
    quotationId: 'QT-001',
    quotationRef: 'QT-001',
    customerName: 'ABC Infrastructure Pvt Ltd',
    customer: baseCustomer,
    deliveryAddress: 'Site No. 5, NH-44, Nagpur 440001',
    detailedItems: baseItems,
    products: 'RCC Hume Pipe 600mm (100 Qty)',
    subTotal: 180000,
    discountAmount: 9000,
    taxAmount: 30780,
    freightCharges: 5000,
    grandTotal: grandTotal + 5000,
    totalAmount: grandTotal + 5000,
    paymentTerms: '50% advance, 50% on delivery',
    workflowStatus: 'ORDER_CONFIRMED',
    status: 'ORDER_CONFIRMED',
    currentDepartment: 'Sales',
    overallStage: 'Sales',
    priority: 'High',
    salesExecutive: 'Amit Sharma',
    history: makeTimeline([
      { status: 'LEAD_CREATED', event: 'Lead Created', action: 'Create Lead', actor: 'Amit Sharma', department: 'Sales' },
      { status: 'QUOTATION_CREATED', event: 'Quotation Created', action: 'Create Quotation', actor: 'Amit Sharma', department: 'Sales' },
      { status: 'QUOTATION_APPROVED', event: 'Customer Approved Quotation', action: 'Mark Approved', actor: 'Amit Sharma', department: 'Sales' },
      { status: 'ORDER_CREATED', event: 'Order Created from Quotation', action: 'Convert to Order', actor: 'Amit Sharma', department: 'Sales' },
      { status: 'ORDER_CONFIRMED', event: 'Order Confirmed by Sales', action: 'Confirm Order', actor: 'Amit Sharma', department: 'Sales' },
    ]),
    createdAt: now,
    updatedAt: now,
  },

  // ── 2. PLANT_PENDING — visible in Plant Head incoming orders ──
  {
    id: 'ORD-002',
    orderNo: 'ORD-002',
    leadId: 'LEAD-002',
    quotationId: 'QT-002',
    quotationRef: 'QT-002',
    customerName: 'XYZ Infra Solutions',
    customer: { ...baseCustomer, id: 'CUST-002', name: 'XYZ Infra Solutions', companyName: 'XYZ Infra Solutions', contactPerson: 'Suresh Patel', mobile: '9876543211', email: 'suresh@xyzinfra.com', gstNumber: '27AAPCS5678G2Z6' },
    deliveryAddress: 'Plot 12, MIDC Phase 2, Pune 411018',
    detailedItems: [{ productId: 'PRD-002', productName: 'FRP Square Manhole Cover 24x24', quantity: 50, unitPrice: 2200, discount: 0, taxRate: 18, code: 'FRP-24X24' }],
    products: 'FRP Square Manhole Cover 24x24 (50 Qty)',
    grandTotal: 129800,
    totalAmount: 129800,
    paymentTerms: '100% advance',
    workflowStatus: 'PLANT_PENDING',
    status: 'PLANT_PENDING',
    currentDepartment: 'Plant Head',
    overallStage: 'Plant Planning',
    priority: 'Medium',
    salesExecutive: 'Priya Singh',
    history: makeTimeline([
      { status: 'LEAD_CREATED', event: 'Lead Created', action: 'Create Lead', actor: 'Priya Singh', department: 'Sales' },
      { status: 'ORDER_CREATED', event: 'Order Created', action: 'Convert to Order', actor: 'Priya Singh', department: 'Sales' },
      { status: 'ORDER_CONFIRMED', event: 'Order Confirmed', action: 'Confirm Order', actor: 'Priya Singh', department: 'Sales' },
      { status: 'PLANT_PENDING', event: 'Order Sent to Plant Head', action: 'Send to Plant Head', actor: 'Priya Singh', department: 'Sales' },
    ]),
    createdAt: now,
    updatedAt: now,
  },

  // ── 2B. PRODUCTION_PLANNED — visible directly in Production Incoming Orders ──
  {
    id: 'ORD-002B',
    orderNo: 'ORD-102',
    leadId: 'LEAD-002B',
    quotationId: 'QT-002B',
    quotationRef: 'QT-002B',
    customerName: 'Global Developers Pvt Ltd',
    customer: { id: 'CUST-102', name: 'Global Developers Pvt Ltd', companyName: 'Global Developers Pvt Ltd', contactPerson: 'Anand Verma', mobile: '9876543219', email: 'anand@globaldev.in', gstNumber: '27AAPCS1122K1Z9' },
    deliveryAddress: 'Phase 3, IT Park Road, Hinjewadi, Pune 411057',
    detailedItems: [{ productId: 'PRD-001', productName: 'RCC Hume Pipe 600mm', quantity: 150, unitPrice: 1800, discount: 5, taxRate: 18, code: 'RCC-600-NP3' }],
    products: 'RCC Hume Pipe 600mm (150 Qty)',
    quantity: 150,
    deliveryDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    grandTotal: 302670,
    totalAmount: 302670,
    paymentTerms: '50% advance, 50% against delivery',
    workflowStatus: 'PRODUCTION_PLANNED',
    status: 'PRODUCTION_PLANNED',
    currentDepartment: 'Production',
    overallStage: 'Production Planning',
    priority: 'High',
    salesExecutive: 'Amit Sharma',
    plan: {
      planId: 'PLAN-102',
      targetDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      startDate: today,
      priority: 'High',
      machine: 'Vibro-Compactor MC-01',
      shift: 'Morning',
      plant: 'Plant A - Haridwar',
      instructions: 'High priority IT park drainage requirement. Use high-early strength cement.',
      remarks: 'Plant Head approved plan. Ready for Work Order activation.',
      status: 'Approved'
    },
    history: makeTimeline([
      { status: 'LEAD_CREATED', event: 'Lead Created', action: 'Create Lead', actor: 'Amit Sharma', department: 'Sales' },
      { status: 'ORDER_CREATED', event: 'Order Created', action: 'Convert to Order', actor: 'Amit Sharma', department: 'Sales' },
      { status: 'ORDER_CONFIRMED', event: 'Order Confirmed', action: 'Confirm Order', actor: 'Amit Sharma', department: 'Sales' },
      { status: 'PLANT_PENDING', event: 'Order Sent to Plant Head', action: 'Send to Plant Head', actor: 'Amit Sharma', department: 'Sales' },
      { status: 'PLANT_ACCEPTED', event: 'Order Accepted by Plant Head', action: 'Accept Order', actor: 'Ravi Plant Head', department: 'Plant Head' },
      { status: 'PRODUCTION_PLANNED', event: 'Production Plan Approved', action: 'Approve Plan', actor: 'Ravi Plant Head', department: 'Plant Head' },
    ]),
    createdAt: now,
    updatedAt: now,
  },

  // ── 3. WORK_ORDER_CREATED — visible in Production work orders ──
  {
    id: 'ORD-003',
    orderNo: 'ORD-003',
    leadId: 'LEAD-003',
    quotationId: 'QT-003',
    quotationRef: 'QT-003',
    workOrderId: 'WO-001',
    workOrderNo: 'WO-001',
    planId: 'PLAN-001',
    customerName: 'Sunrise Builders',
    customer: { id: 'CUST-003', name: 'Sunrise Builders', companyName: 'Sunrise Builders Ltd', contactPerson: 'Vikram Mehta', mobile: '9876543212', email: 'vikram@sunrisebuilders.com', gstNumber: '27AAPCS9012H3Z7' },
    deliveryAddress: 'Survey No. 45, Hadapsar, Pune 411028',
    detailedItems: [{ productId: 'PRD-001', productName: 'RCC Hume Pipe 600mm', quantity: 200, unitPrice: 1800, discount: 8, taxRate: 18, code: 'RCC-600-NP3' }],
    products: 'RCC Hume Pipe 600mm (200 Qty)',
    grandTotal: 390960,
    totalAmount: 390960,
    paymentTerms: '30% advance, 70% on delivery',
    workflowStatus: 'WORK_ORDER_CREATED',
    status: 'WORK_ORDER_CREATED',
    currentDepartment: 'Production',
    overallStage: 'Production',
    priority: 'High',
    salesExecutive: 'Amit Sharma',
    plan: {
      planId: 'PLAN-001',
      targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      startDate: today,
      priority: 'High',
      machine: 'Vibro-Compactor MC-02',
      shift: 'Morning',
      plant: 'Plant A - Haridwar',
      instructions: 'Maintain IS:458 NP3 specifications. Water-cement ratio 0.45.',
      remarks: 'Rush order — customer needs delivery by end of month',
      status: 'Approved'
    },
    history: makeTimeline([
      { status: 'ORDER_CREATED', event: 'Order Created', action: 'Convert to Order', actor: 'Amit Sharma', department: 'Sales' },
      { status: 'PLANT_PENDING', event: 'Sent to Plant Head', action: 'Send to Plant Head', actor: 'Amit Sharma', department: 'Sales' },
      { status: 'PLANT_ACCEPTED', event: 'Order Accepted by Plant Head', action: 'Accept Order', actor: 'Ravi Plant Head', department: 'Plant Head' },
      { status: 'PRODUCTION_PLANNED', event: 'Production Plan Approved', action: 'Approve Plan', actor: 'Ravi Plant Head', department: 'Plant Head' },
      { status: 'WORK_ORDER_CREATED', event: 'Work Order WO-001 Created', action: 'Create Work Order', actor: 'Ravi Plant Head', department: 'Plant Head' },
    ]),
    createdAt: now,
    updatedAt: now,
  },

  // ── 4. IN_PRODUCTION — visible in Production Active ──
  {
    id: 'ORD-004',
    orderNo: 'ORD-004',
    workOrderNo: 'WO-002',
    planId: 'PLAN-002',
    customerName: 'Metro Rail Corp',
    customer: { id: 'CUST-004', name: 'Metro Rail Corp', companyName: 'Metro Rail Corporation Ltd', contactPerson: 'Dinesh Nair', mobile: '9876543213', email: 'dnair@metrorail.com', gstNumber: '27AAPCS3456I4Z8' },
    deliveryAddress: 'Metro Depot, Sector 18, Noida 201301',
    detailedItems: [{ productId: 'PRD-003', productName: 'Precast Box Culvert 1200x1200', quantity: 30, unitPrice: 15000, discount: 10, taxRate: 18, code: 'PBC-1200' }],
    products: 'Precast Box Culvert 1200x1200 (30 Qty)',
    grandTotal: 477900,
    totalAmount: 477900,
    paymentTerms: 'Monthly billing',
    workflowStatus: 'IN_PRODUCTION',
    status: 'IN_PRODUCTION',
    currentDepartment: 'Production',
    overallStage: 'Production',
    priority: 'High',
    salesExecutive: 'Priya Singh',
    plan: {
      planId: 'PLAN-002',
      targetDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      startDate: today,
      machine: 'Casting Press CP-01',
      shift: 'Morning',
      plant: 'Plant B - Dehradun',
      status: 'Approved'
    },
    production: {
      actualStartDate: today,
      machine: 'Casting Press CP-01',
      operator: 'Suresh Kumar',
      shift: 'Morning',
      batchNumber: 'BATCH-2026-001',
      plannedQty: 30,
      producedQty: 18,
      rejectedQty: 1,
      balanceQty: 12,
    },
    history: makeTimeline([
      { status: 'WORK_ORDER_CREATED', event: 'Work Order Created', action: 'Create Work Order', actor: 'Plant Head', department: 'Plant Head' },
      { status: 'PRODUCTION_ACCEPTED', event: 'Work Order Accepted by Production', action: 'Accept Work Order', actor: 'Suresh Kumar', department: 'Production' },
      { status: 'IN_PRODUCTION', event: 'Production Started — Batch BATCH-2026-001', action: 'Start Production', actor: 'Suresh Kumar', department: 'Production' },
    ]),
    createdAt: now,
    updatedAt: now,
  },

  // ── 5. PRODUCTION_COMPLETED — visible in QC Pending ──
  {
    id: 'ORD-005',
    orderNo: 'ORD-005',
    workOrderNo: 'WO-003',
    customerName: 'Green Valley Township',
    customer: { id: 'CUST-005', name: 'Green Valley Township', companyName: 'Green Valley Township Pvt Ltd', contactPerson: 'Anita Sharma', mobile: '9876543214', email: 'anita@greenvalley.com', gstNumber: '27AAPCS7890J5Z9' },
    deliveryAddress: 'Green Valley Phase 3, Thane 400601',
    detailedItems: [{ productId: 'PRD-004', productName: 'RCC Manhole Cover D-400', quantity: 75, unitPrice: 2500, discount: 5, taxRate: 18, code: 'MH-D400' }],
    products: 'RCC Manhole Cover D-400 (75 Qty)',
    grandTotal: 222281,
    totalAmount: 222281,
    paymentTerms: '100% on delivery',
    workflowStatus: 'PRODUCTION_COMPLETED',
    status: 'PRODUCTION_COMPLETED',
    currentDepartment: 'QC',
    overallStage: 'Quality Control',
    priority: 'Medium',
    salesExecutive: 'Amit Sharma',
    production: {
      actualStartDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      machine: 'Hydraulic Press HP-03',
      operator: 'Vijay Verma',
      shift: 'Afternoon',
      batchNumber: 'BATCH-2026-002',
      plannedQty: 75,
      producedQty: 75,
      rejectedQty: 0,
      balanceQty: 0,
    },
    history: makeTimeline([
      { status: 'WORK_ORDER_CREATED', event: 'Work Order Created', action: 'Create Work Order', actor: 'Plant Head', department: 'Plant Head' },
      { status: 'IN_PRODUCTION', event: 'Production Started', action: 'Start Production', actor: 'Vijay Verma', department: 'Production' },
      { status: 'PRODUCTION_COMPLETED', event: 'Production Completed — All 75 units produced', action: 'Complete Production', actor: 'Vijay Verma', department: 'Production' },
    ]),
    createdAt: now,
    updatedAt: now,
  },

  // ── 6. QC_APPROVED — visible in Dispatch Orders ──
  {
    id: 'ORD-006',
    orderNo: 'ORD-006',
    workOrderNo: 'WO-004',
    customerName: 'State PWD',
    customer: { id: 'CUST-006', name: 'State PWD', companyName: 'State Public Works Department', contactPerson: 'Kumar Anand', mobile: '9876543215', email: 'kanand@pwd.gov.in', gstNumber: '27GOVT0001K6Z0' },
    deliveryAddress: 'NH-48, Road Works Depot, Nashik 422001',
    detailedItems: [{ productId: 'PRD-001', productName: 'RCC Hume Pipe 600mm', quantity: 150, unitPrice: 1800, discount: 10, taxRate: 18, code: 'RCC-600-NP3' }],
    products: 'RCC Hume Pipe 600mm (150 Qty)',
    grandTotal: 285012,
    totalAmount: 285012,
    paymentTerms: 'Government payment 45 days',
    workflowStatus: 'QC_APPROVED',
    status: 'QC_APPROVED',
    currentDepartment: 'Dispatch',
    overallStage: 'Dispatch',
    priority: 'High',
    salesExecutive: 'Priya Singh',
    production: { producedQty: 150, rejectedQty: 2, batchNumber: 'BATCH-2026-003' },
    qc: {
      inspectorName: 'QC Inspector Rahul',
      inspectionDate: today,
      dimensionResult: 'Pass',
      weightResult: 'Pass',
      strengthResult: 'Pass',
      finishResult: 'Pass',
      colorResult: 'Pass',
      overallResult: 'Pass',
      acceptedQty: 150,
      rejectedQty: 0,
      remarks: 'All units meet IS:458 NP3 specifications'
    },
    history: makeTimeline([
      { status: 'PRODUCTION_COMPLETED', event: 'Production Completed', action: 'Complete Production', actor: 'Production Floor', department: 'Production' },
      { status: 'PRODUCTION_COMPLETED', event: 'Sent to QC', action: 'Send to QC', actor: 'Production Lead', department: 'QC' },
      { status: 'QC_APPROVED', event: 'QC Inspection Passed — Ready for Dispatch', action: 'Approve Batch', actor: 'QC Inspector Rahul', department: 'QC' },
    ]),
    createdAt: now,
    updatedAt: now,
  },

  // ── 7. INVOICED — visible in Finance Invoices ──
  {
    id: 'ORD-007',
    orderNo: 'ORD-007',
    workOrderNo: 'WO-005',
    customerName: 'Reliance Infrastructure',
    customer: { id: 'CUST-007', name: 'Reliance Infrastructure', companyName: 'Reliance Infrastructure Ltd', contactPerson: 'Amit Kapoor', mobile: '9876543216', email: 'akapoor@relianceinfra.com', gstNumber: '27AAACR5055K1Z5' },
    deliveryAddress: 'Jamnagar Industrial Area, Gujarat 361004',
    detailedItems: [{ productId: 'PRD-005', productName: 'Prestressed Concrete Pile 300mm', quantity: 40, unitPrice: 8500, discount: 5, taxRate: 18, code: 'PSC-300' }],
    products: 'Prestressed Concrete Pile 300mm (40 Qty)',
    grandTotal: 381060,
    totalAmount: 381060,
    paymentTerms: '60-day credit',
    workflowStatus: 'INVOICED',
    status: 'INVOICED',
    currentDepartment: 'Finance',
    overallStage: 'Billing',
    priority: 'Medium',
    salesExecutive: 'Amit Sharma',
    dispatch: {
      vehicleNo: 'GJ-05-AB-1234',
      driverName: 'Ramu Lal',
      dispatchDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      actualDeliveryDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      receiverName: 'Depot Incharge',
      receivedQty: 40,
      lrNumber: 'LR-2026-5521',
    },
    invoice: {
      invoiceId: 'INV-001',
      invoiceNumber: 'INV-2026-001',
      invoiceDate: today,
      amount: 381060,
      paidAmount: 0,
      balanceAmount: 381060,
    },
    history: makeTimeline([
      { status: 'QC_APPROVED', event: 'QC Approved', action: 'Approve Batch', actor: 'QC Team', department: 'QC' },
      { status: 'DISPATCH_PENDING', event: 'Dispatch Prepared', action: 'Create Dispatch', actor: 'Dispatch Team', department: 'Dispatch' },
      { status: 'IN_TRANSIT', event: 'Vehicle Dispatched — GJ-05-AB-1234', action: 'Dispatch', actor: 'Dispatch Team', department: 'Dispatch' },
      { status: 'DELIVERED', event: 'Delivered to Jamnagar Depot', action: 'Confirm Delivery', actor: 'Dispatch Team', department: 'Dispatch' },
      { status: 'INVOICED', event: 'Invoice INV-2026-001 Generated', action: 'Generate Invoice', actor: 'System', department: 'Finance' },
    ]),
    createdAt: now,
    updatedAt: now,
  },

  // ── 8. PAYMENT_PENDING — visible in Finance Payments + Finance Executive ──
  {
    id: 'ORD-008',
    orderNo: 'ORD-008',
    workOrderNo: 'WO-006',
    customerName: 'National Highway Authority',
    customer: { id: 'CUST-008', name: 'National Highway Authority', companyName: 'NHAI', contactPerson: 'DK Sharma', mobile: '9876543217', email: 'dksharma@nhai.gov.in', gstNumber: '07AAACN0001A1ZH' },
    deliveryAddress: 'NH-44 Project Site, Bhopal 462001',
    detailedItems: [{ productId: 'PRD-001', productName: 'RCC Hume Pipe 600mm', quantity: 500, unitPrice: 1800, discount: 12, taxRate: 18, code: 'RCC-600-NP3' }],
    products: 'RCC Hume Pipe 600mm (500 Qty)',
    grandTotal: 938016,
    totalAmount: 938016,
    paymentTerms: 'Government — 60 days after delivery',
    workflowStatus: 'PAYMENT_PENDING',
    status: 'PAYMENT_PENDING',
    currentDepartment: 'Finance Executive',
    overallStage: 'Payment Verification',
    priority: 'High',
    salesExecutive: 'Priya Singh',
    invoice: {
      invoiceId: 'INV-002',
      invoiceNumber: 'INV-2026-002',
      invoiceDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      amount: 938016,
      paidAmount: 938016,
      balanceAmount: 0,
    },
    payment: {
      amount: 938016,
      paymentDate: today,
      paymentMode: 'RTGS',
      transactionReference: 'UTR-2026-NHAI-001',
      utrNumber: 'UTR-2026-NHAI-001',
      remarks: 'Full payment received against INV-2026-002'
    },
    history: makeTimeline([
      { status: 'DELIVERED', event: 'Delivered to Project Site', action: 'Confirm Delivery', actor: 'Dispatch Team', department: 'Dispatch' },
      { status: 'INVOICED', event: 'Invoice Generated', action: 'Generate Invoice', actor: 'Finance Team', department: 'Finance' },
      { status: 'PAYMENT_PENDING', event: 'Payment Recorded — RTGS ₹9,38,016', action: 'Record Payment', actor: 'Sales Team', department: 'Finance' },
    ]),
    createdAt: now,
    updatedAt: now,
  }
];

export const mockCustomers = [
  { id: 'CUST-001', companyName: 'ABC Infrastructure Pvt Ltd', contact: 'Rajesh Kumar', totalOrders: 12, lifetimeRevenue: 2650000, creditLimit: 500000, status: 'Active', gstNumber: '27AAPCS1234F1Z5' },
  { id: 'CUST-002', companyName: 'XYZ Infra Solutions', contact: 'Suresh Patel', totalOrders: 5, lifetimeRevenue: 850000, creditLimit: 200000, status: 'Active', gstNumber: '27AAPCS5678G2Z6' },
  { id: 'CUST-003', companyName: 'Sunrise Builders Ltd', contact: 'Vikram Mehta', totalOrders: 8, lifetimeRevenue: 1200000, creditLimit: 300000, status: 'Active' },
];

export const mockPayments = [
  {
    id: 'PAY-001',
    order_id: 'ORD-008',
    order_number: 'ORD-008',
    customer_name: 'National Highway Authority',
    amount: 938016,
    payment_mode: 'RTGS',
    transaction_reference: 'UTR-2026-NHAI-001',
    status: 'Pending',
    remarks: 'Full payment received against INV-2026-002',
    payment_date: new Date().toISOString().split('T')[0],
    invoice_number: 'INV-2026-002',
    createdDate: new Date().toISOString()
  }
];
