import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.customerPayment.deleteMany({
    where: {
      paymentNo: {
        in: ['PAY-2026-00010', 'PAY-2026-00011', 'PAY-2026-00012']
      }
    }
  });
  console.log(`Deleted ${result.count} old test payments`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
