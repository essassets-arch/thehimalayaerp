const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');

const backupsDir = path.resolve(__dirname, '../../backups');
const latestFile = path.join(backupsDir, 'himalaya_erp_backup_20260905_113045.sql.gz');

async function inspectCompanyIds() {
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
  const companies = {};

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

      if (currentTable === 'Company') {
        companies[obj.id] = obj.name;
      } else if (currentTable === 'User') {
        users[obj.id] = obj;
      } else if (currentTable === 'Lead') {
        rawLeads.push(obj);
      } else if (currentTable === 'Quotation') {
        rawQuotes.push(obj);
      } else if (currentTable === 'SalesOrder') {
        rawOrders.push(obj);
      }
    }
  }

  console.log('Companies:', companies);
  const ss1 = Object.values(users).find(u => u.email === 'supersales1@himalayaerp.com');
  console.log('supersales1 user companyId:', ss1.companyId);

  const ss1Leads = rawLeads.filter(l => l.createdById === ss1.id || l.assignedToId === ss1.id);
  const leadCompCounts = {};
  ss1Leads.forEach(l => {
    leadCompCounts[l.companyId] = (leadCompCounts[l.companyId] || 0) + 1;
  });
  console.log('SS1 Leads by companyId:', leadCompCounts);

  const ss1Quotes = rawQuotes.filter(q => q.createdById === ss1.id);
  const quoteCompCounts = {};
  ss1Quotes.forEach(q => {
    quoteCompCounts[q.companyId] = (quoteCompCounts[q.companyId] || 0) + 1;
  });
  console.log('SS1 Quotes by companyId:', quoteCompCounts);

  const ss1Orders = rawOrders.filter(o => o.createdById === ss1.id);
  const orderCompCounts = {};
  ss1Orders.forEach(o => {
    orderCompCounts[o.companyId || 'N/A'] = (orderCompCounts[o.companyId || 'N/A'] || 0) + 1;
  });
  console.log('SS1 Orders by companyId:', orderCompCounts);
}

inspectCompanyIds().catch(console.error);
