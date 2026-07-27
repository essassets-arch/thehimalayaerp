(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/PaymentFollowupERPView.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PaymentFollowupERPView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useMediaQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/useMediaQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.all.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/apiClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const PAYMENT_LABELS = {
    PAYMENT_PENDING: 'Awaiting Payment',
    PARTIALLY_PAID: 'Partial Paid',
    AWAITING_FINANCE_VERIFICATION: 'Payment Verification Pending',
    PAID: 'Paid',
    OVERDUE: 'Overdue',
    WAITING_FOR_DELIVERY: 'Waiting for Delivery'
};
const formatINR = (value)=>{
    const num = Number(value || 0);
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(num);
};
const isoDate = (d)=>{
    if (!d) return null;
    try {
        return new Date(d).toISOString().split('T')[0];
    } catch (e) {
        return null;
    }
};
const computeReminderStatus = (nextDate, currentStatus)=>{
    if (currentStatus === 'Completed') return 'Completed';
    if (!nextDate) return 'Upcoming';
    const today = new Date().toISOString().split('T')[0];
    if (nextDate < today) return 'Overdue';
    if (nextDate === today) return 'Today';
    return 'Upcoming';
};
function PaymentFollowupERPView(param) {
    let { orders = [] } = param;
    var _canonicalState_sales, _canonicalState_sales1, _canonicalState_sales2, _canonicalState_dispatch;
    _s();
    const navigate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const canonicalState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"])({
        "PaymentFollowupERPView.useERPStore[canonicalState]": (store)=>store.state
    }["PaymentFollowupERPView.useERPStore[canonicalState]"]);
    const canonicalOrders = (canonicalState === null || canonicalState === void 0 ? void 0 : (_canonicalState_sales = canonicalState.sales) === null || _canonicalState_sales === void 0 ? void 0 : _canonicalState_sales.orders) || [];
    const canonicalQuotations = (canonicalState === null || canonicalState === void 0 ? void 0 : (_canonicalState_sales1 = canonicalState.sales) === null || _canonicalState_sales1 === void 0 ? void 0 : _canonicalState_sales1.quotations) || [];
    const paymentConfirmations = (canonicalState === null || canonicalState === void 0 ? void 0 : (_canonicalState_sales2 = canonicalState.sales) === null || _canonicalState_sales2 === void 0 ? void 0 : _canonicalState_sales2.paymentConfirmations) || [];
    const consignments = (canonicalState === null || canonicalState === void 0 ? void 0 : (_canonicalState_dispatch = canonicalState.dispatch) === null || _canonicalState_dispatch === void 0 ? void 0 : _canonicalState_dispatch.consignments) || [];
    const isCompact = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useMediaQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMediaQuery"])('(max-width: 1024px)');
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all'); // all | reminders | overdue | completed
    const [agingFilter, setAgingFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [showAgingDropdown, setShowAgingDropdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pendingFilter, setPendingFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('pending'); // pending | confirmed
    const [pendingCollection, setPendingCollection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [followups, setFollowups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loadingPending, setLoadingPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [loadingFollowups, setLoadingFollowups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [reminderFilter, setReminderFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('All');
    const refreshPending = async ()=>{
        setLoadingPending(true);
        try {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get('/sales/orders/delivered/pending-payment');
            setPendingCollection((res === null || res === void 0 ? void 0 : res.success) ? res.data : []);
        } catch (err) {
            console.error(err);
            setPendingCollection([]);
        } finally{
            setLoadingPending(false);
        }
    };
    const refreshFollowups = async ()=>{
        setLoadingFollowups(true);
        try {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get('/sales/payment-followups');
            setFollowups((res === null || res === void 0 ? void 0 : res.success) ? res.data : []);
        } catch (err) {
            console.error(err);
            setFollowups([]);
        } finally{
            setLoadingFollowups(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PaymentFollowupERPView.useEffect": ()=>{
            refreshPending();
            refreshFollowups();
        }
    }["PaymentFollowupERPView.useEffect"], []);
    const completedOrders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PaymentFollowupERPView.useMemo[completedOrders]": ()=>{
            const delivered = (orders || []).filter({
                "PaymentFollowupERPView.useMemo[completedOrders].delivered": (o)=>{
                    const st = String(o.orderStatus || o.status || o.workflowStatus || o.overallStage || '').trim().toUpperCase();
                    const dispatchSt = String(o.dispatchStatus || '').toUpperCase();
                    return [
                        'DELIVERED',
                        'INVOICED',
                        'PAYMENT_PENDING',
                        'PAYMENT COMPLETED',
                        'PARTIALLY PAID',
                        'COMPLETED',
                        'CLOSED'
                    ].includes(st) || dispatchSt === 'DELIVERED' || Boolean((o === null || o === void 0 ? void 0 : o.deliveredDate) || (o === null || o === void 0 ? void 0 : o.deliveredAt));
                }
            }["PaymentFollowupERPView.useMemo[completedOrders].delivered"]);
            return delivered.filter({
                "PaymentFollowupERPView.useMemo[completedOrders]": (o)=>{
                    var _o_payment, _o_payment1;
                    const paySt = String(o.paymentStatus || '').toUpperCase();
                    const total = Number(o.totalAmount || o.totalValue || o.grandTotal || 0);
                    const paid = Number(o.verifiedPaidAmount || ((_o_payment = o.payment) === null || _o_payment === void 0 ? void 0 : _o_payment.paidAmount) || ((_o_payment1 = o.payment) === null || _o_payment1 === void 0 ? void 0 : _o_payment1.paid) || 0);
                    const bal = o.balanceAmount !== undefined ? Number(o.balanceAmount) : Math.max(0, total - paid);
                    return paySt === 'PAID' || bal <= 0 && total > 0;
                }
            }["PaymentFollowupERPView.useMemo[completedOrders]"]);
        }
    }["PaymentFollowupERPView.useMemo[completedOrders]"], [
        orders
    ]);
    const openAddFollowup = async (order)=>{
        const today = new Date().toISOString().split('T')[0];
        var _order_balance_amount;
        const { value: formValues } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Add Follow-up',
            html: '\n        <div style="text-align:left; display:flex; flex-direction:column; gap:12px;">\n          <div style="display:grid; grid-template-columns:110px 1fr; gap:8px; font-size:13px;">\n            <span><strong>Customer</strong></span><span>'.concat(order.customer_name || 'N/A', '</span>\n            <span><strong>Order</strong></span><span style="font-family:monospace;">').concat(order.order_number || "ORD-".concat(order.id), '</span>\n            <span><strong>Balance</strong></span><span style="color:#ef4444; font-weight:800;">').concat(formatINR((_order_balance_amount = order.balance_amount) !== null && _order_balance_amount !== void 0 ? _order_balance_amount : Number(order.grand_total || 0) - Number(order.verified_paid_amount || 0)), '</span>\n          </div>\n          <div>\n            <label style="display:block; font-weight:800; font-size:11px; text-transform:uppercase; color:var(--color-text-secondary); margin-bottom:6px;">Conversation</label>\n            <textarea id="pf-note" style="width:100%; min-height:90px; padding:10px; border:1px solid var(--color-border); border-radius:10px; font-size:13px;" placeholder="e.g. Spoke to accounts, promised payment on Friday..."></textarea>\n          </div>\n          <div>\n            <label style="display:block; font-weight:800; font-size:11px; text-transform:uppercase; color:var(--color-text-secondary); margin-bottom:6px;">Next Reminder Date</label>\n            <input id="pf-next" type="date" value="').concat(today, '" style="width:100%; height:40px; padding:0 10px; border:1px solid var(--color-border); border-radius:10px; font-size:13px;" />\n          </div>\n        </div>\n      '),
            showCancelButton: true,
            confirmButtonText: 'Save',
            cancelButtonText: 'Cancel',
            preConfirm: ()=>{
                const note = document.getElementById('pf-note').value.trim();
                const nextDate = document.getElementById('pf-next').value || null;
                if (!note) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].showValidationMessage('Follow-up note is required.');
                    return false;
                }
                return {
                    note,
                    nextDate
                };
            }
        });
        if (!formValues) return;
        try {
            const status = computeReminderStatus(formValues.nextDate, 'Upcoming');
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post("/sales/orders/".concat(order.id, "/payment-followups"), {
                followup_note: formValues.note,
                next_reminder_date: formValues.nextDate,
                status
            });
            await Promise.all([
                refreshFollowups(),
                refreshPending()
            ]);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'success',
                title: 'Follow-up saved',
                timer: 1200,
                showConfirmButton: false
            });
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'error',
                title: 'Save failed',
                text: (err === null || err === void 0 ? void 0 : err.message) || 'Could not save follow-up.'
            });
        }
    };
    const openViewPaymentHistory = async (order)=>{
        try {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/payment-verification/order/".concat(order.id, "/history"));
            if (!(res === null || res === void 0 ? void 0 : res.success) || !res.data || res.data.length === 0) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    icon: 'info',
                    title: 'Payment History',
                    text: 'No verified payments found.'
                });
                return;
            }
            const rowsHtml = res.data.map((p)=>'\n        <tr style="border-bottom: 1px solid #DCE5F0;">\n          <td style="padding: 10px; font-family: monospace;">'.concat(p.request_number || 'N/A', '</td>\n          <td style="padding: 10px; font-weight: bold; color: ').concat(p.status === 'VERIFIED' ? '#16a34a' : p.status === 'REJECTED' ? '#dc2626' : '#d97706', '">\n            ').concat(p.status, '\n          </td>\n          <td style="padding: 10px; text-align: right;">').concat(formatINR(p.payment_amount), '</td>\n          <td style="padding: 10px;">').concat(p.payment_mode || 'N/A', '</td>\n          <td style="padding: 10px; font-size: 11px;">').concat(p.verification_notes || p.remarks || '-', "</td>\n        </tr>\n      ")).join('');
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                title: "Payment History — ".concat(order.order_number),
                width: 700,
                html: '\n          <div style="text-align: left; font-size: 13px; width: 100%;">\n            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">\n              <thead>\n                <tr style="border-bottom: 2px solid #D6E2F0; font-weight: bold; text-align: left; background: #F5FAFE;">\n                  <th style="padding: 10px;">Req No</th>\n                  <th style="padding: 10px;">Status</th>\n                  <th style="padding: 10px; text-align: right;">Amount</th>\n                  <th style="padding: 10px;">Mode</th>\n                  <th style="padding: 10px;">Remarks/Notes</th>\n                </tr>\n              </thead>\n              <tbody>\n                '.concat(rowsHtml, "\n              </tbody>\n            </table>\n          </div>\n        "),
                confirmButtonText: 'Close',
                customClass: {
                    popup: 'swal-premium-popup',
                    title: 'swal-premium-title',
                    confirmButton: 'swal-premium-confirm-btn'
                },
                buttonsStyling: false
            });
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load payment history.'
            });
        }
    };
    const openConfirmPayment = async (order)=>{
        const total = Number(order.grand_total || 0);
        const verified = Number(order.verified_paid_amount || 0);
        const remaining = Math.max(0, total - verified);
        const { value: formValues } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Record Client Payment Collection',
            width: 650,
            html: '\n        <div style="text-align:left; display:flex; flex-direction:column; gap:14px;">\n          <div style="display:grid; grid-template-columns:140px 1fr; gap:8px; font-size:13px;">\n            <span><strong>Customer</strong></span><span>'.concat(order.customer_name || 'N/A', '</span>\n            <span><strong>Order No</strong></span><span style="font-family:monospace;">').concat(order.order_number || "ORD-".concat(order.id), "</span>\n            <span><strong>Total Order</strong></span><span>").concat(formatINR(total), '</span>\n            <span><strong>Verified Paid</strong></span><span style="color:#10b981; font-weight:800;">').concat(formatINR(verified), '</span>\n            <span><strong>Remaining Balance</strong></span><span style="color:#ef4444; font-weight:900;">').concat(formatINR(remaining), '</span>\n          </div>\n\n          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">\n            <div>\n              <label style="display:block; font-weight:800; font-size:11px; text-transform:uppercase; color:var(--color-text-secondary); margin-bottom:6px;">Amount Received *</label>\n              <input id="pc-amount" type="number" min="1" step="0.01" value="').concat(remaining, '" style="width:100%; height:40px; padding:0 10px; border:1px solid var(--color-border); border-radius:10px; font-size:13px;" />\n            </div>\n            <div>\n              <label style="display:block; font-weight:800; font-size:11px; text-transform:uppercase; color:var(--color-text-secondary); margin-bottom:6px;">Receipt Upload *</label>\n              <input id="pc-file" type="file" accept=".jpg,.jpeg,.png,.pdf" style="width:100%; height:40px; padding:6px 0; font-size:13px;" />\n            </div>\n          </div>\n\n          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">\n            <div>\n              <label style="display:block; font-weight:800; font-size:11px; text-transform:uppercase; color:var(--color-text-secondary); margin-bottom:6px;">Payment Mode *</label>\n              <select id="pc-mode" style="width:100%; height:40px; padding:0 10px; border:1px solid var(--color-border); border-radius:10px; font-size:13px;">\n                <option value="NEFT">NEFT</option>\n                <option value="RTGS">RTGS</option>\n                <option value="IMPS">IMPS</option>\n                <option value="UPI">UPI</option>\n                <option value="Cheque">Cheque</option>\n                <option value="Cash">Cash</option>\n              </select>\n            </div>\n            <div>\n              <label style="display:block; font-weight:800; font-size:11px; text-transform:uppercase; color:var(--color-text-secondary); margin-bottom:6px;">Transaction Reference</label>\n              <input id="pc-ref" type="text" placeholder="UTR or Txn ID" style="width:100%; height:40px; padding:0 10px; border:1px solid var(--color-border); border-radius:10px; font-size:13px;" />\n            </div>\n          </div>\n\n          <div>\n            <label style="display:block; font-weight:800; font-size:11px; text-transform:uppercase; color:var(--color-text-secondary); margin-bottom:6px;">Remarks</label>\n            <textarea id="pc-remarks" placeholder="Optional notes…" style="width:100%; min-height:70px; padding:10px; border:1px solid var(--color-border); border-radius:10px; font-size:13px;"></textarea>\n          </div>\n        </div>\n      '),
            showCancelButton: true,
            confirmButtonText: 'Submit Request',
            cancelButtonText: 'Cancel',
            focusConfirm: false,
            preConfirm: ()=>{
                var _fileEl_files;
                const amount = Number(document.getElementById('pc-amount').value || 0);
                const mode = document.getElementById('pc-mode').value;
                const ref = document.getElementById('pc-ref').value.trim();
                const remarks = document.getElementById('pc-remarks').value.trim();
                const fileEl = document.getElementById('pc-file');
                const file = fileEl === null || fileEl === void 0 ? void 0 : (_fileEl_files = fileEl.files) === null || _fileEl_files === void 0 ? void 0 : _fileEl_files[0];
                if (!amount || amount <= 0) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].showValidationMessage('Amount Received is required.');
                    return false;
                }
                if (amount > remaining) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].showValidationMessage('Amount cannot exceed remaining balance.');
                    return false;
                }
                if (!mode) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].showValidationMessage('Payment Mode is required.');
                    return false;
                }
                if (!file) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].showValidationMessage('Receipt upload is required.');
                    return false;
                }
                return {
                    amount,
                    mode,
                    ref,
                    remarks,
                    file
                };
            }
        });
        if (!formValues) return;
        try {
            const uniqueRef = formValues.ref || "TXN-".concat(order.id || order.order_number || 'ORD', "-").concat(Date.now().toString().slice(-4));
            const orderId = order.id || order.order_number || order.orderNo;
            __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().recordSalesPayment(orderId, {
                amount: formValues.amount,
                method: formValues.mode,
                paymentMode: formValues.mode,
                transactionReference: uniqueRef,
                referenceNumber: uniqueRef,
                paymentDate: new Date().toISOString().split('T')[0],
                remarks: formValues.remarks || "Sales collected payment for ".concat(order.id || order.order_number || 'Order')
            }, 'Sales User');
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'success',
                title: 'Payment Collection Submitted!',
                html: '<div style="font-size:14px; text-align:center;">\n          <p style="margin-bottom:8px;">Payment of <strong>'.concat(formatINR(formValues.amount), '</strong> recorded successfully.</p>\n          <span style="background:#fef3c7; color:#92400e; padding:4px 12px; border-radius:6px; font-weight:700; font-size:12px;">Status: Sent to Finance Verification</span>\n        </div>'),
                timer: 3000,
                showConfirmButton: false
            });
            await Promise.all([
                refreshPending(),
                refreshFollowups()
            ]);
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'error',
                title: 'Submission Failed',
                text: (err === null || err === void 0 ? void 0 : err.message) || 'Failed to record payment collection.'
            });
        }
    };
    const remindersWithComputed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PaymentFollowupERPView.useMemo[remindersWithComputed]": ()=>{
            return (followups || []).map({
                "PaymentFollowupERPView.useMemo[remindersWithComputed]": (f)=>({
                        ...f,
                        reminder_date: f.next_reminder_date ? isoDate(f.next_reminder_date) : null,
                        computed_status: computeReminderStatus(isoDate(f.next_reminder_date), f.status)
                    })
            }["PaymentFollowupERPView.useMemo[remindersWithComputed]"]);
        }
    }["PaymentFollowupERPView.useMemo[remindersWithComputed]"], [
        followups
    ]);
    const filteredReminders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PaymentFollowupERPView.useMemo[filteredReminders]": ()=>{
            const today = new Date().toISOString().split('T')[0];
            const startOfWeek = ({
                "PaymentFollowupERPView.useMemo[filteredReminders].startOfWeek": ()=>{
                    const d = new Date();
                    const day = d.getDay(); // 0 sunday
                    const diff = day === 0 ? 6 : day - 1;
                    d.setDate(d.getDate() - diff);
                    return d.toISOString().split('T')[0];
                }
            })["PaymentFollowupERPView.useMemo[filteredReminders].startOfWeek"]();
            const endOfWeek = ({
                "PaymentFollowupERPView.useMemo[filteredReminders].endOfWeek": ()=>{
                    const d = new Date(startOfWeek);
                    d.setDate(d.getDate() + 6);
                    return d.toISOString().split('T')[0];
                }
            })["PaymentFollowupERPView.useMemo[filteredReminders].endOfWeek"]();
            const tomorrow = ({
                "PaymentFollowupERPView.useMemo[filteredReminders].tomorrow": ()=>{
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    return d.toISOString().split('T')[0];
                }
            })["PaymentFollowupERPView.useMemo[filteredReminders].tomorrow"]();
            return remindersWithComputed.filter({
                "PaymentFollowupERPView.useMemo[filteredReminders]": (r)=>{
                    if (reminderFilter === 'All') return true;
                    if (reminderFilter === 'Today') return r.reminder_date === today;
                    if (reminderFilter === 'Tomorrow') return r.reminder_date === tomorrow;
                    if (reminderFilter === 'This Week') return r.reminder_date && r.reminder_date >= startOfWeek && r.reminder_date <= endOfWeek;
                    if (reminderFilter === 'Overdue') return r.computed_status === 'Overdue';
                    if (reminderFilter === 'Upcoming') return r.computed_status === 'Upcoming';
                    return true;
                }
            }["PaymentFollowupERPView.useMemo[filteredReminders]"]);
        }
    }["PaymentFollowupERPView.useMemo[filteredReminders]"], [
        remindersWithComputed,
        reminderFilter
    ]);
    const updateReminder = async function(followupId, updates) {
        let successText = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 'Reminder updated';
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].patch("/sales/payment-followups/".concat(followupId), updates);
            await Promise.all([
                refreshFollowups(),
                refreshPending()
            ]);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'success',
                title: successText,
                timer: 1100,
                showConfirmButton: false
            });
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'error',
                title: 'Update failed',
                text: (err === null || err === void 0 ? void 0 : err.message) || 'Could not update reminder.'
            });
        }
    };
    const deleteReminder = async (followupId)=>{
        const confirm = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Delete reminder?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel'
        });
        if (!confirm.isConfirmed) return;
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].delete("/sales/payment-followups/".concat(followupId));
            await Promise.all([
                refreshFollowups(),
                refreshPending()
            ]);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'success',
                title: 'Deleted',
                timer: 1000,
                showConfirmButton: false
            });
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                icon: 'error',
                title: 'Delete failed',
                text: (err === null || err === void 0 ? void 0 : err.message) || 'Could not delete reminder.'
            });
        }
    };
    const callDoneReminder = async (r)=>{
        const { value: note } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Call Done',
            input: 'textarea',
            inputLabel: 'Conversation update',
            inputPlaceholder: 'What was discussed in the call?',
            inputValue: r.followup_note || '',
            showCancelButton: true,
            confirmButtonText: 'Save Call Update',
            cancelButtonText: 'Cancel'
        });
        if (note === undefined) return;
        await updateReminder(r.id, {
            followup_note: String(note || '').trim() || r.followup_note,
            status: computeReminderStatus(r.reminder_date, 'Upcoming')
        }, 'Call update saved');
    };
    const pendingRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PaymentFollowupERPView.useMemo[pendingRows]": ()=>{
            const apiRows = pendingCollection || [];
            // API/legacy records are fallbacks; canonical Zustand orders must win deduplication.
            const allCandidates = [
                ...apiRows,
                ...orders || [],
                ...canonicalOrders
            ];
            const map = new Map();
            allCandidates.forEach({
                "PaymentFollowupERPView.useMemo[pendingRows]": (o)=>{
                    var _o_payment, _o_payment1, _o_customer;
                    const st = String(o.orderStatus || o.status || o.workflowStatus || o.overallStage || '').trim().toUpperCase();
                    const dispatchSt = String(o.dispatchStatus || '').toUpperCase();
                    const isDelivered = [
                        'DELIVERED',
                        'INVOICED',
                        'PAYMENT_PENDING',
                        'PAYMENT COMPLETED',
                        'PARTIALLY PAID',
                        'COMPLETED',
                        'CLOSED'
                    ].includes(st) || dispatchSt === 'DELIVERED' || Boolean((o === null || o === void 0 ? void 0 : o.deliveredDate) || (o === null || o === void 0 ? void 0 : o.deliveredAt) || (o === null || o === void 0 ? void 0 : o.delivered_at));
                    if (!isDelivered) return;
                    const paySt = String(o.paymentStatus || o.payment_status || '').trim().toUpperCase();
                    const total = Number(o.grand_total || o.totalAmount || o.totalValue || o.grandTotal || 0);
                    const paid = Number(o.verified_paid_amount || o.verifiedPaidAmount || ((_o_payment = o.payment) === null || _o_payment === void 0 ? void 0 : _o_payment.paidAmount) || ((_o_payment1 = o.payment) === null || _o_payment1 === void 0 ? void 0 : _o_payment1.paid) || 0);
                    const bal = o.balance_amount !== undefined ? Number(o.balance_amount) : o.balanceAmount !== undefined ? Number(o.balanceAmount) : Math.max(0, total - paid);
                    if (paySt === 'PAID' || bal <= 0 && total > 0) return;
                    const orderNo = o.order_number || o.orderNo || o.id;
                    if (!orderNo) return;
                    const quotation = canonicalQuotations.find({
                        "PaymentFollowupERPView.useMemo[pendingRows].quotation": (q)=>String(q.id) === String(o.quotationId || o.quotation_id)
                    }["PaymentFollowupERPView.useMemo[pendingRows].quotation"]);
                    const consignment = consignments.find({
                        "PaymentFollowupERPView.useMemo[pendingRows].consignment": (c)=>String(c.orderId) === String(o.id) || String(c.orderId) === String(orderNo)
                    }["PaymentFollowupERPView.useMemo[pendingRows].consignment"]);
                    const confirmations = paymentConfirmations.filter({
                        "PaymentFollowupERPView.useMemo[pendingRows].confirmations": (p)=>String(p.orderId) === String(o.id) || String(p.orderId) === String(orderNo)
                    }["PaymentFollowupERPView.useMemo[pendingRows].confirmations"]);
                    const verifiedFromConfirmations = confirmations.filter({
                        "PaymentFollowupERPView.useMemo[pendingRows].verifiedFromConfirmations": (p)=>[
                                'FINANCE_VERIFIED',
                                'VERIFIED'
                            ].includes(String(p.status || '').toUpperCase())
                    }["PaymentFollowupERPView.useMemo[pendingRows].verifiedFromConfirmations"]).reduce({
                        "PaymentFollowupERPView.useMemo[pendingRows].verifiedFromConfirmations": (sum, p)=>sum + Number(p.amount || 0)
                    }["PaymentFollowupERPView.useMemo[pendingRows].verifiedFromConfirmations"], 0);
                    const hasPendingConfirmation = confirmations.some({
                        "PaymentFollowupERPView.useMemo[pendingRows].hasPendingConfirmation": (p)=>[
                                'FINANCE_VERIFICATION_PENDING',
                                'PENDING',
                                'SUBMITTED_FOR_VERIFICATION'
                            ].includes(String(p.status || '').toUpperCase())
                    }["PaymentFollowupERPView.useMemo[pendingRows].hasPendingConfirmation"]);
                    var _consignment_payableAmount;
                    const resolvedTotal = Number((_consignment_payableAmount = consignment === null || consignment === void 0 ? void 0 : consignment.payableAmount) !== null && _consignment_payableAmount !== void 0 ? _consignment_payableAmount : total) || total;
                    const resolvedPaid = Math.max(paid, verifiedFromConfirmations);
                    const resolvedBalance = Math.max(0, resolvedTotal - resolvedPaid);
                    const deliveredAt = (consignment === null || consignment === void 0 ? void 0 : consignment.deliveredAt) || o.delivered_at || o.deliveredAt || o.actualDeliveryDate || o.deliveredDate;
                    const invoiceDate = o.invoiceDate || o.invoice_date || deliveredAt || o.createdAt || o.created_at;
                    var _o_paymentTermDays, _ref, _ref1;
                    const paymentTermDays = Number((_ref1 = (_ref = (_o_paymentTermDays = o.paymentTermDays) !== null && _o_paymentTermDays !== void 0 ? _o_paymentTermDays : o.payment_terms_days) !== null && _ref !== void 0 ? _ref : quotation === null || quotation === void 0 ? void 0 : quotation.paymentTermDays) !== null && _ref1 !== void 0 ? _ref1 : 15) || 15;
                    const dueDateValue = o.paymentDueDate || o.payment_due_date || ({
                        "PaymentFollowupERPView.useMemo[pendingRows]": ()=>{
                            if (!invoiceDate) return null;
                            const date = new Date(invoiceDate);
                            date.setDate(date.getDate() + paymentTermDays);
                            return date.toISOString();
                        }
                    })["PaymentFollowupERPView.useMemo[pendingRows]"]();
                    const remainingDays = dueDateValue ? Math.ceil((new Date(dueDateValue).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000) : null;
                    const resolvedPaymentStatus = hasPendingConfirmation ? 'AWAITING_FINANCE_VERIFICATION' : resolvedPaid >= resolvedTotal && resolvedTotal > 0 ? 'PAID' : resolvedPaid > 0 ? 'PARTIALLY_PAID' : deliveredAt ? 'PAYMENT_PENDING' : 'WAITING_FOR_DELIVERY';
                    const normalized = {
                        id: o.id || orderNo,
                        order_number: orderNo,
                        customer_name: o.customer_name || o.customerName || ((_o_customer = o.customer) === null || _o_customer === void 0 ? void 0 : _o_customer.name) || 'ABC Infrastructure Pvt Ltd',
                        grand_total: resolvedTotal,
                        invoice_number: o.invoiceNo || o.invoice_number || "INV-".concat(String(orderNo).replace(/^ORD-/, '').slice(-6)),
                        salesperson: o.salesperson || o.salesPerson || (quotation === null || quotation === void 0 ? void 0 : quotation.salesperson) || 'Sales',
                        verified_paid_amount: resolvedPaid,
                        balance_amount: resolvedBalance,
                        payment_status: resolvedPaymentStatus,
                        delivered_at: deliveredAt,
                        invoice_date: invoiceDate,
                        payment_terms: "".concat(paymentTermDays, " Days"),
                        payment_due_date: dueDateValue,
                        remaining_days: remainingDays,
                        reminder_label: remainingDays === null ? 'Not scheduled' : remainingDays < 0 ? "Overdue by ".concat(Math.abs(remainingDays), " Days") : "Due in ".concat(remainingDays, " Days"),
                        latest_pv_status: o.latest_pv_status || o.latestPvStatus,
                        latest_pv_notes: o.latest_pv_notes || o.latestPvNotes
                    };
                    map.set(String(orderNo).toLowerCase(), normalized);
                }
            }["PaymentFollowupERPView.useMemo[pendingRows]"]);
            const rows = Array.from(map.values());
            let finalRows = rows;
            if (activeTab === 'overdue' && agingFilter) {
                finalRows = rows.filter({
                    "PaymentFollowupERPView.useMemo[pendingRows]": (o)=>{
                        if (!o.delivered_at && !o.deliveredAt) return false;
                        const d = o.delivered_at || o.deliveredAt;
                        const days = Math.floor((new Date() - new Date(d)) / (1000 * 60 * 60 * 24));
                        if (agingFilter.includes('20-30') || agingFilter.includes('20–30')) return days >= 20 && days <= 30;
                        if (agingFilter.includes('30-45') || agingFilter.includes('30–45')) return days > 30 && days <= 45;
                        if (agingFilter.includes('45-60') || agingFilter.includes('45–60')) return days > 45 && days <= 60;
                        if (agingFilter.includes('60-90') || agingFilter.includes('60–90')) return days > 60 && days <= 90;
                        if (agingFilter.includes('90+')) return days > 90;
                        return false;
                    }
                }["PaymentFollowupERPView.useMemo[pendingRows]"]);
            } else if (activeTab === 'all' && pendingFilter === 'confirmed') {
                finalRows = rows.filter({
                    "PaymentFollowupERPView.useMemo[pendingRows]": (o)=>String(o.payment_status || '').toUpperCase() === 'AWAITING_FINANCE_VERIFICATION' || String(o.payment_status || '').toLowerCase() === 'submitted_for_verification'
                }["PaymentFollowupERPView.useMemo[pendingRows]"]);
            } else {
                finalRows = rows.filter({
                    "PaymentFollowupERPView.useMemo[pendingRows]": (o)=>String(o.payment_status || '').toUpperCase() !== 'AWAITING_FINANCE_VERIFICATION' && String(o.payment_status || '').toLowerCase() !== 'submitted_for_verification'
                }["PaymentFollowupERPView.useMemo[pendingRows]"]);
            }
            return finalRows;
        }
    }["PaymentFollowupERPView.useMemo[pendingRows]"], [
        pendingCollection,
        orders,
        canonicalOrders,
        canonicalQuotations,
        consignments,
        paymentConfirmations,
        pendingFilter,
        activeTab,
        agingFilter
    ]);
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
                        children: "Sales Payment Follow-up"
                    }, void 0, false, {
                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                        lineNumber: 540,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "module-actions",
                        style: {
                            width: isCompact ? '100%' : 'auto'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                background: '#ffffff',
                                border: '1px solid var(--color-border)',
                                width: isCompact ? '100%' : 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '4px',
                                borderRadius: '30px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "filter-pill ".concat(activeTab === 'all' ? 'active' : ''),
                                    onClick: ()=>{
                                        setActiveTab('all');
                                        setAgingFilter('');
                                    },
                                    style: {
                                        color: activeTab === 'all' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                                    },
                                    children: "All"
                                }, void 0, false, {
                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                    lineNumber: 543,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "filter-pill ".concat(activeTab === 'reminders' ? 'active' : ''),
                                    onClick: ()=>{
                                        setActiveTab('reminders');
                                        setAgingFilter('');
                                    },
                                    style: {
                                        color: activeTab === 'reminders' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                                    },
                                    children: "Reminders"
                                }, void 0, false, {
                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                    lineNumber: 550,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        position: 'relative',
                                        display: 'inline-block'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "filter-pill ".concat(activeTab === 'overdue' ? 'active' : ''),
                                            onClick: ()=>setShowAgingDropdown(!showAgingDropdown),
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                color: activeTab === 'overdue' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                                            },
                                            children: [
                                                agingFilter ? agingFilter : 'Overdue Aging',
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: 10
                                                    },
                                                    children: "▼"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 564,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                            lineNumber: 558,
                                            columnNumber: 15
                                        }, this),
                                        showAgingDropdown && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                marginTop: 8,
                                                background: '#fff',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: 12,
                                                padding: '8px 0',
                                                minWidth: 200,
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                                zIndex: 100
                                            },
                                            children: [
                                                '20-30 Days Overdue',
                                                '30-45 Days Overdue',
                                                '45-60 Days Overdue',
                                                '60-90 Days Overdue',
                                                '90+ Days Overdue'
                                            ].map((opt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        padding: '8px 16px',
                                                        fontSize: 13,
                                                        cursor: 'pointer',
                                                        background: agingFilter === opt ? '#F5FAFE' : 'transparent',
                                                        color: agingFilter === opt ? 'var(--color-primary)' : 'var(--color-text-primary)',
                                                        whiteSpace: 'nowrap'
                                                    },
                                                    onClick: ()=>{
                                                        setAgingFilter(opt);
                                                        setActiveTab('overdue');
                                                        setShowAgingDropdown(false);
                                                    },
                                                    onMouseEnter: (e)=>e.currentTarget.style.background = '#F5FAFE',
                                                    onMouseLeave: (e)=>e.currentTarget.style.background = agingFilter === opt ? '#F5FAFE' : 'transparent',
                                                    children: opt
                                                }, opt, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 570,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                            lineNumber: 568,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                    lineNumber: 557,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/PaymentFollowupERPView.jsx",
                            lineNumber: 542,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                        lineNumber: 541,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                lineNumber: 539,
                columnNumber: 7
            }, this),
            (activeTab === 'all' || activeTab === 'overdue') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 12
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 12,
                            flexWrap: 'wrap',
                            marginBottom: 10
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "tab-filters-row",
                                style: {
                                    background: '#f1f3f5'
                                },
                                children: [
                                    {
                                        id: 'pending',
                                        label: 'Pending Payment'
                                    },
                                    {
                                        id: 'confirmed',
                                        label: 'Confirmed (Verification Pending)'
                                    }
                                ].map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "filter-pill ".concat(pendingFilter === f.id ? 'active' : ''),
                                        onClick: ()=>setPendingFilter(f.id),
                                        style: {
                                            color: pendingFilter === f.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                                        },
                                        children: f.label
                                    }, f.id, false, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 598,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                lineNumber: 593,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn-small btn-outline-small",
                                onClick: refreshPending,
                                children: "Refresh"
                            }, void 0, false, {
                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                lineNumber: 608,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                        lineNumber: 592,
                        columnNumber: 11
                    }, this),
                    loadingPending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: 20,
                            color: 'var(--color-text-secondary)'
                        },
                        children: "Loading…"
                    }, void 0, false, {
                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                        lineNumber: 612,
                        columnNumber: 13
                    }, this) : isCompact ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'grid',
                            gap: 10
                        },
                        children: pendingRows.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                textAlign: 'center',
                                padding: 20,
                                color: 'var(--color-text-muted)'
                            },
                            children: "No pending collections."
                        }, void 0, false, {
                            fileName: "[project]/components/PaymentFollowupERPView.jsx",
                            lineNumber: 616,
                            columnNumber: 17
                        }, this) : pendingRows.map((o)=>{
                            const total = Number(o.grand_total || 0);
                            const paid = Number(o.verified_paid_amount || 0);
                            const bal = o.balance_amount !== undefined ? Number(o.balance_amount || 0) : Math.max(0, total - paid);
                            const paymentKey = String(o.payment_status || '').toUpperCase();
                            const nextFU = (()=>{
                                const rows = remindersWithComputed.filter((r)=>String(r.order_id) === String(o.id) && r.status !== 'Completed');
                                const next = rows.sort((a, b)=>String(a.reminder_date || '9999-12-31').localeCompare(String(b.reminder_date || '9999-12-31')))[0];
                                return (next === null || next === void 0 ? void 0 : next.reminder_date) || '-';
                            })();
                            const lastRemark = (()=>{
                                const rows = remindersWithComputed.filter((r)=>String(r.order_id) === String(o.id));
                                const last = rows.sort((a, b)=>new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                                return (last === null || last === void 0 ? void 0 : last.followup_note) ? '"'.concat(String(last.followup_note).slice(0, 80)).concat(String(last.followup_note).length > 80 ? '…' : '', '"') : '-';
                            })();
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 10,
                                    padding: 12,
                                    background: 'var(--color-bg-primary)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            gap: 8,
                                            marginBottom: 6
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    fontFamily: 'monospace'
                                                },
                                                children: o.order_number
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 636,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    color: '#ef4444',
                                                    fontWeight: 900
                                                },
                                                children: formatINR(bal)
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 637,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 635,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            fontSize: 13,
                                            color: 'var(--color-text-secondary)'
                                        },
                                        children: o.customer_name
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 639,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 6,
                                            fontSize: 12
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "Total: ",
                                                    formatINR(total),
                                                    " | "
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 641,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    color: '#10b981'
                                                },
                                                children: [
                                                    "Paid: ",
                                                    formatINR(paid)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 642,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 640,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 4,
                                            fontSize: 12
                                        },
                                        children: [
                                            "Next: ",
                                            nextFU
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 644,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 4,
                                            fontSize: 12,
                                            color: 'var(--color-text-secondary)',
                                            fontStyle: 'italic'
                                        },
                                        children: lastRemark
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 645,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 10,
                                            display: 'flex',
                                            gap: 8,
                                            flexWrap: 'wrap'
                                        },
                                        children: paymentKey === 'AWAITING_FINANCE_VERIFICATION' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontWeight: 800,
                                                color: '#d97706'
                                            },
                                            children: "⏳ Verification Pending"
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                            lineNumber: 648,
                                            columnNumber: 27
                                        }, this) : paymentKey === 'PAID' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "btn-small btn-outline-small",
                                            onClick: ()=>openViewPaymentHistory(o),
                                            children: "View Payment"
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                            lineNumber: 650,
                                            columnNumber: 27
                                        }, this) : paymentKey === 'PARTIALLY_PAID' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "btn-small btn-primary-small",
                                                    onClick: ()=>openConfirmPayment(o),
                                                    children: "Confirm Remaining Payment"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 653,
                                                    columnNumber: 29
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "btn-small btn-outline-small",
                                                    onClick: ()=>openViewPaymentHistory(o),
                                                    children: "View History"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 654,
                                                    columnNumber: 29
                                                }, this)
                                            ]
                                        }, void 0, true) : o.latest_pv_status === 'REJECTED' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: 11,
                                                        color: '#dc2626',
                                                        fontWeight: 700
                                                    },
                                                    children: [
                                                        "Rejected",
                                                        o.latest_pv_notes ? " (Reason: ".concat(o.latest_pv_notes, ")") : ''
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 658,
                                                    columnNumber: 29
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "btn-small btn-primary-small",
                                                    onClick: ()=>openConfirmPayment(o),
                                                    children: "Confirm Payment"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 659,
                                                    columnNumber: 29
                                                }, this)
                                            ]
                                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "btn-small btn-primary-small",
                                                    onClick: ()=>openConfirmPayment(o),
                                                    children: "Confirm Payment"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 663,
                                                    columnNumber: 29
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "btn-small btn-outline-small",
                                                    onClick: ()=>openAddFollowup(o),
                                                    children: "Add Follow-up"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 664,
                                                    columnNumber: 29
                                                }, this)
                                            ]
                                        }, void 0, true)
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 646,
                                        columnNumber: 23
                                    }, this)
                                ]
                            }, o.id, true, {
                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                lineNumber: 634,
                                columnNumber: 21
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                        lineNumber: 614,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "crm-table-container",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "crm-table responsive-table",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Order ID"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 678,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Invoice No"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 679,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Customer"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 680,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Salesperson"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 681,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Delivery Date"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 682,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Invoice Date"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 683,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Payment Terms"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 684,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Payment Due Date"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 685,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Remaining Days"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 686,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Total Amount"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 687,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Paid Amount"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 688,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Pending Amount"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 689,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Status"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 690,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Reminder"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 691,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Action"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 692,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 677,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                    lineNumber: 676,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: pendingRows.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            colSpan: "15",
                                            style: {
                                                textAlign: 'center',
                                                padding: 28,
                                                color: 'var(--color-text-muted)'
                                            },
                                            children: "No pending collections."
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                            lineNumber: 697,
                                            columnNumber: 25
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 697,
                                        columnNumber: 21
                                    }, this) : pendingRows.map((o)=>{
                                        const total = Number(o.grand_total || 0);
                                        const paid = Number(o.verified_paid_amount || 0);
                                        const bal = o.balance_amount !== undefined ? Number(o.balance_amount || 0) : Math.max(0, total - paid);
                                        const paymentKey = String(o.payment_status || '').toUpperCase();
                                        const paymentLabel = PAYMENT_LABELS[paymentKey] || 'Awaiting Payment';
                                        const nextFU = (()=>{
                                            const rows = remindersWithComputed.filter((r)=>String(r.order_id) === String(o.id) && r.status !== 'Completed');
                                            const next = rows.sort((a, b)=>String(a.reminder_date || '9999-12-31').localeCompare(String(b.reminder_date || '9999-12-31')))[0];
                                            return (next === null || next === void 0 ? void 0 : next.reminder_date) || '-';
                                        })();
                                        const lastRemark = (()=>{
                                            const rows = remindersWithComputed.filter((r)=>String(r.order_id) === String(o.id));
                                            const last = rows.sort((a, b)=>new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                                            return (last === null || last === void 0 ? void 0 : last.followup_note) ? '"'.concat(String(last.followup_note).slice(0, 60)).concat(String(last.followup_note).length > 60 ? '…' : '', '"') : '-';
                                        })();
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Order ID",
                                                    style: {
                                                        fontFamily: 'monospace',
                                                        fontWeight: 800
                                                    },
                                                    children: o.order_number
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 717,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Invoice No",
                                                    style: {
                                                        fontFamily: 'monospace',
                                                        fontWeight: 700
                                                    },
                                                    children: o.invoice_number
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 718,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Customer",
                                                    style: {
                                                        fontWeight: 700
                                                    },
                                                    children: o.customer_name
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 719,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Salesperson",
                                                    children: o.salesperson
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 720,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Delivery Date",
                                                    children: isoDate(o.delivered_at) || '—'
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 721,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Invoice Date",
                                                    children: isoDate(o.invoice_date) || '—'
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 722,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Payment Terms",
                                                    children: o.payment_terms
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 723,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Payment Due Date",
                                                    children: isoDate(o.payment_due_date) || '—'
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 724,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Remaining Days",
                                                    style: {
                                                        fontWeight: 700,
                                                        color: Number(o.remaining_days) < 0 ? '#dc2626' : '#334155'
                                                    },
                                                    children: o.remaining_days === null ? '—' : o.remaining_days
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 725,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Total Amount",
                                                    style: {
                                                        textAlign: 'right',
                                                        fontWeight: 800
                                                    },
                                                    children: formatINR(total)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 726,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Paid Amount",
                                                    style: {
                                                        textAlign: 'right',
                                                        fontWeight: 800,
                                                        color: '#10b981'
                                                    },
                                                    children: formatINR(paid)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 727,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Pending Amount",
                                                    style: {
                                                        textAlign: 'right',
                                                        fontWeight: 900,
                                                        color: '#ef4444'
                                                    },
                                                    children: formatINR(bal)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 728,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Status",
                                                    style: {
                                                        fontWeight: 800
                                                    },
                                                    children: paymentLabel
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 729,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Reminder",
                                                    style: {
                                                        whiteSpace: 'nowrap'
                                                    },
                                                    children: o.reminder_label
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 730,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Action",
                                                    style: {
                                                        textAlign: 'right'
                                                    },
                                                    children: paymentKey === 'AWAITING_FINANCE_VERIFICATION' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontWeight: 800,
                                                            color: '#d97706',
                                                            whiteSpace: 'nowrap'
                                                        },
                                                        children: "⏳ Verification Pending"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                        lineNumber: 733,
                                                        columnNumber: 31
                                                    }, this) : paymentKey === 'PAID' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "btn-small btn-outline-small",
                                                        onClick: ()=>openViewPaymentHistory(o),
                                                        children: "View Payment"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                        lineNumber: 735,
                                                        columnNumber: 31
                                                    }, this) : paymentKey === 'PARTIALLY_PAID' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'inline-flex',
                                                            gap: 8
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                className: "btn-small btn-primary-small",
                                                                onClick: ()=>navigate.push('/sales/create-payment?orderId=' + encodeURIComponent(o.order_number || o.id)),
                                                                children: "Log Payment"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                                lineNumber: 738,
                                                                columnNumber: 33
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                className: "btn-small btn-outline-small",
                                                                onClick: ()=>openConfirmPayment(o),
                                                                children: "Quick Modal"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                                lineNumber: 739,
                                                                columnNumber: 33
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                className: "btn-small btn-outline-small",
                                                                onClick: ()=>openViewPaymentHistory(o),
                                                                children: "History"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                                lineNumber: 740,
                                                                columnNumber: 33
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                        lineNumber: 737,
                                                        columnNumber: 31
                                                    }, this) : o.latest_pv_status === 'REJECTED' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'inline-flex',
                                                            gap: 8,
                                                            alignItems: 'center'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: 11,
                                                                    color: '#dc2626',
                                                                    fontWeight: 700,
                                                                    maxWidth: 160,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap'
                                                                },
                                                                title: o.latest_pv_notes ? "Reason: ".concat(o.latest_pv_notes) : 'Rejected',
                                                                children: [
                                                                    "✗ Rejected",
                                                                    o.latest_pv_notes ? " (".concat(o.latest_pv_notes, ")") : ''
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                                lineNumber: 744,
                                                                columnNumber: 33
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                className: "btn-small btn-primary-small",
                                                                onClick: ()=>navigate.push('/sales/create-payment?orderId=' + encodeURIComponent(o.order_number || o.id)),
                                                                children: "Log Payment"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                                lineNumber: 747,
                                                                columnNumber: 33
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                        lineNumber: 743,
                                                        columnNumber: 31
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'inline-flex',
                                                            gap: 8
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                className: "btn-small btn-primary-small",
                                                                style: {
                                                                    background: '#2563eb',
                                                                    borderColor: '#2563eb',
                                                                    color: '#fff'
                                                                },
                                                                onClick: ()=>navigate.push('/sales/create-payment?orderId=' + encodeURIComponent(o.order_number || o.id)),
                                                                children: "Log Payment"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                                lineNumber: 751,
                                                                columnNumber: 33
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                className: "btn-small btn-outline-small",
                                                                onClick: ()=>openConfirmPayment(o),
                                                                children: "Quick Record"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                                lineNumber: 752,
                                                                columnNumber: 33
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                className: "btn-small btn-outline-small",
                                                                onClick: ()=>openAddFollowup(o),
                                                                children: "Add Follow-up"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                                lineNumber: 753,
                                                                columnNumber: 33
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                        lineNumber: 750,
                                                        columnNumber: 31
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 731,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, o.id, true, {
                                            fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                            lineNumber: 716,
                                            columnNumber: 25
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                    lineNumber: 695,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/PaymentFollowupERPView.jsx",
                            lineNumber: 675,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                        lineNumber: 674,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                lineNumber: 591,
                columnNumber: 9
            }, this),
            activeTab === 'reminders' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 12
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 12,
                            flexWrap: 'wrap',
                            marginBottom: 10
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "tab-filters-row",
                                style: {
                                    background: '#f1f3f5'
                                },
                                children: [
                                    'All',
                                    'Today',
                                    'Tomorrow',
                                    'This Week',
                                    'Overdue',
                                    'Upcoming'
                                ].map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "filter-pill ".concat(reminderFilter === f ? 'active' : ''),
                                        onClick: ()=>setReminderFilter(f),
                                        style: {
                                            color: reminderFilter === f ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                                        },
                                        children: f
                                    }, f, false, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 773,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                lineNumber: 771,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn-small btn-outline-small",
                                onClick: refreshFollowups,
                                children: "Refresh"
                            }, void 0, false, {
                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                lineNumber: 783,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                        lineNumber: 770,
                        columnNumber: 11
                    }, this),
                    loadingFollowups ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: 20,
                            color: 'var(--color-text-secondary)'
                        },
                        children: "Loading…"
                    }, void 0, false, {
                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                        lineNumber: 787,
                        columnNumber: 13
                    }, this) : isCompact ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'grid',
                            gap: 10
                        },
                        children: filteredReminders.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                textAlign: 'center',
                                padding: 20,
                                color: 'var(--color-text-muted)'
                            },
                            children: "No reminders found."
                        }, void 0, false, {
                            fileName: "[project]/components/PaymentFollowupERPView.jsx",
                            lineNumber: 791,
                            columnNumber: 17
                        }, this) : filteredReminders.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 10,
                                    padding: 12,
                                    background: 'var(--color-bg-primary)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            gap: 8
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: r.reminder_date || '-'
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 796,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: r.computed_status
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 797,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 795,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 4,
                                            fontWeight: 700
                                        },
                                        children: r.customer_name || '-'
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 799,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 2,
                                            fontFamily: 'monospace',
                                            fontSize: 12
                                        },
                                        children: r.order_number || '-'
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 800,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 6,
                                            color: '#ef4444',
                                            fontWeight: 900
                                        },
                                        children: formatINR(r.balance_amount || 0)
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 801,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 6,
                                            fontSize: 13,
                                            color: 'var(--color-text-secondary)'
                                        },
                                        children: r.followup_note
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 802,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 10,
                                            display: 'flex',
                                            gap: 8,
                                            flexWrap: 'wrap'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn-small btn-outline-small",
                                                onClick: ()=>callDoneReminder(r),
                                                children: "Call Done"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 804,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn-small btn-outline-small",
                                                onClick: ()=>updateReminder(r.id, {
                                                        status: 'Completed'
                                                    }, 'Marked completed'),
                                                children: "Mark Completed"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 805,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn-small btn-outline-small",
                                                onClick: async ()=>{
                                                    const { value: newDate } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                                                        title: 'Reschedule',
                                                        input: 'date',
                                                        inputValue: r.reminder_date || new Date().toISOString().split('T')[0],
                                                        showCancelButton: true
                                                    });
                                                    if (newDate) {
                                                        await updateReminder(r.id, {
                                                            next_reminder_date: newDate,
                                                            status: computeReminderStatus(newDate, 'Upcoming')
                                                        }, 'Reminder rescheduled');
                                                    }
                                                },
                                                children: "Reschedule"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 806,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "btn-small btn-outline-small",
                                                onClick: ()=>deleteReminder(r.id),
                                                children: "Delete"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 826,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 803,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, r.id, true, {
                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                lineNumber: 794,
                                columnNumber: 19
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                        lineNumber: 789,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "crm-table-container",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "crm-table responsive-table",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Reminder Date"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 837,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Customer"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 838,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Order"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 839,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Balance"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 840,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Conversation"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 841,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Status"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 842,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Action"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 843,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 836,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                    lineNumber: 835,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: filteredReminders.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            colSpan: "7",
                                            style: {
                                                textAlign: 'center',
                                                padding: 28,
                                                color: 'var(--color-text-muted)'
                                            },
                                            children: "No reminders found."
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                            lineNumber: 848,
                                            columnNumber: 25
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 848,
                                        columnNumber: 21
                                    }, this) : filteredReminders.map((r)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Reminder Date",
                                                    children: r.reminder_date || '-'
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 852,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Customer",
                                                    style: {
                                                        fontWeight: 700
                                                    },
                                                    children: r.customer_name || '-'
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 853,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Order",
                                                    style: {
                                                        fontFamily: 'monospace',
                                                        fontWeight: 800
                                                    },
                                                    children: r.order_number || '-'
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 854,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Balance",
                                                    style: {
                                                        textAlign: 'right',
                                                        fontWeight: 900,
                                                        color: '#ef4444'
                                                    },
                                                    children: formatINR(r.balance_amount || 0)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 855,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Conversation",
                                                    style: {
                                                        color: 'var(--color-text-secondary)'
                                                    },
                                                    children: r.followup_note
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 856,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Status",
                                                    children: r.computed_status
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 857,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Action",
                                                    style: {
                                                        textAlign: 'right'
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'inline-flex',
                                                            gap: 8,
                                                            flexWrap: 'wrap',
                                                            justifyContent: 'flex-end'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                className: "btn-small btn-outline-small",
                                                                onClick: ()=>callDoneReminder(r),
                                                                children: "Call Done"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                                lineNumber: 860,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                className: "btn-small btn-outline-small",
                                                                onClick: ()=>updateReminder(r.id, {
                                                                        status: 'Completed'
                                                                    }, 'Marked completed'),
                                                                children: "Mark Completed"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                                lineNumber: 861,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                className: "btn-small btn-outline-small",
                                                                onClick: async ()=>{
                                                                    const { value: newDate } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                                                                        title: 'Reschedule',
                                                                        input: 'date',
                                                                        inputValue: r.reminder_date || new Date().toISOString().split('T')[0],
                                                                        showCancelButton: true
                                                                    });
                                                                    if (newDate) {
                                                                        await updateReminder(r.id, {
                                                                            next_reminder_date: newDate,
                                                                            status: computeReminderStatus(newDate, 'Upcoming')
                                                                        }, 'Reminder rescheduled');
                                                                    }
                                                                },
                                                                children: "Reschedule"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                                lineNumber: 862,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                className: "btn-small btn-outline-small",
                                                                onClick: ()=>deleteReminder(r.id),
                                                                children: "Delete"
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                                lineNumber: 882,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                        lineNumber: 859,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 858,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, r.id, true, {
                                            fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                            lineNumber: 851,
                                            columnNumber: 23
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                    lineNumber: 846,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/PaymentFollowupERPView.jsx",
                            lineNumber: 834,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                        lineNumber: 833,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                lineNumber: 769,
                columnNumber: 9
            }, this),
            activeTab === 'completed' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    marginTop: 12
                },
                children: [
                    isCompact ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'grid',
                            gap: 10
                        },
                        children: completedOrders.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                textAlign: 'center',
                                padding: 20,
                                color: 'var(--color-text-muted)'
                            },
                            children: "No completed payments."
                        }, void 0, false, {
                            fileName: "[project]/components/PaymentFollowupERPView.jsx",
                            lineNumber: 900,
                            columnNumber: 17
                        }, this) : completedOrders.map((o)=>{
                            var _o_customer;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 10,
                                    padding: 12,
                                    background: 'var(--color-bg-primary)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            gap: 8
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    fontFamily: 'monospace'
                                                },
                                                children: o.orderNo || o.order_number || o.id
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 905,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                style: {
                                                    color: '#10b981'
                                                },
                                                children: formatINR(o.verifiedPaidAmount || o.verified_paid_amount || (o.totalAmount || o.grandTotal || o.grand_total || 0) - (o.balanceAmount || o.balance_amount || 0))
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 906,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 904,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 4,
                                            fontWeight: 700
                                        },
                                        children: ((_o_customer = o.customer) === null || _o_customer === void 0 ? void 0 : _o_customer.name) || o.customerName || o.customer_name || 'ABC Infrastructure Pvt Ltd'
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 908,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: 6,
                                            fontSize: 13
                                        },
                                        children: [
                                            "Total: ",
                                            formatINR(o.totalAmount || o.grandTotal || o.grand_total || 0)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 909,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, o.orderNo, true, {
                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                lineNumber: 903,
                                columnNumber: 19
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                        lineNumber: 898,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "crm-table-container",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "crm-table responsive-table",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Order"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 919,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Customer"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 920,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Total"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 921,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                style: {
                                                    textAlign: 'right'
                                                },
                                                children: "Paid"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 922,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Verified Date"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 923,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Verified By"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 924,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Receipt"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 925,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Remarks"
                                            }, void 0, false, {
                                                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                lineNumber: 926,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 918,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                    lineNumber: 917,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: completedOrders.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            colSpan: "8",
                                            style: {
                                                textAlign: 'center',
                                                padding: 28,
                                                color: 'var(--color-text-muted)'
                                            },
                                            children: "No completed payments."
                                        }, void 0, false, {
                                            fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                            lineNumber: 931,
                                            columnNumber: 25
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                        lineNumber: 931,
                                        columnNumber: 21
                                    }, this) : completedOrders.map((o)=>{
                                        var _o_customer;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Order",
                                                    style: {
                                                        fontFamily: 'monospace',
                                                        fontWeight: 800
                                                    },
                                                    children: o.orderNo || o.order_number || o.id
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 935,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Customer",
                                                    style: {
                                                        fontWeight: 700
                                                    },
                                                    children: ((_o_customer = o.customer) === null || _o_customer === void 0 ? void 0 : _o_customer.name) || o.customerName || o.customer_name || 'ABC Infrastructure Pvt Ltd'
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 936,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Total",
                                                    style: {
                                                        textAlign: 'right',
                                                        fontWeight: 800
                                                    },
                                                    children: formatINR(o.totalAmount || o.grandTotal || o.grand_total || 0)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 937,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Paid",
                                                    style: {
                                                        textAlign: 'right',
                                                        fontWeight: 800,
                                                        color: '#10b981'
                                                    },
                                                    children: formatINR(o.verifiedPaidAmount || o.verified_paid_amount || (o.totalAmount || o.grandTotal || o.grand_total || 0) - (o.balanceAmount || o.balance_amount || 0))
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 938,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Verified Date",
                                                    children: "-"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 939,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Verified By",
                                                    children: "-"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 940,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Receipt",
                                                    children: "-"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 941,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    "data-label": "Remarks",
                                                    children: "-"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                                    lineNumber: 942,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, o.orderNo || o.order_number || o.id, true, {
                                            fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                            lineNumber: 934,
                                            columnNumber: 23
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/components/PaymentFollowupERPView.jsx",
                                    lineNumber: 929,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/PaymentFollowupERPView.jsx",
                            lineNumber: 916,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                        lineNumber: 915,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: 10
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "btn-small btn-outline-small",
                            onClick: ()=>navigate.push('/sales/orders'),
                            children: "Back to Orders"
                        }, void 0, false, {
                            fileName: "[project]/components/PaymentFollowupERPView.jsx",
                            lineNumber: 951,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/PaymentFollowupERPView.jsx",
                        lineNumber: 950,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/PaymentFollowupERPView.jsx",
                lineNumber: 896,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/PaymentFollowupERPView.jsx",
        lineNumber: 538,
        columnNumber: 5
    }, this);
}
_s(PaymentFollowupERPView, "rz+XQAH+rJ7tv469AZH7XFZsBzA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$useMediaQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMediaQuery"]
    ];
});
_c = PaymentFollowupERPView;
var _c;
__turbopack_context__.k.register(_c, "PaymentFollowupERPView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_PaymentFollowupERPView_jsx_76862465._.js.map