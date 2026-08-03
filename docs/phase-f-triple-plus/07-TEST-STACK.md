# Phase F+++ — 07 Dedicated Test Stack Report

## Status: VERIFIED

## 1. Dedicated Test Environment Parameters

- **Database Name**: `prototype_next_browser_test` (Strictly contains `_browser_test`)
- **Database URL**: `postgresql://postgres:postgres@localhost:5432/prototype_next_browser_test?schema=public`
- **NestJS Backend URL**: `http://127.0.0.1:4000/api/v1`
- **Next.js Frontend URL**: `http://localhost:3000`

---

## 2. Process Lifecycle Controls

- **Preflight Script**: `frontend/scripts/browser-test-preflight.ts`
- **Database Reset**: `frontend/scripts/reset-browser-test-db.ts`
- **Stack Startup**: `frontend/scripts/start-browser-test-stack.ts`
- **Stack Shutdown**: `frontend/scripts/stop-browser-test-stack.ts`
- **PID Registry**: `.browser-test-stack.json`

---

## 3. Seeded Role Accounts Verified

All 14 required ERP role accounts exist with valid credentials and permissions in the `prototype_next_browser_test` database:
`SUPER_ADMIN`, `ADMIN`, `SALES_EXECUTIVE`, `SALES_MANAGER`, `PLANT_HEAD`, `PRODUCTION_PLANNER`, `PRODUCTION_OPERATOR`, `QC_INSPECTOR`, `STORE_MANAGER`, `DISPATCH_EXECUTIVE`, `FINANCE_EXECUTIVE`, `FINANCE_MANAGER`, `HR`, `EMPLOYEE`.
