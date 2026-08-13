import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Backfilling FRP product specifications...');
  const products = await prisma.product.findMany({});

  for (const p of products) {
    let size = p.size;
    let type = p.type;
    let capacity = p.capacity;
    let coverUnitWeight = p.coverUnitWeight ? Number(p.coverUnitWeight) : null;
    let frameUnitWeight = p.frameUnitWeight ? Number(p.frameUnitWeight) : null;
    let coversPerSet = p.coversPerSet || 1;
    let framesPerSet = p.framesPerSet || 1;

    const name = p.name || '';

    // Extract size like 600X600 or 450X600
    const sizeMatch = name.match(/(\d+\s*X\s*\d+)/i);
    if (sizeMatch && !size) {
      size = sizeMatch[1].replace(/\s*/g, '').replace(/X/i, ' x ');
    }

    // Extract type like MHC, WGC, RCS, PS, ONGC
    const typeMatch = name.match(/\b(MHC|WGC|RCS|PS|ONGC)\b/i);
    if (typeMatch && !type) {
      type = typeMatch[1].toUpperCase();
    } else if (!type) {
      type = 'MHC';
    }

    // Extract capacity like ELD, LD, B125, C250, D400
    const capMatch = name.match(/\b(ELD|LD|B125|C250|D400|E600|F900)\b/i);
    if (capMatch && !capacity) {
      capacity = capMatch[1].toUpperCase();
    } else if (!capacity) {
      capacity = 'B125';
    }

    // Default weight estimations if null
    if (!coverUnitWeight) {
      if (size?.includes('600')) coverUnitWeight = 8.5;
      else if (size?.includes('750')) coverUnitWeight = 12.0;
      else if (size?.includes('900')) coverUnitWeight = 18.0;
      else if (size?.includes('450')) coverUnitWeight = 6.0;
      else coverUnitWeight = 5.0;
    }

    if (!frameUnitWeight) {
      if (size?.includes('600')) frameUnitWeight = 12.0;
      else if (size?.includes('750')) frameUnitWeight = 16.0;
      else if (size?.includes('900')) frameUnitWeight = 22.0;
      else if (size?.includes('450')) frameUnitWeight = 8.0;
      else frameUnitWeight = 6.0;
    }

    await prisma.product.update({
      where: { id: p.id },
      data: {
        size: size || '600 x 600',
        type: type || 'MHC',
        capacity: capacity || 'B125',
        coverUnitWeight: coverUnitWeight ? String(coverUnitWeight) : '8.5',
        frameUnitWeight: frameUnitWeight ? String(frameUnitWeight) : '12.0',
        coversPerSet,
        framesPerSet,
      },
    });
  }

  console.log(`Updated ${products.length} products with FRP attributes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
