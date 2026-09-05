const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

async function check() {
  const auditCsv = fs.readFileSync('backend/scripts/delivery_history_audit_2026-09-05 (2).csv', 'utf8');
  const lines = auditCsv.split('\n').slice(1).filter(l => l.trim());
  const auditSoNumbers = [...new Set(lines.map(l => {
    const parts = l.split(',');
    const so = (parts[1] || '').replace(/\"/g, '').trim();
    return so;
  }).filter(Boolean))];

  console.log('Unique SO numbers in Delivery History Audit CSV:', auditSoNumbers.length);
  console.log('Audit SO numbers:', auditSoNumbers);

  const orders = await prisma.salesOrder.findMany({
    where: { orderNumber: { in: auditSoNumbers } },
    include: {
      quotation: {
        include: { lead: true }
      },
      dispatches: true
    }
  });

  console.log('\nFound matching orders in DB:', orders.length);
  orders.forEach(o => {
    console.log(`Order: ${o.orderNumber} | Quotation: ${o.quotation?.quotationNumber || 'NONE'} | Lead: ${o.quotation?.lead?.leadNumber || 'NONE'} | Dispatches: ${o.dispatches.map(d => d.dispatchNo + ' [' + d.status + ']').join(', ')}`);
  });

  // Let's check why there are duplicate sales orders with the same orderNumber in DB!
  const allOrders = await prisma.salesOrder.findMany({
    where: {
      OR: [
        { salesExecutive: { email: { in: ['supersales1@himalayaerp.com', 'hussain.t@himalayaerp.com'] } } },
        { createdById: { in: (await prisma.user.findMany({ where: { email: { in: ['supersales1@himalayaerp.com', 'hussain.t@himalayaerp.com'] } } })).map(u => u.id) } }
      ]
    },
    include: {
      quotation: {
        include: { lead: true }
      },
      dispatches: true
    }
  });

  console.log(`\nTotal orders for Hussain/SS1 in DB: ${allOrders.length}`);
  const orderNumCounts = {};
  allOrders.forEach(o => {
    orderNumCounts[o.orderNumber] = (orderNumCounts[o.orderNumber] || 0) + 1;
  });
  const duplicates = Object.entries(orderNumCounts).filter(([k, v]) => v > 1);
  console.log(`Duplicate Order Numbers count: ${duplicates.length}`);
  if (duplicates.length > 0) {
    console.log('Duplicates:', duplicates);
  }

  await prisma.$disconnect();
}
check();
