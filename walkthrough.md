# Procure-to-pay compatibility note

The existing application uses `Supplier` (not `Vendor`), `Product` (not Material),
`Warehouse`, `InventoryTransaction`, `User`, and the central `AuditLog` model. The
procurement implementation therefore reuses those canonical models. Procurement
statuses are stored as strings rather than Prisma enums, consistent with the pre-
existing Purchase Indent, Purchase Order, and GRN tables. The backend prefix is
`/api/v1`, so procurement controllers are mounted below `/api/v1/procurement`.

Idempotency is supplied globally by `IdempotencyInterceptor`; it stores the original
response for a user/key pair. The existing schema has version fields on procurement
documents, but did not have a shared `If-Match` enforcement convention. The new
mutation handlers accept a requested version in the body and return `409` on a
stale version. Finance has a customer ledger only; vendor settlement entries are
recorded in the central `AuditLog` until a dedicated accounting chart-of-accounts
module exists.
## Purchase Order Closure Flow

The Finance Portal's **Closed POs** tab has been enhanced to properly support the PO closure lifecycle:
1. **Extended Filters:** POs in states `RECEIVED`, `PARTIALLY_RECEIVED`, `PURCHASE_COMPLETED`, and `FINANCE_AUDIT_APPROVED` are now visible in the Closed POs tab.
2. **Pre-flight Validation:** Clicking the `Close PO` button now immediately fetches the backend's `ProcurementClosureService` status (`/closure-status`). If there are pending deliveries, unverified invoices, or pending payments, it surfaces them to the user via a SweetAlert warning dialog before attempting closure.
3. **Robust Actions:** The `closePurchaseOrder` action uses `procurementRequest` directly to map backend constraint errors cleanly to the frontend. Duplicate function definitions that were breaking the Next.js compilation have been removed.
