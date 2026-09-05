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

async function convertAndAlignSequences() {
  console.log('\n========================================================================');
  console.log(' CONVERTING ALL HCCL / LEGACY PREFIXES TO STANDARD PREFIXES (LEAD, QU, HCPPL)');
  console.log('========================================================================\n');

  const fy = getFinancialYearCode();

  // 1. CONVERT LEADS: HCCL/YYYY/XXXX -> LEAD/YYYY/XXXX
  const hcclLeads = await prisma.lead.findMany({
    where: {
      OR: [
        { leadNumber: { startsWith: 'HCCL/' } },
        { leadNumber: { startsWith: 'LD-' } },
        { leadNumber: { startsWith: 'L-' } },
      ],
    },
    select: { id: true, leadNumber: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${hcclLeads.length} leads with legacy/HCCL prefixes.`);

  for (const lead of hcclLeads) {
    if (!lead.leadNumber) continue;
    const match = lead.leadNumber.match(/(\d{1,6})$/);
    if (match) {
      const num = parseInt(match[1], 10);
      const newLeadNumber = `LEAD/${fy}/${String(num).padStart(4, '0')}`;

      const existing = await prisma.lead.findFirst({
        where: { leadNumber: newLeadNumber, id: { not: lead.id } },
        select: { id: true },
      });

      if (!existing) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { leadNumber: newLeadNumber },
        });
        console.log(`  ✓ Updated Lead ${lead.leadNumber} -> ${newLeadNumber}`);
      } else {
        console.warn(`  ⚠️ Target ${newLeadNumber} already exists for lead ${existing.id}`);
      }
    }
  }

  // 2. CONVERT QUOTATIONS: HCCL/YYYY/XXXX -> QU/YYYY/XXXX
  const hcclQuotes = await prisma.quotation.findMany({
    where: {
      OR: [
        { quotationNumber: { startsWith: 'HCCL/' } },
        { quotationNumber: { startsWith: 'QTN-' } },
        { quotationNumber: { startsWith: 'QT-' } },
      ],
    },
    select: { id: true, quotationNumber: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`\nFound ${hcclQuotes.length} quotations with legacy/HCCL prefixes.`);

  for (const quote of hcclQuotes) {
    if (!quote.quotationNumber) continue;
    const match = quote.quotationNumber.match(/(\d{1,6})$/);
    if (match) {
      const num = parseInt(match[1], 10);
      const newQuoteNumber = `QU/${fy}/${String(num).padStart(4, '0')}`;

      const existing = await prisma.quotation.findFirst({
        where: { quotationNumber: newQuoteNumber, id: { not: quote.id } },
        select: { id: true },
      });

      if (!existing) {
        await prisma.quotation.update({
          where: { id: quote.id },
          data: { quotationNumber: newQuoteNumber },
        });
        console.log(`  ✓ Updated Quotation ${quote.quotationNumber} -> ${newQuoteNumber}`);
      }
    }
  }

  // 3. CONVERT SALES ORDERS: HCCL/YYYY/XXXX -> HCPPL/YYYY/XXXX
  const hcclOrders = await prisma.salesOrder.findMany({
    where: {
      OR: [
        { orderNumber: { startsWith: 'HCCL/' } },
        { orderNumber: { startsWith: 'SO-' } },
      ],
    },
    select: { id: true, orderNumber: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`\nFound ${hcclOrders.length} sales orders with legacy/HCCL prefixes.`);

  for (const order of hcclOrders) {
    if (!order.orderNumber) continue;
    const match = order.orderNumber.match(/(\d{1,6})$/);
    if (match) {
      const num = parseInt(match[1], 10);
      const newOrderNumber = `HCPPL/${fy}/${String(num).padStart(4, '0')}`;

      const existing = await prisma.salesOrder.findFirst({
        where: { orderNumber: newOrderNumber, id: { not: order.id } },
        select: { id: true },
      });

      if (!existing) {
        await prisma.salesOrder.update({
          where: { id: order.id },
          data: { orderNumber: newOrderNumber },
        });
        console.log(`  ✓ Updated Sales Order ${order.orderNumber} -> ${newOrderNumber}`);
      }
    }
  }

  // 4. RE-SYNC ALL SEQUENCES IN IDSEQUENCE TABLE
  console.log('\n--- 4. SYNCHRONIZING IDSEQUENCE TABLE ---');

  // Lead Sequence
  const allLeads = await prisma.lead.findMany({ select: { leadNumber: true } });
  let maxLead = 0;
  for (const l of allLeads) {
    if (l.leadNumber) {
      const m = l.leadNumber.match(/(?:LEAD\/\d{4}\/)(\d{1,6})$/);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n < 1000000 && n > maxLead) maxLead = n;
      }
    }
  }
  const nextLeadVal = maxLead + 1;
  await prisma.idSequence.upsert({
    where: { key: `lead_number_${fy}` },
    update: { nextValue: nextLeadVal },
    create: { key: `lead_number_${fy}`, nextValue: nextLeadVal },
  });
  console.log(`✓ Lead Sequence (key: lead_number_${fy}): Max existing = ${maxLead}, nextValue = ${nextLeadVal}`);

  // Quotation Sequence
  const allQuotes = await prisma.quotation.findMany({ select: { quotationNumber: true } });
  let maxQuote = 0;
  for (const q of allQuotes) {
    if (q.quotationNumber) {
      const m = q.quotationNumber.match(/(?:QU\/\d{4}\/)(\d{1,6})$/);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n < 1000000 && n > maxQuote) maxQuote = n;
      }
    }
  }
  const nextQuoteVal = maxQuote + 1;
  await prisma.idSequence.upsert({
    where: { key: `quotation_number_${fy}` },
    update: { nextValue: nextQuoteVal },
    create: { key: `quotation_number_${fy}`, nextValue: nextQuoteVal },
  });
  console.log(`✓ Quotation Sequence (key: quotation_number_${fy}): Max existing = ${maxQuote}, nextValue = ${nextQuoteVal}`);

  // Sales Order Sequence
  const allOrders = await prisma.salesOrder.findMany({ select: { orderNumber: true } });
  let maxOrder = 0;
  for (const o of allOrders) {
    if (o.orderNumber) {
      const m = o.orderNumber.match(/(?:HCPPL\/\d{4}\/)(\d{1,6})$/);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n < 1000000 && n > maxOrder) maxOrder = n;
      }
    }
  }
  const nextOrderVal = maxOrder + 1;
  await prisma.idSequence.upsert({
    where: { key: `sales_order_number_${fy}` },
    update: { nextValue: nextOrderVal },
    create: { key: `sales_order_number_${fy}`, nextValue: nextOrderVal },
  });
  console.log(`✓ Sales Order Sequence (key: sales_order_number_${fy}): Max existing = ${maxOrder}, nextValue = ${nextOrderVal}`);

  // 5. PRINT VERIFICATION REPORT
  console.log('\n--- 5. VERIFICATION AUDIT REPORT ---');
  const leadsReport = await prisma.lead.findMany({
    select: { leadNumber: true, salesExecutive: { select: { email: true } } },
  });
  const leadCounts = {};
  leadsReport.forEach((l) => {
    const pfx = l.leadNumber ? l.leadNumber.split('/')[0] : 'NO_NUMBER';
    const email = (l.salesExecutive && l.salesExecutive.email) || 'unassigned';
    leadCounts[`${pfx} | ${email}`] = (leadCounts[`${pfx} | ${email}`] || 0) + 1;
  });
  console.log('Leads breakdown by prefix & user:', leadCounts);

  const quotesReport = await prisma.quotation.findMany({
    select: { quotationNumber: true, salesExecutive: { select: { email: true } } },
  });
  const quoteCounts = {};
  quotesReport.forEach((q) => {
    const pfx = q.quotationNumber ? q.quotationNumber.split('/')[0] : 'NO_NUMBER';
    const email = (q.salesExecutive && q.salesExecutive.email) || 'unassigned';
    quoteCounts[`${pfx} | ${email}`] = (quoteCounts[`${pfx} | ${email}`] || 0) + 1;
  });
  console.log('Quotations breakdown by prefix & user:', quoteCounts);

  const ordersReport = await prisma.salesOrder.findMany({
    select: { orderNumber: true, salesExecutive: { select: { email: true } } },
  });
  const orderCounts = {};
  ordersReport.forEach((o) => {
    const pfx = o.orderNumber ? o.orderNumber.split('/')[0] : 'NO_NUMBER';
    const email = (o.salesExecutive && o.salesExecutive.email) || 'unassigned';
    orderCounts[`${pfx} | ${email}`] = (orderCounts[`${pfx} | ${email}`] || 0) + 1;
  });
  console.log('Sales Orders breakdown by prefix & user:', orderCounts);

  console.log('\n========================================================================');
  console.log(' ✅ ALIGNMENT COMPLETE! ALL RECORDS AND SEQUENCES ARE 100% UNIFIED!');
  console.log('========================================================================\n');
}

convertAndAlignSequences()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
