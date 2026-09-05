const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');

const backupsDir = path.resolve(__dirname, '../../backups');
const latestFile = path.join(backupsDir, 'himalaya_erp_backup_20260905_113045.sql.gz');

async function inspectLeadDates() {
  const fileStream = fs.createReadStream(latestFile);
  const gunzip = zlib.createGunzip();
  const rl = readline.createInterface({
    input: fileStream.pipe(gunzip),
    crlfDelay: Infinity
  });

  let currentTable = null;
  let currentColumns = [];

  const ss1Leads = [];
  const ss1Quotes = [];
  const ss1Orders = [];
  const ss1UserId = 'b1515d86-b153-406c-93da-5d50748b7e75';

  for await (const line of rl) {
    const copyMatch = line.match(/^COPY public\."?([a-zA-Z0-9_]+)"?\s*\((.*)\)\s*FROM stdin;/i);
    if (copyMatch) {
      currentTable = copyMatch[1];
      currentColumns = copyMatch[2].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      continue;
    }

    if (line === '\\.' && currentTable) {
      currentTable = null;
      currentColumns = [];
      continue;
    }

    if (currentTable) {
      const row = line.split('\t');
      const obj = {};
      currentColumns.forEach((col, i) => {
        obj[col] = row[i];
      });

      if (currentTable === 'Lead' && (obj.createdById === ss1UserId || obj.assignedToId === ss1UserId)) {
        ss1Leads.push(obj);
      } else if (currentTable === 'Quotation' && obj.createdById === ss1UserId) {
        ss1Quotes.push(obj);
      } else if (currentTable === 'SalesOrder' && obj.createdById === ss1UserId) {
        ss1Orders.push(obj);
      }
    }
  }

  console.log('--- LEADS DATES FOR SS1 ---');
  const leadDateValues = {};
  ss1Leads.forEach(l => {
    const d = l.leadDate;
    leadDateValues[d] = (leadDateValues[d] || 0) + 1;
  });
  console.log('leadDate values on Leads:', leadDateValues);

  console.log('createdAt values on Leads:', {
    '2026-09': ss1Leads.filter(l => (l.createdAt || '').startsWith('2026-09')).length,
    'other': ss1Leads.filter(l => !(l.createdAt || '').startsWith('2026-09')).map(l => l.createdAt)
  });

  console.log('--- QUOTES DATES FOR SS1 ---');
  console.log('createdAt values on Quotes:', {
    '2026-09': ss1Quotes.filter(q => (q.createdAt || '').startsWith('2026-09')).length,
    'other': ss1Quotes.filter(q => !(q.createdAt || '').startsWith('2026-09')).map(q => q.createdAt)
  });

  console.log('--- ORDERS DATES FOR SS1 ---');
  console.log('createdAt values on Orders:', {
    '2026-09': ss1Orders.filter(o => (o.createdAt || '').startsWith('2026-09')).length,
    'orderDate': ss1Orders.slice(0, 5).map(o => o.orderDate)
  });
}

inspectLeadDates().catch(console.error);
