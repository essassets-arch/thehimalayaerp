const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');

const backupsDir = path.resolve(__dirname, '../../backups');
const latestFile = path.join(backupsDir, 'himalaya_erp_backup_20260905_113045.sql.gz');

async function inspectDates() {
  const fileStream = fs.createReadStream(latestFile);
  const gunzip = zlib.createGunzip();
  const rl = readline.createInterface({
    input: fileStream.pipe(gunzip),
    crlfDelay: Infinity
  });

  let currentTable = null;
  let currentColumns = [];

  const rawLeads = [];
  const rawQuotes = [];
  const rawOrders = [];
  const users = {};

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

      if (currentTable === 'User') {
        users[obj.id] = obj.email;
      } else if (currentTable === 'Lead') {
        rawLeads.push(obj);
      } else if (currentTable === 'Quotation') {
        rawQuotes.push(obj);
      } else if (currentTable === 'SalesOrder') {
        rawOrders.push(obj);
      }
    }
  }

  console.log('Users map:', users);

  const ss1Leads = rawLeads.filter(l => users[l.createdById] === 'supersales1@himalayaerp.com' || users[l.assignedToId] === 'supersales1@himalayaerp.com');
  const ss1Quotes = rawQuotes.filter(q => users[q.createdById] === 'supersales1@himalayaerp.com');
  const ss1Orders = rawOrders.filter(o => users[o.createdById] === 'supersales1@himalayaerp.com');

  console.log(`=== SUPERSALES 1 TOTALS IN BACKUP ===`);
  console.log(`Leads: ${ss1Leads.length}`);
  console.log(`Quotations: ${ss1Quotes.length}`);
  console.log(`Orders: ${ss1Orders.length}`);

  const leadMonths = {};
  ss1Leads.forEach(l => {
    const m = (l.createdAt || '').substring(0, 7);
    leadMonths[m] = (leadMonths[m] || 0) + 1;
  });
  console.log('\nLead distribution by Month:', leadMonths);

  const quoteMonths = {};
  ss1Quotes.forEach(q => {
    const m = (q.createdAt || '').substring(0, 7);
    quoteMonths[m] = (quoteMonths[m] || 0) + 1;
  });
  console.log('\nQuote distribution by Month:', quoteMonths);

  const orderMonths = {};
  ss1Orders.forEach(o => {
    const m = (o.createdAt || '').substring(0, 7);
    orderMonths[m] = (orderMonths[m] || 0) + 1;
  });
  console.log('\nOrder distribution by Month:', orderMonths);

  console.log('\nSample Leads createdAt:');
  console.log(ss1Leads.slice(0, 5).map(l => ({ num: l.leadNumber, date: l.createdAt })));
  console.log('\nSample Quotes createdAt:');
  console.log(ss1Quotes.slice(0, 5).map(q => ({ num: q.quotationNumber, date: q.createdAt })));
  console.log('\nSample Orders createdAt:');
  console.log(ss1Orders.slice(0, 5).map(o => ({ num: o.orderNumber, date: o.createdAt })));
}

inspectDates().catch(console.error);
