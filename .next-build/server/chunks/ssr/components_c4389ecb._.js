module.exports = [
"[project]/components/ui/ConfirmDialog.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ConfirmDialog",
    ()=>ConfirmDialog,
    "useConfirm",
    ()=>useConfirm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs [app-ssr] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield.mjs [app-ssr] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.mjs [app-ssr] (ecmascript) <export default as Info>");
;
;
;
const typeConfigs = {
    danger: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"],
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        buttonBg: 'bg-red-600 hover:bg-red-700',
        buttonText: 'Delete'
    },
    warning: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"],
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
        buttonText: 'Confirm'
    },
    info: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"],
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        buttonBg: 'bg-blue-600 hover:bg-blue-700',
        buttonText: 'OK'
    },
    critical: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"],
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        buttonBg: 'bg-purple-600 hover:bg-purple-700',
        buttonText: 'Confirm'
    }
};
const ConfirmDialog = ({ isOpen = false, onClose, onConfirm, title = 'Confirm Action', message = 'Are you sure you want to proceed?', confirmText, cancelText = 'Cancel', type = 'danger', isLoading = false })=>{
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (isOpen) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [
        isOpen
    ]);
    const config = typeConfigs[type] || typeConfigs.danger;
    const Icon = config.icon;
    if (!isOpen && !isVisible) return null;
    const handleClose = ()=>{
        if (!isLoading) {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }
    };
    const handleConfirm = ()=>{
        if (!isLoading) {
            onConfirm();
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-black bg-opacity-50",
                onClick: handleClose
            }, void 0, false, {
                fileName: "[project]/components/ui/ConfirmDialog.jsx",
                lineNumber: 79,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 transform transition-transform duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleClose,
                        disabled: isLoading,
                        className: "absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition disabled:opacity-50",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            className: "w-5 h-5"
                        }, void 0, false, {
                            fileName: "[project]/components/ui/ConfirmDialog.jsx",
                            lineNumber: 94,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/ui/ConfirmDialog.jsx",
                        lineNumber: 89,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `mx-auto w-14 h-14 ${config.iconBg} rounded-full flex items-center justify-center mb-4`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                            className: `w-7 h-7 ${config.iconColor}`
                        }, void 0, false, {
                            fileName: "[project]/components/ui/ConfirmDialog.jsx",
                            lineNumber: 99,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/ui/ConfirmDialog.jsx",
                        lineNumber: 98,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-semibold text-center text-gray-900 mb-2",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/components/ui/ConfirmDialog.jsx",
                        lineNumber: 103,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600 text-center mb-6",
                        children: message
                    }, void 0, false, {
                        fileName: "[project]/components/ui/ConfirmDialog.jsx",
                        lineNumber: 108,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col sm:flex-row items-center justify-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleClose,
                                disabled: isLoading,
                                className: "w-full sm:w-auto px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50",
                                children: cancelText
                            }, void 0, false, {
                                fileName: "[project]/components/ui/ConfirmDialog.jsx",
                                lineNumber: 114,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleConfirm,
                                disabled: isLoading,
                                className: `w-full sm:w-auto px-6 py-2 text-white rounded-lg transition ${config.buttonBg} disabled:opacity-50 flex items-center justify-center`,
                                children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white",
                                            xmlns: "http://www.w3.org/2000/svg",
                                            fill: "none",
                                            viewBox: "0 0 24 24",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                    className: "opacity-25",
                                                    cx: "12",
                                                    cy: "12",
                                                    r: "10",
                                                    stroke: "currentColor",
                                                    strokeWidth: "4"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ui/ConfirmDialog.jsx",
                                                    lineNumber: 129,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    className: "opacity-75",
                                                    fill: "currentColor",
                                                    d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ui/ConfirmDialog.jsx",
                                                    lineNumber: 130,
                                                    columnNumber: 19
                                                }, ("TURBOPACK compile-time value", void 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/ui/ConfirmDialog.jsx",
                                            lineNumber: 128,
                                            columnNumber: 17
                                        }, ("TURBOPACK compile-time value", void 0)),
                                        "Processing..."
                                    ]
                                }, void 0, true) : confirmText || config.buttonText
                            }, void 0, false, {
                                fileName: "[project]/components/ui/ConfirmDialog.jsx",
                                lineNumber: 121,
                                columnNumber: 11
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ui/ConfirmDialog.jsx",
                        lineNumber: 113,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/ConfirmDialog.jsx",
                lineNumber: 85,
                columnNumber: 7
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/ConfirmDialog.jsx",
        lineNumber: 75,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const useConfirm = ()=>{
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [config, setConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [resolve, setResolve] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const confirm = (options)=>{
        return new Promise((res)=>{
            setConfig({
                title: options.title || 'Confirm Action',
                message: options.message || 'Are you sure?',
                confirmText: options.confirmText,
                cancelText: options.cancelText || 'Cancel',
                type: options.type || 'danger'
            });
            setResolve(()=>res);
            setIsOpen(true);
        });
    };
    const handleConfirm = ()=>{
        setIsOpen(false);
        if (resolve) {
            resolve(true);
            setResolve(null);
        }
    };
    const handleCancel = ()=>{
        setIsOpen(false);
        if (resolve) {
            resolve(false);
            setResolve(null);
        }
    };
    const ConfirmDialogComponent = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ConfirmDialog, {
            isOpen: isOpen,
            onClose: handleCancel,
            onConfirm: handleConfirm,
            ...config
        }, void 0, false, {
            fileName: "[project]/components/ui/ConfirmDialog.jsx",
            lineNumber: 181,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0));
    return {
        confirm,
        ConfirmDialogComponent
    };
};
}),
"[project]/components/OrderTimeline.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>OrderTimeline
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$domains$2f$shared$2f$workflowUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/domains/shared/workflowUtils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.mjs [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.mjs [app-ssr] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.mjs [app-ssr] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.mjs [app-ssr] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/truck.mjs [app-ssr] (ecmascript) <export default as Truck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.mjs [app-ssr] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/credit-card.mjs [app-ssr] (ecmascript) <export default as CreditCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$archive$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Archive$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/archive.mjs [app-ssr] (ecmascript) <export default as Archive>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.mjs [app-ssr] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs [app-ssr] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$paperclip$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Paperclip$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/paperclip.mjs [app-ssr] (ecmascript) <export default as Paperclip>");
;
;
;
;
;
const MILESTONE_GROUPS = [
    {
        id: 'Created',
        label: 'Created',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"],
        microStages: [
            'Created',
            'Quoted'
        ]
    },
    {
        id: 'Planned',
        label: 'Planned',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"],
        microStages: [
            'Confirmed',
            'Planned'
        ]
    },
    {
        id: 'Production',
        label: 'Production',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"],
        microStages: [
            'Material Requested',
            'Material Approved',
            'Material Issued',
            'In Production'
        ]
    },
    {
        id: 'QC',
        label: 'QC',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"],
        microStages: [
            'QC Pending',
            'QC Passed'
        ],
        failureStage: 'QC Failed'
    },
    {
        id: 'Dispatch',
        label: 'Dispatch',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"],
        microStages: [
            'Dispatch Planned',
            'Dispatched',
            'In Transit'
        ],
        failureStage: 'Dispatch Failed'
    },
    {
        id: 'Delivered',
        label: 'Delivered',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"],
        microStages: [
            'Delivered'
        ]
    },
    {
        id: 'Payment',
        label: 'Payment',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"],
        microStages: [
            'Payment Pending',
            'Payment Verified'
        ],
        failureStage: 'Payment Rejected'
    },
    {
        id: 'Closed',
        label: 'Closed',
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$archive$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Archive$3e$__["Archive"],
        microStages: [
            'Closed'
        ]
    }
];
const getStageColor = (status)=>{
    if (status === 'Failed') return {
        color: '#ef4444',
        bg: '#fef2f2',
        border: '#fecdd3'
    };
    if (status === 'Completed') return {
        color: '#10b981',
        bg: '#ecfdf5',
        border: '#a7f3d0'
    };
    if (status === 'Active') return {
        color: '#3b82f6',
        bg: '#eff6ff',
        border: '#bfdbfe'
    };
    return {
        color: '#5E6B82',
        bg: '#F5FAFE',
        border: '#DCE5F0'
    };
};
const getStageIcon = (stage)=>{
    const s = stage || '';
    if (s.includes('Created')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"];
    if (s.includes('Planned')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"];
    if (s.includes('Material Requested') || s.includes('Mat Req')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"];
    if (s.includes('Approved')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"];
    if (s.includes('Issued')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"];
    if (s.includes('Production') || s.includes('In Production')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"];
    if (s.includes('Work Order')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"];
    if (s.includes('QC Passed') || s.includes('QC OK') || s.includes('Passed')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"];
    if (s.includes('QC Pending') || s.includes('QC Check')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"];
    if (s.includes('Dispatch') || s.includes('DSP') || s.includes('Dispatched')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"];
    if (s.includes('Transit') || s.includes('Route') || s.includes('In Transit')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"];
    if (s.includes('Delivered')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"];
    if (s.includes('Payment Pending') || s.includes('Pay Pending') || s.includes('Invoice')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"];
    if (s.includes('Verified') || s.includes('Payment Verified')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"];
    if (s.includes('Closed')) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$archive$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Archive$3e$__["Archive"];
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"];
};
const renderRemarks = (remarks)=>{
    if (!remarks) return null;
    const fileRegex = /([a-zA-Z0-9_\-\(\)\.]+\.(png|jpg|jpeg|webp|pdf))/i;
    const match = remarks.match(fileRegex);
    if (match) {
        const filename = match[1];
        const parts = remarks.split(filename);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        fontSize: '12px',
                        color: 'var(--color-text-primary)',
                        margin: 0,
                        fontWeight: '500',
                        lineHeight: '1.4'
                    },
                    children: [
                        parts[0],
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontWeight: '700',
                                color: 'var(--color-accent-teal, #337a86)',
                                wordBreak: 'break-all'
                            },
                            children: filename
                        }, void 0, false, {
                            fileName: "[project]/components/OrderTimeline.jsx",
                            lineNumber: 72,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        parts[1]
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/OrderTimeline.jsx",
                    lineNumber: 70,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'var(--color-bg-base)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        marginTop: '2px',
                        width: 'fit-content',
                        maxWidth: '100%'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$paperclip$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Paperclip$3e$__["Paperclip"], {
                            size: 12,
                            color: "var(--color-text-secondary)"
                        }, void 0, false, {
                            fileName: "[project]/components/OrderTimeline.jsx",
                            lineNumber: 87,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontSize: '11px',
                                color: 'var(--color-text-secondary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '180px'
                            },
                            children: filename
                        }, void 0, false, {
                            fileName: "[project]/components/OrderTimeline.jsx",
                            lineNumber: 88,
                            columnNumber: 11
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/OrderTimeline.jsx",
                    lineNumber: 75,
                    columnNumber: 9
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/OrderTimeline.jsx",
            lineNumber: 69,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        style: {
            fontSize: '12px',
            color: 'var(--color-text-primary)',
            margin: 0,
            fontWeight: '500',
            lineHeight: '1.4'
        },
        children: remarks
    }, void 0, false, {
        fileName: "[project]/components/OrderTimeline.jsx",
        lineNumber: 97,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
function OrderTimeline({ orderId, compact = false }) {
    const canonicalState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useERPStore"])((store)=>store.state);
    const [revision, setRevision] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const timeline = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$domains$2f$shared$2f$workflowUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectOrderTimeline"])(canonicalState, orderId), [
        canonicalState,
        orderId,
        revision
    ]);
    const [selectedMilestone, setSelectedMilestone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const activeNodeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Auto scroll to active node on mount/update
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (activeNodeRef.current) {
            setTimeout(()=>{
                activeNodeRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }, 300);
        }
    }, [
        timeline
    ]);
    if (!orderId) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "glass-card",
            style: {
                padding: '20px',
                textAlign: 'center',
                color: 'var(--color-text-muted)'
            },
            children: "No order reference specified."
        }, void 0, false, {
            fileName: "[project]/components/OrderTimeline.jsx",
            lineNumber: 129,
            columnNumber: 7
        }, this);
    }
    if (timeline.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "glass-card",
            style: {
                padding: '24px',
                textAlign: 'center',
                color: 'var(--color-text-muted)'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                    style: {
                        margin: '0 auto 8px',
                        display: 'block',
                        opacity: 0.5
                    },
                    size: 24
                }, void 0, false, {
                    fileName: "[project]/components/OrderTimeline.jsx",
                    lineNumber: 138,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        margin: 0,
                        fontSize: '13px',
                        fontWeight: '600'
                    },
                    children: [
                        "No events recorded for order ",
                        orderId,
                        " yet."
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/OrderTimeline.jsx",
                    lineNumber: 139,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: ()=>setRevision((value)=>value + 1),
                    style: {
                        marginTop: 10
                    },
                    children: "Rebuild from ERP State"
                }, void 0, false, {
                    fileName: "[project]/components/OrderTimeline.jsx",
                    lineNumber: 140,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/OrderTimeline.jsx",
            lineNumber: 137,
            columnNumber: 7
        }, this);
    }
    // Deduce stage info
    const latestEvent = timeline[timeline.length - 1];
    const currentStage = latestEvent ? latestEvent.stage : 'Created';
    // Determine active milestone index
    let activeIndex = 0;
    let isFailedState = false;
    let activeMilestoneId = 'Created';
    MILESTONE_GROUPS.forEach((milestone, idx)=>{
        const hasSucceeded = milestone.microStages.some((s)=>timeline.some((t)=>t.stage === s));
        const hasFailed = milestone.failureStage && timeline.some((t)=>t.stage === milestone.failureStage);
        if (hasFailed) {
            activeIndex = idx;
            isFailedState = true;
            activeMilestoneId = milestone.id;
        } else if (hasSucceeded || milestone.microStages.includes(currentStage)) {
            activeIndex = idx;
            activeMilestoneId = milestone.id;
        }
    });
    const pct = Math.round(activeIndex / (MILESTONE_GROUPS.length - 1) * 100);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                    padding: '24px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    backdropFilter: 'blur(20px)',
                    color: '#ffffff'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '10px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: isFailedState ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                            border: `1px solid ${isFailedState ? '#ef4444' : '#10b981'}30`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                            size: 14,
                                            color: isFailedState ? '#ef4444' : '#10b981'
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrderTimeline.jsx",
                                            lineNumber: 196,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrderTimeline.jsx",
                                        lineNumber: 190,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '13px',
                                                    fontWeight: '800',
                                                    letterSpacing: '-0.2px',
                                                    color: '#F5FAFE'
                                                },
                                                children: "Pipeline Milestone Tracking"
                                            }, void 0, false, {
                                                fileName: "[project]/components/OrderTimeline.jsx",
                                                lineNumber: 199,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '11px',
                                                    color: '#8893A7',
                                                    fontWeight: '600'
                                                },
                                                children: [
                                                    "Active State: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            color: isFailedState ? '#f87171' : '#34d399',
                                                            fontWeight: '800'
                                                        },
                                                        children: currentStage
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/OrderTimeline.jsx",
                                                        lineNumber: 203,
                                                        columnNumber: 31
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/OrderTimeline.jsx",
                                                lineNumber: 202,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/OrderTimeline.jsx",
                                        lineNumber: 198,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/OrderTimeline.jsx",
                                lineNumber: 189,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            fontSize: '10px',
                                            fontWeight: '700',
                                            color: isFailedState ? '#ef4444' : currentStage === 'Closed' ? '#10b981' : '#3b82f6',
                                            background: isFailedState ? 'rgba(239, 68, 68, 0.15)' : currentStage === 'Closed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                            border: `1px solid ${isFailedState ? '#fca5a5' : currentStage === 'Closed' ? '#a7f3d0' : '#bfdbfe'}25`,
                                            padding: '4px 10px',
                                            borderRadius: '12px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "timeline-pulse-dot",
                                                style: {
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    background: isFailedState ? '#ef4444' : currentStage === 'Closed' ? '#10b981' : '#3b82f6',
                                                    display: 'inline-block'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/OrderTimeline.jsx",
                                                lineNumber: 217,
                                                columnNumber: 15
                                            }, this),
                                            isFailedState ? 'Workflow Halted' : currentStage === 'Closed' ? 'Closed & Settled' : 'In Transit/Flow'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/OrderTimeline.jsx",
                                        lineNumber: 209,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: '12.5px',
                                            fontWeight: '900',
                                            color: isFailedState ? '#f87171' : '#10b981'
                                        },
                                        children: [
                                            pct,
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/OrderTimeline.jsx",
                                        lineNumber: 224,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/OrderTimeline.jsx",
                                lineNumber: 208,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/OrderTimeline.jsx",
                        lineNumber: 188,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hide-scrollbar",
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '10px 0 45px 0',
                            position: 'relative',
                            overflowX: 'auto',
                            overflowY: 'hidden',
                            gap: '12px'
                        },
                        children: MILESTONE_GROUPS.map((milestone, idx)=>{
                            const hasFailed = milestone.failureStage && timeline.some((t)=>t.stage === milestone.failureStage);
                            const isCompleted = currentStage === 'Closed' || !hasFailed && idx < activeIndex;
                            const isActive = idx === activeIndex && currentStage !== 'Closed';
                            let milestoneStatus = 'Pending';
                            if (hasFailed) milestoneStatus = 'Failed';
                            else if (isCompleted) milestoneStatus = 'Completed';
                            else if (isActive) milestoneStatus = 'Active';
                            const Icon = milestone.icon;
                            const colors = getStageColor(milestoneStatus);
                            let pulseStyle = {};
                            if (milestoneStatus === 'Active') {
                                pulseStyle = {
                                    boxShadow: `0 0 0 5px rgba(59, 130, 246, 0.25)`,
                                    animation: 'timelineActivePulse 1.8s infinite ease-in-out'
                                };
                            }
                            const isSelected = selectedMilestone?.id === milestone.id;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        ref: isActive ? activeNodeRef : null,
                                        onClick: ()=>{
                                            setSelectedMilestone(isSelected ? null : milestone);
                                        },
                                        title: `${milestone.label} (${milestoneStatus})`,
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            zIndex: 2,
                                            position: 'relative',
                                            flex: '1 0 70px',
                                            cursor: 'pointer',
                                            transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                            transition: 'transform 0.2s ease'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: milestoneStatus === 'Pending' ? '#1e293b' : colors.bg,
                                                    border: `2px solid ${colors.border}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: milestoneStatus === 'Pending' ? '#5E6B82' : colors.color,
                                                    transition: 'all 0.3s ease',
                                                    ...pulseStyle
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                    size: 14,
                                                    strokeWidth: 2.5
                                                }, void 0, false, {
                                                    fileName: "[project]/components/OrderTimeline.jsx",
                                                    lineNumber: 300,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/OrderTimeline.jsx",
                                                lineNumber: 287,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '10px',
                                                    fontWeight: '700',
                                                    color: isSelected ? '#ffffff' : milestoneStatus === 'Pending' ? '#5E6B82' : '#D6E2F0',
                                                    textAlign: 'center',
                                                    whiteSpace: 'nowrap'
                                                },
                                                children: milestone.label
                                            }, void 0, false, {
                                                fileName: "[project]/components/OrderTimeline.jsx",
                                                lineNumber: 303,
                                                columnNumber: 19
                                            }, this),
                                            milestoneStatus === 'Failed' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    position: 'absolute',
                                                    top: '40px',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    zIndex: 5
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            width: '2px',
                                                            height: '12px',
                                                            background: '#ef4444'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/OrderTimeline.jsx",
                                                        lineNumber: 325,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            width: '14px',
                                                            height: '14px',
                                                            borderRadius: '50%',
                                                            background: '#ef4444',
                                                            border: '2px solid #ffffff',
                                                            boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/OrderTimeline.jsx",
                                                        lineNumber: 326,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '8.5px',
                                                            color: '#f87171',
                                                            fontWeight: '800',
                                                            whiteSpace: 'nowrap',
                                                            marginTop: '3px'
                                                        },
                                                        children: milestone.failureStage
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/OrderTimeline.jsx",
                                                        lineNumber: 337,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/OrderTimeline.jsx",
                                                lineNumber: 315,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/OrderTimeline.jsx",
                                        lineNumber: 268,
                                        columnNumber: 17
                                    }, this),
                                    idx < MILESTONE_GROUPS.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: milestoneStatus === 'Completed' || milestoneStatus === 'Active' ? 'animated-connector' : '',
                                        style: {
                                            flex: '1 1 auto',
                                            height: '3px',
                                            background: milestoneStatus === 'Completed' ? '#10b981' : milestoneStatus === 'Failed' ? '#ef4444' : '#334155',
                                            margin: '0 -10px 20px -10px',
                                            zIndex: 1,
                                            minWidth: '24px'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrderTimeline.jsx",
                                        lineNumber: 346,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, idx, true, {
                                fileName: "[project]/components/OrderTimeline.jsx",
                                lineNumber: 266,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/components/OrderTimeline.jsx",
                        lineNumber: 231,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/OrderTimeline.jsx",
                lineNumber: 174,
                columnNumber: 7
            }, this),
            selectedMilestone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    animation: 'timelineDrawerSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                style: {
                                    fontSize: '13px',
                                    fontWeight: '800',
                                    margin: 0,
                                    color: '#F5FAFE',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: 'var(--color-primary)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrderTimeline.jsx",
                                        lineNumber: 378,
                                        columnNumber: 15
                                    }, this),
                                    selectedMilestone.label,
                                    " Milestone - Sub-Stages"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/OrderTimeline.jsx",
                                lineNumber: 377,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setSelectedMilestone(null),
                                style: {
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#8893A7',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                },
                                children: "Close"
                            }, void 0, false, {
                                fileName: "[project]/components/OrderTimeline.jsx",
                                lineNumber: 381,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/OrderTimeline.jsx",
                        lineNumber: 376,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '12px'
                        },
                        children: [
                            ...selectedMilestone.microStages,
                            selectedMilestone.failureStage
                        ].filter(Boolean).map((stage, sIdx)=>{
                            const matchedLog = timeline.find((t)=>t.stage === stage);
                            const isFailedStage = stage === selectedMilestone.failureStage;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: matchedLog ? isFailedStage ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                                    border: `1.5px solid ${matchedLog ? isFailedStage ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)'}`,
                                    borderRadius: '8px',
                                    padding: '10px 14px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '11.5px',
                                                    fontWeight: '800',
                                                    color: matchedLog ? isFailedStage ? '#f87171' : '#34d399' : '#5E6B82'
                                                },
                                                children: stage
                                            }, void 0, false, {
                                                fileName: "[project]/components/OrderTimeline.jsx",
                                                lineNumber: 405,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '9px',
                                                    color: '#8893A7'
                                                },
                                                children: matchedLog ? 'Cleared ✓' : 'Awaiting'
                                            }, void 0, false, {
                                                fileName: "[project]/components/OrderTimeline.jsx",
                                                lineNumber: 408,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/OrderTimeline.jsx",
                                        lineNumber: 404,
                                        columnNumber: 19
                                    }, this),
                                    matchedLog ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '9.5px',
                                                    color: '#D6E2F0',
                                                    fontWeight: '500'
                                                },
                                                children: [
                                                    matchedLog.date,
                                                    " ",
                                                    matchedLog.time
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/OrderTimeline.jsx",
                                                lineNumber: 414,
                                                columnNumber: 23
                                            }, this),
                                            matchedLog.remarks && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                style: {
                                                    fontSize: '10.5px',
                                                    color: '#8893A7',
                                                    margin: '4px 0 0 0',
                                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                                    paddingTop: '4px',
                                                    lineHeight: '1.3'
                                                },
                                                children: matchedLog.remarks
                                            }, void 0, false, {
                                                fileName: "[project]/components/OrderTimeline.jsx",
                                                lineNumber: 418,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '9.5px',
                                            color: '#475569',
                                            fontStyle: 'italic'
                                        },
                                        children: "Pending workflow step"
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrderTimeline.jsx",
                                        lineNumber: 424,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, sIdx, true, {
                                fileName: "[project]/components/OrderTimeline.jsx",
                                lineNumber: 395,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/components/OrderTimeline.jsx",
                        lineNumber: 389,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/OrderTimeline.jsx",
                lineNumber: 366,
                columnNumber: 9
            }, this),
            !compact && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    backdropFilter: 'blur(20px)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                        style: {
                            fontSize: '13px',
                            fontWeight: '800',
                            color: '#F5FAFE',
                            margin: '0 0 4px 0'
                        },
                        children: "Event Log History"
                    }, void 0, false, {
                        fileName: "[project]/components/OrderTimeline.jsx",
                        lineNumber: 446,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        },
                        children: [
                            ...timeline
                        ].reverse().map((event, idx)=>{
                            const isFailedEvent = event.stage.includes('Failed') || event.stage.includes('Rejected');
                            const stageColor = getStageColor(isFailedEvent ? 'Failed' : idx === 0 ? 'Active' : 'Completed');
                            const StageIcon = getStageIcon(event.stage);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    gap: '12px',
                                    position: 'relative'
                                },
                                children: [
                                    idx < timeline.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            position: 'absolute',
                                            left: '11px',
                                            top: '24px',
                                            bottom: '-20px',
                                            width: '2px',
                                            background: 'rgba(255, 255, 255, 0.08)',
                                            opacity: 0.6
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrderTimeline.jsx",
                                        lineNumber: 459,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            background: stageColor.bg,
                                            border: `1.5px solid ${stageColor.color}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: stageColor.color,
                                            flexShrink: 0,
                                            zIndex: 2
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StageIcon, {
                                            size: 10
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrderTimeline.jsx",
                                            lineNumber: 483,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrderTimeline.jsx",
                                        lineNumber: 470,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '4px',
                                            background: 'rgba(255, 255, 255, 0.02)',
                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                            borderLeft: `3px solid ${stageColor.color}`,
                                            borderRadius: '8px',
                                            padding: '10px 14px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    flexWrap: 'wrap',
                                                    gap: '6px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '12px',
                                                            fontWeight: '800',
                                                            color: stageColor.color
                                                        },
                                                        children: event.stage
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/OrderTimeline.jsx",
                                                        lineNumber: 498,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '10px',
                                                            color: '#8893A7',
                                                            fontWeight: '600'
                                                        },
                                                        children: [
                                                            event.date,
                                                            " ",
                                                            event.time
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/OrderTimeline.jsx",
                                                        lineNumber: 501,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/OrderTimeline.jsx",
                                                lineNumber: 497,
                                                columnNumber: 21
                                            }, this),
                                            renderRemarks(event.remarks)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/OrderTimeline.jsx",
                                        lineNumber: 486,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, idx, true, {
                                fileName: "[project]/components/OrderTimeline.jsx",
                                lineNumber: 457,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/components/OrderTimeline.jsx",
                        lineNumber: 450,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/OrderTimeline.jsx",
                lineNumber: 435,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                dangerouslySetInnerHTML: {
                    __html: `
        @keyframes timelineActivePulse {
          0% { box-shadow: 0 0 0 0px rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0px rgba(59, 130, 246, 0); }
        }
        @keyframes gradient-wave {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .animated-connector {
          background: linear-gradient(90deg, #10b981 0%, #34d399 25%, #10b981 50%, #34d399 75%, #10b981 100%);
          background-size: 200% auto;
          animation: gradient-wave 2s linear infinite;
        }
        @keyframes timelineDrawerSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `
                }
            }, void 0, false, {
                fileName: "[project]/components/OrderTimeline.jsx",
                lineNumber: 515,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/OrderTimeline.jsx",
        lineNumber: 171,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PlantHeadMaterialApprovalView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.esm.all.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2f$shallow$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react/shallow.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$materialFlow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/store/materialFlow.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.mjs [app-ssr] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.mjs [app-ssr] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.mjs [app-ssr] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.mjs [app-ssr] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$check$2d$big$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square-check-big.mjs [app-ssr] (ecmascript) <export default as CheckSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.mjs [app-ssr] (ecmascript) <export default as Clock>");
'use client';
;
;
;
;
;
;
;
function PlantHeadMaterialApprovalView() {
    const submittedList = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useERPStore"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2f$shallow$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useShallow"])((s)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$materialFlow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["selectPlantHeadPendingRequests"])(s.state)));
    const allList = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useERPStore"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2f$shallow$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useShallow"])((s)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$materialFlow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["selectPlantHeadHistoryRequests"])(s.state)));
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('Pending Approval');
    const [selectedReq, setSelectedReq] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editingItems, setEditingItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const displayList = activeTab === 'Pending Approval' ? submittedList : allList;
    const handleOpenReview = (mr)=>{
        setSelectedReq(mr);
        setEditingItems(mr.items.map((i)=>({
                ...i,
                approvedQty: i.approvedQty !== undefined && i.approvedQty !== null ? i.approvedQty : i.requestedQty
            })));
    };
    const handleQtyChange = (index, val)=>{
        setEditingItems((prev)=>prev.map((item, idx)=>idx === index ? {
                    ...item,
                    approvedQty: val
                } : item));
    };
    const handleApprove = (status)=>{
        if (!selectedReq) return;
        if (status === 'Approved' && editingItems.some((i)=>i.approvedQty < 0)) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'error',
                title: 'Invalid Quantity',
                text: 'Approved quantity cannot be negative.'
            });
            return;
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire({
            title: `${status} Request?`,
            text: status === 'Approved' ? `Approve material requisition ${selectedReq.requestNo}? Store will be authorized to issue materials.` : `Are you sure you want to REJECT ${selectedReq.requestNo}?`,
            icon: status === 'Approved' ? 'success' : 'warning',
            showCancelButton: true,
            confirmButtonColor: status === 'Approved' ? '#16a34a' : '#dc2626',
            confirmButtonText: `Yes, ${status}`
        }).then((res)=>{
            if (res.isConfirmed) {
                if (status === 'Approved') {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$materialFlow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["approveMaterialRequest"])(selectedReq.id, editingItems, 'Plant Head');
                } else {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$materialFlow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["rejectMaterialRequest"])(selectedReq.id, 'Plant Head');
                }
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire(status === 'Approved' ? 'Approved!' : 'Rejected', `Request ${selectedReq.requestNo} status updated to ${status}.`, 'success');
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
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                        size: 24,
                                        style: {
                                            color: '#16a34a'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                        lineNumber: 71,
                                        columnNumber: 13
                                    }, this),
                                    "Material Approval Board (Plant Head)"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                lineNumber: 70,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: '13px',
                                    color: '#5E6B82',
                                    margin: '4px 0 0 0'
                                },
                                children: "Step 3: Review raw material requisitions from production floor — Submitted → Approved / Rejected"
                            }, void 0, false, {
                                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                lineNumber: 74,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '10px'
                        },
                        children: [
                            'Pending Approval',
                            'All History'
                        ].map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setActiveTab(tab),
                                style: {
                                    padding: '10px 18px',
                                    borderRadius: '10px',
                                    border: `1px solid ${activeTab === tab ? '#16a34a' : '#D6E2F0'}`,
                                    background: activeTab === tab ? '#16a34a' : '#fff',
                                    color: activeTab === tab ? '#fff' : '#334155',
                                    fontWeight: '700',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                },
                                children: [
                                    tab === 'Pending Approval' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                        lineNumber: 81,
                                        columnNumber: 45
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$check$2d$big$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckSquare$3e$__["CheckSquare"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                        lineNumber: 81,
                                        columnNumber: 67
                                    }, this),
                                    tab,
                                    " (",
                                    tab === 'Pending Approval' ? submittedList.length : allList.length,
                                    ")"
                                ]
                            }, tab, true, {
                                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                lineNumber: 80,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                        lineNumber: 78,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                lineNumber: 68,
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
                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                            lineNumber: 94,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '14px 20px'
                                            },
                                            children: "Date"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                            lineNumber: 95,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '14px 20px'
                                            },
                                            children: "Work Order"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                            lineNumber: 96,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '14px 20px'
                                            },
                                            children: "Requester"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                            lineNumber: 97,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '14px 20px'
                                            },
                                            children: "Items"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                            lineNumber: 98,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '14px 20px'
                                            },
                                            children: "Priority"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                            lineNumber: 99,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '14px 20px'
                                            },
                                            children: "Status"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                            lineNumber: 100,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                padding: '14px 20px',
                                                textAlign: 'right'
                                            },
                                            children: "Actions"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                            lineNumber: 101,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                    lineNumber: 93,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                lineNumber: 92,
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
                                        children: activeTab === 'Pending Approval' ? 'No material requests awaiting approval.' : 'No material request history.'
                                    }, void 0, false, {
                                        fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                        lineNumber: 106,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                    lineNumber: 106,
                                    columnNumber: 17
                                }, this) : displayList.map((mr)=>{
                                    const isPending = mr.status === 'PENDING_PLANT_HEAD_APPROVAL';
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
                                                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                lineNumber: 114,
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
                                                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                lineNumber: 115,
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
                                                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                lineNumber: 116,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: '16px 20px',
                                                    fontSize: '13px',
                                                    color: '#334155',
                                                    fontWeight: '600'
                                                },
                                                children: mr.requester || 'Production Team'
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                lineNumber: 117,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: '16px 20px',
                                                    fontWeight: '700'
                                                },
                                                children: [
                                                    mr.items?.length || 0,
                                                    " items"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                lineNumber: 118,
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
                                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                    lineNumber: 120,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                lineNumber: 119,
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
                                                        background: isPending ? '#eff6ff' : mr.status === 'PLANT_HEAD_APPROVED' ? '#f0fdf4' : mr.status === 'PLANT_HEAD_REJECTED' ? '#fef2f2' : '#ecfdf5',
                                                        color: isPending ? '#2563eb' : mr.status === 'PLANT_HEAD_APPROVED' ? '#16a34a' : mr.status === 'PLANT_HEAD_REJECTED' ? '#dc2626' : '#059669',
                                                        border: `1px solid ${isPending ? '#bfdbfe' : mr.status === 'PLANT_HEAD_APPROVED' ? '#bbf7d0' : mr.status === 'PLANT_HEAD_REJECTED' ? '#fecaca' : '#a7f3d0'}`
                                                    },
                                                    children: mr.status
                                                }, void 0, false, {
                                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                    lineNumber: 125,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                lineNumber: 124,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                style: {
                                                    padding: '16px 20px',
                                                    textAlign: 'right'
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleOpenReview(mr),
                                                    style: {
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        border: isPending ? 'none' : '1px solid #D6E2F0',
                                                        background: isPending ? '#16a34a' : '#fff',
                                                        color: isPending ? '#fff' : '#334155',
                                                        fontWeight: '700',
                                                        fontSize: '13px',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    },
                                                    children: [
                                                        isPending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                            size: 15
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                            lineNumber: 131,
                                                            columnNumber: 40
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                            size: 15
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                            lineNumber: 131,
                                                            columnNumber: 68
                                                        }, this),
                                                        isPending ? 'Review & Approve' : 'View Details'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                    lineNumber: 130,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                lineNumber: 129,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, mr.id, true, {
                                        fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                        lineNumber: 113,
                                        columnNumber: 21
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                lineNumber: 104,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                        lineNumber: 91,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                    lineNumber: 90,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                lineNumber: 89,
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
                        width: '720px',
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
                                                color: '#16a34a'
                                            },
                                            children: "Plant Head Approval Review"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                            lineNumber: 150,
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
                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                            lineNumber: 151,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                    lineNumber: 149,
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
                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                    lineNumber: 153,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                            lineNumber: 148,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '12px',
                                marginBottom: '20px',
                                fontSize: '13px',
                                background: '#F5FAFE',
                                padding: '14px',
                                borderRadius: '12px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Requester:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                            lineNumber: 156,
                                            columnNumber: 20
                                        }, this),
                                        " ",
                                        selectedReq.requester
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                    lineNumber: 156,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Work Order:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                            lineNumber: 157,
                                            columnNumber: 20
                                        }, this),
                                        " ",
                                        selectedReq.workOrderNo || '—'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                    lineNumber: 157,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Priority:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                            lineNumber: 158,
                                            columnNumber: 20
                                        }, this),
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontWeight: '800'
                                            },
                                            children: selectedReq.priority
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                            lineNumber: 158,
                                            columnNumber: 47
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                    lineNumber: 158,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        gridColumn: 'span 3'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Warehouse:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                            lineNumber: 159,
                                            columnNumber: 53
                                        }, this),
                                        " ",
                                        selectedReq.warehouse
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                    lineNumber: 159,
                                    columnNumber: 15
                                }, this),
                                selectedReq.notes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        gridColumn: 'span 3',
                                        color: '#92400e',
                                        background: '#fffbeb',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #fde68a'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: "Floor Notes:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                            lineNumber: 162,
                                            columnNumber: 19
                                        }, this),
                                        " ",
                                        selectedReq.notes
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                    lineNumber: 161,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                            lineNumber: 155,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            style: {
                                fontSize: '14px',
                                fontWeight: '800',
                                color: '#24345C',
                                marginBottom: '12px'
                            },
                            children: [
                                "Authorize Material Quantities ",
                                selectedReq.status === 'PENDING_PLANT_HEAD_APPROVAL' ? '(Adjust & Approve)' : '(Read Only)'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                            lineNumber: 166,
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
                                                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                lineNumber: 172,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    padding: '10px 14px',
                                                    width: '120px'
                                                },
                                                children: "Requested"
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                lineNumber: 173,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    padding: '10px 14px',
                                                    width: '150px'
                                                },
                                                children: "Approved Qty"
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                lineNumber: 174,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    padding: '10px 14px',
                                                    width: '80px'
                                                },
                                                children: "Unit"
                                            }, void 0, false, {
                                                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                lineNumber: 175,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                        lineNumber: 171,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                    lineNumber: 170,
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
                                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                    lineNumber: 181,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        padding: '12px 14px',
                                                        fontWeight: '700',
                                                        color: '#5E6B82'
                                                    },
                                                    children: item.requestedQty
                                                }, void 0, false, {
                                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                    lineNumber: 182,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        padding: '12px 14px'
                                                    },
                                                    children: selectedReq.status === 'PENDING_PLANT_HEAD_APPROVAL' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "number",
                                                        min: "0",
                                                        step: "0.1",
                                                        value: item.approvedQty,
                                                        onChange: (e)=>handleQtyChange(idx, Number(e.target.value)),
                                                        style: {
                                                            width: '100%',
                                                            height: '36px',
                                                            padding: '0 10px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #16a34a',
                                                            fontWeight: '800',
                                                            color: '#16a34a',
                                                            fontSize: '14px'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                        lineNumber: 185,
                                                        columnNumber: 25
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontWeight: '800',
                                                            color: '#16a34a'
                                                        },
                                                        children: item.approvedQty
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                        lineNumber: 187,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                    lineNumber: 183,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    style: {
                                                        padding: '12px 14px',
                                                        color: '#5E6B82'
                                                    },
                                                    children: item.unit
                                                }, void 0, false, {
                                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                                    lineNumber: 190,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, idx, true, {
                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                            lineNumber: 180,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                    lineNumber: 178,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                            lineNumber: 169,
                            columnNumber: 13
                        }, this),
                        selectedReq.status === 'PENDING_PLANT_HEAD_APPROVAL' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>handleApprove('Rejected'),
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '10px 20px',
                                        borderRadius: '10px',
                                        border: '1px solid #fecaca',
                                        background: '#fef2f2',
                                        color: '#dc2626',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                            lineNumber: 198,
                                            columnNumber: 19
                                        }, this),
                                        " Reject Request"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                    lineNumber: 197,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>handleApprove('Approved'),
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '10px 24px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: '#16a34a',
                                        color: '#fff',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                            lineNumber: 201,
                                            columnNumber: 19
                                        }, this),
                                        " Approve & Authorize Store Issue"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                    lineNumber: 200,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                            lineNumber: 196,
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
                                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                                lineNumber: 206,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                            lineNumber: 205,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                    lineNumber: 147,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
                lineNumber: 146,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/material-workflow/PlantHeadMaterialApprovalView.jsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/PlantHeadCommandDashboard.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PlantHeadCommandDashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.mjs [app-ssr] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar-days.mjs [app-ssr] (ecmascript) <export default as CalendarDays>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$factory$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Factory$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/factory.mjs [app-ssr] (ecmascript) <export default as Factory>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gauge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Gauge$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/gauge.mjs [app-ssr] (ecmascript) <export default as Gauge>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/history.mjs [app-ssr] (ecmascript) <export default as History>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package.mjs [app-ssr] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.mjs [app-ssr] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/truck.mjs [app-ssr] (ecmascript) <export default as Truck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TriangleAlert$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs [app-ssr] (ecmascript) <export default as TriangleAlert>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Cell.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Legend.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$Pie$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/polar/Pie.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$PieChart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/PieChart.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-ssr] (ecmascript)");
'use client';
;
;
;
const n = (value)=>Number.isFinite(Number(value)) ? Number(value) : 0;
const text = (value, fallback = '—')=>value === undefined || value === null || value === '' ? fallback : value;
const dateText = (value)=>value ? new Date(value).toLocaleDateString('en-IN') : '—';
const statusOf = (value)=>String(value || 'Scheduled').replaceAll('_', ' ');
const Card = ({ title, subtitle, icon: Icon, children, action })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "ph-command-card",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: [
                                    Icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                        size: 18
                                    }, void 0, false, {
                                        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                        lineNumber: 10,
                                        columnNumber: 132
                                    }, ("TURBOPACK compile-time value", void 0)),
                                    " ",
                                    title
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                lineNumber: 10,
                                columnNumber: 119
                            }, ("TURBOPACK compile-time value", void 0)),
                            subtitle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: subtitle
                            }, void 0, false, {
                                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                lineNumber: 10,
                                columnNumber: 176
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                        lineNumber: 10,
                        columnNumber: 114
                    }, ("TURBOPACK compile-time value", void 0)),
                    action
                ]
            }, void 0, true, {
                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                lineNumber: 10,
                columnNumber: 106
            }, ("TURBOPACK compile-time value", void 0)),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
        lineNumber: 10,
        columnNumber: 69
    }, ("TURBOPACK compile-time value", void 0));
const Metrics = ({ items })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "ph-metrics",
        children: items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ph-metric",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: item.label
                    }, void 0, false, {
                        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                        lineNumber: 11,
                        columnNumber: 123
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        className: item.tone || '',
                        children: item.value
                    }, void 0, false, {
                        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                        lineNumber: 11,
                        columnNumber: 148
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, item.label, true, {
                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                lineNumber: 11,
                columnNumber: 79
            }, ("TURBOPACK compile-time value", void 0)))
    }, void 0, false, {
        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
        lineNumber: 11,
        columnNumber: 32
    }, ("TURBOPACK compile-time value", void 0));
const Table = ({ columns = [], rows = [], empty = 'No data available' })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "ph-table-wrap",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        children: columns.map((column, columnIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                children: column.label
                            }, `${column.key || column.label || 'column'}-${columnIndex}`, false, {
                                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                lineNumber: 18,
                                columnNumber: 13
                            }, ("TURBOPACK compile-time value", void 0)))
                    }, void 0, false, {
                        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                        lineNumber: 16,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                    lineNumber: 15,
                    columnNumber: 7
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    children: rows.length ? rows.map((row, rowIndex)=>{
                        const rowKey = row._key || `${row.id || row.workOrderId || row.orderId || 'row'}-${rowIndex}`;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            children: columns.map((column, columnIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    children: column.render ? column.render(row) : text(row[column.key])
                                }, `${rowKey}-${column.key || column.label || 'column'}-${columnIndex}`, false, {
                                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                    lineNumber: 28,
                                    columnNumber: 17
                                }, ("TURBOPACK compile-time value", void 0)))
                        }, rowKey, false, {
                            fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                            lineNumber: 26,
                            columnNumber: 13
                        }, ("TURBOPACK compile-time value", void 0));
                    }) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            colSpan: columns.length,
                            className: "ph-empty",
                            children: empty
                        }, void 0, false, {
                            fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                            lineNumber: 35,
                            columnNumber: 15
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                        lineNumber: 35,
                        columnNumber: 11
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                    lineNumber: 22,
                    columnNumber: 7
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
            lineNumber: 14,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
        lineNumber: 13,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const Button = ({ children, onClick })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        className: "ph-link-button",
        onClick: onClick,
        children: children
    }, void 0, false, {
        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
        lineNumber: 41,
        columnNumber: 43
    }, ("TURBOPACK compile-time value", void 0));
function PlantHeadCommandDashboard({ state, dashboardData, productionAnalyticsData, departmentFilter, navigate }) {
    const production = dashboardData?.production || {};
    const dispatch = dashboardData?.dispatch || {};
    const store = dashboardData?.store || {};
    const qc = dashboardData?.qc || {};
    const workOrders = Array.isArray(state?.workOrders) ? state.workOrders : [];
    const machines = Array.isArray(productionAnalyticsData?.machines) ? productionAnalyticsData.machines : [];
    const today = new Date().toISOString().slice(0, 10);
    const qty = (row)=>n(row.quantity ?? row.plannedQty ?? row.qty);
    const completed = workOrders.filter((row)=>[
            'COMPLETED',
            'CLOSED',
            'QC_PASSED'
        ].includes(String(row.status || '').toUpperCase()));
    const plannedTarget = workOrders.reduce((sum, row)=>sum + qty(row), 0);
    const actualProduction = completed.reduce((sum, row)=>sum + qty(row), 0);
    const achievement = plannedTarget > 0 ? `${Math.round(actualProduction / plannedTarget * 100)}%` : 'Not Configured';
    const qcTotal = n(qc.inspectedToday) || n(qc.passed) + n(qc.failed) + n(qc.rejected);
    const qcPassRate = qcTotal > 0 ? `${Math.round(n(qc.passed) / qcTotal * 100)}%` : 'Not Available';
    const delayedOrders = workOrders.filter((row)=>String(row.status || '').toUpperCase().includes('DELAY') || row.targetDate && new Date(row.targetDate) < new Date() && ![
            'COMPLETED',
            'CLOSED',
            'QC_PASSED'
        ].includes(String(row.status || '').toUpperCase()));
    const planningRows = workOrders.slice(0, 8).map((row)=>({
            ...row,
            product: row.productName || row.product || row.products,
            plannedQty: qty(row),
            machine: row.machine || row.productionLine || 'Not Assigned',
            shift: row.shift || 'Not Assigned',
            start: row.startDate || row.plannedStartDate,
            target: row.targetDate || row.deliveryDate
        }));
    const capacityRows = machines.map((machine)=>{
        const capacity = n(machine.capacity);
        const load = n(machine.plannedLoad);
        const actual = n(machine.actualOutput);
        return {
            id: machine.id || machine.machine,
            line: machine.productionLine || machine.machine || machine.name,
            capacity: capacity || 'Not Configured',
            load,
            actual,
            available: capacity ? Math.max(0, capacity - load) : 'Not Configured',
            utilization: capacity ? `${Math.round(load / capacity * 100)}%` : 'Not Configured',
            status: capacity ? load > capacity ? 'Overloaded' : 'Available' : 'Not Configured'
        };
    });
    const totalCapacity = machines.reduce((sum, row)=>sum + n(row.capacity), 0);
    const plannedLoad = machines.reduce((sum, row)=>sum + n(row.plannedLoad), 0);
    const approvalSources = [
        ...(state?.materialRequests || []).map((row)=>({
                ...row,
                type: 'Material Approval'
            })),
        ...(state?.purchaseIndents || []).map((row)=>({
                ...row,
                type: 'Material Indent'
            })),
        ...(state?.replacementRequests || []).map((row)=>({
                ...row,
                type: 'Replacement Request'
            })),
        ...(state?.returnRequests || []).map((row)=>({
                ...row,
                type: 'Return Request'
            }))
    ].filter((row)=>/APPROV|REJECT|RETURN|CLOSED|ISSUED/i.test(String(row.status || ''))).sort((a, b)=>new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)).slice(0, 8);
    const safeInventoryValue = n(store.totalValue);
    const sourceCategories = Array.isArray(productionAnalyticsData?.categories) ? productionAnalyticsData.categories : [];
    const emptyRccPipes = {
        category: 'RCC Pipes',
        orders: 0,
        qty: 0,
        weight: 0,
        cost: 0,
        rejected: 0,
        dispatched: 0,
        pending: 0
    };
    const categories = sourceCategories.some((row)=>String(row.category || '').toLowerCase() === 'rcc pipes') ? sourceCategories : [
        ...sourceCategories,
        emptyRccPipes
    ];
    const productWiseProduction = Object.values(workOrders.reduce((result, row)=>{
        const product = row.productName || row.product || row.products || 'Unspecified Product';
        if (!result[product]) result[product] = {
            product,
            quantity: 0
        };
        result[product].quantity += [
            'COMPLETED',
            'CLOSED',
            'QC_PASSED'
        ].includes(String(row.status || '').toUpperCase()) ? qty(row) : 0;
        return result;
    }, {})).filter((row)=>row.quantity > 0);
    const categoryWiseProduction = categories.map((row)=>({
            category: row.category || 'Uncategorized',
            quantity: n(row.qty)
        })).filter((row)=>row.quantity > 0);
    const pieColors = [
        '#337a86',
        '#2563eb',
        '#84cc16',
        '#f59e0b',
        '#8b5cf6',
        '#ef4444',
        '#06b6d4'
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "ph-command-sections",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                title: "Daily KPI Dashboard",
                subtitle: "Plant-wide operational performance",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gauge$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Gauge$3e$__["Gauge"],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metrics, {
                    items: [
                        {
                            label: 'Production Target',
                            value: plannedTarget || 'Not Configured'
                        },
                        {
                            label: 'Actual Production',
                            value: actualProduction
                        },
                        {
                            label: 'Achievement',
                            value: achievement
                        },
                        {
                            label: 'Work Orders Completed',
                            value: completed.length
                        },
                        {
                            label: 'QC Pass Rate',
                            value: qcPassRate
                        },
                        {
                            label: 'Delayed Orders',
                            value: delayedOrders.length,
                            tone: 'danger'
                        },
                        {
                            label: 'Ready for Dispatch',
                            value: n(dispatch.readyForDispatch)
                        }
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                    lineNumber: 84,
                    columnNumber: 98
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                lineNumber: 84,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                title: "Production Status — Work Orders",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"],
                action: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Button, {
                    onClick: ()=>navigate.push('/plant-head/planning'),
                    children: "View Production Details"
                }, void 0, false, {
                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                    lineNumber: 88,
                    columnNumber: 75
                }, void 0),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metrics, {
                    items: [
                        {
                            label: 'Planned',
                            value: n(production.planned)
                        },
                        {
                            label: 'Material Waiting',
                            value: n(production.materialWaiting)
                        },
                        {
                            label: 'In Production',
                            value: n(production.inProduction)
                        },
                        {
                            label: 'QC Pending',
                            value: n(production.qcPending)
                        },
                        {
                            label: 'QC Passed',
                            value: n(production.qcPassed)
                        },
                        {
                            label: 'Completed Today',
                            value: n(production.completedToday)
                        },
                        {
                            label: 'Delayed',
                            value: n(production.delayed),
                            tone: 'danger'
                        },
                        {
                            label: 'Efficiency',
                            value: Number.isFinite(Number(production.efficiency)) ? `${n(production.efficiency)}%` : 'Not Available'
                        }
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                    lineNumber: 88,
                    columnNumber: 171
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                lineNumber: 88,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                title: "Production Planning Calendar",
                subtitle: "Upcoming and active production schedule",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2d$days$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CalendarDays$3e$__["CalendarDays"],
                action: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Button, {
                    onClick: ()=>navigate.push('/plant-head/planning'),
                    children: "View Full Planning Calendar"
                }, void 0, false, {
                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                    lineNumber: 92,
                    columnNumber: 127
                }, void 0),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ph-view-tabs",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Day"
                            }, void 0, false, {
                                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                lineNumber: 92,
                                columnNumber: 257
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Week"
                            }, void 0, false, {
                                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                lineNumber: 92,
                                columnNumber: 273
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Month"
                            }, void 0, false, {
                                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                lineNumber: 92,
                                columnNumber: 290
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                        lineNumber: 92,
                        columnNumber: 227
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Table, {
                        rows: planningRows,
                        empty: "No production plans available.",
                        columns: [
                            {
                                key: 'scheduleDate',
                                label: 'Date',
                                render: (r)=>dateText(r.start)
                            },
                            {
                                key: 'id',
                                label: 'Work Order'
                            },
                            {
                                key: 'product',
                                label: 'Product'
                            },
                            {
                                key: 'plannedQty',
                                label: 'Planned Qty'
                            },
                            {
                                key: 'machine',
                                label: 'Machine/Line'
                            },
                            {
                                key: 'shift',
                                label: 'Shift'
                            },
                            {
                                key: 'startDate',
                                label: 'Start Date',
                                render: (r)=>dateText(r.start)
                            },
                            {
                                key: 'targetDate',
                                label: 'Target Date',
                                render: (r)=>dateText(r.target)
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                render: (r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ph-status",
                                        children: statusOf(r.status)
                                    }, void 0, false, {
                                        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                        lineNumber: 92,
                                        columnNumber: 790
                                    }, void 0)
                            }
                        ]
                    }, void 0, false, {
                        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                        lineNumber: 92,
                        columnNumber: 314
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                lineNumber: 92,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                title: "Capacity Planning",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$factory$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Factory$3e$__["Factory"],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metrics, {
                        items: [
                            {
                                label: 'Total Production Capacity',
                                value: totalCapacity || 'Not Configured'
                            },
                            {
                                label: 'Planned Load',
                                value: plannedLoad || 0
                            },
                            {
                                label: 'Actual Production',
                                value: actualProduction
                            },
                            {
                                label: 'Available Capacity',
                                value: totalCapacity ? Math.max(0, totalCapacity - plannedLoad) : 'Not Configured'
                            },
                            {
                                label: 'Capacity Utilization',
                                value: totalCapacity ? `${Math.round(plannedLoad / totalCapacity * 100)}%` : 'Not Configured'
                            }
                        ]
                    }, void 0, false, {
                        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                        lineNumber: 94,
                        columnNumber: 52
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Table, {
                        rows: capacityRows,
                        empty: "Capacity is not configured. Add machine or production-line capacity to begin planning.",
                        columns: [
                            {
                                key: 'line',
                                label: 'Production Line'
                            },
                            {
                                key: 'capacity',
                                label: 'Capacity'
                            },
                            {
                                key: 'load',
                                label: 'Planned Load'
                            },
                            {
                                key: 'actual',
                                label: 'Actual Output'
                            },
                            {
                                key: 'available',
                                label: 'Available'
                            },
                            {
                                key: 'utilization',
                                label: 'Utilization'
                            },
                            {
                                key: 'status',
                                label: 'Status'
                            }
                        ]
                    }, void 0, false, {
                        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                        lineNumber: 94,
                        columnNumber: 473
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                lineNumber: 94,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                title: "Production Delay Analysis",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TriangleAlert$3e$__["TriangleAlert"],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metrics, {
                        items: [
                            {
                                label: 'Total Delayed Orders',
                                value: delayedOrders.length
                            },
                            {
                                label: 'Material Delays',
                                value: delayedOrders.filter((r)=>/material/i.test(r.delayReason || '')).length
                            },
                            {
                                label: 'Machine Delays',
                                value: delayedOrders.filter((r)=>/machine/i.test(r.delayReason || '')).length
                            },
                            {
                                label: 'QC/Rework Delays',
                                value: delayedOrders.filter((r)=>/qc|rework/i.test(r.delayReason || '')).length
                            },
                            {
                                label: 'Other Delays',
                                value: delayedOrders.filter((r)=>!/material|machine|qc|rework/i.test(r.delayReason || '')).length
                            }
                        ]
                    }, void 0, false, {
                        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                        lineNumber: 96,
                        columnNumber: 66
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Table, {
                        rows: delayedOrders,
                        empty: "No delayed production orders.",
                        columns: [
                            {
                                key: 'id',
                                label: 'Work Order'
                            },
                            {
                                key: 'productName',
                                label: 'Product'
                            },
                            {
                                key: 'targetDate',
                                label: 'Planned Date',
                                render: (r)=>dateText(r.targetDate)
                            },
                            {
                                key: 'delayDuration',
                                label: 'Delay Duration',
                                render: (r)=>text(r.delayDuration, '—')
                            },
                            {
                                key: 'delayReason',
                                label: 'Delay Reason',
                                render: (r)=>text(r.delayReason, 'Planning Delay')
                            },
                            {
                                key: 'responsibleDepartment',
                                label: 'Responsible Department',
                                render: (r)=>text(r.responsibleDepartment, 'Production')
                            },
                            {
                                key: 'revisedDate',
                                label: 'Revised Date',
                                render: (r)=>dateText(r.revisedDate)
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                render: (r)=>statusOf(r.status)
                            }
                        ]
                    }, void 0, false, {
                        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                        lineNumber: 96,
                        columnNumber: 560
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                lineNumber: 96,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                title: "QC Status — Inspections",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metrics, {
                    items: [
                        {
                            label: 'Inspected Today',
                            value: n(qc.inspectedToday)
                        },
                        {
                            label: 'Passed',
                            value: n(qc.passed)
                        },
                        {
                            label: 'Failed',
                            value: n(qc.failed)
                        },
                        {
                            label: 'Rework Jobs',
                            value: n(qc.rework)
                        },
                        {
                            label: 'Rejected',
                            value: n(qc.rejected)
                        },
                        {
                            label: 'Pass Rate',
                            value: qcTotal ? `${Math.round(n(qc.passed) / qcTotal * 100)}%` : 'Not Available'
                        },
                        {
                            label: 'Rejection Rate',
                            value: qcTotal ? `${Math.round((n(qc.failed) + n(qc.rejected)) / qcTotal * 100)}%` : 'Not Available'
                        }
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                    lineNumber: 98,
                    columnNumber: 62
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                lineNumber: 98,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                title: "QC Inspection Quality Distribution",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "ph-quality-grid",
                    children: [
                        [
                            'Passed',
                            qc.passed
                        ],
                        [
                            'Failed',
                            qc.failed
                        ],
                        [
                            'Rework',
                            qc.rework
                        ],
                        [
                            'Rejected',
                            qc.rejected
                        ]
                    ].map(([label, value])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: [
                                        n(value),
                                        " Pcs"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                    lineNumber: 99,
                                    columnNumber: 216
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: label
                                }, void 0, false, {
                                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                    lineNumber: 99,
                                    columnNumber: 247
                                }, this)
                            ]
                        }, label, true, {
                            fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                            lineNumber: 99,
                            columnNumber: 199
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                    lineNumber: 99,
                    columnNumber: 54
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                lineNumber: 99,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                title: "Dispatch Status — Logistics",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metrics, {
                    items: [
                        {
                            label: 'Ready for Dispatch',
                            value: n(dispatch.readyForDispatch)
                        },
                        {
                            label: 'Scheduled Today',
                            value: n(dispatch.scheduledToday)
                        },
                        {
                            label: 'Dispatched Today',
                            value: n(dispatch.dispatchedToday)
                        },
                        {
                            label: 'Partial Dispatch',
                            value: n(dispatch.partialDispatch)
                        },
                        {
                            label: 'Pending Dispatch',
                            value: n(dispatch.pendingDispatch)
                        },
                        {
                            label: 'Delayed Dispatch',
                            value: n(dispatch.delayedDispatch)
                        },
                        {
                            label: 'Active Vehicles',
                            value: n(dispatch.vehiclesRunning)
                        }
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                    lineNumber: 100,
                    columnNumber: 60
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                lineNumber: 100,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                title: "Store Status — Raw Material",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"],
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metrics, {
                    items: [
                        {
                            label: 'Total Inventory Value',
                            value: `₹${(safeInventoryValue / 100000).toFixed(1)} Lakhs`
                        },
                        {
                            label: 'Low Stock Items',
                            value: `${n(store.lowStockItems)} Items`
                        },
                        {
                            label: 'Out of Stock',
                            value: n(store.outOfStock)
                        },
                        {
                            label: 'Requested Today',
                            value: n(store.materialRequestedToday)
                        },
                        {
                            label: 'Material Approved',
                            value: n(store.materialApproved)
                        },
                        {
                            label: 'Material Issued',
                            value: n(store.materialIssued)
                        },
                        {
                            label: 'Purchase Pending',
                            value: n(store.purchasePending)
                        }
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                    lineNumber: 101,
                    columnNumber: 62
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                lineNumber: 101,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                title: "Category Wise Production Drilldown",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Table, {
                    rows: categories,
                    empty: "No category production records available.",
                    columns: [
                        {
                            key: 'category',
                            label: 'Category Name'
                        },
                        {
                            key: 'orders',
                            label: 'Orders Count',
                            render: (r)=>n(r.orders)
                        },
                        {
                            key: 'qty',
                            label: 'Produced Qty',
                            render: (r)=>`${n(r.qty)} Pcs`
                        },
                        {
                            key: 'weight',
                            label: 'Est. Tonnage',
                            render: (r)=>`${n(r.weight)} Ton`
                        },
                        {
                            key: 'cost',
                            label: 'Production Cost',
                            render: (r)=>`₹${n(r.cost).toLocaleString('en-IN')}`
                        },
                        {
                            key: 'rejected',
                            label: 'Rejected Qty',
                            render: (r)=>`${n(r.rejected)} Pcs`
                        },
                        {
                            key: 'dispatched',
                            label: 'Dispatched Qty',
                            render: (r)=>`${n(r.dispatched)} Pcs`
                        },
                        {
                            key: 'pending',
                            label: 'Pending Qty',
                            render: (r)=>`${n(r.pending)} Pcs`
                        }
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                    lineNumber: 102,
                    columnNumber: 54
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                lineNumber: 102,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ph-production-charts",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                        title: "Category Wise Production",
                        subtitle: "Produced quantity by product category",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "ph-product-pie",
                            children: categoryWiseProduction.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                width: "100%",
                                height: "100%",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$PieChart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PieChart"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$Pie$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Pie"], {
                                            data: categoryWiseProduction,
                                            dataKey: "quantity",
                                            nameKey: "category",
                                            cx: "50%",
                                            cy: "46%",
                                            innerRadius: 58,
                                            outerRadius: 92,
                                            paddingAngle: 3,
                                            children: categoryWiseProduction.map((row, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Cell"], {
                                                    fill: pieColors[index % pieColors.length]
                                                }, `${row.category}-${index}`, false, {
                                                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                                    lineNumber: 104,
                                                    columnNumber: 401
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                            lineNumber: 104,
                                            columnNumber: 218
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                                            formatter: (value, name)=>[
                                                    `${n(value)} Pcs`,
                                                    name
                                                ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                            lineNumber: 104,
                                            columnNumber: 492
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Legend"], {
                                            verticalAlign: "bottom",
                                            wrapperStyle: {
                                                fontSize: '11px'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                            lineNumber: 104,
                                            columnNumber: 553
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                    lineNumber: 104,
                                    columnNumber: 208
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                lineNumber: 104,
                                columnNumber: 160
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "ph-no-data",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: "No category production data"
                                    }, void 0, false, {
                                        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                        lineNumber: 104,
                                        columnNumber: 682
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Produced category quantities will appear here."
                                    }, void 0, false, {
                                        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                        lineNumber: 104,
                                        columnNumber: 726
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                lineNumber: 104,
                                columnNumber: 654
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                            lineNumber: 104,
                            columnNumber: 95
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                        lineNumber: 104,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                        title: "Product Wise Production",
                        subtitle: "Completed production quantity by product",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "ph-product-pie",
                            children: productWiseProduction.length ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                width: "100%",
                                height: "100%",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$PieChart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PieChart"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$polar$2f$Pie$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Pie"], {
                                            data: productWiseProduction,
                                            dataKey: "quantity",
                                            nameKey: "product",
                                            cx: "50%",
                                            cy: "46%",
                                            innerRadius: 58,
                                            outerRadius: 92,
                                            paddingAngle: 3,
                                            children: productWiseProduction.map((row, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Cell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Cell"], {
                                                    fill: pieColors[index % pieColors.length]
                                                }, `${row.product}-${index}`, false, {
                                                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                                    lineNumber: 105,
                                                    columnNumber: 399
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                            lineNumber: 105,
                                            columnNumber: 219
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                                            formatter: (value, name)=>[
                                                    `${n(value)} Pcs`,
                                                    name
                                                ]
                                        }, void 0, false, {
                                            fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                            lineNumber: 105,
                                            columnNumber: 489
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Legend"], {
                                            verticalAlign: "bottom",
                                            wrapperStyle: {
                                                fontSize: '11px'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                            lineNumber: 105,
                                            columnNumber: 550
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                    lineNumber: 105,
                                    columnNumber: 209
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                lineNumber: 105,
                                columnNumber: 161
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "ph-no-data",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: "No product production data"
                                    }, void 0, false, {
                                        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                        lineNumber: 105,
                                        columnNumber: 679
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Completed product output will appear here."
                                    }, void 0, false, {
                                        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                        lineNumber: 105,
                                        columnNumber: 722
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                lineNumber: 105,
                                columnNumber: 651
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                            lineNumber: 105,
                            columnNumber: 97
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                        lineNumber: 105,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                lineNumber: 103,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Card, {
                title: "Recent Approval History",
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"],
                action: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Button, {
                    onClick: ()=>navigate.push('/plant-head/material-approvals'),
                    children: "View Full Approval History"
                }, void 0, false, {
                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                    lineNumber: 107,
                    columnNumber: 66
                }, void 0),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Table, {
                    rows: approvalSources,
                    empty: "No recent Plant Head approval decisions.",
                    columns: [
                        {
                            key: 'id',
                            label: 'Request ID'
                        },
                        {
                            key: 'type',
                            label: 'Request Type'
                        },
                        {
                            key: 'requestedBy',
                            label: 'Requested By',
                            render: (r)=>text(r.requestedBy || r.requester)
                        },
                        {
                            key: 'createdAt',
                            label: 'Request Date',
                            render: (r)=>dateText(r.createdAt || r.requestDate)
                        },
                        {
                            key: 'decision',
                            label: 'Decision',
                            render: (r)=>statusOf(r.decision || r.status)
                        },
                        {
                            key: 'updatedAt',
                            label: 'Decision Date',
                            render: (r)=>dateText(r.updatedAt || r.approvedAt)
                        },
                        {
                            key: 'remarks',
                            label: 'Remarks',
                            render: (r)=>text(r.remarks || r.notes)
                        },
                        {
                            key: 'status',
                            label: 'Status',
                            render: (r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "ph-status",
                                    children: statusOf(r.status)
                                }, void 0, false, {
                                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                                    lineNumber: 107,
                                    columnNumber: 765
                                }, void 0)
                        }
                    ]
                }, void 0, false, {
                    fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                    lineNumber: 107,
                    columnNumber: 175
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
                lineNumber: 107,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/PlantHeadCommandDashboard.jsx",
        lineNumber: 83,
        columnNumber: 10
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

//# sourceMappingURL=components_c4389ecb._.js.map