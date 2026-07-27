const { useERPStore } = require('./store/erpStore.js');

/**
 * Himalaya ERP - End-to-End Procurement Flow Simulation & Seeding Script
 * Generates realistic Purchase Indents, POs, GRNs, and Payments with exact quantity 1605
 * across all departmental portals (Store -> Plant Head -> Finance -> Super Admin -> QC -> Store -> Finance)
 */

async function runEndToEndPoSimulation() {
  console.log("==========================================================================");
  console.log("   HIMALAYA ERP - STARTING 1605 QUANTITY PROCUREMENT SIMULATION");
  console.log("==========================================================================\n");

  const store = useERPStore.getState();

  // ────────────────────────────────────────────────────────────────────────
  // STAGE 1: Store Executive Raises Indent for 1605 Units of High-Grade Steel
  // ────────────────────────────────────────────────────────────────────────
  console.log("[STAGE 1: Store Department] Raising new Purchase Indent for 1605 Units...");
  const indentData = {
    id: "IND-2026-1605-A",
    material: "RM-1605 High-Tensile Steel Sheets",
    materialName: "RM-1605 High-Tensile Steel Sheets",
    quantity: 1605,
    unit: "Sheets",
    priority: "High",
    requiredDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    department: "Raw Material Store",
    requestedBy: "Store Manager (Rajesh Kumar)",
    notes: "Critical restock requirement for upcoming Q3 production batch #1605",
    items: [
      {
        material: "RM-1605 High-Tensile Steel Sheets",
        name: "RM-1605 High-Tensile Steel Sheets",
        quantity: 1605,
        unit: "Sheets",
        quantity_ordered: 1605,
        estimatedRate: 350
      }
    ]
  };

  store.createPurchaseIndent(indentData);
  let state = useERPStore.getState().state;
  let indent = (state.purchaseIndents || []).find(i => i.id === "IND-2026-1605-A");
  console.log(`  ✓ Indent Raised: [ID: ${indent.id}] | Material: ${indent.material} | Qty: ${indent.quantity} ${indent.unit}`);
  console.log(`  ✓ Current Status: ${indent.status} -> Visible in [Plant Head Portal -> Material Release Approvals]\n`);

  // ────────────────────────────────────────────────────────────────────────
  // STAGE 2: Plant Head Reviews & Approves Indent
  // ────────────────────────────────────────────────────────────────────────
  console.log("[STAGE 2: Plant Head Department] Reviewing and approving Indent IND-2026-1605-A...");
  store.approvePurchaseIndent("IND-2026-1605-A", "Quantity verified against Production Schedule #1605. Approved.");
  state = useERPStore.getState().state;
  indent = (state.purchaseIndents || []).find(i => i.id === "IND-2026-1605-A");
  console.log(`  ✓ Plant Head Approval: [ID: ${indent.id}] | Status: ${indent.status}`);
  console.log(`  ✓ Remarks: "${indent.plantHeadRemarks || 'Approved'}"`);
  console.log(`  ✓ Current Status: ${indent.status} -> Visible in [Finance Portal -> Approved Indents (Waiting for PO)]\n`);

  // ────────────────────────────────────────────────────────────────────────
  // STAGE 3: Finance Executive Converts Approved Indent into Draft PO
  // ────────────────────────────────────────────────────────────────────────
  console.log("[STAGE 3: Finance Department] Converting IND-2026-1605-A into Draft Purchase Order...");
  const poDraftData = {
    id: "PO-2026-1605-A",
    poNumber: "PO-2026-1605-A",
    vendorId: "V-001",
    vendorName: "Apex Raw Materials Ltd.",
    paymentTerms: "30 Days Net",
    expectedDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    gst: "18",
    freight: "2500",
    orderedQty: 1605,
    quantity: 1605,
    items: [
      {
        name: "RM-1605 High-Tensile Steel Sheets",
        quantity: 1605,
        unit: "Sheets",
        rate: 350,
        total: 1605 * 350
      }
    ],
    totalAmount: 1605 * 350,
    grandTotal: Math.round((1605 * 350 * 1.18) + 2500)
  };

  store.createPurchaseOrderFromIndent("IND-2026-1605-A", poDraftData);
  state = useERPStore.getState().state;
  let po = (state.purchaseOrders || []).find(p => p.id === "PO-2026-1605-A");
  console.log(`  ✓ Draft PO Generated: [ID: ${po.id}] | Vendor: ${po.vendorName} | Qty: ${po.orderedQty} | Amount: ₹${po.grandTotal.toLocaleString('en-IN')}`);
  console.log(`  ✓ Current Status: ${po.status} -> Visible in [Finance Portal -> Draft POs Tab]\n`);

  // ────────────────────────────────────────────────────────────────────────
  // STAGE 4: Finance Submits PO for Super Admin Governance Review
  // ────────────────────────────────────────────────────────────────────────
  console.log("[STAGE 4: Finance Department] Submitting PO-2026-1605-A to Super Admin for audit review...");
  store.submitPurchaseOrder("PO-2026-1605-A");
  state = useERPStore.getState().state;
  po = (state.purchaseOrders || []).find(p => p.id === "PO-2026-1605-A");
  console.log(`  ✓ PO Submitted: Status updated to ${po.status}`);
  console.log(`  ✓ Current Status: ${po.status} -> Visible in [Super Admin Portal -> Pending PO Approvals Card]\n`);

  // ────────────────────────────────────────────────────────────────────────
  // STAGE 5: Super Admin Approves High-Value Purchase Order
  // ────────────────────────────────────────────────────────────────────────
  console.log("[STAGE 5: Super Admin Department] Reviewing financial risk & signing off on PO-2026-1605-A...");
  store.approvePurchaseOrder("PO-2026-1605-A", "Budget allocated under Q3 CapEx. Verified with vendor rating 4.8.", "Vikramaditya (Super Admin)");
  state = useERPStore.getState().state;
  po = (state.purchaseOrders || []).find(p => p.id === "PO-2026-1605-A");
  console.log(`  ✓ Super Admin Sign-off: Status updated to ${po.status}`);
  console.log(`  ✓ Approved By: ${po.approvedBy} | Remarks: "${po.superAdminRemarks}"`);
  console.log(`  ✓ Current Status: ${po.status} -> Visible in [Finance Portal -> Ready to Issue Tab]\n`);

  // ────────────────────────────────────────────────────────────────────────
  // STAGE 6: Finance Issues Official PO to Vendor
  // ────────────────────────────────────────────────────────────────────────
  console.log("[STAGE 6: Finance Department] Issuing official Purchase Order number PO-2026-1605-A to vendor...");
  store.issuePurchaseOrder("PO-2026-1605-A", "PO-2026-1605-A");
  state = useERPStore.getState().state;
  po = (state.purchaseOrders || []).find(p => p.id === "PO-2026-1605-A");
  console.log(`  ✓ PO Issued: Status updated to ${po.status}`);
  console.log(`  ✓ Issued At: ${po.issuedAt}`);
  console.log(`  ✓ Current Status: ${po.status} -> Sent to Vendor & Visible in [Store Portal -> PO List -> Verify Button Enabled]\n`);

  // ────────────────────────────────────────────────────────────────────────
  // STAGE 7: Vendor Confirms Order & Delivery Schedule
  // ────────────────────────────────────────────────────────────────────────
  console.log("[STAGE 7: Vendor Portal / Gateway] Apex Raw Materials confirms order and dispatches shipment...");
  store.acceptPurchaseOrderByVendor("PO-2026-1605-A", {
    expectedDeliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    remarks: "Shipment dispatched via Truck MH-12-Q-1605. Expected delivery in 48 hours."
  });
  state = useERPStore.getState().state;
  po = (state.purchaseOrders || []).find(p => p.id === "PO-2026-1605-A");
  console.log(`  ✓ Vendor Acceptance: Status updated to ${po.status}`);
  console.log(`  ✓ Vendor Response: "${po.vendorResponse?.remarks}"\n`);

  // ────────────────────────────────────────────────────────────────────────
  // STAGE 8: Store Logs Physical Delivery via Goods Receipt Note (GRN)
  // ────────────────────────────────────────────────────────────────────────
  console.log("[STAGE 8: Store Department] Truck arrives at gate. Logging GRN for all 1605 Units...");
  const grnData = {
    id: "GRN-2026-1605-A",
    grnNumber: "GRN-2026-1605-A",
    purchaseOrderId: "PO-2026-1605-A",
    poNumber: "PO-2026-1605-A",
    vendorName: "Apex Raw Materials Ltd.",
    receivedDate: new Date().toISOString().split('T')[0],
    receivedQuantity: 1605,
    receivedQty: 1605,
    acceptedQty: 1605,
    rejectedQty: 0,
    storeRemarks: "Delivery received in full (1605 Sheets). No external damage observed during unloading.",
    items: [
      {
        material: "RM-1605 High-Tensile Steel Sheets",
        name: "RM-1605 High-Tensile Steel Sheets",
        orderedQty: 1605,
        receivedQty: 1605,
        acceptedQty: 1605,
        rejectedQty: 0
      }
    ]
  };

  store.createGoodsReceipt("PO-2026-1605-A", grnData);
  state = useERPStore.getState().state;
  po = (state.purchaseOrders || []).find(p => p.id === "PO-2026-1605-A");
  let grn = (state.goodsReceipts || []).find(g => g.id === "GRN-2026-1605-A");
  console.log(`  ✓ GRN Created: [ID: ${grn.id}] | Received Qty: ${grn.receivedQuantity} | Accepted: ${grn.acceptedQty}`);
  console.log(`  ✓ GRN Status: ${grn.status} | PO Status updated to: ${po.status}`);
  console.log(`  ✓ Current Status: ${grn.status} -> Visible in [QC / Store Portal -> GRN Verification Queue]\n`);

  // ────────────────────────────────────────────────────────────────────────
  // STAGE 9: Quality Control (QC) Inspector Audits Delivery
  // ────────────────────────────────────────────────────────────────────────
  console.log("[STAGE 9: Quality Control Department] Conducting metallurgical audit on lot GRN-2026-1605-A...");
  store.approveGoodsReceipt("GRN-2026-1605-A", "Tensile strength test passed (850 MPa). All 1605 sheets meet ASTM A1008 standards.");
  state = useERPStore.getState().state;
  grn = (state.goodsReceipts || []).find(g => g.id === "GRN-2026-1605-A");
  console.log(`  ✓ QC Inspection Complete: GRN Status updated to ${grn.status}`);
  console.log(`  ✓ QC Remarks: "${grn.qcRemarks || grn.remarks}"`);
  console.log(`  ✓ Current Status: ${grn.status} -> Visible in [Store Portal -> Ready for Stock Posting]\n`);

  // ────────────────────────────────────────────────────────────────────────
  // STAGE 10: Store Posts QC-Approved Stock into Live Inventory
  // ────────────────────────────────────────────────────────────────────────
  console.log("[STAGE 10: Store Department] Posting 1605 accepted units to Raw Material Inventory ledger...");
  store.postGoodsReceiptToStock("GRN-2026-1605-A");
  state = useERPStore.getState().state;
  grn = (state.goodsReceipts || []).find(g => g.id === "GRN-2026-1605-A");
  const rawItem = (state.rawInventory || []).find(i => (i.name || i.material)?.includes("RM-1605"));
  console.log(`  ✓ Stock Posted: GRN Status updated to ${grn.status}`);
  if (rawItem) {
    console.log(`  ✓ Inventory Ledger Updated: [Item: ${rawItem.name}] | New Available Stock: ${rawItem.stock} Units`);
  }
  console.log(`  ✓ Current Status: ${grn.status} -> Visible in [Finance Portal -> GRN Verification & Vendor Payments]\n`);

  // ────────────────────────────────────────────────────────────────────────
  // STAGE 11: Finance Cashier Initiates & Completes Vendor Payment
  // ────────────────────────────────────────────────────────────────────────
  console.log("[STAGE 11: Finance Department] Verifying invoice and processing vendor disbursement for PO-2026-1605-A...");
  const paymentData = {
    id: "PAY-2026-1605-A",
    purchaseOrderId: "PO-2026-1605-A",
    vendorName: "Apex Raw Materials Ltd.",
    amount: po.grandTotal || 564250,
    paymentMethod: "NEFT / RTGS Transfer",
    bankAccount: "HDFC Bank A/c ****1605"
  };

  store.createVendorPayment("PO-2026-1605-A", paymentData);
  store.completeVendorPayment("PAY-2026-1605-A", {
    transactionId: "NEFT-HDFC-2026-1605999",
    paidDate: new Date().toISOString().split('T')[0],
    remarks: "Full settlement disbursed for PO-2026-1605-A / GRN-2026-1605-A (1605 Sheets)"
  });

  state = useERPStore.getState().state;
  po = (state.purchaseOrders || []).find(p => p.id === "PO-2026-1605-A");
  const payment = (state.vendorPayments || []).find(p => p.id === "PAY-2026-1605-A");
  console.log(`  ✓ Vendor Payment Processed: [ID: ${payment.id}] | UTR / Trx: ${payment.transactionId} | Amount: ₹${payment.amount?.toLocaleString('en-IN')}`);
  console.log(`  ✓ Payment Status: ${payment.status}`);
  console.log(`  ✓ Purchase Order Lifecycle Finalized: PO Status updated to -> [ ${po.status} ]\n`);

  console.log("==========================================================================");
  console.log("   SIMULATION COMPLETE — ALL 11 STAGES EXECUTED AND PERSISTED SUCCESSFULLY!");
  console.log("==========================================================================");
}

runEndToEndPoSimulation().catch(console.error);
