import { strict as assert } from 'assert';
import { createStore } from 'zustand/vanilla';
import { INITIAL_ERP_STATE } from '../engine/database.js';
import { OrderStatus } from '../types/Order.ts';

// Create a Vanilla Zustand store WITHOUT persistence (in-memory only)
const useTestStore = createStore((set, get) => ({
    ...INITIAL_ERP_STATE,
    addLead: (lead: any) => set((state: any) => ({ leads: [...state.leads, lead] })),
    updateLead: (id: string, updates: any) => set((state: any) => ({
        leads: state.leads.map((l: any) => l.id === id ? { ...l, ...updates } : l)
    })),
    addSample: (sample: any) => set((state: any) => ({ samples: [...state.samples, sample] })),
    addQuotation: (quotation: any) => set((state: any) => ({ quotations: [...state.quotations, quotation] })),
    updateQuotation: (id: string, updates: any) => set((state: any) => ({
        quotations: state.quotations.map((q: any) => q.id === id ? { ...q, ...updates } : q)
    })),
    addOrder: (order: any) => set((state: any) => ({ orders: [...state.orders, order] })),
    updateOrder: (id: string, updates: any) => set((state: any) => ({
        orders: state.orders.map((o: any) => o.id === id ? { ...o, ...updates } : o)
    })),
    addPayment: (payment: any) => set((state: any) => ({ payments: [...state.payments, payment] })),
}));

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

async function runSalesTests() {
    console.log("==========================================");
    console.log("🚀 Running Sales Flow Tests with Zustand (In-Memory)...");
    console.log("==========================================\n");

    try {
        console.log("[Test 1] Executing Lead -> Sample -> Quotation -> Order -> Payment Flow...");

        const store = useTestStore.getState();

        // 1. Create Lead
        const leadId = generateId('LEAD');
        const lead = {
            id: leadId,
            companyName: "Acme Corp",
            contactPerson: "John Doe",
            status: "New",
            detailedItems: [{ productName: "Widget", quantity: 100, unitPrice: 10 }]
        };
        store.addLead(lead);
        console.log(`✅ Lead created: ${leadId}`);

        // 2. Convert to Sample
        const sampleId = generateId('SMPL');
        const sample = {
            id: sampleId,
            leadId: leadId,
            leadName: lead.companyName,
            status: "Pending",
            products: lead.detailedItems
        };
        store.addSample(sample);
        store.updateLead(leadId, { status: "Sample" });
        console.log(`✅ Sample requested: ${sampleId}`);

        // 3. Generate Quotation
        const quoteId = generateId('QTN');
        const quotation = {
            id: quoteId,
            leadId: leadId,
            customerName: lead.companyName,
            status: "Draft",
            detailedItems: lead.detailedItems,
            grandTotal: 1000
        };
        store.addQuotation(quotation);
        store.updateLead(leadId, { status: "Quotation" });
        console.log(`✅ Quotation created: ${quoteId}`);

        // 4. Confirm Order
        const orderId = generateId('ORD');
        const order = {
            id: orderId,
            customerName: quotation.customerName,
            workflowStatus: OrderStatus.SALES_ORDER,
            totalAmount: quotation.grandTotal,
            history: []
        };
        store.addOrder(order);
        store.updateQuotation(quoteId, { status: "Confirmed" });
        console.log(`✅ Order confirmed: ${orderId}`);

        // Transition to Plant Pending
        store.updateOrder(orderId, { workflowStatus: OrderStatus.PLANT_PENDING });
        console.log(`✅ Order transitioned to Plant Pending`);

        // 5. Receive Payment
        const paymentId = generateId('PAY');
        const payment = {
            id: paymentId,
            orderNo: orderId,
            amount: 1000,
            status: "Pending Verification"
        };
        store.addPayment(payment);
        console.log(`✅ Payment recorded: ${paymentId}`);

        // Verifications
        const state = useTestStore.getState();
        const finalLead = state.leads.find((l: any) => l.id === leadId);
        assert.equal(finalLead.status, "Quotation", "Lead status should be Quotation");

        const finalSample = state.samples.find((s: any) => s.id === sampleId);
        assert.equal(finalSample.leadId, leadId, "Sample should be linked to Lead");

        const finalQuote = state.quotations.find((q: any) => q.id === quoteId);
        assert.equal(finalQuote.status, "Confirmed", "Quotation status should be Confirmed");

        const finalOrder = state.orders.find((o: any) => o.id === orderId);
        assert.equal(finalOrder.workflowStatus, OrderStatus.PLANT_PENDING, "Order should be in Plant Pending");

        const finalPayment = state.payments.find((p: any) => p.id === paymentId);
        assert.equal(finalPayment.orderNo, orderId, "Payment should be linked to Order");

        console.log("🎉 [Test 1] Passed!\n");

        console.log("🏆 ALL SALES TESTS PASSED SUCCESSFULLY! Data was managed purely in-memory.");

    } catch (err) {
        console.error("\n❌ TEST FAILED:", err.message);
        process.exit(1);
    }
}

runSalesTests();
