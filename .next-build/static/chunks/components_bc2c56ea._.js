(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/DailyAgendaCalendar.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DailyAgendaCalendar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/shared/context/ERPContext.jsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.mjs [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.mjs [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.mjs [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.mjs [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-cart.mjs [app-client] (ecmascript) <export default as ShoppingCart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/credit-card.mjs [app-client] (ecmascript) <export default as CreditCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$test$2d$tube$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TestTube$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/test-tube.mjs [app-client] (ecmascript) <export default as TestTube>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package.mjs [app-client] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/truck.mjs [app-client] (ecmascript) <export default as Truck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2d$call$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PhoneCall$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/phone-call.mjs [app-client] (ecmascript) <export default as PhoneCall>");
;
var _s = __turbopack_context__.k.signature();
;
;
;
/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */ function padTwo(n) {
    return String(n).padStart(2, '0');
}
function toDateStr(y, m, d) {
    return "".concat(y, "-").concat(padTwo(m + 1), "-").concat(padTwo(d));
}
const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];
const DAY_LABELS = [
    'Su',
    'Mo',
    'Tu',
    'We',
    'Th',
    'Fr',
    'Sa'
];
const EVENT_TYPES = {
    lead_followup: {
        label: 'Lead Follow-up',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2d$call$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PhoneCall$3e$__["PhoneCall"],
        color: '#f59e0b',
        bg: '#fef3c7'
    },
    lead_created: {
        label: 'New Lead Registered',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
        color: '#10b981',
        bg: '#d1fae5'
    },
    sample: {
        label: 'Sample',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$test$2d$tube$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TestTube$3e$__["TestTube"],
        color: '#0ea5e9',
        bg: '#e0f2fe'
    },
    quotation: {
        label: 'Quotation Follow-up',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
        color: '#8b5cf6',
        bg: '#ede9fe'
    },
    quot_expire: {
        label: 'Quotation Expiry',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
        color: '#ec4899',
        bg: '#fdf2f8'
    },
    order: {
        label: 'Order',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"],
        color: '#6366f1',
        bg: '#eef2ff'
    },
    delivery: {
        label: 'Delivery Due',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"],
        color: '#d97706',
        bg: '#fef9c3'
    },
    payment: {
        label: 'Payment Due',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"],
        color: '#f43f5e',
        bg: '#ffe4e6'
    },
    dispatch: {
        label: 'Dispatch',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"],
        color: '#0891b2',
        bg: '#ecfeff'
    }
};
/* ─────────────────────────────────────────
   Derive ALL agenda events from ERP state
───────────────────────────────────────── */ function deriveEvents(state) {
    var _state_sales;
    const events = {}; // { 'YYYY-MM-DD': [event, ...] }
    const addEvent = (dateStr, event)=>{
        if (!dateStr || typeof dateStr !== 'string') return;
        const trimmed = dateStr.trim();
        if (!trimmed.match(/^\d{4}-\d{2}-\d{2}$/)) return; // only valid YYYY-MM-DD
        if (!events[trimmed]) events[trimmed] = [];
        events[trimmed].push(event);
    };
    /* ── LEADS ── */ (((_state_sales = state.sales) === null || _state_sales === void 0 ? void 0 : _state_sales.leads) || []).forEach((lead)=>{
        // Every follow-up date set for a lead
        if (lead.followUpDate) {
            addEvent(lead.followUpDate, {
                type: 'lead_followup',
                title: "Follow-up: ".concat(lead.companyName),
                subtitle: "".concat(lead.contactPerson, " · ").concat(lead.salesperson || '—'),
                status: lead.status,
                id: "lead-fu-".concat(lead.id)
            });
        }
        // Each follow-up entry in the lead timeline that has a date
        (Array.isArray(lead.timeline) ? lead.timeline : []).forEach((entry, idx)=>{
            if (idx === 0 && entry.date) {
                // First timeline entry = lead created date
                addEvent(entry.date, {
                    type: 'lead_created',
                    title: "New Lead Registered",
                    subtitle: "".concat(lead.companyName, " (").concat(lead.contactPerson, ")"),
                    status: lead.status,
                    id: "lead-created-".concat(lead.id)
                });
            } else if (entry.date && entry.stage && String(entry.stage).toLowerCase().includes('follow')) {
                // Logged follow-up activities in the timeline
                addEvent(entry.date, {
                    type: 'lead_followup',
                    title: "Follow-up Logged: ".concat(lead.companyName),
                    subtitle: entry.text || entry.stage,
                    status: lead.status,
                    id: "lead-tl-".concat(lead.id, "-").concat(idx)
                });
            }
        });
    });
    /* ── SAMPLES ── */ (state.samples || []).forEach((s)=>{
        if (s.followUpDate) {
            addEvent(s.followUpDate, {
                type: 'sample',
                title: "Sample Follow-up: ".concat(s.leadName),
                subtitle: "".concat(s.product, " · Status: ").concat(s.status),
                id: "sample-fu-".concat(s.id)
            });
        }
        if (s.dispatchDate) {
            addEvent(s.dispatchDate, {
                type: 'sample',
                title: "Sample Dispatched: ".concat(s.leadName),
                subtitle: "".concat(s.product, " · Status: ").concat(s.status),
                id: "sample-disp-".concat(s.id)
            });
        }
        if (s.expiryDate) {
            addEvent(s.expiryDate, {
                type: 'quot_expire',
                title: "Sample Expiry: ".concat(s.leadName),
                subtitle: "".concat(s.product, " · Status: ").concat(s.status),
                id: "sample-exp-".concat(s.id)
            });
        }
        if (s.deliveredDate) {
            addEvent(s.deliveredDate, {
                type: 'dispatch',
                title: "Sample Delivered: ".concat(s.leadName),
                subtitle: "".concat(s.product, " · POD confirmed"),
                id: "sample-del-".concat(s.id)
            });
        }
    });
    /* ── QUOTATIONS ── */ (state.quotations || []).forEach((q)=>{
        // Quotation creation date
        if (q.date) {
            addEvent(q.date, {
                type: 'quotation',
                title: "Quotation #QTN-".concat(q.id, " Drafted"),
                subtitle: "".concat(q.customerName, " · ").concat(q.items, " · ₹").concat((q.totalAmount || 0).toLocaleString('en-IN')),
                status: q.status,
                id: "quote-date-".concat(q.id)
            });
        }
        // Follow-up date
        if (q.followUpDate) {
            addEvent(q.followUpDate, {
                type: 'quotation',
                title: "Quotation Follow-up: ".concat(q.customerName),
                subtitle: "".concat(q.items, " · ₹").concat((q.totalAmount || 0).toLocaleString('en-IN'), " · ").concat(q.status),
                status: q.status,
                id: "quote-fu-".concat(q.id)
            });
        }
        // Valid-till / expiry
        if (q.validTill) {
            addEvent(q.validTill, {
                type: 'quot_expire',
                title: "Quotation Expires: ".concat(q.customerName),
                subtitle: "".concat(q.items, " · Status: ").concat(q.status),
                id: "quote-exp-".concat(q.id)
            });
        }
    });
    /* ── ORDERS ── */ (state.orders || []).forEach((order)=>{
        if (order.date) {
            var _order_customer;
            addEvent(order.date, {
                type: 'order',
                title: "Order Created: ".concat(((_order_customer = order.customer) === null || _order_customer === void 0 ? void 0 : _order_customer.name) || order.customerName),
                subtitle: "".concat(order.products, " · ").concat(order.orderNo),
                status: order.status,
                id: "order-".concat(order.orderNo)
            });
        }
        if (order.deliveryDate) {
            var _order_customer1;
            addEvent(order.deliveryDate, {
                type: 'delivery',
                title: "Delivery Due: ".concat(((_order_customer1 = order.customer) === null || _order_customer1 === void 0 ? void 0 : _order_customer1.name) || order.customerName),
                subtitle: "".concat(order.products, " · ").concat(order.orderNo),
                status: order.status,
                id: "delivery-".concat(order.orderNo)
            });
        }
        // Also pull any follow-up dates from order timeline stages
        (order.timeline || []).forEach((entry, idx)=>{
            if (entry.followUpDate) {
                var _order_customer;
                addEvent(entry.followUpDate, {
                    type: 'order',
                    title: "Order Follow-up: ".concat((_order_customer = order.customer) === null || _order_customer === void 0 ? void 0 : _order_customer.name),
                    subtitle: "".concat(order.orderNo, " · ").concat(entry.stage),
                    id: "order-tl-fu-".concat(order.orderNo, "-").concat(idx)
                });
            }
        });
    });
    /* ── PAYMENTS ── */ (state.payments || []).forEach((p)=>{
        if (p.dueDate && p.status !== 'Paid') {
            addEvent(p.dueDate, {
                type: 'payment',
                title: "Payment Due: ".concat(p.customerName),
                subtitle: "".concat(p.invoiceNo, " · ₹").concat((p.totalAmount || 0).toLocaleString('en-IN')),
                status: p.status,
                id: "payment-".concat(p.id)
            });
        }
    });
    /* ── DISPATCHES ── */ (state.dispatches || []).forEach((d)=>{
        if (d.date) {
            addEvent(d.date, {
                type: 'dispatch',
                title: "Dispatched: ".concat(d.customerName),
                subtitle: "".concat(d.vehicleNo, " · ").concat(d.quantity, " units · ").concat(d.status),
                id: "dispatch-".concat(d.id)
            });
        }
    });
    return events;
}
/* ─────────────────────────────────────────
   EventChip
───────────────────────────────────────── */ function EventChip(param) {
    let { event } = param;
    const cfg = EVENT_TYPES[event.type] || EVENT_TYPES.order;
    const Icon = cfg.icon;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '10px 14px',
            background: cfg.bg,
            border: "1px solid ".concat(cfg.color, "28"),
            borderLeft: "3px solid ".concat(cfg.color),
            borderRadius: '10px',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            cursor: 'default'
        },
        onMouseEnter: (e)=>{
            e.currentTarget.style.transform = 'translateX(4px)';
            e.currentTarget.style.boxShadow = "0 4px 16px ".concat(cfg.color, "22");
        },
        onMouseLeave: (e)=>{
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = 'none';
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    flexShrink: 0,
                    background: "".concat(cfg.color, "18"),
                    border: "1px solid ".concat(cfg.color, "35"),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                    size: 14,
                    color: cfg.color,
                    strokeWidth: 2.3
                }, void 0, false, {
                    fileName: "[project]/components/DailyAgendaCalendar.jsx",
                    lineNumber: 246,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/DailyAgendaCalendar.jsx",
                lineNumber: 241,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    minWidth: 0,
                    flex: 1
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: '12.5px',
                            fontWeight: '700',
                            color: '#1e293b',
                            lineHeight: 1.35,
                            wordBreak: 'break-word'
                        },
                        children: event.title
                    }, void 0, false, {
                        fileName: "[project]/components/DailyAgendaCalendar.jsx",
                        lineNumber: 249,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: '11px',
                            color: '#5E6B82',
                            marginTop: '2px',
                            fontWeight: '500',
                            wordBreak: 'break-word'
                        },
                        children: event.subtitle
                    }, void 0, false, {
                        fileName: "[project]/components/DailyAgendaCalendar.jsx",
                        lineNumber: 252,
                        columnNumber: 9
                    }, this),
                    event.status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            display: 'inline-block',
                            marginTop: '5px',
                            fontSize: '9.5px',
                            fontWeight: '800',
                            color: cfg.color,
                            background: "".concat(cfg.color, "15"),
                            padding: '2px 7px',
                            borderRadius: '20px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em'
                        },
                        children: event.status
                    }, void 0, false, {
                        fileName: "[project]/components/DailyAgendaCalendar.jsx",
                        lineNumber: 256,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DailyAgendaCalendar.jsx",
                lineNumber: 248,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/DailyAgendaCalendar.jsx",
        lineNumber: 221,
        columnNumber: 5
    }, this);
}
_c = EventChip;
function DailyAgendaCalendar(param) {
    let { state: stateProp } = param;
    _s();
    // Always pull from ERP context (live); fall back to prop if context unavailable
    let erpState;
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const erp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useERP"])();
        erpState = erp.state;
    } catch (e) {
        erpState = stateProp || {};
    }
    const state = erpState;
    const today = new Date();
    const [viewYear, setViewYear] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(today.getFullYear());
    const [viewMonth, setViewMonth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(today.getMonth());
    const [selectedDate, setSelectedDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(toDateStr(today.getFullYear(), today.getMonth(), today.getDate()));
    const allEvents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DailyAgendaCalendar.useMemo[allEvents]": ()=>deriveEvents(state)
    }["DailyAgendaCalendar.useMemo[allEvents]"], [
        state
    ]);
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonth = ()=>{
        if (viewMonth === 0) {
            setViewYear((y)=>y - 1);
            setViewMonth(11);
        } else setViewMonth((m)=>m - 1);
    };
    const nextMonth = ()=>{
        if (viewMonth === 11) {
            setViewYear((y)=>y + 1);
            setViewMonth(0);
        } else setViewMonth((m)=>m + 1);
    };
    const goToday = ()=>{
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
        setSelectedDate(toDateStr(today.getFullYear(), today.getMonth(), today.getDate()));
    };
    const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
    const selectedEvents = allEvents[selectedDate] || [];
    const getEventCount = (day)=>(allEvents[toDateStr(viewYear, viewMonth, day)] || []).length;
    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    const selectedLabel = "".concat(MONTH_NAMES[selectedDateObj.getMonth()], " ").concat(selectedDateObj.getDate(), ", ").concat(selectedDateObj.getFullYear());
    const eventTypeCounts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DailyAgendaCalendar.useMemo[eventTypeCounts]": ()=>{
            const counts = {};
            selectedEvents.forEach({
                "DailyAgendaCalendar.useMemo[eventTypeCounts]": (e)=>{
                    counts[e.type] = (counts[e.type] || 0) + 1;
                }
            }["DailyAgendaCalendar.useMemo[eventTypeCounts]"]);
            return counts;
        }
    }["DailyAgendaCalendar.useMemo[eventTypeCounts]"], [
        selectedEvents
    ]);
    // Total events across whole month (for mini stat)
    const monthEventTotal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DailyAgendaCalendar.useMemo[monthEventTotal]": ()=>{
            let total = 0;
            for(let d = 1; d <= daysInMonth; d++){
                total += getEventCount(d);
            }
            return total;
        }
    }["DailyAgendaCalendar.useMemo[monthEventTotal]"], [
        allEvents,
        viewYear,
        viewMonth,
        daysInMonth
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            height: '100%'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: "\n        @keyframes calSlideIn {\n          from { opacity: 0; transform: translateY(6px); }\n          to   { opacity: 1; transform: translateY(0); }\n        }\n        .cal-day-cell {\n          aspect-ratio: 1;\n          display: flex;\n          flex-direction: column;\n          align-items: center;\n          justify-content: center;\n          gap: 3px;\n          border-radius: 9px;\n          font-size: 12.5px;\n          font-weight: 600;\n          cursor: pointer;\n          transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;\n          position: relative;\n          min-width: 0;\n          padding: 3px 2px;\n          user-select: none;\n        }\n        .cal-day-cell:hover {\n          background: #f1f5f9 !important;\n          transform: scale(1.1);\n        }\n        .cal-day-dots {\n          display: flex;\n          gap: 2px;\n          align-items: center;\n          justify-content: center;\n          flex-wrap: nowrap;\n        }\n        .cal-dot {\n          width: 4px;\n          height: 4px;\n          border-radius: 50%;\n          flex-shrink: 0;\n        }\n        .agenda-event-row {\n          animation: calSlideIn 0.2s ease both;\n        }\n        .agenda-scroll::-webkit-scrollbar { width: 4px; }\n        .agenda-scroll::-webkit-scrollbar-track { background: transparent; }\n        .agenda-scroll::-webkit-scrollbar-thumb { background: #DCE5F0; border-radius: 4px; }\n      "
            }, void 0, false, {
                fileName: "[project]/components/DailyAgendaCalendar.jsx",
                lineNumber: 338,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 10px rgba(99,102,241,0.3)'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                    size: 14,
                                    color: "#fff"
                                }, void 0, false, {
                                    fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                    lineNumber: 397,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                lineNumber: 391,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '14px',
                                            fontWeight: '800',
                                            color: '#24345C',
                                            letterSpacing: '-0.3px'
                                        },
                                        children: [
                                            MONTH_NAMES[viewMonth],
                                            " ",
                                            viewYear
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                        lineNumber: 400,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '10px',
                                            color: '#8893A7',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        },
                                        children: [
                                            monthEventTotal,
                                            " events this month"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                        lineNumber: 403,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                lineNumber: 399,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DailyAgendaCalendar.jsx",
                        lineNumber: 390,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: goToday,
                                style: {
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    color: '#6366f1',
                                    background: '#eef2ff',
                                    border: '1px solid #c7d2fe',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    marginRight: '2px',
                                    transition: 'background 0.15s'
                                },
                                children: "Today"
                            }, void 0, false, {
                                fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                lineNumber: 410,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: prevMonth,
                                style: {
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '7px',
                                    background: '#f1f5f9',
                                    border: '1px solid #DCE5F0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                    size: 14,
                                    color: "#475569"
                                }, void 0, false, {
                                    fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                    lineNumber: 423,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                lineNumber: 418,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: nextMonth,
                                style: {
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '7px',
                                    background: '#f1f5f9',
                                    border: '1px solid #DCE5F0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                    size: 14,
                                    color: "#475569"
                                }, void 0, false, {
                                    fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                    lineNumber: 430,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                lineNumber: 425,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DailyAgendaCalendar.jsx",
                        lineNumber: 409,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DailyAgendaCalendar.jsx",
                lineNumber: 386,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: '#ffffff',
                    border: '1px solid #DCE5F0',
                    borderRadius: '14px',
                    padding: '10px',
                    marginBottom: '10px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7,1fr)',
                            gap: '2px',
                            marginBottom: '4px'
                        },
                        children: DAY_LABELS.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    textAlign: 'center',
                                    fontSize: '9.5px',
                                    fontWeight: '800',
                                    color: '#8893A7',
                                    letterSpacing: '0.05em',
                                    padding: '3px 0',
                                    textTransform: 'uppercase'
                                },
                                children: d
                            }, d, false, {
                                fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                lineNumber: 443,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/DailyAgendaCalendar.jsx",
                        lineNumber: 441,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7,1fr)',
                            gap: '2px'
                        },
                        children: [
                            Array.from({
                                length: firstDay
                            }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {}, "empty-".concat(i), false, {
                                    fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                    lineNumber: 455,
                                    columnNumber: 59
                                }, this)),
                            Array.from({
                                length: daysInMonth
                            }, (_, i)=>i + 1).map((day)=>{
                                const ds = toDateStr(viewYear, viewMonth, day);
                                const isToday = ds === todayStr;
                                const isSelected = ds === selectedDate;
                                const dayEvents = allEvents[ds] || [];
                                const eventCount = dayEvents.length;
                                let bg = 'transparent';
                                let color = '#334155';
                                if (isSelected) {
                                    bg = '#6366f1';
                                    color = '#ffffff';
                                } else if (isToday) {
                                    bg = '#eef2ff';
                                    color = '#6366f1';
                                } else if (eventCount) {
                                    bg = 'transparent';
                                }
                                // Up to 3 unique type colors as dots
                                const dotColors = [
                                    ...new Set(dayEvents.map((e)=>{
                                        var _EVENT_TYPES_e_type;
                                        return (_EVENT_TYPES_e_type = EVENT_TYPES[e.type]) === null || _EVENT_TYPES_e_type === void 0 ? void 0 : _EVENT_TYPES_e_type.color;
                                    }).filter(Boolean))
                                ].slice(0, 3);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "cal-day-cell",
                                    style: {
                                        background: bg,
                                        color,
                                        fontWeight: isToday || isSelected ? '800' : '600'
                                    },
                                    onClick: ()=>setSelectedDate(ds),
                                    title: eventCount > 0 ? "".concat(eventCount, " event").concat(eventCount > 1 ? 's' : '') : '',
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                lineHeight: 1
                                            },
                                            children: day
                                        }, void 0, false, {
                                            fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                            lineNumber: 481,
                                            columnNumber: 17
                                        }, this),
                                        eventCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "cal-day-dots",
                                            children: [
                                                dotColors.map((c, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "cal-dot",
                                                        style: {
                                                            background: isSelected ? 'rgba(255,255,255,0.75)' : c
                                                        }
                                                    }, idx, false, {
                                                        fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                                        lineNumber: 485,
                                                        columnNumber: 23
                                                    }, this)),
                                                eventCount > dotColors.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "cal-dot",
                                                    style: {
                                                        background: isSelected ? 'rgba(255,255,255,0.4)' : '#8893A7'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                                    lineNumber: 490,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                            lineNumber: 483,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, day, true, {
                                    fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                    lineNumber: 474,
                                    columnNumber: 15
                                }, this);
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DailyAgendaCalendar.jsx",
                        lineNumber: 454,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DailyAgendaCalendar.jsx",
                lineNumber: 436,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: '#ffffff',
                    border: '1px solid #DCE5F0',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '10px 14px',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'linear-gradient(to right, #F5FAFE, #ffffff)',
                            flexShrink: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '12px',
                                            fontWeight: '800',
                                            color: '#24345C'
                                        },
                                        children: [
                                            "Agenda for ",
                                            selectedLabel
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                        lineNumber: 516,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '10px',
                                            color: '#8893A7',
                                            fontWeight: '600',
                                            marginTop: '2px'
                                        },
                                        children: selectedEvents.length === 0 ? 'No events scheduled' : "".concat(selectedEvents.length, " event").concat(selectedEvents.length !== 1 ? 's' : '', " scheduled")
                                    }, void 0, false, {
                                        fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                        lineNumber: 519,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                lineNumber: 515,
                                columnNumber: 11
                            }, this),
                            selectedEvents.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    color: '#6366f1',
                                    background: '#eef2ff',
                                    border: '1px solid #c7d2fe',
                                    padding: '3px 10px',
                                    borderRadius: '20px'
                                },
                                children: selectedEvents.length
                            }, void 0, false, {
                                fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                lineNumber: 526,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DailyAgendaCalendar.jsx",
                        lineNumber: 508,
                        columnNumber: 9
                    }, this),
                    Object.keys(eventTypeCounts).length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '7px 14px',
                            display: 'flex',
                            gap: '5px',
                            flexWrap: 'wrap',
                            borderBottom: '1px solid #f1f5f9',
                            flexShrink: 0
                        },
                        children: Object.entries(eventTypeCounts).map((param)=>{
                            let [type, count] = param;
                            const cfg = EVENT_TYPES[type];
                            if (!cfg) return null;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: '9.5px',
                                    fontWeight: '700',
                                    color: cfg.color,
                                    background: cfg.bg,
                                    border: "1px solid ".concat(cfg.color, "28"),
                                    padding: '2px 7px',
                                    borderRadius: '20px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                },
                                children: [
                                    count,
                                    " ",
                                    cfg.label
                                ]
                            }, type, true, {
                                fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                lineNumber: 546,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/components/DailyAgendaCalendar.jsx",
                        lineNumber: 538,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "agenda-scroll",
                        style: {
                            flex: 1,
                            overflowY: 'auto',
                            padding: '10px 14px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '7px'
                        },
                        children: selectedEvents.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                padding: '20px 0',
                                color: '#8893A7'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: '#F5FAFE',
                                        border: '1px solid #DCE5F0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                        size: 18,
                                        color: "#D6E2F0"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                        lineNumber: 576,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                    lineNumber: 571,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        textAlign: 'center'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                color: '#5E6B82'
                                            },
                                            children: "No events"
                                        }, void 0, false, {
                                            fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                            lineNumber: 579,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '11px',
                                                color: '#8893A7',
                                                marginTop: '2px'
                                            },
                                            children: "Click any highlighted date to view its agenda"
                                        }, void 0, false, {
                                            fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                            lineNumber: 580,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                    lineNumber: 578,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DailyAgendaCalendar.jsx",
                            lineNumber: 566,
                            columnNumber: 13
                        }, this) : selectedEvents.map((event, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "agenda-event-row",
                                style: {
                                    animationDelay: "".concat(idx * 35, "ms")
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EventChip, {
                                    event: event
                                }, void 0, false, {
                                    fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                    lineNumber: 592,
                                    columnNumber: 17
                                }, this)
                            }, "".concat(event.id, "-").concat(idx), false, {
                                fileName: "[project]/components/DailyAgendaCalendar.jsx",
                                lineNumber: 587,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/DailyAgendaCalendar.jsx",
                        lineNumber: 560,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DailyAgendaCalendar.jsx",
                lineNumber: 502,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/DailyAgendaCalendar.jsx",
        lineNumber: 337,
        columnNumber: 5
    }, this);
}
_s(DailyAgendaCalendar, "oavkBe5xkGM21D+9KcNSMCeUYJM=");
_c1 = DailyAgendaCalendar;
var _c, _c1;
__turbopack_context__.k.register(_c, "EventChip");
__turbopack_context__.k.register(_c1, "DailyAgendaCalendar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/EditSample.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EditSample
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.mjs [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flask-conical.mjs [app-client] (ecmascript) <export default as FlaskConical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package.mjs [app-client] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.mjs [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.mjs [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$ProductPicker$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/components/ProductPicker.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
const ALL_PRODUCTS = [
    'Conplast Superplasticizer',
    'Fly Ash Blocks (Manufactured)',
    'AAC Lightweight Blocks (Manufactured)',
    'Solid Concrete Blocks (Manufactured)',
    'Hollow Concrete Blocks (Manufactured)',
    'Red Clay Bricks (Manufactured)',
    'Fly Ash Bricks (Manufactured)',
    'Pressed Sand-Lime Bricks (Manufactured)',
    'Uni Paver 60mm',
    'Interlocking Paver Blocks (Manufactured)',
    'Zig-Zag Pavers (Manufactured)',
    'Grass Paver Tiles (Manufactured)',
    'Ordinary Portland Cement 43 Grade (Manufactured)',
    'Portland Pozzolana Cement (Manufactured)',
    '10mm Coarse Aggregate (Manufactured)',
    '20mm Coarse Aggregate (Manufactured)',
    'CLC Foam Blocks (Traded)',
    'Gypsum Partition Blocks (Traded)',
    'Fire Clay Refractory Bricks (Traded)',
    'Calcium Silicate Bricks (Traded)',
    'Reflective Tactile Pavers (Traded)',
    'Heavy-duty Shotblasted Pavers (Traded)',
    'White Portland Cement (Traded)',
    'Rapid Hardening Cement (Traded)',
    'River Sand (Traded)',
    'Crushed Rock Sand / M-Sand (Traded)',
    'Stone Dust (Traded)',
    'FRCSQRC24x24 LD3',
    'FRCSQRC24x24 LD5',
    'FRCSQRC24x24 MD10',
    'FRCSQRC30x30 LD5',
    'FRCSQRC30x30 MD10',
    'FRCSQRC30x30 HD20',
    'FRCSQRC33x33 HD20',
    'FRCSQRC34x34 LD5'
];
function EditSample(param) {
    let { sample, onSave, onCancel } = param;
    _s();
    const [leadName, setLeadName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [dispatchDate, setDispatchDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [value, setValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(425);
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [productSearchQuery, setProductSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [showDropdown, setShowDropdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Sync state with props
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EditSample.useEffect": ()=>{
            if (sample) {
                setLeadName(sample.leadName || '');
                setDispatchDate(sample.dispatchDate || '');
                if (sample.detailedItems && sample.detailedItems.length > 0) {
                    setItems(sample.detailedItems.map({
                        "EditSample.useEffect": (item, idx)=>({
                                id: idx + 1,
                                productName: item.productName || '',
                                quantity: item.quantity || 1,
                                unitPrice: item.unitPrice !== undefined ? item.unitPrice : 100
                            })
                    }["EditSample.useEffect"]));
                } else {
                    const initialQty = sample.quantity || 1;
                    const initialVal = sample.value !== undefined ? sample.value : 425;
                    setItems([
                        {
                            id: 1,
                            productName: sample.product || '',
                            quantity: initialQty,
                            unitPrice: Math.round(initialVal / initialQty)
                        }
                    ]);
                }
            }
        }
    }["EditSample.useEffect"], [
        sample
    ]);
    // Close dropdown on click outside
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EditSample.useEffect": ()=>{
            function handleClickOutside(event) {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setShowDropdown(false);
                }
            }
            document.addEventListener("mousedown", handleClickOutside);
            return ({
                "EditSample.useEffect": ()=>{
                    document.removeEventListener("mousedown", handleClickOutside);
                }
            })["EditSample.useEffect"];
        }
    }["EditSample.useEffect"], []);
    const grandTotal = items.reduce((sum, item)=>sum + item.quantity * item.unitPrice, 0);
    // Keep value state synced with grandTotal
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "EditSample.useEffect": ()=>{
            setValue(grandTotal);
        }
    }["EditSample.useEffect"], [
        grandTotal
    ]);
    if (!sample) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "app-card",
            style: {
                flex: 1,
                padding: '40px',
                textAlign: 'center'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    style: {
                        color: 'var(--color-text-primary)',
                        marginBottom: '12px',
                        fontSize: '18px',
                        fontWeight: '800'
                    },
                    children: "Sample Request Not Found"
                }, void 0, false, {
                    fileName: "[project]/components/EditSample.jsx",
                    lineNumber: 102,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: 'var(--color-text-secondary)',
                        marginBottom: '24px',
                        fontSize: '14px'
                    },
                    children: "The requested sample ID does not exist or has been removed."
                }, void 0, false, {
                    fileName: "[project]/components/EditSample.jsx",
                    lineNumber: 103,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    className: "form-submit-btn",
                    onClick: onCancel,
                    style: {
                        width: 'auto',
                        display: 'inline-flex',
                        padding: '10px 24px',
                        margin: '0 auto'
                    },
                    children: "Return to Samples List"
                }, void 0, false, {
                    fileName: "[project]/components/EditSample.jsx",
                    lineNumber: 104,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/EditSample.jsx",
            lineNumber: 101,
            columnNumber: 7
        }, this);
    }
    const formatSampleId = (id)=>"SMP-".concat(String(id).padStart(3, '0'));
    const handleAddItem = function() {
        let prodName = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : '';
        const nextId = items.length > 0 ? Math.max(...items.map((i)=>i.id)) + 1 : 1;
        setItems([
            ...items,
            {
                id: nextId,
                productName: prodName,
                quantity: 1,
                unitPrice: 100
            }
        ]);
    };
    const handleRemoveItem = (id)=>{
        if (items.length > 1) {
            setItems(items.filter((i)=>i.id !== id));
        }
    };
    const handleRowChange = (id, field, val)=>{
        setItems(items.map((item)=>item.id === id ? {
                ...item,
                [field]: val
            } : item));
    };
    const handleSelectProduct = (prodName)=>{
        if (items.length === 1 && !items[0].productName.trim()) {
            handleRowChange(items[0].id, 'productName', prodName);
        } else {
            handleAddItem(prodName);
        }
        setProductSearchQuery('');
        setShowDropdown(false);
    };
    const filteredProducts = ALL_PRODUCTS.filter((p)=>p.toLowerCase().includes(productSearchQuery.toLowerCase()));
    const handleSubmit = (e)=>{
        e.preventDefault();
        if (!leadName.trim()) {
            alert('Please fill out Customer/Company Name.');
            return;
        }
        const invalidItem = items.some((item)=>!item.productName.trim());
        if (invalidItem) {
            alert('Please fill out the product name for all items.');
            return;
        }
        const finalProduct = items.map((item)=>item.productName.trim()).join(', ');
        const finalQuantity = items.reduce((sum, item)=>sum + item.quantity, 0);
        onSave({
            leadName: leadName.trim(),
            product: finalProduct,
            quantity: finalQuantity,
            dispatchDate: dispatchDate,
            value: grandTotal,
            detailedItems: items.map((item)=>({
                    productName: item.productName.trim(),
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                }))
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "app-card",
        style: {
            flex: 1
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "module-header-row",
                style: {
                    borderBottom: '1px solid #eaeaea',
                    paddingBottom: '12px',
                    marginBottom: '20px'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: "card-top-icon-btn",
                            onClick: onCancel,
                            style: {
                                width: '36px',
                                height: '36px',
                                background: '#f1f3f5',
                                color: '#000'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/components/EditSample.jsx",
                                lineNumber: 188,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/EditSample.jsx",
                            lineNumber: 187,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "module-title",
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            "Edit Sample Request #",
                                            formatSampleId(sample.id)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/EditSample.jsx",
                                        lineNumber: 192,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/EditSample.jsx",
                                    lineNumber: 191,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: '12px',
                                        color: 'var(--color-text-secondary)',
                                        marginTop: '2px'
                                    },
                                    children: "Modify testing sample configurations and logistics dispatch scheduling."
                                }, void 0, false, {
                                    fileName: "[project]/components/EditSample.jsx",
                                    lineNumber: 194,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/EditSample.jsx",
                            lineNumber: 190,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/EditSample.jsx",
                    lineNumber: 186,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/EditSample.jsx",
                lineNumber: 185,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: 'linear-gradient(135deg, #f0fdf4, #F5FAFE)',
                    border: '1px solid #bbf7d0',
                    borderRadius: '16px',
                    padding: '16px 24px',
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.05)'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        gap: '24px',
                        flexWrap: 'wrap'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        color: '#166534',
                                        letterSpacing: '0.5px'
                                    },
                                    children: "Sample ID"
                                }, void 0, false, {
                                    fileName: "[project]/components/EditSample.jsx",
                                    lineNumber: 217,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    style: {
                                        fontSize: '15px',
                                        color: '#16a34a'
                                    },
                                    children: formatSampleId(sample.id)
                                }, void 0, false, {
                                    fileName: "[project]/components/EditSample.jsx",
                                    lineNumber: 218,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/EditSample.jsx",
                            lineNumber: 216,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                borderLeft: '1px solid #bbf7d0',
                                paddingLeft: '24px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        color: '#166534',
                                        letterSpacing: '0.5px'
                                    },
                                    children: "Current Status"
                                }, void 0, false, {
                                    fileName: "[project]/components/EditSample.jsx",
                                    lineNumber: 221,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        background: sample.status === 'Pending' ? '#ffedd5' : sample.status === 'Sent' ? '#dbeafe' : sample.status === 'Approved' ? '#dcfce7' : '#fee2e2',
                                        color: sample.status === 'Pending' ? '#ea580c' : sample.status === 'Sent' ? '#1d4ed8' : sample.status === 'Approved' ? '#15803d' : '#dc2626',
                                        width: 'fit-content',
                                        marginTop: '2px'
                                    },
                                    children: sample.status
                                }, void 0, false, {
                                    fileName: "[project]/components/EditSample.jsx",
                                    lineNumber: 222,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/EditSample.jsx",
                            lineNumber: 220,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                borderLeft: '1px solid #bbf7d0',
                                paddingLeft: '24px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        color: '#166534',
                                        letterSpacing: '0.5px'
                                    },
                                    children: "Sample Cost"
                                }, void 0, false, {
                                    fileName: "[project]/components/EditSample.jsx",
                                    lineNumber: 244,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    style: {
                                        fontSize: '14px',
                                        color: '#475569'
                                    },
                                    children: [
                                        "₹",
                                        grandTotal.toLocaleString('en-IN')
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/EditSample.jsx",
                                    lineNumber: 245,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/EditSample.jsx",
                            lineNumber: 243,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/EditSample.jsx",
                    lineNumber: 215,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/EditSample.jsx",
                lineNumber: 202,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "create-lead-grid",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: '#f8f9fa',
                                    padding: '20px',
                                    borderRadius: '16px',
                                    border: '1px solid var(--color-border)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            fontSize: '13px',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            color: 'var(--color-text-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '16px',
                                            borderBottom: '1px solid #eaeaea',
                                            paddingBottom: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__["FlaskConical"], {
                                                size: 14,
                                                style: {
                                                    color: 'var(--color-accent-teal)'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/EditSample.jsx",
                                                lineNumber: 256,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "2. 🧪 Sample Management"
                                            }, void 0, false, {
                                                fileName: "[project]/components/EditSample.jsx",
                                                lineNumber: 257,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/EditSample.jsx",
                                        lineNumber: 255,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '14px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "form-group",
                                                style: {
                                                    marginBottom: 0
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "form-label",
                                                        children: "Customer / Company Name *"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/EditSample.jsx",
                                                        lineNumber: 262,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        className: "form-input",
                                                        value: leadName,
                                                        onChange: (e)=>setLeadName(e.target.value),
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/EditSample.jsx",
                                                        lineNumber: 263,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/EditSample.jsx",
                                                lineNumber: 261,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "form-group",
                                                style: {
                                                    marginBottom: 0
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "form-label",
                                                        children: "Dispatch Date"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/EditSample.jsx",
                                                        lineNumber: 272,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "date",
                                                        className: "form-input",
                                                        value: dispatchDate,
                                                        onChange: (e)=>setDispatchDate(e.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/EditSample.jsx",
                                                        lineNumber: 273,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/EditSample.jsx",
                                                lineNumber: 271,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/EditSample.jsx",
                                        lineNumber: 260,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/EditSample.jsx",
                                lineNumber: 254,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: '#f8f9fa',
                                    padding: '20px',
                                    borderRadius: '16px',
                                    border: '1px solid var(--color-border)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            fontSize: '13px',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            color: 'var(--color-text-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '16px',
                                            borderBottom: '1px solid #eaeaea',
                                            paddingBottom: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"], {
                                                size: 14,
                                                style: {
                                                    color: 'var(--color-accent-purple)'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/EditSample.jsx",
                                                lineNumber: 286,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "3. 📦 Product Selection (Smart UI)"
                                            }, void 0, false, {
                                                fileName: "[project]/components/EditSample.jsx",
                                                lineNumber: 287,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/EditSample.jsx",
                                        lineNumber: 285,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "form-group",
                                        style: {
                                            marginBottom: '16px',
                                            position: 'relative'
                                        },
                                        ref: dropdownRef,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "form-label",
                                                children: "Smart Search & Add"
                                            }, void 0, false, {
                                                fileName: "[project]/components/EditSample.jsx",
                                                lineNumber: 291,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: 'relative'
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$ProductPicker$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    value: null,
                                                    onChange: (p)=>{
                                                        if (p) handleAddItem(p.product_name);
                                                    },
                                                    placeholder: "Search catalog to add product...",
                                                    showBadge: false
                                                }, void 0, false, {
                                                    fileName: "[project]/components/EditSample.jsx",
                                                    lineNumber: 293,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/EditSample.jsx",
                                                lineNumber: 292,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/EditSample.jsx",
                                        lineNumber: 290,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "crm-table-container",
                                        style: {
                                            marginTop: '12px',
                                            border: '1px solid #DCE5F0'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                            className: "crm-table responsive-table",
                                            style: {
                                                fontSize: '12px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        style: {
                                                            background: '#F5FAFE'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                style: {
                                                                    width: '50%',
                                                                    padding: '10px'
                                                                },
                                                                children: "Product Details *"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/EditSample.jsx",
                                                                lineNumber: 309,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                style: {
                                                                    width: '15%',
                                                                    padding: '10px',
                                                                    textAlign: 'center'
                                                                },
                                                                children: "Qty *"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/EditSample.jsx",
                                                                lineNumber: 310,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                style: {
                                                                    width: '25%',
                                                                    padding: '10px',
                                                                    textAlign: 'center'
                                                                },
                                                                children: "Rate (INR) *"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/EditSample.jsx",
                                                                lineNumber: 311,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                style: {
                                                                    width: '10%',
                                                                    padding: '10px',
                                                                    textAlign: 'center'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/EditSample.jsx",
                                                                lineNumber: 312,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/EditSample.jsx",
                                                        lineNumber: 308,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/EditSample.jsx",
                                                    lineNumber: 307,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                    children: items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    "data-label": "Product Details",
                                                                    style: {
                                                                        padding: '8px 10px'
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$ProductPicker$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                        value: item.productId ? {
                                                                            id: item.productId,
                                                                            product_name: item.productName
                                                                        } : null,
                                                                        onChange: (p)=>{
                                                                            if (p) {
                                                                                handleRowChange(item.id, 'productId', p.id);
                                                                                handleRowChange(item.id, 'productName', p.product_name);
                                                                                if (p.selling_price) handleRowChange(item.id, 'unitPrice', p.selling_price);
                                                                            } else {
                                                                                handleRowChange(item.id, 'productId', null);
                                                                                handleRowChange(item.id, 'productName', '');
                                                                            }
                                                                        },
                                                                        placeholder: "Select product...",
                                                                        showBadge: false
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/EditSample.jsx",
                                                                        lineNumber: 319,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/EditSample.jsx",
                                                                    lineNumber: 318,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    "data-label": "Qty",
                                                                    style: {
                                                                        padding: '8px 10px'
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "number",
                                                                        className: "form-input",
                                                                        min: "1",
                                                                        value: item.quantity,
                                                                        onChange: (e)=>handleRowChange(item.id, 'quantity', Number(e.target.value)),
                                                                        required: true,
                                                                        style: {
                                                                            padding: '6px 10px',
                                                                            fontSize: '12px',
                                                                            textAlign: 'center'
                                                                        }
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/EditSample.jsx",
                                                                        lineNumber: 336,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/EditSample.jsx",
                                                                    lineNumber: 335,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    "data-label": "Rate",
                                                                    style: {
                                                                        padding: '8px 10px'
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "number",
                                                                        className: "form-input",
                                                                        min: "0",
                                                                        value: item.unitPrice,
                                                                        onChange: (e)=>handleRowChange(item.id, 'unitPrice', Number(e.target.value)),
                                                                        required: true,
                                                                        style: {
                                                                            padding: '6px 10px',
                                                                            fontSize: '12px',
                                                                            textAlign: 'center'
                                                                        }
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/EditSample.jsx",
                                                                        lineNumber: 347,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/EditSample.jsx",
                                                                    lineNumber: 346,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    "data-label": "Remove",
                                                                    style: {
                                                                        padding: '8px 10px',
                                                                        textAlign: 'center'
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: "btn-small btn-danger-small",
                                                                        onClick: ()=>handleRemoveItem(item.id),
                                                                        disabled: items.length === 1,
                                                                        style: {
                                                                            padding: '6px',
                                                                            opacity: items.length === 1 ? 0.4 : 1,
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        },
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                            size: 12
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/EditSample.jsx",
                                                                            lineNumber: 365,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/EditSample.jsx",
                                                                        lineNumber: 358,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/EditSample.jsx",
                                                                    lineNumber: 357,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, item.id, true, {
                                                            fileName: "[project]/components/EditSample.jsx",
                                                            lineNumber: 317,
                                                            columnNumber: 21
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/components/EditSample.jsx",
                                                    lineNumber: 315,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/EditSample.jsx",
                                            lineNumber: 306,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/EditSample.jsx",
                                        lineNumber: 305,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "btn-small btn-outline-small",
                                        onClick: ()=>handleAddItem(''),
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            marginTop: '12px',
                                            fontWeight: '700'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                size: 12
                                            }, void 0, false, {
                                                fileName: "[project]/components/EditSample.jsx",
                                                lineNumber: 381,
                                                columnNumber: 15
                                            }, this),
                                            " Add Product Row"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/EditSample.jsx",
                                        lineNumber: 375,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            fontSize: '14px',
                                            fontWeight: '800',
                                            marginTop: '16px',
                                            color: '#1e293b'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                "Grand Total: ₹",
                                                grandTotal.toLocaleString('en-IN')
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/EditSample.jsx",
                                            lineNumber: 385,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/EditSample.jsx",
                                        lineNumber: 384,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/EditSample.jsx",
                                lineNumber: 284,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/EditSample.jsx",
                        lineNumber: 251,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "form-actions",
                        style: {
                            marginTop: '24px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                className: "form-submit-btn",
                                children: "Save Changes"
                            }, void 0, false, {
                                fileName: "[project]/components/EditSample.jsx",
                                lineNumber: 393,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "btn-small btn-outline-small",
                                onClick: onCancel,
                                style: {
                                    flex: 'none',
                                    padding: '12px 20px'
                                },
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/components/EditSample.jsx",
                                lineNumber: 394,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/EditSample.jsx",
                        lineNumber: 392,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/EditSample.jsx",
                lineNumber: 250,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/EditSample.jsx",
        lineNumber: 183,
        columnNumber: 5
    }, this);
}
_s(EditSample, "pXEWcbT++3PAh34NF/uKbcbRvmo=");
_c = EditSample;
var _c;
__turbopack_context__.k.register(_c, "EditSample");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/CreateSample.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CreateSample
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.mjs [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.mjs [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.mjs [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/building-2.mjs [app-client] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/truck.mjs [app-client] (ecmascript) <export default as Truck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.mjs [app-client] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/shared/context/ERPContext.jsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$ProductPicker$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/components/ProductPicker.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$hooks$2f$useFormDraft$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/hooks/useFormDraft.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$idGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/idGenerator.ts [app-client] (ecmascript)");
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
function CreateSample(param) {
    let { leads = [], defaultLeadId, onAddSample, onCancel } = param;
    var _erpState_sales_samples, _erpState_sales, _activeLeads_, _selectedLead_address, _selectedLead_address1, _selectedLead_address2, _selectedLead_address3;
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const targetSampleId = searchParams === null || searchParams === void 0 ? void 0 : searchParams.get('sampleId');
    const targetLeadId = (searchParams === null || searchParams === void 0 ? void 0 : searchParams.get('leadId')) || defaultLeadId;
    const erpStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"])();
    const erpState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"])({
        "CreateSample.useERPStore[erpState]": (s)=>s.state
    }["CreateSample.useERPStore[erpState]"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CreateSample.useEffect": ()=>{
            if (targetLeadId && !targetSampleId) {
                var _erpState_sales;
                const allSamples = (erpState === null || erpState === void 0 ? void 0 : (_erpState_sales = erpState.sales) === null || _erpState_sales === void 0 ? void 0 : _erpState_sales.samples) || [];
                const leadSamples = allSamples.filter({
                    "CreateSample.useEffect.leadSamples": (s)=>(s.leadId === targetLeadId || s.sourceId === targetLeadId) && s.status !== 'CANCELLED' && s.status !== 'DELETED'
                }["CreateSample.useEffect.leadSamples"]);
                const completed = leadSamples.find({
                    "CreateSample.useEffect.completed": (s)=>s.status !== 'DRAFT'
                }["CreateSample.useEffect.completed"]);
                if (completed) {
                    __turbopack_context__.A("[project]/node_modules/sweetalert2/dist/sweetalert2.all.js [app-client] (ecmascript, async loader)").then({
                        "CreateSample.useEffect": (param)=>{
                            let { default: Swal } = param;
                            Swal.fire({
                                icon: 'info',
                                title: 'Already Completed',
                                text: 'A sample request has already been created for this lead.',
                                confirmButtonColor: '#0369a1'
                            }).then({
                                "CreateSample.useEffect": ()=>{
                                    if (onCancel) onCancel();
                                    else router.push('/sales/samples');
                                }
                            }["CreateSample.useEffect"]);
                        }
                    }["CreateSample.useEffect"]);
                    return;
                }
                const draft = leadSamples.find({
                    "CreateSample.useEffect.draft": (s)=>s.status === 'DRAFT'
                }["CreateSample.useEffect.draft"]);
                if (draft) {
                    router.replace("/sales/create-sample?sampleId=".concat(draft.id || draft.sampleId, "&leadId=").concat(targetLeadId));
                } else {
                    const res = erpStore.createOrResumeSampleFromLead(targetLeadId);
                    if (res.success && res.sampleId) {
                        router.replace("/sales/create-sample?sampleId=".concat(res.sampleId, "&leadId=").concat(targetLeadId));
                    }
                }
            }
        }
    }["CreateSample.useEffect"], [
        targetLeadId,
        targetSampleId,
        erpState,
        router,
        erpStore,
        onCancel
    ]);
    const sampleDraft = targetSampleId ? erpState === null || erpState === void 0 ? void 0 : (_erpState_sales = erpState.sales) === null || _erpState_sales === void 0 ? void 0 : (_erpState_sales_samples = _erpState_sales.samples) === null || _erpState_sales_samples === void 0 ? void 0 : _erpState_sales_samples.find((s)=>s.id === targetSampleId || s.sampleId === targetSampleId) : null;
    // Robust Lead Finder Helper
    const findLeadById = (searchId)=>{
        if (!searchId) return null;
        const str = String(searchId).trim();
        const cleanNum = str.replace(/\D/g, '');
        return leads.find((l)=>String(l.id) === str) || leads.find((l)=>cleanNum && String(l.id) === cleanNum) || leads.find((l)=>(l.leadNo || '').toLowerCase() === str.toLowerCase()) || leads.find((l)=>(l.companyName || '').toLowerCase() === str.toLowerCase()) || null;
    };
    const nonLostLeads = leads.filter((l)=>l.status !== 'Lost' && l.status !== 'Archived');
    const activeLeads = nonLostLeads.length > 0 ? nonLostLeads : leads;
    const targetLead = findLeadById(targetLeadId);
    const initialLeadId = targetLead ? targetLead.id : ((_activeLeads_ = activeLeads[0]) === null || _activeLeads_ === void 0 ? void 0 : _activeLeads_.id) || '';
    const emptySampleForm = {
        selectedLeadId: initialLeadId,
        selectedLead: targetLead || activeLeads[0] || null,
        productItems: [
            {
                id: 1,
                product: null,
                quantity: 1,
                specification: ''
            }
        ],
        transportationCost: '0',
        expectedDate: ''
    };
    const draftKey = "erp_draft_create_sample_".concat(targetSampleId || targetLeadId || 'new');
    const { formData, setFormData, clearDraft } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$hooks$2f$useFormDraft$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormDraft"])({
        draftKey,
        initialData: emptySampleForm,
        erpUpdatedAt: sampleDraft === null || sampleDraft === void 0 ? void 0 : sampleDraft.updatedAt
    });
    const { selectedLeadId, selectedLead, productItems, transportationCost, expectedDate } = formData;
    const updateField = (field, value)=>{
        setFormData((prev)=>({
                ...prev,
                [field]: typeof value === 'function' ? value(prev[field]) : value
            }));
    };
    const setSelectedLeadId = (val)=>updateField('selectedLeadId', val);
    const setSelectedLead = (val)=>updateField('selectedLead', val);
    const setProductItems = (val)=>updateField('productItems', val);
    const setTransportationCost = (val)=>updateField('transportationCost', val);
    const setExpectedDate = (val)=>updateField('expectedDate', val);
    // Handle lead selection change & prefill details
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CreateSample.useEffect": ()=>{
            const lead = leads.find({
                "CreateSample.useEffect": (l)=>String(l.id) === String(selectedLeadId)
            }["CreateSample.useEffect"]) || findLeadById(selectedLeadId);
            setSelectedLead(lead || null);
            if (lead) {
                // Auto-prefill transportation cost
                const cost = lead.expectedTransportationCost || lead.transportationCost || lead.transportCost || 0;
                setTransportationCost(String(cost));
                // Auto-prefill product items if sampleItems or detailedItems exist in lead
                if (lead.sampleItems && lead.sampleItems.length > 0) {
                    setProductItems(lead.sampleItems.map({
                        "CreateSample.useEffect": (si, idx)=>({
                                id: idx + 1,
                                product: {
                                    product_name: si.productName,
                                    name: si.productName,
                                    id: si.productId || idx + 1
                                },
                                quantity: Number(si.quantity) || 1,
                                specification: si.specification || ''
                            })
                    }["CreateSample.useEffect"]));
                } else if (lead.detailedItems && lead.detailedItems.length > 0) {
                    setProductItems(lead.detailedItems.map({
                        "CreateSample.useEffect": (di, idx)=>({
                                id: idx + 1,
                                product: {
                                    product_name: di.productName,
                                    name: di.productName,
                                    id: di.productId || idx + 1
                                },
                                quantity: Number(di.quantity) || 1,
                                specification: di.specification || ''
                            })
                    }["CreateSample.useEffect"]));
                } else if (lead.productInterested) {
                    setProductItems([
                        {
                            id: 1,
                            product: {
                                product_name: lead.productInterested,
                                name: lead.productInterested,
                                id: 1
                            },
                            quantity: 1,
                            specification: ''
                        }
                    ]);
                }
            }
        }
    }["CreateSample.useEffect"], [
        selectedLeadId,
        leads
    ]);
    const addProductRow = ()=>{
        setProductItems((prev)=>[
                ...prev,
                {
                    id: Date.now(),
                    product: null,
                    quantity: 1,
                    specification: ''
                }
            ]);
    };
    const removeProductRow = (id)=>{
        if (productItems.length <= 1) return;
        setProductItems((prev)=>prev.filter((it)=>it.id !== id));
    };
    const updateProductRow = (id, key, val)=>{
        setProductItems((prev)=>prev.map((it)=>it.id === id ? {
                    ...it,
                    [key]: val
                } : it));
    };
    const handleSubmit = (e)=>{
        e.preventDefault();
        if (!selectedLeadId) return;
        const validProducts = productItems.filter((it)=>it.product);
        if (validProducts.length === 0) {
            alert('Please select at least one product item from the catalog.');
            return;
        }
        const lead = selectedLead || leads.find((l)=>String(l.id) === String(selectedLeadId));
        if (!lead) return;
        const formattedProducts = validProducts.map((it)=>{
            var _it_product, _it_product1, _it_product2, _it_product3, _it_product4, _it_product5;
            return {
                productId: ((_it_product = it.product) === null || _it_product === void 0 ? void 0 : _it_product.id) || ((_it_product1 = it.product) === null || _it_product1 === void 0 ? void 0 : _it_product1.code) || "PRD-".concat(it.id),
                productName: ((_it_product2 = it.product) === null || _it_product2 === void 0 ? void 0 : _it_product2.product_name) || ((_it_product3 = it.product) === null || _it_product3 === void 0 ? void 0 : _it_product3.name) || 'Sample Item',
                product: ((_it_product4 = it.product) === null || _it_product4 === void 0 ? void 0 : _it_product4.product_name) || ((_it_product5 = it.product) === null || _it_product5 === void 0 ? void 0 : _it_product5.name) || 'Sample Item',
                quantity: Number(it.quantity) || 1,
                specification: it.specification || ''
            };
        });
        const primaryProduct = formattedProducts[0].productName;
        const totalQty = formattedProducts.reduce((sum, p)=>sum + p.quantity, 0);
        const payload = {
            leadId: lead.id,
            leadName: lead.companyName || lead.projectName || 'Lead Customer',
            customer: lead.companyName || lead.projectName || 'Lead Customer',
            product: formattedProducts.length === 1 ? "".concat(primaryProduct, " (").concat(formattedProducts[0].quantity, " Pcs)") : formattedProducts.map((p)=>"".concat(p.productName, " (").concat(p.quantity, " Pcs)")).join(', '),
            productName: primaryProduct,
            quantity: totalQty,
            products: formattedProducts,
            sampleItems: formattedProducts,
            transportationCost: Number(transportationCost) || 0,
            transportCost: Number(transportationCost) || 0,
            expectedDeliveryDate: expectedDate
        };
        const submitResult = async ()=>{
            let success = false;
            try {
                if (targetSampleId) {
                    const res = erpStore.finalizeSample(targetSampleId, payload);
                    if (res.success) {
                        success = true;
                        onCancel();
                    } else {
                        alert(res.message);
                    }
                } else {
                    const res = await onAddSample(payload);
                    success = (res === null || res === void 0 ? void 0 : res.success) !== false;
                }
            } catch (err) {
                console.error(err);
            }
            if (success) {
                clearDraft();
            }
        };
        submitResult();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "app-card",
        style: {
            flex: 1
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "module-header-row",
                style: {
                    borderBottom: '1px solid #eaeaea',
                    paddingBottom: '12px',
                    marginBottom: '20px'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "card-top-icon-btn",
                            onClick: onCancel,
                            style: {
                                width: '36px',
                                height: '36px',
                                background: '#f1f3f5',
                                color: '#000'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/components/CreateSample.jsx",
                                lineNumber: 239,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/CreateSample.jsx",
                            lineNumber: 238,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "module-title",
                            children: "Create Sample Dispatch Request"
                        }, void 0, false, {
                            fileName: "[project]/components/CreateSample.jsx",
                            lineNumber: 241,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/CreateSample.jsx",
                    lineNumber: 237,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/CreateSample.jsx",
                lineNumber: 236,
                columnNumber: 7
            }, this),
            activeLeads.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '40px',
                    background: '#fffbeb',
                    border: '1px solid #fef3c7',
                    borderRadius: '14px',
                    color: '#b45309'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                        size: 36
                    }, void 0, false, {
                        fileName: "[project]/components/CreateSample.jsx",
                        lineNumber: 247,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontWeight: '800',
                            fontSize: '16px'
                        },
                        children: "No Active Leads Available"
                    }, void 0, false, {
                        fileName: "[project]/components/CreateSample.jsx",
                        lineNumber: 248,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: '13px',
                            textAlign: 'center',
                            maxWidth: '400px'
                        },
                        children: "You need at least one active lead to issue and dispatch a product testing sample."
                    }, void 0, false, {
                        fileName: "[project]/components/CreateSample.jsx",
                        lineNumber: 249,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '12px',
                            marginTop: '8px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn-small btn-primary-small",
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '10px 18px',
                                    fontWeight: '800'
                                },
                                onClick: ()=>router.push('/sales/create-lead'),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateSample.jsx",
                                        lineNumber: 258,
                                        columnNumber: 15
                                    }, this),
                                    " Create Lead First"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateSample.jsx",
                                lineNumber: 253,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn-small btn-outline-small",
                                style: {
                                    padding: '10px 18px'
                                },
                                onClick: onCancel,
                                children: "Go Back"
                            }, void 0, false, {
                                fileName: "[project]/components/CreateSample.jsx",
                                lineNumber: 260,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateSample.jsx",
                        lineNumber: 252,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CreateSample.jsx",
                lineNumber: 246,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: '#F5FAFE',
                            padding: '20px',
                            borderRadius: '14px',
                            border: '1px solid var(--color-border)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    fontSize: '14px',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    color: 'var(--color-text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '16px',
                                    borderBottom: '1px solid #eaeaea',
                                    paddingBottom: '8px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
                                        size: 16,
                                        style: {
                                            color: 'var(--color-accent-teal)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateSample.jsx",
                                        lineNumber: 274,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "1. Lead Selection & Fetched Customer Details"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateSample.jsx",
                                        lineNumber: 275,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateSample.jsx",
                                lineNumber: 273,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "form-group",
                                style: {
                                    marginBottom: '16px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "form-label",
                                        children: "Select Lead Reference *"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateSample.jsx",
                                        lineNumber: 279,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        className: "form-select",
                                        value: selectedLeadId,
                                        onChange: (e)=>setSelectedLeadId(e.target.value),
                                        required: true,
                                        style: {
                                            height: '44px',
                                            fontWeight: '700'
                                        },
                                        children: activeLeads.map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: l.id,
                                                children: [
                                                    "Lead ",
                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$idGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["displayEntityId"])(l.id),
                                                    " — ",
                                                    l.companyName || l.projectName || 'Customer',
                                                    " ",
                                                    l.contactPerson || l.siteInchargeName ? "(".concat(l.contactPerson || l.siteInchargeName, ")") : ''
                                                ]
                                            }, l.id, true, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 288,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateSample.jsx",
                                        lineNumber: 280,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateSample.jsx",
                                lineNumber: 278,
                                columnNumber: 13
                            }, this),
                            selectedLead && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: '#ffffff',
                                    border: '1.5px solid #D6E2F0',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                    gap: '14px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '11px',
                                                    color: '#5E6B82',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    display: 'block'
                                                },
                                                children: "Customer / Company"
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 299,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    fontSize: '14px',
                                                    color: '#24345C'
                                                },
                                                children: selectedLead.companyName || selectedLead.projectName || 'N/A'
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 300,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateSample.jsx",
                                        lineNumber: 298,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '11px',
                                                    color: '#5E6B82',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    display: 'block'
                                                },
                                                children: "Contact Person / Site Incharge"
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 303,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    fontSize: '13.5px',
                                                    color: '#24345C'
                                                },
                                                children: selectedLead.siteInchargeName || selectedLead.contactPerson || 'N/A'
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 304,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateSample.jsx",
                                        lineNumber: 302,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '11px',
                                                    color: '#5E6B82',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    display: 'block'
                                                },
                                                children: "Mobile Contact"
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 307,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    fontSize: '13.5px',
                                                    color: '#0369a1'
                                                },
                                                children: selectedLead.siteInchargeMobile || selectedLead.phone || 'N/A'
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 308,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateSample.jsx",
                                        lineNumber: 306,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '11px',
                                                    color: '#5E6B82',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    display: 'block'
                                                },
                                                children: "Project / Group"
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 311,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    fontSize: '13.5px',
                                                    color: '#475569'
                                                },
                                                children: [
                                                    selectedLead.projectName || '—',
                                                    " ",
                                                    selectedLead.groupName ? "(".concat(selectedLead.groupName, ")") : ''
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 312,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateSample.jsx",
                                        lineNumber: 310,
                                        columnNumber: 17
                                    }, this),
                                    selectedLead.gstNumber && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '11px',
                                                    color: '#5E6B82',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    display: 'block'
                                                },
                                                children: "GST Number"
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 316,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    fontSize: '13px',
                                                    color: '#166534'
                                                },
                                                children: selectedLead.gstNumber
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 317,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateSample.jsx",
                                        lineNumber: 315,
                                        columnNumber: 19
                                    }, this),
                                    selectedLead.address && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            gridColumn: '1 / -1'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '11px',
                                                    color: '#5E6B82',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    display: 'block'
                                                },
                                                children: "Delivery Address"
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 322,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '12.5px',
                                                    color: '#334155'
                                                },
                                                children: [
                                                    (_selectedLead_address = selectedLead.address) === null || _selectedLead_address === void 0 ? void 0 : _selectedLead_address.line1,
                                                    (_selectedLead_address1 = selectedLead.address) === null || _selectedLead_address1 === void 0 ? void 0 : _selectedLead_address1.city,
                                                    (_selectedLead_address2 = selectedLead.address) === null || _selectedLead_address2 === void 0 ? void 0 : _selectedLead_address2.state,
                                                    (_selectedLead_address3 = selectedLead.address) === null || _selectedLead_address3 === void 0 ? void 0 : _selectedLead_address3.pincode
                                                ].filter(Boolean).join(', ') || 'Address not logged'
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 323,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateSample.jsx",
                                        lineNumber: 321,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateSample.jsx",
                                lineNumber: 297,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateSample.jsx",
                        lineNumber: 272,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: '#F5FAFE',
                            padding: '20px',
                            borderRadius: '14px',
                            border: '1px solid var(--color-border)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '16px',
                                    borderBottom: '1px solid #eaeaea',
                                    paddingBottom: '8px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            fontSize: '14px',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            color: 'var(--color-text-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            margin: 0
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                                                size: 16,
                                                style: {
                                                    color: 'var(--color-accent-teal)'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 336,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "2. Products & Quantities (",
                                                    productItems.length,
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 337,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateSample.jsx",
                                        lineNumber: 335,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: addProductRow,
                                        className: "btn-small btn-primary-small",
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontWeight: '800',
                                            padding: '6px 12px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                size: 14
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 345,
                                                columnNumber: 17
                                            }, this),
                                            " Add Product"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateSample.jsx",
                                        lineNumber: 339,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateSample.jsx",
                                lineNumber: 334,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px'
                                },
                                children: productItems.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: '#ffffff',
                                            border: '1px solid #D6E2F0',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) auto',
                                            gap: '14px',
                                            alignItems: 'center'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "form-group",
                                                style: {
                                                    marginBottom: 0
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "form-label",
                                                        children: [
                                                            "Product #",
                                                            index + 1,
                                                            " *"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/CreateSample.jsx",
                                                        lineNumber: 365,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$ProductPicker$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        value: item.product,
                                                        onChange: (p)=>updateProductRow(item.id, 'product', p),
                                                        placeholder: "Search product from catalog...",
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CreateSample.jsx",
                                                        lineNumber: 366,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 364,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "form-group",
                                                style: {
                                                    marginBottom: 0,
                                                    maxWidth: '140px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "form-label",
                                                        children: "Quantity *"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CreateSample.jsx",
                                                        lineNumber: 375,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        className: "form-input",
                                                        min: "1",
                                                        value: item.quantity,
                                                        onChange: (e)=>updateProductRow(item.id, 'quantity', e.target.value),
                                                        required: true,
                                                        style: {
                                                            height: '42px',
                                                            color: '#000',
                                                            background: '#fff'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CreateSample.jsx",
                                                        lineNumber: 376,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 374,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "form-group",
                                                style: {
                                                    marginBottom: 0
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "form-label",
                                                        children: "Specification / Notes"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CreateSample.jsx",
                                                        lineNumber: 388,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        className: "form-input",
                                                        placeholder: "e.g. 60mm Grey M30 Grade",
                                                        value: item.specification,
                                                        onChange: (e)=>updateProductRow(item.id, 'specification', e.target.value),
                                                        style: {
                                                            height: '42px',
                                                            color: '#000',
                                                            background: '#fff'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CreateSample.jsx",
                                                        lineNumber: 389,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 387,
                                                columnNumber: 19
                                            }, this),
                                            productItems.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>removeProductRow(item.id),
                                                style: {
                                                    background: '#fee2e2',
                                                    color: '#dc2626',
                                                    border: '1px solid #fca5a5',
                                                    borderRadius: '8px',
                                                    width: '36px',
                                                    height: '36px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    marginTop: '22px'
                                                },
                                                title: "Remove product",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                    size: 16
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateSample.jsx",
                                                    lineNumber: 418,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 400,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, item.id, true, {
                                        fileName: "[project]/components/CreateSample.jsx",
                                        lineNumber: 351,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/CreateSample.jsx",
                                lineNumber: 349,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateSample.jsx",
                        lineNumber: 333,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            background: '#F5FAFE',
                            padding: '20px',
                            borderRadius: '14px',
                            border: '1px solid var(--color-border)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    fontSize: '14px',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    color: 'var(--color-text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '16px',
                                    borderBottom: '1px solid #eaeaea',
                                    paddingBottom: '8px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"], {
                                        size: 16,
                                        style: {
                                            color: 'var(--color-accent-teal)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateSample.jsx",
                                        lineNumber: 429,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "3. Transportation & Delivery Settings"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateSample.jsx",
                                        lineNumber: 430,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateSample.jsx",
                                lineNumber: 428,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "form-row",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "form-group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "form-label",
                                                children: "Expected Transportation Cost (₹)"
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 435,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                className: "form-input",
                                                min: "0",
                                                step: "0.01",
                                                placeholder: "e.g. 1500.00",
                                                value: transportationCost,
                                                onChange: (e)=>setTransportationCost(e.target.value),
                                                style: {
                                                    height: '42px',
                                                    color: '#000',
                                                    background: '#fff',
                                                    fontWeight: '700'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 436,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '11px',
                                                    color: '#5E6B82',
                                                    marginTop: '4px',
                                                    display: 'block'
                                                },
                                                children: "Auto-fetched from lead details if previously entered."
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 446,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateSample.jsx",
                                        lineNumber: 434,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "form-group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "form-label",
                                                children: "Expected Delivery Date"
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 450,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "date",
                                                className: "form-input",
                                                value: expectedDate,
                                                onChange: (e)=>setExpectedDate(e.target.value),
                                                style: {
                                                    height: '42px',
                                                    color: '#000',
                                                    background: '#fff'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateSample.jsx",
                                                lineNumber: 451,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateSample.jsx",
                                        lineNumber: 449,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateSample.jsx",
                                lineNumber: 433,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateSample.jsx",
                        lineNumber: 427,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "form-actions",
                        style: {
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                className: "form-submit-btn",
                                style: {
                                    padding: '12px 28px',
                                    fontSize: '14px',
                                    fontWeight: '800'
                                },
                                children: "🚀 Send Sample Request"
                            }, void 0, false, {
                                fileName: "[project]/components/CreateSample.jsx",
                                lineNumber: 464,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "btn-small btn-outline-small",
                                onClick: onCancel,
                                style: {
                                    padding: '12px 20px'
                                },
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/components/CreateSample.jsx",
                                lineNumber: 467,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateSample.jsx",
                        lineNumber: 463,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CreateSample.jsx",
                lineNumber: 270,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/CreateSample.jsx",
        lineNumber: 235,
        columnNumber: 5
    }, this);
}
_s(CreateSample, "lT3pKCS+xGxeBuotONMY9JwTkL8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$hooks$2f$useFormDraft$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormDraft"]
    ];
});
_c = CreateSample;
var _c;
__turbopack_context__.k.register(_c, "CreateSample");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/CreatePayment.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CreatePayment
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.mjs [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.mjs [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.mjs [app-client] (ecmascript) <export default as Check>");
;
var _s = __turbopack_context__.k.signature();
;
;
function CreatePayment(param) {
    let { payments, onReceivePayment, onCancel } = param;
    var _outstandingInvoices_;
    _s();
    // Filter only outstanding invoices
    const outstandingInvoices = payments.filter((p)=>p.status !== 'Paid');
    // Form states
    const [selectedInvoiceId, setSelectedInvoiceId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(((_outstandingInvoices_ = outstandingInvoices[0]) === null || _outstandingInvoices_ === void 0 ? void 0 : _outstandingInvoices_.id) || '');
    const [isConfirmed, setIsConfirmed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [confirmedAmount, setConfirmedAmount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "CreatePayment.useState": ()=>{
            const defaultInvoice = outstandingInvoices[0];
            return defaultInvoice ? defaultInvoice.totalAmount - defaultInvoice.paidAmount : 0;
        }
    }["CreatePayment.useState"]);
    const [notes, setNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const selectedInvoice = outstandingInvoices.find((p)=>String(p.id) === String(selectedInvoiceId));
    const handleSubmit = (e)=>{
        e.preventDefault();
        if (!selectedInvoiceId) return;
        if (!isConfirmed) {
            alert("Please confirm the payment by clicking 'Confirm Payment' first.");
            return;
        }
        if (!confirmedAmount || Number(confirmedAmount) <= 0) {
            alert("Please enter a valid confirmed amount.");
            return;
        }
        // Send to Finance
        onReceivePayment(Number(selectedInvoiceId), Number(confirmedAmount), new Date().toISOString().split('T')[0], 'Sales Confirmation', 'CUSTOMER-CONFIRMED', notes || 'Customer confirmed payment.');
    };
    const formatINR = (val)=>{
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "app-card",
        style: {
            flex: 1
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "module-header-row",
                style: {
                    borderBottom: '1px solid #eaeaea',
                    paddingBottom: '12px',
                    marginBottom: '20px'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: "card-top-icon-btn",
                            onClick: onCancel,
                            style: {
                                width: '36px',
                                height: '36px',
                                background: '#f1f3f5',
                                color: '#000'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/components/CreatePayment.jsx",
                                lineNumber: 55,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/CreatePayment.jsx",
                            lineNumber: 54,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "module-title",
                            children: "Confirm Customer Payment"
                        }, void 0, false, {
                            fileName: "[project]/components/CreatePayment.jsx",
                            lineNumber: 57,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/CreatePayment.jsx",
                    lineNumber: 53,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/CreatePayment.jsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            outstandingInvoices.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '40px',
                    background: '#f0fdf4',
                    border: '1px solid #dcfce7',
                    borderRadius: '14px',
                    color: '#166534'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                        size: 32
                    }, void 0, false, {
                        fileName: "[project]/components/CreatePayment.jsx",
                        lineNumber: 63,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontWeight: '700'
                        },
                        children: "All Invoices Fully Paid!"
                    }, void 0, false, {
                        fileName: "[project]/components/CreatePayment.jsx",
                        lineNumber: 64,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: '13px',
                            textAlign: 'center'
                        },
                        children: "There are currently no outstanding invoices requiring payment confirmation."
                    }, void 0, false, {
                        fileName: "[project]/components/CreatePayment.jsx",
                        lineNumber: 65,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "btn-small btn-primary-small",
                        style: {
                            marginTop: '10px'
                        },
                        onClick: onCancel,
                        children: "Go Back"
                    }, void 0, false, {
                        fileName: "[project]/components/CreatePayment.jsx",
                        lineNumber: 66,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CreatePayment.jsx",
                lineNumber: 62,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "form-group",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "form-label",
                                children: "Select Invoice *"
                            }, void 0, false, {
                                fileName: "[project]/components/CreatePayment.jsx",
                                lineNumber: 73,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "form-select",
                                value: selectedInvoiceId,
                                onChange: (e)=>{
                                    const invId = e.target.value;
                                    setSelectedInvoiceId(invId);
                                    const inv = outstandingInvoices.find((p)=>String(p.id) === String(invId));
                                    if (inv) {
                                        setConfirmedAmount(inv.totalAmount - inv.paidAmount);
                                        setIsConfirmed(false);
                                    }
                                },
                                required: true,
                                children: outstandingInvoices.map((p)=>{
                                    const balance = p.totalAmount - p.paidAmount;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: p.id,
                                        children: [
                                            "Invoice #",
                                            p.invoiceNo,
                                            " - ",
                                            p.customerName,
                                            " (Outstanding: ",
                                            formatINR(balance),
                                            ")"
                                        ]
                                    }, p.id, true, {
                                        fileName: "[project]/components/CreatePayment.jsx",
                                        lineNumber: 91,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/CreatePayment.jsx",
                                lineNumber: 74,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreatePayment.jsx",
                        lineNumber: 72,
                        columnNumber: 11
                    }, this),
                    selectedInvoice && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                            background: 'var(--color-bg-primary)',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid var(--color-border)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '11px',
                                            color: 'var(--color-text-secondary)',
                                            textTransform: 'uppercase',
                                            fontWeight: 'bold'
                                        },
                                        children: "Customer Name"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreatePayment.jsx",
                                        lineNumber: 110,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            margin: '4px 0 0 0',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        },
                                        children: selectedInvoice.customerName
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreatePayment.jsx",
                                        lineNumber: 111,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreatePayment.jsx",
                                lineNumber: 109,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '11px',
                                            color: 'var(--color-text-secondary)',
                                            textTransform: 'uppercase',
                                            fontWeight: 'bold'
                                        },
                                        children: "Invoice No."
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreatePayment.jsx",
                                        lineNumber: 114,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            margin: '4px 0 0 0',
                                            fontFamily: 'monospace',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        },
                                        children: [
                                            "#",
                                            selectedInvoice.invoiceNo
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreatePayment.jsx",
                                        lineNumber: 115,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreatePayment.jsx",
                                lineNumber: 113,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '11px',
                                            color: 'var(--color-text-secondary)',
                                            textTransform: 'uppercase',
                                            fontWeight: 'bold'
                                        },
                                        children: "Invoice Amount"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreatePayment.jsx",
                                        lineNumber: 118,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            margin: '4px 0 0 0',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        },
                                        children: formatINR(selectedInvoice.totalAmount)
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreatePayment.jsx",
                                        lineNumber: 119,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreatePayment.jsx",
                                lineNumber: 117,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '11px',
                                            color: 'var(--color-text-secondary)',
                                            textTransform: 'uppercase',
                                            fontWeight: 'bold'
                                        },
                                        children: "Outstanding Amount"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreatePayment.jsx",
                                        lineNumber: 122,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            margin: '4px 0 0 0',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            color: '#ef4444'
                                        },
                                        children: formatINR(selectedInvoice.totalAmount - selectedInvoice.paidAmount)
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreatePayment.jsx",
                                        lineNumber: 123,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreatePayment.jsx",
                                lineNumber: 121,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreatePayment.jsx",
                        lineNumber: 100,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "form-group",
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "form-label",
                                style: {
                                    marginBottom: 0
                                },
                                children: "Confirm Payment? *"
                            }, void 0, false, {
                                fileName: "[project]/components/CreatePayment.jsx",
                                lineNumber: 130,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setIsConfirmed(!isConfirmed),
                                style: {
                                    padding: '8px 24px',
                                    borderRadius: '24px',
                                    border: 'none',
                                    background: isConfirmed ? '#10b981' : 'var(--color-border)',
                                    color: isConfirmed ? '#fff' : 'var(--color-text-secondary)',
                                    fontWeight: 'bold',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s ease'
                                },
                                children: [
                                    isConfirmed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreatePayment.jsx",
                                        lineNumber: 149,
                                        columnNumber: 30
                                    }, this) : null,
                                    isConfirmed ? 'Yes' : 'Click to Confirm'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreatePayment.jsx",
                                lineNumber: 131,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreatePayment.jsx",
                        lineNumber: 129,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "form-group",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "form-label",
                                children: "Confirmed Amount (₹) *"
                            }, void 0, false, {
                                fileName: "[project]/components/CreatePayment.jsx",
                                lineNumber: 156,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                className: "form-input",
                                min: "1",
                                max: selectedInvoice ? selectedInvoice.totalAmount - selectedInvoice.paidAmount : undefined,
                                step: "1",
                                value: confirmedAmount,
                                onChange: (e)=>setConfirmedAmount(Number(e.target.value)),
                                required: true,
                                disabled: !isConfirmed,
                                placeholder: "Enter the amount customer confirmed they paid"
                            }, void 0, false, {
                                fileName: "[project]/components/CreatePayment.jsx",
                                lineNumber: 157,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                style: {
                                    color: 'var(--color-text-secondary)',
                                    marginTop: '4px',
                                    display: 'block'
                                },
                                children: [
                                    "Maximum allowable: ",
                                    selectedInvoice ? formatINR(selectedInvoice.totalAmount - selectedInvoice.paidAmount) : '0'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreatePayment.jsx",
                                lineNumber: 169,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreatePayment.jsx",
                        lineNumber: 155,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "form-group",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "form-label",
                                children: "Remarks (Optional)"
                            }, void 0, false, {
                                fileName: "[project]/components/CreatePayment.jsx",
                                lineNumber: 176,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                className: "form-textarea",
                                style: {
                                    minHeight: '90px'
                                },
                                placeholder: "e.g. Customer stated payment was done via IMPS/NEFT...",
                                value: notes,
                                onChange: (e)=>setNotes(e.target.value),
                                disabled: !isConfirmed
                            }, void 0, false, {
                                fileName: "[project]/components/CreatePayment.jsx",
                                lineNumber: 177,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreatePayment.jsx",
                        lineNumber: 175,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "form-actions",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                className: "form-submit-btn",
                                disabled: !isConfirmed,
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: isConfirmed ? 1 : 0.6,
                                    cursor: isConfirmed ? 'pointer' : 'not-allowed',
                                    background: isConfirmed ? 'var(--color-accent-teal)' : 'var(--color-border)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                        size: 15
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreatePayment.jsx",
                                        lineNumber: 202,
                                        columnNumber: 15
                                    }, this),
                                    " Send to Finance"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreatePayment.jsx",
                                lineNumber: 188,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "btn-small btn-outline-small",
                                onClick: onCancel,
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/components/CreatePayment.jsx",
                                lineNumber: 204,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreatePayment.jsx",
                        lineNumber: 187,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CreatePayment.jsx",
                lineNumber: 69,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/CreatePayment.jsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
}
_s(CreatePayment, "1xnuF6xUp900cYYErUIbMyh21h4=");
_c = CreatePayment;
var _c;
__turbopack_context__.k.register(_c, "CreatePayment");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/CustomersView.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CustomersView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.mjs [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.mjs [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/phone.mjs [app-client] (ecmascript) <export default as Phone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mail.mjs [app-client] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.mjs [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clipboard-list.mjs [app-client] (ecmascript) <export default as ClipboardList>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.mjs [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs [app-client] (ecmascript) <export default as ChevronRight>");
;
var _s = __turbopack_context__.k.signature();
;
;
function CustomersView(param) {
    let { customers, orders = [], searchQuery, setSearchQuery, flat = false } = param;
    _s();
    const [localSearch, setLocalSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const search = searchQuery !== undefined ? searchQuery : localSearch;
    const setSearch = setSearchQuery !== undefined ? setSearchQuery : setLocalSearch;
    const [selectedCust, setSelectedCust] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('All');
    // Enrich customers with live metrics from orders
    const enrichedCustomers = customers.map((c)=>{
        const custName = c.name || c.companyName || c.customerName || c.company_name || 'Unknown Customer';
        const custOrders = orders.filter((o)=>{
            var _o_customer;
            return String(o.customerId) === String(c.id) || ((_o_customer = o.customer) === null || _o_customer === void 0 ? void 0 : _o_customer.id) && String(o.customer.id) === String(c.id) || o.customerName && custName !== 'Unknown Customer' && o.customerName.toLowerCase() === custName.toLowerCase();
        });
        const totalOrders = custOrders.length;
        const totalRevenue = custOrders.reduce((sum, o)=>{
            var _o_payment;
            return sum + Number(o.grand_total || o.total_amount || o.totalAmount || o.totalValue || ((_o_payment = o.payment) === null || _o_payment === void 0 ? void 0 : _o_payment.totalAmount) || 0);
        }, 0);
        const outstanding = custOrders.reduce((sum, o)=>{
            var _o_payment;
            const pending = o.pendingAmount !== undefined ? o.pendingAmount : ((_o_payment = o.payment) === null || _o_payment === void 0 ? void 0 : _o_payment.pendingAmount) || 0;
            return sum + Number(pending || 0);
        }, 0);
        const ordersHistory = custOrders.map((o)=>{
            var _o_payment;
            return {
                product: o.products || o.productsSummary || "Order ".concat(o.orderNo || ''),
                val: Number(o.grand_total || o.total_amount || o.totalAmount || o.totalValue || ((_o_payment = o.payment) === null || _o_payment === void 0 ? void 0 : _o_payment.totalAmount) || 0)
            };
        });
        const communicationLogs = c.communicationLogs || c.followups || c.logs || [];
        return {
            ...c,
            displayName: custName,
            displayPhone: c.phone || c.mobile || c.contactNumber || 'N/A',
            displayEmail: c.email || c.emailAddress || 'N/A',
            totalOrders,
            totalRevenue,
            outstanding,
            ordersHistory,
            communicationLogs
        };
    });
    const formatINR = (value)=>{
        const num = Number(value || 0);
        if (isNaN(num)) return '₹0';
        if (num >= 100000) {
            return "₹".concat((num / 100000).toFixed(2), " L");
        }
        return "₹".concat(Math.round(num).toLocaleString('en-IN'));
    };
    const [currentPage, setCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    // Reset page when search or filter changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomersView.useEffect": ()=>{
            setCurrentPage(1);
        }
    }["CustomersView.useEffect"], [
        search,
        filter
    ]);
    const filteredCust = enrichedCustomers.filter((c)=>{
        const matchesSearch = (c.displayName || '').toLowerCase().includes(search.toLowerCase()) || (c.displayEmail || '').toLowerCase().includes(search.toLowerCase());
        let matchesFilter = false;
        if (filter === 'All') {
            matchesFilter = true;
        } else if (filter === 'Active Orders') {
            matchesFilter = c.totalOrders > 0;
        } else if (filter === 'Outstanding') {
            matchesFilter = c.outstanding > 0;
        }
        return matchesSearch && matchesFilter;
    });
    const ITEMS_PER_PAGE = 25;
    const totalPages = Math.ceil(filteredCust.length / ITEMS_PER_PAGE) || 1;
    const displayedCust = flat ? filteredCust : filteredCust.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
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
                        children: "Customer Portfolio Directory"
                    }, void 0, false, {
                        fileName: "[project]/components/CustomersView.jsx",
                        lineNumber: 99,
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
                                    {
                                        id: 'All',
                                        label: 'All'
                                    },
                                    {
                                        id: 'Active Orders',
                                        label: 'Active Orders'
                                    },
                                    {
                                        id: 'Outstanding',
                                        label: 'Outstanding Balance'
                                    }
                                ].map((st)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "filter-pill ".concat(filter === st.id ? 'active' : ''),
                                        onClick: ()=>setFilter(st.id),
                                        style: {
                                            color: filter === st.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                                        },
                                        children: st.label
                                    }, st.id, false, {
                                        fileName: "[project]/components/CustomersView.jsx",
                                        lineNumber: 108,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/CustomersView.jsx",
                                lineNumber: 102,
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
                                        fileName: "[project]/components/CustomersView.jsx",
                                        lineNumber: 120,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Search customers...",
                                        value: search,
                                        onChange: (e)=>setSearch(e.target.value),
                                        style: {
                                            color: 'var(--color-text-primary)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/CustomersView.jsx",
                                        lineNumber: 121,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CustomersView.jsx",
                                lineNumber: 119,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CustomersView.jsx",
                        lineNumber: 100,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CustomersView.jsx",
                lineNumber: 98,
                columnNumber: 7
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
                                        children: "Customer Name"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CustomersView.jsx",
                                        lineNumber: 137,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Contact Details"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CustomersView.jsx",
                                        lineNumber: 138,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Total Orders"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CustomersView.jsx",
                                        lineNumber: 139,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Cumulative Revenue"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CustomersView.jsx",
                                        lineNumber: 140,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Outstanding Balance"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CustomersView.jsx",
                                        lineNumber: 141,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Actions"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CustomersView.jsx",
                                        lineNumber: 142,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CustomersView.jsx",
                                lineNumber: 136,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/CustomersView.jsx",
                            lineNumber: 135,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: filteredCust.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: "6",
                                    style: {
                                        textAlign: 'center',
                                        padding: '30px',
                                        color: 'var(--color-text-muted)'
                                    },
                                    children: "No customer records logged."
                                }, void 0, false, {
                                    fileName: "[project]/components/CustomersView.jsx",
                                    lineNumber: 148,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/CustomersView.jsx",
                                lineNumber: 147,
                                columnNumber: 15
                            }, this) : displayedCust.map((c, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Customer Name",
                                            style: {
                                                fontWeight: '600'
                                            },
                                            children: [
                                                c.displayName,
                                                c.contactPerson && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: '11px',
                                                        color: 'var(--color-text-secondary)',
                                                        marginTop: '2px'
                                                    },
                                                    children: c.contactPerson
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CustomersView.jsx",
                                                    lineNumber: 157,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 155,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Contact Details",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    fontSize: '12px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__["Phone"], {
                                                                size: 10,
                                                                style: {
                                                                    color: 'var(--color-text-muted)'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/CustomersView.jsx",
                                                                lineNumber: 162,
                                                                columnNumber: 25
                                                            }, this),
                                                            " ",
                                                            c.displayPhone
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/CustomersView.jsx",
                                                        lineNumber: 161,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            color: 'var(--color-text-secondary)'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                                                                size: 10,
                                                                style: {
                                                                    color: 'var(--color-text-muted)'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/CustomersView.jsx",
                                                                lineNumber: 165,
                                                                columnNumber: 25
                                                            }, this),
                                                            " ",
                                                            c.displayEmail
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/CustomersView.jsx",
                                                        lineNumber: 164,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CustomersView.jsx",
                                                lineNumber: 160,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 159,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Total Orders",
                                            style: {
                                                fontWeight: '600'
                                            },
                                            children: [
                                                c.totalOrders,
                                                " orders"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 169,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Cumulative Revenue",
                                            style: {
                                                fontWeight: '700',
                                                color: 'var(--color-accent-green)'
                                            },
                                            children: formatINR(c.totalRevenue)
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 170,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Outstanding Balance",
                                            style: {
                                                fontWeight: '700',
                                                color: c.outstanding > 0 ? '#d97706' : 'inherit'
                                            },
                                            children: formatINR(c.outstanding)
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 173,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Actions",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn-small btn-outline-small",
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                },
                                                onClick: ()=>setSelectedCust(c),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                        size: 12
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CustomersView.jsx",
                                                        lineNumber: 182,
                                                        columnNumber: 23
                                                    }, this),
                                                    " View Details"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CustomersView.jsx",
                                                lineNumber: 177,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 176,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, index, true, {
                                    fileName: "[project]/components/CustomersView.jsx",
                                    lineNumber: 154,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/CustomersView.jsx",
                            lineNumber: 145,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/CustomersView.jsx",
                    lineNumber: 134,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/CustomersView.jsx",
                lineNumber: 133,
                columnNumber: 7
            }, this),
            !flat && totalPages > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                fileName: "[project]/components/CustomersView.jsx",
                                lineNumber: 196,
                                columnNumber: 26
                            }, this),
                            " of ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: totalPages
                            }, void 0, false, {
                                fileName: "[project]/components/CustomersView.jsx",
                                lineNumber: 196,
                                columnNumber: 60
                            }, this),
                            " (",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: filteredCust.length
                            }, void 0, false, {
                                fileName: "[project]/components/CustomersView.jsx",
                                lineNumber: 196,
                                columnNumber: 91
                            }, this),
                            " total customers)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CustomersView.jsx",
                        lineNumber: 195,
                        columnNumber: 11
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
                                        fileName: "[project]/components/CustomersView.jsx",
                                        lineNumber: 205,
                                        columnNumber: 15
                                    }, this),
                                    " Previous"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CustomersView.jsx",
                                lineNumber: 199,
                                columnNumber: 13
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
                                        fileName: "[project]/components/CustomersView.jsx",
                                        lineNumber: 213,
                                        columnNumber: 20
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CustomersView.jsx",
                                lineNumber: 207,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CustomersView.jsx",
                        lineNumber: 198,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CustomersView.jsx",
                lineNumber: 194,
                columnNumber: 9
            }, this),
            selectedCust && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "modal-overlay active",
                onClick: ()=>setSelectedCust(null),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "modal-box",
                    onClick: (e)=>e.stopPropagation(),
                    style: {
                        width: '560px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "modal-header-row",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "modal-title-text",
                                    children: "Client Account Summary"
                                }, void 0, false, {
                                    fileName: "[project]/components/CustomersView.jsx",
                                    lineNumber: 224,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "modal-close-btn",
                                    onClick: ()=>setSelectedCust(null),
                                    children: "✕"
                                }, void 0, false, {
                                    fileName: "[project]/components/CustomersView.jsx",
                                    lineNumber: 225,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CustomersView.jsx",
                            lineNumber: 223,
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
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 230,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "details-value",
                                            children: selectedCust.name
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 231,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CustomersView.jsx",
                                    lineNumber: 229,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "details-row",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "details-label",
                                            children: "Total Revenue generated"
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 234,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "details-value",
                                            style: {
                                                color: 'var(--color-accent-green)',
                                                fontWeight: '800'
                                            },
                                            children: formatINR(selectedCust.totalRevenue)
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 235,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CustomersView.jsx",
                                    lineNumber: 233,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "details-row",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "details-label",
                                            children: "Phone"
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 240,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "details-value",
                                            children: selectedCust.displayPhone
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 241,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CustomersView.jsx",
                                    lineNumber: 239,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "details-row",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "details-label",
                                            children: "Email"
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 244,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "details-value",
                                            children: selectedCust.displayEmail
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 245,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CustomersView.jsx",
                                    lineNumber: 243,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "details-row details-full",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "details-label",
                                            children: "Address"
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 248,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "details-value",
                                            children: selectedCust.address || 'Address not listed'
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 249,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CustomersView.jsx",
                                    lineNumber: 247,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CustomersView.jsx",
                            lineNumber: 228,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                            style: {
                                margin: '20px 0',
                                borderColor: '#eaeaea'
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/CustomersView.jsx",
                            lineNumber: 253,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "history-layout",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            style: {
                                                fontSize: '12px',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                color: 'var(--color-text-secondary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                marginBottom: '8px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                    size: 12
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CustomersView.jsx",
                                                    lineNumber: 259,
                                                    columnNumber: 19
                                                }, this),
                                                " Orders history"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 258,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '6px',
                                                maxHeight: '160px',
                                                overflowY: 'auto',
                                                paddingRight: '4px'
                                            },
                                            children: selectedCust.ordersHistory && selectedCust.ordersHistory.length > 0 ? selectedCust.ordersHistory.map((o, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        background: '#f8f9fa',
                                                        padding: '8px',
                                                        borderRadius: '6px',
                                                        fontSize: '11.5px',
                                                        display: 'flex',
                                                        justifyContent: 'space-between'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontWeight: '600'
                                                            },
                                                            children: o.product
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CustomersView.jsx",
                                                            lineNumber: 264,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: 'var(--color-accent-teal)',
                                                                fontWeight: '700'
                                                            },
                                                            children: formatINR(o.val)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CustomersView.jsx",
                                                            lineNumber: 265,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, idx, true, {
                                                    fileName: "[project]/components/CustomersView.jsx",
                                                    lineNumber: 263,
                                                    columnNumber: 21
                                                }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: '8px',
                                                    color: '#888',
                                                    fontSize: '11px',
                                                    fontStyle: 'italic'
                                                },
                                                children: "No order history found."
                                            }, void 0, false, {
                                                fileName: "[project]/components/CustomersView.jsx",
                                                lineNumber: 268,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 261,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CustomersView.jsx",
                                    lineNumber: 257,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            style: {
                                                fontSize: '12px',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                color: 'var(--color-text-secondary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                marginBottom: '8px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__["ClipboardList"], {
                                                    size: 12
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CustomersView.jsx",
                                                    lineNumber: 275,
                                                    columnNumber: 19
                                                }, this),
                                                " Contact logs"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 274,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '6px',
                                                maxHeight: '160px',
                                                overflowY: 'auto',
                                                paddingRight: '4px'
                                            },
                                            children: selectedCust.communicationLogs && selectedCust.communicationLogs.length > 0 ? selectedCust.communicationLogs.map((log, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        background: '#f8f9fa',
                                                        padding: '8px',
                                                        borderRadius: '6px',
                                                        fontSize: '11px'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                color: 'var(--color-text-muted)',
                                                                fontWeight: '700',
                                                                marginBottom: '2px'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: log.date || log.created_at || 'Recently'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/CustomersView.jsx",
                                                                    lineNumber: 281,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: log.type || log.contactMode || 'Note'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/CustomersView.jsx",
                                                                    lineNumber: 282,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/CustomersView.jsx",
                                                            lineNumber: 280,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontStyle: 'italic'
                                                            },
                                                            children: [
                                                                '"',
                                                                log.summary || log.remarks || log.note || '',
                                                                '"'
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/CustomersView.jsx",
                                                            lineNumber: 284,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, idx, true, {
                                                    fileName: "[project]/components/CustomersView.jsx",
                                                    lineNumber: 279,
                                                    columnNumber: 21
                                                }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    padding: '8px',
                                                    color: '#888',
                                                    fontSize: '11px',
                                                    fontStyle: 'italic'
                                                },
                                                children: "No communication logs."
                                            }, void 0, false, {
                                                fileName: "[project]/components/CustomersView.jsx",
                                                lineNumber: 287,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomersView.jsx",
                                            lineNumber: 277,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CustomersView.jsx",
                                    lineNumber: 273,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CustomersView.jsx",
                            lineNumber: 256,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/CustomersView.jsx",
                    lineNumber: 222,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/CustomersView.jsx",
                lineNumber: 221,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/CustomersView.jsx",
        lineNumber: 96,
        columnNumber: 5
    }, this);
}
_s(CustomersView, "XYr1mfrvdFeiHpzgZDKdA35N6nA=");
_c = CustomersView;
var _c;
__turbopack_context__.k.register(_c, "CustomersView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/SalesProductionStatusView.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SalesProductionStatusView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.mjs [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wrench.mjs [app-client] (ecmascript) <export default as Wrench>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.mjs [app-client] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.mjs [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.mjs [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.mjs [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.mjs [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$DataTable$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/components/DataTable.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/components/StatusBadge.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
function SalesProductionStatusView(param) {
    let { orders = [], searchQuery = '' } = param;
    _s();
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('All');
    const [localSearch, setLocalSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const search = searchQuery || localSearch;
    // Filter orders by search query and active pipeline stage
    const filteredOrders = orders.filter((o)=>{
        var _o_customer;
        const custName = o.customerName || ((_o_customer = o.customer) === null || _o_customer === void 0 ? void 0 : _o_customer.name) || '';
        const matchesSearch = custName.toLowerCase().includes(search.toLowerCase()) || o.products.toLowerCase().includes(search.toLowerCase()) || o.orderNo.toLowerCase().includes(search.toLowerCase());
        const prodStatus = String(o.productionStatus || '').toLowerCase();
        const stStatus = String(o.storeStatus || '').toLowerCase();
        const qcStatus = String(o.plantHeadStatus || '').toLowerCase();
        let matchesFilter = false;
        if (filter === 'All') {
            matchesFilter = true;
        } else if (filter === 'Awaiting Materials') {
            matchesFilter = stStatus !== 'issued' && prodStatus !== 'completed' && prodStatus !== 'qc_pending' && prodStatus !== 'qc_passed';
        } else if (filter === 'Manufacturing') {
            matchesFilter = [
                'running',
                'rework',
                'hold',
                'in_production',
                'work_order_created',
                'planned'
            ].includes(prodStatus);
        } else if (filter === 'QC Inspection') {
            matchesFilter = [
                'completed',
                'qc_pending'
            ].includes(prodStatus) && [
                'pending',
                'qc rejected',
                'qc_rejected'
            ].includes(qcStatus);
        } else if (filter === 'QC Approved') {
            matchesFilter = [
                'approved',
                'qc approved',
                'qc_passed',
                'qc passed'
            ].includes(qcStatus);
        }
        return matchesSearch && matchesFilter;
    });
    // KPI Calculations
    const total = orders.length;
    const awaitingMaterials = orders.filter((o)=>{
        const stStatus = String(o.storeStatus || '').toLowerCase();
        const prodStatus = String(o.productionStatus || '').toLowerCase();
        return stStatus !== 'issued' && prodStatus !== 'completed' && prodStatus !== 'qc_pending' && prodStatus !== 'qc_passed';
    }).length;
    const runningCount = orders.filter((o)=>{
        const prodStatus = String(o.productionStatus || '').toLowerCase();
        return [
            'running',
            'rework',
            'in_production',
            'work_order_created',
            'planned'
        ].includes(prodStatus);
    }).length;
    const holdCount = orders.filter((o)=>String(o.productionStatus || '').toLowerCase() === 'hold').length;
    const completedCount = orders.filter((o)=>{
        const qcStatus = String(o.plantHeadStatus || '').toLowerCase();
        return [
            'approved',
            'qc approved',
            'qc_passed',
            'qc passed'
        ].includes(qcStatus);
    }).length;
    const getStepColor = (status)=>{
        switch(status){
            case 'completed':
                return '#22c55e'; // Green
            case 'active':
                return '#3b82f6'; // Blue
            case 'hold':
                return '#f59e0b'; // Amber
            case 'rejected':
                return '#ef4444'; // Red
            default:
                return '#D6E2F0'; // Grey
        }
    };
    const renderPipeline = (o)=>{
        const prodStatus = String(o.productionStatus || '').toLowerCase();
        const qcStatus = String(o.plantHeadStatus || '').toLowerCase();
        const dispStatus = String(o.dispatchStatus || '').toLowerCase();
        // Step 1: Order Confirm
        const s1 = 'completed';
        // Step 2: Plant Head Production
        let s2 = 'pending';
        if ([
            'completed',
            'qc_pending',
            'qc_passed',
            'qc passed'
        ].includes(prodStatus)) {
            s2 = 'completed';
        } else if ([
            'running',
            'rework',
            'in_production',
            'work_order_created',
            'planned'
        ].includes(prodStatus)) {
            s2 = 'active';
        } else if (prodStatus === 'hold') {
            s2 = 'hold';
        } else {
            s2 = 'active';
        }
        // Step 3: QC
        let s3 = 'pending';
        if ([
            'approved',
            'qc approved',
            'qc_passed',
            'qc passed'
        ].includes(qcStatus)) {
            s3 = 'completed';
        } else if ([
            'rejected',
            'qc rejected',
            'qc_rejected'
        ].includes(qcStatus)) {
            s3 = 'rejected';
        } else if (s2 === 'completed') {
            s3 = 'active';
        }
        // Step 4: Dispatch Delivered
        let s4 = 'pending';
        if (dispStatus === 'delivered' || dispStatus === 'closed') {
            s4 = 'completed';
        } else if ([
            'dispatched',
            'dispatch_created',
            'in transit',
            'in_transit'
        ].includes(dispStatus)) {
            s4 = 'active';
        } else if (s3 === 'completed') {
            s4 = 'active';
        }
        // Resolve current active stage description
        let activeText = 'Order Confirmed';
        if (s4 === 'completed') {
            activeText = 'Delivered successfully';
        } else if ([
            'dispatched',
            'dispatch_created',
            'in transit',
            'in_transit'
        ].includes(dispStatus)) {
            activeText = 'Cargo Dispatched';
        } else if (s3 === 'completed') {
            activeText = 'QC Approved - Awaiting Dispatch';
        } else if (s3 === 'rejected') {
            activeText = 'QC Rejected - Floor Rework';
        } else if (s3 === 'active') {
            activeText = 'QC Inspection queue';
        } else if (prodStatus === 'hold') {
            activeText = 'Assembly floor on Hold';
        } else if ([
            'running',
            'in_production',
            'work_order_created',
            'planned'
        ].includes(prodStatus)) {
            activeText = 'Manufacturing Floor execution';
        }
        const renderStep = (status, titleText)=>{
            const color = getStepColor(status);
            const isCompleted = status === 'completed';
            const isActive = status === 'active';
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    zIndex: 2,
                    position: 'relative',
                    boxShadow: isActive ? '0 0 8px rgba(59, 130, 246, 0.6)' : 'none',
                    cursor: 'help'
                },
                title: titleText,
                children: isCompleted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                    size: 12,
                    strokeWidth: 3
                }, void 0, false, {
                    fileName: "[project]/components/SalesProductionStatusView.jsx",
                    lineNumber: 148,
                    columnNumber: 26
                }, this) : null
            }, void 0, false, {
                fileName: "[project]/components/SalesProductionStatusView.jsx",
                lineNumber: 131,
                columnNumber: 9
            }, this);
        };
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                width: '220px'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative',
                        width: '100%',
                        padding: '0 8px'
                    },
                    children: [
                        renderStep(s1, 'Order Confirm (automatically marked completed as the order exists)'),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                flex: 1,
                                height: '3px',
                                background: s2 !== 'pending' ? getStepColor(s2 === 'completed' ? 'completed' : 'active') : '#D6E2F0',
                                zIndex: 1,
                                margin: '0 -2px'
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/SalesProductionStatusView.jsx",
                            lineNumber: 159,
                            columnNumber: 11
                        }, this),
                        renderStep(s2, "Plant Head Production (reflects floor assembly and manufacturing status): ".concat(o.productionStatus || 'Pending')),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                flex: 1,
                                height: '3px',
                                background: s3 !== 'pending' ? getStepColor(s3 === 'completed' ? 'completed' : 'active') : '#D6E2F0',
                                zIndex: 1,
                                margin: '0 -2px'
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/SalesProductionStatusView.jsx",
                            lineNumber: 164,
                            columnNumber: 11
                        }, this),
                        renderStep(s3, "QC (reflects final quality check approvals): ".concat(o.plantHeadStatus || 'Pending')),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                flex: 1,
                                height: '3px',
                                background: s4 !== 'pending' ? getStepColor(s4 === 'completed' ? 'completed' : 'active') : '#D6E2F0',
                                zIndex: 1,
                                margin: '0 -2px'
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/SalesProductionStatusView.jsx",
                            lineNumber: 169,
                            columnNumber: 11
                        }, this),
                        renderStep(s4, "Dispatch Delivered (reflects cargo logistics dispatching and final receipt): ".concat(o.dispatchStatus || 'Pending'))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/SalesProductionStatusView.jsx",
                    lineNumber: 155,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    style: {
                        fontSize: '11px',
                        fontWeight: '700',
                        color: 'var(--color-text-secondary)',
                        display: 'block',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden'
                    },
                    children: activeText
                }, void 0, false, {
                    fileName: "[project]/components/SalesProductionStatusView.jsx",
                    lineNumber: 175,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/SalesProductionStatusView.jsx",
            lineNumber: 154,
            columnNumber: 7
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '100%'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "finance-grid",
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '20px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "app-card",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "card-sub-label",
                                            children: "Total Orders"
                                        }, void 0, false, {
                                            fileName: "[project]/components/SalesProductionStatusView.jsx",
                                            lineNumber: 189,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "card-value-lg",
                                            children: total
                                        }, void 0, false, {
                                            fileName: "[project]/components/SalesProductionStatusView.jsx",
                                            lineNumber: 190,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SalesProductionStatusView.jsx",
                                    lineNumber: 188,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        color: '#2563eb',
                                        padding: '8px',
                                        borderRadius: '8px'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                        size: 20
                                    }, void 0, false, {
                                        fileName: "[project]/components/SalesProductionStatusView.jsx",
                                        lineNumber: 193,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/SalesProductionStatusView.jsx",
                                    lineNumber: 192,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/SalesProductionStatusView.jsx",
                            lineNumber: 187,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/SalesProductionStatusView.jsx",
                        lineNumber: 186,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "app-card",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "card-sub-label",
                                            children: "Awaiting Materials"
                                        }, void 0, false, {
                                            fileName: "[project]/components/SalesProductionStatusView.jsx",
                                            lineNumber: 201,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "card-value-lg",
                                            style: {
                                                color: awaitingMaterials > 0 ? 'var(--color-accent-purple)' : 'inherit'
                                            },
                                            children: awaitingMaterials
                                        }, void 0, false, {
                                            fileName: "[project]/components/SalesProductionStatusView.jsx",
                                            lineNumber: 202,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SalesProductionStatusView.jsx",
                                    lineNumber: 200,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: 'rgba(168, 85, 247, 0.1)',
                                        color: '#a855f7',
                                        padding: '8px',
                                        borderRadius: '8px'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                                        size: 20
                                    }, void 0, false, {
                                        fileName: "[project]/components/SalesProductionStatusView.jsx",
                                        lineNumber: 205,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/SalesProductionStatusView.jsx",
                                    lineNumber: 204,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/SalesProductionStatusView.jsx",
                            lineNumber: 199,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/SalesProductionStatusView.jsx",
                        lineNumber: 198,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "app-card",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "card-sub-label",
                                            children: "Active Floor Execution"
                                        }, void 0, false, {
                                            fileName: "[project]/components/SalesProductionStatusView.jsx",
                                            lineNumber: 213,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "card-value-lg",
                                            style: {
                                                color: '#2563eb'
                                            },
                                            children: runningCount
                                        }, void 0, false, {
                                            fileName: "[project]/components/SalesProductionStatusView.jsx",
                                            lineNumber: 214,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SalesProductionStatusView.jsx",
                                    lineNumber: 212,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        color: '#3b82f6',
                                        padding: '8px',
                                        borderRadius: '8px'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__["Wrench"], {
                                        size: 20
                                    }, void 0, false, {
                                        fileName: "[project]/components/SalesProductionStatusView.jsx",
                                        lineNumber: 217,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/SalesProductionStatusView.jsx",
                                    lineNumber: 216,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/SalesProductionStatusView.jsx",
                            lineNumber: 211,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/SalesProductionStatusView.jsx",
                        lineNumber: 210,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "app-card",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "card-sub-label",
                                            children: "Manufacturing On Hold"
                                        }, void 0, false, {
                                            fileName: "[project]/components/SalesProductionStatusView.jsx",
                                            lineNumber: 225,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "card-value-lg",
                                            style: {
                                                color: holdCount > 0 ? '#ea580c' : 'inherit'
                                            },
                                            children: holdCount
                                        }, void 0, false, {
                                            fileName: "[project]/components/SalesProductionStatusView.jsx",
                                            lineNumber: 226,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SalesProductionStatusView.jsx",
                                    lineNumber: 224,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: 'rgba(234, 88, 12, 0.1)',
                                        color: '#ea580c',
                                        padding: '8px',
                                        borderRadius: '8px'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                        size: 20
                                    }, void 0, false, {
                                        fileName: "[project]/components/SalesProductionStatusView.jsx",
                                        lineNumber: 229,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/SalesProductionStatusView.jsx",
                                    lineNumber: 228,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/SalesProductionStatusView.jsx",
                            lineNumber: 223,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/SalesProductionStatusView.jsx",
                        lineNumber: 222,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "app-card",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "card-sub-label",
                                            children: "QC Approved / Ready"
                                        }, void 0, false, {
                                            fileName: "[project]/components/SalesProductionStatusView.jsx",
                                            lineNumber: 237,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "card-value-lg",
                                            style: {
                                                color: '#16a34a'
                                            },
                                            children: completedCount
                                        }, void 0, false, {
                                            fileName: "[project]/components/SalesProductionStatusView.jsx",
                                            lineNumber: 238,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/SalesProductionStatusView.jsx",
                                    lineNumber: 236,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: 'rgba(22, 163, 74, 0.1)',
                                        color: '#16a34a',
                                        padding: '8px',
                                        borderRadius: '8px'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                        size: 20
                                    }, void 0, false, {
                                        fileName: "[project]/components/SalesProductionStatusView.jsx",
                                        lineNumber: 241,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/SalesProductionStatusView.jsx",
                                    lineNumber: 240,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/SalesProductionStatusView.jsx",
                            lineNumber: 235,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/SalesProductionStatusView.jsx",
                        lineNumber: 234,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/SalesProductionStatusView.jsx",
                lineNumber: 185,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                children: "Order Production Pipelines"
                            }, void 0, false, {
                                fileName: "[project]/components/SalesProductionStatusView.jsx",
                                lineNumber: 250,
                                columnNumber: 11
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
                                            'Awaiting Materials',
                                            'Manufacturing',
                                            'QC Inspection',
                                            'QC Approved'
                                        ].map((st)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "filter-pill ".concat(filter === st ? 'active' : ''),
                                                onClick: ()=>setFilter(st),
                                                style: {
                                                    color: filter === st ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                                                },
                                                children: st
                                            }, st, false, {
                                                fileName: "[project]/components/SalesProductionStatusView.jsx",
                                                lineNumber: 256,
                                                columnNumber: 17
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/SalesProductionStatusView.jsx",
                                        lineNumber: 254,
                                        columnNumber: 13
                                    }, this),
                                    !searchQuery && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                                fileName: "[project]/components/SalesProductionStatusView.jsx",
                                                lineNumber: 270,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                placeholder: "Search pipeline...",
                                                value: localSearch,
                                                onChange: (e)=>setLocalSearch(e.target.value),
                                                style: {
                                                    color: 'var(--color-text-primary)'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/SalesProductionStatusView.jsx",
                                                lineNumber: 271,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/SalesProductionStatusView.jsx",
                                        lineNumber: 269,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/SalesProductionStatusView.jsx",
                                lineNumber: 252,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/SalesProductionStatusView.jsx",
                        lineNumber: 249,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$DataTable$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        columns: [
                            {
                                header: 'Order ID',
                                accessor: 'orderNo',
                                render: (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        style: {
                                            color: 'var(--color-accent-teal)'
                                        },
                                        children: row.orderNo
                                    }, void 0, false, {
                                        fileName: "[project]/components/SalesProductionStatusView.jsx",
                                        lineNumber: 285,
                                        columnNumber: 73
                                    }, void 0)
                            },
                            {
                                header: 'Customer',
                                accessor: 'customerName',
                                render: (row)=>{
                                    var _row_customer;
                                    return row.customerName || ((_row_customer = row.customer) === null || _row_customer === void 0 ? void 0 : _row_customer.name);
                                }
                            },
                            {
                                header: 'Products / Items',
                                accessor: 'products'
                            },
                            {
                                header: 'Store Release',
                                accessor: 'storeStatus',
                                render: (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        status: row.storeStatus
                                    }, void 0, false, {
                                        fileName: "[project]/components/SalesProductionStatusView.jsx",
                                        lineNumber: 288,
                                        columnNumber: 82
                                    }, void 0)
                            },
                            {
                                header: 'Quality Check',
                                accessor: 'plantHeadStatus',
                                render: (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        status: row.plantHeadStatus
                                    }, void 0, false, {
                                        fileName: "[project]/components/SalesProductionStatusView.jsx",
                                        lineNumber: 289,
                                        columnNumber: 86
                                    }, void 0)
                            },
                            {
                                header: 'Pipeline Progress',
                                accessor: 'productionStatus',
                                render: (row)=>renderPipeline(row)
                            }
                        ],
                        data: filteredOrders,
                        searchQuery: search,
                        searchField: "customerName",
                        emptyMessage: "No active order pipeline logs match the selected filter."
                    }, void 0, false, {
                        fileName: "[project]/components/SalesProductionStatusView.jsx",
                        lineNumber: 283,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/SalesProductionStatusView.jsx",
                lineNumber: 248,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/SalesProductionStatusView.jsx",
        lineNumber: 183,
        columnNumber: 5
    }, this);
}
_s(SalesProductionStatusView, "8tyI0dXhTW+BL1f8fexX8kTK8l8=");
_c = SalesProductionStatusView;
var _c;
__turbopack_context__.k.register(_c, "SalesProductionStatusView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/tasks/TaskCard.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TaskCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/phone.mjs [app-client] (ecmascript) <export default as Phone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.mjs [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.mjs [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.mjs [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flask-conical.mjs [app-client] (ecmascript) <export default as FlaskConical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.mjs [app-client] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/credit-card.mjs [app-client] (ecmascript) <export default as CreditCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/box.mjs [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wrench.mjs [app-client] (ecmascript) <export default as Wrench>");
;
;
;
const TYPE_CONFIG = {
    Lead: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__["Phone"],
        badgeClass: 'badge-follow-up',
        color: '#d97706',
        bgColor: 'rgba(217, 119, 6, 0.08)'
    },
    Sample: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__["FlaskConical"],
        badgeClass: 'badge-sent',
        color: '#0284c7',
        bgColor: 'rgba(2, 132, 199, 0.08)'
    },
    Quotation: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
        badgeClass: 'badge-new',
        color: '#1e40af',
        bgColor: 'rgba(30, 64, 175, 0.08)'
    },
    Order: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"],
        badgeClass: 'badge-confirmed',
        color: '#4338ca',
        bgColor: 'rgba(67, 56, 202, 0.08)'
    },
    Production: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__["Wrench"],
        badgeClass: 'badge-processing',
        color: '#b45309',
        bgColor: 'rgba(180, 83, 9, 0.08)'
    },
    Payment: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"],
        badgeClass: 'badge-outstanding',
        color: '#dc2626',
        bgColor: 'rgba(220, 38, 38, 0.08)'
    }
};
function TaskCard(param) {
    let { task, onDone, onReschedule } = param;
    const config = TYPE_CONFIG[task.type] || {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"],
        badgeClass: 'badge-pending',
        color: '#4b5563',
        bgColor: 'rgba(75, 85, 99, 0.08)'
    };
    const IconComponent = config.icon;
    const isOverdue = task.status === 'Overdue';
    const formatAmount = (val)=>{
        if (!val) return null;
        if (val >= 100000) return "₹".concat((val / 100000).toFixed(2), " L");
        return "₹".concat(val.toLocaleString('en-IN'));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "app-card task-card ".concat(isOverdue ? 'task-card-overdue' : ''),
        style: {
            padding: '10px 14px',
            borderRadius: '14px',
            border: '1px solid var(--color-border)',
            borderLeft: isOverdue ? '4px solid #ef4444' : "4px solid ".concat(config.color),
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxShadow: isOverdue ? '0 4px 20px rgba(239, 68, 68, 0.05)' : 'var(--shadow-card)',
            transition: 'var(--transition-smooth)',
            position: 'relative'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "badge ".concat(config.badgeClass),
                        style: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontWeight: '800',
                            fontSize: '9.5px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            padding: '3px 6px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(IconComponent, {
                                size: 9,
                                style: {
                                    strokeWidth: 3
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/tasks/TaskCard.jsx",
                                lineNumber: 94,
                                columnNumber: 11
                            }, this),
                            task.type
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tasks/TaskCard.jsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this),
                    isOverdue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "badge badge-overdue animate-pulse",
                        style: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: '800',
                            fontSize: '9.5px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            padding: '3px 6px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                size: 9,
                                style: {
                                    strokeWidth: 3
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/tasks/TaskCard.jsx",
                                lineNumber: 112,
                                columnNumber: 13
                            }, this),
                            "Overdue"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tasks/TaskCard.jsx",
                        lineNumber: 99,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tasks/TaskCard.jsx",
                lineNumber: 80,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        style: {
                            fontSize: '14px',
                            fontWeight: '800',
                            color: 'var(--color-text-primary)',
                            letterSpacing: '-0.3px',
                            marginBottom: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: task.clientName
                            }, void 0, false, {
                                fileName: "[project]/components/tasks/TaskCard.jsx",
                                lineNumber: 132,
                                columnNumber: 11
                            }, this),
                            task.amount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: '13px',
                                    fontWeight: '800',
                                    color: config.color
                                },
                                children: formatAmount(task.amount)
                            }, void 0, false, {
                                fileName: "[project]/components/tasks/TaskCard.jsx",
                                lineNumber: 134,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tasks/TaskCard.jsx",
                        lineNumber: 120,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: '12px',
                            color: 'var(--color-text-secondary)',
                            lineHeight: '1.35',
                            fontWeight: '500',
                            whiteSpace: 'pre-wrap',
                            margin: '0'
                        },
                        children: task.notes
                    }, void 0, false, {
                        fileName: "[project]/components/tasks/TaskCard.jsx",
                        lineNumber: 139,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tasks/TaskCard.jsx",
                lineNumber: 119,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '10.5px',
                    color: isOverdue ? '#ef4444' : 'var(--color-text-muted)',
                    fontWeight: '700'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                        size: 11
                    }, void 0, false, {
                        fileName: "[project]/components/tasks/TaskCard.jsx",
                        lineNumber: 164,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            "Action Date: ",
                            task.followUpDate
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tasks/TaskCard.jsx",
                        lineNumber: 165,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tasks/TaskCard.jsx",
                lineNumber: 154,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "task-actions",
                style: {
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '6px',
                    marginTop: '0px',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '6px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "btn-small btn-outline-small task-card-btn",
                        style: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            borderColor: 'var(--color-border)',
                            fontWeight: '700',
                            padding: '5px 10px',
                            minWidth: '85px',
                            flex: 'none'
                        },
                        onClick: ()=>onReschedule(task),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                size: 10,
                                strokeWidth: 2.5
                            }, void 0, false, {
                                fileName: "[project]/components/tasks/TaskCard.jsx",
                                lineNumber: 197,
                                columnNumber: 11
                            }, this),
                            "Reschedule"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tasks/TaskCard.jsx",
                        lineNumber: 181,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: "btn-small btn-primary-small task-card-btn",
                        style: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            background: 'var(--color-lime-brand)',
                            border: 'none',
                            color: 'var(--color-text-primary)',
                            fontWeight: '800',
                            boxShadow: 'none',
                            padding: '5px 10px',
                            minWidth: '85px',
                            flex: 'none'
                        },
                        onClick: ()=>onDone(task),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                size: 10,
                                strokeWidth: 3
                            }, void 0, false, {
                                fileName: "[project]/components/tasks/TaskCard.jsx",
                                lineNumber: 220,
                                columnNumber: 11
                            }, this),
                            "Done"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/tasks/TaskCard.jsx",
                        lineNumber: 201,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/tasks/TaskCard.jsx",
                lineNumber: 169,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/tasks/TaskCard.jsx",
        lineNumber: 61,
        columnNumber: 5
    }, this);
}
_c = TaskCard;
var _c;
__turbopack_context__.k.register(_c, "TaskCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/DailyTaskView.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DailyTaskView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$taskEngine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/utils/taskEngine.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tasks$2f$TaskCard$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/tasks/TaskCard.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clipboard-list.mjs [app-client] (ecmascript) <export default as ClipboardList>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.mjs [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.mjs [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.mjs [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.mjs [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.mjs [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.all.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
function DailyTaskView(param) {
    let { state, dispatch, navigate, showToast, module = 'Sales' } = param;
    _s();
    const [targetDate, setTargetDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('2026-06-15');
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('All');
    // Modals state
    const [rescheduleTask, setRescheduleTask] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [rescheduleDate, setRescheduleDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const leads = (state === null || state === void 0 ? void 0 : state.leads) || [];
    const quotations = (state === null || state === void 0 ? void 0 : state.quotations) || [];
    const baseDateTime = new Date(targetDate + 'T00:00:00').getTime();
    const atRiskLeads = leads.filter((l)=>{
        if (!l.followUpDate) return false;
        const fup = new Date(l.followUpDate).getTime();
        return fup <= baseDateTime && l.status !== 'Converted' && l.status !== 'Lost';
    });
    const atRiskQuotes = quotations.filter((q)=>{
        if (!q.validTill) return false;
        const expiry = new Date(q.validTill).getTime();
        return expiry <= baseDateTime + 86400000 * 2 && q.status !== 'Approved' && q.status !== 'Closed';
    });
    // 1. Generate tasks
    let rawTasks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$utils$2f$taskEngine$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateTasks"])(state, targetDate);
    // Filter based on module before counting stats
    if (module === 'Finance') {
        rawTasks = rawTasks.filter((t)=>[
                'Payment',
                'Order',
                'Production'
            ].includes(t.type));
    } else if (module === 'Sales') {
        rawTasks = rawTasks.filter((t)=>[
                'Lead',
                'Quotation',
                'Sample'
            ].includes(t.type));
    }
    // 2. Count metrics for the selected target date
    const totalTasks = rawTasks.length;
    const overdueTasksCount = rawTasks.filter((t)=>t.status === 'Overdue').length;
    // Calculate completed tasks from raw data
    // Completed leads have status 'Converted' or status 'Lost' or their followUpDate is cleared
    // Let's also fetch completed samples/orders. To make it dynamic, let's keep a local mock/real counter of completed tasks during this session.
    const [completedSessionTasks, setCompletedSessionTasks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const activeTasks = rawTasks.filter((t)=>!completedSessionTasks.includes(t.id));
    const completedCount = completedSessionTasks.length;
    const highPriorityCount = activeTasks.filter((t)=>t.status === 'Overdue' || t.type === 'Payment').length;
    // Filter tasks based on Search Query and Tab selection
    const filteredTasks = activeTasks.filter((task)=>{
        var _task_clientName, _task_notes;
        const sq = (searchQuery || '').toLowerCase();
        const matchesSearch = ((_task_clientName = task.clientName) === null || _task_clientName === void 0 ? void 0 : _task_clientName.toLowerCase().includes(sq)) || false || ((_task_notes = task.notes) === null || _task_notes === void 0 ? void 0 : _task_notes.toLowerCase().includes(sq)) || false;
        let matchesTab = false;
        if (activeTab === 'All') {
            matchesTab = true;
        } else if (activeTab === 'Leads' && task.type === 'Lead') {
            matchesTab = true;
        } else if (activeTab === 'Quotations' && task.type === 'Quotation') {
            matchesTab = true;
        } else if (activeTab === 'Payments' && task.type === 'Payment') {
            matchesTab = true;
        } else if (activeTab === 'Orders' && (task.type === 'Order' || task.type === 'Production')) {
            matchesTab = true;
        } else if (activeTab === 'Samples' && task.type === 'Sample') {
            matchesTab = true;
        }
        return matchesSearch && matchesTab;
    });
    // Action: Mark task completed
    const handleDone = (task)=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Complete Task?',
            text: "Mark this ".concat(task.type, ' task for "').concat(task.clientName, '" as resolved?'),
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'Yes, Complete',
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
                executeCompleteAction(task.id, 'Task marked completed');
            }
        });
    };
    const executeCompleteAction = (taskId, notes)=>{
        const prefix = taskId.split('-')[0];
        const sourceId = taskId.replace("".concat(prefix, "-"), '');
        if (prefix === 'LD') {
            var _state_sales;
            // Clear lead follow-up date and log completion in timeline
            const lead = (((_state_sales = state.sales) === null || _state_sales === void 0 ? void 0 : _state_sales.leads) || []).find((l)=>String(l.id) === sourceId);
            if (lead) {
                const updatedTimeline = [
                    ...lead.timeline || [],
                    {
                        stage: 'Follow-up Completed',
                        text: notes,
                        date: targetDate,
                        timestamp: Date.now()
                    }
                ];
                dispatch({
                    type: 'UPDATE_LEAD',
                    payload: {
                        id: Number(sourceId),
                        followUpDate: null,
                        timeline: updatedTimeline
                    }
                });
            }
        } else if (prefix === 'SMP') {
            // Clear sample follow-up
            dispatch({
                type: 'UPDATE_SAMPLE',
                payload: {
                    id: Number(sourceId),
                    followUpDate: null,
                    status: 'Approved'
                }
            });
        } else if (prefix === 'QT') {
            // Clear quotation follow-up
            dispatch({
                type: 'UPDATE_QUOTATION',
                payload: {
                    id: Number(sourceId),
                    followUpDate: null,
                    status: 'Sent'
                }
            });
        } else if (prefix === 'ORD') {
            // Confirm the order
            dispatch({
                type: 'UPDATE_ORDER',
                payload: {
                    orderNo: sourceId,
                    status: 'Created',
                    salesStatus: 'Confirmed',
                    overallStage: 'Created',
                    currentDepartment: 'Plant Head',
                    timeline: [
                        {
                            stage: 'Created',
                            timestamp: Date.now(),
                            remarks: 'Purchase order confirmed by Sales via Daily Tasks'
                        }
                    ]
                }
            });
        } else if (prefix === 'PROD') {
            // Clear delivery date (marked completed)
            dispatch({
                type: 'UPDATE_ORDER',
                payload: {
                    orderNo: sourceId,
                    deliveryDate: null,
                    productionStatus: 'Completed',
                    overallStage: 'Production Completed'
                }
            });
        } else if (prefix === 'PM') {
            var _state_payments_find;
            // Set payment status as paid
            dispatch({
                type: 'RECEIVE_PAYMENT',
                payload: {
                    paymentUpdate: {
                        id: Number(sourceId),
                        status: 'Paid',
                        verified: 'Verified',
                        paidAmount: ((_state_payments_find = state.payments.find((p)=>String(p.id) === String(sourceId))) === null || _state_payments_find === void 0 ? void 0 : _state_payments_find.totalAmount) || 0
                    }
                }
            });
        }
        setCompletedSessionTasks([
            ...completedSessionTasks,
            taskId
        ]);
        showToast("Task ".concat(taskId, " completed successfully!"));
    };
    // Action: Reschedule task
    const handleRescheduleClick = (task)=>{
        setRescheduleTask(task);
        setRescheduleDate(task.followUpDate || targetDate);
    };
    const handleRescheduleSubmit = (e)=>{
        e.preventDefault();
        if (!rescheduleDate || !rescheduleTask) return;
        const taskId = rescheduleTask.id;
        const prefix = taskId.split('-')[0];
        const sourceId = taskId.replace("".concat(prefix, "-"), '');
        if (prefix === 'LD') {
            dispatch({
                type: 'UPDATE_LEAD',
                payload: {
                    id: Number(sourceId),
                    followUpDate: rescheduleDate
                }
            });
        } else if (prefix === 'SMP') {
            dispatch({
                type: 'UPDATE_SAMPLE',
                payload: {
                    id: Number(sourceId),
                    followUpDate: rescheduleDate
                }
            });
        } else if (prefix === 'QT') {
            dispatch({
                type: 'UPDATE_QUOTATION',
                payload: {
                    id: Number(sourceId),
                    followUpDate: rescheduleDate
                }
            });
        } else if (prefix === 'ORD') {
            dispatch({
                type: 'UPDATE_ORDER',
                payload: {
                    orderNo: sourceId,
                    date: rescheduleDate
                }
            });
        } else if (prefix === 'PROD') {
            dispatch({
                type: 'UPDATE_ORDER',
                payload: {
                    orderNo: sourceId,
                    deliveryDate: rescheduleDate
                }
            });
        } else if (prefix === 'PM') {
            dispatch({
                type: 'RECEIVE_PAYMENT',
                payload: {
                    paymentUpdate: {
                        id: Number(sourceId),
                        dueDate: rescheduleDate
                    }
                }
            });
        }
        showToast("Task rescheduled to ".concat(rescheduleDate));
        setRescheduleTask(null);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "daily-task-viewport",
        style: {
            paddingBottom: '40px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                dangerouslySetInnerHTML: {
                    __html: "\n        .daily-task-stats-grid {\n          display: grid;\n          grid-template-columns: repeat(4, 1fr);\n          gap: 16px;\n          margin-bottom: 24px;\n        }\n        .daily-task-visuals-grid {\n          display: grid;\n          grid-template-columns: 1fr 1.5fr 1fr;\n          gap: 20px;\n          margin-bottom: 24px;\n        }\n        .tasks-layout-row {\n          display: grid;\n          grid-template-columns: 2.2fr 1fr;\n          gap: 24px;\n        }\n        .task-grid-container {\n          display: grid;\n          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));\n          gap: 16px;\n        }\n        .task-card {\n          max-width: 480px;\n          width: 100%;\n        }\n        .task-card-btn {\n          width: auto !important;\n          flex: 0 0 auto !important;\n          min-width: 85px !important;\n          padding: 5px 12px !important;\n          height: 30px !important;\n          font-size: 11px !important;\n          display: inline-flex !important;\n          align-items: center !important;\n          justify-content: center !important;\n        }\n        @media (max-width: 1024px) {\n          .daily-task-stats-grid { grid-template-columns: repeat(2, 1fr); }\n          .daily-task-visuals-grid { grid-template-columns: 1fr; }\n          .tasks-layout-row { grid-template-columns: 1fr; }\n        }\n        @media (max-width: 768px) {\n          .daily-task-viewport {\n            padding-left: 16px !important;\n            padding-right: 16px !important;\n            padding-top: 16px !important;\n          }\n          .daily-task-viewport .hero-banner.compact {\n            margin: 0 0 16px 0 !important;\n            width: 100% !important;\n          }\n          .daily-task-stats-grid {\n            gap: 12px !important;\n          }\n          .stats-card {\n            padding: 12px 16px !important;\n          }\n          .hero-banner.compact .hero-top-row, .hero-top-row {\n            flex-direction: column !important;\n            align-items: flex-start !important;\n            gap: 16px !important;\n          }\n          .hero-top-row > div {\n            width: 100% !important;\n          }\n        }\n        @media (max-width: 480px) {\n          .daily-task-stats-grid { \n            grid-template-columns: repeat(2, 1fr) !important; \n          }\n          .stats-card {\n            padding: 10px 14px !important;\n          }\n          .task-actions {\n            flex-direction: column !important;\n            gap: 6px !important;\n          }\n          .task-card-btn {\n            width: 100% !important;\n            flex: 1 1 auto !important;\n            padding: 8px 12px !important;\n            height: 36px !important;\n            font-size: 12.5px !important;\n          }\n        }\n        .filter-tab-bar {\n          display: flex;\n          gap: 8px;\n          background: #f1f3f5;\n          padding: 6px;\n          border-radius: 12px;\n          overflow-x: auto;\n          margin-bottom: 16px;\n        }\n        .filter-tab-bar::-webkit-scrollbar { display: none; }\n        .filter-tab-btn {\n          padding: 8px 16px;\n          border-radius: 8px;\n          border: 1px solid transparent;\n          font-size: 12px;\n          font-weight: 700;\n          color: var(--color-text-secondary);\n          background: transparent;\n          cursor: pointer;\n          transition: all 0.2s ease;\n          white-space: nowrap;\n        }\n        .filter-tab-btn:hover {\n          color: var(--color-text-primary);\n          background: rgba(0, 0, 0, 0.04);\n        }\n        .filter-tab-btn.active {\n          box-shadow: 0 2px 6px rgba(0,0,0,0.06);\n        }\n        .card-visual-container {\n          display: flex;\n          align-items: center;\n          justify-content: center;\n          padding: 10px 0;\n          min-height: 120px;\n        }\n        .heatmap-square {\n          width: 28px;\n          height: 28px;\n          border-radius: 6px;\n          display: flex;\n          align-items: center;\n          justify-content: center;\n          font-size: 10px;\n          font-weight: 800;\n          cursor: pointer;\n          transition: all 0.2s ease;\n          position: relative;\n        }\n        .heatmap-square:hover {\n          transform: scale(1.1);\n          box-shadow: 0 4px 10px rgba(0,0,0,0.1);\n        }\n        .tooltip-custom {\n          display: none;\n          position: absolute;\n          bottom: 34px;\n          left: 50%;\n          transform: translateX(-50%);\n          background: #000000;\n          color: #ffffff;\n          padding: 4px 8px;\n          border-radius: 4px;\n          font-size: 9px;\n          white-space: nowrap;\n          z-index: 100;\n          box-shadow: 0 2px 8px rgba(0,0,0,0.15);\n        }\n        .tooltip-custom::after {\n          content: '';\n          position: absolute;\n          top: 100%;\n          left: 50%;\n          transform: translateX(-50%);\n          border-width: 4px;\n          border-style: solid;\n          border-color: #000000 transparent transparent transparent;\n        }\n        .heatmap-square:hover .tooltip-custom {\n          display: block;\n        }\n        .animate-pulse {\n          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;\n        }\n        @keyframes pulse {\n          0%, 100% { opacity: 1; }\n          50% { opacity: .5; }\n        }\n      "
                }
            }, void 0, false, {
                fileName: "[project]/components/DailyTaskView.jsx",
                lineNumber: 243,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hero-banner compact",
                style: {
                    minHeight: 'auto'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "hero-top-row",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: '12px',
                                        fontWeight: '800',
                                        textTransform: 'uppercase',
                                        color: 'var(--color-lime-brand)',
                                        letterSpacing: '1px'
                                    },
                                    children: "Sales Operations Hub"
                                }, void 0, false, {
                                    fileName: "[project]/components/DailyTaskView.jsx",
                                    lineNumber: 424,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "brand-title",
                                    style: {
                                        fontSize: '26px',
                                        marginTop: '4px'
                                    },
                                    children: "🎯 Daily Action Center"
                                }, void 0, false, {
                                    fileName: "[project]/components/DailyTaskView.jsx",
                                    lineNumber: 427,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        color: 'rgba(255,255,255,0.7)',
                                        fontSize: '13px',
                                        marginTop: '4px',
                                        fontWeight: '500'
                                    },
                                    children: "Data-driven follow-ups, confirmation checks, sample feedback, and outstanding receipts."
                                }, void 0, false, {
                                    fileName: "[project]/components/DailyTaskView.jsx",
                                    lineNumber: 430,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DailyTaskView.jsx",
                            lineNumber: 423,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(255,255,255,0.15)',
                                padding: '6px 12px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                width: 'fit-content'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                    size: 14,
                                    style: {
                                        color: '#fff'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/DailyTaskView.jsx",
                                    lineNumber: 446,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        color: '#fff',
                                        fontSize: '12.5px',
                                        fontWeight: '700'
                                    },
                                    children: "Schedule Date:"
                                }, void 0, false, {
                                    fileName: "[project]/components/DailyTaskView.jsx",
                                    lineNumber: 447,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "date",
                                    value: targetDate,
                                    onChange: (e)=>{
                                        setTargetDate(e.target.value);
                                        setCompletedSessionTasks([]); // Reset completions for new date
                                    },
                                    style: {
                                        border: 'none',
                                        background: 'transparent',
                                        color: '#ffffff',
                                        fontWeight: '800',
                                        fontSize: '12.5px',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/DailyTaskView.jsx",
                                    lineNumber: 448,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DailyTaskView.jsx",
                            lineNumber: 436,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DailyTaskView.jsx",
                    lineNumber: 422,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/DailyTaskView.jsx",
                lineNumber: 421,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "daily-task-stats-grid",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "app-card stats-card",
                        style: {
                            padding: '16px 20px',
                            borderRadius: '20px',
                            background: '#ffffff',
                            border: '1px solid var(--color-border)'
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
                                        style: {
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            color: 'var(--color-text-secondary)',
                                            textTransform: 'uppercase'
                                        },
                                        children: "Today's Tasks"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DailyTaskView.jsx",
                                        lineNumber: 473,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: 'rgba(51, 122, 134, 0.1)',
                                            color: 'var(--color-accent-teal)',
                                            padding: '6px',
                                            borderRadius: '50%'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__["ClipboardList"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/components/DailyTaskView.jsx",
                                            lineNumber: 475,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/DailyTaskView.jsx",
                                        lineNumber: 474,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DailyTaskView.jsx",
                                lineNumber: 472,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: '12px'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: '28px',
                                        fontWeight: '800',
                                        color: 'var(--color-text-primary)',
                                        letterSpacing: '-1px'
                                    },
                                    children: totalTasks
                                }, void 0, false, {
                                    fileName: "[project]/components/DailyTaskView.jsx",
                                    lineNumber: 479,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/DailyTaskView.jsx",
                                lineNumber: 478,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DailyTaskView.jsx",
                        lineNumber: 471,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "app-card stats-card",
                        style: {
                            padding: '16px 20px',
                            borderRadius: '20px',
                            background: '#ffffff',
                            border: '1px solid var(--color-border)'
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
                                        style: {
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            color: 'var(--color-text-secondary)',
                                            textTransform: 'uppercase'
                                        },
                                        children: "High Priority"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DailyTaskView.jsx",
                                        lineNumber: 487,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: '#dc2626',
                                            padding: '6px',
                                            borderRadius: '50%'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/components/DailyTaskView.jsx",
                                            lineNumber: 489,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/DailyTaskView.jsx",
                                        lineNumber: 488,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DailyTaskView.jsx",
                                lineNumber: 486,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: '12px'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: '28px',
                                        fontWeight: '800',
                                        color: '#dc2626',
                                        letterSpacing: '-1px'
                                    },
                                    children: highPriorityCount
                                }, void 0, false, {
                                    fileName: "[project]/components/DailyTaskView.jsx",
                                    lineNumber: 493,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/DailyTaskView.jsx",
                                lineNumber: 492,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DailyTaskView.jsx",
                        lineNumber: 485,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "app-card stats-card",
                        style: {
                            padding: '16px 20px',
                            borderRadius: '20px',
                            background: '#ffffff',
                            border: '1px solid var(--color-border)'
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
                                        style: {
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            color: 'var(--color-text-secondary)',
                                            textTransform: 'uppercase'
                                        },
                                        children: "Overdue Action"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DailyTaskView.jsx",
                                        lineNumber: 501,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: '#ef4444',
                                            padding: '6px',
                                            borderRadius: '50%'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                            size: 16,
                                            className: overdueTasksCount > 0 ? 'animate-pulse' : ''
                                        }, void 0, false, {
                                            fileName: "[project]/components/DailyTaskView.jsx",
                                            lineNumber: 503,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/DailyTaskView.jsx",
                                        lineNumber: 502,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DailyTaskView.jsx",
                                lineNumber: 500,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: '12px'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: '28px',
                                        fontWeight: '800',
                                        color: '#ef4444',
                                        letterSpacing: '-1px'
                                    },
                                    children: overdueTasksCount
                                }, void 0, false, {
                                    fileName: "[project]/components/DailyTaskView.jsx",
                                    lineNumber: 507,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/DailyTaskView.jsx",
                                lineNumber: 506,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DailyTaskView.jsx",
                        lineNumber: 499,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "app-card stats-card",
                        style: {
                            padding: '16px 20px',
                            borderRadius: '20px',
                            background: '#ffffff',
                            border: '1px solid var(--color-border)'
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
                                        style: {
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            color: 'var(--color-text-secondary)',
                                            textTransform: 'uppercase'
                                        },
                                        children: "Completed Tasks"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DailyTaskView.jsx",
                                        lineNumber: 515,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: 'rgba(34, 197, 94, 0.1)',
                                            color: '#166534',
                                            padding: '6px',
                                            borderRadius: '50%'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/components/DailyTaskView.jsx",
                                            lineNumber: 517,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/DailyTaskView.jsx",
                                        lineNumber: 516,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DailyTaskView.jsx",
                                lineNumber: 514,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: '12px'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: '28px',
                                        fontWeight: '800',
                                        color: '#166534',
                                        letterSpacing: '-1px'
                                    },
                                    children: completedCount
                                }, void 0, false, {
                                    fileName: "[project]/components/DailyTaskView.jsx",
                                    lineNumber: 521,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/DailyTaskView.jsx",
                                lineNumber: 520,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DailyTaskView.jsx",
                        lineNumber: 513,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DailyTaskView.jsx",
                lineNumber: 470,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tasks-layout-row",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            minWidth: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "filter-tab-bar",
                                children: [
                                    {
                                        id: 'All',
                                        label: 'All Tasks',
                                        bg: 'var(--color-accent-teal)',
                                        color: '#ffffff',
                                        border: '1px solid var(--color-accent-teal)'
                                    },
                                    {
                                        id: 'Leads',
                                        label: '📞 Leads',
                                        bg: '#fffbeb',
                                        color: '#b45309',
                                        border: '1px solid #fde68a'
                                    },
                                    {
                                        id: 'Quotations',
                                        label: '📄 Quotations',
                                        bg: '#eff6ff',
                                        color: '#1e40af',
                                        border: '1px solid #bfdbfe'
                                    },
                                    {
                                        id: 'Payments',
                                        label: '💰 Payments',
                                        bg: '#fef2f2',
                                        color: '#dc2626',
                                        border: '1px solid #fecaca'
                                    },
                                    {
                                        id: 'Orders',
                                        label: '🏭 Orders & Prod.',
                                        bg: '#e0e7ff',
                                        color: '#4338ca',
                                        border: '1px solid #c7d2fe'
                                    },
                                    {
                                        id: 'Samples',
                                        label: '🧪 Samples',
                                        bg: '#e0f2fe',
                                        color: '#0284c7',
                                        border: '1px solid #bae6fd'
                                    }
                                ].filter((tab)=>{
                                    if (module === 'Finance') {
                                        return [
                                            'All',
                                            'Payments',
                                            'Orders'
                                        ].includes(tab.id);
                                    } else if (module === 'Sales') {
                                        return [
                                            'All',
                                            'Leads',
                                            'Quotations',
                                            'Samples'
                                        ].includes(tab.id);
                                    }
                                    return true;
                                }).map((tab)=>{
                                    const isActive = activeTab === tab.id;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "filter-tab-btn ".concat(isActive ? 'active' : ''),
                                        style: isActive ? {
                                            backgroundColor: tab.bg,
                                            color: tab.color,
                                            border: tab.border
                                        } : {},
                                        onClick: ()=>setActiveTab(tab.id),
                                        children: tab.label
                                    }, tab.id, false, {
                                        fileName: "[project]/components/DailyTaskView.jsx",
                                        lineNumber: 555,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/DailyTaskView.jsx",
                                lineNumber: 537,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: 'relative',
                                    marginBottom: '16px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        className: "form-input",
                                        placeholder: "Search tasks by client or remarks...",
                                        value: searchQuery,
                                        onChange: (e)=>setSearchQuery(e.target.value),
                                        style: {
                                            width: '100%',
                                            paddingLeft: '40px',
                                            height: '42px',
                                            borderRadius: '12px',
                                            background: '#ffffff',
                                            border: '1px solid var(--color-border)',
                                            fontSize: '13px'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/DailyTaskView.jsx",
                                        lineNumber: 573,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                        size: 16,
                                        style: {
                                            position: 'absolute',
                                            left: '14px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--color-text-muted)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/DailyTaskView.jsx",
                                        lineNumber: 589,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DailyTaskView.jsx",
                                lineNumber: 572,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "task-grid-container",
                                children: filteredTasks.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "app-card",
                                    style: {
                                        padding: '40px 20px',
                                        borderRadius: '20px',
                                        textAlign: 'center',
                                        color: 'var(--color-text-muted)',
                                        background: '#ffffff',
                                        border: '1px solid var(--color-border)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '12px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                background: '#F5FAFE',
                                                color: 'var(--color-text-muted)',
                                                padding: '16px',
                                                borderRadius: '50%',
                                                display: 'inline-flex'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                size: 32
                                            }, void 0, false, {
                                                fileName: "[project]/components/DailyTaskView.jsx",
                                                lineNumber: 620,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/DailyTaskView.jsx",
                                            lineNumber: 619,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    style: {
                                                        fontSize: '15px',
                                                        fontWeight: '800',
                                                        color: 'var(--color-text-primary)'
                                                    },
                                                    children: "All Tasks Cleared!"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/DailyTaskView.jsx",
                                                    lineNumber: 623,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    style: {
                                                        fontSize: '12px',
                                                        color: 'var(--color-text-secondary)',
                                                        marginTop: '4px'
                                                    },
                                                    children: [
                                                        "No pending items match this filter for ",
                                                        targetDate,
                                                        "."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/DailyTaskView.jsx",
                                                    lineNumber: 624,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/DailyTaskView.jsx",
                                            lineNumber: 622,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DailyTaskView.jsx",
                                    lineNumber: 604,
                                    columnNumber: 15
                                }, this) : filteredTasks.map((task)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$tasks$2f$TaskCard$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        task: task,
                                        onDone: handleDone,
                                        onReschedule: handleRescheduleClick
                                    }, task.id, false, {
                                        fileName: "[project]/components/DailyTaskView.jsx",
                                        lineNumber: 631,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/DailyTaskView.jsx",
                                lineNumber: 602,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DailyTaskView.jsx",
                        lineNumber: 534,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            minWidth: 0
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "app-card",
                            style: {
                                background: '#ffffff',
                                border: '1px solid var(--color-border)',
                                borderRadius: '20px',
                                padding: '20px',
                                boxShadow: 'var(--shadow-premium)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: '#dc2626'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                            size: 18
                                        }, void 0, false, {
                                            fileName: "[project]/components/DailyTaskView.jsx",
                                            lineNumber: 655,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '14px',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            },
                                            children: "At Risk Deals"
                                        }, void 0, false, {
                                            fileName: "[project]/components/DailyTaskView.jsx",
                                            lineNumber: 656,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DailyTaskView.jsx",
                                    lineNumber: 654,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px'
                                    },
                                    children: [
                                        atRiskLeads.map((lead)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    background: '#fff5f5',
                                                    border: '1px solid #fee2e2',
                                                    borderRadius: '12px',
                                                    padding: '12px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    gap: '10px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            minWidth: 0,
                                                            flex: 1
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '13px',
                                                                    fontWeight: '800',
                                                                    color: '#991b1b',
                                                                    display: 'block',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap'
                                                                },
                                                                children: lead.companyName
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DailyTaskView.jsx",
                                                                lineNumber: 665,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '11px',
                                                                    color: '#dc2626',
                                                                    display: 'block',
                                                                    marginTop: '2px'
                                                                },
                                                                children: [
                                                                    "Followup overdue since ",
                                                                    lead.followUpDate
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/DailyTaskView.jsx",
                                                                lineNumber: 668,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DailyTaskView.jsx",
                                                        lineNumber: 664,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            var _navigate_push;
                                                            return typeof navigate === 'function' ? navigate('/sales/leads') : navigate === null || navigate === void 0 ? void 0 : (_navigate_push = navigate.push) === null || _navigate_push === void 0 ? void 0 : _navigate_push.call(navigate, '/sales/leads');
                                                        },
                                                        style: {
                                                            background: '#ef4444',
                                                            color: '#ffffff',
                                                            border: 'none',
                                                            padding: '6px 12px',
                                                            borderRadius: '8px',
                                                            fontSize: '11px',
                                                            fontWeight: '800',
                                                            cursor: 'pointer',
                                                            whiteSpace: 'nowrap'
                                                        },
                                                        children: "Contact"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DailyTaskView.jsx",
                                                        lineNumber: 672,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, lead.id, true, {
                                                fileName: "[project]/components/DailyTaskView.jsx",
                                                lineNumber: 660,
                                                columnNumber: 17
                                            }, this)),
                                        atRiskQuotes.map((q)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    background: '#fff5f5',
                                                    border: '1px solid #fee2e2',
                                                    borderRadius: '12px',
                                                    padding: '12px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    gap: '10px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            minWidth: 0,
                                                            flex: 1
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '13px',
                                                                    fontWeight: '800',
                                                                    color: '#991b1b',
                                                                    display: 'block',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap'
                                                                },
                                                                children: q.customerName
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DailyTaskView.jsx",
                                                                lineNumber: 690,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '11px',
                                                                    color: '#dc2626',
                                                                    display: 'block',
                                                                    marginTop: '2px'
                                                                },
                                                                children: [
                                                                    "Proposal expires on ",
                                                                    q.validTill
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/DailyTaskView.jsx",
                                                                lineNumber: 693,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DailyTaskView.jsx",
                                                        lineNumber: 689,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            var _navigate_push;
                                                            return typeof navigate === 'function' ? navigate('/sales/quotations') : navigate === null || navigate === void 0 ? void 0 : (_navigate_push = navigate.push) === null || _navigate_push === void 0 ? void 0 : _navigate_push.call(navigate, '/sales/quotations');
                                                        },
                                                        style: {
                                                            background: '#ef4444',
                                                            color: '#ffffff',
                                                            border: 'none',
                                                            padding: '6px 12px',
                                                            borderRadius: '8px',
                                                            fontSize: '11px',
                                                            fontWeight: '800',
                                                            cursor: 'pointer',
                                                            whiteSpace: 'nowrap'
                                                        },
                                                        children: "Renew"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DailyTaskView.jsx",
                                                        lineNumber: 697,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, q.id, true, {
                                                fileName: "[project]/components/DailyTaskView.jsx",
                                                lineNumber: 685,
                                                columnNumber: 17
                                            }, this)),
                                        atRiskLeads.length === 0 && atRiskQuotes.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                padding: '20px 0',
                                                textAlign: 'center',
                                                color: 'var(--color-text-muted)',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            },
                                            children: "No immediate risks detected."
                                        }, void 0, false, {
                                            fileName: "[project]/components/DailyTaskView.jsx",
                                            lineNumber: 710,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DailyTaskView.jsx",
                                    lineNumber: 658,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DailyTaskView.jsx",
                            lineNumber: 644,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/DailyTaskView.jsx",
                        lineNumber: 643,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DailyTaskView.jsx",
                lineNumber: 531,
                columnNumber: 7
            }, this),
            rescheduleTask && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "modal-overlay active",
                onClick: ()=>setRescheduleTask(null),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "modal-box",
                    onClick: (e)=>e.stopPropagation(),
                    style: {
                        width: '420px',
                        borderRadius: '20px',
                        padding: '24px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "modal-header-row",
                            style: {
                                borderBottom: '1px solid #eaeaea',
                                paddingBottom: '12px',
                                marginBottom: '16px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "modal-title-text",
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '16px',
                                        fontWeight: '800'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                            size: 18,
                                            style: {
                                                color: '#d97706'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/DailyTaskView.jsx",
                                            lineNumber: 725,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Reschedule Follow-up"
                                        }, void 0, false, {
                                            fileName: "[project]/components/DailyTaskView.jsx",
                                            lineNumber: 726,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DailyTaskView.jsx",
                                    lineNumber: 724,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "modal-close-btn",
                                    onClick: ()=>setRescheduleTask(null),
                                    style: {
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '16px'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        size: 18
                                    }, void 0, false, {
                                        fileName: "[project]/components/DailyTaskView.jsx",
                                        lineNumber: 729,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/DailyTaskView.jsx",
                                    lineNumber: 728,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DailyTaskView.jsx",
                            lineNumber: 723,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                marginBottom: '16px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        color: 'var(--color-text-primary)'
                                    },
                                    children: rescheduleTask.clientName
                                }, void 0, false, {
                                    fileName: "[project]/components/DailyTaskView.jsx",
                                    lineNumber: 734,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: '11px',
                                        color: 'var(--color-text-secondary)',
                                        marginTop: '2px'
                                    },
                                    children: [
                                        "Type: ",
                                        rescheduleTask.type,
                                        " | Current: ",
                                        rescheduleTask.followUpDate
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DailyTaskView.jsx",
                                    lineNumber: 735,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DailyTaskView.jsx",
                            lineNumber: 733,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleRescheduleSubmit,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "form-group",
                                    style: {
                                        marginBottom: '20px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "form-label",
                                            style: {
                                                fontWeight: '700',
                                                fontSize: '12px'
                                            },
                                            children: "Choose New Date *"
                                        }, void 0, false, {
                                            fileName: "[project]/components/DailyTaskView.jsx",
                                            lineNumber: 740,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "date",
                                            className: "form-input",
                                            value: rescheduleDate,
                                            onChange: (e)=>setRescheduleDate(e.target.value),
                                            style: {
                                                borderRadius: '10px'
                                            },
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/components/DailyTaskView.jsx",
                                            lineNumber: 741,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DailyTaskView.jsx",
                                    lineNumber: 739,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "form-actions",
                                    style: {
                                        display: 'flex',
                                        gap: '8px',
                                        justifyContent: 'flex-end',
                                        marginTop: '16px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: "btn-small btn-outline-small",
                                            onClick: ()=>setRescheduleTask(null),
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/components/DailyTaskView.jsx",
                                            lineNumber: 752,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            className: "btn-small btn-primary-small",
                                            style: {
                                                background: '#d97706',
                                                border: 'none',
                                                color: '#fff',
                                                fontWeight: '700'
                                            },
                                            children: "Save Date"
                                        }, void 0, false, {
                                            fileName: "[project]/components/DailyTaskView.jsx",
                                            lineNumber: 755,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/DailyTaskView.jsx",
                                    lineNumber: 751,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/DailyTaskView.jsx",
                            lineNumber: 738,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/DailyTaskView.jsx",
                    lineNumber: 722,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/DailyTaskView.jsx",
                lineNumber: 721,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/DailyTaskView.jsx",
        lineNumber: 240,
        columnNumber: 5
    }, this);
}
_s(DailyTaskView, "pOGlOdVzpySKDz4x5U7ZQQYtDgk=");
_c = DailyTaskView;
var _c;
__turbopack_context__.k.register(_c, "DailyTaskView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardFooter",
    ()=>CardFooter,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const Card = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = (param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("rounded-lg border bg-card text-card-foreground shadow-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 9,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Card;
Card.displayName = "Card";
const CardHeader = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c2 = (param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col space-y-1.5 p-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 24,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
});
_c3 = CardHeader;
CardHeader.displayName = "CardHeader";
const CardTitle = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c4 = (param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-2xl font-semibold leading-none tracking-tight", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 36,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
});
_c5 = CardTitle;
CardTitle.displayName = "CardTitle";
const CardDescription = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c6 = (param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-sm text-muted-foreground", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 51,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
});
_c7 = CardDescription;
CardDescription.displayName = "CardDescription";
const CardContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c8 = (param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-6 pt-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 63,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
});
_c9 = CardContent;
CardContent.displayName = "CardContent";
const CardFooter = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c10 = (param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex items-center p-6 pt-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 71,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
});
_c11 = CardFooter;
CardFooter.displayName = "CardFooter";
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11;
__turbopack_context__.k.register(_c, "Card$React.forwardRef");
__turbopack_context__.k.register(_c1, "Card");
__turbopack_context__.k.register(_c2, "CardHeader$React.forwardRef");
__turbopack_context__.k.register(_c3, "CardHeader");
__turbopack_context__.k.register(_c4, "CardTitle$React.forwardRef");
__turbopack_context__.k.register(_c5, "CardTitle");
__turbopack_context__.k.register(_c6, "CardDescription$React.forwardRef");
__turbopack_context__.k.register(_c7, "CardDescription");
__turbopack_context__.k.register(_c8, "CardContent$React.forwardRef");
__turbopack_context__.k.register(_c9, "CardContent");
__turbopack_context__.k.register(_c10, "CardFooter$React.forwardRef");
__turbopack_context__.k.register(_c11, "CardFooter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "ButtonArrow",
    ()=>ButtonArrow,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])('cursor-pointer group whitespace-nowrap focus-visible:outline-hidden inline-flex items-center justify-center has-data-[arrow=true]:justify-between whitespace-nowrap text-sm font-medium ring-offset-background transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-60 [&_svg]:shrink-0', {
    variants: {
        variant: {
            primary: 'bg-primary text-primary-foreground hover:bg-primary/90 data-[state=open]:bg-primary/90',
            mono: 'bg-zinc-950 text-white dark:bg-zinc-300 dark:text-black hover:bg-zinc-950/90 dark:hover:bg-zinc-300/90 data-[state=open]:bg-zinc-950/90 dark:data-[state=open]:bg-zinc-300/90',
            destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 data-[state=open]:bg-destructive/90',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 data-[state=open]:bg-secondary/90',
            outline: 'bg-background text-accent-foreground border border-input hover:bg-accent data-[state=open]:bg-accent',
            dashed: 'text-accent-foreground border border-input border-dashed bg-background hover:bg-accent hover:text-accent-foreground data-[state=open]:text-accent-foreground',
            ghost: 'text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
            dim: 'text-muted-foreground hover:text-foreground data-[state=open]:text-foreground',
            foreground: '',
            inverse: ''
        },
        appearance: {
            default: '',
            ghost: ''
        },
        underline: {
            solid: '',
            dashed: ''
        },
        underlined: {
            solid: '',
            dashed: ''
        },
        size: {
            lg: 'h-10 rounded-md px-4 text-sm gap-1.5 [&_svg:not([class*=size-])]:size-4',
            md: 'h-8.5 rounded-md px-3 gap-1.5 text-[0.8125rem] leading-(--text-sm--line-height) [&_svg:not([class*=size-])]:size-4',
            sm: 'h-7 rounded-md px-2.5 gap-1.25 text-xs [&_svg:not([class*=size-])]:size-3.5',
            icon: 'size-8.5 rounded-md [&_svg:not([class*=size-])]:size-4 shrink-0'
        },
        autoHeight: {
            true: '',
            false: ''
        },
        shape: {
            default: '',
            circle: 'rounded-full'
        },
        mode: {
            default: 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            icon: 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            link: 'text-primary h-auto p-0 bg-transparent rounded-none hover:bg-transparent data-[state=open]:bg-transparent',
            input: "\n            justify-start font-normal hover:bg-background [&_svg]:transition-colors [&_svg]:hover:text-foreground data-[state=open]:bg-background \n            focus-visible:border-ring focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring/30 \n            [[data-state=open]>&]:border-ring [[data-state=open]>&]:outline-hidden [[data-state=open]>&]:ring-[3px] \n            [[data-state=open]>&]:ring-ring/30 \n            aria-invalid:border-destructive/60 aria-invalid:ring-destructive/10 dark:aria-invalid:border-destructive dark:aria-invalid:ring-destructive/20\n            in-data-[invalid=true]:border-destructive/60 in-data-[invalid=true]:ring-destructive/10  dark:in-data-[invalid=true]:border-destructive dark:in-data-[invalid=true]:ring-destructive/20\n          "
        },
        placeholder: {
            true: 'text-muted-foreground',
            false: ''
        }
    },
    compoundVariants: [
        // Icons opacity for default mode
        {
            variant: 'ghost',
            mode: 'default',
            className: '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60'
        },
        {
            variant: 'outline',
            mode: 'default',
            className: '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60'
        },
        {
            variant: 'dashed',
            mode: 'default',
            className: '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60'
        },
        {
            variant: 'secondary',
            mode: 'default',
            className: '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60'
        },
        // Icons opacity for default mode
        {
            variant: 'outline',
            mode: 'input',
            className: '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60'
        },
        {
            variant: 'outline',
            mode: 'icon',
            className: '[&_svg:not([role=img]):not([class*=text-]):not([class*=opacity-])]:opacity-60'
        },
        // Auto height
        {
            size: 'md',
            autoHeight: true,
            className: 'h-auto min-h-8.5'
        },
        {
            size: 'sm',
            autoHeight: true,
            className: 'h-auto min-h-7'
        },
        {
            size: 'lg',
            autoHeight: true,
            className: 'h-auto min-h-10'
        },
        // Shadow support
        {
            variant: 'primary',
            mode: 'default',
            appearance: 'default',
            className: 'shadow-xs shadow-black/5'
        },
        {
            variant: 'mono',
            mode: 'default',
            appearance: 'default',
            className: 'shadow-xs shadow-black/5'
        },
        {
            variant: 'secondary',
            mode: 'default',
            appearance: 'default',
            className: 'shadow-xs shadow-black/5'
        },
        {
            variant: 'outline',
            mode: 'default',
            appearance: 'default',
            className: 'shadow-xs shadow-black/5'
        },
        {
            variant: 'dashed',
            mode: 'default',
            appearance: 'default',
            className: 'shadow-xs shadow-black/5'
        },
        {
            variant: 'destructive',
            mode: 'default',
            appearance: 'default',
            className: 'shadow-xs shadow-black/5'
        },
        // Shadow support
        {
            variant: 'primary',
            mode: 'icon',
            appearance: 'default',
            className: 'shadow-xs shadow-black/5'
        },
        {
            variant: 'mono',
            mode: 'icon',
            appearance: 'default',
            className: 'shadow-xs shadow-black/5'
        },
        {
            variant: 'secondary',
            mode: 'icon',
            appearance: 'default',
            className: 'shadow-xs shadow-black/5'
        },
        {
            variant: 'outline',
            mode: 'icon',
            appearance: 'default',
            className: 'shadow-xs shadow-black/5'
        },
        {
            variant: 'dashed',
            mode: 'icon',
            appearance: 'default',
            className: 'shadow-xs shadow-black/5'
        },
        {
            variant: 'destructive',
            mode: 'icon',
            appearance: 'default',
            className: 'shadow-xs shadow-black/5'
        },
        // Link
        {
            variant: 'primary',
            mode: 'link',
            underline: 'solid',
            className: 'font-medium text-primary hover:text-primary/90 [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-solid'
        },
        {
            variant: 'primary',
            mode: 'link',
            underline: 'dashed',
            className: 'font-medium text-primary hover:text-primary/90 [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-dashed decoration-1'
        },
        {
            variant: 'primary',
            mode: 'link',
            underlined: 'solid',
            className: 'font-medium text-primary hover:text-primary/90 [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-solid'
        },
        {
            variant: 'primary',
            mode: 'link',
            underlined: 'dashed',
            className: 'font-medium text-primary hover:text-primary/90 [&_svg]:opacity-60 underline underline-offset-4 decoration-dashed decoration-1'
        },
        {
            variant: 'inverse',
            mode: 'link',
            underline: 'solid',
            className: 'font-medium text-inherit [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-solid'
        },
        {
            variant: 'inverse',
            mode: 'link',
            underline: 'dashed',
            className: 'font-medium text-inherit [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-dashed decoration-1'
        },
        {
            variant: 'inverse',
            mode: 'link',
            underlined: 'solid',
            className: 'font-medium text-inherit [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-solid'
        },
        {
            variant: 'inverse',
            mode: 'link',
            underlined: 'dashed',
            className: 'font-medium text-inherit [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-dashed decoration-1'
        },
        {
            variant: 'foreground',
            mode: 'link',
            underline: 'solid',
            className: 'font-medium text-foreground [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-solid'
        },
        {
            variant: 'foreground',
            mode: 'link',
            underline: 'dashed',
            className: 'font-medium text-foreground [&_svg:not([role=img]):not([class*=text-])]:opacity-60 hover:underline hover:underline-offset-4 hover:decoration-dashed decoration-1'
        },
        {
            variant: 'foreground',
            mode: 'link',
            underlined: 'solid',
            className: 'font-medium text-foreground [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-solid'
        },
        {
            variant: 'foreground',
            mode: 'link',
            underlined: 'dashed',
            className: 'font-medium text-foreground [&_svg:not([role=img]):not([class*=text-])]:opacity-60 underline underline-offset-4 decoration-dashed decoration-1'
        },
        // Ghost
        {
            variant: 'primary',
            appearance: 'ghost',
            className: 'bg-transparent text-primary/90 hover:bg-primary/5 data-[state=open]:bg-primary/5'
        },
        {
            variant: 'destructive',
            appearance: 'ghost',
            className: 'bg-transparent text-destructive/90 hover:bg-destructive/5 data-[state=open]:bg-destructive/5'
        },
        {
            variant: 'ghost',
            mode: 'icon',
            className: 'text-muted-foreground'
        },
        // Size
        {
            size: 'sm',
            mode: 'icon',
            className: 'w-7 h-7 p-0 [[&_svg:not([class*=size-])]:size-3.5'
        },
        {
            size: 'md',
            mode: 'icon',
            className: 'w-8.5 h-8.5 p-0 [&_svg:not([class*=size-])]:size-4'
        },
        {
            size: 'icon',
            className: 'w-8.5 h-8.5 p-0 [&_svg:not([class*=size-])]:size-4'
        },
        {
            size: 'lg',
            mode: 'icon',
            className: 'w-10 h-10 p-0 [&_svg:not([class*=size-])]:size-4'
        },
        // Input mode
        {
            mode: 'input',
            placeholder: true,
            variant: 'outline',
            className: 'font-normal text-muted-foreground'
        },
        {
            mode: 'input',
            variant: 'outline',
            size: 'sm',
            className: 'gap-1.25'
        },
        {
            mode: 'input',
            variant: 'outline',
            size: 'md',
            className: 'gap-1.5'
        },
        {
            mode: 'input',
            variant: 'outline',
            size: 'lg',
            className: 'gap-1.5'
        }
    ],
    defaultVariants: {
        variant: 'primary',
        mode: 'default',
        size: 'md',
        shape: 'default',
        appearance: 'default'
    }
});
function Button(param) {
    let { className, selected, variant, shape, appearance, mode, size, autoHeight, underlined, underline, asChild = false, placeholder = false, ...props } = param;
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"].Slot : 'button';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            shape,
            appearance,
            mode,
            autoHeight,
            placeholder,
            underlined,
            underline,
            className
        }), asChild && props.disabled && 'pointer-events-none opacity-50'),
        ...selected && {
            'data-state': 'open'
        },
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/button.tsx",
        lineNumber: 381,
        columnNumber: 5
    }, this);
}
_c = Button;
function ButtonArrow(param) {
    let { icon: Icon = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
        "data-slot": "button-arrow",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('ms-auto -me-1', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/button.tsx",
        lineNumber: 409,
        columnNumber: 10
    }, this);
}
_c1 = ButtonArrow;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Button");
__turbopack_context__.k.register(_c1, "ButtonArrow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>Badge,
    "badgeVariants",
    ()=>badgeVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const badgeVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
    variants: {
        variant: {
            default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
            secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
            destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
            outline: "text-foreground"
        }
    },
    defaultVariants: {
        variant: "default"
    }
});
function Badge(param) {
    let { className, variant, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(badgeVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/badge.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
_c = Badge;
;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/input.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const Input = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = (param, ref)=>{
    let { className, type, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-shadow", className),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/input.tsx",
        lineNumber: 10,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Input;
Input.displayName = "Input";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Input$React.forwardRef");
__turbopack_context__.k.register(_c1, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/select.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Select",
    ()=>Select
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const Select = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = (param, ref)=>{
    let { className, options, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-shadow appearance-none", className),
        ref: ref,
        ...props,
        children: [
            !options.some((opt)=>opt.value === '') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                value: "",
                disabled: true,
                children: "Select an option"
            }, void 0, false, {
                fileName: "[project]/components/ui/select.tsx",
                lineNumber: 20,
                columnNumber: 52
            }, ("TURBOPACK compile-time value", void 0)),
            options.map((opt, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                    value: opt.value,
                    children: opt.label
                }, "".concat(opt.value, "-").concat(index), false, {
                    fileName: "[project]/components/ui/select.tsx",
                    lineNumber: 22,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0)))
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/select.tsx",
        lineNumber: 12,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Select;
Select.displayName = "Select";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Select$React.forwardRef");
__turbopack_context__.k.register(_c1, "Select");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/textarea.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Textarea",
    ()=>Textarea
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const Textarea = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = (param, ref)=>{
    let { className, ...props } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/textarea.tsx",
        lineNumber: 7,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Textarea;
Textarea.displayName = 'Textarea';
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Textarea$React.forwardRef");
__turbopack_context__.k.register(_c1, "Textarea");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/modal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Modal",
    ()=>Modal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
function Modal(param) {
    let { isOpen, onClose, title, children, footer, size = 'md' } = param;
    _s();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Modal.useEffect": ()=>{
            setMounted(true);
            if (isOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'unset';
            }
            return ({
                "Modal.useEffect": ()=>{
                    document.body.style.overflow = 'unset';
                }
            })["Modal.useEffect"];
        }
    }["Modal.useEffect"], [
        isOpen
    ]);
    if (!mounted || !isOpen) return null;
    const getMaxWidthClass = ()=>{
        switch(size){
            case 'sm':
                return 'max-w-sm';
            case 'lg':
                return 'max-w-lg';
            case 'xl':
                return 'max-w-4xl';
            case 'full':
                return 'max-w-[95vw] w-[95vw]';
            case 'md':
            default:
                return 'max-w-md';
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-white rounded-none shadow-lg w-full h-dvh max-h-dvh flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 sm:h-auto sm:max-h-[90vh] sm:rounded-xl", getMaxWidthClass(), size === 'full' ? 'sm:h-[95vh]' : ''),
            style: {
                maxWidth: size === 'xl' ? '896px' : undefined
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between p-4 border-b",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-lg font-semibold",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/components/ui/modal.tsx",
                            lineNumber: 53,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "ghost",
                            size: "sm",
                            onClick: onClose,
                            className: "h-8 w-8 p-0 rounded-full",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "sr-only",
                                    children: "Close"
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/modal.tsx",
                                    lineNumber: 55,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    width: "20",
                                    height: "20",
                                    viewBox: "0 0 24 24",
                                    fill: "none",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "M18 6 6 18"
                                        }, void 0, false, {
                                            fileName: "[project]/components/ui/modal.tsx",
                                            lineNumber: 56,
                                            columnNumber: 191
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            d: "m6 6 12 12"
                                        }, void 0, false, {
                                            fileName: "[project]/components/ui/modal.tsx",
                                            lineNumber: 56,
                                            columnNumber: 213
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ui/modal.tsx",
                                    lineNumber: 56,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ui/modal.tsx",
                            lineNumber: 54,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/ui/modal.tsx",
                    lineNumber: 52,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 sm:p-6 overflow-y-auto overflow-x-hidden flex-1",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full pb-2",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/components/ui/modal.tsx",
                        lineNumber: 60,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/ui/modal.tsx",
                    lineNumber: 59,
                    columnNumber: 9
                }, this),
                footer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 border-t bg-slate-50 flex justify-end gap-2",
                    children: footer
                }, void 0, false, {
                    fileName: "[project]/components/ui/modal.tsx",
                    lineNumber: 65,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/ui/modal.tsx",
            lineNumber: 44,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ui/modal.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_s(Modal, "LrrVfNW3d1raFE0BNzCTILYmIfo=");
_c = Modal;
var _c;
__turbopack_context__.k.register(_c, "Modal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/CreateOrder.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CreateOrder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.mjs [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/box.mjs [app-client] (ecmascript) <export default as Box>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shopping-cart.mjs [app-client] (ecmascript) <export default as ShoppingCart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.mjs [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$ProductPicker$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/components/ProductPicker.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$hooks$2f$useFormDraft$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/hooks/useFormDraft.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
function CreateOrder(param) {
    let { customers = [], onCreateOrder, onCancel } = param;
    _s();
    const emptyOrderForm = {
        customerName: '',
        selectedCustomerId: '',
        productName: 'Concrete Cylinders (x1000)',
        quantity: '10',
        selectedProduct: null
    };
    const { formData, setFormData, clearDraft } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$hooks$2f$useFormDraft$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormDraft"])({
        draftKey: 'erp_draft_create_order_new',
        initialData: emptyOrderForm
    });
    const { customerName, selectedCustomerId, productName, quantity, selectedProduct } = formData;
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const updateField = (field, value)=>{
        setFormData((prev)=>({
                ...prev,
                [field]: typeof value === 'function' ? value(prev[field]) : value
            }));
    };
    const setCustomerName = (val)=>updateField('customerName', val);
    const setSelectedCustomerId = (val)=>updateField('selectedCustomerId', val);
    const setProductName = (val)=>updateField('productName', val);
    const setQuantity = (val)=>updateField('quantity', val);
    const setSelectedProduct = (val)=>updateField('selectedProduct', val);
    const handleCustomerSelectChange = (e)=>{
        const val = e.target.value;
        setSelectedCustomerId(val);
        if (val === 'new') {
            setCustomerName('');
        } else {
            const custObj = customers.find((c)=>c.id === val);
            if (custObj) {
                setCustomerName(custObj.name);
            }
        }
    };
    const handleSubmit = (e)=>{
        e.preventDefault();
        setError('');
        if (!customerName.trim()) {
            setError('Please select or specify a customer name.');
            return;
        }
        if (!selectedProduct) {
            setError('Please select a product from the catalog.');
            return;
        }
        const qtyNum = Number(quantity);
        if (isNaN(qtyNum) || qtyNum <= 0) {
            setError('Please specify a valid quantity greater than zero.');
            return;
        }
        const submitResult = async ()=>{
            let success = false;
            try {
                const res = await onCreateOrder({
                    customerName: customerName.trim(),
                    productName: selectedProduct.product_name,
                    productId: selectedProduct.id,
                    quantity: qtyNum
                });
                success = (res === null || res === void 0 ? void 0 : res.success) !== false;
            } catch (err) {
                console.error(err);
            }
            if (success) {
                clearDraft();
            }
        };
        submitResult();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "app-card",
        style: {
            flex: 1
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "module-header-row",
                style: {
                    borderBottom: '1px solid var(--color-border)',
                    paddingBottom: '12px',
                    marginBottom: '20px'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: "card-top-icon-btn",
                            onClick: onCancel,
                            style: {
                                width: '36px',
                                height: '36px',
                                background: 'rgba(255,255,255,0.03)',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.08)'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/components/CreateOrder.jsx",
                                lineNumber: 104,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/CreateOrder.jsx",
                            lineNumber: 98,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "module-title",
                            children: "Create Direct Purchase Order"
                        }, void 0, false, {
                            fileName: "[project]/components/CreateOrder.jsx",
                            lineNumber: 106,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/CreateOrder.jsx",
                    lineNumber: 97,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/CreateOrder.jsx",
                lineNumber: 96,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    marginBottom: '16px',
                    color: '#f87171',
                    fontSize: '13px',
                    fontWeight: 'bold'
                },
                children: [
                    "⚠️ ",
                    error
                ]
            }, void 0, true, {
                fileName: "[project]/components/CreateOrder.jsx",
                lineNumber: 111,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    maxWidth: '600px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "form-group",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "form-label",
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                        size: 13,
                                        style: {
                                            color: 'var(--color-primary)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateOrder.jsx",
                                        lineNumber: 120,
                                        columnNumber: 13
                                    }, this),
                                    " Select Existing Customer Account"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateOrder.jsx",
                                lineNumber: 119,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "form-select",
                                style: {
                                    background: 'rgba(0,0,0,0.2)',
                                    color: '#fff',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    fontWeight: 'bold'
                                },
                                value: selectedCustomerId,
                                onChange: handleCustomerSelectChange,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "-- Choose Account (Or Add New Below) --"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateOrder.jsx",
                                        lineNumber: 128,
                                        columnNumber: 13
                                    }, this),
                                    customers.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: c.id,
                                            children: c.name
                                        }, c.id, false, {
                                            fileName: "[project]/components/CreateOrder.jsx",
                                            lineNumber: 130,
                                            columnNumber: 15
                                        }, this)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "new",
                                        children: "+ Specify New Customer --"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateOrder.jsx",
                                        lineNumber: 132,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateOrder.jsx",
                                lineNumber: 122,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateOrder.jsx",
                        lineNumber: 118,
                        columnNumber: 9
                    }, this),
                    (!selectedCustomerId || selectedCustomerId === 'new') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "form-group",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "form-label",
                                children: "Customer Company Name *"
                            }, void 0, false, {
                                fileName: "[project]/components/CreateOrder.jsx",
                                lineNumber: 139,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                className: "form-input",
                                placeholder: "e.g. Reliance Projects Ltd",
                                value: customerName,
                                onChange: (e)=>setCustomerName(e.target.value),
                                required: true,
                                style: {
                                    background: 'rgba(0,0,0,0.2)',
                                    color: '#fff',
                                    borderColor: 'rgba(255,255,255,0.1)'
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/CreateOrder.jsx",
                                lineNumber: 140,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateOrder.jsx",
                        lineNumber: 138,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "form-group",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "form-label",
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$box$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Box$3e$__["Box"], {
                                        size: 13,
                                        style: {
                                            color: 'var(--color-accent-teal)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateOrder.jsx",
                                        lineNumber: 155,
                                        columnNumber: 13
                                    }, this),
                                    " Select Catalogue Product *"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateOrder.jsx",
                                lineNumber: 154,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$ProductPicker$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                value: selectedProduct,
                                onChange: (p)=>{
                                    setSelectedProduct(p);
                                    if (p) setProductName(p.product_name);
                                },
                                placeholder: "Search product...",
                                showBadge: true
                            }, void 0, false, {
                                fileName: "[project]/components/CreateOrder.jsx",
                                lineNumber: 157,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateOrder.jsx",
                        lineNumber: 153,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "form-group",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "form-label",
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shopping$2d$cart$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShoppingCart$3e$__["ShoppingCart"], {
                                        size: 13,
                                        style: {
                                            color: 'var(--color-primary)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateOrder.jsx",
                                        lineNumber: 171,
                                        columnNumber: 13
                                    }, this),
                                    " Order Volume Quantity (Tons) *"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateOrder.jsx",
                                lineNumber: 170,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    position: 'relative'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        className: "form-input",
                                        min: "1",
                                        value: quantity,
                                        onChange: (e)=>setQuantity(e.target.value),
                                        required: true,
                                        style: {
                                            background: 'rgba(0,0,0,0.2)',
                                            color: '#fff',
                                            borderColor: 'rgba(255,255,255,0.1)',
                                            paddingRight: '40px'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateOrder.jsx",
                                        lineNumber: 174,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            color: 'var(--color-text-secondary)'
                                        },
                                        children: "Tons"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateOrder.jsx",
                                        lineNumber: 183,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateOrder.jsx",
                                lineNumber: 173,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateOrder.jsx",
                        lineNumber: 169,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "form-actions",
                        style: {
                            display: 'flex',
                            gap: '12px',
                            marginTop: '10px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                className: "form-submit-btn",
                                style: {
                                    margin: 0,
                                    padding: '12px 24px'
                                },
                                children: "✓ Create Order (Send to PH)"
                            }, void 0, false, {
                                fileName: "[project]/components/CreateOrder.jsx",
                                lineNumber: 191,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "btn-small btn-outline-small",
                                onClick: onCancel,
                                style: {
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 24px',
                                    background: 'transparent',
                                    color: '#fff'
                                },
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/components/CreateOrder.jsx",
                                lineNumber: 194,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateOrder.jsx",
                        lineNumber: 190,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CreateOrder.jsx",
                lineNumber: 116,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/CreateOrder.jsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
}
_s(CreateOrder, "REmDihqR7UK2a6F97d7WZWzQg2s=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$hooks$2f$useFormDraft$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormDraft"]
    ];
});
_c = CreateOrder;
var _c;
__turbopack_context__.k.register(_c, "CreateOrder");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_bc2c56ea._.js.map