const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const oct = await prisma.workOrder.findFirst({
    where: { workOrderNumber: 'WO-1042' },
    include: {
      productionPlan: {
        include: {
          salesOrder: {
            include: { customer: true }
          }
        }
      }
    }
  });
  console.log('WO-1042 customer:', oct.productionPlan?.salesOrder?.customer?.companyName, 'companyId:', oct.productionPlan?.salesOrder?.customer?.companyId);

  const octCompany = await prisma.company.findFirst({
    where: { name: { contains: 'Himalaya' } }
  });
  console.log('Himalaya Company ID:', octCompany.id);

  const disp = await prisma.workOrder.findFirst({
    where: { workOrderNumber: { startsWith: 'WO-DISP' } },
    include: {
      productionPlan: {
        include: {
          salesOrder: {
            include: { customer: true }
          }
        }
      }
    }
  });
  console.log('WO-DISP customer companyId:', disp?.productionPlan?.salesOrder?.customer?.companyId);
  console.log('WO-DISP createdAt:', disp?.createdAt);
}
main().finally(() => prisma.$disconnect());
