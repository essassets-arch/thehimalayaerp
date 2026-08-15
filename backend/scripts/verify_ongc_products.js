const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SIZES = [
  '300X700',
  '385X700',
  '450X600',
  '600X600',
  '350X1000',
  '450X1000',
  '600X1000',
  '600X720',
  '600X900',
];

const CLASSES = ['ELD', 'LD', 'B125', 'C250', 'D400', 'E600', 'F900'];

async function verify() {
  console.log('--- Verifying Database Products ---');
  let missing = [];
  let found = 0;

  for (const s of SIZES) {
    for (const c of CLASSES) {
      const p = await prisma.product.findFirst({
        where: {
          OR: [
            { name: `HIMALAYA FRP ONGC ${s} ${c} SINGLE` },
            { sku: `HIMALAYAFRPONGC${s}${c}SINGLE` },
          ],
        },
      });
      if (!p) {
        missing.push(`${s} ${c}`);
      } else {
        found++;
      }
    }
  }

  console.log(`Found: ${found} / 63 products.`);
  if (missing.length === 0) {
    console.log(`✅ All 63 ONGC Single products (9 sizes x 7 classes) successfully verified in database!`);
  } else {
    console.log(`❌ Missing ${missing.length} products:`, missing);
  }

  const sample = await prisma.product.findFirst({
    where: { name: 'HIMALAYA FRP ONGC 300X700 ELD SINGLE' },
  });
  console.log('\nSample Product Record:\n', JSON.stringify(sample, null, 2));
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
