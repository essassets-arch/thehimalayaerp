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

// CSV parser supporting multi-line quotes and JSON fields
function parseCsv(content) {
  const lines = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && content[i + 1] === '\n') i++;
      if (current.trim()) lines.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) lines.push(current);

  const splitRow = (rowStr) => {
    const fields = [];
    let field = '';
    let inQ = false;
    for (let i = 0; i < rowStr.length; i++) {
      const c = rowStr[i];
      if (c === '"') {
        if (inQ && rowStr[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQ = !inQ;
        }
      } else if (c === ',' && !inQ) {
        fields.push(field);
        field = '';
      } else {
        field += c;
      }
    }
    fields.push(field);
    return fields;
  };

  const headers = splitRow(lines[0]).map(h => h.trim().replace(/^"/, '').replace(/"$/, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitRow(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      let val = values[idx] !== undefined ? values[idx] : '';
      if (val === 'NULL' || val === 'null') val = null;
      obj[h] = val;
    });
    rows.push(obj);
  }

  return { headers, rows };
}

async function main() {
  const csvPath = path.join(__dirname, '../../leads.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('leads.csv not found at:', csvPath);
    return;
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  const { headers, rows } = parseCsv(content);

  console.log('======================================================================');
  console.log(' 🔍 360 MASTER ANALYSIS OF LEADS.CSV SOURCE DATA');
  console.log('======================================================================\n');
  console.log(`📁 Source CSV File: ${csvPath}`);
  console.log(`📊 Total Records Found in CSV: ${rows.length} leads\n`);

  // Analyze Sales Executive Mapping
  const salesMapStats = {};
  let validAddressCount = 0;
  let validDetailedItemsCount = 0;
  let totalItemsInCsv = 0;

  rows.forEach((r, idx) => {
    const code = (r.contactPerson || 'UNMAPPED').trim().toUpperCase();
    salesMapStats[code] = (salesMapStats[code] || 0) + 1;

    if (r.address) {
      try {
        const addr = JSON.parse(r.address);
        if (addr && (addr.line1 || addr.city)) validAddressCount++;
      } catch (e) {}
    }

    if (r.detailedItems) {
      try {
        const items = JSON.parse(r.detailedItems);
        if (Array.isArray(items) && items.length > 0) {
          validDetailedItemsCount++;
          totalItemsInCsv += items.length;
        }
      } catch (e) {}
    }
  });

  console.log('----------------------------------------------------------------------');
  console.log(' 👤 SALES EXECUTIVE CODE DISTRIBUTION IN LEADS.CSV');
  console.log('----------------------------------------------------------------------');
  Object.entries(salesMapStats).sort((a, b) => b[1] - a[1]).forEach(([code, count]) => {
    console.log(`  • Code "${code}": ${count} lead(s)`);
  });

  console.log('\n----------------------------------------------------------------------');
  console.log(' 📦 DATA QUALITY AUDIT (ADDRESS & LINE ITEMS)');
  console.log('----------------------------------------------------------------------');
  console.log(`  • Leads with valid JSON Delivery Address: ${validAddressCount} / ${rows.length}`);
  console.log(`  • Leads with valid JSON Detailed Items: ${validDetailedItemsCount} / ${rows.length}`);
  console.log(`  • Total Product Line Items across all CSV leads: ${totalItemsInCsv} items`);

  // Check against active DB
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
  console.log('\n----------------------------------------------------------------------');
  console.log(' 🔗 ACTIVE SYSTEM USERS READY FOR MAPPING');
  console.log('----------------------------------------------------------------------');
  users.forEach(u => console.log(`  • ${u.name} <${u.email}> (ID: ${u.id})`));

  console.log('\n======================================================================');
  console.log(' ANALYSIS COMPLETE');
  console.log('======================================================================\n');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
