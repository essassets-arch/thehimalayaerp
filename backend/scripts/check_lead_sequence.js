const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const seq = await prisma.idSequence.findUnique({
    where: { key: 'lead_number' }
  });
  console.log('Current IdSequence for lead_number:', seq);

  const highestLead = await prisma.lead.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { id: true, leadNumber: true, createdAt: true }
  });
  console.log('Highest / Most recent Lead:', highestLead);

  const allLeadNumbers = await prisma.lead.findMany({
    select: { leadNumber: true },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  console.log('Recent Lead Numbers in DB:', allLeadNumbers.map(l => l.leadNumber));
}

run().catch(console.error).finally(() => prisma.$disconnect());
