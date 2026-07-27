(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/store/authStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAuthStore",
    ()=>useAuthStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
;
;
const useAuthStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set)=>({
        user: null,
        role: null,
        isAuthenticated: false,
        accessToken: null,
        login: (role, user, accessToken)=>set({
                role,
                user,
                accessToken,
                isAuthenticated: true
            }),
        setAccessToken: (token)=>set({
                accessToken: token,
                isAuthenticated: !!token
            }),
        logout: ()=>set({
                role: null,
                user: null,
                accessToken: null,
                isAuthenticated: false
            })
    }), {
    name: 'auth-storage',
    partialize: (state)=>({
            user: state.user,
            role: state.role
        })
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/login/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/authStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2d$round$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__KeyRound$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/key-round.mjs [app-client] (ecmascript) <export default as KeyRound>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mail.mjs [app-client] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.mjs [app-client] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.mjs [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.mjs [app-client] (ecmascript) <export default as EyeOff>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function getDefaultPath(role) {
    const map = {
        'SALES': '/sales/dashboard',
        'SALES_ADMIN': '/sales/dashboard',
        'PLANT_HEAD': '/plant-head/dashboard',
        'PRODUCTION': '/production/dashboard',
        'STORE': '/store/dashboard',
        'QC': '/qc/dashboard',
        'DISPATCH': '/dispatch/dashboard',
        'FINANCE': '/finance/dashboard',
        'FINANCE_EXECUTIVE': '/finance-executive/dashboard',
        'HR': '/hr/dashboard',
        'ADMIN': '/admin/dashboard',
        'SUPER_ADMIN': '/super-admin/dashboard'
    };
    // Also support friendly names from local roles
    const friendly = {
        'Sales': '/sales/dashboard',
        'Sales Admin': '/sales/dashboard',
        'Plant Head': '/plant-head/dashboard',
        'Production': '/production/dashboard',
        'Store': '/store/dashboard',
        'QC': '/qc/dashboard',
        'Dispatch': '/dispatch/dashboard',
        'Finance': '/finance/dashboard',
        'Finance Executive': '/finance-executive/dashboard',
        'HR': '/hr/dashboard',
        'Admin': '/admin/dashboard',
        'Super Admin': '/super-admin/dashboard'
    };
    return map[role] || friendly[role] || '/sales/dashboard';
}
/** Map backend role codes to friendly display strings */ function toFriendlyRole(code) {
    return code.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c)=>c.toUpperCase());
}
function LoginPage() {
    _s();
    const { login } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [showPass, setShowPass] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleLoginSubmit = async (e)=>{
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in both email and password fields.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/backend/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email.toLowerCase().trim(),
                    password
                })
            });
            const json = await res.json();
            if (!res.ok) {
                // NestJS sends 401 on bad credentials
                if (res.status === 401) {
                    throw new Error('Invalid email or password.');
                }
                if (res.status === 403) {
                    throw new Error('Your account has been disabled. Please contact your administrator.');
                }
                if (res.status === 504 || res.status === 503) {
                    throw new Error('Backend service is unavailable. Please try again shortly.');
                }
                throw new Error((json === null || json === void 0 ? void 0 : json.message) || 'Login failed. Please try again.');
            }
            const { accessToken, user } = json.data;
            if (!accessToken || !user) {
                throw new Error('Unexpected response from server. Please try again.');
            }
            const friendlyRole = toFriendlyRole(user.role);
            login(friendlyRole, {
                ...user,
                role: friendlyRole
            }, accessToken);
            const redirectPath = getDefaultPath(user.role);
            router.push(redirectPath);
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: "\n        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');\n\n        * { box-sizing: border-box; margin: 0; padding: 0; }\n\n        .login-root {\n          min-height: 100vh;\n          width: 100vw;\n          display: flex;\n          align-items: center;\n          justify-content: center;\n          background: linear-gradient(145deg, #EFF6FF 0%, #F0F9FF 40%, #E0F2FE 70%, #EEF2FF 100%);\n          padding: 20px;\n          font-family: 'Outfit', sans-serif;\n          position: relative;\n          overflow: hidden;\n        }\n\n        .login-root::before {\n          content: '';\n          position: fixed;\n          top: -120px;\n          right: -120px;\n          width: 500px;\n          height: 500px;\n          background: radial-gradient(circle, rgba(59,174,235,0.12) 0%, transparent 70%);\n          border-radius: 50%;\n          pointer-events: none;\n        }\n        .login-root::after {\n          content: '';\n          position: fixed;\n          bottom: -100px;\n          left: -100px;\n          width: 420px;\n          height: 420px;\n          background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%);\n          border-radius: 50%;\n          pointer-events: none;\n        }\n\n        .login-card {\n          width: 100%;\n          max-width: 440px;\n          background: #ffffff;\n          border-radius: 24px;\n          padding: 44px 40px;\n          box-shadow:\n            0 1px 3px rgba(0,0,0,0.04),\n            0 8px 32px rgba(47,67,117,0.08),\n            0 32px 64px rgba(47,67,117,0.06);\n          border: 1px solid rgba(226,232,240,0.8);\n          display: flex;\n          flex-direction: column;\n          gap: 28px;\n          position: relative;\n          z-index: 1;\n          animation: cardIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both;\n        }\n\n        @keyframes cardIn {\n          from { opacity: 0; transform: translateY(24px) scale(0.97); }\n          to   { opacity: 1; transform: translateY(0) scale(1); }\n        }\n\n        .login-label {\n          font-size: 11px;\n          font-weight: 700;\n          color: #94A3B8;\n          text-transform: uppercase;\n          letter-spacing: 0.06em;\n          margin-bottom: 2px;\n        }\n\n        .login-input-wrap {\n          position: relative;\n          display: flex;\n          align-items: center;\n        }\n\n        .login-icon {\n          position: absolute;\n          left: 14px;\n          color: #94A3B8;\n          pointer-events: none;\n          transition: color 0.2s;\n        }\n\n        .login-input {\n          width: 100%;\n          padding: 13px 14px 13px 42px;\n          background: #F8FAFD;\n          border: 1.5px solid #E2E8F0;\n          border-radius: 12px;\n          color: #1E293B;\n          font-size: 14px;\n          font-family: 'Outfit', sans-serif;\n          outline: none;\n          transition: all 0.2s;\n        }\n        .login-input::placeholder { color: #CBD5E1; }\n        .login-input:focus {\n          background: #FFFFFF;\n          border-color: #3BAEEB;\n          box-shadow: 0 0 0 3px rgba(59,174,235,0.12);\n        }\n        .login-input:focus + .login-icon,\n        .login-input-wrap:focus-within .login-icon {\n          color: #3BAEEB;\n        }\n\n        .login-input-pr { padding-right: 42px; }\n\n        .pass-toggle {\n          position: absolute;\n          right: 14px;\n          background: none;\n          border: none;\n          cursor: pointer;\n          color: #94A3B8;\n          display: flex;\n          align-items: center;\n          padding: 0;\n          transition: color 0.2s;\n        }\n        .pass-toggle:hover { color: #3BAEEB; }\n\n        .login-divider {\n          height: 1px;\n          background: linear-gradient(90deg, transparent 0%, #E2E8F0 50%, transparent 100%);\n        }\n\n        .login-btn {\n          width: 100%;\n          padding: 14px;\n          background: linear-gradient(135deg, #2F4375 0%, #3BAEEB 100%);\n          color: #fff;\n          border: none;\n          border-radius: 12px;\n          font-weight: 800;\n          font-size: 14.5px;\n          font-family: 'Outfit', sans-serif;\n          cursor: pointer;\n          display: flex;\n          align-items: center;\n          justify-content: center;\n          gap: 8px;\n          box-shadow: 0 4px 20px rgba(47,67,117,0.22);\n          transition: all 0.2s;\n          margin-top: 4px;\n        }\n        .login-btn:hover:not(:disabled) {\n          transform: translateY(-2px);\n          box-shadow: 0 8px 28px rgba(47,67,117,0.28);\n        }\n        .login-btn:active:not(:disabled) { transform: translateY(0); }\n        .login-btn:disabled { opacity: 0.65; cursor: not-allowed; }\n\n        .login-error {\n          background: #FFF5F5;\n          border: 1.5px solid #FECACA;\n          border-radius: 10px;\n          padding: 11px 16px;\n          color: #DC2626;\n          font-size: 13px;\n          font-weight: 500;\n          text-align: center;\n          line-height: 1.5;\n          animation: shake 0.35s ease;\n        }\n        @keyframes shake {\n          0%,100% { transform: translateX(0); }\n          25%      { transform: translateX(-6px); }\n          75%      { transform: translateX(6px); }\n        }\n\n        @media (max-width: 480px) {\n          .login-card { padding: 32px 24px; }\n        }\n      "
            }, void 0, false, {
                fileName: "[project]/app/login/page.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "login-root",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "login-card",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '8px',
                                textAlign: 'center'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    padding: '12px 28px',
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)',
                                    border: '1.5px solid #DBEAFE',
                                    marginBottom: '6px',
                                    boxShadow: '0 2px 8px rgba(47,67,117,0.06)'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    src: "/himalaya-logo-trimmed.png",
                                    alt: "Himalaya",
                                    width: 240,
                                    height: 80,
                                    style: {
                                        width: '190px',
                                        height: 'auto',
                                        objectFit: 'contain'
                                    },
                                    priority: true
                                }, void 0, false, {
                                    fileName: "[project]/app/login/page.tsx",
                                    lineNumber: 306,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/login/page.tsx",
                                lineNumber: 298,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/login/page.tsx",
                            lineNumber: 297,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "login-divider"
                        }, void 0, false, {
                            fileName: "[project]/app/login/page.tsx",
                            lineNumber: 317,
                            columnNumber: 11
                        }, this),
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "login-error",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/app/login/page.tsx",
                            lineNumber: 320,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleLoginSubmit,
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '18px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '7px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "login-label",
                                            children: "Email Address"
                                        }, void 0, false, {
                                            fileName: "[project]/app/login/page.tsx",
                                            lineNumber: 327,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "login-input-wrap",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                                                    size: 15,
                                                    className: "login-icon"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/login/page.tsx",
                                                    lineNumber: 329,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "email",
                                                    id: "login-email",
                                                    className: "login-input",
                                                    placeholder: "user@himalayaerp.local",
                                                    value: email,
                                                    onChange: (e)=>setEmail(e.target.value),
                                                    disabled: loading,
                                                    autoComplete: "email"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/login/page.tsx",
                                                    lineNumber: 330,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/login/page.tsx",
                                            lineNumber: 328,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/login/page.tsx",
                                    lineNumber: 326,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '7px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "login-label",
                                            children: "Password"
                                        }, void 0, false, {
                                            fileName: "[project]/app/login/page.tsx",
                                            lineNumber: 345,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "login-input-wrap",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2d$round$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__KeyRound$3e$__["KeyRound"], {
                                                    size: 15,
                                                    className: "login-icon"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/login/page.tsx",
                                                    lineNumber: 347,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: showPass ? 'text' : 'password',
                                                    id: "login-password",
                                                    className: "login-input login-input-pr",
                                                    placeholder: "••••••••••••",
                                                    value: password,
                                                    onChange: (e)=>setPassword(e.target.value),
                                                    disabled: loading,
                                                    autoComplete: "current-password"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/login/page.tsx",
                                                    lineNumber: 348,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "pass-toggle",
                                                    onClick: ()=>setShowPass((p)=>!p),
                                                    tabIndex: -1,
                                                    "aria-label": showPass ? 'Hide password' : 'Show password',
                                                    children: showPass ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                                        size: 15
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/login/page.tsx",
                                                        lineNumber: 365,
                                                        columnNumber: 31
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                        size: 15
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/login/page.tsx",
                                                        lineNumber: 365,
                                                        columnNumber: 54
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/login/page.tsx",
                                                    lineNumber: 358,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/login/page.tsx",
                                            lineNumber: 346,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/login/page.tsx",
                                    lineNumber: 344,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    id: "login-submit",
                                    disabled: loading,
                                    className: "login-btn",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                            size: 16
                                        }, void 0, false, {
                                            fileName: "[project]/app/login/page.tsx",
                                            lineNumber: 372,
                                            columnNumber: 15
                                        }, this),
                                        loading ? 'Authenticating…' : 'Sign In'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/login/page.tsx",
                                    lineNumber: 371,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/login/page.tsx",
                            lineNumber: 323,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/login/page.tsx",
                    lineNumber: 294,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/login/page.tsx",
                lineNumber: 293,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(LoginPage, "bjqq7RxC3frP6Q3vIHtJlD46Hh0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$authStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = LoginPage;
var _c;
__turbopack_context__.k.register(_c, "LoginPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_e3de0309._.js.map