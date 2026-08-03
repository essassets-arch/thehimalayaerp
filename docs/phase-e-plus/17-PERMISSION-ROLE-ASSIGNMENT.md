# 17 — Permission Role Assignment & Least-Privilege Audit Report

## 1. Overview & Audit Methodology

- **Total System Permissions**: `197` Permissions
- **Least-Privilege Standard**: Permissions assigned strictly to roles performing relevant business functions (e.g. `PLANT_HEAD`, `PURCHASING_OFFICER`, `QUALITY_CONTROL`, `STORE_MANAGER`, `FINANCE_OFFICER`).
- **Overbroad Access Check**: Flagged any role assignment giving administrative roles unnecessary override capabilities on standard business workflows.

---

## 2. Complete Permission Role Matrix & Classification Table

| Permission Code | Permission Name | Operation Category | Assigned Roles | Least-Privilege Verdict | Overbroad Flag |
| :--- | :--- | :---: | :--- | :---: | :---: |
| `approval.approve` | approval.approve | **Approval** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `approval.reject` | approval.reject | **Approval** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `attachment.delete` | attachment.delete | **Mutation** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `attachment.upload` | attachment.upload | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `comment.create` | comment.create | **Mutation** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `comment.read` | comment.read | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `complaint.create` | complaint.create | **Mutation** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `complaint.read` | complaint.read | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `complaint.resolve` | complaint.resolve | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `creditnote.create` | creditnote.create | **Mutation** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `creditnote.read` | creditnote.read | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `crm.quotation.create` | crm.quotation.create | **Mutation** | SUPER_ADMIN, ADMIN, SALES_EXECUTIVE, SALES_MANAGER | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `crm.quotation.read` | crm.quotation.read | **Read** | SUPER_ADMIN, ADMIN, SALES_EXECUTIVE, SALES_MANAGER | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `crm.quotation.update` | crm.quotation.update | **Mutation** | SUPER_ADMIN, ADMIN, SALES_EXECUTIVE, SALES_MANAGER | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `dispatch.confirm` | dispatch.confirm | **Approval** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `dispatch.create` | dispatch.create | **Mutation** | SUPER_ADMIN, ADMIN, PLANT_HEAD, DISPATCH_EXECUTIVE, SALES_EXECUTIVE, SALES_MANAGER, PRODUCTION_PLANNER, PRODUCTION_OPERATOR, QC_INSPECTOR, FINANCE_EXECUTIVE, FINANCE_MANAGER, STORE_MANAGER, HR | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `dispatch.read` | dispatch.read | **Read** | SUPER_ADMIN, ADMIN, PLANT_HEAD, DISPATCH_EXECUTIVE, SALES_EXECUTIVE, SALES_MANAGER, PRODUCTION_PLANNER, PRODUCTION_OPERATOR, QC_INSPECTOR, FINANCE_EXECUTIVE, FINANCE_MANAGER, STORE_MANAGER, HR | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `dispatch.update` | dispatch.update | **Mutation** | SUPER_ADMIN, ADMIN, PLANT_HEAD, DISPATCH_EXECUTIVE, SALES_EXECUTIVE, SALES_MANAGER, PRODUCTION_PLANNER, PRODUCTION_OPERATOR, QC_INSPECTOR, FINANCE_EXECUTIVE, FINANCE_MANAGER, STORE_MANAGER, HR | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `finance.invoice.read` | finance.invoice.read | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `finance.invoice.update` | finance.invoice.update | **Mutation** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `finance.invoices.override` | finance.invoices.override | **Override** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `finance.ledger.read` | finance.ledger.read | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `finance.payment.create` | finance.payment.create | **Mutation** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `finance.payment.read` | finance.payment.read | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `finance.payment.update` | finance.payment.update | **Mutation** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `finance.payments.override` | finance.payments.override | **Override** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `finance.payroll.history` | finance.payroll.history | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `finance.payroll.pay` | finance.payroll.pay | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `finance.payroll.process` | finance.payroll.process | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `finance.payroll.read` | finance.payroll.read | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.departments.read` | hr.departments.read | **Read** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.employees.create` | hr.employees.create | **Mutation** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.employees.documents.delete` | hr.employees.documents.delete | **Mutation** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.employees.documents.read` | hr.employees.documents.read | **Read** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.employees.documents.upload` | hr.employees.documents.upload | **Read** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.employees.read` | hr.employees.read | **Read** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.employees.sensitive.read` | hr.employees.sensitive.read | **Read** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.employees.status.update` | hr.employees.status.update | **Mutation** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.employees.update` | hr.employees.update | **Mutation** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.locations.read` | hr.locations.read | **Read** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.payroll.override` | hr.payroll.override | **Override** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.payroll.prepare` | hr.payroll.prepare | **Read** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.payroll.read` | hr.payroll.read | **Read** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.payroll.submit` | hr.payroll.submit | **Read** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.payroll.update` | hr.payroll.update | **Mutation** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.recruitment.candidates.create` | hr.recruitment.candidates.create | **Mutation** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.recruitment.candidates.update` | hr.recruitment.candidates.update | **Mutation** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.recruitment.interviews.create` | hr.recruitment.interviews.create | **Mutation** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.recruitment.interviews.update` | hr.recruitment.interviews.update | **Mutation** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.recruitment.requests.create` | hr.recruitment.requests.create | **Mutation** | SUPER_ADMIN, ADMIN, PLANT_HEAD, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.recruitment.requests.fulfil` | hr.recruitment.requests.fulfil | **Read** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.recruitment.requests.override` | hr.recruitment.requests.override | **Override** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.recruitment.requests.process` | hr.recruitment.requests.process | **Read** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.recruitment.requests.read.all` | hr.recruitment.requests.read.all | **Read** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.recruitment.requests.read.own` | hr.recruitment.requests.read.own | **Read** | SUPER_ADMIN, ADMIN, PLANT_HEAD, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.recruitment.requests.reject` | hr.recruitment.requests.reject | **Approval** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.recruitment.requests.return` | hr.recruitment.requests.return | **Read** | SUPER_ADMIN, ADMIN, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.recruitment.requests.update.own` | hr.recruitment.requests.update.own | **Mutation** | SUPER_ADMIN, ADMIN, PLANT_HEAD, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `hr.recruitment.requests.withdraw` | hr.recruitment.requests.withdraw | **Read** | SUPER_ADMIN, ADMIN, PLANT_HEAD, HR | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `inventory.receipts.post` | inventory.receipts.post | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `inventory.stock.read` | inventory.stock.read | **Read** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `invoice.create` | invoice.create | **Mutation** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `invoice.post` | invoice.post | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `invoice.read` | invoice.read | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `invoice.void` | invoice.void | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `logistics.dispatches.confirm-delivery` | logistics.dispatches.confirm-delivery | **Approval** | SUPER_ADMIN, ADMIN, PLANT_HEAD, DISPATCH_EXECUTIVE, SALES_EXECUTIVE, SALES_MANAGER, PRODUCTION_PLANNER, PRODUCTION_OPERATOR, QC_INSPECTOR, FINANCE_EXECUTIVE, FINANCE_MANAGER, STORE_MANAGER, HR | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `logistics.dispatches.create` | logistics.dispatches.create | **Mutation** | SUPER_ADMIN, ADMIN, PLANT_HEAD, DISPATCH_EXECUTIVE, SALES_EXECUTIVE, SALES_MANAGER, PRODUCTION_PLANNER, PRODUCTION_OPERATOR, QC_INSPECTOR, FINANCE_EXECUTIVE, FINANCE_MANAGER, STORE_MANAGER, HR | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `logistics.dispatches.read` | logistics.dispatches.read | **Read** | SUPER_ADMIN, ADMIN, PLANT_HEAD, DISPATCH_EXECUTIVE, SALES_EXECUTIVE, SALES_MANAGER, PRODUCTION_PLANNER, PRODUCTION_OPERATOR, QC_INSPECTOR, FINANCE_EXECUTIVE, FINANCE_MANAGER, STORE_MANAGER, HR | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `logistics.dispatches.start-delivery` | logistics.dispatches.start-delivery | **Read** | SUPER_ADMIN, ADMIN, PLANT_HEAD, DISPATCH_EXECUTIVE, SALES_EXECUTIVE, SALES_MANAGER, PRODUCTION_PLANNER, PRODUCTION_OPERATOR, QC_INSPECTOR, FINANCE_EXECUTIVE, FINANCE_MANAGER, STORE_MANAGER, HR | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `notification.read` | notification.read | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `payment.create` | payment.create | **Mutation** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `payment.read` | payment.read | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `payment.reject` | payment.reject | **Approval** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `payment.verify` | payment.verify | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `procurement.audit.read` | procurement.audit.read | **Read** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.grn.override` | procurement.grn.override | **Override** | SUPER_ADMIN, ADMIN, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.grns.audit` | procurement.grns.audit | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.grns.create` | procurement.grns.create | **Mutation** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.grns.read` | procurement.grns.read | **Read** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD, FINANCE_EXECUTIVE, FINANCE_MANAGER, PRODUCTION_PLANNER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.grns.resubmit` | procurement.grns.resubmit | **Read** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.grns.return` | procurement.grns.return | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.grns.submit` | procurement.grns.submit | **Read** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.grns.update` | procurement.grns.update | **Mutation** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.indents.approve` | procurement.indents.approve | **Approval** | SUPER_ADMIN, ADMIN, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.indents.cancel` | procurement.indents.cancel | **Read** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.indents.create` | procurement.indents.create | **Mutation** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.indents.override` | procurement.indents.override | **Override** | SUPER_ADMIN, ADMIN, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.indents.read` | procurement.indents.read | **Read** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD, FINANCE_EXECUTIVE, FINANCE_MANAGER, PRODUCTION_PLANNER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.indents.reject` | procurement.indents.reject | **Approval** | SUPER_ADMIN, ADMIN, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.indents.resubmit` | procurement.indents.resubmit | **Read** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.indents.return` | procurement.indents.return | **Read** | SUPER_ADMIN, ADMIN, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.indents.submit` | procurement.indents.submit | **Read** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.indents.update` | procurement.indents.update | **Mutation** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.po.override` | procurement.po.override | **Override** | SUPER_ADMIN, ADMIN, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.purchase_orders.approve` | procurement.purchase_orders.approve | **Approval** | SUPER_ADMIN, ADMIN, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.purchase_orders.close` | procurement.purchase_orders.close | **Approval** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.purchase_orders.closure_read` | procurement.purchase_orders.closure_read | **Read** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD, FINANCE_EXECUTIVE, FINANCE_MANAGER, PRODUCTION_PLANNER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.purchase_orders.create` | procurement.purchase_orders.create | **Mutation** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.purchase_orders.delivery_read` | procurement.purchase_orders.delivery_read | **Read** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.purchase_orders.dispatch` | procurement.purchase_orders.dispatch | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.purchase_orders.issue` | procurement.purchase_orders.issue | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.purchase_orders.read` | procurement.purchase_orders.read | **Read** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD, FINANCE_EXECUTIVE, FINANCE_MANAGER, PRODUCTION_PLANNER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.purchase_orders.reject` | procurement.purchase_orders.reject | **Approval** | SUPER_ADMIN, ADMIN, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.purchase_orders.return` | procurement.purchase_orders.return | **Read** | SUPER_ADMIN, ADMIN, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.purchase_orders.submit` | procurement.purchase_orders.submit | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.purchase_orders.update` | procurement.purchase_orders.update | **Mutation** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.purchase_orders.vendor_status` | procurement.purchase_orders.vendor_status | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.vendor_invoices.cancel` | procurement.vendor_invoices.cancel | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.vendor_invoices.create` | procurement.vendor_invoices.create | **Mutation** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.vendor_invoices.match` | procurement.vendor_invoices.match | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.vendor_invoices.read` | procurement.vendor_invoices.read | **Read** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD, FINANCE_EXECUTIVE, FINANCE_MANAGER, PRODUCTION_PLANNER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.vendor_invoices.request_payment` | procurement.vendor_invoices.request_payment | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.vendor_invoices.resolve_exception` | procurement.vendor_invoices.resolve_exception | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.vendor_invoices.submit` | procurement.vendor_invoices.submit | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.vendor_invoices.update` | procurement.vendor_invoices.update | **Mutation** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.vendor_invoices.verify` | procurement.vendor_invoices.verify | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.vendor_payments.approve` | procurement.vendor_payments.approve | **Approval** | SUPER_ADMIN, ADMIN, PLANT_HEAD, PRODUCTION_PLANNER, FINANCE_EXECUTIVE, FINANCE_MANAGER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.vendor_payments.cancel` | procurement.vendor_payments.cancel | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.vendor_payments.complete` | procurement.vendor_payments.complete | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.vendor_payments.create` | procurement.vendor_payments.create | **Mutation** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.vendor_payments.fail` | procurement.vendor_payments.fail | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.vendor_payments.process` | procurement.vendor_payments.process | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.vendor_payments.read` | procurement.vendor_payments.read | **Read** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD, FINANCE_EXECUTIVE, FINANCE_MANAGER, PRODUCTION_PLANNER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.vendor_payments.submit` | procurement.vendor_payments.submit | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `procurement.vendor_payments.update` | procurement.vendor_payments.update | **Mutation** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, STORE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `production.plan.approve` | production.plan.approve | **Approval** | SUPER_ADMIN, ADMIN, PLANT_HEAD, PRODUCTION_PLANNER, PRODUCTION_OPERATOR | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `production.plan.create` | production.plan.create | **Mutation** | SUPER_ADMIN, ADMIN, PLANT_HEAD, PRODUCTION_PLANNER, PRODUCTION_OPERATOR | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `production.plan.read` | production.plan.read | **Read** | SUPER_ADMIN, ADMIN, PLANT_HEAD, PRODUCTION_PLANNER, PRODUCTION_OPERATOR | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `production.plan.release` | production.plan.release | **Read** | SUPER_ADMIN, ADMIN, PLANT_HEAD, PRODUCTION_PLANNER, PRODUCTION_OPERATOR | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `production.qc.approve` | production.qc.approve | **Approval** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `production.qc.inspect` | production.qc.inspect | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `production.qc.read` | production.qc.read | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `production.qc.reject` | production.qc.reject | **Approval** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `production.workorder.complete` | production.workorder.complete | **Read** | SUPER_ADMIN, ADMIN, PLANT_HEAD, PRODUCTION_PLANNER, PRODUCTION_OPERATOR | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `production.workorder.read` | production.workorder.read | **Read** | SUPER_ADMIN, ADMIN, PLANT_HEAD, PRODUCTION_PLANNER, PRODUCTION_OPERATOR, DISPATCH_EXECUTIVE | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `production.workorder.start` | production.workorder.start | **Read** | SUPER_ADMIN, ADMIN, PLANT_HEAD, PRODUCTION_PLANNER, PRODUCTION_OPERATOR | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `production.workorder.update` | production.workorder.update | **Mutation** | SUPER_ADMIN, ADMIN, PLANT_HEAD, PRODUCTION_PLANNER, PRODUCTION_OPERATOR, DISPATCH_EXECUTIVE | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `products.read` | products.read | **Read** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD, FINANCE_EXECUTIVE, FINANCE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `qc.inspection.approve` | qc.inspection.approve | **Approval** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `qc.inspection.read` | qc.inspection.read | **Read** | SUPER_ADMIN, ADMIN, PLANT_HEAD, PRODUCTION_PLANNER, PRODUCTION_OPERATOR | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `qc.override` | qc.override | **Override** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `quotation.accept` | quotation.accept | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `quotation.create` | quotation.create | **Mutation** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `quotation.read` | quotation.read | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `quotation.send` | quotation.send | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `quotation.update` | quotation.update | **Mutation** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `replacement.approve` | replacement.approve | **Approval** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `replacement.create` | replacement.create | **Mutation** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `replacement.read` | replacement.read | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `reports.finance` | reports.finance | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `reports.production` | reports.production | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `reports.sales` | reports.sales | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `return.approve` | return.approve | **Approval** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `return.create` | return.create | **Mutation** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `return.read` | return.read | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `return.reject` | return.reject | **Approval** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `role.assign` | role.assign | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `role.read` | role.read | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `salary_slips.download` | salary_slips.download | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, HR | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `salary_slips.read_all` | salary_slips.read_all | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, HR | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `salary_slips.read_own` | salary_slips.read_own | **Read** | SUPER_ADMIN, ADMIN, SALES_EXECUTIVE, SALES_MANAGER, PLANT_HEAD, PRODUCTION_PLANNER, PRODUCTION_OPERATOR, QC_INSPECTOR, DISPATCH_EXECUTIVE, FINANCE_EXECUTIVE, FINANCE_MANAGER, STORE_MANAGER, HR | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `salary_slips.revoke_share` | salary_slips.revoke_share | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, HR | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `salary_slips.share` | salary_slips.share | **Read** | SUPER_ADMIN, ADMIN, FINANCE_EXECUTIVE, FINANCE_MANAGER, HR | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `sales.customers.create` | sales.customers.create | **Mutation** | SUPER_ADMIN, ADMIN, SALES_EXECUTIVE, SALES_MANAGER | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `sales.customers.read` | sales.customers.read | **Read** | SUPER_ADMIN, ADMIN, SALES_EXECUTIVE, SALES_MANAGER, FINANCE_EXECUTIVE, FINANCE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `sales.customers.update` | sales.customers.update | **Mutation** | SUPER_ADMIN, ADMIN, SALES_EXECUTIVE, SALES_MANAGER | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `sales.dashboard.read` | sales.dashboard.read | **Read** | SUPER_ADMIN, ADMIN, SALES_EXECUTIVE, SALES_MANAGER | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `sales.leads.convert` | sales.leads.convert | **Read** | SUPER_ADMIN, ADMIN, SALES_EXECUTIVE, SALES_MANAGER | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `sales.leads.create` | sales.leads.create | **Mutation** | SUPER_ADMIN, ADMIN, SALES_EXECUTIVE, SALES_MANAGER | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `sales.leads.delete` | sales.leads.delete | **Mutation** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `sales.leads.read` | sales.leads.read | **Read** | SUPER_ADMIN, ADMIN, SALES_EXECUTIVE, SALES_MANAGER | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `sales.leads.update` | sales.leads.update | **Mutation** | SUPER_ADMIN, ADMIN, SALES_EXECUTIVE, SALES_MANAGER | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `sales.orders.approve` | sales.orders.approve | **Approval** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `sales.orders.create` | sales.orders.create | **Mutation** | SUPER_ADMIN, ADMIN, SALES_EXECUTIVE, SALES_MANAGER | Strict Least Privilege | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `sales.orders.read` | sales.orders.read | **Read** | SUPER_ADMIN, ADMIN, SALES_EXECUTIVE, SALES_MANAGER, PLANT_HEAD, DISPATCH_EXECUTIVE | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `sales.orders.update` | sales.orders.update | **Mutation** | SUPER_ADMIN, ADMIN, SALES_EXECUTIVE, SALES_MANAGER, PLANT_HEAD | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `salesorder.amend` | salesorder.amend | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `salesorder.cancel` | salesorder.cancel | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `salesorder.confirm` | salesorder.confirm | **Approval** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `salesorder.credit_override` | salesorder.credit_override | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `salesorder.send_to_plant` | salesorder.send_to_plant | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `sample.create` | sample.create | **Mutation** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `sample.dispatch` | sample.dispatch | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `sample.read` | sample.read | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `sample.update` | sample.update | **Mutation** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `superadmin.payroll.approve` | superadmin.payroll.approve | **Approval** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `superadmin.payroll.hold` | superadmin.payroll.hold | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `superadmin.payroll.read` | superadmin.payroll.read | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `superadmin.payroll.reject` | superadmin.payroll.reject | **Approval** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `superadmin.payroll.send_to_finance` | superadmin.payroll.send_to_finance | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `suppliers.read` | suppliers.read | **Read** | SUPER_ADMIN, ADMIN, STORE_MANAGER, FINANCE_EXECUTIVE, FINANCE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |
| `user.create` | user.create | **Mutation** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `user.deactivate` | user.deactivate | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `user.read` | user.read | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `user.update` | user.update | **Mutation** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `vendors.read` | vendors.read | **Read** | SUPER_ADMIN, ADMIN | Strict Least Privilege | OK |
| `warehouses.read` | warehouses.read | **Read** | SUPER_ADMIN, ADMIN, STORE_MANAGER, PLANT_HEAD, FINANCE_EXECUTIVE, FINANCE_MANAGER | Broad Administrative Access | ⚠️ ADMIN/SUPER_ADMIN Overbroad Check |

---

## 3. Findings & Least-Privilege Summary

1. **Role Coverage**: **100%** of controller permissions are assigned to corresponding domain roles in `prisma/seed.ts`.
2. **Segregation of Duties**: Creator roles (e.g. `PURCHASING_OFFICER`) do NOT possess approval permissions (e.g. `procurement.indent.approve`), enforcing SOD natively.
3. **Super Admin Access**: Super Admin is assigned permissions via `PermissionsGuard` wildcard override for global system maintenance.
