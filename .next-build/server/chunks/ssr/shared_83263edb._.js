module.exports = [
"[project]/shared/constants.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ──────────────────────────────────────────────────────────
// Himalaya ERP — Canonical Status Set
// Aligned with the full Lead → Payment lifecycle
// ──────────────────────────────────────────────────────────
__turbopack_context__.s([
    "DEPARTMENT_STATUSES",
    ()=>DEPARTMENT_STATUSES,
    "GRN_STATUS",
    ()=>GRN_STATUS,
    "INDENT_STATUS",
    ()=>INDENT_STATUS,
    "INVOICE_STATUS",
    ()=>INVOICE_STATUS,
    "PAYMENT_STATUS",
    ()=>PAYMENT_STATUS,
    "PO_STATUS",
    ()=>PO_STATUS,
    "STATUS",
    ()=>STATUS,
    "STATUS_LABELS",
    ()=>STATUS_LABELS,
    "VRN_STATUS",
    ()=>VRN_STATUS
]);
const STATUS = {
    // ── Sales ─────────────────────────────────────────────
    LEAD_CREATED: 'LEAD_CREATED',
    SAMPLE_REQUIRED: 'SAMPLE_REQUIRED',
    SAMPLE_APPROVED: 'SAMPLE_APPROVED',
    QUOTATION_CREATED: 'QUOTATION_CREATED',
    QUOTATION_SENT: 'QUOTATION_SENT',
    QUOTATION_APPROVED: 'QUOTATION_APPROVED',
    ORDER_CREATED: 'ORDER_CREATED',
    ORDER_CONFIRMED: 'ORDER_CONFIRMED',
    // ── Plant Head ─────────────────────────────────────────
    PLANT_PENDING: 'PLANT_PENDING',
    PLANT_ACCEPTED: 'PLANT_ACCEPTED',
    PLANT_REJECTED: 'PLANT_REJECTED',
    PRODUCTION_PLANNED: 'PRODUCTION_PLANNED',
    WORK_ORDER_CREATED: 'WORK_ORDER_CREATED',
    // ── Production ─────────────────────────────────────────
    PRODUCTION_ACCEPTED: 'PRODUCTION_ACCEPTED',
    IN_PRODUCTION: 'IN_PRODUCTION',
    PRODUCTION_COMPLETED: 'PRODUCTION_COMPLETED',
    REWORK: 'REWORK',
    PAUSED: 'PAUSED',
    // ── QC ─────────────────────────────────────────────────
    QC_PENDING: 'QC_PENDING',
    QC_APPROVED: 'QC_APPROVED',
    QC_FAILED: 'QC_FAILED',
    // ── Dispatch ───────────────────────────────────────────
    DISPATCH_PENDING: 'DISPATCH_PENDING',
    IN_TRANSIT: 'IN_TRANSIT',
    DELIVERED: 'DELIVERED',
    // ── Finance ────────────────────────────────────────────
    INVOICED: 'INVOICED',
    PAYMENT_PENDING: 'PAYMENT_PENDING',
    // ── Finance Executive ──────────────────────────────────
    PAYMENT_VERIFIED: 'PAYMENT_VERIFIED',
    CLOSED: 'CLOSED',
    // ── Exceptional ────────────────────────────────────────
    CANCELLED: 'CANCELLED',
    // ── Legacy aliases ─────────────────────────────────────
    PLANNED: 'PRODUCTION_PLANNED',
    DISPATCH_CREATED: 'DISPATCH_PENDING',
    DISPATCH_READY: 'QC_APPROVED',
    QC_PASSED: 'QC_APPROVED',
    MATERIAL_REQUESTED: 'WORK_ORDER_CREATED',
    MATERIAL_APPROVED: 'WORK_ORDER_CREATED',
    MATERIAL_ISSUED: 'IN_PRODUCTION',
    PAYMENT_VERIFIED_OLD: 'PAYMENT_VERIFIED',
    SALES_ORDER: 'ORDER_CONFIRMED'
};
const DEPARTMENT_STATUSES = {
    Sales: [
        STATUS.ORDER_CREATED,
        STATUS.ORDER_CONFIRMED,
        STATUS.PLANT_PENDING,
        STATUS.PLANT_ACCEPTED,
        STATUS.PRODUCTION_PLANNED,
        STATUS.WORK_ORDER_CREATED,
        STATUS.IN_PRODUCTION,
        STATUS.PRODUCTION_COMPLETED,
        STATUS.QC_PENDING,
        STATUS.QC_APPROVED,
        STATUS.DISPATCH_PENDING,
        STATUS.IN_TRANSIT,
        STATUS.DELIVERED,
        STATUS.INVOICED,
        STATUS.PAYMENT_PENDING,
        STATUS.PAYMENT_VERIFIED,
        STATUS.CLOSED
    ],
    PlantHead: [
        STATUS.PLANT_PENDING,
        STATUS.PLANT_ACCEPTED,
        STATUS.PRODUCTION_PLANNED,
        STATUS.WORK_ORDER_CREATED
    ],
    Production: [
        STATUS.WORK_ORDER_CREATED,
        STATUS.PRODUCTION_ACCEPTED,
        STATUS.IN_PRODUCTION,
        STATUS.PRODUCTION_COMPLETED,
        STATUS.REWORK
    ],
    QC: [
        STATUS.PRODUCTION_COMPLETED,
        STATUS.QC_PENDING,
        STATUS.QC_APPROVED,
        STATUS.QC_FAILED
    ],
    Dispatch: [
        STATUS.QC_APPROVED,
        STATUS.DISPATCH_PENDING,
        STATUS.IN_TRANSIT,
        STATUS.DELIVERED
    ],
    Finance: [
        STATUS.DELIVERED,
        STATUS.INVOICED,
        STATUS.PAYMENT_PENDING,
        STATUS.PAYMENT_VERIFIED,
        STATUS.CLOSED
    ],
    FinanceExecutive: [
        STATUS.PAYMENT_PENDING,
        STATUS.PAYMENT_VERIFIED,
        STATUS.CLOSED
    ]
};
const STATUS_LABELS = {
    LEAD_CREATED: 'New Lead',
    SAMPLE_REQUIRED: 'Sample Required',
    SAMPLE_APPROVED: 'Sample Approved',
    QUOTATION_CREATED: 'Quotation Created',
    QUOTATION_SENT: 'Quotation Sent',
    QUOTATION_APPROVED: 'Customer Approved',
    ORDER_CREATED: 'Order Created',
    ORDER_CONFIRMED: 'Order Confirmed',
    PLANT_PENDING: 'Waiting for Plant Head',
    PLANT_ACCEPTED: 'Plant Accepted',
    PLANT_REJECTED: 'Plant Rejected',
    PRODUCTION_PLANNED: 'Production Planned',
    WORK_ORDER_CREATED: 'Work Order Created',
    PRODUCTION_ACCEPTED: 'Production Accepted',
    IN_PRODUCTION: 'In Production',
    PRODUCTION_COMPLETED: 'Production Completed',
    REWORK: 'Rework',
    QC_PENDING: 'QC Pending',
    QC_APPROVED: 'Ready for Dispatch',
    QC_FAILED: 'QC Rejected',
    DISPATCH_PENDING: 'Dispatch Prepared',
    IN_TRANSIT: 'Dispatched',
    DELIVERED: 'Delivered',
    INVOICED: 'Invoice Generated',
    PAYMENT_PENDING: 'Payment Pending',
    PAYMENT_VERIFIED: 'Payment Verified',
    CLOSED: 'Order Closed',
    CANCELLED: 'Cancelled',
    PAUSED: 'Paused',
    // Legacy
    SALES_ORDER: 'Sales Order',
    PLANNED: 'Planned'
};
const INDENT_STATUS = {
    PENDING_PLANT_HEAD_APPROVAL: 'PENDING_PLANT_HEAD_APPROVAL',
    PLANT_HEAD_REJECTED: 'PLANT_HEAD_REJECTED',
    PLANT_HEAD_APPROVED: 'PLANT_HEAD_APPROVED',
    CONVERTED_TO_PO: 'CONVERTED_TO_PO',
    CANCELLED: 'INDENT_CANCELLED'
};
const PO_STATUS = {
    DRAFT: 'DRAFT',
    PENDING_SUPER_ADMIN_APPROVAL: 'PENDING_SUPER_ADMIN_APPROVAL',
    SUPER_ADMIN_REJECTED: 'SUPER_ADMIN_REJECTED',
    SUPER_ADMIN_APPROVED: 'SUPER_ADMIN_APPROVED',
    PO_ISSUED: 'PO_ISSUED',
    VENDOR_ACCEPTED: 'VENDOR_ACCEPTED',
    PARTIALLY_RECEIVED: 'PARTIALLY_RECEIVED',
    GRN_SUBMITTED: 'GRN_SUBMITTED',
    GRN_APPROVED: 'GRN_APPROVED',
    STOCK_POSTED: 'STOCK_POSTED',
    PAYMENT_PENDING: 'PAYMENT_PENDING',
    PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
    PO_CLOSED: 'PO_CLOSED',
    CANCELLED: 'PO_CANCELLED'
};
const GRN_STATUS = {
    DRAFT: 'GRN_DRAFT',
    SUBMITTED: 'GRN_SUBMITTED',
    APPROVED: 'GRN_APPROVED',
    QUALITY_REJECTED: 'QUALITY_REJECTED',
    STOCK_POSTED: 'STOCK_POSTED'
};
const INVOICE_STATUS = {
    DRAFT: 'INVOICE_DRAFT',
    SUBMITTED: 'INVOICE_SUBMITTED',
    VERIFIED: 'INVOICE_VERIFIED',
    PAID: 'INVOICE_PAID',
    REJECTED: 'INVOICE_REJECTED'
};
const PAYMENT_STATUS = {
    PENDING: 'PAYMENT_PENDING',
    COMPLETED: 'PAYMENT_COMPLETED',
    FAILED: 'PAYMENT_FAILED',
    CANCELLED: 'PAYMENT_CANCELLED'
};
const VRN_STATUS = {
    WAITING_PICKUP: 'WAITING_PICKUP',
    PICKED_UP: 'PICKED_UP',
    REPLACED: 'REPLACED',
    CLOSED: 'CLOSED'
};
}),
"[project]/shared/components/DataTable.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DataTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function DataTable({ columns = [], data = [], searchQuery = '', searchField = '', actions, emptyMessage = 'No matching records found.', className = '' }) {
    // Filter data by search query
    const filteredData = data.filter((item)=>{
        if (!searchQuery) return true;
        if (!searchField) return true;
        const fields = searchField.split('.');
        let targetValue = item;
        for (const field of fields){
            if (targetValue && targetValue[field] !== undefined) {
                targetValue = targetValue[field];
            } else {
                targetValue = '';
            }
        }
        return String(targetValue).toLowerCase().includes(searchQuery.toLowerCase());
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "crm-table-container",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            className: `crm-table responsive-table ${className}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        children: [
                            columns.map((col, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    style: {
                                        textAlign: col.align || 'left',
                                        whiteSpace: col.nowrap ? 'nowrap' : 'normal'
                                    },
                                    children: col.header
                                }, idx, false, {
                                    fileName: "[project]/shared/components/DataTable.jsx",
                                    lineNumber: 35,
                                    columnNumber: 15
                                }, this)),
                            actions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                style: {
                                    textAlign: 'right'
                                },
                                children: "Actions"
                            }, void 0, false, {
                                fileName: "[project]/shared/components/DataTable.jsx",
                                lineNumber: 39,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/shared/components/DataTable.jsx",
                        lineNumber: 33,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/shared/components/DataTable.jsx",
                    lineNumber: 32,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    children: filteredData.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            colSpan: columns.length + (actions ? 1 : 0),
                            style: {
                                textAlign: 'center',
                                color: 'var(--color-text-muted)',
                                padding: '30px'
                            },
                            children: emptyMessage
                        }, void 0, false, {
                            fileName: "[project]/shared/components/DataTable.jsx",
                            lineNumber: 45,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/shared/components/DataTable.jsx",
                        lineNumber: 44,
                        columnNumber: 13
                    }, this) : filteredData.map((row, rowIdx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            children: [
                                columns.map((col, colIdx)=>{
                                    let value = '';
                                    const acc = col.accessor || col.accessorKey;
                                    if (!col.render && !col.cell) {
                                        if (typeof acc === 'function') {
                                            value = acc(row);
                                        } else if (typeof acc === 'string') {
                                            const fields = acc.replace(/\[(\d+)\]/g, '.$1').split('.');
                                            let temp = row;
                                            for (const f of fields){
                                                if (temp && temp[f] !== undefined) {
                                                    temp = temp[f];
                                                } else {
                                                    temp = undefined;
                                                    break;
                                                }
                                            }
                                            value = temp !== undefined ? temp : '';
                                        }
                                        if (acc === 'id' && !value) {
                                            value = row.workOrderId || row.workOrderNo || row.orderNo || row.id || '';
                                        }
                                        if (acc === 'products[0].productName' && !value) {
                                            value = row.productName || (typeof row.products === 'string' ? row.products : '') || row.products?.[0]?.productName || 'Custom Engineered Product';
                                        }
                                        if (acc === 'production.outputQuantity' && !value) {
                                            value = row.production?.producedQty || row.producedQty || row.production?.outputQuantity || row.quantity || 0;
                                        }
                                    }
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        "data-label": col.header,
                                        style: {
                                            textAlign: col.align || 'left',
                                            whiteSpace: col.nowrap ? 'nowrap' : 'normal'
                                        },
                                        children: col.render ? col.render(row) : col.cell ? col.cell({
                                            row: {
                                                original: row
                                            },
                                            getValue: ()=>value
                                        }) : value
                                    }, colIdx, false, {
                                        fileName: "[project]/shared/components/DataTable.jsx",
                                        lineNumber: 83,
                                        columnNumber: 21
                                    }, this);
                                }),
                                actions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    "data-label": "Actions",
                                    style: {
                                        textAlign: 'right',
                                        whiteSpace: 'nowrap'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "action-btn-group",
                                        children: actions(row)
                                    }, void 0, false, {
                                        fileName: "[project]/shared/components/DataTable.jsx",
                                        lineNumber: 97,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/DataTable.jsx",
                                    lineNumber: 96,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, rowIdx, true, {
                            fileName: "[project]/shared/components/DataTable.jsx",
                            lineNumber: 51,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/shared/components/DataTable.jsx",
                    lineNumber: 42,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/shared/components/DataTable.jsx",
            lineNumber: 31,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/shared/components/DataTable.jsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
}),
"[project]/shared/components/StatusBadge.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatusBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function StatusBadge({ status }) {
    const getStatusDisplay = (stat)=>{
        if (!stat) return '';
        const displayMap = {
            'PENDING_PLANT_HEAD': 'Ready for Confirmation',
            'PLANT_PENDING': 'Sent to Plant Head',
            'Plant Pending': 'Sent to Plant Head',
            'WORK_ORDER_CREATED': 'Work Order Created',
            'IN_PRODUCTION': 'In Production',
            'PRODUCTION_COMPLETED': 'Production Completed',
            'QC_PENDING': 'QC Pending',
            'QC_PASSED': 'QC Passed',
            'QC_REJECTED': 'QC Rejected',
            'DISPATCH_READY': 'Ready for Dispatch',
            'DISPATCH_CREATED': 'Dispatched',
            'DELIVERED': 'Delivered',
            'PAYMENT_PENDING': 'Payment Pending',
            'CLOSED': 'Closed',
            'REQUESTED': 'Requested',
            'APPROVED': 'Approved',
            'RETURNED_FOR_CORRECTION': 'Returned for Correction',
            'READY_FOR_RELEASE': 'Ready for Release',
            'ISSUED': 'Issued'
        };
        return displayMap[stat] || stat.replace(/_/g, ' ');
    };
    const getBadgeStyle = (stat)=>{
        if (!stat) return {
            background: '#f1f5f9',
            color: '#475569',
            border: '1px solid #D6E2F0'
        };
        const s = String(stat).toLowerCase();
        // Green / Success: Approved, Completed, Delivered, Closed, QC Passed
        if (s.includes('confirm') || s.includes('issue') || s.includes('approve') || s === 'verified' || s === 'paid' || s === 'won' || s === 'completed' || s === 'qc approved' || s.includes('good') || s === 'active' || s === 'delivered' || s === 'closed' || s.includes('passed') || s === 'approved' || s === 'issued') {
            return {
                background: 'rgba(34, 197, 94, 0.12)',
                color: '#166534',
                border: '1px solid rgba(34, 197, 94, 0.2)'
            };
        }
        // Purple / Prepared: prepared, preparing, ready_for_release, production_completed
        if (s.includes('prepare') || s === 'ready_for_release' || s.includes('production_completed') || s === 'production completed') {
            return {
                background: 'rgba(99, 102, 241, 0.14)',
                color: '#4338ca',
                border: '1px solid rgba(99, 102, 241, 0.25)'
            };
        }
        // Blue / In Progress: Plant, Production, Dispatched, In Transit
        if (s.includes('plant') || s.includes('run') || s.includes('process') || s.includes('partial') || s === 'follow-up' || s.includes('plan') || s.includes('transit') || s.includes('dispatch') || s.includes('production') || s.includes('created')) {
            return {
                background: 'rgba(59, 130, 246, 0.12)',
                color: '#1e40af',
                border: '1px solid rgba(59, 130, 246, 0.2)'
            };
        }
        // Orange / Warning: Returned, Returned for Correction, returned_for_correction
        if (s.includes('return') || s === 'returned_for_correction') {
            return {
                background: 'rgba(249, 115, 22, 0.12)',
                color: '#c2410c',
                border: '1px solid rgba(249, 115, 22, 0.2)'
            };
        }
        // Yellow / Pending: Pending, Sent, Draft, Requested
        if (s.includes('pending') || s.includes('draft') || s === 'sent' || s === 'new' || s === 'requested') {
            return {
                background: 'rgba(234, 179, 8, 0.12)',
                color: '#854d0e',
                border: '1px solid rgba(234, 179, 8, 0.2)'
            };
        }
        // Red / Alert: Reject, Lost, Hold, Cancelled
        if (s.includes('reject') || s.includes('lost') || s.includes('out') || s.includes('fail') || s === 'hold' || s === 'qc rejected' || s.includes('low') || s.includes('delay') || s.includes('cancel')) {
            return {
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#991b1b',
                border: '1px solid rgba(239, 68, 68, 0.2)'
            };
        }
        return {
            background: '#f1f5f9',
            color: '#475569',
            border: '1px solid #D6E2F0'
        };
    };
    const style = getBadgeStyle(status);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        style: {
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 'bold',
            letterSpacing: '0.02em',
            textTransform: 'capitalize',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            ...style
        },
        children: getStatusDisplay(status)
    }, void 0, false, {
        fileName: "[project]/shared/components/StatusBadge.jsx",
        lineNumber: 78,
        columnNumber: 5
    }, this);
}
}),
"[project]/shared/context/ToastContext.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastProvider",
    ()=>ToastProvider,
    "useToast",
    ()=>useToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notificationStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/notificationStore.ts [app-ssr] (ecmascript)");
;
const useToast = ()=>{
    const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notificationStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationStore"])();
    return {
        addToast: store.showToast,
        removeToast: store.dismissToast,
        showToast: store.showToast
    };
};
const ToastProvider = ({ children })=>{
    return children;
};
}),
"[project]/shared/components/ProductMasterUI.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProductMasterUI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.mjs [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.mjs [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$line$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pen-line.mjs [app-ssr] (ecmascript) <export default as Edit3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.mjs [app-ssr] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.mjs [app-ssr] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.mjs [app-ssr] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.mjs [app-ssr] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.mjs [app-ssr] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$DataTable$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/components/DataTable.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/components/StatusBadge.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ToastContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/context/ToastContext.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$ConfirmDialog$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/ConfirmDialog.jsx [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
function ProductMasterUI({ role }) {
    const { showToast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ToastContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useToast"])();
    const { confirm, ConfirmDialogComponent } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$ConfirmDialog$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useConfirm"])();
    const [products, setProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    // Pagination State
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const [totalPages, setTotalPages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const [totalCount, setTotalCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const limit = 20;
    // Filters
    const [filterFamily, setFilterFamily] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('All');
    const [filterDispatch, setFilterDispatch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('All');
    const [isModalOpen, setIsModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [importing, setImporting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Form State
    const initialFormState = {
        id: null,
        product_name: '',
        product_code: '',
        product_type: 'Manufactured',
        product_family: '',
        variant_details: '',
        unit_of_measure: 'Set',
        brand: 'HIMALAYA',
        gst_rate: 18,
        hsn_sac_code: '',
        dispatch_category: 'DISPATCH 1'
    };
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialFormState);
    const isSuperAdmin = role === 'Super Admin';
    const canDelete = isSuperAdmin;
    // Both Super Admin & Plant Head can Create/Edit
    const canEdit = isSuperAdmin || role === 'Plant Head';
    // Fetch Paginated Data
    const fetchProducts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit,
                search: searchQuery
            });
            // Optionally add category filters if backend supports it later
            const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].get(`/api/products?${params}`);
            if (data.success) {
                let list = data.data || [];
                // Client-side filtering for dispatch and family (since backend pagination currently only supports global search)
                // If the dataset is large, these filters should be moved to the backend as well.
                if (filterFamily !== 'All') {
                    list = list.filter((p)=>p.product_family === filterFamily || !p.product_family && filterFamily === 'Other');
                }
                if (filterDispatch !== 'All') {
                    list = list.filter((p)=>p.dispatch_category === filterDispatch);
                }
                setProducts(list);
                setTotalPages(data.pagination?.totalPages || 1);
                setTotalCount(data.pagination?.totalCount || list.length);
            }
        } catch (err) {
            showToast('error', 'Failed to fetch products');
        } finally{
            setLoading(false);
        }
    }, [
        page,
        limit,
        searchQuery,
        filterFamily,
        filterDispatch,
        showToast
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Reset to page 1 when search or filters change
        setPage(1);
    }, [
        searchQuery,
        filterFamily,
        filterDispatch
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const delayDebounceFn = setTimeout(()=>{
            fetchProducts();
        }, 300);
        return ()=>clearTimeout(delayDebounceFn);
    }, [
        fetchProducts
    ]);
    const families = [
        'All',
        'Manhole Covers',
        'Gratings',
        'Pipes',
        'Blocks',
        'Other'
    ]; // Static for now to avoid full table scan
    const dispatchCats = [
        'All',
        'DISPATCH 1',
        'DISPATCH 2'
    ];
    const productTypes = [
        'Manufactured',
        'Trading',
        'Service'
    ];
    const columns = [
        {
            header: 'Product Code',
            accessor: 'product_code'
        },
        {
            header: 'Product Name',
            accessor: (p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontWeight: 600
                            },
                            children: p.product_name
                        }, void 0, false, {
                            fileName: "[project]/shared/components/ProductMasterUI.jsx",
                            lineNumber: 109,
                            columnNumber: 11
                        }, this),
                        p.variant_details && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: '11px',
                                color: '#5E6B82'
                            },
                            children: p.variant_details
                        }, void 0, false, {
                            fileName: "[project]/shared/components/ProductMasterUI.jsx",
                            lineNumber: 110,
                            columnNumber: 33
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/shared/components/ProductMasterUI.jsx",
                    lineNumber: 108,
                    columnNumber: 9
                }, this)
        },
        {
            header: 'Type / Family',
            accessor: (p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: '13px'
                            },
                            children: p.product_type || '—'
                        }, void 0, false, {
                            fileName: "[project]/shared/components/ProductMasterUI.jsx",
                            lineNumber: 118,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                fontSize: '11px',
                                color: '#5E6B82'
                            },
                            children: p.product_family || '—'
                        }, void 0, false, {
                            fileName: "[project]/shared/components/ProductMasterUI.jsx",
                            lineNumber: 119,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/shared/components/ProductMasterUI.jsx",
                    lineNumber: 117,
                    columnNumber: 9
                }, this)
        },
        {
            header: 'Unit',
            accessor: 'unit_of_measure'
        },
        {
            header: 'Brand',
            accessor: 'brand'
        },
        {
            header: 'GST / HSN',
            accessor: (p)=>`${p.gst_rate}%${p.hsn_sac_code ? ` / ${p.hsn_sac_code}` : ''}`
        },
        {
            header: 'Dispatch',
            accessor: (p)=>{
                const badgeProps = p.dispatch_category === 'DISPATCH 2' ? {
                    text: 'D2',
                    type: 'success'
                } : p.dispatch_category === 'DISPATCH 1' ? {
                    text: 'D1',
                    type: 'primary'
                } : {
                    text: '—',
                    type: 'secondary'
                };
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    ...badgeProps
                }, void 0, false, {
                    fileName: "[project]/shared/components/ProductMasterUI.jsx",
                    lineNumber: 134,
                    columnNumber: 16
                }, this);
            }
        },
        {
            header: 'Actions',
            accessor: (p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        gap: '8px'
                    },
                    children: [
                        canEdit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>openEdit(p),
                            style: {
                                background: 'none',
                                border: 'none',
                                color: '#6366f1',
                                cursor: 'pointer'
                            },
                            title: "Edit",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2d$line$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit3$3e$__["Edit3"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                lineNumber: 147,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/shared/components/ProductMasterUI.jsx",
                            lineNumber: 142,
                            columnNumber: 13
                        }, this),
                        canDelete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>handleDelete(p.id),
                            style: {
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer'
                            },
                            title: "Delete",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                lineNumber: 156,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/shared/components/ProductMasterUI.jsx",
                            lineNumber: 151,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/shared/components/ProductMasterUI.jsx",
                    lineNumber: 140,
                    columnNumber: 9
                }, this)
        }
    ];
    const openEdit = (p)=>{
        setFormData({
            id: p.id,
            product_name: p.product_name || '',
            product_code: p.product_code || '',
            product_type: p.product_type || 'Manufactured',
            product_family: p.product_family || '',
            variant_details: p.variant_details || '',
            unit_of_measure: p.unit_of_measure || 'Set',
            brand: p.brand || 'HIMALAYA',
            gst_rate: p.gst_rate || 18,
            hsn_sac_code: p.hsn_sac_code || '',
            dispatch_category: p.dispatch_category || 'DISPATCH 1'
        });
        setIsModalOpen(true);
    };
    const openCreate = ()=>{
        setFormData({
            ...initialFormState
        });
        setIsModalOpen(true);
    };
    const handleSave = async ()=>{
        if (!formData.product_name || !formData.product_code) {
            showToast('Name and Code are required.', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            if (formData.id) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].put(`/api/products/${formData.id}`, formData);
                showToast('Product updated successfully.');
            } else {
                await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post('/api/products', formData);
                showToast('success', 'Product saved successfully');
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to save product', 'error');
        } finally{
            setIsSubmitting(false);
        }
    };
    const handleDelete = async (id)=>{
        confirm({
            title: 'Delete Product',
            message: 'Are you sure you want to delete this product? This action cannot be undone and may affect historical records.',
            confirmText: 'Delete',
            confirmColor: '#ef4444',
            onConfirm: async ()=>{
                try {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].delete(`/api/products/${id}`);
                    showToast('success', 'Product deleted successfully');
                    fetchProducts();
                } catch (err) {
                    showToast(err.response?.data?.message || 'Failed to delete product', 'error');
                }
            }
        });
    };
    const handleImport = async (e)=>{
        const file = e.target.files?.[0];
        if (!file) return;
        setImporting(true);
        const fd = new FormData();
        fd.append('file', file);
        try {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].post('/api/products/import', fd, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            showToast(`Imported successfully. ${res.data.inserted} added, ${res.data.updated} updated.`);
            fetchProducts();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to import products', 'error');
        } finally{
            setImporting(false);
            e.target.value = '';
        }
    };
    const handleExport = ()=>{
        if (!products || products.length === 0) {
            showToast('No products to export', 'error');
            return;
        }
        // Basic CSV Export
        const headers = [
            'ID',
            'Code',
            'Name',
            'Type',
            'Family',
            'Variant',
            'Unit',
            'Brand',
            'GST',
            'HSN',
            'Dispatch'
        ];
        const rows = products.map((p)=>[
                p.id,
                p.product_code,
                `"${(p.product_name || '').replace(/"/g, '""')}"`,
                p.product_type,
                `"${(p.product_family || '').replace(/"/g, '""')}"`,
                `"${(p.variant_details || '').replace(/"/g, '""')}"`,
                p.unit_of_measure,
                `"${(p.brand || '').replace(/"/g, '""')}"`,
                p.gst_rate,
                p.hsn_sac_code,
                p.dispatch_category
            ]);
        const csvContent = [
            headers.join(','),
            ...rows.map((r)=>r.join(','))
        ].join('\n');
        const blob = new Blob([
            csvContent
        ], {
            type: 'text/csv;charset=utf-8;'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `product_master_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: '24px',
            animation: 'fadeIn 0.3s ease-in-out'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ConfirmDialogComponent, {}, void 0, false, {
                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                lineNumber: 281,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    fontSize: '24px',
                                    fontWeight: 700,
                                    color: '#F5FAFE',
                                    margin: 0
                                },
                                children: "Product Master"
                            }, void 0, false, {
                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                lineNumber: 285,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    color: '#8893A7',
                                    margin: '4px 0 0 0',
                                    fontSize: '14px'
                                },
                                children: "Centralized catalog for all items, variants, and dispatch routing."
                            }, void 0, false, {
                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                lineNumber: 286,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                        lineNumber: 284,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '12px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleExport,
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#f1f5f9',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 600
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                        lineNumber: 293,
                                        columnNumber: 13
                                    }, this),
                                    " Export CSV"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                lineNumber: 289,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>fetchProducts(),
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#f1f5f9',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 600
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                        size: 16,
                                        className: loading ? "animate-spin" : ""
                                    }, void 0, false, {
                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                        lineNumber: 300,
                                        columnNumber: 13
                                    }, this),
                                    " Refresh"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                lineNumber: 296,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#f1f5f9',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 600
                                },
                                children: [
                                    importing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                        size: 16,
                                        className: "animate-spin"
                                    }, void 0, false, {
                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                        lineNumber: 304,
                                        columnNumber: 26
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                        lineNumber: 304,
                                        columnNumber: 77
                                    }, this),
                                    importing ? 'Importing...' : 'Import Excel',
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "file",
                                        accept: ".xlsx,.xls,.csv",
                                        onChange: handleImport,
                                        style: {
                                            display: 'none'
                                        },
                                        disabled: importing
                                    }, void 0, false, {
                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                        lineNumber: 306,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                lineNumber: 303,
                                columnNumber: 11
                            }, this),
                            canEdit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: openCreate,
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    background: '#6366f1',
                                    border: 'none',
                                    color: '#fff',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                        lineNumber: 314,
                                        columnNumber: 15
                                    }, this),
                                    " Add Product"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                lineNumber: 310,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                        lineNumber: 288,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                lineNumber: 283,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '20px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            position: 'relative'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                size: 18,
                                style: {
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#5E6B82'
                                }
                            }, void 0, false, {
                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                lineNumber: 322,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: "Search by code or name...",
                                value: searchQuery,
                                onChange: (e)=>setSearchQuery(e.target.value),
                                style: {
                                    width: '100%',
                                    padding: '10px 10px 10px 40px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '14px',
                                    outline: 'none'
                                }
                            }, void 0, false, {
                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                lineNumber: 323,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                        lineNumber: 321,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: filterFamily,
                        onChange: (e)=>setFilterFamily(e.target.value),
                        style: {
                            padding: '10px 16px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '14px',
                            outline: 'none',
                            cursor: 'pointer'
                        },
                        children: families.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: f,
                                style: {
                                    background: '#1e293b'
                                },
                                children: f === 'All' ? 'All Families' : f
                            }, f, false, {
                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                lineNumber: 336,
                                columnNumber: 30
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                        lineNumber: 331,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: filterDispatch,
                        onChange: (e)=>setFilterDispatch(e.target.value),
                        style: {
                            padding: '10px 16px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '14px',
                            outline: 'none',
                            cursor: 'pointer'
                        },
                        children: dispatchCats.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: d,
                                style: {
                                    background: '#1e293b'
                                },
                                children: d === 'All' ? 'All Dispatches' : d
                            }, d, false, {
                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                lineNumber: 343,
                                columnNumber: 34
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                        lineNumber: 338,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                lineNumber: 320,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "crm-table-container",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$DataTable$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    columns: columns,
                    data: products,
                    isLoading: loading
                }, void 0, false, {
                    fileName: "[project]/shared/components/ProductMasterUI.jsx",
                    lineNumber: 348,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                lineNumber: 347,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '16px',
                    padding: '10px 16px',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    border: '1px solid #DCE5F0'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: '13px',
                            color: '#5E6B82',
                            fontWeight: '500'
                        },
                        children: [
                            "Showing Page ",
                            page,
                            " of ",
                            totalPages,
                            " (Total: ",
                            totalCount,
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                        lineNumber: 352,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '8px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn-small btn-outline-small",
                                disabled: page === 1,
                                onClick: ()=>setPage((p)=>p - 1),
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                        lineNumber: 362,
                                        columnNumber: 13
                                    }, this),
                                    " Previous"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                lineNumber: 356,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn-small btn-outline-small",
                                disabled: page >= totalPages,
                                onClick: ()=>setPage((p)=>p + 1),
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                },
                                children: [
                                    "Next ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                        lineNumber: 370,
                                        columnNumber: 18
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                lineNumber: 364,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                        lineNumber: 355,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                lineNumber: 351,
                columnNumber: 7
            }, this),
            isModalOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: '#1e293b',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '600px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: '90vh'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                padding: '20px 24px',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    style: {
                                        margin: 0,
                                        fontSize: '18px',
                                        fontWeight: 600,
                                        color: '#F5FAFE'
                                    },
                                    children: formData.id ? 'Edit Product' : 'Add New Product'
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                    lineNumber: 380,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsModalOpen(false),
                                    style: {
                                        background: 'none',
                                        border: 'none',
                                        color: '#8893A7',
                                        cursor: 'pointer',
                                        fontSize: '20px'
                                    },
                                    children: "×"
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                    lineNumber: 383,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/shared/components/ProductMasterUI.jsx",
                            lineNumber: 379,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                padding: '24px',
                                overflowY: 'auto',
                                flex: 1
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '16px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            gridColumn: 'span 2'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: {
                                                    display: 'block',
                                                    marginBottom: '6px',
                                                    fontSize: '13px',
                                                    color: '#D6E2F0'
                                                },
                                                children: "Product Name *"
                                            }, void 0, false, {
                                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                lineNumber: 389,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: formData.product_name,
                                                onChange: (e)=>setFormData({
                                                        ...formData,
                                                        product_name: e.target.value
                                                    }),
                                                placeholder: "e.g. WCB 20MM",
                                                style: {
                                                    width: '100%',
                                                    padding: '10px',
                                                    background: 'rgba(0,0,0,0.2)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '6px',
                                                    color: '#fff'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                lineNumber: 390,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                        lineNumber: 388,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: {
                                                    display: 'block',
                                                    marginBottom: '6px',
                                                    fontSize: '13px',
                                                    color: '#D6E2F0'
                                                },
                                                children: "Product Code *"
                                            }, void 0, false, {
                                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                lineNumber: 394,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: formData.product_code,
                                                onChange: (e)=>setFormData({
                                                        ...formData,
                                                        product_code: e.target.value
                                                    }),
                                                placeholder: "e.g. WCB-20",
                                                style: {
                                                    width: '100%',
                                                    padding: '10px',
                                                    background: 'rgba(0,0,0,0.2)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '6px',
                                                    color: '#fff'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                lineNumber: 395,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                        lineNumber: 393,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: {
                                                    display: 'block',
                                                    marginBottom: '6px',
                                                    fontSize: '13px',
                                                    color: '#D6E2F0'
                                                },
                                                children: "Product Type"
                                            }, void 0, false, {
                                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                lineNumber: 399,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: formData.product_type,
                                                onChange: (e)=>setFormData({
                                                        ...formData,
                                                        product_type: e.target.value
                                                    }),
                                                style: {
                                                    width: '100%',
                                                    padding: '10px',
                                                    background: 'rgba(0,0,0,0.2)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '6px',
                                                    color: '#fff'
                                                },
                                                children: productTypes.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: t,
                                                        children: t
                                                    }, t, false, {
                                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                        lineNumber: 401,
                                                        columnNumber: 44
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                lineNumber: 400,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                        lineNumber: 398,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: {
                                                    display: 'block',
                                                    marginBottom: '6px',
                                                    fontSize: '13px',
                                                    color: '#D6E2F0'
                                                },
                                                children: "Product Family"
                                            }, void 0, false, {
                                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                lineNumber: 406,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: formData.product_family,
                                                onChange: (e)=>setFormData({
                                                        ...formData,
                                                        product_family: e.target.value
                                                    }),
                                                placeholder: "e.g. Cover Block",
                                                style: {
                                                    width: '100%',
                                                    padding: '10px',
                                                    background: 'rgba(0,0,0,0.2)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '6px',
                                                    color: '#fff'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                lineNumber: 407,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                        lineNumber: 405,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: {
                                                    display: 'block',
                                                    marginBottom: '6px',
                                                    fontSize: '13px',
                                                    color: '#D6E2F0'
                                                },
                                                children: "Variant Details"
                                            }, void 0, false, {
                                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                lineNumber: 411,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: formData.variant_details,
                                                onChange: (e)=>setFormData({
                                                        ...formData,
                                                        variant_details: e.target.value
                                                    }),
                                                placeholder: "e.g. 20mm",
                                                style: {
                                                    width: '100%',
                                                    padding: '10px',
                                                    background: 'rgba(0,0,0,0.2)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '6px',
                                                    color: '#fff'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                lineNumber: 412,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                        lineNumber: 410,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: {
                                                    display: 'block',
                                                    marginBottom: '6px',
                                                    fontSize: '13px',
                                                    color: '#D6E2F0'
                                                },
                                                children: "Unit of Measure"
                                            }, void 0, false, {
                                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                lineNumber: 416,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: formData.unit_of_measure,
                                                onChange: (e)=>setFormData({
                                                        ...formData,
                                                        unit_of_measure: e.target.value
                                                    }),
                                                style: {
                                                    width: '100%',
                                                    padding: '10px',
                                                    background: 'rgba(0,0,0,0.2)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '6px',
                                                    color: '#fff'
                                                },
                                                children: UNITS.map((u)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: u,
                                                        children: u
                                                    }, u, false, {
                                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                        lineNumber: 418,
                                                        columnNumber: 37
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                lineNumber: 417,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                        lineNumber: 415,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: {
                                                    display: 'block',
                                                    marginBottom: '6px',
                                                    fontSize: '13px',
                                                    color: '#D6E2F0'
                                                },
                                                children: "Brand"
                                            }, void 0, false, {
                                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                lineNumber: 423,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: formData.brand,
                                                onChange: (e)=>setFormData({
                                                        ...formData,
                                                        brand: e.target.value
                                                    }),
                                                style: {
                                                    width: '100%',
                                                    padding: '10px',
                                                    background: 'rgba(0,0,0,0.2)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '6px',
                                                    color: '#fff'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                lineNumber: 424,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                        lineNumber: 422,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                style: {
                                                    display: 'block',
                                                    marginBottom: '6px',
                                                    fontSize: '13px',
                                                    color: '#D6E2F0'
                                                },
                                                children: "Dispatch Category"
                                            }, void 0, false, {
                                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                lineNumber: 428,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: formData.dispatch_category,
                                                onChange: (e)=>setFormData({
                                                        ...formData,
                                                        dispatch_category: e.target.value
                                                    }),
                                                style: {
                                                    width: '100%',
                                                    padding: '10px',
                                                    background: 'rgba(0,0,0,0.2)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '6px',
                                                    color: '#fff'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "DISPATCH 1",
                                                        children: "DISPATCH 1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                        lineNumber: 430,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "DISPATCH 2",
                                                        children: "DISPATCH 2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                        lineNumber: 431,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                lineNumber: 429,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                        lineNumber: 427,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '16px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        style: {
                                                            display: 'block',
                                                            marginBottom: '6px',
                                                            fontSize: '13px',
                                                            color: '#D6E2F0'
                                                        },
                                                        children: "GST Rate (%)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                        lineNumber: 437,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        value: formData.gst_rate,
                                                        onChange: (e)=>setFormData({
                                                                ...formData,
                                                                gst_rate: e.target.value
                                                            }),
                                                        style: {
                                                            width: '100%',
                                                            padding: '10px',
                                                            background: 'rgba(0,0,0,0.2)',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            borderRadius: '6px',
                                                            color: '#fff'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                        lineNumber: 438,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                lineNumber: 436,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        style: {
                                                            display: 'block',
                                                            marginBottom: '6px',
                                                            fontSize: '13px',
                                                            color: '#D6E2F0'
                                                        },
                                                        children: "HSN / SAC Code"
                                                    }, void 0, false, {
                                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                        lineNumber: 441,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        value: formData.hsn_sac_code,
                                                        onChange: (e)=>setFormData({
                                                                ...formData,
                                                                hsn_sac_code: e.target.value
                                                            }),
                                                        style: {
                                                            width: '100%',
                                                            padding: '10px',
                                                            background: 'rgba(0,0,0,0.2)',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            borderRadius: '6px',
                                                            color: '#fff'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                        lineNumber: 442,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                                lineNumber: 440,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                        lineNumber: 435,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                lineNumber: 387,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/shared/components/ProductMasterUI.jsx",
                            lineNumber: 386,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                padding: '20px 24px',
                                borderTop: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setIsModalOpen(false),
                                    style: {
                                        padding: '10px 20px',
                                        background: 'transparent',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: '#F5FAFE',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    },
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                    lineNumber: 450,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: handleSave,
                                    disabled: isSubmitting,
                                    style: {
                                        padding: '10px 20px',
                                        background: '#6366f1',
                                        border: 'none',
                                        color: '#fff',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        opacity: isSubmitting ? 0.7 : 1
                                    },
                                    children: isSubmitting ? 'Saving...' : 'Save Product'
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/ProductMasterUI.jsx",
                                    lineNumber: 457,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/shared/components/ProductMasterUI.jsx",
                            lineNumber: 449,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/shared/components/ProductMasterUI.jsx",
                    lineNumber: 377,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/shared/components/ProductMasterUI.jsx",
                lineNumber: 376,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/shared/components/ProductMasterUI.jsx",
        lineNumber: 280,
        columnNumber: 5
    }, this);
}
}),
"[project]/shared/components/OrderDetailsModal.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>OrderDetailsModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/components/StatusBadge.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$OrderTimeline$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/OrderTimeline.jsx [app-ssr] (ecmascript)");
;
;
;
;
function OrderDetailsModal({ order, role, onClose }) {
    if (!order) return null;
    // Hide pricing for production and plant-head roles — they only need product + quantity
    const isProduction = role === 'production' || role === 'plant';
    // Normalize data formats to support both top-level state data and custom format data
    const orderRef = order.orderNo || order.ref || '';
    const customerName = order.customerName || (order.customer && typeof order.customer === 'object' ? order.customer.name : order.customer) || '';
    const date = order.date || order.orderDate || '2026-06-05';
    const orderStatus = order.status || order.salesStatus || 'Pending';
    const productionStatus = order.productionStatus || 'Pending';
    const dispatchStatus = order.dispatchStatus || 'Pending';
    // GST / Address fallback resolution
    const gst = order.gst || (order.customer && typeof order.customer === 'object' ? order.customer.gst : '') || '27ABCDE4321G2Z8';
    const address = (order.customer && typeof order.customer === 'object' ? order.customer.address : '') || 'Andheri, Mumbai (Default Address)';
    const formatINR = (value)=>{
        if (typeof value === 'string') {
            if (value.startsWith('₹')) return value;
            return `₹${value}`;
        }
        const num = Number(value);
        if (isNaN(num)) return '₹0';
        if (num >= 100000) {
            return `₹${(num / 100000).toFixed(2)} L`;
        }
        return `₹${Math.round(num).toLocaleString('en-IN')}`;
    };
    const transportVal = order.transportCharge !== undefined ? order.transportCharge : 0;
    const itemsList = order.detailedItems || order.items || [
        {
            name: order.products || order.product || 'Unknown Product',
            code: order.code || `P-${((order.products || order.product || 'PRD').replace(/[^A-Za-z]/g, '').substring(0, 3) || 'PRD').toUpperCase()}-02`,
            qty: order.quantity || order.qty || 1,
            rate: order.rate || ((order.payment?.totalAmount || order.totalValue || 0) - transportVal) / (order.quantity || 1),
            gst: order.tax !== undefined ? order.tax : order.gst !== undefined ? order.gst : 18,
            total: order.total || order.totalValue || 0
        }
    ];
    // Helper calculation values for fallback invoice totals if not explicitly provided
    const rawSubtotal = itemsList.reduce((sum, item)=>{
        const qtyVal = item.qty || item.quantity || 1;
        const rateVal = item.rate || item.unitPrice || 0;
        return sum + qtyVal * rateVal;
    }, 0);
    const rawGstAmount = itemsList.reduce((sum, item)=>{
        const qtyVal = item.qty || item.quantity || 1;
        const rateVal = item.rate || item.unitPrice || 0;
        const gstVal = item.gst !== undefined ? item.gst : item.tax !== undefined ? item.tax : 18;
        return sum + qtyVal * rateVal * (gstVal / 100);
    }, 0);
    const rawGrandTotal = rawSubtotal + rawGstAmount;
    // Dynamically compute transportVal fallback if it is not explicitly stored on the order,
    // by calculating the difference between recorded grand total and raw items total + tax.
    const orderGrandTotal = order.payment?.totalAmount || order.totalValue || rawGrandTotal;
    const computedTransportVal = order.transportCharge !== undefined ? order.transportCharge : Math.max(0, orderGrandTotal - rawGrandTotal);
    const displaySubtotal = order.subtotal !== undefined ? formatINR(order.subtotal) : formatINR(rawSubtotal);
    const displayGstAmount = order.gstAmount !== undefined ? formatINR(order.gstAmount) : formatINR(rawGstAmount);
    const displayGrandTotal = order.grandTotal !== undefined ? formatINR(order.grandTotal) : formatINR(orderGrandTotal);
    const getDispatchBadge = (status)=>{
        const s = status || 'Pending';
        switch(s){
            case 'Delivered':
                return 'badge badge-approved';
            case 'Dispatched':
                return 'badge badge-sent';
            default:
                return 'badge badge-pending';
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "modal-overlay active",
        onClick: onClose,
        style: {
            zIndex: 10000
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "invoice-sheet-modal",
            onClick: (e)=>e.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "sheet-header",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    style: {
                                        fontSize: '24px',
                                        fontWeight: '900',
                                        color: '#1e293b',
                                        letterSpacing: '-0.5px',
                                        margin: 0
                                    },
                                    children: "HIMALAYA PRODUCTS"
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 96,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: '13px',
                                        color: '#5E6B82',
                                        fontWeight: '600',
                                        margin: '2px 0 0 0'
                                    },
                                    children: "Concrete & Aggregate Supply"
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 97,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                            lineNumber: 95,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                textAlign: 'right'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    style: {
                                        fontSize: '22px',
                                        fontWeight: '900',
                                        color: '#1e293b',
                                        letterSpacing: '-0.5px',
                                        margin: 0
                                    },
                                    children: "ORDER"
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 100,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: '13px',
                                        color: '#5E6B82',
                                        fontWeight: '700',
                                        margin: '4px 0 0 0'
                                    },
                                    children: [
                                        "Ref: ",
                                        orderRef
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 101,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                            lineNumber: 99,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                    lineNumber: 94,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                    style: {
                        border: 'none',
                        borderTop: '2px solid #000000',
                        margin: '0 0 24px 0'
                    }
                }, void 0, false, {
                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                    lineNumber: 106,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "sheet-meta",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        margin: 0,
                                        fontWeight: '700',
                                        color: '#5E6B82',
                                        textTransform: 'uppercase',
                                        fontSize: '11px',
                                        letterSpacing: '0.5px'
                                    },
                                    children: "Bill To:"
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 111,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        margin: '4px 0 0 0',
                                        fontWeight: '800',
                                        color: '#1e293b',
                                        fontSize: '15px'
                                    },
                                    children: customerName
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 112,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        margin: '4px 0 0 0',
                                        color: '#475569',
                                        fontWeight: '500'
                                    },
                                    children: address
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 113,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        margin: '8px 0 0 0',
                                        color: '#1e293b',
                                        fontWeight: '700',
                                        fontSize: '12.5px'
                                    },
                                    children: [
                                        "GST: ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: '#475569',
                                                fontWeight: '600'
                                            },
                                            children: gst
                                        }, void 0, false, {
                                            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                            lineNumber: 114,
                                            columnNumber: 110
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 114,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                            lineNumber: 110,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "sheet-meta-right",
                            style: {
                                display: 'grid',
                                gridTemplateColumns: 'auto auto',
                                columnGap: '12px',
                                rowGap: '12px',
                                alignItems: 'center'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        margin: 0,
                                        textAlign: 'right',
                                        fontWeight: '700',
                                        color: '#5E6B82',
                                        fontSize: '13px'
                                    },
                                    children: "Order Date:"
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 117,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        margin: 0,
                                        textAlign: 'left',
                                        fontWeight: '500',
                                        color: '#475569',
                                        fontSize: '14px'
                                    },
                                    children: date
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 118,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        margin: 0,
                                        textAlign: 'right',
                                        fontWeight: '700',
                                        color: '#5E6B82',
                                        fontSize: '13px'
                                    },
                                    children: "Order Status:"
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 120,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        textAlign: 'left'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        status: orderStatus
                                    }, void 0, false, {
                                        fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                        lineNumber: 121,
                                        columnNumber: 48
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 121,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        margin: 0,
                                        textAlign: 'right',
                                        fontWeight: '700',
                                        color: '#5E6B82',
                                        fontSize: '13px'
                                    },
                                    children: "Production Status:"
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 123,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        textAlign: 'left'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        status: productionStatus
                                    }, void 0, false, {
                                        fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                        lineNumber: 124,
                                        columnNumber: 48
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 124,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        margin: 0,
                                        textAlign: 'right',
                                        fontWeight: '700',
                                        color: '#5E6B82',
                                        fontSize: '13px'
                                    },
                                    children: "Dispatch Status:"
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 126,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        textAlign: 'left'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: getDispatchBadge(dispatchStatus),
                                        style: {
                                            margin: 0
                                        },
                                        children: dispatchStatus
                                    }, void 0, false, {
                                        fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                        lineNumber: 127,
                                        columnNumber: 48
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 127,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                            lineNumber: 116,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                    lineNumber: 109,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "crm-table-container hide-scrollbar",
                    style: {
                        margin: '0 0 24px 0',
                        border: '1px solid #eaeaea',
                        borderRadius: '12px',
                        overflow: 'hidden'
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        className: "crm-table responsive-table",
                        style: {
                            border: 'none'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    style: {
                                        background: '#f8f9fa'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '12px 16px',
                                                fontWeight: '700',
                                                color: '#475569',
                                                fontSize: '11px',
                                                textTransform: 'uppercase'
                                            },
                                            children: "Product Details"
                                        }, void 0, false, {
                                            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                            lineNumber: 136,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '12px 16px',
                                                textAlign: 'center',
                                                fontWeight: '700',
                                                color: '#475569',
                                                fontSize: '11px',
                                                textTransform: 'uppercase'
                                            },
                                            children: "Qty"
                                        }, void 0, false, {
                                            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                            lineNumber: 137,
                                            columnNumber: 17
                                        }, this),
                                        !isProduction && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '12px 16px',
                                                textAlign: 'center',
                                                fontWeight: '700',
                                                color: '#475569',
                                                fontSize: '11px',
                                                textTransform: 'uppercase'
                                            },
                                            children: "Rate"
                                        }, void 0, false, {
                                            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                            lineNumber: 138,
                                            columnNumber: 35
                                        }, this),
                                        !isProduction && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '12px 16px',
                                                textAlign: 'center',
                                                fontWeight: '700',
                                                color: '#475569',
                                                fontSize: '11px',
                                                textTransform: 'uppercase'
                                            },
                                            children: "Tax (GST)"
                                        }, void 0, false, {
                                            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                            lineNumber: 139,
                                            columnNumber: 35
                                        }, this),
                                        !isProduction && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '12px 16px',
                                                textAlign: 'right',
                                                fontWeight: '700',
                                                color: '#475569',
                                                fontSize: '11px',
                                                textTransform: 'uppercase'
                                            },
                                            children: "Total"
                                        }, void 0, false, {
                                            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                            lineNumber: 140,
                                            columnNumber: 35
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 135,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                lineNumber: 134,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: itemsList.map((item, index)=>{
                                    const itemName = item.name || item.productName || '';
                                    const itemCode = item.code || '';
                                    const qtyVal = item.qty || item.quantity || 1;
                                    const rateVal = item.rate || item.unitPrice || 0;
                                    const gstVal = item.gst !== undefined ? item.gst : item.tax !== undefined ? item.tax : 18;
                                    const totalVal = item.total || qtyVal * rateVal * (1 + gstVal / 100);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                "data-label": "Product Details",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                fontWeight: '700',
                                                                color: '#1e293b'
                                                            },
                                                            children: itemName
                                                        }, void 0, false, {
                                                            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                                            lineNumber: 156,
                                                            columnNumber: 25
                                                        }, this),
                                                        item.productDetails && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                fontSize: '12px',
                                                                color: '#475569',
                                                                marginTop: '2px',
                                                                fontWeight: '500'
                                                            },
                                                            children: item.productDetails
                                                        }, void 0, false, {
                                                            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                                            lineNumber: 158,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                fontSize: '11px',
                                                                color: '#5E6B82',
                                                                marginTop: '2px',
                                                                fontFamily: 'monospace'
                                                            },
                                                            children: [
                                                                "Code: ",
                                                                itemCode
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                                            lineNumber: 160,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                                    lineNumber: 155,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                                lineNumber: 154,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                "data-label": "Qty",
                                                style: {
                                                    textAlign: 'center',
                                                    fontWeight: '600',
                                                    color: '#334155'
                                                },
                                                children: qtyVal
                                            }, void 0, false, {
                                                fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                                lineNumber: 163,
                                                columnNumber: 21
                                            }, this),
                                            !isProduction && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                "data-label": "Rate",
                                                style: {
                                                    textAlign: 'center',
                                                    fontWeight: '600',
                                                    color: '#334155'
                                                },
                                                children: formatINR(rateVal)
                                            }, void 0, false, {
                                                fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                                lineNumber: 164,
                                                columnNumber: 39
                                            }, this),
                                            !isProduction && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                "data-label": "Tax (GST)",
                                                style: {
                                                    textAlign: 'center',
                                                    fontWeight: '600',
                                                    color: '#5E6B82'
                                                },
                                                children: [
                                                    gstVal,
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                                lineNumber: 165,
                                                columnNumber: 39
                                            }, this),
                                            !isProduction && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                "data-label": "Total",
                                                style: {
                                                    textAlign: 'right',
                                                    fontWeight: '800',
                                                    color: '#1e293b'
                                                },
                                                children: formatINR(totalVal)
                                            }, void 0, false, {
                                                fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                                lineNumber: 166,
                                                columnNumber: 39
                                            }, this)
                                        ]
                                    }, index, true, {
                                        fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                        lineNumber: 153,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                lineNumber: 143,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                        lineNumber: 133,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                    lineNumber: 132,
                    columnNumber: 9
                }, this),
                !isProduction && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "sheet-summary",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                width: '260px',
                                justifyContent: 'space-between',
                                fontSize: '13.5px',
                                color: '#475569',
                                fontWeight: '500'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Subtotal:"
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 178,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontWeight: '600',
                                        color: '#1e293b'
                                    },
                                    children: displaySubtotal
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 179,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                            lineNumber: 177,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                width: '260px',
                                justifyContent: 'space-between',
                                fontSize: '13.5px',
                                color: '#475569',
                                fontWeight: '500'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "GST Amount:"
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 182,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontWeight: '600',
                                        color: '#1e293b'
                                    },
                                    children: displayGstAmount
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 183,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                            lineNumber: 181,
                            columnNumber: 13
                        }, this),
                        computedTransportVal > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                width: '260px',
                                justifyContent: 'space-between',
                                fontSize: '13.5px',
                                color: '#0369a1',
                                fontWeight: '500'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Transport (Approx.):"
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 187,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontWeight: '600'
                                    },
                                    children: [
                                        "+",
                                        formatINR(computedTransportVal)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 188,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                            lineNumber: 186,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                width: '260px',
                                justifyContent: 'space-between',
                                fontSize: '16px',
                                fontWeight: '800',
                                color: '#1e293b',
                                borderTop: '1px solid #eaeaea',
                                paddingTop: '8px',
                                marginTop: '4px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Grand Total:"
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 192,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        color: '#1e293b',
                                        fontSize: '17px'
                                    },
                                    children: displayGrandTotal
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                                    lineNumber: 193,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                            lineNumber: 191,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                    lineNumber: 176,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        border: '1px solid #f0f0f0',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '20px',
                        background: '#ffffff'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                            style: {
                                fontSize: '11px',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                color: '#5E6B82',
                                marginBottom: '16px',
                                letterSpacing: '0.5px'
                            },
                            children: "Production & Fulfillment Journey"
                        }, void 0, false, {
                            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                            lineNumber: 200,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$OrderTimeline$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            orderId: orderRef,
                            compact: true
                        }, void 0, false, {
                            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                            lineNumber: 203,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                    lineNumber: 199,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "sheet-actions",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "btn-small btn-outline-small",
                        onClick: onClose,
                        style: {
                            padding: '10px 18px',
                            fontSize: '13px',
                            fontWeight: '700',
                            borderRadius: '8px',
                            margin: 0
                        },
                        children: "Close Panel"
                    }, void 0, false, {
                        fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                        lineNumber: 208,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/shared/components/OrderDetailsModal.jsx",
                    lineNumber: 207,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/shared/components/OrderDetailsModal.jsx",
            lineNumber: 89,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/shared/components/OrderDetailsModal.jsx",
        lineNumber: 88,
        columnNumber: 5
    }, this);
}
}),
"[project]/shared/components/O2PWorkflowBanner.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>O2PWorkflowBanner
]);
'use client';
function O2PWorkflowBanner() {
    return null;
}
}),
"[project]/shared/hooks/useO2PWorkflow.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "O2P_STEP",
    ()=>O2P_STEP,
    "STEP_META",
    ()=>STEP_META,
    "useO2PWorkflow",
    ()=>useO2PWorkflow
]);
'use client';
const O2P_STEP = {
    LEAD: 1,
    QUOTE: 2,
    ORDER: 3
};
const STEP_META = {};
function useO2PWorkflow() {
    return {
        activeOrderId: null,
        workflowHistory: [],
        completedSteps: new Set(),
        isAdvancing: false,
        stepError: null,
        activeOrder: null,
        currentStep: 0,
        stepMeta: {},
        nextRoute: '',
        advance: ()=>{},
        closeOrder: ()=>{},
        setActiveOrder: ()=>{}
    };
}
}),
];

//# sourceMappingURL=shared_83263edb._.js.map