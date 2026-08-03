# 07 - MIGRATION STATUS

This document verifies the application of the Phase 2 database schema changes.

### Schema State (`schema.prisma`)
The local `schema.prisma` correctly includes all Phase 2 security entities and fields:
- `User.failedLoginAttempts` (Int)
- `User.lockedUntil` (DateTime?)
- `ElevationSession` model (id, userId, tokenHash, expiresAt)
- `version` (Int) on PurchaseIndent, PurchaseOrder, and other mutable entities.

### Migration State (`npx prisma migrate status`)
**Status**: ⚠️ Pending / Out of Sync in Development Environment

The `prisma migrate status` command reveals that while the `schema.prisma` file is updated and validated (`npx prisma validate` passes), the migration history has drifted, and 25 migrations remain officially unapplied in the `prisma_migrations` tracking table:

```
25 migrations found in prisma/migrations
Following migrations have not yet been applied:
20260729170000_dispatch_actual_freight_paid
20260729173000_persist_material_request_workflow
20260729180000_material_request_full_backend_state
20260729190000_recruitment_workflow
...
20260731120000_customer_complaint_management
```

### Explanation
The previous engineer bypassed the standard migration flow (`prisma migrate dev`) and forced schema synchronization via `npx prisma db push` to resolve file-locking (`EPERM`) issues during development. 

As a result, the physical database schema matches the required Phase 2 state, but the formal migration history is corrupted/untracked. A `prisma migrate resolve` or a baseline reset is required before deploying this branch to production.
