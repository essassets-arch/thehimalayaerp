const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cs = await prisma.customer.findMany({ select: { id: true, companyName: true, contactPerson: true } });
  const f = cs.filter(c => {
    const s = `${c.companyName} ${c.contactPerson}`.toLowerCase();
    return s.includes('star') || s.includes('weigh') || s.includes('bridge');
  });
  console.log('Filtered customers:', f);
  console.log('Total customers:', cs.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
