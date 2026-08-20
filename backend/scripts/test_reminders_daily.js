const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
  console.log('--- Database query for company:', companyId);
  const dbItems = await prisma.followUp.findMany({
    where: { companyId }
  });
  console.log('DB items found:', dbItems.length);

  const legacyCompanyId = 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';
  console.log('--- Database query for legacy company:', legacyCompanyId);
  const dbItemsLegacy = await prisma.followUp.findMany({
    where: { companyId: legacyCompanyId }
  });
  console.log('Legacy DB items found:', dbItemsLegacy.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
