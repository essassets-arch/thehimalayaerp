Generated from repository inspection.
Repository revision: HEAD
Generated date: 2026-08-02T13:12:38.908Z
Scope: production Module
Confidence: Medium

# PRODUCTION Module Documentation

## Purpose
Manages the production operations for the business.

## Endpoints
- GET /production/testing/:id\n- PUT /production/testing/:id\n- PATCH /production/testing/:id/status\n- DELETE /production/testing/:id\n- GET /production/dashboard\n- GET /production/reports/summary\n- POST /production/shift-entries\n- POST /production/scrap-entries\n- GET /production/finished-goods\n- GET /production/floor\n- POST /production/:id/start\n- POST /production/:id/complete\n- GET /production/qc-history\n- GET /production/qc-pending\n- POST /production/:id/qc-pass\n- POST /production/:id/qc-fail\n- GET /production/qc-failed\n- POST /production/:id/start-rework\n- POST /production/:id/complete-rework\n- GET /production/ready-for-dispatch\n- GET /plant-head/qc-failures\n- GET /production/plans/:id\n- PATCH /production/plans/:id\n- POST /production/plans/:id/action\n- POST /production/plans/:id/submit\n- POST /production/plans/:id/approve\n- POST /production/plans/:id/release\n- POST /production/plans/:id/reject\n- POST /production/plans/:id/complete

## UI Routes
- /production/active\n- /production/completed\n- /production/finished-goods\n- /production/floor\n- /production/machine-log\n- /production/plans/create\n- /production/plans\n- /production/plans/[id]\n- /production/qc-failed\n- /production/qc-pending\n- /production/reports\n- /production/testing\n- /production/work-orders\n- /production/work-orders/[id]\n- /production/[[...slug]]
