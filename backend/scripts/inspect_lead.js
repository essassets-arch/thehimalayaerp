const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const leadId = 'aad6ea8b-fa77-4f83-a0dc-bc3c0e0729da';
  const lead = await prisma.lead.findFirst({
    where: { id: leadId },
    include: {
      quotations: {
        include: { items: true }
      }
    }
  });
  console.log('Lead with Quotations:', JSON.stringify(lead, null, 2));
}

main().finally(() => prisma.$disconnect());
