# Phase F+++ — 01 Authentication Storage Trace Report

## Status: AUDITED & TRACED

## 1. Authentication Flow Trace

```text
Login Form (Client UI)
      │
      ▼ (POST /api/backend/auth/login)
Next.js API Bridge (/app/api/backend/[...path]/route.ts)
      │
      ▼ (POST /api/v1/auth/login)
NestJS Backend Auth Service
      │
      ├── Returns Access Token (short-lived JWT)
      └── Sets Refresh Token (HttpOnly Cookie: `refreshToken`)
```

---

## 2. Storage Audit Matrix

| Token Document | Token Type | Storage Location | JS Readability (`document.cookie` / `localStorage`) | HttpOnly Flag | Secure Flag | SameSite Flag | XSS Risk Level | CSRF Risk Level | Rotation Behavior |
|----------------|------------|------------------|---------------------------------------------------|---------------|-------------|---------------|----------------|-----------------|-------------------|
| **Access Token** | Bearer JWT (short-lived) | In-Memory (Zustand AuthStore) | Read-only in memory (Not stored in LocalStorage) | N/A (Memory) | N/A | N/A | **LOW** (Memory cleared on tab refresh) | **NONE** (Explicit header) | Rotated via refresh token endpoint |
| **Refresh Token** | Refresh Cookie (long-lived) | Browser HttpOnly Cookie (`refreshToken`) | **NO** (Blocked from JS access) | **HttpOnly: true** | **Secure: true** | **SameSite: Lax** | **NONE** (Unreadable by JS XSS) | **Mitigated** (SameSite + CSRF token) | Rotated on reuse; old token reuse revokes session family |

---

## 3. Findings & Hardening Result
- Refresh tokens are strictly isolated in HttpOnly, Secure cookies.
- Access tokens are held exclusively in memory within Zustand `authStore`.
- No sensitive JWT tokens are stored in `localStorage` or `sessionStorage`.
