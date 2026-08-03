# 05 - ELEVATION VERIFICATION

This document verifies the Super Admin Elevation mechanism against the strict Phase 2 security standards.

| Security Requirement | Status | Evidence / Notes |
| :--- | :--- | :--- |
| **Server-side Revocable** | ✅ Verified | Tokens are verified against `ElevationSession` in the Prisma DB. Deleting the DB record instantly revokes the session. |
| **Stored only as hashes** | ✅ Verified | The raw JWT is sent to the client, but `bcrypt.hash(elevationToken, 12)` is stored in `ElevationSession.tokenHash` (`auth.service.ts`). |
| **Dedicated Token Type** | ⚠️ Partially Verified | The generated token uses `sessionId` in the `jti` claim, but it does not strictly set `type: 'ELEVATION'` inside the JWT payload. The verification primarily relies on the DB lookup. |
| **Cannot authenticate normal API routes** | ✅ Verified | A normal API route expects a standard access JWT processed by `JwtAuthGuard`. The elevation token only works when parsed manually by `ElevationGuard` expecting the `x-elevation-token` header. |
| **Bound to user and company** | ⚠️ Partially Verified | Bound to User (`session.userId === request.user.sub`), but Company-binding is absent from the DB schema (`ElevationSession` only holds `userId`). |
| **Expire within documented period** | ✅ Verified | `expiresAt` is set strictly to `Date.now() + 15 mins`. Checked in `ElevationGuard` (`session.expiresAt < new Date()`). |
| **Produce audit logs** | ❌ Not Verified | No `auditLogs` generation code was added to the `/auth/elevate` flow. |
| **Can be explicitly revoked** | ❌ Not Verified | While the architecture supports it, no `/auth/elevate/revoke` endpoint was implemented to allow a user to intentionally clear their active elevation session. |
| **Invalidated after password reset or deactivation** | ❌ Not Verified | The password reset and user deactivation flows were not updated to `DELETE FROM ElevationSession WHERE userId = x`. |

### Summary
The core architecture (Token Hashing, Server-Side validation, Timeboxing, Header separation) is sound and properly prevents standard JWT abuse. However, edge cases regarding token lifecycle events (explicit revocation, password resets) and audit trailing remain unimplemented.
