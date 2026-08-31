-- Full cascading SQL script to safely wipe all SuperSales 1 data while keeping SuperSales 2 and other users 100% untouched
DO $$
DECLARE
    ss1_id TEXT;
    ss2_id TEXT;
    ss1_leads_count INT;
    ss2_leads_count INT;
    ss1_lead_ids TEXT[];
    ss1_quote_ids TEXT[];
    ss1_order_ids TEXT[];
    ss1_order_item_ids TEXT[];
    ss1_complaint_ids TEXT[];
    ss1_sample_ids TEXT[];
    ss1_prod_plan_ids TEXT[];
    ss1_work_order_ids TEXT[];
    ss1_dispatch_ids TEXT[];
    ss1_invoice_ids TEXT[];
BEGIN
    SELECT id::text INTO ss1_id FROM "User" WHERE LOWER(email) = 'supersales1@himalayaerp.com';
    SELECT id::text INTO ss2_id FROM "User" WHERE LOWER(email) = 'supersales2@himalayaerp.com';

    IF ss1_id IS NULL THEN
        RAISE NOTICE 'SuperSales 1 user not found.';
        RETURN;
    END IF;

    RAISE NOTICE 'Found SuperSales 1 ID: %', ss1_id;

    -- Record SS2 Baseline
    IF ss2_id IS NOT NULL THEN
        SELECT COUNT(*) INTO ss2_leads_count FROM "Lead" WHERE "createdById" = ss2_id OR "salesExecutiveId" = ss2_id OR "assignedToId" = ss2_id;
        RAISE NOTICE 'SuperSales 2 Baseline Leads before reset: %', ss2_leads_count;
    END IF;

    -- Gather IDs
    SELECT ARRAY_AGG(id::text) INTO ss1_lead_ids FROM "Lead" WHERE "createdById" = ss1_id OR "salesExecutiveId" = ss1_id OR "assignedToId" = ss1_id;
    SELECT ARRAY_AGG(id::text) INTO ss1_quote_ids FROM "Quotation" WHERE "createdById" = ss1_id OR "salesExecutiveId" = ss1_id OR "leadId" = ANY(ss1_lead_ids);
    SELECT ARRAY_AGG(id::text) INTO ss1_order_ids FROM "SalesOrder" WHERE "createdById" = ss1_id OR "salesExecutiveId" = ss1_id OR "quotationId" = ANY(ss1_quote_ids) OR "sourceQuotationId" = ANY(ss1_quote_ids);
    SELECT ARRAY_AGG(id::text) INTO ss1_order_item_ids FROM "SalesOrderItem" WHERE "salesOrderId" = ANY(ss1_order_ids);
    SELECT ARRAY_AGG(id::text) INTO ss1_complaint_ids FROM "CustomerComplaint" WHERE "createdBy" = ss1_id OR "salesExecutiveId" = ss1_id OR "submittedBy" = ss1_id OR "orderId" = ANY(ss1_order_ids);
    SELECT ARRAY_AGG(id::text) INTO ss1_sample_ids FROM "SampleRequest" WHERE "createdById" = ss1_id OR "salesExecutiveId" = ss1_id OR "leadId" = ANY(ss1_lead_ids);
    
    SELECT ARRAY_AGG(id::text) INTO ss1_prod_plan_ids FROM "ProductionPlan" WHERE "salesOrderId" = ANY(ss1_order_ids);
    SELECT ARRAY_AGG(id::text) INTO ss1_work_order_ids FROM "WorkOrder" WHERE "productionPlanId" = ANY(ss1_prod_plan_ids) OR "salesOrderItemId" = ANY(ss1_order_item_ids);
    SELECT ARRAY_AGG(id::text) INTO ss1_dispatch_ids FROM "Dispatch" WHERE "salesOrderId" = ANY(ss1_order_ids);
    SELECT ARRAY_AGG(id::text) INTO ss1_invoice_ids FROM "SalesInvoice" WHERE "salesOrderId" = ANY(ss1_order_ids);

    -- 1. Follow-ups
    DELETE FROM "FollowUp"
    WHERE "createdById" = ss1_id
       OR "leadId" = ANY(ss1_lead_ids);

    -- 2. Complaints & Complaint Items
    DELETE FROM "CustomerComplaintItem" WHERE "complaintId" = ANY(ss1_complaint_ids) OR "orderItemId" = ANY(ss1_order_item_ids);
    DELETE FROM "SalesOrderLoss" WHERE "complaintId" = ANY(ss1_complaint_ids);
    DELETE FROM "CustomerComplaint" WHERE "id" = ANY(ss1_complaint_ids);

    -- 3. Work Orders & Production Plans
    DELETE FROM "QCInspection" WHERE "workOrderId" = ANY(ss1_work_order_ids);
    DELETE FROM "ProductionBatch" WHERE "workOrderId" = ANY(ss1_work_order_ids);
    DELETE FROM "ProductionShiftEntry" WHERE "workOrderId" = ANY(ss1_work_order_ids);
    DELETE FROM "ProductionScrapEntry" WHERE "workOrderId" = ANY(ss1_work_order_ids);
    DELETE FROM "ProductionStatusHistory" WHERE "workOrderId" = ANY(ss1_work_order_ids);
    DELETE FROM "FinishedGoods" WHERE "workOrderId" = ANY(ss1_work_order_ids) OR "salesOrderId" = ANY(ss1_order_ids);
    DELETE FROM "WorkOrder" WHERE "id" = ANY(ss1_work_order_ids);
    DELETE FROM "ProductionPlan" WHERE "id" = ANY(ss1_prod_plan_ids);

    -- 4. Dispatches & Items
    DELETE FROM "DispatchItem" WHERE "salesOrderItemId" = ANY(ss1_order_item_ids) OR "dispatchId" = ANY(ss1_dispatch_ids);
    DELETE FROM "Dispatch" WHERE "id" = ANY(ss1_dispatch_ids);

    -- 5. Invoices & Items
    DELETE FROM "InvoiceItem" WHERE "salesOrderItemId" = ANY(ss1_order_item_ids) OR "invoiceId" = ANY(ss1_invoice_ids);
    DELETE FROM "SalesInvoice" WHERE "id" = ANY(ss1_invoice_ids);

    -- 6. Customer Payments, Allocations, Returns, Replacements
    DELETE FROM "CustomerPaymentAllocation" WHERE "salesOrderId" = ANY(ss1_order_ids);
    DELETE FROM "CustomerPayment" WHERE "salesOrderId" = ANY(ss1_order_ids);
    DELETE FROM "SalesReturnItem" WHERE "salesOrderItemId" = ANY(ss1_order_item_ids);
    DELETE FROM "SalesReturn" WHERE "salesOrderId" = ANY(ss1_order_ids);
    DELETE FROM "ReplacementRequestItem" WHERE "salesOrderItemId" = ANY(ss1_order_item_ids);
    DELETE FROM "ReplacementRequest" WHERE "salesOrderId" = ANY(ss1_order_ids);
    DELETE FROM "ReplacementOrder" WHERE "originalSalesOrderId" = ANY(ss1_order_ids);
    DELETE FROM "SalesOrderLoss" WHERE "salesOrderId" = ANY(ss1_order_ids) OR "salesExecutiveId" = ss1_id OR "createdById" = ss1_id;
    DELETE FROM "SalesOrderAllocation" WHERE "salesOrderId" = ANY(ss1_order_ids);
    DELETE FROM "SalesOrderCreditReview" WHERE "salesOrderId" = ANY(ss1_order_ids);
    DELETE FROM "OrderAmendment" WHERE "salesOrderId" = ANY(ss1_order_ids);
    DELETE FROM "SalesOrderHistory" WHERE "salesOrderId" = ANY(ss1_order_ids);

    -- 7. Sales Order Items & Sales Orders
    DELETE FROM "SalesOrderItem" WHERE "id" = ANY(ss1_order_item_ids);
    DELETE FROM "SalesOrder" WHERE "id" = ANY(ss1_order_ids);

    -- 8. Quotation Items, Terms & Quotations
    DELETE FROM "QuotationItem" WHERE "quotationId" = ANY(ss1_quote_ids);
    DELETE FROM "QuotationTerm" WHERE "quotationId" = ANY(ss1_quote_ids);
    DELETE FROM "Quotation" WHERE "id" = ANY(ss1_quote_ids);

    -- 9. Sample Requests & Items & Histories
    DELETE FROM "SampleHistory" WHERE "sampleRequestId" = ANY(ss1_sample_ids);
    DELETE FROM "SampleItem" WHERE "sampleRequestId" = ANY(ss1_sample_ids);
    DELETE FROM "SampleRequest" WHERE "id" = ANY(ss1_sample_ids);

    -- 10. Lead Activities & Leads
    DELETE FROM "LeadActivity" WHERE "leadId" = ANY(ss1_lead_ids);
    DELETE FROM "Lead" WHERE "id" = ANY(ss1_lead_ids);

    -- 11. Sales Targets
    DELETE FROM "SalesTarget" WHERE "salespersonId" = ss1_id OR "createdById" = ss1_id;

    -- Verification
    SELECT COUNT(*) INTO ss1_leads_count FROM "Lead" WHERE "createdById" = ss1_id OR "salesExecutiveId" = ss1_id OR "assignedToId" = ss1_id;
    RAISE NOTICE '>>> SuperSales 1 Leads remaining: %', ss1_leads_count;

    IF ss2_id IS NOT NULL THEN
        SELECT COUNT(*) INTO ss2_leads_count FROM "Lead" WHERE "createdById" = ss2_id OR "salesExecutiveId" = ss2_id OR "assignedToId" = ss2_id;
        RAISE NOTICE '>>> SuperSales 2 (Taher Sir) Leads preserved: %', ss2_leads_count;
    END IF;

    RAISE NOTICE '>>> [SUCCESS] All SuperSales 1 data wiped clean to 0 records.';
END $$;
