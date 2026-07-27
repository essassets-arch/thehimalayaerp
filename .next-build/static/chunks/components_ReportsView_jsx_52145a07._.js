(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ReportsView.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ReportsView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chart-column.mjs [app-client] (ecmascript) <export default as BarChart3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.mjs [app-client] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.mjs [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.mjs [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/dollar-sign.mjs [app-client] (ecmascript) <export default as DollarSign>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.mjs [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$percent$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Percent$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/percent.mjs [app-client] (ecmascript) <export default as Percent>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clipboard-list.mjs [app-client] (ecmascript) <export default as ClipboardList>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-check.mjs [app-client] (ecmascript) <export default as UserCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.mjs [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.mjs [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/shared/context/ERPContext.jsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/apiClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$export$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/export.service.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
function ReportsView(param) {
    let { leads = [], orders = [], payments = [], customers = [], user } = param;
    _s();
    const { state } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useERP"])();
    const settings = (state === null || state === void 0 ? void 0 : state.settings) || {};
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('overview');
    // Date filters
    const [dateFrom, setDateFrom] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "ReportsView.useState": ()=>{
            const d = new Date();
            d.setMonth(d.getMonth() - 6);
            return d.toISOString().split('T')[0];
        }
    }["ReportsView.useState"]);
    const [dateTo, setDateTo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "ReportsView.useState": ()=>new Date().toISOString().split('T')[0]
    }["ReportsView.useState"]);
    // Real reports data
    const [salesSummaryData, setSalesSummaryData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [topProductsData, setTopProductsData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [customerPerformanceData, setCustomerPerformanceData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isReportsLoading, setIsReportsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const fetchReports = async ()=>{
        setIsReportsLoading(true);
        try {
            const summaryRes = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/reports/sales/summary?date_from=".concat(dateFrom, "&date_to=").concat(dateTo));
            const productsRes = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/reports/sales/top-products?date_from=".concat(dateFrom, "&date_to=").concat(dateTo, "&limit=10"));
            const customersRes = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/reports/sales/customer-performance?date_from=".concat(dateFrom, "&date_to=").concat(dateTo));
            setSalesSummaryData(summaryRes.data || []);
            setTopProductsData(productsRes.data || []);
            setCustomerPerformanceData(customersRes.data || []);
        } catch (err) {
            console.error('Failed to fetch reports data', err);
        } finally{
            setIsReportsLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ReportsView.useEffect": ()=>{
            fetchReports();
        }
    }["ReportsView.useEffect"], [
        dateFrom,
        dateTo
    ]);
    // Role detection
    const isSalesAdmin = (user === null || user === void 0 ? void 0 : user.role) === 'Sales Admin' || (user === null || user === void 0 ? void 0 : user.role) === 'Super Admin' || (user === null || user === void 0 ? void 0 : user.role) === 'Admin';
    const myName = (user === null || user === void 0 ? void 0 : user.name) || '';
    // Data Filtering based on Role
    const myLeads = isSalesAdmin ? leads : leads.filter((l)=>l.salesperson === myName);
    const myOrders = isSalesAdmin ? orders : orders.filter((o)=>o.salesperson === myName);
    const myPayments = isSalesAdmin ? payments : payments.filter((p)=>myOrders.some((o)=>o.orderNo === p.orderNo));
    const myCustomers = isSalesAdmin ? customers : customers.filter((c)=>myOrders.some((o)=>{
            var _o_customer;
            return ((_o_customer = o.customer) === null || _o_customer === void 0 ? void 0 : _o_customer.id) === c.id || o.customerName === c.name;
        }) || myLeads.some((l)=>l.companyName === c.name));
    // Common calculations & formatting helpers
    const formatINR = (value)=>{
        if (value >= 10000000) {
            return "₹".concat((value / 10000000).toFixed(2), " Cr");
        } else if (value >= 100000) {
            return "₹".concat((value / 100000).toFixed(2), " L");
        }
        return "₹".concat(Math.round(value).toLocaleString('en-IN'));
    };
    const TODAY_STR = '2026-06-19';
    // Overall Statistics
    const totalLeads = myLeads.length;
    const convertedLeads = myLeads.filter((l)=>l.status === 'Converted').length;
    const conversionRate = totalLeads ? Math.round(convertedLeads / totalLeads * 100) : 0;
    const totalOutstandingVal = myPayments.filter((p)=>p.status !== 'Paid').reduce((sum, p)=>sum + ((p.totalAmount || 0) - (p.paidAmount || 0)), 0);
    const totalPaidVal = myPayments.reduce((sum, p)=>sum + (p.paidAmount || 0), 0);
    const paymentCollectionRate = totalPaidVal + totalOutstandingVal ? Math.round(totalPaidVal / (totalPaidVal + totalOutstandingVal) * 100) : 0;
    const totalSalesVal = myOrders.reduce((sum, o)=>{
        var _o_payment;
        return sum + (((_o_payment = o.payment) === null || _o_payment === void 0 ? void 0 : _o_payment.totalAmount) || o.totalValue || 0);
    }, 0);
    const displaySalesVal = salesSummaryData.length > 0 ? salesSummaryData.reduce((sum, item)=>sum + parseFloat(item.total_revenue || 0), 0) : totalSalesVal;
    // Targets logic
    // Map target to logged-in user if employee, or sum of all if admin
    const getAssignedTarget = ()=>{
        var _settings_salesTargets;
        if (isSalesAdmin) {
            return Object.values(settings.salesTargets || {}).reduce((a, b)=>a + b, 0) || 60000000;
        }
        return ((_settings_salesTargets = settings.salesTargets) === null || _settings_salesTargets === void 0 ? void 0 : _settings_salesTargets[user === null || user === void 0 ? void 0 : user.id]) || 5000000;
    };
    const assignedTarget = getAssignedTarget();
    const targetPct = Math.min(100, Math.round(displaySalesVal / assignedTarget * 100));
    const targetRemaining = Math.max(0, assignedTarget - displaySalesVal);
    // Tab configurations
    const tabs = [
        {
            id: 'overview',
            label: 'Overview',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chart$2d$column$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BarChart3$3e$__["BarChart3"], {
                size: 15
            }, void 0, false, {
                fileName: "[project]/components/ReportsView.jsx",
                lineNumber: 124,
                columnNumber: 48
            }, this)
        },
        {
            id: 'leads',
            label: 'Leads',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                size: 15
            }, void 0, false, {
                fileName: "[project]/components/ReportsView.jsx",
                lineNumber: 125,
                columnNumber: 42
            }, this)
        },
        {
            id: 'sales',
            label: 'Sales & Revenue',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__["DollarSign"], {
                size: 15
            }, void 0, false, {
                fileName: "[project]/components/ReportsView.jsx",
                lineNumber: 126,
                columnNumber: 52
            }, this)
        },
        {
            id: 'followups',
            label: 'Follow-ups',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                size: 15
            }, void 0, false, {
                fileName: "[project]/components/ReportsView.jsx",
                lineNumber: 127,
                columnNumber: 51
            }, this)
        },
        {
            id: 'target',
            label: 'Target Tracker',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                size: 15
            }, void 0, false, {
                fileName: "[project]/components/ReportsView.jsx",
                lineNumber: 128,
                columnNumber: 52
            }, this)
        },
        {
            id: 'customers',
            label: 'Customers',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__["UserCheck"], {
                size: 15
            }, void 0, false, {
                fileName: "[project]/components/ReportsView.jsx",
                lineNumber: 129,
                columnNumber: 50
            }, this)
        }
    ];
    if (isSalesAdmin) {
        tabs.push({
            id: 'team',
            label: 'Team Performance',
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                size: 15
            }, void 0, false, {
                fileName: "[project]/components/ReportsView.jsx",
                lineNumber: 133,
                columnNumber: 62
            }, this)
        });
    }
    // Lead Status & Channel Breakdown
    const leadStatuses = [
        'New',
        'Follow-up',
        'Sample Stage',
        'Quotation',
        'Converted',
        'Lost'
    ];
    const leadStatusCounts = leadStatuses.reduce((acc, status)=>{
        acc[status] = myLeads.filter((l)=>l.status === status).length;
        return acc;
    }, {});
    // Monthly Sales calculation
    const monthlySales = {};
    myOrders.forEach((o)=>{
        var _o_payment;
        if (!o.date) return;
        const mStr = o.date.slice(0, 7); // YYYY-MM
        const amt = ((_o_payment = o.payment) === null || _o_payment === void 0 ? void 0 : _o_payment.totalAmount) || o.totalValue || 0;
        monthlySales[mStr] = (monthlySales[mStr] || 0) + amt;
    });
    const monthsList = Object.keys(monthlySales).sort().slice(-6); // last 6 months
    if (monthsList.length === 0) {
        monthsList.push('2026-06');
        monthlySales['2026-06'] = 0;
    }
    const maxMonthlySales = Math.max(...monthsList.map((m)=>monthlySales[m]), 1);
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
    const getMonthLabel = (mStr)=>{
        const [yr, mn] = mStr.split('-');
        return "".concat(monthNames[mn] || mn, " '").concat(yr.slice(-2));
    };
    // Product Wise sales breakdown
    const productStats = {};
    myOrders.forEach((o)=>{
        if (Array.isArray(o.detailedItems)) {
            o.detailedItems.forEach((item)=>{
                const name = item.productName || item.name || 'Other Products';
                const qty = item.quantity || 0;
                const val = qty * (item.unitPrice || 0);
                if (!productStats[name]) productStats[name] = {
                    qty: 0,
                    revenue: 0
                };
                productStats[name].qty += qty;
                productStats[name].revenue += val;
            });
        } else {
            var _o_payment;
            const name = o.products || 'Other Products';
            const qty = o.quantity || o.totalQty || 1;
            const val = ((_o_payment = o.payment) === null || _o_payment === void 0 ? void 0 : _o_payment.totalAmount) || o.totalValue || 0;
            if (!productStats[name]) productStats[name] = {
                qty: 0,
                revenue: 0
            };
            productStats[name].qty += qty;
            productStats[name].revenue += val;
        }
    });
    // Customer wise sales
    const customerStats = {};
    myOrders.forEach((o)=>{
        var _o_customer, _o_payment;
        const name = ((_o_customer = o.customer) === null || _o_customer === void 0 ? void 0 : _o_customer.name) || o.customerName || 'Unknown Customer';
        const val = ((_o_payment = o.payment) === null || _o_payment === void 0 ? void 0 : _o_payment.totalAmount) || o.totalValue || 0;
        customerStats[name] = (customerStats[name] || 0) + val;
    });
    // Follow Ups calculations
    const followUpLeads = myLeads.filter((l)=>[
            'New',
            'Follow-up',
            'Sample Stage',
            'Quotation'
        ].includes(l.status) && l.followUpDate);
    const overdueFollowUps = followUpLeads.filter((l)=>l.followUpDate < TODAY_STR);
    const upcomingFollowUps = followUpLeads.filter((l)=>l.followUpDate >= TODAY_STR);
    // Salespersons comparison data
    const salespeople = [
        'Alex Carter',
        'Sarah Connor',
        'Alex Rivera'
    ];
    const teamStats = salespeople.map((name)=>{
        const repLeads = leads.filter((l)=>l.salesperson === name);
        const repOrders = orders.filter((o)=>o.salesperson === name);
        const repRevenue = repOrders.reduce((sum, o)=>{
            var _o_payment;
            return sum + (((_o_payment = o.payment) === null || _o_payment === void 0 ? void 0 : _o_payment.totalAmount) || o.totalValue || 0);
        }, 0);
        const repConverted = repLeads.filter((l)=>l.status === 'Converted').length;
        const repConversion = repLeads.length ? Math.round(repConverted / repLeads.length * 100) : 0;
        const repPayments = payments.filter((p)=>repOrders.some((o)=>o.orderNo === p.orderNo));
        const repOutstanding = repPayments.reduce((sum, p)=>sum + (p.status !== 'Paid' ? p.totalAmount - p.paidAmount : 0), 0);
        return {
            name,
            revenue: repRevenue,
            leadsCount: repLeads.length,
            ordersCount: repOrders.length,
            conversionRate: repConversion,
            outstanding: repOutstanding
        };
    }).sort((a, b)=>b.revenue - a.revenue);
    const totalTeamRevenue = teamStats.reduce((sum, t)=>sum + t.revenue, 1);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "app-card",
        style: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '80vh'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "module-header-row",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "module-title",
                                children: "Analytics & Reports"
                            }, void 0, false, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 234,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: '12.5px',
                                    color: 'var(--color-text-secondary)',
                                    marginTop: '4px'
                                },
                                children: [
                                    isSalesAdmin ? 'Company-wide' : "".concat((user === null || user === void 0 ? void 0 : user.name) || 'My'),
                                    " Sales Analytics Dashboard"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 235,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ReportsView.jsx",
                        lineNumber: 233,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#eaeaea',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '800',
                            color: 'var(--color-text-secondary)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCheck$3e$__["UserCheck"], {
                                size: 12
                            }, void 0, false, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 240,
                                columnNumber: 11
                            }, this),
                            "Role: ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    color: 'var(--color-text-primary)'
                                },
                                children: (user === null || user === void 0 ? void 0 : user.role) || 'Sales Representative'
                            }, void 0, false, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 241,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ReportsView.jsx",
                        lineNumber: 239,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ReportsView.jsx",
                lineNumber: 232,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--color-border)',
                    background: '#F5FAFE'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap'
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
                                        size: 14,
                                        style: {
                                            color: 'var(--color-text-secondary)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 258,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            color: 'var(--color-text-secondary)'
                                        },
                                        children: "Period:"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 259,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 257,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "date",
                                value: dateFrom,
                                onChange: (e)=>setDateFrom(e.target.value),
                                style: {
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--color-border)',
                                    fontSize: '12px'
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 261,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: '12px',
                                    color: 'var(--color-text-secondary)'
                                },
                                children: "to"
                            }, void 0, false, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 267,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "date",
                                value: dateTo,
                                onChange: (e)=>setDateTo(e.target.value),
                                style: {
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--color-border)',
                                    fontSize: '12px'
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 268,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: fetchReports,
                                disabled: isReportsLoading,
                                style: {
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'var(--color-accent-teal)',
                                    color: '#fff',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                        size: 12,
                                        className: isReportsLoading ? 'animate-spin' : ''
                                    }, void 0, false, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 291,
                                        columnNumber: 13
                                    }, this),
                                    "Apply"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 274,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ReportsView.jsx",
                        lineNumber: 256,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '8px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$export$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["exportSalesReportPDF"])({
                                        date_from: dateFrom,
                                        date_to: dateTo
                                    }),
                                style: {
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'var(--color-accent-teal)',
                                    color: '#fff',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                        size: 12
                                    }, void 0, false, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 313,
                                        columnNumber: 13
                                    }, this),
                                    "Export PDF"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 297,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    if (salesSummaryData.length > 0) {
                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$export$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["exportToCSV"])(salesSummaryData.map((item)=>({
                                                Month: item.month,
                                                Orders: item.order_count,
                                                Customers: item.unique_customers,
                                                Revenue: item.total_revenue,
                                                AverageOrder: item.avg_order_value,
                                                ClosedRevenue: item.closed_revenue,
                                                PendingRevenue: item.pending_revenue,
                                                CancelledRevenue: item.cancelled_revenue
                                            })), "sales-summary-".concat(dateFrom, "-to-").concat(dateTo, ".csv"));
                                    } else {
                                        alert("No sales summary data to export");
                                    }
                                },
                                style: {
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--color-border)',
                                    background: '#fff',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                        size: 12
                                    }, void 0, false, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 347,
                                        columnNumber: 13
                                    }, this),
                                    "Export CSV"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 316,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ReportsView.jsx",
                        lineNumber: 296,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ReportsView.jsx",
                lineNumber: 246,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tab-filters-row reports-tab-filters hide-scrollbar",
                style: {
                    overflowX: 'auto',
                    flexWrap: 'nowrap'
                },
                children: tabs.map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "filter-pill ".concat(activeTab === tab.id ? 'active' : ''),
                        onClick: ()=>setActiveTab(tab.id),
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexShrink: 0,
                            whiteSpace: 'nowrap',
                            padding: '8px 18px',
                            borderRadius: '30px'
                        },
                        children: [
                            tab.icon,
                            tab.label
                        ]
                    }, tab.id, true, {
                        fileName: "[project]/components/ReportsView.jsx",
                        lineNumber: 356,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/ReportsView.jsx",
                lineNumber: 354,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    flex: 1
                },
                children: [
                    activeTab === 'overview' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "kpi-grid",
                                style: {
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "kpi-card",
                                        style: {
                                            borderLeft: '5px solid var(--color-accent-teal)'
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
                                                        children: "Sales Revenue"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 385,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__["DollarSign"], {
                                                        size: 16,
                                                        style: {
                                                            color: 'var(--color-accent-teal)'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 386,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 384,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-value",
                                                children: formatINR(displaySalesVal)
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 388,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '11px',
                                                    color: 'var(--color-text-secondary)',
                                                    fontWeight: '700'
                                                },
                                                children: [
                                                    "Target: ",
                                                    formatINR(assignedTarget),
                                                    " (",
                                                    targetPct,
                                                    "%)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 389,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 383,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "kpi-card",
                                        style: {
                                            borderLeft: '5px solid var(--color-lime-brand)'
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
                                                        children: "Leads Conversion"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 396,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$percent$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Percent$3e$__["Percent"], {
                                                        size: 16,
                                                        style: {
                                                            color: 'var(--color-accent-green)'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 397,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 395,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-value",
                                                children: [
                                                    conversionRate,
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 399,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '11px',
                                                    color: 'var(--color-text-secondary)',
                                                    fontWeight: '700'
                                                },
                                                children: [
                                                    convertedLeads,
                                                    " Converted / ",
                                                    totalLeads,
                                                    " Total"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 400,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 394,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "kpi-card",
                                        style: {
                                            borderLeft: '5px solid var(--color-accent-purple)'
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
                                                        children: "Outstanding Payments"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 407,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                                        size: 16,
                                                        style: {
                                                            color: 'var(--color-accent-purple)'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 408,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 406,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-value",
                                                children: formatINR(totalOutstandingVal)
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 410,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '11px',
                                                    color: 'var(--color-text-secondary)',
                                                    fontWeight: '700'
                                                },
                                                children: [
                                                    "Collection Rate: ",
                                                    paymentCollectionRate,
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 411,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 405,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "kpi-card",
                                        style: {
                                            borderLeft: '5px solid #f59e0b'
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
                                                        children: "Pending Follow-Ups"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 418,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                        size: 16,
                                                        style: {
                                                            color: '#f59e0b'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 419,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 417,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-value",
                                                children: followUpLeads.length
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 421,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '11px',
                                                    color: 'var(--color-text-secondary)',
                                                    fontWeight: '700'
                                                },
                                                children: [
                                                    "Overdue: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            color: overdueFollowUps.length > 0 ? '#ef4444' : 'inherit'
                                                        },
                                                        children: overdueFollowUps.length
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 423,
                                                        columnNumber: 28
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 422,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 416,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 382,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "report-metrics-grid",
                                style: {
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
                                    gap: '20px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: '#ffffff',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-xl)',
                                            padding: '20px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    fontSize: '13px',
                                                    fontWeight: '800',
                                                    textTransform: 'uppercase',
                                                    color: 'var(--color-text-secondary)',
                                                    marginBottom: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                                                        size: 16
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 432,
                                                        columnNumber: 19
                                                    }, this),
                                                    " Target vs Achievement Progress"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 431,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "report-bar-row",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "report-bar-label-row",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "Target Completed"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 436,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontWeight: '800'
                                                                },
                                                                children: [
                                                                    targetPct,
                                                                    "% Achieved"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 437,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 435,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "report-bar-track",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "report-bar-fill",
                                                            style: {
                                                                width: "".concat(targetPct, "%"),
                                                                background: 'var(--color-accent-teal)'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 440,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 439,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            fontSize: '11.5px',
                                                            marginTop: '4px',
                                                            color: 'var(--color-text-secondary)'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    "Achieved: ",
                                                                    formatINR(displaySalesVal)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 443,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    "Remaining: ",
                                                                    formatINR(targetRemaining)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 444,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 442,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 434,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 430,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: '#ffffff',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-xl)',
                                            padding: '20px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    fontSize: '13px',
                                                    fontWeight: '800',
                                                    textTransform: 'uppercase',
                                                    color: 'var(--color-text-secondary)',
                                                    marginBottom: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                                        size: 16
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 451,
                                                        columnNumber: 19
                                                    }, this),
                                                    " Payment Collection Efficiency"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 450,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "report-bar-row",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "report-bar-label-row",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: "Collected Rate"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 455,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontWeight: '800'
                                                                },
                                                                children: [
                                                                    paymentCollectionRate,
                                                                    "% Efficiency"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 456,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 454,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "report-bar-track",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "report-bar-fill",
                                                            style: {
                                                                width: "".concat(paymentCollectionRate, "%"),
                                                                background: 'var(--color-accent-purple)'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 459,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 458,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            fontSize: '11.5px',
                                                            marginTop: '4px',
                                                            color: 'var(--color-text-secondary)'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    "Paid: ",
                                                                    formatINR(totalPaidVal)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 462,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    "Outstanding: ",
                                                                    formatINR(totalOutstandingVal)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 463,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 461,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 453,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 449,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 429,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ReportsView.jsx",
                        lineNumber: 380,
                        columnNumber: 11
                    }, this),
                    activeTab === 'leads' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "kpi-grid",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "kpi-card",
                                        style: {
                                            borderLeft: '4px solid var(--color-accent-teal)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-label",
                                                children: "Active Leads"
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 476,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-value",
                                                children: myLeads.filter((l)=>[
                                                        'New',
                                                        'Follow-up',
                                                        'Sample Stage',
                                                        'Quotation'
                                                    ].includes(l.status)).length
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 477,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 475,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "kpi-card",
                                        style: {
                                            borderLeft: '4px solid var(--color-accent-green)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-label",
                                                children: "Converted Leads"
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 480,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-value",
                                                children: myLeads.filter((l)=>l.status === 'Converted').length
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 481,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 479,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "kpi-card",
                                        style: {
                                            borderLeft: '4px solid #ef4444'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-label",
                                                children: "Lost Leads"
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 484,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-value",
                                                children: myLeads.filter((l)=>l.status === 'Lost').length
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 485,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 483,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 474,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "report-metrics-grid",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: '#ffffff',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-xl)',
                                        padding: '20px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            style: {
                                                fontSize: '13px',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                color: 'var(--color-text-secondary)',
                                                marginBottom: '16px'
                                            },
                                            children: "Leads Status Summary"
                                        }, void 0, false, {
                                            fileName: "[project]/components/ReportsView.jsx",
                                            lineNumber: 492,
                                            columnNumber: 17
                                        }, this),
                                        leadStatuses.map((status)=>{
                                            const count = leadStatusCounts[status] || 0;
                                            const pct = totalLeads ? Math.round(count / totalLeads * 100) : 0;
                                            let barColor = 'var(--color-accent-teal)';
                                            if (status === 'Converted') barColor = 'var(--color-accent-green)';
                                            if (status === 'Lost') barColor = '#ef4444';
                                            if (status === 'Follow-up') barColor = '#f59e0b';
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "report-bar-row",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "report-bar-label-row",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: status
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 505,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontWeight: '800'
                                                                },
                                                                children: [
                                                                    count,
                                                                    " leads (",
                                                                    pct,
                                                                    "%)"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 506,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 504,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "report-bar-track",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "report-bar-fill",
                                                            style: {
                                                                width: "".concat(pct, "%"),
                                                                background: barColor
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 509,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 508,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, status, true, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 503,
                                                columnNumber: 21
                                            }, this);
                                        })
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ReportsView.jsx",
                                    lineNumber: 491,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 489,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "crm-table-container app-card",
                                style: {
                                    padding: '20px',
                                    marginTop: '10px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '16px'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            style: {
                                                fontSize: '14px',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                color: 'var(--color-text-secondary)'
                                            },
                                            children: "Leads Directory"
                                        }, void 0, false, {
                                            fileName: "[project]/components/ReportsView.jsx",
                                            lineNumber: 520,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 519,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            overflowX: 'auto'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                            className: "crm-table",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Lead ID"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 528,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Company Name"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 529,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Contact Person"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 530,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Status"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 531,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Follow Up Date"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 532,
                                                                columnNumber: 23
                                                            }, this),
                                                            isSalesAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Salesperson"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 533,
                                                                columnNumber: 40
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 527,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 526,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                    children: myLeads.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            colSpan: isSalesAdmin ? 6 : 5,
                                                            style: {
                                                                textAlign: 'center',
                                                                padding: '24px',
                                                                color: 'var(--color-text-muted)'
                                                            },
                                                            children: "No leads assigned."
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 539,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 538,
                                                        columnNumber: 23
                                                    }, this) : myLeads.map((lead)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '800'
                                                                    },
                                                                    children: [
                                                                        "#",
                                                                        lead.id
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 546,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                fontWeight: '700'
                                                                            },
                                                                            children: lead.companyName
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/ReportsView.jsx",
                                                                            lineNumber: 548,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                fontSize: '11px',
                                                                                color: 'var(--color-text-muted)'
                                                                            },
                                                                            children: lead.requirements
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/ReportsView.jsx",
                                                                            lineNumber: 549,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 547,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: lead.contactPerson || 'N/A'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 551,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "badge badge-".concat(lead.status === 'Converted' ? 'success' : lead.status === 'Lost' ? 'danger' : lead.status === 'Follow-up' ? 'warning' : 'info'),
                                                                        children: lead.status
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/ReportsView.jsx",
                                                                        lineNumber: 553,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 552,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '700',
                                                                        color: lead.followUpDate && lead.followUpDate < TODAY_STR ? '#ef4444' : 'inherit'
                                                                    },
                                                                    children: lead.followUpDate || 'No follow-up set'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 561,
                                                                    columnNumber: 27
                                                                }, this),
                                                                isSalesAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '700'
                                                                    },
                                                                    children: lead.salesperson
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 564,
                                                                    columnNumber: 44
                                                                }, this)
                                                            ]
                                                        }, lead.id, true, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 545,
                                                            columnNumber: 25
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 536,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/ReportsView.jsx",
                                            lineNumber: 525,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 524,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 518,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ReportsView.jsx",
                        lineNumber: 473,
                        columnNumber: 11
                    }, this),
                    activeTab === 'sales' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "report-metrics-grid",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: '#ffffff',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-xl)',
                                            padding: '20px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    fontSize: '13px',
                                                    fontWeight: '800',
                                                    textTransform: 'uppercase',
                                                    color: 'var(--color-text-secondary)',
                                                    marginBottom: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                                        size: 15
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 582,
                                                        columnNumber: 19
                                                    }, this),
                                                    " Sales Amount by Month"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 581,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-around',
                                                    alignItems: 'flex-end',
                                                    height: '240px',
                                                    padding: '10px 0',
                                                    borderBottom: '1px solid var(--color-border)',
                                                    marginBottom: '10px',
                                                    gap: '8px',
                                                    width: '100%',
                                                    overflowX: 'auto',
                                                    scrollbarWidth: 'none',
                                                    WebkitOverflowScrolling: 'touch'
                                                },
                                                children: salesSummaryData.length > 0 ? [
                                                    ...salesSummaryData
                                                ].slice(0, 6).reverse().map((d)=>{
                                                    const val = parseFloat(d.total_revenue || 0);
                                                    const maxVal = Math.max(...salesSummaryData.map((item)=>parseFloat(item.total_revenue || 0)), 1);
                                                    const pct = maxVal > 0 ? Math.max(5, Math.round(val / maxVal * 100)) : 5;
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            flex: 1,
                                                            minWidth: '60px',
                                                            maxWidth: '80px',
                                                            height: '100%',
                                                            justifyContent: 'flex-end',
                                                            gap: '8px'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '10px',
                                                                    fontWeight: '800',
                                                                    color: 'var(--color-text-primary)',
                                                                    whiteSpace: 'nowrap'
                                                                },
                                                                children: formatINR(val)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 616,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    width: '100%',
                                                                    height: '150px',
                                                                    display: 'flex',
                                                                    alignItems: 'flex-end',
                                                                    justifyContent: 'center'
                                                                },
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        width: '100%',
                                                                        maxWidth: '32px',
                                                                        height: "".concat(pct, "%"),
                                                                        background: 'linear-gradient(180deg, var(--color-accent-teal), #4db6ac)',
                                                                        borderRadius: '6px 6px 0 0',
                                                                        transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                        boxShadow: '0 2px 8px rgba(0, 150, 136, 0.15)'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 632,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 625,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '11px',
                                                                    fontWeight: '700',
                                                                    color: 'var(--color-text-secondary)',
                                                                    whiteSpace: 'nowrap',
                                                                    marginTop: '4px'
                                                                },
                                                                children: d.month
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 645,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, d.month, true, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 605,
                                                        columnNumber: 25
                                                    }, this);
                                                }) : monthsList.map((m)=>{
                                                    const val = monthlySales[m] || 0;
                                                    const pct = maxMonthlySales > 0 ? Math.max(5, Math.round(val / maxMonthlySales * 100)) : 5;
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            flex: 1,
                                                            minWidth: '60px',
                                                            maxWidth: '80px',
                                                            height: '100%',
                                                            justifyContent: 'flex-end',
                                                            gap: '8px'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '10px',
                                                                    fontWeight: '800',
                                                                    color: 'var(--color-text-primary)',
                                                                    whiteSpace: 'nowrap'
                                                                },
                                                                children: formatINR(val)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 673,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    width: '100%',
                                                                    height: '150px',
                                                                    display: 'flex',
                                                                    alignItems: 'flex-end',
                                                                    justifyContent: 'center'
                                                                },
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        width: '100%',
                                                                        maxWidth: '32px',
                                                                        height: "".concat(pct, "%"),
                                                                        background: 'linear-gradient(180deg, var(--color-accent-teal), #4db6ac)',
                                                                        borderRadius: '6px 6px 0 0',
                                                                        transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                        boxShadow: '0 2px 8px rgba(0, 150, 136, 0.15)'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 689,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 682,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '11px',
                                                                    fontWeight: '700',
                                                                    color: 'var(--color-text-secondary)',
                                                                    whiteSpace: 'nowrap',
                                                                    marginTop: '4px'
                                                                },
                                                                children: getMonthLabel(m)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 702,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, m, true, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 662,
                                                        columnNumber: 25
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 585,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 580,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            background: '#ffffff',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-xl)',
                                            padding: '20px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                style: {
                                                    fontSize: '13px',
                                                    fontWeight: '800',
                                                    textTransform: 'uppercase',
                                                    color: 'var(--color-text-secondary)',
                                                    marginBottom: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$list$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardList$3e$__["ClipboardList"], {
                                                        size: 15
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 721,
                                                        columnNumber: 19
                                                    }, this),
                                                    " Product Performance Breakdown"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 720,
                                                columnNumber: 17
                                            }, this),
                                            topProductsData.length > 0 ? topProductsData.map((prod)=>{
                                                const revenue = parseFloat(prod.total_revenue || 0);
                                                const quantity = parseFloat(prod.total_quantity || 0);
                                                const maxRev = Math.max(...topProductsData.map((p)=>parseFloat(p.total_revenue || 0)), 1);
                                                const pct = Math.round(revenue / maxRev * 100);
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "report-bar-row",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "report-bar-label-row",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontWeight: '700'
                                                                    },
                                                                    children: [
                                                                        prod.product_name,
                                                                        " (",
                                                                        prod.product_code,
                                                                        ")"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 733,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontWeight: '800'
                                                                    },
                                                                    children: [
                                                                        quantity,
                                                                        " ",
                                                                        prod.unit_of_measure,
                                                                        " (",
                                                                        formatINR(revenue),
                                                                        ")"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 734,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 732,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "report-bar-track",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "report-bar-fill",
                                                                style: {
                                                                    width: "".concat(pct, "%"),
                                                                    background: 'var(--color-accent-teal)'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 739,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 738,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, prod.id, true, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 731,
                                                    columnNumber: 23
                                                }, this);
                                            }) : Object.keys(productStats).length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    textAlign: 'center',
                                                    padding: '40px',
                                                    color: 'var(--color-text-muted)',
                                                    fontSize: '12px'
                                                },
                                                children: "No products sold."
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 745,
                                                columnNumber: 19
                                            }, this) : Object.keys(productStats).sort((a, b)=>productStats[b].revenue - productStats[a].revenue).map((pName)=>{
                                                const stats = productStats[pName];
                                                const maxRevenue = Math.max(...Object.values(productStats).map((ps)=>ps.revenue), 1);
                                                const pct = Math.round(stats.revenue / maxRevenue * 100);
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "report-bar-row",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "report-bar-label-row",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontWeight: '700'
                                                                    },
                                                                    children: pName
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 756,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontWeight: '800'
                                                                    },
                                                                    children: [
                                                                        stats.qty,
                                                                        " sold (",
                                                                        formatINR(stats.revenue),
                                                                        ")"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 757,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 755,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "report-bar-track",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "report-bar-fill",
                                                                style: {
                                                                    width: "".concat(pct, "%"),
                                                                    background: 'var(--color-accent-teal)'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 762,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 761,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, pName, true, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 754,
                                                    columnNumber: 23
                                                }, this);
                                            })
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 719,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 578,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "crm-table-container app-card",
                                style: {
                                    padding: '20px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            fontSize: '14px',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            color: 'var(--color-text-secondary)',
                                            marginBottom: '16px'
                                        },
                                        children: "Orders Log"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 773,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            overflowX: 'auto'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                            className: "crm-table",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Order No"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 780,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Date"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 781,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Customer"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 782,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Product Details"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 783,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Total Value"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 784,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Order Status"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 785,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Payment Status"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 786,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 779,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 778,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                    children: myOrders.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            colSpan: 7,
                                                            style: {
                                                                textAlign: 'center',
                                                                padding: '24px',
                                                                color: 'var(--color-text-muted)'
                                                            },
                                                            children: "No orders registered."
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 792,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 791,
                                                        columnNumber: 23
                                                    }, this) : myOrders.map((order)=>{
                                                        var _order_payment, _order_payment1, _order_payment2, _order_payment3, _order_payment4, _order_customer;
                                                        const orderVal = ((_order_payment = order.payment) === null || _order_payment === void 0 ? void 0 : _order_payment.totalAmount) || order.totalValue || 0;
                                                        const outstanding = order.payment ? order.payment.totalAmount - order.payment.paid : orderVal;
                                                        const payStatus = ((_order_payment1 = order.payment) === null || _order_payment1 === void 0 ? void 0 : _order_payment1.paid) === ((_order_payment2 = order.payment) === null || _order_payment2 === void 0 ? void 0 : _order_payment2.totalAmount) && ((_order_payment3 = order.payment) === null || _order_payment3 === void 0 ? void 0 : _order_payment3.totalAmount) > 0 ? 'Paid' : ((_order_payment4 = order.payment) === null || _order_payment4 === void 0 ? void 0 : _order_payment4.paid) > 0 ? 'Partial' : 'Unpaid';
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '800'
                                                                    },
                                                                    children: order.orderNo
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 808,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: order.date
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 809,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '700'
                                                                    },
                                                                    children: ((_order_customer = order.customer) === null || _order_customer === void 0 ? void 0 : _order_customer.name) || order.customerName
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 810,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: order.products
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 811,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '800'
                                                                    },
                                                                    children: formatINR(orderVal)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 812,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "badge badge-".concat(order.status === 'Closed' ? 'success' : order.status === 'Cancelled' ? 'danger' : 'info'),
                                                                        children: order.status
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/ReportsView.jsx",
                                                                        lineNumber: 814,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 813,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "badge badge-".concat(payStatus === 'Paid' ? 'success' : payStatus === 'Partial' ? 'warning' : 'danger'),
                                                                        children: payStatus
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/ReportsView.jsx",
                                                                        lineNumber: 822,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 821,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, order.orderNo, true, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 807,
                                                            columnNumber: 27
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 789,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/ReportsView.jsx",
                                            lineNumber: 777,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 776,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 772,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ReportsView.jsx",
                        lineNumber: 577,
                        columnNumber: 11
                    }, this),
                    activeTab === 'followups' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "kpi-grid",
                                style: {
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "kpi-card",
                                        style: {
                                            borderLeft: '4px solid var(--color-accent-purple)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-label",
                                                children: "Active Leads needing Follow-ups"
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 845,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-value",
                                                children: followUpLeads.length
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 846,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 844,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "kpi-card",
                                        style: {
                                            borderLeft: '4px solid #ef4444'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-label",
                                                children: "Overdue Follow-ups"
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 849,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-value",
                                                children: overdueFollowUps.length
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 850,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '11px',
                                                    color: '#ef4444',
                                                    fontWeight: '700'
                                                },
                                                children: "Prioritize these immediately"
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 851,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 848,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "kpi-card",
                                        style: {
                                            borderLeft: '4px solid var(--color-accent-green)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-label",
                                                children: "Upcoming Follow-ups"
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 854,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-value",
                                                children: upcomingFollowUps.length
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 855,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '11px',
                                                    color: 'var(--color-text-secondary)'
                                                },
                                                children: "Scheduled for future dates"
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 856,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 853,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 843,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "crm-table-container app-card",
                                style: {
                                    padding: '20px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            fontSize: '14px',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            color: 'var(--color-text-secondary)',
                                            marginBottom: '16px'
                                        },
                                        children: "Follow-Up Schedule"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 861,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            overflowX: 'auto'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                            className: "crm-table",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Company"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 868,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Contact Person"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 869,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Follow Up Date"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 870,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Status"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 871,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Latest Logged Communication"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 872,
                                                                columnNumber: 23
                                                            }, this),
                                                            isSalesAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Representative"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 873,
                                                                columnNumber: 40
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 867,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 866,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                    children: followUpLeads.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            colSpan: isSalesAdmin ? 6 : 5,
                                                            style: {
                                                                textAlign: 'center',
                                                                padding: '24px',
                                                                color: 'var(--color-text-muted)'
                                                            },
                                                            children: "No pending follow-ups. Good job!"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 879,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 878,
                                                        columnNumber: 23
                                                    }, this) : followUpLeads.map((lead)=>{
                                                        const isOverdue = lead.followUpDate < TODAY_STR;
                                                        const latestTimeline = lead.timeline && lead.timeline.length > 0 ? lead.timeline[lead.timeline.length - 1] : null;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            style: {
                                                                background: isOverdue ? 'rgba(239, 68, 68, 0.02)' : 'inherit'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '700'
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: lead.companyName
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/ReportsView.jsx",
                                                                            lineNumber: 893,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            style: {
                                                                                fontSize: '11px',
                                                                                color: 'var(--color-text-muted)'
                                                                            },
                                                                            children: [
                                                                                "ID: #",
                                                                                lead.id
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/components/ReportsView.jsx",
                                                                            lineNumber: 894,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 892,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: lead.contactPerson
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 896,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '800',
                                                                        color: isOverdue ? '#ef4444' : 'var(--color-accent-teal)'
                                                                    },
                                                                    children: [
                                                                        lead.followUpDate,
                                                                        " ",
                                                                        isOverdue && ' (OVERDUE)'
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 897,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "badge badge-info",
                                                                        children: lead.status
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/ReportsView.jsx",
                                                                        lineNumber: 901,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 900,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: latestTimeline ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            fontSize: '12px'
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                                style: {
                                                                                    color: 'var(--color-text-secondary)'
                                                                                },
                                                                                children: [
                                                                                    "[",
                                                                                    latestTimeline.stage,
                                                                                    "]"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                                lineNumber: 906,
                                                                                columnNumber: 35
                                                                            }, this),
                                                                            " ",
                                                                            latestTimeline.text,
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                style: {
                                                                                    fontSize: '10px',
                                                                                    color: 'var(--color-text-muted)'
                                                                                },
                                                                                children: latestTimeline.date
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                                lineNumber: 907,
                                                                                columnNumber: 35
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/components/ReportsView.jsx",
                                                                        lineNumber: 905,
                                                                        columnNumber: 33
                                                                    }, this) : 'No remarks logged.'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 903,
                                                                    columnNumber: 29
                                                                }, this),
                                                                isSalesAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '700'
                                                                    },
                                                                    children: lead.salesperson
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 911,
                                                                    columnNumber: 46
                                                                }, this)
                                                            ]
                                                        }, lead.id, true, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 891,
                                                            columnNumber: 27
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 876,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/ReportsView.jsx",
                                            lineNumber: 865,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 864,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 860,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ReportsView.jsx",
                        lineNumber: 842,
                        columnNumber: 11
                    }, this),
                    activeTab === 'target' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                background: '#ffffff',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-xl)',
                                padding: 'clamp(16px, 4vw, 30px)',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
                                gap: 'clamp(16px, 4vw, 30px)',
                                alignItems: 'center'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                width: '160px',
                                                height: '160px',
                                                borderRadius: '50%',
                                                background: "conic-gradient(var(--color-accent-teal) ".concat(targetPct, "%, #f1f3f5 0)"),
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                marginBottom: '16px',
                                                position: 'relative',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    width: '136px',
                                                    height: '136px',
                                                    borderRadius: '50%',
                                                    background: '#ffffff',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '28px',
                                                            fontWeight: '800',
                                                            color: 'var(--color-text-primary)',
                                                            lineHeight: 1
                                                        },
                                                        children: [
                                                            targetPct,
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 961,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontSize: '10px',
                                                            fontWeight: '700',
                                                            textTransform: 'uppercase',
                                                            color: 'var(--color-text-muted)',
                                                            marginTop: '4px'
                                                        },
                                                        children: "Completed"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 964,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 950,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/ReportsView.jsx",
                                            lineNumber: 938,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            style: {
                                                fontSize: '15px',
                                                fontWeight: '800',
                                                color: 'var(--color-text-primary)'
                                            },
                                            children: targetPct >= 80 ? 'Exceptional Performance!' : targetPct >= 50 ? 'On Track' : 'Action Required'
                                        }, void 0, false, {
                                            fileName: "[project]/components/ReportsView.jsx",
                                            lineNumber: 970,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: '12px',
                                                color: 'var(--color-text-secondary)',
                                                maxWidth: '300px',
                                                marginTop: '6px'
                                            },
                                            children: targetPct >= 80 ? 'Excellent job! You are hitting key sales milestones and driving top-line revenue.' : targetPct >= 50 ? 'Progress is steady. Convert pending high-value quotations to guarantee goal completion.' : 'Immediate follow-up on outstanding payments and warm leads is required to secure targets.'
                                        }, void 0, false, {
                                            fileName: "[project]/components/ReportsView.jsx",
                                            lineNumber: 973,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ReportsView.jsx",
                                    lineNumber: 937,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '20px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: '11px',
                                                        fontWeight: '800',
                                                        textTransform: 'uppercase',
                                                        color: 'var(--color-text-secondary)'
                                                    },
                                                    children: "Target Assigned"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 985,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: '24px',
                                                        fontWeight: '800',
                                                        color: 'var(--color-text-primary)',
                                                        marginTop: '4px'
                                                    },
                                                    children: formatINR(assignedTarget)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 988,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/ReportsView.jsx",
                                            lineNumber: 984,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: '11px',
                                                        fontWeight: '800',
                                                        textTransform: 'uppercase',
                                                        color: 'var(--color-text-secondary)'
                                                    },
                                                    children: "Revenue Achieved"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 994,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: '24px',
                                                        fontWeight: '800',
                                                        color: 'var(--color-accent-teal)',
                                                        marginTop: '4px'
                                                    },
                                                    children: formatINR(displaySalesVal)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 997,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/ReportsView.jsx",
                                            lineNumber: 993,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: '11px',
                                                        fontWeight: '800',
                                                        textTransform: 'uppercase',
                                                        color: 'var(--color-text-secondary)'
                                                    },
                                                    children: "Remaining Deficit"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 1003,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        fontSize: '24px',
                                                        fontWeight: '800',
                                                        color: targetRemaining > 0 ? '#ef4444' : 'var(--color-accent-green)',
                                                        marginTop: '4px'
                                                    },
                                                    children: targetRemaining > 0 ? formatINR(targetRemaining) : 'Target Reached! 🎉'
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 1006,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/ReportsView.jsx",
                                            lineNumber: 1002,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/ReportsView.jsx",
                                    lineNumber: 983,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ReportsView.jsx",
                            lineNumber: 926,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/ReportsView.jsx",
                        lineNumber: 925,
                        columnNumber: 11
                    }, this),
                    activeTab === 'customers' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "kpi-grid",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "kpi-card",
                                        style: {
                                            borderLeft: '4px solid var(--color-accent-teal)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-label",
                                                children: "My Customers"
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 1020,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-value",
                                                children: myCustomers.length
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 1021,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 1019,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "kpi-card",
                                        style: {
                                            borderLeft: '4px solid var(--color-accent-green)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-label",
                                                children: "Active Orders"
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 1024,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-value",
                                                children: myOrders.filter((o)=>o.status !== 'Closed' && o.status !== 'Cancelled').length
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 1025,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 1023,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "kpi-card",
                                        style: {
                                            borderLeft: '4px solid var(--color-accent-purple)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-label",
                                                children: "Repeat Customers"
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 1028,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "kpi-value",
                                                children: myCustomers.filter((c)=>c.totalOrders > 1 || c.ordersHistory && c.ordersHistory.length > 1).length
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 1029,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 1027,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 1018,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "crm-table-container app-card",
                                style: {
                                    padding: '20px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            fontSize: '14px',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            color: 'var(--color-text-secondary)',
                                            marginBottom: '16px'
                                        },
                                        children: "Customers List"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 1034,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            overflowX: 'auto'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                            className: "crm-table",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Customer Name"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 1041,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Contact Info"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 1042,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Total Orders"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 1043,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Total Value"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 1044,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Outstanding Balance"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 1045,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Latest Communication Log"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 1046,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 1040,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 1039,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                    children: customerPerformanceData.length > 0 ? customerPerformanceData.map((customer)=>{
                                                        const totalOrders = customer.order_count;
                                                        const totalRevenue = parseFloat(customer.total_spent || 0);
                                                        const outstanding = 0; // customer performance query doesn't directly compute receivables, fallback to 0
                                                        const completed = customer.completed_orders;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '700'
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: customer.customer_name
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/ReportsView.jsx",
                                                                            lineNumber: 1059,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            style: {
                                                                                fontSize: '10px',
                                                                                color: 'var(--color-text-muted)'
                                                                            },
                                                                            children: [
                                                                                "Code: ",
                                                                                customer.customer_code
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/components/ReportsView.jsx",
                                                                            lineNumber: 1060,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1058,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: [
                                                                                customer.city || 'N/A',
                                                                                ", ",
                                                                                customer.state || 'N/A'
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/components/ReportsView.jsx",
                                                                            lineNumber: 1063,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                fontSize: '11px',
                                                                                color: 'var(--color-text-muted)'
                                                                            },
                                                                            children: [
                                                                                "GSTIN: ",
                                                                                customer.gstin || 'N/A'
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/components/ReportsView.jsx",
                                                                            lineNumber: 1064,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1062,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '800'
                                                                    },
                                                                    children: totalOrders
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1066,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '800',
                                                                        color: 'var(--color-accent-teal)'
                                                                    },
                                                                    children: formatINR(totalRevenue)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1067,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '800'
                                                                    },
                                                                    children: [
                                                                        completed,
                                                                        " / ",
                                                                        totalOrders,
                                                                        " Completed"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1068,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            fontSize: '12px'
                                                                        },
                                                                        children: [
                                                                            "Last Order: ",
                                                                            customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'N/A'
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/components/ReportsView.jsx",
                                                                        lineNumber: 1072,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1071,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, customer.id, true, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 1057,
                                                            columnNumber: 27
                                                        }, this);
                                                    }) : myCustomers.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            colSpan: 6,
                                                            style: {
                                                                textAlign: 'center',
                                                                padding: '24px',
                                                                color: 'var(--color-text-muted)'
                                                            },
                                                            children: "No customer associations."
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 1081,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 1080,
                                                        columnNumber: 23
                                                    }, this) : myCustomers.map((customer)=>{
                                                        var _customer_ordersHistory, _customer_ordersHistory1;
                                                        const totalOrders = customer.totalOrders || ((_customer_ordersHistory = customer.ordersHistory) === null || _customer_ordersHistory === void 0 ? void 0 : _customer_ordersHistory.length) || 0;
                                                        const totalRevenue = customer.totalRevenue || ((_customer_ordersHistory1 = customer.ordersHistory) === null || _customer_ordersHistory1 === void 0 ? void 0 : _customer_ordersHistory1.reduce((s, h)=>s + (h.val || 0), 0)) || 0;
                                                        const outstanding = customer.outstanding || 0;
                                                        const latestComm = customer.communicationLogs && customer.communicationLogs.length > 0 ? customer.communicationLogs[customer.communicationLogs.length - 1] : null;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '700'
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: customer.name
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/ReportsView.jsx",
                                                                            lineNumber: 1097,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            style: {
                                                                                fontSize: '10px',
                                                                                color: 'var(--color-text-muted)'
                                                                            },
                                                                            children: [
                                                                                "ID: ",
                                                                                customer.id
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/components/ReportsView.jsx",
                                                                            lineNumber: 1098,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1096,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            children: customer.email
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/ReportsView.jsx",
                                                                            lineNumber: 1101,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                fontSize: '11px',
                                                                                color: 'var(--color-text-muted)'
                                                                            },
                                                                            children: customer.phone
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/ReportsView.jsx",
                                                                            lineNumber: 1102,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1100,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '800'
                                                                    },
                                                                    children: totalOrders
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1104,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '800',
                                                                        color: 'var(--color-accent-teal)'
                                                                    },
                                                                    children: formatINR(totalRevenue)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1105,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '800',
                                                                        color: outstanding > 0 ? '#ef4444' : 'inherit'
                                                                    },
                                                                    children: formatINR(outstanding)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1106,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: latestComm ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            fontSize: '12px'
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                                style: {
                                                                                    color: 'var(--color-text-secondary)'
                                                                                },
                                                                                children: [
                                                                                    latestComm.type,
                                                                                    " (",
                                                                                    latestComm.date,
                                                                                    "):"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                                lineNumber: 1112,
                                                                                columnNumber: 35
                                                                            }, this),
                                                                            " ",
                                                                            latestComm.summary
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/components/ReportsView.jsx",
                                                                        lineNumber: 1111,
                                                                        columnNumber: 33
                                                                    }, this) : 'No communications recorded.'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1109,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, customer.id, true, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 1095,
                                                            columnNumber: 27
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 1049,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/ReportsView.jsx",
                                            lineNumber: 1038,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 1037,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 1033,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ReportsView.jsx",
                        lineNumber: 1017,
                        columnNumber: 11
                    }, this),
                    activeTab === 'team' && isSalesAdmin && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    background: '#ffffff',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-xl)',
                                    padding: '24px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            fontSize: '14px',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            color: 'var(--color-text-secondary)',
                                            marginBottom: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/components/ReportsView.jsx",
                                                lineNumber: 1137,
                                                columnNumber: 17
                                            }, this),
                                            " Representative Leaderboard"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 1136,
                                        columnNumber: 15
                                    }, this),
                                    teamStats.map((rep, idx)=>{
                                        const sharePct = Math.round(rep.revenue / totalTeamRevenue * 100);
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px',
                                                marginBottom: '20px',
                                                borderBottom: idx < teamStats.length - 1 ? '1px solid #f1f5f9' : 'none',
                                                paddingBottom: '16px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '10px'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        width: '28px',
                                                                        height: '28px',
                                                                        borderRadius: '50%',
                                                                        background: idx === 0 ? '#fef3c7' : idx === 1 ? '#f1f5f9' : '#ffedd5',
                                                                        color: idx === 0 ? '#d97706' : idx === 1 ? '#475569' : '#ea580c',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontWeight: '800',
                                                                        fontSize: '13px'
                                                                    },
                                                                    children: idx + 1
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1146,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                fontWeight: '800',
                                                                                color: 'var(--color-text-primary)'
                                                                            },
                                                                            children: rep.name
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/ReportsView.jsx",
                                                                            lineNumber: 1161,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            style: {
                                                                                fontSize: '10.5px',
                                                                                color: 'var(--color-text-muted)'
                                                                            },
                                                                            children: [
                                                                                "Leads Handled: ",
                                                                                rep.leadsCount,
                                                                                " | Conversion: ",
                                                                                rep.conversionRate,
                                                                                "%"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/components/ReportsView.jsx",
                                                                            lineNumber: 1162,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1160,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 1145,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                textAlign: 'right'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        fontWeight: '800',
                                                                        color: 'var(--color-accent-teal)',
                                                                        fontSize: '15px'
                                                                    },
                                                                    children: formatINR(rep.revenue)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1169,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        fontSize: '11px',
                                                                        color: 'var(--color-text-secondary)',
                                                                        fontWeight: '700'
                                                                    },
                                                                    children: [
                                                                        "Outstanding: ",
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            style: {
                                                                                color: rep.outstanding > 0 ? '#ef4444' : 'inherit'
                                                                            },
                                                                            children: formatINR(rep.outstanding)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/ReportsView.jsx",
                                                                            lineNumber: 1173,
                                                                            columnNumber: 40
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1172,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 1168,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 1144,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        marginTop: '6px'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "report-bar-track",
                                                            style: {
                                                                flex: 1
                                                            },
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "report-bar-fill",
                                                                style: {
                                                                    width: "".concat(sharePct, "%"),
                                                                    background: idx === 0 ? 'linear-gradient(90deg, #f5a06a, #e07040)' : idx === 1 ? 'linear-gradient(90deg, #70c080, #40a060)' : 'linear-gradient(90deg, #70a0e8, #4070c8)'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 1180,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 1179,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '11.5px',
                                                                fontWeight: '800',
                                                                color: 'var(--color-text-secondary)',
                                                                minWidth: '34px',
                                                                textAlign: 'right'
                                                            },
                                                            children: [
                                                                sharePct,
                                                                "%"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 1192,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 1178,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, rep.name, true, {
                                            fileName: "[project]/components/ReportsView.jsx",
                                            lineNumber: 1143,
                                            columnNumber: 19
                                        }, this);
                                    })
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 1130,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "crm-table-container app-card",
                                style: {
                                    padding: '20px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            fontSize: '14px',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            color: 'var(--color-text-secondary)',
                                            marginBottom: '16px'
                                        },
                                        children: "Team Metrics Overview"
                                    }, void 0, false, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 1203,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            overflowX: 'auto'
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                            className: "crm-table",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Salesperson"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 1210,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Total Leads"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 1211,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Total Orders"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 1212,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Conversion Rate"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 1213,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Total Revenue"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 1214,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                children: "Outstanding Collections"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/ReportsView.jsx",
                                                                lineNumber: 1215,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/ReportsView.jsx",
                                                        lineNumber: 1209,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 1208,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                    children: teamStats.map((rep)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '800'
                                                                    },
                                                                    children: rep.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1221,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: [
                                                                        rep.leadsCount,
                                                                        " leads"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1222,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    children: [
                                                                        rep.ordersCount,
                                                                        " orders"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1223,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '700'
                                                                    },
                                                                    children: [
                                                                        rep.conversionRate,
                                                                        "%"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1224,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '800',
                                                                        color: 'var(--color-accent-teal)'
                                                                    },
                                                                    children: formatINR(rep.revenue)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1225,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                    style: {
                                                                        fontWeight: '800',
                                                                        color: rep.outstanding > 0 ? '#ef4444' : 'inherit'
                                                                    },
                                                                    children: formatINR(rep.outstanding)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/ReportsView.jsx",
                                                                    lineNumber: 1226,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, rep.name, true, {
                                                            fileName: "[project]/components/ReportsView.jsx",
                                                            lineNumber: 1220,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/components/ReportsView.jsx",
                                                    lineNumber: 1218,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/ReportsView.jsx",
                                            lineNumber: 1207,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/ReportsView.jsx",
                                        lineNumber: 1206,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/ReportsView.jsx",
                                lineNumber: 1202,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ReportsView.jsx",
                        lineNumber: 1129,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ReportsView.jsx",
                lineNumber: 377,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ReportsView.jsx",
        lineNumber: 230,
        columnNumber: 5
    }, this);
}
_s(ReportsView, "SNbTAlQfAPYREU4vLKMmFiX+wxA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useERP"]
    ];
});
_c = ReportsView;
var _c;
__turbopack_context__.k.register(_c, "ReportsView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_ReportsView_jsx_52145a07._.js.map