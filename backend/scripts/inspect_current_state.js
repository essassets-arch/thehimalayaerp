const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

async function check() {
  const lead1 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0001' } });
  const lead144 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0144' } });
  const lead145 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0145' } });
  const lead167 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0167' } });
  const lead168 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0168' } });
  const lead214 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0214' } });

  const getUser = async (id) => {
    if (!id) return 'NONE';
    const u = await prisma.user.findUnique({ where: { id } });
    return u ? `${u.name} (${u.email})` : id;
  };

  console.log('Lead 0001 createdBy:', await getUser(lead1?.createdById), 'salesExec:', await getUser(lead1?.salesExecutiveId));
  console.log('Lead 0144 createdBy:', await getUser(lead144?.createdById), 'salesExec:', await getUser(lead144?.salesExecutiveId));
  console.log('Lead 0145 createdBy:', await getUser(lead145?.createdById), 'salesExec:', await getUser(lead145?.salesExecutiveId));
  console.log('Lead 0167 createdBy:', await getUser(lead167?.createdById), 'salesExec:', await getUser(lead167?.salesExecutiveId));
  console.log('Lead 0168 createdBy:', await getUser(lead168?.createdById), 'salesExec:', await getUser(lead168?.salesExecutiveId));
  console.log('Lead 0214 createdBy:', await getUser(lead214?.createdById), 'salesExec:', await getUser(lead214?.salesExecutiveId));

  const countSS1 = await prisma.salesOrder.count({ where: { orderNumber: { gte: 'HCPPL/2627/0001', lte: 'HCPPL/2627/0144' } } });
  const countSS2 = await prisma.salesOrder.count({ where: { orderNumber: { gte: 'HCPPL/2627/0145', lte: 'HCPPL/2627/0167' } } });
  const countS1 = await prisma.salesOrder.count({ where: { orderNumber: { gte: 'HCPPL/2627/0168', lte: 'HCPPL/2627/0214' } } });

  console.log('\n--- ORDER COUNTS BY RANGE ---');
  console.log('HCPPL 0001 - 0144 (SuperSales 1 / Hussain Sir):', countSS1);
  console.log('HCPPL 0145 - 0167 (SuperSales 2 / Taher Sir):', countSS2);
  console.log('HCPPL 0168 - 0214 (Sales 1 / JP):', countS1);

  const woSS1 = await prisma.workOrder.count({ where: { workOrderNumber: { gte: 'WO/2627/0001', lte: 'WO/2627/0315' } } });
  const woSS2 = await prisma.workOrder.count({ where: { workOrderNumber: { gte: 'WO/2627/0316', lte: 'WO/2627/0367' } } });
  const woS1 = await prisma.workOrder.count({ where: { workOrderNumber: { gte: 'WO/2627/0368', lte: 'WO/2627/0460' } } });

  console.log('\n--- WORK ORDER COUNTS BY RANGE ---');
  console.log('WO 0001 - 0315 (SuperSales 1):', woSS1);
  console.log('WO 0316 - 0367 (SuperSales 2):', woSS2);
  console.log('WO 0368 - 0460 (Sales 1):', woS1);
}

check().catch(console.error).finally(() => prisma.$disconnect());
