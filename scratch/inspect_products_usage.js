const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- EXAMINING PRODUCTS IN DB ---');
  const count = await prisma.product.count();
  console.log(`Total Products in DB: ${count}`);

  // How many products have non-null coverUnitWeight, frameUnitWeight, weight, coversPerSet, framesPerSet?
  const withCoverUW = await prisma.product.count({ where: { coverUnitWeight: { not: null, gt: 0 } } });
  const withFrameUW = await prisma.product.count({ where: { frameUnitWeight: { not: null, gt: 0 } } });
  const withWeight = await prisma.product.count({ where: { weight: { not: null, gt: 0 } } });
  const withCoversPerSet = await prisma.product.count({ where: { coversPerSet: { not: null } } });
  const withFramesPerSet = await prisma.product.count({ where: { framesPerSet: { not: null } } });

  console.log({
    totalProducts: count,
    withCoverUW,
    withFrameUW,
    withWeight,
    withCoversPerSet,
    withFramesPerSet
  });

  // What distinct sizes, capacities, categories exist in products?
  const sampleProducts = await prisma.product.findMany({
    take: 20,
    select: {
      id: true,
      name: true,
      sku: true,
      size: true,
      type: true,
      capacity: true,
      weight: true,
      coverUnitWeight: true,
      frameUnitWeight: true,
      coversPerSet: true,
      framesPerSet: true,
      category: true,
    }
  });
  console.log('Sample 5 Products:');
  console.log(JSON.stringify(sampleProducts.slice(0, 5), null, 2));

  // What products are actually referenced by work orders?
  const wos = await prisma.workOrder.findMany({
    select: {
      id: true,
      workOrderNumber: true,
      quantity: true,
      salesOrderItem: {
        select: {
          productId: true,
          productNameSnapshot: true,
          product: {
            select: {
              id: true,
              name: true,
              size: true,
              type: true,
              capacity: true,
              weight: true,
              coverUnitWeight: true,
              frameUnitWeight: true,
              coversPerSet: true,
              framesPerSet: true,
            }
          }
        }
      },
      productionPlan: {
        select: {
          salesOrder: {
            select: {
              items: {
                select: {
                  productId: true,
                  product: {
                    select: {
                      id: true,
                      name: true,
                      size: true,
                      type: true,
                      capacity: true,
                      weight: true,
                      coverUnitWeight: true,
                      frameUnitWeight: true,
                      coversPerSet: true,
                      framesPerSet: true,
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  const usedProductIds = new Set();
  const usedProducts = new Map();
  for (const wo of wos) {
    const p = wo.salesOrderItem?.product || wo.productionPlan?.salesOrder?.items?.[0]?.product;
    if (p) {
      usedProductIds.add(p.id);
      if (!usedProducts.has(p.id)) {
        usedProducts.set(p.id, {
          name: p.name,
          size: p.size,
          type: p.type,
          capacity: p.capacity,
          weight: p.weight,
          coverUnitWeight: p.coverUnitWeight,
          frameUnitWeight: p.frameUnitWeight,
          coversPerSet: p.coversPerSet,
          framesPerSet: p.framesPerSet,
          orderCount: 1,
        });
      } else {
        usedProducts.get(p.id).orderCount++;
      }
    }
  }

  console.log(`Unique products used across all 755 Work Orders: ${usedProductIds.size}`);
  console.log('Used Products Breakdown:');
  for (const [id, info] of usedProducts.entries()) {
    console.log(`- ${info.name.slice(0, 35)} | Size: ${info.size} | Cap: ${info.capacity} | Type: ${info.type} | CoverUW: ${info.coverUnitWeight} | FrameUW: ${info.frameUnitWeight} | CoversPerSet: ${info.coversPerSet} | FramesPerSet: ${info.framesPerSet} | WOs: ${info.orderCount}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
