(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/store/searchStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSearchStore",
    ()=>useSearchStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
const useSearchStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
        globalSearch: '',
        setGlobalSearch: (globalSearch)=>set({
                globalSearch
            })
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/store/domains/sales/salesSelectors.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * salesSelectors.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Role-safe, cross-panel selectors derived from state.sales.
 *
 * Convention: all selectors accept the full ERPState (not state.sales),
 * so they can be passed directly to useERPStore(selector).
 *
 * Data masking rules:
 *  - Dispatch views never contain pricing/payment data
 *  - Plant Head views never contain payment data
 *  - Production views never contain payment or commercial data
 *  - Finance views contain required commercial data
 * ─────────────────────────────────────────────────────────────────────────────
 */ __turbopack_context__.s([
    "canConvertQuotation",
    ()=>canConvertQuotation,
    "canGenerateQuotationFromLead",
    ()=>canGenerateQuotationFromLead,
    "canRecordPayment",
    ()=>canRecordPayment,
    "canRequestReplacement",
    ()=>canRequestReplacement,
    "canRequestReturn",
    ()=>canRequestReturn,
    "canRequestSample",
    ()=>canRequestSample,
    "canSendOrderToPlantHead",
    ()=>canSendOrderToPlantHead,
    "selectDispatchOrders",
    ()=>selectDispatchOrders,
    "selectDispatchReplacements",
    ()=>selectDispatchReplacements,
    "selectDispatchReturns",
    ()=>selectDispatchReturns,
    "selectDispatchSamples",
    ()=>selectDispatchSamples,
    "selectEnrichedSamples",
    ()=>selectEnrichedSamples,
    "selectFinanceSalesConfirmations",
    ()=>selectFinanceSalesConfirmations,
    "selectFinanceVerifiedPayments",
    ()=>selectFinanceVerifiedPayments,
    "selectLeadsForSample",
    ()=>selectLeadsForSample,
    "selectPendingQuotations",
    ()=>selectPendingQuotations,
    "selectPlantHeadIncomingOrders",
    ()=>selectPlantHeadIncomingOrders,
    "selectPlantHeadPlanningOrders",
    ()=>selectPlantHeadPlanningOrders,
    "selectPlantHeadReplacementRequests",
    ()=>selectPlantHeadReplacementRequests,
    "selectPlantHeadReturnRequests",
    ()=>selectPlantHeadReturnRequests,
    "selectProductionIncomingOrders",
    ()=>selectProductionIncomingOrders,
    "selectProductionWorkOrders",
    ()=>selectProductionWorkOrders,
    "selectSalesLeads",
    ()=>selectSalesLeads,
    "selectSalesOrders",
    ()=>selectSalesOrders,
    "selectSalesPaymentConfirmations",
    ()=>selectSalesPaymentConfirmations,
    "selectSalesQuotations",
    ()=>selectSalesQuotations,
    "selectSalesReplacementRequests",
    ()=>selectSalesReplacementRequests,
    "selectSalesReturnRequests",
    ()=>selectSalesReturnRequests,
    "selectSalesSamples",
    ()=>selectSalesSamples
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$domains$2f$shared$2f$workflowUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/domains/shared/workflowUtils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$domains$2f$sales$2f$salesCalculations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/domains/sales/salesCalculations.ts [app-client] (ecmascript)");
;
;
// Helper to normalize sales safely
// ─── Memoization Helper ──────────────────────────────────────────────────────
function memoize(fn) {
    let lastSalesRef = null;
    let lastResult = null;
    return (store)=>{
        var _store_state;
        const currentSales = (store === null || store === void 0 ? void 0 : store.sales) || (store === null || store === void 0 ? void 0 : (_store_state = store.state) === null || _store_state === void 0 ? void 0 : _store_state.sales);
        if (currentSales && currentSales === lastSalesRef && lastResult !== null) return lastResult;
        lastSalesRef = currentSales;
        lastResult = fn(store);
        return lastResult;
    };
}
const getSales = (erpStoreState)=>{
    var _erpStoreState_state;
    const sales = (erpStoreState === null || erpStoreState === void 0 ? void 0 : erpStoreState.sales) || (erpStoreState === null || erpStoreState === void 0 ? void 0 : (_erpStoreState_state = erpStoreState.state) === null || _erpStoreState_state === void 0 ? void 0 : _erpStoreState_state.sales);
    return {
        leads: Array.isArray(sales === null || sales === void 0 ? void 0 : sales.leads) ? sales.leads : [],
        samples: Array.isArray(sales === null || sales === void 0 ? void 0 : sales.samples) ? sales.samples : [],
        quotations: Array.isArray(sales === null || sales === void 0 ? void 0 : sales.quotations) ? sales.quotations : [],
        orders: Array.isArray(sales === null || sales === void 0 ? void 0 : sales.orders) ? sales.orders : [],
        paymentConfirmations: Array.isArray(sales === null || sales === void 0 ? void 0 : sales.paymentConfirmations) ? sales.paymentConfirmations : [],
        replacementRequests: Array.isArray(sales === null || sales === void 0 ? void 0 : sales.replacementRequests) ? sales.replacementRequests : [],
        returnRequests: Array.isArray(sales === null || sales === void 0 ? void 0 : sales.returnRequests) ? sales.returnRequests : []
    };
};
// ════════════════════════════════════════════════════════════════════════════
//  LEAD SELECTORS
// ════════════════════════════════════════════════════════════════════════════
/** All leads for the Sales panel */ const _selectSalesLeads = (store)=>getSales(store).leads;
/** Leads that are eligible for a new sample dispatch */ const _selectLeadsForSample = (store)=>getSales(store).leads.filter((l)=>l.status === 'LEAD_CREATED' || l.status === 'SAMPLE_REQUESTED' || l.status === 'QUOTATION_CREATED');
// ════════════════════════════════════════════════════════════════════════════
//  SAMPLE SELECTORS
// ════════════════════════════════════════════════════════════════════════════
const _selectSalesSamples = (store)=>getSales(store).samples;
/** Dispatch-safe view: no pricing data included (samples have none, but we strip redundant lead info) */ const _selectDispatchSamples = (store)=>{
    const { samples, leads } = getSales(store);
    return samples.filter((s)=>s.status === 'SAMPLE_DISPATCH_REQUESTED' || s.status === 'SAMPLE_VEHICLE_ASSIGNED' || s.status === 'SAMPLE_DISPATCHED' || s.status === 'SAMPLE_IN_TRANSIT').map((s)=>{
        const lead = leads.find((l)=>l.id === s.leadId);
        return {
            id: s.id,
            leadId: s.leadId,
            customerName: (lead === null || lead === void 0 ? void 0 : lead.customerName) || '',
            contactPerson: (lead === null || lead === void 0 ? void 0 : lead.contactPerson) || '',
            deliveryAddress: (lead === null || lead === void 0 ? void 0 : lead.deliveryAddress) || '',
            product: s.product,
            quantity: s.quantity,
            specifications: s.specifications,
            status: s.status,
            expectedDeliveryDate: s.expectedDeliveryDate,
            specialDeliveryInstructions: s.specialDeliveryInstructions,
            forwardDispatch: s.forwardDispatch,
            createdAt: s.createdAt
        };
    });
};
/** Samples enriched with testing countdown for Sales/Admin panels */ const _selectEnrichedSamples = (store)=>getSales(store).samples.map((s)=>({
            ...s,
            testingRemainingDays: (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$domains$2f$sales$2f$salesCalculations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSampleRemainingDays"])(s)
        }));
// ════════════════════════════════════════════════════════════════════════════
//  QUOTATION SELECTORS
// ════════════════════════════════════════════════════════════════════════════
const _selectSalesQuotations = (store)=>getSales(store).quotations;
const _selectPendingQuotations = (store)=>getSales(store).quotations.filter((q)=>q.status === 'QUOTATION_DRAFT' || q.status === 'QUOTATION_SENT');
// ════════════════════════════════════════════════════════════════════════════
//  ORDER SELECTORS
// ════════════════════════════════════════════════════════════════════════════
const _selectSalesOrders = (store)=>getSales(store).orders;
/**
 * Plant Head incoming orders: orders with planningStatus === 'PENDING_ACCEPTANCE'.
 */ const _selectPlantHeadIncomingOrders = (store)=>{
    const { orders } = getSales(store);
    return orders.filter((o)=>o.sentToPlantHead === true || (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$domains$2f$shared$2f$workflowUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeStatus"])(o.workflowStatus) === 'SENT_TO_PLANT_HEAD' || (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$domains$2f$shared$2f$workflowUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeStatus"])(o.plantHeadStatus) === 'PENDING' || (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$domains$2f$shared$2f$workflowUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeStatus"])(o.status) === 'SENT_TO_PLANT_HEAD' || (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$domains$2f$shared$2f$workflowUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeStatus"])(o.planningStatus) === 'PENDING_ACCEPTANCE').filter((o)=>![
            'ACCEPTED',
            'REJECTED'
        ].includes((0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$domains$2f$shared$2f$workflowUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeStatus"])(o.plantHeadStatus))).map(toPlantHeadSafeView);
};
/**
 * Plant Head planning orders: orders with planningStatus === 'PLANT_HEAD_ACCEPTED'.
 */ const _selectPlantHeadPlanningOrders = (store)=>{
    const { orders } = getSales(store);
    return orders.filter((o)=>o.planningStatus === 'PLANT_HEAD_ACCEPTED').map(toPlantHeadSafeView);
};
/**
 * Production incoming orders: orders with planningStatus === 'PRODUCTION_PLANNED' && productionStatus === 'NOT_STARTED'.
 */ const _selectProductionIncomingOrders = (store)=>{
    const { orders } = getSales(store);
    return orders.filter((o)=>o.planningStatus === 'PRODUCTION_PLANNED' && (o.productionStatus === 'NOT_STARTED' || !o.productionStatus)).map(toProductionSafeView);
};
const _selectProductionWorkOrders = (store)=>{
    const { orders } = getSales(store);
    return orders.filter((o)=>o.planningStatus === 'PLANT_HEAD_ACCEPTED' || o.planningStatus === 'PRODUCTION_PLANNED' || [
            'WORK_ORDER_CREATED',
            'PRODUCTION_ACCEPTED',
            'IN_PRODUCTION',
            'PAUSED',
            'REWORK',
            'PRODUCTION_COMPLETED',
            'QC_PENDING'
        ].includes(o.productionStatus)).map(toProductionSafeView);
};
/**
 * Dispatch view: orders where QC-approved, finished goods, or completed production ready for dispatch.
 * No pricing/payment data.
 */ const _selectDispatchOrders = (store)=>{
    const { orders } = getSales(store);
    const eligibleQC = [
        'APPROVED',
        'QC_APPROVED',
        'PASSED',
        'QC_PASSED',
        'PARTIALLY_APPROVED',
        'FINISHED_GOODS',
        'READY',
        'READY_FOR_DISPATCH',
        'SENT_TO_DISPATCH'
    ];
    const eligibleProduction = [
        'PRODUCTION_COMPLETED',
        'COMPLETED',
        'FINISHED_GOODS',
        'QC_APPROVED',
        'QC_PASSED'
    ];
    const eligibleDispatch = [
        'READY_FOR_DISPATCH',
        'DISPATCH_CREATED',
        'PENDING',
        'IN_TRANSIT'
    ];
    return orders.filter((o)=>(eligibleQC.includes(o.qcStatus) || eligibleProduction.includes(o.productionStatus) || eligibleDispatch.includes(o.dispatchStatus) || o.sentToDispatchAt || o.dispatchStatus === 'SENT_TO_DISPATCH') && o.qcStatus !== 'REWORK_REQUIRED' && o.qcStatus !== 'FAILED' && o.dispatchStatus !== 'DELIVERED' && o.dispatchStatus !== 'CONFIRMED').map(toDispatchSafeView);
};
// ════════════════════════════════════════════════════════════════════════════
//  PAYMENT SELECTORS
// ════════════════════════════════════════════════════════════════════════════
const _selectSalesPaymentConfirmations = (store)=>getSales(store).paymentConfirmations;
/**
 * Finance Sales Confirmations: payments awaiting Finance verification.
 * Includes linked order data for commercial context.
 */ const _selectFinanceSalesConfirmations = (store)=>{
    const { paymentConfirmations, orders } = getSales(store);
    return paymentConfirmations.filter((p)=>p.status === 'FINANCE_VERIFICATION_PENDING' || p.status === 'SALES_PAYMENT_RECORDED').map((p)=>{
        const order = orders.find((o)=>o.id === p.orderId);
        var _order_grandTotal;
        return {
            ...p,
            customerName: (order === null || order === void 0 ? void 0 : order.customerName) || '',
            grandTotal: (_order_grandTotal = order === null || order === void 0 ? void 0 : order.grandTotal) !== null && _order_grandTotal !== void 0 ? _order_grandTotal : 0,
            salesperson: (order === null || order === void 0 ? void 0 : order.salesperson) || '',
            orderContactPerson: (order === null || order === void 0 ? void 0 : order.contactPerson) || ''
        };
    });
};
/** All confirmed payments for an order (for Finance closed POs / history) */ const _selectFinanceVerifiedPayments = (store)=>getSales(store).paymentConfirmations.filter((p)=>p.status === 'FINANCE_VERIFIED');
// ════════════════════════════════════════════════════════════════════════════
//  REPLACEMENT SELECTORS
// ════════════════════════════════════════════════════════════════════════════
const _selectSalesReplacementRequests = (store)=>getSales(store).replacementRequests;
/** Plant Head replacement requests awaiting approval */ const _selectPlantHeadReplacementRequests = (store)=>{
    const { replacementRequests, orders } = getSales(store);
    return replacementRequests.filter((r)=>r.status === 'REPLACEMENT_REQUESTED' || r.status === 'REPLACEMENT_APPROVED').map((r)=>{
        const order = orders.find((o)=>o.id === r.orderId);
        return {
            ...r,
            customerName: (order === null || order === void 0 ? void 0 : order.customerName) || '',
            orderContactPerson: (order === null || order === void 0 ? void 0 : order.contactPerson) || '',
            deliveryAddress: (order === null || order === void 0 ? void 0 : order.deliveryAddress) || ''
        };
    });
};
/** Dispatch replacement requests: approved replacements to be shipped */ const _selectDispatchReplacements = (store)=>{
    const { replacementRequests, orders } = getSales(store);
    return replacementRequests.filter((r)=>r.status === 'REPLACEMENT_APPROVED' || r.status === 'REPLACEMENT_DISPATCHED' || r.status === 'REPLACEMENT_IN_TRANSIT' || r.status === 'REPLACEMENT_DELIVERED').map((r)=>{
        const order = orders.find((o)=>o.id === r.orderId);
        return {
            id: r.id,
            orderId: r.orderId,
            customerName: (order === null || order === void 0 ? void 0 : order.customerName) || '',
            contactPerson: (order === null || order === void 0 ? void 0 : order.contactPerson) || '',
            deliveryAddress: (order === null || order === void 0 ? void 0 : order.deliveryAddress) || r.replacementDeliveryAddress || '',
            items: r.items,
            status: r.status,
            pickupRequired: r.pickupRequired,
            preferredReplacementDate: r.preferredReplacementDate,
            documents: r.documents,
            photos: r.photos,
            plantHeadRemarks: r.plantHeadRemarks,
            createdAt: r.createdAt
        };
    });
};
// ════════════════════════════════════════════════════════════════════════════
//  RETURN SELECTORS
// ════════════════════════════════════════════════════════════════════════════
const _selectSalesReturnRequests = (store)=>getSales(store).returnRequests;
/** Plant Head return requests awaiting approval */ const _selectPlantHeadReturnRequests = (store)=>{
    const { returnRequests, orders } = getSales(store);
    return returnRequests.filter((r)=>r.status === 'RETURN_REQUESTED' || r.status === 'RETURN_APPROVED').map((r)=>{
        const order = orders.find((o)=>o.id === r.orderId);
        return {
            ...r,
            customerName: (order === null || order === void 0 ? void 0 : order.customerName) || '',
            orderContactPerson: (order === null || order === void 0 ? void 0 : order.contactPerson) || ''
        };
    });
};
/** Dispatch return requests: approved returns for pickup coordination */ const _selectDispatchReturns = (store)=>{
    const { returnRequests, orders } = getSales(store);
    return returnRequests.filter((r)=>[
            'RETURN_APPROVED',
            'RETURN_PICKUP_ASSIGNED',
            'RETURN_IN_TRANSIT',
            'RETURN_RECEIVED'
        ].includes(r.status)).map((r)=>{
        const order = orders.find((o)=>o.id === r.orderId);
        return {
            id: r.id,
            orderId: r.orderId,
            customerName: (order === null || order === void 0 ? void 0 : order.customerName) || '',
            contactPerson: r.contactPerson || (order === null || order === void 0 ? void 0 : order.contactPerson) || '',
            pickupAddress: r.pickupAddress || (order === null || order === void 0 ? void 0 : order.deliveryAddress) || '',
            items: r.items,
            status: r.status,
            preferredPickupDate: r.preferredPickupDate,
            pickupDocument: r.pickupDocument,
            transitDocument: r.transitDocument,
            receiptImages: r.receiptImages,
            receiptDocument: r.receiptDocument,
            inspectionImages: r.inspectionImages,
            plantHeadRemarks: r.plantHeadRemarks,
            remarks: r.remarks,
            createdAt: r.createdAt
        };
    });
};
const canGenerateQuotationFromLead = (status)=>status === 'LEAD_CREATED' || status === 'SAMPLE_REQUESTED' || status === 'QUOTATION_CREATED';
const canRequestSample = (status)=>status === 'LEAD_CREATED' || status === 'SAMPLE_REQUESTED';
const canConvertQuotation = (status)=>status === 'CUSTOMER_ACCEPTED';
const canSendOrderToPlantHead = (order)=>order.commercialStatus === 'ORDER_CONFIRMED' && order.planningStatus === 'NOT_SENT';
const canRecordPayment = (order, confirmations)=>order.commercialStatus !== 'ORDER_CANCELLED' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$domains$2f$sales$2f$salesCalculations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculatePendingAmount"])(order, confirmations) > 0;
const canRequestReplacement = (order, replacements, returns)=>{
    if (order.dispatchStatus !== 'DELIVERED') return false;
    if (replacements.some((request)=>request.orderId === order.id && [
            'REPLACEMENT_REQUESTED',
            'REPLACEMENT_APPROVED',
            'REPLACEMENT_DISPATCHED',
            'REPLACEMENT_IN_TRANSIT'
        ].includes(request.status))) return false;
    let totalAvailable = 0;
    for (const item of order.items){
        totalAvailable += (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$domains$2f$sales$2f$salesCalculations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAvailableAfterSalesQuantity"])(item.id, item.quantity, replacements, returns);
    }
    return totalAvailable > 0;
};
const canRequestReturn = (order, replacements, returns)=>{
    if (order.dispatchStatus !== 'DELIVERED') return false;
    if (returns.some((request)=>request.orderId === order.id && [
            'RETURN_REQUESTED',
            'RETURN_APPROVED',
            'RETURN_PICKUP_ASSIGNED',
            'RETURN_IN_TRANSIT'
        ].includes(request.status))) return false;
    let totalAvailable = 0;
    for (const item of order.items){
        totalAvailable += (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$domains$2f$sales$2f$salesCalculations$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAvailableAfterSalesQuantity"])(item.id, item.quantity, replacements, returns);
    }
    return totalAvailable > 0;
};
// ════════════════════════════════════════════════════════════════════════════
//  DATA MASKING HELPERS (private)
// ════════════════════════════════════════════════════════════════════════════
/** Plant Head view: no payment, no pricing — operational info only */ function toPlantHeadSafeView(order) {
    var _customer;
    const safeItems = Array.isArray(order.items) ? order.items : [];
    return {
        ...order,
        id: order.id,
        orderNo: order.orderNo || order.id,
        customerName: order.customerName || ((_customer = order.customer) === null || _customer === void 0 ? void 0 : _customer.name) || 'Customer',
        contactPerson: order.contactPerson,
        deliveryAddress: order.deliveryAddress,
        salesperson: order.salesperson,
        requiredDeliveryDate: order.requiredDeliveryDate,
        planningStatus: order.planningStatus,
        commercialStatus: order.commercialStatus,
        productionStatus: order.productionStatus,
        qcStatus: order.qcStatus,
        dispatchStatus: order.dispatchStatus,
        replacementStatus: order.replacementStatus,
        returnStatus: order.returnStatus,
        products: order.products || (safeItems.length > 0 ? safeItems.map((i)=>{
            var _this;
            return "".concat((i === null || i === void 0 ? void 0 : i.productName) || ((_this = i) === null || _this === void 0 ? void 0 : _this.name) || 'Item', " (").concat((i === null || i === void 0 ? void 0 : i.quantity) || 1, " Qty)");
        }).join(', ') : 'Items'),
        detailedItems: safeItems,
        items: safeItems.map(toOperationalItem),
        createdAt: order.createdAt
    };
}
/** Production view: operational info only */ function toProductionSafeView(order) {
    const safeItems = Array.isArray(order.items) ? order.items : [];
    const productStr = order.products || (safeItems.length > 0 ? safeItems.map((i)=>{
        var _this;
        return (i === null || i === void 0 ? void 0 : i.productName) || ((_this = i) === null || _this === void 0 ? void 0 : _this.name) || 'Item';
    }).join(', ') : 'Custom Engineered Product');
    return {
        ...order,
        id: order.id,
        orderNo: order.orderNo || order.id,
        order_no: order.orderNo || order.id,
        customerName: order.customerName,
        contactPerson: order.contactPerson,
        deliveryAddress: order.deliveryAddress,
        requiredDeliveryDate: order.requiredDeliveryDate,
        planningStatus: order.planningStatus,
        productionStatus: order.productionStatus,
        qcStatus: order.qcStatus,
        products: productStr,
        productName: order.productName || productStr,
        items: safeItems.map(toOperationalItem),
        createdAt: order.createdAt
    };
}
/** Dispatch view: no pricing data */ function toDispatchSafeView(order) {
    const safeItems = Array.isArray(order.items) ? order.items : [];
    const productStr = order.products || (safeItems.length > 0 ? safeItems.map((i)=>{
        var _this;
        return (i === null || i === void 0 ? void 0 : i.productName) || ((_this = i) === null || _this === void 0 ? void 0 : _this.name) || 'Item';
    }).join(', ') : 'Custom Engineered Product');
    return {
        ...order,
        id: order.id,
        orderNo: order.orderNo || order.id,
        order_no: order.orderNo || order.id,
        customerName: order.customerName,
        contactPerson: order.contactPerson,
        deliveryAddress: order.deliveryAddress,
        requiredDeliveryDate: order.requiredDeliveryDate,
        dispatchStatus: order.dispatchStatus,
        qcStatus: order.qcStatus,
        products: productStr,
        productName: order.productName || productStr,
        items: safeItems.map(toOperationalItem),
        createdAt: order.createdAt
    };
}
/** Strip pricing fields from line items for non-commercial roles */ function toOperationalItem(item) {
    if (!item) return {};
    return {
        id: item.id,
        productId: item.productId,
        productName: item.productName || item.name || '',
        specifications: item.specifications || item.specification || '',
        quantity: item.quantity,
        unit: item.unit,
        hsnCode: item.hsnCode
    };
}
const selectSalesLeads = memoize(_selectSalesLeads);
const selectLeadsForSample = memoize(_selectLeadsForSample);
const selectSalesSamples = memoize(_selectSalesSamples);
const selectDispatchSamples = memoize(_selectDispatchSamples);
const selectEnrichedSamples = memoize(_selectEnrichedSamples);
const selectSalesQuotations = memoize(_selectSalesQuotations);
const selectPendingQuotations = memoize(_selectPendingQuotations);
const selectSalesOrders = memoize(_selectSalesOrders);
const selectPlantHeadIncomingOrders = memoize(_selectPlantHeadIncomingOrders);
const selectPlantHeadPlanningOrders = memoize(_selectPlantHeadPlanningOrders);
const selectProductionIncomingOrders = memoize(_selectProductionIncomingOrders);
const selectProductionWorkOrders = memoize(_selectProductionWorkOrders);
const selectDispatchOrders = memoize(_selectDispatchOrders);
const selectSalesPaymentConfirmations = memoize(_selectSalesPaymentConfirmations);
const selectFinanceSalesConfirmations = memoize(_selectFinanceSalesConfirmations);
const selectFinanceVerifiedPayments = memoize(_selectFinanceVerifiedPayments);
const selectSalesReplacementRequests = memoize(_selectSalesReplacementRequests);
const selectPlantHeadReplacementRequests = memoize(_selectPlantHeadReplacementRequests);
const selectDispatchReplacements = memoize(_selectDispatchReplacements);
const selectSalesReturnRequests = memoize(_selectSalesReturnRequests);
const selectPlantHeadReturnRequests = memoize(_selectPlantHeadReturnRequests);
const selectDispatchReturns = memoize(_selectDispatchReturns);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/store/materialFlow.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/* eslint-disable @typescript-eslint/no-explicit-any */ __turbopack_context__.s([
    "approveMaterialRequest",
    ()=>approveMaterialRequest,
    "approveStoreMaterialRequest",
    ()=>approveStoreMaterialRequest,
    "issueCompleteOrderMaterials",
    ()=>issueCompleteOrderMaterials,
    "rejectMaterialRequest",
    ()=>rejectMaterialRequest,
    "rejectStoreMaterialRequest",
    ()=>rejectStoreMaterialRequest,
    "selectMaterialRequests",
    ()=>selectMaterialRequests,
    "selectPlantHeadHistoryRequests",
    ()=>selectPlantHeadHistoryRequests,
    "selectPlantHeadPendingRequests",
    ()=>selectPlantHeadPendingRequests,
    "selectProductionStoreReleases",
    ()=>selectProductionStoreReleases,
    "selectStoreApprovedRequests",
    ()=>selectStoreApprovedRequests,
    "selectStoreReleaseRequests",
    ()=>selectStoreReleaseRequests,
    "selectStoreRequestHistory",
    ()=>selectStoreRequestHistory,
    "submitMaterialRequest",
    ()=>submitMaterialRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/production.ts [app-client] (ecmascript)");
;
;
;
const requests = (state)=>{
    var _state_production;
    return Array.isArray(state === null || state === void 0 ? void 0 : (_state_production = state.production) === null || _state_production === void 0 ? void 0 : _state_production.materialRequests) ? state.production.materialRequests : [];
};
const selectMaterialRequests = requests;
const selectPlantHeadPendingRequests = (state)=>requests(state).filter((request)=>request.status === __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].PENDING_PLANT_HEAD_APPROVAL);
const selectPlantHeadHistoryRequests = (state)=>requests(state).filter((request)=>request.status !== __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].PENDING_PLANT_HEAD_APPROVAL);
const selectStoreApprovedRequests = (state)=>requests(state).filter((request)=>request.status === __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].PLANT_HEAD_APPROVED);
const selectStoreRequestHistory = (state)=>requests(state).filter((request)=>request.status === __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].STORE_REJECTED);
const selectStoreReleaseRequests = (state)=>requests(state).filter((request)=>request.status === __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].STORE_APPROVED);
const selectProductionStoreReleases = (state)=>requests(state).filter((request)=>request.department === 'Production' && request.status === __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].ISSUED);
const commit = (updater)=>{
    const store = __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState();
    store.setState(updater(store.state || {}));
};
const materialMatches = (inventoryItem, requestItem)=>[
        inventoryItem === null || inventoryItem === void 0 ? void 0 : inventoryItem.id,
        inventoryItem === null || inventoryItem === void 0 ? void 0 : inventoryItem.materialId,
        inventoryItem === null || inventoryItem === void 0 ? void 0 : inventoryItem.code
    ].filter(Boolean).includes(requestItem === null || requestItem === void 0 ? void 0 : requestItem.materialId) || String((inventoryItem === null || inventoryItem === void 0 ? void 0 : inventoryItem.material) || (inventoryItem === null || inventoryItem === void 0 ? void 0 : inventoryItem.name) || '').toLowerCase() === String((requestItem === null || requestItem === void 0 ? void 0 : requestItem.materialName) || (requestItem === null || requestItem === void 0 ? void 0 : requestItem.material) || '').toLowerCase();
const submitMaterialRequest = (data)=>{
    const now = new Date().toISOString();
    const id = data.id || __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().generateEntityId('materialRequest');
    const request = {
        ...data,
        id,
        requestNo: id,
        orderId: data.orderId || data.workOrderNo || '',
        department: 'Production',
        items: (data.items || []).map((item, index)=>({
                ...item,
                materialId: item.materialId || item.id || "MAT-".concat(Date.now(), "-").concat(index + 1),
                materialName: item.materialName || item.material,
                material: item.materialName || item.material,
                requestedQty: Number(item.requestedQty || 0),
                approvedQty: 0,
                issuedQty: 0,
                unit: item.unit || 'Units'
            })),
        status: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].PENDING_PLANT_HEAD_APPROVAL,
        createdAt: data.createdAt || now
    };
    commit((state)=>({
            ...state,
            production: {
                ...state.production || {},
                materialRequests: [
                    request,
                    ...requests(state)
                ]
            }
        }));
    return request;
};
const approveMaterialRequest = function(requestId, approvedItems) {
    let approvedBy = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 'Plant Head';
    const approvedAt = new Date().toISOString();
    commit((state)=>({
            ...state,
            production: {
                ...state.production || {},
                materialRequests: requests(state).map((request)=>request.id === requestId ? {
                        ...request,
                        status: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].PLANT_HEAD_APPROVED,
                        approvedBy,
                        approvedAt,
                        items: request.items.map((item)=>{
                            const approved = approvedItems.find((candidate)=>candidate.materialId === item.materialId || candidate.materialName === item.materialName || candidate.material === item.material);
                            var _approved_approvedQty, _ref;
                            return {
                                ...item,
                                approvedQty: Number((_ref = (_approved_approvedQty = approved === null || approved === void 0 ? void 0 : approved.approvedQty) !== null && _approved_approvedQty !== void 0 ? _approved_approvedQty : item.requestedQty) !== null && _ref !== void 0 ? _ref : 0)
                            };
                        })
                    } : request)
            }
        }));
};
const rejectMaterialRequest = function(requestId) {
    let approvedBy = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'Plant Head';
    const approvedAt = new Date().toISOString();
    commit((state)=>({
            ...state,
            production: {
                ...state.production || {},
                materialRequests: requests(state).map((request)=>request.id === requestId ? {
                        ...request,
                        status: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].PLANT_HEAD_REJECTED,
                        approvedBy,
                        approvedAt
                    } : request)
            }
        }));
};
const approveStoreMaterialRequest = function(requestId) {
    let actorName = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'Store';
    const store = __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState();
    const state = store.state || {};
    const request = requests(state).find((entry)=>entry.id === requestId);
    if (!request) throw new Error('Material request not found.');
    if (request.status !== __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].PLANT_HEAD_APPROVED) {
        throw new Error('Only a Plant Head approved request can be Store approved.');
    }
    const storeApprovedAt = new Date().toISOString();
    store.setState({
        ...state,
        production: {
            ...state.production || {},
            materialRequests: requests(state).map((entry)=>entry.id === requestId ? {
                    ...entry,
                    status: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].STORE_APPROVED,
                    storeApprovedBy: actorName,
                    storeApprovedAt,
                    items: entry.items.map((item)=>({
                            ...item,
                            issueQty: Number(item.approvedQty || 0)
                        }))
                } : entry)
        }
    });
};
const rejectStoreMaterialRequest = function(requestId, remarks) {
    let actorName = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 'Store';
    if (!(remarks === null || remarks === void 0 ? void 0 : remarks.trim())) throw new Error('Rejection reason is required.');
    const storeRejectedAt = new Date().toISOString();
    commit((state)=>({
            ...state,
            production: {
                ...state.production || {},
                materialRequests: requests(state).map((request)=>request.id === requestId && request.status === __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].PLANT_HEAD_APPROVED ? {
                        ...request,
                        status: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].STORE_REJECTED,
                        storeRejectedBy: actorName,
                        storeRejectedAt,
                        storeRejectionRemarks: remarks.trim()
                    } : request)
            }
        }));
};
const issueCompleteOrderMaterials = function(orderId) {
    let actorName = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'Store';
    var _state_production, _state_production1;
    const store = __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState();
    const state = store.state || {};
    const orderRequests = requests(state).filter((request)=>request.orderId === orderId);
    if (!orderRequests.length) throw new Error('No requests found for this order.');
    if (orderRequests.some((request)=>request.status === __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].ISSUED)) {
        throw new Error('This order has already been issued.');
    }
    if (orderRequests.some((request)=>request.status !== __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].STORE_APPROVED)) {
        throw new Error('Every request in this order must be Store approved.');
    }
    const inventory = [
        ...state.rawInventory || []
    ];
    orderRequests.forEach((request)=>request.items.forEach((item)=>{
            const approvedQty = Number(item.approvedQty || 0);
            const issueQty = Number(item.issueQty || 0);
            const inventoryIndex = inventory.findIndex((entry)=>materialMatches(entry, item));
            if (approvedQty <= 0 || issueQty !== approvedQty) {
                throw new Error("Issue quantity is incomplete for ".concat(item.materialName, "."));
            }
            if (inventoryIndex >= 0) {
                var _inventory_inventoryIndex;
                const availableStock = Number(((_inventory_inventoryIndex = inventory[inventoryIndex]) === null || _inventory_inventoryIndex === void 0 ? void 0 : _inventory_inventoryIndex.stock) || 0);
                inventory[inventoryIndex] = {
                    ...inventory[inventoryIndex],
                    stock: Math.max(0, availableStock - issueQty)
                };
            }
        }));
    const issuedAt = new Date().toISOString();
    const sequence = String((((_state_production = state.production) === null || _state_production === void 0 ? void 0 : _state_production.stockLedgerEntries) || []).filter((entry)=>entry.orderId === orderId).length + 1).padStart(3, '0');
    const issueReference = "ISS-".concat(orderId, "-").concat(sequence);
    const requestIds = new Set(orderRequests.map((request)=>request.id));
    const stockLedgerEntries = orderRequests.flatMap((request)=>request.items.map((item)=>({
                id: "LEDGER-".concat(Date.now(), "-").concat(item.materialId),
                type: 'MATERIAL_ISSUE',
                orderId,
                requestId: request.id,
                materialId: item.materialId,
                materialName: item.materialName,
                quantity: Number(item.issueQty || 0),
                unit: item.unit,
                issueReference,
                performedBy: actorName,
                createdAt: issuedAt
            })));
    store.setState({
        ...state,
        rawInventory: inventory,
        production: {
            ...state.production || {},
            stockLedgerEntries: [
                ...((_state_production1 = state.production) === null || _state_production1 === void 0 ? void 0 : _state_production1.stockLedgerEntries) || [],
                ...stockLedgerEntries
            ],
            materialRequests: requests(state).map((request)=>requestIds.has(request.id) ? {
                    ...request,
                    status: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].ISSUED,
                    issuedBy: actorName,
                    issuedAt,
                    issueReference,
                    items: request.items.map((item)=>({
                            ...item,
                            issuedQty: Number(item.issueQty || 0)
                        }))
                } : request)
        }
    });
    return issueReference;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/store/procurementActions.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "approveGRN",
    ()=>approveGRN,
    "approveGoodsReceiptNote",
    ()=>approveGoodsReceiptNote,
    "approveMaterialIndent",
    ()=>approveMaterialIndent,
    "approvePurchaseOrder",
    ()=>approvePurchaseOrder,
    "approveVendorReplacement",
    ()=>approveVendorReplacement,
    "canCloseMaterialRejection",
    ()=>canCloseMaterialRejection,
    "canClosePurchaseOrder",
    ()=>canClosePurchaseOrder,
    "closeMaterialRejection",
    ()=>closeMaterialRejection,
    "closePurchaseOrder",
    ()=>closePurchaseOrder,
    "createGRN",
    ()=>createGRN,
    "createMaterialIndent",
    ()=>createMaterialIndent,
    "createPurchaseOrder",
    ()=>createPurchaseOrder,
    "createReplacementGRN",
    ()=>createReplacementGRN,
    "disposeRejectedStock",
    ()=>disposeRejectedStock,
    "generateNotification",
    ()=>generateNotification,
    "issuePurchaseOrder",
    ()=>issuePurchaseOrder,
    "postInventoryTransaction",
    ()=>postInventoryTransaction,
    "processNoReplacement",
    ()=>processNoReplacement,
    "processWriteOff",
    ()=>processWriteOff,
    "raiseVendorDispute",
    ()=>raiseVendorDispute,
    "recordCommercialAdjustment",
    ()=>recordCommercialAdjustment,
    "rejectStoreRejection",
    ()=>rejectStoreRejection,
    "returnIndentForCorrection",
    ()=>returnIndentForCorrection,
    "submitMaterialRejection",
    ()=>submitMaterialRejection,
    "submitPurchaseOrder",
    ()=>submitPurchaseOrder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/procurement.ts [app-client] (ecmascript)");
;
;
// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
function getStoreState() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().state;
}
function updateStoreState(newState) {
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().setState(newState);
}
function safeClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
function postInventoryTransaction(materialId, quantity, type, remarks) {
    const state = getStoreState();
    const rawInventory = safeClone(state.rawInventory || []);
    let item = rawInventory.find((i)=>i.id === materialId || i.materialCode === materialId);
    if (!item) {
        item = {
            id: materialId,
            materialCode: materialId,
            quantity: 0,
            reservedQty: 0,
            history: []
        };
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
    updateStoreState({
        ...state,
        rawInventory
    });
}
function generateNotification(role, title, message) {
    const state = getStoreState();
    const notifications = safeClone(state.procurementNotifications || []);
    notifications.push({
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createId"])('NOTIF'),
        role,
        title,
        message,
        read: false,
        createdAt: new Date().toISOString()
    });
    updateStoreState({
        ...state,
        procurementNotifications: notifications
    });
}
function createMaterialIndent(data, actorName) {
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().createMaterialIndent(data);
}
function returnIndentForCorrection(indentId, remarks, actorName) {
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().returnMaterialIndent(indentId, remarks);
}
function approveMaterialIndent(indentId, approvedItems, remarks, actorName) {
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().approveMaterialIndent(indentId, approvedItems, remarks);
}
function createPurchaseOrder(indentId, poData, actorName) {
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().createPurchaseOrderFromIndent(indentId, poData, actorName);
}
function submitPurchaseOrder(poId, actorName) {
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().submitPurchaseOrder(poId, actorName);
}
function approvePurchaseOrder(poId, remarks, actorName) {
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().approvePurchaseOrder(poId, remarks, actorName);
}
function issuePurchaseOrder(poId, actorName) {
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().issuePurchaseOrder(poId, undefined, actorName);
}
function createGRN(poId, grnData, actorName) {
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().createGoodsReceipt(poId, grnData, actorName);
}
function approveGoodsReceiptNote(grnId) {
    let remarks = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'Approved by Finance Audit', actorName = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 'Finance';
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().approveGoodsReceiptNote(grnId, remarks, actorName);
}
function approveGRN(grnId, actorName) {
    approveGoodsReceiptNote(grnId, 'Approved by Finance Audit', actorName);
}
function submitMaterialRejection(data, actorName) {
    var _state_procurement;
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    const pos = safeClone(((_state_procurement = state.procurement) === null || _state_procurement === void 0 ? void 0 : _state_procurement.purchaseOrders) || []);
    const poIdx = pos.findIndex((p)=>p.id === data.poId);
    if (poIdx > -1) {
        const poItem = pos[poIdx].items.find((i)=>i.materialId === data.materialId);
        if (poItem) {
            if (data.rejectedQty > poItem.cumulativeAcceptedQty) {
                throw new Error("Cannot reject more than currently accepted");
            }
        }
    }
    // Move inventory to REJECTION_HOLD
    postInventoryTransaction(data.materialId, data.rejectedQty, 'RESERVE', "Rejection submitted for PO ".concat(data.poId));
    const newRej = {
        ...data,
        id: data.id || (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createId"])('REJ'),
        rejectionNumber: data.rejectionNumber || (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createHumanNo"])('REJ'),
        status: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].MATERIAL_REJECTION_SUBMITTED,
        replacementApprovedQty: 0,
        cumulativeReplacementDeliveredQty: 0,
        cumulativeReplacementAcceptedQty: 0,
        cumulativeReplacementRejectedQty: 0,
        commerciallySettledQty: 0,
        remainingResolutionQty: data.rejectedQty,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('MATERIAL_REJECTION', newRej.id, 'SUBMIT', null, newRej.status, actorName, 'Store');
    updateStoreState({
        ...getStoreState(),
        procurement: {
            ...getStoreState().procurement || {},
            purchaseOrders: pos
        },
        materialRejections: [
            newRej,
            ...rejections
        ],
        procurementAuditLogs: [
            audit,
            ...getStoreState().procurementAuditLogs || []
        ]
    });
}
function approveVendorReplacement(param) {
    let { rejectionId, approvedReplacementQty, expectedDeliveryDate, vendorAcknowledgementNumber, vendorRemarks, financeRemarks, defectiveMaterialDisposition, documentIds = [], actor } = param;
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    const idx = rejections.findIndex((r)=>r.id === rejectionId);
    if (idx === -1) throw new Error("Rejection not found");
    const rej = rejections[idx];
    if (approvedReplacementQty > rej.remainingResolutionQty) {
        throw new Error("Cannot approve more than remaining resolution quantity (".concat(rej.remainingResolutionQty, ")"));
    }
    const oldStatus = rej.status;
    rej.status = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].REPLACEMENT_EXPECTED;
    rej.replacementApprovedQty = approvedReplacementQty;
    rej.expectedDeliveryDate = expectedDeliveryDate;
    rej.vendorAcknowledgementNumber = vendorAcknowledgementNumber;
    rej.vendorRemarks = vendorRemarks;
    rej.financeRemarks = financeRemarks;
    rej.defectiveMaterialDisposition = defectiveMaterialDisposition;
    rej.documentIds = [
        ...rej.documentIds || [],
        ...documentIds
    ];
    rej.updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('MATERIAL_REJECTION', rej.id, 'APPROVE_REPLACEMENT', oldStatus, rej.status, actor, 'Finance');
    updateStoreState({
        ...state,
        materialRejections: rejections,
        procurementAuditLogs: [
            audit,
            ...state.procurementAuditLogs || []
        ]
    });
}
function createReplacementGRN(rejectionId, grnData, actorName) {
    var _state_procurement;
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    const grns = safeClone(((_state_procurement = state.procurement) === null || _state_procurement === void 0 ? void 0 : _state_procurement.goodsReceiptNotes) || []);
    const rejIdx = rejections.findIndex((r)=>r.id === rejectionId);
    if (rejIdx === -1) throw new Error("Rejection not found");
    const rej = rejections[rejIdx];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertTransition"])('MATERIAL_REJECTION', rej.status, [
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].REPLACEMENT_EXPECTED,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].PARTIALLY_RESOLVED
    ], 'Create Replacement GRN');
    const items = grnData.items || [];
    const totalDelivered = items.reduce((acc, item)=>acc + Number(item.deliveredQty || item.receivedQuantity || 0), 0);
    const totalAccepted = items.reduce((acc, item)=>acc + Number(item.acceptedQty || item.acceptedQuantity || 0), 0);
    const totalRejected = items.reduce((acc, item)=>acc + Number(item.rejectedQty || item.rejectedQuantity || 0), 0);
    const newGRN = {
        ...grnData,
        id: grnData.id || (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createId"])('GRN-REP'),
        grnNumber: grnData.grnNumber || (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createHumanNo"])('GRN-REP'),
        grnType: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GRN_TYPE"].REPLACEMENT,
        poId: rej.poId,
        originalGrnId: rej.grnId,
        materialRejectionId: rej.id,
        status: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GRN_STATUS"].SUBMITTED_FOR_FINANCE_AUDIT,
        commercialTreatment: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COMMERCIAL_TREATMENT"].ZERO_VALUE_REPLACEMENT,
        receivedQty: totalDelivered,
        acceptedQty: totalAccepted,
        rejectedQty: totalRejected,
        items: items.map((item)=>({
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
    newGRN.items.forEach((grnItem)=>{
        if (grnItem.deliveredQty > rej.replacementApprovedQty - rej.cumulativeReplacementDeliveredQty) {
            throw new Error("Cannot receive more than remaining scheduled replacement quantity");
        }
        if (grnItem.acceptedQty + grnItem.rejectedQty !== grnItem.deliveredQty) {
            throw new Error("Accepted + Rejected must equal Delivered");
        }
    });
    rej.cumulativeReplacementDeliveredQty += newGRN.items.reduce((acc, item)=>acc + item.deliveredQty, 0);
    rej.updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('GRN', newGRN.id, 'CREATE_REPLACEMENT_GRN', null, newGRN.status, actorName, 'Store');
    updateStoreState({
        ...state,
        procurement: {
            ...state.procurement || {},
            goodsReceiptNotes: [
                newGRN,
                ...grns
            ]
        },
        materialRejections: rejections,
        procurementAuditLogs: [
            audit,
            ...state.procurementAuditLogs || []
        ]
    });
}
function canClosePurchaseOrder(poId) {
    var _state_procurement, _state_procurement1;
    const state = getStoreState();
    const po = (((_state_procurement = state.procurement) === null || _state_procurement === void 0 ? void 0 : _state_procurement.purchaseOrders) || []).find((p)=>p.id === poId);
    if (!po) return {
        allowed: false,
        blockers: [
            'PO not found'
        ]
    };
    const blockers = [];
    po.items.forEach((item)=>{
        if (item.remainingSupplyQty > 0) {
            blockers.push("Item ".concat(item.materialName, " has ").concat(item.remainingSupplyQty, " remaining supply."));
        }
    });
    const grns = (((_state_procurement1 = state.procurement) === null || _state_procurement1 === void 0 ? void 0 : _state_procurement1.goodsReceiptNotes) || []).filter((g)=>g.poId === poId);
    grns.forEach((g)=>{
        if (g.status !== __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GRN_STATUS"].FINANCE_APPROVED && g.status !== __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GRN_STATUS"].FINANCE_REJECTED && g.status !== 'FINANCE_AUDIT_APPROVED') {
            blockers.push("GRN ".concat(g.grnNumber, " is not finalized (").concat(g.status, ")."));
        }
    });
    const rejections = (state.materialRejections || []).filter((r)=>r.poId === poId);
    rejections.forEach((r)=>{
        if (r.status !== __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].CLOSED) {
            blockers.push("Rejection ".concat(r.rejectionNumber, " is not closed."));
        }
    });
    return {
        allowed: blockers.length === 0,
        blockers
    };
}
function closePurchaseOrder(poId, remarks, actorName) {
    var _state_procurement;
    const state = getStoreState();
    const pos = safeClone(((_state_procurement = state.procurement) === null || _state_procurement === void 0 ? void 0 : _state_procurement.purchaseOrders) || []);
    const idx = pos.findIndex((p)=>p.id === poId);
    if (idx === -1) throw new Error("PO not found");
    const closureCheck = canClosePurchaseOrder(poId);
    if (!closureCheck.allowed) {
        throw new Error("Cannot close PO. Blockers: " + closureCheck.blockers.join(", "));
    }
    const oldStatus = pos[idx].status;
    pos[idx].status = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PO_STATUS"].PO_CLOSED;
    pos[idx].closureRemarks = remarks;
    pos[idx].updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('PURCHASE_ORDER', poId, 'CLOSE', oldStatus, pos[idx].status, actorName, 'Finance', remarks);
    updateStoreState({
        ...state,
        procurement: {
            ...state.procurement || {},
            purchaseOrders: pos
        },
        procurementAuditLogs: [
            audit,
            ...state.procurementAuditLogs || []
        ]
    });
}
function disposeRejectedStock(rejectionId, quantity, disposition, actorName) {
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    const idx = rejections.findIndex((r)=>r.id === rejectionId);
    if (idx === -1) throw new Error("Rejection not found");
    const rej = rejections[idx];
    postInventoryTransaction(rej.materialId, quantity, 'SUBTRACT', "Original rejected stock disposed via " + disposition);
    rej.originalStockDisposition = disposition;
    rej.updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('MATERIAL_REJECTION', rej.id, 'DISPOSE_ORIGINAL_STOCK', rej.status, rej.status, actorName, 'Finance', disposition);
    updateStoreState({
        ...getStoreState(),
        materialRejections: rejections,
        procurementAuditLogs: [
            audit,
            ...getStoreState().procurementAuditLogs || []
        ]
    });
}
function rejectStoreRejection(rejectionId, remarks, actorName, idempotencyKey) {
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    const logs = state.procurementAuditLogs || [];
    if (idempotencyKey && logs.some((l)=>{
        var _l_metadata;
        return ((_l_metadata = l.metadata) === null || _l_metadata === void 0 ? void 0 : _l_metadata.idempotencyKey) === idempotencyKey;
    })) return;
    const idx = rejections.findIndex((r)=>r.id === rejectionId);
    if (idx === -1) throw new Error("Rejection not found");
    const rej = rejections[idx];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertTransition"])('MATERIAL_REJECTION', rej.status, [
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].MATERIAL_REJECTION_SUBMITTED,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].FINANCE_VENDOR_DISCUSSION
    ], 'Reject Store Rejection');
    const rawInventory = safeClone(state.rawInventory || []);
    let item = rawInventory.find((i)=>i.id === rej.materialId || i.materialCode === rej.materialId);
    if (item) {
        item.reservedQty = (item.reservedQty || 0) - rej.rejectedQty;
        item.quantity += rej.rejectedQty;
        item.history.push({
            date: new Date().toISOString(),
            quantity: rej.rejectedQty,
            type: 'RESTORE_RESERVED',
            remarks: "Store Rejection ".concat(rej.rejectionNumber, " Rejected by Finance")
        });
        updateStoreState({
            ...state,
            rawInventory
        });
    }
    const oldStatus = rej.status;
    rej.status = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].REJECTED_BY_FINANCE;
    rej.financeRemarks = remarks;
    rej.remainingResolutionQty = 0;
    rej.resolutionType = "STORE_REJECTION_REVERSED";
    rej.closedAt = new Date().toISOString();
    rej.closedBy = actorName;
    rej.updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('MATERIAL_REJECTION', rej.id, 'REJECT_STORE_REJECTION', oldStatus, rej.status, actorName, 'Finance', remarks, {}, [], {
        idempotencyKey
    });
    updateStoreState({
        ...getStoreState(),
        materialRejections: rejections,
        procurementAuditLogs: [
            audit,
            ...getStoreState().procurementAuditLogs || []
        ]
    });
}
function raiseVendorDispute(rejectionId, remarks, actorName, idempotencyKey) {
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    if (idempotencyKey && (state.procurementAuditLogs || []).some((l)=>{
        var _l_metadata;
        return ((_l_metadata = l.metadata) === null || _l_metadata === void 0 ? void 0 : _l_metadata.idempotencyKey) === idempotencyKey;
    })) return;
    const idx = rejections.findIndex((r)=>r.id === rejectionId);
    if (idx === -1) throw new Error("Rejection not found");
    const rej = rejections[idx];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertTransition"])('MATERIAL_REJECTION', rej.status, [
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].MATERIAL_REJECTION_SUBMITTED,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].FINANCE_VENDOR_DISCUSSION
    ], 'Raise Vendor Dispute');
    const oldStatus = rej.status;
    rej.status = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].VENDOR_DISPUTE;
    rej.financeRemarks = remarks;
    rej.updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('MATERIAL_REJECTION', rej.id, 'RAISE_VENDOR_DISPUTE', oldStatus, rej.status, actorName, 'Finance', remarks, {}, [], {
        idempotencyKey
    });
    updateStoreState({
        ...state,
        materialRejections: rejections,
        procurementAuditLogs: [
            audit,
            ...state.procurementAuditLogs || []
        ]
    });
}
function processNoReplacement(rejectionId, resolutionType, remarks, actorName, idempotencyKey) {
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    if (idempotencyKey && (state.procurementAuditLogs || []).some((l)=>{
        var _l_metadata;
        return ((_l_metadata = l.metadata) === null || _l_metadata === void 0 ? void 0 : _l_metadata.idempotencyKey) === idempotencyKey;
    })) return;
    if (![
        'CREDIT_NOTE',
        'REFUND',
        'COMMERCIAL_DEDUCTION',
        'WRITE_OFF'
    ].includes(resolutionType)) {
        throw new Error("Invalid resolution type for No Replacement");
    }
    const idx = rejections.findIndex((r)=>r.id === rejectionId);
    if (idx === -1) throw new Error("Rejection not found");
    const rej = rejections[idx];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertTransition"])('MATERIAL_REJECTION', rej.status, [
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].MATERIAL_REJECTION_SUBMITTED,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].FINANCE_VENDOR_DISCUSSION,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].PARTIALLY_RESOLVED,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].VENDOR_DISPUTE
    ], 'Process No Replacement');
    const oldStatus = rej.status;
    rej.status = resolutionType === 'CREDIT_NOTE' ? __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].CREDIT_NOTE_PENDING : __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].NO_REPLACEMENT;
    rej.financeRemarks = remarks;
    rej.expectedResolutionType = resolutionType;
    rej.updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('MATERIAL_REJECTION', rej.id, 'PROCESS_NO_REPLACEMENT', oldStatus, rej.status, actorName, 'Finance', remarks, {}, [], {
        idempotencyKey,
        resolutionType
    });
    updateStoreState({
        ...state,
        materialRejections: rejections,
        procurementAuditLogs: [
            audit,
            ...state.procurementAuditLogs || []
        ]
    });
}
function recordCommercialAdjustment(rejectionId, settledQty, adjustmentDetails, actorName, idempotencyKey) {
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    if (idempotencyKey && (state.procurementAuditLogs || []).some((l)=>{
        var _l_metadata;
        return ((_l_metadata = l.metadata) === null || _l_metadata === void 0 ? void 0 : _l_metadata.idempotencyKey) === idempotencyKey;
    })) return;
    const idx = rejections.findIndex((r)=>r.id === rejectionId);
    if (idx === -1) throw new Error("Rejection not found");
    const rej = rejections[idx];
    if (settledQty > rej.remainingResolutionQty) {
        throw new Error("Cannot commercially settle more than the unresolved rejected quantity (".concat(rej.remainingResolutionQty, ")"));
    }
    const oldStatus = rej.status;
    rej.commerciallySettledQty = (rej.commerciallySettledQty || 0) + settledQty;
    rej.remainingResolutionQty = rej.rejectedQty - (rej.cumulativeReplacementAcceptedQty || 0) - rej.commerciallySettledQty;
    if (rej.remainingResolutionQty <= 0) {
        rej.status = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].COMMERCIAL_ADJUSTMENT_COMPLETED;
    }
    rej.financeRemarks = adjustmentDetails;
    rej.updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('MATERIAL_REJECTION', rej.id, 'RECORD_COMMERCIAL_ADJUSTMENT', oldStatus, rej.status, actorName, 'Finance', adjustmentDetails, {}, [], {
        idempotencyKey
    });
    updateStoreState({
        ...state,
        materialRejections: rejections,
        procurementAuditLogs: [
            audit,
            ...state.procurementAuditLogs || []
        ]
    });
}
function processWriteOff(rejectionId, writeOffQty, approvalMetadata, actorName, idempotencyKey) {
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    if (idempotencyKey && (state.procurementAuditLogs || []).some((l)=>{
        var _l_metadata;
        return ((_l_metadata = l.metadata) === null || _l_metadata === void 0 ? void 0 : _l_metadata.idempotencyKey) === idempotencyKey;
    })) return;
    if (!approvalMetadata || !approvalMetadata.approvedBy) {
        throw new Error("Approval metadata is required for write-off");
    }
    const idx = rejections.findIndex((r)=>r.id === rejectionId);
    if (idx === -1) throw new Error("Rejection not found");
    const rej = rejections[idx];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertTransition"])('MATERIAL_REJECTION', rej.status, [
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].MATERIAL_REJECTION_SUBMITTED,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].FINANCE_VENDOR_DISCUSSION,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].PARTIALLY_RESOLVED,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].VENDOR_DISPUTE,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].CREDIT_NOTE_PENDING,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].NO_REPLACEMENT
    ], 'Process Write Off');
    if (writeOffQty > rej.remainingResolutionQty) {
        throw new Error("Write-off quantity cannot exceed unresolved rejected quantity (".concat(rej.remainingResolutionQty, ")"));
    }
    const oldStatus = rej.status;
    rej.commerciallySettledQty = (rej.commerciallySettledQty || 0) + writeOffQty;
    rej.remainingResolutionQty = rej.rejectedQty - (rej.cumulativeReplacementAcceptedQty || 0) - rej.commerciallySettledQty;
    rej.status = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].WRITE_OFF_APPROVED;
    rej.financeRemarks = approvalMetadata.remarks || "Write-off approved";
    rej.updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('MATERIAL_REJECTION', rej.id, 'PROCESS_WRITE_OFF', oldStatus, rej.status, actorName, 'Finance', rej.financeRemarks, {}, [], {
        idempotencyKey,
        approvalMetadata
    });
    updateStoreState({
        ...state,
        materialRejections: rejections,
        procurementAuditLogs: [
            audit,
            ...state.procurementAuditLogs || []
        ]
    });
}
function canCloseMaterialRejection(rejectionId) {
    const state = getStoreState();
    const rej = (state.materialRejections || []).find((r)=>r.id === rejectionId);
    if (!rej) return {
        allowed: false,
        blockers: [
            'Rejection not found'
        ]
    };
    const blockers = [];
    if (rej.status === __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].CLOSED) {
        blockers.push('Rejection is already closed');
        return {
            allowed: false,
            blockers
        };
    }
    if (rej.remainingResolutionQty > 0) {
        blockers.push("Unresolved quantity remains: ".concat(rej.remainingResolutionQty));
    }
    if (!rej.originalStockDisposition && rej.status !== __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].REJECTED_BY_FINANCE) {
        blockers.push('Original rejected stock disposition is pending');
    }
    return {
        allowed: blockers.length === 0,
        blockers
    };
}
function closeMaterialRejection(rejectionId, actorName, idempotencyKey) {
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    if (idempotencyKey && (state.procurementAuditLogs || []).some((l)=>{
        var _l_metadata;
        return ((_l_metadata = l.metadata) === null || _l_metadata === void 0 ? void 0 : _l_metadata.idempotencyKey) === idempotencyKey;
    })) return;
    const idx = rejections.findIndex((r)=>r.id === rejectionId);
    if (idx === -1) throw new Error("Rejection not found");
    const closureCheck = canCloseMaterialRejection(rejectionId);
    if (!closureCheck.allowed) {
        throw new Error("Cannot close rejection: " + closureCheck.blockers.join(", "));
    }
    const rej = rejections[idx];
    const oldStatus = rej.status;
    rej.status = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].CLOSED;
    rej.updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('MATERIAL_REJECTION', rej.id, 'CLOSE', oldStatus, rej.status, actorName, 'Finance', '', {}, [], {
        idempotencyKey
    });
    updateStoreState({
        ...state,
        materialRejections: rejections,
        procurementAuditLogs: [
            audit,
            ...state.procurementAuditLogs || []
        ]
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/production.service.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeMaterialLines",
    ()=>normalizeMaterialLines,
    "productionService",
    ()=>productionService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/apiClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/constants.js [app-client] (ecmascript)");
;
;
const normalizeMaterialLines = function() {
    let request = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const source = Array.isArray(request.materials) ? request.materials : Array.isArray(request.items) ? request.items : request.materials && typeof request.materials === 'object' ? [
        request.materials
    ] : request.items && typeof request.items === 'object' ? [
        request.items
    ] : request.materialName || request.material || request.name ? [
        request
    ] : [];
    return source.map((material)=>{
        var _material_quantityRequested, _ref, _ref1, _ref2, _material_quantityApproved, _ref3, _ref4, _ref5, _ref6, _ref7;
        return {
            ...material,
            materialName: material.materialName || material.material || material.name || '',
            quantityRequested: Number((_ref2 = (_ref1 = (_ref = (_material_quantityRequested = material.quantityRequested) !== null && _material_quantityRequested !== void 0 ? _material_quantityRequested : material.requestedQty) !== null && _ref !== void 0 ? _ref : material.quantity) !== null && _ref1 !== void 0 ? _ref1 : material.qty) !== null && _ref2 !== void 0 ? _ref2 : 0),
            quantityApproved: Number((_ref7 = (_ref6 = (_ref5 = (_ref4 = (_ref3 = (_material_quantityApproved = material.quantityApproved) !== null && _material_quantityApproved !== void 0 ? _material_quantityApproved : material.approvedQty) !== null && _ref3 !== void 0 ? _ref3 : material.quantityRequested) !== null && _ref4 !== void 0 ? _ref4 : material.requestedQty) !== null && _ref5 !== void 0 ? _ref5 : material.quantity) !== null && _ref6 !== void 0 ? _ref6 : material.qty) !== null && _ref7 !== void 0 ? _ref7 : 0)
        };
    }).filter((material)=>material.materialName);
};
const productionService = {
    planOrder: async (state, order, targetDate, priority, dispatch, currentUser)=>{
        const payload = {
            sales_order_id: order.id,
            planned_start_date: new Date().toISOString().split('T')[0],
            planned_end_date: targetDate,
            status: __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS"].PLANNED,
            notes: "Plan generated from Sales Order ".concat(order.orderNo)
        };
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/production/plans', payload);
        return {
            success: true,
            planId: res.planId
        };
    },
    createWorkOrder: async (state, order, dispatch, currentUser)=>{
        const workOrderIds = order.work_order_ids || [];
        if (workOrderIds.length > 0) {
            // We have explicit work order IDs — activate each directly
            for (const woId of workOrderIds){
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/workflow/transition', {
                    entity: 'work_order',
                    entityId: woId,
                    transitionName: 'ACTIVATE_WORK_ORDER',
                    notes: "Activated from Production Portal for Order ".concat(order.orderNo)
                });
            }
            return {
                success: true
            };
        } else {
            // We only know the sales order ID — let the backend resolve the PLANNED work order
            const salesOrderId = order.id;
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/workflow/transition', {
                entity: 'work_order_by_sales_order',
                entityId: salesOrderId,
                transitionName: 'ACTIVATE_WORK_ORDER',
                notes: "Activated from Production Portal for Order ".concat(order.orderNo)
            });
            return {
                success: true
            };
        }
    },
    raiseMaterialRequest: async (state, workOrder, materials, dispatch, currentUser)=>{
        var _res_data;
        // Look up work order database ID
        const woDbId = workOrder.dbId || workOrder.id;
        const payload = {
            work_order_id: typeof woDbId === 'number' ? woDbId : null,
            materials: materials.map((m)=>({
                    materialName: m.material || m.materialName,
                    quantityRequested: Number(m.qty || m.quantityRequested || 0)
                }))
        };
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/production/material-requests', payload);
        return {
            success: true,
            requestId: ((_res_data = res.data) === null || _res_data === void 0 ? void 0 : _res_data.requestId) || res.requestId
        };
    },
    approveMaterialRequest: async (state, request, targetQtyOverrides, statusOrIsApproved, dispatch, currentUser)=>{
        const mrDbId = request.dbId || request.id;
        const statusVal = typeof statusOrIsApproved === 'string' ? statusOrIsApproved : statusOrIsApproved ? 'Approved' : 'Rejected';
        const payload = {
            status: statusVal,
            materials: normalizeMaterialLines(request).map((m)=>{
                const override = targetQtyOverrides ? targetQtyOverrides[m.materialName] : null;
                return {
                    materialName: m.materialName,
                    quantityApproved: override !== undefined && override !== null ? Number(override) : Number(m.quantityRequested)
                };
            })
        };
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].patch("/production/material-requests/".concat(mrDbId, "/status"), payload);
        return {
            success: true,
            data: res
        };
    },
    issueMaterial: async (state, request, department, dispatch, currentUser)=>{
        const mrDbId = request.dbId || request.id;
        const materials = normalizeMaterialLines(request);
        if (!mrDbId) throw new Error('Material request ID is required.');
        if (materials.length === 0) throw new Error('No valid materials were found in this request.');
        const payload = {
            department: department || 'Production',
            materialsIssued: materials.map((m)=>{
                var _m_quantityApproved, _ref;
                return {
                    materialName: m.materialName,
                    quantityIssued: Number((_ref = (_m_quantityApproved = m.quantityApproved) !== null && _m_quantityApproved !== void 0 ? _m_quantityApproved : m.quantityRequested) !== null && _ref !== void 0 ? _ref : 0)
                };
            })
        };
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post("/production/material-requests/".concat(mrDbId, "/issue"), payload);
        return {
            success: true,
            data: res
        };
    },
    startProduction: async (state, workOrder, machine, operator, shift, dispatch, currentUser)=>{
        const woDbId = workOrder.dbId || workOrder.id;
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/workflow/transition', {
            entity: 'work_order',
            entityId: woDbId,
            transitionName: 'START_PRODUCTION',
            payload: {
                machine,
                operator,
                shift
            },
            notes: "Started production on machine ".concat(machine, " by ").concat(operator, " during ").concat(shift)
        });
        return {
            success: true,
            data: res
        };
    },
    pauseProduction: async (state, workOrder, dispatch, currentUser)=>{
        const woDbId = workOrder.dbId || workOrder.id;
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/workflow/transition', {
            entity: 'work_order',
            entityId: woDbId,
            transitionName: 'PAUSE_PRODUCTION',
            payload: {},
            notes: 'Paused production'
        });
        return {
            success: true,
            data: res
        };
    },
    resumeProduction: async (state, workOrder, dispatch, currentUser)=>{
        const woDbId = workOrder.dbId || workOrder.id;
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/workflow/transition', {
            entity: 'work_order',
            entityId: woDbId,
            transitionName: 'RESUME_PRODUCTION',
            payload: {},
            notes: 'Resumed production'
        });
        return {
            success: true,
            data: res
        };
    },
    updateProductionProgress: async (state, workOrder, progress, stage, dispatch, currentUser)=>{
        const woDbId = workOrder.dbId;
        const status = progress === 100 ? 'Completed' : 'In Production';
        const notesObj = {
            stage: stage,
            reworkCount: workOrder.reworkCount || 0,
            qcHistory: workOrder.qcHistory || []
        };
        const payload = {
            quantity_produced: progress / 100 * workOrder.quantity,
            status: status,
            notes: JSON.stringify(notesObj)
        };
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].put("/production/work-orders/".concat(woDbId), payload);
        return {
            success: true,
            data: res
        };
    },
    completeProduction: async function(state, workOrder, dispatch, currentUser) {
        let payload = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : {};
        const woDbId = workOrder.dbId || workOrder.id;
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].patch("/production/work-orders/".concat(woDbId, "/complete"), payload);
        return {
            success: true,
            data: res
        };
    },
    submitQCInspection: async (state, order, workOrder, qcResults, isApproved, dispatch, currentUser)=>{
        const woDbId = workOrder.dbId || workOrder.id;
        // Construct defect history object
        const newInspection = {
            id: "QC-".concat(Date.now().toString().slice(-4)),
            date: new Date().toISOString().split('T')[0],
            inspector: (currentUser === null || currentUser === void 0 ? void 0 : currentUser.name) || 'QC Agent',
            result: isApproved ? 'Passed' : 'Failed',
            defects: qcResults.defects || []
        };
        const updatedQCHistory = [
            ...workOrder.qcHistory || [],
            newInspection
        ];
        // Create the inspection record in QC table
        const payload = {
            work_order_id: woDbId,
            overall_result: isApproved ? 'Pass' : 'Fail',
            defects: qcResults.defects || [],
            dimension_result: qcResults.dimension || 'Pass',
            weight_result: qcResults.weight || 'Pass',
            strength_result: qcResults.strength || 'Pass',
            surface_result: qcResults.surface || 'Pass',
            packaging_result: qcResults.packaging || 'Pass'
        };
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/production/qc', payload);
        // Trigger state-machine transition when possible. If the work order is already in a later QC state,
        // record the inspection and continue without blocking the user.
        const transitionName = isApproved ? 'QC_ACCEPT' : 'QC_REJECT';
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/workflow/transition', {
                entity: 'work_order',
                entityId: woDbId,
                transitionName,
                payload: {
                    qcHistory: updatedQCHistory
                },
                notes: isApproved ? 'Quality control check passed.' : 'Quality control check failed. Routing to Rework.'
            });
        } catch (err) {
            var _err_response_data, _err_response;
            const message = (err === null || err === void 0 ? void 0 : (_err_response = err.response) === null || _err_response === void 0 ? void 0 : (_err_response_data = _err_response.data) === null || _err_response_data === void 0 ? void 0 : _err_response_data.error) || (err === null || err === void 0 ? void 0 : err.message) || '';
            if (!message.includes('ILLEGAL_TRANSITION') && !message.includes('Illegal transition')) {
                throw err;
            }
        }
        return {
            success: true,
            qcId: res.qcId
        };
    },
    getQCInspections: async function() {
        let filters = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        const queryParams = new URLSearchParams(filters).toString();
        const suffix = queryParams ? "?".concat(queryParams) : '';
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/production/qc".concat(suffix));
        return res.data || res;
    },
    sendToReproduction: async (state, workOrder, dispatch, currentUser)=>{
        const woDbId = workOrder.dbId;
        const notesObj = {
            stage: 'Awaiting Re-conversion',
            reworkCount: (workOrder.reworkCount || 0) + 1,
            qcHistory: workOrder.qcHistory || []
        };
        const payload = {
            quantity_produced: 0,
            status: __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS"].REWORK,
            notes: JSON.stringify(notesObj)
        };
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].put("/production/work-orders/".concat(woDbId), payload);
        return {
            success: true,
            data: res
        };
    },
    rejectFailedWorkOrder: async (state, workOrder, dispatch, currentUser)=>{
        const woDbId = workOrder.dbId;
        const notesObj = {
            stage: 'Rejected',
            reworkCount: workOrder.reworkCount || 0,
            qcHistory: workOrder.qcHistory || []
        };
        const payload = {
            status: 'Cancelled',
            notes: JSON.stringify(notesObj)
        };
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].put("/production/work-orders/".concat(woDbId), payload);
        return {
            success: true,
            data: res
        };
    },
    updateReproduction: async (state, reproductionId, fields, dispatch, currentUser)=>{
        return {
            success: true
        };
    },
    getDashboardStats: async ()=>{
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get('/production/dashboard-stats');
        return res.data || res;
    },
    getProductionEntries: async function() {
        let filters = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        const queryParams = new URLSearchParams(filters).toString();
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/production/production?".concat(queryParams));
        return res.data || res;
    },
    createProductionEntry: async (payload)=>{
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/production/production', payload);
        return res.data || res;
    },
    getTestingEntries: async function() {
        let filters = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        const queryParams = new URLSearchParams(filters).toString();
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/production/testing?".concat(queryParams));
        return res.data || res;
    },
    getTestingEntryById: async (id)=>{
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/production/testing/".concat(id));
        return res.data || res;
    },
    updateTestingEntry: async (id, payload)=>{
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].put("/production/testing/".concat(id), payload);
        return res.data || res;
    },
    approveTestingEntry: async (id, payload)=>{
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post("/production/testing/".concat(id, "/approve"), payload);
        return res.data || res;
    },
    deleteTestingEntry: async (id)=>{
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].delete("/production/testing/".concat(id));
        return res.data || res;
    },
    getRejectionEntries: async function() {
        let filters = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        const queryParams = new URLSearchParams(filters).toString();
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/production/rejection?".concat(queryParams));
        return res.data || res;
    },
    createRejectionEntry: async (payload)=>{
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/production/rejection', payload);
        return res.data || res;
    },
    executeRejectionAction: async (id, payload)=>{
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post("/production/rejection/".concat(id, "/action"), payload);
        return res.data || res;
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/product.service.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Product Service — Frontend API layer.
 * All mutations go to the backend; state is synced via ERPContext.syncData().
 */ __turbopack_context__.s([
    "productService",
    ()=>productService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/apiClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/engine/utils/errors.js [app-client] (ecmascript)");
;
;
const productService = {
    /**
   * Add a new product to the catalog
   */ addProduct: async (productData)=>{
        try {
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/purchase/products', productData);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(result);
        } catch (err) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPError"])(err.message, 'API_ERROR');
        }
    },
    /**
   * Update an existing product's details
   */ updateProduct: async (productId, productData)=>{
        try {
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].put("/purchase/products/".concat(productId), productData);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(result);
        } catch (err) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPError"])(err.message, 'API_ERROR');
        }
    },
    /**
   * Delete a single product
   */ deleteProduct: async (productId)=>{
        try {
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].delete("/purchase/products/".concat(productId));
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(result);
        } catch (err) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPError"])(err.message, 'API_ERROR');
        }
    },
    /**
   * Delete multiple products in bulk
   */ deleteProducts: async (productIds)=>{
        try {
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/purchase/products/bulk-delete', {
                ids: productIds
            });
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(result);
        } catch (err) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPError"])(err.message, 'API_ERROR');
        }
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/export.service.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "exportAgingReportPDF",
    ()=>exportAgingReportPDF,
    "exportExecutiveReportPDF",
    ()=>exportExecutiveReportPDF,
    "exportFinanceReportPDF",
    ()=>exportFinanceReportPDF,
    "exportInventoryReportPDF",
    ()=>exportInventoryReportPDF,
    "exportInvoicePDF",
    ()=>exportInvoicePDF,
    "exportQuotationPDF",
    ()=>exportQuotationPDF,
    "exportSalesReportPDF",
    ()=>exportSalesReportPDF,
    "exportToCSV",
    ()=>exportToCSV,
    "exportToPDF",
    ()=>exportToPDF
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf/dist/jspdf.es.min.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/apiClient.js [app-client] (ecmascript)");
;
;
;
const exportToPDF = function() {
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const { title = 'Report', subtitle = '', columns = [], rows = [], orientation = 'landscape', filename = 'report.pdf' } = options;
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]({
        orientation,
        unit: 'mm',
        format: 'a4'
    });
    // Page width for calculations
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 20;
    // Title
    doc.setFontSize(18);
    doc.text(title, pageWidth / 2, y, {
        align: 'center'
    });
    y += 10;
    // Subtitle / generated date
    doc.setFontSize(10);
    doc.text(subtitle || "Generated: ".concat(new Date().toLocaleString()), pageWidth / 2, y, {
        align: 'center'
    });
    y += 10;
    // Horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    // Table
    if (columns.length > 0 && rows.length > 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(doc, {
            head: [
                columns
            ],
            body: rows,
            startY: y,
            theme: 'striped',
            styles: {
                fontSize: 9,
                cellPadding: 2.5,
                overflow: 'linebreak'
            },
            headStyles: {
                fillColor: [
                    79,
                    70,
                    229
                ],
                textColor: [
                    255,
                    255,
                    255
                ],
                fontSize: 10,
                fontStyle: 'bold'
            },
            margin: {
                left: margin,
                right: margin
            }
        });
    }
    // Footer with page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for(let i = 1; i <= totalPages; i++){
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Page ".concat(i, " of ").concat(totalPages), pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
            align: 'center'
        });
        doc.setTextColor(0, 0, 0);
    }
    // Save PDF
    doc.save(filename);
};
const exportToCSV = function(data) {
    let filename = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'report.csv';
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map((row)=>headers.map((header)=>{
                const value = row[header] !== null && row[header] !== undefined ? row[header] : '';
                // Escape quotes and handle newlines/commas
                const stringified = typeof value === 'object' ? JSON.stringify(value) : String(value);
                const escaped = stringified.replace(/"/g, '""');
                return '"'.concat(escaped, '"');
            }).join(','))
    ];
    const csv = csvRows.join('\n');
    const blob = new Blob([
        '\uFEFF' + csv
    ], {
        type: 'text/csv;charset=utf-8'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
const exportSalesReportPDF = async function() {
    let filters = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const params = new URLSearchParams();
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.customer_id) params.append('customer_id', filters.customer_id);
    const paramStr = params.toString();
    const path = paramStr ? "/reports/sales/summary?".concat(paramStr) : '/reports/sales/summary';
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get(path);
    const data = response.data;
    if (!data || data.length === 0) {
        throw new Error('No sales data available to export');
    }
    const columns = [
        'Month',
        'Orders',
        'Unique Customers',
        'Total Revenue',
        'Avg Order Value',
        'Closed Revenue'
    ];
    const rows = data.map((item)=>[
            item.month,
            item.order_count,
            item.unique_customers,
            "INR ".concat(parseFloat(item.total_revenue || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })),
            "INR ".concat(parseFloat(item.avg_order_value || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })),
            "INR ".concat(parseFloat(item.closed_revenue || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }))
        ]);
    exportToPDF({
        title: 'Sales Summary Report',
        subtitle: "Period: ".concat(filters.date_from || 'Start', " to ").concat(filters.date_to || 'Today'),
        columns,
        rows,
        orientation: 'landscape',
        filename: "sales-report-".concat(new Date().toISOString().split('T')[0], ".pdf")
    });
};
const exportFinanceReportPDF = async function() {
    let filters = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const params = new URLSearchParams();
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    const paramStr = params.toString();
    const path = paramStr ? "/reports/finance/revenue-expense?".concat(paramStr) : '/reports/finance/revenue-expense';
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get(path);
    const data = response.data;
    if (!data || !data.summary || data.summary.length === 0) {
        throw new Error('No finance data available to export');
    }
    const columns = [
        'Month',
        'Revenue (Invoiced)',
        'Collected (Paid Invoices)',
        'Expenses (PO Received)',
        'Profit / Deficit'
    ];
    const rows = data.summary.map((item)=>[
            item.month,
            "INR ".concat(parseFloat(item.revenue || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })),
            "INR ".concat(parseFloat(item.collected || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })),
            "INR ".concat(parseFloat(item.expenses || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })),
            "INR ".concat(parseFloat(item.profit || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }))
        ]);
    exportToPDF({
        title: 'Finance Revenue vs Expenses Report',
        subtitle: "Period: ".concat(filters.date_from || 'Start', " to ").concat(filters.date_to || 'Today'),
        columns,
        rows,
        orientation: 'landscape',
        filename: "finance-report-".concat(new Date().toISOString().split('T')[0], ".pdf")
    });
};
const exportInventoryReportPDF = async function() {
    let filters = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const params = new URLSearchParams();
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    const paramStr = params.toString();
    const path = paramStr ? "/reports/inventory/stock-levels?".concat(paramStr) : '/reports/inventory/stock-levels';
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get(path);
    const data = response.data;
    if (!data || data.length === 0) {
        throw new Error('No inventory data available to export');
    }
    const columns = [
        'Product Name',
        'Product Code',
        'Category',
        'Type',
        'Stock On Hand',
        'UoM',
        'Min Stock',
        'Max Stock',
        'Status'
    ];
    const rows = data.map((item)=>[
            item.product_name,
            item.product_code,
            item.category_name || 'N/A',
            item.type || 'N/A',
            parseFloat(item.on_hand_balance || 0).toLocaleString(),
            item.unit_of_measure,
            parseFloat(item.min_stock_level || 0).toLocaleString(),
            parseFloat(item.max_stock_level || 0).toLocaleString(),
            item.stock_status
        ]);
    exportToPDF({
        title: 'Inventory Stock Levels Report',
        subtitle: "Generated: ".concat(new Date().toLocaleString()),
        columns,
        rows,
        orientation: 'landscape',
        filename: "inventory-report-".concat(new Date().toISOString().split('T')[0], ".pdf")
    });
};
const exportAgingReportPDF = async ()=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get('/reports/finance/aging');
    const { data } = response;
    if (!data || !data.details || data.details.length === 0) {
        throw new Error('No aging data available to export');
    }
    // Summary table
    const summaryColumns = [
        'Aging Bucket',
        'Balance Due',
        'Invoice Count'
    ];
    const summaryRows = Object.entries(data.summary).map((param)=>{
        let [bucket, values] = param;
        return [
            bucket,
            "INR ".concat(values.total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })),
            values.count
        ];
    });
    // Generate combined report
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    // Title
    doc.setFontSize(18);
    doc.text('Accounts Receivable Aging Report', pageWidth / 2, y, {
        align: 'center'
    });
    y += 10;
    doc.setFontSize(10);
    doc.text("Generated: ".concat(new Date().toLocaleString()), pageWidth / 2, y, {
        align: 'center'
    });
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 10;
    // Summary
    doc.setFontSize(14);
    doc.text('AR Summary', 14, y);
    y += 5;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(doc, {
        head: [
            summaryColumns
        ],
        body: summaryRows,
        startY: y,
        theme: 'striped',
        styles: {
            fontSize: 9
        },
        headStyles: {
            fillColor: [
                79,
                70,
                229
            ],
            textColor: [
                255,
                255,
                255
            ]
        }
    });
    y = doc.lastAutoTable.finalY + 15;
    // Detailed table
    doc.setFontSize(14);
    doc.text('Detailed Invoice Aging', 14, y);
    y += 5;
    const detailColumns = [
        'Customer Name',
        'Invoice #',
        'Invoice Date',
        'Due Date',
        'Overdue Days',
        'Balance Due',
        'Bucket'
    ];
    const detailRows = data.details.map((item)=>[
            item.customer_name,
            item.invoice_number,
            new Date(item.invoice_date).toLocaleDateString(),
            new Date(item.due_date).toLocaleDateString(),
            item.days_overdue > 0 ? "".concat(item.days_overdue, " days") : '0 days',
            "INR ".concat(parseFloat(item.balance_due || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })),
            item.aging_bucket
        ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(doc, {
        head: [
            detailColumns
        ],
        body: detailRows,
        startY: y,
        theme: 'striped',
        styles: {
            fontSize: 8
        },
        headStyles: {
            fillColor: [
                79,
                70,
                229
            ],
            textColor: [
                255,
                255,
                255
            ]
        }
    });
    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for(let i = 1; i <= totalPages; i++){
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Page ".concat(i, " of ").concat(totalPages), pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
            align: 'center'
        });
        doc.setTextColor(0, 0, 0);
    }
    doc.save("aging-report-".concat(new Date().toISOString().split('T')[0], ".pdf"));
};
const exportInvoicePDF = async (invoiceId)=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/finance/invoices/".concat(invoiceId));
    const invoice = response.data;
    if (!invoice) {
        throw new Error('Invoice not found');
    }
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    // Company header
    doc.setFontSize(24);
    doc.setTextColor(79, 70, 229);
    doc.text('INVOICE', pageWidth - 14, y, {
        align: 'right'
    });
    doc.setTextColor(0, 0, 0);
    // Invoice details
    y += 10;
    doc.setFontSize(10);
    doc.text("Invoice #: ".concat(invoice.invoice_number), 14, y);
    doc.text("Date: ".concat(invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'N/A'), 14, y + 6);
    doc.text("Due Date: ".concat(invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'), 14, y + 12);
    y += 20;
    // Customer info
    doc.setFontSize(12);
    doc.text('Bill To:', 14, y);
    doc.setFontSize(10);
    doc.text(invoice.customer_name || 'N/A', 14, y + 6);
    doc.text("GST: ".concat(invoice.customer_gstin || 'N/A'), 14, y + 12);
    y += 20;
    // Items table
    const items = invoice.items || [];
    const tableData = items.map((item)=>[
            item.product_name || 'N/A',
            item.product_code || '',
            item.quantity || 0,
            "INR ".concat(parseFloat(item.unit_price || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })),
            "INR ".concat(parseFloat(item.total_price || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }))
        ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(doc, {
        head: [
            [
                'Product',
                'Code',
                'Qty',
                'Unit Price',
                'Total'
            ]
        ],
        body: tableData,
        startY: y,
        theme: 'striped',
        styles: {
            fontSize: 9,
            cellPadding: 3
        },
        headStyles: {
            fillColor: [
                79,
                70,
                229
            ],
            textColor: [
                255,
                255,
                255
            ]
        },
        margin: {
            left: 14,
            right: 14
        }
    });
    y = doc.lastAutoTable.finalY + 15;
    // Totals
    doc.setFontSize(11);
    const labelX = 140;
    doc.text("Subtotal:", labelX, y);
    doc.text("INR ".concat(parseFloat(invoice.subtotal || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })), pageWidth - 14, y, {
        align: 'right'
    });
    y += 6;
    doc.text("Discount:", labelX, y);
    doc.text("INR ".concat(parseFloat(invoice.discount_total || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })), pageWidth - 14, y, {
        align: 'right'
    });
    y += 6;
    doc.text("Tax (GST):", labelX, y);
    doc.text("INR ".concat(parseFloat(invoice.tax_total || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })), pageWidth - 14, y, {
        align: 'right'
    });
    y += 8;
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text("Grand Total:", labelX, y);
    doc.text("INR ".concat(parseFloat(invoice.grand_total || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })), pageWidth - 14, y, {
        align: 'right'
    });
    doc.setTextColor(0, 0, 0);
    y += 10;
    // Status badge
    const statusColors = {
        Paid: [
            34,
            197,
            94
        ],
        Overdue: [
            239,
            68,
            68
        ],
        Draft: [
            59,
            130,
            246
        ],
        Sent: [
            59,
            130,
            246
        ],
        'Partially Paid': [
            234,
            179,
            8
        ]
    };
    const color = statusColors[invoice.status] || [
        100,
        100,
        100
    ];
    doc.setFontSize(10);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text("Status: ".concat(invoice.status), 14, y);
    doc.setTextColor(0, 0, 0);
    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for(let i = 1; i <= totalPages; i++){
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Page ".concat(i, " of ").concat(totalPages), pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
            align: 'center'
        });
        doc.setTextColor(0, 0, 0);
    }
    doc.save("invoice-".concat(invoice.invoice_number, ".pdf"));
};
const exportExecutiveReportPDF = (reportData, dateRangeLabel)=>{
    const { summary, recommendations, metrics } = reportData;
    const { production, dispatch, store, qc, financial, categories = [], materials = [] } = metrics;
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 18;
    // Colors
    const primaryTeal = [
        51,
        122,
        134
    ]; // #337a86
    const darkSlate = [
        30,
        41,
        59
    ]; // #1e293b
    const lightGray = [
        248,
        250,
        252
    ]; // #f8fafc
    const borderGray = [
        226,
        232,
        240
    ]; // #e2e8f0
    // Status Colors
    const greenColor = [
        34,
        197,
        94
    ]; // #22c55e
    const amberColor = [
        245,
        158,
        11
    ]; // #f59e0b
    const redColor = [
        239,
        68,
        68
    ]; // #ef4444
    const blueColor = [
        59,
        130,
        246
    ]; // #3b82f6
    // Helper to draw header
    const drawPageHeader = (title)=>{
        // Top Brand Bar
        doc.setFillColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
        doc.rect(0, 0, pageWidth, 5, 'F');
        // Title
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
        doc.text('HIMALAYA PRECAST FACTORY COMMAND CENTER', margin, 12);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(dateRangeLabel || "Period: Current", pageWidth - margin, 12, {
            align: 'right'
        });
        // Thin separator line
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.setLineWidth(0.3);
        doc.line(margin, 14, pageWidth - margin, 14);
    };
    // ─── PAGE 1: COVER & EXECUTIVE SUMMARY ───
    drawPageHeader();
    y = 22;
    // Main Report Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('EXECUTIVE FACTORY REPORT', margin, y);
    y += 7;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text('A comprehensive performance, quality, and material analytics summary.', margin, y);
    y += 12;
    // Executive Summary Section
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
    doc.text('I. FACTORY EXECUTIVE SUMMARY', margin, y);
    y += 5;
    // Summary box background
    const summaryLines = doc.splitTextToSize(summary || '', pageWidth - margin * 2 - 10);
    const boxHeight = summaryLines.length * 5 + 8;
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(margin, y, pageWidth - margin * 2, boxHeight, 'F');
    // Left thick accent border
    doc.setFillColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
    doc.rect(margin, y, 1.5, boxHeight, 'F');
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(summaryLines, margin + 5, y + 6);
    y += boxHeight + 12;
    // II. KEY PERFORMANCE INDICATORS (KPIs)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
    doc.text('II. OPERATIONAL KEY PERFORMANCE INDICATORS', margin, y);
    y += 6;
    // Draw 2x3 KPI Grid
    const cardW = (pageWidth - margin * 2 - 10) / 3;
    const cardH = 22;
    const drawKPICard = (col, row, title, value, color)=>{
        const cardX = margin + col * (cardW + 5);
        const cardY = y + row * (cardH + 4);
        // Card background
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.rect(cardX, cardY, cardW, cardH, 'F');
        // Left indicator line
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(cardX, cardY, 1.5, cardH, 'F');
        // Text
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(120, 120, 120);
        doc.text(title.toUpperCase(), cardX + 4, cardY + 5.5);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(String(value), cardX + 4, cardY + 12);
    };
    // Row 0
    drawKPICard(0, 0, 'Production Efficiency', "".concat(production.efficiency, "%"), greenColor);
    drawKPICard(1, 0, 'Completed Orders', "".concat(production.completedToday, " WO"), blueColor);
    drawKPICard(2, 0, 'Work Orders Delayed', "".concat(production.delayed, " WO"), redColor);
    // Row 1
    drawKPICard(0, 1, 'QC Pass Rate', "".concat(qc.passRate, "%"), greenColor);
    drawKPICard(1, 1, 'Rejection Rate', "".concat(qc.rejectionRate, "%"), redColor);
    drawKPICard(2, 1, 'Dispatched Today', "".concat(dispatch.dispatchedToday, " Runs"), blueColor);
    // Row 2
    drawKPICard(0, 2, 'Total Inventory Value', "INR ".concat((store.totalValue / 100000).toFixed(1), " L"), blueColor);
    drawKPICard(1, 2, 'Low Stock Items', "".concat(store.lowStockItems, " Items"), amberColor);
    drawKPICard(2, 2, 'Production Cost', "INR ".concat((financial.productionCostToday / 1000).toFixed(0), "K"), darkSlate);
    y += (cardH + 4) * 3 + 12;
    // Live Factory Pipeline Status
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('LIVE FACTORY PIPELINE STAGE COUNTS', margin, y);
    y += 5;
    const pipeline = metrics.pipeline || {};
    const pipeStages = [
        {
            label: 'Sales Orders',
            count: pipeline.salesOrders || 0
        },
        {
            label: 'Planning',
            count: pipeline.planning || 0
        },
        {
            label: 'Store Request',
            count: pipeline.store || 0
        },
        {
            label: 'Production',
            count: pipeline.production || 0
        },
        {
            label: 'Quality Control',
            count: pipeline.qc || 0
        },
        {
            label: 'Dispatch Dept',
            count: pipeline.dispatch || 0
        },
        {
            label: 'Delivered',
            count: pipeline.delivered || 0
        }
    ];
    const pipeW = (pageWidth - margin * 2 - 12) / 7;
    pipeStages.forEach((stage, idx)=>{
        const px = margin + idx * (pipeW + 2);
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.rect(px, y, pipeW, 14, 'F');
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 100, 100);
        doc.text(doc.splitTextToSize(stage.label, pipeW - 2), px + 2, y + 4.5);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
        doc.text(String(stage.count), px + 2, y + 11.5);
    });
    // ─── PAGE 2: DETAILED DATA TABLES ───
    doc.addPage();
    drawPageHeader();
    y = 22;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
    doc.text('III. PRODUCT CATEGORY-WISE PRODUCTION', margin, y);
    y += 5;
    const catHeaders = [
        'Category',
        'Orders',
        'Qty Produced',
        'Est. Weight',
        'Production Cost',
        'Rejected Qty',
        'Dispatched',
        'Pending'
    ];
    const catRows = categories.map((c)=>[
            c.category,
            c.orders,
            c.qty,
            c.weight + ' Ton',
            "INR ".concat((c.cost || 0).toLocaleString()),
            c.rejected || 0,
            c.dispatched || 0,
            c.pending || 0
        ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(doc, {
        head: [
            catHeaders
        ],
        body: catRows,
        startY: y,
        theme: 'striped',
        styles: {
            fontSize: 8,
            cellPadding: 2.5
        },
        headStyles: {
            fillColor: primaryTeal,
            textColor: [
                255,
                255,
                255
            ],
            fontStyle: 'bold'
        },
        margin: {
            left: margin,
            right: margin
        }
    });
    y = doc.lastAutoTable.finalY + 12;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
    doc.text('IV. RAW MATERIAL CONSUMPTION & WASTAGE', margin, y);
    y += 5;
    const matHeaders = [
        'Raw Material',
        'Consumed Qty',
        'Unit',
        'Total Cost',
        'Wastage / Returns'
    ];
    const matRows = materials.map((m)=>{
        let waste = 'N/A';
        if (m.material === 'Cement') waste = '1.2 Tons';
        else if (m.material === 'Steel (Rebars)') waste = '0.4 Tons';
        else if (m.material === 'Sand') waste = '2.5 Tons';
        return [
            m.material,
            m.consumed,
            m.unit || 'Kg',
            m.cost || 'N/A',
            waste
        ];
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(doc, {
        head: [
            matHeaders
        ],
        body: matRows,
        startY: y,
        theme: 'striped',
        styles: {
            fontSize: 8,
            cellPadding: 2.5
        },
        headStyles: {
            fillColor: primaryTeal,
            textColor: [
                255,
                255,
                255
            ],
            fontStyle: 'bold'
        },
        margin: {
            left: margin,
            right: margin
        }
    });
    // ─── PAGE 3: RECOMMENDATIONS & SIGNATURES ───
    doc.addPage();
    drawPageHeader();
    y = 22;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
    doc.text('V. AI RECOMMENDATIONS & OPERATIONS FORECAST', margin, y);
    y += 7;
    // Recommendations loop
    recommendations.forEach((rec, idx)=>{
        const rx = margin;
        const ry = y;
        // Bullet icon
        doc.setFillColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
        doc.rect(rx, ry + 1, 2.5, 2.5, 'F');
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        const recLines = doc.splitTextToSize(rec, pageWidth - margin * 2 - 8);
        doc.text(recLines, rx + 6, ry + 3);
        y += recLines.length * 4.5 + 4;
    });
    y += 20;
    // Department Summaries
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('VI. DEPARTMENT SIGN-OFF', margin, y);
    y += 6;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('This document has been compiled from live database transactions and verified by the Plant Head.', margin, y);
    y += 35;
    // Signatures Grid
    const sigW = (pageWidth - margin * 2 - 20) / 2;
    // Left Line
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + sigW, y);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('Dr. Vivek Joshi', margin, y + 5);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 120);
    doc.text('Plant Head, Himalaya Precast', margin, y + 9);
    // Right Line
    doc.line(pageWidth - margin - sigW, y, pageWidth - margin, y);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('General Manager', pageWidth - margin - sigW, y + 5);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 120);
    doc.text('Himalaya ERP operations', pageWidth - margin - sigW, y + 9);
    // Footer for all pages
    const totalReportPages = doc.internal.getNumberOfPages();
    for(let i = 1; i <= totalReportPages; i++){
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Page ".concat(i, " of ").concat(totalReportPages), pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
            align: 'center'
        });
        doc.setTextColor(0, 0, 0);
    }
    doc.save("executive-report-".concat(new Date().toISOString().split('T')[0], ".pdf"));
};
const exportQuotationPDF = (quotation)=>{
    if (!quotation) {
        throw new Error('Quotation not provided');
    }
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$es$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    // Company header
    doc.setFontSize(24);
    doc.setTextColor(15, 23, 42);
    doc.text('QUOTATION', pageWidth - 14, y, {
        align: 'right'
    });
    doc.setFontSize(10);
    doc.text('HIMALAYA PRODUCTS', 14, y);
    doc.setTextColor(100, 116, 139);
    doc.text('Concrete & Aggregate Supply', 14, y + 5);
    doc.setTextColor(0, 0, 0);
    // Details
    y += 20;
    doc.setFontSize(10);
    doc.text("Ref No: ".concat(quotation.quotationNo || 'N/A'), pageWidth - 14, y, {
        align: 'right'
    });
    doc.text("Date: ".concat(quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : 'N/A'), pageWidth - 14, y + 6, {
        align: 'right'
    });
    y += 15;
    // Customer info
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('QUOTED TO:', 14, y);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(quotation.customerName || 'N/A', 14, y + 6);
    y += 20;
    // Items table
    let subtotal = 0;
    let taxTotal = 0;
    const items = Array.isArray(quotation.detailedItems) ? quotation.detailedItems : Array.isArray(quotation.items) ? quotation.items : [
        {
            productName: typeof quotation.items === 'string' ? quotation.items : quotation.product || 'Product Name',
            quantity: quotation.quantity || 1,
            unitPrice: quotation.price || (quotation.amount ? quotation.amount / (quotation.quantity || 1) : 0),
            tax: quotation.tax !== undefined ? quotation.tax : 18
        }
    ];
    const tableData = items.map((item)=>{
        const qty = item.quantity || 1;
        const price = item.unitPrice || 0;
        const itemSub = qty * price;
        const taxValue = itemSub * (item.tax !== undefined ? item.tax : 18) / 100;
        const itemTotal = itemSub + taxValue;
        subtotal += itemSub;
        taxTotal += taxValue;
        return [
            item.productName || 'N/A',
            qty,
            "INR ".concat(parseFloat(price).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })),
            "".concat(item.tax !== undefined ? item.tax : 18, "%"),
            "INR ".concat(parseFloat(itemTotal).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }))
        ];
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(doc, {
        head: [
            [
                'Product Details',
                'Qty',
                'Rate',
                'Tax (GST)',
                'Total'
            ]
        ],
        body: tableData,
        startY: y,
        theme: 'striped',
        styles: {
            fontSize: 9,
            cellPadding: 3
        },
        headStyles: {
            fillColor: [
                241,
                245,
                249
            ],
            textColor: [
                71,
                85,
                105
            ],
            fontStyle: 'bold'
        },
        margin: {
            left: 14,
            right: 14
        }
    });
    y = doc.lastAutoTable.finalY + 15;
    const transport = quotation.transportCharge || 0;
    const grandTotal = subtotal + taxTotal + transport;
    // Totals
    doc.setFontSize(10);
    const labelX = 140;
    doc.text("Items Subtotal:", labelX, y);
    doc.text("INR ".concat(parseFloat(subtotal).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })), pageWidth - 14, y, {
        align: 'right'
    });
    y += 6;
    doc.text("GST Amount:", labelX, y);
    doc.text("INR ".concat(parseFloat(taxTotal).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })), pageWidth - 14, y, {
        align: 'right'
    });
    y += 6;
    if (transport > 0) {
        doc.text("Transport (Approx.):", labelX, y);
        doc.text("INR ".concat(parseFloat(transport).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })), pageWidth - 14, y, {
            align: 'right'
        });
        y += 6;
    }
    y += 4;
    doc.setFontSize(12);
    doc.text("Grand Total:", labelX, y);
    doc.text("INR ".concat(parseFloat(grandTotal).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })), pageWidth - 14, y, {
        align: 'right'
    });
    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for(let i = 1; i <= totalPages; i++){
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Page ".concat(i, " of ").concat(totalPages), pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
            align: 'center'
        });
    }
    doc.save("Quotation_".concat(quotation.quotationNo || 'Draft', ".pdf"));
    return true;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/engine/utils/errors.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ERPError",
    ()=>ERPError,
    "ERPSuccess",
    ()=>ERPSuccess
]);
const ERPError = function(message) {
    let code = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'INTERNAL_ERROR', meta = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    return {
        success: false,
        error: {
            code,
            message,
            meta
        }
    };
};
_c = ERPError;
const ERPSuccess = function() {
    let data = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null, meta = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return {
        success: true,
        data,
        meta
    };
};
_c1 = ERPSuccess;
var _c, _c1;
__turbopack_context__.k.register(_c, "ERPError");
__turbopack_context__.k.register(_c1, "ERPSuccess");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/constants/production.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ──────────────────────────────────────────────────────────
// Himalaya ERP — Canonical Production Constants & Helpers
// ──────────────────────────────────────────────────────────
__turbopack_context__.s([
    "MATERIAL_REQUEST_STATUS",
    ()=>MATERIAL_REQUEST_STATUS,
    "WORK_ORDER_STATUS",
    ()=>WORK_ORDER_STATUS,
    "assertProductionTransition",
    ()=>assertProductionTransition
]);
const WORK_ORDER_STATUS = {
    PRODUCTION_PLANNED: 'PRODUCTION_PLANNED',
    MATERIAL_PENDING: 'MATERIAL_PENDING',
    READY_FOR_PRODUCTION: 'READY_FOR_PRODUCTION',
    PRODUCTION_STARTED: 'PRODUCTION_STARTED',
    PRODUCTION_IN_PROGRESS: 'PRODUCTION_IN_PROGRESS',
    PRODUCTION_PAUSED: 'PRODUCTION_PAUSED',
    PARTIALLY_COMPLETED: 'PARTIALLY_COMPLETED',
    PRODUCTION_COMPLETED: 'PRODUCTION_COMPLETED'
};
const MATERIAL_REQUEST_STATUS = {
    PENDING_PLANT_HEAD_APPROVAL: 'PENDING_PLANT_HEAD_APPROVAL',
    PLANT_HEAD_APPROVED: 'PLANT_HEAD_APPROVED',
    PLANT_HEAD_REJECTED: 'PLANT_HEAD_REJECTED',
    STORE_APPROVED: 'STORE_APPROVED',
    STORE_REJECTED: 'STORE_REJECTED',
    ISSUED: 'ISSUED'
};
function assertProductionTransition(entityType, currentStatus, nextStatus) {
    if (entityType === 'WORK_ORDER') {
        if (nextStatus === WORK_ORDER_STATUS.PRODUCTION_STARTED) {
            if (currentStatus !== WORK_ORDER_STATUS.READY_FOR_PRODUCTION && currentStatus !== WORK_ORDER_STATUS.PRODUCTION_PAUSED && currentStatus !== WORK_ORDER_STATUS.PRODUCTION_PLANNED) {
                throw new Error("Invalid transition: Cannot start production from ".concat(currentStatus, "."));
            }
        }
        if (nextStatus === WORK_ORDER_STATUS.PRODUCTION_COMPLETED) {
            const validPre = [
                WORK_ORDER_STATUS.PRODUCTION_STARTED,
                WORK_ORDER_STATUS.PRODUCTION_IN_PROGRESS,
                WORK_ORDER_STATUS.PARTIALLY_COMPLETED
            ];
            if (!validPre.includes(currentStatus)) {
                throw new Error("Invalid transition: Cannot mark production complete from ".concat(currentStatus, "."));
            }
        }
    }
    if (entityType === 'MATERIAL_REQUEST' && nextStatus === MATERIAL_REQUEST_STATUS.ISSUED) {
        if (currentStatus !== MATERIAL_REQUEST_STATUS.STORE_APPROVED) {
            throw new Error("Invalid transition: Material Request must be STORE_APPROVED before being issued (current: ".concat(currentStatus, ")."));
        }
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(dashboard)/plant-head/planning/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PlanningPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$plant$2d$head$2f$pages$2f$PlantHeadPortal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/modules/plant-head/pages/PlantHeadPortal.jsx [app-client] (ecmascript)");
'use client';
;
;
function PlanningPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$plant$2d$head$2f$pages$2f$PlantHeadPortal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/app/(dashboard)/plant-head/planning/page.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
_c = PlanningPage;
var _c;
__turbopack_context__.k.register(_c, "PlanningPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_3eed6af2._.js.map