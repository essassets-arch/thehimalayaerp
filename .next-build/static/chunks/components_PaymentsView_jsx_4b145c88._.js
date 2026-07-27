(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/PaymentsView.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PaymentsView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.mjs [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/credit-card.mjs [app-client] (ecmascript) <export default as CreditCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.mjs [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.mjs [app-client] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.mjs [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.mjs [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.mjs [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.mjs [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.mjs [app-client] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.mjs [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2d$call$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PhoneCall$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/phone-call.mjs [app-client] (ecmascript) <export default as PhoneCall>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.all.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/shared/context/ERPContext.jsx [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
function PaymentsView(param) {
    let { payments, onRecordPaymentClick, onReceivePayment, searchQuery, setSearchQuery, deliveredOrders, fetchDeliveredOrders, handleSalesConfirmPayment, handleUpdateFollowup, parseOrderFollowup } = param;
    _s();
    const { state: erpState, dispatch } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useERP"])();
    const paymentReminders = erpState.paymentReminders || [];
    const [localSearch, setLocalSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const search = searchQuery !== undefined ? searchQuery : localSearch;
    const setSearch = setSearchQuery !== undefined ? setSearchQuery : setLocalSearch;
    const [selectedInvoice, setSelectedInvoice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('All');
    const [deliveredFilter, setDeliveredFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Pending');
    const [reminderInvoice, setReminderInvoice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [reminderDate, setReminderDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Date().toISOString().split('T')[0]);
    const [reminderNotes, setReminderNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const formatINR = (value)=>{
        if (value >= 100000) {
            return "₹".concat((value / 100000).toFixed(2), " L");
        }
        return "₹".concat(Math.round(value).toLocaleString('en-IN'));
    };
    const handleReceivePaymentClick = function(invoice) {
        let closePreview = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
        const outstandingVal = invoice.totalAmount - invoice.paidAmount;
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Receive Payment?',
            text: "Are you sure you want to log full payment clearance of ₹".concat(outstandingVal.toLocaleString('en-IN'), " for invoice #").concat(invoice.invoiceNo, " (").concat(invoice.customerName, ")?"),
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Clear Balance',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'swal-premium-popup',
                title: 'swal-premium-title',
                htmlContainer: 'swal-premium-text',
                confirmButton: 'swal-premium-confirm-btn',
                cancelButton: 'swal-premium-cancel-btn'
            },
            buttonsStyling: false
        }).then((result)=>{
            if (result.isConfirmed) {
                onReceivePayment(invoice.id, outstandingVal, new Date().toISOString().split('T')[0], 'Bank Transfer', 'DIRECT-MARK-RECEIVED', 'Salesperson manually marked as received');
                if (closePreview) {
                    setSelectedInvoice(null);
                }
            }
        });
    };
    const [currentPage, setCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    // Reset page when search or filter changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PaymentsView.useEffect": ()=>{
            setCurrentPage(1);
        }
    }["PaymentsView.useEffect"], [
        search,
        filter
    ]);
    const filteredPayments = payments.filter((p)=>{
        const customerName = p.customerName || '';
        const invoiceNo = p.invoiceNo || '';
        const matchesSearch = customerName.toLowerCase().includes(search.toLowerCase()) || invoiceNo.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' || p.status === filter;
        return matchesSearch && matchesFilter;
    });
    // Stats
    const totalOutstanding = payments.filter((p)=>p.status !== 'Paid').reduce((sum, p)=>sum + (p.totalAmount - p.paidAmount), 0);
    const totalOverdue = payments.filter((p)=>p.status === 'Overdue').reduce((sum, p)=>sum + (p.totalAmount - p.paidAmount), 0);
    const getStatusBadge = (status)=>{
        switch(status){
            case 'Paid':
                return 'badge badge-approved';
            case 'Overdue':
                return 'badge badge-overdue';
            default:
                return 'badge badge-outstanding';
        }
    };
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysReminders = paymentReminders.filter((r)=>r.date <= todayStr);
    const upcomingReminders = paymentReminders.filter((r)=>r.date > todayStr);
    const countRemindersAll = paymentReminders.length;
    const countRemindersOutstanding = paymentReminders.filter((r)=>{
        const p = payments.find((pay)=>pay.id === r.invoiceId);
        return p && p.status === 'Outstanding';
    }).length;
    const countRemindersPaid = paymentReminders.filter((r)=>{
        const p = payments.find((pay)=>pay.id === r.invoiceId);
        return p && p.status === 'Paid';
    }).length;
    const countRemindersOverdue = paymentReminders.filter((r)=>{
        const p = payments.find((pay)=>pay.id === r.invoiceId);
        return p && p.status === 'Overdue';
    }).length;
    const getTabLabel = (st)=>{
        switch(st){
            case 'All':
                return "All (".concat(countRemindersAll, ")");
            case 'Outstanding':
                return "Outstanding (".concat(countRemindersOutstanding, ")");
            case 'Paid':
                return "Paid (".concat(countRemindersPaid, ")");
            case 'Overdue':
                return "Overdue (".concat(countRemindersOverdue, ")");
            case 'Reminders':
                return "Reminders (".concat(countRemindersAll, ")");
            default:
                return st;
        }
    };
    const filteredReminders = paymentReminders.filter((r)=>{
        const p = payments.find((pay)=>pay.id === r.invoiceId);
        if (filter === 'Outstanding' && (!p || p.status !== 'Outstanding')) return false;
        if (filter === 'Overdue' && (!p || p.status !== 'Overdue')) return false;
        if (filter === 'Paid' && (!p || p.status !== 'Paid')) return false;
        const customerName = r.customerName || '';
        const invoiceNo = r.invoiceNo || '';
        const notes = r.notes || '';
        return customerName.toLowerCase().includes(search.toLowerCase()) || invoiceNo.toLowerCase().includes(search.toLowerCase()) || notes.toLowerCase().includes(search.toLowerCase());
    });
    const ITEMS_PER_PAGE = 25;
    const totalItemsCount = filteredReminders.length;
    const totalPages = Math.ceil(totalItemsCount / ITEMS_PER_PAGE) || 1;
    const displayedReminders = filteredReminders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const displayedPayments = filteredPayments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "app-card",
        style: {
            flex: 1
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "module-header-row",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "module-title",
                        children: "Invoices & Receivables"
                    }, void 0, false, {
                        fileName: "[project]/components/PaymentsView.jsx",
                        lineNumber: 171,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "module-actions",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "tab-filters-row",
                                style: {
                                    background: '#f1f3f5'
                                },
                                children: [
                                    'All',
                                    'Outstanding',
                                    'Paid',
                                    'Overdue',
                                    'Reminders'
                                ].map((st)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "filter-pill ".concat(filter === st ? 'active' : ''),
                                        onClick: ()=>setFilter(st),
                                        style: {
                                            color: filter === st ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                                        },
                                        children: getTabLabel(st)
                                    }, st, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 176,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 174,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "search-box",
                                style: {
                                    background: '#f1f3f5',
                                    border: '1px solid #D6E2F0'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                        size: 14,
                                        style: {
                                            color: 'var(--color-text-secondary)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 188,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Search reminders or customer...",
                                        value: search,
                                        onChange: (e)=>setSearch(e.target.value),
                                        style: {
                                            color: 'var(--color-text-primary)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 189,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 187,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn-small btn-primary-small",
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                },
                                onClick: onRecordPaymentClick,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 202,
                                        columnNumber: 13
                                    }, this),
                                    " + Record Payment"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 197,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PaymentsView.jsx",
                        lineNumber: 172,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PaymentsView.jsx",
                lineNumber: 170,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "kpi-grid payments-kpi-grid",
                style: {
                    marginBottom: '16px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "kpi-card",
                        style: {
                            borderLeft: '5px solid var(--color-orange-dot)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "kpi-label",
                                        children: "Total Outstanding Receivables"
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 211,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"], {
                                        size: 16,
                                        style: {
                                            color: 'var(--color-orange-dot)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 212,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 210,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "kpi-value",
                                children: formatINR(totalOutstanding)
                            }, void 0, false, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 214,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PaymentsView.jsx",
                        lineNumber: 209,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "kpi-card",
                        style: {
                            borderLeft: '5px solid #ef4444'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "kpi-label",
                                        children: "Total Overdue Collections"
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 219,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                        size: 16,
                                        style: {
                                            color: '#ef4444'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 220,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 218,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "kpi-value",
                                style: {
                                    color: '#ef4444'
                                },
                                children: formatINR(totalOverdue)
                            }, void 0, false, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 222,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PaymentsView.jsx",
                        lineNumber: 217,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PaymentsView.jsx",
                lineNumber: 208,
                columnNumber: 7
            }, this),
            deliveredOrders && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginBottom: '20px',
                    padding: '16px',
                    background: '#ffffff',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-soft)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px',
                            flexWrap: 'wrap',
                            gap: '10px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    fontSize: '14.5px',
                                    fontWeight: '800',
                                    color: 'var(--color-text-primary)',
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            width: '8px',
                                            height: '8px',
                                            background: 'var(--color-accent-teal)',
                                            borderRadius: '50%'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 238,
                                        columnNumber: 15
                                    }, this),
                                    "Delivered orders awaiting payment confirmation"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 237,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "tab-filters-row",
                                        style: {
                                            background: '#DCE5F0',
                                            borderRadius: '8px',
                                            padding: '4px',
                                            display: 'flex',
                                            gap: '4px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "filter-pill ".concat(deliveredFilter === 'Pending' ? 'active' : ''),
                                                onClick: ()=>setDeliveredFilter('Pending'),
                                                style: {
                                                    padding: '4px 12px',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '11px',
                                                    background: deliveredFilter === 'Pending' ? '#fff' : 'transparent',
                                                    color: deliveredFilter === 'Pending' ? '#000' : '#475569',
                                                    transition: 'all 0.15s'
                                                },
                                                children: "Pending"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentsView.jsx",
                                                lineNumber: 243,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                className: "filter-pill ".concat(deliveredFilter === 'Completed' ? 'active' : ''),
                                                onClick: ()=>setDeliveredFilter('Completed'),
                                                style: {
                                                    padding: '4px 12px',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '11px',
                                                    background: deliveredFilter === 'Completed' ? '#fff' : 'transparent',
                                                    color: deliveredFilter === 'Completed' ? '#000' : '#475569',
                                                    transition: 'all 0.15s'
                                                },
                                                children: "Completed"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentsView.jsx",
                                                lineNumber: 251,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 242,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "action-btn",
                                        style: {
                                            background: 'transparent',
                                            border: '1px solid var(--color-border)',
                                            padding: '5px 10px',
                                            borderRadius: '6px',
                                            color: 'var(--color-text-primary)',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        },
                                        onClick: fetchDeliveredOrders,
                                        children: "Refresh"
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 260,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 241,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PaymentsView.jsx",
                        lineNumber: 236,
                        columnNumber: 11
                    }, this),
                    (()=>{
                        let filteredDeliveredOrders = [];
                        if (deliveredFilter === 'Pending') {
                            filteredDeliveredOrders = (deliveredOrders || []).filter((order)=>{
                                const st = String(order.status || '').toLowerCase();
                                return !(st.includes('verified') || st.includes('closed'));
                            });
                        } else {
                            filteredDeliveredOrders = (erpState.orders || []).filter((order)=>{
                                const st = String(order.status || '').toLowerCase();
                                return st.includes('verified') || st.includes('closed');
                            }).map((o)=>{
                                var _o_customer;
                                return {
                                    id: o.dbId || o.id,
                                    order_number: o.orderNo,
                                    customer_name: ((_o_customer = o.customer) === null || _o_customer === void 0 ? void 0 : _o_customer.name) || 'Customer',
                                    grand_total: o.totalAmount || 0,
                                    status: o.status,
                                    notes: o.notes || ''
                                };
                            });
                        }
                        return filteredDeliveredOrders.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                padding: '16px',
                                color: 'var(--color-text-secondary)',
                                textAlign: 'center',
                                fontSize: '12.5px',
                                fontStyle: 'italic'
                            },
                            children: "No delivered orders in this category."
                        }, void 0, false, {
                            fileName: "[project]/components/PaymentsView.jsx",
                            lineNumber: 291,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                overflowX: 'auto'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                style: {
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    fontSize: '12.5px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            style: {
                                                borderBottom: '1px solid var(--color-border)'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: '8px 10px',
                                                        textAlign: 'left',
                                                        color: 'var(--color-text-secondary)'
                                                    },
                                                    children: "Order"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentsView.jsx",
                                                    lineNumber: 299,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: '8px 10px',
                                                        textAlign: 'left',
                                                        color: 'var(--color-text-secondary)'
                                                    },
                                                    children: "Customer"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentsView.jsx",
                                                    lineNumber: 300,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: '8px 10px',
                                                        textAlign: 'right',
                                                        color: 'var(--color-text-secondary)'
                                                    },
                                                    children: "Amount"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentsView.jsx",
                                                    lineNumber: 301,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: '8px 10px',
                                                        textAlign: 'left',
                                                        color: 'var(--color-text-secondary)'
                                                    },
                                                    children: "Next Follow-up / Notes"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentsView.jsx",
                                                    lineNumber: 302,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: '8px 10px',
                                                        textAlign: 'center',
                                                        color: 'var(--color-text-secondary)'
                                                    },
                                                    children: "Actions"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentsView.jsx",
                                                    lineNumber: 303,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/PaymentsView.jsx",
                                            lineNumber: 298,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 297,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                        children: filteredDeliveredOrders.map((order)=>{
                                            const followup = parseOrderFollowup ? parseOrderFollowup(order.notes) : {
                                                text: order.notes,
                                                nextDate: null
                                            };
                                            const isCompleted = String(order.status || '').toLowerCase().includes('verified') || String(order.status || '').toLowerCase() === 'closed';
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                style: {
                                                    borderBottom: '1px solid rgba(148, 163, 184, 0.12)'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            padding: '8px 10px',
                                                            fontWeight: 700
                                                        },
                                                        children: order.order_number || "ORD-".concat(order.id)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 312,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            padding: '8px 10px'
                                                        },
                                                        children: order.customer_name || 'Customer'
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 313,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            padding: '8px 10px',
                                                            textAlign: 'right',
                                                            fontWeight: 700
                                                        },
                                                        children: [
                                                            "INR ",
                                                            Number(order.grand_total || order.total_amount || 0).toLocaleString('en-IN')
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 314,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            padding: '8px 10px'
                                                        },
                                                        children: followup.nextDate ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '2px'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontSize: '10px',
                                                                        background: '#fee2e2',
                                                                        color: '#991b1b',
                                                                        border: '1px solid #fca5a5',
                                                                        padding: '1px 6px',
                                                                        borderRadius: '20px',
                                                                        fontWeight: 'bold',
                                                                        display: 'inline-block',
                                                                        width: 'fit-content'
                                                                    },
                                                                    children: [
                                                                        "📅 Next: ",
                                                                        followup.nextDate
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/PaymentsView.jsx",
                                                                    lineNumber: 320,
                                                                    columnNumber: 31
                                                                }, this),
                                                                followup.text && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontSize: '11px',
                                                                        color: 'var(--color-text-secondary)',
                                                                        fontStyle: 'italic'
                                                                    },
                                                                    children: [
                                                                        '"',
                                                                        followup.text,
                                                                        '"'
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/PaymentsView.jsx",
                                                                    lineNumber: 324,
                                                                    columnNumber: 33
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/PaymentsView.jsx",
                                                            lineNumber: 319,
                                                            columnNumber: 29
                                                        }, this) : followup.text ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '11px',
                                                                color: 'var(--color-text-secondary)',
                                                                fontStyle: 'italic'
                                                            },
                                                            children: [
                                                                '"',
                                                                followup.text,
                                                                '"'
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/PaymentsView.jsx",
                                                            lineNumber: 330,
                                                            columnNumber: 29
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '11px',
                                                                color: 'var(--color-text-secondary)',
                                                                opacity: 0.5,
                                                                fontStyle: 'italic'
                                                            },
                                                            children: "No follow-up logged yet"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/PaymentsView.jsx",
                                                            lineNumber: 334,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 317,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            padding: '8px 10px',
                                                            textAlign: 'center'
                                                        },
                                                        children: isCompleted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "badge badge-approved",
                                                            style: {
                                                                fontWeight: 'bold',
                                                                fontSize: '11px'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                    size: 10,
                                                                    style: {
                                                                        marginRight: '3px'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/PaymentsView.jsx",
                                                                    lineNumber: 342,
                                                                    columnNumber: 31
                                                                }, this),
                                                                " Confirmed"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/PaymentsView.jsx",
                                                            lineNumber: 341,
                                                            columnNumber: 29
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                gap: '6px',
                                                                justifyContent: 'center',
                                                                alignItems: 'center'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    className: "action-btn",
                                                                    style: {
                                                                        background: 'var(--color-primary)',
                                                                        border: 'none',
                                                                        padding: '5px 8px',
                                                                        borderRadius: '4px',
                                                                        color: '#000',
                                                                        fontWeight: 'bold',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '3px',
                                                                        fontSize: '11px'
                                                                    },
                                                                    onClick: ()=>handleSalesConfirmPayment && handleSalesConfirmPayment(order),
                                                                    title: "Confirm Payment",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                            size: 11
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/PaymentsView.jsx",
                                                                            lineNumber: 352,
                                                                            columnNumber: 33
                                                                        }, this),
                                                                        " Confirm"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/PaymentsView.jsx",
                                                                    lineNumber: 346,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    className: "action-btn",
                                                                    style: {
                                                                        background: '#eff6ff',
                                                                        border: '1px solid #bfdbfe',
                                                                        padding: '5px 8px',
                                                                        borderRadius: '4px',
                                                                        color: '#1e40af',
                                                                        fontWeight: 'bold',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '3px',
                                                                        fontSize: '11px'
                                                                    },
                                                                    onClick: ()=>handleUpdateFollowup && handleUpdateFollowup(order),
                                                                    title: "Log Follow-up Note & Reminder",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2d$call$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PhoneCall$3e$__["PhoneCall"], {
                                                                            size: 11
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/PaymentsView.jsx",
                                                                            lineNumber: 360,
                                                                            columnNumber: 33
                                                                        }, this),
                                                                        " Follow-up"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/PaymentsView.jsx",
                                                                    lineNumber: 354,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/PaymentsView.jsx",
                                                            lineNumber: 345,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 339,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, order.id, true, {
                                                fileName: "[project]/components/PaymentsView.jsx",
                                                lineNumber: 311,
                                                columnNumber: 23
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 306,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 296,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/PaymentsView.jsx",
                            lineNumber: 295,
                            columnNumber: 13
                        }, this);
                    })()
                ]
            }, void 0, true, {
                fileName: "[project]/components/PaymentsView.jsx",
                lineNumber: 228,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "crm-table-container",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "crm-table responsive-table",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Invoice No"
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 380,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Customer"
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 381,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Outstanding Balance"
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 382,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Follow-up Date"
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 383,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Action Notes"
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 384,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Actions"
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 385,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 379,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/PaymentsView.jsx",
                            lineNumber: 378,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: filteredReminders.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: "6",
                                    style: {
                                        textAlign: 'center',
                                        padding: '30px',
                                        color: 'var(--color-text-muted)'
                                    },
                                    children: paymentReminders.length === 0 ? 'No follow-up reminders scheduled.' : 'No matching reminders found.'
                                }, void 0, false, {
                                    fileName: "[project]/components/PaymentsView.jsx",
                                    lineNumber: 391,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 390,
                                columnNumber: 15
                            }, this) : displayedReminders.map((r)=>{
                                const p = payments.find((pay)=>pay.id === r.invoiceId);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Invoice No",
                                            style: {
                                                fontWeight: '700'
                                            },
                                            children: [
                                                "#",
                                                r.invoiceNo
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/PaymentsView.jsx",
                                            lineNumber: 400,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Customer",
                                            style: {
                                                fontWeight: '600'
                                            },
                                            children: r.customerName
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentsView.jsx",
                                            lineNumber: 401,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Outstanding Balance",
                                            style: {
                                                fontWeight: '700'
                                            },
                                            children: formatINR(r.amount)
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentsView.jsx",
                                            lineNumber: 402,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Follow-up Date",
                                            style: {
                                                fontWeight: '700',
                                                color: r.date <= todayStr ? '#dc2626' : 'inherit'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: r.date
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 405,
                                                        columnNumber: 25
                                                    }, this),
                                                    r.date <= todayStr && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "badge badge-overdue",
                                                        style: {
                                                            fontSize: '9px',
                                                            padding: '2px 5px',
                                                            textTransform: 'uppercase'
                                                        },
                                                        children: "Overdue"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 407,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/PaymentsView.jsx",
                                                lineNumber: 404,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentsView.jsx",
                                            lineNumber: 403,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Action Notes",
                                            children: r.notes
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentsView.jsx",
                                            lineNumber: 413,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Actions",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "action-btn-group",
                                                style: {
                                                    flexWrap: 'nowrap'
                                                },
                                                children: [
                                                    p && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "btn-small btn-outline-small",
                                                        onClick: ()=>setSelectedInvoice(p),
                                                        title: "View Invoice",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                            size: 12
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/PaymentsView.jsx",
                                                            lineNumber: 422,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 417,
                                                        columnNumber: 27
                                                    }, this),
                                                    p && p.status !== 'Paid' && p.verified !== 'Pending' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "btn-small btn-primary-small",
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            background: 'var(--color-accent-green)',
                                                            color: '#fff',
                                                            boxShadow: 'none'
                                                        },
                                                        onClick: ()=>handleReceivePaymentClick(p),
                                                        title: "Mark Received",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                                size: 11
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                lineNumber: 432,
                                                                columnNumber: 29
                                                            }, this),
                                                            " Mark Received"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 426,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "btn-small btn-primary-small",
                                                        style: {
                                                            background: 'var(--color-accent-purple)',
                                                            color: '#fff',
                                                            boxShadow: 'none'
                                                        },
                                                        onClick: ()=>{
                                                            dispatch({
                                                                type: 'DELETE_PAYMENT_REMINDER',
                                                                payload: r.id
                                                            });
                                                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                                                                icon: 'success',
                                                                title: 'Follow-up Dismissed',
                                                                text: 'Reminder has been dismissed successfully.',
                                                                timer: 1500,
                                                                showConfirmButton: false
                                                            });
                                                        },
                                                        children: "Dismiss"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 435,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/PaymentsView.jsx",
                                                lineNumber: 415,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentsView.jsx",
                                            lineNumber: 414,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, r.id, true, {
                                    fileName: "[project]/components/PaymentsView.jsx",
                                    lineNumber: 399,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/components/PaymentsView.jsx",
                            lineNumber: 388,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/PaymentsView.jsx",
                    lineNumber: 377,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/PaymentsView.jsx",
                lineNumber: 376,
                columnNumber: 7
            }, this),
            totalPages > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '20px',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '16px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: '13px',
                            color: 'var(--color-text-secondary)'
                        },
                        children: [
                            "Showing page ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: currentPage
                            }, void 0, false, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 465,
                                columnNumber: 28
                            }, this),
                            " of ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: totalPages
                            }, void 0, false, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 465,
                                columnNumber: 62
                            }, this),
                            " (",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: totalItemsCount
                            }, void 0, false, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 465,
                                columnNumber: 93
                            }, this),
                            " total entries)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PaymentsView.jsx",
                        lineNumber: 464,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '8px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                disabled: currentPage === 1,
                                onClick: ()=>setCurrentPage((p)=>Math.max(1, p - 1)),
                                className: "btn-small btn-outline-small",
                                style: {
                                    margin: 0,
                                    padding: '6px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    opacity: currentPage === 1 ? 0.5 : 1,
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 474,
                                        columnNumber: 17
                                    }, this),
                                    " Previous"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 468,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                disabled: currentPage === totalPages,
                                onClick: ()=>setCurrentPage((p)=>Math.min(totalPages, p + 1)),
                                className: "btn-small btn-outline-small",
                                style: {
                                    margin: 0,
                                    padding: '6px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    opacity: currentPage === totalPages ? 0.5 : 1,
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                                },
                                children: [
                                    "Next ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 482,
                                        columnNumber: 22
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 476,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PaymentsView.jsx",
                        lineNumber: 467,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PaymentsView.jsx",
                lineNumber: 463,
                columnNumber: 11
            }, this),
            selectedInvoice && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "modal-overlay active",
                onClick: ()=>setSelectedInvoice(null),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "modal-box",
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "modal-header-row",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "modal-title-text",
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                "Invoice #",
                                                selectedInvoice.invoiceNo
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/PaymentsView.jsx",
                                            lineNumber: 494,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: getStatusBadge(selectedInvoice.status),
                                            children: selectedInvoice.status
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentsView.jsx",
                                            lineNumber: 495,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/PaymentsView.jsx",
                                    lineNumber: 493,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "modal-close-btn",
                                    onClick: ()=>setSelectedInvoice(null),
                                    children: "✕"
                                }, void 0, false, {
                                    fileName: "[project]/components/PaymentsView.jsx",
                                    lineNumber: 499,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/PaymentsView.jsx",
                            lineNumber: 492,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "details-grid",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "details-row",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "details-label",
                                            children: "Client Name"
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentsView.jsx",
                                            lineNumber: 504,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "details-value",
                                            children: selectedInvoice.customerName
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentsView.jsx",
                                            lineNumber: 505,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/PaymentsView.jsx",
                                    lineNumber: 503,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "details-row",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "details-label",
                                            children: "Due Date"
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentsView.jsx",
                                            lineNumber: 508,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "details-value",
                                            children: selectedInvoice.dueDate
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentsView.jsx",
                                            lineNumber: 509,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/PaymentsView.jsx",
                                    lineNumber: 507,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "details-row",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "details-label",
                                            children: "Invoice Total"
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentsView.jsx",
                                            lineNumber: 512,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "details-value",
                                            children: formatINR(selectedInvoice.totalAmount)
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentsView.jsx",
                                            lineNumber: 513,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/PaymentsView.jsx",
                                    lineNumber: 511,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "details-row",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "details-label",
                                            children: "Amount Cleared"
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentsView.jsx",
                                            lineNumber: 516,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "details-value",
                                            style: {
                                                color: '#16a34a'
                                            },
                                            children: formatINR(selectedInvoice.paidAmount)
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentsView.jsx",
                                            lineNumber: 517,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/PaymentsView.jsx",
                                    lineNumber: 515,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "details-row details-full",
                                    style: {
                                        borderTop: '1px solid #eaeaea',
                                        paddingTop: '12px',
                                        marginTop: '4px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "details-label",
                                            children: "Net Outstanding Balance"
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentsView.jsx",
                                            lineNumber: 520,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "details-value",
                                            style: {
                                                fontSize: '18px',
                                                color: '#b91c1c',
                                                fontWeight: '800'
                                            },
                                            children: formatINR(selectedInvoice.totalAmount - selectedInvoice.paidAmount)
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentsView.jsx",
                                            lineNumber: 521,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/PaymentsView.jsx",
                                    lineNumber: 519,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/PaymentsView.jsx",
                            lineNumber: 502,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "form-actions",
                            style: {
                                marginTop: '24px'
                            },
                            children: [
                                selectedInvoice.status !== 'Paid' && selectedInvoice.verified !== 'Pending' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "btn-small btn-primary-small",
                                    style: {
                                        background: 'var(--color-accent-green)',
                                        color: '#fff'
                                    },
                                    onClick: ()=>handleReceivePaymentClick(selectedInvoice, true),
                                    children: "Clear Balance Received"
                                }, void 0, false, {
                                    fileName: "[project]/components/PaymentsView.jsx",
                                    lineNumber: 529,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "btn-small btn-outline-small",
                                    onClick: ()=>setSelectedInvoice(null),
                                    children: "Close"
                                }, void 0, false, {
                                    fileName: "[project]/components/PaymentsView.jsx",
                                    lineNumber: 537,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/PaymentsView.jsx",
                            lineNumber: 527,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/PaymentsView.jsx",
                    lineNumber: 491,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/PaymentsView.jsx",
                lineNumber: 490,
                columnNumber: 9
            }, this),
            reminderInvoice && (()=>{
                const in2DaysStr = (()=>{
                    const d = new Date();
                    d.setDate(d.getDate() + 2);
                    return d.toISOString().split('T')[0];
                })();
                const in1WeekStr = (()=>{
                    const d = new Date();
                    d.setDate(d.getDate() + 7);
                    return d.toISOString().split('T')[0];
                })();
                const isToday = reminderDate === todayStr;
                const isIn2Days = reminderDate === in2DaysStr;
                const isIn1Week = reminderDate === in1WeekStr;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "modal-overlay active",
                    onClick: ()=>setReminderInvoice(null),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "modal-box",
                        onClick: (e)=>e.stopPropagation(),
                        style: {
                            width: '700px',
                            maxWidth: 'calc(100vw - 32px)',
                            padding: '28px',
                            borderRadius: '20px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "modal-header-row",
                                style: {
                                    marginBottom: '20px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "modal-title-text",
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            fontSize: '18px',
                                            fontWeight: '800'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    background: 'rgba(220, 242, 107, 0.15)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'var(--color-accent-teal)'
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
                                                    size: 18
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentsView.jsx",
                                                    lineNumber: 584,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentsView.jsx",
                                                lineNumber: 574,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Create Follow-up Reminder"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentsView.jsx",
                                                lineNumber: 586,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 573,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "modal-close-btn",
                                        onClick: ()=>setReminderInvoice(null),
                                        style: {
                                            background: 'transparent',
                                            border: 'none',
                                            fontSize: '16px',
                                            cursor: 'pointer',
                                            color: 'var(--color-text-secondary)',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'var(--transition-fast)'
                                        },
                                        onMouseEnter: (e)=>e.currentTarget.style.background = '#f1f5f9',
                                        onMouseLeave: (e)=>e.currentTarget.style.background = 'transparent',
                                        children: "✕"
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 588,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 572,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: '24px',
                                    flexDirection: 'row'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '16px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    background: 'linear-gradient(135deg, #F5FAFE 0%, #f1f5f9 100%)',
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    borderLeft: '4px solid var(--color-orange-dot)',
                                                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            fontSize: '10px',
                                                            color: 'var(--color-text-secondary)',
                                                            fontWeight: '800',
                                                            letterSpacing: '0.05em'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                                size: 10,
                                                                style: {
                                                                    color: 'var(--color-orange-dot)'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                lineNumber: 624,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "INVOICE REFERENCE"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                lineNumber: 625,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 623,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontWeight: '800',
                                                            fontSize: '15px',
                                                            color: 'var(--color-text-primary)',
                                                            marginTop: '4px'
                                                        },
                                                        children: [
                                                            "#",
                                                            reminderInvoice.invoiceNo
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 627,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '13px',
                                                            color: 'var(--color-text-secondary)',
                                                            fontWeight: '500',
                                                            marginTop: '2px'
                                                        },
                                                        children: reminderInvoice.customerName
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 630,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'baseline',
                                                            marginTop: '10px',
                                                            borderTop: '1px dashed rgba(0,0,0,0.08)',
                                                            paddingTop: '8px'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '11px',
                                                                    color: 'var(--color-text-secondary)',
                                                                    fontWeight: '600'
                                                                },
                                                                children: "Balance Outstanding"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                lineNumber: 634,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '16px',
                                                                    color: '#e11d48',
                                                                    fontWeight: '800'
                                                                },
                                                                children: formatINR(reminderInvoice.totalAmount - reminderInvoice.paidAmount)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                lineNumber: 635,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 633,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/PaymentsView.jsx",
                                                lineNumber: 616,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "form-group",
                                                style: {
                                                    marginBottom: 0,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '6px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "form-label",
                                                        style: {
                                                            fontSize: '11px',
                                                            fontWeight: '800',
                                                            letterSpacing: '0.05em',
                                                            color: 'var(--color-text-secondary)',
                                                            textTransform: 'uppercase'
                                                        },
                                                        children: "Follow-up Date"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 642,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "date",
                                                        className: "form-input",
                                                        value: reminderDate,
                                                        onChange: (e)=>setReminderDate(e.target.value),
                                                        required: true,
                                                        style: {
                                                            padding: '10px 12px',
                                                            borderRadius: '8px',
                                                            border: '1px solid var(--color-border)',
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                            width: '100%',
                                                            transition: 'var(--transition-fast)'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 643,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            gap: '6px',
                                                            marginTop: '2px'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                className: "btn-small",
                                                                style: {
                                                                    padding: '6px 12px',
                                                                    fontSize: '11px',
                                                                    borderRadius: '20px',
                                                                    border: '1px solid',
                                                                    background: isToday ? 'var(--color-text-primary)' : 'transparent',
                                                                    color: isToday ? '#fff' : 'var(--color-text-secondary)',
                                                                    borderColor: isToday ? 'var(--color-text-primary)' : 'var(--color-border)',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer',
                                                                    transition: 'var(--transition-fast)'
                                                                },
                                                                onClick: ()=>setReminderDate(todayStr),
                                                                children: "Today"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                lineNumber: 660,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                className: "btn-small",
                                                                style: {
                                                                    padding: '6px 12px',
                                                                    fontSize: '11px',
                                                                    borderRadius: '20px',
                                                                    border: '1px solid',
                                                                    background: isIn2Days ? 'var(--color-text-primary)' : 'transparent',
                                                                    color: isIn2Days ? '#fff' : 'var(--color-text-secondary)',
                                                                    borderColor: isIn2Days ? 'var(--color-text-primary)' : 'var(--color-border)',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer',
                                                                    transition: 'var(--transition-fast)'
                                                                },
                                                                onClick: ()=>setReminderDate(in2DaysStr),
                                                                children: "In 2 Days"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                lineNumber: 679,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                className: "btn-small",
                                                                style: {
                                                                    padding: '6px 12px',
                                                                    fontSize: '11px',
                                                                    borderRadius: '20px',
                                                                    border: '1px solid',
                                                                    background: isIn1Week ? 'var(--color-text-primary)' : 'transparent',
                                                                    color: isIn1Week ? '#fff' : 'var(--color-text-secondary)',
                                                                    borderColor: isIn1Week ? 'var(--color-text-primary)' : 'var(--color-border)',
                                                                    fontWeight: '600',
                                                                    cursor: 'pointer',
                                                                    transition: 'var(--transition-fast)'
                                                                },
                                                                onClick: ()=>setReminderDate(in1WeekStr),
                                                                children: "In 1 Week"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                lineNumber: 698,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 659,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/PaymentsView.jsx",
                                                lineNumber: 641,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "form-group",
                                                style: {
                                                    marginBottom: 0,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '6px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "form-label",
                                                        style: {
                                                            fontSize: '11px',
                                                            fontWeight: '800',
                                                            letterSpacing: '0.05em',
                                                            color: 'var(--color-text-secondary)',
                                                            textTransform: 'uppercase'
                                                        },
                                                        children: "Action Notes"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 721,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                        className: "form-textarea",
                                                        placeholder: "e.g. Call client finance office, double check transfer ref...",
                                                        value: reminderNotes,
                                                        onChange: (e)=>setReminderNotes(e.target.value),
                                                        style: {
                                                            minHeight: '70px',
                                                            fontSize: '13px',
                                                            padding: '10px 12px',
                                                            borderRadius: '8px',
                                                            border: '1px solid var(--color-border)',
                                                            width: '100%',
                                                            resize: 'vertical',
                                                            transition: 'var(--transition-fast)'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 722,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/PaymentsView.jsx",
                                                lineNumber: 720,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn-small",
                                                style: {
                                                    width: '100%',
                                                    padding: '12px',
                                                    marginTop: '4px',
                                                    background: 'linear-gradient(135deg, #2F4375 0%, #3BAEEB 100%)',
                                                    color: '#ffffff',
                                                    fontWeight: '800',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 4px 12px rgba(220, 242, 107, 0.25)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    fontSize: '13px',
                                                    transition: 'var(--transition-smooth)'
                                                },
                                                onClick: ()=>{
                                                    if (!reminderDate) return;
                                                    dispatch({
                                                        type: 'ADD_PAYMENT_REMINDER',
                                                        payload: {
                                                            id: Date.now() + Math.random(),
                                                            invoiceId: reminderInvoice.id,
                                                            invoiceNo: reminderInvoice.invoiceNo,
                                                            customerName: reminderInvoice.customerName,
                                                            amount: reminderInvoice.totalAmount - reminderInvoice.paidAmount,
                                                            date: reminderDate,
                                                            notes: reminderNotes || 'Payment follow-up'
                                                        }
                                                    });
                                                    setReminderNotes('');
                                                    setReminderInvoice(null);
                                                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                                                        icon: 'success',
                                                        title: 'Reminder Saved',
                                                        text: 'Self reminder has been scheduled successfully.',
                                                        timer: 1500,
                                                        showConfirmButton: false
                                                    });
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                        size: 14
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 785,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Create Self Reminder"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 786,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/PaymentsView.jsx",
                                                lineNumber: 740,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 615,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            flex: 1.3,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '20px',
                                            borderLeft: '1px solid var(--color-border)',
                                            paddingLeft: '20px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                        style: {
                                                            fontSize: '11px',
                                                            fontWeight: '800',
                                                            color: '#e11d48',
                                                            textTransform: 'uppercase',
                                                            marginBottom: '10px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            letterSpacing: '0.05em'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                                        size: 12
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                                        lineNumber: 805,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "Today's Follow-ups"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                                        lineNumber: 806,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                lineNumber: 804,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '9px',
                                                                    padding: '2px 6px',
                                                                    background: '#ffe4e6',
                                                                    color: '#be123c',
                                                                    border: '1px solid #fecdd3',
                                                                    borderRadius: '4px',
                                                                    fontWeight: '800'
                                                                },
                                                                children: todaysReminders.length
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                lineNumber: 808,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 793,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '10px',
                                                            maxHeight: '150px',
                                                            overflowY: 'auto',
                                                            paddingRight: '4px'
                                                        },
                                                        children: todaysReminders.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                border: '1px dashed #DCE5F0',
                                                                borderRadius: '10px',
                                                                padding: '16px',
                                                                textAlign: 'center',
                                                                color: 'var(--color-text-muted)',
                                                                fontSize: '11.5px',
                                                                background: '#fafbfc'
                                                            },
                                                            children: "No follow-ups due today."
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/PaymentsView.jsx",
                                                            lineNumber: 814,
                                                            columnNumber: 25
                                                        }, this) : todaysReminders.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    background: '#fff',
                                                                    border: '1px solid #fee2e2',
                                                                    borderLeft: '4px solid #ef4444',
                                                                    borderRadius: '10px',
                                                                    padding: '10px 12px',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'start',
                                                                    gap: '12px',
                                                                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.03)'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            gap: '3px',
                                                                            flex: 1
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                style: {
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '6px'
                                                                                },
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        style: {
                                                                                            fontWeight: '800',
                                                                                            fontSize: '12px',
                                                                                            color: '#1e293b'
                                                                                        },
                                                                                        children: [
                                                                                            "#",
                                                                                            r.invoiceNo
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                                                        lineNumber: 844,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        style: {
                                                                                            fontSize: '11px',
                                                                                            color: 'var(--color-text-secondary)',
                                                                                            fontWeight: '600'
                                                                                        },
                                                                                        children: r.customerName
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                                                        lineNumber: 847,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                                lineNumber: 843,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                style: {
                                                                                    fontSize: '11px',
                                                                                    color: '#475569',
                                                                                    fontWeight: '500',
                                                                                    lineHeight: '1.4'
                                                                                },
                                                                                children: r.notes
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                                lineNumber: 851,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                style: {
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '6px',
                                                                                    marginTop: '2px'
                                                                                },
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "badge badge-overdue",
                                                                                        style: {
                                                                                            fontSize: '9px',
                                                                                            padding: '1px 4px',
                                                                                            textTransform: 'uppercase',
                                                                                            background: '#ef4444',
                                                                                            color: '#fff',
                                                                                            borderRadius: '3px'
                                                                                        },
                                                                                        children: "Today"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                                                        lineNumber: 855,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        style: {
                                                                                            fontSize: '10px',
                                                                                            color: '#be123c',
                                                                                            fontWeight: '700'
                                                                                        },
                                                                                        children: formatINR(r.amount)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                                                        lineNumber: 858,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                                lineNumber: 854,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                                        lineNumber: 842,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        style: {
                                                                            background: '#fee2e2',
                                                                            border: 'none',
                                                                            color: '#991b1b',
                                                                            cursor: 'pointer',
                                                                            borderRadius: '50%',
                                                                            width: '22px',
                                                                            height: '22px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            transition: 'var(--transition-fast)'
                                                                        },
                                                                        onClick: ()=>dispatch({
                                                                                type: 'DELETE_PAYMENT_REMINDER',
                                                                                payload: r.id
                                                                            }),
                                                                        title: "Complete & Delete",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                            size: 10
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/PaymentsView.jsx",
                                                                            lineNumber: 881,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                                        lineNumber: 863,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, r.id, true, {
                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                lineNumber: 827,
                                                                columnNumber: 27
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 812,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/PaymentsView.jsx",
                                                lineNumber: 792,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                        style: {
                                                            fontSize: '11px',
                                                            fontWeight: '800',
                                                            color: 'var(--color-text-secondary)',
                                                            textTransform: 'uppercase',
                                                            marginBottom: '10px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            letterSpacing: '0.05em'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                                        size: 12,
                                                                        style: {
                                                                            color: 'var(--color-text-secondary)'
                                                                        }
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                                        lineNumber: 902,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "Upcoming (Future)"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                                        lineNumber: 903,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                lineNumber: 901,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '9px',
                                                                    padding: '2px 6px',
                                                                    background: '#f1f5f9',
                                                                    color: '#475569',
                                                                    border: '1px solid #D6E2F0',
                                                                    borderRadius: '4px',
                                                                    fontWeight: '800'
                                                                },
                                                                children: upcomingReminders.length
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                lineNumber: 905,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 890,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '10px',
                                                            maxHeight: '150px',
                                                            overflowY: 'auto',
                                                            paddingRight: '4px'
                                                        },
                                                        children: upcomingReminders.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                border: '1px dashed #DCE5F0',
                                                                borderRadius: '10px',
                                                                padding: '16px',
                                                                textAlign: 'center',
                                                                color: 'var(--color-text-muted)',
                                                                fontSize: '11.5px',
                                                                background: '#fafbfc'
                                                            },
                                                            children: "No upcoming follow-ups."
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/PaymentsView.jsx",
                                                            lineNumber: 911,
                                                            columnNumber: 25
                                                        }, this) : upcomingReminders.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    background: '#fff',
                                                                    border: '1px solid #DCE5F0',
                                                                    borderLeft: '4px solid var(--color-accent-teal)',
                                                                    borderRadius: '10px',
                                                                    padding: '10px 12px',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'start',
                                                                    gap: '12px',
                                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            gap: '3px',
                                                                            flex: 1
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                style: {
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '6px'
                                                                                },
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        style: {
                                                                                            fontWeight: '800',
                                                                                            fontSize: '12px',
                                                                                            color: '#1e293b'
                                                                                        },
                                                                                        children: [
                                                                                            "#",
                                                                                            r.invoiceNo
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                                                        lineNumber: 941,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        style: {
                                                                                            fontSize: '11px',
                                                                                            color: 'var(--color-text-secondary)',
                                                                                            fontWeight: '600'
                                                                                        },
                                                                                        children: r.customerName
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                                                        lineNumber: 944,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                                lineNumber: 940,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                style: {
                                                                                    fontSize: '11px',
                                                                                    color: '#475569',
                                                                                    fontWeight: '500',
                                                                                    lineHeight: '1.4'
                                                                                },
                                                                                children: r.notes
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                                lineNumber: 948,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                style: {
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '6px',
                                                                                    marginTop: '2px'
                                                                                },
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        style: {
                                                                                            fontSize: '9px',
                                                                                            padding: '2px 6px',
                                                                                            background: '#e0f2fe',
                                                                                            color: '#0369a1',
                                                                                            border: '1px solid #bae6fd',
                                                                                            borderRadius: '4px',
                                                                                            fontWeight: '800'
                                                                                        },
                                                                                        children: r.date
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                                                        lineNumber: 952,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        style: {
                                                                                            fontSize: '10px',
                                                                                            color: 'var(--color-text-secondary)',
                                                                                            fontWeight: '700'
                                                                                        },
                                                                                        children: formatINR(r.amount)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                                                        lineNumber: 955,
                                                                                        columnNumber: 33
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                                lineNumber: 951,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                                        lineNumber: 939,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        style: {
                                                                            background: '#f1f5f9',
                                                                            border: 'none',
                                                                            color: '#5E6B82',
                                                                            cursor: 'pointer',
                                                                            borderRadius: '50%',
                                                                            width: '22px',
                                                                            height: '22px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            transition: 'var(--transition-fast)'
                                                                        },
                                                                        onClick: ()=>dispatch({
                                                                                type: 'DELETE_PAYMENT_REMINDER',
                                                                                payload: r.id
                                                                            }),
                                                                        title: "Complete & Delete",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                            size: 10
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/PaymentsView.jsx",
                                                                            lineNumber: 978,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                                        lineNumber: 960,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, r.id, true, {
                                                                fileName: "[project]/components/PaymentsView.jsx",
                                                                lineNumber: 924,
                                                                columnNumber: 27
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/PaymentsView.jsx",
                                                        lineNumber: 909,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/PaymentsView.jsx",
                                                lineNumber: 889,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/PaymentsView.jsx",
                                        lineNumber: 791,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 612,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "form-actions",
                                style: {
                                    marginTop: '24px',
                                    borderTop: '1px solid var(--color-border)',
                                    paddingTop: '16px',
                                    display: 'flex',
                                    justifyContent: 'flex-end'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "btn-small btn-outline-small",
                                    onClick: ()=>setReminderInvoice(null),
                                    style: {
                                        minWidth: '100px',
                                        justifyContent: 'center'
                                    },
                                    children: "Close Planner"
                                }, void 0, false, {
                                    fileName: "[project]/components/PaymentsView.jsx",
                                    lineNumber: 991,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/PaymentsView.jsx",
                                lineNumber: 990,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PaymentsView.jsx",
                        lineNumber: 567,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/PaymentsView.jsx",
                    lineNumber: 566,
                    columnNumber: 11
                }, this);
            })()
        ]
    }, void 0, true, {
        fileName: "[project]/components/PaymentsView.jsx",
        lineNumber: 168,
        columnNumber: 5
    }, this);
}
_s(PaymentsView, "JfKWE8/Em/6/jMcsTl+o5Qpwtw0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useERP"]
    ];
});
_c = PaymentsView;
var _c;
__turbopack_context__.k.register(_c, "PaymentsView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_PaymentsView_jsx_4b145c88._.js.map