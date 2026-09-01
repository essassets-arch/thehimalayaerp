import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSamples() {
  const u = await prisma.user.findFirst({ where: { email: 'supersales1@himalayaerp.com' } });
  const uid = u!.id;
  const samples = await prisma.sampleRequest.findMany({
    where: {
      OR: [
        { createdById: uid },
        { salesExecutiveId: uid },
        { lead: { salesExecutiveId: uid } },
        { lead: { createdById: uid } },
        { lead: { assignedToId: uid } },
      ]
    },
    include: { lead: true }
  });
  console.log('Samples matched for SS1:', samples.map(s => ({ id: s.id, createdById: s.createdById, salesExecutiveId: s.salesExecutiveId, leadId: s.leadId })));
  await prisma.$disconnect();
}
checkSamples();
