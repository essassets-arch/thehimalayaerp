require('dotenv').config({ path: __dirname + '/../.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const samples = await prisma.sampleRequest.findMany({
    select: {
      id: true,
      sampleNumber: true,
      companyId: true,
      createdById: true,
      salesExecutiveId: true,
      status: true,
      deletedAt: true,
    }
  });
  console.log('Samples in DB:', JSON.stringify(samples, null, 2));
  const companies = await prisma.company.findMany({ select: { id: true, name: true } });
  console.log('Companies in DB:', JSON.stringify(companies, null, 2));
  await prisma.$disconnect();
}
check().catch(console.error);
