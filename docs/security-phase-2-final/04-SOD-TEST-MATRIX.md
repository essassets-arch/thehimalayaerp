# 04 - SEGREGATION OF DUTIES (SOD) MATRIX

This document outlines the current state of Segregation of Duties logic within the API service layer.

*Legend: ✅ Verified, ⚠️ Partially Verified, ❌ Not Verified*

| Domain Entity | Action Blocked | Enforced In Code? | Override Support? | Domain-Specific Override Rule? | Overall Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Purchase Indent** | Creator cannot approve own indent | ✅ Yes (`row.requestedById === actorId`) | ✅ Yes | ❌ No (Uses global `override.sod`) | ⚠️ Partially Verified |
| **Purchase Order** | Creator cannot approve own PO | ✅ Yes (`row.createdById === actorId`) | ✅ Yes | ❌ No (Uses global `override.sod`) | ⚠️ Partially Verified |
| **GRN** | Receiver cannot approve own GRN | ❌ No | ❌ No | ❌ No | ❌ Not Verified |
| **Vendor Invoice** | Creator cannot approve own invoice | ❌ No | ❌ No | ❌ No | ❌ Not Verified |
| **Vendor Payment** | Creator cannot approve own payment | ❌ No | ❌ No | ❌ No | ❌ Not Verified |
| **Customer Payment** | Collector cannot verify payment | ❌ No | ❌ No | ❌ No | ❌ Not Verified |
| **Payroll** | Preparer cannot approve payroll | ❌ No | ❌ No | ❌ No | ❌ Not Verified |
| **QC** | Operator cannot approve own QC result | ❌ No | ❌ No | ❌ No | ❌ Not Verified |
| **Recruitment** | Requester cannot fulfill own request | ❌ No | ❌ No | ❌ No | ❌ Not Verified |
| **Admin Perms** | Admin cannot escalate own permissions | ❌ No | ❌ No | ❌ No | ❌ Not Verified |

### Details
The `ProcurementService` correctly enforces strict isolation between Request/Creation and Approval for Purchase Indents and Purchase Orders, returning HTTP 409 when violated. 

However, two deficiencies exist relative to the Phase 2 requirements:
1.  **Global vs Domain Override**: Overrides currently require a global `override.sod` permission (checked in `procurement.controller.ts`) rather than specific `procurement.indents.override` rules as requested.
2.  **Missing Domains**: SOD enforcement is not yet implemented at the service level for GRN, Invoices, Payments, Payroll, QC, Recruitment, or self-escalation.
