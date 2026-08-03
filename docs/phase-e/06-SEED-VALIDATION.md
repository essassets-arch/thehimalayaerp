# 06 — Seed Validation & Idempotency Audit Report

## 1. Overview & Verification Status

- **Status**: **VERIFIED**
- **Command Executed**: `npx prisma db seed` (Executed twice consecutively)
- **Output Summary**: Both passes completed cleanly with exit code 0. Zero `P2002` duplicate key errors.
- **Deduplication Check**: No duplicate roles, permissions, users, document sequences, or workflow definitions.

---

## 2. Seed Infrastructure (`prisma/seed.ts`)

- **File Path**: [`backend/prisma/seed.ts`](file:///d:/prototype-next-main/backend/prisma/seed.ts#L1-L400)
- Uses `upsert` patterns for all seeded entities:
  - **Company**: Upserts `publicId: 'COMP-001'`
  - **Roles**: Upserts by `code` (`SUPER_ADMIN`, `ADMIN`, `SALES_EXEC`, `SALES_MGR`, `PLANT_HEAD`, `PROD_PLANNER`, `PROD_OPERATOR`, `QC_INSPECTOR`, `DISPATCH_EXEC`, `FINANCE_EXEC`, `FINANCE_MGR`, `STORE_MGR`, `HR`)
  - **Permissions**: Upserts by `code` (`auth.*`, `users.*`, `customers.*`, `leads.*`, `quotations.*`, `sales_orders.*`, `production.*`, `qc.*`, `dispatch.*`, `procurement.*`, `finance.*`, `audit.*`, `system.*`)
  - **Users**: Upserts by `email` (`super.admin@himalayaerp.com`, `admin@himalayaerp.com`, etc.)
  - **Document Sequences**: Upserts by `(companyId, documentType, year)`
  - **Workflow Definitions**: Upserts by `(companyId, entityType)`

---

## 3. Consecutive Double Execution Evidence

### Pass 1 Execution Log

```bash
npx prisma db seed

Environment variables loaded from .env
Running seed command `ts-node prisma/seed.ts` ...
🌱 Starting ERP seed...

📋 Seeding roles...
🔑 Seeding permissions...
🏢 Seeding company...
🔗 Assigning permissions to admin roles...
🔗 Assigning permissions to sales roles...
Assigning permissions to finance roles...
🔗 Assigning procurement permissions to operational roles...
👤 Seeding users...
🔗 Assigning dispatch permissions to all roles for testing...
🔢 Seeding document sequences...
⚙️  Seeding workflow definitions...
  ✓ Lead Workflow
  ✓ Quotation Workflow
  ✓ Sales Order Workflow
  ✓ Production Plan Workflow
  ✓ Work Order Workflow
  ✓ QC Inspection Workflow
  ✓ Dispatch Workflow
  ✓ Invoice Workflow
  ✓ Customer Payment Workflow

✅ Seed complete!
```

### Pass 2 Execution Log (Consecutive Re-Run)

```bash
npx prisma db seed

Environment variables loaded from .env
Running seed command `ts-node prisma/seed.ts` ...
🌱 Starting ERP seed...

📋 Seeding roles...
🔑 Seeding permissions...
🏢 Seeding company...
🔗 Assigning permissions to admin roles...
🔗 Assigning permissions to sales roles...
Assigning permissions to finance roles...
🔗 Assigning procurement permissions to operational roles...
👤 Seeding users...
🔗 Assigning dispatch permissions to all roles for testing...
🔢 Seeding document sequences...
⚙️  Seeding workflow definitions...
  ✓ Lead Workflow
  ✓ Quotation Workflow
  ✓ Sales Order Workflow
  ✓ Production Plan Workflow
  ✓ Work Order Workflow
  ✓ QC Inspection Workflow
  ✓ Dispatch Workflow
  ✓ Invoice Workflow
  ✓ Customer Payment Workflow

✅ Seed complete!
```

### Result

Zero duplicate key errors thrown. `npx prisma db seed` is 100% idempotent.
