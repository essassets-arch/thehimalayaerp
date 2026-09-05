const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } } });

async function check() {
  const getUser = async (id) => {
    if (!id) return 'NONE';
    const u = await prisma.user.findUnique({ where: { id } });
    return u ? `${u.name} (${u.email})` : id;
  };

  const lead1 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0001' } });
  const lead144 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0144' } });
  const lead145 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0145' } });
  const lead167 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0167' } });
  const lead168 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0168' } });
  const lead214 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0214' } });
  const lead215 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0215' } });
  const lead244 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0244' } });
  const lead245 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0245' } });
  const lead254 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0254' } });
  const lead255 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0255' } });
  const lead260 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0260' } });
  const lead261 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0261' } });
  const lead263 = await prisma.lead.findFirst({ where: { leadNumber: 'LD/2627/0263' } });

  console.log('--- LEAD OWNERSHIP SAMPLING ---');
  console.log('Lead 0001 (SuperSales 1):', await getUser(lead1?.createdById), '|', await getUser(lead1?.salesExecutiveId));
  console.log('Lead 0144 (SuperSales 1):', await getUser(lead144?.createdById), '|', await getUser(lead144?.salesExecutiveId));
  console.log('Lead 0145 (SuperSales 2):', await getUser(lead145?.createdById), '|', await getUser(lead145?.salesExecutiveId));
  console.log('Lead 0167 (SuperSales 2):', await getUser(lead167?.createdById), '|', await getUser(lead167?.salesExecutiveId));
  console.log('Lead 0168 (Sales 1 / JP):', await getUser(lead168?.createdById), '|', await getUser(lead168?.salesExecutiveId));
  console.log('Lead 0214 (Sales 1 / JP):', await getUser(lead214?.createdById), '|', await getUser(lead214?.salesExecutiveId));
  console.log('Lead 0215 (Sales 2 / RS):', await getUser(lead215?.createdById), '|', await getUser(lead215?.salesExecutiveId));
  console.log('Lead 0244 (Sales 2 / RS):', await getUser(lead244?.createdById), '|', await getUser(lead244?.salesExecutiveId));
  console.log('Lead 0245 (Sales 4):', await getUser(lead245?.createdById), '|', await getUser(lead245?.salesExecutiveId));
  console.log('Lead 0254 (Sales 4):', await getUser(lead254?.createdById), '|', await getUser(lead254?.salesExecutiveId));
  console.log('Lead 0255 (Sales 12 / JY):', await getUser(lead255?.createdById), '|', await getUser(lead255?.salesExecutiveId));
  console.log('Lead 0260 (Sales 12 / JY):', await getUser(lead260?.createdById), '|', await getUser(lead260?.salesExecutiveId));
  console.log('Lead 0261 (Sales 11 / HL):', await getUser(lead261?.createdById), '|', await getUser(lead261?.salesExecutiveId));
  console.log('Lead 0263 (Sales 11 / HL):', await getUser(lead263?.createdById), '|', await getUser(lead263?.salesExecutiveId));

  const countSS1 = await prisma.salesOrder.count({ where: { orderNumber: { gte: 'HCPPL/2627/0001', lte: 'HCPPL/2627/0144' } } });
  const countSS2 = await prisma.salesOrder.count({ where: { orderNumber: { gte: 'HCPPL/2627/0145', lte: 'HCPPL/2627/0167' } } });
  const countS1 = await prisma.salesOrder.count({ where: { orderNumber: { gte: 'HCPPL/2627/0168', lte: 'HCPPL/2627/0214' } } });
  const countS2 = await prisma.salesOrder.count({ where: { orderNumber: { gte: 'HCPPL/2627/0215', lte: 'HCPPL/2627/0244' } } });
  const countS4 = await prisma.salesOrder.count({ where: { orderNumber: { gte: 'HCPPL/2627/0245', lte: 'HCPPL/2627/0254' } } });
  const countS12 = await prisma.salesOrder.count({ where: { orderNumber: { gte: 'HCPPL/2627/0255', lte: 'HCPPL/2627/0260' } } });
  const countS11 = await prisma.salesOrder.count({ where: { orderNumber: { gte: 'HCPPL/2627/0261', lte: 'HCPPL/2627/0263' } } });

  console.log('\n--- ORDER COUNTS BY RANGE ---');
  console.log('HCPPL 0001 - 0144 (SuperSales 1 / Hussain Sir):', countSS1);
  console.log('HCPPL 0145 - 0167 (SuperSales 2 / Taher Sir):', countSS2);
  console.log('HCPPL 0168 - 0214 (Sales 1 / JP):', countS1);
  console.log('HCPPL 0215 - 0244 (Sales 2 / RS):', countS2);
  console.log('HCPPL 0245 - 0254 (Sales 4):', countS4);
  console.log('HCPPL 0255 - 0260 (Sales 12 / Jyoti):', countS12);
  console.log('HCPPL 0261 - 0263 (Sales 11 / HL):', countS11);

  const woSS1 = await prisma.workOrder.count({ where: { workOrderNumber: { gte: 'WO/2627/0001', lte: 'WO/2627/0315' } } });
  const woSS2 = await prisma.workOrder.count({ where: { workOrderNumber: { gte: 'WO/2627/0316', lte: 'WO/2627/0367' } } });
  const woS1 = await prisma.workOrder.count({ where: { workOrderNumber: { gte: 'WO/2627/0368', lte: 'WO/2627/0460' } } });
  const woS2 = await prisma.workOrder.count({ where: { workOrderNumber: { gte: 'WO/2627/0461', lte: 'WO/2627/0514' } } });
  const woS4 = await prisma.workOrder.count({ where: { workOrderNumber: { gte: 'WO/2627/0515', lte: 'WO/2627/0531' } } });
  const woS12 = await prisma.workOrder.count({ where: { workOrderNumber: { gte: 'WO/2627/0532', lte: 'WO/2627/0541' } } });
  const woS11 = await prisma.workOrder.count({ where: { workOrderNumber: { gte: 'WO/2627/0542', lte: 'WO/2627/0548' } } });

  console.log('\n--- WORK ORDER COUNTS BY RANGE ---');
  console.log('WO 0001 - 0315 (SuperSales 1):', woSS1);
  console.log('WO 0316 - 0367 (SuperSales 2):', woSS2);
  console.log('WO 0368 - 0460 (Sales 1):', woS1);
  console.log('WO 0461 - 0514 (Sales 2):', woS2);
  console.log('WO 0515 - 0531 (Sales 4):', woS4);
  console.log('WO 0532 - 0541 (Sales 12 / Jyoti):', woS12);
  console.log('WO 0542 - 0548 (Sales 11 / HL):', woS11);
}

check().catch(console.error).finally(() => prisma.$disconnect());
