const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const products = await prisma.product.findMany({});
  console.log('Found products:', products.length);
  for (const p of products) {
    const name = p.name || '';
    const sizeMatch = name.match(/(\d+\s*X\s*\d+)/i);
    const size = sizeMatch
      ? sizeMatch[1].replace(/\s*/g, '').replace(/X/i, ' x ')
      : (p.size || '600 x 600');
    const typeMatch = name.match(/\b(MHC|WGC|RCS|PS|ONGC)\b/i);
    const type = typeMatch ? typeMatch[1].toUpperCase() : (p.type || 'MHC');
    const capMatch = name.match(/\b(ELD|LD|B125|C250|D400|E600|F900)\b/i);
    const capacity = capMatch ? capMatch[1].toUpperCase() : (p.capacity || 'B125');
    const coverWeight = size.includes('600') ? 8.5 : (size.includes('750') ? 12.0 : (size.includes('900') ? 18.0 : 6.0));
    const frameWeight = size.includes('600') ? 12.0 : (size.includes('750') ? 16.0 : (size.includes('900') ? 22.0 : 8.0));

    await prisma.product.update({
      where: { id: p.id },
      data: {
        size,
        type,
        capacity,
        coverUnitWeight: String(coverWeight),
        frameUnitWeight: String(frameWeight),
        coversPerSet: 1,
        framesPerSet: 1,
      },
    });
  }
  console.log('Products backfilled successfully!');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
