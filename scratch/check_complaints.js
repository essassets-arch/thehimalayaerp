const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public',
    },
  },
});

async function main() {
  const complaints = await prisma.customerComplaint.findMany({
    include: {
      financeAdjustment: true,
      order: {
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
        },
      },
    },
  });
  console.log('Customer Complaints in DB:');
  console.dir(complaints, { depth: null });
}

main().finally(() => prisma.$disconnect());
