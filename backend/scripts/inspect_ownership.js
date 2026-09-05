const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');

const backupsDir = path.resolve(__dirname, '../../backups');
const latestFile = path.join(backupsDir, 'himalaya_erp_backup_20260905_113045.sql.gz');

async function inspectOwnership() {
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

  const ss1User = Object.values(users).find(u => u.email === 'supersales1@himalayaerp.com');
  console.log('supersales1 user object:', ss1User);

  console.log('\n--- LEAD OWNERSHIP IN BACKUP ---');
  const leadOwners = {};
  rawLeads.forEach(l => {
    const key = `createdById: ${l.createdById} | assignedToId: ${l.assignedToId} | salesExec: ${l.salesExecutiveId}`;
    leadOwners[key] = (leadOwners[key] || 0) + 1;
  });
  console.log(leadOwners);

  console.log('\n--- QUOTATION OWNERSHIP IN BACKUP ---');
  const quoteOwners = {};
  rawQuotes.forEach(q => {
    const key = `createdById: ${q.createdById} | salesExec: ${q.salesExecutiveId}`;
    quoteOwners[key] = (quoteOwners[key] || 0) + 1;
  });
  console.log(quoteOwners);

  console.log('\n--- ORDER OWNERSHIP IN BACKUP ---');
  const orderOwners = {};
  rawOrders.forEach(o => {
    const key = `createdById: ${o.createdById} | salesExec: ${o.salesExecutiveId}`;
    orderOwners[key] = (orderOwners[key] || 0) + 1;
  });
  console.log(orderOwners);
}

inspectOwnership().catch(console.error);
