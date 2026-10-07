const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      type: true,
      size: true,
      capacity: true,
      category: true,
      coversPerSet: true,
      framesPerSet: true,
      weight: true
    }
  });

  console.log('Total products:', products.length);

  // Group by type
  const byType = {};
  for (const p of products) {
    const t = p.type || 'NO_TYPE';
    byType[t] = (byType[t] || 0) + 1;
  }
  console.log('By Product Type:', byType);

  // Group by category
  const byCat = {};
  for (const p of products) {
    const c = p.category || 'NO_CAT';
    byCat[c] = (byCat[c] || 0) + 1;
  }
  console.log('By Category:', byCat);

  // Find products that might be multi-cover
  // E.g. DHMC, DOUBLE, MULTI, or large sizes like 900x900, 1200x1200, 1500x1500, etc.
  const dhmcProducts = products.filter(p => 
    p.type === 'DHMC' || 
    p.name.includes('DHMC') || 
    p.sku.includes('DHMC')
  );
  console.log('\nProducts with DHMC:', dhmcProducts.length);
  console.log(dhmcProducts.slice(0, 15).map(p => ({
    name: p.name,
    sku: p.sku,
    type: p.type,
    size: p.size,
    coversPerSet: p.coversPerSet,
    framesPerSet: p.framesPerSet
  })));

  // Products with sizes >= 900
  const largeProducts = products.filter(p => {
    const s = p.size || '';
    return /900|1000|1200|1500|1800/.test(s);
  });
  console.log('\nProducts with large sizes (900-1800):', largeProducts.length);
  console.log('Sample large products:', largeProducts.slice(0, 15).map(p => ({
    name: p.name,
    sku: p.sku,
    type: p.type,
    size: p.size,
    coversPerSet: p.coversPerSet,
    framesPerSet: p.framesPerSet
  })));

  // Check which products are used in WorkOrders
  const workOrders = await prisma.workOrder.findMany({
    select: {
      workOrderNumber: true,
      salesOrderItem: {
        select: {
          product: {
            select: {
              id: true,
              name: true,
              type: true,
              size: true,
              capacity: true,
              coversPerSet: true,
              framesPerSet: true
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
                  product: {
                    select: {
                      id: true,
                      name: true,
                      type: true,
                      size: true,
                      capacity: true,
                      coversPerSet: true,
                      framesPerSet: true
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

  const usedProductMap = new Map();
  for (const wo of workOrders) {
    const product = wo.salesOrderItem?.product || wo.productionPlan?.salesOrder?.items?.[0]?.product;
    if (product) {
      if (!usedProductMap.has(product.id)) {
        usedProductMap.set(product.id, {
          id: product.id,
          name: product.name,
          type: product.type,
          size: product.size,
          capacity: product.capacity,
          coversPerSet: product.coversPerSet,
          framesPerSet: product.framesPerSet,
          count: 0
        });
      }
      usedProductMap.get(product.id).count++;
    }
  }

  console.log(`\nDistinct products used in ${workOrders.length} WorkOrders:`, usedProductMap.size);
  const usedList = Array.from(usedProductMap.values()).sort((a, b) => b.count - a.count);
  console.log('Top 20 products used in WorkOrders:');
  console.log(JSON.stringify(usedList.slice(0, 20), null, 2));

  // Check which products used in WorkOrders have DHMC or 900+ or Double in name
  const candidateMultiInWos = usedList.filter(p => 
    /dhmc|double|triple|multi|pair/i.test(p.name) ||
    /dhmc|double|triple|multi/i.test(p.type || '') ||
    /900|1000|1200|1500|1800/.test(p.size || '')
  );
  console.log('\nCandidate multi-cover products in WorkOrders:', candidateMultiInWos.length);
  console.log(JSON.stringify(candidateMultiInWos.slice(0, 30), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
