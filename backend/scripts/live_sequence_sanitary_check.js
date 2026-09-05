const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runSanitaryCheck() {
  console.log('======================================================================');
  console.log('🔍 HIMALAYA ERP — LIVE DATABASE SEQUENCE ALIGNMENT & SANITARY CHECK');
  console.log('======================================================================\n');

  try {
    // 1. Inspect Leads
    const leads = await prisma.lead.findMany({
      where: {
        leadNumber: {
          startsWith: 'LEAD/2627/',
        },
      },
      select: { leadNumber: true },
    });

    let maxLeadSeq = 0;
    leads.forEach((l) => {
      const match = l.leadNumber.match(/^LEAD\/2627\/(\d+)$/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > maxLeadSeq) maxLeadSeq = val;
      }
    });

    // 2. Inspect Quotations
    const quotations = await prisma.quotation.findMany({
      where: {
        quotationNumber: {
          startsWith: 'QU/2627/',
        },
      },
      select: { quotationNumber: true },
    });

    let maxQuoteSeq = 0;
    quotations.forEach((q) => {
      const match = q.quotationNumber.match(/^QU\/2627\/(\d+)$/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > maxQuoteSeq) maxQuoteSeq = val;
      }
    });

    // 3. Inspect Sales Orders
    const salesOrders = await prisma.salesOrder.findMany({
      where: {
        orderNumber: {
          startsWith: 'HCPPL/2627/',
        },
      },
      select: { orderNumber: true },
    });

    let maxOrderSeq = 0;
    salesOrders.forEach((o) => {
      const match = o.orderNumber.match(/^HCPPL\/2627\/(\d+)$/);
      if (match) {
        const val = parseInt(match[1], 10);
        if (val > maxOrderSeq) maxOrderSeq = val;
      }
    });

    console.log(`📊 Current DB Record Maximums:`);
    console.log(`   - Leads (LEAD/2627/XXXX):       Total = ${leads.length}, Max Number = ${maxLeadSeq} (LEAD/2627/${String(maxLeadSeq).padStart(4, '0')})`);
    console.log(`   - Quotations (QU/2627/XXXX):    Total = ${quotations.length}, Max Number = ${maxQuoteSeq} (QU/2627/${String(maxQuoteSeq).padStart(4, '0')})`);
    console.log(`   - Sales Orders (HCPPL/2627/XXXX): Total = ${salesOrders.length}, Max Number = ${maxOrderSeq} (HCPPL/2627/${String(maxOrderSeq).padStart(4, '0')})\n`);

    // Target next values
    const targetLeadNext = maxLeadSeq + 1;
    const targetQuoteNext = maxQuoteSeq + 1;
    const targetOrderNext = maxOrderSeq + 1;

    // Fetch existing IdSequence values
    const existingSeqs = await prisma.idSequence.findMany({
      where: {
        key: {
          in: ['lead_number_2627', 'quotation_number_2627', 'sales_order_number_2627'],
        },
      },
    });

    const seqMap = new Map(existingSeqs.map((s) => [s.key, s.nextValue]));

    console.log(`⚙️ Existing IdSequence Counters in DB:`);
    console.log(`   - 'lead_number_2627':        ${seqMap.get('lead_number_2627') || 'None'} (Target minimum: ${targetLeadNext})`);
    console.log(`   - 'quotation_number_2627':   ${seqMap.get('quotation_number_2627') || 'None'} (Target minimum: ${targetQuoteNext})`);
    console.log(`   - 'sales_order_number_2627': ${seqMap.get('sales_order_number_2627') || 'None'} (Target minimum: ${targetOrderNext})\n`);

    // Upsert aligned values
    const finalLeadNext = Math.max(seqMap.get('lead_number_2627') || 0, targetLeadNext);
    const finalQuoteNext = Math.max(seqMap.get('quotation_number_2627') || 0, targetQuoteNext);
    const finalOrderNext = Math.max(seqMap.get('sales_order_number_2627') || 0, targetOrderNext);

    await prisma.$transaction([
      prisma.idSequence.upsert({
        where: { key: 'lead_number_2627' },
        update: { nextValue: finalLeadNext, updatedAt: new Date() },
        create: { key: 'lead_number_2627', nextValue: finalLeadNext },
      }),
      prisma.idSequence.upsert({
        where: { key: 'quotation_number_2627' },
        update: { nextValue: finalQuoteNext, updatedAt: new Date() },
        create: { key: 'quotation_number_2627', nextValue: finalQuoteNext },
      }),
      prisma.idSequence.upsert({
        where: { key: 'sales_order_number_2627' },
        update: { nextValue: finalOrderNext, updatedAt: new Date() },
        create: { key: 'sales_order_number_2627', nextValue: finalOrderNext },
      }),
    ]);

    console.log(`✅ Successfully Aligned & Saved IdSequence Counters:`);
    console.log(`   ✓ 'lead_number_2627':        nextValue = ${finalLeadNext}  -> Next Lead will be LEAD/2627/${String(finalLeadNext).padStart(4, '0')}`);
    console.log(`   ✓ 'quotation_number_2627':   nextValue = ${finalQuoteNext}  -> Next Quotation will be QU/2627/${String(finalQuoteNext).padStart(4, '0')}`);
    console.log(`   ✓ 'sales_order_number_2627': nextValue = ${finalOrderNext}  -> Next Order will be HCPPL/2627/${String(finalOrderNext).padStart(4, '0')}`);

    console.log('\n======================================================================');
    console.log('🎉 ALL LIVE SEQUENCES ARE SANITIZED & SYNCHRONIZED SAFELY');
    console.log('======================================================================');
  } catch (error) {
    console.error('❌ Error executing sanitary sequence alignment:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSanitaryCheck();
