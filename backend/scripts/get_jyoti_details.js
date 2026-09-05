const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');

async function getDetailedStatus() {
  const latestFile = path.resolve(__dirname, '../../backups/himalaya_erp_backup_20260905_113045.sql.gz');
  const fileStream = fs.createReadStream(latestFile);
  const gunzip = zlib.createGunzip();
  const rl = readline.createInterface({ input: fileStream.pipe(gunzip), crlfDelay: Infinity });

  let currentTable = null;
  let currentColumns = [];
  const tables = {
    User: [],
    Lead: [],
    Quotation: [],
    SalesOrder: []
  };

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
    if (currentTable && tables[currentTable]) {
      const row = line.split('\t');
      const obj = {};
      currentColumns.forEach((col, i) => {
        obj[col] = row[i];
      });
      tables[currentTable].push(obj);
    }
  }

  const jyoti = tables.User.find(u => u.email === 'sales12@himalayaerp.com' || (u.name && u.name.includes('Jyoti')));
  const leads = tables.Lead.filter(l => l.salesExecutiveId === jyoti.id || l.createdById === jyoti.id || l.assignedToId === jyoti.id);
  const quotes = tables.Quotation.filter(q => q.salesExecutiveId === jyoti.id || q.createdById === jyoti.id);
  const orders = tables.SalesOrder.filter(o => o.salesExecutiveId === jyoti.id || o.createdById === jyoti.id);

  console.log('Order keys:', Object.keys(orders[0] || {}));
  console.log('Order sample 0:', orders[0]);

  console.log('\n--- QUOTATIONS WITH AMOUNTS ---');
  quotes.forEach(q => {
    console.log(`Quote: ${q.quotationNumber} | Subtotal: ₹${q.subtotal} | Tax: ₹${q.tax} | Total: ₹${q.total}`);
  });

  console.log('\n--- ORDERS WITH AMOUNTS ---');
  orders.forEach(o => {
    console.log(`Order: ${o.orderNumber} | Total: ₹${o.total || o.totalAmount || o.grandTotal || o.subtotal} | Status: ${o.status}`);
  });
}

getDetailedStatus().catch(console.error);
