const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public'
    }
  }
});

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
  const csvPath = path.join(__dirname, '../../leads.csv');
  const content = fs.readFileSync(csvPath, 'utf8');
  const { rows } = parseCsvStrict(content);

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: { select: { code: true } } }
  });

  const userIdMap = {};
  users.forEach(u => { userIdMap[u.id] = u; });

  console.log('======================================================================');
  console.log(' 🔍 INSPECTING SALES EXECUTIVE IDs & CODES IN LEADS.CSV');
  console.log('======================================================================\n');

  const execCounts = {};
  const codeExecMap = {};

  rows.forEach(r => {
    const execId = r.salesExecutiveId || r.assignedToId || 'NULL';
    const code = (r.contactPerson || 'EMPTY').trim().toUpperCase();
    const user = userIdMap[execId];
    const label = user ? `${user.name} <${user.email}> (${user.role?.code || 'NO_ROLE'})` : `UNKNOWN_ID (${execId})`;

    execCounts[label] = (execCounts[label] || 0) + 1;
    codeExecMap[code] = codeExecMap[code] || {};
    codeExecMap[code][label] = (codeExecMap[code][label] || 0) + 1;
  });

  console.log('📊 Lead Counts by exact salesExecutiveId in CSV:');
  Object.entries(execCounts).forEach(([label, cnt]) => {
    console.log(`  • ${label}: ${cnt} lead(s)`);
  });

  console.log('\n📊 Breakdown of contactPerson Code vs salesExecutiveId in CSV:');
  Object.entries(codeExecMap).forEach(([code, map]) => {
    console.log(`  Code "${code}":`);
    Object.entries(map).forEach(([lbl, cnt]) => {
      console.log(`    - ${lbl}: ${cnt} lead(s)`);
    });
  });

  console.log('\n======================================================================');
}

main().finally(() => prisma.$disconnect());
