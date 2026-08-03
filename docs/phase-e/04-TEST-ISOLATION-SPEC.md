# Phase E — Test Isolation Specification

## 1. Overview

Security E2E (`test/security.e2e-spec.ts`) and Procurement Business E2E (`test/procurement.e2e-spec.ts`) test suites are engineered for complete execution isolation. Tests do not pollute global state, database entities, or rate limiters across test cases.

---

## 2. Isolation Mechanisms

1. **Unique Business Key Generation**:
   - Supplier invoice numbers, transaction IDs, payment numbers, and usernames utilize high-entropy dynamic suffixes:
     ```ts
     const invoiceNumber = `INV-BLOCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
     ```
   - Eliminates Prisma `P2002` unique constraint violations on `(supplierId, invoiceNumber)`.

2. **Dedicated Test Application Context**:
   - `beforeAll` builds a fresh `TestingModule` compiling `AppModule` with real `PrismaService`, `ThrottlerGuard`, `JwtAuthGuard`, `PermissionsGuard`, and `ElevationGuard`.
   - Uses dedicated test database configured via `DATABASE_URL`.

3. **Dynamic Role & Permission Seeding**:
   - `beforeAll` hook verifies presence of standard roles (`PLANT_HEAD`, `STORE_MANAGER`, `PRODUCTION_PLANNER`, `FINANCE_EXECUTIVE`, `FINANCE_MANAGER`, `SUPER_ADMIN`) and dynamically attaches required permissions (`procurement.*`, `dispatch.*`) prior to issuing JWT bearer tokens.

4. **Resource Cleanup Registry**:
   - Test suites maintain `cleanupIds` tracking created entities (`indents`, `purchaseOrders`, `grns`, `invoices`, `payments`).
   - `afterAll` hook removes test entities in reverse dependency order (Payments → Invoices → GRNs → POs → Indents).

---

## 3. Test Suite Performance & Results

- **Security E2E Suite (`test/security.e2e-spec.ts`)**:
  - Time: ~4.98 seconds
  - Passed: 14 / 14 tests (100%)

- **Procurement Business E2E Suite (`test/procurement.e2e-spec.ts`)**:
  - Time: ~5.29 seconds
  - Passed: 46 / 46 tests (100%)
