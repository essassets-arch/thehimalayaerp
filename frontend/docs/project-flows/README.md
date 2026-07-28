# Comprehensive ERP Project Business Process Flows

> **Authority notice:** The repository-level
> [Complete Sales Order Lifecycle ERP Workflow](../../../docs/complete-sales-order-lifecycle.md)
> is the canonical Sales ERP specification. The Sales Order document in this
> directory provides supporting operational detail and must not override the
> canonical workflow or acceptance rules.

This directory contains the operational user journeys, business process workflows, decision points, and stage-by-stage documentation for the 4 core enterprise modules:

1. **[1. Sales Order, Replacement & Return Flow](./1_sales_order_flow.md)**
   - Lead Generation $\rightarrow$ Sample Request $\rightarrow$ Quotation/PI $\rightarrow$ Sales Order $\rightarrow$ Credit Check $\rightarrow$ Dispatch $\rightarrow$ Sales Return (RMA) $\rightarrow$ Replacement Order.

2. **[2. Material Request Flow](./2_material_request_flow.md)**
   - Shopfloor Need $\rightarrow$ Requisition Entry $\rightarrow$ HOD Approval $\rightarrow$ Store Availability Check $\rightarrow$ Store Issue Slip $\rightarrow$ Automatic Purchase Indent Trigger for Shortages.

3. **[3. Purchase Indent & Material Flow (P2P)](./3_purchase_indent_flow.md)**
   - Purchase Indent $\rightarrow$ Multi-Tier Approval $\rightarrow$ RFQ & Vendor Selection $\rightarrow$ Purchase Order $\rightarrow$ Gate Entry $\rightarrow$ QC Inspection $\rightarrow$ GRN Store Entry $\rightarrow$ 3-Way Match & Payment.

4. **[4. HR Salary Preparation & Payroll Flow](./4_hr_salary_prep_flow.md)**
   - Biometric Attendance Sync $\rightarrow$ Leave/OT Regularization $\rightarrow$ Attendance Freeze $\rightarrow$ Salary Computation $\rightarrow$ Review & Approval $\rightarrow$ Bank Disbursement File $\rightarrow$ Payslip Distribution.
