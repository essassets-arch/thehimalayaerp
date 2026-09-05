-- Wipe all data for Sales 14 / SA (sales14@himalayaerp.com)

DO $$
DECLARE
  v_user_ids TEXT[];
  v_lead_ids TEXT[];
  v_quote_ids TEXT[];
  v_order_ids TEXT[];
  v_plan_ids TEXT[];
  v_wo_ids TEXT[];
  v_dispatch_ids TEXT[];
BEGIN
  -- 1. Identify User IDs
  SELECT ARRAY_AGG(id) INTO v_user_ids
  FROM "User"
  WHERE "email" ILIKE '%sales14%' OR "name" ILIKE '%Sales 14%' OR "name" ILIKE '%Sales Fourteen%' OR "name" = 'SA';

  -- 2. Identify Lead IDs
  SELECT ARRAY_AGG(id) INTO v_lead_ids
  FROM "Lead"
  WHERE "salesExecutiveId" = ANY(v_user_ids)
     OR "createdById" = ANY(v_user_ids)
     OR "assignedToId" = ANY(v_user_ids)
     OR "contactPerson" = 'SA'
     OR "contactPerson" ILIKE '%Sales 14%'
     OR "remarks" ILIKE '%sales14%'
     OR "remarks" ILIKE '%Sales 14%';

  -- 3. Identify Quotation IDs
  SELECT ARRAY_AGG(id) INTO v_quote_ids
  FROM "Quotation"
  WHERE "salesExecutiveId" = ANY(v_user_ids)
     OR "createdById" = ANY(v_user_ids)
     OR "leadId" = ANY(v_lead_ids)
     OR "remarks" ILIKE '%sales14%'
     OR "remarks" ILIKE '%Sales 14%';

  -- 4. Identify Sales Order IDs
  SELECT ARRAY_AGG(id) INTO v_order_ids
  FROM "SalesOrder"
  WHERE "salesExecutiveId" = ANY(v_user_ids)
     OR "createdById" = ANY(v_user_ids)
     OR "sourceQuotationId" = ANY(v_quote_ids)
     OR "quotationId" = ANY(v_quote_ids)
     OR "remarks" ILIKE '%sales14%'
     OR "remarks" ILIKE '%Sales 14%';

  -- 5. Identify Production Plans & Work Orders & Dispatches
  SELECT ARRAY_AGG(id) INTO v_plan_ids FROM "ProductionPlan" WHERE "salesOrderId" = ANY(v_order_ids);
  SELECT ARRAY_AGG(id) INTO v_wo_ids FROM "WorkOrder" WHERE "productionPlanId" = ANY(v_plan_ids) OR "salesOrderId" = ANY(v_order_ids);
  SELECT ARRAY_AGG(id) INTO v_dispatch_ids FROM "Dispatch" WHERE "salesOrderId" = ANY(v_order_ids);

  -- Cascade Deletions
  IF v_dispatch_ids IS NOT NULL AND ARRAY_LENGTH(v_dispatch_ids, 1) > 0 THEN
    DELETE FROM "DispatchItem" WHERE "dispatchId" = ANY(v_dispatch_ids);
    DELETE FROM "Dispatch" WHERE "id" = ANY(v_dispatch_ids);
  END IF;

  IF v_wo_ids IS NOT NULL AND ARRAY_LENGTH(v_wo_ids, 1) > 0 THEN
    DELETE FROM "QualityInspection" WHERE "workOrderId" = ANY(v_wo_ids);
    DELETE FROM "DailyReportItem" WHERE "workOrderId" = ANY(v_wo_ids);
    DELETE FROM "WorkOrder" WHERE "id" = ANY(v_wo_ids);
  END IF;

  IF v_plan_ids IS NOT NULL AND ARRAY_LENGTH(v_plan_ids, 1) > 0 THEN
    DELETE FROM "MaterialRequestItem" WHERE "materialRequestId" IN (SELECT id FROM "MaterialRequest" WHERE "productionPlanId" = ANY(v_plan_ids));
    DELETE FROM "MaterialRequest" WHERE "productionPlanId" = ANY(v_plan_ids);
    DELETE FROM "ProductionPlan" WHERE "id" = ANY(v_plan_ids);
  END IF;

  IF v_order_ids IS NOT NULL AND ARRAY_LENGTH(v_order_ids, 1) > 0 THEN
    DELETE FROM "CustomerPayment" WHERE "salesOrderId" = ANY(v_order_ids);
    DELETE FROM "SalesReturnItem" WHERE "salesReturnId" IN (SELECT id FROM "SalesReturn" WHERE "salesOrderId" = ANY(v_order_ids));
    DELETE FROM "SalesReturn" WHERE "salesOrderId" = ANY(v_order_ids);
    DELETE FROM "ReplacementOrderItem" WHERE "salesOrderId" = ANY(v_order_ids);
    DELETE FROM "ReplacementRequestItem" WHERE "replacementRequestId" IN (SELECT id FROM "ReplacementRequest" WHERE "salesOrderId" = ANY(v_order_ids));
    DELETE FROM "ReplacementRequest" WHERE "salesOrderId" = ANY(v_order_ids);
    DELETE FROM "SalesOrderItemAllocation" WHERE "salesOrderItemId" IN (SELECT id FROM "SalesOrderItem" WHERE "salesOrderId" = ANY(v_order_ids));
    DELETE FROM "SalesOrderItem" WHERE "salesOrderId" = ANY(v_order_ids);
    DELETE FROM "SalesOrder" WHERE "id" = ANY(v_order_ids);
  END IF;

  IF v_quote_ids IS NOT NULL AND ARRAY_LENGTH(v_quote_ids, 1) > 0 THEN
    DELETE FROM "QuotationItem" WHERE "quotationId" = ANY(v_quote_ids);
    DELETE FROM "Quotation" WHERE "id" = ANY(v_quote_ids);
  END IF;

  IF v_lead_ids IS NOT NULL AND ARRAY_LENGTH(v_lead_ids, 1) > 0 THEN
    DELETE FROM "CustomerComplaint" WHERE "leadId" = ANY(v_lead_ids);
    DELETE FROM "SampleItem" WHERE "sampleRequestId" IN (SELECT id FROM "SampleRequest" WHERE "leadId" = ANY(v_lead_ids));
    DELETE FROM "SampleRequest" WHERE "leadId" = ANY(v_lead_ids);
    DELETE FROM "LeadActivity" WHERE "leadId" = ANY(v_lead_ids);
    DELETE FROM "Lead" WHERE "id" = ANY(v_lead_ids);
  END IF;

  IF v_user_ids IS NOT NULL AND ARRAY_LENGTH(v_user_ids, 1) > 0 THEN
    DELETE FROM "Notification" WHERE "userId" = ANY(v_user_ids);
  END IF;

END $$;
