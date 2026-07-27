(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/DashboardView.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DashboardView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useMediaQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useMediaQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.mjs [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flask-conical.mjs [app-client] (ecmascript) <export default as FlaskConical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.mjs [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.mjs [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.mjs [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/dollar-sign.mjs [app-client] (ecmascript) <export default as DollarSign>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.mjs [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.mjs [app-client] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-check.mjs [app-client] (ecmascript) <export default as FileCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.mjs [app-client] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$AreaChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/AreaChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Area.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/BarChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Bar.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/XAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/YAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Legend.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DailyAgendaCalendar$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/DailyAgendaCalendar.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/apiClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$utils$2f$reminderUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/utils/reminderUtils.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
function ConversionGauge(param) {
    let { pct, trackColor, fillColor, label } = param;
    const r = 38;
    const circ = 2 * Math.PI * r;
    const dash = Math.min(100, Math.max(0, pct)) / 100 * circ;
    const gap = circ - dash;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'relative',
                    width: '96px',
                    height: '96px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        width: "96",
                        height: "96",
                        viewBox: "0 0 96 96",
                        style: {
                            transform: 'rotate(-90deg)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: "48",
                                cy: "48",
                                r: r,
                                fill: "none",
                                stroke: trackColor,
                                strokeWidth: "8"
                            }, void 0, false, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 50,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: "48",
                                cy: "48",
                                r: r,
                                fill: "none",
                                stroke: fillColor,
                                strokeWidth: "8",
                                strokeLinecap: "round",
                                strokeDasharray: dash + ' ' + gap,
                                style: {
                                    transition: 'stroke-dasharray 0.6s ease'
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 51,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '15px',
                            fontWeight: '800',
                            color: 'var(--color-text-primary)'
                        },
                        children: [
                            pct.toFixed(1),
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DashboardView.jsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                style: {
                    fontSize: '11.5px',
                    color: 'var(--color-text-secondary)',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/components/DashboardView.jsx",
                lineNumber: 62,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/DashboardView.jsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
_c = ConversionGauge;
function ConversionGauges(param) {
    let { leadRate, quoteRate } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            background: '#ffffff',
            border: '1px solid var(--color-border)',
            padding: '20px 24px',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-premium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    minWidth: '120px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: '14px',
                            fontWeight: '800',
                            color: 'var(--color-text-primary)'
                        },
                        children: "Conversion Rates"
                    }, void 0, false, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: '11px',
                            color: 'var(--color-text-secondary)'
                        },
                        children: "Overall Metrics"
                    }, void 0, false, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 78,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DashboardView.jsx",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    gap: '32px',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ConversionGauge, {
                        pct: leadRate,
                        trackColor: "#e8f5e9",
                        fillColor: "#22c55e",
                        label: "Lead to Order"
                    }, void 0, false, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ConversionGauge, {
                        pct: quoteRate,
                        trackColor: "#e0f2fe",
                        fillColor: "#0e7490",
                        label: "Quote to Order"
                    }, void 0, false, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DashboardView.jsx",
                lineNumber: 80,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/DashboardView.jsx",
        lineNumber: 71,
        columnNumber: 5
    }, this);
}
_c1 = ConversionGauges;
function DashboardView(param) {
    let { state, dispatch, navigate, onQuickAction } = param;
    _s();
    const [isMounted, setIsMounted] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState(false);
    const [timeFilter, setTimeFilter] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState('This Month');
    const [customStartDate, setCustomStartDate] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState('');
    const [customEndDate, setCustomEndDate] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState('');
    const [activeTab, setActiveTab] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState('overview');
    const isMobile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useMediaQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMediaQuery"])('(max-width: 768px)');
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "DashboardView.useEffect": ()=>{
            setIsMounted(true);
        }
    }["DashboardView.useEffect"], []);
    const handleNav = (path)=>{
        if (navigate) {
            if (typeof navigate === 'function') {
                navigate(path);
            } else if (typeof navigate.push === 'function') {
                navigate.push(path);
            }
        }
    };
    const leads = (state === null || state === void 0 ? void 0 : state.leads) || [];
    const quotations = (state === null || state === void 0 ? void 0 : state.quotations) || [];
    const orders = (state === null || state === void 0 ? void 0 : state.orders) || [];
    const payments = (state === null || state === void 0 ? void 0 : state.payments) || [];
    const samples = (state === null || state === void 0 ? void 0 : state.samples) || [];
    const reminders = Array.isArray(state === null || state === void 0 ? void 0 : state.reminders) ? state.reminders : [];
    const todayCrmReminders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$utils$2f$reminderUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTodayPendingReminders"])(reminders);
    const resolveReminderLabel = (reminder)=>{
        if (reminder.customerName) return reminder.customerName;
        if (reminder.moduleType === 'Lead') {
            const lead = leads.find((l)=>String(l.id) === String(reminder.moduleId));
            return (lead === null || lead === void 0 ? void 0 : lead.companyName) || "Lead #".concat(reminder.moduleId);
        }
        if (reminder.moduleType === 'Quotation') {
            const q = quotations.find((item)=>String(item.id) === String(reminder.moduleId));
            return (q === null || q === void 0 ? void 0 : q.customerName) || "Quotation #".concat(reminder.moduleId);
        }
        return reminder.title || 'Reminder';
    };
    // Helper to extract creation date from item (local timezone safe)
    const getCreatedAtDate = (item)=>{
        if (!item) return null;
        let rawDate = item.createdAt || item.date || item.created_at || item._raw && (item._raw.created_at || item._raw.createdAt);
        if (!rawDate) return null;
        if (typeof rawDate === 'number') {
            return new Date(rawDate);
        }
        if (typeof rawDate === 'string') {
            if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
                rawDate = rawDate + 'T00:00:00';
            }
            const parsed = new Date(rawDate);
            if (!isNaN(parsed.getTime())) return parsed;
        }
        const parsed = new Date(rawDate);
        return isNaN(parsed.getTime()) ? null : parsed;
    };
    // Helper to check if a specific timestamp falls inside the active timeframe filter
    const isTimeWithinFilter = (itemTime)=>{
        if (!itemTime) return true;
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        // Start of week (Monday)
        const currentDay = now.getDay();
        const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday).getTime();
        // Start of month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        // Start of year
        const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
        switch(timeFilter){
            case 'Today':
                return itemTime >= todayStart && itemTime <= todayStart + 86400000;
            case 'This Week':
                return itemTime >= startOfWeek && itemTime <= startOfWeek + 7 * 86400000;
            case 'This Month':
                {
                    const start = startOfMonth;
                    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime() + 86400000;
                    return itemTime >= start && itemTime <= end;
                }
            case 'This Year':
                {
                    const start = startOfYear;
                    const end = new Date(now.getFullYear(), 11, 31).getTime() + 86400000;
                    return itemTime >= start && itemTime <= end;
                }
            case 'Custom':
                if (!customStartDate && !customEndDate) return true;
                const start = customStartDate ? new Date(customStartDate + 'T00:00:00').getTime() : 0;
                const end = customEndDate ? new Date(customEndDate + 'T23:59:59').getTime() : Infinity;
                return itemTime >= start && itemTime <= end;
            default:
                return true;
        }
    };
    // Date range filter helper
    const filterByDate = (item)=>{
        const itemDate = getCreatedAtDate(item);
        if (!itemDate) return true;
        return isTimeWithinFilter(itemDate.getTime());
    };
    // Filtered lists based on selected timeframe
    const filteredLeads = leads.filter(filterByDate);
    const filteredQuotations = quotations.filter(filterByDate);
    const filteredOrders = orders.filter(filterByDate);
    const filteredPayments = payments.filter(filterByDate);
    const filteredSamples = samples.filter(filterByDate);
    // ──🔹 TOP ROW: Daily Focus metrics ──
    const newLeadsCount = filteredLeads.filter((l)=>l.status === 'New' || l.status === 'New Lead').length;
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayEnd = new Date().setHours(23, 59, 59, 999);
    const todayFollowUpsCount = leads.filter((l)=>{
        var _getCreatedAtDate;
        if (!l.followUpDate) return false;
        const d = (_getCreatedAtDate = getCreatedAtDate({
            date: l.followUpDate
        })) === null || _getCreatedAtDate === void 0 ? void 0 : _getCreatedAtDate.getTime();
        return d && d >= todayStart && d <= todayEnd && l.status !== 'Converted';
    }).length;
    const pendingFollowUpsCount = leads.filter((l)=>{
        var _getCreatedAtDate;
        if (!l.followUpDate) return false;
        const d = (_getCreatedAtDate = getCreatedAtDate({
            date: l.followUpDate
        })) === null || _getCreatedAtDate === void 0 ? void 0 : _getCreatedAtDate.getTime();
        return d && d > todayEnd && l.status === 'Follow-up' && isTimeWithinFilter(d);
    }).length;
    const totalLeadsCount = filteredLeads.length;
    const convertedLeadsCount = filteredLeads.filter((l)=>l.status === 'Converted' || l.status === 'Quotation').length;
    const conversionRate = totalLeadsCount > 0 ? convertedLeadsCount / totalLeadsCount * 100 : 0;
    const totalQuotesCount = filteredQuotations.length;
    const convertedQuotesCount = filteredQuotations.filter((q)=>q.status === 'Approved' || q.status === 'Converted').length;
    const quoteToOrderRate = totalQuotesCount > 0 ? convertedQuotesCount / totalQuotesCount * 100 : 0;
    // ──🔹 SECOND ROW: Sales Pipeline metrics ──
    const pendingSamplesCount = filteredSamples.filter((s)=>s.status === 'Sent' || s.status === 'Pending').length;
    const pendingQuotesCount = filteredQuotations.filter((q)=>q.status === 'Draft' || q.status === 'Sent' || q.status === 'Pending').length;
    const approvedQuotesCount = filteredQuotations.filter((q)=>q.status === 'Approved').length;
    const activeOrdersCount = filteredOrders.filter((o)=>{
        const s = String(o.status || '').toLowerCase();
        return ![
            'completed',
            'qc passed',
            'qc_passed',
            'closed',
            'cancelled',
            'delivered',
            'payment pending',
            'payment_pending'
        ].includes(s);
    }).length;
    // ──🔹 THIRD ROW: Order Progress metrics ──
    const ordersInProductionCount = filteredOrders.filter((o)=>{
        const s = String(o.status || '').toLowerCase();
        const dept = String(o.currentDepartment || '').toLowerCase();
        return s === 'production' || s === 'in production' || dept === 'production';
    }).length;
    const readyForDispatchCount = filteredOrders.filter((o)=>{
        const s = String(o.status || '').toLowerCase();
        const dsp = String(o.dispatchStatus || '').toLowerCase();
        return [
            'ready',
            'ready for dispatch',
            'qc passed',
            'qc_passed'
        ].includes(s) || dsp === 'ready';
    }).length;
    const deliveredOrdersCount = filteredOrders.filter((o)=>{
        const s = String(o.status || '').toLowerCase();
        const dsp = String(o.dispatchStatus || '').toLowerCase();
        return [
            'delivered',
            'completed',
            'closed'
        ].includes(s) || dsp === 'delivered';
    }).length;
    const paymentPendingOrdersCount = filteredOrders.filter((o)=>{
        const s = String(o.status || '').toLowerCase();
        const dsp = String(o.dispatchStatus || '').toLowerCase();
        return [
            'payment pending',
            'payment_pending'
        ].includes(s) || dsp === 'payment pending' || dsp === 'payment_pending';
    }).length;
    // ──🔹 FOURTH ROW: Performance metrics ──
    const paymentVerificationCount = filteredPayments.filter((p)=>p.verified === 'Pending' || p.status === 'Pending').length;
    const mySalesTotal = filteredOrders.filter((o)=>![
            'cancelled',
            'void',
            'draft'
        ].includes(String(o.status || '').toLowerCase())).reduce((sum, o)=>sum + Number(o.grand_total || o.total_amount || 0), 0);
    const salesTarget = 5000000;
    const orderValue = (order)=>Number(order.grandTotal || order.grand_total || order.totalValue || order.total_amount || order.invoiceAmount || 0);
    const orderQuantity = (order)=>Number(order.quantity || order.totalQuantity || order.qty || (Array.isArray(order.items) ? order.items.reduce((sum, item)=>sum + Number(item.quantity || item.qty || 0), 0) : 0));
    const isConfirmedSalesOrder = (order)=>{
        const status = String(order.workflowStatus || order.orderStatus || order.status || '').toUpperCase().replace(/\s+/g, '_');
        return ![
            '',
            'DRAFT',
            'CANCELLED',
            'VOID',
            'REJECTED',
            'PENDING'
        ].includes(status) && (status.includes('CONFIRM') || status.includes('APPROV') || [
            'PLANT_PENDING',
            'PRODUCTION_PLANNED',
            'IN_PRODUCTION',
            'QC_PENDING',
            'QC_PASSED',
            'READY_FOR_DISPATCH',
            'DISPATCHED',
            'IN_TRANSIT',
            'DELIVERED',
            'COMPLETED',
            'CLOSED',
            'PAYMENT_PENDING'
        ].includes(status));
    };
    const nowForSales = new Date();
    const currentMonthOrders = orders.filter((order)=>{
        const date = getCreatedAtDate({
            ...order,
            createdAt: order.confirmedAt || order.approvedAt || order.orderDate || order.createdAt
        });
        return isConfirmedSalesOrder(order) && date && date.getFullYear() === nowForSales.getFullYear() && date.getMonth() === nowForSales.getMonth();
    });
    const currentMonthAchieved = currentMonthOrders.reduce((sum, order)=>sum + orderValue(order), 0);
    const targetAchievement = salesTarget > 0 ? Math.min(100, currentMonthAchieved / salesTarget * 100) : 0;
    const remainingTarget = Math.max(0, salesTarget - currentMonthAchieved);
    const daysInMonth = new Date(nowForSales.getFullYear(), nowForSales.getMonth() + 1, 0).getDate();
    const daysRemaining = Math.max(0, daysInMonth - nowForSales.getDate());
    const requiredDailySales = daysRemaining > 0 ? remainingTarget / daysRemaining : remainingTarget;
    const monthlyTargetData = Array.from({
        length: 6
    }, (_, index)=>{
        const date = new Date(nowForSales.getFullYear(), nowForSales.getMonth() - 5 + index, 1);
        const achieved = orders.filter((order)=>{
            const orderDate = getCreatedAtDate({
                ...order,
                createdAt: order.confirmedAt || order.approvedAt || order.orderDate || order.createdAt
            });
            return isConfirmedSalesOrder(order) && orderDate && orderDate.getFullYear() === date.getFullYear() && orderDate.getMonth() === date.getMonth();
        }).reduce((sum, order)=>sum + orderValue(order), 0);
        return {
            month: date.toLocaleDateString('en-IN', {
                month: 'short'
            }),
            Target: salesTarget,
            Achieved: achieved
        };
    });
    const deliveredOrdersForReturns = orders.filter((order)=>[
            'delivered',
            'completed',
            'closed'
        ].includes(String(order.status || '').toLowerCase()) || String(order.dispatchStatus || order.deliveryStatus || '').toLowerCase().includes('deliver'));
    const returnOrders = orders.filter((order)=>order.activeReturnExists || order.returnStatus || Number(order.returnQty) > 0);
    const returnedQuantity = returnOrders.reduce((sum, order)=>sum + Number(order.returnQty || order.returnedQuantity || 0), 0);
    const returnValue = returnOrders.reduce((sum, order)=>{
        const qty = Number(order.returnQty || order.returnedQuantity || 0);
        const totalQty = orderQuantity(order);
        return sum + Number(order.returnValue || (totalQty > 0 ? orderValue(order) / totalQty * qty : 0));
    }, 0);
    const returnRate = deliveredOrdersForReturns.length > 0 ? returnOrders.length / deliveredOrdersForReturns.length * 100 : 0;
    const monthlyReturnData = Array.from({
        length: 6
    }, (_, index)=>{
        const date = new Date(nowForSales.getFullYear(), nowForSales.getMonth() - 5 + index, 1);
        const rows = returnOrders.filter((order)=>{
            const d = getCreatedAtDate({
                ...order,
                createdAt: order.returnRequestedAt || order.updatedAt || order.createdAt
            });
            return d && d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth();
        });
        return {
            month: date.toLocaleDateString('en-IN', {
                month: 'short'
            }),
            ReturnQuantity: rows.reduce((sum, order)=>sum + Number(order.returnQty || order.returnedQuantity || 0), 0),
            ReturnValue: rows.reduce((sum, order)=>{
                const qty = Number(order.returnQty || order.returnedQuantity || 0);
                const totalQty = orderQuantity(order);
                return sum + Number(order.returnValue || (totalQty > 0 ? orderValue(order) / totalQty * qty : 0));
            }, 0)
        };
    });
    const reasonCategories = [
        'Product Quality',
        'Damaged During Transit',
        'Wrong Product',
        'Quantity Issue',
        'Customer Rejection',
        'Other'
    ];
    const topReturnReasons = reasonCategories.map((reason)=>({
            reason,
            count: returnOrders.filter((order)=>{
                const text = String(order.returnReason || '').toLowerCase();
                if (reason === 'Product Quality') return text.includes('quality') || text.includes('defect');
                if (reason === 'Damaged During Transit') return text.includes('damage') || text.includes('transit');
                if (reason === 'Wrong Product') return text.includes('wrong');
                if (reason === 'Quantity Issue') return text.includes('quantity') || text.includes('short');
                if (reason === 'Customer Rejection') return text.includes('reject');
                return ![
                    'quality',
                    'defect',
                    'damage',
                    'transit',
                    'wrong',
                    'quantity',
                    'short',
                    'reject'
                ].some((term)=>text.includes(term));
            }).length
        })).sort((a, b)=>b.count - a.count);
    const collectionAmount = filteredPayments.filter((p)=>p.verified === 'Approved' || p.verified === 'Yes' || p.status === 'Approved' || p.status === 'Verified').reduce((sum, p)=>sum + Number(p.paymentAmount || p.totalAmount || p.amount || 0), 0);
    // ──⚠️ ALERTS calculation ──
    const overdueFollowUps = leads.filter((l)=>l.followUpDate && new Date(l.followUpDate).getTime() < todayStart && l.status !== 'Converted');
    const expiredSamplesLimit = todayStart - 14 * 24 * 60 * 60 * 1000;
    const expiredSamples = filteredSamples.filter((s)=>{
        var _getCreatedAtDate;
        return (s.status === 'Sent' || s.status === 'Pending') && ((_getCreatedAtDate = getCreatedAtDate(s)) === null || _getCreatedAtDate === void 0 ? void 0 : _getCreatedAtDate.getTime()) < expiredSamplesLimit;
    });
    const expiredQuotes = filteredQuotations.filter((q)=>q.status !== 'Approved' && q.status !== 'Closed' && q.validTill && new Date(q.validTill).getTime() < todayStart);
    const overduePayments = filteredPayments.filter((p)=>{
        var _getCreatedAtDate;
        return (p.status === 'Pending' || p.verified === 'Pending') && ((_getCreatedAtDate = getCreatedAtDate(p)) === null || _getCreatedAtDate === void 0 ? void 0 : _getCreatedAtDate.getTime()) < todayStart;
    });
    // ──📊 QUICK SUMMARY calculation ──
    const qualifiedLeadsCount = filteredLeads.filter((l)=>![
            'Lost',
            'Dead',
            'Dropped'
        ].includes(l.status)).length;
    const wonOrdersCount = filteredOrders.filter((o)=>![
            'cancelled',
            'void',
            'draft'
        ].includes(String(o.status || '').toLowerCase())).length;
    const lostLeadsCount = filteredLeads.filter((l)=>[
            'Lost',
            'Dead',
            'Dropped'
        ].includes(l.status)).length;
    const avgOrderValue = wonOrdersCount > 0 ? Math.round(mySalesTotal / wonOrdersCount) : 0;
    const activeCustomersCount = new Set(filteredOrders.map((o)=>o.customerName || o.customer || o.leadName).filter(Boolean)).size;
    // Sales trend line data fetching
    const [salesSummary, setSalesSummary] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useState([]);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useEffect({
        "DashboardView.useEffect": ()=>{
            let active = true;
            const fetchSalesTrend = {
                "DashboardView.useEffect.fetchSalesTrend": async ()=>{
                    try {
                        let dateFromStr = '';
                        let dateToStr = '';
                        const now = new Date();
                        if (timeFilter === 'Today') {
                            dateFromStr = now.toISOString().split('T')[0];
                            dateToStr = now.toISOString().split('T')[0];
                        } else if (timeFilter === 'This Week') {
                            const currentDay = now.getDay();
                            const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
                            const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday);
                            dateFromStr = monday.toISOString().split('T')[0];
                            dateToStr = new Date().toISOString().split('T')[0];
                        } else if (timeFilter === 'This Month') {
                            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                            dateFromStr = firstDay.toISOString().split('T')[0];
                            dateToStr = new Date().toISOString().split('T')[0];
                        } else if (timeFilter === 'This Year') {
                            const firstDay = new Date(now.getFullYear(), 0, 1);
                            dateFromStr = firstDay.toISOString().split('T')[0];
                            dateToStr = new Date().toISOString().split('T')[0];
                        } else if (timeFilter === 'Custom') {
                            dateFromStr = customStartDate || new Date(0).toISOString().split('T')[0];
                            dateToStr = customEndDate || new Date().toISOString().split('T')[0];
                        } else {
                            const dFrom = new Date();
                            dFrom.setMonth(dFrom.getMonth() - 6);
                            dateFromStr = dFrom.toISOString().split('T')[0];
                            dateToStr = new Date().toISOString().split('T')[0];
                        }
                        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/reports/sales/summary?date_from=".concat(dateFromStr, "&date_to=").concat(dateToStr));
                        if (active) {
                            setSalesSummary(res.data || []);
                        }
                    } catch (err) {
                        console.error('Failed to load dashboard sales summary:', err);
                    }
                }
            }["DashboardView.useEffect.fetchSalesTrend"];
            fetchSalesTrend();
            return ({
                "DashboardView.useEffect": ()=>{
                    active = false;
                }
            })["DashboardView.useEffect"];
        }
    }["DashboardView.useEffect"], [
        timeFilter,
        customStartDate,
        customEndDate
    ]);
    const getDynamicTrendData = ()=>{
        if (salesSummary && salesSummary.length > 0) {
            return [
                ...salesSummary
            ].slice(0, 6).reverse().map((item)=>{
                if (!(item === null || item === void 0 ? void 0 : item.month) || typeof item.month !== 'string') {
                    return {
                        name: '—',
                        Leads: 0,
                        Conversions: 0
                    };
                }
                const [yr, mn] = item.month.split('-');
                const monthNames = {
                    '01': 'Jan',
                    '02': 'Feb',
                    '03': 'Mar',
                    '04': 'Apr',
                    '05': 'May',
                    '06': 'Jun',
                    '07': 'Jul',
                    '08': 'Aug',
                    '09': 'Sep',
                    '10': 'Oct',
                    '11': 'Nov',
                    '12': 'Dec'
                };
                const name = monthNames[mn] || item.month;
                return {
                    name,
                    Leads: Math.round(item.order_count * 1.5),
                    Conversions: item.order_count
                };
            });
        }
        // Local fallback calculation based on memory state
        const now = new Date();
        if (timeFilter === 'Today') {
            const data = [];
            for(let i = 5; i >= 0; i--){
                const d = new Date(now.getTime() - i * 4 * 60 * 60 * 1000);
                const hourLabel = "".concat(d.getHours(), ":00");
                const start = d.getTime() - 4 * 60 * 60 * 1000;
                const end = d.getTime();
                const Leads = filteredLeads.filter((l)=>{
                    var _getCreatedAtDate;
                    const t = (_getCreatedAtDate = getCreatedAtDate(l)) === null || _getCreatedAtDate === void 0 ? void 0 : _getCreatedAtDate.getTime();
                    return t && t >= start && t <= end;
                }).length;
                const Conversions = filteredOrders.filter((o)=>{
                    var _getCreatedAtDate;
                    const t = (_getCreatedAtDate = getCreatedAtDate(o)) === null || _getCreatedAtDate === void 0 ? void 0 : _getCreatedAtDate.getTime();
                    return t && t >= start && t <= end;
                }).length;
                data.push({
                    name: hourLabel,
                    Leads,
                    Conversions
                });
            }
            return data;
        }
        if (timeFilter === 'This Week') {
            const days = [
                'Sun',
                'Mon',
                'Tue',
                'Wed',
                'Thu',
                'Fri',
                'Sat'
            ];
            const data = [];
            const currentDay = now.getDay();
            const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
            const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday);
            for(let i = 0; i < 7; i++){
                const dDate = new Date(monday.getTime() + i * 24 * 60 * 60 * 1000);
                const start = dDate.setHours(0, 0, 0, 0);
                const end = dDate.setHours(23, 59, 59, 999);
                const Leads = filteredLeads.filter((l)=>{
                    var _getCreatedAtDate;
                    const t = (_getCreatedAtDate = getCreatedAtDate(l)) === null || _getCreatedAtDate === void 0 ? void 0 : _getCreatedAtDate.getTime();
                    return t && t >= start && t <= end;
                }).length;
                const Conversions = filteredOrders.filter((o)=>{
                    var _getCreatedAtDate;
                    const t = (_getCreatedAtDate = getCreatedAtDate(o)) === null || _getCreatedAtDate === void 0 ? void 0 : _getCreatedAtDate.getTime();
                    return t && t >= start && t <= end;
                }).length;
                data.push({
                    name: days[dDate.getDay()],
                    Leads,
                    Conversions
                });
            }
            return data;
        }
        if (timeFilter === 'This Month') {
            const data = [];
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
            for(let w = 0; w < 4; w++){
                const start = startOfMonth + w * 7 * 24 * 60 * 60 * 1000;
                const end = start + 7 * 24 * 60 * 60 * 1000 - 1;
                const Leads = filteredLeads.filter((l)=>{
                    var _getCreatedAtDate;
                    const t = (_getCreatedAtDate = getCreatedAtDate(l)) === null || _getCreatedAtDate === void 0 ? void 0 : _getCreatedAtDate.getTime();
                    return t && t >= start && t <= end;
                }).length;
                const Conversions = filteredOrders.filter((o)=>{
                    var _getCreatedAtDate;
                    const t = (_getCreatedAtDate = getCreatedAtDate(o)) === null || _getCreatedAtDate === void 0 ? void 0 : _getCreatedAtDate.getTime();
                    return t && t >= start && t <= end;
                }).length;
                data.push({
                    name: "W".concat(w + 1),
                    Leads,
                    Conversions
                });
            }
            return data;
        }
        // Default: This Year or Custom
        const months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ];
        const data = [];
        for(let i = 5; i >= 0; i--){
            const targetMonthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mIdx = targetMonthDate.getMonth();
            const mYear = targetMonthDate.getFullYear();
            const start = new Date(mYear, mIdx, 1).getTime();
            const end = new Date(mYear, mIdx + 1, 0).getTime() + 86400000 - 1;
            const Leads = filteredLeads.filter((l)=>{
                var _getCreatedAtDate;
                const t = (_getCreatedAtDate = getCreatedAtDate(l)) === null || _getCreatedAtDate === void 0 ? void 0 : _getCreatedAtDate.getTime();
                return t && t >= start && t <= end;
            }).length;
            const Conversions = filteredOrders.filter((o)=>{
                var _getCreatedAtDate;
                const t = (_getCreatedAtDate = getCreatedAtDate(o)) === null || _getCreatedAtDate === void 0 ? void 0 : _getCreatedAtDate.getTime();
                return t && t >= start && t <= end;
            }).length;
            data.push({
                name: months[mIdx],
                Leads,
                Conversions
            });
        }
        return data;
    };
    const trendData = getDynamicTrendData();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "sales-dashboard",
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sales-info-bar",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sales-info-title",
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--color-text-primary)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                size: 20,
                                className: "pulse-icon",
                                style: {
                                    color: '#0ea5e9'
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 465,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontWeight: '800',
                                    fontSize: '15px',
                                    letterSpacing: '-0.2px'
                                },
                                children: "Sales Representative Dashboard"
                            }, void 0, false, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 466,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 464,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sales-info-badges",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sales-badge sales-badge-role",
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    padding: '4px 10px',
                                    background: '#e0f2fe',
                                    border: '1px solid #bae6fd',
                                    borderRadius: '20px',
                                    color: '#0369a1'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 475,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Role: Sales Executive"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 476,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 469,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sales-badge sales-badge-active",
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    padding: '4px 10px',
                                    background: '#dcfce7',
                                    border: '1px solid #bbf7d0',
                                    borderRadius: '20px',
                                    color: '#15803d'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "pulse-red-dot",
                                        style: {
                                            width: '6px',
                                            height: '6px',
                                            backgroundColor: '#10b981',
                                            borderRadius: '50%',
                                            display: 'inline-block'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 484,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Live Sync Mode"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 485,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 478,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 468,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DashboardView.jsx",
                lineNumber: 463,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sales-dashboard-filters",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--color-text-primary)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                size: 18,
                                style: {
                                    color: '#0ea5e9'
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 493,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: '13px',
                                    fontWeight: '800'
                                },
                                children: "Timeframe Filters:"
                            }, void 0, false, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 494,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 492,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sales-dashboard-filters-buttons",
                        children: [
                            [
                                'Today',
                                'This Week',
                                'This Month',
                                'This Year',
                                'Custom'
                            ].map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setTimeFilter(f),
                                    style: {
                                        padding: '6px 14px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        border: '1px solid var(--color-border)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        background: timeFilter === f ? '#0ea5e9' : 'transparent',
                                        color: timeFilter === f ? '#ffffff' : 'var(--color-text-secondary)'
                                    },
                                    children: f === 'Custom' ? 'Custom Range' : f
                                }, f, false, {
                                    fileName: "[project]/components/DashboardView.jsx",
                                    lineNumber: 498,
                                    columnNumber: 13
                                }, this)),
                            timeFilter === 'Custom' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginLeft: '10px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "date",
                                        value: customStartDate,
                                        onChange: (e)=>setCustomStartDate(e.target.value),
                                        style: {
                                            border: '1px solid var(--color-border)',
                                            padding: '5px 8px',
                                            borderRadius: '6px',
                                            background: 'var(--color-bg)',
                                            color: 'var(--color-text-primary)',
                                            fontSize: '11px'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 514,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '11px',
                                            color: 'var(--color-text-secondary)'
                                        },
                                        children: "to"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 523,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "date",
                                        value: customEndDate,
                                        onChange: (e)=>setCustomEndDate(e.target.value),
                                        style: {
                                            border: '1px solid var(--color-border)',
                                            padding: '5px 8px',
                                            borderRadius: '6px',
                                            background: 'var(--color-bg)',
                                            color: 'var(--color-text-primary)',
                                            fontSize: '11px'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 524,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 513,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 496,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DashboardView.jsx",
                lineNumber: 491,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: '#ffffff',
                    border: '1px solid var(--color-border)',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-premium)'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '14px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
                                        size: 18,
                                        style: {
                                            color: '#0ea5e9'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 546,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontWeight: '800',
                                            fontSize: '14px',
                                            color: 'var(--color-text-primary)'
                                        },
                                        children: "Today's CRM Reminders"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 547,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 545,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>handleNav('/sales/leads'),
                                style: {
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    color: '#0ea5e9',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                },
                                children: [
                                    "View all ",
                                    '→'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 551,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 544,
                        columnNumber: 9
                    }, this),
                    todayCrmReminders.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        style: {
                            fontSize: '13px',
                            color: 'var(--color-text-muted)',
                            margin: 0
                        },
                        children: "No reminders scheduled for today."
                    }, void 0, false, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 564,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0'
                        },
                        children: todayCrmReminders.map((reminder, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    idx > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                                        style: {
                                            border: 'none',
                                            borderTop: '1px solid #DCE5F0',
                                            margin: '12px 0'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 571,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '12px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '11px',
                                                    fontWeight: '800',
                                                    textTransform: 'uppercase',
                                                    color: reminder.moduleType === 'Quotation' ? '#15803d' : '#1d4ed8',
                                                    background: reminder.moduleType === 'Quotation' ? '#dcfce7' : '#dbeafe',
                                                    padding: '3px 8px',
                                                    borderRadius: '6px',
                                                    flexShrink: 0,
                                                    marginTop: '2px'
                                                },
                                                children: reminder.moduleType
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 573,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    flex: 1,
                                                    minWidth: 0
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '14px',
                                                            fontWeight: '700',
                                                            color: 'var(--color-text-primary)'
                                                        },
                                                        children: resolveReminderLabel(reminder)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 582,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '12px',
                                                            color: 'var(--color-text-secondary)',
                                                            marginTop: '2px'
                                                        },
                                                        children: [
                                                            reminder.reminderTime ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$utils$2f$reminderUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatReminderTime"])(reminder.reminderTime) : 'All day',
                                                            reminder.reminderType ? " · ".concat(reminder.reminderType) : ''
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 585,
                                                        columnNumber: 21
                                                    }, this),
                                                    reminder.remarks && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '12px',
                                                            color: '#5E6B82',
                                                            marginTop: '4px',
                                                            fontStyle: 'italic'
                                                        },
                                                        children: reminder.remarks
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 590,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 581,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 572,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, reminder.id, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 570,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 568,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DashboardView.jsx",
                lineNumber: 539,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sales-flow-pipeline",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                size: 16,
                                style: {
                                    color: '#10b981'
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 605,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontWeight: '800',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    color: 'var(--color-text-secondary)'
                                },
                                children: "Final Sales Employee Dashboard Flow"
                            }, void 0, false, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 606,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 604,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sales-flow-pipeline-steps",
                        children: [
                            {
                                label: 'Leads',
                                val: filteredLeads.length,
                                color: '#3b82f6',
                                bg: '#eff6ff',
                                path: '/sales/leads'
                            },
                            {
                                label: 'Follow-ups',
                                val: todayFollowUpsCount + pendingFollowUpsCount,
                                color: '#8b5cf6',
                                bg: '#f5f3ff',
                                path: '/sales/leads'
                            },
                            {
                                label: 'Samples',
                                val: pendingSamplesCount,
                                color: '#f59e0b',
                                bg: '#fffbeb',
                                path: '/sales/samples'
                            },
                            {
                                label: 'Quotations',
                                val: pendingQuotesCount + approvedQuotesCount,
                                color: '#10b981',
                                bg: '#ecfdf5',
                                path: '/sales/quotations'
                            },
                            {
                                label: 'Orders',
                                val: activeOrdersCount,
                                color: '#06b6d4',
                                bg: '#ecfeff',
                                path: '/sales/orders'
                            },
                            {
                                label: 'Production',
                                val: ordersInProductionCount,
                                color: '#f43f5e',
                                bg: '#fff1f2',
                                path: '/sales/production-status'
                            },
                            {
                                label: 'Dispatch',
                                val: readyForDispatchCount,
                                color: '#eab308',
                                bg: '#fefce8',
                                path: '/sales/orders'
                            },
                            {
                                label: 'Delivery',
                                val: deliveredOrdersCount,
                                color: '#10b981',
                                bg: '#ecfdf5',
                                path: '/sales/orders'
                            },
                            {
                                label: 'Payment',
                                val: paymentPendingOrdersCount,
                                color: '#ef4444',
                                bg: '#fef2f2',
                                path: '/sales/payment-followup'
                            }
                        ].map((step, idx, arr)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        onClick: ()=>handleNav(step.path),
                                        className: "pipeline-step-card",
                                        style: {
                                            background: step.bg,
                                            border: "1px solid ".concat(step.color, "22")
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '16px',
                                                    fontWeight: '900',
                                                    color: step.color
                                                },
                                                children: step.val
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 631,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '10px',
                                                    fontWeight: '700',
                                                    color: 'var(--color-text-secondary)',
                                                    marginTop: '2px'
                                                },
                                                children: step.label
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 632,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 623,
                                        columnNumber: 15
                                    }, this),
                                    idx < arr.length - 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                        size: 14,
                                        className: "pipeline-separator",
                                        style: {
                                            color: '#D6E2F0',
                                            flexShrink: 0
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 635,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, step.label, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 622,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 610,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DashboardView.jsx",
                lineNumber: 603,
                columnNumber: 7
            }, this),
            isMobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    background: '#f1f5f9',
                    borderRadius: '12px',
                    padding: '4px',
                    gap: '4px',
                    marginBottom: '16px'
                },
                children: [
                    {
                        id: 'overview',
                        label: '📊 Overview'
                    },
                    {
                        id: 'calendar',
                        label: '📅 Tasks & Calendar'
                    },
                    {
                        id: 'alerts',
                        label: '⚠️ Alerts & Stats'
                    }
                ].map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setActiveTab(tab.id),
                        style: {
                            flex: 1,
                            border: 'none',
                            background: activeTab === tab.id ? '#ffffff' : 'transparent',
                            color: activeTab === tab.id ? '#24345C' : '#5E6B82',
                            fontWeight: '700',
                            fontSize: '12px',
                            padding: '8px 4px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                        },
                        children: tab.label
                    }, tab.id, false, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 656,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/DashboardView.jsx",
                lineNumber: 643,
                columnNumber: 9
            }, this),
            !isMobile ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sales-dashboard-grid-layout",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sales-dashboard-main-col",
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            fontSize: '13px',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            color: 'var(--color-text-secondary)',
                                            marginBottom: '12px',
                                            letterSpacing: '0.5px'
                                        },
                                        children: "Payment Summary"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 693,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                                            gap: '14px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    background: '#ffffff',
                                                    border: '1px solid #fee2e2',
                                                    borderLeft: '4px solid #ef4444',
                                                    padding: '16px 18px',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '6px',
                                                    boxShadow: '0 1px 4px rgba(239,68,68,0.08)'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '11.5px',
                                                            fontWeight: '700',
                                                            color: '#ef4444'
                                                        },
                                                        children: "Total Payment Due"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 706,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '22px',
                                                            fontWeight: '900',
                                                            color: '#ef4444'
                                                        },
                                                        children: [
                                                            '\u20B9',
                                                            filteredPayments.filter((p)=>p.status !== 'Paid' && p.verified !== 'Approved').reduce((s, p)=>s + (Number(p.totalAmount || 0) - Number(p.paidAmount || 0)), 0).toLocaleString('en-IN', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 707,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 699,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    background: '#ffffff',
                                                    border: '1px solid #dbeafe',
                                                    borderLeft: '4px solid #3b82f6',
                                                    padding: '16px 18px',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '6px',
                                                    boxShadow: '0 1px 4px rgba(59,130,246,0.08)'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '11.5px',
                                                            fontWeight: '700',
                                                            color: '#3b82f6'
                                                        },
                                                        children: "Total Customers"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 723,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '22px',
                                                            fontWeight: '900',
                                                            color: '#1d4ed8'
                                                        },
                                                        children: new Set(filteredOrders.map((o)=>o.customerName || o.customer || o.leadName).filter(Boolean)).size
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 724,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 716,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    background: '#ffffff',
                                                    border: '1px solid #dcfce7',
                                                    borderLeft: '4px solid #22c55e',
                                                    padding: '16px 18px',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '6px',
                                                    boxShadow: '0 1px 4px rgba(34,197,94,0.08)'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '11.5px',
                                                            fontWeight: '700',
                                                            color: '#16a34a'
                                                        },
                                                        children: "Total Collected"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 737,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '22px',
                                                            fontWeight: '900',
                                                            color: '#15803d'
                                                        },
                                                        children: [
                                                            '\u20B9',
                                                            filteredPayments.filter((p)=>p.status === 'Paid' || p.verified === 'Approved').reduce((s, p)=>s + Number(p.paymentAmount || p.totalAmount || p.amount || 0), 0).toLocaleString('en-IN', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 738,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 730,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    background: '#ffffff',
                                                    border: '1px solid #fef08a',
                                                    borderLeft: '4px solid #eab308',
                                                    padding: '16px 18px',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '6px',
                                                    boxShadow: '0 1px 4px rgba(234,179,8,0.08)'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '11.5px',
                                                            fontWeight: '700',
                                                            color: '#ca8a04'
                                                        },
                                                        children: "Payment Received"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 754,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '22px',
                                                            fontWeight: '900',
                                                            color: '#a16207'
                                                        },
                                                        children: [
                                                            '\u20B9',
                                                            collectionAmount.toLocaleString('en-IN', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 755,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 747,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 696,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 692,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            fontSize: '13px',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            color: 'var(--color-text-secondary)',
                                            marginBottom: '12px',
                                            letterSpacing: '0.5px'
                                        },
                                        children: "Performance Metrics"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 765,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                                            gap: '14px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                onClick: ()=>handleNav('/sales/payment-followup'),
                                                style: {
                                                    cursor: 'pointer',
                                                    background: '#ffffff',
                                                    border: '1px solid var(--color-border)',
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '8px',
                                                    boxShadow: 'var(--shadow-card)',
                                                    transition: 'all 0.2s ease'
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
                                                                    fontWeight: '800',
                                                                    color: 'var(--color-text-secondary)'
                                                                },
                                                                children: "Verifications"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 777,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    color: '#f59e0b',
                                                                    background: '#fffbeb',
                                                                    padding: '5px',
                                                                    borderRadius: '6px'
                                                                },
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileCheck$3e$__["FileCheck"], {
                                                                    size: 16
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/DashboardView.jsx",
                                                                    lineNumber: 779,
                                                                    columnNumber: 24
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 778,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 776,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '24px',
                                                            fontWeight: '900',
                                                            color: 'var(--color-text-primary)'
                                                        },
                                                        children: paymentVerificationCount
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 782,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '10px',
                                                            color: 'var(--color-text-secondary)',
                                                            fontWeight: '600'
                                                        },
                                                        children: "Pending with audit team"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 783,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 771,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                onClick: ()=>handleNav('/sales/reports'),
                                                style: {
                                                    cursor: 'pointer',
                                                    background: '#ffffff',
                                                    border: '1px solid var(--color-border)',
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '8px',
                                                    boxShadow: 'var(--shadow-card)',
                                                    transition: 'all 0.2s ease'
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
                                                                    fontWeight: '800',
                                                                    color: 'var(--color-text-secondary)'
                                                                },
                                                                children: "My Sales"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 793,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    color: '#10b981',
                                                                    background: '#ecfdf5',
                                                                    padding: '5px',
                                                                    borderRadius: '6px'
                                                                },
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__["DollarSign"], {
                                                                    size: 16
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/DashboardView.jsx",
                                                                    lineNumber: 795,
                                                                    columnNumber: 23
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 794,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 792,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '20px',
                                                            fontWeight: '900',
                                                            color: 'var(--color-text-primary)'
                                                        },
                                                        children: [
                                                            "₹",
                                                            mySalesTotal.toLocaleString('en-IN')
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 798,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '10px',
                                                            color: 'var(--color-text-secondary)',
                                                            fontWeight: '600'
                                                        },
                                                        children: "Won order value"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 801,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 787,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    background: '#ffffff',
                                                    border: '1px solid var(--color-border)',
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '8px',
                                                    boxShadow: 'var(--shadow-card)'
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
                                                                    fontWeight: '800',
                                                                    color: 'var(--color-text-secondary)'
                                                                },
                                                                children: "Target Achieved"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 811,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    color: '#8b5cf6',
                                                                    background: '#f5f3ff',
                                                                    padding: '5px',
                                                                    borderRadius: '6px'
                                                                },
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                                                                    size: 16
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/DashboardView.jsx",
                                                                    lineNumber: 813,
                                                                    columnNumber: 23
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 812,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 810,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '24px',
                                                            fontWeight: '900',
                                                            color: 'var(--color-text-primary)'
                                                        },
                                                        children: [
                                                            targetAchievement.toFixed(1),
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 816,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            height: '5px',
                                                            background: '#DCE5F0',
                                                            borderRadius: '3px',
                                                            overflow: 'hidden',
                                                            marginTop: 'auto'
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                width: "".concat(targetAchievement, "%"),
                                                                height: '100%',
                                                                background: '#8b5cf6',
                                                                borderRadius: '3px'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/DashboardView.jsx",
                                                            lineNumber: 820,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 819,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 805,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 768,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 764,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ConversionGauges, {
                                leadRate: conversionRate,
                                quoteRate: quoteToOrderRate
                            }, void 0, false, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 828,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sales-pipeline-card",
                                style: {
                                    margin: 0,
                                    background: '#ffffff',
                                    border: '1px solid var(--color-border)',
                                    padding: '24px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                    color: 'var(--color-text-primary)',
                                    boxShadow: 'var(--shadow-premium)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-top-bar",
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        className: "card-heading",
                                                        style: {
                                                            fontSize: '14px',
                                                            fontWeight: '800',
                                                            margin: 0,
                                                            color: 'var(--color-text-primary)'
                                                        },
                                                        children: "Conversion Trend"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 838,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "glass-stat-subtext",
                                                        style: {
                                                            fontSize: '11px',
                                                            color: 'var(--color-text-secondary)',
                                                            display: 'block',
                                                            marginTop: '2px',
                                                            fontWeight: '600'
                                                        },
                                                        children: "Pipeline lead conversions over last 6 months"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 839,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 837,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    gap: '12px',
                                                    fontSize: '11px',
                                                    fontWeight: '700'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            color: '#0ea5e9'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    width: '8px',
                                                                    height: '8px',
                                                                    borderRadius: '50%',
                                                                    background: '#0ea5e9',
                                                                    display: 'inline-block'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 845,
                                                                columnNumber: 21
                                                            }, this),
                                                            " Leads"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 844,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            color: '#10b981'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    width: '8px',
                                                                    height: '8px',
                                                                    borderRadius: '50%',
                                                                    background: '#10b981',
                                                                    display: 'inline-block'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 848,
                                                                columnNumber: 21
                                                            }, this),
                                                            " Conversions"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 847,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 843,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 836,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '100%',
                                            height: '220px',
                                            marginTop: '10px'
                                        },
                                        children: isMounted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                            width: "100%",
                                            height: 220,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$AreaChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AreaChart"], {
                                                data: trendData,
                                                margin: {
                                                    top: 10,
                                                    right: 10,
                                                    left: -20,
                                                    bottom: 0
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                                                id: "colorLeads",
                                                                x1: "0",
                                                                y1: "0",
                                                                x2: "0",
                                                                y2: "1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                        offset: "5%",
                                                                        stopColor: "#0ea5e9",
                                                                        stopOpacity: 0.2
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/DashboardView.jsx",
                                                                        lineNumber: 859,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                        offset: "95%",
                                                                        stopColor: "#0ea5e9",
                                                                        stopOpacity: 0
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/DashboardView.jsx",
                                                                        lineNumber: 860,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 858,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                                                id: "colorConvs",
                                                                x1: "0",
                                                                y1: "0",
                                                                x2: "0",
                                                                y2: "1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                        offset: "5%",
                                                                        stopColor: "#10b981",
                                                                        stopOpacity: 0.2
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/DashboardView.jsx",
                                                                        lineNumber: 863,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                        offset: "95%",
                                                                        stopColor: "#10b981",
                                                                        stopOpacity: 0
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/DashboardView.jsx",
                                                                        lineNumber: 864,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 862,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 857,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                                        strokeDasharray: "3 3",
                                                        stroke: "#f1f5f9",
                                                        vertical: false
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 867,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                                        dataKey: "name",
                                                        stroke: "#5E6B82",
                                                        fontSize: 11,
                                                        tickLine: false,
                                                        axisLine: false
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 868,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                                        stroke: "#5E6B82",
                                                        fontSize: 11,
                                                        tickLine: false,
                                                        axisLine: false
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 869,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                        contentStyle: {
                                                            background: '#ffffff',
                                                            border: '1px solid #D6E2F0',
                                                            borderRadius: '8px',
                                                            fontSize: '12px',
                                                            color: 'var(--color-text-primary)'
                                                        },
                                                        itemStyle: {
                                                            color: 'var(--color-text-primary)'
                                                        },
                                                        labelStyle: {
                                                            fontWeight: 'bold',
                                                            color: 'var(--color-text-secondary)'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 870,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Area"], {
                                                        type: "monotone",
                                                        dataKey: "Leads",
                                                        stroke: "#0ea5e9",
                                                        strokeWidth: 2,
                                                        fillOpacity: 1,
                                                        fill: "url(#colorLeads)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 875,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Area"], {
                                                        type: "monotone",
                                                        dataKey: "Conversions",
                                                        stroke: "#10b981",
                                                        strokeWidth: 2,
                                                        fillOpacity: 1,
                                                        fill: "url(#colorConvs)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 876,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 856,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/DashboardView.jsx",
                                            lineNumber: 855,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 853,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 831,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 689,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sales-dashboard-sidebar-col",
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "app-card",
                                style: {
                                    padding: '16px',
                                    background: '#ffffff',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '12px',
                                    height: '480px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    boxShadow: 'var(--shadow-premium)'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DailyAgendaCalendar$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    state: state
                                }, void 0, false, {
                                    fileName: "[project]/components/DashboardView.jsx",
                                    lineNumber: 894,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 889,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: '#ffffff',
                                    border: '1px solid var(--color-border)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                    boxShadow: 'var(--shadow-premium)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                                size: 18,
                                                style: {
                                                    color: '#ef4444'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 904,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontWeight: '800',
                                                    fontSize: '14px',
                                                    color: 'var(--color-text-primary)'
                                                },
                                                children: "System Alerts"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 905,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 903,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '10px',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    background: overdueFollowUps.length > 0 ? '#fef2f2' : '#F5FAFE',
                                                    borderLeft: "3px solid ".concat(overdueFollowUps.length > 0 ? '#ef4444' : '#D6E2F0'),
                                                    transition: 'all 0.2s ease'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                        size: 16,
                                                        style: {
                                                            color: overdueFollowUps.length > 0 ? '#ef4444' : '#5E6B82',
                                                            marginTop: '2px',
                                                            flexShrink: 0
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 919,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '12px',
                                                                    fontWeight: '750',
                                                                    color: overdueFollowUps.length > 0 ? '#991b1b' : '#334155'
                                                                },
                                                                children: "Overdue Follow-ups"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 921,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '11px',
                                                                    color: overdueFollowUps.length > 0 ? '#b91c1c' : '#5E6B82',
                                                                    marginTop: '2px'
                                                                },
                                                                children: overdueFollowUps.length > 0 ? "".concat(overdueFollowUps.length, " lead follow-ups overdue") : 'All follow-ups up to date'
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 924,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 920,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 913,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '10px',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    background: expiredSamples.length > 0 ? '#fffbeb' : '#F5FAFE',
                                                    borderLeft: "3px solid ".concat(expiredSamples.length > 0 ? '#d97706' : '#D6E2F0'),
                                                    transition: 'all 0.2s ease'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__["FlaskConical"], {
                                                        size: 16,
                                                        style: {
                                                            color: expiredSamples.length > 0 ? '#d97706' : '#5E6B82',
                                                            marginTop: '2px',
                                                            flexShrink: 0
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 937,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '12px',
                                                                    fontWeight: '750',
                                                                    color: expiredSamples.length > 0 ? '#92400e' : '#334155'
                                                                },
                                                                children: "Expired Samples"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 939,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '11px',
                                                                    color: expiredSamples.length > 0 ? '#b45309' : '#5E6B82',
                                                                    marginTop: '2px'
                                                                },
                                                                children: expiredSamples.length > 0 ? "".concat(expiredSamples.length, " samples older than 14 days") : 'No expired prototype samples'
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 942,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 938,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 931,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '10px',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    background: expiredQuotes.length > 0 ? '#fef2f2' : '#F5FAFE',
                                                    borderLeft: "3px solid ".concat(expiredQuotes.length > 0 ? '#ef4444' : '#D6E2F0'),
                                                    transition: 'all 0.2s ease'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileCheck$3e$__["FileCheck"], {
                                                        size: 16,
                                                        style: {
                                                            color: expiredQuotes.length > 0 ? '#ef4444' : '#5E6B82',
                                                            marginTop: '2px',
                                                            flexShrink: 0
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 955,
                                                        columnNumber: 20
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '12px',
                                                                    fontWeight: '750',
                                                                    color: expiredQuotes.length > 0 ? '#991b1b' : '#334155'
                                                                },
                                                                children: "Expired Quotations"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 957,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '11px',
                                                                    color: expiredQuotes.length > 0 ? '#b91c1c' : '#5E6B82',
                                                                    marginTop: '2px'
                                                                },
                                                                children: expiredQuotes.length > 0 ? "".concat(expiredQuotes.length, " quotes past validity limit") : 'No expired quotations'
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 960,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 956,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 949,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '10px',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    background: overduePayments.length > 0 ? '#fef2f2' : '#F5FAFE',
                                                    borderLeft: "3px solid ".concat(overduePayments.length > 0 ? '#ef4444' : '#D6E2F0'),
                                                    transition: 'all 0.2s ease'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__["DollarSign"], {
                                                        size: 16,
                                                        style: {
                                                            color: overduePayments.length > 0 ? '#ef4444' : '#5E6B82',
                                                            marginTop: '2px',
                                                            flexShrink: 0
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 973,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '12px',
                                                                    fontWeight: '750',
                                                                    color: overduePayments.length > 0 ? '#991b1b' : '#334155'
                                                                },
                                                                children: "Overdue Payments"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 975,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '11px',
                                                                    color: overduePayments.length > 0 ? '#b91c1c' : '#5E6B82',
                                                                    marginTop: '2px'
                                                                },
                                                                children: overduePayments.length > 0 ? "".concat(overduePayments.length, " pending payments overdue") : 'No overdue payments'
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 978,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 974,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 967,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 910,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 898,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: '#ffffff',
                                    border: '1px solid var(--color-border)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                    boxShadow: 'var(--shadow-premium)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                                size: 18,
                                                style: {
                                                    color: '#0ea5e9'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 994,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontWeight: '800',
                                                    fontSize: '14px',
                                                    color: 'var(--color-text-primary)'
                                                },
                                                children: "Quick Summary"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 995,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 993,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '10px'
                                        },
                                        children: [
                                            {
                                                label: 'Total Leads',
                                                val: totalLeadsCount,
                                                color: '#3b82f6'
                                            },
                                            {
                                                label: 'Qualified Leads',
                                                val: qualifiedLeadsCount,
                                                color: '#8b5cf6'
                                            },
                                            {
                                                label: 'Won Orders',
                                                val: wonOrdersCount,
                                                color: '#10b981'
                                            },
                                            {
                                                label: 'Lost Leads',
                                                val: lostLeadsCount,
                                                color: '#f43f5e'
                                            },
                                            {
                                                label: 'Conversion Rate',
                                                val: "".concat(conversionRate.toFixed(1), "%"),
                                                color: '#06b6d4'
                                            },
                                            {
                                                label: 'Revenue',
                                                val: "₹".concat(mySalesTotal.toLocaleString('en-IN')),
                                                color: '#10b981',
                                                fullWidth: true
                                            },
                                            {
                                                label: 'Avg Order Value',
                                                val: "₹".concat(avgOrderValue.toLocaleString('en-IN')),
                                                color: '#f59e0b',
                                                fullWidth: true
                                            },
                                            {
                                                label: 'Active Customers',
                                                val: activeCustomersCount,
                                                color: '#6366f1'
                                            }
                                        ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    gridColumn: item.fullWidth ? '1 / -1' : 'auto',
                                                    background: '#F5FAFE',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '2px',
                                                    border: '1px solid var(--color-border)'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '9px',
                                                            fontWeight: '700',
                                                            color: 'var(--color-text-secondary)',
                                                            textTransform: 'uppercase'
                                                        },
                                                        children: item.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 1016,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '13px',
                                                            fontWeight: '900',
                                                            color: item.color
                                                        },
                                                        children: item.val
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 1019,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, item.label, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1011,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1000,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 988,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 886,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DashboardView.jsx",
                lineNumber: 686,
                columnNumber: 9
            }, this) : /* ── MOBILE TABBED VIEWPORT WORKSPACE ── */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                },
                children: [
                    activeTab === 'overview' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '10px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: '#ffffff',
                                            border: '1px solid #fee2e2',
                                            borderLeft: '4px solid #ef4444',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '4px',
                                            boxShadow: '0 1px 4px rgba(239,68,68,0.06)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '10.5px',
                                                    fontWeight: '700',
                                                    color: '#ef4444'
                                                },
                                                children: "Payment Due"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1048,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '15px',
                                                    fontWeight: '900',
                                                    color: '#ef4444',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                },
                                                children: [
                                                    "₹",
                                                    filteredPayments.filter((p)=>p.status !== 'Paid' && p.verified !== 'Approved').reduce((s, p)=>s + (Number(p.totalAmount || 0) - Number(p.paidAmount || 0)), 0).toLocaleString('en-IN', {
                                                        maximumFractionDigits: 0
                                                    })
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1049,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1043,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: '#ffffff',
                                            border: '1px solid #dcfce7',
                                            borderLeft: '4px solid #22c55e',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '4px',
                                            boxShadow: '0 1px 4px rgba(34,197,94,0.06)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '10.5px',
                                                    fontWeight: '700',
                                                    color: '#16a34a'
                                                },
                                                children: "Collected"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1063,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '15px',
                                                    fontWeight: '900',
                                                    color: '#15803d',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                },
                                                children: [
                                                    "₹",
                                                    filteredPayments.filter((p)=>p.status === 'Paid' || p.verified === 'Approved').reduce((s, p)=>s + Number(p.paymentAmount || p.totalAmount || p.amount || 0), 0).toLocaleString('en-IN', {
                                                        maximumFractionDigits: 0
                                                    })
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1064,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1058,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: '#ffffff',
                                            border: '1px solid #dbeafe',
                                            borderLeft: '4px solid #3b82f6',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '4px',
                                            boxShadow: '0 1px 4px rgba(59,130,246,0.06)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '10.5px',
                                                    fontWeight: '700',
                                                    color: '#3b82f6'
                                                },
                                                children: "Customers"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1078,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '16px',
                                                    fontWeight: '900',
                                                    color: '#1d4ed8'
                                                },
                                                children: new Set(filteredOrders.map((o)=>o.customerName || o.customer || o.leadName).filter(Boolean)).size
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1079,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1073,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        onClick: ()=>handleNav('/sales/payment-followup'),
                                        style: {
                                            cursor: 'pointer',
                                            background: '#ffffff',
                                            border: '1px solid var(--color-border)',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '4px',
                                            boxShadow: 'var(--shadow-card)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '10.5px',
                                                    fontWeight: '700',
                                                    color: 'var(--color-text-secondary)'
                                                },
                                                children: "Verifications"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1090,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '16px',
                                                    fontWeight: '900',
                                                    color: 'var(--color-text-primary)'
                                                },
                                                children: paymentVerificationCount
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1091,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1085,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        onClick: ()=>handleNav('/sales/reports'),
                                        style: {
                                            cursor: 'pointer',
                                            background: '#ffffff',
                                            border: '1px solid var(--color-border)',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '4px',
                                            boxShadow: 'var(--shadow-card)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '10.5px',
                                                    fontWeight: '700',
                                                    color: 'var(--color-text-secondary)'
                                                },
                                                children: "My Sales"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1100,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '15px',
                                                    fontWeight: '900',
                                                    color: '#10b981',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                },
                                                children: [
                                                    "₹",
                                                    mySalesTotal.toLocaleString('en-IN', {
                                                        maximumFractionDigits: 0
                                                    })
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1101,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1095,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: '#ffffff',
                                            border: '1px solid var(--color-border)',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '4px',
                                            boxShadow: 'var(--shadow-card)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '10.5px',
                                                    fontWeight: '700',
                                                    color: 'var(--color-text-secondary)'
                                                },
                                                children: "Target Achieved"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1112,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '16px',
                                                    fontWeight: '900',
                                                    color: '#8b5cf6'
                                                },
                                                children: [
                                                    targetAchievement.toFixed(1),
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1113,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1107,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 1040,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: '#ffffff',
                                    border: '1px solid var(--color-border)',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    boxShadow: 'var(--shadow-premium)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-around',
                                    gap: '12px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ConversionGauge, {
                                        pct: conversionRate,
                                        trackColor: "#e8f5e9",
                                        fillColor: "#22c55e",
                                        label: "Lead to Order"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1124,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ConversionGauge, {
                                        pct: quoteToOrderRate,
                                        trackColor: "#e0f2fe",
                                        fillColor: "#0e7490",
                                        label: "Quote to Order"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1125,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 1119,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 1037,
                        columnNumber: 13
                    }, this),
                    activeTab === 'calendar' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "app-card",
                            style: {
                                padding: '12px',
                                background: '#ffffff',
                                border: '1px solid var(--color-border)',
                                borderRadius: '12px',
                                height: '480px',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: 'var(--shadow-premium)'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$DailyAgendaCalendar$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                state: state
                            }, void 0, false, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 1139,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/DashboardView.jsx",
                            lineNumber: 1134,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 1133,
                        columnNumber: 13
                    }, this),
                    activeTab === 'alerts' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: '#ffffff',
                                    border: '1px solid var(--color-border)',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    boxShadow: 'var(--shadow-premium)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                                size: 18,
                                                style: {
                                                    color: '#ef4444'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1155,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontWeight: '800',
                                                    fontSize: '13px',
                                                    color: 'var(--color-text-primary)'
                                                },
                                                children: "System Alerts"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1156,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1154,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '8px',
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    background: overdueFollowUps.length > 0 ? '#fef2f2' : '#F5FAFE',
                                                    borderLeft: "3px solid ".concat(overdueFollowUps.length > 0 ? '#ef4444' : '#D6E2F0')
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                        size: 15,
                                                        style: {
                                                            color: overdueFollowUps.length > 0 ? '#ef4444' : '#5E6B82',
                                                            marginTop: '1px',
                                                            flexShrink: 0
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 1169,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '11.5px',
                                                                    fontWeight: '750',
                                                                    color: overdueFollowUps.length > 0 ? '#991b1b' : '#334155'
                                                                },
                                                                children: "Overdue Follow-ups"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 1171,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '10.5px',
                                                                    color: overdueFollowUps.length > 0 ? '#b91c1c' : '#5E6B82',
                                                                    marginTop: '1px'
                                                                },
                                                                children: overdueFollowUps.length > 0 ? "".concat(overdueFollowUps.length, " follow-ups overdue") : 'Up to date'
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 1172,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 1170,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1164,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '8px',
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    background: expiredSamples.length > 0 ? '#fffbeb' : '#F5FAFE',
                                                    borderLeft: "3px solid ".concat(expiredSamples.length > 0 ? '#d97706' : '#D6E2F0')
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__["FlaskConical"], {
                                                        size: 15,
                                                        style: {
                                                            color: expiredSamples.length > 0 ? '#d97706' : '#5E6B82',
                                                            marginTop: '1px',
                                                            flexShrink: 0
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 1184,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '11.5px',
                                                                    fontWeight: '750',
                                                                    color: expiredSamples.length > 0 ? '#92400e' : '#334155'
                                                                },
                                                                children: "Expired Samples"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 1186,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '10.5px',
                                                                    color: expiredSamples.length > 0 ? "".concat(expiredSamples.length, " samples > 14d") : 'No expired samples'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 1187,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 1185,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1179,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '8px',
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    background: expiredQuotes.length > 0 ? '#fef2f2' : '#F5FAFE',
                                                    borderLeft: "3px solid ".concat(expiredQuotes.length > 0 ? '#ef4444' : '#D6E2F0')
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileCheck$3e$__["FileCheck"], {
                                                        size: 15,
                                                        style: {
                                                            color: expiredQuotes.length > 0 ? '#ef4444' : '#5E6B82',
                                                            marginTop: '1px',
                                                            flexShrink: 0
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 1197,
                                                        columnNumber: 22
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '11.5px',
                                                                    fontWeight: '750',
                                                                    color: expiredQuotes.length > 0 ? '#991b1b' : '#334155'
                                                                },
                                                                children: "Expired Quotations"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 1199,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '10.5px',
                                                                    color: expiredQuotes.length > 0 ? "".concat(expiredQuotes.length, " quotes expired") : 'No expired quotes'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 1200,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 1198,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1192,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '8px',
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    background: overduePayments.length > 0 ? '#fef2f2' : '#F5FAFE',
                                                    borderLeft: "3px solid ".concat(overduePayments.length > 0 ? '#ef4444' : '#D6E2F0')
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__["DollarSign"], {
                                                        size: 15,
                                                        style: {
                                                            color: overduePayments.length > 0 ? '#ef4444' : '#5E6B82',
                                                            marginTop: '1px',
                                                            flexShrink: 0
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 1210,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '11.5px',
                                                                    fontWeight: '750',
                                                                    color: overduePayments.length > 0 ? '#991b1b' : '#334155'
                                                                },
                                                                children: "Overdue Payments"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 1212,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '10.5px',
                                                                    color: overduePayments.length > 0 ? "".concat(overduePayments.length, " payments overdue") : 'No overdue payments'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 1213,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 1211,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1205,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1161,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 1149,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sales-pipeline-card",
                                style: {
                                    margin: 0,
                                    background: '#ffffff',
                                    border: '1px solid var(--color-border)',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    color: 'var(--color-text-primary)',
                                    boxShadow: 'var(--shadow-premium)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "card-top-bar",
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "card-heading",
                                            style: {
                                                fontSize: '13px',
                                                fontWeight: '800',
                                                margin: 0,
                                                color: 'var(--color-text-primary)'
                                            },
                                            children: "Conversion Trend"
                                        }, void 0, false, {
                                            fileName: "[project]/components/DashboardView.jsx",
                                            lineNumber: 1227,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1226,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '100%',
                                            height: '180px',
                                            marginTop: '6px'
                                        },
                                        children: isMounted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                            width: "100%",
                                            height: 180,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$AreaChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AreaChart"], {
                                                data: trendData,
                                                margin: {
                                                    top: 10,
                                                    right: 10,
                                                    left: -20,
                                                    bottom: 0
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                                                id: "colorLeadsMobile",
                                                                x1: "0",
                                                                y1: "0",
                                                                x2: "0",
                                                                y2: "1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                        offset: "5%",
                                                                        stopColor: "#0ea5e9",
                                                                        stopOpacity: 0.2
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/DashboardView.jsx",
                                                                        lineNumber: 1235,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                        offset: "95%",
                                                                        stopColor: "#0ea5e9",
                                                                        stopOpacity: 0
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/DashboardView.jsx",
                                                                        lineNumber: 1236,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 1234,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                                                id: "colorConvsMobile",
                                                                x1: "0",
                                                                y1: "0",
                                                                x2: "0",
                                                                y2: "1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                        offset: "5%",
                                                                        stopColor: "#10b981",
                                                                        stopOpacity: 0.2
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/DashboardView.jsx",
                                                                        lineNumber: 1239,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                                        offset: "95%",
                                                                        stopColor: "#10b981",
                                                                        stopOpacity: 0
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/DashboardView.jsx",
                                                                        lineNumber: 1240,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/DashboardView.jsx",
                                                                lineNumber: 1238,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 1233,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                                        strokeDasharray: "3 3",
                                                        stroke: "#f1f5f9",
                                                        vertical: false
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 1243,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                                        dataKey: "name",
                                                        stroke: "#5E6B82",
                                                        fontSize: 10,
                                                        tickLine: false,
                                                        axisLine: false
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 1244,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                                        stroke: "#5E6B82",
                                                        fontSize: 10,
                                                        tickLine: false,
                                                        axisLine: false
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 1245,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                        contentStyle: {
                                                            fontSize: '11px'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 1246,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Area"], {
                                                        type: "monotone",
                                                        dataKey: "Leads",
                                                        stroke: "#0ea5e9",
                                                        strokeWidth: 1.5,
                                                        fillOpacity: 1,
                                                        fill: "url(#colorLeadsMobile)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 1247,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Area"], {
                                                        type: "monotone",
                                                        dataKey: "Conversions",
                                                        stroke: "#10b981",
                                                        strokeWidth: 1.5,
                                                        fillOpacity: 1,
                                                        fill: "url(#colorConvsMobile)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 1248,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1232,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/DashboardView.jsx",
                                            lineNumber: 1231,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1229,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 1221,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: '#ffffff',
                                    border: '1px solid var(--color-border)',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    boxShadow: 'var(--shadow-premium)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                                size: 18,
                                                style: {
                                                    color: '#0ea5e9'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1262,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontWeight: '800',
                                                    fontSize: '13px',
                                                    color: 'var(--color-text-primary)'
                                                },
                                                children: "Quick Summary"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1263,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1261,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '8px'
                                        },
                                        children: [
                                            {
                                                label: 'Total Leads',
                                                val: totalLeadsCount,
                                                color: '#3b82f6'
                                            },
                                            {
                                                label: 'Qualified Leads',
                                                val: qualifiedLeadsCount,
                                                color: '#8b5cf6'
                                            },
                                            {
                                                label: 'Won Orders',
                                                val: wonOrdersCount,
                                                color: '#10b981'
                                            },
                                            {
                                                label: 'Lost Leads',
                                                val: lostLeadsCount,
                                                color: '#f43f5e'
                                            },
                                            {
                                                label: 'Conversion Rate',
                                                val: "".concat(conversionRate.toFixed(1), "%"),
                                                color: '#06b6d4'
                                            },
                                            {
                                                label: 'Revenue',
                                                val: "₹".concat(mySalesTotal.toLocaleString('en-IN')),
                                                color: '#10b981',
                                                fullWidth: true
                                            },
                                            {
                                                label: 'Avg Order Value',
                                                val: "₹".concat(avgOrderValue.toLocaleString('en-IN')),
                                                color: '#f59e0b',
                                                fullWidth: true
                                            },
                                            {
                                                label: 'Active Customers',
                                                val: activeCustomersCount,
                                                color: '#6366f1'
                                            }
                                        ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    gridColumn: item.fullWidth ? '1 / -1' : 'auto',
                                                    background: '#F5FAFE',
                                                    padding: '8px',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '2px',
                                                    border: '1px solid var(--color-border)'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '9px',
                                                            fontWeight: '700',
                                                            color: 'var(--color-text-secondary)',
                                                            textTransform: 'uppercase'
                                                        },
                                                        children: item.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 1283,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '12px',
                                                            fontWeight: '900',
                                                            color: item.color
                                                        },
                                                        children: item.val
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/DashboardView.jsx",
                                                        lineNumber: 1286,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, item.label, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1278,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1267,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 1256,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 1146,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DashboardView.jsx",
                lineNumber: 1033,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sales-analytics-grid",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "app-card sales-analytics-card",
                        style: {
                            padding: '20px',
                            background: '#fff',
                            border: '1px solid var(--color-border)',
                            borderRadius: '14px',
                            boxShadow: 'var(--shadow-premium)',
                            minWidth: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginBottom: '18px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        style: {
                                            margin: 0,
                                            fontSize: '17px',
                                            fontWeight: 850,
                                            color: '#24345C'
                                        },
                                        children: "Sales Target vs Achievement"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1303,
                                        columnNumber: 49
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            margin: '4px 0 0',
                                            fontSize: '12px',
                                            color: '#5E6B82'
                                        },
                                        children: "Current Month · confirmed and approved sales orders"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1303,
                                        columnNumber: 160
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 1303,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sales-target-kpis",
                                style: {
                                    marginBottom: '18px'
                                },
                                children: [
                                    [
                                        'Monthly Target',
                                        "₹".concat((salesTarget / 100000).toFixed(1), " L"),
                                        '#24345C'
                                    ],
                                    [
                                        'Achieved Sales',
                                        "₹".concat((currentMonthAchieved / 100000).toFixed(1), " L"),
                                        '#059669'
                                    ],
                                    [
                                        'Achievement',
                                        "".concat(targetAchievement.toFixed(1), "%"),
                                        '#7c3aed'
                                    ],
                                    [
                                        'Remaining Target',
                                        "₹".concat((remainingTarget / 100000).toFixed(1), " L"),
                                        '#ea580c'
                                    ],
                                    [
                                        'Days Remaining',
                                        daysRemaining,
                                        '#2563eb'
                                    ],
                                    [
                                        'Required Daily Sales',
                                        "₹".concat(Math.round(requiredDailySales).toLocaleString('en-IN')),
                                        '#dc2626'
                                    ]
                                ].map((param)=>{
                                    let [label, value, color] = param;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "sales-analytics-kpi",
                                        style: {
                                            padding: '11px 12px',
                                            borderRadius: '9px',
                                            background: '#F5FAFE',
                                            border: '1px solid #DCE5F0',
                                            minWidth: 0
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '10px',
                                                    fontWeight: 750,
                                                    color: '#5E6B82',
                                                    textTransform: 'uppercase'
                                                },
                                                children: label
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1312,
                                                columnNumber: 214
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: '4px',
                                                    fontSize: '16px',
                                                    fontWeight: 850,
                                                    color,
                                                    overflowWrap: 'anywhere'
                                                },
                                                children: value
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1312,
                                                columnNumber: 324
                                            }, this)
                                        ]
                                    }, label, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1312,
                                        columnNumber: 46
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 1304,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginBottom: '18px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '12px',
                                            fontWeight: 750,
                                            color: '#475569',
                                            marginBottom: '7px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "Current month progress"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1314,
                                                columnNumber: 189
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    targetAchievement.toFixed(1),
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1314,
                                                columnNumber: 224
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1314,
                                        columnNumber: 49
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            height: '10px',
                                            borderRadius: '999px',
                                            background: '#DCE5F0',
                                            overflow: 'hidden'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                height: '100%',
                                                width: "".concat(targetAchievement, "%"),
                                                borderRadius: '999px',
                                                background: 'linear-gradient(90deg, #84cc16, #16a34a)',
                                                transition: 'width .4s ease'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/components/DashboardView.jsx",
                                            lineNumber: 1314,
                                            columnNumber: 372
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1314,
                                        columnNumber: 274
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 1314,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: '100%',
                                    height: '260px',
                                    minWidth: 0
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                    width: "100%",
                                    height: "100%",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BarChart"], {
                                        data: monthlyTargetData,
                                        margin: {
                                            top: 5,
                                            right: 5,
                                            left: 0,
                                            bottom: 0
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                                strokeDasharray: "3 3",
                                                vertical: false,
                                                stroke: "#DCE5F0"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1315,
                                                columnNumber: 205
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                                dataKey: "month",
                                                tick: {
                                                    fontSize: 11
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1315,
                                                columnNumber: 277
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                                tick: {
                                                    fontSize: 10
                                                },
                                                tickFormatter: (value)=>"".concat(Math.round(value / 100000), "L")
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1315,
                                                columnNumber: 325
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                formatter: (value)=>"₹".concat(Number(value).toLocaleString('en-IN'))
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1315,
                                                columnNumber: 415
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Legend"], {
                                                wrapperStyle: {
                                                    fontSize: '11px'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1315,
                                                columnNumber: 490
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
                                                dataKey: "Target",
                                                fill: "#D6E2F0",
                                                radius: [
                                                    4,
                                                    4,
                                                    0,
                                                    0
                                                ]
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1315,
                                                columnNumber: 535
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
                                                dataKey: "Achieved",
                                                fill: "#84cc16",
                                                radius: [
                                                    4,
                                                    4,
                                                    0,
                                                    0
                                                ]
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1315,
                                                columnNumber: 592
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1315,
                                        columnNumber: 120
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/DashboardView.jsx",
                                    lineNumber: 1315,
                                    columnNumber: 72
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 1315,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 1302,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "app-card sales-analytics-card",
                        style: {
                            padding: '20px',
                            background: '#fff',
                            border: '1px solid var(--color-border)',
                            borderRadius: '14px',
                            boxShadow: 'var(--shadow-premium)',
                            minWidth: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginBottom: '18px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        style: {
                                            margin: 0,
                                            fontSize: '17px',
                                            fontWeight: 850,
                                            color: '#24345C'
                                        },
                                        children: "Sales Return Analysis"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1319,
                                        columnNumber: 49
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            margin: '4px 0 0',
                                            fontSize: '12px',
                                            color: '#5E6B82'
                                        },
                                        children: "Delivered orders and recorded customer return requests"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1319,
                                        columnNumber: 154
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 1319,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sales-return-kpis",
                                style: {
                                    marginBottom: '18px'
                                },
                                children: [
                                    [
                                        'Delivered Orders',
                                        deliveredOrdersForReturns.length
                                    ],
                                    [
                                        'Return Requests',
                                        returnOrders.length
                                    ],
                                    [
                                        'Returned Quantity',
                                        returnedQuantity.toLocaleString('en-IN')
                                    ],
                                    [
                                        'Return Value',
                                        "₹".concat(Math.round(returnValue).toLocaleString('en-IN'))
                                    ],
                                    [
                                        'Return Rate',
                                        "".concat(returnRate.toFixed(1), "%")
                                    ]
                                ].map((param)=>{
                                    let [label, value] = param;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "sales-analytics-kpi",
                                        style: {
                                            padding: '11px 12px',
                                            borderRadius: '9px',
                                            background: '#F5FAFE',
                                            border: '1px solid #DCE5F0'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    fontSize: '10px',
                                                    fontWeight: 750,
                                                    color: '#5E6B82',
                                                    textTransform: 'uppercase'
                                                },
                                                children: label
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1323,
                                                columnNumber: 193
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    marginTop: '4px',
                                                    fontSize: '16px',
                                                    fontWeight: 850,
                                                    color: '#24345C',
                                                    overflowWrap: 'anywhere'
                                                },
                                                children: value
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1323,
                                                columnNumber: 303
                                            }, this)
                                        ]
                                    }, label, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1323,
                                        columnNumber: 38
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 1320,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    width: '100%',
                                    height: '250px',
                                    minWidth: 0
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                                    width: "100%",
                                    height: "100%",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$BarChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BarChart"], {
                                        data: monthlyReturnData,
                                        margin: {
                                            top: 5,
                                            right: 5,
                                            left: 0,
                                            bottom: 0
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                                strokeDasharray: "3 3",
                                                vertical: false,
                                                stroke: "#DCE5F0"
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1325,
                                                columnNumber: 205
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                                                dataKey: "month",
                                                tick: {
                                                    fontSize: 11
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1325,
                                                columnNumber: 277
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                                yAxisId: "qty",
                                                tick: {
                                                    fontSize: 10
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1325,
                                                columnNumber: 325
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {
                                                yAxisId: "value",
                                                orientation: "right",
                                                tick: {
                                                    fontSize: 10
                                                },
                                                tickFormatter: (value)=>"".concat(Math.round(value / 1000), "k")
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1325,
                                                columnNumber: 371
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                                formatter: (value, name)=>name === 'ReturnValue' ? "₹".concat(Number(value).toLocaleString('en-IN')) : Number(value).toLocaleString('en-IN')
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1325,
                                                columnNumber: 495
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Legend"], {
                                                wrapperStyle: {
                                                    fontSize: '11px'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1325,
                                                columnNumber: 642
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
                                                yAxisId: "qty",
                                                dataKey: "ReturnQuantity",
                                                name: "Return Quantity",
                                                fill: "#f97316",
                                                radius: [
                                                    4,
                                                    4,
                                                    0,
                                                    0
                                                ]
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1325,
                                                columnNumber: 687
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Bar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bar"], {
                                                yAxisId: "value",
                                                dataKey: "ReturnValue",
                                                name: "Return Value",
                                                fill: "#ef4444",
                                                radius: [
                                                    4,
                                                    4,
                                                    0,
                                                    0
                                                ]
                                            }, void 0, false, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1325,
                                                columnNumber: 789
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1325,
                                        columnNumber: 120
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/DashboardView.jsx",
                                    lineNumber: 1325,
                                    columnNumber: 72
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 1325,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    borderTop: '1px solid #DCE5F0',
                                    paddingTop: '14px',
                                    marginTop: '8px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            fontSize: '12px',
                                            fontWeight: 800,
                                            margin: '0 0 10px',
                                            color: '#334155'
                                        },
                                        children: "Top Return Reasons"
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1326,
                                        columnNumber: 97
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '7px'
                                        },
                                        children: topReturnReasons.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    padding: '5px 9px',
                                                    borderRadius: '999px',
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    background: item.count ? '#fff7ed' : '#F5FAFE',
                                                    color: item.count ? '#c2410c' : '#8893A7',
                                                    border: "1px solid ".concat(item.count ? '#fed7aa' : '#DCE5F0')
                                                },
                                                children: [
                                                    item.reason,
                                                    " · ",
                                                    item.count
                                                ]
                                            }, item.reason, true, {
                                                fileName: "[project]/components/DashboardView.jsx",
                                                lineNumber: 1326,
                                                columnNumber: 301
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/DashboardView.jsx",
                                        lineNumber: 1326,
                                        columnNumber: 208
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/DashboardView.jsx",
                                lineNumber: 1326,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/DashboardView.jsx",
                        lineNumber: 1318,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/DashboardView.jsx",
                lineNumber: 1301,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/DashboardView.jsx",
        lineNumber: 460,
        columnNumber: 5
    }, this);
}
_s(DashboardView, "5bi8MvqjQHuol8NzA38QrEgQjM0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useMediaQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMediaQuery"]
    ];
});
_c2 = DashboardView;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "ConversionGauge");
__turbopack_context__.k.register(_c1, "ConversionGauges");
__turbopack_context__.k.register(_c2, "DashboardView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_DashboardView_jsx_07fbe990._.js.map