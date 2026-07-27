(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/modules/purchase/services/purchase.service.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createGRN",
    ()=>createGRN,
    "createPurchaseOrder",
    ()=>createPurchaseOrder,
    "createVendor",
    ()=>createVendor,
    "deleteGRN",
    ()=>deleteGRN,
    "deletePurchaseOrder",
    ()=>deletePurchaseOrder,
    "deleteVendor",
    ()=>deleteVendor,
    "getGRNById",
    ()=>getGRNById,
    "getGRNs",
    ()=>getGRNs,
    "getProducts",
    ()=>getProducts,
    "getPurchaseOrderById",
    ()=>getPurchaseOrderById,
    "getPurchaseOrders",
    ()=>getPurchaseOrders,
    "getVendorById",
    ()=>getVendorById,
    "getVendors",
    ()=>getVendors,
    "getWarehouses",
    ()=>getWarehouses,
    "updateGRN",
    ()=>updateGRN,
    "updateInventoryFromGRN",
    ()=>updateInventoryFromGRN,
    "updatePurchaseOrder",
    ()=>updatePurchaseOrder,
    "updateVendor",
    ()=>updateVendor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/apiClient.js [app-client] (ecmascript)");
;
const getVendors = async function() {
    let filters = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const params = new URLSearchParams(filters);
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/purchase/vendors?".concat(params));
    return response.data;
};
const getVendorById = async (id)=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/purchase/vendors/".concat(id));
    return response.data;
};
const createVendor = async (data)=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/purchase/vendors', data);
    return response.data;
};
const updateVendor = async (id, data)=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].put("/purchase/vendors/".concat(id), data);
    return response.data;
};
const deleteVendor = async (id)=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].delete("/purchase/vendors/".concat(id));
    return response.data;
};
const getPurchaseOrders = async function() {
    let filters = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const params = new URLSearchParams(filters);
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/purchase/orders?".concat(params));
    return response.data;
};
const getPurchaseOrderById = async (id)=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/purchase/orders/".concat(id));
    return response.data;
};
const createPurchaseOrder = async (data)=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/purchase/orders', data);
    return response.data;
};
const updatePurchaseOrder = async (id, data)=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].put("/purchase/orders/".concat(id), data);
    return response.data;
};
const deletePurchaseOrder = async (id)=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].delete("/purchase/orders/".concat(id));
    return response.data;
};
const getGRNs = async function() {
    let filters = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const params = new URLSearchParams(filters);
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/purchase/grns?".concat(params));
    return response.data;
};
const getGRNById = async (id)=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/purchase/grns/".concat(id));
    return response.data;
};
const createGRN = async (data)=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/purchase/grns', data);
    return response.data;
};
const updateGRN = async (id, data)=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].put("/purchase/grns/".concat(id), data);
    return response.data;
};
const updateInventoryFromGRN = async (id)=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post("/purchase/grns/".concat(id, "/update-inventory"));
    return response.data;
};
const deleteGRN = async (id)=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].delete("/purchase/grns/".concat(id));
    return response.data;
};
const getProducts = async ()=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get('/purchase/products');
    return response.data;
};
const getWarehouses = async ()=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get('/purchase/warehouses');
    return response.data;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/modules/purchase/pages/GoodsReceiptNote.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GoodsReceiptNote
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.all.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/truck.mjs [app-client] (ecmascript) <export default as Truck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.mjs [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.mjs [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clipboard-check.mjs [app-client] (ecmascript) <export default as ClipboardCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$DataTable$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/components/DataTable.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/components/StatusBadge.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$purchase$2f$services$2f$purchase$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/modules/purchase/services/purchase.service.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
function GoodsReceiptNote() {
    _s();
    const navigate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const setSearchParams = (params)=>{
        const url = new URL(window.location.href);
        Object.keys(params).forEach((k)=>{
            if (params[k]) url.searchParams.set(k, params[k]);
            else url.searchParams.delete(k);
        });
        window.history.replaceState({}, '', url);
    };
    const poIdParam = searchParams.get('po');
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(poIdParam ? 'Log Receipt' : 'GRN List');
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Data lists
    const [grns, setGrns] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [purchaseOrders, setPurchaseOrders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [warehouses, setWarehouses] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // Selection / Detail states
    const [selectedPO, setSelectedPO] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedGRNDetail, setSelectedGRNDetail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Form State for Log Receipt
    const [selectedPOId, setSelectedPOId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(poIdParam || '');
    const [selectedWarehouseId, setSelectedWarehouseId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('1');
    const [deliveryChallanNo, setDeliveryChallanNo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [receivedDate, setReceivedDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Date().toISOString().split('T')[0]);
    const [grnNotes, setGrnNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [itemReceipts, setItemReceipts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({}); // { po_item_id: { qty_received, qty_accepted, qty_rejected, notes } }
    const fetchGRNsAndMetadata = async ()=>{
        setIsLoading(true);
        try {
            const [grnsData, posData, warehousesData] = await Promise.all([
                __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$purchase$2f$services$2f$purchase$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGRNs"](),
                __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$purchase$2f$services$2f$purchase$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPurchaseOrders"](),
                __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$purchase$2f$services$2f$purchase$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getWarehouses"]()
            ]);
            setGrns(grnsData || []);
            setPurchaseOrders(posData || []);
            setWarehouses(warehousesData || []);
            // If warehouse is loaded and no warehouse selected, default to first one
            if (warehousesData && warehousesData.length > 0 && !selectedWarehouseId) {
                setSelectedWarehouseId(String(warehousesData[0].id));
            }
        } catch (err) {
            console.error('Fetch GRN metadata error:', err);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Error', 'Failed to load GRN lists or warehouses', 'error');
        } finally{
            setIsLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GoodsReceiptNote.useEffect": ()=>{
            fetchGRNsAndMetadata();
        }
    }["GoodsReceiptNote.useEffect"], []);
    // Sync if PO selection changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GoodsReceiptNote.useEffect": ()=>{
            const loadSelectedPO = {
                "GoodsReceiptNote.useEffect.loadSelectedPO": async ()=>{
                    if (selectedPOId) {
                        try {
                            const po = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$purchase$2f$services$2f$purchase$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getPurchaseOrderById"](selectedPOId);
                            setSelectedPO(po);
                            // Initialize item receipt inputs
                            const initialReceipts = {};
                            if (po && po.items) {
                                po.items.forEach({
                                    "GoodsReceiptNote.useEffect.loadSelectedPO": (item)=>{
                                        const remaining = Math.max(0, item.quantity_ordered - item.quantity_received);
                                        initialReceipts[item.id] = {
                                            purchase_order_item_id: item.id,
                                            product_id: item.product_id,
                                            quantity_received: remaining,
                                            quantity_accepted: remaining,
                                            quantity_rejected: 0,
                                            unit_price: item.unit_price,
                                            total_price: remaining * item.unit_price,
                                            inspection_notes: ''
                                        };
                                    }
                                }["GoodsReceiptNote.useEffect.loadSelectedPO"]);
                            }
                            setItemReceipts(initialReceipts);
                        } catch (err) {
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Error', 'Failed to retrieve Purchase Order items', 'error');
                        }
                    } else {
                        setSelectedPO(null);
                        setItemReceipts({});
                    }
                }
            }["GoodsReceiptNote.useEffect.loadSelectedPO"];
            loadSelectedPO();
        }
    }["GoodsReceiptNote.useEffect"], [
        selectedPOId
    ]);
    // If query param PO changes, update states
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GoodsReceiptNote.useEffect": ()=>{
            if (poIdParam) {
                setSelectedPOId(poIdParam);
                setActiveTab('Log Receipt');
            }
        }
    }["GoodsReceiptNote.useEffect"], [
        poIdParam
    ]);
    const handleItemReceiptChange = (itemId, field, value)=>{
        setItemReceipts((prev)=>{
            const updated = {
                ...prev[itemId]
            };
            if (field === 'quantity_received') {
                const val = parseFloat(value) || 0;
                updated.quantity_received = val;
                // Auto default accepted to same as received if changed
                updated.quantity_accepted = Math.max(0, val - updated.quantity_rejected);
                updated.total_price = updated.quantity_accepted * updated.unit_price;
            } else if (field === 'quantity_accepted') {
                const val = parseFloat(value) || 0;
                updated.quantity_accepted = val;
                updated.quantity_rejected = Math.max(0, updated.quantity_received - val);
                updated.total_price = val * updated.unit_price;
            } else if (field === 'quantity_rejected') {
                const val = parseFloat(value) || 0;
                updated.quantity_rejected = val;
                updated.quantity_accepted = Math.max(0, updated.quantity_received - val);
                updated.total_price = updated.quantity_accepted * updated.unit_price;
            } else if (field === 'inspection_notes') {
                updated.inspection_notes = value;
            }
            return {
                ...prev,
                [itemId]: updated
            };
        });
    };
    const handleCreateGRN = async (e)=>{
        e.preventDefault();
        if (!selectedPOId) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Warning', 'Please select a Purchase Order', 'warning');
            return;
        }
        if (!selectedWarehouseId) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Warning', 'Please select a receiving warehouse', 'warning');
            return;
        }
        const items = Object.values(itemReceipts).filter((item)=>item.quantity_received > 0);
        if (items.length === 0) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Warning', 'Please specify received quantities greater than 0 for at least one item', 'warning');
            return;
        }
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Generate Goods Receipt Note?',
            text: "Are you sure you want to log this receipt against PO ".concat(selectedPO === null || selectedPO === void 0 ? void 0 : selectedPO.purchase_order_number, "?"),
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Log Receipt',
            cancelButtonText: 'Cancel'
        });
        if (result.isConfirmed) {
            try {
                const grnData = {
                    purchase_order_id: parseInt(selectedPOId),
                    warehouse_id: parseInt(selectedWarehouseId),
                    delivery_challan_number: deliveryChallanNo || null,
                    received_date: receivedDate,
                    notes: grnNotes || null
                };
                await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$purchase$2f$services$2f$purchase$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createGRN"]({
                    ...grnData,
                    items
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Success', 'Goods Receipt Note logged in Draft status.', 'success');
                // Clean form states
                setSelectedPOId('');
                setDeliveryChallanNo('');
                setGrnNotes('');
                setItemReceipts({});
                setSelectedPO(null);
                // Clear query parameters
                setSearchParams({});
                // Reload list and switch tabs
                fetchGRNsAndMetadata();
                setActiveTab('GRN List');
            } catch (err) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Error', err.message || 'Failed to generate GRN', 'error');
            }
        }
    };
    const handlePostInventory = async (grn)=>{
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Post & Update Inventory?',
            text: "This will update the standard inventory balances and log transactions in the stock ledger. This action is irreversible.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Post Stock',
            cancelButtonText: 'Cancel'
        });
        if (result.isConfirmed) {
            try {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
                    title: 'Posting Stock...',
                    allowOutsideClick: false,
                    didOpen: ()=>{
                        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].showLoading();
                    }
                });
                await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$purchase$2f$services$2f$purchase$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateInventoryFromGRN"](grn.id);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Posted!', 'Stock levels updated and ledger records created.', 'success');
                fetchGRNsAndMetadata();
                if ((selectedGRNDetail === null || selectedGRNDetail === void 0 ? void 0 : selectedGRNDetail.id) === grn.id) {
                    setSelectedGRNDetail(null);
                }
            } catch (err) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Error', err.message || 'Stock posting failed', 'error');
            }
        }
    };
    const handleDeleteGRN = async (grn)=>{
        if (grn.status === 'Inventory Updated') {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Action Blocked', 'Cannot delete a posted GRN where stock has already been updated.', 'error');
            return;
        }
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Delete Goods Receipt Note?',
            text: "Are you sure you want to delete ".concat(grn.grn_number, "?"),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel'
        });
        if (result.isConfirmed) {
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$purchase$2f$services$2f$purchase$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteGRN"](grn.id);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Success', 'Goods Receipt Note deleted successfully', 'success');
                fetchGRNsAndMetadata();
                if ((selectedGRNDetail === null || selectedGRNDetail === void 0 ? void 0 : selectedGRNDetail.id) === grn.id) {
                    setSelectedGRNDetail(null);
                }
            } catch (err) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Error', err.message || 'Failed to delete GRN', 'error');
            }
        }
    };
    const handleInspectGRN = async (grn)=>{
        try {
            const detailed = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$purchase$2f$services$2f$purchase$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGRNById"](grn.id);
            setSelectedGRNDetail(detailed);
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Error', 'Failed to retrieve receipt items details', 'error');
        }
    };
    const formatCurrency = (val)=>{
        return "₹".concat(parseFloat(val || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2
        }));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '4px'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                style: {
                                    margin: 0,
                                    fontSize: '20px',
                                    fontWeight: 800,
                                    color: '#24345C'
                                },
                                children: "Goods Receipt Notes (GRN)"
                            }, void 0, false, {
                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                lineNumber: 280,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: '13px',
                                    color: '#5E6B82',
                                    marginTop: '4px',
                                    marginBottom: 0
                                },
                                children: "Verify shipments arriving at the warehouse gate, log quantities, and commit to inventory."
                            }, void 0, false, {
                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                lineNumber: 281,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                        lineNumber: 279,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            display: 'flex',
                            gap: '8px',
                            flexShrink: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setActiveTab('GRN List');
                                    setSelectedGRNDetail(null);
                                },
                                style: {
                                    padding: '8px 16px',
                                    border: activeTab === 'GRN List' ? '2px solid #2F4375' : '2px solid #DCE5F0',
                                    borderRadius: '8px',
                                    background: activeTab === 'GRN List' ? '#2F4375' : '#ffffff',
                                    color: activeTab === 'GRN List' ? '#ffffff' : '#5E6B82',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.18s ease'
                                },
                                children: "📋 Ledger History"
                            }, void 0, false, {
                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                lineNumber: 286,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    setActiveTab('Log Receipt');
                                    setSelectedGRNDetail(null);
                                },
                                style: {
                                    padding: '8px 16px',
                                    border: activeTab === 'Log Receipt' ? '2px solid #2F4375' : '2px solid #DCE5F0',
                                    borderRadius: '8px',
                                    background: activeTab === 'Log Receipt' ? '#2F4375' : '#ffffff',
                                    color: activeTab === 'Log Receipt' ? '#ffffff' : '#5E6B82',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.18s ease'
                                },
                                children: "+ Log New Receipt"
                            }, void 0, false, {
                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                lineNumber: 302,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                        lineNumber: 285,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                lineNumber: 278,
                columnNumber: 7
            }, this),
            activeTab === 'GRN List' ? /* Tab 1: GRN List & History */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'grid',
                    gridTemplateColumns: selectedGRNDetail ? '1fr 400px' : '1fr',
                    gap: '20px',
                    alignItems: 'start'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "app-card",
                        style: {
                            overflow: 'hidden'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$DataTable$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            columns: [
                                {
                                    header: 'GRN Number',
                                    accessor: 'grn_number',
                                    render: (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            style: {
                                                color: 'var(--color-primary)'
                                            },
                                            children: row.grn_number
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                            lineNumber: 330,
                                            columnNumber: 82
                                        }, void 0)
                                },
                                {
                                    header: 'PO Number',
                                    accessor: 'purchase_order_number'
                                },
                                {
                                    header: 'Vendor Name',
                                    accessor: 'vendor_name'
                                },
                                {
                                    header: 'Date Received',
                                    accessor: 'received_date',
                                    render: (row)=>row.received_date ? new Date(row.received_date).toLocaleDateString() : 'N/A'
                                },
                                {
                                    header: 'Accepted',
                                    accessor: 'total_accepted',
                                    render: (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: parseFloat(row.total_accepted || 0).toLocaleString()
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                            lineNumber: 334,
                                            columnNumber: 84
                                        }, void 0)
                                },
                                {
                                    header: 'Rejected',
                                    accessor: 'total_rejected',
                                    render: (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                color: (row.total_rejected || 0) > 0 ? '#ef4444' : 'inherit'
                                            },
                                            children: parseFloat(row.total_rejected || 0).toLocaleString()
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                            lineNumber: 335,
                                            columnNumber: 84
                                        }, void 0)
                                },
                                {
                                    header: 'Status',
                                    accessor: 'status',
                                    render: (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            status: row.status
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                            lineNumber: 336,
                                            columnNumber: 74
                                        }, void 0)
                                }
                            ],
                            data: grns,
                            emptyMessage: isLoading ? 'Loading receipt log lists...' : 'No goods receipt notes logged yet.',
                            actions: (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "action-btn-icon",
                                            onClick: ()=>handleInspectGRN(row),
                                            title: "Inspect Details",
                                            style: {
                                                background: 'rgba(0,0,0,0.03)',
                                                border: 'none',
                                                padding: '6px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginRight: '4px'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                size: 14
                                            }, void 0, false, {
                                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                lineNumber: 343,
                                                columnNumber: 21
                                            }, void 0)
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                            lineNumber: 342,
                                            columnNumber: 19
                                        }, void 0),
                                        row.status === 'Draft' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "action-btn-icon",
                                                    onClick: ()=>handlePostInventory(row),
                                                    title: "Commit & Post to Inventory",
                                                    style: {
                                                        background: 'rgba(34,197,94,0.08)',
                                                        color: '#10b981',
                                                        border: 'none',
                                                        padding: '6px',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        marginRight: '4px'
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardCheck$3e$__["ClipboardCheck"], {
                                                        size: 14
                                                    }, void 0, false, {
                                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                        lineNumber: 348,
                                                        columnNumber: 25
                                                    }, void 0)
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                    lineNumber: 347,
                                                    columnNumber: 23
                                                }, void 0),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "action-btn-icon",
                                                    onClick: ()=>handleDeleteGRN(row),
                                                    title: "Delete Draft",
                                                    style: {
                                                        background: 'rgba(239,68,68,0.05)',
                                                        color: '#ef4444',
                                                        border: 'none',
                                                        padding: '6px',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                        size: 14
                                                    }, void 0, false, {
                                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                        lineNumber: 351,
                                                        columnNumber: 25
                                                    }, void 0)
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                    lineNumber: 350,
                                                    columnNumber: 23
                                                }, void 0)
                                            ]
                                        }, void 0, true)
                                    ]
                                }, void 0, true)
                        }, void 0, false, {
                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                            lineNumber: 328,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                        lineNumber: 327,
                        columnNumber: 11
                    }, this),
                    selectedGRNDetail && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "app-card",
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                            position: 'relative'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                style: {
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    border: 'none',
                                    background: 'transparent',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-secondary)'
                                },
                                onClick: ()=>setSelectedGRNDetail(null),
                                children: "✕"
                            }, void 0, false, {
                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                lineNumber: 363,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '11px',
                                            color: 'var(--color-text-secondary)',
                                            textTransform: 'uppercase',
                                            fontWeight: 'bold'
                                        },
                                        children: selectedGRNDetail.grn_number
                                    }, void 0, false, {
                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                        lineNumber: 366,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            margin: '4px 0 10px 0',
                                            fontSize: '18px',
                                            fontWeight: '800'
                                        },
                                        children: "Receipt Details"
                                    }, void 0, false, {
                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                        lineNumber: 367,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        status: selectedGRNDetail.status
                                    }, void 0, false, {
                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                        lineNumber: 368,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                lineNumber: 365,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    borderTop: '1px solid var(--color-border)',
                                    paddingTop: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                    fontSize: '13px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "PO Ref: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: selectedGRNDetail.purchase_order_number
                                            }, void 0, false, {
                                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                lineNumber: 372,
                                                columnNumber: 30
                                            }, this),
                                            " (Date: ",
                                            new Date(selectedGRNDetail.po_date).toLocaleDateString(),
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                        lineNumber: 372,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Vendor: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: [
                                                    selectedGRNDetail.vendor_name,
                                                    " (",
                                                    selectedGRNDetail.vendor_code,
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                lineNumber: 373,
                                                columnNumber: 30
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                        lineNumber: 373,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Delivery Challan: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: selectedGRNDetail.delivery_challan_number || 'N/A'
                                            }, void 0, false, {
                                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                lineNumber: 374,
                                                columnNumber: 40
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                        lineNumber: 374,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Date Received: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: new Date(selectedGRNDetail.received_date).toLocaleDateString()
                                            }, void 0, false, {
                                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                lineNumber: 375,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                        lineNumber: 375,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Received By: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: selectedGRNDetail.received_by_name || 'System Operator'
                                            }, void 0, false, {
                                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                lineNumber: 376,
                                                columnNumber: 35
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                        lineNumber: 376,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                lineNumber: 371,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    borderTop: '1px solid var(--color-border)',
                                    paddingTop: '16px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        style: {
                                            fontSize: '12px',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            color: 'var(--color-text-secondary)',
                                            marginBottom: '10px'
                                        },
                                        children: "Items Received"
                                    }, void 0, false, {
                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                        lineNumber: 381,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            maxHeight: '200px',
                                            overflowY: 'auto'
                                        },
                                        children: selectedGRNDetail.items && selectedGRNDetail.items.length > 0 ? selectedGRNDetail.items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    borderBottom: '1px solid var(--color-border)',
                                                    paddingBottom: '8px',
                                                    fontSize: '12px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontWeight: 'bold'
                                                        },
                                                        children: item.product_name
                                                    }, void 0, false, {
                                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                        lineNumber: 387,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            color: 'var(--color-text-secondary)',
                                                            fontSize: '11px',
                                                            marginTop: '2px'
                                                        },
                                                        children: [
                                                            "Code: ",
                                                            item.product_code,
                                                            " | Unit: ",
                                                            item.unit_of_measure
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                        lineNumber: 388,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            marginTop: '6px',
                                                            fontSize: '11.5px'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    "Recv: ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                        children: parseFloat(item.quantity_received).toLocaleString()
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                                        lineNumber: 392,
                                                                        columnNumber: 39
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                                lineNumber: 392,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    "Acpt: ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                        style: {
                                                                            color: '#10b981'
                                                                        },
                                                                        children: parseFloat(item.quantity_accepted).toLocaleString()
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                                        lineNumber: 393,
                                                                        columnNumber: 39
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                                lineNumber: 393,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    "Rejc: ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                        style: {
                                                                            color: item.quantity_rejected > 0 ? '#ef4444' : 'inherit'
                                                                        },
                                                                        children: parseFloat(item.quantity_rejected).toLocaleString()
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                                        lineNumber: 394,
                                                                        columnNumber: 39
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                                lineNumber: 394,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                        lineNumber: 391,
                                                        columnNumber: 25
                                                    }, this),
                                                    item.inspection_notes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            background: 'rgba(255,255,255,0.02)',
                                                            border: '1px solid var(--color-border)',
                                                            padding: '6px',
                                                            borderRadius: '4px',
                                                            fontSize: '10.5px',
                                                            marginTop: '6px',
                                                            fontStyle: 'italic'
                                                        },
                                                        children: [
                                                            "Inspect Note: ",
                                                            item.inspection_notes
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                        lineNumber: 397,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, item.id, true, {
                                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                lineNumber: 386,
                                                columnNumber: 23
                                            }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                color: 'var(--color-text-muted)',
                                                fontSize: '12px',
                                                textAlign: 'center'
                                            },
                                            children: "No items cataloged."
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                            lineNumber: 404,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                        lineNumber: 383,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                lineNumber: 380,
                                columnNumber: 15
                            }, this),
                            selectedGRNDetail.notes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    borderTop: '1px solid var(--color-border)',
                                    paddingTop: '12px',
                                    fontSize: '12px',
                                    color: 'var(--color-text-secondary)',
                                    fontStyle: 'italic'
                                },
                                children: [
                                    "Notes: ",
                                    selectedGRNDetail.notes
                                ]
                            }, void 0, true, {
                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                lineNumber: 410,
                                columnNumber: 17
                            }, this),
                            selectedGRNDetail.status === 'Draft' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    borderTop: '1px solid var(--color-border)',
                                    paddingTop: '16px'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "action-btn",
                                    style: {
                                        background: 'var(--color-primary)',
                                        color: '#000',
                                        fontWeight: 'bold',
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    },
                                    onClick: ()=>handlePostInventory(selectedGRNDetail),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clipboard$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ClipboardCheck$3e$__["ClipboardCheck"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                            lineNumber: 422,
                                            columnNumber: 21
                                        }, this),
                                        " Post Stock to Ledger"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                    lineNumber: 417,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                lineNumber: 416,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                        lineNumber: 362,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                lineNumber: 325,
                columnNumber: 9
            }, this) : /* Tab 2: Create GRN Receipt Form */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "app-card",
                style: {
                    padding: '24px',
                    maxWidth: '900px',
                    margin: '0 auto'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleCreateGRN,
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            style: {
                                fontSize: '16px',
                                fontWeight: '800',
                                borderBottom: '1px solid var(--color-border)',
                                paddingBottom: '8px',
                                margin: 0
                            },
                            children: "Log Arrivals & Inspection"
                        }, void 0, false, {
                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                            lineNumber: 437,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '16px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "form-group",
                                    style: {
                                        margin: 0
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "form-label",
                                            style: {
                                                fontWeight: '700'
                                            },
                                            children: "Select Purchase Order *"
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                            lineNumber: 441,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            className: "form-select",
                                            value: selectedPOId,
                                            onChange: (e)=>{
                                                setSelectedPOId(e.target.value);
                                                setSearchParams(e.target.value ? {
                                                    po: e.target.value
                                                } : {});
                                            },
                                            style: {
                                                height: '42px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "",
                                                    children: "-- Choose Purchase Order --"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                    lineNumber: 451,
                                                    columnNumber: 19
                                                }, this),
                                                purchaseOrders.filter((po)=>[
                                                        'Sent',
                                                        'Partially Received'
                                                    ].includes(po.status)).map((po)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: po.id,
                                                        children: [
                                                            po.purchase_order_number,
                                                            " - ",
                                                            po.vendor_name,
                                                            " (",
                                                            po.status,
                                                            ")"
                                                        ]
                                                    }, po.id, true, {
                                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                        lineNumber: 455,
                                                        columnNumber: 23
                                                    }, this))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                            lineNumber: 442,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                    lineNumber: 440,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "form-group",
                                    style: {
                                        margin: 0
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "form-label",
                                            style: {
                                                fontWeight: '700'
                                            },
                                            children: "Receiving Warehouse *"
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                            lineNumber: 461,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            className: "form-select",
                                            value: selectedWarehouseId,
                                            onChange: (e)=>setSelectedWarehouseId(e.target.value),
                                            style: {
                                                height: '42px'
                                            },
                                            children: warehouses.map((wh)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: wh.id,
                                                    children: [
                                                        wh.name,
                                                        " ",
                                                        wh.location ? "(".concat(wh.location, ")") : ''
                                                    ]
                                                }, wh.id, true, {
                                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                    lineNumber: 469,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                            lineNumber: 462,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                    lineNumber: 460,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                            lineNumber: 439,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '16px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "form-group",
                                    style: {
                                        margin: 0
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "form-label",
                                            style: {
                                                fontWeight: '700'
                                            },
                                            children: "Delivery Challan / Invoice No"
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                            lineNumber: 477,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            className: "form-input",
                                            placeholder: "e.g. DC-55421",
                                            value: deliveryChallanNo,
                                            onChange: (e)=>setDeliveryChallanNo(e.target.value),
                                            style: {
                                                height: '42px'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                            lineNumber: 478,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                    lineNumber: 476,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "form-group",
                                    style: {
                                        margin: 0
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "form-label",
                                            style: {
                                                fontWeight: '700'
                                            },
                                            children: "Arrival Date *"
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                            lineNumber: 489,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "date",
                                            className: "form-input",
                                            value: receivedDate,
                                            onChange: (e)=>setReceivedDate(e.target.value),
                                            style: {
                                                height: '42px'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                            lineNumber: 490,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                    lineNumber: 488,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                            lineNumber: 475,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "form-group",
                            style: {
                                margin: 0
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "form-label",
                                    style: {
                                        fontWeight: '700'
                                    },
                                    children: "Logistics Notes / Remarks"
                                }, void 0, false, {
                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                    lineNumber: 501,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    className: "form-input",
                                    rows: "2",
                                    placeholder: "Gate entry details, supervisor logs, vehicle number, or general shipment quality details...",
                                    value: grnNotes,
                                    onChange: (e)=>setGrnNotes(e.target.value)
                                }, void 0, false, {
                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                    lineNumber: 502,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                            lineNumber: 500,
                            columnNumber: 13
                        }, this),
                        selectedPO ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                borderTop: '1px solid var(--color-border)',
                                paddingTop: '20px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    style: {
                                        fontSize: '14px',
                                        fontWeight: '800',
                                        color: 'var(--color-text-primary)',
                                        marginBottom: '12px'
                                    },
                                    children: [
                                        "Ordered Items Receipt Checklist (PO: ",
                                        selectedPO.purchase_order_number,
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                    lineNumber: 514,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '16px'
                                    },
                                    children: selectedPO.items && selectedPO.items.length > 0 ? selectedPO.items.map((item)=>{
                                        const input = itemReceipts[item.id] || {
                                            quantity_received: 0,
                                            quantity_accepted: 0,
                                            quantity_rejected: 0,
                                            inspection_notes: ''
                                        };
                                        const remaining = Math.max(0, item.quantity_ordered - item.quantity_received);
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '12px',
                                                padding: '16px',
                                                background: 'rgba(255,255,255,0.01)'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        flexWrap: 'wrap',
                                                        gap: '8px',
                                                        borderBottom: '1px dashed var(--color-border)',
                                                        paddingBottom: '8px',
                                                        marginBottom: '12px'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    style: {
                                                                        color: 'var(--color-text-primary)'
                                                                    },
                                                                    children: item.product_name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                                    lineNumber: 533,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        fontSize: '11px',
                                                                        color: 'var(--color-text-secondary)',
                                                                        marginLeft: '8px'
                                                                    },
                                                                    children: [
                                                                        "Code: ",
                                                                        item.product_code
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                                    lineNumber: 534,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                            lineNumber: 532,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            style: {
                                                                fontSize: '12px',
                                                                color: 'var(--color-text-secondary)'
                                                            },
                                                            children: [
                                                                "Ordered: ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: parseFloat(item.quantity_ordered).toLocaleString()
                                                                }, void 0, false, {
                                                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                                    lineNumber: 537,
                                                                    columnNumber: 40
                                                                }, this),
                                                                " | Received: ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: parseFloat(item.quantity_received).toLocaleString()
                                                                }, void 0, false, {
                                                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                                    lineNumber: 537,
                                                                    columnNumber: 122
                                                                }, this),
                                                                " | Remaining: ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    style: {
                                                                        color: remaining > 0 ? 'var(--color-primary)' : 'inherit'
                                                                    },
                                                                    children: [
                                                                        remaining.toLocaleString(),
                                                                        " ",
                                                                        item.unit_of_measure
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                                    lineNumber: 537,
                                                                    columnNumber: 206
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                            lineNumber: 536,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                    lineNumber: 531,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                                                        gap: '12px',
                                                        marginBottom: '12px'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "form-group",
                                                            style: {
                                                                margin: 0
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    className: "form-label",
                                                                    style: {
                                                                        fontSize: '11.5px',
                                                                        fontWeight: 'bold'
                                                                    },
                                                                    children: "Delivered Qty"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                                    lineNumber: 543,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "number",
                                                                    className: "form-input",
                                                                    placeholder: "0.00",
                                                                    value: input.quantity_received,
                                                                    onChange: (e)=>handleItemReceiptChange(item.id, 'quantity_received', e.target.value),
                                                                    style: {
                                                                        height: '36px',
                                                                        textAlign: 'right'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                                    lineNumber: 544,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                            lineNumber: 542,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "form-group",
                                                            style: {
                                                                margin: 0
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    className: "form-label",
                                                                    style: {
                                                                        fontSize: '11.5px',
                                                                        fontWeight: 'bold',
                                                                        color: '#10b981'
                                                                    },
                                                                    children: "Accepted Qty"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                                    lineNumber: 554,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "number",
                                                                    className: "form-input",
                                                                    placeholder: "0.00",
                                                                    value: input.quantity_accepted,
                                                                    onChange: (e)=>handleItemReceiptChange(item.id, 'quantity_accepted', e.target.value),
                                                                    style: {
                                                                        height: '36px',
                                                                        textAlign: 'right',
                                                                        borderColor: '#10b981',
                                                                        background: 'rgba(16,185,129,0.01)'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                                    lineNumber: 555,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                            lineNumber: 553,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "form-group",
                                                            style: {
                                                                margin: 0
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                    className: "form-label",
                                                                    style: {
                                                                        fontSize: '11.5px',
                                                                        fontWeight: 'bold',
                                                                        color: '#ef4444'
                                                                    },
                                                                    children: "Rejected Qty"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                                    lineNumber: 565,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    type: "number",
                                                                    className: "form-input",
                                                                    placeholder: "0.00",
                                                                    value: input.quantity_rejected,
                                                                    onChange: (e)=>handleItemReceiptChange(item.id, 'quantity_rejected', e.target.value),
                                                                    style: {
                                                                        height: '36px',
                                                                        textAlign: 'right',
                                                                        borderColor: '#ef4444',
                                                                        background: 'rgba(239,68,68,0.01)'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                                    lineNumber: 566,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                            lineNumber: 564,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                    lineNumber: 541,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "form-group",
                                                    style: {
                                                        margin: 0
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "form-label",
                                                            style: {
                                                                fontSize: '11px',
                                                                color: 'var(--color-text-secondary)'
                                                            },
                                                            children: "QC Inspector Notes / Damage Reports"
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                            lineNumber: 578,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            className: "form-input",
                                                            placeholder: "e.g. Received in good condition / 5 bags rejected due to moisture damage",
                                                            value: input.inspection_notes,
                                                            onChange: (e)=>handleItemReceiptChange(item.id, 'inspection_notes', e.target.value),
                                                            style: {
                                                                height: '36px'
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                            lineNumber: 579,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                                    lineNumber: 577,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, item.id, true, {
                                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                            lineNumber: 530,
                                            columnNumber: 25
                                        }, this);
                                    }) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            color: 'var(--color-text-secondary)',
                                            textAlign: 'center',
                                            padding: '20px'
                                        },
                                        children: "No items in selected Purchase Order."
                                    }, void 0, false, {
                                        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                        lineNumber: 592,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                    lineNumber: 518,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                            lineNumber: 513,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                borderTop: '1px solid var(--color-border)',
                                paddingTop: '20px',
                                paddingBottom: '20px',
                                textAlign: 'center',
                                color: 'var(--color-text-secondary)'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$truck$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Truck$3e$__["Truck"], {
                                    size: 32,
                                    style: {
                                        opacity: 0.3,
                                        marginBottom: '8px'
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                    lineNumber: 598,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: "Please select a Purchase Order from above to verify and log arriving items."
                                }, void 0, false, {
                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                    lineNumber: 599,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                            lineNumber: 597,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                                borderTop: '1px solid var(--color-border)',
                                paddingTop: '16px',
                                marginTop: '10px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "action-btn",
                                    style: {
                                        background: 'transparent',
                                        border: '1px solid var(--color-border)',
                                        color: 'var(--color-text-primary)'
                                    },
                                    onClick: ()=>{
                                        setSelectedPOId('');
                                        setSelectedPO(null);
                                        setSearchParams({});
                                        setActiveTab('GRN List');
                                    },
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                    lineNumber: 604,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    className: "action-btn",
                                    style: {
                                        background: 'var(--color-primary)',
                                        color: '#000',
                                        fontWeight: 'bold'
                                    },
                                    disabled: !selectedPOId || isLoading,
                                    children: "Log Goods Receipt (GRN)"
                                }, void 0, false, {
                                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                                    lineNumber: 617,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                            lineNumber: 603,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                    lineNumber: 435,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
                lineNumber: 434,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/modules/purchase/pages/GoodsReceiptNote.jsx",
        lineNumber: 275,
        columnNumber: 5
    }, this);
}
_s(GoodsReceiptNote, "LkprbbLwOSm9IvYv8vny8T3r4BY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = GoodsReceiptNote;
var _c;
__turbopack_context__.k.register(_c, "GoodsReceiptNote");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/modules/purchase/pages/VendorManagement.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>VendorManagement
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$searchStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/searchStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.all.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.mjs [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pen.mjs [app-client] (ecmascript) <export default as Edit2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.mjs [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/phone.mjs [app-client] (ecmascript) <export default as Phone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mail.mjs [app-client] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.mjs [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/credit-card.mjs [app-client] (ecmascript) <export default as CreditCard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.mjs [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.mjs [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$DataTable$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/components/DataTable.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/components/StatusBadge.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$purchase$2f$services$2f$purchase$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/modules/purchase/services/purchase.service.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
function VendorManagement() {
    _s();
    const globalSearch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$searchStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchStore"])({
        "VendorManagement.useSearchStore[globalSearch]": (s)=>s.globalSearch
    }["VendorManagement.useSearchStore[globalSearch]"]);
    const [vendors, setVendors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showModal, setShowModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editingVendor, setEditingVendor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedVendorDetail, setSelectedVendorDetail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Form State
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        vendor_name: '',
        vendor_code: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        gstin: '',
        payment_terms: 'Net 30',
        credit_limit: 0,
        notes: ''
    });
    const fetchVendors = async ()=>{
        setIsLoading(true);
        try {
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$purchase$2f$services$2f$purchase$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getVendors"]();
            setVendors(data || []);
        } catch (err) {
            console.error('Fetch vendors error:', err);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Error', err.message || 'Failed to load vendors', 'error');
        } finally{
            setIsLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VendorManagement.useEffect": ()=>{
            fetchVendors();
        }
    }["VendorManagement.useEffect"], []);
    const handleOpenAdd = ()=>{
        setEditingVendor(null);
        setFormData({
            vendor_name: '',
            vendor_code: '',
            contact_person: '',
            email: '',
            phone: '',
            address: '',
            gstin: '',
            payment_terms: 'Net 30',
            credit_limit: 0,
            notes: ''
        });
        setShowModal(true);
    };
    const handleOpenEdit = (vendor)=>{
        setEditingVendor(vendor);
        setFormData({
            vendor_name: vendor.vendor_name || '',
            vendor_code: vendor.vendor_code || '',
            contact_person: vendor.contact_person || '',
            email: vendor.email || '',
            phone: vendor.phone || '',
            address: vendor.address || '',
            gstin: vendor.gstin || '',
            payment_terms: vendor.payment_terms || 'Net 30',
            credit_limit: vendor.credit_limit || 0,
            notes: vendor.notes || ''
        });
        setShowModal(true);
    };
    const handleInspect = async (vendor)=>{
        try {
            const detailed = await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$purchase$2f$services$2f$purchase$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getVendorById"](vendor.id);
            setSelectedVendorDetail(detailed);
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Error', 'Failed to fetch vendor profile details', 'error');
        }
    };
    const handleDelete = async (vendor)=>{
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire({
            title: 'Delete Vendor?',
            text: "Are you sure you want to delete ".concat(vendor.vendor_name, "? This cannot be undone if they have no transactions."),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel'
        });
        if (result.isConfirmed) {
            try {
                await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$purchase$2f$services$2f$purchase$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteVendor"](vendor.id);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Success', 'Vendor deleted successfully', 'success');
                fetchVendors();
                if ((selectedVendorDetail === null || selectedVendorDetail === void 0 ? void 0 : selectedVendorDetail.id) === vendor.id) {
                    setSelectedVendorDetail(null);
                }
            } catch (err) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Error', err.message || 'Failed to delete vendor', 'error');
            }
        }
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (!formData.vendor_name.trim()) return;
        try {
            if (editingVendor) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$purchase$2f$services$2f$purchase$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateVendor"](editingVendor.id, formData);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Success', 'Vendor updated successfully', 'success');
            } else {
                await __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$purchase$2f$services$2f$purchase$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createVendor"](formData);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Success', 'Vendor created successfully', 'success');
            }
            setShowModal(false);
            fetchVendors();
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$all$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].fire('Error', err.message || 'Operation failed', 'error');
        }
    };
    const formatCurrency = (val)=>{
        return "₹".concat(parseFloat(val || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2
        }));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "module-header-row",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "module-title",
                                children: "Vendor Registry"
                            }, void 0, false, {
                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                lineNumber: 147,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: '13px',
                                    color: 'var(--color-text-secondary)',
                                    marginTop: '4px'
                                },
                                children: "Manage supplier records, credit limits, and purchase order histories."
                            }, void 0, false, {
                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                lineNumber: 148,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                        lineNumber: 146,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "action-btn",
                        style: {
                            background: 'var(--color-primary)',
                            color: '#000',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        },
                        onClick: handleOpenAdd,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                lineNumber: 153,
                                columnNumber: 11
                            }, this),
                            " Add Vendor"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                        lineNumber: 152,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                lineNumber: 145,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'grid',
                    gridTemplateColumns: selectedVendorDetail ? '1fr 350px' : '1fr',
                    gap: '20px',
                    alignItems: 'start'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "app-card",
                        style: {
                            overflow: 'hidden'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$DataTable$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            columns: [
                                {
                                    header: 'Code',
                                    accessor: 'vendor_code',
                                    render: (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            style: {
                                                color: 'var(--color-text-primary)'
                                            },
                                            children: row.vendor_code
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 164,
                                            columnNumber: 75
                                        }, void 0)
                                },
                                {
                                    header: 'Vendor Name',
                                    accessor: 'vendor_name'
                                },
                                {
                                    header: 'Contact Person',
                                    accessor: 'contact_person'
                                },
                                {
                                    header: 'Email / Phone',
                                    accessor: 'email',
                                    render: (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '12px'
                                            },
                                            children: [
                                                row.email && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: row.email
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                    lineNumber: 169,
                                                    columnNumber: 33
                                                }, void 0),
                                                row.phone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        color: 'var(--color-text-secondary)'
                                                    },
                                                    children: row.phone
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                    lineNumber: 170,
                                                    columnNumber: 33
                                                }, void 0)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 168,
                                            columnNumber: 17
                                        }, void 0)
                                },
                                {
                                    header: 'GSTIN',
                                    accessor: 'gstin'
                                },
                                {
                                    header: 'Total Spent',
                                    accessor: 'total_spent',
                                    render: (row)=>formatCurrency(row.total_spent)
                                },
                                {
                                    header: 'Status',
                                    accessor: 'is_active',
                                    render: (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            status: row.is_active ? 'Active' : 'Inactive'
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 175,
                                            columnNumber: 75
                                        }, void 0)
                                }
                            ],
                            data: vendors,
                            searchQuery: globalSearch,
                            searchField: "vendor_name",
                            emptyMessage: isLoading ? 'Loading supplier registry sheets...' : 'No vendors registered yet.',
                            actions: (row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "action-btn-icon",
                                            onClick: ()=>handleInspect(row),
                                            title: "Inspect Details",
                                            style: {
                                                background: 'rgba(0,0,0,0.03)',
                                                border: 'none',
                                                padding: '6px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginRight: '4px'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                                size: 14
                                            }, void 0, false, {
                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                lineNumber: 184,
                                                columnNumber: 19
                                            }, void 0)
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 183,
                                            columnNumber: 17
                                        }, void 0),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "action-btn-icon",
                                            onClick: ()=>handleOpenEdit(row),
                                            title: "Edit Vendor",
                                            style: {
                                                background: 'rgba(0,0,0,0.03)',
                                                border: 'none',
                                                padding: '6px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                marginRight: '4px'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pen$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit2$3e$__["Edit2"], {
                                                size: 14
                                            }, void 0, false, {
                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                lineNumber: 187,
                                                columnNumber: 19
                                            }, void 0)
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 186,
                                            columnNumber: 17
                                        }, void 0),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "action-btn-icon",
                                            onClick: ()=>handleDelete(row),
                                            title: "Delete Vendor",
                                            style: {
                                                background: 'rgba(239,68,68,0.05)',
                                                color: '#ef4444',
                                                border: 'none',
                                                padding: '6px',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                size: 14
                                            }, void 0, false, {
                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                lineNumber: 190,
                                                columnNumber: 19
                                            }, void 0)
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 189,
                                            columnNumber: 17
                                        }, void 0)
                                    ]
                                }, void 0, true)
                        }, void 0, false, {
                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                            lineNumber: 162,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                        lineNumber: 161,
                        columnNumber: 9
                    }, this),
                    selectedVendorDetail && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "app-card",
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                            position: 'relative'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                style: {
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    border: 'none',
                                    background: 'transparent',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-secondary)'
                                },
                                onClick: ()=>setSelectedVendorDetail(null),
                                children: "✕"
                            }, void 0, false, {
                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                lineNumber: 200,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: '11px',
                                            color: 'var(--color-text-secondary)',
                                            textTransform: 'uppercase',
                                            fontWeight: 'bold'
                                        },
                                        children: selectedVendorDetail.vendor_code
                                    }, void 0, false, {
                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                        lineNumber: 203,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        style: {
                                            margin: '4px 0 10px 0',
                                            fontSize: '18px',
                                            fontWeight: '800'
                                        },
                                        children: selectedVendorDetail.vendor_name
                                    }, void 0, false, {
                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                        lineNumber: 204,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$components$2f$StatusBadge$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        status: selectedVendorDetail.is_active ? 'Active' : 'Inactive'
                                    }, void 0, false, {
                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                        lineNumber: 205,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                lineNumber: 202,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    borderTop: '1px solid var(--color-border)',
                                    paddingTop: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    fontSize: '13px'
                                },
                                children: [
                                    selectedVendorDetail.contact_person && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                size: 14,
                                                style: {
                                                    color: 'var(--color-primary)'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                lineNumber: 211,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "Contact: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: selectedVendorDetail.contact_person
                                                    }, void 0, false, {
                                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                        lineNumber: 212,
                                                        columnNumber: 34
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                lineNumber: 212,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                        lineNumber: 210,
                                        columnNumber: 17
                                    }, this),
                                    selectedVendorDetail.phone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__["Phone"], {
                                                size: 14,
                                                style: {
                                                    color: 'var(--color-text-secondary)'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                lineNumber: 217,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "Phone: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: "tel:".concat(selectedVendorDetail.phone),
                                                        children: selectedVendorDetail.phone
                                                    }, void 0, false, {
                                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                        lineNumber: 218,
                                                        columnNumber: 32
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                lineNumber: 218,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                        lineNumber: 216,
                                        columnNumber: 17
                                    }, this),
                                    selectedVendorDetail.email && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                                                size: 14,
                                                style: {
                                                    color: 'var(--color-text-secondary)'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                lineNumber: 223,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                style: {
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                },
                                                children: [
                                                    "Email: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: "mailto:".concat(selectedVendorDetail.email),
                                                        children: selectedVendorDetail.email
                                                    }, void 0, false, {
                                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                        lineNumber: 224,
                                                        columnNumber: 111
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                lineNumber: 224,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                        lineNumber: 222,
                                        columnNumber: 17
                                    }, this),
                                    selectedVendorDetail.address && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'start',
                                            gap: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                size: 14,
                                                style: {
                                                    color: 'var(--color-text-secondary)',
                                                    marginTop: '2px'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                lineNumber: 229,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "Address: ",
                                                    selectedVendorDetail.address
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                lineNumber: 230,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                        lineNumber: 228,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"], {
                                                size: 14,
                                                style: {
                                                    color: 'var(--color-text-secondary)'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                lineNumber: 234,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "GSTIN: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: selectedVendorDetail.gstin || 'N/A'
                                                    }, void 0, false, {
                                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                        lineNumber: 235,
                                                        columnNumber: 30
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                lineNumber: 235,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                        lineNumber: 233,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                size: 14,
                                                style: {
                                                    color: 'var(--color-text-secondary)'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                lineNumber: 238,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "Terms: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: selectedVendorDetail.payment_terms || 'N/A'
                                                    }, void 0, false, {
                                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                        lineNumber: 239,
                                                        columnNumber: 30
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                lineNumber: 239,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                        lineNumber: 237,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$credit$2d$card$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CreditCard$3e$__["CreditCard"], {
                                                size: 14,
                                                style: {
                                                    color: 'var(--color-text-secondary)'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                lineNumber: 242,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "Credit Limit: ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: formatCurrency(selectedVendorDetail.credit_limit)
                                                    }, void 0, false, {
                                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                        lineNumber: 243,
                                                        columnNumber: 37
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                lineNumber: 243,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                        lineNumber: 241,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                lineNumber: 208,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    borderTop: '1px solid var(--color-border)',
                                    paddingTop: '16px'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                        style: {
                                            fontSize: '12px',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            color: 'var(--color-text-secondary)',
                                            marginBottom: '10px'
                                        },
                                        children: "Purchase Order History"
                                    }, void 0, false, {
                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                        lineNumber: 248,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                            maxHeight: '160px',
                                            overflowY: 'auto'
                                        },
                                        children: selectedVendorDetail.purchase_orders && selectedVendorDetail.purchase_orders.length > 0 ? selectedVendorDetail.purchase_orders.map((po)=>po && po.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    background: 'rgba(255,255,255,0.01)',
                                                    border: '1px solid var(--color-border)',
                                                    padding: '8px',
                                                    borderRadius: '6px',
                                                    fontSize: '11.5px'
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                style: {
                                                                    color: 'var(--color-primary)'
                                                                },
                                                                children: po.po_number
                                                            }, void 0, false, {
                                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                                lineNumber: 254,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    color: '#888',
                                                                    fontSize: '10px',
                                                                    marginTop: '2px'
                                                                },
                                                                children: po.date ? new Date(po.date).toLocaleDateString() : 'N/A'
                                                            }, void 0, false, {
                                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                                lineNumber: 255,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                        lineNumber: 253,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            textAlign: 'right'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: formatCurrency(po.total)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                                    lineNumber: 258,
                                                                    columnNumber: 30
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                                lineNumber: 258,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                style: {
                                                                    fontSize: '9px',
                                                                    fontWeight: 'bold',
                                                                    color: po.status === 'Closed' || po.status === 'Received' ? '#10b981' : '#f59e0b'
                                                                },
                                                                children: po.status
                                                            }, void 0, false, {
                                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                                lineNumber: 259,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                        lineNumber: 257,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, po.id, true, {
                                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                lineNumber: 252,
                                                columnNumber: 21
                                            }, this) : null) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: '11.5px',
                                                color: 'var(--color-text-muted)',
                                                textAlign: 'center',
                                                padding: '16px'
                                            },
                                            children: "No POs registered for this vendor."
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 264,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                        lineNumber: 249,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                lineNumber: 247,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                        lineNumber: 199,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                lineNumber: 158,
                columnNumber: 7
            }, this),
            showModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "modal-overlay active",
                onClick: ()=>setShowModal(false),
                style: {
                    zIndex: 10000
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "modal-box",
                    onClick: (e)=>e.stopPropagation(),
                    style: {
                        width: '600px',
                        maxWidth: '100%'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "modal-header-row",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "modal-title-text",
                                    children: editingVendor ? 'Edit Supplier Record' : 'Register New Supplier'
                                }, void 0, false, {
                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                    lineNumber: 279,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "modal-close-btn",
                                    onClick: ()=>setShowModal(false),
                                    children: "✕"
                                }, void 0, false, {
                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                    lineNumber: 280,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                            lineNumber: 278,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleSubmit,
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                marginTop: '16px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "form-group",
                                    style: {
                                        margin: 0
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "form-label",
                                            children: "Vendor/Supplier Name *"
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 285,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            required: true,
                                            className: "form-input",
                                            placeholder: "e.g. Reliance Steel Corp",
                                            value: formData.vendor_name,
                                            onChange: (e)=>setFormData({
                                                    ...formData,
                                                    vendor_name: e.target.value
                                                })
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 286,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                    lineNumber: 284,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '16px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "form-group",
                                            style: {
                                                margin: 0
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "form-label",
                                                    children: "Contact Person"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                    lineNumber: 294,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    className: "form-input",
                                                    placeholder: "e.g. John Doe",
                                                    value: formData.contact_person,
                                                    onChange: (e)=>setFormData({
                                                            ...formData,
                                                            contact_person: e.target.value
                                                        })
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                    lineNumber: 295,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 293,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "form-group",
                                            style: {
                                                margin: 0
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "form-label",
                                                    children: "Vendor Code (Auto-generated if blank)"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                    lineNumber: 301,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    className: "form-input",
                                                    placeholder: "e.g. VND-0001",
                                                    disabled: !!editingVendor,
                                                    value: formData.vendor_code,
                                                    onChange: (e)=>setFormData({
                                                            ...formData,
                                                            vendor_code: e.target.value
                                                        })
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                    lineNumber: 302,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 300,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                    lineNumber: 292,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '16px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "form-group",
                                            style: {
                                                margin: 0
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "form-label",
                                                    children: "Phone Number"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                    lineNumber: 311,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    className: "form-input",
                                                    placeholder: "e.g. +91 9988776655",
                                                    value: formData.phone,
                                                    onChange: (e)=>setFormData({
                                                            ...formData,
                                                            phone: e.target.value
                                                        })
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                    lineNumber: 312,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 310,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "form-group",
                                            style: {
                                                margin: 0
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "form-label",
                                                    children: "Email Address"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                    lineNumber: 318,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "email",
                                                    className: "form-input",
                                                    placeholder: "e.g. contact@supplier.com",
                                                    value: formData.email,
                                                    onChange: (e)=>setFormData({
                                                            ...formData,
                                                            email: e.target.value
                                                        })
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                    lineNumber: 319,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 317,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                    lineNumber: 309,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '16px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "form-group",
                                            style: {
                                                margin: 0
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "form-label",
                                                    children: "GSTIN"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                    lineNumber: 328,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    className: "form-input",
                                                    placeholder: "e.g. 07AAAAA1111A1Z1",
                                                    value: formData.gstin,
                                                    onChange: (e)=>setFormData({
                                                            ...formData,
                                                            gstin: e.target.value
                                                        })
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                    lineNumber: 329,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 327,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "form-group",
                                            style: {
                                                margin: 0
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "form-label",
                                                    children: "Payment Terms"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                    lineNumber: 335,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    className: "form-select",
                                                    value: formData.payment_terms,
                                                    onChange: (e)=>setFormData({
                                                            ...formData,
                                                            payment_terms: e.target.value
                                                        }),
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "Net 15",
                                                            children: "Net 15 Days"
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                            lineNumber: 340,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "Net 30",
                                                            children: "Net 30 Days"
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                            lineNumber: 341,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "Net 45",
                                                            children: "Net 45 Days"
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                            lineNumber: 342,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "Net 60",
                                                            children: "Net 60 Days"
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                            lineNumber: 343,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "COD",
                                                            children: "Cash On Delivery"
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                            lineNumber: 344,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                    lineNumber: 336,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 334,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                    lineNumber: 326,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '16px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "form-group",
                                            style: {
                                                margin: 0
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "form-label",
                                                    children: "Credit Limit (INR)"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                    lineNumber: 351,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "number",
                                                    className: "form-input",
                                                    placeholder: "e.g. 500000",
                                                    value: formData.credit_limit,
                                                    onChange: (e)=>setFormData({
                                                            ...formData,
                                                            credit_limit: Number(e.target.value)
                                                        })
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                    lineNumber: 352,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 350,
                                            columnNumber: 17
                                        }, this),
                                        editingVendor && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "form-group",
                                            style: {
                                                margin: 0
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "form-label",
                                                    children: "Vendor Status"
                                                }, void 0, false, {
                                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                    lineNumber: 359,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                    className: "form-select",
                                                    value: formData.is_active ? 'true' : 'false',
                                                    onChange: (e)=>setFormData({
                                                            ...formData,
                                                            is_active: e.target.value === 'true'
                                                        }),
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "true",
                                                            children: "Active"
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                            lineNumber: 364,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: "false",
                                                            children: "Inactive"
                                                        }, void 0, false, {
                                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                            lineNumber: 365,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                                    lineNumber: 360,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 358,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                    lineNumber: 349,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "form-group",
                                    style: {
                                        margin: 0
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "form-label",
                                            children: "Supplier Address"
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 372,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                            className: "form-input",
                                            rows: "2",
                                            placeholder: "Corporate head office address...",
                                            value: formData.address,
                                            onChange: (e)=>setFormData({
                                                    ...formData,
                                                    address: e.target.value
                                                })
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 373,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                    lineNumber: 371,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "form-group",
                                    style: {
                                        margin: 0
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "form-label",
                                            children: "Internal Remarks / Notes"
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 380,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                            className: "form-input",
                                            rows: "2",
                                            placeholder: "Bank details, key POC names, or logistics preferences...",
                                            value: formData.notes,
                                            onChange: (e)=>setFormData({
                                                    ...formData,
                                                    notes: e.target.value
                                                })
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 381,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                    lineNumber: 379,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        gap: '12px',
                                        borderTop: '1px solid var(--color-border)',
                                        paddingTop: '16px',
                                        marginTop: '10px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: "action-btn",
                                            style: {
                                                background: 'transparent',
                                                border: '1px solid var(--color-border)',
                                                color: 'var(--color-text-primary)'
                                            },
                                            onClick: ()=>setShowModal(false),
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 388,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            className: "action-btn",
                                            style: {
                                                background: 'var(--color-primary)',
                                                color: '#000',
                                                fontWeight: 'bold'
                                            },
                                            children: editingVendor ? 'Save Changes' : 'Register Supplier'
                                        }, void 0, false, {
                                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                            lineNumber: 391,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                                    lineNumber: 387,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                            lineNumber: 283,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                    lineNumber: 277,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
                lineNumber: 276,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/modules/purchase/pages/VendorManagement.jsx",
        lineNumber: 142,
        columnNumber: 5
    }, this);
}
_s(VendorManagement, "EWs1wxDxJWlPSXNWpMRZalpVRZ0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$searchStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchStore"]
    ];
});
_c = VendorManagement;
var _c;
__turbopack_context__.k.register(_c, "VendorManagement");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=modules_purchase_af711139._.js.map