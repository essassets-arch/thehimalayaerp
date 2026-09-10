require('dotenv').config({ path: 'd:/prototype-next-main/backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const lead = await prisma.lead.findFirst({
    where: { leadNumber: { contains: '0190' } },
    include: {
      salesExecutive: true,
      sampleRequests: {
        include: {
          items: {
            include: { product: true }
          }
        }
      }
    }
  });
  console.log('Lead 0190:', JSON.stringify(lead, null, 2));

  const allSamples = await prisma.sampleRequest.findMany({
    include: {
      lead: true,
      customer: true,
      items: { include: { product: true } }
    }
  });
  console.log('All SampleRequests count:', allSamples.length);
  if (allSamples.length > 0) {
    console.log('All SampleRequests:', JSON.stringify(allSamples, null, 2));
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
