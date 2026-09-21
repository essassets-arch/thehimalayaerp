# Store-backed material analytics

`/plant-head/material-analytics` reports the complete authenticated company's Store raw-material catalog. There is no 30-material or 230-material cap. Pagination only changes the displayed rows; search and CSV export cover every matching material, including zero-movement materials.

The shared read model is `backend/src/modules/inventory/raw-material-read-model.ts`. The Store page uses `/inventory/raw-material-snapshot`; `/products?type=RAW_MATERIAL` and Plant Head analytics use the same catalog function. RawMaterial records, including inactive records, are retained and labeled. Active raw-material Product records are included. A RawMaterial/Product mirror is combined only when SKU and normalized unit match. Different SKUs sharing a name remain separate. No query retries without the company filter.

Current stock comes from posted InventoryTransaction rows across warehouses. Each row contributes once, even when both linked identifiers are present. Signed adjustments and reversal postings are preserved. Negative balances are displayed. Unknown transaction types make the affected balances unavailable instead of silently assigning zero. Missing prices stay unavailable. Store's movement groups use actual outward transaction counts over the previous 90 days: fast = at least four, slow = one to three, non-moving = none.

Monthly/custom reporting uses Asia/Kolkata dates and an exclusive end boundary. Opening plus receipts minus issues plus adjustments reconciles to period closing. Current stock is a separate all-time balance. Receipts include posted stock-in/opening entries; issues include posted production and quick stock-out movements. Unposted GRNs are not treated as stock receipts. Store issues are not presented as measured production consumption.

Totals are separated by recorded unit; KG, PCS, L and other units are never summed into one weight. Raw quantities are not converted between units. Each report and Store snapshot is read in a repeatable-read transaction. Material history includes all ledger movement types for the selected period and uses the same material aliases as the report.

The page defaults to the current month, supports any month or custom dates and all time, shows current stock thresholds and daily movements, and exports all filtered rows. Loading/errors hide stale report data; older requests cannot overwrite a later request.

## Verification

Backend tests use an isolated in-memory database fixture with 236 materials, including zero-movement entries, duplicate names, a legacy SKU mirror, mixed units, signed reversals, negative balances and unknown ledger types. They check Store/report agreement, month boundaries, reconciliation, tenant isolation, history scope and failures. No application database is read or modified by these checks.

```powershell
# From backend
node ../node_modules/jest/bin/jest.js --runInBand --runTestsByPath src/modules/plant-head/material-analytics.spec.ts src/modules/plant-head/dispatch-analytics.spec.ts

# From repository root
node node_modules/typescript/bin/tsc -p backend/tsconfig.build.json --noEmit
node frontend/scripts/check-material-analytics-ui.cjs
```

The browser check bundles the actual report component with isolated test API responses. It verifies 236-row display/export, search, selected month, history boundaries, mobile width and error handling. It does not claim live authentication, production data reconciliation or full application acceptance. No migration is required. Deploy backend and frontend together because the report response contract and Store snapshot endpoint change together. This implementation has not deployed or verified the live website's material count.
