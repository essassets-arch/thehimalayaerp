module.exports = [
"[project]/components/ui/LoadingSpinner.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LoadingSpinner",
    ()=>LoadingSpinner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
const LoadingSpinner = ({ size = 'md', color = 'blue', className = '' })=>{
    const sizes = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
        xl: 'w-16 h-16 border-4'
    };
    const colors = {
        blue: 'border-blue-500',
        white: 'border-white',
        gray: 'border-gray-500',
        primary: 'border-indigo-600'
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center justify-center ${className}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `${sizes[size]} ${colors[color]} border-t-transparent rounded-full animate-spin`,
            role: "status",
            "aria-label": "Loading"
        }, void 0, false, {
            fileName: "[project]/components/ui/LoadingSpinner.jsx",
            lineNumber: 24,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/ui/LoadingSpinner.jsx",
        lineNumber: 23,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
}),
"[project]/components/material-workflow/StoreMaterialIssueView.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StoreMaterialIssueView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.esm.all.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2f$shallow$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react/shallow.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/context/AuthContext.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$materialFlow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/store/materialFlow.ts [app-ssr] (ecmascript) <locals>");
'use client';
;
;
;
;
;
;
;
function StoreMaterialIssueView() {
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('Pending');
    const pending = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useERPStore"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2f$shallow$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useShallow"])((store)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$materialFlow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["selectStoreApprovedRequests"])(store.state)));
    const history = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useERPStore"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2f$shallow$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useShallow"])((store)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$materialFlow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["selectStoreRequestHistory"])(store.state)));
    const requests = tab === 'Pending' ? pending : history;
    const actor = user?.name || 'Store';
    const approve = async (request)=>{
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$materialFlow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["approveStoreMaterialRequest"])(request.id, actor);
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire('Store Approved', 'Request moved to Store Releases. Inventory has not been deducted.', 'success');
        } catch (error) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire('Cannot approve', error.message, 'error');
        }
    };
    const reject = async (request)=>{
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Reject Material Request',
            input: 'textarea',
            inputLabel: 'Rejection Reason',
            inputPlaceholder: 'Insufficient stock available in Store',
            inputValidator: (value)=>!value?.trim() ? 'Rejection reason is required.' : undefined,
            showCancelButton: true,
            confirmButtonText: 'Reject',
            confirmButtonColor: '#dc2626'
        });
        if (!result.isConfirmed) return;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$materialFlow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["rejectStoreMaterialRequest"])(request.id, result.value, actor);
        await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire('Rejected', 'Request moved to Store rejection history.', 'success');
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: 16
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                style: {
                    margin: '0 0 6px',
                    fontSize: 24
                },
                children: "Store Material Requests"
            }, void 0, false, {
                fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                lineNumber: 50,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    margin: '0 0 16px',
                    color: '#5E6B82'
                },
                children: "Plant Head approved requests ready for Store stock verification."
            }, void 0, false, {
                fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                lineNumber: 51,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: 8,
                    marginBottom: 18
                },
                children: [
                    'Pending',
                    'Rejected / History'
                ].map((label)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setTab(label === 'Pending' ? 'Pending' : 'History'),
                        style: {
                            padding: '8px 14px',
                            borderRadius: 8,
                            border: '1px solid #D6E2F0',
                            background: tab === 'Pending' === (label === 'Pending') ? '#0f766e' : '#fff',
                            color: tab === 'Pending' === (label === 'Pending') ? '#fff' : '#334155',
                            fontWeight: 700
                        },
                        children: label
                    }, label, false, {
                        fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                        lineNumber: 54,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                lineNumber: 52,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    overflowX: 'auto',
                    background: '#fff',
                    border: '1px solid #DCE5F0',
                    borderRadius: 12
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    style: {
                        width: '100%',
                        borderCollapse: 'collapse'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                style: {
                                    background: '#F5FAFE',
                                    textAlign: 'left'
                                },
                                children: [
                                    'Req ID',
                                    'Material',
                                    'Department',
                                    'Approved Qty',
                                    'Status',
                                    'Action'
                                ].map((label)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        style: {
                                            padding: 14,
                                            borderBottom: '1px solid #DCE5F0'
                                        },
                                        children: label
                                    }, label, false, {
                                        fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                                        lineNumber: 63,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                                lineNumber: 61,
                                columnNumber: 18
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                            lineNumber: 61,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: requests.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: 6,
                                    style: {
                                        padding: 32,
                                        textAlign: 'center',
                                        color: '#5E6B82'
                                    },
                                    children: tab === 'Pending' ? 'No approved material requests available for release.' : 'No Store-rejected material requests.'
                                }, void 0, false, {
                                    fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                                    lineNumber: 68,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                                lineNumber: 68,
                                columnNumber: 15
                            }, this) : requests.flatMap((request)=>{
                                return request.items.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: 14,
                                                    borderBottom: '1px solid #f1f5f9',
                                                    fontWeight: 700
                                                },
                                                children: request.id
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                                                lineNumber: 74,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: 14,
                                                    borderBottom: '1px solid #f1f5f9'
                                                },
                                                children: item.materialName
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                                                lineNumber: 75,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: 14,
                                                    borderBottom: '1px solid #f1f5f9'
                                                },
                                                children: request.department
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                                                lineNumber: 76,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: 14,
                                                    borderBottom: '1px solid #f1f5f9'
                                                },
                                                children: [
                                                    item.approvedQty,
                                                    " ",
                                                    item.unit
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                                                lineNumber: 77,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: 14,
                                                    borderBottom: '1px solid #f1f5f9'
                                                },
                                                children: request.status === 'STORE_REJECTED' ? 'REJECTED' : 'APPROVED'
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                                                lineNumber: 78,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: 14,
                                                    borderBottom: '1px solid #f1f5f9'
                                                },
                                                children: [
                                                    tab === 'Pending' && index === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            gap: 8
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>approve(request),
                                                                style: {
                                                                    border: 0,
                                                                    borderRadius: 8,
                                                                    padding: '8px 12px',
                                                                    fontWeight: 700,
                                                                    background: '#059669',
                                                                    color: '#fff',
                                                                    cursor: 'pointer'
                                                                },
                                                                children: "Approve"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                                                                lineNumber: 81,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>reject(request),
                                                                style: {
                                                                    border: 0,
                                                                    borderRadius: 8,
                                                                    padding: '8px 12px',
                                                                    fontWeight: 700,
                                                                    background: '#dc2626',
                                                                    color: '#fff',
                                                                    cursor: 'pointer'
                                                                },
                                                                children: "Reject"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                                                                lineNumber: 82,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                                                        lineNumber: 80,
                                                        columnNumber: 58
                                                    }, this),
                                                    tab === 'History' && request.storeRejectionRemarks
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                                                lineNumber: 79,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, `${request.id}-${item.materialId}`, true, {
                                        fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                                        lineNumber: 73,
                                        columnNumber: 17
                                    }, this));
                            })
                        }, void 0, false, {
                            fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                            lineNumber: 66,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
                lineNumber: 59,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/material-workflow/StoreMaterialIssueView.jsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/material-workflow/StoreReleasesView.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StoreReleasesView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.esm.all.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2f$shallow$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react/shallow.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/context/AuthContext.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$materialFlow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/store/materialFlow.ts [app-ssr] (ecmascript) <locals>");
'use client';
;
;
;
;
;
;
;
const findStock = (inventory, item)=>inventory.find((entry)=>[
            entry.id,
            entry.materialId,
            entry.code
        ].filter(Boolean).includes(item.materialId) || String(entry.material || entry.name || '').toLowerCase() === String(item.materialName || item.material || '').toLowerCase());
function StoreReleasesView() {
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const approved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useERPStore"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2f$shallow$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useShallow"])((store)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$materialFlow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["selectStoreReleaseRequests"])(store.state)));
    const allRequests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useERPStore"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2f$shallow$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useShallow"])((store)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$materialFlow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["selectMaterialRequests"])(store.state)));
    const inventory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useERPStore"])((store)=>store.state.rawInventory || []);
    const orderIds = [
        ...new Set(approved.map((request)=>request.orderId))
    ];
    const issueOrder = async (orderId)=>{
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Issue Complete Material?',
            text: `Issue every approved material for ${orderId} to Production?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Issue Complete Material',
            confirmButtonColor: '#059669'
        });
        if (!result.isConfirmed) return;
        try {
            const reference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$materialFlow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["issueCompleteOrderMaterials"])(orderId, user?.name || 'Store');
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire('Materials Issued', `Issue reference: ${reference}`, 'success');
        } catch (error) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire('Cannot issue this order yet', error.message, 'error');
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: 16
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                style: {
                    margin: '0 0 6px',
                    fontSize: 24
                },
                children: "Store Releases"
            }, void 0, false, {
                fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                lineNumber: 47,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    margin: '0 0 20px',
                    color: '#5E6B82'
                },
                children: "Store-approved requests grouped order-wise for complete issue."
            }, void 0, false, {
                fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                lineNumber: 48,
                columnNumber: 5
            }, this),
            orderIds.map((orderId)=>{
                const orderRequests = allRequests.filter((request)=>request.orderId === orderId);
                const visibleRequests = approved.filter((request)=>request.orderId === orderId);
                const canIssueCompleteOrder = orderRequests.length > 0 && orderRequests.every((request)=>request.status === 'STORE_APPROVED' && request.items.every((item)=>{
                        const approvedQty = Number(item.approvedQty || 0);
                        const issueQty = Number(item.issueQty || 0);
                        return approvedQty > 0 && issueQty === approvedQty;
                    }));
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    style: {
                        background: '#fff',
                        border: '1px solid #DCE5F0',
                        borderRadius: 12,
                        marginBottom: 20,
                        overflow: 'hidden'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                padding: 16,
                                background: '#F5FAFE',
                                display: 'flex',
                                gap: 24,
                                flexWrap: 'wrap'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Order ID:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                            lineNumber: 61,
                                            columnNumber: 17
                                        }, this),
                                        " ",
                                        orderId || '—'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                    lineNumber: 61,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Department:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                            lineNumber: 62,
                                            columnNumber: 17
                                        }, this),
                                        " ",
                                        visibleRequests[0]?.department
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                    lineNumber: 62,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Request ID:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                            lineNumber: 63,
                                            columnNumber: 17
                                        }, this),
                                        " ",
                                        visibleRequests.map((request)=>request.id).join(', ')
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                    lineNumber: 63,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Materials:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                            lineNumber: 64,
                                            columnNumber: 17
                                        }, this),
                                        " ",
                                        visibleRequests.reduce((sum, request)=>sum + request.items.length, 0)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                    lineNumber: 64,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Status:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                            lineNumber: 65,
                                            columnNumber: 17
                                        }, this),
                                        " Ready to Issue"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                    lineNumber: 65,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                            lineNumber: 60,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                overflowX: 'auto'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                style: {
                                    width: '100%',
                                    borderCollapse: 'collapse'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            style: {
                                                textAlign: 'left'
                                            },
                                            children: [
                                                'Material',
                                                'Approved Qty',
                                                'Available Stock',
                                                'Issue Qty',
                                                'Status'
                                            ].map((label)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: 12,
                                                        borderBottom: '1px solid #DCE5F0'
                                                    },
                                                    children: label
                                                }, label, false, {
                                                    fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                                    lineNumber: 68,
                                                    columnNumber: 139
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                            lineNumber: 68,
                                            columnNumber: 18
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                        lineNumber: 68,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                        children: visibleRequests.flatMap((request)=>request.items.map((item)=>{
                                                const available = Number(findStock(inventory, item)?.stock || 0);
                                                const ready = Number(item.issueQty || 0) === Number(item.approvedQty || 0);
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                padding: 12
                                                            },
                                                            children: item.materialName
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                                            lineNumber: 73,
                                                            columnNumber: 15
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                padding: 12
                                                            },
                                                            children: [
                                                                item.approvedQty,
                                                                " ",
                                                                item.unit
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                                            lineNumber: 74,
                                                            columnNumber: 15
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                padding: 12
                                                            },
                                                            children: [
                                                                available,
                                                                " ",
                                                                item.unit
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                                            lineNumber: 75,
                                                            columnNumber: 15
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                padding: 12
                                                            },
                                                            children: [
                                                                item.issueQty,
                                                                " ",
                                                                item.unit
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                                            lineNumber: 76,
                                                            columnNumber: 15
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            style: {
                                                                padding: 12,
                                                                color: ready ? '#059669' : '#dc2626'
                                                            },
                                                            children: ready ? 'Ready' : 'Incomplete'
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                                            lineNumber: 77,
                                                            columnNumber: 15
                                                        }, this)
                                                    ]
                                                }, `${request.id}-${item.materialId}`, true, {
                                                    fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                                    lineNumber: 72,
                                                    columnNumber: 20
                                                }, this);
                                            }))
                                    }, void 0, false, {
                                        fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                        lineNumber: 69,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                lineNumber: 67,
                                columnNumber: 44
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                            lineNumber: 67,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                padding: 16,
                                borderTop: '1px solid #DCE5F0'
                            },
                            children: [
                                !canIssueCompleteOrder && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        margin: '0 0 10px',
                                        color: '#dc2626'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Cannot issue this order yet."
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                            lineNumber: 82,
                                            columnNumber: 90
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                            fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                            lineNumber: 82,
                                            columnNumber: 135
                                        }, this),
                                        "All requests must be Store approved with complete issue quantities."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                    lineNumber: 82,
                                    columnNumber: 38
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    disabled: !canIssueCompleteOrder,
                                    onClick: ()=>issueOrder(orderId),
                                    style: {
                                        border: 0,
                                        borderRadius: 8,
                                        padding: '10px 16px',
                                        background: canIssueCompleteOrder ? '#059669' : '#D6E2F0',
                                        color: '#fff',
                                        fontWeight: 700,
                                        cursor: canIssueCompleteOrder ? 'pointer' : 'not-allowed'
                                    },
                                    children: "Issue Complete Material"
                                }, void 0, false, {
                                    fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                                    lineNumber: 83,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                            lineNumber: 81,
                            columnNumber: 9
                        }, this)
                    ]
                }, orderId, true, {
                    fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                    lineNumber: 59,
                    columnNumber: 14
                }, this);
            }),
            orderIds.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    padding: 32,
                    textAlign: 'center',
                    background: '#fff',
                    borderRadius: 12,
                    color: '#5E6B82'
                },
                children: "No Store-approved orders ready to issue."
            }, void 0, false, {
                fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
                lineNumber: 87,
                columnNumber: 31
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/material-workflow/StoreReleasesView.jsx",
        lineNumber: 46,
        columnNumber: 10
    }, this);
}
}),
"[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StoreMaterialReturnVerificationView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.esm.all.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$materialRequestStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/materialRequestStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.mjs [app-ssr] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.mjs [app-ssr] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.mjs [app-ssr] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check-check.mjs [app-ssr] (ecmascript) <export default as CheckCheck>");
'use client';
;
;
;
;
;
function StoreMaterialReturnVerificationView() {
    const materialRequests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$materialRequestStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMaterialRequestStore"])((s)=>s.materialRequests);
    const confirmReturn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$materialRequestStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMaterialRequestStore"])((s)=>s.confirmReturn);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('Awaiting Verification');
    const [selectedReq, setSelectedReq] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editingItems, setEditingItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const pendingReturnList = materialRequests.filter((mr)=>mr.status === 'Return Pending');
    const verifiedList = materialRequests.filter((mr)=>[
            'Returned',
            'Closed'
        ].includes(mr.status));
    const displayList = activeTab === 'Awaiting Verification' ? pendingReturnList : verifiedList;
    const handleOpenVerification = (mr)=>{
        setSelectedReq(mr);
        setEditingItems(mr.items.map((i)=>({
                ...i,
                returnedQty: i.returnedQty !== undefined ? i.returnedQty : 0
            })));
    };
    const handleQtyChange = (index, val)=>{
        setEditingItems((prev)=>prev.map((item, idx)=>idx === index ? {
                    ...item,
                    returnedQty: val
                } : item));
    };
    const handleAcceptSubmit = ()=>{
        if (!selectedReq) return;
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Accept Material Return?',
            text: `Confirm receipt of returned raw materials from ${selectedReq.requestNo} back into store godown stock? Status will change to 'Returned'.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0369a1',
            confirmButtonText: 'Yes, Verify & Accept Return'
        }).then((res)=>{
            if (res.isConfirmed) {
                confirmReturn(selectedReq.id, editingItems);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire('Return Verified!', `${selectedReq.requestNo} status updated to 'Returned' and stock reconciled.`, 'success');
                setSelectedReq(null);
            }
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            width: '100%',
            padding: '8px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#fff',
                    padding: '20px 24px',
                    borderRadius: '16px',
                    border: '1px solid #DCE5F0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    flexWrap: 'wrap',
                    gap: '16px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                style: {
                                    fontSize: '22px',
                                    fontWeight: '800',
                                    margin: 0,
                                    color: '#24345C',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCheck$3e$__["CheckCheck"], {
                                        size: 24,
                                        style: {
                                            color: '#0369a1'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                        lineNumber: 58,
                                        columnNumber: 13
                                    }, this),
                                    "Return Verification Board (Store Team)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                lineNumber: 57,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: '13px',
                                    color: '#5E6B82',
                                    margin: '4px 0 0 0'
                                },
                                children: "Step 8: Inspect and accept returned surplus materials back into store godown — Return Pending → Returned"
                            }, void 0, false, {
                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                lineNumber: 61,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                        lineNumber: 56,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '10px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActiveTab('Awaiting Verification'),
                                style: {
                                    padding: '10px 18px',
                                    borderRadius: '10px',
                                    border: `1px solid ${activeTab === 'Awaiting Verification' ? '#0369a1' : '#D6E2F0'}`,
                                    background: activeTab === 'Awaiting Verification' ? '#0369a1' : '#fff',
                                    color: activeTab === 'Awaiting Verification' ? '#fff' : '#334155',
                                    fontWeight: '700',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                        lineNumber: 83,
                                        columnNumber: 13
                                    }, this),
                                    " Pending Store Acceptance (",
                                    pendingReturnList.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                lineNumber: 67,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActiveTab('Verified Returns History'),
                                style: {
                                    padding: '10px 18px',
                                    borderRadius: '10px',
                                    border: `1px solid ${activeTab === 'Verified Returns History' ? '#24345C' : '#D6E2F0'}`,
                                    background: activeTab === 'Verified Returns History' ? '#24345C' : '#fff',
                                    color: activeTab === 'Verified Returns History' ? '#fff' : '#334155',
                                    fontWeight: '700',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                        lineNumber: 101,
                                        columnNumber: 13
                                    }, this),
                                    " Accepted History (",
                                    verifiedList.length,
                                    ")"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                lineNumber: 85,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                lineNumber: 55,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: '#fff',
                    borderRadius: '16px',
                    border: '1px solid #DCE5F0',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        overflowX: 'auto'
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        style: {
                            width: '100%',
                            borderCollapse: 'collapse',
                            textAlign: 'left'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    style: {
                                        background: '#F5FAFE',
                                        borderBottom: '1px solid #DCE5F0',
                                        color: '#475569',
                                        fontSize: '12px',
                                        textTransform: 'uppercase'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '14px 20px'
                                            },
                                            children: "Request No"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                            lineNumber: 112,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '14px 20px'
                                            },
                                            children: "Date"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                            lineNumber: 113,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '14px 20px'
                                            },
                                            children: "Work Order"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                            lineNumber: 114,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '14px 20px'
                                            },
                                            children: "Requester"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                            lineNumber: 115,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '14px 20px'
                                            },
                                            children: "Returned Items Summary"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                            lineNumber: 116,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '14px 20px'
                                            },
                                            children: "Priority"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                            lineNumber: 117,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '14px 20px'
                                            },
                                            children: "Status"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                            lineNumber: 118,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '14px 20px',
                                                textAlign: 'right'
                                            },
                                            children: "Actions"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                            lineNumber: 119,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                    lineNumber: 111,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                lineNumber: 110,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: displayList.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        colSpan: 8,
                                        style: {
                                            padding: '40px',
                                            textAlign: 'center',
                                            color: '#8893A7',
                                            fontSize: '14px'
                                        },
                                        children: activeTab === 'Awaiting Verification' ? '✨ No pending material returns awaiting store acceptance.' : 'No verified return history.'
                                    }, void 0, false, {
                                        fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                        lineNumber: 125,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                    lineNumber: 124,
                                    columnNumber: 17
                                }, this) : displayList.map((mr)=>{
                                    const isPending = mr.status === 'Return Pending';
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        style: {
                                            borderBottom: '1px solid #f1f5f9',
                                            background: isPending ? '#fff' : '#F5FAFE'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: '16px 20px',
                                                    fontWeight: '800',
                                                    fontFamily: 'monospace',
                                                    color: '#24345C'
                                                },
                                                children: mr.requestNo
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                lineNumber: 134,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: '16px 20px',
                                                    fontSize: '13px',
                                                    color: '#5E6B82'
                                                },
                                                children: mr.requestDate
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                lineNumber: 135,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: '16px 20px',
                                                    fontWeight: '700',
                                                    color: '#2563eb'
                                                },
                                                children: mr.workOrderNo || '—'
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                lineNumber: 136,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: '16px 20px',
                                                    fontSize: '13px',
                                                    color: '#334155',
                                                    fontWeight: '600'
                                                },
                                                children: mr.requester || 'Production Floor'
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                lineNumber: 137,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: '16px 20px',
                                                    fontWeight: '700'
                                                },
                                                children: mr.items?.filter((i)=>i.returnedQty > 0).map((i)=>`${i.material}: ${i.returnedQty} ${i.unit}`).join(', ') || 'See items'
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                lineNumber: 138,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: '16px 20px'
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        padding: '3px 10px',
                                                        borderRadius: '6px',
                                                        fontSize: '11px',
                                                        fontWeight: '800',
                                                        background: mr.priority === 'Urgent' ? '#fff1f2' : mr.priority === 'High' ? '#fffbeb' : '#F5FAFE',
                                                        color: mr.priority === 'Urgent' ? '#e11d48' : mr.priority === 'High' ? '#d97706' : '#475569'
                                                    },
                                                    children: mr.priority
                                                }, void 0, false, {
                                                    fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                    lineNumber: 142,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                lineNumber: 141,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: '16px 20px'
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        padding: '4px 12px',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                        fontWeight: '800',
                                                        background: isPending ? '#fff1f2' : '#e0f2fe',
                                                        color: isPending ? '#e11d48' : '#0369a1',
                                                        border: `1px solid ${isPending ? '#fecdd3' : '#7dd3fc'}`
                                                    },
                                                    children: mr.status
                                                }, void 0, false, {
                                                    fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                    lineNumber: 154,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                lineNumber: 153,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: '16px 20px',
                                                    textAlign: 'right'
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleOpenVerification(mr),
                                                    style: {
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        border: isPending ? 'none' : '1px solid #D6E2F0',
                                                        background: isPending ? '#0369a1' : '#fff',
                                                        color: isPending ? '#fff' : '#334155',
                                                        fontWeight: '700',
                                                        fontSize: '13px',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        boxShadow: isPending ? '0 4px 10px rgba(3, 105, 161, 0.2)' : 'none'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                            size: 15
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                            lineNumber: 184,
                                                            columnNumber: 27
                                                        }, this),
                                                        " ",
                                                        isPending ? 'Verify & Accept' : 'View Return Note'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                    lineNumber: 167,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                lineNumber: 166,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, mr.id, true, {
                                        fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                        lineNumber: 133,
                                        columnNumber: 21
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                lineNumber: 122,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                        lineNumber: 109,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                    lineNumber: 108,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                lineNumber: 107,
                columnNumber: 7
            }, this),
            selectedReq && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: '#fff',
                        borderRadius: '20px',
                        width: '700px',
                        maxWidth: '95vw',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: '28px',
                        border: '1px solid #DCE5F0',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                borderBottom: '1px solid #DCE5F0',
                                paddingBottom: '16px',
                                marginBottom: '20px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                color: '#0369a1'
                                            },
                                            children: "Store Return Verification Slip"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                            lineNumber: 202,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            style: {
                                                fontSize: '20px',
                                                fontWeight: '800',
                                                margin: '4px 0 0 0',
                                                color: '#24345C',
                                                fontFamily: 'monospace'
                                            },
                                            children: selectedReq.requestNo
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                            lineNumber: 203,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                    lineNumber: 201,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setSelectedReq(null),
                                    style: {
                                        background: '#F5FAFE',
                                        border: '1px solid #D6E2F0',
                                        borderRadius: '8px',
                                        padding: '6px 12px',
                                        cursor: 'pointer',
                                        fontWeight: '700'
                                    },
                                    children: "Close"
                                }, void 0, false, {
                                    fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                    lineNumber: 205,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                            lineNumber: 200,
                            columnNumber: 13
                        }, this),
                        selectedReq.notes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                background: '#fff1f2',
                                border: '1px solid #fecdd3',
                                padding: '12px',
                                borderRadius: '10px',
                                marginBottom: '20px',
                                fontSize: '13px',
                                color: '#9f1239'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: "Return Note from Floor:"
                                }, void 0, false, {
                                    fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                    lineNumber: 210,
                                    columnNumber: 17
                                }, this),
                                " ",
                                selectedReq.notes
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                            lineNumber: 209,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            style: {
                                fontSize: '14px',
                                fontWeight: '800',
                                color: '#24345C',
                                marginBottom: '12px'
                            },
                            children: "Verify Physical Quantity Accepted Back Into Store Godown"
                        }, void 0, false, {
                            fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                            lineNumber: 214,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            style: {
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '13px',
                                textAlign: 'left',
                                marginBottom: '24px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        style: {
                                            background: '#f1f5f9',
                                            color: '#475569',
                                            textTransform: 'uppercase',
                                            fontSize: '11px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    padding: '10px 14px'
                                                },
                                                children: "Material Item"
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                lineNumber: 221,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    padding: '10px 14px',
                                                    width: '110px'
                                                },
                                                children: "Received"
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                lineNumber: 222,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    padding: '10px 14px',
                                                    width: '110px'
                                                },
                                                children: "Consumed"
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                lineNumber: 223,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    padding: '10px 14px',
                                                    width: '150px'
                                                },
                                                children: "Returned Qty"
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                lineNumber: 224,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    padding: '10px 14px',
                                                    width: '60px'
                                                },
                                                children: "Unit"
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                lineNumber: 225,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                        lineNumber: 220,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                    lineNumber: 219,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: editingItems.map((item, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            style: {
                                                borderBottom: '1px solid #f1f5f9'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        padding: '12px 14px',
                                                        fontWeight: '700',
                                                        color: '#24345C'
                                                    },
                                                    children: item.material
                                                }, void 0, false, {
                                                    fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                    lineNumber: 231,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        padding: '12px 14px',
                                                        color: '#0284c7'
                                                    },
                                                    children: item.receivedQty
                                                }, void 0, false, {
                                                    fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                    lineNumber: 232,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        padding: '12px 14px',
                                                        color: '#7c3aed'
                                                    },
                                                    children: item.consumedQty
                                                }, void 0, false, {
                                                    fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                    lineNumber: 233,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        padding: '12px 14px'
                                                    },
                                                    children: selectedReq.status === 'Return Pending' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: "0",
                                                        step: "0.1",
                                                        value: item.returnedQty,
                                                        onChange: (e)=>handleQtyChange(idx, Number(e.target.value)),
                                                        style: {
                                                            width: '100%',
                                                            height: '36px',
                                                            padding: '0 10px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #0369a1',
                                                            fontWeight: '800',
                                                            color: '#0369a1',
                                                            fontSize: '14px'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                        lineNumber: 236,
                                                        columnNumber: 25
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontWeight: '800',
                                                            color: '#0369a1'
                                                        },
                                                        children: item.returnedQty
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                        lineNumber: 245,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                    lineNumber: 234,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        padding: '12px 14px',
                                                        color: '#5E6B82'
                                                    },
                                                    children: item.unit
                                                }, void 0, false, {
                                                    fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                                    lineNumber: 248,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, idx, true, {
                                            fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                            lineNumber: 230,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                    lineNumber: 228,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                            lineNumber: 218,
                            columnNumber: 13
                        }, this),
                        selectedReq.status === 'Return Pending' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleAcceptSubmit,
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '10px 24px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: '#0369a1',
                                    color: '#fff',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(3, 105, 161, 0.25)'
                                },
                                children: "Confirm Godown Stock Acceptance"
                            }, void 0, false, {
                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                lineNumber: 256,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                            lineNumber: 255,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                justifyContent: 'flex-end'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setSelectedReq(null),
                                style: {
                                    padding: '10px 24px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: '#24345C',
                                    color: '#fff',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                },
                                children: "Close"
                            }, void 0, false, {
                                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                                lineNumber: 265,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                            lineNumber: 264,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                    lineNumber: 199,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
                lineNumber: 198,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/material-workflow/StoreMaterialReturnVerificationView.jsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/common/ModulePlaceholder.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ModulePlaceholder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
function ModulePlaceholder({ title, description, route }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '320px',
            padding: '48px 24px',
            textAlign: 'center',
            background: 'linear-gradient(145deg, #F5FAFE 0%, #EFF6FF 100%)',
            borderRadius: '16px',
            border: '2px dashed #D6E2F0'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #e0f2fe, #bfdbfe)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    fontSize: '36px',
                    boxShadow: '0 8px 24px rgba(47, 67, 117, 0.12)'
                },
                children: "🚧"
            }, void 0, false, {
                fileName: "[project]/components/common/ModulePlaceholder.jsx",
                lineNumber: 18,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: '#FEF3C7',
                    color: '#92400E',
                    fontSize: '11px',
                    fontWeight: '800',
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                    marginBottom: '12px'
                },
                children: "Coming Soon"
            }, void 0, false, {
                fileName: "[project]/components/common/ModulePlaceholder.jsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                style: {
                    margin: '0 0 8px 0',
                    fontSize: '22px',
                    fontWeight: '800',
                    color: '#24345C',
                    letterSpacing: '-0.3px'
                },
                children: title
            }, void 0, false, {
                fileName: "[project]/components/common/ModulePlaceholder.jsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    margin: '0 0 20px 0',
                    fontSize: '14px',
                    color: '#5E6B82',
                    maxWidth: '380px',
                    lineHeight: '1.6'
                },
                children: description || 'This module is under active development and will be available soon.'
            }, void 0, false, {
                fileName: "[project]/components/common/ModulePlaceholder.jsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            route && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                style: {
                    display: 'inline-block',
                    padding: '6px 16px',
                    borderRadius: '8px',
                    background: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: '1px solid #BFDBFE',
                    fontFamily: 'monospace'
                },
                children: route
            }, void 0, false, {
                fileName: "[project]/components/common/ModulePlaceholder.jsx",
                lineNumber: 56,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/common/ModulePlaceholder.jsx",
        lineNumber: 5,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=components_70abee6f._.js.map