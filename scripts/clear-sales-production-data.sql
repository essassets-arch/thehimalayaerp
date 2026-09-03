-- ====================================================================
-- SQL Script: Purge all Sales, Production, QC, Dispatch, Finance & Customer data
-- Himalaya ERP System
-- ====================================================================

BEGIN;

-- 1. Truncate all transactional & customer records with CASCADE
TRUNCATE TABLE 
  "DispatchDailyReportItem",
  "DispatchDailyReport",
  "DispatchItem",
  "Dispatch",
  "FinishedGoods",
  "QCInspection",
  "ProductionTestingRecord",
  "ProductionScrapEntry",
  "ProductionShiftEntry",
  "ProductionBatch",
  "ProductionStatusHistory",
  "WorkOrder",
  "ProductionPlan",
  "ProductionDailyReportItem",
  "ProductionDailyReport",
  "production_targets",
  "InvoiceItem",
  "PaymentAllocation",
  "CustomerPaymentAllocation",
  "CustomerPayment",
  "CreditNote",
  "SalesInvoice",
  "CustomerLedger",
  "ReturnQcInspectionItem",
  "ReturnQcInspection",
  "ReturnGateEntry",
  "SalesReturnItem",
  "SalesReturn",
  "ReplacementOrderHistory",
  "ReplacementOrderItem",
  "ReplacementOrder",
  "ReplacementRequestItem",
  "ReplacementRequest",
  "CustomerComplaintItem",
  "CustomerComplaint",
  "SalesOrderLoss",
  "OrderAmendment",
  "SalesOrderHistory",
  "SalesOrderAllocation",
  "SalesOrderCreditReview",
  "SalesOrderItem",
  "SalesOrder",
  "QuotationTerm",
  "QuotationItem",
  "Quotation",
  "SampleHistory",
  "SampleItem",
  "SampleRequest",
  "FollowUp",
  "LeadActivity",
  "Lead",
  "SalesTarget",
  "BackOfficeDailyReport",
  "Customer"
CASCADE;

-- 2. Clean Workflow Histories
DELETE FROM "WorkflowHistory" 
WHERE "entityType" IN (
  'SalesOrder', 'Lead', 'Quotation', 'WorkOrder', 'ProductionPlan', 
  'Dispatch', 'SampleRequest', 'CustomerComplaint', 'CustomerPayment', 
  'SalesReturn', 'ReplacementRequest', 'SalesInvoice'
);

-- 3. Clean related Notifications
DELETE FROM "Notification" 
WHERE "type" LIKE 'SALES_%' 
   OR "type" LIKE 'PRODUCTION_%' 
   OR "type" LIKE 'DISPATCH_%'
   OR "type" LIKE 'ORDER_%'
   OR "type" LIKE 'QUOTATION_%'
   OR "type" LIKE 'LEAD_%'
   OR "type" LIKE 'CUSTOMER_%'
   OR "type" = 'GENERAL';

-- 4. Clean sales/dispatch related Inventory Transactions
DELETE FROM "InventoryTransaction" 
WHERE "referenceType" IN ('SALES_ORDER', 'DISPATCH', 'WORK_ORDER', 'RETURN', 'REPLACEMENT');

-- 5. Reset Document Sequence Numbers
UPDATE "DocumentSequence" 
SET "currentNumber" = 0 
WHERE "documentType" IN ('SO', 'QT', 'WO', 'INV', 'DISP', 'PAY', 'RET', 'REPL', 'SAMP', 'PROD', 'LEAD', 'CUST', 'CR');

COMMIT;
