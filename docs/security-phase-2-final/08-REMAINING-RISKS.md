# 08 - REMAINING RISKS

Based on the independent verification and source inspection of Phase 2, the following severe security and operational risks remain active in the system.

### 1. Throttler Global IP Lockout Cascade
Currently, the `@nestjs/throttler` is tracking strictly by IP address for global limits. Because of reverse proxies and shared NAT environments (e.g., all users from a single corporate office), a brute-force attack or simple high-velocity usage by one employee will lock out the entire company IP for 60+ seconds (returning 429 to all users).
**Risk Level**: HIGH (Denial of Service).
**Mitigation**: Implement `X-Forwarded-For` trust architecture and adjust throttler logic to track by User-ID where authenticated, failing back to IP only for public routes.

### 2. Incomplete Segregation of Duties (SOD)
SOD has only been implemented for `PurchaseIndent` and `PurchaseOrder`. All other critical business modules (Goods Receipt Notes, Vendor Invoices, Payroll Approvals, QC, Recruitment) have no backend enforcement preventing a creator from approving their own work.
**Risk Level**: CRITICAL (Fraud & Compliance failure).
**Mitigation**: Roll out the `actorId !== createdById` and override logic to all domain services.

### 3. Global SOD Override Permission
The current override check relies on a single, global permission `override.sod`. If a manager is granted this to override an Indent, they implicitly gain the ability to override payroll, QC, and finance approvals across the entire ERP.
**Risk Level**: HIGH (Privilege Escalation).
**Mitigation**: Replace with domain-specific permissions (e.g., `procurement.indents.override`, `hr.payroll.override`).

### 4. Fake Optimistic Concurrency
The `version` field was added to numerous models, but only enforced in Procurement. Worse, Prisma's `update` query does not natively throw a `409 Conflict` if 0 rows match the `where: { id, version }` constraint; it throws a `P2025` Record Not Found error, which the backend translates to a 404 or 500. Furthermore, the history tracking insertion is not wrapped in the exact same atomic transaction boundary as the status mutation.
**Risk Level**: MEDIUM (Data integrity & dirty writes).
**Mitigation**: Implement a generic Prisma extension or middleware that translates `P2025` with `version` into a `409 Conflict`. Wrap history insertions in the primary transaction.

### 5. Migration History Corruption
The development database's migration history has drifted from the actual schema due to the use of `prisma db push`. Deploying this to staging or production via `prisma migrate deploy` will fail or cause catastrophic data loss if Prisma attempts to recreate existing tables.
**Risk Level**: CRITICAL (Deployment & Data Loss).
**Mitigation**: Run `prisma migrate resolve` to baseline the production environments.

### 6. Elevation Token Lifecycle Management
Elevation sessions cannot currently be explicitly revoked by the user (no `/auth/elevate/revoke` endpoint). Additionally, resetting a password or deactivating a user does not flush their active elevation sessions from the database.
**Risk Level**: MEDIUM (Session Hijacking).
**Mitigation**: Add lifecycle hooks to user mutations that clear `ElevationSession`.
