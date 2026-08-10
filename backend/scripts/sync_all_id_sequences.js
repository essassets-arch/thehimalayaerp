const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncSequences() {
  console.log('=== SYNCING ALL ID SEQUENCES WITH HIGHEST DB VALUES ===\n');

  // 1. Sync Lead Sequence
  const leads = await prisma.lead.findMany({ select: { leadNumber: true } });
  let maxLeadNum = 0;
  for (const l of leads) {
    if (l.leadNumber) {
      // Match standard format: LEAD-YYYY-XXXXX or similar sequential digits
      const match = l.leadNumber.match(/LEAD-(?:\d{4}-)?(\d{1,6})$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num < 1000000 && num > maxLeadNum) maxLeadNum = num;
      }
    }
  }
  const leadSeqNext = Math.max(maxLeadNum + 1, 100);
  await prisma.idSequence.upsert({
    where: { key: 'lead_number' },
    update: { nextValue: { set: leadSeqNext } },
    create: { key: 'lead_number', nextValue: leadSeqNext }
  });
  console.log(`✓ Lead Sequence synced: Highest existing standard lead = ${maxLeadNum}, Next Value set to ${leadSeqNext}`);

  // 2. Sync Quotation Sequence
  const quotations = await prisma.quotation.findMany({ select: { quotationNumber: true } });
  let maxQuotationNum = 0;
  for (const q of quotations) {
    if (q.quotationNumber) {
      const match = q.quotationNumber.match(/(?:\d{4}-)?(\d{1,6})$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num < 1000000 && num > maxQuotationNum) maxQuotationNum = num;
      }
    }
  }
  const quotationSeqNext = Math.max(maxQuotationNum + 1, 100);
  await prisma.idSequence.upsert({
    where: { key: 'quotation_number' },
    update: { nextValue: { set: quotationSeqNext } },
    create: { key: 'quotation_number', nextValue: quotationSeqNext }
  });
  console.log(`✓ Quotation Sequence synced: Highest existing quotation = ${maxQuotationNum}, Next Value set to ${quotationSeqNext}`);

  // 3. Sync Sales Order Sequence
  const orders = await prisma.salesOrder.findMany({ select: { orderNumber: true } });
  let maxOrderNum = 0;
  for (const o of orders) {
    if (o.orderNumber) {
      const match = o.orderNumber.match(/(?:\d{4}-)?(\d{1,6})$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num < 1000000 && num > maxOrderNum) maxOrderNum = num;
      }
    }
  }
  const orderSeqNext = Math.max(maxOrderNum + 1, 100);
  await prisma.idSequence.upsert({
    where: { key: 'sales_order_number' },
    update: { nextValue: { set: orderSeqNext } },
    create: { key: 'sales_order_number', nextValue: orderSeqNext }
  });
  console.log(`✓ Sales Order Sequence synced: Highest existing sales order = ${maxOrderNum}, Next Value set to ${orderSeqNext}`);

  // Print summary of all sequences in IdSequence table
  const allSequences = await prisma.idSequence.findMany();
  console.log('\nAll IdSequences in DB:', allSequences);
}

syncSequences().catch(console.error).finally(() => prisma.$disconnect());
