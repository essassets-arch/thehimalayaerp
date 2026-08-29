import { useERPStore } from './erpStore';
import { useAuthStore } from './authStore';
import { backendFetch } from '../lib/backendFetch';
import { SEEDED_INVENTORY_ITEMS } from '../shared/data/inventoryMasterData';
import { purchaseIndentService } from '../services/procurement/purchaseIndentService';
import { purchaseOrderService } from '../services/procurement/purchaseOrderService';
import { grnService } from '../services/procurement/grnService';
import { vendorInvoiceService } from '../services/procurement/vendorInvoiceService';
import { vendorPaymentService } from '../services/procurement/vendorPaymentService';
import { procurementRequest } from '../services/procurement/procurementClient';
import { hasPermission } from '../services/permissions/permissionService';

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

  const authUser = useAuthStore.getState().user;
  const role = authUser?.role || '';
  const isProcurementRole = ['SUPER_ADMIN', 'ADMIN', 'PROCUREMENT', 'PROCUREMENT_EXECUTIVE', 'PLANT_HEAD', 'FINANCE', 'STORE', 'STORE_MANAGER'].some(r => role.toUpperCase().includes(r));

  // safeList: returns empty array on 403/permission errors but logs other errors
  const safeList = async (label: string, fn: () => Promise<any>) => {
    try {
      const res = await fn();
      return Array.isArray(res) ? res : (res?.data || []);
    } catch (err: any) {
      if (err?.status === 403 || err?.code === 'FORBIDDEN') {
        // Expected if current role lacks granular permission
      } else {
        console.warn(`[syncProcurementData] Failed to load "${label}":`, err?.message || err);
      }
      return [];
    }
  };

  const materialIndents = (isProcurementRole || hasPermission(authUser, 'procurement.indents.read'))
    ? await safeList('indents', () => purchaseIndentService.list({ limit: 100 }))
    : [];
  const purchaseOrders = (isProcurementRole || hasPermission(authUser, 'procurement.purchase_orders.read'))
    ? await safeList('purchase-orders', () => purchaseOrderService.list({ limit: 100 }))
    : [];
  const goodsReceiptNotes = (isProcurementRole || hasPermission(authUser, 'procurement.grns.read'))
    ? await safeList('grns', () => grnService.list({ limit: 100 }))
    : [];
  const vendorInvoices = (['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'PROCUREMENT'].some(r => role.toUpperCase().includes(r)) || hasPermission(authUser, 'procurement.invoices.read'))
    ? await safeList('vendor-invoices', () => vendorInvoiceService.list({ limit: 100 }))
    : [];
  const vendorPayments = (['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'PROCUREMENT'].some(r => role.toUpperCase().includes(r)) || hasPermission(authUser, 'procurement.payments.read'))
    ? await safeList('vendor-payments', () => vendorPaymentService.list({ limit: 100 }))
    : [];
  const materialRejectionsRaw = await safeList('material-rejections', () => procurementRequest<any>('material-rejections', 'GET'));
  const materialRejections = materialRejectionsRaw.map((rej: any) => ({
    ...rej,
    poId: rej.purchaseOrder?.poNumber || rej.purchaseOrderId || rej.poId,
    materialId: rej.items?.[0]?.productId || rej.materialId,
    materialName: rej.items?.[0]?.product?.name || rej.materialName,
    rejectedQty: rej.items?.[0]?.quantity || rej.rejectedQty,
    remainingResolutionQty: rej.items?.[0]?.quantity || rej.rejectedQty || 0,
    expectedDeliveryDate: rej.expectedResolutionDate || rej.expectedDeliveryDate,
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

  const inventoryItemsRaw = await backendFetch<any>('/api/backend/inventory/items').catch(() => []);
  const itemsList = Array.isArray(inventoryItemsRaw) && inventoryItemsRaw.length > 0
    ? inventoryItemsRaw
    : SEEDED_INVENTORY_ITEMS;

  const rawInventory = itemsList.map((item: any, idx: number) => ({
    id: String(item.id || item.code || `RM-ID-${idx + 1}`),
    srNo: item.srNo || idx + 1,
    code: item.code || `HCPPL${String(idx + 1).padStart(3, '0')}`,
    material: item.itemName || item.material,
    category: item.category || 'Hardware',
    unit: item.unit || 'PCS',
    stock: item.balance ?? item.stock ?? 0,
    minStock: item.minStock ?? item.reorderLevel ?? 20,
    reorderLevel: item.minStock ?? item.reorderLevel ?? 20,
    rate: 0,
  }));

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
  // The backend currently creates low-stock indents directly in the Plant Head
  // queue. Only draft indents need the separate submit transition.
  if (res && res.id && res.status === 'DRAFT') {
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
  const indent = (store.state.purchaseIndents || []).find((i: any) => 
    i.id === indentId || i.publicId === indentId || i.indentNo === indentId
  ) || (store.state.procurement?.materialIndents || []).find((i: any) => 
    i.id === indentId || i.publicId === indentId
  );
  const version = indent?.version;

  if (indent && (indent.status === 'PLANT_HEAD_APPROVED' || indent.status === 'APPROVED')) {
    console.warn(`[approveMaterialIndent] Indent ${indentId} is already in ${indent.status} status. Skipping redundant backend call.`);
    return indent;
  }

  const items = approvedItems.map(i => ({
    productId: i.productId || i.materialId,
    approvedQuantity: Number(i.approvedQuantity ?? i.approvedQty ?? i.quantity ?? 0),
    // quantity must be >= approvedQuantity for the backend validation;
    // pass the stored requestedQuantity if available, otherwise use approvedQuantity itself
    quantity: Number(i.quantity ?? i.requestedQuantity ?? i.approvedQuantity ?? i.approvedQty ?? 0)
  }));

  try {
    const res = await purchaseIndentService.action(indentId, 'approve', { items, remarks }, version);
    await syncProcurementData();
    return res;
  } catch (err: any) {
    if (err?.status === 409 || (err?.message && (err.message.includes('PLANT_HEAD_APPROVED') || err.message.includes('Conflict')))) {
      console.warn(`[approveMaterialIndent] 409 Conflict gracefully handled: ${err.message}`);
      await syncProcurementData();
      return { success: true, message: 'Indent already approved' };
    }
    throw err;
  }
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
  const isLocalOrDemoIndent = !indentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(indentId);

  const poId = poData.id || `PO-DRAFT-${Date.now()}`;
  const totalAmountNum = Number(poData.totalAmount || 0);
  let localStatus = 'DRAFT';
  if (totalAmountNum <= 10000) {
    localStatus = 'FINANCE_APPROVED';
  }

  const newPO = {
    id: poId,
    poNumber: poId,
    publicId: poId,
    indentId: indentId,
    purchaseIndentId: indentId,
    vendorName: poData.vendorName || poData.supplierName || 'Selected Vendor',
    vendorId: poData.vendorId || poData.supplierId,
    supplierId: poData.supplierId || poData.vendorId,
    status: localStatus,
    paymentTerms: poData.paymentTerms || '30 Days Net',
    expectedDeliveryDate: poData.expectedDeliveryDate || poData.expectedDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    totalAmount: totalAmountNum,
    subtotal: totalAmountNum * 0.82,
    gstAmount: totalAmountNum * 0.18,
    freight: Number(poData.freight || 0),
    items: poData.items || [],
    createdAt: new Date().toISOString(),
    version: 1
  };

  if (isLocalOrDemoIndent) {
    useERPStore.setState((prev: any) => {
      const existingPOs = prev.state?.procurement?.purchaseOrders || prev.state?.purchaseOrders || [];
      const updatedPOs = [newPO, ...existingPOs.filter((p: any) => p.id !== poId)];
      return {
        state: {
          ...prev.state,
          purchaseOrders: updatedPOs,
          procurement: {
            ...(prev.state?.procurement || {}),
            purchaseOrders: updatedPOs
          }
        }
      };
    });
    return newPO;
  }

  const payload = {
    supplierId: poData.supplierId || poData.vendorId,
    totalAmount: totalAmountNum,
    freight: Number(poData.freight || 0),
    otherCharges: Number(poData.otherCharges || 0),
    paymentTerms: poData.paymentTerms || '',
    expectedDeliveryDate: poData.expectedDeliveryDate || poData.expectedDate || null,
    items: (poData.items || []).map((i: any) => ({
      productId: i.productId || i.materialId || i.id,
      quantity: Number(i.quantity || 0),
      unitPrice: Number(i.unitPrice || i.rate || 0),
      discountPercent: Number(i.discountPercent || i.discount || 0),
      gstPercent: Number(i.gstPercent || i.tax || 18)
    }))
  };

  try {
    const res = await purchaseOrderService.createFromIndent(indentId, payload);
    await syncProcurementData();
    return res;
  } catch (err: any) {
    // A real indent must never turn into a browser-only PO when the server
    // rejects it. That bypasses Plant Head/Super Admin workflow controls.
    console.warn(`[createPurchaseOrder] Backend createFromIndent failed for ${indentId}: ${err?.message || err}.`);
    throw err;
  }
}

const isLocalId = (id: string) => !id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || id.startsWith('PO-') || id.startsWith('INDENT-');

export async function submitPurchaseOrder(poId: string, actorName: string = 'Finance') {
  const store = useERPStore.getState();
  const po = store.state.purchaseOrders?.find((p: any) => p.id === poId || p.poNumber === poId || p.publicId === poId);
  const totalVal = Number(po?.totalAmount || po?.grandTotal || po?.value || 0);

  let targetStatus = 'PENDING_SUPER_ADMIN_APPROVAL';
  if (totalVal <= 10000) {
    targetStatus = 'FINANCE_APPROVED';
  } else if (totalVal <= 15000) {
    targetStatus = 'PENDING_PLANT_HEAD_PURCHASE_APPROVAL';
  } else {
    targetStatus = 'PENDING_SUPER_ADMIN_APPROVAL';
  }

  const updateLocal = () => {
    useERPStore.setState((prev: any) => {
      const pos = prev.state?.purchaseOrders || prev.state?.procurement?.purchaseOrders || [];
      const updated = pos.map((p: any) => (p.id === poId || p.poNumber === poId || p.publicId === poId) ? { ...p, status: targetStatus } : p);
      return {
        state: {
          ...prev.state,
          purchaseOrders: updated,
          procurement: {
            ...(prev.state?.procurement || {}),
            purchaseOrders: updated
          }
        }
      };
    });
    return { success: true, id: poId, status: targetStatus };
  };

  if (isLocalId(poId)) throw new Error('A persisted Purchase Order ID is required.');

  const version = po?.version;
  try {
    const res = await purchaseOrderService.action(poId, 'submit', {}, version);
    await syncProcurementData();
    return res;
  } catch (err: any) {
    throw err;
  }
}

export async function plantHeadApprovePurchaseOrder(poId: string, remarks: string = 'Approved by Plant Head', actorName: string = 'Plant Head') {
  if (isLocalId(poId)) throw new Error('A persisted Purchase Order ID is required.');

  const store = useERPStore.getState();
  const po = store.state.purchaseOrders?.find((p: any) => p.id === poId || p.poNumber === poId || p.publicId === poId);
  const version = po?.version;
  try {
    const res = await purchaseOrderService.action(poId, 'plant-head-approve', { remarks }, version);
    await syncProcurementData();
    return res;
  } catch (err: any) {
    throw err;
  }
}

export async function plantHeadRejectPurchaseOrder(poId: string, remarks: string, actorName: string = 'Plant Head') {
  if (isLocalId(poId)) throw new Error('A persisted Purchase Order ID is required.');

  const store = useERPStore.getState();
  const po = store.state.purchaseOrders?.find((p: any) => p.id === poId || p.poNumber === poId || p.publicId === poId);
  const version = po?.version;
  try {
    const res = await purchaseOrderService.action(poId, 'plant-head-reject', { remarks }, version);
    await syncProcurementData();
    return res;
  } catch (err: any) {
    throw err;
  }
}

export async function approvePurchaseOrder(poId: string, remarks: string, actorName: string) {
  const updateLocal = () => {
    useERPStore.setState((prev: any) => {
      const pos = prev.state?.purchaseOrders || prev.state?.procurement?.purchaseOrders || [];
      const updated = pos.map((p: any) => (p.id === poId || p.poNumber === poId || p.publicId === poId) ? { ...p, status: 'SUPER_ADMIN_APPROVED', superAdminRemarks: remarks } : p);
      return {
        state: {
          ...prev.state,
          purchaseOrders: updated,
          procurement: {
            ...(prev.state?.procurement || {}),
            purchaseOrders: updated
          }
        }
      };
    });
    return { success: true, id: poId, status: 'SUPER_ADMIN_APPROVED' };
  };

  if (isLocalId(poId)) throw new Error('A persisted Purchase Order ID is required.');

  const store = useERPStore.getState();
  const po = store.state.purchaseOrders?.find((p: any) => p.id === poId);
  const version = po?.version;
  try {
    const res = await purchaseOrderService.action(poId, 'approve', { remarks }, version);
    await syncProcurementData();
    return res;
  } catch (err: any) {
    throw err;
  }
}

export async function returnPurchaseOrderForCorrection(poId: string, remarks: string, actorName: string) {
  if (isLocalId(poId)) throw new Error('A persisted Purchase Order ID is required.');
  const store = useERPStore.getState();
  const po = store.state.purchaseOrders?.find((p: any) => p.id === poId);
  const version = po?.version;
  try {
    const res = await purchaseOrderService.action(poId, 'return', { remarks }, version);
    await syncProcurementData();
    return res;
  } catch (err: any) { throw err; }
}

export async function rejectPurchaseOrder(poId: string, remarks: string, actorName: string) {
  const updateLocal = () => {
    useERPStore.setState((prev: any) => {
      const pos = prev.state?.purchaseOrders || prev.state?.procurement?.purchaseOrders || [];
      const updated = pos.map((p: any) => (p.id === poId || p.poNumber === poId || p.publicId === poId) ? { ...p, status: 'SUPER_ADMIN_REJECTED', rejectionReason: remarks } : p);
      return {
        state: {
          ...prev.state,
          purchaseOrders: updated,
          procurement: {
            ...(prev.state?.procurement || {}),
            purchaseOrders: updated
          }
        }
      };
    });
    return { success: true, id: poId, status: 'SUPER_ADMIN_REJECTED' };
  };

  if (isLocalId(poId)) throw new Error('A persisted Purchase Order ID is required.');

  const store = useERPStore.getState();
  const po = store.state.purchaseOrders?.find((p: any) => p.id === poId);
  const version = po?.version;
  try {
    const res = await purchaseOrderService.action(poId, 'reject', { remarks }, version);
    await syncProcurementData();
    return res;
  } catch (err: any) { throw err; }
}

export async function issuePurchaseOrder(poId: string, payload: any = {}) {
  const updateLocal = () => {
    useERPStore.setState((prev: any) => {
      const pos = prev.state?.purchaseOrders || prev.state?.procurement?.purchaseOrders || [];
      const updated = pos.map((p: any) => (p.id === poId || p.poNumber === poId || p.publicId === poId) ? { ...p, status: 'ORDERED' } : p);
      return {
        state: {
          ...prev.state,
          purchaseOrders: updated,
          procurement: {
            ...(prev.state?.procurement || {}),
            purchaseOrders: updated
          }
        }
      };
    });
    return { success: true, id: poId, status: 'ORDERED' };
  };

  if (isLocalId(poId)) throw new Error('A persisted Purchase Order ID is required.');

  const store = useERPStore.getState();
  const po = store.state.purchaseOrders?.find((p: any) => p.id === poId);
  const version = po?.version;
  try {
    const res = await purchaseOrderService.action(poId, 'issue', payload, version);
    await syncProcurementData();
    return res;
  } catch (err: any) {
    // Real POs must be issued by the backend so Store only receives an
    // authoritative ORDERED record after Finance confirms placement.
    throw err;
  }
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
  const state = useERPStore.getState().state;
  const rejection = (state.materialRejections || []).find((item: any) => item.id === rejectionId);
  const purchaseOrderId = grnData.purchaseOrderId || rejection?.purchaseOrderId || rejection?.poId;
  if (!purchaseOrderId) {
    throw new Error('This material rejection is not linked to a Purchase Order. Refresh and try again.');
  }

  // A replacement is a real Store delivery, not a draft GRN.  Using the delivery
  // endpoint guarantees a PENDING_FINANCE_AUDIT GRN and a durable PO/rejection link.
  const res = await procurementRequest<any>('store/deliveries/verify', 'POST', {
    ...grnData,
    purchaseOrderId,
    isReplacement: true,
    materialRejectionId: rejectionId,
    remarks: grnData.remarks || 'Replacement delivery inspection',
  });
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
    isReplacement: Boolean(grnData.isReplacement),
    materialRejectionId: grnData.materialRejectionId || null,
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
