(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/utils/paymentTerms.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PAYMENT_TERMS_OPTIONS",
    ()=>PAYMENT_TERMS_OPTIONS,
    "calculateDueDate",
    ()=>calculateDueDate,
    "calculateRemainingDays",
    ()=>calculateRemainingDays,
    "formatRemainingDays",
    ()=>formatRemainingDays,
    "getPaymentStatus",
    ()=>getPaymentStatus,
    "validatePaymentTerms",
    ()=>validatePaymentTerms
]);
const PAYMENT_TERMS_OPTIONS = [
    {
        label: '7 Days',
        value: 7
    },
    {
        label: '15 Days (Default)',
        value: 15
    },
    {
        label: '20 Days',
        value: 20
    },
    {
        label: 'Custom (Max 20 Days)',
        value: 'custom'
    }
];
function validatePaymentTerms(days) {
    if (isNaN(days) || days < 1) {
        return {
            valid: false,
            error: 'Payment terms must be at least 1 day.'
        };
    }
    if (days > 20) {
        return {
            valid: false,
            error: 'Payment Terms cannot exceed 20 days.'
        };
    }
    return {
        valid: true
    };
}
function calculateDueDate(deliveryDateStr, paymentTermsDays) {
    if (!deliveryDateStr || isNaN(paymentTermsDays)) return '--';
    const deliveryDate = new Date(deliveryDateStr);
    if (isNaN(deliveryDate.getTime())) return '--';
    const dueDate = new Date(deliveryDate);
    dueDate.setDate(dueDate.getDate() + paymentTermsDays);
    return dueDate.toISOString().split('T')[0];
}
function calculateRemainingDays(dueDateStr) {
    if (!dueDateStr || dueDateStr === '--') return null;
    const dueDate = new Date(dueDateStr);
    if (isNaN(dueDate.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}
function formatRemainingDays(remainingDays, status) {
    if (status === 'Waiting for Delivery' || remainingDays === null) return '--';
    if (status === 'Paid') return 'Completed';
    if (remainingDays < 0) {
        return "Overdue by ".concat(Math.abs(remainingDays), " Day").concat(Math.abs(remainingDays) > 1 ? 's' : '');
    }
    if (remainingDays === 0) return '0 Days (Due Today)';
    return "".concat(remainingDays, " Day").concat(remainingDays > 1 ? 's' : '');
}
function getPaymentStatus(orderStatus, deliveryDateStr, paymentTermsDays, totalAmount, paidAmount) {
    const pendingAmount = Math.max(0, totalAmount - paidAmount);
    if (pendingAmount === 0 && totalAmount > 0) {
        return {
            status: 'Paid',
            dueDate: deliveryDateStr ? calculateDueDate(deliveryDateStr, paymentTermsDays) : '--',
            remainingDays: null,
            pendingAmount: 0,
            badgeColor: 'green'
        };
    }
    const isDelivered = String(orderStatus).toLowerCase() === 'delivered' || String(orderStatus).toLowerCase() === 'closed';
    if (!isDelivered || !deliveryDateStr) {
        return {
            status: 'Waiting for Delivery',
            dueDate: '--',
            remainingDays: null,
            pendingAmount,
            badgeColor: 'gray'
        };
    }
    const dueDate = calculateDueDate(deliveryDateStr, paymentTermsDays);
    const remainingDays = calculateRemainingDays(dueDate);
    if (remainingDays === null) {
        return {
            status: 'Waiting for Delivery',
            dueDate: '--',
            remainingDays: null,
            pendingAmount,
            badgeColor: 'gray'
        };
    }
    if (remainingDays > 0) {
        return {
            status: 'Not Due',
            dueDate,
            remainingDays,
            pendingAmount,
            badgeColor: 'blue'
        };
    } else if (remainingDays === 0) {
        return {
            status: 'Due Today',
            dueDate,
            remainingDays,
            pendingAmount,
            badgeColor: 'orange'
        };
    } else {
        return {
            status: 'Overdue',
            dueDate,
            remainingDays,
            pendingAmount,
            badgeColor: 'red'
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/GlobalUIComponents.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OrderDetailDrawer",
    ()=>OrderDetailDrawer,
    "PageSearchInput",
    ()=>PageSearchInput,
    "PaymentStatusBadge",
    ()=>PaymentStatusBadge,
    "StandardActionButtons",
    ()=>StandardActionButtons,
    "WorkflowTimeline",
    ()=>WorkflowTimeline
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.mjs [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.mjs [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/share-2.mjs [app-client] (ecmascript) <export default as Share2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$printer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Printer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/printer.mjs [app-client] (ecmascript) <export default as Printer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.mjs [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.mjs [app-client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.all.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$paymentTerms$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/paymentTerms.ts [app-client] (ecmascript)");
'use client';
;
;
;
;
;
;
function PaymentStatusBadge(param) {
    let { orderStatus, deliveryDate, paymentTerms, totalAmount, paidAmount } = param;
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$paymentTerms$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPaymentStatus"])(orderStatus, deliveryDate, paymentTerms, totalAmount, paidAmount);
    const badgeClasses = {
        gray: 'erp-badge erp-badge-gray',
        blue: 'erp-badge erp-badge-blue',
        orange: 'erp-badge erp-badge-orange',
        red: 'erp-badge erp-badge-red',
        green: 'erp-badge erp-badge-green'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: badgeClasses[result.badgeColor] || badgeClasses.gray,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "w-2 h-2 rounded-full inline-block ".concat(result.badgeColor === 'green' ? 'bg-emerald-500' : result.badgeColor === 'red' ? 'bg-red-500' : result.badgeColor === 'orange' ? 'bg-amber-500' : result.badgeColor === 'blue' ? 'bg-blue-500' : 'bg-slate-400')
            }, void 0, false, {
                fileName: "[project]/components/GlobalUIComponents.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this),
            result.status
        ]
    }, void 0, true, {
        fileName: "[project]/components/GlobalUIComponents.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
_c = PaymentStatusBadge;
function StandardActionButtons(param) {
    let { onView, onDownload, onShare, onPrint, compact = false } = param;
    const handleAction = (type, callback)=>{
        if (callback) {
            callback();
        } else {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: "".concat(type, " Action Executed"),
                text: "".concat(type, " request processed successfully."),
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true
            });
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            justifyContent: 'flex-end',
            flexWrap: 'wrap'
        },
        children: [
            onView && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>handleAction('View', onView),
                className: "erp-btn erp-btn-sm erp-btn-secondary",
                title: "View Details",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                        style: {
                            width: 14,
                            height: 14
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/GlobalUIComponents.tsx",
                        lineNumber: 94,
                        columnNumber: 11
                    }, this),
                    !compact && 'View'
                ]
            }, void 0, true, {
                fileName: "[project]/components/GlobalUIComponents.tsx",
                lineNumber: 88,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>handleAction('Download PDF', onDownload),
                className: "erp-btn erp-btn-sm erp-btn-primary",
                title: "Download PDF",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                        style: {
                            width: 14,
                            height: 14
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/GlobalUIComponents.tsx",
                        lineNumber: 104,
                        columnNumber: 9
                    }, this),
                    !compact && 'Download'
                ]
            }, void 0, true, {
                fileName: "[project]/components/GlobalUIComponents.tsx",
                lineNumber: 98,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>handleAction('Share', onShare),
                className: "erp-btn erp-btn-sm erp-btn-success",
                title: "Share",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__["Share2"], {
                        style: {
                            width: 14,
                            height: 14
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/GlobalUIComponents.tsx",
                        lineNumber: 113,
                        columnNumber: 9
                    }, this),
                    !compact && 'Share'
                ]
            }, void 0, true, {
                fileName: "[project]/components/GlobalUIComponents.tsx",
                lineNumber: 107,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>handleAction('Print', onPrint),
                className: "erp-btn erp-btn-sm erp-btn-warning",
                title: "Print",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$printer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Printer$3e$__["Printer"], {
                        style: {
                            width: 14,
                            height: 14
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/GlobalUIComponents.tsx",
                        lineNumber: 122,
                        columnNumber: 9
                    }, this),
                    !compact && 'Print'
                ]
            }, void 0, true, {
                fileName: "[project]/components/GlobalUIComponents.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/GlobalUIComponents.tsx",
        lineNumber: 86,
        columnNumber: 5
    }, this);
}
_c1 = StandardActionButtons;
function WorkflowTimeline(param) {
    let { currentStatus } = param;
    const stages = [
        'Lead',
        'Quotation',
        'Order',
        'Plant Head Approval',
        'Production',
        'QC',
        'Dispatch',
        'Delivered',
        'Payment Pending',
        'Payment Verified',
        'Closed'
    ];
    const statusUpper = String(currentStatus || '').toLowerCase();
    let currentIdx = 2; // Default to Order stage
    if (statusUpper.includes('lead')) currentIdx = 0;
    else if (statusUpper.includes('quotation') || statusUpper.includes('draft')) currentIdx = 1;
    else if (statusUpper.includes('pending_plant_head') || statusUpper.includes('review')) currentIdx = 2;
    else if (statusUpper.includes('plant_head_approved') || statusUpper.includes('approved')) currentIdx = 3;
    else if (statusUpper.includes('production') || statusUpper.includes('work_order')) currentIdx = 4;
    else if (statusUpper.includes('qc')) currentIdx = 5;
    else if (statusUpper.includes('dispatch') || statusUpper.includes('in_transit')) currentIdx = 6;
    else if (statusUpper.includes('delivered')) currentIdx = 7;
    else if (statusUpper.includes('payment_pending') || statusUpper.includes('due')) currentIdx = 8;
    else if (statusUpper.includes('payment_verified')) currentIdx = 9;
    else if (statusUpper.includes('closed')) currentIdx = 10;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "erp-timeline-scroll",
        style: {
            padding: '16px 12px',
            background: '#ffffff',
            border: '1px solid #DCE5F0',
            borderRadius: '14px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                alignItems: 'center',
                minWidth: '760px',
                justifyContent: 'space-between',
                padding: '0 8px'
            },
            children: stages.map((stage, idx)=>{
                const isDone = idx < currentIdx;
                const isCurrent = idx === currentIdx;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        width: '26px',
                                        height: '26px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        transition: 'all 0.2s ease',
                                        ...isDone ? {
                                            background: '#059669',
                                            color: '#ffffff'
                                        } : isCurrent ? {
                                            background: '#4f46e5',
                                            color: '#ffffff',
                                            boxShadow: '0 0 0 4px #e0e7ff'
                                        } : {
                                            background: '#DCE5F0',
                                            color: '#5E6B82'
                                        }
                                    },
                                    children: isDone ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                        style: {
                                            width: 14,
                                            height: 14
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/GlobalUIComponents.tsx",
                                        lineNumber: 191,
                                        columnNumber: 29
                                    }, this) : idx + 1
                                }, void 0, false, {
                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                    lineNumber: 177,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: '9.5px',
                                        marginTop: '6px',
                                        fontWeight: isCurrent ? 800 : isDone ? 700 : 500,
                                        whiteSpace: 'nowrap',
                                        color: isCurrent ? '#1e1b4b' : isDone ? '#065f46' : '#5E6B82'
                                    },
                                    children: stage
                                }, void 0, false, {
                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                    lineNumber: 193,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/GlobalUIComponents.tsx",
                            lineNumber: 176,
                            columnNumber: 15
                        }, this),
                        idx < stages.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                flex: 1,
                                height: '3px',
                                margin: '0 4px',
                                borderRadius: '2px',
                                background: idx < currentIdx ? '#10b981' : '#DCE5F0'
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/GlobalUIComponents.tsx",
                            lineNumber: 204,
                            columnNumber: 17
                        }, this)
                    ]
                }, stage, true, {
                    fileName: "[project]/components/GlobalUIComponents.tsx",
                    lineNumber: 175,
                    columnNumber: 13
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/components/GlobalUIComponents.tsx",
            lineNumber: 170,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/GlobalUIComponents.tsx",
        lineNumber: 163,
        columnNumber: 5
    }, this);
}
_c2 = WorkflowTimeline;
function OrderDetailDrawer(param) {
    let { order, onClose } = param;
    var _order_createdAt;
    if (!order) return null;
    const totalAmount = Number(order.totalAmount || order.totalValue || order.amount || 10000);
    const paidAmount = Number(order.paidAmount || order.paid_amount || 0);
    const pendingAmount = Math.max(0, totalAmount - paidAmount);
    const paymentTerms = Number(order.paymentTerms || 15);
    const deliveryDate = order.deliveryDate || order.expectedDeliveryDate || '2026-07-25';
    const invoiceDate = order.invoiceDate || ((_order_createdAt = order.createdAt) === null || _order_createdAt === void 0 ? void 0 : _order_createdAt.split('T')[0]) || '2026-07-20';
    const history = Array.isArray(order.paymentHistory) ? order.paymentHistory : [];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)'
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                width: 'min(100vw, 620px)',
                background: '#ffffff',
                height: '100%',
                boxShadow: '-10px 0 40px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        padding: '16px 20px',
                        background: '#24345C',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        flexWrap: 'wrap'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            style: {
                                                fontSize: '17px',
                                                fontWeight: 800,
                                                margin: 0
                                            },
                                            children: [
                                                "Order: ",
                                                order.orderNo || order.id
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                            lineNumber: 273,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PaymentStatusBadge, {
                                            orderStatus: order.status || 'Delivered',
                                            deliveryDate: deliveryDate,
                                            paymentTerms: paymentTerms,
                                            totalAmount: totalAmount,
                                            paidAmount: paidAmount
                                        }, void 0, false, {
                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                            lineNumber: 274,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                    lineNumber: 272,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: '12px',
                                        color: '#8893A7',
                                        margin: '4px 0 0 0'
                                    },
                                    children: [
                                        "Customer: ",
                                        order.customerName || order.customer || 'Acme Ltd'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                    lineNumber: 282,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/GlobalUIComponents.tsx",
                            lineNumber: 271,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            style: {
                                background: 'transparent',
                                border: 'none',
                                color: '#8893A7',
                                cursor: 'pointer',
                                padding: '4px'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                style: {
                                    width: 22,
                                    height: 22
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/GlobalUIComponents.tsx",
                                lineNumber: 288,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/GlobalUIComponents.tsx",
                            lineNumber: 284,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/GlobalUIComponents.tsx",
                    lineNumber: 261,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        flex: 1,
                        overflowY: 'auto',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        background: '#F5FAFE'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    style: {
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        color: '#5E6B82',
                                        marginBottom: '8px'
                                    },
                                    children: "Order Lifecycle"
                                }, void 0, false, {
                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                    lineNumber: 297,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WorkflowTimeline, {
                                    currentStatus: order.status
                                }, void 0, false, {
                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                    lineNumber: 298,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/GlobalUIComponents.tsx",
                            lineNumber: 296,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "erp-card-grid",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "erp-metric-card",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "erp-metric-label",
                                            children: "Total Amount"
                                        }, void 0, false, {
                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                            lineNumber: 304,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "erp-metric-value",
                                            style: {
                                                color: '#24345C'
                                            },
                                            children: [
                                                "₹",
                                                totalAmount.toLocaleString('en-IN')
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                            lineNumber: 305,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                    lineNumber: 303,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "erp-metric-card",
                                    style: {
                                        background: '#ecfdf5',
                                        borderColor: '#a7f3d0'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "erp-metric-label",
                                            style: {
                                                color: '#047857'
                                            },
                                            children: "Paid Amount"
                                        }, void 0, false, {
                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                            lineNumber: 308,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "erp-metric-value",
                                            style: {
                                                color: '#065f46'
                                            },
                                            children: [
                                                "₹",
                                                paidAmount.toLocaleString('en-IN')
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                            lineNumber: 309,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                    lineNumber: 307,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "erp-metric-card",
                                    style: {
                                        background: '#fffbeb',
                                        borderColor: '#fde68a'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "erp-metric-label",
                                            style: {
                                                color: '#b45309'
                                            },
                                            children: "Pending Amount"
                                        }, void 0, false, {
                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                            lineNumber: 312,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "erp-metric-value",
                                            style: {
                                                color: '#92400e'
                                            },
                                            children: [
                                                "₹",
                                                pendingAmount.toLocaleString('en-IN')
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                            lineNumber: 313,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                    lineNumber: 311,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/GlobalUIComponents.tsx",
                            lineNumber: 302,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                background: '#ffffff',
                                border: '1px solid #DCE5F0',
                                borderRadius: '14px',
                                padding: '16px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    style: {
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        color: '#5E6B82',
                                        marginBottom: '12px'
                                    },
                                    children: "Dates & Payment Terms"
                                }, void 0, false, {
                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                    lineNumber: 319,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                        gap: '14px',
                                        fontSize: '12.5px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: '11px',
                                                        color: '#8893A7',
                                                        display: 'block'
                                                    },
                                                    children: "Invoice Date"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                                    lineNumber: 322,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    style: {
                                                        color: '#1e293b'
                                                    },
                                                    children: invoiceDate
                                                }, void 0, false, {
                                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                                    lineNumber: 323,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                            lineNumber: 321,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: '11px',
                                                        color: '#8893A7',
                                                        display: 'block'
                                                    },
                                                    children: "Delivery Date"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                                    lineNumber: 326,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    style: {
                                                        color: '#1e293b'
                                                    },
                                                    children: deliveryDate
                                                }, void 0, false, {
                                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                                    lineNumber: 327,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                            lineNumber: 325,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: '11px',
                                                        color: '#8893A7',
                                                        display: 'block'
                                                    },
                                                    children: "Payment Terms"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                                    lineNumber: 330,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    style: {
                                                        color: '#4f46e5'
                                                    },
                                                    children: [
                                                        paymentTerms,
                                                        " Days"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                                    lineNumber: 331,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                            lineNumber: 329,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: '11px',
                                                        color: '#8893A7',
                                                        display: 'block'
                                                    },
                                                    children: "Salesperson"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                                    lineNumber: 334,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    style: {
                                                        color: '#1e293b'
                                                    },
                                                    children: order.salesperson || 'Rajesh Kumar'
                                                }, void 0, false, {
                                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                                    lineNumber: 335,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                            lineNumber: 333,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                    lineNumber: 320,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/GlobalUIComponents.tsx",
                            lineNumber: 318,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                background: '#ffffff',
                                border: '1px solid #DCE5F0',
                                borderRadius: '14px',
                                padding: '16px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    style: {
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        color: '#5E6B82',
                                        marginBottom: '12px'
                                    },
                                    children: "Order Products"
                                }, void 0, false, {
                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                    lineNumber: 342,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px'
                                    },
                                    children: (order.items || [
                                        {
                                            name: order.product || 'Standard Steel Rods 20mm',
                                            qty: order.quantity || 500,
                                            price: 20
                                        }
                                    ]).map((item, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '10px 12px',
                                                background: '#F5FAFE',
                                                borderRadius: '8px',
                                                border: '1px solid #f1f5f9',
                                                fontSize: '12.5px',
                                                flexWrap: 'wrap',
                                                gap: '8px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            style: {
                                                                color: '#24345C',
                                                                display: 'block'
                                                            },
                                                            children: item.name || item.product
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                                            lineNumber: 347,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '11px',
                                                                color: '#5E6B82'
                                                            },
                                                            children: [
                                                                "Qty: ",
                                                                item.qty || item.quantity
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                                            lineNumber: 348,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                                    lineNumber: 346,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    style: {
                                                        color: '#24345C'
                                                    },
                                                    children: [
                                                        "₹",
                                                        ((item.qty || item.quantity || 1) * (item.price || 20)).toLocaleString('en-IN')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                                    lineNumber: 350,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, idx, true, {
                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                            lineNumber: 345,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                    lineNumber: 343,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/GlobalUIComponents.tsx",
                            lineNumber: 341,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                background: '#ffffff',
                                border: '1px solid #DCE5F0',
                                borderRadius: '14px',
                                padding: '16px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    style: {
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        color: '#5E6B82',
                                        marginBottom: '12px'
                                    },
                                    children: "Payment History Ledger"
                                }, void 0, false, {
                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                    lineNumber: 358,
                                    columnNumber: 13
                                }, this),
                                history.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        textAlign: 'center',
                                        padding: '20px',
                                        color: '#8893A7',
                                        fontSize: '12px',
                                        fontStyle: 'italic'
                                    },
                                    children: "No payment transactions recorded yet."
                                }, void 0, false, {
                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                    lineNumber: 360,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px'
                                    },
                                    children: history.map((tx, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '10px 14px',
                                                background: '#ecfdf5',
                                                border: '1px solid #a7f3d0',
                                                borderRadius: '10px',
                                                fontSize: '12px',
                                                flexWrap: 'wrap',
                                                gap: '8px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            style: {
                                                                color: '#065f46',
                                                                fontSize: '14px',
                                                                display: 'block'
                                                            },
                                                            children: [
                                                                "₹",
                                                                Number(tx.amount).toLocaleString('en-IN')
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                                            lineNumber: 368,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: '#047857'
                                                            },
                                                            children: "Verified Payment Record"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                                            lineNumber: 369,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                                    lineNumber: 367,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        textAlign: 'right'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: '#334155',
                                                                fontWeight: 600,
                                                                display: 'block'
                                                            },
                                                            children: tx.paymentDate
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                                            lineNumber: 372,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: '#5E6B82',
                                                                fontSize: '11px'
                                                            },
                                                            children: [
                                                                "By ",
                                                                tx.verifiedBy
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                                            lineNumber: 373,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                                    lineNumber: 371,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, idx, true, {
                                            fileName: "[project]/components/GlobalUIComponents.tsx",
                                            lineNumber: 366,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/GlobalUIComponents.tsx",
                                    lineNumber: 364,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/GlobalUIComponents.tsx",
                            lineNumber: 357,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/GlobalUIComponents.tsx",
                    lineNumber: 293,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        padding: '14px 20px',
                        borderTop: '1px solid #DCE5F0',
                        background: '#ffffff',
                        display: 'flex',
                        justifyContent: 'flex-end'
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StandardActionButtons, {
                        onView: undefined,
                        onDownload: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                                toast: true,
                                position: 'top-end',
                                icon: 'info',
                                title: "Downloading PDF for Order ".concat(order.orderNo || order.id, "..."),
                                showConfirmButton: false,
                                timer: 2000
                            }),
                        onShare: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                                toast: true,
                                position: 'top-end',
                                icon: 'success',
                                title: "Sharing Order ".concat(order.orderNo || order.id, "..."),
                                showConfirmButton: false,
                                timer: 2000
                            }),
                        onPrint: ()=>window.print()
                    }, void 0, false, {
                        fileName: "[project]/components/GlobalUIComponents.tsx",
                        lineNumber: 385,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/GlobalUIComponents.tsx",
                    lineNumber: 384,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/GlobalUIComponents.tsx",
            lineNumber: 250,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/GlobalUIComponents.tsx",
        lineNumber: 241,
        columnNumber: 5
    }, this);
}
_c3 = OrderDetailDrawer;
function PageSearchInput(param) {
    let { value, onChange, placeholder = "Search current table..." } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "erp-search-wrapper",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                className: "erp-search-icon"
            }, void 0, false, {
                fileName: "[project]/components/GlobalUIComponents.tsx",
                lineNumber: 411,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "text",
                value: value,
                onChange: (e)=>onChange(e.target.value),
                placeholder: placeholder,
                className: "erp-search-input"
            }, void 0, false, {
                fileName: "[project]/components/GlobalUIComponents.tsx",
                lineNumber: 412,
                columnNumber: 7
            }, this),
            value && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>onChange(''),
                className: "erp-search-clear",
                type: "button",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                    style: {
                        width: 14,
                        height: 14
                    }
                }, void 0, false, {
                    fileName: "[project]/components/GlobalUIComponents.tsx",
                    lineNumber: 425,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/GlobalUIComponents.tsx",
                lineNumber: 420,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/GlobalUIComponents.tsx",
        lineNumber: 410,
        columnNumber: 5
    }, this);
}
_c4 = PageSearchInput;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "PaymentStatusBadge");
__turbopack_context__.k.register(_c1, "StandardActionButtons");
__turbopack_context__.k.register(_c2, "WorkflowTimeline");
__turbopack_context__.k.register(_c3, "OrderDetailDrawer");
__turbopack_context__.k.register(_c4, "PageSearchInput");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(dashboard)/plant-head/finished-goods/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FinishedGoodsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PackageCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package-check.mjs [app-client] (ecmascript) <export default as PackageCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GlobalUIComponents$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/GlobalUIComponents.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function FinishedGoodsPage() {
    _s();
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const items = [
        {
            id: 'FG-801',
            name: 'High-Tensile Galvanized Bolts M12',
            category: 'Fasteners',
            batchNo: 'B-2026-0711',
            readyStock: 2500,
            unit: 'PCS',
            location: 'Warehouse A-04',
            dispatchReady: true
        },
        {
            id: 'FG-802',
            name: 'Precision CNC Aluminum Joints',
            category: 'Structural',
            batchNo: 'B-2026-0715',
            readyStock: 450,
            unit: 'SET',
            location: 'Warehouse B-12',
            dispatchReady: true
        },
        {
            id: 'FG-803',
            name: 'Industrial Rubber Gaskets HD-100',
            category: 'Seals',
            batchNo: 'B-2026-0719',
            readyStock: 1200,
            unit: 'PCS',
            location: 'Warehouse A-01',
            dispatchReady: false
        }
    ];
    const filtered = items.filter((i)=>i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.batchNo.toLowerCase().includes(searchQuery.toLowerCase()) || i.id.toLowerCase().includes(searchQuery.toLowerCase()));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "erp-page-container",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "erp-header-card",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "erp-header-title-group",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "erp-header-title",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PackageCheck$3e$__["PackageCheck"], {
                                        style: {
                                            width: 24,
                                            height: 24,
                                            color: '#059669'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                        lineNumber: 27,
                                        columnNumber: 13
                                    }, this),
                                    "Plant Head → Finished Goods Inventory"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                lineNumber: 26,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "erp-header-subtitle",
                                children: "Live visibility into quality-approved manufactured stock ready for dispatch."
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                lineNumber: 30,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GlobalUIComponents$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PageSearchInput"], {
                        value: searchQuery,
                        onChange: setSearchQuery,
                        placeholder: "Search finished product..."
                    }, void 0, false, {
                        fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "erp-table-card",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "erp-table-responsive",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        className: "erp-table",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "ID"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                            lineNumber: 40,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Product Name"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                            lineNumber: 41,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Category"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                            lineNumber: 42,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Batch No."
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                            lineNumber: 43,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Ready Stock"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                            lineNumber: 44,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Storage Location"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                            lineNumber: 45,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Dispatch Ready"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                            lineNumber: 46,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                textAlign: 'right'
                                            },
                                            children: "Actions"
                                        }, void 0, false, {
                                            fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                            lineNumber: 47,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                    lineNumber: 39,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                lineNumber: 38,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: filtered.map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    fontWeight: 800,
                                                    color: '#1e1b4b'
                                                },
                                                children: i.id
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                                lineNumber: 53,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    fontWeight: 700,
                                                    color: '#24345C'
                                                },
                                                children: i.name
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                                lineNumber: 54,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    color: '#475569'
                                                },
                                                children: i.category
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                                lineNumber: 55,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    fontFamily: 'monospace',
                                                    color: '#334155'
                                                },
                                                children: i.batchNo
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                                lineNumber: 56,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    fontWeight: 800,
                                                    color: '#047857'
                                                },
                                                children: [
                                                    i.readyStock,
                                                    " ",
                                                    i.unit
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                                lineNumber: 57,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    color: '#475569'
                                                },
                                                children: i.location
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                                lineNumber: 58,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "erp-badge ".concat(i.dispatchReady ? 'erp-badge-green' : 'erp-badge-orange'),
                                                    children: i.dispatchReady ? 'Ready for Dispatch' : 'In Packaging'
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                                    lineNumber: 60,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                                lineNumber: 59,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$GlobalUIComponents$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StandardActionButtons"], {
                                                    compact: true
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                                    lineNumber: 64,
                                                    columnNumber: 54
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                                lineNumber: 64,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, i.id, true, {
                                        fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                        lineNumber: 52,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                                lineNumber: 50,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                        lineNumber: 37,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                    lineNumber: 36,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(dashboard)/plant-head/finished-goods/page.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
_s(FinishedGoodsPage, "uixqA8hxOTN7LqZPWxVzG2fnyhQ=");
_c = FinishedGoodsPage;
var _c;
__turbopack_context__.k.register(_c, "FinishedGoodsPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_7bcb48b8._.js.map