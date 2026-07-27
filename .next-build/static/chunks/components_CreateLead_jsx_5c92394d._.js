(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/CreateLead.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CreateLead
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.mjs [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.mjs [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.mjs [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flask-conical.mjs [app-client] (ecmascript) <export default as FlaskConical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package.mjs [app-client] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.mjs [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.mjs [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/truck.mjs [app-client] (ecmascript) <export default as Truck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.all.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/context/AuthContext.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$ERPContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/shared/context/ERPContext.jsx [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-client] (ecmascript)");
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
const PRODUCT_CATALOG = {
    'FRC Manhole Covers': {
        'Square Frame Round Cover': [
            {
                name: 'Square Frame Round Cover 24x24',
                code: 'FRCSQRC2424'
            },
            {
                name: 'Square Frame Round Cover 30x30',
                code: 'FRCSQRC3030'
            }
        ],
        'Round Frame Round Cover': [
            {
                name: 'Round Frame Round Cover 18 Dia',
                code: 'FRCRFRC18'
            },
            {
                name: 'Round Frame Round Cover 24 Dia',
                code: 'FRCRFRC24'
            }
        ],
        'Square Frame Square Cover': [
            {
                name: 'Square Frame Square Cover 12x12',
                code: 'FRCSFSC1212'
            },
            {
                name: 'Square Frame Square Cover 18x18',
                code: 'FRCSFSC1818'
            },
            {
                name: 'Square Frame Square Cover 24x24',
                code: 'FRCSFSC2424'
            }
        ],
        'Round Covers': [
            {
                name: 'Round Cover 18 Dia',
                code: 'FRCROFROC18'
            },
            {
                name: 'Round Cover 24 Dia',
                code: 'FRCROFROC24'
            }
        ],
        'Cover Plates': [
            {
                name: 'Cover Plate Standard',
                code: 'FRCCP-STD'
            }
        ],
        'Gully Tops': [
            {
                name: 'Gully Top Standard',
                code: 'FRCGT-STD'
            }
        ],
        'Trench Covers (Open Channel)': [
            {
                name: 'Trench Cover (Open Channel) Standard',
                code: 'FRCTSOC-STD'
            }
        ],
        'Trench Covers (Precast)': [
            {
                name: 'Trench Cover (Precast) Standard',
                code: 'FRCTPEC-STD'
            }
        ]
    },
    'Concrete Cover Blocks': {
        'Wall Cover Blocks': [
            {
                name: 'Wall Cover Block 20mm',
                code: 'WCB-20'
            },
            {
                name: 'Wall Cover Block 25mm',
                code: 'WCB-25'
            }
        ],
        'Pile Cover Blocks': [
            {
                name: 'Pile Cover Block 50mm',
                code: 'PCB-50'
            },
            {
                name: 'Pile Cover Block 75mm',
                code: 'PCB-75'
            }
        ],
        'Heavy Duty Cover Blocks': [
            {
                name: 'Heavy Duty Cover Block 40mm',
                code: 'HTCB-40'
            },
            {
                name: 'Heavy Duty Cover Block 50mm',
                code: 'HTCB-50'
            }
        ],
        'Double Tie Cover Blocks': [
            {
                name: 'Double Tie Cover Block 35mm',
                code: 'DTCB-35'
            },
            {
                name: 'Double Tie Cover Block 40mm',
                code: 'DTCB-40'
            }
        ]
    },
    'FRP Manhole Covers': {
        'Square Manhole Covers': [
            {
                name: 'FRP Square Manhole Cover 24x24',
                code: 'FRPMHC2424'
            },
            {
                name: 'HIMALAYA FRP Square Manhole Cover 30x30',
                code: 'HIM-FRP-MHC3030'
            }
        ],
        'Round Manhole Covers': [
            {
                name: 'FRP Round Manhole Cover 18 Dia',
                code: 'FRPMHC18DIA'
            },
            {
                name: 'FRP Round Manhole Cover 24 Dia',
                code: 'FRPMHC24DIA'
            }
        ]
    },
    'FRP Rainwater Covers': {
        'Rainwater Covers': [
            {
                name: 'HIMALAYA FRP Rainwater Cover Standard',
                code: 'HIM-FRP-RCS-STD'
            }
        ]
    },
    'FRP Water Gully Covers': {
        'Water Gully Covers': [
            {
                name: 'HIMALAYA FRP Water Gully Cover Standard',
                code: 'HIM-FRP-WGC-STD'
            }
        ]
    },
    'FRP Open Drain Covers': {
        'Open Drain Covers': [
            {
                name: 'HIMALAYA FRP Open Drain Cover Standard',
                code: 'HIM-FRP-ONGC-STD'
            }
        ]
    },
    'FRP Gratings': {
        'Moulded Gratings': [
            {
                name: 'FRP Moulded Grating 38mm',
                code: 'FRP-MOULDED-GRATING-38'
            }
        ]
    }
};
function CreateLead(param) {
    let { onAddLead, onGenerateQuotation, onCancel, editingLead, onDeleteLead, leads = [] } = param;
    var _editingLead_address, _editingLead_address1, _editingLead_address2, _editingLead_address3, _editingLead_timeline_, _editingLead_timeline;
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const erpState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"])({
        "CreateLead.useERPStore[erpState]": (s)=>s.state
    }["CreateLead.useERPStore[erpState]"]);
    const dbCatalog = (erpState === null || erpState === void 0 ? void 0 : erpState.productCatalog) || [];
    const currentCatalog = dbCatalog.length > 0 ? dbCatalog.map((p)=>({
            name: p.name,
            code: p.id || p.code,
            price: Number(p.price || p.selling_price || 100),
            gst: Number(p.gst || p.gst_rate || 18),
            description: p.description || ''
        })) : Object.values(PRODUCT_CATALOG).flatMap((subCats)=>Object.values(subCats).flat()).map((p)=>({
            ...p,
            price: 100,
            gst: 18,
            description: ''
        }));
    const getDefaultSpecification = (productName, catalogProduct)=>{
        var _catalogProduct_description;
        if (catalogProduct === null || catalogProduct === void 0 ? void 0 : (_catalogProduct_description = catalogProduct.description) === null || _catalogProduct_description === void 0 ? void 0 : _catalogProduct_description.trim()) return catalogProduct.description.trim();
        const thicknessMatch = productName.match(/(\d+)\s*mm/i);
        const parts = [];
        if (thicknessMatch) parts.push("Thickness: ".concat(thicknessMatch[1], "mm"));
        parts.push('Color: Grey');
        if (productName.toLowerCase().includes('cover block')) parts.push('Grade: M10');
        return parts.join('\n');
    };
    const createEmptyItem = (id)=>({
            id,
            productName: '',
            productCode: '',
            specification: '',
            quantity: 1,
            unitPrice: 100,
            discount: 0,
            tax: 18,
            additionalCharges: 0
        });
    const [activeDropdownRow, setActiveDropdownRow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loginTime, setLoginTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CreateLead.useEffect": ()=>{
            const now = new Date();
            setLoginTime({
                date: now.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }),
                time: now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })
            });
        }
    }["CreateLead.useEffect"], []);
    // Form states - Unified via useFormDraft
    const getInitialItems = ()=>{
        var _editingLead_detailedItems;
        if ((editingLead === null || editingLead === void 0 ? void 0 : (_editingLead_detailedItems = editingLead.detailedItems) === null || _editingLead_detailedItems === void 0 ? void 0 : _editingLead_detailedItems.length) > 0) {
            return editingLead.detailedItems.map((item, idx)=>({
                    id: idx + 1,
                    productName: item.productName || '',
                    productCode: item.productCode || item.code || '',
                    specification: item.specification || '',
                    quantity: item.quantity || 1,
                    unitPrice: item.unitPrice || 100,
                    discount: item.discount || 0,
                    tax: item.tax || 18,
                    additionalCharges: item.additionalCharges || 0
                }));
        }
        if (editingLead && (editingLead.productInterested || editingLead.requirements)) {
            return [
                {
                    id: 1,
                    productName: editingLead.productInterested || editingLead.requirements,
                    productCode: '',
                    specification: '',
                    quantity: editingLead.estimatedQuantity || 1,
                    unitPrice: 100,
                    discount: 0,
                    tax: 18,
                    additionalCharges: 0
                }
            ];
        }
        return [
            createEmptyItem(1)
        ];
    };
    const getInitialSampleItems = (baseItems)=>{
        var _editingLead_detailedItems;
        const existingMap = {};
        ((editingLead === null || editingLead === void 0 ? void 0 : editingLead.sampleItems) || []).forEach((si)=>{
            existingMap[si.id] = si;
        });
        const itms = (editingLead === null || editingLead === void 0 ? void 0 : (_editingLead_detailedItems = editingLead.detailedItems) === null || _editingLead_detailedItems === void 0 ? void 0 : _editingLead_detailedItems.length) > 0 ? editingLead.detailedItems.map((it, idx)=>({
                id: idx + 1,
                productName: it.productName || ''
            })) : [
            {
                id: 1,
                productName: (editingLead === null || editingLead === void 0 ? void 0 : editingLead.productInterested) || 'Uni Paver 60mm'
            }
        ];
        return itms.map((it)=>existingMap[it.id] || {
                id: it.id,
                productName: it.productName,
                enabled: false,
                quantity: 1,
                expectedDate: ''
            });
    };
    const initialItems = getInitialItems();
    const emptyLeadForm = {
        projectName: (editingLead === null || editingLead === void 0 ? void 0 : editingLead.projectName) || '',
        groupName: (editingLead === null || editingLead === void 0 ? void 0 : editingLead.groupName) || '',
        companyName: (editingLead === null || editingLead === void 0 ? void 0 : editingLead.companyName) || '',
        gstNumber: (editingLead === null || editingLead === void 0 ? void 0 : editingLead.gstNumber) || '',
        siteInchargeName: (editingLead === null || editingLead === void 0 ? void 0 : editingLead.siteInchargeName) || (editingLead === null || editingLead === void 0 ? void 0 : editingLead.contactPerson) || '',
        siteInchargeMobile: (editingLead === null || editingLead === void 0 ? void 0 : editingLead.siteInchargeMobile) || (editingLead === null || editingLead === void 0 ? void 0 : editingLead.phone) || '',
        officeContact: (editingLead === null || editingLead === void 0 ? void 0 : editingLead.officeContact) || '',
        email: (editingLead === null || editingLead === void 0 ? void 0 : editingLead.email) || '',
        remarks: (editingLead === null || editingLead === void 0 ? void 0 : editingLead.notes) || (editingLead === null || editingLead === void 0 ? void 0 : editingLead.requirements) || '',
        addressLine1: (editingLead === null || editingLead === void 0 ? void 0 : (_editingLead_address = editingLead.address) === null || _editingLead_address === void 0 ? void 0 : _editingLead_address.line1) || '',
        city: (editingLead === null || editingLead === void 0 ? void 0 : (_editingLead_address1 = editingLead.address) === null || _editingLead_address1 === void 0 ? void 0 : _editingLead_address1.city) || '',
        stateName: (editingLead === null || editingLead === void 0 ? void 0 : (_editingLead_address2 = editingLead.address) === null || _editingLead_address2 === void 0 ? void 0 : _editingLead_address2.state) || 'Uttar Pradesh',
        pincode: (editingLead === null || editingLead === void 0 ? void 0 : (_editingLead_address3 = editingLead.address) === null || _editingLead_address3 === void 0 ? void 0 : _editingLead_address3.pincode) || '',
        sampleRequired: (editingLead === null || editingLead === void 0 ? void 0 : editingLead.sampleRequired) || false,
        expectedTransportationCost: Number((editingLead === null || editingLead === void 0 ? void 0 : editingLead.expectedTransportationCost) || 0),
        items: initialItems,
        sampleItems: getInitialSampleItems(initialItems),
        submitAction: 'lead'
    };
    const { formData, setFormData, clearDraft } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$hooks$2f$useFormDraft$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormDraft"])({
        draftKey: editingLead ? "erp_draft_edit_lead_".concat(editingLead.id) : 'erp_draft_create_lead_new',
        initialData: emptyLeadForm
    });
    const { projectName, groupName, companyName, gstNumber, siteInchargeName, siteInchargeMobile, officeContact, email, remarks, addressLine1, city, stateName, pincode, sampleRequired, expectedTransportationCost, items, sampleItems, submitAction } = formData;
    const updateField = (field, value)=>{
        setFormData((prev)=>({
                ...prev,
                [field]: typeof value === 'function' ? value(prev[field]) : value
            }));
    };
    const setProjectName = (val)=>updateField('projectName', val);
    const setGroupName = (val)=>updateField('groupName', val);
    const setCompanyName = (val)=>updateField('companyName', val);
    const setGstNumber = (val)=>updateField('gstNumber', val);
    const setSiteInchargeName = (val)=>updateField('siteInchargeName', val);
    const setSiteInchargeMobile = (val)=>updateField('siteInchargeMobile', val);
    const setOfficeContact = (val)=>updateField('officeContact', val);
    const setEmail = (val)=>updateField('email', val);
    const setRemarks = (val)=>updateField('remarks', val);
    const setAddressLine1 = (val)=>updateField('addressLine1', val);
    const setCity = (val)=>updateField('city', val);
    const setStateName = (val)=>updateField('stateName', val);
    const setPincode = (val)=>updateField('pincode', val);
    const setSampleRequired = (val)=>updateField('sampleRequired', val);
    const setExpectedTransportationCost = (val)=>updateField('expectedTransportationCost', val);
    const setItems = (val)=>updateField('items', val);
    const setSampleItems = (val)=>updateField('sampleItems', val);
    const setSubmitAction = (val)=>updateField('submitAction', val);
    const salesExecutive = (user === null || user === void 0 ? void 0 : user.name) || 'Alex Carter';
    const chiefDirector = (editingLead === null || editingLead === void 0 ? void 0 : editingLead.chiefDirector) || 'Director Rajesh';
    const itemIdCounter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(2);
    // Sync sampleItems whenever items (product list) changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CreateLead.useEffect": ()=>{
            setSampleItems({
                "CreateLead.useEffect": (prev)=>{
                    const prevMap = {};
                    prev.forEach({
                        "CreateLead.useEffect": (si)=>{
                            prevMap[si.id] = si;
                        }
                    }["CreateLead.useEffect"]);
                    return items.map({
                        "CreateLead.useEffect": (it)=>prevMap[it.id] ? {
                                ...prevMap[it.id],
                                productName: it.productName
                            } // keep config, refresh name
                             : {
                                id: it.id,
                                productName: it.productName,
                                enabled: false,
                                quantity: 1,
                                expectedDate: ''
                            }
                    }["CreateLead.useEffect"]);
                }
            }["CreateLead.useEffect"]);
        }
    }["CreateLead.useEffect"], [
        items
    ]);
    const updateSampleItem = (id, field, value)=>{
        setSampleItems((prev)=>prev.map((si)=>si.id === id ? {
                    ...si,
                    [field]: value
                } : si));
    };
    const handleAddItem = ()=>{
        const nextId = items.length > 0 ? Math.max(...items.map((i)=>i.id)) + 1 : itemIdCounter.current++;
        if (nextId >= itemIdCounter.current) itemIdCounter.current = nextId + 1;
        setItems([
            ...items,
            createEmptyItem(nextId)
        ]);
    };
    const handleRemoveItem = (id)=>{
        if (items.length <= 1) return;
        setItems(items.filter((item)=>item.id !== id));
    };
    const handleRowChange = (id, field, value)=>{
        setItems(items.map((item)=>item.id === id ? {
                ...item,
                [field]: value
            } : item));
    };
    const handleSelectCatalogProduct = (itemId, catalogProduct)=>{
        setItems((prev)=>prev.map((item)=>{
                if (item.id !== itemId) return item;
                var _catalogProduct_gst;
                return {
                    ...item,
                    productId: catalogProduct.id,
                    productName: catalogProduct.name,
                    productCode: catalogProduct.code || '',
                    unitPrice: catalogProduct.price || item.unitPrice,
                    tax: (_catalogProduct_gst = catalogProduct.gst) !== null && _catalogProduct_gst !== void 0 ? _catalogProduct_gst : item.tax,
                    specification: getDefaultSpecification(catalogProduct.name, catalogProduct) || item.specification
                };
            }));
        setActiveDropdownRow(null);
    };
    const calculateItemSubtotal = (item)=>item.quantity * item.unitPrice;
    const calculateItemDiscountAmt = (item)=>calculateItemSubtotal(item) * (item.discount || 0) / 100;
    const calculateItemTaxAmt = (item)=>(calculateItemSubtotal(item) - calculateItemDiscountAmt(item)) * (item.tax || 0) / 100;
    const calculateItemTotal = (item)=>calculateItemSubtotal(item) - calculateItemDiscountAmt(item) + calculateItemTaxAmt(item) + (item.additionalCharges || 0);
    const summarySubtotal = items.reduce((sum, item)=>sum + calculateItemSubtotal(item), 0);
    const summaryDiscount = items.reduce((sum, item)=>sum + calculateItemDiscountAmt(item), 0);
    const summaryGST = items.reduce((sum, item)=>sum + calculateItemTaxAmt(item), 0);
    const summaryAdditional = items.reduce((sum, item)=>sum + (item.additionalCharges || 0), 0);
    const grandTotal = items.reduce((sum, item)=>sum + calculateItemTotal(item), 0);
    const formatINR = (value)=>"₹".concat(Math.round(value).toLocaleString('en-IN'));
    const handleSubmit = (e)=>{
        var _sampleItems_find, _sampleItems_find1;
        e.preventDefault();
        if (!projectName.trim() || !siteInchargeName.trim() || !siteInchargeMobile.trim()) {
            alert('Please fill out all mandatory fields.');
            return;
        }
        if (items.length === 0) {
            alert('Please add at least one product.');
            return;
        }
        const invalidItem = items.some((item)=>!item.productName.trim() || !item.specification.trim());
        if (invalidItem) {
            alert('Please fill out specifications and product name for all products.');
            return;
        }
        const itemsDescription = items.map((item)=>"".concat(item.productName, " (x").concat(item.quantity, ")")).join(', ');
        const payload = {
            projectName: projectName.trim(),
            groupName: groupName.trim(),
            companyName: companyName.trim(),
            gstNumber: gstNumber.trim(),
            siteInchargeName: siteInchargeName.trim(),
            siteInchargeMobile: siteInchargeMobile.trim(),
            officeContact: officeContact.trim(),
            email: email.trim(),
            salesperson: salesExecutive,
            salesExecutive: salesExecutive,
            chiefDirector: chiefDirector,
            notes: remarks.trim(),
            detailedItems: items.map((item)=>({
                    productName: item.productName,
                    productCode: item.productCode || undefined,
                    specification: item.specification,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discount: item.discount || 0,
                    tax: item.tax || 18,
                    additionalCharges: item.additionalCharges || 0
                })),
            contactPerson: siteInchargeName.trim(),
            phone: siteInchargeMobile.trim(),
            productInterested: itemsDescription,
            estimatedQuantity: items.reduce((sum, item)=>sum + item.quantity, 0),
            address: {
                line1: addressLine1.trim(),
                city: city.trim(),
                state: stateName.trim(),
                country: 'India',
                pincode: pincode.trim()
            },
            sampleRequired,
            expectedTransportationCost: sampleRequired ? Number(expectedTransportationCost) || 0 : 0,
            sampleItems: sampleRequired ? sampleItems.filter((si)=>si.enabled).map((si)=>({
                    id: si.id,
                    productName: si.productName,
                    quantity: Number(si.quantity),
                    expectedDate: si.expectedDate
                })) : [],
            sampleQuantity: sampleRequired ? ((_sampleItems_find = sampleItems.find((si)=>si.enabled)) === null || _sampleItems_find === void 0 ? void 0 : _sampleItems_find.quantity) || 0 : 0,
            sampleExpectedDate: sampleRequired ? ((_sampleItems_find1 = sampleItems.find((si)=>si.enabled)) === null || _sampleItems_find1 === void 0 ? void 0 : _sampleItems_find1.expectedDate) || '' : ''
        };
        const proceedSubmit = async (dataPayload)=>{
            let success = false;
            try {
                if (submitAction === 'quotation' && onGenerateQuotation) {
                    const res = await onGenerateQuotation(dataPayload);
                    success = (res === null || res === void 0 ? void 0 : res.success) !== false; // assume true if not explicitly false
                } else {
                    const res = await onAddLead(dataPayload);
                    success = (res === null || res === void 0 ? void 0 : res.success) !== false;
                }
            } catch (err) {
                console.error(err);
            }
            if (success) {
                clearDraft();
            }
        };
        if (!editingLead) {
            const gst = gstNumber.trim().toUpperCase();
            const mobile = siteInchargeMobile.trim();
            const company = companyName.trim().toLowerCase();
            const duplicate = leads.find((l)=>{
                const leadMobile = l.siteInchargeMobile || l.site_incharge_mobile || l.phone || '';
                const leadGst = l.gstNumber || l.gst_number || '';
                const leadCompany = l.companyName || l.company_name || '';
                const mobileMatch = mobile && leadMobile && mobile === leadMobile;
                const gstMatch = gst && leadGst && gst === leadGst.toUpperCase();
                const companyMatch = company && leadCompany && company === leadCompany.toLowerCase();
                return mobileMatch || gstMatch || companyMatch;
            });
            if (duplicate) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    title: 'Duplicate Lead Detected',
                    text: 'A lead already exists for customer "'.concat(duplicate.companyName || duplicate.projectName || 'Lead ID: ' + duplicate.id, '".'),
                    icon: 'warning',
                    showCancelButton: true,
                    showDenyButton: true,
                    confirmButtonText: 'Create Anyway',
                    denyButtonText: 'View Existing',
                    cancelButtonText: 'Cancel',
                    customClass: {
                        popup: 'swal-premium-popup',
                        title: 'swal-premium-title',
                        htmlContainer: 'swal-premium-text',
                        confirmButton: 'swal-premium-confirm-btn',
                        denyButton: 'swal-premium-deny-btn',
                        cancelButton: 'swal-premium-cancel-btn'
                    },
                    buttonsStyling: false
                }).then((result)=>{
                    if (result.isConfirmed) {
                        proceedSubmit(payload);
                    } else if (result.isDenied) {
                        onCancel();
                    }
                });
                return;
            }
        }
        proceedSubmit(payload);
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
                            onClick: onCancel,
                            style: {
                                width: '36px',
                                height: '36px',
                                background: '#f1f3f5',
                                color: '#000'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/components/CreateLead.jsx",
                                lineNumber: 460,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/CreateLead.jsx",
                            lineNumber: 459,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "module-title",
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: editingLead ? "Edit Lead #".concat(editingLead.id) : 'Create Lead / Order'
                                        }, void 0, false, {
                                            fileName: "[project]/components/CreateLead.jsx",
                                            lineNumber: 464,
                                            columnNumber: 15
                                        }, this),
                                        !editingLead && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '3px 10px',
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                background: '#dcfce7',
                                                color: '#15803d',
                                                border: '1px solid #bbf7d0',
                                                gap: '5px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        width: '6px',
                                                        height: '6px',
                                                        borderRadius: '50%',
                                                        background: '#15803d'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 479,
                                                    columnNumber: 19
                                                }, this),
                                                "NEW LEAD"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CreateLead.jsx",
                                            lineNumber: 466,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CreateLead.jsx",
                                    lineNumber: 463,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    style: {
                                        fontSize: '12px',
                                        color: 'var(--color-text-secondary)',
                                        marginTop: '2px'
                                    },
                                    children: "Register customer details, log test samples, and generate quotation sheets."
                                }, void 0, false, {
                                    fileName: "[project]/components/CreateLead.jsx",
                                    lineNumber: 489,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CreateLead.jsx",
                            lineNumber: 462,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/CreateLead.jsx",
                    lineNumber: 458,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/CreateLead.jsx",
                lineNumber: 457,
                columnNumber: 7
            }, this),
            editingLead && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    background: 'linear-gradient(135deg, #fff7ed, #fffaf5)',
                    border: '1px solid #fed7aa',
                    borderRadius: '16px',
                    padding: '16px 24px',
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.05)'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: 'flex',
                        gap: '24px',
                        flexWrap: 'wrap'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        color: '#9a3412',
                                        letterSpacing: '0.5px'
                                    },
                                    children: "Lead Reference"
                                }, void 0, false, {
                                    fileName: "[project]/components/CreateLead.jsx",
                                    lineNumber: 512,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    style: {
                                        fontSize: '15px',
                                        color: '#ea580c'
                                    },
                                    children: [
                                        "Lead ID: ",
                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$idGenerator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["displayEntityId"])(editingLead.id)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CreateLead.jsx",
                                    lineNumber: 513,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CreateLead.jsx",
                            lineNumber: 511,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                borderLeft: '1px solid #fed7aa',
                                paddingLeft: '24px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        color: '#9a3412',
                                        letterSpacing: '0.5px'
                                    },
                                    children: "Registration Date"
                                }, void 0, false, {
                                    fileName: "[project]/components/CreateLead.jsx",
                                    lineNumber: 516,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    style: {
                                        fontSize: '14px',
                                        color: '#475569'
                                    },
                                    children: ((_editingLead_timeline = editingLead.timeline) === null || _editingLead_timeline === void 0 ? void 0 : (_editingLead_timeline_ = _editingLead_timeline[0]) === null || _editingLead_timeline_ === void 0 ? void 0 : _editingLead_timeline_.date) ? new Date(editingLead.timeline[0].date).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    }) : '18 Jun 2026'
                                }, void 0, false, {
                                    fileName: "[project]/components/CreateLead.jsx",
                                    lineNumber: 517,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CreateLead.jsx",
                            lineNumber: 515,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                borderLeft: '1px solid #fed7aa',
                                paddingLeft: '24px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        color: '#9a3412',
                                        letterSpacing: '0.5px'
                                    },
                                    children: "Last Touchpoint"
                                }, void 0, false, {
                                    fileName: "[project]/components/CreateLead.jsx",
                                    lineNumber: 522,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    style: {
                                        fontSize: '14px',
                                        color: '#475569'
                                    },
                                    children: editingLead.timeline && editingLead.timeline.length > 0 ? new Date(editingLead.timeline[editingLead.timeline.length - 1].date).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    }) : '19 Jun 2026'
                                }, void 0, false, {
                                    fileName: "[project]/components/CreateLead.jsx",
                                    lineNumber: 523,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/CreateLead.jsx",
                            lineNumber: 521,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/CreateLead.jsx",
                    lineNumber: 510,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/CreateLead.jsx",
                lineNumber: 497,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "create-lead-grid",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '24px',
                                    minWidth: 0
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: '#f8f9fa',
                                        padding: '20px',
                                        borderRadius: '16px',
                                        border: '1px solid var(--color-border)'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            style: {
                                                fontSize: '14px',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                color: 'var(--color-text-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '16px',
                                                borderBottom: '1px solid #eaeaea',
                                                paddingBottom: '8px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                                                    size: 16,
                                                    style: {
                                                        color: 'var(--color-accent-teal)'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 540,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "1. Basic Info & Customer Details"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 541,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CreateLead.jsx",
                                            lineNumber: 539,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "form-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "form-group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "form-label",
                                                            children: "Project Name *"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 546,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            className: "form-input",
                                                            placeholder: "e.g. Skyline Premium Residency",
                                                            value: projectName,
                                                            onChange: (e)=>setProjectName(e.target.value),
                                                            required: true
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 547,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 545,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "form-group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "form-label",
                                                            children: "Group Name *"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 550,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            className: "form-input",
                                                            placeholder: "e.g. ABC Group",
                                                            value: groupName,
                                                            onChange: (e)=>setGroupName(e.target.value),
                                                            required: true
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 551,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 549,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CreateLead.jsx",
                                            lineNumber: 544,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "form-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "form-group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "form-label",
                                                            children: "Gst Name (Optional)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 557,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            className: "form-input",
                                                            placeholder: "e.g. ABC Buildcon Pvt Ltd",
                                                            value: companyName,
                                                            onChange: (e)=>setCompanyName(e.target.value)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 558,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 556,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "form-group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "form-label",
                                                            children: "GST Number (Optional)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 561,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            className: "form-input",
                                                            placeholder: "e.g. 09ABCDE1234F1Z5",
                                                            value: gstNumber,
                                                            onChange: (e)=>setGstNumber(e.target.value.toUpperCase()),
                                                            maxLength: 15
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 562,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 560,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CreateLead.jsx",
                                            lineNumber: 555,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "form-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "form-group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "form-label",
                                                            children: "Site Incharge Name *"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 575,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            className: "form-input",
                                                            placeholder: "e.g. Rahul Sharma",
                                                            value: siteInchargeName,
                                                            onChange: (e)=>setSiteInchargeName(e.target.value),
                                                            required: true
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 576,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 574,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "form-group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "form-label",
                                                            children: "Site Incharge Mobile *"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 579,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "tel",
                                                            className: "form-input",
                                                            placeholder: "e.g. 9876543210",
                                                            value: siteInchargeMobile,
                                                            onChange: (e)=>setSiteInchargeMobile(e.target.value.replace(/\D/g, '')),
                                                            required: true
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 580,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 578,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CreateLead.jsx",
                                            lineNumber: 573,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "form-row",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "form-group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "form-label",
                                                            children: "Office Contact (Optional)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 593,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            className: "form-input",
                                                            placeholder: "e.g. 011-22334455",
                                                            value: officeContact,
                                                            onChange: (e)=>setOfficeContact(e.target.value)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 594,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 592,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "form-group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "form-label",
                                                            children: "Email Address (Optional)"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 597,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "email",
                                                            className: "form-input",
                                                            placeholder: "e.g. contact@company.com",
                                                            value: email,
                                                            onChange: (e)=>setEmail(e.target.value)
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 598,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 596,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CreateLead.jsx",
                                            lineNumber: 591,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "form-row",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "form-group-full",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "form-label",
                                                        children: "Logged In Sales Representative"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CreateLead.jsx",
                                                        lineNumber: 604,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "form-input",
                                                        style: {
                                                            background: '#F5FAFE',
                                                            color: '#475569',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            flexWrap: 'wrap',
                                                            gap: '8px',
                                                            fontWeight: '600',
                                                            border: '1px solid #DCE5F0',
                                                            height: 'auto',
                                                            minHeight: '38px',
                                                            padding: '10px 14px'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    display: 'inline-block',
                                                                    width: '8px',
                                                                    height: '8px',
                                                                    borderRadius: '50%',
                                                                    background: '#22c55e',
                                                                    flexShrink: 0
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/components/CreateLead.jsx",
                                                                lineNumber: 606,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                        children: (user === null || user === void 0 ? void 0 : user.name) || 'Alex Carter'
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/CreateLead.jsx",
                                                                        lineNumber: 608,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    loginTime ? " logged in on ".concat(loginTime.date, " at ").concat(loginTime.time) : ' logging in...'
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/components/CreateLead.jsx",
                                                                lineNumber: 607,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/CreateLead.jsx",
                                                        lineNumber: 605,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CreateLead.jsx",
                                                lineNumber: 603,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/CreateLead.jsx",
                                            lineNumber: 602,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "form-group",
                                            style: {
                                                marginBottom: 0
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "form-label",
                                                    children: "Remarks & Internal Notes (Optional)"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 616,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                    className: "form-textarea",
                                                    placeholder: "Add special instructions, requirements, internal follow-up notes...",
                                                    value: remarks,
                                                    onChange: (e)=>setRemarks(e.target.value),
                                                    style: {
                                                        minHeight: '80px'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 617,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CreateLead.jsx",
                                            lineNumber: 615,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CreateLead.jsx",
                                    lineNumber: 538,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/CreateLead.jsx",
                                lineNumber: 536,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '24px',
                                    minWidth: 0
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        background: '#f8f9fa',
                                        padding: '20px',
                                        borderRadius: '16px',
                                        border: '1px solid var(--color-border)'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            style: {
                                                fontSize: '14px',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                color: 'var(--color-text-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '16px',
                                                borderBottom: '1px solid #eaeaea',
                                                paddingBottom: '8px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                    size: 16,
                                                    style: {
                                                        color: 'var(--color-accent-purple)'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 632,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "📍 Delivery Address"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 633,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CreateLead.jsx",
                                            lineNumber: 631,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "form-group",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "form-label",
                                                    children: "Address Line 1 *"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 637,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    className: "form-input",
                                                    placeholder: "e.g. Sector 62, Noida Industrial Area",
                                                    value: addressLine1,
                                                    onChange: (e)=>setAddressLine1(e.target.value),
                                                    required: true
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 638,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CreateLead.jsx",
                                            lineNumber: 636,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "form-row-three",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "form-group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "form-label",
                                                            children: "City *"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 643,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            className: "form-input",
                                                            placeholder: "e.g. Noida",
                                                            value: city,
                                                            onChange: (e)=>setCity(e.target.value),
                                                            required: true
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 644,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 642,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "form-group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "form-label",
                                                            children: "State *"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 647,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            className: "form-input",
                                                            placeholder: "e.g. Uttar Pradesh",
                                                            value: stateName,
                                                            onChange: (e)=>setStateName(e.target.value),
                                                            required: true
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 648,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 646,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "form-group",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "form-label",
                                                            children: "Pincode *"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 651,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            className: "form-input",
                                                            placeholder: "e.g. 201301",
                                                            value: pincode,
                                                            onChange: (e)=>setPincode(e.target.value.replace(/\D/g, '')),
                                                            maxLength: 6,
                                                            required: true
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 652,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 650,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CreateLead.jsx",
                                            lineNumber: 641,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CreateLead.jsx",
                                    lineNumber: 630,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/CreateLead.jsx",
                                lineNumber: 628,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateLead.jsx",
                        lineNumber: 534,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: '24px',
                            background: '#f8f9fa',
                            padding: '20px',
                            borderRadius: '16px',
                            border: '1px solid var(--color-border)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    fontSize: '14px',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    color: 'var(--color-text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '16px',
                                    borderBottom: '1px solid #eaeaea',
                                    paddingBottom: '8px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"], {
                                        size: 16,
                                        style: {
                                            color: 'var(--color-accent-purple)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateLead.jsx",
                                        lineNumber: 669,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "2. 📦 Product Selection"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateLead.jsx",
                                        lineNumber: 670,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateLead.jsx",
                                lineNumber: 668,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "lead-product-grid-header",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Product & Specification Details *"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateLead.jsx",
                                        lineNumber: 674,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            textAlign: 'center'
                                        },
                                        children: "Quantity *"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateLead.jsx",
                                        lineNumber: 675,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            textAlign: 'center'
                                        },
                                        children: "Unit Price (₹) *"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateLead.jsx",
                                        lineNumber: 676,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            textAlign: 'center'
                                        },
                                        children: "Line Total (₹)"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateLead.jsx",
                                        lineNumber: 677,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            textAlign: 'center'
                                        },
                                        children: "Action"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateLead.jsx",
                                        lineNumber: 678,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateLead.jsx",
                                lineNumber: 673,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                },
                                children: items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "lead-product-grid",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "lead-product-grid-spec",
                                                    style: {
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '8px',
                                                        position: 'relative'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$ProductPicker$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            value: item.productId ? {
                                                                id: item.productId,
                                                                product_name: item.productName,
                                                                product_code: item.productCode
                                                            } : null,
                                                            onChange: (p)=>{
                                                                if (p) {
                                                                    handleSelectCatalogProduct(item.id, {
                                                                        id: p.id,
                                                                        name: p.product_name,
                                                                        code: p.product_code,
                                                                        price: p.selling_price || 0,
                                                                        unit: p.unit_of_measure || 'PCS',
                                                                        gst: p.gst_rate || 18
                                                                    });
                                                                } else {
                                                                    handleRowChange(item.id, 'productId', null);
                                                                    handleRowChange(item.id, 'productName', '');
                                                                    handleRowChange(item.id, 'productCode', '');
                                                                }
                                                            },
                                                            placeholder: "Search product...",
                                                            showBadge: false
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 686,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            className: "form-input",
                                                            placeholder: "Specifications / Color details * (e.g. Color: Grey, Size: M10)",
                                                            value: item.specification,
                                                            onChange: (e)=>handleRowChange(item.id, 'specification', e.target.value),
                                                            required: true,
                                                            style: {
                                                                fontSize: '12.5px',
                                                                padding: '9px 12px'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 712,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 685,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    className: "form-input",
                                                    min: "1",
                                                    value: item.quantity,
                                                    onChange: (e)=>handleRowChange(item.id, 'quantity', Math.max(1, Number(e.target.value))),
                                                    required: true,
                                                    style: {
                                                        textAlign: 'center',
                                                        padding: '9px 8px'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 723,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    className: "form-input",
                                                    min: "0",
                                                    value: item.unitPrice,
                                                    onChange: (e)=>handleRowChange(item.id, 'unitPrice', Number(e.target.value)),
                                                    required: true,
                                                    style: {
                                                        textAlign: 'center',
                                                        padding: '9px 8px'
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 733,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "lead-product-grid-total",
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: '800',
                                                        fontSize: '14px',
                                                        color: '#24345C',
                                                        minHeight: '42px'
                                                    },
                                                    children: formatINR(calculateItemTotal(item))
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 743,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "lead-product-grid-action",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>handleRemoveItem(item.id),
                                                        disabled: items.length <= 1,
                                                        style: {
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: '40px',
                                                            height: '40px',
                                                            margin: '0 auto',
                                                            background: items.length <= 1 ? '#f1f5f9' : '#fef2f2',
                                                            border: "1px solid ".concat(items.length <= 1 ? '#DCE5F0' : '#fecaca'),
                                                            borderRadius: '10px',
                                                            color: items.length <= 1 ? '#D6E2F0' : '#dc2626',
                                                            cursor: items.length <= 1 ? 'not-allowed' : 'pointer'
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                            size: 14
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 762,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/CreateLead.jsx",
                                                        lineNumber: 748,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 747,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CreateLead.jsx",
                                            lineNumber: 684,
                                            columnNumber: 17
                                        }, this)
                                    }, item.id, false, {
                                        fileName: "[project]/components/CreateLead.jsx",
                                        lineNumber: 683,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/components/CreateLead.jsx",
                                lineNumber: 681,
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
                                    fontWeight: '700',
                                    marginTop: '16px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                        size: 14
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateLead.jsx",
                                        lineNumber: 776,
                                        columnNumber: 13
                                    }, this),
                                    " Add Another Product"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateLead.jsx",
                                lineNumber: 770,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: '20px',
                                    padding: '16px 18px',
                                    background: '#ffffff',
                                    border: '1px solid #DCE5F0',
                                    borderRadius: '12px',
                                    maxWidth: '360px',
                                    marginLeft: 'auto'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        fontSize: '13.5px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                color: '#475569'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Subtotal"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 782,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: formatINR(summarySubtotal)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 782,
                                                    columnNumber: 38
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CreateLead.jsx",
                                            lineNumber: 781,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                color: '#475569'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "GST"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 785,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: formatINR(summaryGST)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 785,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CreateLead.jsx",
                                            lineNumber: 784,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                color: '#475569'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Discount"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 788,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        "-",
                                                        formatINR(summaryDiscount)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 788,
                                                    columnNumber: 38
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CreateLead.jsx",
                                            lineNumber: 787,
                                            columnNumber: 15
                                        }, this),
                                        summaryAdditional > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                color: '#475569'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Additional Charges"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 792,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: formatINR(summaryAdditional)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 792,
                                                    columnNumber: 50
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CreateLead.jsx",
                                            lineNumber: 791,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                borderTop: '1px solid #DCE5F0',
                                                marginTop: '6px',
                                                paddingTop: '10px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                fontWeight: '800',
                                                fontSize: '15px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Grand Total"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 796,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: formatINR(grandTotal)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 796,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/CreateLead.jsx",
                                            lineNumber: 795,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/CreateLead.jsx",
                                    lineNumber: 780,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/CreateLead.jsx",
                                lineNumber: 779,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateLead.jsx",
                        lineNumber: 667,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginTop: '24px',
                            background: '#f8f9fa',
                            padding: '20px',
                            borderRadius: '16px',
                            border: '1px solid var(--color-border)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '16px',
                                    borderBottom: '1px solid #eaeaea',
                                    paddingBottom: '10px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            fontSize: '14px',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            color: 'var(--color-text-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            margin: 0
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__["FlaskConical"], {
                                                size: 16,
                                                style: {
                                                    color: 'var(--color-accent-teal)'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateLead.jsx",
                                                lineNumber: 806,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "3. 🧪 Sample Management"
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateLead.jsx",
                                                lineNumber: 807,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateLead.jsx",
                                        lineNumber: 805,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "switch-container",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "checkbox",
                                                className: "switch-input",
                                                checked: sampleRequired,
                                                onChange: (e)=>{
                                                    setSampleRequired(e.target.checked);
                                                    if (!e.target.checked) setExpectedTransportationCost(0);
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateLead.jsx",
                                                lineNumber: 810,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "switch-slider"
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateLead.jsx",
                                                lineNumber: 819,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "switch-label",
                                                children: sampleRequired ? 'Enabled' : 'Disabled'
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateLead.jsx",
                                                lineNumber: 820,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateLead.jsx",
                                        lineNumber: 809,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateLead.jsx",
                                lineNumber: 804,
                                columnNumber: 11
                            }, this),
                            sampleRequired ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        style: {
                                            fontSize: '12px',
                                            color: 'var(--color-text-secondary)',
                                            margin: '0 0 4px 0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                                size: 13,
                                                style: {
                                                    flexShrink: 0
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateLead.jsx",
                                                lineNumber: 827,
                                                columnNumber: 17
                                            }, this),
                                            "Toggle the switch next to each product to request a sample for it."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateLead.jsx",
                                        lineNumber: 826,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "form-group",
                                        style: {
                                            marginBottom: '4px'
                                        },
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
                                                        fileName: "[project]/components/CreateLead.jsx",
                                                        lineNumber: 833,
                                                        columnNumber: 19
                                                    }, this),
                                                    " Expected Transportation Cost (₹)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CreateLead.jsx",
                                                lineNumber: 832,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                className: "form-input",
                                                min: "0",
                                                step: "100",
                                                placeholder: "e.g. 2500",
                                                value: expectedTransportationCost || '',
                                                onChange: (e)=>setExpectedTransportationCost(Number(e.target.value) || 0)
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateLead.jsx",
                                                lineNumber: 835,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateLead.jsx",
                                        lineNumber: 831,
                                        columnNumber: 15
                                    }, this),
                                    sampleItems.map((si)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                background: si.enabled ? 'rgba(20, 184, 166, 0.06)' : '#ffffff',
                                                border: si.enabled ? '1px solid rgba(20, 184, 166, 0.3)' : '1px solid #DCE5F0',
                                                borderRadius: '12px',
                                                padding: '12px 16px',
                                                transition: 'all 0.2s ease'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        gap: '10px'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '8px',
                                                                minWidth: 0
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        width: '24px',
                                                                        height: '24px',
                                                                        borderRadius: '50%',
                                                                        flexShrink: 0,
                                                                        background: si.enabled ? 'rgba(20, 184, 166, 0.15)' : '#f1f5f9',
                                                                        fontSize: '12px'
                                                                    },
                                                                    children: "📦"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/CreateLead.jsx",
                                                                    lineNumber: 859,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontSize: '13px',
                                                                        fontWeight: '700',
                                                                        color: si.enabled ? '#0f766e' : 'var(--color-text-primary)',
                                                                        whiteSpace: 'nowrap',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis'
                                                                    },
                                                                    children: si.productName || /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                                                        style: {
                                                                            color: '#8893A7'
                                                                        },
                                                                        children: "Unnamed product"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/components/CreateLead.jsx",
                                                                        lineNumber: 870,
                                                                        columnNumber: 44
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/CreateLead.jsx",
                                                                    lineNumber: 865,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 858,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "switch-container",
                                                            style: {
                                                                flexShrink: 0
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "checkbox",
                                                                    className: "switch-input",
                                                                    checked: si.enabled,
                                                                    onChange: (e)=>updateSampleItem(si.id, 'enabled', e.target.checked)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/CreateLead.jsx",
                                                                    lineNumber: 874,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "switch-slider"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/CreateLead.jsx",
                                                                    lineNumber: 880,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "switch-label",
                                                                    style: {
                                                                        fontSize: '11px'
                                                                    },
                                                                    children: si.enabled ? 'Sample' : 'No'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/CreateLead.jsx",
                                                                    lineNumber: 881,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 873,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 857,
                                                    columnNumber: 19
                                                }, this),
                                                si.enabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "form-row",
                                                    style: {
                                                        marginTop: '12px',
                                                        marginBottom: 0
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
                                                                    style: {
                                                                        fontSize: '11px'
                                                                    },
                                                                    children: "Sample Qty"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/CreateLead.jsx",
                                                                    lineNumber: 890,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "number",
                                                                    className: "form-input",
                                                                    min: "1",
                                                                    value: si.quantity,
                                                                    onChange: (e)=>updateSampleItem(si.id, 'quantity', Math.max(1, Number(e.target.value))),
                                                                    style: {
                                                                        padding: '6px 10px',
                                                                        fontSize: '13px'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/CreateLead.jsx",
                                                                    lineNumber: 891,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 889,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "form-group",
                                                            style: {
                                                                marginBottom: 0
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    className: "form-label",
                                                                    style: {
                                                                        fontSize: '11px'
                                                                    },
                                                                    children: "Expected Date"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/CreateLead.jsx",
                                                                    lineNumber: 901,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "date",
                                                                    className: "form-input",
                                                                    value: si.expectedDate,
                                                                    onChange: (e)=>updateSampleItem(si.id, 'expectedDate', e.target.value),
                                                                    style: {
                                                                        padding: '6px 10px',
                                                                        fontSize: '13px'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/CreateLead.jsx",
                                                                    lineNumber: 902,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/components/CreateLead.jsx",
                                                            lineNumber: 900,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/CreateLead.jsx",
                                                    lineNumber: 888,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, si.id, true, {
                                            fileName: "[project]/components/CreateLead.jsx",
                                            lineNumber: 847,
                                            columnNumber: 17
                                        }, this)),
                                    sampleItems.some((si)=>si.enabled) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            marginTop: '4px',
                                            padding: '8px 12px',
                                            background: 'rgba(20,184,166,0.08)',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(20,184,166,0.2)'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__["FlaskConical"], {
                                                size: 13,
                                                style: {
                                                    color: '#0f766e'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/CreateLead.jsx",
                                                lineNumber: 917,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    color: '#0f766e'
                                                },
                                                children: [
                                                    sampleItems.filter((si)=>si.enabled).length,
                                                    " product",
                                                    sampleItems.filter((si)=>si.enabled).length > 1 ? 's' : '',
                                                    " selected for sampling"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/CreateLead.jsx",
                                                lineNumber: 918,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/CreateLead.jsx",
                                        lineNumber: 916,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateLead.jsx",
                                lineNumber: 825,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '16px',
                                    background: '#DCE5F0',
                                    borderRadius: '12px',
                                    border: '1px solid #D6E2F0',
                                    color: 'var(--color-text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '13px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                        size: 18,
                                        style: {
                                            color: 'var(--color-text-muted)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateLead.jsx",
                                        lineNumber: 926,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "No sample requested. Toggle the switch above to configure."
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateLead.jsx",
                                        lineNumber: 927,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/CreateLead.jsx",
                                lineNumber: 925,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateLead.jsx",
                        lineNumber: 803,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "form-actions",
                        style: {
                            marginTop: '24px'
                        },
                        children: [
                            editingLead ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        className: "form-submit-btn",
                                        onClick: ()=>setSubmitAction('lead'),
                                        children: "Save Changes"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateLead.jsx",
                                        lineNumber: 936,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "form-submit-btn",
                                        style: {
                                            background: '#dc2626',
                                            color: '#fff'
                                        },
                                        onClick: ()=>{
                                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                                                title: 'Delete Lead?',
                                                text: "Are you sure you want to delete lead #".concat(editingLead.id, ' for "').concat(editingLead.companyName, '"?'),
                                                input: 'text',
                                                inputPlaceholder: 'Please enter the reason for deletion...',
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonText: 'Yes, Delete',
                                                cancelButtonText: 'Cancel',
                                                customClass: {
                                                    popup: 'swal-premium-popup',
                                                    title: 'swal-premium-title',
                                                    htmlContainer: 'swal-premium-text',
                                                    confirmButton: 'swal-premium-confirm-btn',
                                                    cancelButton: 'swal-premium-cancel-btn'
                                                },
                                                buttonsStyling: false,
                                                inputValidator: (value)=>{
                                                    if (!value || !value.trim()) {
                                                        return 'You must provide a reason for deleting this lead!';
                                                    }
                                                }
                                            }).then((result)=>{
                                                if (result.isConfirmed && result.value) {
                                                    onDeleteLead(editingLead.id, result.value.trim());
                                                }
                                            });
                                        },
                                        children: "Delete Lead"
                                    }, void 0, false, {
                                        fileName: "[project]/components/CreateLead.jsx",
                                        lineNumber: 943,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                className: "form-submit-btn",
                                onClick: ()=>setSubmitAction('lead'),
                                children: "Submit Lead Details"
                            }, void 0, false, {
                                fileName: "[project]/components/CreateLead.jsx",
                                lineNumber: 981,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: "btn-small btn-outline-small",
                                onClick: onCancel,
                                style: {
                                    flex: 'none',
                                    padding: '12px 20px'
                                },
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/components/CreateLead.jsx",
                                lineNumber: 989,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/CreateLead.jsx",
                        lineNumber: 933,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/CreateLead.jsx",
                lineNumber: 533,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/CreateLead.jsx",
        lineNumber: 456,
        columnNumber: 5
    }, this);
}
_s(CreateLead, "EmsRoUK0bprRsp43S/slGl/zSRk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$context$2f$AuthContext$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$hooks$2f$useFormDraft$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormDraft"]
    ];
});
_c = CreateLead;
var _c;
__turbopack_context__.k.register(_c, "CreateLead");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_CreateLead_jsx_5c92394d._.js.map