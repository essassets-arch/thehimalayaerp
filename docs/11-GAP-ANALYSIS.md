Generated from repository inspection.
Repository revision: HEAD
Generated date: 2026-08-02T13:11:25.778Z
Scope: Gap Analysis
Confidence: Medium

# 11. Gap Analysis

## Critical Before Production
- Remove all hardcoded `localhost` URLs. Found in:

- Replace Mock Data. Found references in:
  - `frontend/app/(dashboard)/dispatch/sample-dispatch/create/[id]/page.tsx`
  - `frontend/app/(dashboard)/dispatch/sample-dispatch/page.tsx`
  - `frontend/app/(dashboard)/layout.tsx`
  - `frontend/app/(dashboard)/sales/create-payment/page.tsx`
  - `backend/src/modules/plant-head/plant-head.controller.ts`
  - `backend/src/modules/plant-head/plant-head.service.ts`
  - `backend/src/modules/procurement/procurement.service.ts`
  - `backend/src/modules/production/production-workflow.service.ts`

## High Priority
- Implement Real-Time Notifications.
