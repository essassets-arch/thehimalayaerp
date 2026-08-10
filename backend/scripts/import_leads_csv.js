const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importLeads() {
  const filePath = process.argv[2] || path.join(__dirname, 'leads.csv');
  if (!fs.existsSync(filePath)) {
    console.error(`❌ CSV file not found at: ${filePath}`);
    console.log('Usage: node scripts/import_leads_csv.js <path_to_leads.csv>');
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8').trim();
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length <= 1) {
    console.error('❌ CSV file is empty or missing data rows.');
    process.exit(1);
  }

  const header = lines[0].split('\t').length > 1 ? lines[0].split('\t') : lines[0].split(',');
  const isTab = lines[0].split('\t').length > 1;

  console.log(`📋 Found ${lines.length - 1} leads to import...`);

  // Default company
  const company = await prisma.company.findFirst();
  if (!company) throw new Error('No company found in database.');

  let inserted = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = isTab ? lines[i].split('\t') : parseCsvLine(lines[i]);
    if (cols.length < 3) continue;

    const row = {};
    header.forEach((h, idx) => {
      let key = h.trim().replace(/^"/, '').replace(/"$/, '');
      let val = cols[idx] ? cols[idx].trim().replace(/^"/, '').replace(/"$/, '') : null;
      if (val === 'NULL' || val === '' || val === 'null') val = null;
      row[key] = val;
    });

    const leadNumber = row.leadNumber || row.leadNum || `LEAD-2026-${String(i).padStart(2, '0')}`;
    const companyName = row.companyName || row.company || 'Unknown Company';

    try {
      await prisma.lead.upsert({
        where: { id: row.id || `lead-${i}` },
        update: {
          leadNumber,
          companyName,
          groupName: row.groupName || row.groupNam,
          projectName: row.projectName || row.projectNa,
          contactPerson: row.contactPerson || row.contactPe,
          email: row.email,
          phone: row.phone,
          gstName: row.gstName,
          gstNumber: row.gstNumber || row.gstNumbe,
          address: row.address,
          source: row.source,
          productInterest: row.productInterest || row.productIn,
          detailedItems: parseJsonOrNull(row.detailedItems || row.detailedIt),
          estimatedQuantity: row.estimatedQuantity ? parseFloat(row.estimatedQuantity) : null,
          unit: row.unit,
          workflowStateId: row.workflowStateId || row.workflow,
          assignedToId: row.assignedToId || row.assignedT,
          customerId: row.customerId || row.customerI,
          remarks: row.remarks,
          createdById: row.createdById || row.createdBy || 'SYSTEM',
          updatedById: row.updatedById || row.updatedB,
          companyId: row.companyId || company.id,
          createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
        },
        create: {
          id: row.id,
          leadNumber,
          companyName,
          groupName: row.groupName || row.groupNam,
          projectName: row.projectName || row.projectNa,
          contactPerson: row.contactPerson || row.contactPe,
          email: row.email,
          phone: row.phone,
          gstName: row.gstName,
          gstNumber: row.gstNumber || row.gstNumbe,
          address: row.address,
          source: row.source,
          productInterest: row.productInterest || row.productIn,
          detailedItems: parseJsonOrNull(row.detailedItems || row.detailedIt),
          estimatedQuantity: row.estimatedQuantity ? parseFloat(row.estimatedQuantity) : null,
          unit: row.unit,
          workflowStateId: row.workflowStateId || row.workflow,
          assignedToId: row.assignedToId || row.assignedT,
          customerId: row.customerId || row.customerI,
          remarks: row.remarks,
          createdById: row.createdById || row.createdBy || 'SYSTEM',
          updatedById: row.updatedById || row.updatedB,
          companyId: row.companyId || company.id,
          createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
          updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
        },
      });
      inserted++;
    } catch (err) {
      console.error(`⚠️ Error inserting lead ${leadNumber} (${companyName}):`, err.message);
      skipped++;
    }
  }

  console.log(`🎉 Successfully imported ${inserted} leads (${skipped} skipped/errors)!`);
}

function parseJsonOrNull(str) {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function parseCsvLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
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
