// @ts-nocheck
import { strict as assert } from 'assert';
import { INITIAL_ERP_STATE } from '../engine/database';
import { workflowService } from '../engine/services/workflow.service';
import { OrderStatus } from '../types/Order';

async function runTests() {
    console.log("==========================================");
    console.log("?? Running Comprehensive Workflow Tests...");
    console.log("==========================================\n");

    try {
        // --- TEST 1: End-to-End Success Flow ---
        console.log("[Test 1] Executing End-to-End Success Flow...");
        
        const leadId = "TEST-E2E-001";
        const lead = {
            id: leadId,
            workflowStatus: OrderStatus.LEAD,
            customer: { name: "Test Corp E2E" },
            products: [{ productName: "Widget", quantity: 100 }],
            history: []
        };
        
        INITIAL_ERP_STATE.orders = INITIAL_ERP_STATE.orders || [];
        INITIAL_ERP_STATE.orders.push(lead);
        
        // Sales
        workflowService.transitionOrder(leadId, OrderStatus.SAMPLE);
        workflowService.transitionOrder(leadId, OrderStatus.QUOTATION);
        workflowService.transitionOrder(leadId, OrderStatus.SALES_ORDER);
        workflowService.transitionOrder(leadId, OrderStatus.PLANT_PENDING);

        // Plant
        workflowService.approvePlanning(leadId, { targetDate: "2026-12-31" });
        
        // Production
        workflowService.assignMachine(leadId, { machineId: "MCH-001" });
        workflowService.startProduction(leadId);
        workflowService.finishProduction(leadId, { outputQuantity: 100 });

        // QC
        workflowService.transitionOrder(leadId, OrderStatus.QC_PENDING);
        workflowService.approveQC(leadId, { dimensionResult: 'Pass' });

        // Dispatch
        workflowService.createDispatch(leadId, { vehicleNo: "TRUCK-99" });
        workflowService.markInTransit(leadId);
        workflowService.markDelivered(leadId, { lrNumber: "LR-12345" });

        // Finance
        workflowService.transitionOrder(leadId, OrderStatus.INVOICE_PENDING);
        workflowService.createInvoice(leadId, { invoiceNumber: "INV-999" });
        workflowService.transitionOrder(leadId, OrderStatus.PAYMENT_PENDING);
        workflowService.verifyPayment(leadId, { amount: 1500 });
        workflowService.closeOrder(leadId);

        const finalOrder = INITIAL_ERP_STATE.orders.find(o => o.id === leadId);
        assert.equal(finalOrder.workflowStatus, OrderStatus.CLOSED, "Final status should be CLOSED");
        assert.equal(finalOrder.history.length, 18, "History should have exactly 18 events");
        assert.equal(finalOrder.invoice.invoiceNumber, "INV-999", "Invoice data should be saved");
        console.log("? [Test 1] Passed!\n");

        // --- TEST 2: Invalid Transition Rejection ---
        console.log("[Test 2] Testing Invalid Transitions...");
        const rejectId = "TEST-REJECT-001";
        INITIAL_ERP_STATE.orders.push({
            id: rejectId,
            workflowStatus: OrderStatus.IN_PRODUCTION,
            history: []
        });

        let threwError = false;
        try {
            // Attempt to jump from IN_PRODUCTION directly to INVOICED
            workflowService.transitionOrder(rejectId, OrderStatus.INVOICED);
        } catch (e) {
            threwError = true;
            assert.match(e.message, /Invalid transition/, "Error message should mention invalid transition");
        }
        assert.equal(threwError, true, "Service must throw error on invalid transition");
        console.log("? [Test 2] Passed!\n");

        // --- TEST 3: QC Failure Rework Loop ---
        console.log("[Test 3] Testing QC Failure and Rework Loop...");
        const reworkId = "TEST-REWORK-001";
        INITIAL_ERP_STATE.orders.push({
            id: reworkId,
            workflowStatus: OrderStatus.QC_PENDING,
            history: []
        });

        // Fail QC should set status to QC_FAILED
        workflowService.failQC(reworkId, { reason: "Dimensions off" });
        const reworkOrder = INITIAL_ERP_STATE.orders.find(o => o.id === reworkId);
        
        assert.equal(reworkOrder.workflowStatus, OrderStatus.QC_FAILED, "QC Fail should set status to QC_FAILED");
        assert.equal(reworkOrder.qc.overallResult, "Fail", "QC data should record Fail");
        assert.equal(reworkOrder.history[0].event, "Quality Failed (Rework Required)", "History should record failure event");
        
        // Plant Head or Production Lead triggers rework
        workflowService.transitionOrder(reworkId, OrderStatus.WORK_ORDER_CREATED);
        const finalRework = INITIAL_ERP_STATE.orders.find(o => o.id === reworkId);
        assert.equal(finalRework.workflowStatus, OrderStatus.WORK_ORDER_CREATED, "Rework Order should set status to WORK_ORDER_CREATED");
        console.log("? [Test 3] Passed!\n");

        console.log("?? ALL TESTS PASSED SUCCESSFULLY!");

    } catch (err) {
        console.error("\n? TEST FAILED:", err.message);
        process.exit(1);
    }
}

runTests();
