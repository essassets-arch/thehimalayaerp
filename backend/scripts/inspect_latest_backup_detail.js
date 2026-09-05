const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');

const backupsDir = path.resolve(__dirname, '../../backups');
const latestFile = path.join(backupsDir, 'himalaya_erp_backup_20260905_113045.sql.gz');

async function inspectDetailed() {
  const fileStream = fs.createReadStream(latestFile);
  const gunzip = zlib.createGunzip();
  const rl = readline.createInterface({
    input: fileStream.pipe(gunzip),
    crlfDelay: Infinity
  });

  const tableHeaders = {};
  const leadsByUser = {};
  const quotesByUser = {};
  const ordersByUser = {};
  const users = {};
  const leadNumbers = [];
  const quoteNumbers = [];
  const orderNumbers = [];

  let currentTable = null;
  let currentColumns = [];

  for await (const line of rl) {
    const copyMatch = line.match(/^COPY public\."?([a-zA-Z0-9_]+)"?\s*\((.*)\)\s*FROM stdin;/i);
    if (copyMatch) {
      currentTable = copyMatch[1];
      currentColumns = copyMatch[2].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      tableHeaders[currentTable] = currentColumns;
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
        users[obj.id] = { id: obj.id, email: obj.email, fullName: obj.fullName, roleId: obj.roleId };
      } else if (currentTable === 'Lead') {
        const uid = obj.assignedToId || obj.createdById || 'unknown';
        leadsByUser[uid] = (leadsByUser[uid] || 0) + 1;
        leadNumbers.push({
          id: obj.id,
          leadNumber: obj.leadNumber,
          companyName: obj.companyName,
          createdById: obj.createdById,
          assignedToId: obj.assignedToId,
          createdAt: obj.createdAt
        });
      } else if (currentTable === 'Quotation') {
        const uid = obj.createdById || 'unknown';
        quotesByUser[uid] = (quotesByUser[uid] || 0) + 1;
        quoteNumbers.push({
          id: obj.id,
          quotationNumber: obj.quotationNumber,
          createdById: obj.createdById,
          leadId: obj.leadId,
          totalAmount: obj.totalAmount,
          createdAt: obj.createdAt
        });
      } else if (currentTable === 'SalesOrder') {
        const uid = obj.createdById || 'unknown';
        ordersByUser[uid] = (ordersByUser[uid] || 0) + 1;
        orderNumbers.push({
          id: obj.id,
          orderNumber: obj.orderNumber,
          createdById: obj.createdById,
          quotationId: obj.quotationId,
          totalAmount: obj.totalAmount,
          createdAt: obj.createdAt
        });
      }
    }
  }

  console.log('=== USERS SUMMARY ===');
  Object.values(users).forEach(u => console.log(`${u.email} (${u.id}) - ${u.fullName}`));

  console.log('\n=== LEADS DISTRIBUTION BY USER ===');
  for (const [uid, count] of Object.entries(leadsByUser)) {
    const u = users[uid] || { email: uid };
    console.log(`User: ${u.email} -> ${count} leads`);
  }

  console.log('\n=== QUOTATIONS DISTRIBUTION BY USER ===');
  for (const [uid, count] of Object.entries(quotesByUser)) {
    const u = users[uid] || { email: uid };
    console.log(`User: ${u.email} -> ${count} quotations`);
  }

  console.log('\n=== SALES ORDERS DISTRIBUTION BY USER ===');
  for (const [uid, count] of Object.entries(ordersByUser)) {
    const u = users[uid] || { email: uid };
    console.log(`User: ${u.email} -> ${count} orders`);
  }

  console.log('\n=== SAMPLE LEAD NUMBERS (First 5 and Last 10) ===');
  console.log(leadNumbers.slice(0, 5).map(l => l.leadNumber));
  console.log(leadNumbers.slice(-10).map(l => ({ num: l.leadNumber, user: (users[l.createdById] || {}).email, date: l.createdAt })));

  console.log('\n=== SAMPLE QUOTATION NUMBERS (First 5 and Last 10) ===');
  console.log(quoteNumbers.slice(0, 5).map(q => q.quotationNumber));
  console.log(quoteNumbers.slice(-10).map(q => ({ num: q.quotationNumber, user: (users[q.createdById] || {}).email, date: q.createdAt })));

  console.log('\n=== SAMPLE ORDER NUMBERS (First 5 and Last 10) ===');
  console.log(orderNumbers.slice(0, 5).map(o => o.orderNumber));
  console.log(orderNumbers.slice(-10).map(o => ({ num: o.orderNumber, user: (users[o.createdById] || {}).email, date: o.createdAt })));

  console.log('\n=== LEAD TABLE COLUMNS ===');
  console.log(tableHeaders['Lead']);

  console.log('\n=== QUOTATION TABLE COLUMNS ===');
  console.log(tableHeaders['Quotation']);

  console.log('\n=== SALES ORDER TABLE COLUMNS ===');
  console.log(tableHeaders['SalesOrder']);
}

inspectDetailed().catch(console.error);
