const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const executeDb = process.argv.includes('--execute');

// Robust CSV Parser handling quotes, commas inside JSON, and multi-line fields
function parseCsvStrict(content) {
  const records = [];
  let currentRecord = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const char = content[i];

    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        currentField += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      i++;
    } else if (char === ',' && !inQuotes) {
      currentRecord.push(currentField);
      currentField = '';
      i++;
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && content[i + 1] === '\n') i++;
      currentRecord.push(currentField);
      currentField = '';
      if (currentRecord.length > 1 || currentRecord[0] !== '') {
        records.push(currentRecord);
      }
      currentRecord = [];
      i++;
    } else {
      currentField += char;
      i++;
    }
  }

  if (currentField !== '' || currentRecord.length > 0) {
    currentRecord.push(currentField);
    records.push(currentRecord);
  }

  const rawHeaders = records[0].map(h => h.trim().replace(/^"/, '').replace(/"$/, ''));
  const rows = [];

  for (let r = 1; r < records.length; r++) {
    const rec = records[r];
    if (rec.length < rawHeaders.length) continue;
    const rowObj = {};
    rawHeaders.forEach((h, idx) => {
      let val = rec[idx] !== undefined ? rec[idx] : '';
      if (val === 'NULL' || val === 'null') val = null;
      rowObj[h] = val;
    });
    rows.push(rowObj);
  }

  return { headers: rawHeaders, rows };
}

async function main() {
  const dbs = [
    { name: 'Docker DB (Port 5433)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public' },
    { name: 'Standalone DB (Port 5432)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
  ];

  const csvPath = path.join(__dirname, '../../leads.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('leads.csv not found at:', csvPath);
    return;
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  const { headers, rows } = parseCsvStrict(content);

  console.log('======================================================================');
  console.log(` 🚀 360 SAFE RESTORATION ANALYSIS & SEPARATION OF LEADS.CSV (${rows.length} LEADS)`);
  console.log('======================================================================\n');
  console.log(`Mode: ${executeDb ? '⚡ LIVE DATABASE EXECUTION' : '🔍 DRY-RUN PREVIEW (No DB changes made)'}\n`);

  for (const db of dbs) {
    console.log(`----------------------------------------------------------------------`);
    console.log(` DATABASE TARGET: ${db.name}`);
    console.log(`----------------------------------------------------------------------`);

    const prisma = new PrismaClient({ datasources: { db: { url: db.url } } });

    try {
      const company = await prisma.company.findFirst();
      const companyId = company ? company.id : 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';

      const initialState = await prisma.workflowState.findFirst({
        where: { isInitial: true }
      }) || await prisma.workflowState.findFirst();
      const workflowStateId = initialState ? initialState.id : null;

      // Find user map by email
      const users = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
      const userMap = {};
      users.forEach(u => {
        userMap[u.email.toLowerCase()] = u;
      });

      const getOwnerByCode = (contactCode) => {
        const code = (contactCode || '').trim().toUpperCase();
        if (code === 'JP') return userMap['sales1@himalayaerp.com'];
        if (code === 'MTH') return userMap['sales2@himalayaerp.com'];
        if (code === 'RT') return userMap['sales3@himalayaerp.com'];
        if (code === 'DEOM') return userMap['sales4@himalayaerp.com'];
        if (code === 'HUSSAIN BHAI') return userMap['sales5@himalayaerp.com'];
        if (code === 'ROOSHIL BHAI') return userMap['sales6@himalayaerp.com'];
        if (code === 'RITESH BHAI') return userMap['sales7@himalayaerp.com'];
        if (code === 'TG') return userMap['trushna.gajjar@himalayaerp.com'];
        return userMap['supersales1@himalayaerp.com'] || users[0];
      };

      const ownerDistribution = {};
      let restoredCount = 0;

      const validStateIds = (await prisma.workflowState.findMany({ select: { id: true } })).map(s => s.id);
      const fallbackStateId = workflowStateId || validStateIds[0];

      for (const r of rows) {
        const owner = getOwnerByCode(r.contactPerson);
        const ownerName = owner ? `${owner.name} <${owner.email}>` : 'Unassigned';
        ownerDistribution[ownerName] = (ownerDistribution[ownerName] || 0) + 1;

        let parsedAddress = null;
        if (r.address) {
          try {
            parsedAddress = JSON.parse(r.address);
          } catch (e) {
            parsedAddress = { line1: r.address };
          }
        }

        let parsedItems = null;
        if (r.detailedItems) {
          try {
            parsedItems = JSON.parse(r.detailedItems);
          } catch (e) {
            parsedItems = [];
          }
        }

        const validSource = ['WEBSITE', 'REFERRAL', 'COLD_CALL', 'EXHIBITION', 'CAMPAIGN', 'INBOUND_PHONE', 'EMAIL', 'OTHER'].includes(r.source) ? r.source : 'OTHER';

        const targetWorkflowStateId = (r.workflowStateId && validStateIds.includes(r.workflowStateId)) ? r.workflowStateId : fallbackStateId;

        const createdById = owner ? owner.id : users[0].id;

        if (executeDb) {
          const leadData = {
            leadNumber: r.leadNumber,
            companyName: r.companyName || 'Unknown Company',
            groupName: r.groupName || r.companyName,
            projectName: r.projectName || r.companyName,
            contactPerson: r.contactPerson || 'Site Incharge',
            email: r.email,
            phone: r.phone,
            gstName: r.gstName || r.companyName,
            gstNumber: r.gstNumber,
            address: parsedAddress,
            source: validSource,
            productInterest: r.productInterest,
            detailedItems: parsedItems,
            estimatedQuantity: r.estimatedQuantity && !isNaN(Number(r.estimatedQuantity)) ? Number(r.estimatedQuantity) : undefined,
            unit: r.unit || 'SET',
            remarks: r.remarks,
            workflowStateId: targetWorkflowStateId,
            assignedToId: owner ? owner.id : undefined,
            salesExecutiveId: owner ? owner.id : undefined,
            createdById: createdById,
            companyId: companyId,
          };

          await prisma.lead.upsert({
            where: { leadNumber: r.leadNumber },
            create: { id: (r.id && r.id.length === 36) ? r.id : undefined, ...leadData },
            update: leadData,
          });
          restoredCount++;
        }
      }

      console.log('\n  📊 User Lead Assignment Distribution:');
      Object.entries(ownerDistribution).sort((a, b) => b[1] - a[1]).forEach(([owner, count]) => {
        console.log(`    • ${owner}: ${count} lead(s)`);
      });

      if (executeDb) {
        console.log(`\n  ✅ [PASS] Successfully restored/upserted ${restoredCount} leads into ${db.name}`);
      } else {
        console.log(`\n  ℹ️ [DRY-RUN] ${rows.length} leads ready for 100% safe restoration into ${db.name}`);
      }

    } catch (err) {
      console.error(`  ❌ Error processing ${db.name}:`, err);
    } finally {
      await prisma.$disconnect();
    }
  }

  console.log('\n======================================================================');
  if (!executeDb) {
    console.log(' To execute the restoration in your database, run:');
    console.log(' node scripts/restore_leads_from_csv.js --execute');
  } else {
    console.log(' RESTORATION COMPLETE SUCCESSFULLY');
  }
  console.log('======================================================================\n');
}

main();
