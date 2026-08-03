# Phase F++ — 01 Dedicated Live Browser-Test Stack Report

## Status: VERIFIED & CONSTRUCTED

## Architecture Overview

A dedicated, isolated environment has been constructed to execute all Playwright browser test suites against a live Next.js + NestJS + PostgreSQL stack without corrupting dev or production data.

```text
Playwright Test Runner
      │
      ▼
Next.js Frontend (http://localhost:3000)
      │
      ▼ (API Bridge)
NestJS Backend (http://127.0.0.1:4000)
      │
      ▼
PostgreSQL Test Database (prototype_next_browser_test)
```

---

## Environment Control Scripts

1. `frontend/scripts/reset-browser-test-db.ts`:
   - Enforces database name verification (`_browser_test`).
   - Aborts if `DATABASE_URL` target lacks `_browser_test`.
   - Runs `npx prisma db push --skip-generate --accept-data-loss`.
   - Runs `npx ts-node prisma/seed.ts` to seed distinct users for every role.

2. `frontend/scripts/start-browser-test-stack.ts`:
   - Resets test DB.
   - Spawns NestJS backend on `PORT=4000` with `DATABASE_URL=postgresql://.../prototype_next_browser_test`.
   - Spawns Next.js frontend on `PORT=3000`.
   - Polls readiness endpoints (`http://127.0.0.1:4000`, `http://localhost:3000`).
   - Writes process PIDs to `.browser-test-stack.json`.

3. `frontend/scripts/stop-browser-test-stack.ts`:
   - Reads process PIDs.
   - Terminates process trees (`taskkill /F /PID <pid> /T`).
   - Removes `.browser-test-stack.json`.

---

## Role User Credentials Seeded for Browser Execution

| Role Code | Email | Password | Allowed Scopes |
|-----------|-------|----------|----------------|
| `SUPER_ADMIN` | `admin@himalaya.com` | `Admin123!` | Super Admin / Global Approval |
| `SALES_EXECUTIVE` | `sales.exec@himalaya.com` | `Password123!` | Customer, Lead, Quotation |
| `SALES_MANAGER` | `sales.manager@himalaya.com` | `Password123!` | Sales Order Approval / Handoff |
| `PLANT_HEAD` | `plant.head@himalaya.com` | `Password123!` | Production Plan, Recruitment Req |
| `PRODUCTION_PLANNER` | `prod.planner@himalaya.com` | `Password123!` | Work Order Release |
| `QC_INSPECTOR` | `qc.inspector@himalaya.com` | `Password123!` | Batch QC Inspection |
| `DISPATCH_EXECUTIVE` | `dispatch.exec@himalaya.com` | `Password123!` | Consignment Booking, Gate Out |
| `FINANCE_EXECUTIVE` | `finance.exec@himalaya.com` | `Password123!` | Payment Audit, Invoice Match |
| `STORE_MANAGER` | `store.manager@himalaya.com` | `Password123!` | Material Indent, Inventory |
| `HR` | `hr@himalaya.com` | `Password123!` | Payroll Run, Candidate Pipeline |
