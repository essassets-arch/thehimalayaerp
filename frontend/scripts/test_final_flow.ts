import { useERPStore } from '../store/erpStore';
import { 
  createMaterialIndent, 
  approveMaterialIndent, 
  createPurchaseOrder, 
  submitPurchaseOrder, 
  approvePurchaseOrder, 
  issuePurchaseOrder, 
  createGRN, 
  approveGRN, 
  submitMaterialRejection,
  approveVendorReplacement,
  createReplacementGRN,
  disposeRejectedStock,
  closeMaterialRejection,
  rejectStoreRejection,
  raiseVendorDispute,
  processNoReplacement,
  recordCommercialAdjustment,
  processWriteOff,
  canClosePurchaseOrder
} from '../store/procurementActions';
import { selectMaterialIndents, selectPurchaseOrders, selectGoodsReceiptNotes, getPurchaseOrderDeliveredTotals, selectMaterialRejections } from '../store/procurementSelectors';

// Mock localStorage for Node
(global as any).window = {
  localStorage: {
    data: {} as Record<string, string>,
    getItem(key: string) { return this.data[key] || null; },
    setItem(key: string, val: string) { this.data[key] = val; }
  }
};
(global as any).localStorage = (global as any).window.localStorage;

const assert = (condition: boolean, msg: string) => {
  if (!condition) {
    console.error("❌ FAILED: " + msg);
    process.exit(1);
  }
  console.log("✅ PASSED: " + msg);
};

const getInventoryItem = (materialId: string) => {
  const state: any = useERPStore.getState();
  const rawInventory = state.state.rawInventory || [];
  return rawInventory.find((i: any) => i.id === materialId || i.materialCode === materialId);
};

async function runTests() {
  console.log("=== STARTING FINAL END-TO-END PROCUREMENT FLOW TESTS ===\n");

  // Setup: Create Indent -> PO -> Issued
  createMaterialIndent({
    department: 'Production',
    requiredDate: '2026-08-01',
    items: [
      { materialId: 'MAT-F1', materialName: 'Steel', quantity: 1000 }
    ]
  }, 'Store Admin');

  let indents = selectMaterialIndents();
  let indent = indents[0];
  approveMaterialIndent(indent.id, indent.items, "Approved", "Plant Head");

  createPurchaseOrder(indent.id, {
    vendorName: 'MetalCorp',
    items: [
      { materialId: 'MAT-F1', materialName: 'Steel', orderedQty: 1000, unitRate: 50 }
    ],
    freightAmount: 0
  }, "Finance");

  let pos = selectPurchaseOrders();
  let po = pos[0];

  submitPurchaseOrder(po.id, "Finance");
  pos = selectPurchaseOrders();
  if (pos[0].status === 'PENDING_SUPER_ADMIN_APPROVAL') {
    approvePurchaseOrder(po.id, "Looks good", "Super Admin");
  }
  issuePurchaseOrder(po.id, "Finance");

  // Create initial GRN: 1000 delivered, 700 accepted, 300 rejected
  createGRN(po.id, {
    items: [
      { materialId: 'MAT-F1', deliveredQty: 1000, acceptedQty: 700, rejectedQty: 300 }
    ]
  }, "Store");
  
  let grns = selectGoodsReceiptNotes();
  approveGRN(grns[0].id, "Finance Audit");

  // Create 3 separate Rejection Holds (100 units each) to test different alternative flows
  submitMaterialRejection({ poId: po.id, materialId: 'MAT-F1', rejectedQty: 100, reason: 'Flow A' }, "Store");
  submitMaterialRejection({ poId: po.id, materialId: 'MAT-F1', rejectedQty: 100, reason: 'Flow B' }, "Store");
  submitMaterialRejection({ poId: po.id, materialId: 'MAT-F1', rejectedQty: 100, reason: 'Flow C' }, "Store");

  let rejections = selectMaterialRejections();
  let rejA = rejections.find((r: any) => r.reason === 'Flow A');
  let rejB = rejections.find((r: any) => r.reason === 'Flow B');
  let rejC = rejections.find((r: any) => r.reason === 'Flow C');

  // Verify initial REJECTION_HOLD stock setup
  const inventory = getInventoryItem('MAT-F1');
  console.log("INVENTORY:", inventory);
  assert(inventory.quantity === 400, "Inventory quantity is 400 (700 Accepted - 300 Reserved)");
  assert(inventory.reservedQty === 300, "Inventory reservedQty is 300 (Rejection Hold)");

  console.log("\n--- Testing: Finance Rejection of Store Rejection ---");
  // Test Finance Rejection (restores stock once)
  rejectStoreRejection(rejA.id, "False alarm, quality is fine", "Finance", "IDEM-A1");
  let invA1 = getInventoryItem('MAT-F1');
  assert(invA1.quantity === 500, "Inventory quantity increased by 100 to 500");
  assert(invA1.reservedQty === 200, "Reserved quantity decreased by 100 to 200");
  
  // Test Idempotency for Finance Rejection
  rejectStoreRejection(rejA.id, "False alarm, quality is fine", "Finance", "IDEM-A1");
  let invA2 = getInventoryItem('MAT-F1');
  assert(invA2.quantity === 500, "Idempotency check: quantity remains 500 on duplicate action");
  
  rejections = selectMaterialRejections();
  rejA = rejections.find((r: any) => r.reason === 'Flow A');
  assert(rejA.status === 'REJECTED_BY_FINANCE', "Rejection status is REJECTED_BY_FINANCE");

  console.log("\n--- Testing: Vendor Dispute ---");
  // Test Vendor Dispute (no inventory change)
  raiseVendorDispute(rejB.id, "Vendor disagrees with quality report", "Finance", "IDEM-B1");
  let invB1 = getInventoryItem('MAT-F1');
  assert(invB1.quantity === 500, "Vendor dispute does not change available stock");
  assert(invB1.reservedQty === 200, "Vendor dispute does not change reserved stock");
  
  rejections = selectMaterialRejections();
  rejB = rejections.find((r: any) => r.reason === 'Flow B');
  assert(rejB.status === 'VENDOR_DISPUTE', "Rejection status is VENDOR_DISPUTE");
  assert(rejB.remainingResolutionQty === 100, "Remaining resolution quantity is preserved (100)");

  console.log("\n--- Testing: No-Replacement & Commercial Settlement ---");
  // Resolve Vendor Dispute via No-Replacement (Credit Note)
  processNoReplacement(rejB.id, "CREDIT_NOTE", "Vendor agreed to credit note", "Finance", "IDEM-B2");
  rejections = selectMaterialRejections();
  rejB = rejections.find((r: any) => r.reason === 'Flow B');
  assert(rejB.status === 'CREDIT_NOTE_PENDING', "Status moved to CREDIT_NOTE_PENDING");

  // Apply Commercial Adjustment (Credit-note settlement)
  recordCommercialAdjustment(rejB.id, 60, "Received CN-999 for 60 units", "Finance", "IDEM-B3");
  rejections = selectMaterialRejections();
  rejB = rejections.find((r: any) => r.reason === 'Flow B');
  assert(rejB.commerciallySettledQty === 60, "Commercially settled qty updated to 60");
  assert(rejB.remainingResolutionQty === 40, "Remaining resolution qty is 40");

  // Verify Credit-note settlement does not increase PO received qty
  pos = selectPurchaseOrders();
  let currentPo = pos.find((p: any) => p.id === po.id);
  assert(currentPo.items[0].cumulativeAcceptedQty === 700, "Credit-note settlement does not increase PO received quantity");

  // Verify No-replacement settlement does not create replacement stock
  let invB2 = getInventoryItem('MAT-F1');
  assert(invB2.quantity === 500, "No-replacement settlement does not create replacement stock");

  console.log("\n--- Testing: Write-off Boundaries ---");
  // Write-off boundaries (cannot exceed unresolved qty)
  let writeOffExceeded = false;
  try {
    processWriteOff(rejB.id, 50, { approvedBy: 'Super Admin', remarks: 'Write off rest' }, "Finance", "IDEM-B4");
  } catch(e) {
    writeOffExceeded = true;
  }
  assert(writeOffExceeded, "Write-off cannot exceed unresolved quantity (tried 50, remaining 40)");

  // Valid write off
  processWriteOff(rejB.id, 40, { approvedBy: 'Super Admin', remarks: 'Write off rest' }, "Finance", "IDEM-B5");
  rejections = selectMaterialRejections();
  rejB = rejections.find((r: any) => r.reason === 'Flow B');
  assert(rejB.remainingResolutionQty === 0, "Remaining resolution is 0 after write-off");
  assert(rejB.status === 'WRITE_OFF_APPROVED', "Status is WRITE_OFF_APPROVED");
  assert(rejB.commerciallySettledQty === 100, "Total commercially settled qty is 100 (60 CN + 40 WriteOff)");

  console.log("\n--- Testing: Replacement + Commercial Settlement Limits ---");
  // Test Replacement plus commercial settlement cannot exceed original rejected quantity.
  approveVendorReplacement({ rejectionId: rejC.id, approvedReplacementQty: 80, expectedDeliveryDate: '2026-08-10', actor: "Finance" });
  createReplacementGRN(rejC.id, {
    items: [{ materialId: 'MAT-F1', deliveredQty: 80, acceptedQty: 80, rejectedQty: 0 }]
  }, "Store");
  
  grns = selectGoodsReceiptNotes();
  const repGrn = grns.find((g: any) => g.grnType === 'REPLACEMENT');
  approveGRN(repGrn.id, "Finance Audit");

  rejections = selectMaterialRejections();
  rejC = rejections.find((r: any) => r.reason === 'Flow C');
  assert(rejC.cumulativeReplacementAcceptedQty === 80, "Replacement accepted qty is 80");
  assert(rejC.remainingResolutionQty === 20, "Remaining resolution qty is 20");

  let overSettle = false;
  try {
    recordCommercialAdjustment(rejC.id, 30, "Settle remaining", "Finance", "IDEM-C1");
  } catch(e) {
    overSettle = true;
  }
  assert(overSettle, "Replacement plus commercial settlement cannot exceed original rejected quantity (80 + 30 > 100)");

  // Valid final settlement
  recordCommercialAdjustment(rejC.id, 20, "Settle remaining", "Finance", "IDEM-C2");
  rejections = selectMaterialRejections();
  rejC = rejections.find((r: any) => r.reason === 'Flow C');
  assert(rejC.remainingResolutionQty === 0, "Remaining resolution is 0");
  assert(rejC.status === 'COMMERCIAL_ADJUSTMENT_COMPLETED', "Status is COMMERCIAL_ADJUSTMENT_COMPLETED");

  console.log("\n--- Testing: Closed Record Immutability ---");
  disposeRejectedStock(rejC.id, 100, "Scrapped", "Store");
  closeMaterialRejection(rejC.id, "Finance", "IDEM-C3");
  
  rejections = selectMaterialRejections();
  rejC = rejections.find((r: any) => r.reason === 'Flow C');
  assert(rejC.status === 'CLOSED', "Rejection successfully closed");

  let mutateClosed = false;
  try {
    raiseVendorDispute(rejC.id, "Dispute after closed", "Finance", "IDEM-C4");
  } catch(e) {
    mutateClosed = true;
  }
  assert(mutateClosed, "Closed rejection records cannot be modified via state transitions");

  console.log("\n--- Testing: Audit History ---");
  const state: any = useERPStore.getState();
  const logs = state.state.procurementAuditLogs;
  const storeRejLogs = logs.filter((l: any) => l.action === 'REJECT_STORE_REJECTION');
  assert(storeRejLogs.length === 1, "Idempotency correctly prevents duplicate audit log entries");
  
  const writeOffLogs = logs.filter((l: any) => l.action === 'PROCESS_WRITE_OFF');
  assert(writeOffLogs[0].metadata.approvalMetadata.approvedBy === 'Super Admin', "Write-off audit log correctly persists approval metadata");

  console.log("\n✅ ALL FINAL PROCUREMENT FLOW TESTS PASSED SUCCESSFULLY! 🎉");
}

runTests().catch(console.error);
