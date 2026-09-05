const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');
const { PrismaClient } = require('@prisma/client');

async function checkAll() {
  console.log('=== 1. LIVE DATABASE STATUS (himalaya_erp_browser_test) ===');
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: 'sales12@himalayaerp.com', mode: 'insensitive' } }
    });
    console.log('User found:', user ? { id: user.id, name: user.name, email: user.email, role: user.role } : 'None');
    if (user) {
      const leads = await prisma.lead.findMany({
        where: { OR: [{ salesExecutiveId: user.id }, { createdById: user.id }, { assignedToId: user.id }] },
        select: { id: true, leadNumber: true, companyName: true, createdAt: true, status: true }
      });
      const quotes = await prisma.quotation.findMany({
        where: { OR: [{ salesExecutiveId: user.id }, { createdById: user.id }] },
        select: { id: true, quotationNumber: true, grandTotal: true, status: true }
      });
      const orders = await prisma.salesOrder.findMany({
        where: { OR: [{ salesExecutiveId: user.id }, { createdById: user.id }] },
        select: { id: true, orderNumber: true, grandTotal: true, status: true }
      });
      console.log(`Live DB counts -> Leads: ${leads.length}, Quotations: ${quotes.length}, Orders: ${orders.length}`);
      if (leads.length > 0) console.log('Leads:', leads);
      if (quotes.length > 0) console.log('Quotations:', quotes);
      if (orders.length > 0) console.log('Orders:', orders);
    }
  } catch (err) {
    console.error('Error querying live DB:', err.message);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n=== 2. LATEST SQL BACKUP INSPECTION ===');
  const backupsDir = path.resolve(__dirname, '../../backups');
  if (fs.existsSync(backupsDir)) {
    const files = fs.readdirSync(backupsDir).filter(f => f.endsWith('.sql.gz')).sort().reverse();
    if (files.length > 0) {
      const latestFile = path.join(backupsDir, files[0]);
      console.log('Reading backup:', files[0]);
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

      const jyotiUser = tables.User.find(u => (u.email && u.email.toLowerCase().includes('sales12')) || (u.name && u.name.toLowerCase().includes('jyoti')));
      if (jyotiUser) {
        const leads = tables.Lead.filter(l => l.salesExecutiveId === jyotiUser.id || l.createdById === jyotiUser.id || l.assignedToId === jyotiUser.id);
        const quotes = tables.Quotation.filter(q => q.salesExecutiveId === jyotiUser.id || q.createdById === jyotiUser.id);
        const orders = tables.SalesOrder.filter(o => o.salesExecutiveId === jyotiUser.id || o.createdById === jyotiUser.id);
        console.log(`Backup results for Jyoti (${jyotiUser.email}): Leads=${leads.length}, Quotes=${quotes.length}, Orders=${orders.length}`);
        if (leads.length > 0) {
          console.log('Leads:', leads.map(l => ({ num: l.leadNumber, company: l.companyName, date: l.leadDate })));
        }
        if (quotes.length > 0) {
          console.log('Quotes:', quotes.map(q => ({ num: q.quotationNumber, amount: q.grandTotal })));
        }
        if (orders.length > 0) {
          console.log('Orders:', orders.map(o => ({ num: o.orderNumber, amount: o.grandTotal })));
        }
      } else {
        console.log('Jyoti user not found in backup tables.');
      }

      console.log('\n--- ALL SALES USERS IN BACKUP ---');
      tables.User.filter(u => u.email && (u.email.includes('sales') || u.role === 'SALES')).forEach(u => {
        const leads = tables.Lead.filter(l => l.salesExecutiveId === u.id || l.createdById === u.id || l.assignedToId === u.id).length;
        const quotes = tables.Quotation.filter(q => q.salesExecutiveId === u.id || q.createdById === u.id).length;
        const orders = tables.SalesOrder.filter(o => o.salesExecutiveId === u.id || o.createdById === u.id).length;
        console.log(u.name.padEnd(20), u.email.padEnd(30), 'Leads:', leads, 'Quotes:', quotes, 'Orders:', orders);
      });
    }
  }

  console.log('\n=== 3. ALL CSV FILES SEARCH ===');
  const allCsvs = fs.readdirSync(path.resolve(__dirname, '..')).filter(f => f.endsWith('.csv'))
    .concat(fs.readdirSync(path.resolve(__dirname, '../../')).filter(f => f.endsWith('.csv')));
  const uniqueCsvs = Array.from(new Set(allCsvs));
  console.log('Available CSVs:', uniqueCsvs);
}

checkAll().catch(console.error);
