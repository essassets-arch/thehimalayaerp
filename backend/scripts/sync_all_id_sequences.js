const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getFinancialYearCode(date = new Date()) {
  const d = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
  const month = d.getMonth();
  const fullYear = d.getFullYear();
  const startYear = month >= 3 ? fullYear : fullYear - 1;
  const endYear = startYear + 1;
  const yy = String(startYear).substring(2);
  const ny = String(endYear).substring(2);
  return `${yy}${ny}`;
}

async function syncSequences() {
  console.log('=== SYNCING ALL ID SEQUENCES (LEAD, QUOTATION, SALES ORDER) ===\n');
  const fy = getFinancialYearCode();

  // 1. Sync Lead Sequence
  const leads = await prisma.lead.findMany({ select: { leadNumber: true } });
  let maxLeadNum = 0;
  for (const l of leads) {
    if (l.leadNumber) {
      const match = l.leadNumber.match(/(?:LEAD(?:\/\d{4}\/|-)|HCCL\/\d{4}\/)(\d{1,6})$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num < 1000000 && num > maxLeadNum) maxLeadNum = num;
      }
    }
  }
  const leadSeqNext = maxLeadNum + 1;
  await prisma.idSequence.upsert({
    where: { key: `lead_number_${fy}` },
    update: { nextValue: leadSeqNext },
    create: { key: `lead_number_${fy}`, nextValue: leadSeqNext }
  });
  await prisma.idSequence.upsert({
    where: { key: 'lead_number' },
    update: { nextValue: leadSeqNext },
    create: { key: 'lead_number', nextValue: leadSeqNext }
  });
  console.log(`✓ Lead Sequence synced (key: lead_number_${fy}): Highest existing lead = ${maxLeadNum}, Next Value set to ${leadSeqNext}`);

  // 2. Sync Quotation Sequence
  const quotations = await prisma.quotation.findMany({ select: { quotationNumber: true } });
  let maxQuotationNum = 0;
  for (const q of quotations) {
    if (q.quotationNumber) {
      const match = q.quotationNumber.match(/(?:QU(?:\/\d{4}\/|-)|QTN-|HCCL\/\d{4}\/)(\d{1,6})$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num < 1000000 && num > maxQuotationNum) maxQuotationNum = num;
      }
    }
  }
  const quotationSeqNext = maxQuotationNum + 1;
  await prisma.idSequence.upsert({
    where: { key: `quotation_number_${fy}` },
    update: { nextValue: quotationSeqNext },
    create: { key: `quotation_number_${fy}`, nextValue: quotationSeqNext }
  });
  await prisma.idSequence.upsert({
    where: { key: 'quotation_number' },
    update: { nextValue: quotationSeqNext },
    create: { key: 'quotation_number', nextValue: quotationSeqNext }
  });
  console.log(`✓ Quotation Sequence synced (key: quotation_number_${fy}): Highest existing quotation = ${maxQuotationNum}, Next Value set to ${quotationSeqNext}`);

  // 3. Sync Sales Order Sequence
  const orders = await prisma.salesOrder.findMany({ select: { orderNumber: true } });
  let maxOrderNum = 0;
  for (const o of orders) {
    if (o.orderNumber) {
      const match = o.orderNumber.match(/(?:HCPPL(?:\/\d{4}\/|-)|SO-|HCCL\/\d{4}\/)(\d{1,6})$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num < 1000000 && num > maxOrderNum) maxOrderNum = num;
      }
    }
  }
  const orderSeqNext = maxOrderNum + 1;
  await prisma.idSequence.upsert({
    where: { key: `sales_order_number_${fy}` },
    update: { nextValue: orderSeqNext },
    create: { key: `sales_order_number_${fy}`, nextValue: orderSeqNext }
  });
  await prisma.idSequence.upsert({
    where: { key: 'sales_order_number' },
    update: { nextValue: orderSeqNext },
    create: { key: 'sales_order_number', nextValue: orderSeqNext }
  });
  console.log(`✓ Sales Order Sequence synced (key: sales_order_number_${fy}): Highest existing sales order = ${maxOrderNum}, Next Value set to ${orderSeqNext}`);

  // Print summary
  const allSequences = await prisma.idSequence.findMany();
  console.log('\nAll IdSequences in DB:', allSequences);
}

syncSequences().catch(console.error).finally(() => prisma.$disconnect());
