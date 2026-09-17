const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Let's import parseDeliveryLocation or copy its logic from plant-head.service.ts
function parseDeliveryLocation(deliveryAddress, shippingAddress, billingAddress) {
  const raw = [deliveryAddress, shippingAddress, billingAddress].filter(Boolean).join(' ');
  const pinMatch = raw.match(/\b([1-9][0-9]{5})\b/);
  const pincode = pinMatch ? pinMatch[1] : '';

  const clean = raw.toLowerCase();
  let city = 'Ahmedabad';
  let zone = 'Ahmedabad';
  let locality = 'General Area';

  if (clean.includes('sanand')) locality = 'Sanand GIDC';
  else if (clean.includes('changodar')) locality = 'Changodar';
  else if (clean.includes('vatva')) locality = 'Vatva GIDC';
  else if (clean.includes('naroda')) locality = 'Naroda GIDC';
  else if (clean.includes('odhav')) locality = 'Odhav GIDC';
  else if (clean.includes('bavla')) locality = 'Bavla';
  else if (clean.includes('chhatral') || clean.includes('kalol')) locality = 'Chhatral / Kalol';
  else if (clean.includes('surat')) { locality = 'Surat'; city = 'Surat'; zone = 'South Gujarat'; }
  else if (clean.includes('vadodara') || clean.includes('baroda')) { locality = 'Vadodara'; city = 'Vadodara'; zone = 'Central Gujarat'; }
  else if (clean.includes('rajkot')) { locality = 'Rajkot'; city = 'Rajkot'; zone = 'Saurashtra'; }
  else if (clean.includes('mumbai') || clean.includes('thane') || clean.includes('pune')) { locality = 'Maharashtra'; city = 'Mumbai Region'; zone = 'West'; }
  else if (clean.includes('delhi') || clean.includes('noida') || clean.includes('gurgaon')) { locality = 'NCR'; city = 'Delhi NCR'; zone = 'North'; }
  else if (clean.includes('bangalore') || clean.includes('bengaluru')) { locality = 'Bengaluru'; city = 'Bengaluru'; zone = 'South'; }
  else if (pincode.startsWith('382')) locality = 'Ahmedabad Industrial';
  else if (pincode.startsWith('380')) locality = 'Ahmedabad City';
  else if (pincode.startsWith('39')) { locality = 'Gujarat Central/South'; city = 'Gujarat'; zone = 'Gujarat'; }
  else if (pincode.startsWith('36') || pincode.startsWith('37')) { locality = 'Saurashtra/Kutch'; city = 'Gujarat'; zone = 'Saurashtra'; }

  return { pincode, city, zone, locality, formattedLocation: `${locality} (${city})` };
}

async function testAnalytics(monthStr, filterStr) {
  console.log(`\n================ Testing for ${filterStr} (${monthStr}) ================`);
  let startDate, endDate;
  if (monthStr === '2026-08') {
    startDate = new Date('2026-08-01T00:00:00.000Z');
    endDate = new Date('2026-08-31T23:59:59.999Z');
  } else if (monthStr === '2026-09') {
    startDate = new Date('2026-09-01T00:00:00.000Z');
    endDate = new Date('2026-09-30T23:59:59.999Z');
  } else {
    startDate = new Date('2020-01-01T00:00:00.000Z');
    endDate = new Date('2030-12-31T23:59:59.999Z');
  }

  const isAllTime = startDate.getFullYear() <= 2020 && endDate.getFullYear() >= 2030;
  const dbDispatches = await prisma.dispatch.findMany({
    where: isAllTime
      ? {}
      : {
          OR: [
            { dispatchedAt: { gte: startDate, lte: endDate } },
            { createdAt: { gte: startDate, lte: endDate } },
          ],
        },
    include: {
      salesOrder: {
        include: {
          customer: true,
          salesExecutive: true,
          items: { include: { product: true } },
        },
      },
      items: {
        include: {
          salesOrderItem: { include: { product: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Total dispatches found in range: ${dbDispatches.length}`);
  
  let totalQty = 0;
  let totalWeight = 0;
  const customerSet = new Set();
  const dateSet = new Set();
  const salesOrdersIncluded = new Set();

  for (const d of dbDispatches) {
    const dWeight = Number(d.totalWeight) || 0;
    const dPcs = Number(d.packageCount) || (d.items && d.items.length > 0 ? d.items.reduce((s, it) => s + (Number(it.quantity) || 1), 0) : 1);
    totalWeight += dWeight;
    totalQty += dPcs;
    const cName = d.salesOrder?.customer?.companyName || 'Unknown Customer';
    customerSet.add(cName);
    const dDate = d.dispatchedAt ? d.dispatchedAt.toISOString().slice(0, 10) : d.createdAt.toISOString().slice(0, 10);
    dateSet.add(dDate);
    if (d.salesOrderId) salesOrdersIncluded.add(d.salesOrderId);
  }

  console.log(`Summary: Total Qty = ${totalQty} pcs, Total Weight = ${totalWeight} kg (${(totalWeight/1000).toFixed(2)} MT)`);
  console.log(`Unique Customers = ${customerSet.size}, Active Dispatch Dates = ${dateSet.size}`);
  console.log(`Distinct Sales Orders dispatched = ${salesOrdersIncluded.size}`);
  console.log(`Sample dates:`, Array.from(dateSet).sort());
}

async function main() {
  await testAnalytics('2026-08', 'August 2026');
  await testAnalytics('2026-09', 'September 2026');
  await testAnalytics('all', 'All Time');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
