# Himalaya ERP V2 — Phase 7 Functional Risk & Quality Inventory

## Functional Assurance & Regression Protection Matrix

| Risk Domain | Potential Vulnerability | Protection & Verification Standard | Status |
| :--- | :--- | :--- | :---: |
| **Authentication & Session** | Token expiration, unauthenticated access | Client middleware and auth store redirects to `/login` on 401 | ✅ **PASS** |
| **RBAC Authorization** | Cross-role URL tampering | Role-based navigation guards and API permission checks | ✅ **PASS** |
| **Stock Double-Deduction** | Concurrent material release requests | Database transactions and atomic balance updates | ✅ **PASS** |
| **Duplicate Document Sequence** | Concurrent order/challan creation | Atomic sequencing counters per entity prefix | ✅ **PASS** |
| **Sales Data Isolation** | Salesperson seeing peer deals | Filter by authenticated `salespersonId` where configured | ✅ **PASS** |
| **Financial Calculation Precision** | Floating point decimal truncation | Number formatting in INR / formatLakh with 2 decimal precision | ✅ **PASS** |
| **Payroll Discrepancies** | Unapproved salary disbursement | Hard prerequisite check on `SUPER_ADMIN_APPROVED` state | ✅ **PASS** |
