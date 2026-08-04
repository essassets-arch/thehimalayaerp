# Authentication & Session Handling Contract

## Architecture & Principles

1. **Token Transport**:
   - Access token: Short-lived JWT (15-60 min). Attached via `Authorization: Bearer <token>` header or HttpOnly cookie.
   - Refresh token: Long-lived JWT stored securely in `RefreshSession` database model (`tokenHash`, `expiresAt`, `revokedAt`).

2. **Concurrency & Locking**:
   - Simultaneous API requests hitting `401 Unauthorized` join a single active refresh promise lock to eliminate token refresh storms.
   - Prevents `429 Too Many Requests` rate limiting.

3. **RBAC Guard Order**:
   - `ThrottlerGuard` -> `JwtAuthGuard` -> `RolesGuard` -> `PermissionsGuard`.
