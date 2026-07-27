import { useERPStore } from './erpStore';
import { createId, createProcurementAuditEntry } from '../constants/procurement';

if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
  console.warn("Demo seed functions are only available in development or test environments.");
}

export function resetProcurementDemoEntities(demoIds: string[]) {
  const store = useERPStore.getState();
  const state = store.state;
  const newState = { ...state };
  
  // Safely filter out demo IDs from all relevant collections
  const filterOutDemoIds = (collection: any[]) => 
    (collection || []).filter((item: any) => 
      !demoIds.includes(item.id) && 
      !demoIds.includes(item.materialId) &&
      !demoIds.includes(item.indentId) &&
      !demoIds.includes(item.poId) &&
      !demoIds.includes(item.grnId) &&
      !demoIds.includes(item.originalGrnId) &&
      !demoIds.includes(item.rejectionId) &&
      !demoIds.includes(item.replacementScheduleId) &&
      !demoIds.includes(item.entityId) // for audits
    );

  newState.rawInventory = (newState.rawInventory || []).filter((i: any) => i.id !== 'MAT-RM-1605' && i.materialCode !== 'RM-1605');
  newState.lowStockAlerts = filterOutDemoIds(newState.lowStockAlerts);
  newState.materialIndents = filterOutDemoIds(newState.materialIndents);
  newState.materialIndentItems = filterOutDemoIds(newState.materialIndentItems);
  newState.purchaseOrders = filterOutDemoIds(newState.purchaseOrders);
  newState.purchaseOrderItems = filterOutDemoIds(newState.purchaseOrderItems);
  newState.goodsReceiptNotes = filterOutDemoIds(newState.goodsReceiptNotes);
  newState.goodsReceiptNoteItems = filterOutDemoIds(newState.goodsReceiptNoteItems);
  newState.procurementDocuments = filterOutDemoIds(newState.procurementDocuments);
  newState.materialRejections = filterOutDemoIds(newState.materialRejections);
  newState.materialReplacementSchedules = filterOutDemoIds(newState.materialReplacementSchedules);
  newState.replacementReceipts = filterOutDemoIds(newState.replacementReceipts);
  newState.procurementAuditLogs = filterOutDemoIds(newState.procurementAuditLogs);
  newState.procurementNotifications = filterOutDemoIds(newState.procurementNotifications);
  newState.vendorInvoices = filterOutDemoIds(newState.vendorInvoices);
  newState.vendorInvoiceItems = filterOutDemoIds(newState.vendorInvoiceItems);
  newState.vendorCreditNotes = filterOutDemoIds(newState.vendorCreditNotes);
  if (newState.invoiceAuditLogs) newState.invoiceAuditLogs = filterOutDemoIds(newState.invoiceAuditLogs);
  if (newState.inventoryTransactions) newState.inventoryTransactions = filterOutDemoIds(newState.inventoryTransactions);
  
  store.setState(newState);
}

export function seedFinalProcurementDemo() {
  const store = useERPStore.getState();
  const state = store.state;
  const newState = { ...state };

  // 1. Seed Material
  if (!newState.rawInventory) newState.rawInventory = [];
  if (!newState.rawInventory.find((i: any) => i.id === "MAT-RM-1605")) {
    newState.rawInventory.push({
      id: "MAT-RM-1605",
      materialCode: "RM-1605",
      materialName: "High-Tensile Steel Sheets",
      category: "Raw Material",
      unit: "Sheets",
      currentStock: 140, 
      quantity: 140, // some components might use quantity instead of currentStock
      minimumStock: 500,
      maximumStock: 3000,
      reorderLevel: 600,
      warehouseLocationId: "WH-RM-A01"
    });
  }

  // 2. Seed Low Stock Alert
  if (!newState.lowStockAlerts) newState.lowStockAlerts = [];
  if (!newState.lowStockAlerts.find((a: any) => a.id === "LSA-RM-1605")) {
    newState.lowStockAlerts.push({
      id: "LSA-RM-1605",
      materialId: "MAT-RM-1605",
      currentStock: 140,
      minimumStock: 500,
      shortageQty: 360,
      status: "ACTIVE",
      severity: "CRITICAL"
    });
  }

  // 3. Seed Material Indent in PENDING_PLANT_HEAD_APPROVAL
  if (!newState.materialIndents) newState.materialIndents = [];
  if (!newState.materialIndents.find((i: any) => i.id === "IND-2026-1605-PLANT")) {
    newState.materialIndents.push({
      id: "IND-2026-1605-PLANT",
      indentNumber: "IND-2026-1605-PLANT",
      requestedByRole: "STORE",
      requestedByName: "Store Admin",
      requestedDate: "2026-07-20T09:30:00+05:30",
      requiredDate: "2026-07-28",
      priority: "URGENT",
      purpose: "Immediate requirement for Batch #1605 Q3 cap",
      status: "PENDING_PLANT_HEAD_APPROVAL"
    });
    
    if (!newState.materialIndentItems) newState.materialIndentItems = [];
    newState.materialIndentItems.push({
      id: "INDITEM-1605-01",
      indentId: "IND-2026-1605-PLANT",
      materialId: "MAT-RM-1605",
      materialCode: "RM-1605",
      materialName: "High-Tensile Steel Sheets",
      requestedQty: 1605,
      approvedQty: 0,
      unit: "Sheets",
      reason: "Immediate requirement for Batch #1605 Q3 cap"
    });
    
    if (!newState.procurementAuditLogs) newState.procurementAuditLogs = [];
    newState.procurementAuditLogs.push(createProcurementAuditEntry(
      'INDENT', 'IND-2026-1605-PLANT', 'MATERIAL_INDENT_SUBMITTED', null, 'PENDING_PLANT_HEAD_APPROVAL', 'Store Admin', 'Store'
    ));
  }

  store.setState(newState);
}
