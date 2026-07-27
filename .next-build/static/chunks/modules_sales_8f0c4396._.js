(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/modules/sales/api/sales.repository.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Sales Repository — Pure HTTP transport layer.
 *
 * Rules:
 *  - NO business logic here. Only HTTP calls.
 *  - Calls client directly (new pattern) — data is auto-unwrapped by responseInterceptor.
 *  - Every method returns raw API data or throws an ApiError.
 *  - Service layer is responsible for transforming / validating results.
 */ __turbopack_context__.s([
    "leadsRepository",
    ()=>leadsRepository,
    "ordersRepository",
    ()=>ordersRepository,
    "quotationsRepository",
    ()=>quotationsRepository,
    "samplesRepository",
    ()=>samplesRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/apiClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/api/endpoints.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$idGenerator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/engine/utils/idGenerator.js [app-client] (ecmascript)");
;
;
;
const leadsRepository = {
    getAll: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENDPOINTS"].SALES.LEADS),
    create: (leadData)=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENDPOINTS"].SALES.LEADS, leadData),
    update: (leadId, data)=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].put("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENDPOINTS"].SALES.LEADS, "/").concat(leadId), data),
    remove: function(leadId) {
        let reason = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : '';
        return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].delete("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENDPOINTS"].SALES.LEADS, "/").concat(leadId, "?reason=").concat(encodeURIComponent(reason)));
    }
};
const samplesRepository = {
    getAll: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENDPOINTS"].SALES.SAMPLES),
    create: (sampleData)=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENDPOINTS"].SALES.SAMPLES, sampleData),
    update: (sampleId, data)=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].put("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENDPOINTS"].SALES.SAMPLES, "/").concat(sampleId), data)
};
const quotationsRepository = {
    getAll: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENDPOINTS"].SALES.QUOTATIONS),
    create: (qData)=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENDPOINTS"].SALES.QUOTATIONS, qData),
    update: (qId, data)=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].put("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENDPOINTS"].SALES.QUOTATIONS, "/").concat(qId), data)
};
const ordersRepository = {
    getAll: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENDPOINTS"].SALES.ORDERS),
    /** Orders delivered but awaiting payment confirmation */ getPendingPayment: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get('/sales/orders/delivered/pending-payment'),
    /**
   * Converts a quotation into a confirmed sales order.
   * The idempotency key prevents duplicate submissions.
   */ createFromQuotation: (quotation, customerId, currentUserId)=>{
        var _quotation_grandTotal, _ref, _ref1, _quotation_totalAmount, _ref2, _ref3, _quotation_expectedTransportationCost, _ref4, _quotation_transportCharge;
        const body = {
            public_id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$idGenerator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateUniqueId"])('ORD'),
            customer_id: customerId || null,
            customer_name: quotation.customerName,
            grand_total: Number((_ref1 = (_ref = (_quotation_grandTotal = quotation.grandTotal) !== null && _quotation_grandTotal !== void 0 ? _quotation_grandTotal : quotation.totalAmount) !== null && _ref !== void 0 ? _ref : quotation.totalValue) !== null && _ref1 !== void 0 ? _ref1 : 0) || 0,
            total_amount: Number((_ref3 = (_ref2 = (_quotation_totalAmount = quotation.totalAmount) !== null && _quotation_totalAmount !== void 0 ? _quotation_totalAmount : quotation.grandTotal) !== null && _ref2 !== void 0 ? _ref2 : quotation.totalValue) !== null && _ref3 !== void 0 ? _ref3 : 0) || 0,
            total_tonnage: quotation.quantity || 1,
            discount_percent: quotation.discount || 0,
            gst_rate: quotation.tax || 18,
            idempotency_key: "QTN-".concat(quotation.id, "-").concat(currentUserId || 'anon', "-").concat(Date.now()),
            items: (quotation.detailedItems || []).map((item)=>({
                    product_id: item.productId || item.code || null,
                    product_name: item.productName || item.name,
                    quantity: item.quantity || item.qty || 1,
                    price: item.unitPrice || item.rate || 0,
                    discount_percent: item.discount || 0,
                    gst_rate: item.tax || 18
                })),
            source_quotation_ref: String(quotation.id),
            quotationId: quotation.id,
            expectedTransportationCost: Number((_ref4 = (_quotation_expectedTransportationCost = quotation.expectedTransportationCost) !== null && _quotation_expectedTransportationCost !== void 0 ? _quotation_expectedTransportationCost : quotation.transportCharge) !== null && _ref4 !== void 0 ? _ref4 : 0) || 0,
            transportCharge: Number((_quotation_transportCharge = quotation.transportCharge) !== null && _quotation_transportCharge !== void 0 ? _quotation_transportCharge : 0) || 0,
            delivery_address: quotation.deliveryAddress || quotation.delivery_address || quotation.shippingAddress || '',
            expected_delivery_date: quotation.deliveryDate || quotation.expectedDeliveryDate || quotation.validTill || '',
            workflowStatus: 'SALES_ORDER',
            status: 'SALES_ORDER'
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENDPOINTS"].SALES.ORDERS, body);
    },
    /** Creates a direct order (no quotation step) */ createDirect: (orderData, currentUserId)=>{
        const body = {
            public_id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$idGenerator$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateUniqueId"])('ORD'),
            customer_name: orderData.customerName,
            customer_id: null,
            total_tonnage: Number(orderData.quantity) || 0,
            discount_percent: 0,
            gst_rate: 18,
            idempotency_key: "DIRECT-".concat(currentUserId || 'anon', "-").concat(Date.now()),
            items: [
                {
                    product_name: orderData.productName,
                    quantity: Number(orderData.quantity) || 1,
                    price: orderData.price || 15000,
                    discount_percent: 0,
                    gst_rate: 18
                }
            ],
            workflowStatus: 'SALES_ORDER',
            status: 'SALES_ORDER'
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENDPOINTS"].SALES.ORDERS, body);
    },
    /** Update payment follow-up notes and scheduled date */ updateFollowup: (orderId, text, nextDate)=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].patch("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENDPOINTS"].SALES.ORDERS, "/").concat(orderId, "/followup"), {
            text,
            nextDate
        })
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/modules/sales/services/leads.service.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Leads Service — Business logic for the Leads feature.
 *
 * Rules:
 *  - Uses leadsRepository for HTTP.
 *  - Returns { success, data } or { success: false, error }.
 *  - Never touches React state directly — callers own state.
 */ __turbopack_context__.s([
    "leadsService",
    ()=>leadsService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$api$2f$sales$2e$repository$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/modules/sales/api/sales.repository.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/engine/utils/errors.js [app-client] (ecmascript)");
;
;
const leadsService = {
    /**
   * Fetch all leads.
   */ fetchAll: async ()=>{
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$api$2f$sales$2e$repository$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["leadsRepository"].getAll();
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(data);
        } catch (err) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPError"])(err.message, 'FETCH_ERROR');
        }
    },
    /**
   * Register a new lead.
   * If `autoGenerateQuotation` is true, also creates a linked quotation.
   */ create: async (leadData)=>{
        const { autoGenerateQuotation, quotationData, ...leadOnlyData } = leadData;
        try {
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$api$2f$sales$2e$repository$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["leadsRepository"].create(leadOnlyData);
            if (result && result.success === false && result.duplicateLead) {
                return {
                    success: false,
                    duplicateLead: true,
                    leadNo: result.leadNo,
                    leadId: result.leadId,
                    customerName: result.customerName,
                    status: result.status,
                    message: result.message
                };
            }
            if (autoGenerateQuotation && quotationData) {
                try {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$api$2f$sales$2e$repository$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["quotationsRepository"].create(quotationData);
                } catch (quoteErr) {
                    // Lead was created — report partial success, surface quotation warning
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(result, {
                        warning: "Lead saved, but quotation failed: ".concat(quoteErr.message),
                        autoQuotationFailed: true
                    });
                }
            }
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(result, {
                autoGenerateQuotation: !!autoGenerateQuotation
            });
        } catch (err) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPError"])(err.message, 'CREATE_ERROR');
        }
    },
    /**
   * Update lead status (e.g. "Lost", "Converted", "Active").
   * Appends a reason to notes when marking as Lost.
   */ updateStatus: async (leadId, status, reason)=>{
        const payload = {
            status
        };
        if (status === 'Lost' && reason) {
            payload.notes = "Marked Lost. Reason: ".concat(reason);
            payload.lossReason = reason;
        }
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$api$2f$sales$2e$repository$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["leadsRepository"].update(leadId, payload);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(data);
        } catch (err) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPError"])(err.message, 'UPDATE_ERROR');
        }
    },
    /**
   * Append a follow-up entry to the lead's timeline.
   */ addFollowup: async (lead, text)=>{
        const updatedTimeline = [
            ...lead.timeline || [],
            {
                stage: 'Follow-up',
                text,
                date: new Date().toISOString().split('T')[0],
                timestamp: Date.now()
            }
        ];
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$api$2f$sales$2e$repository$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["leadsRepository"].update(lead.id, {
                timeline: updatedTimeline,
                notes: text
            });
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(data);
        } catch (err) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPError"])(err.message, 'UPDATE_ERROR');
        }
    },
    /**
   * Convert a lead to a sample request.
   * Creates the sample then marks the lead as Converted.
   */ convertToSample: async (lead, customDetails)=>{
        try {
            var _customDetails_transportationCost, _ref, _ref1, _customDetails_transportationCost1, _ref2, _ref3;
            const sample = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$api$2f$sales$2e$repository$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["samplesRepository"].create({
                leadId: lead.id,
                leadName: lead.companyName || (customDetails === null || customDetails === void 0 ? void 0 : customDetails.leadName) || lead.projectName || 'Lead Customer',
                customer: lead.companyName || (customDetails === null || customDetails === void 0 ? void 0 : customDetails.leadName) || lead.projectName || 'Lead Customer',
                product: (customDetails === null || customDetails === void 0 ? void 0 : customDetails.product) || lead.productInterested || lead.requirements || 'Sample Product',
                quantity: (customDetails === null || customDetails === void 0 ? void 0 : customDetails.quantity) || lead.estimatedQuantity || 1,
                products: (customDetails === null || customDetails === void 0 ? void 0 : customDetails.products) || [],
                transportationCost: Number((_ref1 = (_ref = (_customDetails_transportationCost = customDetails === null || customDetails === void 0 ? void 0 : customDetails.transportationCost) !== null && _customDetails_transportationCost !== void 0 ? _customDetails_transportationCost : customDetails === null || customDetails === void 0 ? void 0 : customDetails.transportCost) !== null && _ref !== void 0 ? _ref : lead.expectedTransportationCost) !== null && _ref1 !== void 0 ? _ref1 : 0),
                transportCost: Number((_ref3 = (_ref2 = (_customDetails_transportationCost1 = customDetails === null || customDetails === void 0 ? void 0 : customDetails.transportationCost) !== null && _customDetails_transportationCost1 !== void 0 ? _customDetails_transportationCost1 : customDetails === null || customDetails === void 0 ? void 0 : customDetails.transportCost) !== null && _ref2 !== void 0 ? _ref2 : lead.expectedTransportationCost) !== null && _ref3 !== void 0 ? _ref3 : 0),
                expectedDeliveryDate: (customDetails === null || customDetails === void 0 ? void 0 : customDetails.expectedDeliveryDate) || '',
                ...customDetails
            });
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(sample);
        } catch (err) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPError"])(err.message, 'CONVERT_ERROR');
        }
    },
    /**
   * Update full lead details (edit form).
   */ update: async (leadId, updatedData)=>{
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$api$2f$sales$2e$repository$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["leadsRepository"].update(leadId, updatedData);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(data);
        } catch (err) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPError"])(err.message, 'UPDATE_ERROR');
        }
    },
    /**
   * Soft-delete a lead with an optional reason.
   */ remove: async (leadId, reason)=>{
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$api$2f$sales$2e$repository$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["leadsRepository"].remove(leadId, reason);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(data);
        } catch (err) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPError"])(err.message, 'DELETE_ERROR');
        }
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/modules/sales/hooks/useLeads.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useLeads",
    ()=>useLeads
]);
/**
 * useLeads — All lead-related operations for components.
 *
 * Bridges ERPContext state + leadsService, surfacing:
 *  - The leads array (from global ERP state)
 *  - Mutation helpers (each calls the service then syncs state)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.all.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/shared/context/ERPContext.jsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/context/AuthContext.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$services$2f$leads$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/modules/sales/services/leads.service.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
function useLeads(showToast) {
    var _state_sales;
    _s();
    const { state, syncData, salesActions } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useERP"])();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const leads = ((_state_sales = state.sales) === null || _state_sales === void 0 ? void 0 : _state_sales.leads) || [];
    // ── Mutations ────────────────────────────────────────────────────────────
    /** Create a new lead, then navigate to leads list. */ const addLead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLeads.useCallback[addLead]": async (newLeadData)=>{
            showToast('Sales: Registering lead...');
            try {
                const leadId = salesActions === null || salesActions === void 0 ? void 0 : salesActions.createLead(newLeadData, (user === null || user === void 0 ? void 0 : user.name) || 'Sales User');
                if (!leadId) throw new Error('Lead creation returned no ID');
                showToast('Lead Created Successfully');
                await syncData();
                router.push('/sales/leads');
                return {
                    id: leadId,
                    leadId
                };
            } catch (err) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'error',
                    title: 'CRM Validation Error',
                    text: err.message || 'Failed to create lead'
                });
            }
        }
    }["useLeads.useCallback[addLead]"], [
        showToast,
        router,
        syncData,
        salesActions,
        user
    ]);
    /**
   * Save lead first, then persist a Draft quotation on the backend,
   * seed ERPStore, and navigate to /sales/create-quotation.
   * Idempotent: clicking Generate Quotation again for the same lead
   * reuses the existing Draft row.
   */ const generateQuotationFromLead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLeads.useCallback[generateQuotationFromLead]": async (leadData)=>{
            try {
                showToast('Saving lead and creating quotation draft…');
                // 1. If this is a NEW lead (no id yet), save it first
                let resolvedLeadId = leadData.id || leadData.leadId;
                if (!resolvedLeadId) {
                    try {
                        resolvedLeadId = salesActions === null || salesActions === void 0 ? void 0 : salesActions.createLead(leadData, (user === null || user === void 0 ? void 0 : user.name) || 'Sales User');
                        if (!resolvedLeadId) throw new Error('Lead creation returned no ID');
                    } catch (err) {
                        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                            icon: 'error',
                            title: 'Lead Save Failed',
                            text: err.message || 'Failed to create lead'
                        });
                        return;
                    }
                    showToast('Lead Created Successfully');
                }
                // 2. Map lead detailedItems → quotation items format
                const detailedItems = (leadData.detailedItems || []).map({
                    "useLeads.useCallback[generateQuotationFromLead].detailedItems": (item)=>({
                            productName: item.productName || item.name || '',
                            specification: item.specification || item.description || '',
                            quantity: item.quantity || item.qty || 1,
                            unitPrice: item.unitPrice || item.rate || 0,
                            discount: item.discount || 0,
                            tax: item.tax || 18,
                            additionalCharges: item.additionalCharges || 0
                        })
                }["useLeads.useCallback[generateQuotationFromLead].detailedItems"]);
                const grandTotal = detailedItems.reduce({
                    "useLeads.useCallback[generateQuotationFromLead].grandTotal": (sum, it)=>{
                        const sub = it.quantity * it.unitPrice;
                        const disc = sub * (it.discount / 100);
                        const gst = (sub - disc) * (it.tax / 100);
                        return sum + sub - disc + gst + (it.additionalCharges || 0);
                    }
                }["useLeads.useCallback[generateQuotationFromLead].grandTotal"], 0);
                // 3. Build an in-memory form draft. The quotation itself is written
                // only when the canonical createQuotation action is submitted.
                const serverDraft = {
                    leadId: resolvedLeadId,
                    customerName: leadData.companyName || leadData.customerName || '',
                    companyName: leadData.companyName || '',
                    gstName: leadData.gstName || leadData.companyName || '',
                    gstNumber: leadData.gstNumber || '',
                    groupName: leadData.groupName || '',
                    contactPerson: leadData.contactPerson || leadData.siteInchargeName || '',
                    phone: leadData.phone || leadData.siteInchargeMobile || '',
                    email: leadData.email || '',
                    address: leadData.address || '',
                    remarks: leadData.notes || leadData.remarks || '',
                    grandTotal,
                    detailedItems
                };
                // 4. Seed only the non-transactional quotation form draft.
                __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().setQuotationDraft({
                    customer: serverDraft.customerName || serverDraft.companyName || leadData.companyName || leadData.customerName || '',
                    company: serverDraft.companyName || leadData.companyName || '',
                    gstName: serverDraft.gstName || serverDraft.companyName || leadData.gstName || leadData.companyName || '',
                    gstNumber: serverDraft.gstNumber || leadData.gstNumber || '',
                    groupName: serverDraft.groupName || leadData.groupName || '',
                    contactPerson: serverDraft.contactPerson || leadData.contactPerson || '',
                    phone: serverDraft.phone || leadData.phone || '',
                    email: serverDraft.email || leadData.email || '',
                    address: serverDraft.address || leadData.address || '',
                    notes: serverDraft.remarks || leadData.notes || '',
                    leadId: resolvedLeadId,
                    source: 'LEAD',
                    sourceId: resolvedLeadId,
                    items: (serverDraft.items || serverDraft.detailedItems || detailedItems).map({
                        "useLeads.useCallback[generateQuotationFromLead]": (it, idx)=>({
                                id: idx + 1,
                                name: it.productName || it.name || '',
                                description: it.specification || it.description || '',
                                qty: it.quantity || it.qty || 1,
                                rate: it.unitPrice || it.rate || 0,
                                discount: it.discount || 0,
                                tax: it.tax !== undefined ? it.tax : 18,
                                amount: (it.quantity || it.qty || 1) * (it.unitPrice || it.rate || 0)
                            })
                    }["useLeads.useCallback[generateQuotationFromLead]"])
                });
                // 5. Sync leads to reflect new lead + 'Quotation Draft' status
                await syncData();
                router.push('/sales/create-quotation');
            } catch (err) {
                console.error('Error generating quotation from lead:', err);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'error',
                    title: 'Operation Failed',
                    text: err.message || 'An error occurred while generating the quotation.'
                });
            }
        }
    }["useLeads.useCallback[generateQuotationFromLead]"], [
        showToast,
        router,
        syncData
    ]);
    /** Update a lead's status (e.g. "Active" → "Lost"). */ const updateLeadStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLeads.useCallback[updateLeadStatus]": async (leadId, status, reason)=>{
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$services$2f$leads$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["leadsService"].updateStatus(leadId, status, reason);
            if (res.success) {
                showToast("Lead status updated to ".concat(status));
                await syncData();
            } else {
                var _res_error;
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'error',
                    title: 'Error',
                    text: ((_res_error = res.error) === null || _res_error === void 0 ? void 0 : _res_error.message) || res.error
                });
            }
        }
    }["useLeads.useCallback[updateLeadStatus]"], [
        showToast,
        syncData
    ]);
    /** Append a follow-up note to the lead's timeline. */ const addFollowup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLeads.useCallback[addFollowup]": async (leadId, text)=>{
            const lead = leads.find({
                "useLeads.useCallback[addFollowup].lead": (l)=>l.id === leadId
            }["useLeads.useCallback[addFollowup].lead"]);
            if (!lead) return;
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$services$2f$leads$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["leadsService"].addFollowup(lead, text);
            if (res.success) {
                showToast('Followup recorded.');
                await syncData();
            } else {
                var _res_error;
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'error',
                    title: 'Error',
                    text: ((_res_error = res.error) === null || _res_error === void 0 ? void 0 : _res_error.message) || res.error
                });
            }
        }
    }["useLeads.useCallback[addFollowup]"], [
        leads,
        showToast,
        syncData
    ]);
    /** Convert a lead to a sample request, then navigate to samples view. */ const convertToSample = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLeads.useCallback[convertToSample]": async (lead, customDetails)=>{
            if (!customDetails) {
                router.push('/sales/create-sample?leadId=' + lead.id);
                return {
                    success: true
                };
            }
            showToast('Sales: Creating sample dispatch request…');
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$services$2f$leads$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["leadsService"].convertToSample(lead, customDetails);
            if (res.success) {
                showToast('Sample dispatch request created for ' + lead.companyName + '!');
                await syncData();
                router.push('/dispatch/sample-dispatch');
            } else {
                var _res_error;
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'error',
                    title: 'Sample Request Failed',
                    text: ((_res_error = res.error) === null || _res_error === void 0 ? void 0 : _res_error.message) || res.error
                });
            }
            return res;
        }
    }["useLeads.useCallback[convertToSample]"], [
        showToast,
        router,
        syncData
    ]);
    /** Update full lead details (edit form). */ const updateLead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLeads.useCallback[updateLead]": async (leadId, updatedData)=>{
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$services$2f$leads$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["leadsService"].update(leadId, updatedData);
            if (res.success) {
                showToast('Lead details updated successfully.');
                await syncData();
                router.push('/sales/leads');
            } else {
                var _res_error;
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'error',
                    title: 'Error',
                    text: ((_res_error = res.error) === null || _res_error === void 0 ? void 0 : _res_error.message) || res.error
                });
            }
        }
    }["useLeads.useCallback[updateLead]"], [
        showToast,
        router,
        syncData
    ]);
    /** Soft-delete a lead. */ const deleteLead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLeads.useCallback[deleteLead]": async function(leadId) {
            let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$services$2f$leads$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["leadsService"].remove(leadId, options.reason || 'Deleted from leads directory');
            if (res.success) {
                showToast('Lead deleted successfully.');
                await syncData();
                if (options.navigate !== false) router.push('/sales/leads');
            } else {
                var _res_error;
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'error',
                    title: 'Error',
                    text: ((_res_error = res.error) === null || _res_error === void 0 ? void 0 : _res_error.message) || res.error
                });
            }
            return res;
        }
    }["useLeads.useCallback[deleteLead]"], [
        showToast,
        router,
        syncData
    ]);
    return {
        leads,
        addLead,
        generateQuotationFromLead,
        updateLeadStatus,
        addFollowup,
        convertToSample,
        updateLead,
        deleteLead
    };
}
_s(useLeads, "yBkmjbkvBGbhhcN0V9SulV4T4H0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useERP"],
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/modules/sales/services/samples.service.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Samples Service — Business logic for the Samples feature.
 */ __turbopack_context__.s([
    "samplesService",
    ()=>samplesService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$api$2f$sales$2e$repository$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/modules/sales/api/sales.repository.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/engine/utils/errors.js [app-client] (ecmascript)");
;
;
const samplesService = {
    /**
   * Update a sample's status (e.g. "Approved", "Rejected", "Dispatched").
   */ updateStatus: async (sampleId, status)=>{
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$api$2f$sales$2e$repository$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["samplesRepository"].update(sampleId, {
                status
            });
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(data);
        } catch (err) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPError"])(err.message, 'UPDATE_ERROR');
        }
    },
    /**
   * Create a new sample request.
   */ create: async (sampleData)=>{
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$api$2f$sales$2e$repository$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["samplesRepository"].create(sampleData);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(data);
        } catch (err) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPError"])(err.message, 'CREATE_ERROR');
        }
    },
    /**
   * Update full sample details (edit form submission).
   */ update: async (sampleId, updatedData)=>{
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$api$2f$sales$2e$repository$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["samplesRepository"].update(sampleId, updatedData);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(data);
        } catch (err) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPError"])(err.message, 'UPDATE_ERROR');
        }
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/modules/sales/hooks/useSamples.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSamples",
    ()=>useSamples
]);
/**
 * useSamples — Sample operations for components.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.all.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/shared/context/ERPContext.jsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$services$2f$samples$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/modules/sales/services/samples.service.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function useSamples(showToast) {
    var _state_sales;
    _s();
    const { state, syncData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useERP"])();
    const navigate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const samples = ((_state_sales = state.sales) === null || _state_sales === void 0 ? void 0 : _state_sales.samples) || [];
    /** Update a sample's workflow status. */ const updateSampleStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSamples.useCallback[updateSampleStatus]": async (sampleId, status)=>{
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$services$2f$samples$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["samplesService"].updateStatus(sampleId, status);
            if (res.success) {
                showToast("Sample status set to ".concat(status));
                await syncData();
            } else {
                var _res_error;
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'error',
                    title: 'Error',
                    text: ((_res_error = res.error) === null || _res_error === void 0 ? void 0 : _res_error.message) || res.error
                });
            }
        }
    }["useSamples.useCallback[updateSampleStatus]"], [
        showToast,
        syncData
    ]);
    /** Save edited sample details. */ const updateSample = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSamples.useCallback[updateSample]": async (sampleId, updatedData)=>{
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$services$2f$samples$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["samplesService"].update(sampleId, updatedData);
            if (res.success) {
                showToast('Sample details updated successfully.');
                await syncData();
            } else {
                var _res_error;
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'error',
                    title: 'Error',
                    text: ((_res_error = res.error) === null || _res_error === void 0 ? void 0 : _res_error.message) || res.error
                });
            }
        }
    }["useSamples.useCallback[updateSample]"], [
        showToast,
        syncData
    ]);
    /** Create a replacement sample request. */ const createReplacementSample = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSamples.useCallback[createReplacementSample]": async (sample)=>{
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$services$2f$samples$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["samplesService"].create({
                customer_id: sample.customer_id,
                product_id: sample.product_id,
                quantity: sample.quantity,
                status: 'Requested',
                plant_approval_notes: JSON.stringify({
                    testing_parameters: sample.testing_parameters || '',
                    shipping_address: sample.shipping_address || '',
                    transporter: sample.transporter || '',
                    remarks: "Replacement for Sample ".concat(sample.sample_number || sample.id)
                })
            });
            if (res.success) {
                showToast('Replacement sample requested successfully.');
                await syncData();
            } else {
                var _res_error;
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'error',
                    title: 'Error',
                    text: ((_res_error = res.error) === null || _res_error === void 0 ? void 0 : _res_error.message) || res.error
                });
            }
        }
    }["useSamples.useCallback[createReplacementSample]"], [
        showToast,
        syncData
    ]);
    return {
        samples,
        updateSampleStatus,
        updateSample,
        createReplacementSample
    };
}
_s(useSamples, "lfhcOryEv5BLLHilIDUOIRMhCkI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useERP"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/modules/sales/hooks/useQuotations.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * useQuotations — Quotation operations for components.
 */ __turbopack_context__.s([
    "useQuotations",
    ()=>useQuotations
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.all.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/shared/context/ERPContext.jsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/context/AuthContext.jsx [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
function useQuotations(showToast) {
    var _state_sales;
    _s();
    const { state } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useERP"])();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const quotations = ((_state_sales = state.sales) === null || _state_sales === void 0 ? void 0 : _state_sales.quotations) || [];
    /** Create a new quotation. */ const createQuotation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useQuotations.useCallback[createQuotation]": async (qData)=>{
            try {
                const id = __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().createQuotation(qData, (user === null || user === void 0 ? void 0 : user.name) || 'Sales User');
                showToast('Quotation created successfully.');
                return {
                    success: true,
                    data: {
                        id
                    }
                };
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'error',
                    title: 'Error',
                    text: message
                });
                return {
                    success: false,
                    error: message
                };
            }
        }
    }["useQuotations.useCallback[createQuotation]"], [
        showToast,
        user
    ]);
    /** Update quotation details. */ const updateQuotation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useQuotations.useCallback[updateQuotation]": async (qId, updatedData)=>{
            var _current_sales_quotations, _current_sales;
            const current = __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState();
            const quotation = (_current_sales = current.sales) === null || _current_sales === void 0 ? void 0 : (_current_sales_quotations = _current_sales.quotations) === null || _current_sales_quotations === void 0 ? void 0 : _current_sales_quotations.find({
                "useQuotations.useCallback[updateQuotation]": (item)=>item.id === qId
            }["useQuotations.useCallback[updateQuotation]"]);
            if (!quotation) return {
                success: false,
                error: 'Quotation not found'
            };
            const nextState = {
                ...current,
                sales: {
                    ...current.sales,
                    quotations: current.sales.quotations.map({
                        "useQuotations.useCallback[updateQuotation]": (item)=>item.id === qId ? {
                                ...item,
                                ...updatedData,
                                id: qId
                            } : item
                    }["useQuotations.useCallback[updateQuotation]"])
                }
            };
            __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].setState(nextState);
            showToast('Quotation updated.');
            return {
                success: true,
                data: nextState.sales.quotations.find({
                    "useQuotations.useCallback[updateQuotation]": (item)=>item.id === qId
                }["useQuotations.useCallback[updateQuotation]"])
            };
        }
    }["useQuotations.useCallback[updateQuotation]"], [
        showToast
    ]);
    const convertQuotationToOrder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"])({
        "useQuotations.useERPStore[convertQuotationToOrder]": (s)=>{
            var _s_salesActions;
            return (_s_salesActions = s.salesActions) === null || _s_salesActions === void 0 ? void 0 : _s_salesActions.convertQuotationToOrder;
        }
    }["useQuotations.useERPStore[convertQuotationToOrder]"]);
    /**
   * Convert a quotation to a confirmed order.
   */ const confirmOrder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useQuotations.useCallback[confirmOrder]": async (quotation)=>{
            try {
                if (!convertQuotationToOrder) throw new Error("ERP Actions not initialized");
                // This natively mutates the centralized store, converts quotation, creates order, and persists!
                const orderId = convertQuotationToOrder(quotation.id, user === null || user === void 0 ? void 0 : user.name);
                showToast("Order ".concat(orderId, " confirmed!"));
                return {
                    success: true,
                    data: {
                        orderNo: orderId
                    }
                };
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'error',
                    title: 'Order Failed',
                    text: message
                });
                return {
                    success: false,
                    error: message
                };
            }
        }
    }["useQuotations.useCallback[confirmOrder]"], [
        convertQuotationToOrder,
        user,
        showToast
    ]);
    return {
        quotations,
        createQuotation,
        updateQuotation,
        confirmOrder
    };
}
_s(useQuotations, "RpWxuAivwABrHVHRqpsUz/3taVU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useERP"],
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/modules/sales/api/reminders.repository.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "remindersRepository",
    ()=>remindersRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/api/client.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/api/endpoints.js [app-client] (ecmascript)");
;
;
const remindersRepository = {
    getAll: function() {
        let params = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        const query = new URLSearchParams();
        if (params.moduleType) query.set('module_type', params.moduleType);
        if (params.moduleId) query.set('module_id', params.moduleId);
        if (params.status) query.set('status', params.status);
        const qs = query.toString();
        return __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["client"].get("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENDPOINTS"].SALES.REMINDERS).concat(qs ? "?".concat(qs) : ''));
    },
    create: (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["client"].post(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENDPOINTS"].SALES.REMINDERS, data),
    update: (id, data)=>__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["client"].put("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENDPOINTS"].SALES.REMINDERS, "/").concat(id), data),
    complete: (id)=>__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["client"].patch("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENDPOINTS"].SALES.REMINDERS, "/").concat(id, "/complete")),
    cancel: (id)=>__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["client"].delete("".concat(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$endpoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENDPOINTS"].SALES.REMINDERS, "/").concat(id))
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/modules/sales/services/reminders.service.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "remindersService",
    ()=>remindersService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$api$2f$reminders$2e$repository$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/modules/sales/api/reminders.repository.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/engine/utils/errors.js [app-client] (ecmascript)");
;
;
const remindersService = {
    list: async function() {
        let params = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$api$2f$reminders$2e$repository$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["remindersRepository"].getAll(params);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(data);
        } catch (err) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPError"])(err.message, 'LIST_ERROR');
        }
    },
    create: async (payload)=>{
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$api$2f$reminders$2e$repository$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["remindersRepository"].create(payload);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(data);
        } catch (err) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPError"])(err.message, 'CREATE_ERROR');
        }
    },
    update: async (id, payload)=>{
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$api$2f$reminders$2e$repository$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["remindersRepository"].update(id, payload);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(data);
        } catch (err) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPError"])(err.message, 'UPDATE_ERROR');
        }
    },
    complete: async (id)=>{
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$api$2f$reminders$2e$repository$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["remindersRepository"].complete(id);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(data);
        } catch (err) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPError"])(err.message, 'COMPLETE_ERROR');
        }
    },
    cancel: async (id)=>{
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$api$2f$reminders$2e$repository$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["remindersRepository"].cancel(id);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPSuccess"])(data);
        } catch (err) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$engine$2f$utils$2f$errors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ERPError"])(err.message, 'CANCEL_ERROR');
        }
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/modules/sales/hooks/useReminders.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useReminders",
    ()=>useReminders
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.all.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/shared/context/ERPContext.jsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$services$2f$reminders$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/modules/sales/services/reminders.service.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
;
function useReminders(showToast) {
    _s();
    const { state, syncData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useERP"])();
    const reminders = Array.isArray(state === null || state === void 0 ? void 0 : state.reminders) ? state.reminders : [];
    const createReminder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useReminders.useCallback[createReminder]": async (payload)=>{
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$services$2f$reminders$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["remindersService"].create(payload);
            if (res.success) {
                showToast === null || showToast === void 0 ? void 0 : showToast('Reminder saved.');
                await syncData();
            } else {
                var _res_error;
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'error',
                    title: 'Error',
                    text: ((_res_error = res.error) === null || _res_error === void 0 ? void 0 : _res_error.message) || res.error
                });
            }
            return res;
        }
    }["useReminders.useCallback[createReminder]"], [
        showToast,
        syncData
    ]);
    const updateReminder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useReminders.useCallback[updateReminder]": async (id, payload)=>{
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$services$2f$reminders$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["remindersService"].update(id, payload);
            if (res.success) {
                showToast === null || showToast === void 0 ? void 0 : showToast('Reminder updated.');
                await syncData();
            } else {
                var _res_error;
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'error',
                    title: 'Error',
                    text: ((_res_error = res.error) === null || _res_error === void 0 ? void 0 : _res_error.message) || res.error
                });
            }
            return res;
        }
    }["useReminders.useCallback[updateReminder]"], [
        showToast,
        syncData
    ]);
    const completeReminder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useReminders.useCallback[completeReminder]": async (id)=>{
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$services$2f$reminders$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["remindersService"].complete(id);
            if (res.success) {
                showToast === null || showToast === void 0 ? void 0 : showToast('Reminder marked complete.');
                await syncData();
            } else {
                var _res_error;
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'error',
                    title: 'Error',
                    text: ((_res_error = res.error) === null || _res_error === void 0 ? void 0 : _res_error.message) || res.error
                });
            }
            return res;
        }
    }["useReminders.useCallback[completeReminder]"], [
        showToast,
        syncData
    ]);
    const cancelReminder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useReminders.useCallback[cancelReminder]": async (id)=>{
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$services$2f$reminders$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["remindersService"].cancel(id);
            if (res.success) {
                showToast === null || showToast === void 0 ? void 0 : showToast('Reminder cancelled.');
                await syncData();
            } else {
                var _res_error;
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'error',
                    title: 'Error',
                    text: ((_res_error = res.error) === null || _res_error === void 0 ? void 0 : _res_error.message) || res.error
                });
            }
            return res;
        }
    }["useReminders.useCallback[cancelReminder]"], [
        showToast,
        syncData
    ]);
    return {
        reminders,
        createReminder,
        updateReminder,
        completeReminder,
        cancelReminder
    };
}
_s(useReminders, "xrFN5HQp2rYMeDqxbFo93Lee1Uc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useERP"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/modules/sales/hooks/useOrders.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * useOrders — Order operations for components.
 */ __turbopack_context__.s([
    "useOrders",
    ()=>useOrders
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.all.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/shared/context/ERPContext.jsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/context/AuthContext.jsx [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
const normalizeOrder = (o)=>{
    var _o_customer;
    if (!o) return o;
    const orderNo = o.orderNo || o.public_id || o.id || '';
    const customerName = o.customerName || o.customer_name || (typeof o.customer === 'string' ? o.customer : (_o_customer = o.customer) === null || _o_customer === void 0 ? void 0 : _o_customer.name) || '';
    const detailedItems = o.detailedItems || (o.items || []).map((it)=>({
            productName: it.product_name || it.name || '',
            productDetails: it.product_details || it.description || '',
            quantity: it.quantity || it.qty || 1,
            unitPrice: it.price || it.unitPrice || 0,
            discount: it.discount_percent || it.discount || 0,
            tax: it.gst_rate !== undefined ? it.gst_rate : it.tax !== undefined ? it.tax : 18,
            code: it.product_id || it.code || ''
        }));
    const products = Array.isArray(o.products) ? o.products.map((it)=>it.productName || it.name || '').filter(Boolean).join(', ') : o.products || detailedItems.map((it)=>it.productName).filter(Boolean).join(', ') || 'No products listed';
    const totalAmount = o.totalAmount || o.grandTotal || o.totalValue || detailedItems.reduce((sum, it)=>{
        const itemSubtotal = it.quantity * it.unitPrice;
        const discountVal = itemSubtotal * (it.discount || 0) / 100;
        const taxable = itemSubtotal - discountVal;
        const taxVal = taxable * (it.tax || 18) / 100;
        return sum + taxable + taxVal;
    }, 0);
    const overallStage = o.overallStage || o.productionStatus || 'Pending';
    const status = o.orderStatus || o.status || o.workflowStatus || o.salesStatus || 'Pending';
    const dispatchStatus = o.dispatchStatus || 'pending';
    const paymentStatus = o.paymentStatus || 'pending';
    return {
        ...o,
        orderNo,
        customerName,
        detailedItems,
        products,
        totalAmount,
        totalValue: totalAmount,
        overallStage,
        status,
        orderStatus: status,
        dispatchStatus,
        paymentStatus
    };
};
function useOrders(showToast, currentView) {
    _s();
    const { state, syncData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useERP"])();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const orders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"])({
        "useOrders.useERPStore": (store)=>{
            var _store_state_sales, _store_state;
            return (_store_state = store.state) === null || _store_state === void 0 ? void 0 : (_store_state_sales = _store_state.sales) === null || _store_state_sales === void 0 ? void 0 : _store_state_sales.orders;
        }
    }["useOrders.useERPStore"]) || [];
    // Temporarily add this to confirm the order exists
    console.log("SALES ORDERS PAGE:", orders);
    const deliveredOrders = orders.filter((o)=>{
        const st = String(o.orderStatus || o.status || '').trim().toLowerCase();
        const paySt = String(o.paymentStatus || '').trim().toLowerCase();
        return (st === 'delivered' || st === 'payment completed' || st === 'partially paid') && paySt !== 'paid';
    });
    /** Create a direct order bypassing the quotation flow. */ const createOrder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useOrders.useCallback[createOrder]": async (orderData)=>{
            try {
                const store = __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState();
                const id = orderData.id || orderData.orderNo || "ORD-".concat(Date.now());
                if (!store.sales.orders.some({
                    "useOrders.useCallback[createOrder]": (order)=>order.id === id
                }["useOrders.useCallback[createOrder]"])) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].setState({
                        ...store,
                        sales: {
                            ...store.sales,
                            orders: [
                                ...store.sales.orders,
                                {
                                    ...orderData,
                                    id,
                                    orderNo: id,
                                    items: Array.isArray(orderData.items) ? orderData.items : [],
                                    commercialStatus: 'ORDER_CONFIRMED',
                                    planningStatus: 'NOT_SENT',
                                    productionStatus: 'NOT_STARTED',
                                    qcStatus: 'NOT_READY',
                                    dispatchStatus: 'NOT_READY',
                                    paymentStatus: 'NOT_DUE',
                                    replacementStatus: 'NONE',
                                    returnStatus: 'NONE'
                                }
                            ]
                        }
                    });
                }
                showToast("Order ".concat(id, " created."));
                return {
                    success: true,
                    data: {
                        ...orderData,
                        id,
                        orderNo: id
                    }
                };
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'error',
                    title: 'Error',
                    text: message
                });
                return {
                    success: false,
                    error: message
                };
            }
        }
    }["useOrders.useCallback[createOrder]"], [
        showToast
    ]);
    /** Update payment follow-up notes. */ const updateFollowup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useOrders.useCallback[updateFollowup]": async (orderId, text, nextDate)=>{
            const store = __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState();
            __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].setState({
                ...store,
                sales: {
                    ...store.sales,
                    orders: store.sales.orders.map({
                        "useOrders.useCallback[updateFollowup]": (order)=>order.id === orderId || order.orderNo === orderId ? {
                                ...order,
                                followupNotes: text,
                                nextFollowupDate: nextDate
                            } : order
                    }["useOrders.useCallback[updateFollowup]"])
                }
            });
            showToast('Follow-up updated.');
            return {
                success: true
            };
        }
    }["useOrders.useCallback[updateFollowup]"], [
        showToast
    ]);
    return {
        orders,
        deliveredOrders,
        createOrder,
        updateFollowup
    };
}
_s(useOrders, "GzSwKUwAhfU4JLm7X5eHs6wjZ10=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useERP"],
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/modules/sales/pages/SalesPortal.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SalesPortal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * SalesPortal — Thin route orchestrator for the Sales module.
 *
 * Responsibilities:
 *  ✅ Route → view mapping via useParams
 *  ✅ Wire domain hooks (useLeads, useSamples, useQuotations, useOrders)
 *  ✅ Pass handlers down to view components
 *
 * NOT responsible for:
 *  ❌ HTTP calls (delegated to services via hooks)
 *  ❌ Business logic (delegated to feature services)
 *  ❌ Local state beyond UI-only concerns (prefillQuotationData, deliveredOrders)
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$searchStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/searchStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/notificationStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.all.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/shared/context/ERPContext.jsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/context/AuthContext.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/apiClient.js [app-client] (ecmascript)");
// Feature hooks (new FSD layer)
var __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$hooks$2f$useLeads$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/modules/sales/hooks/useLeads.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$hooks$2f$useSamples$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/modules/sales/hooks/useSamples.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$hooks$2f$useQuotations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/modules/sales/hooks/useQuotations.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$hooks$2f$useReminders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/modules/sales/hooks/useReminders.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$hooks$2f$useOrders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/modules/sales/hooks/useOrders.js [app-client] (ecmascript)");
// UI view components (unchanged — still consumed from /components for now)
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DashboardView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DashboardView.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EditSample$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/EditSample.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CreateSample$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CreateSample.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LeadsView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/LeadsView.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CreateLead$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CreateLead.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SamplesView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SamplesView.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$QuotationsView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/QuotationsView.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CreateQuotation$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CreateQuotation.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$OrdersView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/OrdersView.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PaymentsView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/PaymentsView.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PaymentFollowupERPView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/PaymentFollowupERPView.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CreatePayment$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CreatePayment.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CustomersView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CustomersView.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ReportsView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ReportsView.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SalesProductionStatusView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SalesProductionStatusView.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DailyTaskView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DailyTaskView.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CustomerComplaintManagement$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CustomerComplaintManagement.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CreateOrder$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CreateOrder.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$O2PWorkflowBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/components/O2PWorkflowBanner.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$hooks$2f$useO2PWorkflow$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/hooks/useO2PWorkflow.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function SalesPortal() {
    var _params_slug, _params_slug1, _params_slug2;
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const pathSlug = pathname ? pathname.split('/').filter(Boolean) : [];
    let view = (params === null || params === void 0 ? void 0 : (_params_slug = params.slug) === null || _params_slug === void 0 ? void 0 : _params_slug[0]) || (pathSlug.length > 1 ? pathSlug[pathSlug.length - 1] : 'dashboard') || 'dashboard';
    if (view === 'sales') view = 'dashboard';
    const leadId = params === null || params === void 0 ? void 0 : (_params_slug1 = params.slug) === null || _params_slug1 === void 0 ? void 0 : _params_slug1[1];
    const sampleId = params === null || params === void 0 ? void 0 : (_params_slug2 = params.slug) === null || _params_slug2 === void 0 ? void 0 : _params_slug2[1];
    const location = {
        pathname: pathname || '',
        search: ""
    };
    const navigate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const currentView = location.pathname.includes('/sales/edit-lead/') ? 'edit-lead' : location.pathname.includes('/sales/edit-sample/') ? 'edit-sample' : view;
    const { state, dispatch, syncData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useERP"])();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const showToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"])({
        "SalesPortal.useNotificationStore[showToast]": (s)=>s.showToast
    }["SalesPortal.useNotificationStore[showToast]"]);
    const globalSearch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$searchStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchStore"])({
        "SalesPortal.useSearchStore[globalSearch]": (s)=>s.globalSearch
    }["SalesPortal.useSearchStore[globalSearch]"]);
    const setGlobalSearch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$searchStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchStore"])({
        "SalesPortal.useSearchStore[setGlobalSearch]": (s)=>s.setGlobalSearch
    }["SalesPortal.useSearchStore[setGlobalSearch]"]);
    // ── UI-only state ──────────────────────────────────────────────────────────
    const [prefillQuotationData, setPrefillQuotationData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // ── Domain hooks ───────────────────────────────────────────────────────────
    const { leads, addLead, generateQuotationFromLead, updateLeadStatus, addFollowup, convertToSample, updateLead, deleteLead } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$hooks$2f$useLeads$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLeads"])(showToast);
    const { samples, updateSampleStatus, updateSample, createReplacementSample } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$hooks$2f$useSamples$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSamples"])(showToast);
    const { quotations, createQuotation, updateQuotation, confirmOrder } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$hooks$2f$useQuotations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuotations"])(showToast);
    const { reminders, createReminder, updateReminder, completeReminder } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$hooks$2f$useReminders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useReminders"])(showToast);
    const { orders, deliveredOrders, createOrder, updateFollowup } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$hooks$2f$useOrders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useOrders"])(showToast, currentView);
    // ── O2P Workflow ────────────────────────────────────────────────────────────
    const o2p = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$hooks$2f$useO2PWorkflow$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useO2PWorkflow"])();
    const handleAddLead = async (data)=>{
        const result = await addLead(data);
        if ((result === null || result === void 0 ? void 0 : result.id) || (result === null || result === void 0 ? void 0 : result.leadId)) {
            const newId = String(result.id || result.leadId);
            o2p.advanceLead({
                orderId: newId,
                actor: (user === null || user === void 0 ? void 0 : user.name) || 'Sales'
            });
        }
        return result;
    };
    const handleConfirmOrder = async (quotationId, data)=>{
        const result = await confirmOrder(quotationId, data);
        if ((result === null || result === void 0 ? void 0 : result.orderId) || (result === null || result === void 0 ? void 0 : result.id)) {
            const ordId = String(result.orderId || result.id);
            o2p.setActiveOrder(ordId, 4);
            o2p.confirmSalesOrder({
                orderId: ordId,
                actor: (user === null || user === void 0 ? void 0 : user.name) || 'Sales'
            });
        }
        return result;
    };
    const payments = state.payments || [];
    const customers = state.customers || [];
    // ── Quick navigation helpers ───────────────────────────────────────────────
    const handleActionClick = (_actionName, message)=>showToast(message);
    // ── Quotation-specific handlers ────────────────────────────────────────────
    /** Move to quotation view, pre-seeding the draft from a sample. */ const onMoveToQuotation = (sample)=>{
        const customer = sample.leadName || sample.customer || sample.company || '';
        let items = [];
        if (sample.products && Array.isArray(sample.products)) {
            items = sample.products.map((p, idx)=>({
                    productId: p.id || p.productId || "PRD-".concat(idx + 1),
                    name: p.name || p.productName || '',
                    description: p.description || p.productDetails || p.specs || '',
                    qty: p.sampleQty || p.qty || p.quantity || 1,
                    unit: p.unit || 'Units',
                    rate: p.estimatedPrice || p.rate || p.price || p.unitPrice || 0,
                    amount: (p.sampleQty || p.qty || p.quantity || 1) * (p.estimatedPrice || p.rate || p.price || p.unitPrice || 0)
                }));
        } else {
            items = [
                {
                    productId: sample.productId || 'PRD-1',
                    name: sample.product || sample.productName || '',
                    description: sample.description || sample.productDetails || sample.specs || '',
                    qty: sample.quantity || sample.qty || 1,
                    unit: sample.unit || 'Units',
                    rate: sample.value || sample.rate || sample.price || sample.unitPrice || 0,
                    amount: (sample.quantity || sample.qty || 1) * (sample.value || sample.rate || sample.price || sample.unitPrice || 0)
                }
            ];
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().setQuotationDraft({
            customer,
            company: sample.company || sample.leadName || '',
            contactPerson: sample.contactPerson || '',
            items,
            source: 'SAMPLE',
            sourceId: sample.id,
            gstNumber: sample.gstNumber || ''
        });
        setPrefillQuotationData(sample);
        navigate.push('/sales/create-quotation');
    };
    /** Create quotation; if a matching lead exists, advance its status to 'Quotation'. */ const onAddQuotation = async (qData)=>{
        const res = await createQuotation(qData);
        if (res === null || res === void 0 ? void 0 : res.success) {
            const matchedLead = leads.find((l)=>{
                var _l_companyName, _qData_customerName, _l_projectName, _qData_customerName1;
                return ((_l_companyName = l.companyName) === null || _l_companyName === void 0 ? void 0 : _l_companyName.toLowerCase()) === ((_qData_customerName = qData.customerName) === null || _qData_customerName === void 0 ? void 0 : _qData_customerName.trim().toLowerCase()) || ((_l_projectName = l.projectName) === null || _l_projectName === void 0 ? void 0 : _l_projectName.toLowerCase()) === ((_qData_customerName1 = qData.customerName) === null || _qData_customerName1 === void 0 ? void 0 : _qData_customerName1.trim().toLowerCase());
            });
            if (matchedLead) {
                // Fire-and-forget: advance the linked lead's status
                updateLead(matchedLead.id, {
                    status: 'Quotation'
                }).catch(()=>{});
            }
            setPrefillQuotationData(null);
            navigate.push('/sales/quotations');
        }
    };
    /** Convert quotation → order, then navigate to orders view. */ const onConvertToOrder = async (qtn)=>{
        showToast('Sales: Converting quotation to order.');
        const res = await confirmOrder(qtn);
        if (res === null || res === void 0 ? void 0 : res.success) {
            showToast('🎉 Order created from quotation!');
            navigate.push('/sales/orders');
        }
    };
    /** Create a direct order, then navigate to orders view. */ const onCreateOrder = async (orderData)=>{
        const res = await createOrder(orderData);
        if (res === null || res === void 0 ? void 0 : res.success) {
            showToast('🎉 Order created successfully!');
            navigate.push('/sales/orders');
        }
    };
    // ── Payment helpers (inline — payment module not yet extracted) ─────────────
    const onReceivePayment = async (invoiceId, amount, date, mode, ref, notes)=>{
        const inv = payments.find((p)=>p.id === invoiceId);
        if (!inv) return;
        const matchedOrder = orders.find((o)=>o.orderNo === inv.orderNo);
        const orderId = matchedOrder ? matchedOrder.dbId || matchedOrder.id : null;
        if (!orderId) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'error',
                title: 'Order ID Not Found',
                text: 'Could not resolve the order reference for this payment.'
            });
            return;
        }
        showToast('Sales: Recording payment and routing to Finance review…');
        try {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/workflow/transition', {
                entity: 'sales_order',
                entityId: orderId,
                transitionName: 'RECORD_PAYMENT',
                payload: {
                    amount: Number(amount),
                    utr_number: ref || "UTR-".concat(Date.now()),
                    bank_name: mode || 'Direct Transfer',
                    payment_date: date || new Date().toISOString().split('T')[0]
                },
                notes: notes || 'Payment receipt logged by Sales.'
            });
            if (res.success) {
                await syncData();
                showToast('Payment recorded successfully and queued for Finance verification.');
                navigate.push('/sales/payment-followup');
            }
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'error',
                title: 'Payment Recording Failed',
                text: err.message
            });
        }
    };
    const handleSalesConfirmPayment = async (order)=>{
        const total = Number(order.grand_total || order.total_amount || 0);
        const verified = Number(order.verified_paid_amount || 0);
        const remaining = order.balance_amount !== undefined ? Number(order.balance_amount) : total - verified;
        if (remaining <= 0) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'info',
                title: 'Order Fully Paid',
                text: 'This order has no outstanding balance.'
            });
            return;
        }
        const { value: formValues } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Record Client Payment Collection',
            html: '\n        <div style="text-align: left; font-family: sans-serif; font-size: 13px; color: var(--color-text-primary);">\n          <div style="margin-bottom: 10px; display: grid; grid-template-columns: 120px 1fr; gap: 8px;">\n            <span><strong>Customer:</strong></span> <span>'.concat(order.customer_name || 'N/A', "</span>\n            <span><strong>Order Ref:</strong></span> <span>").concat(order.orderNo || order.order_number || "ORD-".concat(order.id), "</span>\n            <span><strong>Total Order:</strong></span> <span>INR ").concat(total.toLocaleString('en-IN', {
                minimumFractionDigits: 2
            }), "</span>\n            <span><strong>Verified Paid:</strong></span> <span>INR ").concat(verified.toLocaleString('en-IN', {
                minimumFractionDigits: 2
            }), '</span>\n            <span><strong>Remaining Bal:</strong></span> <span style="color: var(--color-accent-teal); font-weight: 700;">INR ').concat(remaining.toLocaleString('en-IN', {
                minimumFractionDigits: 2
            }), '</span>\n          </div>\n          <hr style="border: 0; border-top: 1px solid var(--color-border); margin: 12px 0;" />\n          \n          <div style="margin-bottom: 12px;">\n            <label style="display: block; font-weight: bold; margin-bottom: 6px;">Amount Received (INR) *</label>\n            <input id="swal-pay-amount" type="number" class="swal2-input" value="').concat(remaining, '" style="margin: 0; width: 100%; border: 1px solid var(--color-border); border-radius: 6px; padding: 8px; background: var(--color-sidebar-bg); color: var(--color-text-primary);" />\n          </div>\n          \n          <div style="margin-bottom: 12px;">\n            <label style="display: block; font-weight: bold; margin-bottom: 6px;">Remarks</label>\n            <textarea id="swal-remarks" placeholder="Add payment notes..." style="width: 100%; height: 50px; border: 1px solid var(--color-border); border-radius: 6px; padding: 8px; background: var(--color-sidebar-bg); color: var(--color-text-primary); resize: none;"></textarea>\n          </div>\n        </div>\n      '),
            showCancelButton: true,
            confirmButtonText: 'Submit Request',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'swal-premium-popup',
                title: 'swal-premium-title',
                confirmButton: 'swal-premium-confirm-btn',
                cancelButton: 'swal-premium-cancel-btn'
            },
            buttonsStyling: false,
            focusConfirm: false,
            preConfirm: ()=>{
                const mode = 'NEFT';
                const ref = "AUTO-".concat(Date.now());
                const amountInput = document.getElementById('swal-pay-amount').value.trim();
                const remarks = document.getElementById('swal-remarks').value.trim();
                const proof = '';
                if (!amountInput) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].showValidationMessage('Please fill all required fields (*)');
                    return false;
                }
                const paymentAmount = Number(amountInput);
                if (isNaN(paymentAmount) || paymentAmount <= 0) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].showValidationMessage('Amount received must be a positive number.');
                    return false;
                }
                if (paymentAmount > remaining) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].showValidationMessage("Amount cannot exceed the remaining balance of INR ".concat(remaining.toLocaleString('en-IN')));
                    return false;
                }
                return {
                    paymentAmount,
                    paymentMode: mode,
                    transactionReference: ref,
                    remarks,
                    proofDocument: proof
                };
            }
        });
        if (formValues) {
            try {
                showToast('Submitting payment request to Finance…');
                const payload = {
                    orderId: order.id,
                    paymentAmount: formValues.paymentAmount,
                    paymentMode: formValues.paymentMode,
                    transactionReference: formValues.transactionReference,
                    remarks: formValues.remarks,
                    files: formValues.proofDocument ? [
                        {
                            file_name: formValues.proofDocument,
                            file_path: "/uploads/".concat(formValues.proofDocument)
                        }
                    ] : []
                };
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/payment-verification/request', payload);
                if (response.success) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                        icon: 'success',
                        title: 'Request Submitted',
                        text: "Payment request ".concat(response.data.requestNumber, " for INR ").concat(formValues.paymentAmount.toLocaleString('en-IN'), " is pending Finance verification."),
                        timer: 3000,
                        showConfirmButton: false
                    });
                    await syncData();
                }
            } catch (err) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'error',
                    title: 'Submission Failed',
                    text: err.message
                });
            }
        }
    };
    const uploadReplacementFiles = async (files)=>{
        const token = localStorage.getItem('token') || localStorage.getItem('himalaya_token');
        const companyId = localStorage.getItem('companyId') || (user === null || user === void 0 ? void 0 : user.company_id);
        const uploaded = [];
        for (const file of files){
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/uploads/replacements', {
                method: 'POST',
                headers: {
                    ...token ? {
                        Authorization: "Bearer ".concat(token)
                    } : {},
                    ...companyId ? {
                        'X-Company-Id': String(companyId)
                    } : {}
                },
                body: formData
            });
            const body = await res.json();
            if (!res.ok || body.success === false) {
                throw new Error(body.error || body.message || "Failed to upload ".concat(file.name));
            }
            uploaded.push(body.data);
        }
        return uploaded;
    };
    const handleAskReplacement = async (order)=>{
        var _order_customer;
        const escapeHtml = (value)=>String(value !== null && value !== void 0 ? value : '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        const items = Array.isArray(order.items) && order.items.length ? order.items : Array.isArray(order.detailedItems) ? order.detailedItems : [];
        const realItems = items.filter((item)=>item.id || item.order_item_id || item.orderItemId);
        if (!order.id || realItems.length === 0) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'error',
                title: 'Replacement Unavailable',
                text: 'This order does not have item-level details loaded yet. Please refresh and try again.'
            });
            return;
        }
        const itemOptions = realItems.map((item, index)=>{
            const itemId = item.id || item.order_item_id || item.orderItemId;
            const productName = item.product_name || item.productName || order.products || "Item ".concat(index + 1);
            var _item_quantity_dispatched, _ref, _ref1, _ref2;
            const deliveredQty = Number((_ref2 = (_ref1 = (_ref = (_item_quantity_dispatched = item.quantity_dispatched) !== null && _item_quantity_dispatched !== void 0 ? _item_quantity_dispatched : item.delivered_qty) !== null && _ref !== void 0 ? _ref : item.quantity) !== null && _ref1 !== void 0 ? _ref1 : item.quantity_ordered) !== null && _ref2 !== void 0 ? _ref2 : 0) || 0;
            var _item_already_replaced_qty, _ref3;
            const alreadyApproved = Number((_ref3 = (_item_already_replaced_qty = item.already_replaced_qty) !== null && _item_already_replaced_qty !== void 0 ? _item_already_replaced_qty : item.alreadyReplacedQty) !== null && _ref3 !== void 0 ? _ref3 : 0) || 0;
            var _item_replacement_available_qty, _ref4;
            const availableQty = item.replacement_available_qty !== undefined || item.replacementAvailableQty !== undefined ? Number((_ref4 = (_item_replacement_available_qty = item.replacement_available_qty) !== null && _item_replacement_available_qty !== void 0 ? _item_replacement_available_qty : item.replacementAvailableQty) !== null && _ref4 !== void 0 ? _ref4 : 0) || 0 : Math.max(0, deliveredQty - alreadyApproved);
            return '<option value="'.concat(itemId, '" data-delivered="').concat(deliveredQty, '" data-approved="').concat(alreadyApproved, '" data-available="').concat(availableQty, '" data-product="').concat(escapeHtml(productName), '">').concat(escapeHtml(productName), " - Available ").concat(availableQty, "</option>");
        }).join('');
        const { value } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Replacement Request',
            html: '\n        <div style="text-align:left; display:flex; flex-direction:column; gap:12px; font-size:13px;">\n          <div style="display:grid; grid-template-columns:110px 1fr; gap:8px;">\n            <strong>Order</strong><span>'.concat(order.orderNo || order.order_number, "</span>\n            <strong>Customer</strong><span>").concat(order.customerName || ((_order_customer = order.customer) === null || _order_customer === void 0 ? void 0 : _order_customer.name) || 'N/A', '</span>\n          </div>\n          <div>\n            <label style="display:block; font-weight:800; margin-bottom:6px;">Product *</label>\n            <select id="replacement-item" style="width:100%; height:38px; border:1px solid var(--color-border); border-radius:8px; padding:0 10px;">\n              ').concat(itemOptions, '\n            </select>\n          </div>\n          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;">\n            <div style="background:#F5FAFE; border:1px solid #DCE5F0; border-radius:8px; padding:10px;">\n              <div style="font-size:11px; font-weight:800; color:#5E6B82; text-transform:uppercase;">Delivered Qty</div>\n              <div id="replacement-delivered" style="font-size:18px; font-weight:900; color:#24345C;">0</div>\n            </div>\n            <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:10px;">\n              <div style="font-size:11px; font-weight:800; color:#1e40af; text-transform:uppercase;">Already Approved</div>\n              <div id="replacement-approved" style="font-size:18px; font-weight:900; color:#1e3a8a;">0</div>\n            </div>\n            <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:8px; padding:10px;">\n              <div style="font-size:11px; font-weight:800; color:#9a3412; text-transform:uppercase;">Available</div>\n              <div id="replacement-available" style="font-size:18px; font-weight:900; color:#9a3412;">0</div>\n            </div>\n          </div>\n          <div>\n            <label style="display:block; font-weight:800; margin-bottom:6px;">Replacement Qty *</label>\n            <input id="replacement-qty" type="number" min="0.01" step="0.01" class="swal2-input" style="margin:0; width:100%;" />\n          </div>\n          <div>\n            <label style="display:block; font-weight:800; margin-bottom:6px;">Reason *</label>\n            <textarea id="replacement-reason" placeholder="Broken during unloading" style="width:100%; min-height:82px; border:1px solid var(--color-border); border-radius:8px; padding:10px; resize:vertical;"></textarea>\n          </div>\n          <div>\n            <label style="display:block; font-weight:800; margin-bottom:6px;">Upload Images / PDF</label>\n            <input id="replacement-files" type="file" multiple accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" style="width:100%;" />\n          </div>\n        </div>\n      '),
            showCancelButton: true,
            confirmButtonText: 'Submit Request',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'swal-premium-popup',
                title: 'swal-premium-title',
                confirmButton: 'swal-premium-confirm-btn',
                cancelButton: 'swal-premium-cancel-btn'
            },
            buttonsStyling: false,
            focusConfirm: false,
            didOpen: ()=>{
                const select = document.getElementById('replacement-item');
                const qtyInput = document.getElementById('replacement-qty');
                const syncSelectedItem = ()=>{
                    const selected = select.options[select.selectedIndex];
                    const deliveredQty = Number((selected === null || selected === void 0 ? void 0 : selected.dataset.delivered) || 0);
                    const alreadyApproved = Number((selected === null || selected === void 0 ? void 0 : selected.dataset.approved) || 0);
                    const availableQty = Number((selected === null || selected === void 0 ? void 0 : selected.dataset.available) || 0);
                    document.getElementById('replacement-delivered').textContent = deliveredQty;
                    document.getElementById('replacement-approved').textContent = alreadyApproved;
                    document.getElementById('replacement-available').textContent = availableQty;
                    qtyInput.max = String(availableQty);
                    qtyInput.value = availableQty > 0 ? Math.min(1, availableQty) : '';
                    qtyInput.placeholder = availableQty > 0 ? "Max ".concat(availableQty) : 'No quantity available';
                };
                select.addEventListener('change', syncSelectedItem);
                syncSelectedItem();
            },
            preConfirm: ()=>{
                const select = document.getElementById('replacement-item');
                const selected = select.options[select.selectedIndex];
                const qty = Number(document.getElementById('replacement-qty').value);
                const reason = document.getElementById('replacement-reason').value.trim();
                const availableQty = Number(selected.dataset.available || 0);
                const files = Array.from(document.getElementById('replacement-files').files || []);
                if (!select.value || !qty || qty <= 0 || !reason) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].showValidationMessage('Product, replacement quantity, and reason are required.');
                    return false;
                }
                if (reason.length < 10) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].showValidationMessage('Reason must be at least 10 characters.');
                    return false;
                }
                if (availableQty <= 0) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].showValidationMessage('This product has no replacement quantity available.');
                    return false;
                }
                if (qty > availableQty) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].showValidationMessage("Replacement quantity cannot exceed available quantity (".concat(availableQty, ")."));
                    return false;
                }
                return {
                    orderItemId: Number(select.value),
                    requestedQty: qty,
                    reason,
                    files
                };
            }
        });
        if (!value) return;
        try {
            showToast('Submitting replacement request...');
            __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().requestReplacement({
                orderId: order.id || order.orderNo,
                items: [
                    {
                        productId: value.orderItemId,
                        quantity: value.requestedQty,
                        reason: value.reason,
                        condition: 'Damaged / Defective'
                    }
                ],
                reason: value.reason,
                actorName: (user === null || user === void 0 ? void 0 : user.name) || 'Sales User'
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'success',
                title: 'Replacement Requested',
                text: "Replacement request submitted successfully and is pending Plant Head approval.",
                timer: 2500,
                showConfirmButton: false
            });
            await syncData();
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'error',
                title: 'Replacement Request Failed',
                text: err.message
            });
        }
    };
    const handleAskReturn = async (order)=>{
        var _order_customer;
        const escapeHtml = (value)=>String(value !== null && value !== void 0 ? value : '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        const items = Array.isArray(order.items) && order.items.length ? order.items : Array.isArray(order.detailedItems) ? order.detailedItems : [];
        const realItems = items.filter((item)=>item.id || item.order_item_id || item.orderItemId || item.product_name || item.productName);
        const itemOptions = realItems.length > 0 ? realItems.map((item, index)=>{
            const itemId = item.id || item.order_item_id || item.orderItemId || index + 1;
            const productName = item.product_name || item.productName || order.products || "Item ".concat(index + 1);
            var _item_quantity_dispatched, _ref, _ref1, _ref2;
            const deliveredQty = Number((_ref2 = (_ref1 = (_ref = (_item_quantity_dispatched = item.quantity_dispatched) !== null && _item_quantity_dispatched !== void 0 ? _item_quantity_dispatched : item.delivered_qty) !== null && _ref !== void 0 ? _ref : item.quantity) !== null && _ref1 !== void 0 ? _ref1 : item.quantity_ordered) !== null && _ref2 !== void 0 ? _ref2 : 0) || 0;
            return '<option value="'.concat(itemId, '" data-delivered="').concat(deliveredQty, '" data-product="').concat(escapeHtml(productName), '">').concat(escapeHtml(productName), " (Delivered: ").concat(deliveredQty, ")</option>");
        }).join('') : '<option value="all" data-delivered="'.concat(order.quantity || order.totalQty || 10, '" data-product="').concat(escapeHtml(order.products || 'Overall Order'), '">').concat(escapeHtml(order.products || 'Overall Order'), "</option>");
        const { value } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Request Order Return / Take Back',
            html: '\n        <div style="text-align:left; display:flex; flex-direction:column; gap:12px; font-size:13px;">\n          <div style="display:grid; grid-template-columns:110px 1fr; gap:8px;">\n            <strong>Order No:</strong><span>'.concat(order.orderNo || order.order_number || order.id, "</span>\n            <strong>Customer:</strong><span>").concat(order.customerName || ((_order_customer = order.customer) === null || _order_customer === void 0 ? void 0 : _order_customer.name) || 'N/A', '</span>\n          </div>\n          <div>\n            <label style="display:block; font-weight:800; margin-bottom:6px; color:#334155;">Select Item to Return *</label>\n            <select id="return-item" style="width:100%; height:38px; border:1.5px solid var(--color-border); border-radius:8px; padding:0 10px; font-size:13px;">\n              ').concat(itemOptions, '\n            </select>\n          </div>\n          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">\n            <div>\n              <label style="display:block; font-weight:800; margin-bottom:6px; color:#334155;">Return Quantity *</label>\n              <input id="return-qty" type="number" min="0.01" step="0.01" placeholder="Enter Qty" class="swal2-input" style="margin:0; width:100%; height:38px; font-size:13px;" />\n            </div>\n            <div>\n              <label style="display:block; font-weight:800; margin-bottom:6px; color:#334155;">Item Condition *</label>\n              <select id="return-condition" style="width:100%; height:38px; border:1.5px solid var(--color-border); border-radius:8px; padding:0 10px; font-size:13px;">\n                <option value="Damaged in Transit">Damaged in Transit</option>\n                <option value="Defective Material">Defective Material</option>\n                <option value="Excess / Unused">Excess / Unused</option>\n                <option value="Incorrect Specification">Incorrect Specification</option>\n              </select>\n            </div>\n          </div>\n          <div>\n            <label style="display:block; font-weight:800; margin-bottom:6px; color:#334155;">Reason for Return *</label>\n            <textarea id="return-reason" placeholder="Explain details regarding reverse pickup requirement..." style="width:100%; min-height:75px; border:1.5px solid var(--color-border); border-radius:8px; padding:10px; resize:vertical; font-size:13px; font-family:inherit;"></textarea>\n          </div>\n          <div>\n            <label style="display:block; font-weight:800; margin-bottom:6px; color:#334155;">Upload Photos / Supporting Documents</label>\n            <input id="return-files" type="file" multiple accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" style="width:100%; font-size:12px;" />\n          </div>\n        </div>\n      '),
            showCancelButton: true,
            confirmButtonText: 'Submit Return Request',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'swal-premium-popup',
                title: 'swal-premium-title',
                confirmButton: 'swal-premium-confirm-btn',
                cancelButton: 'swal-premium-cancel-btn'
            },
            buttonsStyling: false,
            focusConfirm: false,
            didOpen: ()=>{
                const select = document.getElementById('return-item');
                const qtyInput = document.getElementById('return-qty');
                const syncSelectedItem = ()=>{
                    const selected = select.options[select.selectedIndex];
                    const deliveredQty = Number((selected === null || selected === void 0 ? void 0 : selected.dataset.delivered) || 0);
                    if (deliveredQty > 0) {
                        qtyInput.max = String(deliveredQty);
                        qtyInput.value = Math.min(1, deliveredQty);
                        qtyInput.placeholder = "Max ".concat(deliveredQty);
                    } else {
                        qtyInput.value = '1';
                        qtyInput.placeholder = 'Enter Qty';
                    }
                };
                select.addEventListener('change', syncSelectedItem);
                syncSelectedItem();
            },
            preConfirm: ()=>{
                const select = document.getElementById('return-item');
                const qty = Number(document.getElementById('return-qty').value);
                const condition = document.getElementById('return-condition').value;
                const reason = document.getElementById('return-reason').value.trim();
                const files = Array.from(document.getElementById('return-files').files || []);
                if (!qty || qty <= 0 || !reason) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].showValidationMessage('Return quantity and detailed reason are required.');
                    return false;
                }
                if (reason.length < 8) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].showValidationMessage('Please enter a more detailed reason for the return (at least 8 characters).');
                    return false;
                }
                return {
                    orderItemId: select.value,
                    requestedQty: qty,
                    condition,
                    reason,
                    files
                };
            }
        });
        if (!value) return;
        try {
            showToast('Submitting return request...');
            __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().requestReturn({
                orderId: order.id || order.orderNo,
                items: [
                    {
                        productId: value.orderItemId,
                        quantity: value.requestedQty,
                        reason: value.reason,
                        condition: value.condition || 'Customer Rejected'
                    }
                ],
                reason: value.reason,
                actorName: (user === null || user === void 0 ? void 0 : user.name) || 'Sales User'
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'success',
                title: 'Return Pick-Up Requested',
                text: "Reverse pickup request submitted successfully. Dispatch & Logistics department has been notified to schedule take-back collection.",
                timer: 3000,
                showConfirmButton: false
            });
            await syncData();
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'error',
                title: 'Return Request Failed',
                text: err.message
            });
        }
    };
    const parseOrderFollowup = (notesJson)=>{
        if (!notesJson) return {
            text: '',
            nextDate: null
        };
        try {
            const parsed = JSON.parse(notesJson);
            if (parsed && (parsed.text !== undefined || parsed.nextDate !== undefined)) {
                return {
                    text: parsed.text || '',
                    nextDate: parsed.nextDate || null
                };
            }
        } catch (e) {}
        return {
            text: notesJson,
            nextDate: null
        };
    };
    const handleUpdateFollowup = async (order)=>{
        const followup = parseOrderFollowup(order.notes);
        const { value: formValues } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Payment Follow-up & Reminder',
            html: '\n        <div style="text-align: left; display: flex; flex-direction: column; gap: 14px;">\n          <div style="margin-bottom: 12px;">\n            <label for="swal-followup-text" style="display:block; font-weight:700; margin-bottom:6px; font-size:13px; color:#475569;">Follow-up Conversation Note:</label>\n            <textarea id="swal-followup-text" style="width: 100%; box-sizing: border-box; margin: 0; min-height: 80px; padding: 10px; border: 1.5px solid var(--color-border); border-radius: 8px; font-size: 13.5px; font-family: inherit;" placeholder="e.g. Spoke to accountant, payment scheduled for Tuesday...">'.concat(followup.text || '', '</textarea>\n          </div>\n          <div style="margin-bottom: 4px;">\n            <label for="swal-reminder-date" style="display:block; font-weight:700; margin-bottom:6px; font-size:13px; color:#475569;">Next Reminder Date (Optional):</label>\n            <input type="date" id="swal-reminder-date" style="width: 100%; box-sizing: border-box; margin: 0; height: 40px; padding: 0 10px; border: 1.5px solid var(--color-border); border-radius: 8px; font-size: 13.5px; font-family: inherit;" value="').concat(followup.nextDate || '', '">\n          </div>\n        </div>\n      '),
            focusConfirm: false,
            preConfirm: ()=>({
                    text: document.getElementById('swal-followup-text').value,
                    nextDate: document.getElementById('swal-reminder-date').value || null
                }),
            showCancelButton: true,
            confirmButtonText: 'Save Details',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'swal-premium-popup',
                title: 'swal-premium-title',
                confirmButton: 'swal-premium-confirm-btn',
                cancelButton: 'swal-premium-cancel-btn'
            },
            buttonsStyling: false
        });
        if (formValues) {
            showToast('Saving follow-up details…');
            const res = await updateFollowup(order.id, formValues.text, formValues.nextDate);
            if (!(res === null || res === void 0 ? void 0 : res.success)) {
            // Error already shown by hook
            }
        }
    };
    const onSendReminder = (invoiceId)=>{
        const inv = payments.find((p)=>p.id === invoiceId);
        if (inv) {
            const outstandingVal = inv.totalAmount - inv.paidAmount;
            const fmt = (v)=>v >= 100000 ? "₹".concat((v / 100000).toFixed(2), " L") : "₹".concat(Math.round(v).toLocaleString('en-IN'));
            dispatch({
                type: 'ADD_NOTIFICATION',
                payload: {
                    id: Date.now() + Math.random(),
                    title: 'Payment Reminder Sent',
                    message: "Reminder: Balance of ".concat(fmt(outstandingVal), " outstanding for ").concat(inv.customerName, " (Invoice #").concat(inv.invoiceNo, ")."),
                    department: 'Sales',
                    priority: 'High',
                    date: new Date().toISOString().split('T')[0],
                    read: false,
                    referenceId: inv.orderNo
                }
            });
        }
        showToast("Receivable reminder email sent for Invoice ID ".concat(invoiceId));
    };
    const onSendPDF = (qId)=>showToast("PDF invoice sent for Quotation #".concat(qId));
    // ── Route → View mapping ───────────────────────────────────────────────────
    switch(currentView){
        case 'daily-task':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DailyTaskView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                state: state,
                dispatch: dispatch,
                navigate: navigate,
                showToast: showToast
            }, void 0, false, {
                fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                lineNumber: 765,
                columnNumber: 14
            }, this);
        case 'dashboard':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DashboardView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                state: state,
                dispatch: dispatch,
                navigate: navigate,
                onQuickAction: handleActionClick
            }, void 0, false, {
                fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                lineNumber: 768,
                columnNumber: 14
            }, this);
        case 'leads':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$O2PWorkflowBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        accentColor: "#3b82f6"
                    }, void 0, false, {
                        fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                        lineNumber: 773,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LeadsView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        leads: leads,
                        reminders: reminders,
                        samples: samples,
                        quotations: quotations,
                        orders: orders,
                        onAddLeadClick: ()=>navigate.push('/sales/create-lead'),
                        onEditLeadClick: (id)=>navigate.push("/sales/edit-lead/".concat(id)),
                        onConvertToSample: convertToSample,
                        onGenerateQuotation: generateQuotationFromLead,
                        onUpdateStatus: updateLeadStatus,
                        onUpdateLead: updateLead,
                        onAddFollowup: addFollowup,
                        onDeleteLead: deleteLead,
                        onSaveReminder: createReminder,
                        onUpdateReminder: updateReminder,
                        onCompleteReminder: completeReminder,
                        searchQuery: globalSearch
                    }, void 0, false, {
                        fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                        lineNumber: 774,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true);
        case 'create-lead':
        case 'edit-lead':
            {
                const leadToEdit = leadId ? leads.find((l)=>l.id === Number(leadId)) : null;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CreateLead$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    leads: leads,
                    onAddLead: leadToEdit ? (updatedData)=>updateLead(leadToEdit.id, updatedData) : addLead,
                    onGenerateQuotation: !leadToEdit ? generateQuotationFromLead : undefined,
                    onDeleteLead: deleteLead,
                    onCancel: ()=>navigate.push('/sales/leads'),
                    editingLead: leadToEdit
                }, leadToEdit ? "edit-".concat(leadToEdit.id) : 'new', false, {
                    fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                    lineNumber: 800,
                    columnNumber: 9
                }, this);
            }
        case 'create-sample':
            {
                let leadIdFromUrl = null;
                if ("TURBOPACK compile-time truthy", 1) {
                    const urlParams = new URLSearchParams(window.location.search);
                    leadIdFromUrl = urlParams.get('leadId');
                }
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CreateSample$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    leads: leads,
                    defaultLeadId: leadIdFromUrl,
                    onAddSample: async (data)=>{
                        const targetLead = leads.find((l)=>String(l.id) === String(data.leadId));
                        if (targetLead) convertToSample(targetLead, data);
                    },
                    onCancel: ()=>navigate.push('/sales/leads')
                }, void 0, false, {
                    fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                    lineNumber: 823,
                    columnNumber: 9
                }, this);
            }
        case 'edit-sample':
            {
                const sampleToEdit = sampleId ? samples.find((s)=>s.id === Number(sampleId)) : null;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$EditSample$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    sample: sampleToEdit,
                    onSave: (updatedData)=>{
                        updateSample(sampleToEdit.id, updatedData);
                        navigate.push('/sales/samples');
                    },
                    onCancel: ()=>navigate.push('/sales/samples')
                }, sampleToEdit ? "edit-".concat(sampleToEdit.id) : 'new', false, {
                    fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                    lineNumber: 838,
                    columnNumber: 9
                }, this);
            }
        case 'samples':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SamplesView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                samples: samples,
                onUpdateSampleStatus: updateSampleStatus,
                onUpdateSample: updateSample,
                onMoveToQuotation: onMoveToQuotation,
                onCreateReplacementSample: createReplacementSample
            }, void 0, false, {
                fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                lineNumber: 852,
                columnNumber: 9
            }, this);
        case 'quotations':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$O2PWorkflowBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        accentColor: "#8b5cf6"
                    }, void 0, false, {
                        fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                        lineNumber: 864,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$QuotationsView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        quotations: quotations,
                        leads: leads,
                        customers: customers,
                        reminders: reminders,
                        onCreateQuoteClick: ()=>{
                            __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().clearQuotationDraft();
                            navigate.push('/sales/create-quotation');
                        },
                        onCreateLead: ()=>navigate.push('/sales/create-lead'),
                        onUpdateQuotationStatus: (qId, status)=>updateQuotation(qId, {
                                status
                            }),
                        onUpdateQuotation: (qId, data)=>updateQuotation(qId, data),
                        onConvertToOrder: onConvertToOrder,
                        onSendPDF: onSendPDF,
                        onSaveReminder: createReminder,
                        onUpdateReminder: updateReminder,
                        onCompleteReminder: completeReminder,
                        prefillData: prefillQuotationData,
                        clearPrefill: ()=>setPrefillQuotationData(null),
                        searchQuery: globalSearch
                    }, void 0, false, {
                        fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                        lineNumber: 865,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true);
        case 'create-quotation':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CreateQuotation$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                leads: leads,
                customers: customers,
                prefilledCustomer: (prefillQuotationData === null || prefillQuotationData === void 0 ? void 0 : prefillQuotationData.leadName) || '',
                prefilledProduct: (prefillQuotationData === null || prefillQuotationData === void 0 ? void 0 : prefillQuotationData.product) || (prefillQuotationData === null || prefillQuotationData === void 0 ? void 0 : prefillQuotationData.productName) || '',
                prefilledQuantity: (prefillQuotationData === null || prefillQuotationData === void 0 ? void 0 : prefillQuotationData.quantity) || 1,
                onAddQuotation: onAddQuotation,
                onCreateLead: ()=>navigate.push('/sales/create-lead'),
                onCancel: ()=>{
                    setPrefillQuotationData(null);
                    navigate.push('/sales/quotations');
                }
            }, (prefillQuotationData === null || prefillQuotationData === void 0 ? void 0 : prefillQuotationData.id) || 'new', false, {
                fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                lineNumber: 891,
                columnNumber: 9
            }, this);
        case 'create-order':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CreateOrder$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                customers: customers,
                onCreateOrder: onCreateOrder,
                onCancel: ()=>navigate.push('/sales/orders')
            }, void 0, false, {
                fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                lineNumber: 909,
                columnNumber: 9
            }, this);
        case 'orders':
            {
                const onUpdateOrderStatus = async (orderId, status)=>{
                    // Resolve the real order ID
                    const matchedOrder = orders.find((o)=>o.orderNo === orderId || o.id === orderId);
                    const orderDbId = matchedOrder ? matchedOrder.id || matchedOrder.dbId : orderId;
                    if (status === 'ORDER_CONFIRMED') {
                        showToast('Confirming order…');
                        try {
                            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].patch("/sales/orders/".concat(orderDbId, "/confirm"), {
                                actor: (user === null || user === void 0 ? void 0 : user.name) || 'Sales'
                            });
                            if (res.success) {
                                showToast('✅ Order confirmed!');
                                await syncData();
                            } else {
                                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                                    icon: 'error',
                                    title: 'Confirmation Failed',
                                    text: res.message || 'Failed to confirm order'
                                });
                            }
                        } catch (err) {
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                                icon: 'error',
                                title: 'Error',
                                text: err.message
                            });
                        }
                        return;
                    }
                    if (status === 'PLANT_PENDING') {
                        showToast('Confirming and sending order to Plant Head…');
                        try {
                            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].patch("/sales/orders/".concat(orderDbId, "/confirm"), {
                                actor: (user === null || user === void 0 ? void 0 : user.name) || 'Sales'
                            });
                            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].patch("/sales/orders/".concat(orderDbId, "/send-to-plant"), {
                                actor: (user === null || user === void 0 ? void 0 : user.name) || 'Sales'
                            });
                            if (res.success) {
                                dispatch({
                                    type: 'UPDATE_ORDER_STATUS',
                                    payload: {
                                        orderNo: orderId,
                                        id: orderDbId,
                                        status: 'PLANT_PENDING',
                                        workflowStatus: 'PLANT_PENDING',
                                        salesStatus: 'Confirmed',
                                        currentDepartment: 'Plant Head',
                                        overallStage: 'Planning'
                                    }
                                });
                                // O2P: mark order confirmed in workflow
                                o2p.setActiveOrder(orderDbId, 4);
                                o2p.confirmSalesOrder({
                                    orderId: orderDbId,
                                    actor: (user === null || user === void 0 ? void 0 : user.name) || 'Sales'
                                });
                                showToast('✅ Order confirmed and sent to Plant Head!');
                                await syncData();
                                navigate.push('/plant-head/incoming-orders');
                            } else {
                                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                                    icon: 'error',
                                    title: 'Failed',
                                    text: res.message || 'Failed to send to Plant Head'
                                });
                            }
                        } catch (err) {
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                                icon: 'error',
                                title: 'Error',
                                text: (err === null || err === void 0 ? void 0 : err.message) || 'Unexpected error'
                            });
                        }
                        return;
                    }
                    dispatch({
                        type: 'UPDATE_ORDER_STATUS',
                        payload: {
                            id: orderDbId,
                            orderNo: (matchedOrder === null || matchedOrder === void 0 ? void 0 : matchedOrder.orderNo) || orderId,
                            status
                        }
                    });
                    showToast("Order status updated to ".concat(status));
                };
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$O2PWorkflowBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            accentColor: "#a855f7"
                        }, void 0, false, {
                            fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                            lineNumber: 984,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$OrdersView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            orders: orders,
                            leads: leads,
                            customers: customers,
                            onUpdateOrderStatus: onUpdateOrderStatus,
                            onUpdateOrder: (id, updatedData)=>{
                                dispatch({
                                    type: 'UPDATE_ORDER',
                                    payload: {
                                        orderNo: id,
                                        ...updatedData
                                    }
                                });
                                showToast('Order details updated successfully.');
                            },
                            onUpdateDispatchStatus: (id, status)=>{
                                dispatch({
                                    type: 'UPDATE_ORDER',
                                    payload: {
                                        orderNo: id,
                                        dispatchStatus: status
                                    }
                                });
                                showToast("Logistics status set to ".concat(status));
                            },
                            onAskReplacement: handleAskReplacement,
                            onAskReturn: handleAskReturn,
                            searchQuery: globalSearch,
                            setSearchQuery: setGlobalSearch,
                            reminders: reminders,
                            onSaveReminder: createReminder,
                            onUpdateReminder: updateReminder,
                            onCompleteReminder: completeReminder
                        }, void 0, false, {
                            fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                            lineNumber: 985,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true);
            }
        case 'production-status':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SalesProductionStatusView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                orders: orders,
                searchQuery: globalSearch
            }, void 0, false, {
                fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                lineNumber: 1012,
                columnNumber: 14
            }, this);
        case 'payment-followup':
            {
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$O2PWorkflowBanner$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            accentColor: "#0ea5e9"
                        }, void 0, false, {
                            fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                            lineNumber: 1017,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PaymentFollowupERPView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            orders: orders,
                            reminders: reminders,
                            onSaveReminder: createReminder,
                            onUpdateReminder: updateReminder,
                            onCompleteReminder: completeReminder
                        }, void 0, false, {
                            fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                            lineNumber: 1018,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true);
            }
        case 'create-payment':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CreatePayment$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                payments: payments,
                onReceivePayment: onReceivePayment,
                onCancel: ()=>navigate.push('/sales/payment-followup')
            }, void 0, false, {
                fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                lineNumber: 1031,
                columnNumber: 9
            }, this);
        case 'customers':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CustomersView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                customers: customers,
                orders: orders,
                searchQuery: globalSearch
            }, void 0, false, {
                fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                lineNumber: 1039,
                columnNumber: 14
            }, this);
        case 'customer-complaints':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CustomerComplaintManagement$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                mode: "sales",
                orders: orders,
                currentUser: user
            }, void 0, false, {
                fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                lineNumber: 1042,
                columnNumber: 14
            }, this);
        case 'reports':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ReportsView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                leads: leads,
                orders: orders,
                payments: payments,
                customers: customers,
                user: user
            }, void 0, false, {
                fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                lineNumber: 1045,
                columnNumber: 14
            }, this);
        default:
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DashboardView$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                state: state,
                dispatch: dispatch,
                navigate: navigate,
                onQuickAction: handleActionClick
            }, void 0, false, {
                fileName: "[project]/modules/sales/pages/SalesPortal.jsx",
                lineNumber: 1048,
                columnNumber: 14
            }, this);
    }
}
_s(SalesPortal, "ty5BeLZa04Hfu3bseWiCRmnRvKg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useERP"],
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$searchStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$searchStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$hooks$2f$useLeads$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLeads"],
        __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$hooks$2f$useSamples$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSamples"],
        __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$hooks$2f$useQuotations$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuotations"],
        __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$hooks$2f$useReminders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useReminders"],
        __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$hooks$2f$useOrders$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useOrders"],
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$hooks$2f$useO2PWorkflow$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useO2PWorkflow"]
    ];
});
_c = SalesPortal;
var _c;
__turbopack_context__.k.register(_c, "SalesPortal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=modules_sales_8f0c4396._.js.map