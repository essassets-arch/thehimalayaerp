const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArgIdx = args.indexOf('--limit');
const limit = limitArgIdx !== -1 ? parseInt(args[limitArgIdx + 1], 10) : null;

const filePath = args.find((a) => !a.startsWith('--') && (limitArgIdx === -1 || a !== String(limit))) 
  || path.join(__dirname, '../../leads.csv');

async function importLeads() {
  console.log(`\n🚀 LEAD IMPORT RUNNER (${isDryRun ? 'DRY-RUN / MOCK TEST MODE' : 'LIVE IMPORT MODE'})`);
  if (limit) console.log(`🔍 Limit applied: Testing only first ${limit} lead(s)`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ CSV file not found at: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8').trim();
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) {
    console.error('❌ CSV file is empty or missing data rows.');
    process.exit(1);
  }

  const isTab = lines[0].split('\t').length > 1;
  const rawHeaders = isTab ? lines[0].split('\t') : parseCsvLine(lines[0]);
  const headers = rawHeaders.map((h) => h.trim().replace(/^"/, '').replace(/"$/, ''));

  const totalRows = lines.length - 1;
  const rowsToProcess = limit ? Math.min(limit, totalRows) : totalRows;

  console.log(`📑 Total rows in file: ${totalRows} | Processing: ${rowsToProcess}`);

  // Pre-fetch valid foreign key sets from DB
  const dbCompany = await prisma.company.findFirst();
  const dbUser = await prisma.user.findFirst();
  const defaultCompanyId = dbCompany ? dbCompany.id : null;
  const defaultUserId = dbUser ? dbUser.id : null;

  const validWorkflowStates = new Set((await prisma.workflowState.findMany({ select: { id: true } })).map((w) => w.id));
  const validUsers = new Set((await prisma.user.findMany({ select: { id: true } })).map((u) => u.id));
  const validCompanies = new Set((await prisma.company.findMany({ select: { id: true } })).map((c) => c.id));
  const firstWorkflowState = validWorkflowStates.size > 0 ? Array.from(validWorkflowStates)[0] : null;

  let successCount = 0;
  let errorCount = 0;

  for (let i = 1; i <= rowsToProcess; i++) {
    const cols = isTab ? lines[i].split('\t') : parseCsvLine(lines[i]);
    if (cols.length < 3) continue;

    const row = {};
    headers.forEach((h, idx) => {
      let val = cols[idx] ? cols[idx].trim() : null;
      if (val) {
        val = val.replace(/^"/, '').replace(/"$/, '');
      }
      if (val === 'NULL' || val === '' || val === 'null') val = null;
      row[h] = val;
    });

    const leadNumber = row.leadNumber || row.leadNum || `LEAD-2026-${String(i).padStart(5, '0')}`;
    const companyName = row.companyName || row.company || 'Unknown Company';
    const contactPerson = row.contactPerson || row.contactPe || 'Contact Person';

    const rawWorkflow = row.workflowStateId || row.workflow;
    const rawCreatedBy = row.createdById || row.createdBy;
    const rawSalesExec = row.salesExecutiveId || rawCreatedBy;
    const rawAssigned = row.assignedToId || row.assignedT;
    const rawCompany = row.companyId;

    const dataPayload = {
      id: row.id || undefined,
      leadNumber,
      companyName,
      groupName: row.groupName || row.groupNam,
      projectName: row.projectName || row.projectNa,
      contactPerson,
      email: row.email,
      phone: row.phone,
      gstName: row.gstName,
      gstNumber: row.gstNumber || row.gstNumbe,
      address: parseJsonOrNull(row.address),
      source: sanitizeEnum(row.source, ['OTHER', 'WEBSITE', 'REFERRAL', 'COLD_CALL', 'EXHIBITION', 'INBOUND']),
      productInterest: row.productInterest || row.productIn,
      detailedItems: parseJsonOrNull(row.detailedItems || row.detailedIt),
      estimatedQuantity: row.estimatedQuantity ? parseFloat(row.estimatedQuantity) : null,
      unit: row.unit,
      workflowStateId: (rawWorkflow && validWorkflowStates.has(rawWorkflow)) ? rawWorkflow : firstWorkflowState,
      assignedToId: (rawAssigned && validUsers.has(rawAssigned)) ? rawAssigned : null,
      customerId: row.customerId || row.customerI || null,
      convertedCustomerId: row.convertedCustomerId || null,
      convertedAt: parseDateOrNull(row.convertedAt),
      convertedById: row.convertedById || null,
      nextReminderAt: parseDateOrNull(row.nextReminderAt),
      lostReason: row.lostReason || null,
      remarks: row.remarks || '',
      version: row.version ? parseInt(row.version, 10) : 1,
      createdById: (rawCreatedBy && validUsers.has(rawCreatedBy)) ? rawCreatedBy : defaultUserId,
      updatedById: (row.updatedById && validUsers.has(row.updatedById)) ? row.updatedById : null,
      salesExecutiveId: (rawSalesExec && validUsers.has(rawSalesExec)) ? rawSalesExec : defaultUserId,
      companyId: (rawCompany && validCompanies.has(rawCompany)) ? rawCompany : defaultCompanyId,
      createdAt: parseDateOrNull(row.createdAt) || new Date(),
      updatedAt: parseDateOrNull(row.updatedAt) || new Date(),
      deletedAt: parseDateOrNull(row.deletedAt),
    };

    if (isDryRun) {
      console.log(`[DRY-RUN VALIDATED] Lead #${i}: ${leadNumber} - ${companyName} (${contactPerson})`);
      successCount++;
    } else {
      try {
        await prisma.lead.upsert({
          where: { leadNumber: dataPayload.leadNumber },
          update: dataPayload,
          create: dataPayload,
        });
        console.log(`✅ [INSERTED/UPDATED] Lead #${i}: ${leadNumber} - ${companyName}`);
        successCount++;
      } catch (err) {
        console.error(`❌ [ERROR] Lead #${i} (${leadNumber}):`, err.message);
        errorCount++;
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`📊 IMPORT SUMMARY (${isDryRun ? 'DRY-RUN' : 'LIVE'})`);
  console.log(`======================================================`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${errorCount}`);
}

function sanitizeEnum(val, validEnums) {
  if (!val) return null;
  const upper = val.toUpperCase().trim();
  return validEnums.includes(upper) ? upper : 'OTHER';
}

function parseJsonOrNull(str) {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function parseDateOrNull(str) {
  if (!str || str === 'NULL' || str === 'null') return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function parseCsvLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

importLeads()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
