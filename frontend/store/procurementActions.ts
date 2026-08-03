import { useERPStore } from './erpStore';
import { useAuthStore } from './authStore';
import { backendFetch } from '../lib/backendFetch';
import { purchaseIndentService } from '../services/procurement/purchaseIndentService';
import { purchaseOrderService } from '../services/procurement/purchaseOrderService';
import { grnService } from '../services/procurement/grnService';
import { vendorInvoiceService } from '../services/procurement/vendorInvoiceService';
import { vendorPaymentService } from '../services/procurement/vendorPaymentService';
import { procurementRequest } from '../services/procurement/procurementClient';

import { 
  INDENT_STATUS, 
  PO_STATUS, 
  GRN_STATUS, 
  MATERIAL_REJECTION_STATUS, 
  REPLACEMENT_RECEIPT_STATUS,
  VENDOR_INVOICE_STATUS,
  GRN_TYPE,
  COMMERCIAL_TREATMENT,
  DEFECTIVE_MATERIAL_DISPOSITION,
  createId, 
  createHumanNo, 
  calculatePOLineTotals, 
  createProcurementAuditEntry,
  assertTransition
} from '../constants/procurement';

// ---------------------------------------------------------
// STATE SYNCHRONIZATION HELPERS
// ---------------------------------------------------------

export async function syncProcurementData() {
  // Use the in-memory auth token (intentionally NOT persisted to localStorage/sessionStorage).
  const token = typeof window !== 'undefined' ? useAuthStore.getState().accessToken : null;
  if (!token) return;

  // safeList: returns empty array on 403/permission errors but logs them clearly
  // so missing role permissions are visible in the console instead of silently swallowed.
  const safeList = async (label: string, fn: () => Promise<any>) => {
    try {
      const res = await fn();
      return Array.isArray(res) ? res : (res?.data || []);
    } catch (err: any) {
      if (err?.status === 403 || err?.code === 'FORBIDDEN') {
        console.warn(`[syncProcurementData] 403 on "${label}" — current role lacks permission. Check role permissions in seed.ts.`);
      } else {
        console.warn(`[syncProcurementData] Failed to load "${label}":`, err?.message || err);
      }
      return [];
    }
  };

  const materialIndents = await safeList('indents', () => purchaseIndentService.list({ limit: 100 }));
  const purchaseOrders  = await safeList('purchase-orders', () => purchaseOrderService.list({ limit: 100 }));
  const goodsReceiptNotes = await safeList('grns', () => grnService.list({ limit: 100 }));
  const vendorInvoices  = await safeList('vendor-invoices', () => vendorInvoiceService.list({ limit: 100 }));
  const vendorPayments  = await safeList('vendor-payments', () => vendorPaymentService.list({ limit: 100 }));
  const materialRejectionsRaw = await safeList('material-rejections', () => procurementRequest<any>('material-rejections', 'GET'));
  const materialRejections = materialRejectionsRaw.map((rej: any) => ({
    ...rej,
    poId: rej.purchaseOrder?.poNumber || rej.purchaseOrderId || rej.poId,
    materialId: rej.items?.[0]?.productId || rej.materialId,
    materialName: rej.items?.[0]?.product?.name || rej.materialName,
    rejectedQty: rej.items?.[0]?.quantity || rej.rejectedQty,
  }));

  // Use backendFetch (auto-injects Authorization header from authStore)
  const productsRaw   = await backendFetch<any>('/api/backend/products').catch((e: any) => { console.warn('[syncProcurementData] products:', e?.message); return []; });
  const products      = Array.isArray(productsRaw) ? productsRaw : (productsRaw?.data || []);

  const warehousesRaw = await backendFetch<any>('/api/backend/warehouses').catch((e: any) => { console.warn('[syncProcurementData] warehouses:', e?.message); return []; });
  const warehouses    = Array.isArray(warehousesRaw) ? warehousesRaw : (warehousesRaw?.data || []);

  const suppliersRaw  = await backendFetch<any>('/api/backend/suppliers').catch((e: any) => { console.warn('[syncProcurementData] suppliers:', e?.message); return []; });
  const suppliers     = Array.isArray(suppliersRaw) ? suppliersRaw : (suppliersRaw?.data || []);

  const stockRaw      = await backendFetch<any>('/api/backend/inventory/stock-levels').catch((e: any) => { console.warn('[syncProcurementData] stock-levels:', e?.message); return []; });
  const stockLevels   = Array.isArray(stockRaw) ? stockRaw : (stockRaw?.data || []);

  const auditRaw      = await backendFetch<any>('/api/backend/admin/audit-logs').catch(() => ({}));
  const auditLogs     = Array.isArray(auditRaw) ? auditRaw : (auditRaw?.data || []);

  const rawInventory = products.map((prod: any, idx: number) => {
    const stockForProd = stockLevels.filter((s: any) => s.productId === prod.id);
    const totalStock = stockForProd.reduce((sum: number, s: any) => sum + Number(s.quantity), 0);
    return {
      id: prod.id,
      code: prod.sku || `RM${String(idx + 1).padStart(3, '0')}`,
      material: prod.name,
      unit: prod.unit || 'Kg',
      stock: totalStock,
      minStock: 100,
      reorderLevel: 150,
      rate: Number(prod.unitPrice || 0)
    };
  });

  const store = useERPStore.getState();
  const latestState = store.state;

  store.setState({
    ...latestState,
    purchaseIndents: materialIndents,
    purchaseOrders,
    goodsReceipts: goodsReceiptNotes,
    vendorInvoices,
    vendorPayments,
    materialRejections,
    rawInventory,
    warehouses,
    suppliers,
    products,
    procurementAuditLogs: auditLogs,
    procurement: {
      ...(latestState.procurement || {}),
      materialIndents,
      purchaseOrders,
      goodsReceiptNotes
    }
  });
}


function getStoreState() {
  return useERPStore.getState().state;
}

function updateStoreState(newState: any) {
  useERPStore.getState().setState(newState);
}

function safeClone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

// ---------------------------------------------------------
// INVENTORY TRANSACTIONS
// ---------------------------------------------------------

export function postInventoryTransaction(materialId: string, quantity: number, type: 'ADD' | 'SUBTRACT' | 'RESERVE', remarks: string) {
  const state = getStoreState();
  const rawInventory = safeClone(state.rawInventory || []);
  
  let item = rawInventory.find((i: any) => i.id === materialId || i.materialCode === materialId);
  if (!item) {
    item = { id: materialId, materialCode: materialId, quantity: 0, reservedQty: 0, history: [] };
    rawInventory.push(item);
  }

  if (type === 'ADD') {
    item.quantity += quantity;
  } else if (type === 'SUBTRACT') {
    item.quantity -= quantity;
  } else if (type === 'RESERVE') {
    item.quantity -= quantity;
    item.reservedQty = (item.reservedQty || 0) + quantity;
  }

  item.history = item.history || [];
  item.history.push({
    date: new Date().toISOString(),
    quantity,
    type,
    remarks
  });

  updateStoreState({ ...state, rawInventory });
}

export function generateNotification(role: string, title: string, message: string) {
  const state = getStoreState();
  const notifications = safeClone(state.procurementNotifications || []);
  notifications.push({
    id: createId('NOTIF'),
    role,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString()
  });
  updateStoreState({ ...state, procurementNotifications: notifications });
}

// ---------------------------------------------------------
// DOMAIN ACTIONS: INDENTS
// ---------------------------------------------------------

export async function createMaterialIndent(data: any, actorName: string) {
  const store = useERPStore.getState();
  const defaultWarehouse = store.state.warehouses?.[0]?.id || '';
  const requestedById = typeof window !== 'undefined' ? ((useAuthStore.getState().user as any)?.id || '') : '';

  const inputItems = data.items || [{
    materialId: data.materialId || data.productId,
    quantity: data.requestedQuantity || data.requiredQuantity || data.quantity || 0,
    rate: data.rate || 0,
    reason: data.remarks || ''
  }];

  const resolvedWarehouseId = (data.warehouseId || defaultWarehouse) || null;

  const payload = {
    companyId: data.companyId || 'COMP-000001',
    requestedById: data.requestedById || requestedById || 'USR-SUPERADMIN',
    warehouseId: resolvedWarehouseId,
    requiredDate: data.requiredDate || data.targetDate || null,
    priority: (data.priority || 'MEDIUM').toUpperCase(),
    department: data.department || 'STORE',
    businessReason: data.businessReason || data.remarks || 'Stock Reorder',
    remarks: data.remarks || '',
    items: inputItems.map((it: any) => ({
      productId: it.materialId || it.productId || null,
      quantity: Number(it.quantity || it.requestedQuantity || it.requiredQuantity || 0),
      estimatedUnitRate: Number(it.rate || it.unitPrice || 0),
      lineRemarks: it.reason || it.remarks || ''
    }))
  };

  // Guard: ensure every productId is a real DB UUID before calling the backend.
  // Dummy/placeholder IDs (e.g. 'mat-1', 'wh-1') from legacy code paths cause a FK violation.
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const badItems = payload.items.filter((it: any) => !it.productId || !UUID_RE.test(it.productId));
  if (badItems.length > 0) {
    throw new Error(
      'One or more selected products have invalid IDs. Please wait for product data to finish loading and try again.'
    );
  }

  const res: any = await purchaseIndentService.create(payload);
  if (res && res.id) {
    await purchaseIndentService.action(res.id, 'submit', {}, res.version || 1);
  }
  await syncProcurementData();
  return res;
}

export async function submitMaterialIndent(indentId: string, actorName: string) {
  const store = useERPStore.getState();
  const indent = store.state.purchaseIndents?.find((i: any) => i.id === indentId);
  const version = indent?.version;
  const res = await purchaseIndentService.action(indentId, 'submit', {}, version);
  await syncProcurementData();
  return res;
}

export async function returnIndentForCorrection(indentId: string, remarks: string, actorName: string) {
  const store = useERPStore.getState();
  const indent = store.state.purchaseIndents?.find((i: any) => i.id === indentId);
  const version = indent?.version;
  const res = await purchaseIndentService.action(indentId, 'return', { remarks }, version);
  await syncProcurementData();
  return res;
}

export async function approveMaterialIndent(indentId: string, approvedItems: any[], remarks: string, actorName: string) {
  const store = useERPStore.getState();
  const indent = store.state.purchaseIndents?.find((i: any) => i.id === indentId);
  const version = indent?.version;
  
  const items = approvedItems.map(i => ({
    productId: i.productId || i.materialId,
    approvedQuantity: Number(i.approvedQuantity ?? i.approvedQty ?? i.quantity ?? 0),
    // quantity must be >= approvedQuantity for the backend validation;
    // pass the stored requestedQuantity if available, otherwise use approvedQuantity itself
    quantity: Number(i.quantity ?? i.requestedQuantity ?? i.approvedQuantity ?? i.approvedQty ?? 0)
  }));
  
  const res = await purchaseIndentService.action(indentId, 'approve', { items, remarks }, version);
  await syncProcurementData();
  return res;
}

export async function rejectMaterialIndent(indentId: string, remarks: string, actorName: string) {
  const store = useERPStore.getState();
  const indent = store.state.purchaseIndents?.find((i: any) => i.id === indentId);
  const version = indent?.version;
  const res = await purchaseIndentService.action(indentId, 'reject', { remarks }, version);
  await syncProcurementData();
  return res;
}

export async function cancelMaterialIndent(indentId: string, remarks: string, actorName: string) {
  const store = useERPStore.getState();
  const indent = store.state.purchaseIndents?.find((i: any) => i.id === indentId);
  const version = indent?.version;
  const res = await purchaseIndentService.action(indentId, 'cancel', { remarks }, version);
  await syncProcurementData();
  return res;
}

// ---------------------------------------------------------
// DOMAIN ACTIONS: PURCHASE ORDERS
// ---------------------------------------------------------

export async function createPurchaseOrder(indentId: string, poData: any, actorName: string) {
  const payload = {
    supplierId: poData.supplierId,
    totalAmount: Number(poData.totalAmount),
    freight: Number(poData.freight || 0),
    otherCharges: Number(poData.otherCharges || 0),
    paymentTerms: poData.paymentTerms || '',
    expectedDeliveryDate: poData.expectedDeliveryDate || null,
    items: poData.items.map((i: any) => ({
      productId: i.productId || i.materialId,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice || i.rate || 0),
      discountPercent: Number(i.discountPercent || i.discount || 0),
      gstPercent: Number(i.gstPercent || i.tax || 18)
    }))
  };
  const res = await purchaseOrderService.createFromIndent(indentId, payload);
  await syncProcurementData();
  return res;
}

export async function submitPurchaseOrder(poId: string, actorName: string) {
  const store = useERPStore.getState();
  const po = store.state.purchaseOrders?.find((p: any) => p.id === poId);
  const version = po?.version;
  const res = await purchaseOrderService.action(poId, 'submit', {}, version);
  await syncProcurementData();
  return res;
}

export async function approvePurchaseOrder(poId: string, remarks: string, actorName: string) {
  const store = useERPStore.getState();
  const po = store.state.purchaseOrders?.find((p: any) => p.id === poId);
  const version = po?.version;
  const res = await purchaseOrderService.action(poId, 'approve', { remarks }, version);
  await syncProcurementData();
  return res;
}

export async function returnPurchaseOrderForCorrection(poId: string, remarks: string, actorName: string) {
  const store = useERPStore.getState();
  const po = store.state.purchaseOrders?.find((p: any) => p.id === poId);
  const version = po?.version;
  const res = await purchaseOrderService.action(poId, 'return', { remarks }, version);
  await syncProcurementData();
  return res;
}

export async function rejectPurchaseOrder(poId: string, remarks: string, actorName: string) {
  const store = useERPStore.getState();
  const po = store.state.purchaseOrders?.find((p: any) => p.id === poId);
  const version = po?.version;
  const res = await purchaseOrderService.action(poId, 'reject', { remarks }, version);
  await syncProcurementData();
  return res;
}

export async function issuePurchaseOrder(poId: string, actorName: string) {
  const store = useERPStore.getState();
  const po = store.state.purchaseOrders?.find((p: any) => p.id === poId);
  const version = po?.version;
  const res = await purchaseOrderService.action(poId, 'issue', {}, version);
  await syncProcurementData();
  return res;
}

export async function dispatchPurchaseOrder(poId: string, dispatchData: any, actorName: string) {
  const store = useERPStore.getState();
  const po = store.state.purchaseOrders?.find((p: any) => p.id === poId);
  const version = po?.version;
  const res = await purchaseOrderService.action(poId, 'dispatch', dispatchData, version);
  await syncProcurementData();
  return res;
}

export async function acceptPurchaseOrderByVendor(poId: string, remarks: string = 'Accepted') {
  const store = useERPStore.getState();
  const po = store.state.purchaseOrders?.find((p: any) => p.id === poId);
  const version = po?.version;
  const res = await purchaseOrderService.action(poId, 'vendor-accept', { remarks }, version);
  await syncProcurementData();
  return res;
}

export async function rejectPurchaseOrderByVendor(poId: string, remarks: string) {
  const store = useERPStore.getState();
  const po = store.state.purchaseOrders?.find((p: any) => p.id === poId);
  const version = po?.version;
  const res = await purchaseOrderService.action(poId, 'vendor-reject', { remarks }, version);
  await syncProcurementData();
  return res;
}

// ---------------------------------------------------------
// DOMAIN ACTIONS: GOODS RECEIPT NOTES (GRN)
// ---------------------------------------------------------

export async function createGRN(poId: string, grnData: any, actorName: string) {
  const payload = {
    purchaseOrderId: poId,
    warehouseId: grnData.warehouseId,
    items: grnData.items.map((i: any) => ({
      productId: i.productId,
      receivedQuantity: Number(i.receivedQuantity ?? i.receivedQty ?? 0),
      acceptedQuantity: Number(i.acceptedQuantity ?? i.acceptedQty ?? 0),
      rejectedQuantity: Number(i.rejectedQuantity ?? i.rejectedQty ?? 0),
      inspectionRemarks: i.inspectionRemarks || ''
    }))
  };
  const res = await grnService.create(payload);
  await syncProcurementData();
  return res;
}

export async function submitGRN(grnId: string, actorName: string) {
  const store = useERPStore.getState();
  const grn = store.state.goodsReceipts?.find((g: any) => g.id === grnId);
  const version = grn?.version;
  const res = await grnService.action(grnId, 'submit', {}, version);
  await syncProcurementData();
  return res;
}

export async function returnGRN(grnId: string, remarks: string, actorName: string) {
  const store = useERPStore.getState();
  const grn = store.state.goodsReceipts?.find((g: any) => g.id === grnId);
  const version = grn?.version;
  const res = await grnService.action(grnId, 'return', { remarks }, version);
  await syncProcurementData();
  return res;
}

export async function approveGoodsReceiptNote(grnId: string, remarks: string = 'Approved by Finance Audit', actorName: string = 'Finance') {
  const state = getStoreState();
  const grns = safeClone(state.procurement?.goodsReceiptNotes || []);
  const rejections = safeClone(state.materialRejections || []);
  
  const idx = grns.findIndex((g: any) => g.id === grnId);
  const grn = idx !== -1 ? grns[idx] : null;

  // Remove local mock interceptor; backend will handle all GRN resolution logic natively
  const res = await procurementRequest<any>(`grns/${grnId}/audit-approve`, 'POST', { remarks });
  await syncProcurementData();
  return res;


}

export async function approveGRN(grnId: string, actorName: string) {
  return approveGoodsReceiptNote(grnId, 'Approved by Finance Audit', actorName);
}

// ---------------------------------------------------------
// DOMAIN ACTIONS: VENDOR INVOICES
// ---------------------------------------------------------

export async function createVendorInvoice(invoiceData: any, actorName: string) {
  const payload = {
    supplierId: invoiceData.supplierId,
    purchaseOrderId: invoiceData.purchaseOrderId,
    invoiceNumber: invoiceData.invoiceNumber,
    totalAmount: Number(invoiceData.totalAmount),
    dueDate: invoiceData.dueDate || null,
    items: invoiceData.items.map((i: any) => ({
      productId: i.productId,
      quantity: Number(i.quantity),
      unitRate: Number(i.unitRate || i.rate || 0),
      gstPercent: Number(i.gstPercent || i.tax || 18)
    }))
  };
  const res = await vendorInvoiceService.create(payload);
  await syncProcurementData();
  return res;
}

export async function submitVendorInvoice(invoiceId: string, actorName: string) {
  const store = useERPStore.getState();
  const invoice = store.state.vendorInvoices?.find((i: any) => i.id === invoiceId);
  const version = invoice?.version;
  const res = await vendorInvoiceService.action(invoiceId, 'submit', {}, version);
  await syncProcurementData();
  return res;
}

export async function cancelVendorInvoice(invoiceId: string, actorName: string) {
  const store = useERPStore.getState();
  const invoice = store.state.vendorInvoices?.find((i: any) => i.id === invoiceId);
  const version = invoice?.version;
  const res = await vendorInvoiceService.action(invoiceId, 'cancel', {}, version);
  await syncProcurementData();
  return res;
}

export async function runThreeWayMatch(invoiceId: string, actorName: string) {
  const store = useERPStore.getState();
  const invoice = store.state.vendorInvoices?.find((i: any) => i.id === invoiceId);
  const version = invoice?.version;
  const res = await vendorInvoiceService.action(invoiceId, 'run-match', {}, version);
  await syncProcurementData();
  return res;
}

export async function requestInvoicePayment(invoiceId: string, actorName: string) {
  const store = useERPStore.getState();
  const invoice = store.state.vendorInvoices?.find((i: any) => i.id === invoiceId);
  const version = invoice?.version;
  const res = await vendorInvoiceService.action(invoiceId, 'request-payment', {}, version);
  await syncProcurementData();
  return res;
}

// ---------------------------------------------------------
// DOMAIN ACTIONS: VENDOR PAYMENTS
// ---------------------------------------------------------

export async function createVendorPayment(paymentData: any) {
  const payload = {
    supplierId: paymentData.supplierId,
    paidAmount: Number(paymentData.paidAmount),
    allocations: paymentData.allocations.map((a: any) => ({
      vendorInvoiceId: a.vendorInvoiceId,
      amount: Number(a.amount)
    }))
  };
  const res = await vendorPaymentService.create(payload);
  await syncProcurementData();
  return res;
}

export async function submitVendorPayment(paymentId: string, actorName: string) {
  const store = useERPStore.getState();
  const payment = store.state.vendorPayments?.find((p: any) => p.id === paymentId);
  const version = payment?.version;
  const res = await vendorPaymentService.action(paymentId, 'submit', {}, version);
  await syncProcurementData();
  return res;
}

export async function approveVendorPayment(paymentId: string, actorName: string) {
  const store = useERPStore.getState();
  const payment = store.state.vendorPayments?.find((p: any) => p.id === paymentId);
  const version = payment?.version;
  const res = await vendorPaymentService.action(paymentId, 'approve', {}, version);
  await syncProcurementData();
  return res;
}

export async function processVendorPayment(paymentId: string, actorName: string) {
  const store = useERPStore.getState();
  const payment = store.state.vendorPayments?.find((p: any) => p.id === paymentId);
  const version = payment?.version;
  const res = await vendorPaymentService.action(paymentId, 'process', {}, version);
  await syncProcurementData();
  return res;
}

export async function completeVendorPayment(paymentId: string, transactionId: string, actorName: string) {
  const store = useERPStore.getState();
  const payment = store.state.vendorPayments?.find((p: any) => p.id === paymentId);
  const version = payment?.version;
  const res = await vendorPaymentService.action(paymentId, 'complete', { transactionId }, version);
  await syncProcurementData();
  return res;
}

export async function failVendorPayment(paymentId: string, actorName: string) {
  const store = useERPStore.getState();
  const payment = store.state.vendorPayments?.find((p: any) => p.id === paymentId);
  const version = payment?.version;
  const res = await vendorPaymentService.action(paymentId, 'fail', {}, version);
  await syncProcurementData();
  return res;
}

export async function cancelVendorPayment(paymentId: string, actorName: string) {
  const store = useERPStore.getState();
  const payment = store.state.vendorPayments?.find((p: any) => p.id === paymentId);
  const version = payment?.version;
  const res = await vendorPaymentService.action(paymentId, 'cancel', {}, version);
  await syncProcurementData();
  return res;
}

// ---------------------------------------------------------
// DOMAIN ACTIONS: PO CLOSURE
// ---------------------------------------------------------

export async function evaluatePOClose(poId: string) {
  return purchaseOrderService.closureStatus(poId);
}

export async function closePurchaseOrder(poId: string, reason?: string, actorName?: string) {
  const res = await procurementRequest<any>(`purchase-orders/${poId}/close`, 'POST', { reason: reason || 'Closed by Finance after full audit completion.' });
  await syncProcurementData();
  return res;
}

// ---------------------------------------------------------
// DOMAIN ACTIONS: REJECTIONS
// ---------------------------------------------------------

export async function submitMaterialRejection(data: any, actorName: string) {
  const res = await procurementRequest<any>('material-rejections', 'POST', data);
  await syncProcurementData();
  return res;
}

// ---------------------------------------------------------
// DOMAIN ACTIONS: REPLACEMENT WORKFLOW
// ---------------------------------------------------------

export async function approveVendorReplacement(data: any) {
  const res = await procurementRequest<any>(`material-rejections/${data.rejectionId}/approve`, 'POST', data);
  await syncProcurementData();
  return res;
}

export async function createReplacementGRN(rejectionId: string, grnData: any, actorName: string) {
  // Pass the rejection metadata in the snapshot so the backend can link it
  grnData.snapshot = {
    ...(grnData.snapshot || {}),
    isReplacement: true,
    materialRejectionId: rejectionId,
  };
  const res = await procurementRequest<any>('grns', 'POST', grnData);
  await syncProcurementData();
  return res;
}

export function disposeRejectedStock(rejectionId: string, quantity: number, disposition: string, actorName: string) {
  const state = getStoreState();
  const rejections = safeClone(state.materialRejections || []);
  
  const idx = rejections.findIndex((r: any) => r.id === rejectionId);
  if (idx === -1) throw new Error("Rejection not found");
  
  const rej = rejections[idx];
  
  postInventoryTransaction(rej.materialId, quantity, 'SUBTRACT', "Original rejected stock disposed via " + disposition);
  
  rej.originalStockDisposition = disposition;
  rej.updatedAt = new Date().toISOString();
}

export function raiseVendorDispute(rejectionId: string, remarks: string, actorName: string, idempotencyKey?: string) {
  const state = getStoreState();
  const rejections = safeClone(state.materialRejections || []);
  if (idempotencyKey && (state.procurementAuditLogs || []).some((l: any) => l.metadata?.idempotencyKey === idempotencyKey)) return;

  const idx = rejections.findIndex((r: any) => r.id === rejectionId);
  if (idx === -1) throw new Error("Rejection not found");
  const rej = rejections[idx];

  assertTransition('MATERIAL_REJECTION', rej.status, [MATERIAL_REJECTION_STATUS.MATERIAL_REJECTION_SUBMITTED, MATERIAL_REJECTION_STATUS.FINANCE_VENDOR_DISCUSSION], 'Raise Vendor Dispute');
  
  const oldStatus = rej.status;
  rej.status = MATERIAL_REJECTION_STATUS.VENDOR_DISPUTE;
  rej.financeRemarks = remarks;
  rej.updatedAt = new Date().toISOString();

  const audit = createProcurementAuditEntry('MATERIAL_REJECTION', rej.id, 'RAISE_VENDOR_DISPUTE', oldStatus, rej.status, actorName, 'Finance', remarks, {}, [], { idempotencyKey });
  updateStoreState({ ...state, materialRejections: rejections, procurementAuditLogs: [audit, ...(state.procurementAuditLogs || [])] });
}

export function processNoReplacement(rejectionId: string, resolutionType: string, remarks: string, actorName: string, idempotencyKey?: string) {
  const state = getStoreState();
  const rejections = safeClone(state.materialRejections || []);
  if (idempotencyKey && (state.procurementAuditLogs || []).some((l: any) => l.metadata?.idempotencyKey === idempotencyKey)) return;

  if (!['CREDIT_NOTE', 'REFUND', 'COMMERCIAL_DEDUCTION', 'WRITE_OFF'].includes(resolutionType)) {
    throw new Error("Invalid resolution type for No Replacement");
  }

  const idx = rejections.findIndex((r: any) => r.id === rejectionId);
  if (idx === -1) throw new Error("Rejection not found");
  const rej = rejections[idx];

  assertTransition('MATERIAL_REJECTION', rej.status, [MATERIAL_REJECTION_STATUS.MATERIAL_REJECTION_SUBMITTED, MATERIAL_REJECTION_STATUS.FINANCE_VENDOR_DISCUSSION, MATERIAL_REJECTION_STATUS.PARTIALLY_RESOLVED, MATERIAL_REJECTION_STATUS.VENDOR_DISPUTE], 'Process No Replacement');
  
  const oldStatus = rej.status;
  rej.status = resolutionType === 'CREDIT_NOTE' ? MATERIAL_REJECTION_STATUS.CREDIT_NOTE_PENDING : MATERIAL_REJECTION_STATUS.NO_REPLACEMENT;
  rej.financeRemarks = remarks;
  rej.expectedResolutionType = resolutionType;
  rej.updatedAt = new Date().toISOString();

  const audit = createProcurementAuditEntry('MATERIAL_REJECTION', rej.id, 'PROCESS_NO_REPLACEMENT', oldStatus, rej.status, actorName, 'Finance', remarks, {}, [], { idempotencyKey, resolutionType });
  updateStoreState({ ...state, materialRejections: rejections, procurementAuditLogs: [audit, ...(state.procurementAuditLogs || [])] });
}

export function recordCommercialAdjustment(rejectionId: string, settledQty: number, adjustmentDetails: string, actorName: string, idempotencyKey?: string) {
  const state = getStoreState();
  const rejections = safeClone(state.materialRejections || []);
  if (idempotencyKey && (state.procurementAuditLogs || []).some((l: any) => l.metadata?.idempotencyKey === idempotencyKey)) return;

}
export async function verifyPODelivery(poId: string, grnData: any, actorName: string) {
  const payload = {
    purchaseOrderId: poId,
    warehouseId: grnData.warehouseId,
    deliveryDate: grnData.deliveryDate || new Date().toISOString(),
    deliveryChallanNumber: grnData.deliveryChallanNumber || grnData.challanNo || 'CH-902',
    invoiceNumber: grnData.invoiceNumber || grnData.vendorInvoiceNo || 'INV-44',
    remarks: grnData.remarks || grnData.snapshot?.remarks || '',
    attachments: grnData.snapshot?.attachments || grnData.attachments || [],
    items: grnData.items.map((i: any) => ({
      productId: i.productId,
      deliveredQuantity: Number(i.receivedQuantity ?? i.deliveredQty ?? 0),
      acceptedQuantity: Number(i.acceptedQuantity ?? i.acceptedQty ?? 0),
      rejectedQuantity: Number(i.rejectedQuantity ?? i.rejectedQty ?? 0),
      remarks: i.inspectionRemarks || i.remarks || ''
    }))
  };
  const res = await procurementRequest<any>('store/deliveries/verify', 'POST', payload);
  await syncProcurementData();
  return res;
}

export function closeMaterialRejection(rejectionId: string, actorName: string) {
  const state = getStoreState();
  const rejections = safeClone(state.materialRejections || []);
  const idx = rejections.findIndex((r: any) => r.id === rejectionId);
  if (idx === -1) throw new Error("Rejection not found");
  const rej = rejections[idx];
  const oldStatus = rej.status;
  rej.status = 'RESOLVED';
  rej.updatedAt = new Date().toISOString();
  const audit = createProcurementAuditEntry('MATERIAL_REJECTION', rej.id, 'CLOSE_REJECTION', oldStatus, rej.status, actorName, 'Finance', 'Closed', {}, []);
  updateStoreState({ ...state, materialRejections: rejections, procurementAuditLogs: [audit, ...(state.procurementAuditLogs || [])] });
}
