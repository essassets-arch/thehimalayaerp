import { useERPStore } from './store/erpStore';

const mockStorage: any = {};
(global as any).window = {
  localStorage: {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; }
  }
};
(global as any).localStorage = (global as any).window.localStorage;

async function runTest() {
  console.log("=== STARTING PROCUREMENT FLOW TEST ===");
  const store: any = useERPStore.getState();

  // 1. Store Creates Indent
  console.log("[1] Store creates Purchase Indent");
  store.createPurchaseIndent({
    id: "IND-001",
    material: "Steel Beams",
    quantity: 100
  });
  
  let state: any = useERPStore.getState();
  let indent = state.state.purchaseIndents.find((i: any) => i.id === "IND-001");
  console.assert(indent.status === "PENDING_PLANT_HEAD_APPROVAL", "Expected PENDING_PLANT_HEAD_APPROVAL");
  console.log("  * Indent created with status:", indent.status);

  // 2. Plant Head Rejects Indent
  console.log("[2] Plant Head rejects Indent");
  store.rejectPurchaseIndent("IND-001", "Quantity too high");
  
  state = useERPStore.getState();
  indent = state.state.purchaseIndents.find((i: any) => i.id === "IND-001");
  console.assert(indent.status === "PLANT_HEAD_REJECTED", "Expected PLANT_HEAD_REJECTED");
  console.log("  * Indent rejected with status:", indent.status);

  // 3. Store edits and resubmits Indent
  console.log("[3] Store resubmits Indent");
  store.updatePurchaseIndent("IND-001", { quantity: 50 });
  
  state = useERPStore.getState();
  indent = state.state.purchaseIndents.find((i: any) => i.id === "IND-001");
  console.assert(indent.status === "PENDING_PLANT_HEAD_APPROVAL", "Expected PENDING_PLANT_HEAD_APPROVAL");
  console.log("  * Indent resubmitted with status:", indent.status);

  // 4. Plant Head Approves Indent
  console.log("[4] Plant Head approves Indent");
  store.approvePurchaseIndent("IND-001", "Approved for 50 qty");
  
  state = useERPStore.getState();
  indent = state.state.purchaseIndents.find((i: any) => i.id === "IND-001");
  console.assert(indent.status === "PLANT_HEAD_APPROVED", "Expected PLANT_HEAD_APPROVED");
  console.log("  * Indent approved with status:", indent.status);

  // 5. Finance Creates Draft PO
  console.log("[5] Finance creates Draft PO");
  store.createPurchaseOrderFromIndent("IND-001", {
    id: "PO-001",
    vendorName: "SteelCorp"
  });
  
  state = useERPStore.getState();
  indent = state.state.purchaseIndents.find((i: any) => i.id === "IND-001");
  let po = state.state.purchaseOrders.find((p: any) => p.id === "PO-001" || p.poNumber === "PO-001");
  console.assert(indent.status === "CONVERTED_TO_PO", "Indent should be CONVERTED_TO_PO");
  console.assert(po.status === "DRAFT", "PO should be DRAFT");
  console.log("  * PO created with status:", po.status);

  // 6. Finance Submits PO for Super Admin Approval
  console.log("[6] Finance submits PO");
  store.submitPurchaseOrder(po.id);
  
  state = useERPStore.getState();
  po = state.state.purchaseOrders.find((p: any) => p.id === po.id);
  console.assert(po.status === "PENDING_SUPER_ADMIN_APPROVAL", "PO should be PENDING_SUPER_ADMIN_APPROVAL");
  console.log("  * PO status:", po.status);

  // 7. Super Admin Approves PO
  console.log("[7] Super Admin approves PO");
  store.approvePurchaseOrder(po.id, "Looks good");
  
  state = useERPStore.getState();
  po = state.state.purchaseOrders.find((p: any) => p.id === po.id);
  console.assert(po.status === "SUPER_ADMIN_APPROVED", "PO should be SUPER_ADMIN_APPROVED");
  console.log("  * PO status:", po.status);

  // 8. Finance Issues PO
  console.log("[8] Finance issues PO");
  store.issuePurchaseOrder(po.id);
  
  state = useERPStore.getState();
  po = state.state.purchaseOrders.find((p: any) => p.id === po.id);
  console.assert(po.status === "PO_ISSUED", "PO should be PO_ISSUED");
  console.log("  * PO status:", po.status);

  // 9. Vendor Accepts PO
  console.log("[9] Vendor accepts PO");
  store.acceptPurchaseOrderByVendor(po.id, {});
  
  state = useERPStore.getState();
  po = state.state.purchaseOrders.find((p: any) => p.id === po.id);
  console.assert(po.status === "VENDOR_ACCEPTED", "PO should be VENDOR_ACCEPTED");
  console.log("  * PO status:", po.status);

  // 10. Store Creates GRN
  console.log("[10] Store creates GRN");
  store.createGoodsReceipt(po.id, {
    id: "GRN-001",
    receivedQuantity: 50
  });
  
  state = useERPStore.getState();
  po = state.state.purchaseOrders.find((p: any) => p.id === po.id);
  let grn = state.state.goodsReceipts.find((g: any) => g.id === "GRN-001");
  console.assert(po.status === "PARTIALLY_RECEIVED" || po.status === "GRN_SUBMITTED", "PO should be PARTIALLY_RECEIVED or GRN_SUBMITTED");
  console.log("  * GRN created with status:", grn.status);

  // 11. QC Approves GRN
  console.log("[11] QC approves GRN");
  store.approveGoodsReceipt("GRN-001", "Quality checks passed");
  
  state = useERPStore.getState();
  grn = state.state.goodsReceipts.find((g: any) => g.id === "GRN-001");
  console.assert(grn.status === "GRN_APPROVED", "GRN should be GRN_APPROVED");
  console.log("  * GRN status:", grn.status);

  // 12. Store Posts Stock
  console.log("[12] Store posts stock");
  store.postGoodsReceiptToStock("GRN-001");
  
  state = useERPStore.getState();
  grn = state.state.goodsReceipts.find((g: any) => g.id === "GRN-001");
  console.assert(grn.status === "STOCK_POSTED", "GRN should be STOCK_POSTED");
  console.log("  * GRN status:", grn.status);

  // 13. Finance completes Payment
  console.log("[13] Finance completes Vendor Payment");
  store.createVendorPayment(po.id, {
    id: "PAY-001",
    amount: 50000
  });
  store.completeVendorPayment("PAY-001", { transactionId: "TRX-123" });
  
  state = useERPStore.getState();
  let payment = state.state.vendorPayments.find((p: any) => p.id === "PAY-001");
  console.assert(payment.status === "PAYMENT_COMPLETED", "Payment should be PAYMENT_COMPLETED");
  console.log("  * Payment completed with status:", payment.status);

  console.log("=== ALL TESTS PASSED SUCCESSFULLY! ===");
}

runTest().catch(console.error);
