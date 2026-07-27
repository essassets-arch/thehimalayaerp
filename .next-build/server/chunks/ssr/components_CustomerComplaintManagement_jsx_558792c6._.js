module.exports = [
"[project]/components/CustomerComplaintManagement.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CustomerComplaintManagement
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.esm.all.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.mjs [app-ssr] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.mjs [app-ssr] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$pen$2d$line$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FilePenLine$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-pen-line.mjs [app-ssr] (ecmascript) <export default as FilePenLine>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$paperclip$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Paperclip$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/paperclip.mjs [app-ssr] (ecmascript) <export default as Paperclip>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.mjs [app-ssr] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.mjs [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.mjs [app-ssr] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs [app-ssr] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$customerComplaintStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/customerComplaintStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$hooks$2f$useFormDraft$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/hooks/useFormDraft.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/input.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/select.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$textarea$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/textarea.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/modal.tsx [app-ssr] (ecmascript)");
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
const EMPTY_FORM = {
    orderId: '',
    customer: '',
    product: '',
    complaintType: 'Product Quality',
    complaintDate: new Date().toISOString().split('T')[0],
    priority: 'Medium',
    subject: '',
    description: '',
    salesRemarks: '',
    attachment: undefined
};
const TYPES = [
    'Product Quality',
    'Damage',
    'Wrong Product',
    'Quantity Shortage',
    'Delivery',
    'Billing',
    'Service',
    'Other'
];
const PRIORITIES = [
    'Low',
    'Medium',
    'High',
    'Critical'
];
const STATUS_VARIANTS = {
    DRAFT: [
        'secondary',
        'bg-slate-100 text-slate-700'
    ],
    PENDING_SUPER_ADMIN_REVIEW: [
        'outline',
        'border-amber-300 bg-amber-50 text-amber-700'
    ],
    UNDER_REVIEW: [
        'outline',
        'border-blue-300 bg-blue-50 text-blue-700'
    ],
    IN_RESOLUTION: [
        'outline',
        'border-violet-300 bg-violet-50 text-violet-700'
    ],
    RESOLVED: [
        'outline',
        'border-emerald-300 bg-emerald-50 text-emerald-700'
    ],
    CLOSED: [
        'secondary',
        'bg-slate-200 text-slate-700'
    ],
    REJECTED: [
        'destructive',
        ''
    ]
};
const statusLabel = (status)=>status.replaceAll('_', ' ');
const StatusBadge = ({ status })=>{
    const [variant, className] = STATUS_VARIANTS[status] || [
        'outline',
        ''
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
        variant: variant,
        className: className,
        children: statusLabel(status)
    }, void 0, false, {
        fileName: "[project]/components/CustomerComplaintManagement.jsx",
        lineNumber: 25,
        columnNumber: 119
    }, ("TURBOPACK compile-time value", void 0));
};
const Field = ({ label, children, className = '' })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        className: `grid gap-1.5 ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs font-semibold text-slate-600",
                children: label
            }, void 0, false, {
                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                lineNumber: 26,
                columnNumber: 103
            }, ("TURBOPACK compile-time value", void 0)),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/components/CustomerComplaintManagement.jsx",
        lineNumber: 26,
        columnNumber: 56
    }, ("TURBOPACK compile-time value", void 0));
const SummaryCard = ({ label, value, tone })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
        className: "complaint-stat-card",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "complaint-stat-label text-slate-500",
                    children: label
                }, void 0, false, {
                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                    lineNumber: 27,
                    columnNumber: 100
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: `complaint-stat-value ${tone}`,
                    children: value
                }, void 0, false, {
                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                    lineNumber: 27,
                    columnNumber: 162
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/CustomerComplaintManagement.jsx",
            lineNumber: 27,
            columnNumber: 87
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/CustomerComplaintManagement.jsx",
        lineNumber: 27,
        columnNumber: 49
    }, ("TURBOPACK compile-time value", void 0));
function CustomerComplaintManagement({ mode = 'sales', orders = [], currentUser }) {
    const complaints = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$customerComplaintStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCustomerComplaintStore"])((s)=>s.complaints);
    const submitComplaint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$customerComplaintStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCustomerComplaintStore"])((s)=>s.submitComplaint);
    const saveDraft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$customerComplaintStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCustomerComplaintStore"])((s)=>s.saveDraft);
    const submitDraft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$customerComplaintStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCustomerComplaintStore"])((s)=>s.submitDraft);
    const updateStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$customerComplaintStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCustomerComplaintStore"])((s)=>s.updateStatus);
    const [formOpen, setFormOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editingId, setEditingId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [priorityFilter, setPriorityFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(mode === 'admin' ? 'Pending Review' : 'All');
    const { formData: form, setFormData: setForm, clearDraft } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$hooks$2f$useFormDraft$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useFormDraft"])({
        draftKey: 'erp_draft_create_complaint',
        initialData: EMPTY_FORM,
        enabled: formOpen && !editingId,
        excludeFields: [
            'attachment'
        ]
    });
    const tabMatch = (item)=>({
            'Pending Review': item.status === 'PENDING_SUPER_ADMIN_REVIEW',
            'Under Resolution': [
                'UNDER_REVIEW',
                'IN_RESOLUTION'
            ].includes(item.status),
            Resolved: [
                'RESOLVED',
                'CLOSED'
            ].includes(item.status),
            Rejected: item.status === 'REJECTED',
            All: true
        })[tab];
    const visible = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>complaints.filter((item)=>{
            const searchable = `${item.id} ${item.customer} ${item.orderId}`.toLowerCase();
            return searchable.includes(query.toLowerCase()) && (!statusFilter || item.status === statusFilter) && (!priorityFilter || item.priority === priorityFilter) && (mode !== 'admin' || tabMatch(item));
        }), [
        complaints,
        query,
        statusFilter,
        priorityFilter,
        tab,
        mode
    ]);
    const count = (status)=>complaints.filter((item)=>status.includes(item.status)).length;
    const salesStats = [
        [
            'Total Complaints',
            complaints.length,
            'text-slate-900'
        ],
        [
            'Pending Review',
            count([
                'PENDING_SUPER_ADMIN_REVIEW'
            ]),
            'text-amber-600'
        ],
        [
            'Under Resolution',
            count([
                'UNDER_REVIEW',
                'IN_RESOLUTION'
            ]),
            'text-violet-600'
        ],
        [
            'Resolved',
            count([
                'RESOLVED',
                'CLOSED'
            ]),
            'text-emerald-600'
        ]
    ];
    const adminStats = [
        [
            'Pending Review',
            count([
                'PENDING_SUPER_ADMIN_REVIEW'
            ]),
            'text-amber-600'
        ],
        [
            'Under Review',
            count([
                'UNDER_REVIEW'
            ]),
            'text-blue-600'
        ],
        [
            'In Resolution',
            count([
                'IN_RESOLUTION'
            ]),
            'text-violet-600'
        ],
        [
            'Resolved',
            count([
                'RESOLVED',
                'CLOSED'
            ]),
            'text-emerald-600'
        ]
    ];
    const readFile = (file)=>{
        if (!file) return;
        if (file.size > 1024 * 1024) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire('Attachment too large', 'Maximum attachment size is 1 MB.', 'warning');
        const reader = new FileReader();
        reader.onload = ()=>setForm((prev)=>({
                    ...prev,
                    attachment: {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        dataUrl: String(reader.result)
                    }
                }));
        reader.readAsDataURL(file);
    };
    const complaintPayload = ()=>({
            ...form,
            createdBy: currentUser?.name || 'Sales Team'
        });
    const closeForm = ()=>{
        setFormOpen(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
    };
    const editComplaint = (item)=>{
        setEditingId(item.id);
        setForm({
            orderId: item.orderId,
            customer: item.customer,
            product: item.product,
            complaintType: item.complaintType,
            complaintDate: item.complaintDate,
            priority: item.priority,
            subject: item.subject,
            description: item.description,
            salesRemarks: item.salesRemarks,
            attachment: item.attachment
        });
        setFormOpen(true);
    };
    const save = (submit)=>{
        if (submit && (!form.customer || !form.product || !form.subject || form.description.length < 10)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire('Complete required fields', 'Customer, product, subject, and a detailed description are required.', 'warning');
        }
        const payload = complaintPayload();
        let id;
        let isSuccess = false;
        if (editingId) {
            if (submit) {
                submitDraft(editingId, payload);
                id = editingId;
            } else {
                id = saveDraft(payload, editingId);
            }
            isSuccess = true;
        } else {
            id = submit ? submitComplaint(payload) : saveDraft(payload);
            isSuccess = true;
        }
        if (isSuccess && !editingId) {
            clearDraft();
        }
        closeForm();
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire(submit ? 'Submitted to Super Admin' : 'Draft saved', `${id} was ${submit ? 'added to the review queue' : 'saved'}.`, 'success');
    };
    const adminAction = async (item, action)=>{
        const config = {
            review: [
                'UNDER_REVIEW',
                'Start review',
                false
            ],
            assign: [
                'IN_RESOLUTION',
                'Resolution owner / assignment remarks',
                true
            ],
            reject: [
                'REJECTED',
                'Rejection remarks',
                true
            ],
            resolve: [
                'RESOLVED',
                'Resolution remarks',
                true
            ],
            close: [
                'CLOSED',
                'Closure remarks',
                false
            ]
        }[action];
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire({
            title: config[1],
            input: 'textarea',
            inputLabel: config[1],
            showCancelButton: true,
            inputValidator: (value)=>config[2] && !value.trim() ? `${config[1]} are required.` : undefined
        });
        if (!result.isConfirmed) return;
        const remarks = result.value?.trim() || config[1];
        updateStatus(item.id, config[0], remarks, currentUser?.name || 'Super Admin', action === 'assign' ? remarks : '');
        setSelected(null);
    };
    const salesColumns = [
        [
            'Complaint ID',
            'id'
        ],
        [
            'Customer',
            'customer'
        ],
        [
            'Order ID',
            'orderId'
        ],
        [
            'Product',
            'product'
        ],
        [
            'Complaint Type',
            'complaintType'
        ],
        [
            'Priority',
            'priority'
        ],
        [
            'Date',
            'complaintDate'
        ],
        [
            'Status',
            'status'
        ],
        [
            'Actions',
            'actions'
        ]
    ];
    const adminColumns = [
        [
            'Complaint ID',
            'id'
        ],
        [
            'Customer',
            'customer'
        ],
        [
            'Order Ref',
            'orderId'
        ],
        [
            'Product',
            'product'
        ],
        [
            'Complaint',
            'subject'
        ],
        [
            'Priority',
            'priority'
        ],
        [
            'Submitted By',
            'createdBy'
        ],
        [
            'Date',
            'complaintDate'
        ],
        [
            'Status',
            'status'
        ],
        [
            'Actions',
            'actions'
        ]
    ];
    const columns = mode === 'sales' ? salesColumns : adminColumns;
    const actions = (item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex w-full flex-col gap-2 [&>button]:w-full sm:flex-row sm:[&>button]:w-auto md:w-auto md:flex-wrap",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                    variant: "outline",
                    size: "sm",
                    onClick: ()=>setSelected(item),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {}, void 0, false, {
                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                            lineNumber: 100,
                            columnNumber: 215
                        }, this),
                        " ",
                        mode === 'sales' ? 'View' : 'View Details'
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                    lineNumber: 100,
                    columnNumber: 145
                }, this),
                mode === 'sales' && [
                    'DRAFT',
                    'REJECTED'
                ].includes(item.status) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                    variant: "outline",
                    size: "sm",
                    onClick: ()=>editComplaint(item),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$pen$2d$line$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FilePenLine$3e$__["FilePenLine"], {}, void 0, false, {
                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                            lineNumber: 100,
                            columnNumber: 415
                        }, this),
                        " Edit"
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                    lineNumber: 100,
                    columnNumber: 343
                }, this),
                mode === 'admin' && ![
                    'REJECTED',
                    'CLOSED'
                ].includes(item.status) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                    size: "sm",
                    onClick: ()=>setSelected(item),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$pen$2d$line$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FilePenLine$3e$__["FilePenLine"], {}, void 0, false, {
                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                            lineNumber: 100,
                            columnNumber: 566
                        }, this),
                        " Review"
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                    lineNumber: 100,
                    columnNumber: 514
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/CustomerComplaintManagement.jsx",
            lineNumber: 100,
            columnNumber: 27
        }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "app-card",
        style: {
            flex: 1
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "module-header-row",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "module-title",
                                style: {
                                    margin: 0
                                },
                                children: mode === 'sales' ? 'Customer Complaint Management' : 'Customer Complaint Review'
                            }, void 0, false, {
                                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                lineNumber: 107,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: '12.5px',
                                    color: 'var(--color-text-secondary)',
                                    marginTop: '4px',
                                    display: 'inline-block'
                                },
                                children: mode === 'sales' ? 'Register, track, and monitor customer complaints submitted for Super Admin review.' : 'Review customer complaints submitted by Sales and manage their resolution lifecycle.'
                            }, void 0, false, {
                                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                lineNumber: 110,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                        lineNumber: 106,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "module-actions",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "tab-filters-row",
                                style: {
                                    background: '#f1f3f5'
                                },
                                children: mode === 'admin' ? [
                                    'Pending Review',
                                    'Under Resolution',
                                    'Resolved',
                                    'Rejected',
                                    'All'
                                ].map((value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: `filter-pill ${tab === value ? 'active' : ''}`,
                                        onClick: ()=>setTab(value),
                                        style: {
                                            color: tab === value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                                        },
                                        children: value
                                    }, value, false, {
                                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                        lineNumber: 120,
                                        columnNumber: 17
                                    }, this)) : [
                                    {
                                        label: 'All Statuses',
                                        value: ''
                                    },
                                    ...Object.keys(STATUS_VARIANTS).map((v)=>({
                                            label: statusLabel(v),
                                            value: v
                                        }))
                                ].map((st)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: `filter-pill ${statusFilter === st.value ? 'active' : ''}`,
                                        onClick: ()=>setStatusFilter(st.value),
                                        style: {
                                            color: statusFilter === st.value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                                        },
                                        children: st.label
                                    }, st.value, false, {
                                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                        lineNumber: 131,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                lineNumber: 117,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "search-box",
                                style: {
                                    background: '#f1f3f5',
                                    border: '1px solid #D6E2F0'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                        size: 14,
                                        style: {
                                            color: 'var(--color-text-secondary)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                        lineNumber: 144,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Search by ID, customer, order...",
                                        value: query,
                                        onChange: (e)=>setQuery(e.target.value),
                                        style: {
                                            color: 'var(--color-text-primary)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                        lineNumber: 145,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                lineNumber: 143,
                                columnNumber: 11
                            }, this),
                            mode === 'sales' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn-small btn-primary-small",
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    whiteSpace: 'nowrap'
                                },
                                onClick: ()=>setFormOpen(true),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                        lineNumber: 159,
                                        columnNumber: 15
                                    }, this),
                                    " Create Complaint"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                lineNumber: 154,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                        lineNumber: 115,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                lineNumber: 105,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    color: '#1e40af',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                        size: 16
                    }, void 0, false, {
                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                        lineNumber: 167,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "Complaint Resolution SLA:"
                            }, void 0, false, {
                                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                lineNumber: 168,
                                columnNumber: 15
                            }, this),
                            " Critical complaints must be addressed within 24 hours of submission."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                        lineNumber: 168,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                lineNumber: 166,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "crm-table-container",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "crm-table responsive-table flat-table",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: columns.map(([label, key])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            textAlign: key === 'actions' ? 'center' : 'left'
                                        },
                                        children: label
                                    }, key, false, {
                                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                        lineNumber: 177,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                lineNumber: 175,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                            lineNumber: 174,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: visible.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: columns.length,
                                    style: {
                                        textAlign: 'center',
                                        padding: '30px',
                                        color: 'var(--color-text-muted)'
                                    },
                                    children: "No complaints found."
                                }, void 0, false, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 184,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                lineNumber: 183,
                                columnNumber: 15
                            }, this) : visible.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: columns.map(([, key])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": columns.find(([, k])=>k === key)[0],
                                            style: {
                                                textAlign: key === 'actions' ? 'center' : 'left'
                                            },
                                            children: key === 'status' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusBadge, {
                                                status: item.status
                                            }, void 0, false, {
                                                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                lineNumber: 194,
                                                columnNumber: 25
                                            }, this) : key === 'actions' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    whiteSpace: 'nowrap'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        title: "View Details",
                                                        onClick: ()=>setSelected(item),
                                                        style: {
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: '30px',
                                                            height: '30px',
                                                            background: '#ffffff',
                                                            border: '1px solid #d1d5db',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            color: '#374151',
                                                            flexShrink: 0
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                            size: 13
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                            lineNumber: 208,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                        lineNumber: 197,
                                                        columnNumber: 27
                                                    }, this),
                                                    mode === 'sales' && [
                                                        'DRAFT',
                                                        'REJECTED'
                                                    ].includes(item.status) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        title: "Edit",
                                                        onClick: ()=>editComplaint(item),
                                                        style: {
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: '30px',
                                                            height: '30px',
                                                            background: '#ffffff',
                                                            border: '1px solid #d1d5db',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            color: '#374151',
                                                            flexShrink: 0
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$pen$2d$line$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FilePenLine$3e$__["FilePenLine"], {
                                                            size: 13
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                            lineNumber: 222,
                                                            columnNumber: 31
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                        lineNumber: 211,
                                                        columnNumber: 29
                                                    }, this),
                                                    mode === 'admin' && ![
                                                        'REJECTED',
                                                        'CLOSED'
                                                    ].includes(item.status) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "btn-small btn-primary-small",
                                                        style: {
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            height: '30px',
                                                            padding: '0 12px'
                                                        },
                                                        onClick: ()=>setSelected(item),
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                                size: 13
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                                lineNumber: 231,
                                                                columnNumber: 31
                                                            }, this),
                                                            " Review"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                        lineNumber: 226,
                                                        columnNumber: 29
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                lineNumber: 196,
                                                columnNumber: 25
                                            }, this) : key === 'priority' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    padding: '4px 10px',
                                                    borderRadius: '8px',
                                                    fontSize: '11px',
                                                    fontWeight: '800',
                                                    background: item.priority === 'Critical' ? '#fee2e2' : item.priority === 'High' ? '#ffedd5' : '#f1f5f9',
                                                    color: item.priority === 'Critical' ? '#b91c1c' : item.priority === 'High' ? '#c2410c' : '#475569'
                                                },
                                                children: item.priority
                                            }, void 0, false, {
                                                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                lineNumber: 236,
                                                columnNumber: 25
                                            }, this) : key === 'id' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontWeight: '700'
                                                },
                                                children: item.id
                                            }, void 0, false, {
                                                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                lineNumber: 244,
                                                columnNumber: 25
                                            }, this) : key === 'customer' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontWeight: '600'
                                                },
                                                children: item.customer
                                            }, void 0, false, {
                                                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                lineNumber: 246,
                                                columnNumber: 25
                                            }, this) : key === 'product' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    color: 'var(--color-text-secondary)',
                                                    fontSize: '12px'
                                                },
                                                children: item.product
                                            }, void 0, false, {
                                                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                lineNumber: 248,
                                                columnNumber: 25
                                            }, this) : item[key]
                                        }, key, false, {
                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                            lineNumber: 192,
                                            columnNumber: 21
                                        }, this))
                                }, item.id, false, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 190,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                            lineNumber: 181,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                    lineNumber: 173,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                lineNumber: 172,
                columnNumber: 7
            }, this),
            formOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "complaint-modal-overlay",
                onMouseDown: (e)=>{
                    if (e.target === e.currentTarget) closeForm();
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "complaint-modal",
                    role: "dialog",
                    "aria-modal": "true",
                    "aria-labelledby": "complaint-form-title",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "complaint-modal-header",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            id: "complaint-form-title",
                                            children: editingId ? `Edit Complaint ${editingId}` : 'Create Complaint'
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                            lineNumber: 263,
                                            columnNumber: 54
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            children: "Register a customer complaint and submit it for Super Admin review."
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                            lineNumber: 263,
                                            columnNumber: 153
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 263,
                                    columnNumber: 49
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "complaint-modal-close",
                                    onClick: closeForm,
                                    "aria-label": "Close",
                                    children: "×"
                                }, void 0, false, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 263,
                                    columnNumber: 233
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                            lineNumber: 263,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            className: "complaint-modal-form",
                            onSubmit: (e)=>{
                                e.preventDefault();
                                save(true);
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "complaint-form-body",
                                    style: {
                                        padding: '20px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "form-group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "form-label",
                                                            children: "Customer *"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                            lineNumber: 269,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            className: "form-input",
                                                            value: form.customer,
                                                            onChange: (e)=>setForm({
                                                                    ...form,
                                                                    customer: e.target.value
                                                                }),
                                                            required: true
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                            lineNumber: 270,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                    lineNumber: 268,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "form-group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "form-label",
                                                            children: "Product *"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                            lineNumber: 273,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            className: "form-input",
                                                            value: form.product,
                                                            onChange: (e)=>setForm({
                                                                    ...form,
                                                                    product: e.target.value
                                                                }),
                                                            required: true
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                            lineNumber: 274,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                    lineNumber: 272,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "form-group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "form-label",
                                                            children: "Complaint Type *"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                            lineNumber: 277,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                            className: "form-input",
                                                            value: form.complaintType,
                                                            onChange: (e)=>setForm({
                                                                    ...form,
                                                                    complaintType: e.target.value
                                                                }),
                                                            style: {
                                                                WebkitAppearance: 'auto'
                                                            },
                                                            required: true,
                                                            children: TYPES.map((value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: value,
                                                                    children: value
                                                                }, value, false, {
                                                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                                    lineNumber: 279,
                                                                    columnNumber: 39
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                            lineNumber: 278,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                    lineNumber: 276,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                            lineNumber: 267,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "form-group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "form-label",
                                                            children: "Priority *"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                            lineNumber: 286,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                            className: "form-input",
                                                            value: form.priority,
                                                            onChange: (e)=>setForm({
                                                                    ...form,
                                                                    priority: e.target.value
                                                                }),
                                                            style: {
                                                                WebkitAppearance: 'auto'
                                                            },
                                                            required: true,
                                                            children: PRIORITIES.map((value)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: value,
                                                                    children: value
                                                                }, value, false, {
                                                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                                    lineNumber: 288,
                                                                    columnNumber: 44
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                            lineNumber: 287,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                    lineNumber: 285,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "form-group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "form-label",
                                                            children: "Complaint Date *"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                            lineNumber: 292,
                                                            columnNumber: 17
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "date",
                                                            className: "form-input",
                                                            value: form.complaintDate,
                                                            onChange: (e)=>setForm({
                                                                    ...form,
                                                                    complaintDate: e.target.value
                                                                }),
                                                            required: true
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                            lineNumber: 293,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                    lineNumber: 291,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                            lineNumber: 284,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 mb-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "form-group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "form-label",
                                                        children: "Attachment"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                        lineNumber: 299,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "file",
                                                        className: "form-input",
                                                        style: {
                                                            paddingTop: '7px'
                                                        },
                                                        accept: "image/*,.pdf,.doc,.docx",
                                                        onChange: (e)=>readFile(e.target.files?.[0])
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                        lineNumber: 300,
                                                        columnNumber: 17
                                                    }, this),
                                                    form.attachment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '12px',
                                                            color: 'var(--color-accent-teal)',
                                                            marginTop: '4px',
                                                            display: 'block',
                                                            fontWeight: 600
                                                        },
                                                        children: form.attachment.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                        lineNumber: 301,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                lineNumber: 298,
                                                columnNumber: 15
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                            lineNumber: 297,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 mb-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "form-group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "form-label",
                                                        children: "Subject *"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                        lineNumber: 307,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        className: "form-input",
                                                        value: form.subject,
                                                        onChange: (e)=>setForm({
                                                                ...form,
                                                                subject: e.target.value
                                                            }),
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                        lineNumber: 308,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                lineNumber: 306,
                                                columnNumber: 15
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                            lineNumber: 305,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 mb-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "form-group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "form-label",
                                                        children: "Complaint Description *"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                        lineNumber: 314,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                        rows: 4,
                                                        className: "form-input",
                                                        style: {
                                                            minHeight: '80px',
                                                            padding: '10px'
                                                        },
                                                        value: form.description,
                                                        onChange: (e)=>setForm({
                                                                ...form,
                                                                description: e.target.value
                                                            }),
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                        lineNumber: 315,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                lineNumber: 313,
                                                columnNumber: 15
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                            lineNumber: 312,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 mb-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "form-group",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "form-label",
                                                        children: "Sales Remarks"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                        lineNumber: 321,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                        rows: 2,
                                                        className: "form-input",
                                                        style: {
                                                            minHeight: '50px',
                                                            padding: '10px'
                                                        },
                                                        value: form.salesRemarks,
                                                        onChange: (e)=>setForm({
                                                                ...form,
                                                                salesRemarks: e.target.value
                                                            })
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                        lineNumber: 322,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                lineNumber: 320,
                                                columnNumber: 15
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                            lineNumber: 319,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 265,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "complaint-modal-footer",
                                    style: {
                                        flexWrap: 'wrap'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: "btn-small w-full sm:w-auto",
                                            style: {
                                                background: '#f1f5f9',
                                                color: '#475569',
                                                fontWeight: '700'
                                            },
                                            onClick: closeForm,
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                            lineNumber: 328,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: "btn-small w-full sm:w-auto",
                                            style: {
                                                background: '#DCE5F0',
                                                color: '#334155',
                                                fontWeight: '700'
                                            },
                                            onClick: ()=>save(false),
                                            children: "Save Draft"
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                            lineNumber: 329,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            className: "btn-small btn-primary-small w-full sm:w-auto",
                                            children: "Submit to Super Admin"
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                            lineNumber: 330,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 327,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                            lineNumber: 264,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                    lineNumber: 262,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                lineNumber: 261,
                columnNumber: 18
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$modal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Modal"], {
                isOpen: !!selected,
                onClose: ()=>setSelected(null),
                title: selected ? `${selected.id} · ${selected.subject}` : 'Complaint Details',
                size: "xl",
                footer: selected && mode === 'admin' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end",
                    children: [
                        selected.status === 'PENDING_SUPER_ADMIN_REVIEW' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: ()=>adminAction(selected, 'review'),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {}, void 0, false, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 336,
                                    columnNumber: 387
                                }, void 0),
                                " Start Review"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                            lineNumber: 336,
                            columnNumber: 332
                        }, void 0),
                        selected.status === 'UNDER_REVIEW' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: ()=>adminAction(selected, 'assign'),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {}, void 0, false, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 336,
                                    columnNumber: 510
                                }, void 0),
                                " Assign for Resolution"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                            lineNumber: 336,
                            columnNumber: 455
                        }, void 0),
                        [
                            'PENDING_SUPER_ADMIN_REVIEW',
                            'UNDER_REVIEW'
                        ].includes(selected.status) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "destructive",
                            onClick: ()=>adminAction(selected, 'reject'),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {}, void 0, false, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 336,
                                    columnNumber: 710
                                }, void 0),
                                " Reject"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                            lineNumber: 336,
                            columnNumber: 633
                        }, void 0),
                        selected.status === 'IN_RESOLUTION' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: ()=>adminAction(selected, 'resolve'),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {}, void 0, false, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 336,
                                    columnNumber: 833
                                }, void 0),
                                " Mark Resolved"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                            lineNumber: 336,
                            columnNumber: 777
                        }, void 0),
                        selected.status === 'RESOLVED' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: ()=>adminAction(selected, 'close'),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {}, void 0, false, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 336,
                                    columnNumber: 961
                                }, void 0),
                                " Close Complaint"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                            lineNumber: 336,
                            columnNumber: 907
                        }, void 0)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                    lineNumber: 336,
                    columnNumber: 195
                }, void 0) : null,
                children: selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusBadge, {
                                    status: selected.status
                                }, void 0, false, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 337,
                                    columnNumber: 98
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                                    variant: "outline",
                                    children: selected.priority
                                }, void 0, false, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 337,
                                    columnNumber: 137
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                            lineNumber: 337,
                            columnNumber: 47
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
                            children: [
                                [
                                    'Customer',
                                    selected.customer
                                ],
                                [
                                    'Order Ref',
                                    selected.orderId
                                ],
                                [
                                    'Product',
                                    selected.product
                                ],
                                [
                                    'Complaint Type',
                                    selected.complaintType
                                ],
                                [
                                    'Submitted By',
                                    selected.createdBy
                                ],
                                [
                                    'Date',
                                    selected.complaintDate
                                ],
                                [
                                    'Assigned To',
                                    selected.assignedTo || 'Not assigned'
                                ]
                            ].map(([label, value])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-lg bg-slate-50 p-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs font-semibold text-slate-500",
                                            children: label
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                            lineNumber: 337,
                                            columnNumber: 587
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-1 break-words font-semibold text-slate-900",
                                            children: value
                                        }, void 0, false, {
                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                            lineNumber: 337,
                                            columnNumber: 650
                                        }, this)
                                    ]
                                }, label, true, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 337,
                                    columnNumber: 531
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                            lineNumber: 337,
                            columnNumber: 195
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-sm font-bold",
                                    children: "Complaint Description"
                                }, void 0, false, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 337,
                                    columnNumber: 745
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm",
                                    children: selected.description
                                }, void 0, false, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 337,
                                    columnNumber: 805
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                            lineNumber: 337,
                            columnNumber: 736
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-sm font-bold",
                                    children: "Sales Remarks"
                                }, void 0, false, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 337,
                                    columnNumber: 925
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-2 text-sm",
                                    children: selected.salesRemarks || 'No Sales remarks.'
                                }, void 0, false, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 337,
                                    columnNumber: 977
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                            lineNumber: 337,
                            columnNumber: 916
                        }, this),
                        selected.attachment && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                            className: "inline-flex items-center gap-2 text-sm font-semibold text-blue-600",
                            href: selected.attachment.dataUrl,
                            download: selected.attachment.name,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$paperclip$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Paperclip$3e$__["Paperclip"], {
                                    className: "size-4"
                                }, void 0, false, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 337,
                                    columnNumber: 1242
                                }, this),
                                " ",
                                selected.attachment.name
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                            lineNumber: 337,
                            columnNumber: 1089
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "mb-3 text-sm font-bold",
                                    children: "Audit Timeline"
                                }, void 0, false, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 337,
                                    columnNumber: 1314
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3 border-l-2 border-slate-200 pl-4",
                                    children: selected.history.map((entry, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusBadge, {
                                                            status: entry.status
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                            lineNumber: 337,
                                                            columnNumber: 1556
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs font-semibold",
                                                            children: entry.actor
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                            lineNumber: 337,
                                                            columnNumber: 1592
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                    lineNumber: 337,
                                                    columnNumber: 1505
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-1 text-sm",
                                                    children: entry.remarks || 'No remarks'
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                    lineNumber: 337,
                                                    columnNumber: 1658
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-slate-500",
                                                    children: new Date(entry.at).toLocaleString('en-IN')
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                                    lineNumber: 337,
                                                    columnNumber: 1721
                                                }, this)
                                            ]
                                        }, `${entry.at}-${index}`, true, {
                                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                            lineNumber: 337,
                                            columnNumber: 1471
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                                    lineNumber: 337,
                                    columnNumber: 1372
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CustomerComplaintManagement.jsx",
                            lineNumber: 337,
                            columnNumber: 1305
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/CustomerComplaintManagement.jsx",
                    lineNumber: 337,
                    columnNumber: 20
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/CustomerComplaintManagement.jsx",
                lineNumber: 336,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/CustomerComplaintManagement.jsx",
        lineNumber: 103,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=components_CustomerComplaintManagement_jsx_558792c6._.js.map