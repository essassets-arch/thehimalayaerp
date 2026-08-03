# 18 — Optional Authentication (@OptionalAuth) Architecture Review

## 1. Overview & Verification Status

- **Status**: **VERIFIED**
- **Decorator Created**: [`backend/src/common/decorators/optional-auth.decorator.ts`](file:///d:/prototype-next-main/backend/src/common/decorators/optional-auth.decorator.ts)
- **Guards Hardened**: [`JwtAuthGuard`](file:///d:/prototype-next-main/backend/src/common/guards/jwt-auth.guard.ts) & [`PermissionsGuard`](file:///d:/prototype-next-main/backend/src/common/guards/permissions.guard.ts)

---

## 2. Explicit Authentication Behavioral Policy

1. **`@Public()`**: No authentication required. Missing/invalid Bearer token passes cleanly without throwing exceptions.
2. **`@OptionalAuth()`**: Authentication optional. Valid Bearer token populates `req.user`. Missing/invalid token allows request gracefully with `req.user = null`.
3. **Private Routes**: Authentication mandatory. Missing/invalid token throws `UnauthorizedException` (HTTP 401).
4. **Permissions Guard Policy**: Unauthenticated calls on private routes without explicit decorators are strictly blocked before permission evaluation.
