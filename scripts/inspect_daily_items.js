const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.productionDailyReportItem.findMany({
    select: {
      id: true,
      productId: true,
      product: { select: { id: true, name: true, sku: true, coversPerSet: true, framesPerSet: true } },
      coverQty: true,
      frameQty: true,
      setQty: true,
      extraCoverQty: true,
      extraFrameQty: true,
      report: { select: { reportDate: true, status: true } }
    }
  });

  console.log('Total daily report items in DB:', items.length);

  const productRatios = {};
  for (const item of items) {
    const p = item.product;
    if (!p) continue;
    if (!productRatios[p.id]) {
      productRatios[p.id] = {
        name: p.name,
        sku: p.sku,
        dbCoversPerSet: p.coversPerSet,
        dbFramesPerSet: p.framesPerSet,
        totalSets: 0,
        totalCovers: 0,
        totalFrames: 0,
        entries: 0
      };
    }
    productRatios[p.id].totalSets += (item.setQty || 0);
    productRatios[p.id].totalCovers += (item.coverQty || 0);
    productRatios[p.id].totalFrames += (item.frameQty || 0);
    productRatios[p.id].entries += 1;
  }

  console.log('\nProducts reported in Daily Reports and their floor totals:');
  for (const [id, stat] of Object.entries(productRatios)) {
    const coverRatio = stat.totalSets > 0 ? (stat.totalCovers / stat.totalSets).toFixed(2) : 'N/A';
    const frameRatio = stat.totalSets > 0 ? (stat.totalFrames / stat.totalSets).toFixed(2) : 'N/A';
    console.log(`- ${stat.name} (${stat.sku}):`);
    console.log(`  DB config: ${stat.dbCoversPerSet}C + ${stat.dbFramesPerSet}F`);
    console.log(`  Floor reported: ${stat.totalSets} sets, ${stat.totalCovers} covers (${coverRatio}x), ${stat.totalFrames} frames (${frameRatio}x) across ${stat.entries} entries`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
