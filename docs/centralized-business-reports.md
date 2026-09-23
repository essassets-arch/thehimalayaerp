# Centralized business reports

The reports page defaults to All Time and includes eight department summaries and 72 detailed operational registers. The register catalog is an explicit allowlist in `backend/src/modules/super-admin/business-report-registers.ts`, validated against the generated Prisma schema by tests. No runtime demonstration records or estimated substitute values are supplied.

## Reading the reports

- Summaries retain their stated calculation definitions, including confirmed orders, dispatched shipments and verified receipts. Detailed registers include every workflow status, including drafts and pending records.
- Each register identifies its date field. Directory/catalog reports are current master records and do not use the period filter. All Time has no lower date bound and no prior-period comparison. The stock summary uses movements through today.
- Commercial filters are applied only through recorded relationships. The table explicitly lists selected filters that do not apply. HR stays company-wide. Product filters on document registers select whole documents; item registers select individual matching items.
- Null values remain `Not recorded`; actual zero remains zero. Monetary decimals retain database precision in detailed exports. Stored order/AR balances are identified separately from the reconciled posted-invoice summary.
- Read failures produce errors, not empty successful reports. Summary and register requests prevent late responses from replacing a newer selection.

## Exports and consistency

- Summary CSV/PDF use the displayed summary snapshot. PDFs cover all eight departments, individually or together.
- Detailed CSV exports all matching rows, not just the displayed page.
- The Excel workbook exports every register in the selected department scope, one worksheet per register plus scope/filter metadata. This is a fresh export snapshot; its generation time is included.
- Register count and rows, and all workbook queries, execute within a Repeatable Read transaction. Export queries use cursor batches without a silent record cap. Table browsing uses stable ID ordering with 25/50/100 rows per page; each page is a fresh read.

## Ownership and unavailable sources

Every register is company-scoped through an explicit direct or related ownership path. Employee banking/identity secrets, authentication credentials, device tokens and location history are not reporting columns. Soft-deleted parents are excluded from related registers.

Legacy manual registers without a company field are restricted to company-owned creator accounts. Back-office AR entries require a linked company sales order. Unowned legacy entries cannot be attributed reliably. Legacy `InventoryItem` and `Machine` master records lack company ownership and are not included. They need ownership migration before safe consolidation. This is disclosed on the page; totals are not padded with unscoped records.

Inventory valuation remains unavailable when recorded inventory costs are absent. Missing freight, delivery measurements or payroll records are never replaced with percentages or headcount-based estimates.

## Verification

From `backend`: `node ../node_modules/jest/bin/jest.js --runInBand --runTestsByPath src/modules/super-admin/business-report-registers.spec.ts src/modules/super-admin/centralized-reports.spec.ts src/modules/super-admin/hr-analytics.spec.ts src/modules/super-admin/dispatch-analytics.spec.ts`

From repository root: `node frontend/tests/business-reports.smoke.cjs`

The browser test uses isolated test transport/fixtures; it verifies navigation, pagination, missing versus zero values, downloads, and error recovery without accessing production records. Production accuracy still depends on the completeness of recorded transactions. No production deployment is performed by these tests.
