import { useERPStore } from './erpStore';
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
// HELPERS
// ---------------------------------------------------------

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

export function createMaterialIndent(data: any, actorName: string) {
  useERPStore.getState().createMaterialIndent(data);
}

export function returnIndentForCorrection(indentId: string, remarks: string, actorName: string) {
  useERPStore.getState().returnMaterialIndent(indentId, remarks);
}

export function approveMaterialIndent(indentId: string, approvedItems: any[], remarks: string, actorName: string) {
  useERPStore.getState().approveMaterialIndent(indentId, approvedItems, remarks);
}

export function createPurchaseOrder(indentId: string, poData: any, actorName: string) {
  useERPStore.getState().createPurchaseOrderFromIndent(indentId, poData, actorName);
}

export function submitPurchaseOrder(poId: string, actorName: string) {
  useERPStore.getState().submitPurchaseOrder(poId, actorName);
}

export function approvePurchaseOrder(poId: string, remarks: string, actorName: string) {
  useERPStore.getState().approvePurchaseOrder(poId, remarks, actorName);
}

export function issuePurchaseOrder(poId: string, actorName: string) {
  useERPStore.getState().issuePurchaseOrder(poId, undefined, actorName);
}

export function createGRN(poId: string, grnData: any, actorName: string) {
  useERPStore.getState().createGoodsReceipt(poId, grnData, actorName);
}

export function approveGoodsReceiptNote(grnId: string, remarks: string = 'Approved by Finance Audit', actorName: string = 'Finance') {
  (useERPStore.getState() as any).approveGoodsReceiptNote(grnId, remarks, actorName);
}

export function approveGRN(grnId: string, actorName: string) {
  approveGoodsReceiptNote(grnId, 'Approved by Finance Audit', actorName);
}

// ---------------------------------------------------------
// DOMAIN ACTIONS: REJECTIONS
// ---------------------------------------------------------

export function submitMaterialRejection(data: any, actorName: string) {
  const state = getStoreState();
  const rejections = safeClone(state.materialRejections || []);
  const pos = safeClone(state.procurement?.purchaseOrders || []);

  const poIdx = pos.findIndex((p: any) => p.id === data.poId);
  if (poIdx > -1) {
    const poItem = pos[poIdx].items.find((i: any) => i.materialId === data.materialId);
    if (poItem) {
      if (data.rejectedQty > poItem.cumulativeAcceptedQty) {
        throw new Error("Cannot reject more than currently accepted");
      }
    }
  }

  // Move inventory to REJECTION_HOLD
  postInventoryTransaction(data.materialId, data.rejectedQty, 'RESERVE', `Rejection submitted for PO ${data.poId}`);

  const newRej = {
    ...data,
    id: data.id || createId('REJ'),
    rejectionNumber: data.rejectionNumber || createHumanNo('REJ'),
    status: MATERIAL_REJECTION_STATUS.MATERIAL_REJECTION_SUBMITTED,
    replacementApprovedQty: 0,
    cumulativeReplacementDeliveredQty: 0,
    cumulativeReplacementAcceptedQty: 0,
    cumulativeReplacementRejectedQty: 0,
    commerciallySettledQty: 0,
    remainingResolutionQty: data.rejectedQty,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const audit = createProcurementAuditEntry(
    'MATERIAL_REJECTION', newRej.id, 'SUBMIT', null, newRej.status, actorName, 'Store'
  );

  updateStoreState({
    ...getStoreState(),
    procurement: {
      ...(getStoreState().procurement || {}),
      purchaseOrders: pos
    },
    materialRejections: [newRej, ...rejections],
    procurementAuditLogs: [audit, ...(getStoreState().procurementAuditLogs || [])]
  });
}

// ---------------------------------------------------------
// DOMAIN ACTIONS: REPLACEMENT WORKFLOW
// ---------------------------------------------------------

export function approveVendorReplacement({
  rejectionId,
  approvedReplacementQty,
  expectedDeliveryDate,
  vendorAcknowledgementNumber,
  vendorRemarks,
  financeRemarks,
  defectiveMaterialDisposition,
  documentIds = [],
  actor
}: any) {
  const state = getStoreState();
  const rejections = safeClone(state.materialRejections || []);
  
  const idx = rejections.findIndex((r: any) => r.id === rejectionId);
  if (idx === -1) throw new Error("Rejection not found");
  
  const rej = rejections[idx];
  
  if (approvedReplacementQty > rej.remainingResolutionQty) {
    throw new Error(`Cannot approve more than remaining resolution quantity (${rej.remainingResolutionQty})`);
  }
  
  const oldStatus = rej.status;
  rej.status = MATERIAL_REJECTION_STATUS.REPLACEMENT_EXPECTED;
  rej.replacementApprovedQty = approvedReplacementQty;
  rej.expectedDeliveryDate = expectedDeliveryDate;
  rej.vendorAcknowledgementNumber = vendorAcknowledgementNumber;
  rej.vendorRemarks = vendorRemarks;
  rej.financeRemarks = financeRemarks;
  rej.defectiveMaterialDisposition = defectiveMaterialDisposition;
  rej.documentIds = [...(rej.documentIds || []), ...documentIds];
  rej.updatedAt = new Date().toISOString();
  
  const audit = createProcurementAuditEntry(
    'MATERIAL_REJECTION', rej.id, 'APPROVE_REPLACEMENT', oldStatus, rej.status, actor, 'Finance'
  );
  
  updateStoreState({
    ...state,
    materialRejections: rejections,
    procurementAuditLogs: [audit, ...(state.procurementAuditLogs || [])]
  });
}

export function createReplacementGRN(rejectionId: string, grnData: any, actorName: string) {
  const state = getStoreState();
  const rejections = safeClone(state.materialRejections || []);
  const grns = safeClone(state.procurement?.goodsReceiptNotes || []);
  
  const rejIdx = rejections.findIndex((r: any) => r.id === rejectionId);
  if (rejIdx === -1) throw new Error("Rejection not found");
  const rej = rejections[rejIdx];
  
  assertTransition('MATERIAL_REJECTION', rej.status, [MATERIAL_REJECTION_STATUS.REPLACEMENT_EXPECTED, MATERIAL_REJECTION_STATUS.PARTIALLY_RESOLVED], 'Create Replacement GRN');

  const items = grnData.items || [];
  const totalDelivered = items.reduce((acc: number, item: any) => acc + Number(item.deliveredQty || item.receivedQuantity || 0), 0);
  const totalAccepted = items.reduce((acc: number, item: any) => acc + Number(item.acceptedQty || item.acceptedQuantity || 0), 0);
  const totalRejected = items.reduce((acc: number, item: any) => acc + Number(item.rejectedQty || item.rejectedQuantity || 0), 0);

  const newGRN = {
    ...grnData,
    id: grnData.id || createId('GRN-REP'),
    grnNumber: grnData.grnNumber || createHumanNo('GRN-REP'),
    grnType: GRN_TYPE.REPLACEMENT,
    poId: rej.poId,
    originalGrnId: rej.grnId,
    materialRejectionId: rej.id,
    status: GRN_STATUS.SUBMITTED_FOR_FINANCE_AUDIT,
    commercialTreatment: COMMERCIAL_TREATMENT.ZERO_VALUE_REPLACEMENT,
    receivedQty: totalDelivered,
    acceptedQty: totalAccepted,
    rejectedQty: totalRejected,
    items: items.map((item: any) => ({
      ...item,
      deliveredQty: Number(item.deliveredQty || item.receivedQuantity || 0),
      acceptedQty: Number(item.acceptedQty || item.acceptedQuantity || 0),
      rejectedQty: Number(item.rejectedQty || item.rejectedQuantity || 0),
      inventoryPosted: false,
      rejectionId: rej.id
    })),
    createdBy: actorName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  newGRN.items.forEach((grnItem: any) => {
    if (grnItem.deliveredQty > rej.replacementApprovedQty - rej.cumulativeReplacementDeliveredQty) {
      throw new Error("Cannot receive more than remaining scheduled replacement quantity");
    }
    if (grnItem.acceptedQty + grnItem.rejectedQty !== grnItem.deliveredQty) {
      throw new Error("Accepted + Rejected must equal Delivered");
    }
  });
  
  rej.cumulativeReplacementDeliveredQty += newGRN.items.reduce((acc: number, item: any) => acc + item.deliveredQty, 0);
  rej.updatedAt = new Date().toISOString();

  const audit = createProcurementAuditEntry(
    'GRN', newGRN.id, 'CREATE_REPLACEMENT_GRN', null, newGRN.status, actorName, 'Store'
  );

  updateStoreState({
    ...state,
    procurement: {
      ...(state.procurement || {}),
      goodsReceiptNotes: [newGRN, ...grns]
    },
    materialRejections: rejections,
    procurementAuditLogs: [audit, ...(state.procurementAuditLogs || [])]
  });
}

// ---------------------------------------------------------
// CLOSURE HELPERS
// ---------------------------------------------------------

export function canClosePurchaseOrder(poId: string) {
  const state = getStoreState();
  const po = (state.procurement?.purchaseOrders || []).find((p: any) => p.id === poId);
  if (!po) return { allowed: false, blockers: ['PO not found'] };

  const blockers: string[] = [];

  po.items.forEach((item: any) => {
    if (item.remainingSupplyQty > 0) {
      blockers.push(`Item ${item.materialName} has ${item.remainingSupplyQty} remaining supply.`);
    }
  });

  const grns = (state.procurement?.goodsReceiptNotes || []).filter((g: any) => g.poId === poId);
  grns.forEach((g: any) => {
    if (g.status !== GRN_STATUS.FINANCE_APPROVED && g.status !== GRN_STATUS.FINANCE_REJECTED && g.status !== 'FINANCE_AUDIT_APPROVED') {
      blockers.push(`GRN ${g.grnNumber} is not finalized (${g.status}).`);
    }
  });

  const rejections = (state.materialRejections || []).filter((r: any) => r.poId === poId);
  rejections.forEach((r: any) => {
    if (r.status !== MATERIAL_REJECTION_STATUS.CLOSED) {
      blockers.push(`Rejection ${r.rejectionNumber} is not closed.`);
    }
  });

  return {
    allowed: blockers.length === 0,
    blockers
  };
}

export function closePurchaseOrder(poId: string, remarks: string, actorName: string) {
  const state = getStoreState();
  const pos = safeClone(state.procurement?.purchaseOrders || []);
  
  const idx = pos.findIndex((p: any) => p.id === poId);
  if (idx === -1) throw new Error("PO not found");

  const closureCheck = canClosePurchaseOrder(poId);
  if (!closureCheck.allowed) {
    throw new Error("Cannot close PO. Blockers: " + closureCheck.blockers.join(", "));
  }

  const oldStatus = pos[idx].status;
  pos[idx].status = PO_STATUS.PO_CLOSED;
  pos[idx].closureRemarks = remarks;
  pos[idx].updatedAt = new Date().toISOString();

  const audit = createProcurementAuditEntry(
    'PURCHASE_ORDER', poId, 'CLOSE', oldStatus, pos[idx].status, actorName, 'Finance', remarks
  );

  updateStoreState({
    ...state,
    procurement: {
      ...(state.procurement || {}),
      purchaseOrders: pos
    },
    procurementAuditLogs: [audit, ...(state.procurementAuditLogs || [])]
  });
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

  const audit = createProcurementAuditEntry(
    'MATERIAL_REJECTION', rej.id, 'DISPOSE_ORIGINAL_STOCK', rej.status, rej.status, actorName, 'Finance', disposition
  );

  updateStoreState({ ...getStoreState(), materialRejections: rejections, procurementAuditLogs: [audit, ...(getStoreState().procurementAuditLogs || [])] });
}

export function rejectStoreRejection(rejectionId: string, remarks: string, actorName: string, idempotencyKey?: string) {
  const state = getStoreState();
  const rejections = safeClone(state.materialRejections || []);
  const logs = state.procurementAuditLogs || [];

  if (idempotencyKey && logs.some((l: any) => l.metadata?.idempotencyKey === idempotencyKey)) return;

  const idx = rejections.findIndex((r: any) => r.id === rejectionId);
  if (idx === -1) throw new Error("Rejection not found");
  const rej = rejections[idx];

  assertTransition('MATERIAL_REJECTION', rej.status, [MATERIAL_REJECTION_STATUS.MATERIAL_REJECTION_SUBMITTED, MATERIAL_REJECTION_STATUS.FINANCE_VENDOR_DISCUSSION], 'Reject Store Rejection');

  const rawInventory = safeClone(state.rawInventory || []);
  let item = rawInventory.find((i: any) => i.id === rej.materialId || i.materialCode === rej.materialId);
  if (item) {
    item.reservedQty = (item.reservedQty || 0) - rej.rejectedQty;
    item.quantity += rej.rejectedQty;
    item.history.push({ date: new Date().toISOString(), quantity: rej.rejectedQty, type: 'RESTORE_RESERVED', remarks: `Store Rejection ${rej.rejectionNumber} Rejected by Finance` });
    updateStoreState({ ...state, rawInventory });
  }

  const oldStatus = rej.status;
  rej.status = MATERIAL_REJECTION_STATUS.REJECTED_BY_FINANCE;
  rej.financeRemarks = remarks;
  rej.remainingResolutionQty = 0;
  rej.resolutionType = "STORE_REJECTION_REVERSED";
  rej.closedAt = new Date().toISOString();
  rej.closedBy = actorName;
  rej.updatedAt = new Date().toISOString();

  const audit = createProcurementAuditEntry('MATERIAL_REJECTION', rej.id, 'REJECT_STORE_REJECTION', oldStatus, rej.status, actorName, 'Finance', remarks, {}, [], { idempotencyKey });
  updateStoreState({ ...getStoreState(), materialRejections: rejections, procurementAuditLogs: [audit, ...(getStoreState().procurementAuditLogs || [])] });
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

  const idx = rejections.findIndex((r: any) => r.id === rejectionId);
  if (idx === -1) throw new Error("Rejection not found");
  const rej = rejections[idx];

  if (settledQty > rej.remainingResolutionQty) {
    throw new Error(`Cannot commercially settle more than the unresolved rejected quantity (${rej.remainingResolutionQty})`);
  }

  const oldStatus = rej.status;
  rej.commerciallySettledQty = (rej.commerciallySettledQty || 0) + settledQty;
  rej.remainingResolutionQty = rej.rejectedQty - (rej.cumulativeReplacementAcceptedQty || 0) - rej.commerciallySettledQty;
  
  if (rej.remainingResolutionQty <= 0) {
    rej.status = MATERIAL_REJECTION_STATUS.COMMERCIAL_ADJUSTMENT_COMPLETED;
  }
  
  rej.financeRemarks = adjustmentDetails;
  rej.updatedAt = new Date().toISOString();

  const audit = createProcurementAuditEntry('MATERIAL_REJECTION', rej.id, 'RECORD_COMMERCIAL_ADJUSTMENT', oldStatus, rej.status, actorName, 'Finance', adjustmentDetails, {}, [], { idempotencyKey });
  updateStoreState({ ...state, materialRejections: rejections, procurementAuditLogs: [audit, ...(state.procurementAuditLogs || [])] });
}

export function processWriteOff(rejectionId: string, writeOffQty: number, approvalMetadata: any, actorName: string, idempotencyKey?: string) {
  const state = getStoreState();
  const rejections = safeClone(state.materialRejections || []);
  if (idempotencyKey && (state.procurementAuditLogs || []).some((l: any) => l.metadata?.idempotencyKey === idempotencyKey)) return;

  if (!approvalMetadata || !approvalMetadata.approvedBy) {
    throw new Error("Approval metadata is required for write-off");
  }

  const idx = rejections.findIndex((r: any) => r.id === rejectionId);
  if (idx === -1) throw new Error("Rejection not found");
  const rej = rejections[idx];

  assertTransition('MATERIAL_REJECTION', rej.status, [MATERIAL_REJECTION_STATUS.MATERIAL_REJECTION_SUBMITTED, MATERIAL_REJECTION_STATUS.FINANCE_VENDOR_DISCUSSION, MATERIAL_REJECTION_STATUS.PARTIALLY_RESOLVED, MATERIAL_REJECTION_STATUS.VENDOR_DISPUTE, MATERIAL_REJECTION_STATUS.CREDIT_NOTE_PENDING, MATERIAL_REJECTION_STATUS.NO_REPLACEMENT], 'Process Write Off');

  if (writeOffQty > rej.remainingResolutionQty) {
    throw new Error(`Write-off quantity cannot exceed unresolved rejected quantity (${rej.remainingResolutionQty})`);
  }

  const oldStatus = rej.status;
  rej.commerciallySettledQty = (rej.commerciallySettledQty || 0) + writeOffQty;
  rej.remainingResolutionQty = rej.rejectedQty - (rej.cumulativeReplacementAcceptedQty || 0) - rej.commerciallySettledQty;
  
  rej.status = MATERIAL_REJECTION_STATUS.WRITE_OFF_APPROVED;
  rej.financeRemarks = approvalMetadata.remarks || "Write-off approved";
  rej.updatedAt = new Date().toISOString();

  const audit = createProcurementAuditEntry('MATERIAL_REJECTION', rej.id, 'PROCESS_WRITE_OFF', oldStatus, rej.status, actorName, 'Finance', rej.financeRemarks, {}, [], { idempotencyKey, approvalMetadata });
  updateStoreState({ ...state, materialRejections: rejections, procurementAuditLogs: [audit, ...(state.procurementAuditLogs || [])] });
}

export function canCloseMaterialRejection(rejectionId: string) {
  const state = getStoreState();
  const rej = (state.materialRejections || []).find((r: any) => r.id === rejectionId);
  if (!rej) return { allowed: false, blockers: ['Rejection not found'] };

  const blockers: string[] = [];
  if (rej.status === MATERIAL_REJECTION_STATUS.CLOSED) {
    blockers.push('Rejection is already closed');
    return { allowed: false, blockers };
  }
  
  if (rej.remainingResolutionQty > 0) {
    blockers.push(`Unresolved quantity remains: ${rej.remainingResolutionQty}`);
  }
  if (!rej.originalStockDisposition && rej.status !== MATERIAL_REJECTION_STATUS.REJECTED_BY_FINANCE) {
    blockers.push('Original rejected stock disposition is pending');
  }

  return {
    allowed: blockers.length === 0,
    blockers
  };
}

export function closeMaterialRejection(rejectionId: string, actorName: string, idempotencyKey?: string) {
  const state = getStoreState();
  const rejections = safeClone(state.materialRejections || []);
  if (idempotencyKey && (state.procurementAuditLogs || []).some((l: any) => l.metadata?.idempotencyKey === idempotencyKey)) return;
  
  const idx = rejections.findIndex((r: any) => r.id === rejectionId);
  if (idx === -1) throw new Error("Rejection not found");
  
  const closureCheck = canCloseMaterialRejection(rejectionId);
  if (!closureCheck.allowed) {
    throw new Error("Cannot close rejection: " + closureCheck.blockers.join(", "));
  }
  
  const rej = rejections[idx];
  const oldStatus = rej.status;
  rej.status = MATERIAL_REJECTION_STATUS.CLOSED;
  rej.updatedAt = new Date().toISOString();

  const audit = createProcurementAuditEntry(
    'MATERIAL_REJECTION', rej.id, 'CLOSE', oldStatus, rej.status, actorName, 'Finance', '', {}, [], { idempotencyKey }
  );

  updateStoreState({ ...state, materialRejections: rejections, procurementAuditLogs: [audit, ...(state.procurementAuditLogs || [])] });
}

