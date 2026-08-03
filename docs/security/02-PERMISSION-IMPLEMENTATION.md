# 02. Permission Implementation

## Global Strategy
The NestJS backend has been fully transitioned from legacy Role-Based Access Control to granular Permission-Based Access Control.

1. **Authentication:** A global or class-level `JwtAuthGuard` intercepts incoming requests, verifying the JWT payload and ensuring the user identity.
2. **Authorization:** A custom `PermissionsGuard` checks the `@RequirePermissions` decorator against the `permissions` array embedded inside the user's JWT payload.
3. **Implicit Public Routes:** Any route specifically decorated with `@Public()` gracefully bypasses the standard authentication guard without evaluating token data, ensuring endpoints like `/auth/login`, `/health/readiness`, and `/hr/salary-slips/shared/:token` remain accessible.
4. **Data-Level Row Restrictions:** Following controller-level authorization, request scope parameters (like `userId` and `companyId`) are injected into the Service layer. The `rbac.util.ts` (`getAdvancedScope` and `getSalesScope`) functions act as a secondary defense line by automatically appending row-level restrictions (e.g. `createdById: userId`) to Prisma queries, achieving zero-trust at the database layer.

## Execution Details
- Bulk automated scripts parsed all `36` backend modules.
- The legacy `@Permissions()` decorator (used as an alias or intermediate feature) was formally refactored to `@RequirePermissions()` site-wide.
- Every business `.controller.ts` file was rigorously stamped with `@UseGuards(JwtAuthGuard, PermissionsGuard)`.
- No endpoints rely on frontend-only visibility anymore.
