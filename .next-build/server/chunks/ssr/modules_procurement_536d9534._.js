module.exports = [
"[project]/modules/procurement/components/ProcurementStatusBadge.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProcurementStatusBadge",
    ()=>ProcurementStatusBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.mjs [app-ssr] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$user$2d$round$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-user-round.mjs [app-ssr] (ecmascript) <export default as UserCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.mjs [app-ssr] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.mjs [app-ssr] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.mjs [app-ssr] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-ssr] (ecmascript) <export default as AlertCircle>");
;
;
;
function ProcurementStatusBadge({ status, type = 'PO' }) {
    const getStatusConfig = ()=>{
        switch(status){
            // General
            case 'DRAFT':
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"],
                    label: 'Draft'
                };
            case 'CANCELLED':
            case 'PO_CANCELLED':
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-600',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"],
                    label: 'Cancelled'
                };
            // Indent
            case 'PENDING_PLANT_HEAD_APPROVAL':
                return {
                    bg: 'bg-amber-100',
                    text: 'text-amber-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"],
                    label: 'Pending PH Approval'
                };
            case 'PLANT_HEAD_CORRECTION_REQUIRED':
                return {
                    bg: 'bg-rose-100',
                    text: 'text-rose-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"],
                    label: 'Needs Correction'
                };
            case 'PLANT_HEAD_APPROVED':
                return {
                    bg: 'bg-emerald-100',
                    text: 'text-emerald-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"],
                    label: 'PH Approved'
                };
            case 'FINANCE_ACCEPTED':
                return {
                    bg: 'bg-blue-100',
                    text: 'text-blue-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"],
                    label: 'Finance Accepted'
                };
            case 'CONVERTED_TO_PO':
                return {
                    bg: 'bg-purple-100',
                    text: 'text-purple-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"],
                    label: 'PO Created'
                };
            case 'PLANT_HEAD_REJECTED':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"],
                    label: 'Rejected'
                };
            // PO
            case 'PENDING_SUPER_ADMIN_APPROVAL':
                return {
                    bg: 'bg-amber-100',
                    text: 'text-amber-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"],
                    label: 'Pending SA Approval'
                };
            case 'SUPER_ADMIN_APPROVED':
                return {
                    bg: 'bg-emerald-100',
                    text: 'text-emerald-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"],
                    label: 'SA Approved'
                };
            case 'SUPER_ADMIN_REJECTED':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"],
                    label: 'SA Rejected'
                };
            case 'PO_ISSUED':
                return {
                    bg: 'bg-blue-100',
                    text: 'text-blue-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$user$2d$round$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserCircle2$3e$__["UserCircle2"],
                    label: 'Issued to Vendor'
                };
            case 'DELIVERY_PENDING':
                return {
                    bg: 'bg-indigo-100',
                    text: 'text-indigo-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"],
                    label: 'Delivery Pending'
                };
            case 'PARTIALLY_RECEIVED':
                return {
                    bg: 'bg-cyan-100',
                    text: 'text-cyan-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"],
                    label: 'Partially Received'
                };
            case 'FULLY_RECEIVED':
                return {
                    bg: 'bg-emerald-100',
                    text: 'text-emerald-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"],
                    label: 'Fully Received'
                };
            case 'PO_CLOSED':
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"],
                    label: 'Closed'
                };
            // GRN
            case 'SUBMITTED_FOR_FINANCE_AUDIT':
                return {
                    bg: 'bg-blue-100',
                    text: 'text-blue-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"],
                    label: 'Pending Audit'
                };
            case 'FINANCE_CORRECTION_REQUIRED':
                return {
                    bg: 'bg-rose-100',
                    text: 'text-rose-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"],
                    label: 'Needs Correction'
                };
            case 'FINANCE_APPROVED':
                return {
                    bg: 'bg-emerald-100',
                    text: 'text-emerald-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"],
                    label: 'Finance Approved'
                };
            case 'FINANCE_REJECTED':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"],
                    label: 'Rejected'
                };
            // Rejection
            case 'MATERIAL_REJECTION_SUBMITTED':
                return {
                    bg: 'bg-rose-100',
                    text: 'text-rose-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"],
                    label: 'Rejection Submitted'
                };
            case 'FINANCE_VENDOR_DISCUSSION':
                return {
                    bg: 'bg-amber-100',
                    text: 'text-amber-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"],
                    label: 'Vendor Discussion'
                };
            case 'REPLACEMENT_APPROVED':
                return {
                    bg: 'bg-emerald-100',
                    text: 'text-emerald-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"],
                    label: 'Replacement Approved'
                };
            case 'NO_REPLACEMENT':
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"],
                    label: 'No Replacement'
                };
            case 'RESOLVED':
                return {
                    bg: 'bg-emerald-100',
                    text: 'text-emerald-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"],
                    label: 'Resolved'
                };
            case 'CLOSED':
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"],
                    label: 'Closed'
                };
            // Connected Procurement Canonical Statuses
            case 'CORRECTION_REQUIRED':
                return {
                    bg: 'bg-rose-100',
                    text: 'text-rose-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"],
                    label: 'Needs Correction'
                };
            case 'DRAFT_PO_CREATED':
                return {
                    bg: 'bg-purple-100',
                    text: 'text-purple-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"],
                    label: 'PO Drafted'
                };
            case 'PROCUREMENT_IN_PROGRESS':
                return {
                    bg: 'bg-indigo-100',
                    text: 'text-indigo-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"],
                    label: 'In Progress'
                };
            case 'PROCUREMENT_COMPLETED':
                return {
                    bg: 'bg-emerald-100',
                    text: 'text-emerald-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"],
                    label: 'Completed'
                };
            case 'DELIVERY_VERIFIED':
                return {
                    bg: 'bg-teal-100',
                    text: 'text-teal-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"],
                    label: 'Delivery Verified'
                };
            case 'PENDING_FINANCE_AUDIT':
                return {
                    bg: 'bg-blue-100',
                    text: 'text-blue-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"],
                    label: 'Pending Audit'
                };
            case 'FINANCE_AUDIT_APPROVED':
                return {
                    bg: 'bg-emerald-100',
                    text: 'text-emerald-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"],
                    label: 'Audit Approved'
                };
            case 'RETURNED_TO_STORE':
                return {
                    bg: 'bg-rose-100',
                    text: 'text-rose-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"],
                    label: 'Returned to Store'
                };
            case 'VENDOR_DISPUTE':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"],
                    label: 'Vendor Dispute'
                };
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"],
                    label: status || 'Unknown'
                };
        }
    };
    const { bg, text, icon: Icon, label } = getStatusConfig();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                size: 14
            }, void 0, false, {
                fileName: "[project]/modules/procurement/components/ProcurementStatusBadge.jsx",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            label
        ]
    }, void 0, true, {
        fileName: "[project]/modules/procurement/components/ProcurementStatusBadge.jsx",
        lineNumber: 63,
        columnNumber: 5
    }, this);
}
}),
"[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MaterialIndentApproval
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$procurementActions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/procurementActions.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$procurement$2f$components$2f$ProcurementStatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/modules/procurement/components/ProcurementStatusBadge.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package.mjs [app-ssr] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.mjs [app-ssr] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.mjs [app-ssr] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.mjs [app-ssr] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.mjs [app-ssr] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-ssr] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.mjs [app-ssr] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.mjs [app-ssr] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.esm.all.js [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
const EMPTY_INDENTS = [];
const formatDate = (value)=>{
    if (!value) return "-";
    try {
        return new Date(value).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    } catch  {
        return String(value);
    }
};
function MaterialIndentApproval() {
    const [selectedIndentId, setSelectedIndentId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [remarks, setRemarks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [approvedItemsMap, setApprovedItemsMap] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [windowWidth, setWindowWidth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 1024);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleResize = ()=>setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return ()=>window.removeEventListener('resize', handleResize);
    }, []);
    const isMobile = windowWidth < 768;
    // Reactive store subscription
    const materialIndents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useERPStore"])((state)=>state.procurement?.materialIndents ?? state.state?.procurement?.materialIndents ?? state.materialIndents ?? state.state?.materialIndents ?? EMPTY_INDENTS);
    // Filter pending indents
    const pendingIndents = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return materialIndents.filter((ind)=>ind.status === 'PENDING_PLANT_HEAD_APPROVAL' || ind.status === 'PENDING_PLANT_HEAD');
    }, [
        materialIndents
    ]);
    const selectedIndent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!selectedIndentId) return null;
        return materialIndents.find((i)=>i.id === selectedIndentId) || null;
    }, [
        selectedIndentId,
        materialIndents
    ]);
    const handleSelectIndent = (indent)=>{
        setSelectedIndentId(indent.id);
        const initialMap = {};
        const items = indent.items || [
            {
                indentItemId: indent.id + "-ITEM-1",
                materialId: indent.materialId || indent.materialCode || '',
                materialName: indent.materialName || 'Material',
                quantity: indent.requiredQuantity || indent.quantity || 0,
                unit: indent.unit || 'PCS'
            }
        ];
        items.forEach((item)=>{
            const key = item.indentItemId || item.materialId;
            initialMap[key] = item.approvedQuantity !== null && item.approvedQuantity !== undefined ? Number(item.approvedQuantity) : Number(item.quantity || item.requiredQuantity || 0);
        });
        setApprovedItemsMap(initialMap);
        setRemarks('');
    };
    const handleQtyChange = (itemKey, value)=>{
        const num = Math.max(0, Number(value));
        setApprovedItemsMap((prev)=>({
                ...prev,
                [itemKey]: num
            }));
    };
    const handleApprove = async ()=>{
        if (!selectedIndent) return;
        try {
            setIsSubmitting(true);
            const items = selectedIndent.items || [
                {
                    indentItemId: selectedIndent.id + "-ITEM-1",
                    materialId: selectedIndent.materialId || selectedIndent.materialCode || '',
                    materialName: selectedIndent.materialName || 'Material',
                    quantity: selectedIndent.requiredQuantity || selectedIndent.quantity || 0,
                    unit: selectedIndent.unit || 'PCS'
                }
            ];
            const finalApprovedItems = items.map((item)=>{
                const key = item.indentItemId || item.materialId;
                const appQty = approvedItemsMap[key] !== undefined ? approvedItemsMap[key] : Number(item.quantity || item.requiredQuantity || 0);
                return {
                    ...item,
                    approvedQty: appQty,
                    approvedQuantity: appQty
                };
            });
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$procurementActions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["approveMaterialIndent"])(selectedIndent.id, finalApprovedItems, remarks || 'Approved by Plant Head', 'Plant Head');
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire({
                title: 'Indent Approved!',
                text: `Indent ${selectedIndent.id} has been approved and forwarded to Finance for PO creation.`,
                icon: 'success',
                confirmButtonColor: '#10b981'
            });
            setSelectedIndentId(null);
            setRemarks('');
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire({
                title: 'Error',
                text: err.message || 'Failed to approve indent',
                icon: 'error',
                confirmButtonColor: '#ef4444'
            });
        } finally{
            setIsSubmitting(false);
        }
    };
    const handleReturn = async ()=>{
        if (!selectedIndent) return;
        if (!remarks.trim()) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire({
                title: 'Remarks Required',
                text: 'Please provide mandatory remarks explaining why the indent is being returned for correction.',
                icon: 'warning',
                confirmButtonColor: '#f59e0b'
            });
        }
        try {
            setIsSubmitting(true);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$procurementActions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["returnIndentForCorrection"])(selectedIndent.id, remarks, 'Plant Head');
            await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire({
                title: 'Indent Returned',
                text: `Indent ${selectedIndent.id} returned to Store for correction.`,
                icon: 'info',
                confirmButtonColor: '#f59e0b'
            });
            setSelectedIndentId(null);
            setRemarks('');
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire({
                title: 'Error',
                text: err.message || 'Failed to return indent',
                icon: 'error',
                confirmButtonColor: '#ef4444'
            });
        } finally{
            setIsSubmitting(false);
        }
    };
    const highPriorityCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return pendingIndents.filter((i)=>(i.priority || '').toUpperCase() === 'HIGH' || (i.priority || '').toUpperCase() === 'URGENT').length;
    }, [
        pendingIndents
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: '100%',
            maxWidth: '1280px',
            margin: '0 auto',
            padding: isMobile ? '12px 8px' : '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            color: '#1E293B',
            boxSizing: 'border-box'
        },
        children: !selectedIndent ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: '#ffffff',
                        border: '1px solid #E2E8F0',
                        borderRadius: '14px',
                        padding: isMobile ? '16px' : '20px 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                            style: {
                                                width: 26,
                                                height: 26,
                                                color: '#4F46E5',
                                                flexShrink: 0
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 200,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            style: {
                                                fontSize: isMobile ? '18px' : '22px',
                                                fontWeight: 900,
                                                color: '#0F172A',
                                                margin: 0,
                                                letterSpacing: '-0.02em'
                                            },
                                            children: "Plant Head → Material Indent Approvals"
                                        }, void 0, false, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 201,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 199,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: '13px',
                                        color: '#64748B',
                                        margin: '6px 0 0 0',
                                        lineHeight: '1.4'
                                    },
                                    children: "Review pending material indents raised by Store, adjust approved quantities, and authorize procurement."
                                }, void 0, false, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 205,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                            lineNumber: 198,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    padding: '6px 14px',
                                    background: '#EEF2FF',
                                    color: '#4338CA',
                                    fontSize: '12px',
                                    fontWeight: 800,
                                    borderRadius: '20px',
                                    border: '1px solid #C7D2FE',
                                    whiteSpace: 'nowrap'
                                },
                                children: [
                                    pendingIndents.length,
                                    " Pending Approval",
                                    pendingIndents.length !== 1 ? 's' : ''
                                ]
                            }, void 0, true, {
                                fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                lineNumber: 210,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                            lineNumber: 209,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                    lineNumber: 186,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                        gap: '16px',
                        width: '100%'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                background: '#ffffff',
                                border: '1px solid #E2E8F0',
                                borderLeft: '4px solid #F59E0B',
                                borderRadius: '12px',
                                padding: '16px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                minHeight: '75px',
                                boxSizing: 'border-box'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '11px',
                                                fontWeight: 800,
                                                color: '#94A3B8',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                display: 'block'
                                            },
                                            children: "Pending Review"
                                        }, void 0, false, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 247,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '24px',
                                                fontWeight: 950,
                                                color: '#D97706',
                                                marginTop: '2px',
                                                display: 'block',
                                                lineHeight: 1
                                            },
                                            children: pendingIndents.length
                                        }, void 0, false, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 250,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 246,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                    style: {
                                        width: 28,
                                        height: 28,
                                        color: '#FBBF24',
                                        opacity: 0.8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 254,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                            lineNumber: 233,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                background: '#ffffff',
                                border: '1px solid #E2E8F0',
                                borderLeft: '4px solid #EF4444',
                                borderRadius: '12px',
                                padding: '16px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                minHeight: '75px',
                                boxSizing: 'border-box'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '11px',
                                                fontWeight: 800,
                                                color: '#94A3B8',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                display: 'block'
                                            },
                                            children: "High / Urgent Priority"
                                        }, void 0, false, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 272,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '24px',
                                                fontWeight: 950,
                                                color: '#DC2626',
                                                marginTop: '2px',
                                                display: 'block',
                                                lineHeight: 1
                                            },
                                            children: highPriorityCount
                                        }, void 0, false, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 275,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 271,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                    style: {
                                        width: 28,
                                        height: 28,
                                        color: '#F87171',
                                        opacity: 0.8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 279,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                            lineNumber: 258,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                background: '#ffffff',
                                border: '1px solid #E2E8F0',
                                borderLeft: '4px solid #6366F1',
                                borderRadius: '12px',
                                padding: '16px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                minHeight: '75px',
                                boxSizing: 'border-box'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '11px',
                                                fontWeight: 800,
                                                color: '#94A3B8',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                display: 'block'
                                            },
                                            children: "Total Recorded Indents"
                                        }, void 0, false, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 297,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '24px',
                                                fontWeight: 950,
                                                color: '#4F46E5',
                                                marginTop: '2px',
                                                display: 'block',
                                                lineHeight: 1
                                            },
                                            children: materialIndents.length
                                        }, void 0, false, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 300,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 296,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                    style: {
                                        width: 28,
                                        height: 28,
                                        color: '#818CF8',
                                        opacity: 0.8
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 304,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                            lineNumber: 283,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                    lineNumber: 226,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: '#ffffff',
                        border: '1px solid #E2E8F0',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        width: '100%'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                padding: '16px 24px',
                                borderBottom: '1px solid #E2E8F0',
                                background: '#F8FAFC',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    style: {
                                        fontSize: '16px',
                                        fontWeight: 800,
                                        color: '#0F172A',
                                        margin: 0
                                    },
                                    children: "Pending Material Indents"
                                }, void 0, false, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 325,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: '12px',
                                        color: '#64748B',
                                        fontWeight: 600
                                    },
                                    children: "Click Review to inspect line items"
                                }, void 0, false, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 328,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                            lineNumber: 317,
                            columnNumber: 13
                        }, this),
                        !isMobile ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                width: '100%',
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
                                                background: '#F1F5F9',
                                                borderBottom: '1px solid #E2E8F0',
                                                color: '#475569',
                                                fontSize: '12px',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.03em'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: '14px 20px'
                                                    },
                                                    children: "Indent ID"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 339,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: '14px 20px'
                                                    },
                                                    children: "Department"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 340,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: '14px 20px'
                                                    },
                                                    children: "Date Created"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 341,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: '14px 20px'
                                                    },
                                                    children: "Target Date"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 342,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: '14px 20px'
                                                    },
                                                    children: "Material / Qty"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 343,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: '14px 20px'
                                                    },
                                                    children: "Priority"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 344,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: '14px 20px',
                                                        textAlign: 'center'
                                                    },
                                                    children: "Status"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 345,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: '14px 20px',
                                                        textAlign: 'right'
                                                    },
                                                    children: "Action"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 346,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 338,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                        lineNumber: 337,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                        style: {
                                            fontSize: '13px',
                                            color: '#334155'
                                        },
                                        children: pendingIndents.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                colSpan: 8,
                                                style: {
                                                    padding: '48px 20px',
                                                    textAlign: 'center',
                                                    color: '#94A3B8',
                                                    fontWeight: 600
                                                },
                                                children: "No material indents currently pending Plant Head approval."
                                            }, void 0, false, {
                                                fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                lineNumber: 352,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 351,
                                            columnNumber: 23
                                        }, this) : pendingIndents.map((indent)=>{
                                            const items = indent.items || [];
                                            const displayMaterial = indent.materialName || items[0]?.materialName || 'Material';
                                            const reqQty = indent.requiredQuantity || indent.quantity || items[0]?.quantity || 0;
                                            const unit = indent.unit || items[0]?.unit || 'PCS';
                                            const isHigh = (indent.priority || '').toUpperCase() === 'HIGH' || (indent.priority || '').toUpperCase() === 'URGENT';
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                style: {
                                                    borderBottom: '1px solid #F1F5F9',
                                                    transition: 'background 0.15s'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            padding: '16px 20px',
                                                            fontWeight: 900,
                                                            color: '#0F172A'
                                                        },
                                                        children: indent.id
                                                    }, void 0, false, {
                                                        fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                        lineNumber: 366,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            padding: '16px 20px',
                                                            fontWeight: 700,
                                                            color: '#475569'
                                                        },
                                                        children: indent.requestedByDepartment || indent.department || 'Store'
                                                    }, void 0, false, {
                                                        fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                        lineNumber: 367,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            padding: '16px 20px',
                                                            color: '#64748B'
                                                        },
                                                        children: formatDate(indent.createdAt)
                                                    }, void 0, false, {
                                                        fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                        lineNumber: 368,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            padding: '16px 20px',
                                                            color: '#64748B'
                                                        },
                                                        children: formatDate(indent.targetDate || indent.requiredDate)
                                                    }, void 0, false, {
                                                        fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                        lineNumber: 369,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            padding: '16px 20px'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontWeight: 800,
                                                                    color: '#1E293B',
                                                                    display: 'block'
                                                                },
                                                                children: displayMaterial
                                                            }, void 0, false, {
                                                                fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                                lineNumber: 371,
                                                                columnNumber: 31
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '12px',
                                                                    color: '#64748B'
                                                                },
                                                                children: [
                                                                    "(",
                                                                    reqQty,
                                                                    " ",
                                                                    unit,
                                                                    items.length > 1 ? ` +${items.length - 1} more` : '',
                                                                    ")"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                                lineNumber: 372,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                        lineNumber: 370,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            padding: '16px 20px'
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                padding: '4px 10px',
                                                                borderRadius: '12px',
                                                                fontSize: '11px',
                                                                fontWeight: 800,
                                                                background: isHigh ? '#FFE4E6' : '#F1F5F9',
                                                                color: isHigh ? '#9F1239' : '#475569',
                                                                border: isHigh ? '1px solid #FECDD3' : '1px solid #E2E8F0'
                                                            },
                                                            children: indent.priority || 'Medium'
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                            lineNumber: 375,
                                                            columnNumber: 31
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                        lineNumber: 374,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            padding: '16px 20px',
                                                            textAlign: 'center'
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$procurement$2f$components$2f$ProcurementStatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProcurementStatusBadge"], {
                                                            status: indent.status
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                            lineNumber: 388,
                                                            columnNumber: 31
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                        lineNumber: 387,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            padding: '16px 20px',
                                                            textAlign: 'right'
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>handleSelectIndent(indent),
                                                            style: {
                                                                padding: '8px 16px',
                                                                background: '#4F46E5',
                                                                color: '#ffffff',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                fontSize: '12px',
                                                                fontWeight: 800,
                                                                cursor: 'pointer',
                                                                boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)',
                                                                transition: 'all 0.15s'
                                                            },
                                                            children: "Review & Approve →"
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                            lineNumber: 391,
                                                            columnNumber: 31
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                        lineNumber: 390,
                                                        columnNumber: 29
                                                    }, this)
                                                ]
                                            }, indent.id, true, {
                                                fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                lineNumber: 365,
                                                columnNumber: 27
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                        lineNumber: 349,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                lineNumber: 336,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                            lineNumber: 335,
                            columnNumber: 15
                        }, this) : /* Mobile Cards List */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column'
                            },
                            children: pendingIndents.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '36px 16px',
                                    textAlign: 'center',
                                    color: '#94A3B8',
                                    fontSize: '13px',
                                    fontWeight: 600
                                },
                                children: "No material indents currently pending Plant Head approval."
                            }, void 0, false, {
                                fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                lineNumber: 420,
                                columnNumber: 19
                            }, this) : pendingIndents.map((indent)=>{
                                const items = indent.items || [];
                                const displayMaterial = indent.materialName || items[0]?.materialName || 'Material';
                                const reqQty = indent.requiredQuantity || indent.quantity || items[0]?.quantity || 0;
                                const unit = indent.unit || items[0]?.unit || 'PCS';
                                const isHigh = (indent.priority || '').toUpperCase() === 'HIGH' || (indent.priority || '').toUpperCase() === 'URGENT';
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        padding: '16px',
                                        borderBottom: '1px solid #E2E8F0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                        background: '#ffffff'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: '16px',
                                                        fontWeight: 950,
                                                        color: '#0F172A'
                                                    },
                                                    children: indent.id
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 441,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$procurement$2f$components$2f$ProcurementStatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProcurementStatusBadge"], {
                                                    status: indent.status
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 442,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 440,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: '10px',
                                                fontSize: '12px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: '#94A3B8',
                                                                fontWeight: 700,
                                                                display: 'block',
                                                                fontSize: '10px',
                                                                textTransform: 'uppercase'
                                                            },
                                                            children: "DEPARTMENT"
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                            lineNumber: 447,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontWeight: 800,
                                                                color: '#334155'
                                                            },
                                                            children: indent.requestedByDepartment || indent.department || 'Store'
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                            lineNumber: 448,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 446,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: '#94A3B8',
                                                                fontWeight: 700,
                                                                display: 'block',
                                                                fontSize: '10px',
                                                                textTransform: 'uppercase'
                                                            },
                                                            children: "PRIORITY"
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                            lineNumber: 451,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                padding: '2px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '11px',
                                                                fontWeight: 800,
                                                                background: isHigh ? '#FFE4E6' : '#F1F5F9',
                                                                color: isHigh ? '#9F1239' : '#475569',
                                                                display: 'inline-block'
                                                            },
                                                            children: indent.priority || 'Medium'
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                            lineNumber: 452,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 450,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: '#94A3B8',
                                                                fontWeight: 700,
                                                                display: 'block',
                                                                fontSize: '10px',
                                                                textTransform: 'uppercase'
                                                            },
                                                            children: "CREATED"
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                            lineNumber: 465,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: '#475569'
                                                            },
                                                            children: formatDate(indent.createdAt)
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                            lineNumber: 466,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 464,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: '#94A3B8',
                                                                fontWeight: 700,
                                                                display: 'block',
                                                                fontSize: '10px',
                                                                textTransform: 'uppercase'
                                                            },
                                                            children: "TARGET DATE"
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                            lineNumber: 469,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: '#475569'
                                                            },
                                                            children: formatDate(indent.targetDate || indent.requiredDate)
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                            lineNumber: 470,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 468,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 445,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                background: '#F8FAFC',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #E2E8F0',
                                                fontSize: '13px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        color: '#64748B',
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        display: 'block'
                                                    },
                                                    children: "MATERIAL / REQUESTED QTY"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 475,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontWeight: 900,
                                                        color: '#0F172A',
                                                        display: 'block',
                                                        marginTop: '2px'
                                                    },
                                                    children: displayMaterial
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 476,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        color: '#4F46E5',
                                                        fontWeight: 950,
                                                        marginTop: '2px',
                                                        display: 'block'
                                                    },
                                                    children: [
                                                        reqQty,
                                                        " ",
                                                        unit
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 477,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 474,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleSelectIndent(indent),
                                            style: {
                                                width: '100%',
                                                padding: '10px',
                                                background: '#4F46E5',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                fontWeight: 800,
                                                cursor: 'pointer',
                                                textAlign: 'center'
                                            },
                                            children: "Review & Approve Indent →"
                                        }, void 0, false, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 480,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, indent.id, true, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 432,
                                    columnNumber: 23
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                            lineNumber: 418,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                    lineNumber: 309,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
            lineNumber: 184,
            columnNumber: 9
        }, this) : /* Detailed Indent Approval & Qty Adjustment Form */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: ()=>setSelectedIndentId(null),
                    style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        fontWeight: 800,
                        color: '#475569',
                        background: '#ffffff',
                        border: '1px solid #E2E8F0',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        alignSelf: 'flex-start',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                            style: {
                                width: 16,
                                height: 16
                            }
                        }, void 0, false, {
                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                            lineNumber: 527,
                            columnNumber: 13
                        }, this),
                        " Back to Pending Approvals List"
                    ]
                }, void 0, true, {
                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                    lineNumber: 509,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: '#ffffff',
                        borderRadius: '14px',
                        border: '1px solid #E2E8F0',
                        padding: isMobile ? '16px' : '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                justifyContent: 'space-between',
                                alignItems: isMobile ? 'flex-start' : 'center',
                                gap: '12px',
                                borderBottom: '1px solid #E2E8F0',
                                paddingBottom: '16px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                flexWrap: 'wrap'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                    style: {
                                                        fontSize: isMobile ? '18px' : '22px',
                                                        fontWeight: 950,
                                                        color: '#0F172A',
                                                        margin: 0
                                                    },
                                                    children: [
                                                        "Review Indent: ",
                                                        selectedIndent.id
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 552,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontSize: '11px',
                                                        fontWeight: 800,
                                                        background: (selectedIndent.priority || '').toUpperCase() === 'HIGH' ? '#FFE4E6' : '#F1F5F9',
                                                        color: (selectedIndent.priority || '').toUpperCase() === 'HIGH' ? '#9F1239' : '#475569'
                                                    },
                                                    children: [
                                                        "Priority: ",
                                                        selectedIndent.priority || 'Medium'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 555,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 551,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: '13px',
                                                color: '#64748B',
                                                margin: '6px 0 0 0'
                                            },
                                            children: [
                                                "Requested by ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    style: {
                                                        color: '#1E293B'
                                                    },
                                                    children: selectedIndent.requestedByDepartment || selectedIndent.department || 'Store'
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 567,
                                                    columnNumber: 32
                                                }, this),
                                                " on ",
                                                formatDate(selectedIndent.createdAt)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 566,
                                            columnNumber: 17
                                        }, this),
                                        (selectedIndent.targetDate || selectedIndent.requiredDate) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: '13px',
                                                color: '#DC2626',
                                                fontWeight: 800,
                                                margin: '4px 0 0 0'
                                            },
                                            children: [
                                                "Target Required Date: ",
                                                formatDate(selectedIndent.targetDate || selectedIndent.requiredDate)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 570,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 550,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$procurement$2f$components$2f$ProcurementStatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProcurementStatusBadge"], {
                                    status: selectedIndent.status
                                }, void 0, false, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 575,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                            lineNumber: 541,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                                gap: '12px',
                                background: '#F8FAFC',
                                padding: '16px',
                                borderRadius: '10px',
                                border: '1px solid #E2E8F0',
                                fontSize: '13px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: '#94A3B8',
                                                fontWeight: 800,
                                                fontSize: '10px',
                                                textTransform: 'uppercase',
                                                display: 'block'
                                            },
                                            children: "Current Stock"
                                        }, void 0, false, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 590,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontWeight: 900,
                                                color: '#1E293B'
                                            },
                                            children: [
                                                selectedIndent.currentStock ?? 0,
                                                " ",
                                                selectedIndent.unit || 'PCS'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 591,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 589,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: '#94A3B8',
                                                fontWeight: 800,
                                                fontSize: '10px',
                                                textTransform: 'uppercase',
                                                display: 'block'
                                            },
                                            children: "Minimum Stock"
                                        }, void 0, false, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 594,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontWeight: 900,
                                                color: '#D97706'
                                            },
                                            children: [
                                                selectedIndent.minimumStock ?? 0,
                                                " ",
                                                selectedIndent.unit || 'PCS'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 595,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 593,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: '#94A3B8',
                                                fontWeight: 800,
                                                fontSize: '10px',
                                                textTransform: 'uppercase',
                                                display: 'block'
                                            },
                                            children: "Requested Qty"
                                        }, void 0, false, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 598,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontWeight: 900,
                                                color: '#4F46E5'
                                            },
                                            children: [
                                                selectedIndent.requiredQuantity || selectedIndent.quantity || 0,
                                                " ",
                                                selectedIndent.unit || 'PCS'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 599,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 597,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: '#94A3B8',
                                                fontWeight: 800,
                                                fontSize: '10px',
                                                textTransform: 'uppercase',
                                                display: 'block'
                                            },
                                            children: "Source"
                                        }, void 0, false, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 602,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontWeight: 700,
                                                color: '#475569'
                                            },
                                            children: selectedIndent.source || 'LOW_STOCK_ALERT'
                                        }, void 0, false, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 603,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 601,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                            lineNumber: 579,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                    lineNumber: 531,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: '#ffffff',
                        borderRadius: '14px',
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                padding: '16px 24px',
                                borderBottom: '1px solid #E2E8F0',
                                background: '#F8FAFC'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    style: {
                                        fontSize: '16px',
                                        fontWeight: 800,
                                        color: '#0F172A',
                                        margin: 0
                                    },
                                    children: "Line Items & Approved Quantity Authorization"
                                }, void 0, false, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 617,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: '12px',
                                        color: '#64748B',
                                        margin: '4px 0 0 0'
                                    },
                                    children: "Modify the approved quantity if needed before releasing to Finance."
                                }, void 0, false, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 620,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                            lineNumber: 616,
                            columnNumber: 13
                        }, this),
                        !isMobile ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                width: '100%',
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
                                                background: '#F1F5F9',
                                                borderBottom: '1px solid #E2E8F0',
                                                color: '#475569',
                                                fontSize: '12px',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.03em'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: '14px 20px'
                                                    },
                                                    children: "Material Details"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 631,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: '14px 20px'
                                                    },
                                                    children: "Material Code"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 632,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: '14px 20px',
                                                        textAlign: 'right'
                                                    },
                                                    children: "Requested Qty"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 633,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: '14px 20px',
                                                        textAlign: 'right'
                                                    },
                                                    children: "Approved Qty (Adjustable)"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 634,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 630,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                        lineNumber: 629,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                        style: {
                                            fontSize: '13px',
                                            color: '#334155'
                                        },
                                        children: (selectedIndent.items || [
                                            {
                                                indentItemId: selectedIndent.id + "-ITEM-1",
                                                materialId: selectedIndent.materialId || selectedIndent.materialCode || '',
                                                materialName: selectedIndent.materialName || 'Material',
                                                quantity: selectedIndent.requiredQuantity || selectedIndent.quantity || 0,
                                                unit: selectedIndent.unit || 'PCS'
                                            }
                                        ]).map((item)=>{
                                            const itemKey = item.indentItemId || item.materialId;
                                            const approvedVal = approvedItemsMap[itemKey] !== undefined ? approvedItemsMap[itemKey] : item.quantity || item.requiredQuantity || 0;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                style: {
                                                    borderBottom: '1px solid #F1F5F9'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            padding: '16px 20px',
                                                            fontWeight: 800,
                                                            color: '#0F172A'
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"], {
                                                                    style: {
                                                                        width: 18,
                                                                        height: 18,
                                                                        color: '#4F46E5',
                                                                        flexShrink: 0
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                                    lineNumber: 654,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: item.materialName || selectedIndent.materialName
                                                                }, void 0, false, {
                                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                                    lineNumber: 655,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                            lineNumber: 653,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                        lineNumber: 652,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            padding: '16px 20px',
                                                            fontFamily: 'monospace',
                                                            fontWeight: 700,
                                                            color: '#64748B'
                                                        },
                                                        children: item.materialId || selectedIndent.materialCode || '-'
                                                    }, void 0, false, {
                                                        fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                        lineNumber: 658,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            padding: '16px 20px',
                                                            textAlign: 'right',
                                                            fontWeight: 800,
                                                            color: '#334155'
                                                        },
                                                        children: [
                                                            item.quantity || item.requiredQuantity || selectedIndent.requiredQuantity,
                                                            " ",
                                                            item.unit || selectedIndent.unit || 'PCS'
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                        lineNumber: 661,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        style: {
                                                            padding: '16px 20px',
                                                            textAlign: 'right'
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '8px'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "number",
                                                                    min: "0",
                                                                    max: item.quantity || item.requiredQuantity || 999999,
                                                                    value: approvedVal,
                                                                    onChange: (e)=>handleQtyChange(itemKey, e.target.value),
                                                                    style: {
                                                                        width: '120px',
                                                                        padding: '8px 12px',
                                                                        border: '2px solid #C7D2FE',
                                                                        borderRadius: '8px',
                                                                        textAlign: 'right',
                                                                        fontWeight: 950,
                                                                        color: '#312E81',
                                                                        background: '#EEF2FF',
                                                                        fontSize: '14px',
                                                                        outline: 'none'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                                    lineNumber: 666,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontSize: '12px',
                                                                        fontWeight: 700,
                                                                        color: '#64748B'
                                                                    },
                                                                    children: item.unit || selectedIndent.unit || 'PCS'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                                    lineNumber: 685,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                            lineNumber: 665,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                        lineNumber: 664,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, itemKey, true, {
                                                fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                lineNumber: 651,
                                                columnNumber: 25
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                        lineNumber: 637,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                lineNumber: 628,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                            lineNumber: 627,
                            columnNumber: 15
                        }, this) : /* Mobile Line Items View */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column'
                            },
                            children: (selectedIndent.items || [
                                {
                                    indentItemId: selectedIndent.id + "-ITEM-1",
                                    materialId: selectedIndent.materialId || selectedIndent.materialCode || '',
                                    materialName: selectedIndent.materialName || 'Material',
                                    quantity: selectedIndent.requiredQuantity || selectedIndent.quantity || 0,
                                    unit: selectedIndent.unit || 'PCS'
                                }
                            ]).map((item)=>{
                                const itemKey = item.indentItemId || item.materialId;
                                const approvedVal = approvedItemsMap[itemKey] !== undefined ? approvedItemsMap[itemKey] : item.quantity || item.requiredQuantity || 0;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        padding: '16px',
                                        borderBottom: '1px solid #E2E8F0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"], {
                                                    style: {
                                                        width: 20,
                                                        height: 20,
                                                        color: '#4F46E5',
                                                        flexShrink: 0
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 712,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontWeight: 900,
                                                                color: '#0F172A',
                                                                fontSize: '14px',
                                                                display: 'block'
                                                            },
                                                            children: item.materialName || selectedIndent.materialName
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                            lineNumber: 714,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '11px',
                                                                fontFamily: 'monospace',
                                                                color: '#64748B'
                                                            },
                                                            children: item.materialId || selectedIndent.materialCode || '-'
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                            lineNumber: 715,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 713,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 711,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                background: '#F8FAFC',
                                                padding: '10px 12px',
                                                borderRadius: '8px',
                                                border: '1px solid #E2E8F0',
                                                fontSize: '12px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        color: '#64748B',
                                                        fontWeight: 700,
                                                        display: 'block'
                                                    },
                                                    children: "REQUESTED QTY"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 720,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontWeight: 900,
                                                        color: '#0F172A',
                                                        fontSize: '14px'
                                                    },
                                                    children: [
                                                        item.quantity || item.requiredQuantity || selectedIndent.requiredQuantity,
                                                        " ",
                                                        item.unit || selectedIndent.unit || 'PCS'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 721,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 719,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '4px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    style: {
                                                        fontSize: '12px',
                                                        fontWeight: 800,
                                                        color: '#312E81'
                                                    },
                                                    children: [
                                                        "Approved Quantity (",
                                                        item.unit || selectedIndent.unit || 'PCS',
                                                        ")"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 727,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    min: "0",
                                                    max: item.quantity || item.requiredQuantity || 999999,
                                                    value: approvedVal,
                                                    onChange: (e)=>handleQtyChange(itemKey, e.target.value),
                                                    style: {
                                                        width: '100%',
                                                        padding: '10px 12px',
                                                        border: '2px solid #C7D2FE',
                                                        borderRadius: '8px',
                                                        textAlign: 'right',
                                                        fontWeight: 950,
                                                        color: '#312E81',
                                                        background: '#EEF2FF',
                                                        fontSize: '16px',
                                                        boxSizing: 'border-box'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                                    lineNumber: 728,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                            lineNumber: 726,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, itemKey, true, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 710,
                                    columnNumber: 21
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                            lineNumber: 696,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                    lineNumber: 609,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        background: '#ffffff',
                        borderRadius: '14px',
                        border: '1px solid #E2E8F0',
                        padding: isMobile ? '16px' : '20px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            style: {
                                fontSize: '13px',
                                fontWeight: 800,
                                color: '#0F172A'
                            },
                            children: "Plant Head Authorization Remarks"
                        }, void 0, false, {
                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                            lineNumber: 766,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                            value: remarks,
                            onChange: (e)=>setRemarks(e.target.value),
                            rows: 3,
                            style: {
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #CBD5E1',
                                borderRadius: '8px',
                                fontSize: '13px',
                                color: '#1E293B',
                                boxSizing: 'border-box',
                                outline: 'none',
                                fontFamily: 'inherit'
                            },
                            placeholder: "Enter optional approval remarks or mandatory return/correction justification..."
                        }, void 0, false, {
                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                            lineNumber: 769,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                    lineNumber: 756,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '12px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: handleReturn,
                            disabled: isSubmitting,
                            style: {
                                width: isMobile ? '100%' : 'auto',
                                padding: '12px 20px',
                                border: '2px solid #FECDD3',
                                background: '#FFF1F2',
                                color: '#BE123C',
                                borderRadius: '10px',
                                fontSize: '13px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                    style: {
                                        width: 18,
                                        height: 18
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 816,
                                    columnNumber: 15
                                }, this),
                                "Return for Correction"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                            lineNumber: 796,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: handleApprove,
                            disabled: isSubmitting,
                            style: {
                                width: isMobile ? '100%' : 'auto',
                                padding: '12px 24px',
                                border: 'none',
                                background: '#059669',
                                color: '#ffffff',
                                borderRadius: '10px',
                                fontSize: '13px',
                                fontWeight: 900,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                    style: {
                                        width: 18,
                                        height: 18
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                                    lineNumber: 840,
                                    columnNumber: 15
                                }, this),
                                "Approve Indent & Forward to Finance"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                            lineNumber: 819,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
                    lineNumber: 789,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
            lineNumber: 507,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/modules/procurement/plant-head/MaterialIndentApproval.jsx",
        lineNumber: 171,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=modules_procurement_536d9534._.js.map