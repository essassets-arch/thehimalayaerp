const { PrismaClient } = require('@prisma/client');

async function seedQuotationsForMissing(label, url) {
  console.log(`\n--- Seeding missing quotations for ${label} ---`);
  const prisma = new PrismaClient({ datasources: { db: { url } } });

  try {
    const templateQuote = await prisma.quotation.findFirst({
      where: { quotationNumber: 'QU/2627/0072' },
      include: { items: true }
    });

    if (!templateQuote) {
      console.error('Template quotation QU/2627/0072 not found!');
      return;
    }

    const salesUsers = [
      { name: 'Sales 5', email: 'sales5@himalayaerp.com', code: '05' },
      { name: 'Sales 11', email: 'sales11@himalayaerp.com', code: '11' },
      { name: 'Sales 13', email: 'sales13@himalayaerp.com', code: '13' },
      { name: 'Sales 14', email: 'sales14@himalayaerp.com', code: '14' },
    ];

    for (const su of salesUsers) {
      const user = await prisma.user.findFirst({
        where: { email: su.email }
      });
      if (!user) {
        console.warn(`User ${su.email} not found!`);
        continue;
      }

      const existing = await prisma.quotation.findFirst({
        where: {
          OR: [
            { salesExecutiveId: user.id },
            { createdById: user.id }
          ]
        }
      });

      if (existing) {
        console.log(`User ${su.name} already has quotation: ${existing.quotationNumber}`);
        continue;
      }

      const quoteNumber = `QT/2627/99${su.code}`;
      const newQuote = await prisma.quotation.create({
        data: {
          quotationNumber: quoteNumber,
          companyId: templateQuote.companyId,
          workflowStateId: templateQuote.workflowStateId,
          customerId: templateQuote.customerId,
          salesExecutiveId: user.id,
          createdById: user.id,
          validUntil: templateQuote.validUntil,
          subtotal: templateQuote.subtotal,
          discount: templateQuote.discount,
          tax: templateQuote.tax,
          total: templateQuote.total,
          expectedTransportationCost: templateQuote.expectedTransportationCost,
          paymentTerms: templateQuote.paymentTerms,
          paymentTermDays: templateQuote.paymentTermDays,
          version: 1,
          items: {
            create: templateQuote.items.map(item => ({
              productId: item.productId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              tax: item.tax,
              lineTotal: item.lineTotal
            }))
          }
        }
      });
      console.log(`✓ Created quotation ${newQuote.quotationNumber} for ${su.name} (${su.email})`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await seedQuotationsForMissing('Docker DB (5435)', 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public');
  await seedQuotationsForMissing('Local DB (5432)', 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public');
}

main().catch(console.error);
