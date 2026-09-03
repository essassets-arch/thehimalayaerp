const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' } } });

async function main() {
  const d = await prisma.dispatch.findMany({
    where: {
      OR: [
        { id: '2537e232-04c4-4407-9d68-2aef74b09fb1' },
        { podUrl: { contains: '2537e232-04c4-4407-9d68-2aef74b09fb1' } },
        { podUrl: { not: null } }
      ]
    },
    select: { id: true, dispatchNo: true, podUrl: true, status: true }
  });
  console.log('Matching dispatches with POD:', d);

  const allWithPod = await prisma.dispatch.findMany({
    select: { id: true, dispatchNo: true, podUrl: true, status: true }
  });
  console.log('All dispatches:', allWithPod);
}

main().catch(console.error).finally(() => prisma.$disconnect());
