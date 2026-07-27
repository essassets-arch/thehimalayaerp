(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/store/searchStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSearchStore",
    ()=>useSearchStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
const useSearchStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
        globalSearch: '',
        setGlobalSearch: (globalSearch)=>set({
                globalSearch
            })
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/store/materialFlow.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/* eslint-disable @typescript-eslint/no-explicit-any */ __turbopack_context__.s([
    "approveMaterialRequest",
    ()=>approveMaterialRequest,
    "approveStoreMaterialRequest",
    ()=>approveStoreMaterialRequest,
    "issueCompleteOrderMaterials",
    ()=>issueCompleteOrderMaterials,
    "rejectMaterialRequest",
    ()=>rejectMaterialRequest,
    "rejectStoreMaterialRequest",
    ()=>rejectStoreMaterialRequest,
    "selectMaterialRequests",
    ()=>selectMaterialRequests,
    "selectPlantHeadHistoryRequests",
    ()=>selectPlantHeadHistoryRequests,
    "selectPlantHeadPendingRequests",
    ()=>selectPlantHeadPendingRequests,
    "selectProductionStoreReleases",
    ()=>selectProductionStoreReleases,
    "selectStoreApprovedRequests",
    ()=>selectStoreApprovedRequests,
    "selectStoreReleaseRequests",
    ()=>selectStoreReleaseRequests,
    "selectStoreRequestHistory",
    ()=>selectStoreRequestHistory,
    "submitMaterialRequest",
    ()=>submitMaterialRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/production.ts [app-client] (ecmascript)");
;
;
;
const requests = (state)=>{
    var _state_production;
    return Array.isArray(state === null || state === void 0 ? void 0 : (_state_production = state.production) === null || _state_production === void 0 ? void 0 : _state_production.materialRequests) ? state.production.materialRequests : [];
};
const selectMaterialRequests = requests;
const selectPlantHeadPendingRequests = (state)=>requests(state).filter((request)=>request.status === __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].PENDING_PLANT_HEAD_APPROVAL);
const selectPlantHeadHistoryRequests = (state)=>requests(state).filter((request)=>request.status !== __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].PENDING_PLANT_HEAD_APPROVAL);
const selectStoreApprovedRequests = (state)=>requests(state).filter((request)=>request.status === __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].PLANT_HEAD_APPROVED);
const selectStoreRequestHistory = (state)=>requests(state).filter((request)=>request.status === __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].STORE_REJECTED);
const selectStoreReleaseRequests = (state)=>requests(state).filter((request)=>request.status === __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].STORE_APPROVED);
const selectProductionStoreReleases = (state)=>requests(state).filter((request)=>request.department === 'Production' && request.status === __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].ISSUED);
const commit = (updater)=>{
    const store = __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState();
    store.setState(updater(store.state || {}));
};
const materialMatches = (inventoryItem, requestItem)=>[
        inventoryItem === null || inventoryItem === void 0 ? void 0 : inventoryItem.id,
        inventoryItem === null || inventoryItem === void 0 ? void 0 : inventoryItem.materialId,
        inventoryItem === null || inventoryItem === void 0 ? void 0 : inventoryItem.code
    ].filter(Boolean).includes(requestItem === null || requestItem === void 0 ? void 0 : requestItem.materialId) || String((inventoryItem === null || inventoryItem === void 0 ? void 0 : inventoryItem.material) || (inventoryItem === null || inventoryItem === void 0 ? void 0 : inventoryItem.name) || '').toLowerCase() === String((requestItem === null || requestItem === void 0 ? void 0 : requestItem.materialName) || (requestItem === null || requestItem === void 0 ? void 0 : requestItem.material) || '').toLowerCase();
const submitMaterialRequest = (data)=>{
    const now = new Date().toISOString();
    const id = data.id || __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().generateEntityId('materialRequest');
    const request = {
        ...data,
        id,
        requestNo: id,
        orderId: data.orderId || data.workOrderNo || '',
        department: 'Production',
        items: (data.items || []).map((item, index)=>({
                ...item,
                materialId: item.materialId || item.id || "MAT-".concat(Date.now(), "-").concat(index + 1),
                materialName: item.materialName || item.material,
                material: item.materialName || item.material,
                requestedQty: Number(item.requestedQty || 0),
                approvedQty: 0,
                issuedQty: 0,
                unit: item.unit || 'Units'
            })),
        status: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].PENDING_PLANT_HEAD_APPROVAL,
        createdAt: data.createdAt || now
    };
    commit((state)=>({
            ...state,
            production: {
                ...state.production || {},
                materialRequests: [
                    request,
                    ...requests(state)
                ]
            }
        }));
    return request;
};
const approveMaterialRequest = function(requestId, approvedItems) {
    let approvedBy = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 'Plant Head';
    const approvedAt = new Date().toISOString();
    commit((state)=>({
            ...state,
            production: {
                ...state.production || {},
                materialRequests: requests(state).map((request)=>request.id === requestId ? {
                        ...request,
                        status: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].PLANT_HEAD_APPROVED,
                        approvedBy,
                        approvedAt,
                        items: request.items.map((item)=>{
                            const approved = approvedItems.find((candidate)=>candidate.materialId === item.materialId || candidate.materialName === item.materialName || candidate.material === item.material);
                            var _approved_approvedQty, _ref;
                            return {
                                ...item,
                                approvedQty: Number((_ref = (_approved_approvedQty = approved === null || approved === void 0 ? void 0 : approved.approvedQty) !== null && _approved_approvedQty !== void 0 ? _approved_approvedQty : item.requestedQty) !== null && _ref !== void 0 ? _ref : 0)
                            };
                        })
                    } : request)
            }
        }));
};
const rejectMaterialRequest = function(requestId) {
    let approvedBy = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'Plant Head';
    const approvedAt = new Date().toISOString();
    commit((state)=>({
            ...state,
            production: {
                ...state.production || {},
                materialRequests: requests(state).map((request)=>request.id === requestId ? {
                        ...request,
                        status: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].PLANT_HEAD_REJECTED,
                        approvedBy,
                        approvedAt
                    } : request)
            }
        }));
};
const approveStoreMaterialRequest = function(requestId) {
    let actorName = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'Store';
    const store = __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState();
    const state = store.state || {};
    const request = requests(state).find((entry)=>entry.id === requestId);
    if (!request) throw new Error('Material request not found.');
    if (request.status !== __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].PLANT_HEAD_APPROVED) {
        throw new Error('Only a Plant Head approved request can be Store approved.');
    }
    const storeApprovedAt = new Date().toISOString();
    store.setState({
        ...state,
        production: {
            ...state.production || {},
            materialRequests: requests(state).map((entry)=>entry.id === requestId ? {
                    ...entry,
                    status: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].STORE_APPROVED,
                    storeApprovedBy: actorName,
                    storeApprovedAt,
                    items: entry.items.map((item)=>({
                            ...item,
                            issueQty: Number(item.approvedQty || 0)
                        }))
                } : entry)
        }
    });
};
const rejectStoreMaterialRequest = function(requestId, remarks) {
    let actorName = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 'Store';
    if (!(remarks === null || remarks === void 0 ? void 0 : remarks.trim())) throw new Error('Rejection reason is required.');
    const storeRejectedAt = new Date().toISOString();
    commit((state)=>({
            ...state,
            production: {
                ...state.production || {},
                materialRequests: requests(state).map((request)=>request.id === requestId && request.status === __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].PLANT_HEAD_APPROVED ? {
                        ...request,
                        status: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].STORE_REJECTED,
                        storeRejectedBy: actorName,
                        storeRejectedAt,
                        storeRejectionRemarks: remarks.trim()
                    } : request)
            }
        }));
};
const issueCompleteOrderMaterials = function(orderId) {
    let actorName = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'Store';
    var _state_production, _state_production1;
    const store = __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState();
    const state = store.state || {};
    const orderRequests = requests(state).filter((request)=>request.orderId === orderId);
    if (!orderRequests.length) throw new Error('No requests found for this order.');
    if (orderRequests.some((request)=>request.status === __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].ISSUED)) {
        throw new Error('This order has already been issued.');
    }
    if (orderRequests.some((request)=>request.status !== __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].STORE_APPROVED)) {
        throw new Error('Every request in this order must be Store approved.');
    }
    const inventory = [
        ...state.rawInventory || []
    ];
    orderRequests.forEach((request)=>request.items.forEach((item)=>{
            const approvedQty = Number(item.approvedQty || 0);
            const issueQty = Number(item.issueQty || 0);
            const inventoryIndex = inventory.findIndex((entry)=>materialMatches(entry, item));
            if (approvedQty <= 0 || issueQty !== approvedQty) {
                throw new Error("Issue quantity is incomplete for ".concat(item.materialName, "."));
            }
            if (inventoryIndex >= 0) {
                var _inventory_inventoryIndex;
                const availableStock = Number(((_inventory_inventoryIndex = inventory[inventoryIndex]) === null || _inventory_inventoryIndex === void 0 ? void 0 : _inventory_inventoryIndex.stock) || 0);
                inventory[inventoryIndex] = {
                    ...inventory[inventoryIndex],
                    stock: Math.max(0, availableStock - issueQty)
                };
            }
        }));
    const issuedAt = new Date().toISOString();
    const sequence = String((((_state_production = state.production) === null || _state_production === void 0 ? void 0 : _state_production.stockLedgerEntries) || []).filter((entry)=>entry.orderId === orderId).length + 1).padStart(3, '0');
    const issueReference = "ISS-".concat(orderId, "-").concat(sequence);
    const requestIds = new Set(orderRequests.map((request)=>request.id));
    const stockLedgerEntries = orderRequests.flatMap((request)=>request.items.map((item)=>({
                id: "LEDGER-".concat(Date.now(), "-").concat(item.materialId),
                type: 'MATERIAL_ISSUE',
                orderId,
                requestId: request.id,
                materialId: item.materialId,
                materialName: item.materialName,
                quantity: Number(item.issueQty || 0),
                unit: item.unit,
                issueReference,
                performedBy: actorName,
                createdAt: issuedAt
            })));
    store.setState({
        ...state,
        rawInventory: inventory,
        production: {
            ...state.production || {},
            stockLedgerEntries: [
                ...((_state_production1 = state.production) === null || _state_production1 === void 0 ? void 0 : _state_production1.stockLedgerEntries) || [],
                ...stockLedgerEntries
            ],
            materialRequests: requests(state).map((request)=>requestIds.has(request.id) ? {
                    ...request,
                    status: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$production$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REQUEST_STATUS"].ISSUED,
                    issuedBy: actorName,
                    issuedAt,
                    issueReference,
                    items: request.items.map((item)=>({
                            ...item,
                            issuedQty: Number(item.issueQty || 0)
                        }))
                } : request)
        }
    });
    return issueReference;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/store/materialRequestStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useMaterialRequestStore",
    ()=>useMaterialRequestStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-client] (ecmascript)");
;
;
const update = (set, id, mapper)=>set((state)=>({
            materialRequests: state.materialRequests.map((request)=>request.id === id ? mapper(request) : request)
        }));
;
const useMaterialRequestStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set)=>({
        materialRequests: [],
        createRequest: (data)=>{
            const id = __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().generateEntityId('materialRequest');
            const request = {
                id,
                requestNo: id,
                ...data
            };
            set((state)=>({
                    materialRequests: [
                        request,
                        ...state.materialRequests
                    ]
                }));
            return request;
        },
        updateRequest: (id, updates)=>update(set, id, (request)=>({
                    ...request,
                    ...updates
                })),
        submitRequest: (id)=>update(set, id, (request)=>({
                    ...request,
                    status: 'Submitted'
                })),
        approveRequest: function(id, items) {
            let status = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 'Approved';
            return update(set, id, (request)=>({
                    ...request,
                    items,
                    status
                }));
        },
        issueMaterials: function(id, items) {
            let isPartial = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
            return update(set, id, (request)=>({
                    ...request,
                    items,
                    status: isPartial ? 'Partially Issued' : 'Issued'
                }));
        },
        confirmReceipt: (id, items)=>update(set, id, (request)=>({
                    ...request,
                    items,
                    status: 'Received'
                })),
        logConsumption: (id, items)=>update(set, id, (request)=>({
                    ...request,
                    items,
                    status: 'Consuming'
                })),
        returnMaterials: (id, items, notes)=>update(set, id, (request)=>({
                    ...request,
                    items,
                    notes,
                    status: 'Return Pending'
                })),
        confirmReturn: (id, items)=>update(set, id, (request)=>({
                    ...request,
                    items: items || request.items,
                    status: 'Returned'
                })),
        closeRequest: (id)=>update(set, id, (request)=>({
                    ...request,
                    status: 'Closed'
                })),
        deleteRequest: (id)=>set((state)=>({
                    materialRequests: state.materialRequests.filter((request)=>request.id !== id)
                })),
        resetToDefault: ()=>set({
                materialRequests: []
            })
    }), {
    name: 'himalaya_material_requests_v1',
    version: 2,
    migrate: ()=>({
            materialRequests: []
        })
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/store/procurementActions.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "approveGRN",
    ()=>approveGRN,
    "approveGoodsReceiptNote",
    ()=>approveGoodsReceiptNote,
    "approveMaterialIndent",
    ()=>approveMaterialIndent,
    "approvePurchaseOrder",
    ()=>approvePurchaseOrder,
    "approveVendorReplacement",
    ()=>approveVendorReplacement,
    "canCloseMaterialRejection",
    ()=>canCloseMaterialRejection,
    "canClosePurchaseOrder",
    ()=>canClosePurchaseOrder,
    "closeMaterialRejection",
    ()=>closeMaterialRejection,
    "closePurchaseOrder",
    ()=>closePurchaseOrder,
    "createGRN",
    ()=>createGRN,
    "createMaterialIndent",
    ()=>createMaterialIndent,
    "createPurchaseOrder",
    ()=>createPurchaseOrder,
    "createReplacementGRN",
    ()=>createReplacementGRN,
    "disposeRejectedStock",
    ()=>disposeRejectedStock,
    "generateNotification",
    ()=>generateNotification,
    "issuePurchaseOrder",
    ()=>issuePurchaseOrder,
    "postInventoryTransaction",
    ()=>postInventoryTransaction,
    "processNoReplacement",
    ()=>processNoReplacement,
    "processWriteOff",
    ()=>processWriteOff,
    "raiseVendorDispute",
    ()=>raiseVendorDispute,
    "recordCommercialAdjustment",
    ()=>recordCommercialAdjustment,
    "rejectStoreRejection",
    ()=>rejectStoreRejection,
    "returnIndentForCorrection",
    ()=>returnIndentForCorrection,
    "submitMaterialRejection",
    ()=>submitMaterialRejection,
    "submitPurchaseOrder",
    ()=>submitPurchaseOrder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/procurement.ts [app-client] (ecmascript)");
;
;
// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
function getStoreState() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().state;
}
function updateStoreState(newState) {
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().setState(newState);
}
function safeClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
function postInventoryTransaction(materialId, quantity, type, remarks) {
    const state = getStoreState();
    const rawInventory = safeClone(state.rawInventory || []);
    let item = rawInventory.find((i)=>i.id === materialId || i.materialCode === materialId);
    if (!item) {
        item = {
            id: materialId,
            materialCode: materialId,
            quantity: 0,
            reservedQty: 0,
            history: []
        };
        rawInventory.push(item);
    }
    if (type === 'ADD') {
        item.quantity += quantity;
    } else if (type === 'SUBTRACT') {
        item.quantity -= quantity;
    } else if (type === 'RESERVE') {
        item.quantity -= quantity;
        item.reservedQty = (item.reservedQty || 0) + quantity;
    }
    item.history = item.history || [];
    item.history.push({
        date: new Date().toISOString(),
        quantity,
        type,
        remarks
    });
    updateStoreState({
        ...state,
        rawInventory
    });
}
function generateNotification(role, title, message) {
    const state = getStoreState();
    const notifications = safeClone(state.procurementNotifications || []);
    notifications.push({
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createId"])('NOTIF'),
        role,
        title,
        message,
        read: false,
        createdAt: new Date().toISOString()
    });
    updateStoreState({
        ...state,
        procurementNotifications: notifications
    });
}
function createMaterialIndent(data, actorName) {
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().createMaterialIndent(data);
}
function returnIndentForCorrection(indentId, remarks, actorName) {
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().returnMaterialIndent(indentId, remarks);
}
function approveMaterialIndent(indentId, approvedItems, remarks, actorName) {
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().approveMaterialIndent(indentId, approvedItems, remarks);
}
function createPurchaseOrder(indentId, poData, actorName) {
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().createPurchaseOrderFromIndent(indentId, poData, actorName);
}
function submitPurchaseOrder(poId, actorName) {
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().submitPurchaseOrder(poId, actorName);
}
function approvePurchaseOrder(poId, remarks, actorName) {
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().approvePurchaseOrder(poId, remarks, actorName);
}
function issuePurchaseOrder(poId, actorName) {
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().issuePurchaseOrder(poId, undefined, actorName);
}
function createGRN(poId, grnData, actorName) {
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().createGoodsReceipt(poId, grnData, actorName);
}
function approveGoodsReceiptNote(grnId) {
    let remarks = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'Approved by Finance Audit', actorName = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 'Finance';
    __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().approveGoodsReceiptNote(grnId, remarks, actorName);
}
function approveGRN(grnId, actorName) {
    approveGoodsReceiptNote(grnId, 'Approved by Finance Audit', actorName);
}
function submitMaterialRejection(data, actorName) {
    var _state_procurement;
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    const pos = safeClone(((_state_procurement = state.procurement) === null || _state_procurement === void 0 ? void 0 : _state_procurement.purchaseOrders) || []);
    const poIdx = pos.findIndex((p)=>p.id === data.poId);
    if (poIdx > -1) {
        const poItem = pos[poIdx].items.find((i)=>i.materialId === data.materialId);
        if (poItem) {
            if (data.rejectedQty > poItem.cumulativeAcceptedQty) {
                throw new Error("Cannot reject more than currently accepted");
            }
        }
    }
    // Move inventory to REJECTION_HOLD
    postInventoryTransaction(data.materialId, data.rejectedQty, 'RESERVE', "Rejection submitted for PO ".concat(data.poId));
    const newRej = {
        ...data,
        id: data.id || (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createId"])('REJ'),
        rejectionNumber: data.rejectionNumber || (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createHumanNo"])('REJ'),
        status: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].MATERIAL_REJECTION_SUBMITTED,
        replacementApprovedQty: 0,
        cumulativeReplacementDeliveredQty: 0,
        cumulativeReplacementAcceptedQty: 0,
        cumulativeReplacementRejectedQty: 0,
        commerciallySettledQty: 0,
        remainingResolutionQty: data.rejectedQty,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('MATERIAL_REJECTION', newRej.id, 'SUBMIT', null, newRej.status, actorName, 'Store');
    updateStoreState({
        ...getStoreState(),
        procurement: {
            ...getStoreState().procurement || {},
            purchaseOrders: pos
        },
        materialRejections: [
            newRej,
            ...rejections
        ],
        procurementAuditLogs: [
            audit,
            ...getStoreState().procurementAuditLogs || []
        ]
    });
}
function approveVendorReplacement(param) {
    let { rejectionId, approvedReplacementQty, expectedDeliveryDate, vendorAcknowledgementNumber, vendorRemarks, financeRemarks, defectiveMaterialDisposition, documentIds = [], actor } = param;
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    const idx = rejections.findIndex((r)=>r.id === rejectionId);
    if (idx === -1) throw new Error("Rejection not found");
    const rej = rejections[idx];
    if (approvedReplacementQty > rej.remainingResolutionQty) {
        throw new Error("Cannot approve more than remaining resolution quantity (".concat(rej.remainingResolutionQty, ")"));
    }
    const oldStatus = rej.status;
    rej.status = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].REPLACEMENT_EXPECTED;
    rej.replacementApprovedQty = approvedReplacementQty;
    rej.expectedDeliveryDate = expectedDeliveryDate;
    rej.vendorAcknowledgementNumber = vendorAcknowledgementNumber;
    rej.vendorRemarks = vendorRemarks;
    rej.financeRemarks = financeRemarks;
    rej.defectiveMaterialDisposition = defectiveMaterialDisposition;
    rej.documentIds = [
        ...rej.documentIds || [],
        ...documentIds
    ];
    rej.updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('MATERIAL_REJECTION', rej.id, 'APPROVE_REPLACEMENT', oldStatus, rej.status, actor, 'Finance');
    updateStoreState({
        ...state,
        materialRejections: rejections,
        procurementAuditLogs: [
            audit,
            ...state.procurementAuditLogs || []
        ]
    });
}
function createReplacementGRN(rejectionId, grnData, actorName) {
    var _state_procurement;
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    const grns = safeClone(((_state_procurement = state.procurement) === null || _state_procurement === void 0 ? void 0 : _state_procurement.goodsReceiptNotes) || []);
    const rejIdx = rejections.findIndex((r)=>r.id === rejectionId);
    if (rejIdx === -1) throw new Error("Rejection not found");
    const rej = rejections[rejIdx];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertTransition"])('MATERIAL_REJECTION', rej.status, [
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].REPLACEMENT_EXPECTED,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].PARTIALLY_RESOLVED
    ], 'Create Replacement GRN');
    const items = grnData.items || [];
    const totalDelivered = items.reduce((acc, item)=>acc + Number(item.deliveredQty || item.receivedQuantity || 0), 0);
    const totalAccepted = items.reduce((acc, item)=>acc + Number(item.acceptedQty || item.acceptedQuantity || 0), 0);
    const totalRejected = items.reduce((acc, item)=>acc + Number(item.rejectedQty || item.rejectedQuantity || 0), 0);
    const newGRN = {
        ...grnData,
        id: grnData.id || (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createId"])('GRN-REP'),
        grnNumber: grnData.grnNumber || (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createHumanNo"])('GRN-REP'),
        grnType: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GRN_TYPE"].REPLACEMENT,
        poId: rej.poId,
        originalGrnId: rej.grnId,
        materialRejectionId: rej.id,
        status: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GRN_STATUS"].SUBMITTED_FOR_FINANCE_AUDIT,
        commercialTreatment: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COMMERCIAL_TREATMENT"].ZERO_VALUE_REPLACEMENT,
        receivedQty: totalDelivered,
        acceptedQty: totalAccepted,
        rejectedQty: totalRejected,
        items: items.map((item)=>({
                ...item,
                deliveredQty: Number(item.deliveredQty || item.receivedQuantity || 0),
                acceptedQty: Number(item.acceptedQty || item.acceptedQuantity || 0),
                rejectedQty: Number(item.rejectedQty || item.rejectedQuantity || 0),
                inventoryPosted: false,
                rejectionId: rej.id
            })),
        createdBy: actorName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    newGRN.items.forEach((grnItem)=>{
        if (grnItem.deliveredQty > rej.replacementApprovedQty - rej.cumulativeReplacementDeliveredQty) {
            throw new Error("Cannot receive more than remaining scheduled replacement quantity");
        }
        if (grnItem.acceptedQty + grnItem.rejectedQty !== grnItem.deliveredQty) {
            throw new Error("Accepted + Rejected must equal Delivered");
        }
    });
    rej.cumulativeReplacementDeliveredQty += newGRN.items.reduce((acc, item)=>acc + item.deliveredQty, 0);
    rej.updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('GRN', newGRN.id, 'CREATE_REPLACEMENT_GRN', null, newGRN.status, actorName, 'Store');
    updateStoreState({
        ...state,
        procurement: {
            ...state.procurement || {},
            goodsReceiptNotes: [
                newGRN,
                ...grns
            ]
        },
        materialRejections: rejections,
        procurementAuditLogs: [
            audit,
            ...state.procurementAuditLogs || []
        ]
    });
}
function canClosePurchaseOrder(poId) {
    var _state_procurement, _state_procurement1;
    const state = getStoreState();
    const po = (((_state_procurement = state.procurement) === null || _state_procurement === void 0 ? void 0 : _state_procurement.purchaseOrders) || []).find((p)=>p.id === poId);
    if (!po) return {
        allowed: false,
        blockers: [
            'PO not found'
        ]
    };
    const blockers = [];
    po.items.forEach((item)=>{
        if (item.remainingSupplyQty > 0) {
            blockers.push("Item ".concat(item.materialName, " has ").concat(item.remainingSupplyQty, " remaining supply."));
        }
    });
    const grns = (((_state_procurement1 = state.procurement) === null || _state_procurement1 === void 0 ? void 0 : _state_procurement1.goodsReceiptNotes) || []).filter((g)=>g.poId === poId);
    grns.forEach((g)=>{
        if (g.status !== __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GRN_STATUS"].FINANCE_APPROVED && g.status !== __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GRN_STATUS"].FINANCE_REJECTED && g.status !== 'FINANCE_AUDIT_APPROVED') {
            blockers.push("GRN ".concat(g.grnNumber, " is not finalized (").concat(g.status, ")."));
        }
    });
    const rejections = (state.materialRejections || []).filter((r)=>r.poId === poId);
    rejections.forEach((r)=>{
        if (r.status !== __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].CLOSED) {
            blockers.push("Rejection ".concat(r.rejectionNumber, " is not closed."));
        }
    });
    return {
        allowed: blockers.length === 0,
        blockers
    };
}
function closePurchaseOrder(poId, remarks, actorName) {
    var _state_procurement;
    const state = getStoreState();
    const pos = safeClone(((_state_procurement = state.procurement) === null || _state_procurement === void 0 ? void 0 : _state_procurement.purchaseOrders) || []);
    const idx = pos.findIndex((p)=>p.id === poId);
    if (idx === -1) throw new Error("PO not found");
    const closureCheck = canClosePurchaseOrder(poId);
    if (!closureCheck.allowed) {
        throw new Error("Cannot close PO. Blockers: " + closureCheck.blockers.join(", "));
    }
    const oldStatus = pos[idx].status;
    pos[idx].status = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PO_STATUS"].PO_CLOSED;
    pos[idx].closureRemarks = remarks;
    pos[idx].updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('PURCHASE_ORDER', poId, 'CLOSE', oldStatus, pos[idx].status, actorName, 'Finance', remarks);
    updateStoreState({
        ...state,
        procurement: {
            ...state.procurement || {},
            purchaseOrders: pos
        },
        procurementAuditLogs: [
            audit,
            ...state.procurementAuditLogs || []
        ]
    });
}
function disposeRejectedStock(rejectionId, quantity, disposition, actorName) {
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    const idx = rejections.findIndex((r)=>r.id === rejectionId);
    if (idx === -1) throw new Error("Rejection not found");
    const rej = rejections[idx];
    postInventoryTransaction(rej.materialId, quantity, 'SUBTRACT', "Original rejected stock disposed via " + disposition);
    rej.originalStockDisposition = disposition;
    rej.updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('MATERIAL_REJECTION', rej.id, 'DISPOSE_ORIGINAL_STOCK', rej.status, rej.status, actorName, 'Finance', disposition);
    updateStoreState({
        ...getStoreState(),
        materialRejections: rejections,
        procurementAuditLogs: [
            audit,
            ...getStoreState().procurementAuditLogs || []
        ]
    });
}
function rejectStoreRejection(rejectionId, remarks, actorName, idempotencyKey) {
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    const logs = state.procurementAuditLogs || [];
    if (idempotencyKey && logs.some((l)=>{
        var _l_metadata;
        return ((_l_metadata = l.metadata) === null || _l_metadata === void 0 ? void 0 : _l_metadata.idempotencyKey) === idempotencyKey;
    })) return;
    const idx = rejections.findIndex((r)=>r.id === rejectionId);
    if (idx === -1) throw new Error("Rejection not found");
    const rej = rejections[idx];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertTransition"])('MATERIAL_REJECTION', rej.status, [
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].MATERIAL_REJECTION_SUBMITTED,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].FINANCE_VENDOR_DISCUSSION
    ], 'Reject Store Rejection');
    const rawInventory = safeClone(state.rawInventory || []);
    let item = rawInventory.find((i)=>i.id === rej.materialId || i.materialCode === rej.materialId);
    if (item) {
        item.reservedQty = (item.reservedQty || 0) - rej.rejectedQty;
        item.quantity += rej.rejectedQty;
        item.history.push({
            date: new Date().toISOString(),
            quantity: rej.rejectedQty,
            type: 'RESTORE_RESERVED',
            remarks: "Store Rejection ".concat(rej.rejectionNumber, " Rejected by Finance")
        });
        updateStoreState({
            ...state,
            rawInventory
        });
    }
    const oldStatus = rej.status;
    rej.status = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].REJECTED_BY_FINANCE;
    rej.financeRemarks = remarks;
    rej.remainingResolutionQty = 0;
    rej.resolutionType = "STORE_REJECTION_REVERSED";
    rej.closedAt = new Date().toISOString();
    rej.closedBy = actorName;
    rej.updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('MATERIAL_REJECTION', rej.id, 'REJECT_STORE_REJECTION', oldStatus, rej.status, actorName, 'Finance', remarks, {}, [], {
        idempotencyKey
    });
    updateStoreState({
        ...getStoreState(),
        materialRejections: rejections,
        procurementAuditLogs: [
            audit,
            ...getStoreState().procurementAuditLogs || []
        ]
    });
}
function raiseVendorDispute(rejectionId, remarks, actorName, idempotencyKey) {
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    if (idempotencyKey && (state.procurementAuditLogs || []).some((l)=>{
        var _l_metadata;
        return ((_l_metadata = l.metadata) === null || _l_metadata === void 0 ? void 0 : _l_metadata.idempotencyKey) === idempotencyKey;
    })) return;
    const idx = rejections.findIndex((r)=>r.id === rejectionId);
    if (idx === -1) throw new Error("Rejection not found");
    const rej = rejections[idx];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertTransition"])('MATERIAL_REJECTION', rej.status, [
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].MATERIAL_REJECTION_SUBMITTED,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].FINANCE_VENDOR_DISCUSSION
    ], 'Raise Vendor Dispute');
    const oldStatus = rej.status;
    rej.status = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].VENDOR_DISPUTE;
    rej.financeRemarks = remarks;
    rej.updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('MATERIAL_REJECTION', rej.id, 'RAISE_VENDOR_DISPUTE', oldStatus, rej.status, actorName, 'Finance', remarks, {}, [], {
        idempotencyKey
    });
    updateStoreState({
        ...state,
        materialRejections: rejections,
        procurementAuditLogs: [
            audit,
            ...state.procurementAuditLogs || []
        ]
    });
}
function processNoReplacement(rejectionId, resolutionType, remarks, actorName, idempotencyKey) {
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    if (idempotencyKey && (state.procurementAuditLogs || []).some((l)=>{
        var _l_metadata;
        return ((_l_metadata = l.metadata) === null || _l_metadata === void 0 ? void 0 : _l_metadata.idempotencyKey) === idempotencyKey;
    })) return;
    if (![
        'CREDIT_NOTE',
        'REFUND',
        'COMMERCIAL_DEDUCTION',
        'WRITE_OFF'
    ].includes(resolutionType)) {
        throw new Error("Invalid resolution type for No Replacement");
    }
    const idx = rejections.findIndex((r)=>r.id === rejectionId);
    if (idx === -1) throw new Error("Rejection not found");
    const rej = rejections[idx];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertTransition"])('MATERIAL_REJECTION', rej.status, [
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].MATERIAL_REJECTION_SUBMITTED,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].FINANCE_VENDOR_DISCUSSION,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].PARTIALLY_RESOLVED,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].VENDOR_DISPUTE
    ], 'Process No Replacement');
    const oldStatus = rej.status;
    rej.status = resolutionType === 'CREDIT_NOTE' ? __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].CREDIT_NOTE_PENDING : __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].NO_REPLACEMENT;
    rej.financeRemarks = remarks;
    rej.expectedResolutionType = resolutionType;
    rej.updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('MATERIAL_REJECTION', rej.id, 'PROCESS_NO_REPLACEMENT', oldStatus, rej.status, actorName, 'Finance', remarks, {}, [], {
        idempotencyKey,
        resolutionType
    });
    updateStoreState({
        ...state,
        materialRejections: rejections,
        procurementAuditLogs: [
            audit,
            ...state.procurementAuditLogs || []
        ]
    });
}
function recordCommercialAdjustment(rejectionId, settledQty, adjustmentDetails, actorName, idempotencyKey) {
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    if (idempotencyKey && (state.procurementAuditLogs || []).some((l)=>{
        var _l_metadata;
        return ((_l_metadata = l.metadata) === null || _l_metadata === void 0 ? void 0 : _l_metadata.idempotencyKey) === idempotencyKey;
    })) return;
    const idx = rejections.findIndex((r)=>r.id === rejectionId);
    if (idx === -1) throw new Error("Rejection not found");
    const rej = rejections[idx];
    if (settledQty > rej.remainingResolutionQty) {
        throw new Error("Cannot commercially settle more than the unresolved rejected quantity (".concat(rej.remainingResolutionQty, ")"));
    }
    const oldStatus = rej.status;
    rej.commerciallySettledQty = (rej.commerciallySettledQty || 0) + settledQty;
    rej.remainingResolutionQty = rej.rejectedQty - (rej.cumulativeReplacementAcceptedQty || 0) - rej.commerciallySettledQty;
    if (rej.remainingResolutionQty <= 0) {
        rej.status = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].COMMERCIAL_ADJUSTMENT_COMPLETED;
    }
    rej.financeRemarks = adjustmentDetails;
    rej.updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('MATERIAL_REJECTION', rej.id, 'RECORD_COMMERCIAL_ADJUSTMENT', oldStatus, rej.status, actorName, 'Finance', adjustmentDetails, {}, [], {
        idempotencyKey
    });
    updateStoreState({
        ...state,
        materialRejections: rejections,
        procurementAuditLogs: [
            audit,
            ...state.procurementAuditLogs || []
        ]
    });
}
function processWriteOff(rejectionId, writeOffQty, approvalMetadata, actorName, idempotencyKey) {
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    if (idempotencyKey && (state.procurementAuditLogs || []).some((l)=>{
        var _l_metadata;
        return ((_l_metadata = l.metadata) === null || _l_metadata === void 0 ? void 0 : _l_metadata.idempotencyKey) === idempotencyKey;
    })) return;
    if (!approvalMetadata || !approvalMetadata.approvedBy) {
        throw new Error("Approval metadata is required for write-off");
    }
    const idx = rejections.findIndex((r)=>r.id === rejectionId);
    if (idx === -1) throw new Error("Rejection not found");
    const rej = rejections[idx];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertTransition"])('MATERIAL_REJECTION', rej.status, [
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].MATERIAL_REJECTION_SUBMITTED,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].FINANCE_VENDOR_DISCUSSION,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].PARTIALLY_RESOLVED,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].VENDOR_DISPUTE,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].CREDIT_NOTE_PENDING,
        __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].NO_REPLACEMENT
    ], 'Process Write Off');
    if (writeOffQty > rej.remainingResolutionQty) {
        throw new Error("Write-off quantity cannot exceed unresolved rejected quantity (".concat(rej.remainingResolutionQty, ")"));
    }
    const oldStatus = rej.status;
    rej.commerciallySettledQty = (rej.commerciallySettledQty || 0) + writeOffQty;
    rej.remainingResolutionQty = rej.rejectedQty - (rej.cumulativeReplacementAcceptedQty || 0) - rej.commerciallySettledQty;
    rej.status = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].WRITE_OFF_APPROVED;
    rej.financeRemarks = approvalMetadata.remarks || "Write-off approved";
    rej.updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('MATERIAL_REJECTION', rej.id, 'PROCESS_WRITE_OFF', oldStatus, rej.status, actorName, 'Finance', rej.financeRemarks, {}, [], {
        idempotencyKey,
        approvalMetadata
    });
    updateStoreState({
        ...state,
        materialRejections: rejections,
        procurementAuditLogs: [
            audit,
            ...state.procurementAuditLogs || []
        ]
    });
}
function canCloseMaterialRejection(rejectionId) {
    const state = getStoreState();
    const rej = (state.materialRejections || []).find((r)=>r.id === rejectionId);
    if (!rej) return {
        allowed: false,
        blockers: [
            'Rejection not found'
        ]
    };
    const blockers = [];
    if (rej.status === __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].CLOSED) {
        blockers.push('Rejection is already closed');
        return {
            allowed: false,
            blockers
        };
    }
    if (rej.remainingResolutionQty > 0) {
        blockers.push("Unresolved quantity remains: ".concat(rej.remainingResolutionQty));
    }
    if (!rej.originalStockDisposition && rej.status !== __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].REJECTED_BY_FINANCE) {
        blockers.push('Original rejected stock disposition is pending');
    }
    return {
        allowed: blockers.length === 0,
        blockers
    };
}
function closeMaterialRejection(rejectionId, actorName, idempotencyKey) {
    const state = getStoreState();
    const rejections = safeClone(state.materialRejections || []);
    if (idempotencyKey && (state.procurementAuditLogs || []).some((l)=>{
        var _l_metadata;
        return ((_l_metadata = l.metadata) === null || _l_metadata === void 0 ? void 0 : _l_metadata.idempotencyKey) === idempotencyKey;
    })) return;
    const idx = rejections.findIndex((r)=>r.id === rejectionId);
    if (idx === -1) throw new Error("Rejection not found");
    const closureCheck = canCloseMaterialRejection(rejectionId);
    if (!closureCheck.allowed) {
        throw new Error("Cannot close rejection: " + closureCheck.blockers.join(", "));
    }
    const rej = rejections[idx];
    const oldStatus = rej.status;
    rej.status = __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATERIAL_REJECTION_STATUS"].CLOSED;
    rej.updatedAt = new Date().toISOString();
    const audit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$procurement$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createProcurementAuditEntry"])('MATERIAL_REJECTION', rej.id, 'CLOSE', oldStatus, rej.status, actorName, 'Finance', '', {}, [], {
        idempotencyKey
    });
    updateStoreState({
        ...state,
        materialRejections: rejections,
        procurementAuditLogs: [
            audit,
            ...state.procurementAuditLogs || []
        ]
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/store/procurementSelectors.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getPurchaseOrderDeliveredTotals",
    ()=>getPurchaseOrderDeliveredTotals,
    "selectFinancePurchaseOrder",
    ()=>selectFinancePurchaseOrder,
    "selectGoodsReceiptNotes",
    ()=>selectGoodsReceiptNotes,
    "selectMaterialIndents",
    ()=>selectMaterialIndents,
    "selectMaterialRejections",
    ()=>selectMaterialRejections,
    "selectPlantHeadPurchaseOrder",
    ()=>selectPlantHeadPurchaseOrder,
    "selectPurchaseOrders",
    ()=>selectPurchaseOrders,
    "selectStorePurchaseOrder",
    ()=>selectStorePurchaseOrder,
    "selectSuperAdminPurchaseOrder",
    ()=>selectSuperAdminPurchaseOrder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-client] (ecmascript)");
;
// ---------------------------------------------------------
// SELECTORS
// ---------------------------------------------------------
function getStoreState() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useERPStore"].getState().state;
}
function selectMaterialIndents(state) {
    var _s_procurement;
    const s = state || getStoreState();
    return ((_s_procurement = s.procurement) === null || _s_procurement === void 0 ? void 0 : _s_procurement.materialIndents) || [];
}
function selectPurchaseOrders(state) {
    var _s_procurement;
    const s = state || getStoreState();
    return ((_s_procurement = s.procurement) === null || _s_procurement === void 0 ? void 0 : _s_procurement.purchaseOrders) || [];
}
function selectGoodsReceiptNotes(state) {
    var _s_procurement;
    const s = state || getStoreState();
    return ((_s_procurement = s.procurement) === null || _s_procurement === void 0 ? void 0 : _s_procurement.goodsReceiptNotes) || [];
}
function selectMaterialRejections(state) {
    const s = state || getStoreState();
    return s.materialRejections || [];
}
function selectStorePurchaseOrder(poId) {
    const po = selectPurchaseOrders().find((p)=>p.id === poId);
    if (!po) return null;
    return {
        id: po.id,
        poNumber: po.poNumber,
        indentId: po.indentId,
        vendorName: po.vendorName,
        vendorDisplayName: po.vendorDisplayName,
        status: po.status,
        expectedDeliveryDate: po.expectedDeliveryDate,
        createdAt: po.createdAt,
        updatedAt: po.updatedAt,
        closureRemarks: po.closureRemarks,
        items: (po.items || []).map((item)=>({
                materialId: item.materialId,
                materialCode: item.materialCode,
                materialName: item.materialName,
                unit: item.unit,
                orderedQty: item.orderedQty,
                cumulativeDeliveredQty: item.cumulativeDeliveredQty,
                cumulativeAcceptedQty: item.cumulativeAcceptedQty,
                cumulativeRejectedQty: item.cumulativeRejectedQty,
                cumulativeCancelledQty: item.cumulativeCancelledQty,
                cumulativeCommerciallySettledQty: item.cumulativeCommerciallySettledQty,
                remainingSupplyQty: item.remainingSupplyQty,
                priority: item.priority,
                requiredDate: item.requiredDate,
                reason: item.reason
            }))
    };
}
function selectPlantHeadPurchaseOrder(poId) {
    // Plant Head has same restricted access as Store
    return selectStorePurchaseOrder(poId);
}
function selectFinancePurchaseOrder(poId) {
    // Finance sees everything including commercial data
    const po = selectPurchaseOrders().find((p)=>p.id === poId);
    return po || null;
}
function selectSuperAdminPurchaseOrder(poId) {
    // Super Admin sees everything
    const po = selectPurchaseOrders().find((p)=>p.id === poId);
    return po || null;
}
function getPurchaseOrderDeliveredTotals(poId) {
    const grns = selectGoodsReceiptNotes().filter((g)=>g.poId === poId);
    let reportedDeliveredQty = 0;
    let approvedDeliveredQty = 0;
    grns.forEach((grn)=>{
        if (grn.status !== 'FINANCE_REJECTED' && grn.status !== 'DRAFT' && grn.status !== 'RETURNED_TO_STORE') {
            grn.items.forEach((item)=>{
                const del = Number(item.deliveredQty || item.receivedQuantity || 0);
                reportedDeliveredQty += del;
                if (grn.status === 'FINANCE_APPROVED' || grn.status === 'FINANCE_AUDIT_APPROVED') {
                    approvedDeliveredQty += del;
                }
            });
        }
    });
    return {
        reportedDeliveredQty,
        approvedDeliveredQty
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/shared/context/ToastContext.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastProvider",
    ()=>ToastProvider,
    "useToast",
    ()=>useToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/notificationStore.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
const useToast = ()=>{
    _s();
    const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"])();
    return {
        addToast: store.showToast,
        removeToast: store.dismissToast,
        showToast: store.showToast
    };
};
_s(useToast, "/zfT3NJ9V+BuBycpZlp3oyXyUA4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$notificationStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useNotificationStore"]
    ];
});
const ToastProvider = (param)=>{
    let { children } = param;
    return children;
};
_c = ToastProvider;
var _c;
__turbopack_context__.k.register(_c, "ToastProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/shared/constants.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ──────────────────────────────────────────────────────────
// Himalaya ERP — Canonical Status Set
// Aligned with the full Lead → Payment lifecycle
// ──────────────────────────────────────────────────────────
__turbopack_context__.s([
    "DEPARTMENT_STATUSES",
    ()=>DEPARTMENT_STATUSES,
    "GRN_STATUS",
    ()=>GRN_STATUS,
    "INDENT_STATUS",
    ()=>INDENT_STATUS,
    "INVOICE_STATUS",
    ()=>INVOICE_STATUS,
    "PAYMENT_STATUS",
    ()=>PAYMENT_STATUS,
    "PO_STATUS",
    ()=>PO_STATUS,
    "STATUS",
    ()=>STATUS,
    "STATUS_LABELS",
    ()=>STATUS_LABELS,
    "VRN_STATUS",
    ()=>VRN_STATUS
]);
const STATUS = {
    // ── Sales ─────────────────────────────────────────────
    LEAD_CREATED: 'LEAD_CREATED',
    SAMPLE_REQUIRED: 'SAMPLE_REQUIRED',
    SAMPLE_APPROVED: 'SAMPLE_APPROVED',
    QUOTATION_CREATED: 'QUOTATION_CREATED',
    QUOTATION_SENT: 'QUOTATION_SENT',
    QUOTATION_APPROVED: 'QUOTATION_APPROVED',
    ORDER_CREATED: 'ORDER_CREATED',
    ORDER_CONFIRMED: 'ORDER_CONFIRMED',
    // ── Plant Head ─────────────────────────────────────────
    PLANT_PENDING: 'PLANT_PENDING',
    PLANT_ACCEPTED: 'PLANT_ACCEPTED',
    PLANT_REJECTED: 'PLANT_REJECTED',
    PRODUCTION_PLANNED: 'PRODUCTION_PLANNED',
    WORK_ORDER_CREATED: 'WORK_ORDER_CREATED',
    // ── Production ─────────────────────────────────────────
    PRODUCTION_ACCEPTED: 'PRODUCTION_ACCEPTED',
    IN_PRODUCTION: 'IN_PRODUCTION',
    PRODUCTION_COMPLETED: 'PRODUCTION_COMPLETED',
    REWORK: 'REWORK',
    PAUSED: 'PAUSED',
    // ── QC ─────────────────────────────────────────────────
    QC_PENDING: 'QC_PENDING',
    QC_APPROVED: 'QC_APPROVED',
    QC_FAILED: 'QC_FAILED',
    // ── Dispatch ───────────────────────────────────────────
    DISPATCH_PENDING: 'DISPATCH_PENDING',
    IN_TRANSIT: 'IN_TRANSIT',
    DELIVERED: 'DELIVERED',
    // ── Finance ────────────────────────────────────────────
    INVOICED: 'INVOICED',
    PAYMENT_PENDING: 'PAYMENT_PENDING',
    // ── Finance Executive ──────────────────────────────────
    PAYMENT_VERIFIED: 'PAYMENT_VERIFIED',
    CLOSED: 'CLOSED',
    // ── Exceptional ────────────────────────────────────────
    CANCELLED: 'CANCELLED',
    // ── Legacy aliases ─────────────────────────────────────
    PLANNED: 'PRODUCTION_PLANNED',
    DISPATCH_CREATED: 'DISPATCH_PENDING',
    DISPATCH_READY: 'QC_APPROVED',
    QC_PASSED: 'QC_APPROVED',
    MATERIAL_REQUESTED: 'WORK_ORDER_CREATED',
    MATERIAL_APPROVED: 'WORK_ORDER_CREATED',
    MATERIAL_ISSUED: 'IN_PRODUCTION',
    PAYMENT_VERIFIED_OLD: 'PAYMENT_VERIFIED',
    SALES_ORDER: 'ORDER_CONFIRMED'
};
const DEPARTMENT_STATUSES = {
    Sales: [
        STATUS.ORDER_CREATED,
        STATUS.ORDER_CONFIRMED,
        STATUS.PLANT_PENDING,
        STATUS.PLANT_ACCEPTED,
        STATUS.PRODUCTION_PLANNED,
        STATUS.WORK_ORDER_CREATED,
        STATUS.IN_PRODUCTION,
        STATUS.PRODUCTION_COMPLETED,
        STATUS.QC_PENDING,
        STATUS.QC_APPROVED,
        STATUS.DISPATCH_PENDING,
        STATUS.IN_TRANSIT,
        STATUS.DELIVERED,
        STATUS.INVOICED,
        STATUS.PAYMENT_PENDING,
        STATUS.PAYMENT_VERIFIED,
        STATUS.CLOSED
    ],
    PlantHead: [
        STATUS.PLANT_PENDING,
        STATUS.PLANT_ACCEPTED,
        STATUS.PRODUCTION_PLANNED,
        STATUS.WORK_ORDER_CREATED
    ],
    Production: [
        STATUS.WORK_ORDER_CREATED,
        STATUS.PRODUCTION_ACCEPTED,
        STATUS.IN_PRODUCTION,
        STATUS.PRODUCTION_COMPLETED,
        STATUS.REWORK
    ],
    QC: [
        STATUS.PRODUCTION_COMPLETED,
        STATUS.QC_PENDING,
        STATUS.QC_APPROVED,
        STATUS.QC_FAILED
    ],
    Dispatch: [
        STATUS.QC_APPROVED,
        STATUS.DISPATCH_PENDING,
        STATUS.IN_TRANSIT,
        STATUS.DELIVERED
    ],
    Finance: [
        STATUS.DELIVERED,
        STATUS.INVOICED,
        STATUS.PAYMENT_PENDING,
        STATUS.PAYMENT_VERIFIED,
        STATUS.CLOSED
    ],
    FinanceExecutive: [
        STATUS.PAYMENT_PENDING,
        STATUS.PAYMENT_VERIFIED,
        STATUS.CLOSED
    ]
};
const STATUS_LABELS = {
    LEAD_CREATED: 'New Lead',
    SAMPLE_REQUIRED: 'Sample Required',
    SAMPLE_APPROVED: 'Sample Approved',
    QUOTATION_CREATED: 'Quotation Created',
    QUOTATION_SENT: 'Quotation Sent',
    QUOTATION_APPROVED: 'Customer Approved',
    ORDER_CREATED: 'Order Created',
    ORDER_CONFIRMED: 'Order Confirmed',
    PLANT_PENDING: 'Waiting for Plant Head',
    PLANT_ACCEPTED: 'Plant Accepted',
    PLANT_REJECTED: 'Plant Rejected',
    PRODUCTION_PLANNED: 'Production Planned',
    WORK_ORDER_CREATED: 'Work Order Created',
    PRODUCTION_ACCEPTED: 'Production Accepted',
    IN_PRODUCTION: 'In Production',
    PRODUCTION_COMPLETED: 'Production Completed',
    REWORK: 'Rework',
    QC_PENDING: 'QC Pending',
    QC_APPROVED: 'Ready for Dispatch',
    QC_FAILED: 'QC Rejected',
    DISPATCH_PENDING: 'Dispatch Prepared',
    IN_TRANSIT: 'Dispatched',
    DELIVERED: 'Delivered',
    INVOICED: 'Invoice Generated',
    PAYMENT_PENDING: 'Payment Pending',
    PAYMENT_VERIFIED: 'Payment Verified',
    CLOSED: 'Order Closed',
    CANCELLED: 'Cancelled',
    PAUSED: 'Paused',
    // Legacy
    SALES_ORDER: 'Sales Order',
    PLANNED: 'Planned'
};
const INDENT_STATUS = {
    PENDING_PLANT_HEAD_APPROVAL: 'PENDING_PLANT_HEAD_APPROVAL',
    PLANT_HEAD_REJECTED: 'PLANT_HEAD_REJECTED',
    PLANT_HEAD_APPROVED: 'PLANT_HEAD_APPROVED',
    CONVERTED_TO_PO: 'CONVERTED_TO_PO',
    CANCELLED: 'INDENT_CANCELLED'
};
const PO_STATUS = {
    DRAFT: 'DRAFT',
    PENDING_SUPER_ADMIN_APPROVAL: 'PENDING_SUPER_ADMIN_APPROVAL',
    SUPER_ADMIN_REJECTED: 'SUPER_ADMIN_REJECTED',
    SUPER_ADMIN_APPROVED: 'SUPER_ADMIN_APPROVED',
    PO_ISSUED: 'PO_ISSUED',
    VENDOR_ACCEPTED: 'VENDOR_ACCEPTED',
    PARTIALLY_RECEIVED: 'PARTIALLY_RECEIVED',
    GRN_SUBMITTED: 'GRN_SUBMITTED',
    GRN_APPROVED: 'GRN_APPROVED',
    STOCK_POSTED: 'STOCK_POSTED',
    PAYMENT_PENDING: 'PAYMENT_PENDING',
    PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
    PO_CLOSED: 'PO_CLOSED',
    CANCELLED: 'PO_CANCELLED'
};
const GRN_STATUS = {
    DRAFT: 'GRN_DRAFT',
    SUBMITTED: 'GRN_SUBMITTED',
    APPROVED: 'GRN_APPROVED',
    QUALITY_REJECTED: 'QUALITY_REJECTED',
    STOCK_POSTED: 'STOCK_POSTED'
};
const INVOICE_STATUS = {
    DRAFT: 'INVOICE_DRAFT',
    SUBMITTED: 'INVOICE_SUBMITTED',
    VERIFIED: 'INVOICE_VERIFIED',
    PAID: 'INVOICE_PAID',
    REJECTED: 'INVOICE_REJECTED'
};
const PAYMENT_STATUS = {
    PENDING: 'PAYMENT_PENDING',
    COMPLETED: 'PAYMENT_COMPLETED',
    FAILED: 'PAYMENT_FAILED',
    CANCELLED: 'PAYMENT_CANCELLED'
};
const VRN_STATUS = {
    WAITING_PICKUP: 'WAITING_PICKUP',
    PICKED_UP: 'PICKED_UP',
    REPLACED: 'REPLACED',
    CLOSED: 'CLOSED'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/shared/components/DataTable.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DataTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function DataTable(param) {
    let { columns = [], data = [], searchQuery = '', searchField = '', actions, emptyMessage = 'No matching records found.', className = '' } = param;
    // Filter data by search query
    const filteredData = data.filter((item)=>{
        if (!searchQuery) return true;
        if (!searchField) return true;
        const fields = searchField.split('.');
        let targetValue = item;
        for (const field of fields){
            if (targetValue && targetValue[field] !== undefined) {
                targetValue = targetValue[field];
            } else {
                targetValue = '';
            }
        }
        return String(targetValue).toLowerCase().includes(searchQuery.toLowerCase());
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "crm-table-container",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            className: "crm-table responsive-table ".concat(className),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        children: [
                            columns.map((col, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                    style: {
                                        textAlign: col.align || 'left',
                                        whiteSpace: col.nowrap ? 'nowrap' : 'normal'
                                    },
                                    children: col.header
                                }, idx, false, {
                                    fileName: "[project]/shared/components/DataTable.jsx",
                                    lineNumber: 35,
                                    columnNumber: 15
                                }, this)),
                            actions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                style: {
                                    textAlign: 'right'
                                },
                                children: "Actions"
                            }, void 0, false, {
                                fileName: "[project]/shared/components/DataTable.jsx",
                                lineNumber: 39,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/shared/components/DataTable.jsx",
                        lineNumber: 33,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/shared/components/DataTable.jsx",
                    lineNumber: 32,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    children: filteredData.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                            colSpan: columns.length + (actions ? 1 : 0),
                            style: {
                                textAlign: 'center',
                                color: 'var(--color-text-muted)',
                                padding: '30px'
                            },
                            children: emptyMessage
                        }, void 0, false, {
                            fileName: "[project]/shared/components/DataTable.jsx",
                            lineNumber: 45,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/shared/components/DataTable.jsx",
                        lineNumber: 44,
                        columnNumber: 13
                    }, this) : filteredData.map((row, rowIdx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            children: [
                                columns.map((col, colIdx)=>{
                                    let value = '';
                                    const acc = col.accessor || col.accessorKey;
                                    if (!col.render && !col.cell) {
                                        if (typeof acc === 'function') {
                                            value = acc(row);
                                        } else if (typeof acc === 'string') {
                                            const fields = acc.replace(/\[(\d+)\]/g, '.$1').split('.');
                                            let temp = row;
                                            for (const f of fields){
                                                if (temp && temp[f] !== undefined) {
                                                    temp = temp[f];
                                                } else {
                                                    temp = undefined;
                                                    break;
                                                }
                                            }
                                            value = temp !== undefined ? temp : '';
                                        }
                                        if (acc === 'id' && !value) {
                                            value = row.workOrderId || row.workOrderNo || row.orderNo || row.id || '';
                                        }
                                        if (acc === 'products[0].productName' && !value) {
                                            var _row_products_, _row_products;
                                            value = row.productName || (typeof row.products === 'string' ? row.products : '') || ((_row_products = row.products) === null || _row_products === void 0 ? void 0 : (_row_products_ = _row_products[0]) === null || _row_products_ === void 0 ? void 0 : _row_products_.productName) || 'Custom Engineered Product';
                                        }
                                        if (acc === 'production.outputQuantity' && !value) {
                                            var _row_production, _row_production1;
                                            value = ((_row_production = row.production) === null || _row_production === void 0 ? void 0 : _row_production.producedQty) || row.producedQty || ((_row_production1 = row.production) === null || _row_production1 === void 0 ? void 0 : _row_production1.outputQuantity) || row.quantity || 0;
                                        }
                                    }
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        "data-label": col.header,
                                        style: {
                                            textAlign: col.align || 'left',
                                            whiteSpace: col.nowrap ? 'nowrap' : 'normal'
                                        },
                                        children: col.render ? col.render(row) : col.cell ? col.cell({
                                            row: {
                                                original: row
                                            },
                                            getValue: ()=>value
                                        }) : value
                                    }, colIdx, false, {
                                        fileName: "[project]/shared/components/DataTable.jsx",
                                        lineNumber: 83,
                                        columnNumber: 21
                                    }, this);
                                }),
                                actions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    "data-label": "Actions",
                                    style: {
                                        textAlign: 'right',
                                        whiteSpace: 'nowrap'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "action-btn-group",
                                        children: actions(row)
                                    }, void 0, false, {
                                        fileName: "[project]/shared/components/DataTable.jsx",
                                        lineNumber: 97,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/DataTable.jsx",
                                    lineNumber: 96,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, rowIdx, true, {
                            fileName: "[project]/shared/components/DataTable.jsx",
                            lineNumber: 51,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/shared/components/DataTable.jsx",
                    lineNumber: 42,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/shared/components/DataTable.jsx",
            lineNumber: 31,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/shared/components/DataTable.jsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
_c = DataTable;
var _c;
__turbopack_context__.k.register(_c, "DataTable");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/shared/components/StatusBadge.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatusBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function StatusBadge(param) {
    let { status } = param;
    const getStatusDisplay = (stat)=>{
        if (!stat) return '';
        const displayMap = {
            'PENDING_PLANT_HEAD': 'Ready for Confirmation',
            'PLANT_PENDING': 'Sent to Plant Head',
            'Plant Pending': 'Sent to Plant Head',
            'WORK_ORDER_CREATED': 'Work Order Created',
            'IN_PRODUCTION': 'In Production',
            'PRODUCTION_COMPLETED': 'Production Completed',
            'QC_PENDING': 'QC Pending',
            'QC_PASSED': 'QC Passed',
            'QC_REJECTED': 'QC Rejected',
            'DISPATCH_READY': 'Ready for Dispatch',
            'DISPATCH_CREATED': 'Dispatched',
            'DELIVERED': 'Delivered',
            'PAYMENT_PENDING': 'Payment Pending',
            'CLOSED': 'Closed',
            'REQUESTED': 'Requested',
            'APPROVED': 'Approved',
            'RETURNED_FOR_CORRECTION': 'Returned for Correction',
            'READY_FOR_RELEASE': 'Ready for Release',
            'ISSUED': 'Issued'
        };
        return displayMap[stat] || stat.replace(/_/g, ' ');
    };
    const getBadgeStyle = (stat)=>{
        if (!stat) return {
            background: '#f1f5f9',
            color: '#475569',
            border: '1px solid #D6E2F0'
        };
        const s = String(stat).toLowerCase();
        // Green / Success: Approved, Completed, Delivered, Closed, QC Passed
        if (s.includes('confirm') || s.includes('issue') || s.includes('approve') || s === 'verified' || s === 'paid' || s === 'won' || s === 'completed' || s === 'qc approved' || s.includes('good') || s === 'active' || s === 'delivered' || s === 'closed' || s.includes('passed') || s === 'approved' || s === 'issued') {
            return {
                background: 'rgba(34, 197, 94, 0.12)',
                color: '#166534',
                border: '1px solid rgba(34, 197, 94, 0.2)'
            };
        }
        // Purple / Prepared: prepared, preparing, ready_for_release, production_completed
        if (s.includes('prepare') || s === 'ready_for_release' || s.includes('production_completed') || s === 'production completed') {
            return {
                background: 'rgba(99, 102, 241, 0.14)',
                color: '#4338ca',
                border: '1px solid rgba(99, 102, 241, 0.25)'
            };
        }
        // Blue / In Progress: Plant, Production, Dispatched, In Transit
        if (s.includes('plant') || s.includes('run') || s.includes('process') || s.includes('partial') || s === 'follow-up' || s.includes('plan') || s.includes('transit') || s.includes('dispatch') || s.includes('production') || s.includes('created')) {
            return {
                background: 'rgba(59, 130, 246, 0.12)',
                color: '#1e40af',
                border: '1px solid rgba(59, 130, 246, 0.2)'
            };
        }
        // Orange / Warning: Returned, Returned for Correction, returned_for_correction
        if (s.includes('return') || s === 'returned_for_correction') {
            return {
                background: 'rgba(249, 115, 22, 0.12)',
                color: '#c2410c',
                border: '1px solid rgba(249, 115, 22, 0.2)'
            };
        }
        // Yellow / Pending: Pending, Sent, Draft, Requested
        if (s.includes('pending') || s.includes('draft') || s === 'sent' || s === 'new' || s === 'requested') {
            return {
                background: 'rgba(234, 179, 8, 0.12)',
                color: '#854d0e',
                border: '1px solid rgba(234, 179, 8, 0.2)'
            };
        }
        // Red / Alert: Reject, Lost, Hold, Cancelled
        if (s.includes('reject') || s.includes('lost') || s.includes('out') || s.includes('fail') || s === 'hold' || s === 'qc rejected' || s.includes('low') || s.includes('delay') || s.includes('cancel')) {
            return {
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#991b1b',
                border: '1px solid rgba(239, 68, 68, 0.2)'
            };
        }
        return {
            background: '#f1f5f9',
            color: '#475569',
            border: '1px solid #D6E2F0'
        };
    };
    const style = getBadgeStyle(status);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        style: {
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 'bold',
            letterSpacing: '0.02em',
            textTransform: 'capitalize',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            ...style
        },
        children: getStatusDisplay(status)
    }, void 0, false, {
        fileName: "[project]/shared/components/StatusBadge.jsx",
        lineNumber: 78,
        columnNumber: 5
    }, this);
}
_c = StatusBadge;
var _c;
__turbopack_context__.k.register(_c, "StatusBadge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/hooks/useLoading.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useLoading",
    ()=>useLoading
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
const useLoading = function() {
    let initialState = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
    _s();
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialState);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const withLoading = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLoading.useCallback[withLoading]": async function(fn) {
            let errorMessage = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'Operation failed';
            setIsLoading(true);
            setError(null);
            try {
                const result = await fn();
                return result;
            } catch (err) {
                setError(err.message || errorMessage);
                throw err;
            } finally{
                setIsLoading(false);
            }
        }
    }["useLoading.useCallback[withLoading]"], []);
    const reset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useLoading.useCallback[reset]": ()=>{
            setIsLoading(false);
            setError(null);
        }
    }["useLoading.useCallback[reset]"], []);
    return {
        isLoading,
        error,
        setIsLoading,
        setError,
        withLoading,
        reset
    };
};
_s(useLoading, "WrtDkL5H8/M3WdBPlswnUrM9Tj4=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/production.service.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeMaterialLines",
    ()=>normalizeMaterialLines,
    "productionService",
    ()=>productionService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/apiClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/constants.js [app-client] (ecmascript)");
;
;
const normalizeMaterialLines = function() {
    let request = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const source = Array.isArray(request.materials) ? request.materials : Array.isArray(request.items) ? request.items : request.materials && typeof request.materials === 'object' ? [
        request.materials
    ] : request.items && typeof request.items === 'object' ? [
        request.items
    ] : request.materialName || request.material || request.name ? [
        request
    ] : [];
    return source.map((material)=>{
        var _material_quantityRequested, _ref, _ref1, _ref2, _material_quantityApproved, _ref3, _ref4, _ref5, _ref6, _ref7;
        return {
            ...material,
            materialName: material.materialName || material.material || material.name || '',
            quantityRequested: Number((_ref2 = (_ref1 = (_ref = (_material_quantityRequested = material.quantityRequested) !== null && _material_quantityRequested !== void 0 ? _material_quantityRequested : material.requestedQty) !== null && _ref !== void 0 ? _ref : material.quantity) !== null && _ref1 !== void 0 ? _ref1 : material.qty) !== null && _ref2 !== void 0 ? _ref2 : 0),
            quantityApproved: Number((_ref7 = (_ref6 = (_ref5 = (_ref4 = (_ref3 = (_material_quantityApproved = material.quantityApproved) !== null && _material_quantityApproved !== void 0 ? _material_quantityApproved : material.approvedQty) !== null && _ref3 !== void 0 ? _ref3 : material.quantityRequested) !== null && _ref4 !== void 0 ? _ref4 : material.requestedQty) !== null && _ref5 !== void 0 ? _ref5 : material.quantity) !== null && _ref6 !== void 0 ? _ref6 : material.qty) !== null && _ref7 !== void 0 ? _ref7 : 0)
        };
    }).filter((material)=>material.materialName);
};
const productionService = {
    planOrder: async (state, order, targetDate, priority, dispatch, currentUser)=>{
        const payload = {
            sales_order_id: order.id,
            planned_start_date: new Date().toISOString().split('T')[0],
            planned_end_date: targetDate,
            status: __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS"].PLANNED,
            notes: "Plan generated from Sales Order ".concat(order.orderNo)
        };
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/production/plans', payload);
        return {
            success: true,
            planId: res.planId
        };
    },
    createWorkOrder: async (state, order, dispatch, currentUser)=>{
        const workOrderIds = order.work_order_ids || [];
        if (workOrderIds.length > 0) {
            // We have explicit work order IDs — activate each directly
            for (const woId of workOrderIds){
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/workflow/transition', {
                    entity: 'work_order',
                    entityId: woId,
                    transitionName: 'ACTIVATE_WORK_ORDER',
                    notes: "Activated from Production Portal for Order ".concat(order.orderNo)
                });
            }
            return {
                success: true
            };
        } else {
            // We only know the sales order ID — let the backend resolve the PLANNED work order
            const salesOrderId = order.id;
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/workflow/transition', {
                entity: 'work_order_by_sales_order',
                entityId: salesOrderId,
                transitionName: 'ACTIVATE_WORK_ORDER',
                notes: "Activated from Production Portal for Order ".concat(order.orderNo)
            });
            return {
                success: true
            };
        }
    },
    raiseMaterialRequest: async (state, workOrder, materials, dispatch, currentUser)=>{
        var _res_data;
        // Look up work order database ID
        const woDbId = workOrder.dbId || workOrder.id;
        const payload = {
            work_order_id: typeof woDbId === 'number' ? woDbId : null,
            materials: materials.map((m)=>({
                    materialName: m.material || m.materialName,
                    quantityRequested: Number(m.qty || m.quantityRequested || 0)
                }))
        };
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/production/material-requests', payload);
        return {
            success: true,
            requestId: ((_res_data = res.data) === null || _res_data === void 0 ? void 0 : _res_data.requestId) || res.requestId
        };
    },
    approveMaterialRequest: async (state, request, targetQtyOverrides, statusOrIsApproved, dispatch, currentUser)=>{
        const mrDbId = request.dbId || request.id;
        const statusVal = typeof statusOrIsApproved === 'string' ? statusOrIsApproved : statusOrIsApproved ? 'Approved' : 'Rejected';
        const payload = {
            status: statusVal,
            materials: normalizeMaterialLines(request).map((m)=>{
                const override = targetQtyOverrides ? targetQtyOverrides[m.materialName] : null;
                return {
                    materialName: m.materialName,
                    quantityApproved: override !== undefined && override !== null ? Number(override) : Number(m.quantityRequested)
                };
            })
        };
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].patch("/production/material-requests/".concat(mrDbId, "/status"), payload);
        return {
            success: true,
            data: res
        };
    },
    issueMaterial: async (state, request, department, dispatch, currentUser)=>{
        const mrDbId = request.dbId || request.id;
        const materials = normalizeMaterialLines(request);
        if (!mrDbId) throw new Error('Material request ID is required.');
        if (materials.length === 0) throw new Error('No valid materials were found in this request.');
        const payload = {
            department: department || 'Production',
            materialsIssued: materials.map((m)=>{
                var _m_quantityApproved, _ref;
                return {
                    materialName: m.materialName,
                    quantityIssued: Number((_ref = (_m_quantityApproved = m.quantityApproved) !== null && _m_quantityApproved !== void 0 ? _m_quantityApproved : m.quantityRequested) !== null && _ref !== void 0 ? _ref : 0)
                };
            })
        };
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post("/production/material-requests/".concat(mrDbId, "/issue"), payload);
        return {
            success: true,
            data: res
        };
    },
    startProduction: async (state, workOrder, machine, operator, shift, dispatch, currentUser)=>{
        const woDbId = workOrder.dbId || workOrder.id;
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/workflow/transition', {
            entity: 'work_order',
            entityId: woDbId,
            transitionName: 'START_PRODUCTION',
            payload: {
                machine,
                operator,
                shift
            },
            notes: "Started production on machine ".concat(machine, " by ").concat(operator, " during ").concat(shift)
        });
        return {
            success: true,
            data: res
        };
    },
    pauseProduction: async (state, workOrder, dispatch, currentUser)=>{
        const woDbId = workOrder.dbId || workOrder.id;
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/workflow/transition', {
            entity: 'work_order',
            entityId: woDbId,
            transitionName: 'PAUSE_PRODUCTION',
            payload: {},
            notes: 'Paused production'
        });
        return {
            success: true,
            data: res
        };
    },
    resumeProduction: async (state, workOrder, dispatch, currentUser)=>{
        const woDbId = workOrder.dbId || workOrder.id;
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/workflow/transition', {
            entity: 'work_order',
            entityId: woDbId,
            transitionName: 'RESUME_PRODUCTION',
            payload: {},
            notes: 'Resumed production'
        });
        return {
            success: true,
            data: res
        };
    },
    updateProductionProgress: async (state, workOrder, progress, stage, dispatch, currentUser)=>{
        const woDbId = workOrder.dbId;
        const status = progress === 100 ? 'Completed' : 'In Production';
        const notesObj = {
            stage: stage,
            reworkCount: workOrder.reworkCount || 0,
            qcHistory: workOrder.qcHistory || []
        };
        const payload = {
            quantity_produced: progress / 100 * workOrder.quantity,
            status: status,
            notes: JSON.stringify(notesObj)
        };
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].put("/production/work-orders/".concat(woDbId), payload);
        return {
            success: true,
            data: res
        };
    },
    completeProduction: async function(state, workOrder, dispatch, currentUser) {
        let payload = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : {};
        const woDbId = workOrder.dbId || workOrder.id;
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].patch("/production/work-orders/".concat(woDbId, "/complete"), payload);
        return {
            success: true,
            data: res
        };
    },
    submitQCInspection: async (state, order, workOrder, qcResults, isApproved, dispatch, currentUser)=>{
        const woDbId = workOrder.dbId || workOrder.id;
        // Construct defect history object
        const newInspection = {
            id: "QC-".concat(Date.now().toString().slice(-4)),
            date: new Date().toISOString().split('T')[0],
            inspector: (currentUser === null || currentUser === void 0 ? void 0 : currentUser.name) || 'QC Agent',
            result: isApproved ? 'Passed' : 'Failed',
            defects: qcResults.defects || []
        };
        const updatedQCHistory = [
            ...workOrder.qcHistory || [],
            newInspection
        ];
        // Create the inspection record in QC table
        const payload = {
            work_order_id: woDbId,
            overall_result: isApproved ? 'Pass' : 'Fail',
            defects: qcResults.defects || [],
            dimension_result: qcResults.dimension || 'Pass',
            weight_result: qcResults.weight || 'Pass',
            strength_result: qcResults.strength || 'Pass',
            surface_result: qcResults.surface || 'Pass',
            packaging_result: qcResults.packaging || 'Pass'
        };
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/production/qc', payload);
        // Trigger state-machine transition when possible. If the work order is already in a later QC state,
        // record the inspection and continue without blocking the user.
        const transitionName = isApproved ? 'QC_ACCEPT' : 'QC_REJECT';
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/workflow/transition', {
                entity: 'work_order',
                entityId: woDbId,
                transitionName,
                payload: {
                    qcHistory: updatedQCHistory
                },
                notes: isApproved ? 'Quality control check passed.' : 'Quality control check failed. Routing to Rework.'
            });
        } catch (err) {
            var _err_response_data, _err_response;
            const message = (err === null || err === void 0 ? void 0 : (_err_response = err.response) === null || _err_response === void 0 ? void 0 : (_err_response_data = _err_response.data) === null || _err_response_data === void 0 ? void 0 : _err_response_data.error) || (err === null || err === void 0 ? void 0 : err.message) || '';
            if (!message.includes('ILLEGAL_TRANSITION') && !message.includes('Illegal transition')) {
                throw err;
            }
        }
        return {
            success: true,
            qcId: res.qcId
        };
    },
    getQCInspections: async function() {
        let filters = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        const queryParams = new URLSearchParams(filters).toString();
        const suffix = queryParams ? "?".concat(queryParams) : '';
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/production/qc".concat(suffix));
        return res.data || res;
    },
    sendToReproduction: async (state, workOrder, dispatch, currentUser)=>{
        const woDbId = workOrder.dbId;
        const notesObj = {
            stage: 'Awaiting Re-conversion',
            reworkCount: (workOrder.reworkCount || 0) + 1,
            qcHistory: workOrder.qcHistory || []
        };
        const payload = {
            quantity_produced: 0,
            status: __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["STATUS"].REWORK,
            notes: JSON.stringify(notesObj)
        };
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].put("/production/work-orders/".concat(woDbId), payload);
        return {
            success: true,
            data: res
        };
    },
    rejectFailedWorkOrder: async (state, workOrder, dispatch, currentUser)=>{
        const woDbId = workOrder.dbId;
        const notesObj = {
            stage: 'Rejected',
            reworkCount: workOrder.reworkCount || 0,
            qcHistory: workOrder.qcHistory || []
        };
        const payload = {
            status: 'Cancelled',
            notes: JSON.stringify(notesObj)
        };
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].put("/production/work-orders/".concat(woDbId), payload);
        return {
            success: true,
            data: res
        };
    },
    updateReproduction: async (state, reproductionId, fields, dispatch, currentUser)=>{
        return {
            success: true
        };
    },
    getDashboardStats: async ()=>{
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get('/production/dashboard-stats');
        return res.data || res;
    },
    getProductionEntries: async function() {
        let filters = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        const queryParams = new URLSearchParams(filters).toString();
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/production/production?".concat(queryParams));
        return res.data || res;
    },
    createProductionEntry: async (payload)=>{
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/production/production', payload);
        return res.data || res;
    },
    getTestingEntries: async function() {
        let filters = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        const queryParams = new URLSearchParams(filters).toString();
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/production/testing?".concat(queryParams));
        return res.data || res;
    },
    getTestingEntryById: async (id)=>{
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/production/testing/".concat(id));
        return res.data || res;
    },
    updateTestingEntry: async (id, payload)=>{
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].put("/production/testing/".concat(id), payload);
        return res.data || res;
    },
    approveTestingEntry: async (id, payload)=>{
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post("/production/testing/".concat(id, "/approve"), payload);
        return res.data || res;
    },
    deleteTestingEntry: async (id)=>{
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].delete("/production/testing/".concat(id));
        return res.data || res;
    },
    getRejectionEntries: async function() {
        let filters = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        const queryParams = new URLSearchParams(filters).toString();
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].get("/production/rejection?".concat(queryParams));
        return res.data || res;
    },
    createRejectionEntry: async (payload)=>{
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post('/production/rejection', payload);
        return res.data || res;
    },
    executeRejectionAction: async (id, payload)=>{
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiClient"].post("/production/rejection/".concat(id, "/action"), payload);
        return res.data || res;
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/constants/production.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ──────────────────────────────────────────────────────────
// Himalaya ERP — Canonical Production Constants & Helpers
// ──────────────────────────────────────────────────────────
__turbopack_context__.s([
    "MATERIAL_REQUEST_STATUS",
    ()=>MATERIAL_REQUEST_STATUS,
    "WORK_ORDER_STATUS",
    ()=>WORK_ORDER_STATUS,
    "assertProductionTransition",
    ()=>assertProductionTransition
]);
const WORK_ORDER_STATUS = {
    PRODUCTION_PLANNED: 'PRODUCTION_PLANNED',
    MATERIAL_PENDING: 'MATERIAL_PENDING',
    READY_FOR_PRODUCTION: 'READY_FOR_PRODUCTION',
    PRODUCTION_STARTED: 'PRODUCTION_STARTED',
    PRODUCTION_IN_PROGRESS: 'PRODUCTION_IN_PROGRESS',
    PRODUCTION_PAUSED: 'PRODUCTION_PAUSED',
    PARTIALLY_COMPLETED: 'PARTIALLY_COMPLETED',
    PRODUCTION_COMPLETED: 'PRODUCTION_COMPLETED'
};
const MATERIAL_REQUEST_STATUS = {
    PENDING_PLANT_HEAD_APPROVAL: 'PENDING_PLANT_HEAD_APPROVAL',
    PLANT_HEAD_APPROVED: 'PLANT_HEAD_APPROVED',
    PLANT_HEAD_REJECTED: 'PLANT_HEAD_REJECTED',
    STORE_APPROVED: 'STORE_APPROVED',
    STORE_REJECTED: 'STORE_REJECTED',
    ISSUED: 'ISSUED'
};
function assertProductionTransition(entityType, currentStatus, nextStatus) {
    if (entityType === 'WORK_ORDER') {
        if (nextStatus === WORK_ORDER_STATUS.PRODUCTION_STARTED) {
            if (currentStatus !== WORK_ORDER_STATUS.READY_FOR_PRODUCTION && currentStatus !== WORK_ORDER_STATUS.PRODUCTION_PAUSED && currentStatus !== WORK_ORDER_STATUS.PRODUCTION_PLANNED) {
                throw new Error("Invalid transition: Cannot start production from ".concat(currentStatus, "."));
            }
        }
        if (nextStatus === WORK_ORDER_STATUS.PRODUCTION_COMPLETED) {
            const validPre = [
                WORK_ORDER_STATUS.PRODUCTION_STARTED,
                WORK_ORDER_STATUS.PRODUCTION_IN_PROGRESS,
                WORK_ORDER_STATUS.PARTIALLY_COMPLETED
            ];
            if (!validPre.includes(currentStatus)) {
                throw new Error("Invalid transition: Cannot mark production complete from ".concat(currentStatus, "."));
            }
        }
    }
    if (entityType === 'MATERIAL_REQUEST' && nextStatus === MATERIAL_REQUEST_STATUS.ISSUED) {
        if (currentStatus !== MATERIAL_REQUEST_STATUS.STORE_APPROVED) {
            throw new Error("Invalid transition: Material Request must be STORE_APPROVED before being issued (current: ".concat(currentStatus, ")."));
        }
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/(dashboard)/store/[[...slug]]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Page
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$store$2f$pages$2f$StorePortal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/modules/store/pages/StorePortal.jsx [app-client] (ecmascript)");
'use client';
;
;
function Page() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$store$2f$pages$2f$StorePortal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/app/(dashboard)/store/[[...slug]]/page.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
_c = Page;
var _c;
__turbopack_context__.k.register(_c, "Page");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_dc09c137._.js.map