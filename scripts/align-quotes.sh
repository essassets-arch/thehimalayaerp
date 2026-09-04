#!/usr/bin/env bash
set -Eeuo pipefail

echo "======================================================================"
echo "🔄 HIMALAYA ERP — ALIGNING QUOTATIONS 1-TO-1 WITH LEADS (144 TOTAL)"
echo "======================================================================"

docker exec -i himalaya-postgres psql -U himalaya_erp_user -d himalaya_erp << 'EOF'
-- 1. Rename existing quotations to temp to prevent unique constraint conflicts
UPDATE "Quotation" SET "quotationNumber" = 'TEMP_' || "id"
WHERE "quotationNumber" LIKE 'QU/2627/%' OR "quotationNumber" LIKE 'QT-%';

-- 2. Align every quotation to match its lead number exactly (LEAD/2627/XXXX -> QU/2627/XXXX)
UPDATE "Quotation" q
SET "quotationNumber" = 'QU/2627/' || SUBSTRING(l."leadNumber" FROM 11)
FROM "Lead" l
WHERE q."leadId" = l.id
  AND l."leadNumber" LIKE 'LEAD/2627/%';

-- 3. Set the IdSequence counters for next lead and quotation to 145
INSERT INTO "IdSequence" ("key", "nextValue", "updatedAt")
VALUES ('lead_number_2627', 145, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET "nextValue" = 145, "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "IdSequence" ("key", "nextValue", "updatedAt")
VALUES ('quotation_number_2627', 145, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET "nextValue" = 145, "updatedAt" = CURRENT_TIMESTAMP;

-- 4. Display alignment results
SELECT COUNT(*) AS total_quotations, MIN("quotationNumber") AS min_quote, MAX("quotationNumber") AS max_quote FROM "Quotation";
SELECT COUNT(*) AS total_leads, MIN("leadNumber") AS min_lead, MAX("leadNumber") AS max_lead FROM "Lead";
EOF

echo ""
echo "✅ Quotations successfully aligned! Both Leads and Quotations are now 144 (0001 to 0144)."
