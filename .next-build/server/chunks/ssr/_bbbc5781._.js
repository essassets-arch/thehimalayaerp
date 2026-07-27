module.exports = [
"[project]/store/searchStore.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSearchStore",
    ()=>useSearchStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
;
const useSearchStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set)=>({
        globalSearch: '',
        setGlobalSearch: (globalSearch)=>set({
                globalSearch
            })
    }));
}),
"[project]/store/customerComplaintStore.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCustomerComplaintStore",
    ()=>useCustomerComplaintStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-ssr] (ecmascript)");
;
;
const nextComplaintId = (complaints)=>{
    const year = new Date().getFullYear();
    const max = complaints.reduce((value, complaint)=>{
        const match = complaint.id.match(/(\d+)$/);
        return Math.max(value, match ? Number(match[1]) : 0);
    }, 0);
    return `CC-${year}-${String(max + 1).padStart(4, '0')}`;
};
const useCustomerComplaintStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        complaints: [],
        submitComplaint: (complaint)=>{
            const id = nextComplaintId(get().complaints);
            const now = new Date().toISOString();
            const status = 'PENDING_SUPER_ADMIN_REVIEW';
            const record = {
                ...complaint,
                id,
                status,
                superAdminRemarks: '',
                assignedTo: '',
                createdAt: now,
                updatedAt: now,
                history: [
                    {
                        status,
                        remarks: complaint.salesRemarks || 'Submitted for Super Admin review.',
                        actor: complaint.createdBy,
                        at: now
                    }
                ]
            };
            set((state)=>({
                    complaints: [
                        record,
                        ...state.complaints
                    ]
                }));
            return id;
        },
        saveDraft: (complaint, existingId)=>{
            const now = new Date().toISOString();
            if (existingId) {
                set((state)=>({
                        complaints: state.complaints.map((item)=>item.id === existingId ? {
                                ...item,
                                ...complaint,
                                status: 'DRAFT',
                                updatedAt: now,
                                history: [
                                    ...item.history,
                                    {
                                        status: 'DRAFT',
                                        remarks: 'Draft updated by Sales.',
                                        actor: complaint.createdBy,
                                        at: now
                                    }
                                ]
                            } : item)
                    }));
                return existingId;
            }
            const id = nextComplaintId(get().complaints);
            set((state)=>({
                    complaints: [
                        {
                            ...complaint,
                            id,
                            status: 'DRAFT',
                            superAdminRemarks: '',
                            assignedTo: '',
                            createdAt: now,
                            updatedAt: now,
                            history: [
                                {
                                    status: 'DRAFT',
                                    remarks: 'Draft saved by Sales.',
                                    actor: complaint.createdBy,
                                    at: now
                                }
                            ]
                        },
                        ...state.complaints
                    ]
                }));
            return id;
        },
        submitDraft: (id, complaint)=>{
            const now = new Date().toISOString();
            set((state)=>({
                    complaints: state.complaints.map((item)=>item.id === id ? {
                            ...item,
                            ...complaint,
                            status: 'PENDING_SUPER_ADMIN_REVIEW',
                            updatedAt: now,
                            history: [
                                ...item.history,
                                {
                                    status: 'PENDING_SUPER_ADMIN_REVIEW',
                                    remarks: complaint.salesRemarks || 'Submitted for Super Admin review.',
                                    actor: complaint.createdBy,
                                    at: now
                                }
                            ]
                        } : item)
                }));
        },
        updateStatus: (id, status, remarks, actor, assignedTo = '')=>set((state)=>({
                    complaints: state.complaints.map((complaint)=>complaint.id === id ? {
                            ...complaint,
                            status,
                            superAdminRemarks: remarks || complaint.superAdminRemarks,
                            assignedTo: assignedTo || complaint.assignedTo,
                            updatedAt: new Date().toISOString(),
                            history: [
                                ...complaint.history,
                                {
                                    status,
                                    remarks,
                                    actor,
                                    at: new Date().toISOString()
                                }
                            ]
                        } : complaint)
                }))
    }), {
    name: 'himalaya_customer_complaints_v1'
}));
}),
"[project]/shared/api/endpoints.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Centralized API endpoints for Himalaya ERP.
 */ __turbopack_context__.s([
    "ENDPOINTS",
    ()=>ENDPOINTS
]);
const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        ROLES: '/auth/roles',
        PASSCODES: '/auth/passcodes'
    },
    SALES: {
        LEADS: '/sales/leads',
        SAMPLES: '/sales/samples',
        QUOTATIONS: '/sales/quotations',
        ORDERS: '/sales/orders',
        REMINDERS: '/sales/reminders',
        ORDER_TIMELINE: (orderNo)=>`/sales/orders/${orderNo}/timeline`
    },
    ADMIN_OPS: {
        LEADS: '/admin-ops/leads',
        LEAD_BY_ID: (id)=>`/admin-ops/leads/${id}`,
        ORDERS: '/admin-ops/direct-orders',
        QUOTATIONS: '/admin-ops/quotations',
        CUSTOMERS: '/admin-ops/customers'
    },
    PRODUCTION: {
        WORK_ORDERS: '/production/work-orders',
        MATERIAL_REQUESTS: '/production/material-requests',
        MATERIAL_REQUEST_STATUS: (id)=>`/production/material-requests/${id}/status`
    },
    PURCHASE: {
        MACHINES: '/purchase/machines',
        BOM: '/purchase/bom'
    },
    STORE: {
        PURCHASE_ORDERS: '/store/purchase-orders'
    },
    DISPATCH: {
        BASE: '/dispatch',
        QUEUE: '/dispatch/queue'
    },
    FINANCE: {
        INVOICES: '/finance/invoices'
    },
    NOTIFICATIONS: {
        BASE: '/notifications',
        READ_ALL: '/notifications/read-all',
        BY_ID: (id)=>`/notifications/${id}`
    },
    ADMIN: {
        USERS: '/admin/users',
        EMPLOYEES: '/admin/employees',
        LEAVES: '/admin/employees/leaves',
        AUDIT_LOGS: '/admin/audit-logs',
        SETTINGS: '/admin/settings',
        MODULES: '/admin/modules',
        SEED: '/admin/seed'
    },
    SUPER_ADMIN: {
        EVENTS: '/domain-events/recent',
        HEALTH: '/domain-events/health'
    },
    PRODUCTS: '/products'
};
}),
"[project]/shared/api/errors.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Custom API Error Classes for Himalaya ERP.
 */ __turbopack_context__.s([
    "AuthenticationError",
    ()=>AuthenticationError,
    "ConflictError",
    ()=>ConflictError,
    "ERPError",
    ()=>ERPError,
    "NotFoundError",
    ()=>NotFoundError,
    "PermissionError",
    ()=>PermissionError,
    "ServerError",
    ()=>ServerError,
    "ValidationError",
    ()=>ValidationError
]);
class ERPError extends Error {
    constructor(message, status = 500, code = 'INTERNAL_ERROR'){
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
class AuthenticationError extends ERPError {
    constructor(message = 'Authentication failed.'){
        super(message, 401, 'AUTH_FAILED');
    }
}
class PermissionError extends ERPError {
    constructor(message = 'Access Denied: Insufficient permissions.'){
        super(message, 403, 'FORBIDDEN');
    }
}
class NotFoundError extends ERPError {
    constructor(message = 'Resource not found.'){
        super(message, 404, 'NOT_FOUND');
    }
}
class ConflictError extends ERPError {
    constructor(message = 'Resource conflict.'){
        super(message, 409, 'CONFLICT');
    }
}
class ValidationError extends ERPError {
    constructor(message = 'Validation failed.', details = []){
        super(message, 422, 'VALIDATION_FAILED');
        this.details = details;
    }
}
class ServerError extends ERPError {
    constructor(message = 'An unexpected server error occurred.'){
        super(message, 500, 'SERVER_ERROR');
    }
}
}),
"[project]/shared/api/interceptors.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Request and Response Interceptors for Himalaya ERP.
 */ __turbopack_context__.s([
    "requestInterceptor",
    ()=>requestInterceptor,
    "responseInterceptor",
    ()=>responseInterceptor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/api/errors.js [app-ssr] (ecmascript)");
;
// Helper to get active user details
const getSession = ()=>{
    try {
        const storedUser = sessionStorage.getItem('erpUser');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch  {
        return null;
    }
};
const requestInterceptor = (options = {})=>{
    const token = sessionStorage.getItem('token') || sessionStorage.getItem('himalaya_token');
    const user = getSession();
    const companyId = user?.company_id || sessionStorage.getItem('companyId') || '1';
    const workspaceId = user?.workspace_id || sessionStorage.getItem('workspaceId');
    // Strip our internal client keys — these must NOT be forwarded to fetch()'s RequestInit.
    // 'priority' clashes with the browser's FetchPriority enum (only 'high'|'low'|'auto' are valid).
    // 'cacheKey' and 'raw' are ERP-client-only concepts.
    // 'isFormData' is used here to skip Content-Type so the browser sets the multipart boundary.
    const { priority: _p, cacheKey: _ck, raw: _r, isFormData: _fd, ...fetchOptions } = options;
    const headers = {
        // Skip Content-Type for FormData — browser must set it with the multipart boundary
        ..._fd ? {} : {
            'Content-Type': 'application/json'
        },
        ...token ? {
            Authorization: `Bearer ${token}`
        } : {},
        ...("TURBOPACK compile-time truthy", 1) ? {
            'X-Company-Id': String(companyId)
        } : "TURBOPACK unreachable",
        ...workspaceId ? {
            'X-Workspace-Id': String(workspaceId)
        } : {},
        'X-Correlation-Id': `corr-${Math.random().toString(36).slice(2, 11)}`,
        'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
        'X-App-Version': '1.0.0',
        // Caller headers last — but strip Content-Type for FormData to avoid clobbering the boundary
        ..._fd ? (()=>{
            const h = {
                ...fetchOptions.headers
            };
            delete h['Content-Type'];
            delete h['content-type'];
            return h;
        })() : fetchOptions.headers
    };
    return {
        ...fetchOptions,
        headers
    };
};
const responseInterceptor = async (res, options = {})=>{
    if (res.ok) {
        const envelope = await res.json();
        if (envelope.success === false) {
            // Backend returned custom error envelope
            throw mapBackendError(envelope);
        }
        if (options.raw) {
            return envelope;
        }
        return envelope.data !== undefined ? envelope.data : envelope;
    }
    // Handle HTTP status errors
    const status = res.status;
    let errMsg = `HTTP Error ${status}`;
    let errDetails = [];
    try {
        const envelope = await res.json();
        errMsg = envelope.message || envelope.error || errMsg;
        errDetails = envelope.errors || [];
    } catch  {
    // ignore parsing errors
    }
    if (status === 401) {
        // Triggers refresh token flow or clean redirect
        sessionStorage.removeItem('himalaya_token');
        sessionStorage.removeItem('token');
        window.dispatchEvent(new Event('auth:unauthorized'));
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AuthenticationError"](errMsg);
    }
    if (status === 403) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PermissionError"](errMsg);
    }
    if (status === 404) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NotFoundError"](errMsg);
    }
    if (status === 409) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConflictError"](errMsg);
    }
    if (status === 422) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ValidationError"](errMsg, errDetails);
    }
    throw new __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ServerError"](errMsg);
};
const mapBackendError = (envelope)=>{
    const code = envelope.errorCode;
    const msg = envelope.message || envelope.error || 'Operation failed.';
    const details = envelope.errors || [];
    if (String(msg).toLowerCase().includes('not found')) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NotFoundError"](msg);
    }
    switch(code){
        case 'FORBIDDEN':
        case 'UNAUTHORIZED_ACCESS':
            return new __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PermissionError"](msg);
        case 'NOT_FOUND':
            return new __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NotFoundError"](msg);
        case 'CONFLICT':
            return new __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ConflictError"](msg);
        case 'VALIDATION_FAILED':
            return new __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ValidationError"](msg, details);
        default:
            return new __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$errors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ServerError"](msg);
    }
};
}),
"[project]/shared/api/cache.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Lightweight in-memory cache layer for rarely changing configuration data.
 */ __turbopack_context__.s([
    "apiCache",
    ()=>apiCache
]);
const cacheStore = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL
const apiCache = {
    get: (key)=>{
        const entry = cacheStore.get(key);
        if (!entry) return null;
        if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
            cacheStore.delete(key);
            return null;
        }
        return entry.data;
    },
    set: (key, data)=>{
        cacheStore.set(key, {
            timestamp: Date.now(),
            data
        });
    },
    clear: (key = null)=>{
        if (key) {
            cacheStore.delete(key);
        } else {
            cacheStore.clear();
        }
    }
};
}),
"[project]/shared/api/requestQueue.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Prioritized Request Queue for Himalaya ERP.
 * Executes concurrent network operations based on priority levels (HIGH, MEDIUM, LOW).
 */ __turbopack_context__.s([
    "requestQueue",
    ()=>requestQueue
]);
const PRIORITIES = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1 // Logs, analytics charts, PDF downloads
};
class RequestQueue {
    constructor(maxConcurrency = 4){
        this.maxConcurrency = maxConcurrency;
        this.activeCount = 0;
        this.queue = [];
    }
    /**
   * Add a request task to the prioritized queue.
   * @param {Function} task - Async function returning a promise
   * @param {string} priority - 'HIGH', 'MEDIUM', or 'LOW'
   * @returns {Promise}
   */ add(task, priority = 'MEDIUM') {
        return new Promise((resolve, reject)=>{
            const priorityScore = PRIORITIES[priority.toUpperCase()] || PRIORITIES.MEDIUM;
            this.queue.push({
                task,
                resolve,
                reject,
                priorityScore
            });
            this.queue.sort((a, b)=>b.priorityScore - a.priorityScore);
            this.next();
        });
    }
    next() {
        if (this.activeCount >= this.maxConcurrency || this.queue.length === 0) {
            return;
        }
        const { task, resolve, reject } = this.queue.shift();
        this.activeCount++;
        task().then((res)=>{
            this.activeCount--;
            resolve(res);
            this.next();
        }).catch((err)=>{
            this.activeCount--;
            reject(err);
            this.next();
        });
    }
}
const requestQueue = new RequestQueue();
}),
"[project]/shared/api/client.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Centralized API client for Himalaya ERP.
 * Integrates caching, queue priority, and unified interceptors.
 */ __turbopack_context__.s([
    "client",
    ()=>client
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$interceptors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/api/interceptors.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$cache$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/api/cache.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$requestQueue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shared/api/requestQueue.js [app-ssr] (ecmascript)");
;
;
;
const BASE_URL = '/api';
function buildApiUrl(path) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    if (normalizedPath.startsWith('/api/')) {
        return normalizedPath;
    }
    return `/api${normalizedPath}`;
}
async function performRequest(method, path, body = null, options = {}) {
    const url = buildApiUrl(path);
    const isFormData = body instanceof FormData;
    const requestOptions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$interceptors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requestInterceptor"])({
        method,
        body: body ? isFormData ? body : JSON.stringify(body) : null,
        isFormData,
        ...options
    });
    const workspaceId = requestOptions.headers['X-Workspace-Id'] || 'N/A';
    const correlationId = requestOptions.headers['X-Correlation-Id'] || 'N/A';
    const cacheStatus = options.cacheKey ? 'MISS' : 'BYPASS';
    const startTime = Date.now();
    const fetchTask = async ()=>{
        try {
            // Local Mock for Product Catalog
            if (path.includes('/products/search')) {
                const mockProducts = [
                    {
                        id: '1',
                        product_name: 'Widget A',
                        product_code: 'WA-01',
                        brand: 'Acme',
                        gst_rate: 18,
                        hsn_sac_code: '1234',
                        unit_of_measure: 'pcs',
                        dispatch_category: 'DISPATCH 1',
                        selling_price: 1500,
                        price: 1500
                    },
                    {
                        id: '2',
                        product_name: 'Widget B',
                        product_code: 'WB-02',
                        brand: 'Acme',
                        gst_rate: 18,
                        hsn_sac_code: '1235',
                        unit_of_measure: 'pcs',
                        dispatch_category: 'DISPATCH 2',
                        selling_price: 2500,
                        price: 2500
                    }
                ];
                return mockProducts;
            }
            if (path.includes('/products/catalog')) {
                return {
                    categories: [
                        {
                            id: 'CAT1',
                            name: 'Raw Material'
                        }
                    ],
                    products: [
                        {
                            id: '1',
                            product_name: 'Widget A',
                            product_code: 'WA-01',
                            brand: 'Acme',
                            gst_rate: 18,
                            hsn_sac_code: '1234',
                            unit_of_measure: 'pcs',
                            dispatch_category: 'DISPATCH 1'
                        },
                        {
                            id: '2',
                            product_name: 'Widget B',
                            product_code: 'WB-02',
                            brand: 'Acme',
                            gst_rate: 18,
                            hsn_sac_code: '1235',
                            unit_of_measure: 'pcs',
                            dispatch_category: 'DISPATCH 2'
                        }
                    ]
                };
            }
            // Local Mock for Reminders
            if (path.includes('/sales/reminders')) {
                const LS_KEY = 'erp_reminders';
                let items = [];
                try {
                    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                    ;
                } catch (e) {}
                if (method === 'GET') {
                    return {
                        data: items,
                        success: true
                    };
                }
                if (method === 'POST') {
                    const bodyData = body instanceof FormData ? Object.fromEntries(body.entries()) : typeof body === 'string' ? JSON.parse(body) : body;
                    const newItem = {
                        id: `REM-${Date.now()}`,
                        ...bodyData,
                        status: 'Pending',
                        createdAt: new Date().toISOString()
                    };
                    items.push(newItem);
                    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                    ;
                    return {
                        data: newItem,
                        success: true
                    };
                }
                if (method === 'PUT') {
                    const id = path.split('/').pop();
                    const idx = items.findIndex((i)=>i.id === id);
                    const bodyData = body instanceof FormData ? Object.fromEntries(body.entries()) : typeof body === 'string' ? JSON.parse(body) : body;
                    if (idx > -1) {
                        items[idx] = {
                            ...items[idx],
                            ...bodyData,
                            updatedAt: new Date().toISOString()
                        };
                        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                        ;
                        return {
                            data: items[idx],
                            success: true
                        };
                    }
                    throw new Error('Reminder not found');
                }
                if (method === 'PATCH' && path.endsWith('/complete')) {
                    const match = path.match(/\/sales\/reminders\/(.+)\/complete/);
                    if (match) {
                        const idx = items.findIndex((i)=>i.id === match[1]);
                        if (idx > -1) {
                            items[idx].status = 'Completed';
                            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                            ;
                            return {
                                data: items[idx],
                                success: true
                            };
                        }
                    }
                    throw new Error('Reminder not found');
                }
                if (method === 'DELETE') {
                    const id = path.split('/').pop();
                    items = items.filter((i)=>i.id !== id);
                    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                    ;
                    return {
                        success: true
                    };
                }
            }
            const res = await fetch(url, requestOptions);
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$interceptors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["responseInterceptor"])(res, options);
            if ("TURBOPACK compile-time truthy", 1) {
                const duration = Date.now() - startTime;
                console.log(`%c[API] %c${method} %c${path} %c- ${res.status || 200} (${duration}ms) Workspace: ${workspaceId} Request: ${correlationId} Cache: ${cacheStatus}`, 'color: #4CAF50; font-weight: bold;', 'color: #2196F3; font-weight: bold;', 'color: #9C27B0;', 'color: #3F51B5; font-weight: bold;');
            }
            return data;
        } catch (err) {
            if ("TURBOPACK compile-time truthy", 1) {
                const duration = Date.now() - startTime;
                console.error(`%c[API] %c${method} %c${path} %c- FAILED (${duration}ms) Workspace: ${workspaceId} Request: ${correlationId} Cache: ${cacheStatus} - ${err.message}`, 'color: #F44336; font-weight: bold;', 'color: #2196F3; font-weight: bold;', 'color: #9C27B0;', 'color: #FF5722; font-weight: bold;');
            }
            throw err;
        }
    };
    // Run through request queue
    return __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$requestQueue$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requestQueue"].add(fetchTask, options.priority || 'MEDIUM');
}
const client = {
    get: async (path, options = {})=>{
        // Attempt cache read for GET requests if caching is enabled
        if (options.cacheKey) {
            const cachedData = __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$cache$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiCache"].get(options.cacheKey);
            if (cachedData !== null) {
                if ("TURBOPACK compile-time truthy", 1) {
                    const storedUser = localStorage.getItem('erpUser');
                    let workspaceId = 'N/A';
                    try {
                        workspaceId = storedUser ? JSON.parse(storedUser)?.workspace_id : 'N/A';
                    } catch  {}
                    console.log(`%c[API] %cGET %c${path} %c- 200 (0ms) Workspace: ${workspaceId} Cache: HIT`, 'color: #4CAF50; font-weight: bold;', 'color: #2196F3; font-weight: bold;', 'color: #9C27B0;', 'color: #009688; font-weight: bold;');
                }
                return cachedData;
            }
        }
        const data = await performRequest('GET', path, null, options);
        if (options.cacheKey) {
            __TURBOPACK__imported__module__$5b$project$5d2f$shared$2f$api$2f$cache$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiCache"].set(options.cacheKey, data);
        }
        return data;
    },
    post: (path, body, options = {})=>performRequest('POST', path, body, options),
    put: (path, body, options = {})=>performRequest('PUT', path, body, options),
    patch: (path, body, options = {})=>performRequest('PATCH', path, body, options),
    delete: (path, options = {})=>performRequest('DELETE', path, null, options)
};
}),
"[project]/shared/utils/reminderUtils.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LEAD_REMINDER_TYPES",
    ()=>LEAD_REMINDER_TYPES,
    "QUOTATION_REMINDER_TYPES",
    ()=>QUOTATION_REMINDER_TYPES,
    "daysUntil",
    ()=>daysUntil,
    "filterRemindersByBucket",
    ()=>filterRemindersByBucket,
    "formatReminderDate",
    ()=>formatReminderDate,
    "formatReminderTime",
    ()=>formatReminderTime,
    "getNextPendingReminder",
    ()=>getNextPendingReminder,
    "getReminderTimingLabel",
    ()=>getReminderTimingLabel,
    "getTodayPendingReminders",
    ()=>getTodayPendingReminders,
    "mapBackendReminder",
    ()=>mapBackendReminder,
    "startOfDay",
    ()=>startOfDay,
    "toDateOnly",
    ()=>toDateOnly
]);
const pad = (n)=>String(n).padStart(2, '0');
const formatReminderDate = (dateStr)=>{
    if (!dateStr) return '—';
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short'
    });
};
const formatReminderTime = (timeStr)=>{
    if (!timeStr) return '';
    const [h, m] = String(timeStr).split(':').map(Number);
    if (Number.isNaN(h)) return timeStr;
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${pad(m || 0)} ${period}`;
};
const toDateOnly = (value)=>{
    if (!value) return null;
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const startOfDay = (d = new Date())=>new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysUntil = (dateStr)=>{
    if (!dateStr) return NaN;
    const target = startOfDay(new Date(`${dateStr}T00:00:00`));
    if (Number.isNaN(target.getTime())) return NaN;
    const today = startOfDay();
    return Math.round((target - today) / 86400000);
};
const getReminderTimingLabel = (reminder)=>{
    if (!reminder || reminder.status === 'Completed' || reminder.status === 'Cancelled') return null;
    const date = reminder.reminderDate || reminder.reminder_date;
    if (!date) return null;
    const diff = daysUntil(date);
    if (diff < 0) return {
        label: `Overdue (${Math.abs(diff)} Day${Math.abs(diff) === 1 ? '' : 's'})`,
        tone: 'overdue'
    };
    if (diff === 0) return {
        label: 'Due Today',
        tone: 'today'
    };
    if (diff === 1) return {
        label: 'Tomorrow',
        tone: 'tomorrow'
    };
    return null;
};
const getNextPendingReminder = (reminders, moduleType, moduleId)=>{
    const pending = (reminders || []).filter((r)=>r.moduleType === moduleType && String(r.moduleId) === String(moduleId) && (r.status === 'Pending' || r.status === 'Upcoming')).sort((a, b)=>{
        const ad = `${a.reminderDate || ''} ${a.reminderTime || ''}`;
        const bd = `${b.reminderDate || ''} ${b.reminderTime || ''}`;
        return ad.localeCompare(bd);
    });
    return pending[0] || null;
};
const filterRemindersByBucket = (reminders, bucket)=>{
    const list = Array.isArray(reminders) ? reminders : [];
    if (!bucket || bucket === 'All') return list;
    if (bucket === 'Completed') return list.filter((r)=>r.status === 'Completed');
    if (bucket === 'Overdue') {
        return list.filter((r)=>(r.status === 'Pending' || r.status === 'Upcoming') && daysUntil(r.reminderDate) < 0);
    }
    if (bucket === 'Today') {
        return list.filter((r)=>(r.status === 'Pending' || r.status === 'Upcoming') && daysUntil(r.reminderDate) === 0);
    }
    if (bucket === 'Tomorrow') {
        return list.filter((r)=>(r.status === 'Pending' || r.status === 'Upcoming') && daysUntil(r.reminderDate) === 1);
    }
    if (bucket === 'This Week') {
        return list.filter((r)=>{
            if (r.status !== 'Pending' && r.status !== 'Upcoming') return false;
            const diff = daysUntil(r.reminderDate);
            return diff >= 0 && diff <= 6;
        });
    }
    return list;
};
const LEAD_REMINDER_TYPES = [
    'Call Customer',
    'WhatsApp',
    'Email',
    'Meeting',
    'Follow Up',
    'Visit',
    'Payment',
    'Other'
];
const QUOTATION_REMINDER_TYPES = [
    'Call',
    'Email',
    'Negotiation',
    'Price Follow-up',
    'Visit',
    'Expiry Reminder',
    'Other'
];
const getTodayPendingReminders = (reminders)=>filterRemindersByBucket(reminders, 'Today').filter((r)=>r.status === 'Pending').sort((a, b)=>{
        const at = a.reminderTime || '99:99';
        const bt = b.reminderTime || '99:99';
        return at.localeCompare(bt);
    });
const mapBackendReminder = (row)=>({
        id: row.id,
        moduleType: row.moduleType || row.module_type,
        moduleId: row.moduleId || row.module_id,
        customerId: row.customerId || row.customer_id,
        customerName: row.customerName || row.customer_name,
        title: row.title,
        reminderType: row.reminderType || row.reminder_type,
        priority: row.priority || 'Medium',
        reminderDate: toDateOnly(row.reminderDate || row.reminder_date),
        reminderTime: row.reminderTime || (row.reminder_time ? String(row.reminder_time).slice(0, 5) : null),
        remarks: row.remarks || '',
        status: row.status || 'Pending',
        createdBy: row.createdBy || row.created_by,
        completedAt: row.completedAt || row.completed_at,
        createdAt: row.createdAt || row.created_at
    });
}),
"[project]/shared/components/ProductPicker.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProductPicker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/erpStore.ts [app-ssr] (ecmascript)");
;
;
;
function ProductPicker({ value = null, onChange, categoryId = null, dispatchCat = null, placeholder = 'Search products by name, code, or SKU…', disabled = false, className = '', showBadge = true, label, required = false, error }) {
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [results, setResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const debounceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Dispatch badge styling
    const DISPATCH_BADGE = {
        'DISPATCH 1': {
            label: 'D1',
            bg: 'rgba(99,102,241,0.18)',
            color: '#818cf8'
        },
        'DISPATCH 2': {
            label: 'D2',
            bg: 'rgba(16,185,129,0.18)',
            color: '#34d399'
        },
        'NONE': {
            label: '—',
            bg: 'rgba(100,116,139,0.18)',
            color: '#8893A7'
        }
    };
    const search = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (q)=>{
        setLoading(true);
        try {
            // Fetch from local Zustand store instead of API
            const rawInventory = __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$erpStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useERPStore"].getState().state.rawInventory || [];
            let filtered = rawInventory;
            if (q) {
                const lowerQ = q.toLowerCase();
                filtered = rawInventory.filter((p)=>p.material && p.material.toLowerCase().includes(lowerQ) || p.code && p.code.toLowerCase().includes(lowerQ) || p.description && p.description.toLowerCase().includes(lowerQ));
            }
            const mappedResults = filtered.map((p)=>({
                    id: p.id || p.code,
                    product_name: p.material || p.name || 'Unknown Product',
                    product_code: p.code || 'N/A',
                    brand: p.brand || 'Acme',
                    gst_rate: p.gst || 18,
                    hsn_sac_code: p.hsn || '1234',
                    unit_of_measure: p.unit || 'pcs',
                    dispatch_category: 'DISPATCH 1',
                    selling_price: p.price || p.selling_price || p.base_price || 1500,
                    price: p.price || p.selling_price || p.base_price || 1500
                }));
            setResults(mappedResults);
        } catch  {
            setResults([]);
        } finally{
            setLoading(false);
        }
    }, [
        categoryId,
        dispatchCat
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (query.length === 0) {
            // On empty query, show first 20 products
            debounceRef.current = setTimeout(()=>search(''), 0);
        } else {
            debounceRef.current = setTimeout(()=>search(query), 280);
        }
        return ()=>clearTimeout(debounceRef.current);
    }, [
        query,
        search
    ]);
    // Close on outside click
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handler = (e)=>{
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return ()=>document.removeEventListener('mousedown', handler);
    }, []);
    const handleSelect = (product)=>{
        onChange && onChange(product);
        setQuery('');
        setOpen(false);
    };
    const handleClear = (e)=>{
        e.stopPropagation();
        onChange && onChange(null);
        setQuery('');
    };
    const handleInputFocus = ()=>{
        setOpen(true);
        if (results.length === 0) search(query);
    };
    // Group results by product_family for display
    const grouped = results.reduce((acc, p)=>{
        const family = p.product_family || p.category_name || 'Other';
        if (!acc[family]) acc[family] = [];
        acc[family].push(p);
        return acc;
    }, {});
    const badge = (p)=>{
        const b = DISPATCH_BADGE[p.dispatch_category] || DISPATCH_BADGE['NONE'];
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            style: {
                fontSize: '10px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '4px',
                background: b.bg,
                color: b.color,
                flexShrink: 0
            },
            children: b.label
        }, void 0, false, {
            fileName: "[project]/shared/components/ProductPicker.jsx",
            lineNumber: 134,
            columnNumber: 7
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: containerRef,
        className: `product-picker ${className}`,
        style: {
            position: 'relative'
        },
        children: [
            label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                style: {
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-secondary, #8893A7)',
                    letterSpacing: '0.02em'
                },
                children: [
                    label,
                    required && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: '#f87171',
                            marginLeft: '3px'
                        },
                        children: "*"
                    }, void 0, false, {
                        fileName: "[project]/shared/components/ProductPicker.jsx",
                        lineNumber: 151,
                        columnNumber: 31
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/shared/components/ProductPicker.jsx",
                lineNumber: 146,
                columnNumber: 9
            }, this),
            value && !open ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                onClick: ()=>!disabled && setOpen(true),
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    background: 'var(--color-card-bg, #ffffff)',
                    border: `1px solid ${error ? '#f87171' : 'var(--color-border, #DCE5F0)'}`,
                    transition: 'border-color 0.2s'
                },
                children: [
                    showBadge && badge(value),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            flex: 1,
                            minWidth: 0
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: 'var(--color-text-primary, #24345C)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                },
                                children: value.display_name || value.product_name
                            }, void 0, false, {
                                fileName: "[project]/shared/components/ProductPicker.jsx",
                                lineNumber: 169,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: '11px',
                                    color: 'var(--color-text-secondary, #5E6B82)',
                                    marginTop: '1px'
                                },
                                children: [
                                    value.product_code,
                                    " · ",
                                    value.brand,
                                    " · GST ",
                                    value.gst_rate,
                                    "% · HSN ",
                                    value.hsn_sac_code || '—'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/shared/components/ProductPicker.jsx",
                                lineNumber: 172,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/shared/components/ProductPicker.jsx",
                        lineNumber: 168,
                        columnNumber: 11
                    }, this),
                    !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleClear,
                        style: {
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted, #5E6B82)',
                            padding: '2px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.15s'
                        },
                        title: "Clear selection",
                        children: "✕"
                    }, void 0, false, {
                        fileName: "[project]/shared/components/ProductPicker.jsx",
                        lineNumber: 177,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/shared/components/ProductPicker.jsx",
                lineNumber: 157,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'relative'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        value: query,
                        onChange: (e)=>setQuery(e.target.value),
                        onFocus: handleInputFocus,
                        placeholder: disabled ? 'N/A' : placeholder,
                        disabled: disabled,
                        autoComplete: "off",
                        style: {
                            width: '100%',
                            padding: '9px 36px 9px 12px',
                            borderRadius: '8px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            background: 'var(--color-card-bg, #ffffff)',
                            border: `1px solid ${error ? '#f87171' : open ? 'var(--color-accent-teal, #6366f1)' : 'var(--color-border, #DCE5F0)'}`,
                            color: 'var(--color-text-primary, #24345C)',
                            fontSize: '14px',
                            transition: 'border-color 0.2s',
                            cursor: disabled ? 'not-allowed' : 'text'
                        }
                    }, void 0, false, {
                        fileName: "[project]/shared/components/ProductPicker.jsx",
                        lineNumber: 193,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-secondary, #5E6B82)',
                            pointerEvents: 'none',
                            fontSize: '14px'
                        },
                        children: loading ? '⟳' : '⌕'
                    }, void 0, false, {
                        fileName: "[project]/shared/components/ProductPicker.jsx",
                        lineNumber: 212,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/shared/components/ProductPicker.jsx",
                lineNumber: 192,
                columnNumber: 9
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    fontSize: '12px',
                    color: '#f87171',
                    marginTop: '4px'
                },
                children: error
            }, void 0, false, {
                fileName: "[project]/shared/components/ProductPicker.jsx",
                lineNumber: 223,
                columnNumber: 9
            }, this),
            open && !disabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    background: 'var(--color-card-bg, #ffffff)',
                    border: '1px solid var(--color-border, #DCE5F0)',
                    borderRadius: '10px',
                    zIndex: 1000,
                    maxHeight: '320px',
                    overflowY: 'auto',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                },
                children: [
                    loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '16px',
                            textAlign: 'center',
                            color: 'var(--color-text-secondary, #5E6B82)',
                            fontSize: '13px'
                        },
                        children: "Searching…"
                    }, void 0, false, {
                        fileName: "[project]/shared/components/ProductPicker.jsx",
                        lineNumber: 236,
                        columnNumber: 13
                    }, this),
                    !loading && results.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            padding: '16px',
                            textAlign: 'center',
                            color: 'var(--color-text-secondary, #5E6B82)',
                            fontSize: '13px'
                        },
                        children: [
                            "No products found",
                            query ? ` for "${query}"` : ''
                        ]
                    }, void 0, true, {
                        fileName: "[project]/shared/components/ProductPicker.jsx",
                        lineNumber: 241,
                        columnNumber: 13
                    }, this),
                    !loading && Object.entries(grouped).map(([family, products])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        padding: '6px 12px 4px',
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        letterSpacing: '0.08em',
                                        color: 'var(--color-text-secondary, #5E6B82)',
                                        textTransform: 'uppercase',
                                        borderBottom: '1px solid var(--color-border, #DCE5F0)'
                                    },
                                    children: family
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/ProductPicker.jsx",
                                    lineNumber: 248,
                                    columnNumber: 15
                                }, this),
                                products.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        onClick: ()=>handleSelect(p),
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '9px 12px',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s',
                                            borderRadius: '4px'
                                        },
                                        onMouseEnter: (e)=>e.currentTarget.style.background = 'var(--color-background, #F5FAFE)',
                                        onMouseLeave: (e)=>e.currentTarget.style.background = 'transparent',
                                        children: [
                                            showBadge && badge(p),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    flex: 1,
                                                    minWidth: 0
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '13px',
                                                            fontWeight: 600,
                                                            color: 'var(--color-text-primary, #24345C)',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        },
                                                        children: p.display_name || p.product_name
                                                    }, void 0, false, {
                                                        fileName: "[project]/shared/components/ProductPicker.jsx",
                                                        lineNumber: 271,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        style: {
                                                            fontSize: '11px',
                                                            color: 'var(--color-text-secondary, #5E6B82)',
                                                            marginTop: '1px'
                                                        },
                                                        children: [
                                                            p.product_code,
                                                            " · ",
                                                            p.unit_of_measure,
                                                            " · GST ",
                                                            p.gst_rate,
                                                            "%",
                                                            p.hsn_sac_code ? ` · HSN ${p.hsn_sac_code}` : ''
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/shared/components/ProductPicker.jsx",
                                                        lineNumber: 277,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/shared/components/ProductPicker.jsx",
                                                lineNumber: 270,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, p.id, true, {
                                        fileName: "[project]/shared/components/ProductPicker.jsx",
                                        lineNumber: 257,
                                        columnNumber: 17
                                    }, this))
                            ]
                        }, family, true, {
                            fileName: "[project]/shared/components/ProductPicker.jsx",
                            lineNumber: 246,
                            columnNumber: 13
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/shared/components/ProductPicker.jsx",
                lineNumber: 228,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/shared/components/ProductPicker.jsx",
        lineNumber: 144,
        columnNumber: 5
    }, this);
}
}),
"[project]/shared/hooks/useFormDraft.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useFormDraft",
    ()=>useFormDraft
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sweetalert2$2f$dist$2f$sweetalert2$2e$esm$2e$all$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sweetalert2/dist/sweetalert2.esm.all.js [app-ssr] (ecmascript)");
;
;
const hasMeaningfulData = (data)=>{
    if (!data) return false;
    return Object.values(data).some((value)=>{
        if (Array.isArray(value)) return value.length > 0;
        if (value && typeof value === 'object') {
            return hasMeaningfulData(value);
        }
        return value !== '' && value !== null && value !== undefined;
    });
};
function useFormDraft({ draftKey, initialData, enabled = true, debounceMs = 400, version = 1, excludeFields = [], mergeDraft = (base, saved)=>({
        ...base,
        ...saved
    }), validateDraft = ()=>true, erpUpdatedAt = null }) {
    const configRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({});
    configRef.current = {
        mergeDraft,
        validateDraft,
        excludeFields
    };
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialData);
    const [restoreStatus, setRestoreStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('CHECKING');
    const [draftSavedAt, setDraftSavedAt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const initialDataRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(initialData);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        initialDataRef.current = initialData;
    }, [
        initialData
    ]);
    const sanitize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((data)=>{
        const copy = structuredClone(data);
        const fields = configRef.current.excludeFields || [];
        for (const field of fields){
            delete copy[field];
        }
        return copy;
    }, []);
    const clearDraft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }, [
        draftKey
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) {
            setRestoreStatus('READY');
            return;
        }
        //TURBOPACK unreachable
        ;
        let cancelled;
        const resolveDraft = undefined;
    }, [
        draftKey,
        enabled,
        version,
        erpUpdatedAt
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) {
            return;
        }
        //TURBOPACK unreachable
        ;
        const timeout = undefined;
    }, [
        debounceMs,
        draftKey,
        enabled,
        formData,
        restoreStatus,
        sanitize,
        version
    ]);
    return {
        formData,
        setFormData,
        clearDraft,
        restoreStatus,
        draftSavedAt
    };
}
}),
"[project]/shared/components/ReminderModal.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ReminderModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.mjs [app-ssr] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.mjs [app-ssr] (ecmascript) <export default as X>");
;
;
;
function ReminderModal({ open, onClose, onSave, customerName = '', initialValues = null, title = 'Create Reminder' }) {
    const tomorrowStr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }, []);
    const [reminderDate, setReminderDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialValues?.reminderDate || tomorrowStr);
    const [remarks, setRemarks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(initialValues?.remarks || '');
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!open) return;
        setReminderDate(initialValues?.reminderDate || tomorrowStr);
        setRemarks(initialValues?.remarks || '');
        setSaving(false);
    }, [
        open,
        initialValues,
        tomorrowStr
    ]);
    if (!open) return null;
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (!reminderDate) {
            alert('Reminder date is required.');
            return;
        }
        setSaving(true);
        try {
            await onSave({
                reminderDate,
                reminderTime: initialValues?.reminderTime || null,
                reminderType: initialValues?.reminderType || 'Follow-up',
                priority: initialValues?.priority || 'Medium',
                remarks: remarks.trim()
            });
            onClose();
        } finally{
            setSaving(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "modal-overlay active",
        onClick: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "modal-box",
            onClick: (e)=>e.stopPropagation(),
            style: {
                width: '480px',
                maxWidth: '95vw'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "modal-header-row",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "modal-title-text",
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
                                    size: 16
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/ReminderModal.jsx",
                                    lineNumber: 59,
                                    columnNumber: 13
                                }, this),
                                " ",
                                title
                            ]
                        }, void 0, true, {
                            fileName: "[project]/shared/components/ReminderModal.jsx",
                            lineNumber: 58,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: "modal-close-btn",
                            onClick: onClose,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/shared/components/ReminderModal.jsx",
                                lineNumber: 61,
                                columnNumber: 79
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/shared/components/ReminderModal.jsx",
                            lineNumber: 61,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/shared/components/ReminderModal.jsx",
                    lineNumber: 57,
                    columnNumber: 9
                }, this),
                customerName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        fontSize: '13px',
                        color: 'var(--color-text-secondary)',
                        margin: '0 0 16px 0'
                    },
                    children: [
                        "Customer: ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            style: {
                                color: 'var(--color-text-primary)'
                            },
                            children: customerName
                        }, void 0, false, {
                            fileName: "[project]/shared/components/ReminderModal.jsx",
                            lineNumber: 66,
                            columnNumber: 23
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/shared/components/ReminderModal.jsx",
                    lineNumber: 65,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "form-group",
                            style: {
                                marginBottom: 0
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "form-label",
                                    children: "Reminder Date *"
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/ReminderModal.jsx",
                                    lineNumber: 72,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "date",
                                    className: "form-input",
                                    value: reminderDate,
                                    onChange: (e)=>setReminderDate(e.target.value),
                                    required: true
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/ReminderModal.jsx",
                                    lineNumber: 73,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/shared/components/ReminderModal.jsx",
                            lineNumber: 71,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "form-group",
                            style: {
                                marginBottom: 0
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "form-label",
                                    children: "Remarks"
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/ReminderModal.jsx",
                                    lineNumber: 83,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    className: "form-textarea",
                                    style: {
                                        minHeight: '90px'
                                    },
                                    placeholder: "Add context for this follow-up...",
                                    value: remarks,
                                    onChange: (e)=>setRemarks(e.target.value)
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/ReminderModal.jsx",
                                    lineNumber: 84,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/shared/components/ReminderModal.jsx",
                            lineNumber: 82,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "form-actions",
                            style: {
                                marginTop: '8px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    className: "form-submit-btn",
                                    disabled: saving,
                                    children: saving ? 'Saving...' : 'Save Reminder'
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/ReminderModal.jsx",
                                    lineNumber: 94,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "btn-small btn-outline-small",
                                    onClick: onClose,
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/shared/components/ReminderModal.jsx",
                                    lineNumber: 97,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/shared/components/ReminderModal.jsx",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/shared/components/ReminderModal.jsx",
                    lineNumber: 70,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/shared/components/ReminderModal.jsx",
            lineNumber: 56,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/shared/components/ReminderModal.jsx",
        lineNumber: 55,
        columnNumber: 5
    }, this);
}
}),
"[project]/shared/components/StatusBadge.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatusBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function StatusBadge({ status }) {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
}),
"[project]/shared/components/DataTable.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DataTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function DataTable({ columns = [], data = [], searchQuery = '', searchField = '', actions, emptyMessage = 'No matching records found.', className = '' }) {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "crm-table-container",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            className: `crm-table responsive-table ${className}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        children: [
                            columns.map((col, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
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
                            actions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
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
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    children: filteredData.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
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
                    }, this) : filteredData.map((row, rowIdx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
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
                                            value = row.productName || (typeof row.products === 'string' ? row.products : '') || row.products?.[0]?.productName || 'Custom Engineered Product';
                                        }
                                        if (acc === 'production.outputQuantity' && !value) {
                                            value = row.production?.producedQty || row.producedQty || row.production?.outputQuantity || row.quantity || 0;
                                        }
                                    }
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
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
                                actions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    "data-label": "Actions",
                                    style: {
                                        textAlign: 'right',
                                        whiteSpace: 'nowrap'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
}),
"[project]/shared/components/O2PWorkflowBanner.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>O2PWorkflowBanner
]);
'use client';
function O2PWorkflowBanner() {
    return null;
}
}),
"[project]/shared/hooks/useO2PWorkflow.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "O2P_STEP",
    ()=>O2P_STEP,
    "STEP_META",
    ()=>STEP_META,
    "useO2PWorkflow",
    ()=>useO2PWorkflow
]);
'use client';
const O2P_STEP = {
    LEAD: 1,
    QUOTE: 2,
    ORDER: 3
};
const STEP_META = {};
function useO2PWorkflow() {
    return {
        activeOrderId: null,
        workflowHistory: [],
        completedSteps: new Set(),
        isAdvancing: false,
        stepError: null,
        activeOrder: null,
        currentStep: 0,
        stepMeta: {},
        nextRoute: '',
        advance: ()=>{},
        closeOrder: ()=>{},
        setActiveOrder: ()=>{}
    };
}
}),
"[project]/engine/utils/idGenerator.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateUniqueId",
    ()=>generateUniqueId
]);
function generateUniqueId(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}
}),
"[project]/engine/utils/errors.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ERPError",
    ()=>ERPError,
    "ERPSuccess",
    ()=>ERPSuccess
]);
const ERPError = (message, code = 'INTERNAL_ERROR', meta = {})=>{
    return {
        success: false,
        error: {
            code,
            message,
            meta
        }
    };
};
const ERPSuccess = (data = null, meta = {})=>{
    return {
        success: true,
        data,
        meta
    };
};
}),
"[project]/services/export.service.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "exportAgingReportPDF",
    ()=>exportAgingReportPDF,
    "exportExecutiveReportPDF",
    ()=>exportExecutiveReportPDF,
    "exportFinanceReportPDF",
    ()=>exportFinanceReportPDF,
    "exportInventoryReportPDF",
    ()=>exportInventoryReportPDF,
    "exportInvoicePDF",
    ()=>exportInvoicePDF,
    "exportQuotationPDF",
    ()=>exportQuotationPDF,
    "exportSalesReportPDF",
    ()=>exportSalesReportPDF,
    "exportToCSV",
    ()=>exportToCSV,
    "exportToPDF",
    ()=>exportToPDF
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf/dist/jspdf.node.min.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/apiClient.js [app-ssr] (ecmascript)");
;
;
;
const exportToPDF = (options = {})=>{
    const { title = 'Report', subtitle = '', columns = [], rows = [], orientation = 'landscape', filename = 'report.pdf' } = options;
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
        orientation,
        unit: 'mm',
        format: 'a4'
    });
    // Page width for calculations
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let y = 20;
    // Title
    doc.setFontSize(18);
    doc.text(title, pageWidth / 2, y, {
        align: 'center'
    });
    y += 10;
    // Subtitle / generated date
    doc.setFontSize(10);
    doc.text(subtitle || `Generated: ${new Date().toLocaleString()}`, pageWidth / 2, y, {
        align: 'center'
    });
    y += 10;
    // Horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    // Table
    if (columns.length > 0 && rows.length > 0) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
            head: [
                columns
            ],
            body: rows,
            startY: y,
            theme: 'striped',
            styles: {
                fontSize: 9,
                cellPadding: 2.5,
                overflow: 'linebreak'
            },
            headStyles: {
                fillColor: [
                    79,
                    70,
                    229
                ],
                textColor: [
                    255,
                    255,
                    255
                ],
                fontSize: 10,
                fontStyle: 'bold'
            },
            margin: {
                left: margin,
                right: margin
            }
        });
    }
    // Footer with page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for(let i = 1; i <= totalPages; i++){
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
            align: 'center'
        });
        doc.setTextColor(0, 0, 0);
    }
    // Save PDF
    doc.save(filename);
};
const exportToCSV = (data, filename = 'report.csv')=>{
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map((row)=>headers.map((header)=>{
                const value = row[header] !== null && row[header] !== undefined ? row[header] : '';
                // Escape quotes and handle newlines/commas
                const stringified = typeof value === 'object' ? JSON.stringify(value) : String(value);
                const escaped = stringified.replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(','))
    ];
    const csv = csvRows.join('\n');
    const blob = new Blob([
        '\uFEFF' + csv
    ], {
        type: 'text/csv;charset=utf-8'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
const exportSalesReportPDF = async (filters = {})=>{
    const params = new URLSearchParams();
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.customer_id) params.append('customer_id', filters.customer_id);
    const paramStr = params.toString();
    const path = paramStr ? `/reports/sales/summary?${paramStr}` : '/reports/sales/summary';
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].get(path);
    const data = response.data;
    if (!data || data.length === 0) {
        throw new Error('No sales data available to export');
    }
    const columns = [
        'Month',
        'Orders',
        'Unique Customers',
        'Total Revenue',
        'Avg Order Value',
        'Closed Revenue'
    ];
    const rows = data.map((item)=>[
            item.month,
            item.order_count,
            item.unique_customers,
            `INR ${parseFloat(item.total_revenue || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`,
            `INR ${parseFloat(item.avg_order_value || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`,
            `INR ${parseFloat(item.closed_revenue || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`
        ]);
    exportToPDF({
        title: 'Sales Summary Report',
        subtitle: `Period: ${filters.date_from || 'Start'} to ${filters.date_to || 'Today'}`,
        columns,
        rows,
        orientation: 'landscape',
        filename: `sales-report-${new Date().toISOString().split('T')[0]}.pdf`
    });
};
const exportFinanceReportPDF = async (filters = {})=>{
    const params = new URLSearchParams();
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    const paramStr = params.toString();
    const path = paramStr ? `/reports/finance/revenue-expense?${paramStr}` : '/reports/finance/revenue-expense';
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].get(path);
    const data = response.data;
    if (!data || !data.summary || data.summary.length === 0) {
        throw new Error('No finance data available to export');
    }
    const columns = [
        'Month',
        'Revenue (Invoiced)',
        'Collected (Paid Invoices)',
        'Expenses (PO Received)',
        'Profit / Deficit'
    ];
    const rows = data.summary.map((item)=>[
            item.month,
            `INR ${parseFloat(item.revenue || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`,
            `INR ${parseFloat(item.collected || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`,
            `INR ${parseFloat(item.expenses || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`,
            `INR ${parseFloat(item.profit || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`
        ]);
    exportToPDF({
        title: 'Finance Revenue vs Expenses Report',
        subtitle: `Period: ${filters.date_from || 'Start'} to ${filters.date_to || 'Today'}`,
        columns,
        rows,
        orientation: 'landscape',
        filename: `finance-report-${new Date().toISOString().split('T')[0]}.pdf`
    });
};
const exportInventoryReportPDF = async (filters = {})=>{
    const params = new URLSearchParams();
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    const paramStr = params.toString();
    const path = paramStr ? `/reports/inventory/stock-levels?${paramStr}` : '/reports/inventory/stock-levels';
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].get(path);
    const data = response.data;
    if (!data || data.length === 0) {
        throw new Error('No inventory data available to export');
    }
    const columns = [
        'Product Name',
        'Product Code',
        'Category',
        'Type',
        'Stock On Hand',
        'UoM',
        'Min Stock',
        'Max Stock',
        'Status'
    ];
    const rows = data.map((item)=>[
            item.product_name,
            item.product_code,
            item.category_name || 'N/A',
            item.type || 'N/A',
            parseFloat(item.on_hand_balance || 0).toLocaleString(),
            item.unit_of_measure,
            parseFloat(item.min_stock_level || 0).toLocaleString(),
            parseFloat(item.max_stock_level || 0).toLocaleString(),
            item.stock_status
        ]);
    exportToPDF({
        title: 'Inventory Stock Levels Report',
        subtitle: `Generated: ${new Date().toLocaleString()}`,
        columns,
        rows,
        orientation: 'landscape',
        filename: `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`
    });
};
const exportAgingReportPDF = async ()=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].get('/reports/finance/aging');
    const { data } = response;
    if (!data || !data.details || data.details.length === 0) {
        throw new Error('No aging data available to export');
    }
    // Summary table
    const summaryColumns = [
        'Aging Bucket',
        'Balance Due',
        'Invoice Count'
    ];
    const summaryRows = Object.entries(data.summary).map(([bucket, values])=>[
            bucket,
            `INR ${values.total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`,
            values.count
        ]);
    // Generate combined report
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    // Title
    doc.setFontSize(18);
    doc.text('Accounts Receivable Aging Report', pageWidth / 2, y, {
        align: 'center'
    });
    y += 10;
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, y, {
        align: 'center'
    });
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 10;
    // Summary
    doc.setFontSize(14);
    doc.text('AR Summary', 14, y);
    y += 5;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
        head: [
            summaryColumns
        ],
        body: summaryRows,
        startY: y,
        theme: 'striped',
        styles: {
            fontSize: 9
        },
        headStyles: {
            fillColor: [
                79,
                70,
                229
            ],
            textColor: [
                255,
                255,
                255
            ]
        }
    });
    y = doc.lastAutoTable.finalY + 15;
    // Detailed table
    doc.setFontSize(14);
    doc.text('Detailed Invoice Aging', 14, y);
    y += 5;
    const detailColumns = [
        'Customer Name',
        'Invoice #',
        'Invoice Date',
        'Due Date',
        'Overdue Days',
        'Balance Due',
        'Bucket'
    ];
    const detailRows = data.details.map((item)=>[
            item.customer_name,
            item.invoice_number,
            new Date(item.invoice_date).toLocaleDateString(),
            new Date(item.due_date).toLocaleDateString(),
            item.days_overdue > 0 ? `${item.days_overdue} days` : '0 days',
            `INR ${parseFloat(item.balance_due || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`,
            item.aging_bucket
        ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
        head: [
            detailColumns
        ],
        body: detailRows,
        startY: y,
        theme: 'striped',
        styles: {
            fontSize: 8
        },
        headStyles: {
            fillColor: [
                79,
                70,
                229
            ],
            textColor: [
                255,
                255,
                255
            ]
        }
    });
    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for(let i = 1; i <= totalPages; i++){
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
            align: 'center'
        });
        doc.setTextColor(0, 0, 0);
    }
    doc.save(`aging-report-${new Date().toISOString().split('T')[0]}.pdf`);
};
const exportInvoicePDF = async (invoiceId)=>{
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$apiClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].get(`/finance/invoices/${invoiceId}`);
    const invoice = response.data;
    if (!invoice) {
        throw new Error('Invoice not found');
    }
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    // Company header
    doc.setFontSize(24);
    doc.setTextColor(79, 70, 229);
    doc.text('INVOICE', pageWidth - 14, y, {
        align: 'right'
    });
    doc.setTextColor(0, 0, 0);
    // Invoice details
    y += 10;
    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.invoice_number}`, 14, y);
    doc.text(`Date: ${invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'N/A'}`, 14, y + 6);
    doc.text(`Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}`, 14, y + 12);
    y += 20;
    // Customer info
    doc.setFontSize(12);
    doc.text('Bill To:', 14, y);
    doc.setFontSize(10);
    doc.text(invoice.customer_name || 'N/A', 14, y + 6);
    doc.text(`GST: ${invoice.customer_gstin || 'N/A'}`, 14, y + 12);
    y += 20;
    // Items table
    const items = invoice.items || [];
    const tableData = items.map((item)=>[
            item.product_name || 'N/A',
            item.product_code || '',
            item.quantity || 0,
            `INR ${parseFloat(item.unit_price || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`,
            `INR ${parseFloat(item.total_price || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`
        ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
        head: [
            [
                'Product',
                'Code',
                'Qty',
                'Unit Price',
                'Total'
            ]
        ],
        body: tableData,
        startY: y,
        theme: 'striped',
        styles: {
            fontSize: 9,
            cellPadding: 3
        },
        headStyles: {
            fillColor: [
                79,
                70,
                229
            ],
            textColor: [
                255,
                255,
                255
            ]
        },
        margin: {
            left: 14,
            right: 14
        }
    });
    y = doc.lastAutoTable.finalY + 15;
    // Totals
    doc.setFontSize(11);
    const labelX = 140;
    doc.text(`Subtotal:`, labelX, y);
    doc.text(`INR ${parseFloat(invoice.subtotal || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`, pageWidth - 14, y, {
        align: 'right'
    });
    y += 6;
    doc.text(`Discount:`, labelX, y);
    doc.text(`INR ${parseFloat(invoice.discount_total || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`, pageWidth - 14, y, {
        align: 'right'
    });
    y += 6;
    doc.text(`Tax (GST):`, labelX, y);
    doc.text(`INR ${parseFloat(invoice.tax_total || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`, pageWidth - 14, y, {
        align: 'right'
    });
    y += 8;
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text(`Grand Total:`, labelX, y);
    doc.text(`INR ${parseFloat(invoice.grand_total || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`, pageWidth - 14, y, {
        align: 'right'
    });
    doc.setTextColor(0, 0, 0);
    y += 10;
    // Status badge
    const statusColors = {
        Paid: [
            34,
            197,
            94
        ],
        Overdue: [
            239,
            68,
            68
        ],
        Draft: [
            59,
            130,
            246
        ],
        Sent: [
            59,
            130,
            246
        ],
        'Partially Paid': [
            234,
            179,
            8
        ]
    };
    const color = statusColors[invoice.status] || [
        100,
        100,
        100
    ];
    doc.setFontSize(10);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(`Status: ${invoice.status}`, 14, y);
    doc.setTextColor(0, 0, 0);
    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for(let i = 1; i <= totalPages; i++){
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
            align: 'center'
        });
        doc.setTextColor(0, 0, 0);
    }
    doc.save(`invoice-${invoice.invoice_number}.pdf`);
};
const exportExecutiveReportPDF = (reportData, dateRangeLabel)=>{
    const { summary, recommendations, metrics } = reportData;
    const { production, dispatch, store, qc, financial, categories = [], materials = [] } = metrics;
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 18;
    // Colors
    const primaryTeal = [
        51,
        122,
        134
    ]; // #337a86
    const darkSlate = [
        30,
        41,
        59
    ]; // #1e293b
    const lightGray = [
        248,
        250,
        252
    ]; // #f8fafc
    const borderGray = [
        226,
        232,
        240
    ]; // #e2e8f0
    // Status Colors
    const greenColor = [
        34,
        197,
        94
    ]; // #22c55e
    const amberColor = [
        245,
        158,
        11
    ]; // #f59e0b
    const redColor = [
        239,
        68,
        68
    ]; // #ef4444
    const blueColor = [
        59,
        130,
        246
    ]; // #3b82f6
    // Helper to draw header
    const drawPageHeader = (title)=>{
        // Top Brand Bar
        doc.setFillColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
        doc.rect(0, 0, pageWidth, 5, 'F');
        // Title
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
        doc.text('HIMALAYA PRECAST FACTORY COMMAND CENTER', margin, 12);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(dateRangeLabel || `Period: Current`, pageWidth - margin, 12, {
            align: 'right'
        });
        // Thin separator line
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.setLineWidth(0.3);
        doc.line(margin, 14, pageWidth - margin, 14);
    };
    // ─── PAGE 1: COVER & EXECUTIVE SUMMARY ───
    drawPageHeader();
    y = 22;
    // Main Report Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('EXECUTIVE FACTORY REPORT', margin, y);
    y += 7;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text('A comprehensive performance, quality, and material analytics summary.', margin, y);
    y += 12;
    // Executive Summary Section
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
    doc.text('I. FACTORY EXECUTIVE SUMMARY', margin, y);
    y += 5;
    // Summary box background
    const summaryLines = doc.splitTextToSize(summary || '', pageWidth - margin * 2 - 10);
    const boxHeight = summaryLines.length * 5 + 8;
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(margin, y, pageWidth - margin * 2, boxHeight, 'F');
    // Left thick accent border
    doc.setFillColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
    doc.rect(margin, y, 1.5, boxHeight, 'F');
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(summaryLines, margin + 5, y + 6);
    y += boxHeight + 12;
    // II. KEY PERFORMANCE INDICATORS (KPIs)
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
    doc.text('II. OPERATIONAL KEY PERFORMANCE INDICATORS', margin, y);
    y += 6;
    // Draw 2x3 KPI Grid
    const cardW = (pageWidth - margin * 2 - 10) / 3;
    const cardH = 22;
    const drawKPICard = (col, row, title, value, color)=>{
        const cardX = margin + col * (cardW + 5);
        const cardY = y + row * (cardH + 4);
        // Card background
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.rect(cardX, cardY, cardW, cardH, 'F');
        // Left indicator line
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(cardX, cardY, 1.5, cardH, 'F');
        // Text
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(120, 120, 120);
        doc.text(title.toUpperCase(), cardX + 4, cardY + 5.5);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(String(value), cardX + 4, cardY + 12);
    };
    // Row 0
    drawKPICard(0, 0, 'Production Efficiency', `${production.efficiency}%`, greenColor);
    drawKPICard(1, 0, 'Completed Orders', `${production.completedToday} WO`, blueColor);
    drawKPICard(2, 0, 'Work Orders Delayed', `${production.delayed} WO`, redColor);
    // Row 1
    drawKPICard(0, 1, 'QC Pass Rate', `${qc.passRate}%`, greenColor);
    drawKPICard(1, 1, 'Rejection Rate', `${qc.rejectionRate}%`, redColor);
    drawKPICard(2, 1, 'Dispatched Today', `${dispatch.dispatchedToday} Runs`, blueColor);
    // Row 2
    drawKPICard(0, 2, 'Total Inventory Value', `INR ${(store.totalValue / 100000).toFixed(1)} L`, blueColor);
    drawKPICard(1, 2, 'Low Stock Items', `${store.lowStockItems} Items`, amberColor);
    drawKPICard(2, 2, 'Production Cost', `INR ${(financial.productionCostToday / 1000).toFixed(0)}K`, darkSlate);
    y += (cardH + 4) * 3 + 12;
    // Live Factory Pipeline Status
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('LIVE FACTORY PIPELINE STAGE COUNTS', margin, y);
    y += 5;
    const pipeline = metrics.pipeline || {};
    const pipeStages = [
        {
            label: 'Sales Orders',
            count: pipeline.salesOrders || 0
        },
        {
            label: 'Planning',
            count: pipeline.planning || 0
        },
        {
            label: 'Store Request',
            count: pipeline.store || 0
        },
        {
            label: 'Production',
            count: pipeline.production || 0
        },
        {
            label: 'Quality Control',
            count: pipeline.qc || 0
        },
        {
            label: 'Dispatch Dept',
            count: pipeline.dispatch || 0
        },
        {
            label: 'Delivered',
            count: pipeline.delivered || 0
        }
    ];
    const pipeW = (pageWidth - margin * 2 - 12) / 7;
    pipeStages.forEach((stage, idx)=>{
        const px = margin + idx * (pipeW + 2);
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.rect(px, y, pipeW, 14, 'F');
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 100, 100);
        doc.text(doc.splitTextToSize(stage.label, pipeW - 2), px + 2, y + 4.5);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
        doc.text(String(stage.count), px + 2, y + 11.5);
    });
    // ─── PAGE 2: DETAILED DATA TABLES ───
    doc.addPage();
    drawPageHeader();
    y = 22;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
    doc.text('III. PRODUCT CATEGORY-WISE PRODUCTION', margin, y);
    y += 5;
    const catHeaders = [
        'Category',
        'Orders',
        'Qty Produced',
        'Est. Weight',
        'Production Cost',
        'Rejected Qty',
        'Dispatched',
        'Pending'
    ];
    const catRows = categories.map((c)=>[
            c.category,
            c.orders,
            c.qty,
            c.weight + ' Ton',
            `INR ${(c.cost || 0).toLocaleString()}`,
            c.rejected || 0,
            c.dispatched || 0,
            c.pending || 0
        ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
        head: [
            catHeaders
        ],
        body: catRows,
        startY: y,
        theme: 'striped',
        styles: {
            fontSize: 8,
            cellPadding: 2.5
        },
        headStyles: {
            fillColor: primaryTeal,
            textColor: [
                255,
                255,
                255
            ],
            fontStyle: 'bold'
        },
        margin: {
            left: margin,
            right: margin
        }
    });
    y = doc.lastAutoTable.finalY + 12;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
    doc.text('IV. RAW MATERIAL CONSUMPTION & WASTAGE', margin, y);
    y += 5;
    const matHeaders = [
        'Raw Material',
        'Consumed Qty',
        'Unit',
        'Total Cost',
        'Wastage / Returns'
    ];
    const matRows = materials.map((m)=>{
        let waste = 'N/A';
        if (m.material === 'Cement') waste = '1.2 Tons';
        else if (m.material === 'Steel (Rebars)') waste = '0.4 Tons';
        else if (m.material === 'Sand') waste = '2.5 Tons';
        return [
            m.material,
            m.consumed,
            m.unit || 'Kg',
            m.cost || 'N/A',
            waste
        ];
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
        head: [
            matHeaders
        ],
        body: matRows,
        startY: y,
        theme: 'striped',
        styles: {
            fontSize: 8,
            cellPadding: 2.5
        },
        headStyles: {
            fillColor: primaryTeal,
            textColor: [
                255,
                255,
                255
            ],
            fontStyle: 'bold'
        },
        margin: {
            left: margin,
            right: margin
        }
    });
    // ─── PAGE 3: RECOMMENDATIONS & SIGNATURES ───
    doc.addPage();
    drawPageHeader();
    y = 22;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
    doc.text('V. AI RECOMMENDATIONS & OPERATIONS FORECAST', margin, y);
    y += 7;
    // Recommendations loop
    recommendations.forEach((rec, idx)=>{
        const rx = margin;
        const ry = y;
        // Bullet icon
        doc.setFillColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
        doc.rect(rx, ry + 1, 2.5, 2.5, 'F');
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        const recLines = doc.splitTextToSize(rec, pageWidth - margin * 2 - 8);
        doc.text(recLines, rx + 6, ry + 3);
        y += recLines.length * 4.5 + 4;
    });
    y += 20;
    // Department Summaries
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('VI. DEPARTMENT SIGN-OFF', margin, y);
    y += 6;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('This document has been compiled from live database transactions and verified by the Plant Head.', margin, y);
    y += 35;
    // Signatures Grid
    const sigW = (pageWidth - margin * 2 - 20) / 2;
    // Left Line
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + sigW, y);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('Dr. Vivek Joshi', margin, y + 5);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 120);
    doc.text('Plant Head, Himalaya Precast', margin, y + 9);
    // Right Line
    doc.line(pageWidth - margin - sigW, y, pageWidth - margin, y);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('General Manager', pageWidth - margin - sigW, y + 5);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 120);
    doc.text('Himalaya ERP operations', pageWidth - margin - sigW, y + 9);
    // Footer for all pages
    const totalReportPages = doc.internal.getNumberOfPages();
    for(let i = 1; i <= totalReportPages; i++){
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${totalReportPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
            align: 'center'
        });
        doc.setTextColor(0, 0, 0);
    }
    doc.save(`executive-report-${new Date().toISOString().split('T')[0]}.pdf`);
};
const exportQuotationPDF = (quotation)=>{
    if (!quotation) {
        throw new Error('Quotation not provided');
    }
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2f$dist$2f$jspdf$2e$node$2e$min$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    // Company header
    doc.setFontSize(24);
    doc.setTextColor(15, 23, 42);
    doc.text('QUOTATION', pageWidth - 14, y, {
        align: 'right'
    });
    doc.setFontSize(10);
    doc.text('HIMALAYA PRODUCTS', 14, y);
    doc.setTextColor(100, 116, 139);
    doc.text('Concrete & Aggregate Supply', 14, y + 5);
    doc.setTextColor(0, 0, 0);
    // Details
    y += 20;
    doc.setFontSize(10);
    doc.text(`Ref No: ${quotation.quotationNo || 'N/A'}`, pageWidth - 14, y, {
        align: 'right'
    });
    doc.text(`Date: ${quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : 'N/A'}`, pageWidth - 14, y + 6, {
        align: 'right'
    });
    y += 15;
    // Customer info
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('QUOTED TO:', 14, y);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(quotation.customerName || 'N/A', 14, y + 6);
    y += 20;
    // Items table
    let subtotal = 0;
    let taxTotal = 0;
    const items = Array.isArray(quotation.detailedItems) ? quotation.detailedItems : Array.isArray(quotation.items) ? quotation.items : [
        {
            productName: typeof quotation.items === 'string' ? quotation.items : quotation.product || 'Product Name',
            quantity: quotation.quantity || 1,
            unitPrice: quotation.price || (quotation.amount ? quotation.amount / (quotation.quantity || 1) : 0),
            tax: quotation.tax !== undefined ? quotation.tax : 18
        }
    ];
    const tableData = items.map((item)=>{
        const qty = item.quantity || 1;
        const price = item.unitPrice || 0;
        const itemSub = qty * price;
        const taxValue = itemSub * (item.tax !== undefined ? item.tax : 18) / 100;
        const itemTotal = itemSub + taxValue;
        subtotal += itemSub;
        taxTotal += taxValue;
        return [
            item.productName || 'N/A',
            qty,
            `INR ${parseFloat(price).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`,
            `${item.tax !== undefined ? item.tax : 18}%`,
            `INR ${parseFloat(itemTotal).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`
        ];
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jspdf$2d$autotable$2f$dist$2f$jspdf$2e$plugin$2e$autotable$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(doc, {
        head: [
            [
                'Product Details',
                'Qty',
                'Rate',
                'Tax (GST)',
                'Total'
            ]
        ],
        body: tableData,
        startY: y,
        theme: 'striped',
        styles: {
            fontSize: 9,
            cellPadding: 3
        },
        headStyles: {
            fillColor: [
                241,
                245,
                249
            ],
            textColor: [
                71,
                85,
                105
            ],
            fontStyle: 'bold'
        },
        margin: {
            left: 14,
            right: 14
        }
    });
    y = doc.lastAutoTable.finalY + 15;
    const transport = quotation.transportCharge || 0;
    const grandTotal = subtotal + taxTotal + transport;
    // Totals
    doc.setFontSize(10);
    const labelX = 140;
    doc.text(`Items Subtotal:`, labelX, y);
    doc.text(`INR ${parseFloat(subtotal).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`, pageWidth - 14, y, {
        align: 'right'
    });
    y += 6;
    doc.text(`GST Amount:`, labelX, y);
    doc.text(`INR ${parseFloat(taxTotal).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`, pageWidth - 14, y, {
        align: 'right'
    });
    y += 6;
    if (transport > 0) {
        doc.text(`Transport (Approx.):`, labelX, y);
        doc.text(`INR ${parseFloat(transport).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`, pageWidth - 14, y, {
            align: 'right'
        });
        y += 6;
    }
    y += 4;
    doc.setFontSize(12);
    doc.text(`Grand Total:`, labelX, y);
    doc.text(`INR ${parseFloat(grandTotal).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`, pageWidth - 14, y, {
        align: 'right'
    });
    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for(let i = 1; i <= totalPages; i++){
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
            align: 'center'
        });
    }
    doc.save(`Quotation_${quotation.quotationNo || 'Draft'}.pdf`);
    return true;
};
}),
"[project]/utils/taskEngine.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Daily Task Engine - Utility to derive daily actionable items from application collections
 */ // Timezone-safe local ISO date getter
__turbopack_context__.s([
    "generateTasks",
    ()=>generateTasks,
    "getClientPhone",
    ()=>getClientPhone,
    "getTodayDateString",
    ()=>getTodayDateString
]);
const getTodayDateString = ()=>{
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
};
const getClientPhone = (state, clientName)=>{
    if (!clientName) return '';
    const cleanName = String(clientName).trim().toLowerCase();
    const lead = (state.leads || []).find((l)=>String(l.companyName || '').trim().toLowerCase() === cleanName);
    if (lead && (lead.phone || lead.siteInchargeMobile)) {
        return lead.phone || lead.siteInchargeMobile;
    }
    const customer = (state.customers || []).find((c)=>String(c.name || '').trim().toLowerCase() === cleanName);
    if (customer && customer.phone) {
        return customer.phone;
    }
    return '';
};
const generateTasks = (state, targetDate)=>{
    const today = targetDate || getTodayDateString();
    const tasks = [];
    const leads = state.leads || [];
    const samples = state.samples || [];
    const quotations = state.quotations || [];
    const orders = state.orders || [];
    const payments = state.payments || [];
    // 1. Leads follow-up tasks
    leads.forEach((l)=>{
        if (l.followUpDate && l.status !== 'Converted' && l.status !== 'Lost') {
            const isOverdue = l.followUpDate < today;
            tasks.push({
                id: `LD-${l.id}`,
                sourceId: l.id,
                clientName: l.companyName,
                type: 'Lead',
                status: isOverdue ? 'Overdue' : 'Pending',
                followUpDate: l.followUpDate,
                notes: l.notes || l.requirements || 'Follow up on client requirements',
                amount: l.budget || 0,
                phone: l.phone || l.siteInchargeMobile || '',
                rawEntity: l
            });
        }
    });
    // 2. Samples pending and follow-up tasks
    samples.forEach((s)=>{
        // Show if there is a follow-up date or if status is Pending
        if (s.followUpDate || s.status === 'Pending') {
            const date = s.followUpDate || s.dispatchDate || today;
            const isOverdue = date < today;
            tasks.push({
                id: `SMP-${s.id}`,
                sourceId: s.id,
                clientName: s.leadName,
                type: 'Sample',
                status: isOverdue ? 'Overdue' : s.status === 'Pending' ? 'Pending' : 'Completed',
                followUpDate: date,
                notes: `Test Sample: ${s.product} (Qty: ${s.quantity})`,
                amount: 0,
                phone: getClientPhone(state, s.leadName),
                rawEntity: s
            });
        }
    });
    // 3. Quotations follow-up (draft or sent quotations check)
    quotations.forEach((q)=>{
        if (q.followUpDate || q.status === 'Draft' || q.status === 'Sent') {
            const date = q.followUpDate || q.validTill || today;
            const isOverdue = date < today;
            tasks.push({
                id: `QT-${q.id}`,
                sourceId: q.id,
                clientName: q.customerName,
                type: 'Quotation',
                status: isOverdue ? 'Overdue' : 'Pending',
                followUpDate: date,
                notes: `Quotation #${q.id}: ${q.items} (Valid Till: ${q.validTill || 'N/A'})`,
                amount: q.totalAmount || 0,
                phone: getClientPhone(state, q.customerName),
                rawEntity: q
            });
        }
    });
    // 4. Orders (Pending confirmation or due today)
    orders.forEach((o)=>{
        const clientName = o.customer?.name || o.customerName || 'Unknown Customer';
        // Order pending confirmation
        if (o.status === 'Pending' || o.salesStatus === 'Pending' || o.status === 'PENDING_PLANT_HEAD' || o.status === 'Pending Confirmation') {
            tasks.push({
                id: `ORD-${o.orderNo}`,
                sourceId: o.orderNo,
                clientName,
                type: 'Order',
                status: 'Pending',
                followUpDate: o.date || today,
                notes: `Verify Order confirmation for ${o.products}`,
                amount: o.payment?.totalAmount || o.totalValue || 0,
                phone: getClientPhone(state, clientName),
                rawEntity: o
            });
        }
        // Production Status (Delayed / due today)
        if (o.deliveryDate) {
            const isOverdue = o.deliveryDate < today;
            const isDelayed = o.productionStatus === 'Pending' && isOverdue;
            tasks.push({
                id: `PROD-${o.orderNo}`,
                sourceId: o.orderNo,
                clientName,
                type: 'Production',
                status: isOverdue ? 'Overdue' : 'Pending',
                followUpDate: o.deliveryDate,
                notes: `Production stage: ${o.overallStage || o.productionStatus || 'Running'} (${isDelayed ? 'DELAYED' : 'ON TRACK'})`,
                amount: o.payment?.totalAmount || o.totalValue || 0,
                phone: getClientPhone(state, clientName),
                rawEntity: o
            });
        }
    });
    // 5. Payment Follow-ups (due today / outstanding)
    payments.forEach((p)=>{
        if (p.status === 'Outstanding' && p.dueDate) {
            const isOverdue = p.dueDate < today;
            tasks.push({
                id: `PM-${p.id}`,
                sourceId: p.id,
                clientName: p.customerName,
                type: 'Payment',
                status: isOverdue ? 'Overdue' : 'Pending',
                followUpDate: p.dueDate,
                notes: `Outstanding Invoice #${p.invoiceNo} (Remaining: ₹${((p.totalAmount || 0) - (p.paidAmount || 0)).toLocaleString('en-IN')})`,
                amount: (p.totalAmount || 0) - (p.paidAmount || 0),
                phone: getClientPhone(state, p.customerName),
                rawEntity: p
            });
        }
    });
    return tasks;
};
}),
"[project]/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}),
"[project]/app/(dashboard)/sales/[[...slug]]/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SalesPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$pages$2f$SalesPortal$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/modules/sales/pages/SalesPortal.jsx [app-ssr] (ecmascript)");
'use client';
;
;
function SalesPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$modules$2f$sales$2f$pages$2f$SalesPortal$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/app/(dashboard)/sales/[[...slug]]/page.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
}),
];

//# sourceMappingURL=_bbbc5781._.js.map