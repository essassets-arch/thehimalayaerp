import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting nextReminder backfill reconciliation...');

  // 1. Leads
  const leads = await prisma.lead.findMany();
  console.log(`Found ${leads.length} leads. Reconciling...`);
  for (const l of leads) {
    const next = await prisma.followUp.findFirst({
      where: {
        moduleType: 'Lead',
        moduleId: l.id,
        status: 'Pending',
      },
      orderBy: { reminderAt: 'asc' },
    });
    const nextReminder = next?.reminderAt ?? null;
    await prisma.lead.update({
      where: { id: l.id },
      data: { nextReminder },
    });
  }
  console.log('Leads reconciliation finished.');

  // 2. Samples
  const samples = await prisma.sampleRequest.findMany();
  console.log(`Found ${samples.length} samples. Reconciling...`);
  for (const s of samples) {
    const next = await prisma.followUp.findFirst({
      where: {
        moduleType: 'Sample',
        moduleId: s.id,
        status: 'Pending',
      },
      orderBy: { reminderAt: 'asc' },
    });
    const nextReminder = next?.reminderAt ?? null;
    await prisma.sampleRequest.update({
      where: { id: s.id },
      data: { nextReminder },
    });
  }
  console.log('Samples reconciliation finished.');

  // 3. Quotations
  const quotations = await prisma.quotation.findMany();
  console.log(`Found ${quotations.length} quotations. Reconciling...`);
  for (const q of quotations) {
    const next = await prisma.followUp.findFirst({
      where: {
        moduleType: 'Quotation',
        moduleId: q.id,
        status: 'Pending',
      },
      orderBy: { reminderAt: 'asc' },
    });
    const nextReminder = next?.reminderAt ?? null;
    await prisma.quotation.update({
      where: { id: q.id },
      data: { nextReminder },
    });
  }
  console.log('Quotations reconciliation finished.');

  // 4. Payments/SalesOrders
  const orders = await prisma.salesOrder.findMany();
  console.log(`Found ${orders.length} sales orders. Reconciling...`);
  for (const o of orders) {
    const next = await prisma.followUp.findFirst({
      where: {
        moduleType: 'Payment',
        moduleId: o.id,
        status: 'Pending',
      },
      orderBy: { reminderAt: 'asc' },
    });
    const nextReminder = next?.reminderAt ?? null;
    await prisma.salesOrder.update({
      where: { id: o.id },
      data: { nextReminder },
    });
  }
  console.log('Sales orders reconciliation finished.');

  console.log('Backfill finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
