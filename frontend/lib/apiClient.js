/**
 * Himalaya ERP — Mock API Client
 * ─────────────────────────────────────────────────────────────
 * All requests are intercepted and handled in-memory using mockDB
 * (localStorage-backed). No real network calls for prototype data.
 *
 * Core rule: ONE Order record moves through all departments.
 * Status + currentDepartment control which panel sees it.
 * Every status change appends a timeline event to order.history.
 * ─────────────────────────────────────────────────────────────
 */

import { delay } from './delay';
import { mockDB, makeTimelineEvent, advanceOrder } from './mockDB';

// ── Status / Department constants ────────────────────────────
const S = {
  LEAD_CREATED:        'LEAD_CREATED',
  SAMPLE_REQUIRED:     'SAMPLE_REQUIRED',
  QUOTATION_CREATED:   'QUOTATION_CREATED',
  QUOTATION_SENT:      'QUOTATION_SENT',
  QUOTATION_APPROVED:  'QUOTATION_APPROVED',
  ORDER_CREATED:       'ORDER_CREATED',
  ORDER_CONFIRMED:     'ORDER_CONFIRMED',
  PLANT_PENDING:       'PLANT_PENDING',
  PLANT_ACCEPTED:      'PLANT_ACCEPTED',
  PLANT_REJECTED:      'PLANT_REJECTED',
  PRODUCTION_PLANNED:  'PRODUCTION_PLANNED',
  WORK_ORDER_CREATED:  'WORK_ORDER_CREATED',
  PRODUCTION_ACCEPTED: 'PRODUCTION_ACCEPTED',
  IN_PRODUCTION:       'IN_PRODUCTION',
  PRODUCTION_COMPLETED:'PRODUCTION_COMPLETED',
  REWORK:              'REWORK',
  QC_PENDING:          'QC_PENDING',
  QC_APPROVED:         'QC_APPROVED',
  QC_FAILED:           'QC_FAILED',
  DISPATCH_PENDING:    'DISPATCH_PENDING',
  IN_TRANSIT:          'IN_TRANSIT',
  DELIVERED:           'DELIVERED',
  INVOICED:            'INVOICED',
  PAYMENT_PENDING:     'PAYMENT_PENDING',
  PAYMENT_VERIFIED:    'PAYMENT_VERIFIED',
  CLOSED:              'CLOSED',
};

function ok(data, message = 'Success') {
  return { success: true, data, message };
}
function err(message = 'Error', errors = null) {
  return { success: false, data: null, message, errors };
}

// ── Path helpers ─────────────────────────────────────────────
function pathMatches(path, pattern) {
  const pathParts = path.split('/').filter(Boolean);
  const patParts = pattern.split('/').filter(Boolean);
  if (pathParts.length !== patParts.length) return false;
  const params = {};
  for (let i = 0; i < patParts.length; i++) {
    if (patParts[i].startsWith(':')) {
      params[patParts[i].slice(1)] = pathParts[i];
    } else if (patParts[i] !== pathParts[i]) {
      return false;
    }
  }
  return params;
}

function extractOrderId(path) {
  // Try to find an order by ID from path segments
  const segments = path.split('/').filter(Boolean);
  const collections = ['orders', 'leads', 'quotations', 'payments', 'samples'];
  for (let i = 0; i < segments.length - 1; i++) {
    if (collections.some(c => segments[i].includes(c) || segments[i] === c.replace(/s$/, ''))) {
      return segments[i + 1];
    }
  }
  // Last resort: last non-action segment
  const actions = ['confirm', 'accept', 'reject', 'plan', 'work-order', 'start', 'complete', 'approve', 'fail', 'dispatch', 'deliver', 'invoice', 'payment', 'verify', 'close', 'hold', 'create'];
  for (let i = segments.length - 1; i >= 0; i--) {
    if (!actions.includes(segments[i])) return segments[i];
  }
  return null;
}

function getOrderByIdFromPath(path) {
  const id = extractOrderId(path);
  if (!id) return null;
  const orders = mockDB.get('orders');
  return orders.find(o => o.id === id || o.orderNo === id) || null;
}

// ── GET handlers ─────────────────────────────────────────────
async function handleGet(path, options = {}) {
  await delay(200);

  const orders = mockDB.get('orders');
  const leads = mockDB.get('leads');
  const quotations = mockDB.get('quotations');
  const customers = mockDB.get('customers');
  const payments = mockDB.get('payments');
  const samples = mockDB.get('samples');

  // ── Sales ───────────────────────────────────────────────
  // Mocks for Sales (Leads, Samples, Quotations, Orders) have been disabled.
  // These requests will now fall through and hit the real backend API.
  if (path === '/admin-ops/customers') {
    return { ...ok(customers), customers };
  }
  if (path === '/finance/payments') {
    return { ...ok(payments), payments };
  }

  // ── Plant Head ──────────────────────────────────────────
  if (path === '/plant-head/incoming-orders' || path === '/plant-head/planning-orders') {
    const incoming = orders.filter(o =>
      [S.PLANT_PENDING, S.PLANT_ACCEPTED].includes(o.workflowStatus)
    );
    return { ...ok(incoming), orders: incoming };
  }
  if (path === '/plant-head/planning') {
    const planning = orders.filter(o =>
      [S.PLANT_ACCEPTED, S.PRODUCTION_PLANNED].includes(o.workflowStatus)
    );
    return { ...ok(planning), orders: planning };
  }
  if (path === '/plant-head/work-orders') {
    const wos = orders.filter(o =>
      [S.PRODUCTION_PLANNED, S.WORK_ORDER_CREATED].includes(o.workflowStatus)
    );
    return { ...ok(wos), orders: wos };
  }
  if (path.includes('/plant-head/dashboard-data')) {
    const active = orders.filter(o => o.workflowStatus === S.IN_PRODUCTION).length;
    const planned = orders.filter(o => [S.WORK_ORDER_CREATED, S.PRODUCTION_ACCEPTED].includes(o.workflowStatus)).length;
    const qcPending = orders.filter(o => o.workflowStatus === S.PRODUCTION_COMPLETED).length;
    const pending = orders.filter(o => [S.PLANT_PENDING, S.PLANT_ACCEPTED].includes(o.workflowStatus)).length;
    return ok({
      production: { planned, inProduction: active, qcPending, pendingApproval: pending, completedToday: 3, delayed: 0, efficiency: 94 },
      dispatch: { readyForDispatch: orders.filter(o => o.workflowStatus === S.QC_APPROVED).length, vehicleStatus: '4/5 Active' },
      store: { lowStockItems: 3, outOfStock: 0 },
      qc: { inspectedToday: 12, passed: 11, failed: 1, passRate: 92 },
      financial: { receivables: 1450000, payables: 45000 }
    });
  }
  if (path.includes('/plant-head/overview/departments')) {
    return ok({
      alerts: [], store: { materialPending: 1, lowStock: 3, deadStock: 8 },
      production: { runningOrders: orders.filter(o => o.workflowStatus === S.IN_PRODUCTION).length, pendingOrders: orders.filter(o => [S.PLANT_PENDING, S.PLANT_ACCEPTED].includes(o.workflowStatus)).length },
      pipeline: { salesOrders: orders.filter(o => o.workflowStatus === S.PLANT_PENDING).length }
    });
  }
  if (path.includes('/plant-head/analytics/production')) {
    return ok({ categories: [{ category: 'RCC Pipes', volume: 120 }], trend: [], machines: [], employeeProductivity: [] });
  }
  if (path.includes('/plant-head/analytics/material')) {
    return ok({ materials: [], monthlyTrends: [], wastage: [] });
  }
  if (path.includes('/plant-head/material-indents')) {
    return ok([]);
  }

  // ── Production ──────────────────────────────────────────
  if (path === '/production/work-orders') {
    const wos = orders.filter(o => [S.WORK_ORDER_CREATED, S.PRODUCTION_ACCEPTED, S.IN_PRODUCTION, S.PAUSED, S.REWORK, S.PRODUCTION_COMPLETED, S.QC_PENDING, 'WORK_ORDER_CREATED', 'PRODUCTION_ACCEPTED', 'IN_PRODUCTION', 'PAUSED', 'REWORK', 'PRODUCTION_ASSIGNED', 'PLANNED', 'PRODUCTION_PLANNED', 'PLANT_ACCEPTED', 'Completed', 'PRODUCTION_COMPLETED', 'QC_PENDING'].includes(o.workflowStatus || o.status)).map(o => ({
      ...o,
      id: o.workOrderId || o.workOrderNo || `WO-${String(o.orderNo || o.id || '').split('-').slice(1).join('-') || o.id}`,
      dbId: o.id,
      orderNo: o.orderNo || o.id,
      status: o.status || o.workflowStatus || S.WORK_ORDER_CREATED
    }));
    return { ...ok(wos), orders: wos, 'work-orders': wos, workOrders: wos };
  }
  if (path === '/production/active') {
    const active = orders.filter(o => [S.IN_PRODUCTION, S.PAUSED, S.REWORK, 'IN_PRODUCTION', 'PAUSED', 'REWORK'].includes(o.workflowStatus || o.status));
    return { ...ok(active), orders: active, workOrders: active };
  }
  if (path === '/production/completed') {
    const completed = orders.filter(o => [S.PRODUCTION_COMPLETED, 'PRODUCTION_COMPLETED'].includes(o.workflowStatus || o.status));
    return { ...ok(completed), orders: completed, workOrders: completed };
  }

  // ── QC ─────────────────────────────────────────────────
  if (path === '/qc/pending') {
    const pending = orders.filter(o => [S.PRODUCTION_COMPLETED, S.QC_PENDING].includes(o.workflowStatus));
    return { ...ok(pending), orders: pending };
  }
  if (path === '/qc/approved') {
    const approved = orders.filter(o => o.workflowStatus === S.QC_APPROVED);
    return { ...ok(approved), orders: approved };
  }
  if (path === '/qc/rejected') {
    const rejected = orders.filter(o => o.workflowStatus === S.QC_FAILED);
    return { ...ok(rejected), orders: rejected };
  }

  // ── Dispatch ────────────────────────────────────────────
  if (path === '/dispatch/orders') {
    const dispOrders = orders.filter(o => o.workflowStatus === S.QC_APPROVED);
    return { ...ok(dispOrders), orders: dispOrders };
  }
  if (path === '/dispatch/gate-pass') {
    const gatePasses = orders.filter(o => o.workflowStatus === S.DISPATCH_PENDING);
    return { ...ok(gatePasses), orders: gatePasses };
  }
  if (path === '/dispatch/tracking') {
    const tracking = orders.filter(o => o.workflowStatus === S.IN_TRANSIT);
    return { ...ok(tracking), orders: tracking };
  }
  if (path === '/dispatch/delivered') {
    const delivered = orders.filter(o => [S.DELIVERED, S.INVOICED, S.PAYMENT_PENDING, S.CLOSED].includes(o.workflowStatus));
    return { ...ok(delivered), orders: delivered };
  }

  // ── Finance ─────────────────────────────────────────────
  if (path === '/finance/invoices') {
    const invoices = orders.filter(o => [S.DELIVERED, S.INVOICED, S.PAYMENT_PENDING, S.PAYMENT_VERIFIED, S.CLOSED].includes(o.workflowStatus));
    return { ...ok(invoices), orders: invoices };
  }
  if (path === '/finance/payments' || path === '/finance/payments/pending') {
    const paymentsData = mockDB.get('payments');
    return { ...ok(paymentsData), payments: paymentsData };
  }
  if (path === '/finance/ledger') {
    const ledger = orders.filter(o => [S.INVOICED, S.PAYMENT_PENDING, S.PAYMENT_VERIFIED, S.CLOSED].includes(o.workflowStatus));
    return { ...ok(ledger), orders: ledger };
  }
  if (path === '/finance/receivables' || path === '/finance/outstanding') {
    const outstanding = orders.filter(o => [S.INVOICED, S.PAYMENT_PENDING].includes(o.workflowStatus));
    return { ...ok(outstanding), orders: outstanding };
  }
  if (path.includes('/reports/finance')) {
    return ok({ revenue: 5000000, expense: 2000000, profit: 3000000, incoming: 4000000, outgoing: 1500000 });
  }

  // ── Finance Executive ────────────────────────────────────
  if (path.includes('/finance-executive/payment-verifications') || path.includes('/v1/finance-executive/payment-verifications')) {
    const paymentsData = mockDB.get('payments');
    const urlParams = new URLSearchParams(path.split('?')[1] || '');
    const statusFilter = urlParams.get('status') || 'Pending';
    const searchFilter = urlParams.get('search') || '';

    let filtered = paymentsData.map(payment => {
      const orderRef = payment.order_id || payment.order_number || payment.orderNo || payment.orderId;
      const order = orders.find(o => String(o.id) === String(orderRef) || String(o.orderNo) === String(orderRef));
      const total = Number(payment.grand_total || payment.totalOrderValue || order?.grandTotal || order?.totalAmount || payment.amount || 0);
      const requested = Number(payment.payment_amount || payment.amount || 0);
      const verified = Number(payment.verified_paid_amount || payment.verifiedPaidAmount || 0);

      return {
        ...payment,
        payment_id: payment.payment_id || payment.paymentId || payment.id,
        order_number: payment.order_number || payment.orderNo || order?.orderNo || order?.id,
        customer_name: payment.customer_name || payment.customerName || order?.customerName || order?.customer?.name,
        grand_total: total,
        payment_amount: requested,
        verified_paid_amount: verified,
        balance_amount: Math.max(0, total - verified - requested),
        payment_mode: payment.payment_mode || payment.paymentMode || order?.payment?.paymentMode,
        transaction_reference: payment.transaction_reference || payment.transactionReference || order?.payment?.transactionReference
      };
    });
    if (statusFilter !== 'All') {
      filtered = filtered.filter(p => {
        const status = String(p.status || 'Pending').toLowerCase();
        if (statusFilter === 'Pending') return status.includes('pending');
        if (statusFilter === 'Verified') return status.includes('verified') || status === 'paid';
        if (statusFilter === 'Rejected') return status.includes('rejected');
        return status === statusFilter.toLowerCase();
      });
    }
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      filtered = filtered.filter(p =>
        (p.transaction_reference || '').toLowerCase().includes(q) ||
        (p.customer_name || '').toLowerCase().includes(q) ||
        (p.order_number || '').toLowerCase().includes(q)
      );
    }
    return ok(filtered);
  }

  // ── Purchase Module GET (Sync with erpStore localStorage) ──
  if (path.startsWith('/purchase/')) {
    const cleanPath = path.split('?')[0];
    if (cleanPath === '/purchase/seed-1605-flow') {
      if (typeof window !== 'undefined') {
        const timestamp = new Date().toISOString();
        const futureDate = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];
        const indents = [
          { id: "IND-2026-1605-PLANT", material: "RM-1605 High-Tensile Steel Sheets", materialName: "RM-1605 High-Tensile Steel Sheets", quantity: 1605, unit: "Sheets", priority: "High", status: "PENDING_PLANT_HEAD_APPROVAL", department: "Raw Material Store", requestedBy: "Store Executive (Rajesh Kumar)", requiredDate: futureDate, notes: "Immediate requirement for Batch #1605 Q3 cap", items: [{ material: "RM-1605 High-Tensile Steel Sheets", name: "RM-1605 High-Tensile Steel Sheets", quantity: 1605, unit: "Sheets", quantity_ordered: 1605, estimatedRate: 350 }], createdAt: timestamp },
          { id: "IND-2026-1605-FIN", material: "RM-1605 Precision Rods (12mm)", materialName: "RM-1605 Precision Rods (12mm)", quantity: 1605, unit: "Rods", priority: "High", status: "PLANT_HEAD_APPROVED", department: "Production Assembly", requestedBy: "Assembly Lead (Suresh Patil)", requiredDate: futureDate, plantHeadRemarks: "Quantity 1605 rods verified against BOM schedule. Approved for Finance.", notes: "Required for precision structural frame", items: [{ material: "RM-1605 Precision Rods (12mm)", name: "RM-1605 Precision Rods (12mm)", quantity: 1605, unit: "Rods", quantity_ordered: 1605, estimatedRate: 450 }], createdAt: timestamp }
        ];
        const pos = [
          { id: "PO-2026-1605-SUPER", poNumber: "PO-2026-1605-SUPER", vendorId: "V-001", vendorName: "Apex Raw Materials Ltd.", paymentTerms: "30 Days Net", expectedDate: futureDate, orderedQty: 1605, quantity: 1605, status: "PENDING_SUPER_ADMIN_APPROVAL", totalAmount: 1605 * 450, grandTotal: Math.round((1605 * 450 * 1.18) + 2500), items: [{ name: "RM-1605 Precision Rods (12mm)", quantity: 1605, unit: "Rods", rate: 450, total: 1605 * 450 }], createdAt: timestamp },
          { id: "PO-2026-1605-STORE", poNumber: "PO-2026-1605-STORE", vendorId: "V-002", vendorName: "Global Tech Suppliers", paymentTerms: "30 Days Net", expectedDate: futureDate, orderedQty: 1605, quantity: 1605, status: "PO_ISSUED", issuedAt: timestamp, totalAmount: 1605 * 350, grandTotal: Math.round((1605 * 350 * 1.18) + 2500), items: [{ name: "RM-1605 High-Tensile Steel Sheets", quantity: 1605, unit: "Sheets", rate: 350, total: 1605 * 350 }], createdAt: timestamp }
        ];
        window.localStorage.setItem('erp_purchase_indents', JSON.stringify(indents));
        window.localStorage.setItem('erp_purchase_orders', JSON.stringify(pos));
        window.dispatchEvent(new Event('storage'));
      }
      return ok({ seeded: true, message: "Successfully seeded 1605 quantity procurement orders across all departments!" });
    }
    if (cleanPath === '/purchase/orders' || cleanPath.startsWith('/purchase/orders/')) {
      const storedPOs = JSON.parse((typeof window !== 'undefined' && window.localStorage.getItem('erp_purchase_orders')) || '[]');
      if (cleanPath !== '/purchase/orders') {
        const id = cleanPath.split('/').pop();
        const po = storedPOs.find(p => String(p.id) === id || String(p.poNumber) === id);
        return po ? ok(po) : err('Purchase Order not found');
      }
      return ok(storedPOs);
    }
    if (cleanPath === '/purchase/grns' || cleanPath.startsWith('/purchase/grns/')) {
      const storedGRNs = JSON.parse((typeof window !== 'undefined' && window.localStorage.getItem('erp_goods_receipts')) || '[]');
      if (cleanPath !== '/purchase/grns') {
        const id = cleanPath.split('/').pop();
        const grn = storedGRNs.find(g => String(g.id) === id || String(g.grnNumber) === id);
        return grn ? ok(grn) : err('GRN not found');
      }
      return ok(storedGRNs);
    }
    if (cleanPath === '/purchase/vendors' || cleanPath.startsWith('/purchase/vendors/')) {
      const storedVendors = JSON.parse((typeof window !== 'undefined' && window.localStorage.getItem('erp_purchase_vendors')) || 'null');
      const defaultVendors = [
        { id: 'V-001', name: 'Apex Raw Materials Ltd.', is_active: true, rating: 4.8 },
        { id: 'V-002', name: 'Global Tech Suppliers', is_active: true, rating: 4.5 },
        { id: 'V-003', name: 'Standard Steel Works', is_active: true, rating: 4.2 }
      ];
      const vendors = storedVendors || defaultVendors;
      if (cleanPath !== '/purchase/vendors') {
        const id = cleanPath.split('/').pop();
        const vendor = vendors.find(v => String(v.id) === id);
        return vendor ? ok(vendor) : err('Vendor not found');
      }
      return ok(vendors);
    }
  }

  // ── Generic collection GET ───────────────────────────────
  const segments = path.split('/').filter(Boolean);
  const collections = ['leads', 'quotations', 'orders', 'customers', 'payments', 'samples', 'dispatches'];
  for (const seg of segments) {
    if (collections.includes(seg)) {
      const id = segments[segments.indexOf(seg) + 1];
      if (id && !['status', 'confirm', 'plan', 'approve'].includes(id)) {
        const item = mockDB.getById(seg, id);
        return item ? ok(item) : err('Not found');
      }
      const data = mockDB.get(seg);
      return { ...ok(data), [seg]: data };
    }
  }

  return ok([]);
}

// ── POST handlers ─────────────────────────────────────────────
async function handlePost(path, body = {}) {
  await delay(250);

  // ── Purchase Module POST (Sync with erpStore localStorage) ──
  if (path.startsWith('/purchase/')) {
    const cleanPath = path.split('?')[0];
    if (cleanPath === '/purchase/seed-1605-flow') {
      if (typeof window !== 'undefined') {
        const timestamp = new Date().toISOString();
        const futureDate = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];
        const indents = [
          { id: "IND-2026-1605-PLANT", material: "RM-1605 High-Tensile Steel Sheets", materialName: "RM-1605 High-Tensile Steel Sheets", quantity: 1605, unit: "Sheets", priority: "High", status: "PENDING_PLANT_HEAD_APPROVAL", department: "Raw Material Store", requestedBy: "Store Executive (Rajesh Kumar)", requiredDate: futureDate, notes: "Immediate requirement for Batch #1605 Q3 cap", items: [{ material: "RM-1605 High-Tensile Steel Sheets", name: "RM-1605 High-Tensile Steel Sheets", quantity: 1605, unit: "Sheets", quantity_ordered: 1605, estimatedRate: 350 }], createdAt: timestamp },
          { id: "IND-2026-1605-FIN", material: "RM-1605 Precision Rods (12mm)", materialName: "RM-1605 Precision Rods (12mm)", quantity: 1605, unit: "Rods", priority: "High", status: "PLANT_HEAD_APPROVED", department: "Production Assembly", requestedBy: "Assembly Lead (Suresh Patil)", requiredDate: futureDate, plantHeadRemarks: "Quantity 1605 rods verified against BOM schedule. Approved for Finance.", notes: "Required for precision structural frame", items: [{ material: "RM-1605 Precision Rods (12mm)", name: "RM-1605 Precision Rods (12mm)", quantity: 1605, unit: "Rods", quantity_ordered: 1605, estimatedRate: 450 }], createdAt: timestamp }
        ];
        const pos = [
          { id: "PO-2026-1605-SUPER", poNumber: "PO-2026-1605-SUPER", vendorId: "V-001", vendorName: "Apex Raw Materials Ltd.", paymentTerms: "30 Days Net", expectedDate: futureDate, orderedQty: 1605, quantity: 1605, status: "PENDING_SUPER_ADMIN_APPROVAL", totalAmount: 1605 * 450, grandTotal: Math.round((1605 * 450 * 1.18) + 2500), items: [{ name: "RM-1605 Precision Rods (12mm)", quantity: 1605, unit: "Rods", rate: 450, total: 1605 * 450 }], createdAt: timestamp },
          { id: "PO-2026-1605-STORE", poNumber: "PO-2026-1605-STORE", vendorId: "V-002", vendorName: "Global Tech Suppliers", paymentTerms: "30 Days Net", expectedDate: futureDate, orderedQty: 1605, quantity: 1605, status: "PO_ISSUED", issuedAt: timestamp, totalAmount: 1605 * 350, grandTotal: Math.round((1605 * 350 * 1.18) + 2500), items: [{ name: "RM-1605 High-Tensile Steel Sheets", quantity: 1605, unit: "Sheets", rate: 350, total: 1605 * 350 }], createdAt: timestamp }
        ];
        window.localStorage.setItem('erp_purchase_indents', JSON.stringify(indents));
        window.localStorage.setItem('erp_purchase_orders', JSON.stringify(pos));
        window.dispatchEvent(new Event('storage'));
      }
      return ok({ seeded: true, message: "Successfully seeded 1605 quantity procurement orders across all departments!" });
    }
    if (cleanPath === '/purchase/orders') {
      const storedPOs = JSON.parse((typeof window !== 'undefined' && window.localStorage.getItem('erp_purchase_orders')) || '[]');
      const newPO = {
        id: body.id || `PO-${Date.now()}`,
        poNumber: body.poNumber || body.purchase_order_number || `PO-${Date.now().toString().slice(-6)}`,
        purchase_order_number: body.purchase_order_number || body.poNumber || `PO-${Date.now().toString().slice(-6)}`,
        status: body.status || 'DRAFT',
        vendorName: body.vendorName || body.supplier?.name || 'Authorized Vendor',
        totalAmount: body.totalAmount || body.total_amount || 0,
        createdAt: new Date().toISOString(),
        ...body
      };
      const updatedPOs = [newPO, ...storedPOs];
      if (typeof window !== 'undefined') window.localStorage.setItem('erp_purchase_orders', JSON.stringify(updatedPOs));
      return ok(newPO, 'Purchase Order created');
    }
    if (cleanPath === '/purchase/grns') {
      const storedGRNs = JSON.parse((typeof window !== 'undefined' && window.localStorage.getItem('erp_goods_receipts')) || '[]');
      const newGRN = {
        id: body.id || `GRN-${Date.now()}`,
        grnNumber: body.grnNumber || `GRN-${Date.now().toString().slice(-6)}`,
        status: body.status || 'GRN_SUBMITTED',
        createdAt: new Date().toISOString(),
        ...body
      };
      const updatedGRNs = [newGRN, ...storedGRNs];
      if (typeof window !== 'undefined') window.localStorage.setItem('erp_goods_receipts', JSON.stringify(updatedGRNs));
      return ok(newGRN, 'GRN created');
    }
    if (cleanPath === '/purchase/vendors') {
      const storedVendors = JSON.parse((typeof window !== 'undefined' && window.localStorage.getItem('erp_purchase_vendors')) || '[]');
      const newVendor = {
        id: body.id || `V-${Date.now()}`,
        is_active: true,
        createdAt: new Date().toISOString(),
        ...body
      };
      const updatedVendors = [newVendor, ...storedVendors];
      if (typeof window !== 'undefined') window.localStorage.setItem('erp_purchase_vendors', JSON.stringify(updatedVendors));
      return ok(newVendor, 'Vendor created');
    }
  }

  // ── Sales: Create APIs ──────────────────────────────────
  // POST Mocks for Sales (Leads, Samples, Orders, Quotations) disabled.

  // ── Workflow Transition (generic) ───────────────────────
  if (path.includes('/workflow/transition') || path.includes('/payment-verification/request')) {
    const transitionName = body?.transitionName;
    const entityId = body?.entityId || body?.orderNo || body?.orderId;
    const payload = body?.payload || body || {};

    const orders = mockDB.get('orders');
    const order = orders.find(o => 
      String(o.id) === String(entityId) || 
      String(o.orderNo) === String(entityId) ||
      (o.work_order_ids && Array.isArray(o.work_order_ids) && o.work_order_ids.includes(String(entityId))) ||
      String(o.workOrderNo) === String(entityId) ||
      String(o.workOrderId) === String(entityId) ||
      `WO-${String(o.orderNo || '').split('-')[1]}` === String(entityId) ||
      `WO-${String(o.id)}` === String(entityId)
    );

    if (transitionName === 'RECORD_PAYMENT' || path.includes('/payment-verification/request')) {
      const paymentAmount = Number(payload.paymentAmount || payload.amount || order?.grandTotal || 0);
      const transactionRef = payload.transactionReference || payload.utr_number || `UTR-${Date.now()}`;
      const paymentMode = payload.paymentMode || payload.bank_name || 'NEFT';

      const newPayment = mockDB.insert('payments', {
        order_id: order?.id || entityId,
        order_number: order?.orderNo || entityId,
        customer_name: order?.customerName || order?.customer?.name || 'Customer',
        amount: paymentAmount,
        payment_mode: paymentMode,
        transaction_reference: transactionRef,
        status: 'Pending',
        remarks: payload.remarks || body?.notes || 'Payment recorded',
        payment_date: new Date().toISOString().split('T')[0],
        invoice_number: order?.invoice?.invoiceNumber || '',
      });

      if (order) {
        const evt = makeTimelineEvent(S.PAYMENT_PENDING, `Payment Recorded — ${paymentMode} ₹${paymentAmount.toLocaleString('en-IN')}`, 'Record Payment', 'Sales/Finance', 'Finance');
        advanceOrder(order.id, S.PAYMENT_PENDING, 'Finance Executive', 'Payment Verification', evt, {
          payment: { amount: paymentAmount, paymentMode, transactionReference: transactionRef, remarks: payload.remarks || '' }
        });
      }
      return ok({ requestNumber: newPayment.id, ...newPayment });
    }

    if (order && (transitionName === 'ACTIVATE_WORK_ORDER' || transitionName === 'CREATE_WORK_ORDER')) {
      const evt = makeTimelineEvent(S.WORK_ORDER_CREATED, 'Work Order Activated by Production', 'Activate Work Order', body.actor || 'Production', 'Production');
      advanceOrder(order.id, S.WORK_ORDER_CREATED, 'Production', 'Production', evt, payload);
    } else if (order && transitionName === 'START_PRODUCTION') {
      const evt = makeTimelineEvent(S.IN_PRODUCTION, `Production Started — Machine: ${payload.machine || 'Mixer-1'}`, 'Start Production', body.actor || 'Production', 'Production');
      const enhancedPayload = { ...payload, lastStartedAt: Date.now(), accumulatedTime: order.accumulatedTime || 0 };
      advanceOrder(order.id, S.IN_PRODUCTION, 'Production', 'Production', evt, enhancedPayload);
    } else if (order && transitionName === 'COMPLETE_PRODUCTION') {
      const evt = makeTimelineEvent(S.PRODUCTION_COMPLETED, `Production Completed`, 'Complete Production', body.actor || 'Production', 'Production');
      const accumulated = order.accumulatedTime || 0;
      const sessionTime = order.lastStartedAt ? (Date.now() - order.lastStartedAt) : 0;
      const enhancedPayload = { ...payload, lastStartedAt: null, accumulatedTime: accumulated + sessionTime };
      advanceOrder(order.id, S.PRODUCTION_COMPLETED, 'QC', 'Quality Control', evt, enhancedPayload);
    } else if (order && transitionName === 'PAUSE_PRODUCTION') {
      const evt = makeTimelineEvent(S.PAUSED, 'Production Paused', 'Pause Production', body.actor || 'Production', 'Production');
      const accumulated = order.accumulatedTime || 0;
      const sessionTime = order.lastStartedAt ? (Date.now() - order.lastStartedAt) : 0;
      const enhancedPayload = { ...payload, lastStartedAt: null, accumulatedTime: accumulated + sessionTime };
      advanceOrder(order.id, S.PAUSED, 'Production', 'Production', evt, enhancedPayload);
    } else if (order && transitionName === 'RESUME_PRODUCTION') {
      const evt = makeTimelineEvent(S.IN_PRODUCTION, 'Production Resumed', 'Resume Production', body.actor || 'Production', 'Production');
      const enhancedPayload = { ...payload, lastStartedAt: Date.now() };
      advanceOrder(order.id, S.IN_PRODUCTION, 'Production', 'Production', evt, enhancedPayload);
    }

    return ok({ transitioned: true });
  }

  // ── Finance Executive: Direct verify/reject ─────────────
  if (path.includes('/finance-executive/payment-verifications/')) {
    const parts = path.split('/');
    const paymentId = parts[parts.length - 2];
    const isVerify = path.endsWith('/verify');
    const isReject = path.endsWith('/reject');
    const payments = mockDB.get('payments');
    const payment = payments.find(p =>
      [p.id, p.payment_id, p.paymentId].some(id => String(id) === String(paymentId))
    );

    if (payment) {
      if (isVerify) {
        mockDB.update('payments', payment.id, {
          status: 'Verified',
          verificationStatus: 'verified',
          verification_notes: body?.remarks,
          verifiedAt: new Date().toISOString()
        });
        const orderRef = payment.order_id || payment.order_number || payment.orderNo || payment.orderId;
        const order = mockDB.get('orders').find(o => String(o.id) === String(orderRef) || String(o.orderNo) === String(orderRef));
        if (order) {
          const evt = makeTimelineEvent(S.CLOSED, 'Payment Verified — Order Closed', 'Verify Payment', body?.verifiedBy || 'Finance Executive', 'Finance Executive');
          advanceOrder(order.id, S.CLOSED, 'Closed', 'Completed', evt, {
            'payment.verifiedBy': body?.verifiedBy || 'Finance Executive',
            'payment.verifiedAt': new Date().toISOString(),
          });
        }
      } else if (isReject) {
        mockDB.update('payments', payment.id, {
          status: 'Rejected',
          verificationStatus: 'rejected',
          verification_notes: body?.remarks,
          rejectionReason: body?.remarks,
          rejectedAt: new Date().toISOString()
        });
        const orderRef = payment.order_id || payment.order_number || payment.orderNo || payment.orderId;
        const order = mockDB.get('orders').find(o => String(o.id) === String(orderRef) || String(o.orderNo) === String(orderRef));
        if (order) {
          const evt = makeTimelineEvent(S.INVOICED, 'Payment Verification Rejected — Returned to Finance', 'Reject Payment', 'Finance Executive', 'Finance Executive');
          advanceOrder(order.id, S.INVOICED, 'Finance', 'Billing', evt);
        }
      }
      return ok({ success: true });
    }
    return err('Payment not found');
  }

  // ── Plant Head: AI report ───────────────────────────────
  if (path.includes('/plant-head/reports/generate-ai')) {
    return ok({ summary: 'Production is running at 94% efficiency. All scheduled work orders are on track. QC pass rate is at 92% this week.' });
  }
  // ── Replacement Request ─────────────────────────────────
  if (path === '/replacement-requests' || path.includes('/replacement-requests')) {
    const reqNo = `REP-${Date.now().toString().slice(-6)}`;
    const orderId = body.salesOrderId || body.orderId || body.orderNo;
    if (orderId) {
      const order = mockDB.getById('orders', orderId) || mockDB.get('orders').find(o => String(o.orderNo) === String(orderId) || String(o.id) === String(orderId));
      if (order) {
        const evt = makeTimelineEvent('REPLACEMENT_REQUESTED', `Replacement Requested — Qty: ${body.requestedQty || 1} (${body.reason || 'Requested by Sales'})`, 'Request Replacement', body.actor || 'Sales', 'Sales');
        advanceOrder(order.id, order.workflowStatus || order.status || 'Delivered', order.currentDepartment || 'Sales', order.overallStage || 'Completed', evt, {
          replacementStatus: 'Active',
          activeReplacementExists: true,
          replacementReason: body.reason,
          replacementQty: body.requestedQty
        });
      }
    }
    return ok({ request_no: reqNo, id: reqNo, status: 'Pending Approval', ...body }, 'Replacement request submitted');
  }

  // ── Return Request / Take Back ──────────────────────────
  if (path === '/return-requests' || path.includes('/return-requests')) {
    const reqNo = `RET-${Date.now().toString().slice(-6)}`;
    const orderId = body.salesOrderId || body.orderId || body.orderNo;
    if (orderId) {
      const order = mockDB.getById('orders', orderId) || mockDB.get('orders').find(o => String(o.orderNo) === String(orderId) || String(o.id) === String(orderId));
      if (order) {
        const evt = makeTimelineEvent('RETURN_REQUESTED', `Return / Reverse Pickup Requested — Qty: ${body.requestedQty || 1} (${body.condition || 'Take back'}: ${body.reason || 'Requested'})`, 'Request Return', body.actor || 'Sales', 'Sales');
        advanceOrder(order.id, order.workflowStatus || order.status || 'Delivered', order.currentDepartment || 'Sales', order.overallStage || 'Completed', evt, {
          returnStatus: 'Requested',
          activeReturnExists: true,
          returnReason: body.reason,
          returnQty: body.requestedQty,
          returnCondition: body.condition
        });
      }
    }
    return ok({ request_no: reqNo, id: reqNo, status: 'Pickup Requested', ...body }, 'Return request submitted');
  }

  // ── Generic insert ───────────────────────────────────────
  const segments = path.split('/').filter(Boolean);
  const collections = ['leads', 'quotations', 'orders', 'customers', 'payments', 'samples'];
  for (const seg of segments) {
    if (collections.includes(seg)) {
      const record = mockDB.insert(seg, body);
      return { ...ok(record, 'Created'), [seg.replace(/s$/, '')]: record };
    }
  }

  return ok({ created: true });
}

// ── PATCH handlers ─────────────────────────────────────────────
async function handlePatch(path, body = {}) {
  await delay(250);

  const actor = body?.actor || body?.updatedBy || 'User';

  // ── Sales: Confirm Order ────────────────────────────────
  if (path.match(/\/sales\/orders\/([^/]+)\/confirm/)) {
    const id = path.split('/')[3];
    const evt = makeTimelineEvent(S.ORDER_CONFIRMED, 'Order Confirmed by Sales', 'Confirm Order', actor, 'Sales');
    const updated = advanceOrder(id, S.ORDER_CONFIRMED, 'Sales', 'Sales', evt);
    return updated ? ok(updated, 'Order confirmed') : err('Order not found');
  }

  // ── Sales: Send to Plant Head ───────────────────────────
  if (path.match(/\/sales\/orders\/([^/]+)\/send-to-plant/) || path.match(/\/sales\/orders\/([^/]+)\/plant/)) {
    const id = path.split('/')[3];
    const evt = makeTimelineEvent(S.PLANT_PENDING, 'Order Sent to Plant Head by Sales', 'Send to Plant Head', actor, 'Sales', body?.notes);
    const updated = advanceOrder(id, S.PLANT_PENDING, 'Plant Head', 'Plant Planning', evt);
    return updated ? ok(updated, 'Order sent to Plant Head') : err('Order not found');
  }

  // ── Plant Head: Accept Order ────────────────────────────
  if (path.match(/\/plant-head\/orders\/([^/]+)\/accept/)) {
    const id = path.split('/')[3];
    const evt = makeTimelineEvent(S.PLANT_ACCEPTED, 'Order Accepted by Plant Head', 'Accept Order', actor, 'Plant Head', body?.remarks);
    const updated = advanceOrder(id, S.PLANT_ACCEPTED, 'Plant Head', 'Planning', evt, body);
    return updated ? ok(updated, 'Order accepted') : err('Order not found');
  }

  // ── Plant Head: Reject Order ────────────────────────────
  if (path.match(/\/plant-head\/orders\/([^/]+)\/reject/)) {
    const id = path.split('/')[3];
    const evt = makeTimelineEvent(S.PLANT_REJECTED, `Order Rejected by Plant Head — ${body?.reason || ''}`, 'Reject Order', actor, 'Plant Head');
    const updated = advanceOrder(id, S.PLANT_REJECTED, 'Sales', 'Sales', evt, { rejectionReason: body?.reason });
    return updated ? ok(updated) : err('Order not found');
  }

  // ── Plant Head: Approve Plan (sets PRODUCTION_PLANNED) ─
  if (path.match(/\/plant-head\/orders\/([^/]+)\/plan$/)) {
    const id = path.split('/')[3];
    const planId = `PLAN-${Date.now().toString().slice(-5)}`;
    const planData = {
      planId,
      targetDate: body.targetDate,
      startDate: body.startDate || new Date().toISOString().split('T')[0],
      priority: body.priority || 'Medium',
      machine: body.machine || body.machineId,
      shift: body.shift || 'Morning',
      plant: body.plant,
      instructions: body.instructions,
      remarks: body.remarks,
      status: 'Approved'
    };
    const evt = makeTimelineEvent(S.PRODUCTION_PLANNED, `Production Plan Approved — Target: ${body.targetDate}`, 'Approve Plan', actor, 'Plant Head');
    const updated = advanceOrder(id, S.PRODUCTION_PLANNED, 'Plant Head', 'Planning', evt, {
      plan: planData,
      planId,
      targetDate: planData.targetDate,
      priority: planData.priority,
      machine: planData.machine,
      shift: planData.shift,
      plant: planData.plant
    });
    return updated ? ok(updated, 'Plan approved') : err('Order not found');
  }

  // ── Plant Head: Create Work Order ───────────────────────
  if (path.match(/\/plant-head\/orders\/([^/]+)\/work-order/)) {
    const id = path.split('/')[3];
    const woNo = `WO-${Date.now().toString().slice(-5)}`;
    const evt = makeTimelineEvent(S.WORK_ORDER_CREATED, `Work Order ${woNo} Created`, 'Create Work Order', actor, 'Plant Head');
    const updated = advanceOrder(id, S.WORK_ORDER_CREATED, 'Production', 'Production', evt, { workOrderNo: woNo, workOrderId: woNo });
    return updated ? ok(updated, 'Work order created') : err('Order not found');
  }

  // ── Production: Accept Work Order ──────────────────────
  if (path.match(/\/production\/orders\/([^/]+)\/accept/)) {
    const id = path.split('/')[3];
    const evt = makeTimelineEvent(S.PRODUCTION_ACCEPTED, 'Work Order Accepted by Production', 'Accept Work Order', actor, 'Production');
    const updated = advanceOrder(id, S.PRODUCTION_ACCEPTED, 'Production', 'Production', evt);
    return updated ? ok(updated) : err('Order not found');
  }

  // ── Production: Start Production ───────────────────────
  if (path.match(/\/production\/orders\/([^/]+)\/start/) || path.match(/\/orders\/([^/]+)\/production\/start/)) {
    const id = path.includes('/production/orders/') ? path.split('/')[3] : path.split('/')[2];
    const batchNo = `BATCH-${Date.now().toString().slice(-5)}`;
    const productionData = {
      actualStartDate: new Date().toISOString().split('T')[0],
      machine: body.machine,
      operator: body.operator,
      shift: body.shift || 'Morning',
      batchNumber: body.batchNumber || batchNo,
      plannedQty: body.plannedQty || body.quantity,
      producedQty: 0,
      rejectedQty: 0,
      notes: body.notes,
    };
    const evt = makeTimelineEvent(S.IN_PRODUCTION, `Production Started — Batch ${productionData.batchNumber}`, 'Start Production', actor, 'Production');
    const updated = advanceOrder(id, S.IN_PRODUCTION, 'Production', 'Production', evt, { production: productionData });
    return updated ? ok(updated) : err('Order not found');
  }

  // ── Production: Update Progress ─────────────────────────
  if (path.match(/\/production\/orders\/([^/]+)\/progress/)) {
    const id = path.split('/')[3];
    const order = mockDB.getById('orders', id);
    if (!order) return err('Order not found');
    const updatedProd = { ...(order.production || {}), ...body };
    const updated = mockDB.update('orders', id, { production: updatedProd });
    return ok(updated, 'Progress updated');
  }

  // ── Production: Complete Production ────────────────────
  if (path.match(/\/production\/orders\/([^/]+)\/complete/) || path.match(/\/production\/work-orders\/([^/]+)\/complete/)) {
    const id = path.split('/')[3];
    const allOrders = mockDB.get('orders');
    const order = mockDB.getById('orders', id) || allOrders.find(o => String(o.id) === String(id) || String(o.orderNo) === String(id) || `WO-${String(o.orderNo || o.id || '').split('-').slice(1).join('-') || o.id}` === String(id) || String(o.workOrderId) === String(id) || String(o.workOrderNo) === String(id));
    if (!order) return err('Order not found');
    const productionData = { ...(order.production || {}), ...body, producedQty: body.producedQty || order.production?.plannedQty };
    const evt = makeTimelineEvent(S.PRODUCTION_COMPLETED, `Production Completed — ${productionData.producedQty} units`, 'Complete Production', actor, 'Production');
    const updated = advanceOrder(order.id, S.PRODUCTION_COMPLETED, 'QC', 'Quality Control', evt, { production: productionData });
    return updated ? ok(updated) : err('Order not found');
  }

  // ── QC: Approve ──────────────────────────────────────────
  if (path.match(/\/qc\/orders\/([^/]+)\/approve/) || path.match(/\/orders\/([^/]+)\/qc\/approve/)) {
    const id = path.includes('/qc/orders/') ? path.split('/')[3] : path.split('/')[2];
    const qcData = {
      inspectorName: body.inspectorName || actor,
      inspectionDate: new Date().toISOString().split('T')[0],
      overallResult: 'Pass',
      acceptedQty: body.acceptedQty,
      rejectedQty: body.rejectedQty || 0,
      remarks: body.remarks,
      dimensionResult: body.dimensionResult || 'Pass',
      weightResult: body.weightResult || 'Pass',
      strengthResult: body.strengthResult || 'Pass',
      defects: body.defects || [],
      ...body
    };
    const evt = makeTimelineEvent(S.QC_APPROVED, 'QC Inspection Passed — Ready for Dispatch', 'Approve Batch', actor, 'QC');
    const updated = advanceOrder(id, S.QC_APPROVED, 'Dispatch', 'Dispatch', evt, { qc: qcData });
    return updated ? ok(updated) : err('Order not found');
  }

  // ── QC: Reject / Rework ──────────────────────────────────
  if (path.match(/\/qc\/orders\/([^/]+)\/reject/) || path.match(/\/orders\/([^/]+)\/qc\/fail/)) {
    const id = path.includes('/qc/orders/') ? path.split('/')[3] : path.split('/')[2];
    const qcData = {
      inspectorName: body.inspectorName || actor,
      inspectionDate: new Date().toISOString().split('T')[0],
      overallResult: 'Fail',
      rejectedQty: body.rejectedQty,
      reworkQty: body.reworkQty,
      defects: body.defects || [],
      remarks: body.remarks,
    };
    const newStatus = body.reworkRequired !== false ? S.REWORK : S.QC_FAILED;
    const evt = makeTimelineEvent(newStatus, `QC Rejected — ${body.defects?.join(', ') || body.remarks || 'Quality failed'}. Sent for Rework.`, 'Reject Batch', actor, 'QC');
    const updated = advanceOrder(id, newStatus, 'Production', 'Rework', evt, { qc: qcData });
    return updated ? ok(updated) : err('Order not found');
  }

  // ── Dispatch: Create Dispatch (Gate Pass) ───────────────
  if (path.match(/\/dispatch\/orders\/([^/]+)\/create/) || path.match(/\/orders\/([^/]+)\/dispatch$/)) {
    const id = path.includes('/dispatch/orders/') ? path.split('/')[3] : path.split('/')[2];
    const dispatchData = {
      dispatchQty: body.dispatchQty || body.quantity,
      vehicleNo: body.vehicleNo,
      driverName: body.driverName,
      driverPhone: body.driverPhone || body.driverMobile,
      transporter: body.transporter || 'Own Fleet',
      lrNumber: body.lrNumber,
      ewayBill: body.ewayBill,
      deliveryChallan: body.deliveryChallan,
      dispatchDate: body.dispatchDate || new Date().toISOString().split('T')[0],
      estimatedArrival: body.estimatedArrival,
    };
    const evt = makeTimelineEvent(S.DISPATCH_PENDING, `Dispatch Prepared — Vehicle: ${body.vehicleNo || 'TBD'}`, 'Create Dispatch', actor, 'Dispatch');
    const updated = advanceOrder(id, S.DISPATCH_PENDING, 'Dispatch', 'Dispatch', evt, { dispatch: dispatchData });
    return updated ? ok(updated) : err('Order not found');
  }

  // ── Dispatch: Dispatch Vehicle (gate pass approved) ─────
  if (path.match(/\/dispatch\/orders\/([^/]+)\/dispatch$/) || path.match(/\/orders\/([^/]+)\/in-transit$/)) {
    const id = path.includes('/dispatch/orders/') ? path.split('/')[3] : path.split('/')[2];
    const order = mockDB.getById('orders', id);
    if (!order) return err('Order not found');
    const updatedDispatch = { ...(order.dispatch || {}), ...body };
    const evt = makeTimelineEvent(S.IN_TRANSIT, `Vehicle Dispatched — ${order.dispatch?.vehicleNo || body.vehicleNo}`, 'Dispatch', actor, 'Dispatch');
    const updated = advanceOrder(id, S.IN_TRANSIT, 'Dispatch', 'Dispatch', evt, { dispatch: updatedDispatch });
    return updated ? ok(updated) : err('Order not found');
  }

  // ── Dispatch: Confirm Delivery ──────────────────────────
  if (path.match(/\/dispatch\/orders\/([^/]+)\/deliver/) || path.match(/\/orders\/([^/]+)\/deliver$/)) {
    const id = path.includes('/dispatch/orders/') ? path.split('/')[3] : path.split('/')[2];
    const order = mockDB.getById('orders', id);
    if (!order) return err('Order not found');
    const dispatchData = {
      ...(order.dispatch || {}),
      actualDeliveryDate: body.actualDeliveryDate || new Date().toISOString().split('T')[0],
      receiverName: body.receiverName,
      receivedQty: body.receivedQty,
      deliveryRemarks: body.deliveryRemarks,
      proofOfDelivery: body.proofOfDelivery,
    };
    // First: mark DELIVERED
    const deliveryEvt = makeTimelineEvent(S.DELIVERED, `Delivered to ${order.customer?.name} — Received by: ${body.receiverName || 'Depot'}`, 'Confirm Delivery', actor, 'Dispatch');
    let updated = advanceOrder(id, S.DELIVERED, 'Finance', 'Billing', deliveryEvt, { dispatch: dispatchData });

    // Auto: generate invoice
    const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
    const invoiceEvt = makeTimelineEvent(S.INVOICED, `Invoice ${invoiceNo} Auto-Generated`, 'Generate Invoice', 'System', 'Finance');
    const invoiceData = {
      invoiceId: invoiceNo,
      invoiceNumber: invoiceNo,
      invoiceDate: new Date().toISOString().split('T')[0],
      amount: updated?.grandTotal || updated?.totalAmount || 0,
      paidAmount: 0,
      balanceAmount: updated?.grandTotal || updated?.totalAmount || 0,
    };
    updated = advanceOrder(id, S.INVOICED, 'Finance', 'Billing', invoiceEvt, { invoice: invoiceData });
    return updated ? ok(updated) : err('Order not found');
  }

  // ── Finance: Record Payment ─────────────────────────────
  if (path.match(/\/finance\/orders\/([^/]+)\/payment/) || path.match(/\/finance\/orders\/([^/]+)\/record-payment/)) {
    const id = path.split('/')[3];
    const order = mockDB.getById('orders', id);
    if (!order) return err('Order not found');
    const paymentData = {
      amount: body.amount || body.paymentAmount,
      paymentDate: body.paymentDate || new Date().toISOString().split('T')[0],
      paymentMode: body.paymentMode,
      transactionReference: body.transactionReference || body.utrNumber,
      utrNumber: body.utrNumber || body.transactionReference,
      remarks: body.remarks,
    };
    // Insert into payments collection
    mockDB.insert('payments', {
      order_id: order.id,
      order_number: order.orderNo,
      customer_name: order.customerName || order.customer?.name,
      amount: paymentData.amount,
      payment_mode: paymentData.paymentMode,
      transaction_reference: paymentData.transactionReference,
      status: 'Pending',
      remarks: paymentData.remarks,
      payment_date: paymentData.paymentDate,
      invoice_number: order.invoice?.invoiceNumber || '',
    });
    const evt = makeTimelineEvent(S.PAYMENT_PENDING, `Payment Recorded — ${paymentData.paymentMode} ₹${Number(paymentData.amount).toLocaleString('en-IN')}`, 'Record Payment', actor, 'Finance');
    const updated = advanceOrder(id, S.PAYMENT_PENDING, 'Finance Executive', 'Payment Verification', evt, { payment: paymentData });
    return updated ? ok(updated) : err('Order not found');
  }

  // ── Finance Executive: Verify Payment ───────────────────
  if (path.match(/\/finance-executive\/orders\/([^/]+)\/verify/)) {
    const id = path.split('/')[3];
    const order = mockDB.getById('orders', id);
    if (!order) return err('Order not found');
    // Update payment record
    const payments = mockDB.get('payments');
    const payment = payments.find(p => String(p.order_id) === String(order.id));
    if (payment) mockDB.update('payments', payment.id, { status: 'Verified', verifiedAt: new Date().toISOString() });
    const evt = makeTimelineEvent(S.CLOSED, 'Payment Verified — Order Closed', 'Verify Payment', actor, 'Finance Executive');
    const updated = advanceOrder(id, S.CLOSED, 'Closed', 'Completed', evt, {
      'invoice.paidAmount': order.invoice?.amount,
      'invoice.balanceAmount': 0,
    });
    return updated ? ok(updated) : err('Order not found');
  }

  // ── Legacy / catch-all PATCH handlers ───────────────────

  // Plant Head plan (legacy path)
  if (path.includes('/plant-head/orders/') && path.endsWith('/plan')) {
    const parts = path.split('/');
    const id = parts[parts.length - 2];
    const woNo = `WO-${Date.now().toString().slice(-5)}`;
    const planId = `PLAN-${Date.now().toString().slice(-5)}`;
    const planData = { planId, targetDate: body.targetDate, priority: body.priority || 'Medium', machine: body.machine, status: 'Approved' };
    const evt = makeTimelineEvent(S.WORK_ORDER_CREATED, `Plan Approved & Work Order ${woNo} Created`, 'Approve Plan & Create Work Order', actor, 'Plant Head');
    const updated = advanceOrder(id, S.WORK_ORDER_CREATED, 'Production', 'Production', evt, { plan: planData, workOrderNo: woNo, workOrderId: woNo });
    return updated ? ok(updated) : err('Order not found');
  }

  // QC (legacy paths)
  if (path.includes('/orders/') && path.endsWith('/qc/approve')) {
    const id = path.split('/')[2];
    const evt = makeTimelineEvent(S.QC_APPROVED, 'QC Approved', 'Approve QC', actor, 'QC');
    const updated = advanceOrder(id, S.QC_APPROVED, 'Dispatch', 'Dispatch', evt, { qc: { ...body, overallResult: 'Pass' } });
    return updated ? ok(updated) : err('Order not found');
  }
  if (path.includes('/orders/') && path.endsWith('/qc/fail')) {
    const id = path.split('/')[2];
    const evt = makeTimelineEvent(S.REWORK, 'QC Failed — Sent for Rework', 'Fail QC', actor, 'QC');
    const updated = advanceOrder(id, S.REWORK, 'Production', 'Rework', evt, { qc: { ...body, overallResult: 'Fail' } });
    return updated ? ok(updated) : err('Order not found');
  }

  // Dispatch (legacy)
  if (path.includes('/dispatch/') && path.endsWith('/start-delivery')) {
    const id = path.split('/')[2];
    const evt = makeTimelineEvent(S.IN_TRANSIT, 'Vehicle Dispatched', 'Start Delivery', actor, 'Dispatch');
    const updated = advanceOrder(id, S.IN_TRANSIT, 'Dispatch', 'Dispatch', evt);
    return updated ? ok(updated) : err('Order not found');
  }
  if (path.includes('/dispatch/') && path.endsWith('/status') && body?.status === 'DELIVERED') {
    const id = path.split('/')[2];
    const order = mockDB.getById('orders', id);
    if (!order) return err('Order not found');
    const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
    const deliveryEvt = makeTimelineEvent(S.DELIVERED, 'Delivered', 'Confirm Delivery', actor, 'Dispatch');
    let updated = advanceOrder(id, S.DELIVERED, 'Finance', 'Billing', deliveryEvt);
    const invoiceEvt = makeTimelineEvent(S.INVOICED, `Invoice ${invoiceNo} Generated`, 'Generate Invoice', 'System', 'Finance');
    updated = advanceOrder(id, S.INVOICED, 'Finance', 'Billing', invoiceEvt, { invoice: { invoiceNumber: invoiceNo, amount: updated?.grandTotal || 0, paidAmount: 0 } });
    return updated ? ok(updated) : err('Order not found');
  }

  // Generic PATCH
  const segments = path.split('/').filter(Boolean);
  for (let i = 0; i < segments.length - 1; i++) {
    const collections = ['customers', 'payments', 'samples', 'leads'];
    if (collections.includes(segments[i])) {
      const id = segments[i + 1];
      const updated = mockDB.update(segments[i], id, body);
      return updated ? ok(updated, 'Updated') : err('Not found');
    }
  }

  return ok({ updated: true });
}

// ── PUT handlers ──────────────────────────────────────────────
async function handlePut(path, body = {}) {
  await delay(200);
  if (path.startsWith('/purchase/')) {
    const segments = path.split('/').filter(Boolean);
    const id = segments.pop();
    if (path.includes('/purchase/orders/')) {
      const storedPOs = JSON.parse((typeof window !== 'undefined' && window.localStorage.getItem('erp_purchase_orders')) || '[]');
      const idx = storedPOs.findIndex(p => String(p.id) === id || String(p.poNumber) === id);
      if (idx !== -1) {
        storedPOs[idx] = { ...storedPOs[idx], ...body };
        if (typeof window !== 'undefined') window.localStorage.setItem('erp_purchase_orders', JSON.stringify(storedPOs));
        return ok(storedPOs[idx], 'Purchase Order updated');
      }
      return err('Purchase Order not found');
    }
    if (path.includes('/purchase/grns/')) {
      const storedGRNs = JSON.parse((typeof window !== 'undefined' && window.localStorage.getItem('erp_goods_receipts')) || '[]');
      const idx = storedGRNs.findIndex(g => String(g.id) === id || String(g.grnNumber) === id);
      if (idx !== -1) {
        storedGRNs[idx] = { ...storedGRNs[idx], ...body };
        if (typeof window !== 'undefined') window.localStorage.setItem('erp_goods_receipts', JSON.stringify(storedGRNs));
        return ok(storedGRNs[idx], 'GRN updated');
      }
      return err('GRN not found');
    }
  }
  const segments = path.split('/').filter(Boolean);
  for (let i = 0; i < segments.length - 1; i++) {
    const collections = ['customers', 'payments'];
    if (collections.includes(segments[i])) {
      const id = segments[i + 1];
      const updated = mockDB.update(segments[i], id, body);
      return updated ? ok(updated, 'Updated') : err('Not found');
    }
  }
  return ok({ updated: true });
}

// ── DELETE handlers ───────────────────────────────────────────
async function handleDelete(path) {
  await delay(200);
  if (path.startsWith('/purchase/')) {
    const segments = path.split('/').filter(Boolean);
    const id = segments.pop();
    if (path.includes('/purchase/orders/')) {
      const storedPOs = JSON.parse((typeof window !== 'undefined' && window.localStorage.getItem('erp_purchase_orders')) || '[]');
      const filtered = storedPOs.filter(p => String(p.id) !== id && String(p.poNumber) !== id);
      if (typeof window !== 'undefined') window.localStorage.setItem('erp_purchase_orders', JSON.stringify(filtered));
      return ok(null, 'Purchase Order deleted');
    }
    if (path.includes('/purchase/grns/')) {
      const storedGRNs = JSON.parse((typeof window !== 'undefined' && window.localStorage.getItem('erp_goods_receipts')) || '[]');
      const filtered = storedGRNs.filter(g => String(g.id) !== id && String(g.grnNumber) !== id);
      if (typeof window !== 'undefined') window.localStorage.setItem('erp_goods_receipts', JSON.stringify(filtered));
      return ok(null, 'GRN deleted');
    }
  }
  const segments = path.split('/').filter(Boolean);
  for (let i = 0; i < segments.length - 1; i++) {
    const collections = ['customers', 'payments'];
    if (collections.includes(segments[i])) {
      const id = segments[i + 1];
      const success = mockDB.remove(segments[i], id);
      return success ? ok(null, 'Deleted') : err('Not found');
    }
  }
  return ok(null, 'Deleted');
}

// ── Exported API Client ───────────────────────────────────────
const NESTJS_URL = (typeof window !== 'undefined')
  ? (process.env.NEXT_PUBLIC_BACKEND_API_URL || '/api/backend')
  : (process.env.BACKEND_INTERNAL_URL || process.env.BACKEND_API_URL || 'http://localhost:4000/api/v1');

function shouldProxyToBackend(path) {
  const result = path.includes('/attendance') || path.includes('/products') || path.includes('/finance') || path.includes('/profile') || path.includes('/expenses') || path.includes('/leaves') || path.includes('/attendance-requests') || path.includes('/notifications') || path.includes('/sales/samples') || path.includes('/crm/leads') || path.includes('/logistics/dispatches') || path.includes('/plant-head/dashboard-data') || path.includes('/plant-head/analytics/production') || path.includes('/plant-head/analytics/material') || path.includes('/plant-head/overview/departments') || path.includes('/plant-head/reports/generate-ai') || path.includes('/plant-head/incoming-orders') || path.includes('/plant-head/planning-orders') || path.includes('/plant-head/planning') || path.includes('/replacements') || path.includes('/sales-returns') || path.includes('/inventory') || path.includes('/qc') || path.includes('/production/finished-goods') || path.includes('/material-requests') || path.includes('/plant-head/material-indents') || path.includes('/hr/') || path.includes('/store-reports') || path.includes('/admin/') || path.includes('/backend/') || path.includes('/brand-analysis') || path.includes('/customer-complaints') || path.includes('/procurement/');
  return result;
}

async function proxyRequest(method, path, body = null) {
  const cleanPath = path.replace('/api/backend', '')
    .replace('/reports/inventory/stock-levels', '/inventory/stock-levels')
    .replace('/store/material-requests', '/material-requests');
  const baseUrl = NESTJS_URL.replace(/\/$/, '');
  const targetPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  const url = `${baseUrl}${targetPath}`;
  
  const authStorageStr = typeof window !== 'undefined' ? window.localStorage.getItem('auth-storage') : null;
  let token = typeof window !== 'undefined' ? (window.localStorage.getItem('token') || window.localStorage.getItem('himalaya_token')) : null;
  
  if (!token && authStorageStr) {
    try {
      const parsed = JSON.parse(authStorageStr);
      if (parsed?.state?.accessToken) {
        token = parsed.state.accessToken;
      }
    } catch (e) {
      console.error('Failed to parse auth token', e);
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    'x-company-id': 'd039cfa4-e78b-4138-adfc-1b0f14cffa91', // Real company ID from local DB
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    // Some routes return empty or non-JSON on DELETE, handle text safely
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch(e) {
      data = text;
    }

    if (!res.ok) {
      console.warn(`NestJS Proxy Error [${method} ${url}]:`, data);
      return err(data?.message || 'Backend error', data?.errors);
    }

    if (data && typeof data === 'object' && 'success' in data) {
      return data;
    }
    return ok(data, 'Success (via NestJS)');
  } catch (e) {
    console.error(`Fetch failed [${method} ${url}]:`, e);
    return err(e.message);
  }
}

export const apiClient = {
  get:    (path, options = {}) => shouldProxyToBackend(path) ? proxyRequest('GET', path) : handleGet(path, options),
  post:   (path, body, options = {}) => shouldProxyToBackend(path) ? proxyRequest('POST', path, body) : handlePost(path, body),
  patch:  (path, body = {}, options = {}) => shouldProxyToBackend(path) ? proxyRequest('PATCH', path, body) : handlePatch(path, body),
  put:    (path, body, options = {}) => shouldProxyToBackend(path) ? proxyRequest('PUT', path, body) : handlePut(path, body),
  delete: (path, options = {}) => shouldProxyToBackend(path) ? proxyRequest('DELETE', path) : handleDelete(path),
};
