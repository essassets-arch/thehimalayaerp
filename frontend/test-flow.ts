// @ts-nocheck
import { INITIAL_ERP_STATE } from './engine/database';
import { workflowService } from './engine/services/workflow.service';
import { OrderStatus } from './types/Order';

console.log("Starting End-to-End Workflow Test...");

const lead = {
    id: "TEST-ORDER-001",
    workflowStatus: OrderStatus.LEAD,
    customer: { name: "Test Corp" },
    products: [{ productName: "Widget", quantity: 100 }],
    history: []
};

INITIAL_ERP_STATE.orders = INITIAL_ERP_STATE.orders || [];
INITIAL_ERP_STATE.orders.push(lead);
console.log("Lead created:", lead.id);

try {
    console.log("-> Converting to Sample");
    workflowService.transitionOrder(lead.id, OrderStatus.SAMPLE);
    
    console.log("-> Converting to Quotation");
    workflowService.transitionOrder(lead.id, OrderStatus.QUOTATION);
    
    console.log("-> Converting to Sales Order");
    workflowService.transitionOrder(lead.id, OrderStatus.SALES_ORDER);
    
    console.log("-> Confirming Order (Sent to Plant)");
    workflowService.transitionOrder(lead.id, OrderStatus.PLANT_PENDING);

    console.log("-> Approving Planning (Work Order Created)");
    workflowService.approvePlanning(lead.id, { targetDate: "2026-12-31" });

    console.log("-> Assigning Machine");
    workflowService.assignMachine(lead.id, { machineId: "MCH-001" });
    
    console.log("-> Starting Production");
    workflowService.startProduction(lead.id);

    console.log("-> Completing Production");
    workflowService.finishProduction(lead.id, { outputQuantity: 100 });

    console.log("-> Sending to QC");
    workflowService.transitionOrder(lead.id, OrderStatus.QC_PENDING);

    console.log("-> Approving QC");
    workflowService.approveQC(lead.id, { dimensionResult: 'Pass' });

    console.log("-> Queueing Dispatch");
    workflowService.createDispatch(lead.id, { vehicleNo: "TRUCK-99" });

    console.log("-> Marking In-Transit");
    workflowService.markInTransit(lead.id);

    console.log("-> Confirming Delivery (Auto-Generates Invoice & Sets Status to INVOICED)");
    workflowService.markDelivered(lead.id, { lrNumber: "LR-12345" });

    console.log("-> Recording Payment (Sales)");
    workflowService.transitionOrder(lead.id, OrderStatus.PAYMENT_PENDING);

    console.log("-> Verifying Payment (Finance Executive - Auto-Closes Order)");
    workflowService.verifyPayment(lead.id, { amount: 1500 });

    const finalOrder = INITIAL_ERP_STATE.orders.find((o) => o.id === lead.id);
    console.log("\n====== FLOW COMPLETE! ======");
    console.log("Final Status:", finalOrder.workflowStatus);
    console.log("Timeline Events Logged:", finalOrder.history.length);
    finalOrder.history.forEach((h, idx) => {
        console.log(`  ${idx+1}. ${h.event} (${h.status}) - Action: ${h.action}`);
    });
    console.log("============================");

} catch (error) {
    console.error("? FLOW FAILED:", error.message);
}
