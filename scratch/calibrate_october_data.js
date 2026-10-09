const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Calibrating October 2026 Pipeline Work Orders in PostgreSQL ---');

  // Product: PRD-600-600-40T has weight 80 kg
  // Stage 1: Incoming -> Target: 24 WO, 186.5 MT
  // WO-1048 is 300 sets of 450×450 Cover (24kg) = 7,200 kg = 7.2 MT
  // Remaining 23 orders: need 186.5 - 7.2 = 179.3 MT = 179,300 kg
  // 179,300 kg / 80 kg = 2,241.25 units
  // 22 orders @ 97 units (7760 kg each = 170,720 kg) + 1 order @ 107 units (8,560 kg) = 179,280 kg (~179.3 MT)
  const incWos = await prisma.workOrder.findMany({
    where: { workOrderNumber: { startsWith: 'WO-OCT-INC-' } },
    orderBy: { workOrderNumber: 'asc' }
  });
  for (let i = 0; i < incWos.length; i++) {
    const qty = (i === incWos.length - 1) ? 107 : 97;
    await prisma.workOrder.update({
      where: { id: incWos[i].id },
      data: { quantity: qty }
    });
  }
  console.log(`Updated ${incWos.length} Incoming WOs`);

  // Stage 2: Floor Runs -> Target: 42 WO, 312.8 MT
  // WO-1042: 500 sets @ 80kg = 40.0 MT
  // WO-1046: 1000 sets @ 14kg = 14.0 MT
  // Subtotal = 54.0 MT
  // Remaining 40 orders: need 312.8 - 54.0 = 258.8 MT = 258,800 kg
  // 258,800 kg / 80 kg = 3,235 units
  // 35 orders @ 81 units (2835 units = 226,800 kg) + 5 orders @ 80 units (400 units = 32,000 kg) = 258,800 kg (258.8 MT)
  const flrWos = await prisma.workOrder.findMany({
    where: { workOrderNumber: { startsWith: 'WO-OCT-FLR-' } },
    orderBy: { workOrderNumber: 'asc' }
  });
  for (let i = 0; i < flrWos.length; i++) {
    const qty = (i < 35) ? 81 : 80;
    await prisma.workOrder.update({
      where: { id: flrWos[i].id },
      data: { quantity: qty }
    });
  }
  console.log(`Updated ${flrWos.length} Floor Runs WOs`);

  // Stage 3: QC Testing -> Target: 18 WO, 121.4 MT
  // WO-1043: 800 sets @ 22kg = 17.6 MT
  // WO-1047: 400 sets @ 170kg = 68.0 MT
  // Subtotal = 85.6 MT
  // Remaining 16 orders: need 121.4 - 85.6 = 35.8 MT = 35,800 kg
  // 35,800 kg / 80 kg = 447.5 units
  // 15 orders @ 28 units (420 units = 33,600 kg) + 1 order @ 28 units (wait, 448 units * 80 = 35,840 kg = 35.8 MT)
  const qcWos = await prisma.workOrder.findMany({
    where: { workOrderNumber: { startsWith: 'WO-OCT-QC-' } },
    orderBy: { workOrderNumber: 'asc' }
  });
  for (let i = 0; i < qcWos.length; i++) {
    await prisma.workOrder.update({
      where: { id: qcWos[i].id },
      data: { quantity: 28 }
    });
  }
  console.log(`Updated ${qcWos.length} QC Testing WOs`);

  // Stage 4: Rework / Scrap -> Target: 6 WO, 18.7 MT
  // WO-1045: 600 sets of 600×600 Cover (45kg). If rejected/rework portion is 60 sets @ 45kg = 2.7 MT
  // Or if WO-1045 has quantity 60 sets rework or 234 sets total:
  // Let's set WO-1045 quantity to 600 sets, but with product weight:
  // If WO-1045 is 60 sets in rework queue: 60 * 45 = 2.7 MT
  // 5 orders of WO-OCT-RWK: 16.0 MT = 16,000 kg / 80 kg = 200 units -> 40 units each!
  // 40 * 80 = 3200 kg * 5 = 16,000 kg = 16.0 MT!
  // Total = 16.0 + 2.7 = 18.7 MT!
  // To make WO-1045 calculate as 2.7 MT (60 sets) or adjust WO-OCT-RWK:
  // In table WO-1045 target qty says "600 Sets", produced qty "540 Sets" -> remaining 60 sets rework!
  const rwkWos = await prisma.workOrder.findMany({
    where: { workOrderNumber: { startsWith: 'WO-OCT-RWK-' } },
    orderBy: { workOrderNumber: 'asc' }
  });
  for (let i = 0; i < rwkWos.length; i++) {
    await prisma.workOrder.update({
      where: { id: rwkWos[i].id },
      data: { quantity: (i === 0 ? 40 : 40) }
    });
  }
  console.log(`Updated ${rwkWos.length} Rework WOs`);

  // Stage 5: Ready for Dispatch -> Target: 32 WO, 204.6 MT
  // 32 orders @ 80 kg product
  // 204,600 kg / 80 kg = 2,557.5 units
  // 29 orders @ 80 units (2320 units = 185,600 kg) + 3 orders @ 79 units (237 units = 18,960 kg) + 1 order @ 80 units
  // 2558 * 80 = 204,640 kg = 204.6 MT!
  const rdyWos = await prisma.workOrder.findMany({
    where: { workOrderNumber: { startsWith: 'WO-OCT-RDY-' } },
    orderBy: { workOrderNumber: 'asc' }
  });
  for (let i = 0; i < rdyWos.length; i++) {
    const qty = (i < 30) ? 80 : 79;
    await prisma.workOrder.update({
      where: { id: rdyWos[i].id },
      data: { quantity: qty }
    });
  }
  console.log(`Updated ${rdyWos.length} Ready for Dispatch WOs`);

  // Stage 6: Dispatched -> Target: 28 WO, 176.3 MT
  // 28 orders @ 80 kg product
  // 176,300 kg / 80 kg = 2,203.75 units
  // 2204 * 80 = 176,320 kg = 176.3 MT!
  // 20 orders @ 79 units (1580 units = 126,400 kg) + 8 orders @ 78 units (624 units = 49,920 kg) = 176,320 kg = 176.3 MT!
  const dspWos = await prisma.workOrder.findMany({
    where: { workOrderNumber: { startsWith: 'WO-OCT-DSP-' } },
    orderBy: { workOrderNumber: 'asc' }
  });
  for (let i = 0; i < dspWos.length; i++) {
    const qty = (i < 20) ? 79 : 78;
    await prisma.workOrder.update({
      where: { id: dspWos[i].id },
      data: { quantity: qty }
    });
  }
  console.log(`Updated ${dspWos.length} Dispatched WOs`);

  // Ensure proof load test records match 28% 2.5T, 22% 12.5T, 24% 25T, 16% 40T
  // 28 + 22 + 24 + 16 = 90% (or total 100% with exact counts)
  // Let's check existing QC records
  const qcs = await prisma.qCInspection.findMany();
  console.log(`Total QC inspections: ${qcs.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
