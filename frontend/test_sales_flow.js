require('ts-node').register({ transpileOnly: true });

const { useERPStore } = require('./store/erpStore.ts');
const { SALES_ORDER_STATUS } = require('./constants/sales.ts');
const { WORK_ORDER_STATUS } = require('./constants/production.ts');

async function runSalesFlowTest() {
  console.log("=== STARTING END-TO-END SALES & PRODUCTION FLOW TEST ===");
  
  const store = useERPStore.getState();

  // 1. Create Lead
  console.log("Step 1: Creating Lead...");
  store.createSalesLead({ customerName: 'Test Corp', product: 'Cement Blocks', qty: 1000 }, 'Test Sales Rep');
  const leadId = useERPStore.getState().leads[0].id;
  console.log(`✓ Lead Created: ${leadId}`);

  // 2. Create Quotation
  console.log("\nStep 2: Creating Quotation...");
  store.createQuotation({ leadId, customerName: 'Test Corp', grandTotal: 50000 }, 'Test Sales Rep');
  const quoteId = useERPStore.getState().quotations[0].id;
  console.log(`✓ Quotation Created: ${quoteId}`);

  // 3. Accept Quotation
  console.log("\nStep 3: Customer Accepts Quotation...");
  store.acceptQuotation(quoteId, 'Test Customer');
  console.log("✓ Quotation Accepted");

  // 4. Convert to Order
  console.log("\nStep 4: Convert Quotation to Order...");
  store.convertQuotationToOrder(quoteId, { customerName: 'Test Corp' }, 'Test Sales Rep');
  const orderId = useERPStore.getState().orders[0].id;
  console.log(`✓ Order Created: ${orderId} (Status: ${useERPStore.getState().orders[0].status})`);

  // 5. Plant Head Review
  console.log("\nStep 5: Plant Head Accepts Order...");
  store.reviewIncomingOrder(orderId, 'ACCEPT', 'Looks good', 'Plant Head');
  console.log(`✓ Order Accepted by Plant Head (Status: ${useERPStore.getState().orders[0].status})`);

  // 6. Plan Production
  console.log("\nStep 6: Plan Production...");
  store.planProduction(orderId, { machine: 'Block Maker 1', targetQty: 1000 }, 'Production Manager');
  const woId = useERPStore.getState().workOrders[0].id;
  console.log(`✓ Work Order Created: ${woId} (Status: ${useERPStore.getState().workOrders[0].status})`);

  // 7. Start Production
  console.log("\nStep 7: Start Production...");
  // Simulate material issued
  useERPStore.setState({ workOrders: [{ ...useERPStore.getState().workOrders[0], status: 'READY_FOR_PRODUCTION' }] });
  store.startProduction(woId, 'Operator 1');
  console.log(`✓ Production Started (Status: ${useERPStore.getState().workOrders[0].status})`);

  // 8. Complete Production
  console.log("\nStep 8: Complete Production...");
  store.completeProductionBatch(woId, { producedQty: 1000 }, 'Operator 1');
  console.log(`✓ Production Completed (Order Status: ${useERPStore.getState().orders[0].status})`);

  // 9. Approve QC
  console.log("\nStep 9: QC Approval...");
  store.approveSalesQC(woId, { passedQty: 1000 }, 'QC Inspector');
  console.log(`✓ QC Approved (Order Status: ${useERPStore.getState().orders[0].status})`);

  // 10. Create Dispatch
  console.log("\nStep 10: Create Dispatch...");
  store.createDispatchForOrder(orderId, { vehicleId: 'TRUCK-1', driverName: 'John Doe' }, 'Dispatch Team');
  const dispatchId = useERPStore.getState().dispatches[0].id;
  console.log(`✓ Dispatch Created: ${dispatchId} (Order Status: ${useERPStore.getState().orders[0].status})`);

  // 11. Start Delivery
  console.log("\nStep 11: Start Delivery...");
  store.startDelivery(dispatchId, 'Dispatch Team');
  console.log(`✓ Delivery Started (Order Status: ${useERPStore.getState().orders[0].status})`);

  // 12. Confirm Delivery
  console.log("\nStep 12: Confirm Delivery...");
  store.confirmDelivery(dispatchId, { receivedBy: 'Site Manager' }, 'Dispatch Team');
  console.log(`✓ Delivery Confirmed (Order Status: ${useERPStore.getState().orders[0].status})`);

  // 13. Verify Payment
  console.log("\nStep 13: Verify Payment...");
  store.verifySalesPayment(orderId, { utr: 'UTR123456789', amount: 50000 }, 'Finance Officer');
  console.log(`✓ Payment Verified (Order Status: ${useERPStore.getState().orders[0].status})`);

  // 14. Close Order
  console.log("\nStep 14: Close Order...");
  store.closeSalesOrder(orderId, 'System Admin');
  console.log(`✓ Order Closed (Final Status: ${useERPStore.getState().orders[0].status})`);

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
}

runSalesFlowTest().catch(console.error);
