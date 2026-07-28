import { useERPStore } from './erpStore';

// ---------------------------------------------------------
// SELECTORS
// ---------------------------------------------------------

function getStoreState() {
  return useERPStore.getState().state;
}

export function selectMaterialIndents(state?: any) {
  const s = state || getStoreState();
  return s.procurement?.materialIndents || [];
}

export function selectPurchaseOrders(state?: any) {
  const s = state || getStoreState();
  return s.procurement?.purchaseOrders || [];
}

export function selectGoodsReceiptNotes(state?: any) {
  const s = state || getStoreState();
  return s.procurement?.goodsReceiptNotes || [];
}

export function selectMaterialRejections(state?: any) {
  const s = state || getStoreState();
  return s.materialRejections || [];
}

// ---------------------------------------------------------
// ROLE-BASED ALLOWLIST SELECTORS
// ---------------------------------------------------------

export function selectStorePurchaseOrder(poId: string) {
  const po = selectPurchaseOrders().find((p: any) => p.id === poId);
  if (!po) return null;

  return {
    id: po.id,
    poNumber: po.poNumber,
    indentId: po.indentId,
    vendorName: po.vendorName,
    vendorDisplayName: po.vendorDisplayName,
    status: po.status,
    expectedDeliveryDate: po.expectedDeliveryDate,
    createdAt: po.createdAt,
    updatedAt: po.updatedAt,
    closureRemarks: po.closureRemarks,
    items: (po.items || []).map((item: any) => ({
      materialId: item.materialId,
      materialCode: item.materialCode,
      materialName: item.materialName,
      unit: item.unit,
      orderedQty: item.orderedQty,
      cumulativeDeliveredQty: item.cumulativeDeliveredQty,
      cumulativeAcceptedQty: item.cumulativeAcceptedQty,
      cumulativeRejectedQty: item.cumulativeRejectedQty,
      cumulativeCancelledQty: item.cumulativeCancelledQty,
      cumulativeCommerciallySettledQty: item.cumulativeCommerciallySettledQty,
      remainingSupplyQty: item.remainingSupplyQty,
      priority: item.priority,
      requiredDate: item.requiredDate,
      reason: item.reason,
    }))
  };
}

export function selectPlantHeadPurchaseOrder(poId: string) {
  // Plant Head has same restricted access as Store
  return selectStorePurchaseOrder(poId);
}

export function selectFinancePurchaseOrder(poId: string) {
  // Finance sees everything including commercial data
  const po = selectPurchaseOrders().find((p: any) => p.id === poId);
  return po || null;
}

export function selectSuperAdminPurchaseOrder(poId: string) {
  // Super Admin sees everything
  const po = selectPurchaseOrders().find((p: any) => p.id === poId);
  return po || null;
}

// ---------------------------------------------------------
// CALCULATED TOTALS FOR RECONCILIATION
// ---------------------------------------------------------

export function getPurchaseOrderDeliveredTotals(poId: string) {
  const grns = selectGoodsReceiptNotes().filter((g: any) => g.poId === poId);
  
  let reportedDeliveredQty = 0;
  let approvedDeliveredQty = 0;

  grns.forEach((grn: any) => {
    if (grn.status !== 'FINANCE_REJECTED' && grn.status !== 'DRAFT' && grn.status !== 'RETURNED_TO_STORE') {
      grn.items.forEach((item: any) => {
        const del = Number(item.deliveredQty || item.receivedQuantity || 0);
        reportedDeliveredQty += del;
        if (grn.status === 'FINANCE_APPROVED' || grn.status === 'FINANCE_AUDIT_APPROVED') {
          approvedDeliveredQty += del;
        }
      });
    }
  });

  return {
    reportedDeliveredQty,
    approvedDeliveredQty
  };
}
