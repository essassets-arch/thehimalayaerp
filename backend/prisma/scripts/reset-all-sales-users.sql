-- ==============================================================================
-- MASTER TASK: RESET ALL SALES OPERATIONAL DATA TO FRESH DATABASE STATE (SQL)
-- ==============================================================================
-- Target: Live/Production PostgreSQL ERP Database
-- Purpose: Remove all Leads, Quotations, Samples, Sales Orders, Complaints, Returns,
--          Replacements, and dependent workflow records across ALL users.
--
-- PRESERVED MASTER DATA:
--   - Users
--   - Roles & Permissions
--   - Companies & Branches
--   - Customers
--   - Products & Product Categories
--   - Warehouses
--   - Raw Materials & Finished Goods Master
--   - Application Configuration & Sequences
-- ==============================================================================

BEGIN;

-- 1. Payment Allocations & Payment Follow-ups
DELETE FROM "PaymentAllocation";
DELETE FROM "CustomerPaymentAllocation";
DELETE FROM "FollowUp";

-- 2. Lead Activities & Leads
DELETE FROM "LeadActivity";
DELETE FROM "Lead";

-- 3. Quotation Items & Quotations
DELETE FROM "QuotationItem";
DELETE FROM "Quotation";

-- 4. Sample Items, Sample Histories & Sample Requests
DELETE FROM "SampleItem";
DELETE FROM "SampleHistory";
DELETE FROM "SampleRequest";

-- 5. Sales Order Downstream Workflows (Child Items, Invoices, Dispatches, Production)
DELETE FROM "SalesOrderHistory";
DELETE FROM "SalesOrderCreditReview";
DELETE FROM "SalesOrderAllocation";
DELETE FROM "InvoiceItem";
DELETE FROM "SalesInvoice";
DELETE FROM "DispatchItem";
DELETE FROM "Dispatch";
DELETE FROM "QCInspection";
DELETE FROM "ProductionBatch";
DELETE FROM "ProductionShiftEntry";
DELETE FROM "ProductionScrapEntry";
DELETE FROM "WorkOrder";
DELETE FROM "ProductionPlan";
DELETE FROM "SalesOrderItem";
DELETE FROM "SalesOrder";

-- 6. Customer Complaints
DELETE FROM "CustomerComplaint";

-- 7. Returns & Dependent Inspection / Credit Notes
DELETE FROM "ReturnGateEntry";
DELETE FROM "CreditNote";
DELETE FROM "ReturnQcInspectionItem";
DELETE FROM "ReturnQcInspection";
DELETE FROM "SalesReturnItem";
DELETE FROM "SalesReturn";

-- 8. Replacement Requests & Orders
DELETE FROM "ReplacementOrderHistory";
DELETE FROM "ReplacementOrderItem";
DELETE FROM "ReplacementOrder";
DELETE FROM "ReplacementRequestItem";
DELETE FROM "ReplacementRequest";

COMMIT;

-- ==============================================================================
-- POST-RESET VERIFICATION AUDIT (EVERY COUNT MUST BE 0)
-- ==============================================================================
SELECT 'Leads' AS table_name, COUNT(*) AS count FROM "Lead"
UNION ALL
SELECT 'Quotations', COUNT(*) FROM "Quotation"
UNION ALL
SELECT 'Samples', COUNT(*) FROM "SampleRequest"
UNION ALL
SELECT 'Sales Orders', COUNT(*) FROM "SalesOrder"
UNION ALL
SELECT 'Complaints', COUNT(*) FROM "CustomerComplaint"
UNION ALL
SELECT 'Returns', COUNT(*) FROM "SalesReturn"
UNION ALL
SELECT 'Replacements', COUNT(*) FROM "ReplacementRequest";
