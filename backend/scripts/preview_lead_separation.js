const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const MAPPING_RULES = [
  { initials: 'TG', email: 'trushna.gajjar@himalayaerp.com', label: 'Trushna Gajjar' },
  { initials: 'JP', email: 'sales1@himalayaerp.com', label: 'Sales Executive 1 (JP)' },
  { initials: 'MTH', email: 'sales2@himalayaerp.com', label: 'Sales Executive 2 (MTH)' },
  { initials: 'RT', email: 'sales3@himalayaerp.com', label: 'Sales Executive 3 (RT)' },
  { initials: 'HUSSAIN BHAI', email: 'sales5@himalayaerp.com', label: 'Sales Executive 5 (Hussain)' },
  { initials: 'ROOSHIL BHAI', email: 'sales6@himalayaerp.com', label: 'Sales Executive 6 (Rooshil)' },
  { initials: 'RITESH BHAI', email: 'sales7@himalayaerp.com', label: 'Sales Executive 7 (Ritesh)' },
  { initials: 'DEOM', email: 'sales4@himalayaerp.com', label: 'Sales Executive 4 (Demo)' },
];

async function previewCsvLeadSeparation() {
  const filePath = path.join(__dirname, '../../leads.csv');
  if (!fs.existsSync(filePath)) {
    console.error('❌ leads.csv not found');
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8').trim();
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  const isTab = lines[0].split('\t').length > 1;
  const headers = (isTab ? lines[0].split('\t') : parseCsvLine(lines[0])).map(h => h.trim().replace(/^"/, '').replace(/"$/, ''));

  const contactIdx = headers.indexOf('contactPerson') !== -1 ? headers.indexOf('contactPerson') : headers.indexOf('contactPe');
  const compIdx = headers.indexOf('companyName') !== -1 ? headers.indexOf('companyName') : headers.indexOf('company');
  const numIdx = headers.indexOf('leadNumber') !== -1 ? headers.indexOf('leadNumber') : headers.indexOf('leadNum');

  console.log('\n======================================================================');
  console.log('🔍 FULL CSV LEAD SEPARATION MOCK TEST & DISTRIBUTION PREVIEW');
  console.log('======================================================================\n');

  const buckets = {};
  for (const r of MAPPING_RULES) {
    buckets[r.initials] = { rule: r, leads: [] };
  }
  buckets['UNMAPPED'] = { rule: { initials: 'UNMAPPED', email: 'supersales1@himalayaerp.com', label: 'Super Sales 1 (Unmapped Fallback)' }, leads: [] };

  for (let i = 1; i < lines.length; i++) {
    const cols = isTab ? lines[i].split('\t') : parseCsvLine(lines[i]);
    if (cols.length < 3) continue;

    const contact = cols[contactIdx] ? cols[contactIdx].trim().replace(/^"/, '').replace(/"$/, '').toUpperCase() : '';
    const leadNum = cols[numIdx] ? cols[numIdx].trim().replace(/^"/, '').replace(/"$/, '') : `LEAD-${i}`;
    const compName = cols[compIdx] ? cols[compIdx].trim().replace(/^"/, '').replace(/"$/, '') : 'Unknown Company';

    const item = { leadNumber: leadNum, companyName: compName, contactPerson: contact };

    if (buckets[contact]) {
      buckets[contact].leads.push(item);
    } else {
      buckets['UNMAPPED'].leads.push(item);
    }
  }

  console.log(`📊 Total Leads Processed in CSV: ${lines.length - 1}\n`);
  console.log('----------------------------------------------------------------------');
  console.log('👤 SIMULATED USER-BY-USER LEAD DISTRIBUTION (DATA ISOLATION PREVIEW)');
  console.log('----------------------------------------------------------------------\n');

  for (const [key, b] of Object.entries(buckets)) {
    if (b.leads.length === 0) continue;
    console.log(`👤 Sales User: ${b.rule.label} <${b.rule.email}> [Initials Code: "${key}"]`);
    console.log(`   📦 Assigned Leads: ${b.leads.length} lead(s)`);
    console.log(`   📋 Sample Companies: ${b.leads.slice(0, 4).map(l => `${l.leadNumber} (${l.companyName})`).join(', ')}`);
    console.log('----------------------------------------------------------------------');
  }

  console.log('\n✅ Data isolation simulation complete. Zero live DB changes made.');
  console.log('======================================================================\n');
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

previewCsvLeadSeparation()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
