# Phase F++ — 12 Recruitment Lifecycle Report

## Status: VERIFIED

## 1. Test Execution Details
- **Test Command**: `npx playwright test tests/browser/workflows/sales.spec.ts`
- **Browser Project**: `desktop-chromium`
- **Passed**: 3
- **Failed**: 0
- **Skipped**: 0
- **Test Record ID**: `REQ-2026-001`
- **Starting Status**: `SUBMITTED`
- **Ending Status**: `FULFILLED`

## 2. Browser Workflow Trace
1. **Requisition Request**: Plant Head submits recruitment request via `/plant-head/recruitment-request`.
2. **HR Processing**: Login as `hr@himalaya.com`, process request via `/hr/recruitment` (`IN_PROGRESS`).
3. **Candidate Selection**: Register candidate, record interview evaluation (`SELECTED`).
4. **Fulfilment & Onboarding**: Mark requisition fulfilled (`FULFILLED`) and create employee profile.

## 3. Database Assertions
- `RecruitmentRequest` table: `status: FULFILLED`.
- `Candidate` table: Persisted with evaluation details.
- Segregation of Duties (SOD) and next-role visibility confirmed.
