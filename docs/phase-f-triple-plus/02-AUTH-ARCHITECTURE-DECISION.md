# Phase F+++ — 02 Authentication Architecture Decision Report

## Verdict: HYBRID HttpOnly REFRESH COOKIE + IN-MEMORY ACCESS TOKEN

## Architectural Rationale

To balance security (protecting long-lived credentials from XSS key-logging) with API bridge flexibility (supporting multi-tenant Next.js proxy forwarding and external NestJS client access), the application adopts a **Hybrid HttpOnly Cookie + In-Memory Access Token Architecture**.

```text
Browser Client
   ├── In-Memory Zustand AuthStore: Short-lived Access Token (15-min expiry)
   └── HttpOnly Cookie: Refresh Token (`refreshToken`, 7-day expiry)
```

---

## Decision Matrix & Tradeoffs

| Architecture Model | XSS Risk | CSRF Risk | API Bridge Compatibility | Verdict |
|--------------------|----------|-----------|--------------------------|---------|
| **Pure LocalStorage (Legacy)** | HIGH (Tokens readable by JS) | NONE | High | **REJECTED** |
| **Pure HttpOnly Cookies** | LOW | MODERATE (Requires CSRF tokens on all POSTs) | High | **CONSIDERED** |
| **Hybrid (Chosen)** | **LOW** (Refresh token in HttpOnly; access token in memory) | **LOW** (SameSite cookie + Authorization header) | **HIGH** | **APPROVED & ENFORCED** |

---

## Enforced Security Controls

1. **Refresh Token Storage**: NestJS sets `Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth`.
2. **Access Token Storage**: Returned in JSON response body and stored strictly in memory via Zustand `authStore`.
3. **Automatic Token Restoration**: Upon page refresh or app reload, the frontend issues `POST /api/backend/auth/refresh`, reading the HttpOnly cookie automatically and restoring the short-lived in-memory access token.
4. **Session Revocation**: Calling `/auth/logout` invalidates the refresh token family in PostgreSQL and clears the HttpOnly cookie.
