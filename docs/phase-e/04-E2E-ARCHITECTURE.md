# 04 — Complete E2E Test Architecture & Verification Report

## 1. Overview & Verification Status

- **Status**: **VERIFIED**
- **Security E2E Suite (`test/security.e2e-spec.ts`)**: **14 / 14 PASSED (100%)**
- **Procurement Business E2E Suite (`test/procurement.e2e-spec.ts`)**: **46 / 46 PASSED (100%)**
- **Execution Time**: Security E2E (~4.98s), Procurement E2E (~5.29s)

In Phase E, all E2E test suites were refactored to execute independently without cross-test state pollution, rate limit interference, DB entity collisions, or authentication session contamination.

---

## 2. Test Commands (`package.json`)

- **File Path**: [`backend/package.json`](file:///d:/prototype-next-main/backend/package.json#L12-L25)

```json
{
  "scripts": {
    "test:e2e:security": "jest --config ./test/jest-e2e.json test/security.e2e-spec.ts",
    "test:e2e:procurement": "jest --config ./test/jest-e2e.json test/procurement.e2e-spec.ts",
    "test:e2e:business": "npm run test:e2e:procurement",
    "test:e2e:all": "jest --config ./test/jest-e2e.json test/**/*.e2e-spec.ts"
  }
}
```

---

## 3. Test Isolation Architecture

1. **Dedicated Database Environment**:
   - Executes against isolated PostgreSQL test database (`himalaya_erp_test` / `himalaya_erp_dev`).
   - Applies standard migrations via `npx prisma migrate deploy` prior to suite startup.

2. **High-Entropy Unique Business Identifier Generation**:
   - Supplier invoice numbers, document numbers, and transaction IDs utilize high-entropy dynamic suffixes:
     ```ts
     const invoiceNumber = `INV-BLOCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
     ```
   - Prevents Prisma `P2002` unique constraint collisions on `(supplierId, invoiceNumber)`.

3. **Dynamic Role & Permission Seeding**:
   - `beforeAll` verifies operational test roles (`PLANT_HEAD`, `STORE_MANAGER`, `PRODUCTION_PLANNER`, `FINANCE_EXECUTIVE`, `FINANCE_MANAGER`, `SUPER_ADMIN`) and attaches required permissions (`procurement.*`, `dispatch.*`) before generating JWT tokens.

4. **Resource Cleanup Registry**:
   - Test suites maintain entity IDs in a `cleanupIds` registry and clean them up in reverse dependency order in `afterAll`.

---

## 4. Verification Evidence

### Security E2E Test Suite Results

```bash
npm run test:e2e:security

PASS test/security.e2e-spec.ts
  Security Phase D: Independent E2E Tests
    1. Rate Limiting Architecture (Isolated)
      √ Login throttling returns 429 after threshold (74 ms)
      √ Refresh throttling returns 429 independently (39 ms)
    2. Account Lockout
      √ Five login failures trigger lockout (278 ms)
      √ Locked users cannot log in even with correct password (8 ms)
      √ Successful login resets failure count (244 ms)
    3. Super Admin Elevation
      √ Generates elevation token with valid password (377 ms)
      √ Admin unlock requires permission and elevation (10 ms)
      √ Ordinary JWT cannot be used as elevation token (7 ms)
      √ Elevation token cannot be used as ordinary access token (7 ms)
      √ Expired elevation token is rejected (11 ms)
    4. Segregation of Duties (SOD)
      √ Creator cannot approve own indent (38 ms)
    5. Row-level access
      √ Cross-company reads return no data or 404 (16 ms)
    6. Optimistic Concurrency
      √ Stale expectedVersion returns 409 (5 ms)
      √ Successful update increments version exactly once (8 ms)

Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
Time:        4.988 s
```

### Business Procurement E2E Test Suite Results

```bash
npm run test:e2e:procurement

PASS test/procurement.e2e-spec.ts
  Procurement — Happy Path (Phase 1–6)
    1 · Purchase Indent
      √ creates indent in DRAFT status (25 ms)
      √ submits indent for Plant Head approval (20 ms)
      √ Plant Head approves indent (20 ms)
    2 · Purchase Order
      √ Finance creates PO from approved indent (23 ms)
      √ submits PO for Super Admin approval (20 ms)
      √ Super Admin approves PO (10 ms)
      √ Finance issues PO (14 ms)
    3 · GRN
      √ Store creates GRN (16 ms)
      √ Store submits GRN for Finance Audit (16 ms)
      √ Finance approves GRN and posts inventory (20 ms)
    4 · Vendor Invoice
      √ Finance creates vendor invoice (14 ms)
      √ submits invoice for matching (19 ms)
      √ 3-way match passes and invoice becomes VERIFIED (16 ms)
      √ Finance requests payment approval (6 ms)
    5 · Vendor Payment
      √ Finance records payment (13 ms)
      √ submits payment for approval (15 ms)
      √ Super Admin approves payment (7 ms)
      √ moves to PROCESSING (13 ms)
      √ completes payment — invoice becomes PAID (12 ms)
    6 · PO Closure
      √ closure evaluator reports eligible with 0 blockers (16 ms)
      √ closes PO atomically (15 ms)
      √ linked indent becomes PROCUREMENT_COMPLETED (1 ms)
      √ repeated PO closure is idempotent (no error) (7 ms)
      √ AuditLog contains PURCHASE_ORDER_CLOSED event (12 ms)
  Procurement — Exception & Negative Paths
    A · Authorization (403)
      √ unauthenticated request returns 401 (13 ms)
      √ Sales Executive cannot approve an indent (403) (44 ms)
      √ Sales Executive cannot approve a PO (403) (70 ms)
    B · Plant Head Indent — return & reject
      √ Plant Head returns indent (RETURNED_TO_STORE) (41 ms)
      √ Plant Head rejects indent (PLANT_HEAD_REJECTED) (37 ms)
      √ cannot approve an already-rejected indent (57 ms)
    C · Super Admin PO — return & reject
      √ Super Admin returns PO (RETURNED_FOR_CORRECTION) (75 ms)
      √ Super Admin rejects PO (SUPER_ADMIN_REJECTED) (55 ms)
    D · Duplicate PO prevention
      √ cannot create two POs from the same indent (72 ms)
    E · Stale version → 409
      √ action with wrong version returns 409 (72 ms)
    F · Excess GRN receipt
      √ receiving more than the PO quantity is rejected (400 or 409) (70 ms)
    G · Idempotent inventory posting
      √ approving an already-approved GRN does not create a second inventory transaction (90 ms)
    H · Invoice 3-way match exceptions
      √ quantity mismatch flags MATCH_EXCEPTION (139 ms)
      √ rate mismatch flags MATCH_EXCEPTION (123 ms)
    I · Duplicate supplier invoice
      √ invoice with the same invoiceNumber is rejected (409) (110 ms)
    J · Partial payment
      √ paying part of an invoice sets status to PARTIALLY_PAID (221 ms)
    K · Failed payment
      √ failing a payment sets status to FAILED (182 ms)
    L · Closure blocked scenarios
      √ PO with pending GRN is NOT eligible for closure (81 ms)
      √ PO with unpaid invoice is NOT eligible for closure (118 ms)
      √ PO with rejected material (unresolved) is NOT eligible for closure (96 ms)
      √ closing a blocked PO returns 409 with blockers list (65 ms)
    M · Audit history endpoints
      √ indent history is non-empty after actions (28 ms)

Test Suites: 1 passed, 1 total
Tests:       46 passed, 46 total
Time:        5.295 s
```
