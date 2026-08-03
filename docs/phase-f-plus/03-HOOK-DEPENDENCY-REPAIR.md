# Phase F+ Batch 4 — React Hook Dependency Repair Report

## Status: VERIFIED (0 violations under `react-hooks/exhaustive-deps: "error"`)

## Summary of Repaired Hook Dependencies

Restored `react-hooks/exhaustive-deps` rule to `"error"` level in `frontend/eslint.config.mjs`.

The following 9 files with hook dependency issues were systematically audited and repaired:

| File | Issue | Repair Strategy |
|------|-------|-----------------|
| `app/(dashboard)/crm/leads/[id]/page.tsx` | `fetchLead` missing in `useEffect` deps | Wrapped `fetchLead` in `React.useCallback([params?.id])` and included in `useEffect` deps |
| `app/(dashboard)/crm/quotations/[id]/page.tsx` | `fetchQuotation` missing in `useEffect` deps | Wrapped `fetchQuotation` in `React.useCallback([params?.id])` and included in `useEffect` deps |
| `app/(dashboard)/hr/recruitment/page.tsx` | `load` callback read `selected` object instead of primitive ID | Extracted `selectedId = selected?.id` inside `load` and set dependency to `[selected?.id]` |
| `app/(dashboard)/orders/[orderId]/page.tsx` | Fallback arrays `|| []` in `useERPStore` selectors created new object references on every render | Wrapped state array selectors in `useMemo` for stable array reference identity |
| `app/(dashboard)/production/finished-goods/page.tsx` | `readyItems` & `historyItems` calculated outside `useMemo` but consumed inside | Computed `readyItems` & `historyItems` inside `useMemo` and added `readyCount`/`historyCount` memoized values |
| `app/(dashboard)/production/qc-pending/page.tsx` | `fetchJobs` missing in `useEffect` deps | Wrapped `fetchJobs` in `React.useCallback([activeTab])` and included in `useEffect` deps |
| `app/(dashboard)/sales/payment-history/page.tsx` | Local `APPROVED_STATUSES` array recreated in render; `filteredPayments` derived from `approvedPayments` but depended on raw `payments` | Moved `APPROVED_STATUSES` to top-level module constant; updated `filteredPayments` dependency array to `[approvedPayments, searchQuery]` |
| `app/(dashboard)/store/reports/page.tsx` | `fetchDashboard` missing in `useEffect` deps | Wrapped `fetchDashboard` in `React.useCallback([month, year])` and included in `useEffect` deps |
| `components/SharedPaymentTable.tsx` | `|| []` fallback arrays evaluated in render created unstable array identities for `useMemo` | Wrapped store array selections in `useMemo` for stable reference identity |

## Verification Results

- `npm run lint` under `react-hooks/exhaustive-deps: "error"`: **0 errors**
- `npm run type-check`: **0 errors**
- Next.js production build: **PASS**
