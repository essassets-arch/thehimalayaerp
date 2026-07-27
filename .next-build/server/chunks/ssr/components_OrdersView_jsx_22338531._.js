module.exports = [
"[project]/components/OrdersView.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>OrdersView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.mjs [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.mjs [app-ssr] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/truck.mjs [app-ssr] (ecmascript) <export default as Truck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.mjs [app-ssr] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.esm.all.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/components/StatusBadge.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/context/AuthContext.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$ReminderModal$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/components/ReminderModal.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/apiClient.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-ssr] (ecmascript)");
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
function OrdersView({ orders, leads = [], customers = [], replacementRequests: propReplacements, returnRequests: propReturns, onUpdateOrderStatus, onUpdateOrder, onAskReplacement, onAskReturn, searchQuery, setSearchQuery, flat = false }) {
    const storeReplacements = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useERPStore"])((s)=>s.state?.sales?.replacementRequests) || [];
    const storeReturns = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useERPStore"])((s)=>s.state?.sales?.returnRequests) || [];
    const replacementRequests = propReplacements || storeReplacements;
    const returnRequests = propReturns || storeReturns;
    const navigate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const isProductionUser = user?.role === 'Production';
    const [localSearch, setLocalSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const search = searchQuery !== undefined ? searchQuery : localSearch;
    const setSearch = setSearchQuery !== undefined ? setSearchQuery : setLocalSearch;
    const [selectedOrder, setSelectedOrder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedDeliveryModal, setSelectedDeliveryModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [requestModal, setRequestModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('All Orders');
    const [currentPage, setCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1);
    const [reminderModal, setReminderModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [sendingOrderId, setSendingOrderId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleSaveReminder = async (formData)=>{
        if (!reminderModal) return;
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].post('/sales/reminders', {
                ...formData,
                moduleType: 'Order',
                moduleId: reminderModal.order?.id || reminderModal.order?.orderNo,
                customerName: reminderModal.order?.customerName || reminderModal.order?.customer || 'Customer'
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'success',
                title: 'Reminder saved',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'error',
                title: 'Failed to save reminder',
                text: err?.message
            });
        }
        setReminderModal(null);
    };
    const PAYMENT_LABELS = {
        PAYMENT_PENDING: 'Awaiting Payment',
        PARTIALLY_PAID: 'Partial Paid',
        AWAITING_FINANCE_VERIFICATION: 'Payment Verification Pending',
        PAID: 'Paid',
        OVERDUE: 'Overdue'
    };
    const sumQty = (requests = [])=>(requests || []).reduce((total, req)=>{
            return total + ((req.items || []).reduce((s, i)=>s + Number(i.receivedQuantity ?? i.approvedQuantity ?? i.requestedQuantity ?? i.quantity ?? 0), 0) || 0);
        }, 0);
    const getAvailableAfterSalesQuantity = (order)=>{
        if (!order) return 0;
        const items = order.items || order.detailedItems || [];
        const deliveredQty = items.reduce((sum, item)=>sum + (Number(item.quantity) || 0), 0);
        const reps = replacementRequests || [];
        const rets = returnRequests || [];
        const orderReplacements = reps.filter((r)=>r.orderId === order.id || r.orderId === order.orderNo);
        const orderReturns = rets.filter((r)=>r.orderId === order.id || r.orderId === order.orderNo);
        const activeReplacements = orderReplacements.filter((r)=>[
                'REPLACEMENT_REQUESTED',
                'REPLACEMENT_APPROVED',
                'REPLACEMENT_DISPATCHED',
                'REPLACEMENT_IN_TRANSIT'
            ].includes(r.status));
        const completedReplacements = orderReplacements.filter((r)=>r.status === 'REPLACEMENT_DELIVERED');
        const activeReturns = orderReturns.filter((r)=>[
                'RETURN_REQUESTED',
                'RETURN_APPROVED',
                'RETURN_PICKUP_ASSIGNED',
                'RETURN_IN_TRANSIT'
            ].includes(r.status));
        const completedReturns = orderReturns.filter((r)=>r.status === 'RETURN_RECEIVED');
        return Math.max(0, deliveredQty - sumQty(activeReplacements) - sumQty(completedReplacements) - sumQty(activeReturns) - sumQty(completedReturns));
    };
    const getReplacementHistory = (order)=>(replacementRequests || []).filter((r)=>r.orderId === order.id || r.orderId === order.orderNo);
    const hasActiveReplacement = (order)=>{
        const status = String(order?.replacementStatus || order?._raw?.replacement_status || '').toUpperCase();
        if (order?.activeReplacementExists || order?._raw?.active_replacement_exists || status === 'ACTIVE' || status === 'PENDING') return true;
        const reps = replacementRequests || [];
        const orderReplacements = reps.filter((r)=>r.orderId === order.id || r.orderId === order.orderNo);
        return orderReplacements.some((r)=>[
                'REPLACEMENT_REQUESTED',
                'REPLACEMENT_APPROVED',
                'REPLACEMENT_DISPATCHED',
                'REPLACEMENT_IN_TRANSIT'
            ].includes(r.status));
    };
    const hasActiveReturn = (order)=>{
        const status = String(order?.returnStatus || order?._raw?.return_status || '').toUpperCase();
        if (order?.activeReturnExists || order?._raw?.active_return_exists || status === 'REQUESTED' || status === 'ACTIVE') return true;
        const rets = returnRequests || [];
        const orderReturns = rets.filter((r)=>r.orderId === order.id || r.orderId === order.orderNo);
        return orderReturns.some((r)=>[
                'RETURN_REQUESTED',
                'RETURN_APPROVED',
                'RETURN_PICKUP_ASSIGNED',
                'RETURN_IN_TRANSIT'
            ].includes(r.status));
    };
    const isDeliveredOrder = (order)=>{
        const dispatchSt = String(order?.dispatchStatus || '').toUpperCase();
        const orderSt = String(order?.orderStatus || order?.status || order?.workflowStatus || '').toUpperCase();
        return dispatchSt === 'DELIVERED' || orderSt === 'DELIVERED' || Boolean(order?.deliveredDate || order?.deliveredAt);
    };
    const hasPendingFinanceConfirmation = (order)=>{
        const paymentSt = String(order?.paymentStatus || '').toUpperCase();
        if (paymentSt === 'FINANCE_VERIFICATION_PENDING' || paymentSt === 'AWAITING_FINANCE_VERIFICATION') return true;
        const paymentConfirmations = __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useERPStore"].getState().state?.sales?.paymentConfirmations || [];
        const conf = paymentConfirmations.find((c)=>c.orderId === order?.id || c.orderId === order?.orderNo);
        return Boolean(conf && conf.status === 'FINANCE_VERIFICATION_PENDING');
    };
    const hasFullReturnCompleted = (order)=>{
        const rets = returnRequests || [];
        const orderReturns = rets.filter((r)=>r.orderId === order?.id || r.orderId === order?.orderNo);
        const totalReturnedQty = orderReturns.filter((r)=>r.status === 'RETURN_RECEIVED').reduce((sum, r)=>sum + (r.items?.reduce((s, i)=>s + Number(i.receivedQuantity ?? i.approvedQuantity ?? i.requestedQuantity ?? i.quantity ?? 0), 0) || 0), 0);
        const totalDeliveredQty = (order?.items || order?.detailedItems || []).reduce((sum, i)=>sum + (i.quantity || 0), 0);
        return totalDeliveredQty > 0 && totalReturnedQty >= totalDeliveredQty;
    };
    const canAskForPayment = (order)=>{
        const isDelivered = isDeliveredOrder(order);
        const paymentSt = String(order?.paymentStatus || '').toUpperCase();
        const isPaymentPending = paymentSt !== 'FULLY_PAID' && paymentSt !== 'PAID';
        return isDelivered && isPaymentPending && !hasPendingFinanceConfirmation(order);
    };
    const canSendToPlantHead = (order)=>{
        return Boolean(order && order.commercialStatus === 'ORDER_CONFIRMED' && order.planningStatus === 'NOT_SENT');
    };
    const canAskReplacement = (order)=>{
        return isDeliveredOrder(order) && getAvailableAfterSalesQuantity(order) > 0 && !hasActiveReplacement(order) && !hasFullReturnCompleted(order);
    };
    const canAskReturn = (order)=>{
        return isDeliveredOrder(order) && getAvailableAfterSalesQuantity(order) > 0 && !hasActiveReturn(order) && !hasFullReturnCompleted(order);
    };
    const getOrderStatusLabel = (order)=>{
        if (!order) return 'Pending';
        if (order.commercialStatus === 'ORDER_CLOSED') return 'Closed';
        if (order.dispatchStatus === 'DELIVERED') return 'Delivered';
        if (order.dispatchStatus === 'IN_TRANSIT') return 'In Transit';
        if (order.dispatchStatus === 'DISPATCH_CREATED') return 'Dispatch Created';
        if (order.qcStatus === 'QC_APPROVED') return 'QC Approved';
        if (order.productionStatus === 'PRODUCTION_COMPLETED') return 'Production Completed';
        if ([
            'PRODUCTION_STARTED',
            'PRODUCTION_IN_PROGRESS',
            'IN_PRODUCTION'
        ].includes(order.productionStatus)) return 'In Production';
        if (order.productionStatus === 'WORK_ORDER_CREATED') return 'Work Order Created';
        if (order.planningStatus === 'PRODUCTION_PLANNED') return 'Production Planned';
        if (order.planningStatus === 'PLANT_HEAD_ACCEPTED') return 'Accepted by Plant Head';
        if (order.planningStatus === 'PENDING_ACCEPTANCE') return 'Sent to Plant Head';
        if (order.commercialStatus === 'ORDER_CONFIRMED' && (order.planningStatus === 'NOT_SENT' || !order.planningStatus)) return 'Confirmed';
        return order.status || order.workflowStatus || 'Pending';
    };
    const getOrderActionState = (order)=>{
        if (!order) return {
            action: null,
            label: 'No Action'
        };
        if (order.commercialStatus === 'ORDER_CONFIRMED' && (order.planningStatus === 'NOT_SENT' || !order.planningStatus)) {
            return {
                action: 'SEND_TO_PLANT_HEAD',
                label: 'Send to Plant Head'
            };
        }
        if (order.planningStatus === 'PENDING_ACCEPTANCE') {
            return {
                action: null,
                label: 'Awaiting Plant Head'
            };
        }
        if (order.planningStatus === 'PLANT_HEAD_ACCEPTED') {
            return {
                action: null,
                label: 'Awaiting Production Plan'
            };
        }
        if (order.planningStatus === 'PRODUCTION_PLANNED' && (order.productionStatus === 'NOT_STARTED' || !order.productionStatus)) {
            return {
                action: null,
                label: 'Production Planned'
            };
        }
        if (order.productionStatus === 'WORK_ORDER_CREATED') {
            return {
                action: null,
                label: 'Work Order Created'
            };
        }
        if ([
            'PRODUCTION_STARTED',
            'PRODUCTION_IN_PROGRESS',
            'IN_PRODUCTION'
        ].includes(order.productionStatus)) {
            return {
                action: null,
                label: 'In Production'
            };
        }
        if (order.productionStatus === 'PRODUCTION_COMPLETED' && order.qcStatus !== 'QC_APPROVED') {
            return {
                action: null,
                label: 'Awaiting QC'
            };
        }
        if (order.qcStatus === 'QC_APPROVED' && (order.dispatchStatus === 'NOT_READY' || !order.dispatchStatus)) {
            return {
                action: null,
                label: 'Ready for Dispatch'
            };
        }
        if (order.dispatchStatus === 'DISPATCH_CREATED') {
            return {
                action: null,
                label: 'Dispatch Created'
            };
        }
        if (order.dispatchStatus === 'IN_TRANSIT') {
            return {
                action: null,
                label: 'In Transit'
            };
        }
        if (order.dispatchStatus === 'DELIVERED' && order.paymentStatus !== 'FULLY_PAID') {
            return {
                action: 'AFTER_DELIVERY',
                label: 'Payment / After-Sales'
            };
        }
        if (order.dispatchStatus === 'DELIVERED' && order.paymentStatus === 'FULLY_PAID') {
            return {
                action: 'AFTER_SALES',
                label: 'After-Sales Service'
            };
        }
        if (order.commercialStatus === 'ORDER_CLOSED') {
            return {
                action: 'AFTER_SALES',
                label: 'Closed'
            };
        }
        return {
            action: null,
            label: 'No Action'
        };
    };
    const validOrders = orders.filter((o)=>{
        if (!o) return false;
        const isOrdId = typeof o.id === 'string' && o.id.startsWith('ORD-');
        const hasCustomer = Boolean(o.customerName || o.customer?.name);
        const hasItems = Array.isArray(o.items) && o.items.length > 0 || Boolean(o.products);
        return isOrdId && hasCustomer && hasItems;
    });
    const filteredOrders = validOrders.filter((o)=>{
        const custName = o.customerName || o.customer?.name || '';
        const matchesSearch = custName.toLowerCase().includes(search.toLowerCase()) || (o.products || '').toLowerCase().includes(search.toLowerCase());
        const stage = String(o.status || o.overallStage || o.order_stage || o.productionStatus || 'Draft');
        const stageUpper = stage.toUpperCase();
        let matchesFilter = false;
        if (filter === 'All Orders') matchesFilter = true;
        else if (filter === 'Open Orders') {
            matchesFilter = !isDeliveredOrder(o) && ![
                'CLOSED',
                'Closed',
                'CANCELLED',
                'Cancelled'
            ].includes(stage);
        } else if (filter === 'In Production') {
            matchesFilter = [
                'IN_PRODUCTION',
                'WORK_ORDER_CREATED',
                'PLANNED',
                'MATERIAL_REQUESTED',
                'MATERIAL_APPROVED',
                'MATERIAL_ISSUED'
            ].includes(stageUpper);
        } else if (filter === 'Dispatched') {
            matchesFilter = [
                'DISPATCH_CREATED',
                'IN_TRANSIT',
                'IN TRANSIT',
                'DISPATCH_READY'
            ].includes(stageUpper);
        } else if (filter === 'Delivered') {
            matchesFilter = isDeliveredOrder(o);
        } else if (filter === 'Closed') {
            matchesFilter = [
                'CLOSED',
                'Closed'
            ].includes(stage);
        }
        return matchesSearch && matchesFilter;
    });
    const ITEMS_PER_PAGE = 25;
    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
    const displayedOrders = flat ? filteredOrders : filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
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
    const currentDetailsOrder = selectedOrder ? orders.find((o)=>o.orderNo === selectedOrder.orderNo) : null;
    // Resolve client information
    const detailsCustName = currentDetailsOrder ? currentDetailsOrder.customerName || currentDetailsOrder.customer?.name || '' : '';
    const clientLead = currentDetailsOrder ? leads.find((l)=>(l.companyName || '').toLowerCase() === detailsCustName.toLowerCase()) : null;
    const clientCustomer = currentDetailsOrder ? customers.find((c)=>(c.companyName || c.name || '').toLowerCase() === detailsCustName.toLowerCase()) : null;
    const renderAddress = (addr)=>{
        if (!addr) return '';
        if (typeof addr === 'string') return addr;
        const parts = [
            addr.line1,
            addr.city,
            addr.state,
            addr.country,
            addr.pincode
        ].filter(Boolean);
        return parts.join(', ') || '';
    };
    const clientAddress = clientLead ? renderAddress(clientLead.address) : clientCustomer ? clientCustomer.address : 'Andheri, Mumbai (Default Address)';
    const clientGST = clientLead?.gstNumber || '27ABCDE4321G2Z8';
    const formatINR = (value)=>{
        const num = Number(value);
        if (isNaN(num)) return '₹0';
        if (num >= 100000) {
            return `₹${(num / 100000).toFixed(2)} L`;
        }
        return `₹${Math.round(num).toLocaleString('en-IN')}`;
    };
    const orderGrandTotal = currentDetailsOrder ? currentDetailsOrder.payment?.totalAmount || currentDetailsOrder.totalValue || 0 : 0;
    const transportVal = currentDetailsOrder ? currentDetailsOrder.transportCharge !== undefined ? currentDetailsOrder.transportCharge : 0 : 0;
    // Resolve detailed item rows
    const itemsList = currentDetailsOrder ? currentDetailsOrder.detailedItems || [
        {
            productName: currentDetailsOrder.products,
            code: `P-${(currentDetailsOrder.products.replace(/[^A-Za-z]/g, '').substring(0, 3) || 'PRD').toUpperCase()}-02`,
            quantity: currentDetailsOrder.quantity || 1,
            unitPrice: (orderGrandTotal - transportVal) / (currentDetailsOrder.quantity || 1),
            discount: 0,
            tax: currentDetailsOrder.tax !== undefined ? currentDetailsOrder.tax : currentDetailsOrder.gst !== undefined ? currentDetailsOrder.gst : 18
        }
    ] : [];
    const calculatedSubtotal = itemsList.reduce((sum, item)=>sum + item.quantity * item.unitPrice, 0);
    const discountAmt = itemsList.reduce((sum, item)=>sum + item.quantity * item.unitPrice * (item.discount || 0) / 100, 0);
    const calculatedTaxAmt = itemsList.reduce((sum, item)=>{
        const sub = item.quantity * item.unitPrice;
        const disc = sub * (item.discount || 0) / 100;
        return sum + (sub - disc) * (item.tax !== undefined ? item.tax : 18) / 100;
    }, 0);
    const rawGrandTotal = calculatedSubtotal - discountAmt + calculatedTaxAmt;
    const computedTransportVal = currentDetailsOrder ? currentDetailsOrder.transportCharge !== undefined ? currentDetailsOrder.transportCharge : Math.max(0, orderGrandTotal - rawGrandTotal) : 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "app-card",
        style: {
            flex: 1
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "module-header-row",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "module-title",
                        children: "Purchase Orders Tracker"
                    }, void 0, false, {
                        fileName: "[project]/components/OrdersView.jsx",
                        lineNumber: 334,
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
                                children: [
                                    'All Orders',
                                    'Open Orders',
                                    'In Production',
                                    'Dispatched',
                                    'Delivered',
                                    'Closed'
                                ].map((st)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: `filter-pill ${filter === st ? 'active' : ''}`,
                                        onClick: ()=>setFilter(st),
                                        style: {
                                            color: filter === st ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                                        },
                                        children: st
                                    }, st, false, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 339,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/OrdersView.jsx",
                                lineNumber: 337,
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
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 351,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Search orders...",
                                        value: search,
                                        onChange: (e)=>setSearch(e.target.value),
                                        style: {
                                            color: 'var(--color-text-primary)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 352,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/OrdersView.jsx",
                                lineNumber: 350,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/OrdersView.jsx",
                        lineNumber: 335,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/OrdersView.jsx",
                lineNumber: 333,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "crm-table-container",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "crm-table responsive-table flat-table",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("colgroup", {
                            children: isProductionUser ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: '15%'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 369,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: '30%'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 370,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: '35%'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 371,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: '10%'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 372,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: '10%'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 373,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: '12%'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 377,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: '22%'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 378,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: '26%'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 379,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: '15%'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 380,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: '13%'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 381,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                        style: {
                                            width: '12%'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 382,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true)
                        }, void 0, false, {
                            fileName: "[project]/components/OrdersView.jsx",
                            lineNumber: 366,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: filter === 'Delivered' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Order No"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 390,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Customer"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 391,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Delivery Date"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 392,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                textAlign: 'right'
                                            },
                                            children: "Order Value"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 393,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                textAlign: 'right'
                                            },
                                            children: "Paid Amount"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 394,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            style: {
                                                textAlign: 'right'
                                            },
                                            children: "Balance Amount"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 395,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Payment Status"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 396,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Action"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 397,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Order ID"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 401,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Customer"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 402,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Products / Items"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 403,
                                            columnNumber: 19
                                        }, this),
                                        !isProductionUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Total Value"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 404,
                                            columnNumber: 41
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Order Status"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 405,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            children: "Actions"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 406,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "[project]/components/OrdersView.jsx",
                                lineNumber: 387,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/OrdersView.jsx",
                            lineNumber: 386,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: filteredOrders.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: isProductionUser ? "5" : "6",
                                    style: {
                                        textAlign: 'center',
                                        padding: '30px',
                                        color: 'var(--color-text-muted)'
                                    },
                                    children: "No orders generated."
                                }, void 0, false, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 414,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/OrdersView.jsx",
                                lineNumber: 413,
                                columnNumber: 15
                            }, this) : displayedOrders.map((o)=>{
                                const paid = Number(o.verifiedPaidAmount ?? o.payment?.paid ?? 0) || 0;
                                const total = Number(o.totalAmount ?? o.payment?.totalAmount ?? 0) || 0;
                                const balance = o.balanceAmount !== undefined ? Number(o.balanceAmount) || 0 : Math.max(0, total - paid);
                                const paymentKey = String(o.paymentStatus || '').toUpperCase();
                                const paymentLabel = PAYMENT_LABELS[paymentKey] || (paymentKey ? paymentKey.replaceAll('_', ' ') : 'Awaiting Payment');
                                const deliveryDate = o.deliveredAt ? String(o.deliveredAt).slice(0, 10) : o.expectedDeliveryDate ? String(o.expectedDeliveryDate).slice(0, 10) : '-';
                                if (filter === 'Delivered') {
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                "data-label": "Order No",
                                                style: {
                                                    fontWeight: 800,
                                                    fontFamily: 'monospace'
                                                },
                                                children: o.orderNo
                                            }, void 0, false, {
                                                fileName: "[project]/components/OrdersView.jsx",
                                                lineNumber: 430,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                "data-label": "Customer",
                                                style: {
                                                    fontWeight: 700
                                                },
                                                children: o.customer?.name
                                            }, void 0, false, {
                                                fileName: "[project]/components/OrdersView.jsx",
                                                lineNumber: 431,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                "data-label": "Delivery Date",
                                                children: deliveryDate
                                            }, void 0, false, {
                                                fileName: "[project]/components/OrdersView.jsx",
                                                lineNumber: 432,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                "data-label": "Order Value",
                                                style: {
                                                    textAlign: 'right',
                                                    fontWeight: 800
                                                },
                                                children: formatINR(total)
                                            }, void 0, false, {
                                                fileName: "[project]/components/OrdersView.jsx",
                                                lineNumber: 433,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                "data-label": "Paid Amount",
                                                style: {
                                                    textAlign: 'right',
                                                    fontWeight: 800,
                                                    color: '#10b981'
                                                },
                                                children: formatINR(paid)
                                            }, void 0, false, {
                                                fileName: "[project]/components/OrdersView.jsx",
                                                lineNumber: 434,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                "data-label": "Balance Amount",
                                                style: {
                                                    textAlign: 'right',
                                                    fontWeight: 800,
                                                    color: '#ef4444'
                                                },
                                                children: formatINR(balance)
                                            }, void 0, false, {
                                                fileName: "[project]/components/OrdersView.jsx",
                                                lineNumber: 435,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                "data-label": "Payment Status",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                    status: paymentLabel
                                                }, void 0, false, {
                                                    fileName: "[project]/components/OrdersView.jsx",
                                                    lineNumber: 437,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/OrdersView.jsx",
                                                lineNumber: 436,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                "data-label": "Action",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            title: "View",
                                                            onClick: ()=>setSelectedOrder(o),
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
                                                                color: '#374151'
                                                            },
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                                size: 13
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/OrdersView.jsx",
                                                                lineNumber: 452,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/OrdersView.jsx",
                                                            lineNumber: 441,
                                                            columnNumber: 27
                                                        }, this),
                                                        canAskForPayment(o) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>navigate.push('/sales/payment-followup'),
                                                            style: {
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                padding: '4px 12px',
                                                                height: '30px',
                                                                background: '#eff6ff',
                                                                border: '1px solid #3b82f6',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px',
                                                                fontWeight: '800',
                                                                color: '#1d4ed8',
                                                                whiteSpace: 'nowrap'
                                                            },
                                                            children: "Ask for Payment"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/OrdersView.jsx",
                                                            lineNumber: 455,
                                                            columnNumber: 29
                                                        }, this),
                                                        hasPendingFinanceConfirmation(o) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                            status: "Payment Verification Pending"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/OrdersView.jsx",
                                                            lineNumber: 472,
                                                            columnNumber: 29
                                                        }, this),
                                                        onAskReplacement && canAskReplacement(o) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>onAskReplacement(o),
                                                            style: {
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                padding: '4px 12px',
                                                                height: '30px',
                                                                background: '#fef3c7',
                                                                border: '1px solid #f59e0b',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px',
                                                                fontWeight: '800',
                                                                color: '#92400e',
                                                                whiteSpace: 'nowrap'
                                                            },
                                                            children: "Ask for Replacement"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/OrdersView.jsx",
                                                            lineNumber: 475,
                                                            columnNumber: 29
                                                        }, this),
                                                        hasActiveReplacement(o) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                            status: "Replacement Pending"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/OrdersView.jsx",
                                                            lineNumber: 492,
                                                            columnNumber: 29
                                                        }, this),
                                                        onAskReturn && canAskReturn(o) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: ()=>onAskReturn(o),
                                                            style: {
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                padding: '4px 12px',
                                                                height: '30px',
                                                                background: '#fff1f2',
                                                                border: '1px solid #f43f5e',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px',
                                                                fontWeight: '800',
                                                                color: '#e11d48',
                                                                whiteSpace: 'nowrap'
                                                            },
                                                            children: "Ask for Return"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/OrdersView.jsx",
                                                            lineNumber: 495,
                                                            columnNumber: 29
                                                        }, this),
                                                        hasActiveReturn(o) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                padding: '4px 10px',
                                                                borderRadius: '8px',
                                                                fontSize: '11px',
                                                                fontWeight: '800',
                                                                background: '#ffe4e6',
                                                                color: '#be123c',
                                                                border: '1px solid #fda4af'
                                                            },
                                                            children: "Return Requested"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/OrdersView.jsx",
                                                            lineNumber: 512,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/OrdersView.jsx",
                                                    lineNumber: 440,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/OrdersView.jsx",
                                                lineNumber: 439,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, o.id || o.orderNo, true, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 429,
                                        columnNumber: 21
                                    }, this);
                                }
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Order ID",
                                            style: {
                                                fontWeight: '700'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    color: 'var(--color-text-primary)',
                                                    cursor: 'pointer',
                                                    textDecoration: 'underline'
                                                },
                                                onClick: ()=>navigate.push(`/orders/${o.orderNo}`),
                                                children: o.orderNo
                                            }, void 0, false, {
                                                fileName: "[project]/components/OrdersView.jsx",
                                                lineNumber: 523,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 522,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Customer",
                                            style: {
                                                fontWeight: '600'
                                            },
                                            children: o.customerName || o.customer?.name || '—'
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 530,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Products / Items",
                                            children: o.products || (Array.isArray(o.items) && o.items.length > 0 ? o.items.map((i)=>`${i.productName || i.name || 'Item'} (${i.quantity || 1} Qty)`).join(', ') : '') || (Array.isArray(o.detailedItems) && o.detailedItems.length > 0 ? o.detailedItems.map((i)=>`${i.productName || i.name || 'Item'} (${i.quantity || 1} Qty)`).join(', ') : '') || '—'
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 533,
                                            columnNumber: 21
                                        }, this),
                                        !isProductionUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Total Value",
                                            style: {
                                                fontWeight: '700'
                                            },
                                            children: formatINR(o.grandTotal ?? o.totalAmount ?? o.payment?.totalAmount ?? o.totalValue ?? 0)
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 537,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Order Status",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: '4px'
                                                },
                                                children: [
                                                    o.dispatchStatus === 'DELIVERED' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                        status: "Delivered"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/OrdersView.jsx",
                                                        lineNumber: 543,
                                                        columnNumber: 62
                                                    }, this),
                                                    o.paymentStatus === 'FULLY_PAID' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                        status: "Fully Paid"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/OrdersView.jsx",
                                                        lineNumber: 544,
                                                        columnNumber: 62
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                        status: getOrderStatusLabel(o)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/OrdersView.jsx",
                                                        lineNumber: 545,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/OrdersView.jsx",
                                                lineNumber: 542,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 541,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Actions",
                                            children: (()=>{
                                                const actionState = getOrderActionState(o);
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        whiteSpace: 'nowrap'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            title: "View Details",
                                                            onClick: ()=>setSelectedOrder(o),
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
                                                                fileName: "[project]/components/OrdersView.jsx",
                                                                lineNumber: 564,
                                                                columnNumber: 31
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/OrdersView.jsx",
                                                            lineNumber: 553,
                                                            columnNumber: 29
                                                        }, this),
                                                        actionState.action === 'SEND_TO_PLANT_HEAD' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            disabled: sendingOrderId === (o.id || o.orderNo),
                                                            onClick: async ()=>{
                                                                const orderId = o.id || o.orderNo;
                                                                if (sendingOrderId === orderId) return;
                                                                const confirmation = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire({
                                                                    title: 'Send Order to Plant Head?',
                                                                    text: 'This order will be added to the Plant Head incoming-order queue for production planning.',
                                                                    icon: 'question',
                                                                    showCancelButton: true,
                                                                    confirmButtonText: 'Yes, Send Order',
                                                                    cancelButtonText: 'Cancel'
                                                                });
                                                                if (!confirmation.isConfirmed) return;
                                                                setSendingOrderId(orderId);
                                                                try {
                                                                    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useERPStore"].getState().sendOrderToPlantHead(orderId);
                                                                    await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire({
                                                                        title: 'Order Sent Successfully',
                                                                        text: 'The order is now available in Plant Head Incoming Orders.',
                                                                        icon: 'success'
                                                                    });
                                                                } catch (err) {
                                                                    await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].fire({
                                                                        icon: 'error',
                                                                        title: 'Unable to Send Order',
                                                                        text: err?.message || 'Unable to send order'
                                                                    });
                                                                } finally{
                                                                    setSendingOrderId(null);
                                                                }
                                                            },
                                                            style: {
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                padding: '4px 12px',
                                                                height: '30px',
                                                                background: '#c9f03d',
                                                                border: '1px solid #b5da2a',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                fontSize: '12px',
                                                                fontWeight: '700',
                                                                color: '#1a2600',
                                                                whiteSpace: 'nowrap',
                                                                flexShrink: 0
                                                            },
                                                            children: "Send to Plant Head"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/OrdersView.jsx",
                                                            lineNumber: 568,
                                                            columnNumber: 31
                                                        }, this),
                                                        (actionState.action === 'AFTER_DELIVERY' || actionState.action === 'AFTER_SALES') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                canAskForPayment(o) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>navigate.push('/sales/payment-followup'),
                                                                    style: {
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                        padding: '4px 12px',
                                                                        height: '30px',
                                                                        background: '#eff6ff',
                                                                        border: '1px solid #3b82f6',
                                                                        borderRadius: '8px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '12px',
                                                                        fontWeight: '800',
                                                                        color: '#1d4ed8',
                                                                        whiteSpace: 'nowrap',
                                                                        flexShrink: 0
                                                                    },
                                                                    children: "Ask for Payment"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/OrdersView.jsx",
                                                                    lineNumber: 615,
                                                                    columnNumber: 35
                                                                }, this),
                                                                hasPendingFinanceConfirmation(o) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                    status: "Payment Verification Pending"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/OrdersView.jsx",
                                                                    lineNumber: 633,
                                                                    columnNumber: 35
                                                                }, this),
                                                                onAskReplacement && canAskReplacement(o) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>onAskReplacement(o),
                                                                    style: {
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        padding: '4px 12px',
                                                                        height: '30px',
                                                                        background: '#fef3c7',
                                                                        border: '1px solid #f59e0b',
                                                                        borderRadius: '8px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '12px',
                                                                        fontWeight: '800',
                                                                        color: '#92400e',
                                                                        whiteSpace: 'nowrap',
                                                                        flexShrink: 0
                                                                    },
                                                                    children: "Ask for Replacement"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/OrdersView.jsx",
                                                                    lineNumber: 636,
                                                                    columnNumber: 35
                                                                }, this),
                                                                hasActiveReplacement(o) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                    status: "Replacement Pending"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/OrdersView.jsx",
                                                                    lineNumber: 654,
                                                                    columnNumber: 35
                                                                }, this),
                                                                onAskReturn && canAskReturn(o) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>onAskReturn(o),
                                                                    style: {
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        padding: '4px 12px',
                                                                        height: '30px',
                                                                        background: '#fff1f2',
                                                                        border: '1px solid #f43f5e',
                                                                        borderRadius: '8px',
                                                                        cursor: 'pointer',
                                                                        fontSize: '12px',
                                                                        fontWeight: '800',
                                                                        color: '#e11d48',
                                                                        whiteSpace: 'nowrap',
                                                                        flexShrink: 0
                                                                    },
                                                                    children: "Ask for Return"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/OrdersView.jsx",
                                                                    lineNumber: 657,
                                                                    columnNumber: 35
                                                                }, this),
                                                                hasActiveReturn(o) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        padding: '4px 10px',
                                                                        borderRadius: '8px',
                                                                        fontSize: '11px',
                                                                        fontWeight: '800',
                                                                        background: '#ffe4e6',
                                                                        color: '#be123c',
                                                                        border: '1px solid #fda4af'
                                                                    },
                                                                    children: "Return Requested"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/OrdersView.jsx",
                                                                    lineNumber: 675,
                                                                    columnNumber: 35
                                                                }, this)
                                                            ]
                                                        }, void 0, true),
                                                        !actionState.action && actionState.label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '12px',
                                                                color: 'var(--color-text-secondary)',
                                                                fontWeight: '600',
                                                                padding: '0 4px'
                                                            },
                                                            children: actionState.label
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/OrdersView.jsx",
                                                            lineNumber: 681,
                                                            columnNumber: 31
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/OrdersView.jsx",
                                                    lineNumber: 552,
                                                    columnNumber: 27
                                                }, this);
                                            })()
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 548,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, o.id || o.orderNo, true, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 521,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/components/OrdersView.jsx",
                            lineNumber: 411,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/OrdersView.jsx",
                    lineNumber: 365,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/OrdersView.jsx",
                lineNumber: 364,
                columnNumber: 7
            }, this),
            !flat && totalPages > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '20px',
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '16px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            fontSize: '13px',
                            color: 'var(--color-text-secondary)'
                        },
                        children: [
                            "Showing page ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: currentPage
                            }, void 0, false, {
                                fileName: "[project]/components/OrdersView.jsx",
                                lineNumber: 701,
                                columnNumber: 26
                            }, this),
                            " of ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: totalPages
                            }, void 0, false, {
                                fileName: "[project]/components/OrdersView.jsx",
                                lineNumber: 701,
                                columnNumber: 60
                            }, this),
                            " (",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: filteredOrders.length
                            }, void 0, false, {
                                fileName: "[project]/components/OrdersView.jsx",
                                lineNumber: 701,
                                columnNumber: 91
                            }, this),
                            " total orders)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/OrdersView.jsx",
                        lineNumber: 700,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '8px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 710,
                                        columnNumber: 15
                                    }, this),
                                    " Previous"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/OrdersView.jsx",
                                lineNumber: 704,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 718,
                                        columnNumber: 20
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/OrdersView.jsx",
                                lineNumber: 712,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/OrdersView.jsx",
                        lineNumber: 703,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/OrdersView.jsx",
                lineNumber: 699,
                columnNumber: 9
            }, this),
            currentDetailsOrder && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "modal-overlay active",
                onClick: ()=>setSelectedOrder(null),
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
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 734,
                                            columnNumber: 19
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
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 735,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 733,
                                    columnNumber: 17
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
                                            children: "PURCHASE ORDER"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 738,
                                            columnNumber: 19
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
                                                currentDetailsOrder.orderNo
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 739,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 737,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/OrdersView.jsx",
                            lineNumber: 732,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                            style: {
                                border: 'none',
                                borderTop: '2px solid #000000',
                                margin: '0 0 24px 0'
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/OrdersView.jsx",
                            lineNumber: 744,
                            columnNumber: 15
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
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 749,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                margin: '4px 0 0 0',
                                                fontWeight: '800',
                                                color: '#1e293b',
                                                fontSize: '15px'
                                            },
                                            children: currentDetailsOrder.customerName || currentDetailsOrder.customer?.name
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 750,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                margin: '2px 0 0 0',
                                                color: '#475569',
                                                fontWeight: '500'
                                            },
                                            children: clientAddress
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 751,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                margin: '4px 0 0 0',
                                                color: '#475569',
                                                fontWeight: '600'
                                            },
                                            children: [
                                                "GST: ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        textTransform: 'uppercase',
                                                        fontFamily: 'monospace'
                                                    },
                                                    children: clientGST
                                                }, void 0, false, {
                                                    fileName: "[project]/components/OrdersView.jsx",
                                                    lineNumber: 752,
                                                    columnNumber: 96
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 752,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 748,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "sheet-meta-right",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            margin: 0
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: "Order Date:"
                                            }, void 0, false, {
                                                fileName: "[project]/components/OrdersView.jsx",
                                                lineNumber: 755,
                                                columnNumber: 44
                                            }, this),
                                            " ",
                                            currentDetailsOrder.date || '2026-06-05'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 755,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 754,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/OrdersView.jsx",
                            lineNumber: 747,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "crm-table-container",
                            style: {
                                margin: '0 0 20px 0',
                                border: '1px solid #eaeaea'
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
                                                    fileName: "[project]/components/OrdersView.jsx",
                                                    lineNumber: 764,
                                                    columnNumber: 23
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
                                                    fileName: "[project]/components/OrdersView.jsx",
                                                    lineNumber: 765,
                                                    columnNumber: 23
                                                }, this),
                                                !isProductionUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
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
                                                    fileName: "[project]/components/OrdersView.jsx",
                                                    lineNumber: 766,
                                                    columnNumber: 45
                                                }, this),
                                                discountAmt > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: '12px 16px',
                                                        textAlign: 'center',
                                                        fontWeight: '700',
                                                        color: '#475569',
                                                        fontSize: '11px',
                                                        textTransform: 'uppercase'
                                                    },
                                                    children: "Discount"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/OrdersView.jsx",
                                                    lineNumber: 768,
                                                    columnNumber: 25
                                                }, this),
                                                !isProductionUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
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
                                                    fileName: "[project]/components/OrdersView.jsx",
                                                    lineNumber: 770,
                                                    columnNumber: 45
                                                }, this),
                                                !isProductionUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
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
                                                    fileName: "[project]/components/OrdersView.jsx",
                                                    lineNumber: 771,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 763,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 762,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                        children: itemsList.map((item, index)=>{
                                            const itemSubtotal = item.quantity * item.unitPrice;
                                            const discountValue = itemSubtotal * (item.discount || 0) / 100;
                                            const taxable = itemSubtotal - discountValue;
                                            const taxValue = taxable * (item.tax !== undefined ? item.tax : 18) / 100;
                                            const itemTotal = taxable + taxValue;
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
                                                                    children: item.productName
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/OrdersView.jsx",
                                                                    lineNumber: 786,
                                                                    columnNumber: 31
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
                                                                    fileName: "[project]/components/OrdersView.jsx",
                                                                    lineNumber: 788,
                                                                    columnNumber: 33
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
                                                                        item.code
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/OrdersView.jsx",
                                                                    lineNumber: 790,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/OrdersView.jsx",
                                                            lineNumber: 785,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/OrdersView.jsx",
                                                        lineNumber: 784,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        "data-label": "Qty",
                                                        style: {
                                                            textAlign: 'center',
                                                            fontWeight: '600',
                                                            color: '#334155'
                                                        },
                                                        children: item.quantity
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/OrdersView.jsx",
                                                        lineNumber: 793,
                                                        columnNumber: 27
                                                    }, this),
                                                    !isProductionUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        "data-label": "Rate",
                                                        style: {
                                                            textAlign: 'center',
                                                            fontWeight: '600',
                                                            color: '#334155'
                                                        },
                                                        children: formatINR(item.unitPrice)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/OrdersView.jsx",
                                                        lineNumber: 794,
                                                        columnNumber: 49
                                                    }, this),
                                                    discountAmt > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        "data-label": "Discount",
                                                        style: {
                                                            textAlign: 'center',
                                                            fontWeight: '600',
                                                            color: '#5E6B82'
                                                        },
                                                        children: [
                                                            item.discount || 0,
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/OrdersView.jsx",
                                                        lineNumber: 796,
                                                        columnNumber: 29
                                                    }, this),
                                                    !isProductionUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        "data-label": "Tax (GST)",
                                                        style: {
                                                            textAlign: 'center',
                                                            fontWeight: '600',
                                                            color: '#5E6B82'
                                                        },
                                                        children: [
                                                            item.tax !== undefined ? item.tax : 18,
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/OrdersView.jsx",
                                                        lineNumber: 798,
                                                        columnNumber: 49
                                                    }, this),
                                                    !isProductionUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        "data-label": "Total",
                                                        style: {
                                                            textAlign: 'right',
                                                            fontWeight: '800',
                                                            color: '#1e293b'
                                                        },
                                                        children: formatINR(itemTotal)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/OrdersView.jsx",
                                                        lineNumber: 799,
                                                        columnNumber: 49
                                                    }, this)
                                                ]
                                            }, index, true, {
                                                fileName: "[project]/components/OrdersView.jsx",
                                                lineNumber: 783,
                                                columnNumber: 25
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 774,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/OrdersView.jsx",
                                lineNumber: 761,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/OrdersView.jsx",
                            lineNumber: 760,
                            columnNumber: 15
                        }, this),
                        !isProductionUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 811,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontWeight: '600',
                                                color: '#1e293b'
                                            },
                                            children: formatINR(calculatedSubtotal - discountAmt)
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 812,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 810,
                                    columnNumber: 19
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
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 815,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontWeight: '600',
                                                color: '#1e293b'
                                            },
                                            children: formatINR(calculatedTaxAmt)
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 816,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 814,
                                    columnNumber: 19
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
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"], {
                                                    size: 12
                                                }, void 0, false, {
                                                    fileName: "[project]/components/OrdersView.jsx",
                                                    lineNumber: 820,
                                                    columnNumber: 91
                                                }, this),
                                                " Transport (Approx.):"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 820,
                                            columnNumber: 23
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
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 821,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 819,
                                    columnNumber: 21
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
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 825,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: '#1e293b',
                                                fontSize: '17px'
                                            },
                                            children: formatINR(orderGrandTotal)
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 826,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 824,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/OrdersView.jsx",
                            lineNumber: 809,
                            columnNumber: 17
                        }, this),
                        getReplacementHistory(currentDetailsOrder).length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                background: '#fff7ed',
                                borderRadius: '12px',
                                padding: '16px',
                                border: '1px solid #fed7aa',
                                marginBottom: '20px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '12px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            style: {
                                                fontSize: '12px',
                                                fontWeight: '900',
                                                textTransform: 'uppercase',
                                                color: '#9a3412',
                                                margin: 0
                                            },
                                            children: "Replacement History"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 835,
                                            columnNumber: 21
                                        }, this),
                                        String(currentDetailsOrder.replacementStatus || currentDetailsOrder._raw?.replacement_status || '').toUpperCase() === 'COMPLETED' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            status: "Replacement Completed"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 839,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 834,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "crm-table-container",
                                    style: {
                                        margin: 0,
                                        border: '1px solid #fed7aa'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                        className: "crm-table responsive-table",
                                        style: {
                                            border: 'none'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            children: "Replacement No"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/OrdersView.jsx",
                                                            lineNumber: 846,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            children: "Product"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/OrdersView.jsx",
                                                            lineNumber: 847,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            children: "Qty"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/OrdersView.jsx",
                                                            lineNumber: 848,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            children: "Requested"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/OrdersView.jsx",
                                                            lineNumber: 849,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            children: "Delivered"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/OrdersView.jsx",
                                                            lineNumber: 850,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            children: "Status"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/OrdersView.jsx",
                                                            lineNumber: 851,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/OrdersView.jsx",
                                                    lineNumber: 845,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/OrdersView.jsx",
                                                lineNumber: 844,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                children: getReplacementHistory(currentDetailsOrder).map((rep)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                style: {
                                                                    fontFamily: 'monospace',
                                                                    fontWeight: 800
                                                                },
                                                                children: rep.request_no
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/OrdersView.jsx",
                                                                lineNumber: 857,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                children: rep.product_name || rep.productName || 'N/A'
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/OrdersView.jsx",
                                                                lineNumber: 858,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                children: Number(rep.delivered_qty || rep.approved_qty || rep.requested_qty || 0)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/OrdersView.jsx",
                                                                lineNumber: 859,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                children: rep.created_at ? String(rep.created_at).slice(0, 10) : '-'
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/OrdersView.jsx",
                                                                lineNumber: 860,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                children: rep.delivered_at ? String(rep.delivered_at).slice(0, 10) : '-'
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/OrdersView.jsx",
                                                                lineNumber: 861,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                    status: rep.status
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/OrdersView.jsx",
                                                                    lineNumber: 862,
                                                                    columnNumber: 33
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/OrdersView.jsx",
                                                                lineNumber: 862,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, rep.id || rep.request_no, true, {
                                                        fileName: "[project]/components/OrdersView.jsx",
                                                        lineNumber: 856,
                                                        columnNumber: 27
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/components/OrdersView.jsx",
                                                lineNumber: 854,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/OrdersView.jsx",
                                        lineNumber: 843,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 842,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/OrdersView.jsx",
                            lineNumber: 833,
                            columnNumber: 17
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "sheet-actions",
                            children: [
                                canSendToPlantHead(currentDetailsOrder) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>handleUpdateStatusClick(currentDetailsOrder.orderNo || currentDetailsOrder.id, 'PLANT_PENDING', 'Send to Plant Head'),
                                    style: {
                                        padding: '10px 20px',
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        borderRadius: '8px',
                                        margin: 0,
                                        background: '#c9f03d',
                                        border: '1px solid #b5da2a',
                                        color: '#1a2600',
                                        cursor: 'pointer'
                                    },
                                    children: "✓ Send to Plant Head"
                                }, void 0, false, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 874,
                                    columnNumber: 19
                                }, this),
                                canAskForPayment(currentDetailsOrder) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>{
                                        setSelectedOrder(null);
                                        navigate.push('/sales/payment-followup');
                                    },
                                    style: {
                                        padding: '10px 20px',
                                        fontSize: '13px',
                                        fontWeight: '800',
                                        borderRadius: '8px',
                                        margin: 0,
                                        background: '#eff6ff',
                                        border: '1px solid #3b82f6',
                                        color: '#1d4ed8',
                                        cursor: 'pointer'
                                    },
                                    children: "Ask for Payment"
                                }, void 0, false, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 886,
                                    columnNumber: 19
                                }, this),
                                onAskReplacement && canAskReplacement(currentDetailsOrder) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>{
                                        setSelectedOrder(null);
                                        onAskReplacement(currentDetailsOrder);
                                    },
                                    style: {
                                        padding: '10px 20px',
                                        fontSize: '13px',
                                        fontWeight: '800',
                                        borderRadius: '8px',
                                        margin: 0,
                                        background: '#fef3c7',
                                        border: '1px solid #f59e0b',
                                        color: '#92400e',
                                        cursor: 'pointer'
                                    },
                                    children: "Ask for Replacement"
                                }, void 0, false, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 898,
                                    columnNumber: 19
                                }, this),
                                onAskReturn && canAskReturn(currentDetailsOrder) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>{
                                        setSelectedOrder(null);
                                        onAskReturn(currentDetailsOrder);
                                    },
                                    style: {
                                        padding: '10px 20px',
                                        fontSize: '13px',
                                        fontWeight: '800',
                                        borderRadius: '8px',
                                        margin: 0,
                                        background: '#fff1f2',
                                        border: '1px solid #f43f5e',
                                        color: '#e11d48',
                                        cursor: 'pointer'
                                    },
                                    children: "Ask for Return"
                                }, void 0, false, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 910,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "btn-small btn-outline-small",
                                    onClick: ()=>setSelectedOrder(null),
                                    style: {
                                        padding: '10px 18px',
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        borderRadius: '8px',
                                        margin: 0
                                    },
                                    children: "Close Panel"
                                }, void 0, false, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 921,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/OrdersView.jsx",
                            lineNumber: 872,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/OrdersView.jsx",
                    lineNumber: 727,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/OrdersView.jsx",
                lineNumber: 726,
                columnNumber: 9
            }, this),
            selectedDeliveryModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "sheet-backdrop",
                onClick: ()=>setSelectedDeliveryModal(null),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "sheet-panel",
                    onClick: (e)=>e.stopPropagation(),
                    style: {
                        maxWidth: '640px',
                        padding: '28px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '20px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            style: {
                                                fontSize: '20px',
                                                fontWeight: '900',
                                                color: '#1e293b',
                                                margin: 0
                                            },
                                            children: "Delivery Details & Status"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 939,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: '13px',
                                                color: '#5E6B82',
                                                margin: '2px 0 0 0'
                                            },
                                            children: [
                                                "Order #",
                                                selectedDeliveryModal.orderNo || selectedDeliveryModal.id
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 940,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 938,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    status: "Delivered"
                                }, void 0, false, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 942,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/OrdersView.jsx",
                            lineNumber: 937,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                background: '#F5FAFE',
                                border: '1px solid #DCE5F0',
                                borderRadius: '14px',
                                padding: '18px',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '16px',
                                marginBottom: '20px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                color: '#5E6B82',
                                                textTransform: 'uppercase'
                                            },
                                            children: "Dispatch ID"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 947,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '14px',
                                                fontWeight: '800',
                                                color: '#334155',
                                                fontFamily: 'monospace',
                                                marginTop: '2px'
                                            },
                                            children: selectedDeliveryModal.dispatchId || `DSP-${String(selectedDeliveryModal.orderNo || selectedDeliveryModal.id || '').replace(/^ORD-/i, '').replace(/^WO-/i, '')}`
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 948,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 946,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                color: '#5E6B82',
                                                textTransform: 'uppercase'
                                            },
                                            children: "Vehicle Number"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 953,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '14px',
                                                fontWeight: '800',
                                                color: '#1d4ed8',
                                                fontFamily: 'monospace',
                                                marginTop: '2px'
                                            },
                                            children: selectedDeliveryModal.vehicleNumber || 'UK07AB1234'
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 954,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 952,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                color: '#5E6B82',
                                                textTransform: 'uppercase'
                                            },
                                            children: "Driver Details"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 959,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#1e293b',
                                                marginTop: '2px'
                                            },
                                            children: [
                                                selectedDeliveryModal.driverName || 'Raj Kumar',
                                                " (",
                                                selectedDeliveryModal.driverPhone || '9876543210',
                                                ")"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 960,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 958,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                color: '#5E6B82',
                                                textTransform: 'uppercase'
                                            },
                                            children: "Delivered Date"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 965,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#1e293b',
                                                marginTop: '2px'
                                            },
                                            children: selectedDeliveryModal.actualDeliveryDate || (selectedDeliveryModal.deliveredAt ? String(selectedDeliveryModal.deliveredAt).slice(0, 10) : '16 Jul 2026')
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 966,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 964,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                color: '#5E6B82',
                                                textTransform: 'uppercase'
                                            },
                                            children: "Received By"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 971,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '14px',
                                                fontWeight: '700',
                                                color: '#1e293b',
                                                marginTop: '2px'
                                            },
                                            children: selectedDeliveryModal.receivedBy || 'Project Engineer - Mr. Sharma'
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 972,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 970,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                color: '#5E6B82',
                                                textTransform: 'uppercase'
                                            },
                                            children: "Delivery Documents"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 977,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                color: '#059669',
                                                marginTop: '2px'
                                            },
                                            children: "Signed Challan, POD Stamped ✓"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 978,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 976,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/OrdersView.jsx",
                            lineNumber: 945,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '14px',
                                padding: '16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                color: '#1e40af',
                                                textTransform: 'uppercase'
                                            },
                                            children: "Payment Status"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 986,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '15px',
                                                fontWeight: '800',
                                                color: '#1e3a8a',
                                                marginTop: '2px'
                                            },
                                            children: selectedDeliveryModal.paymentStatus === 'paid' ? 'Full Payment Completed ✓' : selectedDeliveryModal.paymentStatus === 'submitted_for_verification' ? 'Submitted for Finance Verification' : 'Awaiting Payment'
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 987,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 985,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        textAlign: 'right'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                color: '#1e40af',
                                                textTransform: 'uppercase'
                                            },
                                            children: "Outstanding Amount"
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 992,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '18px',
                                                fontWeight: '900',
                                                color: '#dc2626',
                                                marginTop: '2px'
                                            },
                                            children: formatINR(selectedDeliveryModal.outstandingAmount !== undefined ? selectedDeliveryModal.outstandingAmount : selectedDeliveryModal.totalAmount || selectedDeliveryModal.totalValue || 207000)
                                        }, void 0, false, {
                                            fileName: "[project]/components/OrdersView.jsx",
                                            lineNumber: 993,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 991,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/OrdersView.jsx",
                            lineNumber: 984,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '10px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setSelectedDeliveryModal(null),
                                    style: {
                                        padding: '10px 20px',
                                        background: '#f1f5f9',
                                        border: '1px solid #D6E2F0',
                                        borderRadius: '10px',
                                        fontWeight: '700',
                                        color: '#475569',
                                        cursor: 'pointer'
                                    },
                                    children: "Close"
                                }, void 0, false, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 1000,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>{
                                        setSelectedDeliveryModal(null);
                                        navigate.push('/sales/payment-followup');
                                    },
                                    style: {
                                        padding: '10px 20px',
                                        background: '#2563eb',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: '800',
                                        color: '#ffffff',
                                        cursor: 'pointer'
                                    },
                                    children: "Proceed to Payment Follow-up →"
                                }, void 0, false, {
                                    fileName: "[project]/components/OrdersView.jsx",
                                    lineNumber: 1007,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/OrdersView.jsx",
                            lineNumber: 999,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/OrdersView.jsx",
                    lineNumber: 936,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/OrdersView.jsx",
                lineNumber: 935,
                columnNumber: 11
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$ReminderModal$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                open: !!reminderModal,
                onClose: ()=>setReminderModal(null),
                onSave: handleSaveReminder,
                customerName: reminderModal?.order?.customerName || reminderModal?.order?.customer?.name || '',
                title: reminderModal?.reminder ? 'Edit Order Reminder' : 'Order Reminder',
                initialValues: reminderModal?.reminder || null
            }, reminderModal?.reminder?.id || reminderModal?.order?.id || 'new', false, {
                fileName: "[project]/components/OrdersView.jsx",
                lineNumber: 1021,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/OrdersView.jsx",
        lineNumber: 331,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=components_OrdersView_jsx_22338531._.js.map