import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'sales1@himalayaerp.com' }
  });

  if (!user) {
    console.error('sales1@himalayaerp.com not found!');
    return;
  }

  console.log('Seeding targets for user:', user.name, user.id);

  // Clear existing targets to start clean
  await prisma.salesTarget.deleteMany({});
  await prisma.productionTarget.deleteMany({});

  const salesTarget = await prisma.salesTarget.create({
    data: {
      salespersonId: user.id,
      targetPeriod: 'Monthly',
      startDate: new Date('2026-08-01T00:00:00Z'),
      endDate: new Date('2026-08-31T23:59:59Z'),
      revenueTarget: 16050000.00, // 160.5 Lakhs
      remarks: 'August target for Sales Executive 1',
      status: 'ACTIVE'
    }
  });
  console.log('Seeded Sales Target:', salesTarget);

  const prodTarget = await prisma.productionTarget.create({
    data: {
      targetPeriod: 'Monthly',
      startDate: new Date('2026-08-19T00:00:00Z'),
      endDate: new Date('2026-09-18T23:59:59Z'),
      quantityTarget: 15000,
      remarks: 'August production target',
      status: 'ACTIVE',
      plantId: '1'
    }
  });
  console.log('Seeded Production Target:', prodTarget);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
