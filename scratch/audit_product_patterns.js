const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      category: true,
      type: true,
      size: true,
      capacity: true,
      weight: true,
      coverUnitWeight: true,
      frameUnitWeight: true,
      coversPerSet: true,
      framesPerSet: true,
      updatedAt: true,
    }
  });

  console.log(`Total Products: ${products.length}`);
  
  // Group by weight / coverUnitWeight patterns
  const weightGroups = {};
  for (const p of products) {
    const key = `Size: ${p.size || 'null'} | CoverUW: ${p.coverUnitWeight} | FrameUW: ${p.frameUnitWeight} | Wt: ${p.weight}`;
    weightGroups[key] = (weightGroups[key] || 0) + 1;
  }

  const sortedGroups = Object.entries(weightGroups).sort((a, b) => b[1] - a[1]);
  console.log('Top 15 Product Weight/Size patterns in DB:');
  console.log(sortedGroups.slice(0, 15));

  // Let's check products that were updated by the backfill
  // We can write a detailed audit JSON file documenting every product's specification:
  // product id, name, size, type, capacity, coverUnitWeight, frameUnitWeight, coversPerSet, framesPerSet, weight, source
}

main().catch(console.error).finally(() => prisma.$disconnect());
