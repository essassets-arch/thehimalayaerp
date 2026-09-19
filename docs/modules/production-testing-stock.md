# Production testing consumes inventory

`/production/testing` loads the same `/products?scope=catalog&limit=5000` endpoint used by the Plant Head Product Master. Product IDs, active/catalog rules, and the authenticated company are checked on the backend.

`POST /production/testing` accepts `productId`, a positive integer `quantity`, optional `remarks`, and a required `requestId` (the UI generates a UUID). The authenticated user's ID and company come from JWT authentication, not the submitted body.

The service uses one serializable Prisma transaction to validate the authoritative All Stock balance, create the testing record, and call `InventoryService.stockOutFinishedGoods`. That existing service updates `FinishedGoods.quantity` and `availableQuantity`, and writes `StockHistory` with event/source type `TESTING`, a negative quantity, testing record reference, actor, timestamp, and before/after physical and available balances. Product/stock row locks and bounded transaction retries protect concurrent consumers. Reserved stock is unavailable for testing.

The unique `(companyId, requestId)` constraint makes identical retries return the original result. Reusing a key for a different payload or user is rejected. The UI retains its key after a failed or ambiguous response, guards immediate duplicate clicks, and disables submission while in progress.

All Stock includes testing deductions when reconstructing balances from production reports or opening stock. Its legacy balance calculation avoids deducting testing twice. Consumed opening stock is included when checking whether the shared stock-out service needs to materialize an opening balance.

New testing records use Product and User relations. Historical records retain their existing names and quantities; they are marked as legacy records rather than claiming stock was deducted. Stock-consuming records retain immutable products and quantities and cannot be deleted; notes and review status remain editable. A review rejection does not return physically consumed stock.

## Rollout

Apply `backend/prisma/migrations/20260919000000_testing_stock_deduction/migration.sql` through the existing migration deployment process before running the updated backend, and regenerate the Prisma client. The migration adds nullable relation/audit/idempotency columns and the `TESTING` enum value, preserving existing records without retroactive stock deductions. No reset, destructive seed, or production data modification is needed.

Implementation verification used a separate PostgreSQL container on localhost port 55439, database `testing_stock`. It did not use the application database. This change has not been deployed by this implementation session.

## Verification

The real database suite is `backend/src/modules/production/production-testing.integration.spec.ts`. It requires an explicit `TEST_DATABASE_URL` pointing to localhost and a database name beginning with `testing_`; otherwise it is skipped. Provision an empty isolated database with the current schema before running it. Fixtures remain in that disposable database; it never deletes or resets existing application data.

From `backend`, run:

```powershell
$env:TEST_DATABASE_URL = 'postgresql://testing:testing-local-only@127.0.0.1:55439/testing_stock'
node ../node_modules/jest/bin/jest.js --runInBand --runTestsByPath src/modules/production/production-testing.integration.spec.ts src/modules/production/production.service.spec.ts src/modules/production/production.controller.spec.ts
```

Coverage includes 50→45, 1→0, insufficient and invalid quantities, concurrent testing, testing versus dispatch, duplicate/retried requests, rollback after a history write, fresh reads of records and All Stock, reserved stock, stock-in/dispatch compatibility, opening-stock exhaustion, tenant isolation, immutable audit records, authentication/RBAC, HTTP DTO validation, Product Master access, and preservation of legacy records by the additive migration.

Backend production TypeScript checks pass. The broad repository frontend type-check has existing generated-route, dependency declaration, and unrelated application errors; the changed UI files report only the existing missing `lucide-react` declarations. Full browser acceptance and live deployment are not claimed by these backend tests.
