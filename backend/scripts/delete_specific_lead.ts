import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Searching for lead d20de0f0-b692-45b9-afb0-ef5049d421f5 or company AXZSD...');

  const leads = await prisma.lead.findMany({
    where: {
      OR: [
        { id: { equals: 'd20de0f0-b692-45b9-afb0-ef5049d421f5', mode: 'insensitive' } },
        { companyName: { contains: 'AXZSD', mode: 'insensitive' } },
        { email: { contains: 'essassets@gmail.com', mode: 'insensitive' } }
      ]
    }
  });

  console.log('Found leads:', leads);

  for (const lead of leads) {
    // Delete linked activities or quotations if any
    await prisma.leadActivity.deleteMany({ where: { leadId: lead.id } });
    await prisma.sampleRequest.deleteMany({ where: { leadId: lead.id } });
    await prisma.quotation.deleteMany({ where: { leadId: lead.id } });
    await prisma.lead.delete({ where: { id: lead.id } });
    console.log(`Deleted lead ${lead.id} (${lead.companyName}) successfully.`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
