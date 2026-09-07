const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });
(async () => {
  const sampleLead = await p.lead.findFirst({
    where: { leadNumber: { startsWith: 'LEAD/2627' } },
    select: {
      id: true,
      leadNumber: true,
      salesExecutiveId: true,
      assignedToId: true,
      companyName: true
    }
  });
  console.log('Sample Lead in browser_test:', sampleLead);

  if (sampleLead?.salesExecutiveId || sampleLead?.assignedToId) {
    const owner = await p.user.findUnique({
      where: { id: sampleLead.salesExecutiveId || sampleLead.assignedToId },
      select: { id: true, name: true, email: true }
    });
    console.log('Lead owner user:', owner);
  }

  const sampleOrder = await p.salesOrder.findFirst({
    where: { orderNumber: { startsWith: 'HCPPL/2627' } },
    select: {
      id: true,
      orderNumber: true,
      salesExecutiveId: true,
      createdById: true
    }
  });
  console.log('Sample Order in browser_test:', sampleOrder);

  if (sampleOrder?.salesExecutiveId || sampleOrder?.createdById) {
    const owner = await p.user.findUnique({
      where: { id: sampleOrder.salesExecutiveId || sampleOrder.createdById },
      select: { id: true, name: true, email: true }
    });
    console.log('Order owner user:', owner);
  }

  const leads2627 = await p.lead.count({ where: { leadNumber: { startsWith: 'LEAD/2627' } } });
  const quotes2627 = await p.quotation.count({ where: { quotationNumber: { startsWith: 'QU/2627' } } });
  const orders2627 = await p.salesOrder.count({ where: { orderNumber: { startsWith: 'HCPPL/2627' } } });
  console.log({ leads2627, quotes2627, orders2627 });

  await p.$disconnect();
})();
