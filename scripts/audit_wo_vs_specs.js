const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Parse user specs
  const raw = fs.readFileSync(__dirname + '/../scratch/raw_full_user_request.txt', 'utf8');
  const fullRowRegex = /(?:(\d+)\s+)?(HIMA?LAYA\s+FRP\s+(?:WGC|MHC|ONGC|RCS)\s+[A-Z0-9X\s\.-]+?)\s+(?:HIMA?LAYA\s+)?MFG\s+(\d+)\s+(\d+)(?:\s+(\d+))?/gi;

  const specByName = new Map();
  let m;
  while ((m = fullRowRegex.exec(raw)) !== null) {
    let [_, strayNum, rawName, col1, col2, col3] = m;
    let cleanName = rawName.trim().replace(/\s+/g, ' ').replace(/^HIMLAYA\b/i, 'HIMALAYA').toUpperCase();
    const t = cleanName.split(' ')[2];
    let covers = parseInt(col1, 10);
    let frames = parseInt(col2, 10);
    specByName.set(cleanName, { covers, frames });
  }

  // Get all work orders and their products
  const workOrders = await prisma.workOrder.findMany({
    select: {
      workOrderNumber: true,
      salesOrderItem: {
        select: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              size: true,
              type: true,
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
                      sku: true,
                      size: true,
                      type: true,
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

  const productStats = new Map();
  for (const wo of workOrders) {
    const p = wo.salesOrderItem?.product || wo.productionPlan?.salesOrder?.items?.[0]?.product;
    if (!p) continue;
    if (!productStats.has(p.id)) {
      const uName = (p.name || '').trim().toUpperCase();
      const spec = specByName.get(uName);
      productStats.set(p.id, {
        id: p.id,
        name: p.name,
        type: p.type,
        size: p.size,
        capacity: p.capacity,
        currentCovers: p.coversPerSet,
        currentFrames: p.framesPerSet,
        specCovers: spec ? spec.covers : null,
        specFrames: spec ? spec.frames : null,
        woCount: 0
      });
    }
    productStats.get(p.id).woCount++;
  }

  const allUsed = Array.from(productStats.values());
  console.log('Total distinct products used in local WorkOrders:', allUsed.length);

  const mismatches = allUsed.filter(p => p.specCovers !== null && p.specCovers !== p.currentCovers);
  console.log('Products in WorkOrders where current DB != user master spec:', mismatches.length);
  console.log(JSON.stringify(mismatches, null, 2));

  // Check products that have large sizes or DHMC where spec was not directly matched
  const noDirectSpec = allUsed.filter(p => p.specCovers === null);
  console.log('\nProducts in WorkOrders without direct spec match in raw_full_user_request.txt:', noDirectSpec.length);
  console.log('Sample without direct spec:', JSON.stringify(noDirectSpec.slice(0, 15), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
