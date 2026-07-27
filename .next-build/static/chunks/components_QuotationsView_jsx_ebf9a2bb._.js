(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/QuotationsView.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>QuotationsView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$export$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/export.service.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.mjs [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.mjs [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.mjs [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.mjs [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/share-2.mjs [app-client] (ecmascript) <export default as Share2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square-pen.mjs [app-client] (ecmascript) <export default as Edit>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.mjs [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/truck.mjs [app-client] (ecmascript) <export default as Truck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.mjs [app-client] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.mjs [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.mjs [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.mjs [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.mjs [app-client] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.mjs [app-client] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.all.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CreateQuotation$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CreateQuotation.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/shared/context/ERPContext.jsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$ReminderModal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/components/ReminderModal.jsx [app-client] (ecmascript)");
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
;
function QuotationsView(param) {
    let { quotations = [], reminders = [], leads = [], customers = [], onCreateQuoteClick, onCreateLead, onUpdateQuotationStatus, onUpdateQuotation, onConvertToOrder, onSendPDF, onSaveReminder, onUpdateReminder, onCompleteReminder, searchQuery, setSearchQuery, showCreateFormProp, prefilledCustomer, prefilledProduct, prefilledQuantity, prefilledPrice, isFromSample, onResetTransition, flat = false } = param;
    var _selectedQuotation_createdAt, _reminderModal_quotation, _reminderModal_reminder, _reminderModal_quotation1;
    _s();
    const [localSearch, setLocalSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const search = searchQuery !== undefined && searchQuery !== null ? searchQuery : localSearch;
    const setSearch = setSearchQuery !== undefined ? setSearchQuery : setLocalSearch;
    const [selectedQuotation, setSelectedQuotation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('All');
    const [reminderBucket, setReminderBucket] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Today');
    const [reminderModal, setReminderModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // ── Inline Create Quotation Form toggle ──
    const [showCreateForm, setShowCreateForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const draft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"])({
        "QuotationsView.useERPStore[draft]": (s)=>s.quotationDraft
    }["QuotationsView.useERPStore[draft]"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "QuotationsView.useEffect": ()=>{
            if (showCreateFormProp || draft) {
                setShowCreateForm(true);
                if (onResetTransition && showCreateFormProp) {
                    onResetTransition();
                }
            }
        }
    }["QuotationsView.useEffect"], [
        showCreateFormProp,
        onResetTransition,
        draft
    ]);
    const handleAddQuotation = (qData)=>{
        const quoteId = 'QT-' + Math.floor(1000 + Math.random() * 9000);
        const newQuotation = {
            id: quoteId,
            status: 'Sent',
            date: new Date().toISOString().split('T')[0],
            ...qData
        };
        if (typeof onCreateQuoteClick === 'function') {
            onCreateQuoteClick(newQuotation);
        }
        setShowCreateForm(false);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: '✅ Quotation Published!',
            text: "Quotation ".concat(quoteId, " created for ").concat(qData.customerName, "."),
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
                popup: 'swal-premium-popup',
                title: 'swal-premium-title'
            }
        });
    };
    const [editingQuotation, setEditingQuotation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editCustomerName, setEditCustomerName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [editGroupName, setEditGroupName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [editGstName, setEditGstName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [editGstNumber, setEditGstNumber] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [editValidTill, setEditValidTill] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [editItems, setEditItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [editNotes, setEditNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [editPaymentTerms, setEditPaymentTerms] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('15 Days');
    const [editTransportCharge, setEditTransportCharge] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [editCustomerSearchOpen, setEditCustomerSearchOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const normalizeText = (value)=>String(value || '').trim().toLowerCase();
    const quotationItemsText = (quotation)=>{
        if (Array.isArray(quotation === null || quotation === void 0 ? void 0 : quotation.items)) {
            return quotation.items.map((item)=>"".concat(item.productName || item.name || 'Item', " (").concat(Number(item.quantity || item.qty || 0), " ").concat(item.unit || 'Qty', ")")).join(', ');
        }
        return String((quotation === null || quotation === void 0 ? void 0 : quotation.items) || (quotation === null || quotation === void 0 ? void 0 : quotation.products) || '');
    };
    const quotationDetailItems = (quotation)=>{
        const source = Array.isArray(quotation === null || quotation === void 0 ? void 0 : quotation.detailedItems) ? quotation.detailedItems : Array.isArray(quotation === null || quotation === void 0 ? void 0 : quotation.items) ? quotation.items : [];
        return source.map((item, index)=>{
            var _item_quantity, _ref, _item_unitPrice, _ref1, _ref2, _item_discount, _ref3, _item_tax, _ref4;
            return {
                ...item,
                id: item.id || index + 1,
                productName: item.productName || item.name || 'Item',
                productDetails: item.productDetails || item.specification || item.description || '',
                code: item.code || item.productCode || item.productId || "PRD-".concat(index + 1),
                quantity: Number((_ref = (_item_quantity = item.quantity) !== null && _item_quantity !== void 0 ? _item_quantity : item.qty) !== null && _ref !== void 0 ? _ref : 0),
                unitPrice: Number((_ref2 = (_ref1 = (_item_unitPrice = item.unitPrice) !== null && _item_unitPrice !== void 0 ? _item_unitPrice : item.rate) !== null && _ref1 !== void 0 ? _ref1 : item.price) !== null && _ref2 !== void 0 ? _ref2 : 0),
                discount: Number((_ref3 = (_item_discount = item.discount) !== null && _item_discount !== void 0 ? _item_discount : item.discountPercent) !== null && _ref3 !== void 0 ? _ref3 : 0),
                tax: Number((_ref4 = (_item_tax = item.tax) !== null && _item_tax !== void 0 ? _item_tax : item.gstPercent) !== null && _ref4 !== void 0 ? _ref4 : 0)
            };
        });
    };
    const quotationTotal = (quotation)=>{
        var _quotation_totalAmount, _ref;
        return Number((_ref = (_quotation_totalAmount = quotation === null || quotation === void 0 ? void 0 : quotation.totalAmount) !== null && _quotation_totalAmount !== void 0 ? _quotation_totalAmount : quotation === null || quotation === void 0 ? void 0 : quotation.grandTotal) !== null && _ref !== void 0 ? _ref : 0);
    };
    const quotationDiscount = (quotation)=>{
        const rows = quotationDetailItems(quotation);
        if (!rows.length) return Number((quotation === null || quotation === void 0 ? void 0 : quotation.discount) || 0);
        const subtotal = rows.reduce((sum, item)=>sum + item.quantity * item.unitPrice, 0);
        const discountAmount = rows.reduce((sum, item)=>sum + item.quantity * item.unitPrice * item.discount / 100, 0);
        return subtotal > 0 ? discountAmount / subtotal * 100 : 0;
    };
    const quotationValidTill = (quotation)=>(quotation === null || quotation === void 0 ? void 0 : quotation.validTill) || (quotation === null || quotation === void 0 ? void 0 : quotation.validityDate) || '—';
    const quotationPaymentTerms = (quotation)=>{
        if (quotation === null || quotation === void 0 ? void 0 : quotation.paymentTerms) return quotation.paymentTerms;
        if (!Array.isArray(quotation === null || quotation === void 0 ? void 0 : quotation.paymentMilestones)) return '—';
        return quotation.paymentMilestones.map((milestone)=>"".concat(milestone.label, " ").concat(milestone.percentage, "%")).join(', ');
    };
    const editCustomerOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "QuotationsView.useMemo[editCustomerOptions]": ()=>{
            const options = [
                ...leads.map({
                    "QuotationsView.useMemo[editCustomerOptions].options": (lead)=>({
                            key: "lead-".concat(lead.id),
                            type: 'Lead',
                            id: lead.id,
                            name: lead.companyName || lead.customerName || lead.projectName || '',
                            subtitle: [
                                lead.groupName || lead.group_name,
                                lead.status ? "Lead - ".concat(lead.status) : 'Lead'
                            ].filter(Boolean).join(' - '),
                            groupName: lead.groupName || lead.group_name || '',
                            gstNumber: lead.gstNumber || lead.gst_number || '',
                            gstName: lead.gstName || lead.companyName || lead.customerName || lead.projectName || ''
                        })
                }["QuotationsView.useMemo[editCustomerOptions].options"]),
                ...customers.map({
                    "QuotationsView.useMemo[editCustomerOptions].options": (customer)=>({
                            key: "customer-".concat(customer.id),
                            type: 'Customer',
                            id: customer.id,
                            name: customer.name || customer.customerName || '',
                            subtitle: [
                                customer.groupName || customer.group_name,
                                'Customer'
                            ].filter(Boolean).join(' - '),
                            groupName: customer.groupName || customer.group_name || '',
                            gstNumber: customer.gst || customer.gstNumber || customer.gstin || '',
                            gstName: customer.gstName || customer.name || customer.customerName || ''
                        })
                }["QuotationsView.useMemo[editCustomerOptions].options"])
            ].filter({
                "QuotationsView.useMemo[editCustomerOptions].options": (option)=>option.name
            }["QuotationsView.useMemo[editCustomerOptions].options"]);
            const seen = new Set();
            return options.filter({
                "QuotationsView.useMemo[editCustomerOptions]": (option)=>{
                    const key = "".concat(normalizeText(option.name), "-").concat(option.type);
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                }
            }["QuotationsView.useMemo[editCustomerOptions]"]);
        }
    }["QuotationsView.useMemo[editCustomerOptions]"], [
        leads,
        customers
    ]);
    const filteredEditCustomerOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "QuotationsView.useMemo[filteredEditCustomerOptions]": ()=>{
            const query = normalizeText(editCustomerName);
            if (!query) return editCustomerOptions.slice(0, 8);
            return editCustomerOptions.filter({
                "QuotationsView.useMemo[filteredEditCustomerOptions]": (option)=>normalizeText(option.name).includes(query) || normalizeText(option.groupName).includes(query) || normalizeText(option.subtitle).includes(query)
            }["QuotationsView.useMemo[filteredEditCustomerOptions]"]).slice(0, 8);
        }
    }["QuotationsView.useMemo[filteredEditCustomerOptions]"], [
        editCustomerOptions,
        editCustomerName
    ]);
    const selectEditCustomerOption = (option)=>{
        setEditCustomerName(option.name);
        setEditGroupName(option.groupName || '');
        setEditGstName(option.gstName || option.name);
        if (option.gstNumber) setEditGstNumber(option.gstNumber);
        setEditCustomerSearchOpen(false);
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "QuotationsView.useEffect": ()=>{
            if (!editingQuotation) return;
            if (!editCustomerName.trim()) {
                return;
            }
            if (!editGstName.trim() || editGstName === editingQuotation.customerName) {
                setEditGstName(editCustomerName.trim());
            }
            if (editingQuotation.gstNumber && editCustomerName === editingQuotation.customerName) {
                return;
            }
            const matchedLead = leads.find({
                "QuotationsView.useEffect.matchedLead": (l)=>{
                    var _l_companyName, _l_projectName;
                    return ((_l_companyName = l.companyName) === null || _l_companyName === void 0 ? void 0 : _l_companyName.toLowerCase()) === editCustomerName.trim().toLowerCase() || ((_l_projectName = l.projectName) === null || _l_projectName === void 0 ? void 0 : _l_projectName.toLowerCase()) === editCustomerName.trim().toLowerCase();
                }
            }["QuotationsView.useEffect.matchedLead"]);
            if (matchedLead && !editGroupName.trim()) {
                setEditGroupName(matchedLead.groupName || matchedLead.group_name || '');
            }
            if (matchedLead && matchedLead.gstNumber) {
                setEditGstNumber(matchedLead.gstNumber);
                return;
            }
            const matchedCustomer = customers.find({
                "QuotationsView.useEffect.matchedCustomer": (c)=>{
                    var _c_name;
                    return ((_c_name = c.name) === null || _c_name === void 0 ? void 0 : _c_name.toLowerCase()) === editCustomerName.trim().toLowerCase();
                }
            }["QuotationsView.useEffect.matchedCustomer"]);
            if (matchedCustomer && (matchedCustomer.gst || matchedCustomer.gstNumber)) {
                setEditGstNumber(matchedCustomer.gst || matchedCustomer.gstNumber);
            }
        }
    }["QuotationsView.useEffect"], [
        editCustomerName,
        editingQuotation,
        leads,
        customers
    ]);
    const startEditingQuotation = (qtn)=>{
        setEditingQuotation(qtn);
        const cName = qtn.customerName || '';
        const matchedLead = leads.find((l)=>{
            var _l_companyName, _l_projectName;
            return qtn.sourceId && String(l.id) === String(qtn.sourceId) || qtn.leadId && String(l.id) === String(qtn.leadId) || cName && (((_l_companyName = l.companyName) === null || _l_companyName === void 0 ? void 0 : _l_companyName.toLowerCase()) === cName.trim().toLowerCase() || ((_l_projectName = l.projectName) === null || _l_projectName === void 0 ? void 0 : _l_projectName.toLowerCase()) === cName.trim().toLowerCase());
        });
        const matchedCustomer = customers.find((c)=>{
            var _c_name;
            return cName && ((_c_name = c.name) === null || _c_name === void 0 ? void 0 : _c_name.toLowerCase()) === cName.trim().toLowerCase();
        });
        setEditCustomerName(cName || (matchedLead === null || matchedLead === void 0 ? void 0 : matchedLead.companyName) || (matchedLead === null || matchedLead === void 0 ? void 0 : matchedLead.projectName) || (matchedCustomer === null || matchedCustomer === void 0 ? void 0 : matchedCustomer.name) || '');
        setEditGroupName(qtn.groupName || (matchedLead === null || matchedLead === void 0 ? void 0 : matchedLead.groupName) || (matchedLead === null || matchedLead === void 0 ? void 0 : matchedLead.group_name) || (matchedCustomer === null || matchedCustomer === void 0 ? void 0 : matchedCustomer.groupName) || (matchedCustomer === null || matchedCustomer === void 0 ? void 0 : matchedCustomer.group_name) || '');
        setEditGstName(qtn.gstName || (matchedLead === null || matchedLead === void 0 ? void 0 : matchedLead.gstName) || (matchedLead === null || matchedLead === void 0 ? void 0 : matchedLead.companyName) || (matchedLead === null || matchedLead === void 0 ? void 0 : matchedLead.projectName) || (matchedCustomer === null || matchedCustomer === void 0 ? void 0 : matchedCustomer.gstName) || (matchedCustomer === null || matchedCustomer === void 0 ? void 0 : matchedCustomer.name) || cName || '');
        setEditGstNumber(qtn.gstNumber || (matchedLead === null || matchedLead === void 0 ? void 0 : matchedLead.gstNumber) || (matchedLead === null || matchedLead === void 0 ? void 0 : matchedLead.gst_number) || (matchedCustomer === null || matchedCustomer === void 0 ? void 0 : matchedCustomer.gst) || (matchedCustomer === null || matchedCustomer === void 0 ? void 0 : matchedCustomer.gstNumber) || (matchedCustomer === null || matchedCustomer === void 0 ? void 0 : matchedCustomer.gstin) || '');
        setEditValidTill(qtn.validTill || qtn.validityDate || '');
        setEditNotes(qtn.notes || qtn.termsAndNotes || '');
        setEditPaymentTerms(quotationPaymentTerms(qtn) === '—' ? '15 Days' : quotationPaymentTerms(qtn));
        var _qtn_expectedTransportationCost, _ref;
        setEditTransportCharge(Number((_ref = (_qtn_expectedTransportationCost = qtn.expectedTransportationCost) !== null && _qtn_expectedTransportationCost !== void 0 ? _qtn_expectedTransportationCost : qtn.transportCharge) !== null && _ref !== void 0 ? _ref : 0) || 0);
        // Resolve detailed items
        const resolvedItems = quotationDetailItems(qtn);
        // Map with custom ids for editing
        setEditItems(resolvedItems.map((item, idx)=>{
            const q = item.quantity !== undefined ? item.quantity : item.qty !== undefined ? item.qty : 1;
            const p = item.unitPrice !== undefined ? item.unitPrice : item.price !== undefined ? item.price : 100;
            const d = item.productDetails !== undefined ? item.productDetails : item.specifications !== undefined ? item.specifications : '';
            return {
                ...item,
                id: item.id || idx + 1,
                productName: item.productName || '',
                productDetails: d,
                quantity: q,
                unitPrice: p,
                discount: item.discount !== undefined ? item.discount : 0,
                tax: item.tax !== undefined ? item.tax : 18
            };
        }));
    };
    const handleEditItemChange = (id, field, value)=>{
        setEditItems(editItems.map((item)=>item.id === id ? {
                ...item,
                [field]: value
            } : item));
    };
    const handleAddEditItem = ()=>{
        const nextId = editItems.length > 0 ? Math.max(...editItems.map((i)=>i.id)) + 1 : 1;
        setEditItems([
            ...editItems,
            {
                id: nextId,
                productName: '',
                code: "P-PRD-".concat(Math.floor(100 + Math.random() * 900)),
                quantity: 1,
                unitPrice: 100,
                discount: 0,
                tax: 18
            }
        ]);
    };
    const handleRemoveEditItem = (id)=>{
        if (editItems.length === 1) return;
        setEditItems(editItems.filter((item)=>item.id !== id));
    };
    const handleEditQuotationSubmit = (e)=>{
        e.preventDefault();
        if (!editCustomerName.trim() || editItems.some((i)=>!i.productName.trim() || !i.productDetails.trim()) || !editNotes.trim()) {
            alert('Please fill out all fields and items.');
            return;
        }
        const itemsDescription = editItems.map((item)=>item.productDetails ? "".concat(item.productName, " (").concat(item.productDetails, ") (x").concat(item.quantity, ")") : "".concat(item.productName, " (x").concat(item.quantity, ")")).join(', ');
        // Calculate totals
        const grandTotal = editItems.reduce((sum, item)=>{
            const itemSubtotal = item.quantity * item.unitPrice;
            const itemDiscount = itemSubtotal * (item.discount || 0) / 100;
            const itemTax = (itemSubtotal - itemDiscount) * (item.tax || 0) / 100;
            return sum + (itemSubtotal - itemDiscount + itemTax);
        }, 0);
        onUpdateQuotation(editingQuotation.id, {
            customerName: editCustomerName.trim(),
            groupName: editGroupName.trim(),
            gstName: editGstName.trim(),
            gstNumber: editGstNumber.trim(),
            validTill: editValidTill,
            items: itemsDescription,
            detailedItems: editItems,
            quantity: editItems.reduce((sum, item)=>sum + item.quantity, 0),
            price: editItems.length > 0 ? editItems[0].unitPrice : 0,
            discount: editItems.length > 0 ? editItems[0].discount : 0,
            tax: editItems.length > 0 ? editItems[0].tax : 18,
            transportCharge: editTransportCharge || 0,
            expectedTransportationCost: editTransportCharge || 0,
            totalAmount: Math.round(grandTotal + (editTransportCharge || 0)),
            paymentTerms: editPaymentTerms,
            notes: editNotes.trim()
        });
        setEditingQuotation(null);
    };
    const handleUpdateStatusClick = (qId, newStatus, textAction)=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: "".concat(textAction, " Quotation?"),
            text: "Are you sure you want to set the status of quotation #QTN-".concat(qId, ' to "').concat(newStatus, '"?'),
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: "Yes, ".concat(textAction),
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
                onUpdateQuotationStatus(qId, newStatus);
            }
        });
    };
    const handleConvertToOrderClick = function(qtn) {
        let closePreview = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Book Purchase Order?',
            text: "Are you sure you want to convert quotation #QTN-".concat(qtn.id, ' into a Purchase Order for "').concat(qtn.customerName, '"?'),
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Book Order',
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
                onConvertToOrder(qtn);
                if (closePreview) {
                    setSelectedQuotation(null);
                }
            }
        });
    };
    const handleSendQuotationClick = (qtn)=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Send Quotation?',
            text: "Send quotation #QTN-".concat(qtn.id, ' to "').concat(qtn.customerName, '"?'),
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Send',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'swal-premium-popup',
                title: 'swal-premium-title',
                htmlContainer: 'swal-premium-text',
                confirmButton: 'swal-premium-confirm-btn',
                cancelButton: 'swal-premium-cancel-btn'
            },
            buttonsStyling: false
        }).then(async (result)=>{
            if (!result.isConfirmed) return;
            await onUpdateQuotationStatus(qtn.id, 'Sent');
            if (typeof onSendPDF === 'function') onSendPDF(qtn.id);
        });
    };
    const isQuotationConverted = (status)=>[
            'CONVERTED',
            'CONVERTED_TO_ORDER'
        ].includes(String(status || '').trim().toUpperCase().replace(/[\s-]+/g, '_'));
    const [currentPage, setCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    // Reset page when search or filter changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "QuotationsView.useEffect": ()=>{
            setCurrentPage(1);
        }
    }["QuotationsView.useEffect"], [
        search,
        filter,
        reminderBucket
    ]);
    const quotationReminders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "QuotationsView.useMemo[quotationReminders]": ()=>(reminders || []).filter({
                "QuotationsView.useMemo[quotationReminders]": (r)=>r.moduleType === 'Quotation'
            }["QuotationsView.useMemo[quotationReminders]"])
    }["QuotationsView.useMemo[quotationReminders]"], [
        reminders
    ]);
    const handleSaveReminder = async (formData)=>{
        if (!reminderModal) return;
        if (reminderModal.reminder && onUpdateReminder) {
            await onUpdateReminder(reminderModal.reminder.id, formData);
        } else if (onSaveReminder) {
            await onSaveReminder({
                moduleType: 'Quotation',
                moduleId: reminderModal.quotation.id,
                customerName: reminderModal.quotation.customerName,
                ...formData
            });
        }
        setReminderModal(null);
    };
    const filteredQuotations = (quotations || []).filter((q)=>{
        if (!q) return false;
        if (filter === 'Reminders') return false;
        const custName = q.customerName || '';
        const qItems = quotationItemsText(q);
        const status = q.status || '';
        const searchString = typeof search === 'string' ? search : '';
        const matchesSearch = custName.toLowerCase().includes(searchString.toLowerCase()) || qItems.toLowerCase().includes(searchString.toLowerCase());
        const matchesFilter = filter === 'All' || status === filter;
        return matchesSearch && matchesFilter;
    });
    const filteredQuotationReminders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "QuotationsView.useMemo[filteredQuotationReminders]": ()=>{
            let list = quotationReminders.filter({
                "QuotationsView.useMemo[filteredQuotationReminders].list": (r)=>{
                    const q = quotations.find({
                        "QuotationsView.useMemo[filteredQuotationReminders].list.q": (item)=>String(item.id) === String(r.moduleId)
                    }["QuotationsView.useMemo[filteredQuotationReminders].list.q"]);
                    const label = (q === null || q === void 0 ? void 0 : q.customerName) || r.customerName || '';
                    const searchString = typeof search === 'string' ? search : '';
                    return label.toLowerCase().includes(searchString.toLowerCase()) || (r.reminderType || '').toLowerCase().includes(searchString.toLowerCase());
                }
            }["QuotationsView.useMemo[filteredQuotationReminders].list"]);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$utils$2f$reminderUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["filterRemindersByBucket"])(list, reminderBucket);
        }
    }["QuotationsView.useMemo[filteredQuotationReminders]"], [
        quotationReminders,
        quotations,
        search,
        reminderBucket
    ]);
    const isRemindersView = filter === 'Reminders';
    const activeList = isRemindersView ? filteredQuotationReminders : filteredQuotations;
    const ITEMS_PER_PAGE = 25;
    const totalPages = Math.ceil(activeList.length / ITEMS_PER_PAGE) || 1;
    const displayedQuotations = flat ? filteredQuotations : filteredQuotations.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const displayedQuotationReminders = flat ? filteredQuotationReminders : filteredQuotationReminders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const renderQuotationReminder = (q)=>{
        const next = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$utils$2f$reminderUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getNextPendingReminder"])(quotationReminders, 'Quotation', q.id);
        if (!next) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                color: 'var(--color-text-muted)',
                fontSize: '12px'
            },
            children: "—"
        }, void 0, false, {
            fileName: "[project]/components/QuotationsView.jsx",
            lineNumber: 479,
            columnNumber: 23
        }, this);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                fontSize: '12px',
                fontWeight: '700'
            },
            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$utils$2f$reminderUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatReminderDate"])(next.reminderDate)
        }, void 0, false, {
            fileName: "[project]/components/QuotationsView.jsx",
            lineNumber: 481,
            columnNumber: 7
        }, this);
    };
    // Helper function to format in INR Lakhs style
    const formatINR = (value)=>{
        if (value >= 100000) {
            return "₹".concat((value / 100000).toFixed(2), " L");
        }
        return "₹".concat(Math.round(value).toLocaleString('en-IN'));
    };
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
    // Resolve client information
    const clientLead = selectedQuotation && selectedQuotation.customerName && leads ? leads.find((l)=>l.companyName && l.companyName.toLowerCase() === selectedQuotation.customerName.toLowerCase()) : null;
    const clientCustomer = selectedQuotation && selectedQuotation.customerName && customers ? customers.find((c)=>c.name && c.name.toLowerCase() === selectedQuotation.customerName.toLowerCase()) : null;
    const clientAddress = (selectedQuotation === null || selectedQuotation === void 0 ? void 0 : selectedQuotation.billingAddress) || (selectedQuotation === null || selectedQuotation === void 0 ? void 0 : selectedQuotation.deliveryAddress) || (clientLead ? renderAddress(clientLead.address) : '') || (clientCustomer ? renderAddress(clientCustomer.address) : '') || '—';
    const clientGST = (selectedQuotation === null || selectedQuotation === void 0 ? void 0 : selectedQuotation.gstNumber) || (clientLead === null || clientLead === void 0 ? void 0 : clientLead.gstNumber) || '27ABCDE4321G2Z8';
    // Resolve detailed item rows
    const itemsList = selectedQuotation ? quotationDetailItems(selectedQuotation) : [];
    const calculatedSubtotal = itemsList.reduce((sum, item)=>sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
    const discountAmt = itemsList.reduce((sum, item)=>sum + (item.quantity || 0) * (item.unitPrice || 0) * (item.discount || 0) / 100, 0);
    const calculatedTaxAmt = itemsList.reduce((sum, item)=>{
        const sub = (item.quantity || 0) * (item.unitPrice || 0);
        const disc = sub * (item.discount || 0) / 100;
        return sum + (sub - disc) * (item.tax !== undefined ? item.tax : 18) / 100;
    }, 0);
    // ── Show Inline Create Quotation Form (uses CreateQuotation component) ──
    if (showCreateForm) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CreateQuotation$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            leads: leads,
            customers: customers,
            prefilledCustomer: prefilledCustomer,
            prefilledProduct: prefilledProduct,
            prefilledQuantity: prefilledQuantity,
            prefilledPrice: prefilledPrice,
            isFromSample: isFromSample,
            onAddQuotation: handleAddQuotation,
            onCancel: ()=>setShowCreateForm(false),
            onCreateLead: onCreateLead
        }, "".concat(prefilledCustomer || '', "-").concat(prefilledProduct || '', "-").concat(prefilledQuantity || 0, "-").concat(prefilledPrice || 0), false, {
            fileName: "[project]/components/QuotationsView.jsx",
            lineNumber: 532,
            columnNumber: 7
        }, this);
    }
    // ── Show Inline Edit Quotation Form ──
    if (editingQuotation) {
        // Computed totals for the edit form
        const editSubtotal = editItems.reduce((sum, item)=>sum + item.quantity * item.unitPrice, 0);
        const editDiscountAmt = editItems.reduce((sum, item)=>sum + item.quantity * item.unitPrice * (item.discount || 0) / 100, 0);
        const editTaxAmt = editItems.reduce((sum, item)=>{
            const sub = item.quantity * item.unitPrice;
            const disc = sub * (item.discount || 0) / 100;
            return sum + (sub - disc) * (item.tax || 0) / 100;
        }, 0);
        const editGrandTotal = editSubtotal - editDiscountAmt + editTaxAmt + (editTransportCharge || 0);
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
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "card-top-icon-btn",
                                    onClick: ()=>setEditingQuotation(null),
                                    style: {
                                        width: '36px',
                                        height: '36px',
                                        background: '#f1f3f5',
                                        color: '#000'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                        size: 16
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 565,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 564,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "module-title",
                                    children: "Edit Quotation Proposal"
                                }, void 0, false, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 567,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/QuotationsView.jsx",
                            lineNumber: 563,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontSize: '12px',
                                color: 'var(--color-text-secondary)',
                                fontWeight: 600
                            },
                            children: [
                                "Ref: QTN-",
                                editingQuotation.id
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/QuotationsView.jsx",
                            lineNumber: 569,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/QuotationsView.jsx",
                    lineNumber: 562,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleEditQuotationSubmit,
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "quotation-customer-grid",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "form-group quotation-customer-field",
                                    style: {
                                        position: 'relative'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "form-label",
                                            children: "Customer / Corporate Company *"
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 576,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                position: 'relative'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    className: "form-input",
                                                    placeholder: "Search existing lead or customer",
                                                    value: editCustomerName,
                                                    onChange: (e)=>{
                                                        const nextValue = e.target.value;
                                                        const nextMatch = editCustomerOptions.find((option)=>normalizeText(option.name) === normalizeText(nextValue));
                                                        setEditCustomerName(nextValue);
                                                        setEditCustomerSearchOpen(true);
                                                        if (!nextMatch) {
                                                            setEditGroupName('');
                                                        }
                                                    },
                                                    onFocus: ()=>setEditCustomerSearchOpen(true),
                                                    onBlur: ()=>setTimeout(()=>setEditCustomerSearchOpen(false), 180),
                                                    required: true,
                                                    style: {
                                                        paddingRight: '38px'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 578,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                    size: 15,
                                                    style: {
                                                        position: 'absolute',
                                                        right: '12px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        color: '#5E6B82',
                                                        pointerEvents: 'none'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 597,
                                                    columnNumber: 17
                                                }, this),
                                                editCustomerSearchOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "smart-search-dropdown",
                                                    style: {
                                                        width: '100%',
                                                        position: 'absolute',
                                                        top: 'calc(100% + 6px)',
                                                        left: 0,
                                                        zIndex: 40,
                                                        maxHeight: '260px',
                                                        overflowY: 'auto',
                                                        borderRadius: '10px',
                                                        boxShadow: '0 18px 36px rgba(15, 23, 42, 0.18)'
                                                    },
                                                    children: filteredEditCustomerOptions.length > 0 ? filteredEditCustomerOptions.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: "smart-search-item",
                                                            onMouseDown: (e)=>{
                                                                e.preventDefault();
                                                                selectEditCustomerOption(option);
                                                            },
                                                            style: {
                                                                width: '100%',
                                                                textAlign: 'left',
                                                                border: 0,
                                                                background: 'transparent',
                                                                display: 'block'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        display: 'block',
                                                                        fontWeight: 800
                                                                    },
                                                                    children: option.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                                    lineNumber: 625,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        display: 'block',
                                                                        fontSize: '11.5px',
                                                                        color: '#5E6B82',
                                                                        marginTop: '2px'
                                                                    },
                                                                    children: option.subtitle
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                                    lineNumber: 626,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, option.key, true, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 615,
                                                            columnNumber: 25
                                                        }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            padding: '12px',
                                                            color: '#92400e',
                                                            background: '#fffbeb',
                                                            border: '1px solid #fde68a',
                                                            borderRadius: '8px',
                                                            margin: '6px',
                                                            fontSize: '12.5px',
                                                            fontWeight: 700
                                                        },
                                                        children: "No lead/customer found. Enter name manually or create lead first."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/QuotationsView.jsx",
                                                        lineNumber: 630,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 599,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 577,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 575,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "form-group",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "form-label",
                                            children: "Group Name"
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 639,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            className: "form-input",
                                            placeholder: "e.g. NHAI Group",
                                            value: editGroupName,
                                            onChange: (e)=>setEditGroupName(e.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 640,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 638,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "form-group",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "form-label",
                                            children: "GST Name *"
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 649,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            className: "form-input",
                                            placeholder: "Legal name as per GST registration",
                                            value: editGstName,
                                            onChange: (e)=>setEditGstName(e.target.value),
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 650,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 648,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "form-group",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "form-label",
                                            children: "GST Number *"
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 660,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            className: "form-input",
                                            placeholder: "e.g. 09ABCDE1234F1Z5",
                                            value: editGstNumber,
                                            onChange: (e)=>setEditGstNumber(e.target.value.toUpperCase()),
                                            maxLength: 15,
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 661,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 659,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/QuotationsView.jsx",
                            lineNumber: 574,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "form-row",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "form-group",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "form-label",
                                            children: "Quotation Validity Period *"
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 676,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "date",
                                            className: "form-input",
                                            value: editValidTill,
                                            onChange: (e)=>setEditValidTill(e.target.value),
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 677,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 675,
                                    columnNumber: 13
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
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"], {
                                                    size: 12
                                                }, void 0, false, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 687,
                                                    columnNumber: 17
                                                }, this),
                                                " Expected Transportation Cost (₹)"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 686,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            className: "form-input",
                                            placeholder: "e.g. 2500",
                                            min: "0",
                                            value: editTransportCharge || '',
                                            onChange: (e)=>setEditTransportCharge(Number(e.target.value) || 0)
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 689,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 685,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/QuotationsView.jsx",
                            lineNumber: 674,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    style: {
                                        fontSize: '13px',
                                        fontWeight: '800',
                                        textTransform: 'uppercase',
                                        color: 'var(--color-text-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        marginBottom: '12px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                            size: 14
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 703,
                                            columnNumber: 15
                                        }, this),
                                        " Line Items Catalogue"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 702,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "crm-table-container",
                                    style: {
                                        marginTop: 0,
                                        overflow: 'visible'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                        className: "crm-table responsive-table",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            style: {
                                                                width: '40%'
                                                            },
                                                            children: "Product & Specification Details *"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 709,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            style: {
                                                                width: '10%',
                                                                textAlign: 'center'
                                                            },
                                                            children: "Quantity *"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 710,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            style: {
                                                                width: '12%',
                                                                textAlign: 'center'
                                                            },
                                                            children: "Unit Price (₹) *"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 711,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            style: {
                                                                width: '10%',
                                                                textAlign: 'center'
                                                            },
                                                            children: "Discount (%)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 712,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            style: {
                                                                width: '10%',
                                                                textAlign: 'center'
                                                            },
                                                            children: "GST (%)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 713,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            style: {
                                                                width: '13%',
                                                                textAlign: 'right'
                                                            },
                                                            children: "Total Amount"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 714,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                            style: {
                                                                width: '5%',
                                                                textAlign: 'center'
                                                            },
                                                            children: "Action"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 715,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 708,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/QuotationsView.jsx",
                                                lineNumber: 707,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                children: editItems.map((item)=>{
                                                    const itemSubtotal = item.quantity * item.unitPrice;
                                                    const discVal = itemSubtotal * (item.discount || 0) / 100;
                                                    const taxVal = (itemSubtotal - discVal) * (item.tax || 0) / 100;
                                                    const total = itemSubtotal - discVal + taxVal;
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                "data-label": "Product Details",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        gap: '6px'
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "text",
                                                                            className: "form-input",
                                                                            placeholder: "Search product...",
                                                                            value: item.productName,
                                                                            onChange: (e)=>handleEditItemChange(item.id, 'productName', e.target.value),
                                                                            required: true,
                                                                            style: {
                                                                                padding: '8px 12px'
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                                            lineNumber: 728,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "text",
                                                                            className: "form-input",
                                                                            placeholder: "Specifications / Color details * (e.g. Color: Grey, Size: M10)",
                                                                            value: item.productDetails || '',
                                                                            onChange: (e)=>handleEditItemChange(item.id, 'productDetails', e.target.value),
                                                                            required: true,
                                                                            style: {
                                                                                padding: '6px 12px',
                                                                                fontSize: '12.5px'
                                                                            }
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                                            lineNumber: 737,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                                    lineNumber: 727,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/QuotationsView.jsx",
                                                                lineNumber: 726,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                "data-label": "Qty",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "number",
                                                                    className: "form-input",
                                                                    min: "1",
                                                                    value: item.quantity,
                                                                    onChange: (e)=>handleEditItemChange(item.id, 'quantity', Number(e.target.value)),
                                                                    required: true,
                                                                    style: {
                                                                        padding: '8px 12px',
                                                                        textAlign: 'center'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                                    lineNumber: 749,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/QuotationsView.jsx",
                                                                lineNumber: 748,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                "data-label": "Rate",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "number",
                                                                    className: "form-input",
                                                                    min: "0",
                                                                    value: item.unitPrice,
                                                                    onChange: (e)=>handleEditItemChange(item.id, 'unitPrice', Number(e.target.value)),
                                                                    required: true,
                                                                    style: {
                                                                        padding: '8px 12px',
                                                                        textAlign: 'center'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                                    lineNumber: 760,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/QuotationsView.jsx",
                                                                lineNumber: 759,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                "data-label": "Discount",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "number",
                                                                    className: "form-input",
                                                                    min: "0",
                                                                    max: "100",
                                                                    value: item.discount || 0,
                                                                    onChange: (e)=>handleEditItemChange(item.id, 'discount', Number(e.target.value)),
                                                                    required: true,
                                                                    style: {
                                                                        padding: '8px 12px',
                                                                        textAlign: 'center'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                                    lineNumber: 771,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/QuotationsView.jsx",
                                                                lineNumber: 770,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                "data-label": "Tax",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "number",
                                                                    className: "form-input",
                                                                    min: "0",
                                                                    max: "100",
                                                                    value: item.tax || 0,
                                                                    onChange: (e)=>handleEditItemChange(item.id, 'tax', Number(e.target.value)),
                                                                    required: true,
                                                                    style: {
                                                                        padding: '8px 12px',
                                                                        textAlign: 'center'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                                    lineNumber: 783,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/QuotationsView.jsx",
                                                                lineNumber: 782,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                "data-label": "Total Amount",
                                                                style: {
                                                                    fontWeight: '700',
                                                                    paddingLeft: '10px',
                                                                    textAlign: 'right'
                                                                },
                                                                children: formatINR(total)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/QuotationsView.jsx",
                                                                lineNumber: 794,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                "data-label": "Action",
                                                                style: {
                                                                    textAlign: 'center'
                                                                },
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    className: "btn-small btn-danger-small",
                                                                    onClick: ()=>handleRemoveEditItem(item.id),
                                                                    disabled: editItems.length === 1,
                                                                    style: {
                                                                        padding: '8px',
                                                                        opacity: editItems.length === 1 ? 0.4 : 1,
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                        size: 13
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/QuotationsView.jsx",
                                                                        lineNumber: 805,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                                    lineNumber: 798,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/QuotationsView.jsx",
                                                                lineNumber: 797,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, item.id, true, {
                                                        fileName: "[project]/components/QuotationsView.jsx",
                                                        lineNumber: 725,
                                                        columnNumber: 23
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/components/QuotationsView.jsx",
                                                lineNumber: 718,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 706,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 705,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "btn-small btn-outline-small",
                                    onClick: handleAddEditItem,
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        marginTop: '12px',
                                        fontWeight: '700'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                            size: 14
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 820,
                                            columnNumber: 15
                                        }, this),
                                        " Add Product Row"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 814,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/QuotationsView.jsx",
                            lineNumber: 701,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "totals-layout",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '16px'
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
                                                    children: "Terms / Notes"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 828,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                    className: "form-textarea",
                                                    style: {
                                                        minHeight: '135px'
                                                    },
                                                    placeholder: "Enter quotation instructions, custom bank details, dispatch terms...",
                                                    value: editNotes,
                                                    onChange: (e)=>setEditNotes(e.target.value)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 829,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 827,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                background: '#f8f9fa',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '14px',
                                                padding: '16px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "form-label",
                                                    style: {
                                                        fontWeight: '700',
                                                        marginBottom: 0
                                                    },
                                                    children: "Payment Terms *"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 840,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        gap: '24px',
                                                        alignItems: 'center',
                                                        marginTop: '4px',
                                                        flexWrap: 'wrap'
                                                    },
                                                    children: [
                                                        '7 Days',
                                                        '15 Days',
                                                        '20 Days',
                                                        'Custom'
                                                    ].map((term)=>{
                                                        const isChecked = term === 'Custom' ? ![
                                                            '7 Days',
                                                            '15 Days',
                                                            '20 Days'
                                                        ].includes(editPaymentTerms) : editPaymentTerms === term;
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            style: {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                cursor: 'pointer',
                                                                fontSize: '13.5px',
                                                                fontWeight: '500',
                                                                color: 'var(--color-text-primary)'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "checkbox",
                                                                    checked: isChecked,
                                                                    onChange: ()=>{
                                                                        if (term === 'Custom') {
                                                                            setEditPaymentTerms('');
                                                                        } else {
                                                                            setEditPaymentTerms(term);
                                                                        }
                                                                    },
                                                                    style: {
                                                                        width: '16px',
                                                                        height: '16px',
                                                                        cursor: 'pointer'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                                    lineNumber: 848,
                                                                    columnNumber: 25
                                                                }, this),
                                                                term
                                                            ]
                                                        }, term, true, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 847,
                                                            columnNumber: 23
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 841,
                                                    columnNumber: 17
                                                }, this),
                                                ![
                                                    '7 Days',
                                                    '15 Days',
                                                    '20 Days'
                                                ].includes(editPaymentTerms) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginTop: '8px'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "number",
                                                            min: "1",
                                                            className: "form-input",
                                                            placeholder: "Enter number of days...",
                                                            value: editPaymentTerms.replace(/ Days/gi, '').trim(),
                                                            onChange: (e)=>{
                                                                const val = e.target.value;
                                                                setEditPaymentTerms(val ? "".concat(val, " Days") : '');
                                                            },
                                                            style: {
                                                                flex: 1
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 867,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontSize: '13.5px',
                                                                fontWeight: '500',
                                                                color: 'var(--color-text-primary)',
                                                                whiteSpace: 'nowrap'
                                                            },
                                                            children: "Days"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 879,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 866,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 839,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 826,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: '#f8f9fa',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '18px',
                                        padding: '20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '14px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            style: {
                                                fontSize: '12.5px',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                color: 'var(--color-text-secondary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                borderBottom: '1px solid #eaeaea',
                                                paddingBottom: '8px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                                    size: 14
                                                }, void 0, false, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 888,
                                                    columnNumber: 17
                                                }, this),
                                                " Totals Invoice Summary"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 887,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px',
                                                fontSize: '13px',
                                                marginTop: '10px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        color: 'var(--color-text-secondary)'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "Subtotal:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 892,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontWeight: '600',
                                                                color: 'var(--color-text-primary)'
                                                            },
                                                            children: formatINR(editSubtotal)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 893,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 891,
                                                    columnNumber: 17
                                                }, this),
                                                editDiscountAmt > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        color: '#dc2626'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "Discount Applied:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 897,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                "-",
                                                                formatINR(editDiscountAmt)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 898,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 896,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        color: 'var(--color-text-secondary)'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "GST Tax Value:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 902,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontWeight: '600',
                                                                color: 'var(--color-text-primary)'
                                                            },
                                                            children: [
                                                                "+",
                                                                formatINR(editTaxAmt)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 903,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 901,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        color: '#0369a1'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"], {
                                                                    size: 11
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                                    lineNumber: 906,
                                                                    columnNumber: 87
                                                                }, this),
                                                                " Expected Transportation Cost:"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 906,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                fontWeight: '600'
                                                            },
                                                            children: [
                                                                "+",
                                                                formatINR(editTransportCharge || 0)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 907,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 905,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        fontSize: '17px',
                                                        fontWeight: '800',
                                                        borderTop: '1px solid #e5e7eb',
                                                        paddingTop: '10px',
                                                        marginTop: '6px'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "Grand Total (INR):"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 910,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            style: {
                                                                color: 'var(--color-text-primary)'
                                                            },
                                                            children: formatINR(editGrandTotal)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 911,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 909,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 890,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 886,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/QuotationsView.jsx",
                            lineNumber: 825,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "form-actions",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    className: "form-submit-btn",
                                    children: "Update Quotation Proposal"
                                }, void 0, false, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 919,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "btn-small btn-outline-small",
                                    onClick: ()=>setEditingQuotation(null),
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 920,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/QuotationsView.jsx",
                            lineNumber: 918,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/QuotationsView.jsx",
                    lineNumber: 572,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/QuotationsView.jsx",
            lineNumber: 561,
            columnNumber: 7
        }, this);
    }
    var _selectedQuotation_transportCharge, _ref, _selectedQuotation_transportCharge1, _ref1;
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
                        children: "Quotations Manager"
                    }, void 0, false, {
                        fileName: "[project]/components/QuotationsView.jsx",
                        lineNumber: 931,
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
                                    'Draft',
                                    'Sent',
                                    'Approved',
                                    'Rejected',
                                    'Reminders'
                                ].map((st)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: "filter-pill ".concat(filter === st ? 'active' : ''),
                                        onClick: ()=>setFilter(st),
                                        style: {
                                            color: filter === st ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                                        },
                                        children: st
                                    }, st, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 936,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/QuotationsView.jsx",
                                lineNumber: 934,
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
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 948,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Search quotations...",
                                        value: search,
                                        onChange: (e)=>setSearch(e.target.value),
                                        style: {
                                            color: 'var(--color-text-primary)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 949,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/QuotationsView.jsx",
                                lineNumber: 947,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "btn-small btn-primary-small",
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                },
                                onClick: ()=>{
                                    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().clearQuotationDraft();
                                    if (typeof onCreateQuoteClick === 'function') {
                                        onCreateQuoteClick();
                                    } else {
                                        setShowCreateForm(true);
                                    }
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 969,
                                        columnNumber: 13
                                    }, this),
                                    " Repeat Quotation"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/QuotationsView.jsx",
                                lineNumber: 957,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/QuotationsView.jsx",
                        lineNumber: 932,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/QuotationsView.jsx",
                lineNumber: 930,
                columnNumber: 7
            }, this),
            isRemindersView && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "tab-filters-row",
                style: {
                    background: '#F5FAFE',
                    marginBottom: '16px'
                },
                children: [
                    'Today',
                    'Tomorrow',
                    'This Week',
                    'Overdue',
                    'Completed'
                ].map((bucket)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "filter-pill ".concat(reminderBucket === bucket ? 'active' : ''),
                        onClick: ()=>setReminderBucket(bucket),
                        children: bucket
                    }, bucket, false, {
                        fileName: "[project]/components/QuotationsView.jsx",
                        lineNumber: 977,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/QuotationsView.jsx",
                lineNumber: 975,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "crm-table-container",
                children: isRemindersView ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "crm-table responsive-table flat-table",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Quotation"
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 994,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Customer"
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 995,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Reminder"
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 996,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Date"
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 997,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Priority"
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 998,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Status"
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 999,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Action"
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 1000,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/QuotationsView.jsx",
                                lineNumber: 993,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/QuotationsView.jsx",
                            lineNumber: 992,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: filteredQuotationReminders.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: "7",
                                    style: {
                                        textAlign: 'center',
                                        padding: '30px'
                                    },
                                    children: "No reminders found."
                                }, void 0, false, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1005,
                                    columnNumber: 21
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/QuotationsView.jsx",
                                lineNumber: 1005,
                                columnNumber: 17
                            }, this) : displayedQuotationReminders.map((reminder)=>{
                                const q = quotations.find((item)=>String(item.id) === String(reminder.moduleId));
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            children: [
                                                "#QTN-",
                                                reminder.moduleId
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1010,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            children: (q === null || q === void 0 ? void 0 : q.customerName) || reminder.customerName
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1011,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            children: reminder.reminderType
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1012,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            children: [
                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$utils$2f$reminderUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatReminderDate"])(reminder.reminderDate),
                                                reminder.reminderTime ? " · ".concat((0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$utils$2f$reminderUtils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatReminderTime"])(reminder.reminderTime)) : ''
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1013,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            children: reminder.priority
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1014,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            children: reminder.status
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1015,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    gap: '6px',
                                                    flexWrap: 'wrap'
                                                },
                                                children: [
                                                    reminder.status === 'Pending' && onCompleteReminder && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "btn-small btn-outline-small",
                                                        onClick: ()=>onCompleteReminder(reminder.id),
                                                        children: "Complete"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/QuotationsView.jsx",
                                                        lineNumber: 1019,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "btn-small btn-outline-small",
                                                        onClick: ()=>setReminderModal({
                                                                quotation: q,
                                                                reminder
                                                            }),
                                                        children: "Edit"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/QuotationsView.jsx",
                                                        lineNumber: 1021,
                                                        columnNumber: 25
                                                    }, this),
                                                    q && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "btn-small btn-outline-small",
                                                        onClick: ()=>setSelectedQuotation(q),
                                                        children: "View"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/QuotationsView.jsx",
                                                        lineNumber: 1022,
                                                        columnNumber: 31
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/QuotationsView.jsx",
                                                lineNumber: 1017,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1016,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, reminder.id, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1009,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/components/QuotationsView.jsx",
                            lineNumber: 1003,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/QuotationsView.jsx",
                    lineNumber: 991,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "crm-table responsive-table flat-table",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("colgroup", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                    style: {
                                        width: '9%'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1033,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                    style: {
                                        width: '14%'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1034,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                    style: {
                                        width: '16%'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1035,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                    style: {
                                        width: '9%'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1036,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                    style: {
                                        width: '6%'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1037,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                    style: {
                                        width: '8%'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1038,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                    style: {
                                        width: '10%'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1039,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("col", {
                                    style: {
                                        width: '28%'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1040,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/QuotationsView.jsx",
                            lineNumber: 1032,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Quotation ID"
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 1044,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Customer Name"
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 1045,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Product / Items"
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 1046,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Total Value"
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 1047,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Discount"
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 1048,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Status"
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 1049,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Reminder"
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 1050,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Valid Till"
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 1051,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        children: "Actions"
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 1052,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/QuotationsView.jsx",
                                lineNumber: 1043,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/QuotationsView.jsx",
                            lineNumber: 1042,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: filteredQuotations.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: "9",
                                    style: {
                                        textAlign: 'center',
                                        padding: '30px',
                                        color: 'var(--color-text-muted)'
                                    },
                                    children: "No quotations cataloged."
                                }, void 0, false, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1058,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/QuotationsView.jsx",
                                lineNumber: 1057,
                                columnNumber: 15
                            }, this) : displayedQuotations.map((q)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Quotation ID",
                                            style: {
                                                fontWeight: '700'
                                            },
                                            children: [
                                                "#",
                                                String(q.id || '').startsWith('QTN-') ? q.id : "QTN-".concat(q.id)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1065,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Customer Name",
                                            style: {
                                                fontWeight: '600'
                                            },
                                            children: q.customerName
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1066,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Product / Items",
                                            children: quotationItemsText(q)
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1067,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Total Value",
                                            style: {
                                                fontWeight: '700'
                                            },
                                            children: formatINR(quotationTotal(q))
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1068,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Discount",
                                            children: quotationDiscount(q) > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    display: 'inline-block',
                                                    background: 'rgba(239, 68, 68, 0.08)',
                                                    color: '#dc2626',
                                                    fontWeight: '800',
                                                    fontSize: '11px',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    border: '1px solid rgba(239, 68, 68, 0.15)'
                                                },
                                                children: [
                                                    quotationDiscount(q).toFixed(1),
                                                    "% Off"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/QuotationsView.jsx",
                                                lineNumber: 1071,
                                                columnNumber: 23
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    color: 'var(--color-text-secondary)',
                                                    fontSize: '13px'
                                                },
                                                children: "None"
                                            }, void 0, false, {
                                                fileName: "[project]/components/QuotationsView.jsx",
                                                lineNumber: 1075,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1069,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Status",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "badge badge-".concat((q.status || '').toLowerCase()),
                                                children: q.status || ''
                                            }, void 0, false, {
                                                fileName: "[project]/components/QuotationsView.jsx",
                                                lineNumber: 1079,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1078,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Reminder",
                                            children: renderQuotationReminder(q)
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1083,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Valid Till",
                                            children: quotationValidTill(q)
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1084,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            "data-label": "Actions",
                                            style: {
                                                textAlign: 'center',
                                                whiteSpace: 'nowrap'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "action-btn-group",
                                                style: {
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    justifyContent: 'center',
                                                    flexWrap: 'nowrap',
                                                    whiteSpace: 'nowrap'
                                                },
                                                children: [
                                                    !isQuotationConverted(q.status) && q.status !== 'Rejected' && (q.status === 'Sent' || q.status === 'Approved' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>handleConvertToOrderClick(q),
                                                        style: {
                                                            background: '#2F4375',
                                                            color: '#ffffff',
                                                            border: '1px solid #2F4375',
                                                            padding: '6px 14px',
                                                            borderRadius: '10px',
                                                            fontWeight: '800',
                                                            fontSize: '11.5px',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            whiteSpace: 'nowrap',
                                                            flexShrink: 0,
                                                            boxShadow: '0 1px 4px rgba(47,67,117,0.3)'
                                                        },
                                                        children: "Convert to Order →"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/QuotationsView.jsx",
                                                        lineNumber: 1090,
                                                        columnNumber: 27
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>handleSendQuotationClick(q),
                                                        style: {
                                                            background: '#2F4375',
                                                            color: '#ffffff',
                                                            border: '1px solid #2F4375',
                                                            padding: '6px 14px',
                                                            borderRadius: '10px',
                                                            fontWeight: '800',
                                                            fontSize: '11.5px',
                                                            cursor: 'pointer',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            whiteSpace: 'nowrap',
                                                            flexShrink: 0,
                                                            boxShadow: '0 1px 4px rgba(47,67,117,0.3)'
                                                        },
                                                        children: "Send Quotation →"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/QuotationsView.jsx",
                                                        lineNumber: 1113,
                                                        columnNumber: 27
                                                    }, this)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        title: "View Quotation",
                                                        onClick: ()=>setSelectedQuotation(q),
                                                        style: {
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: '32px',
                                                            height: '32px',
                                                            background: '#ffffff',
                                                            border: '1px solid #D6E2F0',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            color: '#475569',
                                                            flexShrink: 0
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 1148,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/QuotationsView.jsx",
                                                        lineNumber: 1138,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        title: "Edit Quotation",
                                                        onClick: ()=>startEditingQuotation(q),
                                                        style: {
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: '32px',
                                                            height: '32px',
                                                            background: '#ffffff',
                                                            border: '1px solid #D6E2F0',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            color: '#475569',
                                                            flexShrink: 0
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__["Edit"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 1160,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/QuotationsView.jsx",
                                                        lineNumber: 1150,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        title: "Add Reminder",
                                                        onClick: ()=>setReminderModal({
                                                                quotation: q
                                                            }),
                                                        style: {
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: '32px',
                                                            height: '32px',
                                                            background: '#ffffff',
                                                            border: '1px solid #D6E2F0',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            color: '#475569',
                                                            flexShrink: 0
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/QuotationsView.jsx",
                                                            lineNumber: 1172,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/QuotationsView.jsx",
                                                        lineNumber: 1162,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/QuotationsView.jsx",
                                                lineNumber: 1086,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1085,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, q.id, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1064,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/QuotationsView.jsx",
                            lineNumber: 1055,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/QuotationsView.jsx",
                    lineNumber: 1031,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/QuotationsView.jsx",
                lineNumber: 989,
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
                                fileName: "[project]/components/QuotationsView.jsx",
                                lineNumber: 1188,
                                columnNumber: 26
                            }, this),
                            " of ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: totalPages
                            }, void 0, false, {
                                fileName: "[project]/components/QuotationsView.jsx",
                                lineNumber: 1188,
                                columnNumber: 60
                            }, this),
                            " (",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: activeList.length
                            }, void 0, false, {
                                fileName: "[project]/components/QuotationsView.jsx",
                                lineNumber: 1188,
                                columnNumber: 91
                            }, this),
                            " total ",
                            isRemindersView ? 'reminders' : 'quotations',
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/QuotationsView.jsx",
                        lineNumber: 1187,
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
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 1197,
                                        columnNumber: 15
                                    }, this),
                                    " Previous"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/QuotationsView.jsx",
                                lineNumber: 1191,
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
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 1205,
                                        columnNumber: 20
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/QuotationsView.jsx",
                                lineNumber: 1199,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/QuotationsView.jsx",
                        lineNumber: 1190,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/QuotationsView.jsx",
                lineNumber: 1186,
                columnNumber: 9
            }, this),
            selectedQuotation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "modal-overlay active",
                onClick: ()=>setSelectedQuotation(null),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "invoice-sheet-modal",
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "sheet-header",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            style: {
                                                fontSize: '24px',
                                                fontWeight: '900',
                                                color: '#1e293b',
                                                letterSpacing: '-0.5px',
                                                margin: 0
                                            },
                                            children: "HIMALAYA PRODUCTS"
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1221,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: '13px',
                                                color: '#5E6B82',
                                                fontWeight: '600',
                                                margin: '2px 0 0 0'
                                            },
                                            children: "Concrete & Aggregate Supply"
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1222,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1220,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        textAlign: 'right'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            style: {
                                                fontSize: '22px',
                                                fontWeight: '900',
                                                color: '#1e293b',
                                                letterSpacing: '-0.5px',
                                                margin: 0
                                            },
                                            children: "QUOTATION"
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1225,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: '13px',
                                                color: '#5E6B82',
                                                fontWeight: '700',
                                                margin: '4px 0 0 0'
                                            },
                                            children: [
                                                "Ref: QT-2026-",
                                                selectedQuotation.id
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1226,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1224,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/QuotationsView.jsx",
                            lineNumber: 1219,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                            style: {
                                border: 'none',
                                borderTop: '2px solid #000000',
                                margin: '0 0 24px 0'
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/QuotationsView.jsx",
                            lineNumber: 1231,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "sheet-meta",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                margin: 0,
                                                fontWeight: '700',
                                                color: '#5E6B82',
                                                textTransform: 'uppercase',
                                                fontSize: '11px',
                                                letterSpacing: '0.5px'
                                            },
                                            children: "Quoted To:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1236,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                margin: '4px 0 0 0',
                                                fontWeight: '800',
                                                color: '#1e293b',
                                                fontSize: '15px'
                                            },
                                            children: selectedQuotation.customerName
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1237,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                margin: '2px 0 0 0',
                                                color: '#475569',
                                                fontWeight: '500'
                                            },
                                            children: clientAddress
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1238,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                margin: '4px 0 0 0',
                                                color: '#475569',
                                                fontWeight: '600'
                                            },
                                            children: [
                                                "GST: ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        textTransform: 'uppercase',
                                                        fontFamily: 'monospace'
                                                    },
                                                    children: clientGST
                                                }, void 0, false, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 1239,
                                                    columnNumber: 96
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1239,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1235,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        textAlign: 'right',
                                        fontWeight: '500',
                                        color: '#475569'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                margin: 0
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "Quotation Date:"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 1242,
                                                    columnNumber: 44
                                                }, this),
                                                " ",
                                                selectedQuotation.date || ((_selectedQuotation_createdAt = selectedQuotation.createdAt) === null || _selectedQuotation_createdAt === void 0 ? void 0 : _selectedQuotation_createdAt.slice(0, 10)) || '—'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1242,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                margin: '4px 0 0 0'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "Valid Till:"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 1243,
                                                    columnNumber: 54
                                                }, this),
                                                " ",
                                                quotationValidTill(selectedQuotation)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1243,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                margin: '4px 0 0 0'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "Payment Terms:"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 1244,
                                                    columnNumber: 54
                                                }, this),
                                                " ",
                                                quotationPaymentTerms(selectedQuotation)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1244,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                margin: '4px 0 0 0'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "Revision:"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 1245,
                                                    columnNumber: 54
                                                }, this),
                                                " Version 1"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1245,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1241,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/QuotationsView.jsx",
                            lineNumber: 1234,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "crm-table-container",
                            style: {
                                margin: '0 0 20px 0',
                                border: '1px solid #eaeaea'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                className: "crm-table responsive-table",
                                style: {
                                    border: 'none'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            style: {
                                                background: '#f8f9fa'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    style: {
                                                        padding: '12px 16px',
                                                        fontWeight: '700',
                                                        color: '#475569',
                                                        fontSize: '11px',
                                                        textTransform: 'uppercase'
                                                    },
                                                    children: "Product Details"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 1254,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
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
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 1255,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
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
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 1256,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
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
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 1258,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
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
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 1259,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1253,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 1252,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                        children: itemsList.map((item, index)=>{
                                            const itemSubtotal = item.quantity * item.unitPrice;
                                            const discountValue = itemSubtotal * (item.discount || 0) / 100;
                                            const taxable = itemSubtotal - discountValue;
                                            const taxValue = taxable * (item.tax !== undefined ? item.tax : 18) / 100;
                                            const itemTotal = taxable + taxValue;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        "data-label": "Product Details",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontWeight: '700',
                                                                    color: '#1e293b'
                                                                },
                                                                children: item.productName
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/QuotationsView.jsx",
                                                                lineNumber: 1273,
                                                                columnNumber: 29
                                                            }, this),
                                                            item.productDetails && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    fontSize: '12px',
                                                                    color: '#475569',
                                                                    marginTop: '2px',
                                                                    fontWeight: '500'
                                                                },
                                                                children: item.productDetails
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/QuotationsView.jsx",
                                                                lineNumber: 1275,
                                                                columnNumber: 31
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                                                fileName: "[project]/components/QuotationsView.jsx",
                                                                lineNumber: 1277,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/QuotationsView.jsx",
                                                        lineNumber: 1272,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        "data-label": "Qty",
                                                        style: {
                                                            textAlign: 'center',
                                                            fontWeight: '600',
                                                            color: '#334155'
                                                        },
                                                        children: item.quantity
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/QuotationsView.jsx",
                                                        lineNumber: 1279,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        "data-label": "Rate",
                                                        style: {
                                                            textAlign: 'center',
                                                            fontWeight: '600',
                                                            color: '#334155'
                                                        },
                                                        children: formatINR(item.unitPrice)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/QuotationsView.jsx",
                                                        lineNumber: 1280,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
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
                                                        fileName: "[project]/components/QuotationsView.jsx",
                                                        lineNumber: 1282,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        "data-label": "Total",
                                                        style: {
                                                            textAlign: 'right',
                                                            fontWeight: '800',
                                                            color: '#1e293b'
                                                        },
                                                        children: formatINR(itemTotal)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/QuotationsView.jsx",
                                                        lineNumber: 1283,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, index, true, {
                                                fileName: "[project]/components/QuotationsView.jsx",
                                                lineNumber: 1271,
                                                columnNumber: 25
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 1262,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/QuotationsView.jsx",
                                lineNumber: 1251,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/QuotationsView.jsx",
                            lineNumber: 1250,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "sheet-summary",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        width: '260px',
                                        justifyContent: 'space-between',
                                        fontSize: '13.5px',
                                        color: '#475569',
                                        fontWeight: '500'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Items Subtotal:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1294,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontWeight: '600',
                                                color: '#1e293b'
                                            },
                                            children: formatINR(calculatedSubtotal)
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1295,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1293,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        width: '260px',
                                        justifyContent: 'space-between',
                                        fontSize: '13.5px',
                                        color: '#475569',
                                        fontWeight: '500'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "GST Amount:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1299,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontWeight: '600',
                                                color: '#1e293b'
                                            },
                                            children: formatINR(calculatedTaxAmt)
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1300,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1298,
                                    columnNumber: 17
                                }, this),
                                Number((_ref = (_selectedQuotation_transportCharge = selectedQuotation.transportCharge) !== null && _selectedQuotation_transportCharge !== void 0 ? _selectedQuotation_transportCharge : selectedQuotation.expectedTransportationCost) !== null && _ref !== void 0 ? _ref : 0) > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        width: '260px',
                                        justifyContent: 'space-between',
                                        fontSize: '13.5px',
                                        color: '#0369a1',
                                        fontWeight: '500'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"], {
                                                    size: 12
                                                }, void 0, false, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 1304,
                                                    columnNumber: 89
                                                }, this),
                                                " Transport (Approx.):"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1304,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                fontWeight: '600'
                                            },
                                            children: [
                                                "+",
                                                formatINR(Number((_ref1 = (_selectedQuotation_transportCharge1 = selectedQuotation.transportCharge) !== null && _selectedQuotation_transportCharge1 !== void 0 ? _selectedQuotation_transportCharge1 : selectedQuotation.expectedTransportationCost) !== null && _ref1 !== void 0 ? _ref1 : 0))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1305,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1303,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Grand Total:"
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1309,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: '#1e293b',
                                                fontSize: '17px'
                                            },
                                            children: formatINR(quotationTotal(selectedQuotation))
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1310,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1308,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/QuotationsView.jsx",
                            lineNumber: 1292,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "sheet-actions",
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        gap: '8px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: "btn-small btn-outline-small",
                                            onClick: ()=>setSelectedQuotation(null),
                                            style: {
                                                padding: '10px 18px',
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                borderRadius: '8px',
                                                margin: 0
                                            },
                                            children: "Close Preview"
                                        }, void 0, false, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1317,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: "btn-small btn-outline-small",
                                            onClick: ()=>{
                                                try {
                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$export$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["exportQuotationPDF"])(selectedQuotation);
                                                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Downloaded', 'Quotation PDF has been downloaded.', 'success');
                                                } catch (err) {
                                                    console.error('Error generating PDF:', err);
                                                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Error', 'Failed to generate PDF.', 'error');
                                                }
                                            },
                                            style: {
                                                padding: '10px 18px',
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                borderRadius: '8px',
                                                margin: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                                    size: 14
                                                }, void 0, false, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 1339,
                                                    columnNumber: 21
                                                }, this),
                                                " Download"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1325,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: "btn-small btn-outline-small",
                                            onClick: async ()=>{
                                                const shareData = {
                                                    title: "Quotation ".concat(selectedQuotation.quotationNo),
                                                    text: "Here is the quotation for ".concat(selectedQuotation.customerName, "."),
                                                    url: window.location.href
                                                };
                                                if (navigator.share) {
                                                    try {
                                                        await navigator.share(shareData);
                                                    } catch (err) {
                                                        console.log('Error sharing:', err);
                                                    }
                                                } else {
                                                    const encodedText = encodeURIComponent("Here is the quotation for ".concat(selectedQuotation.customerName, ": ").concat(window.location.href));
                                                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                                                        title: 'Share Quotation',
                                                        html: '\n                            <div style="display:flex; flex-direction:column; gap:12px; margin-top: 10px;">\n                              <a href="https://wa.me/?text='.concat(encodedText, '" target="_blank" style="background:#25D366; color:#fff; text-decoration:none; padding:12px; border-radius:8px; font-weight:bold; display:flex; justify-content:center; align-items:center; gap:8px;">Share on WhatsApp</a>\n                              <a href="mailto:?subject=Quotation%20').concat(selectedQuotation.quotationNo, "&body=").concat(encodedText, '" style="background:#ea4335; color:#fff; text-decoration:none; padding:12px; border-radius:8px; font-weight:bold; display:flex; justify-content:center; align-items:center; gap:8px;">Share via Email</a>\n                            </div>\n                          '),
                                                        showConfirmButton: false,
                                                        showCloseButton: true,
                                                        customClass: {
                                                            popup: 'swal-premium-popup',
                                                            title: 'swal-premium-title'
                                                        }
                                                    });
                                                }
                                            },
                                            style: {
                                                padding: '10px 18px',
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                borderRadius: '8px',
                                                margin: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__["Share2"], {
                                                    size: 14
                                                }, void 0, false, {
                                                    fileName: "[project]/components/QuotationsView.jsx",
                                                    lineNumber: 1374,
                                                    columnNumber: 21
                                                }, this),
                                                " Share"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/QuotationsView.jsx",
                                            lineNumber: 1341,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1316,
                                    columnNumber: 17
                                }, this),
                                !isQuotationConverted(selectedQuotation.status) && selectedQuotation.status !== 'Rejected' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "btn-small btn-primary-small",
                                        onClick: ()=>handleConvertToOrderClick(selectedQuotation, true),
                                        style: {
                                            background: '#00a877',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '10px 20px',
                                            fontWeight: '700',
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            cursor: 'pointer',
                                            margin: 0
                                        },
                                        children: "Book Order Now"
                                    }, void 0, false, {
                                        fileName: "[project]/components/QuotationsView.jsx",
                                        lineNumber: 1380,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/QuotationsView.jsx",
                                    lineNumber: 1379,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/QuotationsView.jsx",
                            lineNumber: 1315,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/QuotationsView.jsx",
                    lineNumber: 1214,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/QuotationsView.jsx",
                lineNumber: 1213,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$ReminderModal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                open: !!reminderModal,
                onClose: ()=>setReminderModal(null),
                onSave: handleSaveReminder,
                customerName: (reminderModal === null || reminderModal === void 0 ? void 0 : (_reminderModal_quotation = reminderModal.quotation) === null || _reminderModal_quotation === void 0 ? void 0 : _reminderModal_quotation.customerName) || '',
                title: (reminderModal === null || reminderModal === void 0 ? void 0 : reminderModal.reminder) ? 'Edit Quotation Reminder' : 'Quotation Reminder',
                initialValues: (reminderModal === null || reminderModal === void 0 ? void 0 : reminderModal.reminder) || null
            }, (reminderModal === null || reminderModal === void 0 ? void 0 : (_reminderModal_reminder = reminderModal.reminder) === null || _reminderModal_reminder === void 0 ? void 0 : _reminderModal_reminder.id) || (reminderModal === null || reminderModal === void 0 ? void 0 : (_reminderModal_quotation1 = reminderModal.quotation) === null || _reminderModal_quotation1 === void 0 ? void 0 : _reminderModal_quotation1.id) || 'new', false, {
                fileName: "[project]/components/QuotationsView.jsx",
                lineNumber: 1396,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/QuotationsView.jsx",
        lineNumber: 928,
        columnNumber: 5
    }, this);
}
_s(QuotationsView, "2C7XLoZzVuSJNWNdqTAzRFlP3n8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"]
    ];
});
_c = QuotationsView;
var _c;
__turbopack_context__.k.register(_c, "QuotationsView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_QuotationsView_jsx_ebf9a2bb._.js.map