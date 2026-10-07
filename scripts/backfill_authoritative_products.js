const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Auditing and updating Product master fields...');
  const products = await prisma.product.findMany({});
  console.log(`Found ${products.length} products.`);

  let updatedCount = 0;

  for (const p of products) {
    const name = p.name || '';
    let needsUpdate = false;
    const updateData = {};

    // 1. Size
    let size = p.size;
    if (!size || size.trim() === '') {
      const sizeMatch = name.match(/(\d+\s*(?:X|x|\*)\s*\d+(?:\s*(?:X|x|\*)\s*\d+)?)/);
      if (sizeMatch) {
        size = sizeMatch[1].replace(/\s*/g, '').replace(/x|\*/g, 'X');
      } else if (name.match(/(\d+)\s*MM/i)) {
        size = name.match(/(\d+\s*MM(?:\s*DIA)?)/i)[1];
      }
      if (size) {
        updateData.size = size;
        needsUpdate = true;
      }
    }

    // 2. Type
    let type = p.type;
    if (!type || type === 'SINGLE' || type === 'DOUBLE' || type === 'STANDARD' || type.trim() === '') {
      const typeMatch = name.match(/\b(DHMC|MHC|WGC|WHC|ONGC|RCS|PS|FRC|GRATING)\b/i);
      if (typeMatch) {
        let t = typeMatch[1].toUpperCase();
        if (t === 'WGC') t = 'WHC';
        updateData.type = t;
        needsUpdate = true;
        type = t;
      } else if (name.includes('FRPMHC')) {
        updateData.type = 'MHC';
        needsUpdate = true;
        type = 'MHC';
      } else if (name.includes('FRPRCS')) {
        updateData.type = 'RCS';
        needsUpdate = true;
        type = 'RCS';
      }
    }

    // 3. Capacity
    let capacity = p.capacity;
    if (!capacity || capacity.trim() === '') {
      const capMatch = name.match(/\b(ELD|LD|B125|C250|D400|E600|F900|\d+(?:\.\d+)?T)\b/i);
      if (capMatch) {
        updateData.capacity = capMatch[1].toUpperCase();
        needsUpdate = true;
        capacity = capMatch[1].toUpperCase();
      }
    }

    // 4. Sets
    if (!p.coversPerSet) {
      updateData.coversPerSet = name.includes('DOUBLE') ? 2 : 1;
      needsUpdate = true;
    }
    if (!p.framesPerSet) {
      updateData.framesPerSet = 1;
      needsUpdate = true;
    }

    // 5. Weights
    let coverUnitWeight = Number(p.coverUnitWeight || 0);
    let frameUnitWeight = Number(p.frameUnitWeight || 0);

    const s = ((updateData.size || p.size) || '').toUpperCase();
    if (coverUnitWeight <= 0) {
      if (s.includes('1000') || s.includes('1200') || s.includes('1800')) coverUnitWeight = 24.0;
      else if (s.includes('900')) coverUnitWeight = 18.0;
      else if (s.includes('750')) coverUnitWeight = 12.0;
      else if (s.includes('600') || s.includes('24X24') || s.includes('28X28')) coverUnitWeight = 8.5;
      else if (s.includes('450') || s.includes('18X18') || s.includes('21X21')) coverUnitWeight = 6.0;
      else if (s.includes('300') || s.includes('12X12') || s.includes('15X15') || s.includes('10X10')) coverUnitWeight = 3.5;
      else coverUnitWeight = 5.0;

      updateData.coverUnitWeight = coverUnitWeight;
      needsUpdate = true;
    }

    if (frameUnitWeight <= 0) {
      if (s.includes('1000') || s.includes('1200') || s.includes('1800')) frameUnitWeight = 28.0;
      else if (s.includes('900')) frameUnitWeight = 22.0;
      else if (s.includes('750')) frameUnitWeight = 16.0;
      else if (s.includes('600') || s.includes('24X24') || s.includes('28X28')) frameUnitWeight = 12.0;
      else if (s.includes('450') || s.includes('18X18') || s.includes('21X21')) frameUnitWeight = 8.0;
      else if (s.includes('300') || s.includes('12X12') || s.includes('15X15') || s.includes('10X10')) frameUnitWeight = 4.5;
      else frameUnitWeight = 6.0;

      updateData.frameUnitWeight = frameUnitWeight;
      needsUpdate = true;
    }

    // Set product.weight as unit weight if weight is null
    if (!p.weight || Number(p.weight) <= 0) {
      const covers = updateData.coversPerSet || p.coversPerSet || 1;
      const frames = updateData.framesPerSet || p.framesPerSet || 1;
      updateData.weight = (coverUnitWeight * covers) + (frameUnitWeight * frames);
      needsUpdate = true;
    }

    if (needsUpdate) {
      await prisma.product.update({
        where: { id: p.id },
        data: updateData
      });
      updatedCount++;
    }
  }

  console.log(`Updated ${updatedCount} products with authoritative specifications and weights.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
