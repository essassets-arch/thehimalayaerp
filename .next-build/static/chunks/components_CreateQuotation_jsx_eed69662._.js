(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/CreateQuotation.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CreateQuotation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.mjs [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.mjs [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.mjs [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.mjs [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.mjs [app-client] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/truck.mjs [app-client] (ecmascript) <export default as Truck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/shared/context/ERPContext.jsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/context/AuthContext.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$ProductPicker$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/components/ProductPicker.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$hooks$2f$useFormDraft$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/hooks/useFormDraft.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$idGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/idGenerator.ts [app-client] (ecmascript)");
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
const STANDARD_SPECIFICATIONS = [
    'Color: Grey, Size: M10',
    'Color: Red, Size: M10',
    'Color: Grey, Size: LD5',
    'Color: Grey, Size: MD10',
    'Color: Grey, Size: HD20',
    'Standard Finish',
    'Heavy Duty',
    'Medium Duty'
];
function CreateQuotation(param) {
    let { leads = [], customers = [], prefilledCustomer = '', prefilledProduct = '', prefilledQuantity = 1, prefilledPrice = 100, onAddQuotation, onCancel, onCreateLead, isFromSample = false } = param;
    var _user_role, _erpState_sales_quotations, _erpState_sales;
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const userRole = user === null || user === void 0 ? void 0 : (_user_role = user.role) === null || _user_role === void 0 ? void 0 : _user_role.trim();
    const isSpecialRole = userRole === 'Super Admin' || userRole === 'Admin';
    const maxDays = isSpecialRole ? 90 : 20;
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const targetQuotationId = searchParams === null || searchParams === void 0 ? void 0 : searchParams.get('quotationId');
    const targetLeadId = searchParams === null || searchParams === void 0 ? void 0 : searchParams.get('leadId');
    const erpStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"])();
    const finalizeQuotation = erpStore.finalizeQuotation;
    const legacyQuotationDraft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"])({
        "CreateQuotation.useERPStore[legacyQuotationDraft]": (s)=>s.quotationDraft
    }["CreateQuotation.useERPStore[legacyQuotationDraft]"]);
    const clearQuotationDraft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"])({
        "CreateQuotation.useERPStore[clearQuotationDraft]": (s)=>s.clearQuotationDraft
    }["CreateQuotation.useERPStore[clearQuotationDraft]"]);
    const erpState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"])({
        "CreateQuotation.useERPStore[erpState]": (s)=>s.state
    }["CreateQuotation.useERPStore[erpState]"]);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CreateQuotation.useEffect": ()=>{
            if (targetLeadId && !targetQuotationId) {
                var _erpState_sales;
                const allQuotations = (erpState === null || erpState === void 0 ? void 0 : (_erpState_sales = erpState.sales) === null || _erpState_sales === void 0 ? void 0 : _erpState_sales.quotations) || [];
                const leadQuotations = allQuotations.filter({
                    "CreateQuotation.useEffect.leadQuotations": (q)=>(q.leadId === targetLeadId || q.sourceId === targetLeadId) && q.status !== 'CANCELLED' && q.status !== 'DELETED'
                }["CreateQuotation.useEffect.leadQuotations"]);
                const completed = leadQuotations.find({
                    "CreateQuotation.useEffect.completed": (q)=>q.status !== 'DRAFT'
                }["CreateQuotation.useEffect.completed"]);
                if (completed) {
                    __turbopack_context__.A("[project]/node_modules/sweetalert2/dist/sweetalert2.all.js [app-client] (ecmascript, async loader)").then({
                        "CreateQuotation.useEffect": (param)=>{
                            let { default: Swal } = param;
                            Swal.fire({
                                icon: 'info',
                                title: 'Already Completed',
                                text: 'A quotation has already been created for this lead.',
                                confirmButtonColor: '#0369a1'
                            }).then({
                                "CreateQuotation.useEffect": ()=>{
                                    if (onCancel) onCancel();
                                    else router.push('/sales/quotations');
                                }
                            }["CreateQuotation.useEffect"]);
                        }
                    }["CreateQuotation.useEffect"]);
                    return;
                }
                const draft = leadQuotations.find({
                    "CreateQuotation.useEffect.draft": (q)=>q.status === 'DRAFT'
                }["CreateQuotation.useEffect.draft"]);
                if (draft) {
                    router.replace("/sales/create-quotation?quotationId=".concat(draft.id || draft.quotationId, "&leadId=").concat(targetLeadId));
                } else {
                    const res = erpStore.createOrResumeQuotationFromLead(targetLeadId);
                    if (res.success && res.quotationId) {
                        router.replace("/sales/create-quotation?quotationId=".concat(res.quotationId, "&leadId=").concat(targetLeadId));
                    }
                }
            }
        }
    }["CreateQuotation.useEffect"], [
        targetLeadId,
        targetQuotationId,
        erpState,
        router,
        erpStore,
        onCancel
    ]);
    const quotationDraft = targetQuotationId ? erpState === null || erpState === void 0 ? void 0 : (_erpState_sales = erpState.sales) === null || _erpState_sales === void 0 ? void 0 : (_erpState_sales_quotations = _erpState_sales.quotations) === null || _erpState_sales_quotations === void 0 ? void 0 : _erpState_sales_quotations.find((q)=>q.id === targetQuotationId || q.quotationId === targetQuotationId) : legacyQuotationDraft;
    const productCatalog = (erpState === null || erpState === void 0 ? void 0 : erpState.productCatalog) || [];
    const [activeDropdownRow, setActiveDropdownRow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeSpecsDropdownRow, setActiveSpecsDropdownRow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [customerSearchOpen, setCustomerSearchOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const defaultValidTill = ()=>{
        const d = new Date();
        d.setDate(d.getDate() + 15);
        return d.toISOString().split('T')[0];
    };
    const getInitialItems = ()=>{
        if (quotationDraft && Array.isArray(quotationDraft.items) && quotationDraft.items.length > 0) {
            return quotationDraft.items.map((item, idx)=>({
                    id: idx + 1,
                    productName: item.name || item.productName || '',
                    productDetails: item.description || item.productDetails || '',
                    quantity: item.qty || item.quantity || 1,
                    unitPrice: item.rate || item.price || item.unitPrice || 100,
                    discount: item.discount || 0,
                    tax: item.tax !== undefined ? item.tax : 18,
                    productId: item.productId,
                    code: item.code
                }));
        }
        return [
            {
                id: 1,
                productName: prefilledProduct || '',
                productDetails: '',
                quantity: prefilledQuantity || 1,
                unitPrice: prefilledPrice || 100,
                discount: 0,
                tax: 18
            }
        ];
    };
    const emptyQuotationForm = {
        customerName: quotationDraft ? quotationDraft.customer || quotationDraft.company || '' : prefilledCustomer,
        groupName: quotationDraft ? quotationDraft.groupName || quotationDraft.group_name || '' : '',
        gstNumber: quotationDraft ? quotationDraft.gstNumber || '' : '',
        gstName: quotationDraft ? quotationDraft.gstName || quotationDraft.customer || quotationDraft.company || '' : prefilledCustomer,
        validTill: defaultValidTill(),
        paymentTerms: '15 Days',
        items: getInitialItems(),
        transportCharge: 0,
        notes: (quotationDraft === null || quotationDraft === void 0 ? void 0 : quotationDraft.notes) || ''
    };
    const draftKey = "erp_draft_create_quotation_".concat(targetQuotationId || targetLeadId || 'new');
    const { formData, setFormData, clearDraft } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$hooks$2f$useFormDraft$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormDraft"])({
        draftKey,
        initialData: emptyQuotationForm,
        erpUpdatedAt: quotationDraft === null || quotationDraft === void 0 ? void 0 : quotationDraft.updatedAt
    });
    const { customerName, groupName, gstNumber, gstName, validTill, paymentTerms, items, transportCharge, notes } = formData;
    const updateField = (field, value)=>{
        setFormData((prev)=>({
                ...prev,
                [field]: typeof value === 'function' ? value(prev[field]) : value
            }));
    };
    const setCustomerName = (val)=>updateField('customerName', val);
    const setGroupName = (val)=>updateField('groupName', val);
    const setGstNumber = (val)=>updateField('gstNumber', val);
    const setGstName = (val)=>updateField('gstName', val);
    const setValidTill = (val)=>updateField('validTill', val);
    const setPaymentTerms = (val)=>updateField('paymentTerms', val);
    const setItems = (val)=>updateField('items', val);
    const setTransportCharge = (val)=>updateField('transportCharge', val);
    const setNotes = (val)=>updateField('notes', val);
    const isSampleSource = quotationDraft && quotationDraft.source === 'SAMPLE' || isFromSample;
    const isLeadSource = !!(quotationDraft && (quotationDraft.leadId || quotationDraft.source === 'LEAD' && quotationDraft.sourceId));
    const sourceId = quotationDraft ? quotationDraft.sourceId : null;
    const normalizeText = (value)=>String(value || '').trim().toLowerCase();
    const customerOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CreateQuotation.useMemo[customerOptions]": ()=>{
            const options = [
                ...leads.map({
                    "CreateQuotation.useMemo[customerOptions].options": (lead)=>({
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
                }["CreateQuotation.useMemo[customerOptions].options"]),
                ...customers.map({
                    "CreateQuotation.useMemo[customerOptions].options": (customer)=>({
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
                }["CreateQuotation.useMemo[customerOptions].options"])
            ].filter({
                "CreateQuotation.useMemo[customerOptions].options": (option)=>option.name
            }["CreateQuotation.useMemo[customerOptions].options"]);
            const seen = new Set();
            return options.filter({
                "CreateQuotation.useMemo[customerOptions]": (option)=>{
                    const key = "".concat(normalizeText(option.name), "-").concat(option.type);
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                }
            }["CreateQuotation.useMemo[customerOptions]"]);
        }
    }["CreateQuotation.useMemo[customerOptions]"], [
        leads,
        customers
    ]);
    const selectedCustomerRecord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CreateQuotation.useMemo[selectedCustomerRecord]": ()=>customerOptions.find({
                "CreateQuotation.useMemo[selectedCustomerRecord]": (option)=>normalizeText(option.name) === normalizeText(customerName)
            }["CreateQuotation.useMemo[selectedCustomerRecord]"])
    }["CreateQuotation.useMemo[selectedCustomerRecord]"], [
        customerOptions,
        customerName
    ]);
    const filteredCustomerOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CreateQuotation.useMemo[filteredCustomerOptions]": ()=>{
            const query = normalizeText(customerName);
            if (!query) return customerOptions.slice(0, 8);
            return customerOptions.filter({
                "CreateQuotation.useMemo[filteredCustomerOptions]": (option)=>normalizeText(option.name).includes(query) || normalizeText(option.groupName).includes(query) || normalizeText(option.subtitle).includes(query)
            }["CreateQuotation.useMemo[filteredCustomerOptions]"]).slice(0, 8);
        }
    }["CreateQuotation.useMemo[filteredCustomerOptions]"], [
        customerOptions,
        customerName
    ]);
    const shouldRequireExistingCustomer = !isSampleSource && customerOptions.length > 0;
    const canCreateQuotationForCustomer = !shouldRequireExistingCustomer || Boolean(selectedCustomerRecord);
    const selectCustomerOption = (option)=>{
        setCustomerName(option.name);
        setGroupName(option.groupName || '');
        setGstName(option.gstName || option.name);
        if (option.gstNumber) setGstNumber(option.gstNumber);
        setCustomerSearchOpen(false);
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CreateQuotation.useEffect": ()=>{
            if (!customerName.trim()) {
                if (gstNumber !== '') setGstNumber('');
                if (gstName !== '') setGstName('');
                return;
            }
            const trimmedCust = customerName.trim();
            if (!gstName.trim() || gstName === ((quotationDraft === null || quotationDraft === void 0 ? void 0 : quotationDraft.customer) || (quotationDraft === null || quotationDraft === void 0 ? void 0 : quotationDraft.company) || '')) {
                if (gstName !== trimmedCust) {
                    setGstName(trimmedCust);
                }
            }
            // Maintain pre-filled GST if we are loading the original draft customer
            if (quotationDraft && quotationDraft.gstNumber && customerName === (quotationDraft.customer || quotationDraft.company)) {
                if (gstNumber !== quotationDraft.gstNumber) {
                    setGstNumber(quotationDraft.gstNumber);
                }
                return;
            }
            const matchedLead = leads.find({
                "CreateQuotation.useEffect.matchedLead": (l)=>{
                    var _l_companyName, _l_projectName;
                    return ((_l_companyName = l.companyName) === null || _l_companyName === void 0 ? void 0 : _l_companyName.toLowerCase()) === customerName.trim().toLowerCase() || ((_l_projectName = l.projectName) === null || _l_projectName === void 0 ? void 0 : _l_projectName.toLowerCase()) === customerName.trim().toLowerCase();
                }
            }["CreateQuotation.useEffect.matchedLead"]);
            if (matchedLead) {
                const leadGroup = matchedLead.groupName || matchedLead.group_name || '';
                if (!groupName.trim() && leadGroup) {
                    setGroupName(leadGroup);
                }
                if (matchedLead.gstNumber && gstNumber !== matchedLead.gstNumber) {
                    setGstNumber(matchedLead.gstNumber);
                }
                // Auto-fetch product from lead
                if (matchedLead.requiredProducts) {
                    setItems({
                        "CreateQuotation.useEffect": (prevItems)=>{
                            // Only auto-fill if the user hasn't explicitly added items yet
                            if (prevItems.length === 1 && !prevItems[0].productName.trim()) {
                                const prodName = matchedLead.requiredProducts;
                                const matchedProduct = productCatalog.find({
                                    "CreateQuotation.useEffect.matchedProduct": (p)=>p.name === prodName
                                }["CreateQuotation.useEffect.matchedProduct"]);
                                return [
                                    {
                                        ...prevItems[0],
                                        productName: prodName,
                                        quantity: matchedLead.expectedQuantities ? parseInt(matchedLead.expectedQuantities) || 1 : 1,
                                        productId: matchedProduct ? matchedProduct.dbId || matchedProduct.id : undefined,
                                        code: matchedProduct ? matchedProduct.id || matchedProduct.product_code : undefined,
                                        productDetails: (matchedProduct === null || matchedProduct === void 0 ? void 0 : matchedProduct.description) || '',
                                        unitPrice: (matchedProduct === null || matchedProduct === void 0 ? void 0 : matchedProduct.price) ? Number(matchedProduct.price) : 100
                                    }
                                ];
                            }
                            return prevItems;
                        }
                    }["CreateQuotation.useEffect"]);
                }
                if (matchedLead.gstNumber) return;
            }
            const matchedCustomer = customers.find({
                "CreateQuotation.useEffect.matchedCustomer": (c)=>{
                    var _c_name;
                    return ((_c_name = c.name) === null || _c_name === void 0 ? void 0 : _c_name.toLowerCase()) === customerName.trim().toLowerCase();
                }
            }["CreateQuotation.useEffect.matchedCustomer"]);
            if (matchedCustomer && (matchedCustomer.gst || matchedCustomer.gstNumber)) {
                const custGst = matchedCustomer.gst || matchedCustomer.gstNumber;
                if (gstNumber !== custGst) {
                    setGstNumber(custGst);
                }
            }
        }
    }["CreateQuotation.useEffect"], [
        customerName,
        groupName,
        leads,
        customers,
        quotationDraft,
        productCatalog,
        gstNumber,
        gstName
    ]);
    const formatINR = (value)=>{
        if (value >= 100000) {
            return "₹".concat((value / 100000).toFixed(2), " L");
        }
        return "₹".concat(Math.round(value).toLocaleString('en-IN'));
    };
    const initialItemsCount = quotationDraft && Array.isArray(quotationDraft.items) ? quotationDraft.items.length : 1;
    const itemIdCounter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(initialItemsCount + 1);
    const handleAddItem = ()=>{
        setItems([
            ...items,
            {
                id: itemIdCounter.current++,
                productName: '',
                productDetails: '',
                quantity: 1,
                unitPrice: 100,
                discount: 0,
                tax: 18
            }
        ]);
    };
    const handleRemoveItem = (id)=>{
        if (items.length === 1) return; // Keep at least one row
        setItems(items.filter((item)=>item.id !== id));
    };
    const handleRowChange = (id, field, value)=>{
        setItems(items.map((item)=>{
            if (item.id === id) {
                const updatedItem = {
                    ...item,
                    [field]: value
                };
                if (field === 'productName') {
                    const matchedProduct = productCatalog.find((p)=>p.name === value);
                    if (matchedProduct) {
                        updatedItem.productId = matchedProduct.dbId || matchedProduct.id;
                        updatedItem.code = matchedProduct.id || matchedProduct.product_code;
                        if (matchedProduct.description) {
                            updatedItem.productDetails = matchedProduct.description;
                        }
                        if (matchedProduct.price) {
                            updatedItem.unitPrice = Number(matchedProduct.price);
                        }
                    }
                }
                return updatedItem;
            }
            return item;
        }));
    };
    const handleProductSelect = (id, product)=>{
        setItems(items.map((item)=>{
            if (item.id === id) {
                return {
                    ...item,
                    productName: product.name,
                    productId: product.id,
                    code: product.code,
                    productDetails: product.description || item.productDetails || '',
                    unitPrice: Number(product.price || product.selling_price || product.base_price || 100),
                    tax: product.gst !== undefined ? product.gst : item.tax || 18
                };
            }
            return item;
        }));
    };
    // Calculations
    let subtotal = 0;
    let discountAmtTotal = 0;
    let taxAmtTotal = 0;
    let grandTotal = 0;
    items.forEach((item)=>{
        const itemSubtotal = item.quantity * item.unitPrice;
        const itemDiscountAmt = itemSubtotal * (item.discount || 0) / 100;
        const itemTaxable = itemSubtotal - itemDiscountAmt;
        const itemTaxAmt = itemTaxable * (item.tax || 0) / 100;
        subtotal += itemSubtotal;
        discountAmtTotal += itemDiscountAmt;
        taxAmtTotal += itemTaxAmt;
        grandTotal += itemTaxable + itemTaxAmt;
    });
    grandTotal += transportCharge || 0;
    const effectiveDiscountPercent = subtotal > 0 ? (discountAmtTotal / subtotal * 100).toFixed(1) : 0;
    const handleSubmit = (e)=>{
        e.preventDefault();
        if (!canCreateQuotationForCustomer) {
            alert('Please create this lead first, then generate the quotation from the saved lead/customer.');
            return;
        }
        if (!customerName.trim() || !gstName.trim() || !gstNumber.trim()) {
            alert('Please fill out Customer Name, GST Name, and GST Number.');
            return;
        }
        // Ensure all items have names and specifications
        const invalidItemName = items.some((item)=>!item.productName.trim());
        if (invalidItemName) {
            alert('Please fill out the product name for all items.');
            return;
        }
        const invalidItemDetails = items.some((item)=>!item.productDetails || !item.productDetails.trim());
        if (invalidItemDetails) {
            alert('Please fill out specifications/color details for all items.');
            return;
        }
        const daysMatch = paymentTerms.match(/^(\d+)\s*Days$/i);
        if (daysMatch) {
            const days = parseInt(daysMatch[1], 10);
            if (days > maxDays) {
                alert("Payment Terms cannot exceed ".concat(maxDays, " days."));
                return;
            }
        }
        // Map items list to a single display string e.g., "Steel Pipes (x10), Joints (x20)"
        const itemsDescription = items.map((item)=>"".concat(item.productName, " (").concat(item.productDetails, ") (x").concat(item.quantity, ")")).join(', ');
        const payload = {
            customerName: customerName.trim(),
            groupName: groupName.trim(),
            gstName: gstName.trim(),
            gstNumber: gstNumber.trim(),
            items: itemsDescription,
            detailedItems: items.map((item)=>{
                const matched = productCatalog.find((p)=>p.name === item.productName) || {};
                return {
                    productId: item.productId || matched.dbId || null,
                    productName: item.productName,
                    productDetails: item.productDetails,
                    code: item.code || matched.id || 'PRD-N/A',
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discount: item.discount || 0,
                    tax: item.tax || 0
                };
            }),
            quantity: items.reduce((sum, item)=>sum + item.quantity, 0),
            price: items.length > 0 ? items[0].unitPrice : 0,
            discount: 0,
            tax: 0,
            transportCharge: transportCharge || 0,
            expectedTransportationCost: transportCharge || 0,
            totalAmount: Math.round(grandTotal),
            date: new Date().toISOString().split('T')[0],
            validTill,
            paymentTerms,
            notes: notes.trim(),
            source: isSampleSource ? 'SAMPLE' : isLeadSource || (selectedCustomerRecord === null || selectedCustomerRecord === void 0 ? void 0 : selectedCustomerRecord.type) === 'Lead' ? 'LEAD' : undefined,
            sourceId: isSampleSource ? sourceId : isLeadSource ? (quotationDraft === null || quotationDraft === void 0 ? void 0 : quotationDraft.leadId) || (quotationDraft === null || quotationDraft === void 0 ? void 0 : quotationDraft.sourceId) : (selectedCustomerRecord === null || selectedCustomerRecord === void 0 ? void 0 : selectedCustomerRecord.type) === 'Lead' ? selectedCustomerRecord.id : undefined,
            leadId: isLeadSource ? (quotationDraft === null || quotationDraft === void 0 ? void 0 : quotationDraft.leadId) || (quotationDraft === null || quotationDraft === void 0 ? void 0 : quotationDraft.sourceId) : (selectedCustomerRecord === null || selectedCustomerRecord === void 0 ? void 0 : selectedCustomerRecord.type) === 'Lead' ? selectedCustomerRecord.id : undefined
        };
        const submitResult = async ()=>{
            let success = false;
            try {
                if (targetQuotationId) {
                    const res = finalizeQuotation(targetQuotationId, payload);
                    if (res.success) {
                        success = true;
                        onCancel(); // Navigate back to list
                    } else {
                        alert(res.message);
                    }
                } else {
                    const res = await onAddQuotation(payload);
                    success = (res === null || res === void 0 ? void 0 : res.success) !== false;
                }
            } catch (err) {
                console.error(err);
            }
            if (success) {
                clearDraft();
                clearQuotationDraft();
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
                            type: "button",
                            className: "card-top-icon-btn",
                            onClick: ()=>{
                                clearQuotationDraft();
                                onCancel();
                            },
                            style: {
                                width: '36px',
                                height: '36px',
                                background: '#f1f3f5',
                                color: '#000'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/components/CreateQuotation.jsx",
                                lineNumber: 501,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/CreateQuotation.jsx",
                            lineNumber: 492,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "module-title",
                            children: "Compose Full Quotation Proposal"
                        }, void 0, false, {
                            fileName: "[project]/components/CreateQuotation.jsx",
                            lineNumber: 503,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/CreateQuotation.jsx",
                    lineNumber: 491,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/CreateQuotation.jsx",
                lineNumber: 490,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                },
                children: [
                    isSampleSource && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sample-source-banner",
                        style: {
                            background: 'rgba(14, 165, 233, 0.1)',
                            border: '1px solid rgba(14, 165, 233, 0.25)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: '#38bdf8',
                            fontSize: '13.5px',
                            fontWeight: '500'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: '16px'
                                },
                                children: "ℹ️"
                            }, void 0, false, {
                                fileName: "[project]/components/CreateQuotation.jsx",
                                lineNumber: 521,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "Generated from Sample ",
                                    sourceId ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: [
                                            "#SMP-",
                                            String(sourceId).padStart(3, '0')
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 522,
                                        columnNumber: 53
                                    }, this) : '',
                                    ". Customer selection is locked."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateQuotation.jsx",
                                lineNumber: 522,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateQuotation.jsx",
                        lineNumber: 509,
                        columnNumber: 11
                    }, this),
                    isLeadSource && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lead-source-banner",
                        style: {
                            background: 'rgba(14, 165, 233, 0.1)',
                            border: '1px solid rgba(14, 165, 233, 0.25)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: '#38bdf8',
                            fontSize: '13.5px',
                            fontWeight: '500',
                            marginBottom: '20px'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                style: {
                                    fontSize: '16px'
                                },
                                children: "ℹ️"
                            }, void 0, false, {
                                fileName: "[project]/components/CreateQuotation.jsx",
                                lineNumber: 540,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    "Generated from Lead ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$idGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["displayEntityId"])((quotationDraft === null || quotationDraft === void 0 ? void 0 : quotationDraft.leadId) || (quotationDraft === null || quotationDraft === void 0 ? void 0 : quotationDraft.sourceId))
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 541,
                                        columnNumber: 39
                                    }, this),
                                    ". Pre-filled from lead details — all fields are editable."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateQuotation.jsx",
                                lineNumber: 541,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateQuotation.jsx",
                        lineNumber: 527,
                        columnNumber: 11
                    }, this),
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
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 548,
                                        columnNumber: 13
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
                                                value: customerName,
                                                onChange: (e)=>{
                                                    const nextValue = e.target.value;
                                                    const nextMatch = customerOptions.find((option)=>normalizeText(option.name) === normalizeText(nextValue));
                                                    setCustomerName(nextValue);
                                                    setCustomerSearchOpen(true);
                                                    if (!nextMatch) {
                                                        setGroupName('');
                                                    }
                                                },
                                                onFocus: ()=>setCustomerSearchOpen(true),
                                                onBlur: ()=>setTimeout(()=>setCustomerSearchOpen(false), 180),
                                                required: true,
                                                disabled: isSampleSource,
                                                style: {
                                                    paddingRight: '38px',
                                                    ...isSampleSource ? {
                                                        opacity: 0.65,
                                                        cursor: 'not-allowed',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                                    } : {}
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                lineNumber: 550,
                                                columnNumber: 15
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
                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                lineNumber: 573,
                                                columnNumber: 15
                                            }, this),
                                            customerSearchOpen && !isSampleSource && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                                children: filteredCustomerOptions.length > 0 ? filteredCustomerOptions.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        className: "smart-search-item",
                                                        onMouseDown: (e)=>{
                                                            e.preventDefault();
                                                            selectCustomerOption(option);
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
                                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                                lineNumber: 601,
                                                                columnNumber: 25
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
                                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                                lineNumber: 602,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, option.key, true, {
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 591,
                                                        columnNumber: 23
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
                                                    children: "No lead/customer found. Create the lead first."
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateQuotation.jsx",
                                                    lineNumber: 606,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                lineNumber: 575,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 549,
                                        columnNumber: 13
                                    }, this),
                                    customerName.trim() && !canCreateQuotationForCustomer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            marginTop: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '10px',
                                            background: '#fff7ed',
                                            border: '1px solid #fed7aa',
                                            borderRadius: '10px',
                                            padding: '9px 10px',
                                            color: '#9a3412',
                                            fontSize: '12px',
                                            fontWeight: 700
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                                        size: 14
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 616,
                                                        columnNumber: 19
                                                    }, this),
                                                    " New company. Create lead first."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                lineNumber: 615,
                                                columnNumber: 17
                                            }, this),
                                            onCreateLead && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: onCreateLead,
                                                style: {
                                                    border: '1px solid #fdba74',
                                                    background: '#ffffff',
                                                    color: '#9a3412',
                                                    borderRadius: '8px',
                                                    padding: '5px 9px',
                                                    fontSize: '11.5px',
                                                    fontWeight: 800,
                                                    cursor: 'pointer',
                                                    whiteSpace: 'nowrap'
                                                },
                                                children: "Create Lead"
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                lineNumber: 619,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 614,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateQuotation.jsx",
                                lineNumber: 547,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "form-group",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "form-label",
                                        children: "Group Name"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 627,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        className: "form-input",
                                        placeholder: "e.g. NHAI Group, L&T Infrastructure",
                                        value: groupName,
                                        onChange: (e)=>setGroupName(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 628,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateQuotation.jsx",
                                lineNumber: 626,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "form-group",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "form-label",
                                        children: "GST Name *"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 637,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        className: "form-input",
                                        placeholder: "Legal name as per GST registration",
                                        value: gstName,
                                        onChange: (e)=>setGstName(e.target.value),
                                        required: true
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 638,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateQuotation.jsx",
                                lineNumber: 636,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "form-group",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "form-label",
                                        children: "GST Number *"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 648,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        className: "form-input",
                                        placeholder: "e.g. 09ABCDE1234F1Z5",
                                        value: gstNumber,
                                        onChange: (e)=>setGstNumber(e.target.value.toUpperCase()),
                                        maxLength: 15,
                                        required: true
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 649,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateQuotation.jsx",
                                lineNumber: 647,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateQuotation.jsx",
                        lineNumber: 546,
                        columnNumber: 9
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
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 663,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "date",
                                        className: "form-input",
                                        value: validTill,
                                        onChange: (e)=>setValidTill(e.target.value),
                                        required: true
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 664,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateQuotation.jsx",
                                lineNumber: 662,
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
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"], {
                                                size: 12
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                lineNumber: 674,
                                                columnNumber: 15
                                            }, this),
                                            " Expected Transportation Cost (₹)"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 673,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        className: "form-input",
                                        placeholder: "e.g. 2500",
                                        value: transportCharge || '',
                                        onChange: (e)=>setTransportCharge(Number(e.target.value) || 0)
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 676,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateQuotation.jsx",
                                lineNumber: 672,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateQuotation.jsx",
                        lineNumber: 661,
                        columnNumber: 9
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
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 689,
                                        columnNumber: 13
                                    }, this),
                                    " Line Items Catalogue"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateQuotation.jsx",
                                lineNumber: 688,
                                columnNumber: 11
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
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 695,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: {
                                                            width: '10%'
                                                        },
                                                        children: "Quantity *"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 696,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: {
                                                            width: '12%'
                                                        },
                                                        children: "Unit Price (₹) *"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 697,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: {
                                                            width: '10%'
                                                        },
                                                        children: "Discount (%)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 698,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: {
                                                            width: '10%'
                                                        },
                                                        children: "GST (%)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 699,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: {
                                                            width: '13%'
                                                        },
                                                        children: "Total Amount"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 700,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                        style: {
                                                            width: '5%',
                                                            textAlign: 'center'
                                                        },
                                                        children: "Action"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 701,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                lineNumber: 694,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/CreateQuotation.jsx",
                                            lineNumber: 693,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                            children: items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
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
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            position: 'relative'
                                                                        },
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$ProductPicker$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                            value: item.productName ? {
                                                                                id: item.productId || 'temp-id',
                                                                                product_name: item.productName,
                                                                                product_code: item.code || ''
                                                                            } : null,
                                                                            onChange: (p)=>{
                                                                                if (p) {
                                                                                    handleProductSelect(item.id, {
                                                                                        id: p.id,
                                                                                        name: p.product_name,
                                                                                        code: p.product_code,
                                                                                        price: p.selling_price || p.price || p.base_price || 100,
                                                                                        unit: p.unit_of_measure || 'PCS',
                                                                                        gst: p.gst_rate || 18,
                                                                                        description: p.description
                                                                                    });
                                                                                } else {
                                                                                    handleRowChange(item.id, 'productId', null);
                                                                                    handleRowChange(item.id, 'productName', '');
                                                                                    handleRowChange(item.id, 'code', '');
                                                                                }
                                                                            },
                                                                            placeholder: "Search product...",
                                                                            showBadge: false
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/CreateQuotation.jsx",
                                                                            lineNumber: 710,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                                        lineNumber: 709,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        style: {
                                                                            position: 'relative'
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                type: "text",
                                                                                className: "form-input",
                                                                                placeholder: "Specifications / Color details * (e.g. Color: Grey, Size: M10)",
                                                                                value: item.productDetails || '',
                                                                                onChange: (e)=>{
                                                                                    handleRowChange(item.id, 'productDetails', e.target.value);
                                                                                    setActiveSpecsDropdownRow(item.id);
                                                                                },
                                                                                onFocus: ()=>setActiveSpecsDropdownRow(item.id),
                                                                                onBlur: ()=>setTimeout(()=>setActiveSpecsDropdownRow(null), 200),
                                                                                required: true,
                                                                                style: {
                                                                                    padding: '6px 12px',
                                                                                    fontSize: '12.5px',
                                                                                    width: '100%'
                                                                                }
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                                                lineNumber: 738,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            activeSpecsDropdownRow === item.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "smart-search-dropdown",
                                                                                style: {
                                                                                    width: '100%',
                                                                                    position: 'absolute',
                                                                                    top: '100%',
                                                                                    left: 0,
                                                                                    zIndex: 10,
                                                                                    marginTop: '4px'
                                                                                },
                                                                                children: (()=>{
                                                                                    const query = (item.productDetails || '').toLowerCase();
                                                                                    const catalogSpecs = Array.from(new Set(productCatalog.map((p)=>p.description).filter((d)=>d && d.trim() !== '')));
                                                                                    const allSpecs = Array.from(new Set([
                                                                                        ...catalogSpecs,
                                                                                        ...STANDARD_SPECIFICATIONS
                                                                                    ]));
                                                                                    const filtered = allSpecs.filter((spec)=>spec.toLowerCase().includes(query));
                                                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                                        children: filtered.map((spec)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "smart-search-item",
                                                                                                onClick: ()=>{
                                                                                                    handleRowChange(item.id, 'productDetails', spec);
                                                                                                    setActiveSpecsDropdownRow(null);
                                                                                                },
                                                                                                style: {
                                                                                                    padding: '8px 12px',
                                                                                                    cursor: 'pointer'
                                                                                                },
                                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    children: spec
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/components/CreateQuotation.jsx",
                                                                                                    lineNumber: 773,
                                                                                                    columnNumber: 41
                                                                                                }, this)
                                                                                            }, spec, false, {
                                                                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                                                                lineNumber: 769,
                                                                                                columnNumber: 39
                                                                                            }, this))
                                                                                    }, void 0, false);
                                                                                })()
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                                                lineNumber: 753,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                                        lineNumber: 737,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                                lineNumber: 708,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateQuotation.jsx",
                                                            lineNumber: 707,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            "data-label": "Quantity",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "number",
                                                                className: "form-input",
                                                                min: "1",
                                                                value: item.quantity,
                                                                onChange: (e)=>handleRowChange(item.id, 'quantity', Number(e.target.value)),
                                                                required: true,
                                                                style: {
                                                                    padding: '8px 12px'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                                lineNumber: 785,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateQuotation.jsx",
                                                            lineNumber: 784,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            "data-label": "Unit Price",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "number",
                                                                className: "form-input",
                                                                min: "0.01",
                                                                step: "0.01",
                                                                value: item.unitPrice,
                                                                onChange: (e)=>handleRowChange(item.id, 'unitPrice', Number(e.target.value)),
                                                                required: true,
                                                                style: {
                                                                    padding: '8px 12px'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                                lineNumber: 796,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateQuotation.jsx",
                                                            lineNumber: 795,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            "data-label": "Discount (%)",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "number",
                                                                className: "form-input",
                                                                min: "0",
                                                                max: "100",
                                                                value: item.discount || 0,
                                                                onChange: (e)=>handleRowChange(item.id, 'discount', Number(e.target.value)),
                                                                style: {
                                                                    padding: '8px 12px'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                                lineNumber: 808,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateQuotation.jsx",
                                                            lineNumber: 807,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            "data-label": "GST (%)",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "number",
                                                                className: "form-input",
                                                                min: "0",
                                                                max: "100",
                                                                value: item.tax !== undefined ? item.tax : 18,
                                                                onChange: (e)=>handleRowChange(item.id, 'tax', Number(e.target.value)),
                                                                style: {
                                                                    padding: '8px 12px'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                                lineNumber: 819,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateQuotation.jsx",
                                                            lineNumber: 818,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            "data-label": "Total Amount",
                                                            style: {
                                                                fontWeight: '700',
                                                                paddingLeft: '10px'
                                                            },
                                                            children: (()=>{
                                                                const itemSubtotal = item.quantity * item.unitPrice;
                                                                const itemDiscountAmt = itemSubtotal * (item.discount || 0) / 100;
                                                                const itemTaxable = itemSubtotal - itemDiscountAmt;
                                                                const itemTaxAmt = itemTaxable * (item.tax || 0) / 100;
                                                                return formatINR(itemTaxable + itemTaxAmt);
                                                            })()
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateQuotation.jsx",
                                                            lineNumber: 829,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            "data-label": "Action",
                                                            style: {
                                                                textAlign: 'center'
                                                            },
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                className: "btn-small btn-danger-small",
                                                                onClick: ()=>handleRemoveItem(item.id),
                                                                disabled: items.length === 1,
                                                                style: {
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    padding: '8px',
                                                                    opacity: items.length === 1 ? 0.4 : 1
                                                                },
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                    size: 13
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/CreateQuotation.jsx",
                                                                    lineNumber: 846,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                                lineNumber: 839,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateQuotation.jsx",
                                                            lineNumber: 838,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, item.id, true, {
                                                    fileName: "[project]/components/CreateQuotation.jsx",
                                                    lineNumber: 706,
                                                    columnNumber: 19
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/components/CreateQuotation.jsx",
                                            lineNumber: 704,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CreateQuotation.jsx",
                                    lineNumber: 692,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/CreateQuotation.jsx",
                                lineNumber: 691,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "btn-small btn-outline-small",
                                onClick: handleAddItem,
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
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 860,
                                        columnNumber: 13
                                    }, this),
                                    " Add Product Row"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateQuotation.jsx",
                                lineNumber: 854,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateQuotation.jsx",
                        lineNumber: 687,
                        columnNumber: 9
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
                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                lineNumber: 869,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                className: "form-textarea",
                                                style: {
                                                    minHeight: '135px'
                                                },
                                                placeholder: "Enter quotation instructions, custom bank details, dispatch terms...",
                                                value: notes,
                                                onChange: (e)=>setNotes(e.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                lineNumber: 870,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 868,
                                        columnNumber: 13
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
                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                lineNumber: 881,
                                                columnNumber: 15
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
                                                    ].includes(paymentTerms) : paymentTerms === term;
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
                                                                        setPaymentTerms('');
                                                                    } else {
                                                                        setPaymentTerms(term);
                                                                    }
                                                                },
                                                                style: {
                                                                    width: '16px',
                                                                    height: '16px',
                                                                    cursor: 'pointer'
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                                lineNumber: 887,
                                                                columnNumber: 23
                                                            }, this),
                                                            term
                                                        ]
                                                    }, term, true, {
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 886,
                                                        columnNumber: 21
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                lineNumber: 882,
                                                columnNumber: 15
                                            }, this),
                                            ![
                                                '7 Days',
                                                '15 Days',
                                                '20 Days'
                                            ].includes(paymentTerms) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                                        max: maxDays,
                                                        className: "form-input",
                                                        placeholder: "Enter number of days (max ".concat(maxDays, ")..."),
                                                        value: paymentTerms.replace(/ Days/gi, '').trim(),
                                                        onChange: (e)=>{
                                                            const val = e.target.value;
                                                            if (val && Number(val) > maxDays) {
                                                                setPaymentTerms("".concat(maxDays, " Days"));
                                                            } else {
                                                                setPaymentTerms(val ? "".concat(val, " Days") : '');
                                                            }
                                                        },
                                                        required: true,
                                                        style: {
                                                            flex: 1
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 906,
                                                        columnNumber: 19
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
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 924,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                lineNumber: 905,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 880,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateQuotation.jsx",
                                lineNumber: 867,
                                columnNumber: 11
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
                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                lineNumber: 933,
                                                columnNumber: 15
                                            }, this),
                                            " Totals Invoice Summary"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 932,
                                        columnNumber: 13
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
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 938,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontWeight: '600',
                                                            color: 'var(--color-text-primary)'
                                                        },
                                                        children: formatINR(subtotal)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 939,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                lineNumber: 937,
                                                columnNumber: 15
                                            }, this),
                                            discountAmtTotal > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    color: '#dc2626'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            "Discount Applied (",
                                                            Number(effectiveDiscountPercent),
                                                            "%):"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 944,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            "-",
                                                            formatINR(discountAmtTotal)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 945,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                lineNumber: 943,
                                                columnNumber: 17
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
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 950,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontWeight: '600',
                                                            color: 'var(--color-text-primary)'
                                                        },
                                                        children: [
                                                            "+",
                                                            formatINR(taxAmtTotal)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 951,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                lineNumber: 949,
                                                columnNumber: 15
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
                                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                                lineNumber: 955,
                                                                columnNumber: 85
                                                            }, this),
                                                            " Expected Transportation Cost:"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 955,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            fontWeight: '600'
                                                        },
                                                        children: [
                                                            "+",
                                                            formatINR(transportCharge || 0)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 956,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                lineNumber: 954,
                                                columnNumber: 15
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
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 960,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        style: {
                                                            color: 'var(--color-text-primary)'
                                                        },
                                                        children: formatINR(grandTotal)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CreateQuotation.jsx",
                                                        lineNumber: 961,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CreateQuotation.jsx",
                                                lineNumber: 959,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateQuotation.jsx",
                                        lineNumber: 936,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateQuotation.jsx",
                                lineNumber: 931,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateQuotation.jsx",
                        lineNumber: 865,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "form-actions",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                className: "form-submit-btn",
                                children: "Publish Quotation Proposal"
                            }, void 0, false, {
                                fileName: "[project]/components/CreateQuotation.jsx",
                                lineNumber: 969,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "btn-small btn-outline-small",
                                onClick: ()=>{
                                    clearQuotationDraft();
                                    onCancel();
                                },
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/components/CreateQuotation.jsx",
                                lineNumber: 970,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateQuotation.jsx",
                        lineNumber: 968,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CreateQuotation.jsx",
                lineNumber: 507,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/CreateQuotation.jsx",
        lineNumber: 489,
        columnNumber: 5
    }, this);
}
_s(CreateQuotation, "uSR9Xr+kTN8sNCfRHJVKAs1TzwY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$hooks$2f$useFormDraft$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormDraft"]
    ];
});
_c = CreateQuotation;
var _c;
__turbopack_context__.k.register(_c, "CreateQuotation");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_CreateQuotation_jsx_eed69662._.js.map