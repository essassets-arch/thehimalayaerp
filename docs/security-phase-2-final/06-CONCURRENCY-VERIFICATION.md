# 06 - CONCURRENCY VERIFICATION

This document verifies the optimistic locking architecture required to prevent dirty writes during concurrent workflow actions.

*Legend: ✅ Verified, ⚠️ Partially Verified, ❌ Not Verified*

| Model | DTO requires `expectedVersion` | Service logic checks version | Atomic Update uses `where: { id, version }` | Version Increments | Zero-Row update -> 409 | Transaction bounds History & Record | Overall Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PurchaseIndent** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ⚠️ Partially Verified |
| **PurchaseOrder** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ⚠️ Partially Verified |
| **GoodsReceiptNote** | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ❌ Not Verified |
| **VendorInvoice** | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ❌ Not Verified |
| **VendorPayment** | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ❌ Not Verified |
| **ProductionPlan** | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ❌ Not Verified |
| **QCInspection** | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ❌ Not Verified |
| **SalesOrder** | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ❌ Not Verified |

### Details & Deficiencies
While the `version` field was successfully added to the database schemas for all of the above models, the actual enforcement logic was only implemented in `ProcurementService` for `indentAction` and `poAction`.

Furthermore, even in the implemented models:
1. **Zero-Row Update Checks**: Prisma does not naturally return `409` if an update affects 0 rows (it returns a `P2025` error, which NestJS defaults to `500` or `404` depending on the filter, rather than a clean `409`). The code relies solely on the preceding JS check (`if (row.version !== expectedVersion) throw 409`).
2. **Transaction Bounds**: While the state change is within a transaction (`tx.purchaseOrder.update`), the Status History insertion (which runs via an asynchronous listener or separate service call elsewhere in the codebase) is *not* bound within that identical atomic `tx` block in `poAction()`.
