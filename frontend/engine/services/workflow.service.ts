import { Order, OrderStatus } from '../../types/Order';
import { moveOrderToNextStage } from '../workflow/orderWorkflow';
import { INITIAL_ERP_STATE } from '../database';

// Helper to find and update order in local memory mock and global prototype state
const getOrder = (id: string): Order => {
    const orders = (globalThis as any).__prototypeOrders || (INITIAL_ERP_STATE.orders as any[]) || [];
    return orders.find((o: any) =>
        String(o.id) === String(id) ||
        String(o.orderId) === String(id) ||
        String(o.orderNumber) === String(id) ||
        String(o.orderNo) === String(id) ||
        String(o.workOrderId) === String(id) ||
        String(o.workOrderNo) === String(id) ||
        `WO-${String(o.orderNo || o.id || '').split('-').slice(1).join('-') || o.id}` === String(id)
    ) as Order;
};

const saveOrder = (order: Order) => {
    if (!(globalThis as any).__prototypeOrders) {
        (globalThis as any).__prototypeOrders = [...(INITIAL_ERP_STATE.orders as any[])];
    }
    const orders = (globalThis as any).__prototypeOrders;
    const idx = orders.findIndex((o: any) =>
        String(o.id) === String(order.id) ||
        String(o.orderNumber) === String(order.orderNumber || order.id) ||
        String(o.orderNo) === String(order.orderNo || order.id)
    );
    if (idx !== -1) {
        orders[idx] = order;
    } else {
        orders.push(order);
    }
    // Also update INITIAL_ERP_STATE
    const initIdx = (INITIAL_ERP_STATE.orders as any[]).findIndex((o: any) => String(o.id) === String(order.id) || String(o.orderNo) === String(order.orderNo));
    if (initIdx !== -1) {
        (INITIAL_ERP_STATE.orders as any[])[initIdx] = order;
    } else {
        (INITIAL_ERP_STATE.orders as any[]).push(order);
    }
    return order;
};

export const workflowService = {
    transitionOrder: (id: string, newStatus: OrderStatus) => {
        const order = getOrder(id);
        if (!order) throw new Error("Order not found");
        const updatedOrder = moveOrderToNextStage(order, newStatus);
        return saveOrder(updatedOrder);
    },

    // Plant Head
    approvePlanning: (id: string, scheduleData: any) => {
        const order = getOrder(id);
        if (!order) throw new Error("Order not found");
        const updated = moveOrderToNextStage(order, OrderStatus.WORK_ORDER_CREATED);
        updated.schedule = { ...order.schedule, ...scheduleData };
        return saveOrder(updated);
    },

    // Production
    assignMachine: (id: string, machineData: any) => {
        const order = getOrder(id);
        if (!order) throw new Error("Order not found");
        const updated = moveOrderToNextStage(order, OrderStatus.PRODUCTION_PLANNED);
        updated.schedule = { ...order.schedule, ...machineData };
        return saveOrder(updated);
    },
    startProduction: (id: string) => {
        return workflowService.transitionOrder(id, OrderStatus.IN_PRODUCTION);
    },
    finishProduction: (id: string, productionData: any) => {
        const order = getOrder(id);
        if (!order) throw new Error("Order not found");
        const updated = moveOrderToNextStage(order, OrderStatus.PRODUCTION_COMPLETED);
        updated.production = { ...order.production, ...productionData };
        return saveOrder(updated);
    },

    // QC
    approveQC: (id: string, qcData: any) => {
        const order = getOrder(id);
        if (!order) throw new Error("Order not found");
        const updated = moveOrderToNextStage(order, OrderStatus.QC_APPROVED);
        updated.qc = { ...order.qc, ...qcData, overallResult: 'Pass' };
        return saveOrder(updated);
    },
    failQC: (id: string, qcData: any) => {
        const order = getOrder(id);
        if (!order) throw new Error("Order not found");
        const updated = moveOrderToNextStage(order, OrderStatus.QC_FAILED);
        updated.qc = { ...order.qc, ...qcData, overallResult: 'Fail' };
        return saveOrder(updated);
    },

    // Dispatch
    createDispatch: (id: string, dispatchData: any) => {
        const order = getOrder(id);
        if (!order) throw new Error("Order not found");
        const updated = moveOrderToNextStage(order, OrderStatus.DISPATCH_PENDING);
        updated.dispatch = { ...order.dispatch, ...dispatchData };
        return saveOrder(updated);
    },
    markInTransit: (id: string) => {
        return workflowService.transitionOrder(id, OrderStatus.IN_TRANSIT);
    },
    markDelivered: (id: string, deliveryData: any) => {
        const order = getOrder(id);
        if (!order) throw new Error("Order not found");

        // 1. Move to DELIVERED
        let updated = moveOrderToNextStage(order, OrderStatus.DELIVERED);
        updated.dispatch = { ...order.dispatch, ...deliveryData };

        // 2. System automatically generates invoice & transitions to INVOICED
        updated = moveOrderToNextStage(updated, OrderStatus.INVOICED);
        updated.invoice = {
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            amount: updated.quotation?.grandTotal || updated.grandTotal || updated.totalAmount || 15000,
            ...updated.invoice
        };

        return saveOrder(updated);
    },

    // Finance
    createInvoice: (id: string, invoiceData: any) => {
        const order = getOrder(id);
        if (!order) throw new Error("Order not found");
        if (order.workflowStatus === OrderStatus.INVOICED) {
            order.invoice = { ...order.invoice, ...invoiceData };
            return saveOrder(order);
        }
        const updated = moveOrderToNextStage(order, OrderStatus.INVOICED);
        updated.invoice = { ...order.invoice, ...invoiceData };
        return saveOrder(updated);
    },
    verifyPayment: (id: string, paymentData: any) => {
        const order = getOrder(id);
        if (!order) throw new Error("Order not found");

        // 1. Move to PAID (Verify payment)
        let updated = moveOrderToNextStage(order, OrderStatus.PAID);
        updated.payment = { ...order.payment, ...paymentData };

        // 2. System automatically closes order & transitions to CLOSED
        updated = moveOrderToNextStage(updated, OrderStatus.CLOSED);

        return saveOrder(updated);
    },
    closeOrder: (id: string) => {
        const order = getOrder(id);
        if (!order) throw new Error("Order not found");
        if (order.workflowStatus === OrderStatus.CLOSED) {
            return order;
        }
        const updated = moveOrderToNextStage(order, OrderStatus.CLOSED);
        return saveOrder(updated);
    }
};
