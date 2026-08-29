# Himalaya ERP V2 — Phase 8 Data Integrity Report

## 1. Inventory Mathematical Invariant

- Formula: `availableQuantity = quantity - reservedQuantity`
- Boundary Condition: `availableQuantity >= 0`
- Verification: Atomic deductions and reservations prevent race conditions and negative inventory balances.

## 2. Document Numbering Uniqueness

- Unique constraint enforced on `documentNumber` across all 14 entity tables.
- Concurrency safety guaranteed via atomic sequence generator in `DocumentSequence` table.

## 3. Financial & Ledger Reconciliation

- Double-entry balance integrity: Total Debits == Total Credits.
- Order financial closure strictly requires `outstandingAmount == 0` before transitioning to `FULL_PAID` and `ORDER_CLOSED`.

## 4. Payroll Pipeline Immutability

- Historical salary snapshots are immutable upon reaching `SUPER_ADMIN_APPROVED` and `PAID` states.
