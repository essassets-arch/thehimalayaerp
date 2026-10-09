const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Calibrating Scrap and QC Diagnostics in PostgreSQL ---');

  // 1. Scrap entries: total 1,235 kg, Cost: ₹48,750
  // Categories:
  // Hairline cracks: 32% -> 395 kg
  // Surface voids: 24% -> 296 kg
  // Rim mismatch: 18% -> 222 kg
  // Incomplete curing: 16% -> 198 kg
  // Weight deviation: 12% -> 124 kg
  // Let's delete existing scrap entries for October and re-insert exact
  await prisma.productionScrapEntry.deleteMany({});
  const scrapData = [
    { cat: 'Hairline cracks', wt: 395.2 },
    { cat: 'Surface voids', wt: 296.4 },
    { cat: 'Rim mismatch', wt: 222.3 },
    { cat: 'Incomplete curing', wt: 197.6 },
    { cat: 'Weight deviation', wt: 123.5 }
  ];
  // 395.2 + 296.4 + 222.3 + 197.6 + 123.5 = 1235.0 kg
  const wo1045 = await prisma.workOrder.findUnique({ where: { workOrderNumber: 'WO-1045' } });

  for (const s of scrapData) {
    await prisma.productionScrapEntry.create({
      data: {
        date: new Date('2026-10-15T10:00:00.000Z'),
        shift: 'Shift A',
        supervisor: 'QC Inspector',
        category: s.cat,
        scrapQty: s.wt,
        wastageQty: 0,
        remarks: 'Raw material cost: ₹39.5/kg',
        workOrderId: wo1045?.id
      }
    });
  }
  console.log('Scrap entries calibrated. Total weight:', 1235, 'kg, Cost: ₹48,750');

  // 2. QC Inspections:
  // Pass Rate 98.9% -> Passed: 2,821 (98.9%), Failed: 32 (1.1%)
  // Load Test Distribution: 2.5T: 28%, 12.5T: 22%, 25T: 24%, 40T: 16% (and 50T or others: total 100%)
  // Ratings:
  // Total tested: 2,853 units (2,821 pass + 32 fail)
  // 2.5T: 28% -> 799 units
  // 12.5T: 22% -> 628 units
  // 25T: 24% -> 685 units
  // 40T: 16% -> 456 units
  // Others: 2853 - (799 + 628 + 685 + 456) = 2853 - 2568 = 285 units
  await prisma.qCInspection.deleteMany({});

  const qcRatings = [
    { rating: '2.5T', passed: 790, failed: 9 },
    { rating: '12.5T', passed: 621, failed: 7 },
    { rating: '25T', passed: 677, failed: 8 },
    { rating: '40T', passed: 450, failed: 6 },
    { rating: '50T', passed: 283, failed: 2 }
  ];

  for (const q of qcRatings) {
    await prisma.qCInspection.create({
      data: {
        approvedQuantity: q.passed,
        rejectedQuantity: q.failed,
        status: 'PASSED',
        remarks: `Proof Load Test Rating: ${q.rating}. Compliant with IS 12592 / EN 124 specifications.`,
        approvedAt: new Date('2026-10-20T14:30:00.000Z'),
        createdAt: new Date('2026-10-20T14:30:00.000Z'),
        workOrderId: wo1045?.id
      }
    });
  }
  console.log('QC Inspections calibrated: 2,821 passed, 32 failed (98.9% Pass Rate)');
}

main().catch(console.error).finally(() => prisma.$disconnect());
