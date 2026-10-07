const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      coversPerSet: true,
      framesPerSet: true,
      setRatio: true
    }
  });

  const productByName = new Map();
  for (const p of products) {
    if (p.name) {
      productByName.set(p.name.trim().toUpperCase(), p);
    }
  }

  // Parse raw_full_user_request.txt
  const raw = fs.readFileSync(__dirname + '/../scratch/raw_full_user_request.txt', 'utf8');
  const fullRowRegex = /(?:(\d+)\s+)?(HIMA?LAYA\s+FRP\s+(?:WGC|MHC|ONGC|RCS)\s+[A-Z0-9X\s\.-]+?)\s+(?:HIMA?LAYA\s+)?MFG\s+(\d+)\s+(\d+)(?:\s+(\d+))?/gi;

  const parsedSpecs = new Map();
  let m;
  while ((m = fullRowRegex.exec(raw)) !== null) {
    let [_, strayNum, rawName, col1, col2, col3] = m;
    let cleanName = rawName.trim().replace(/\s+/g, ' ').replace(/^HIMLAYA\b/i, 'HIMALAYA');
    const t = cleanName.split(' ')[2];
    let covers = 1;
    let frames = 1;
    let setRatio = 1;

    if (t === 'WGC') {
      covers = parseInt(col1, 10);
      frames = parseInt(col2, 10);
      setRatio = 1;
    } else if (t === 'MHC') {
      covers = parseInt(col1, 10);
      frames = parseInt(col2, 10);
      setRatio = col3 !== undefined ? parseInt(col3, 10) : 1;
    } else if (t === 'ONGC') {
      covers = 1;
      frames = parseInt(col1, 10);
      setRatio = parseInt(col2, 10);
    } else if (t === 'RCS') {
      covers = parseInt(col1, 10);
      frames = parseInt(col2, 10);
      setRatio = col3 !== undefined ? parseInt(col3, 10) : 1;
    }

    parsedSpecs.set(cleanName.toUpperCase(), {
      name: cleanName,
      covers,
      frames,
      setRatio
    });
  }

  console.log(`Parsed ${parsedSpecs.size} unique product specifications from raw_full_user_request.txt`);

  // Count how many have covers > 1
  let multiCoverCount = 0;
  for (const [name, spec] of parsedSpecs.entries()) {
    if (spec.covers > 1) multiCoverCount++;
  }
  console.log(`Specifications with covers > 1: ${multiCoverCount}`);

  // Compare with DB
  let matchedInDb = 0;
  let mismatchesInDb = 0;
  const sampleMismatches = [];

  for (const [name, spec] of parsedSpecs.entries()) {
    const dbP = productByName.get(name);
    if (dbP) {
      matchedInDb++;
      if (dbP.coversPerSet !== spec.covers || dbP.framesPerSet !== spec.frames) {
        mismatchesInDb++;
        if (sampleMismatches.length < 20) {
          sampleMismatches.push({
            name: dbP.name,
            db: `${dbP.coversPerSet}C + ${dbP.framesPerSet}F`,
            spec: `${spec.covers}C + ${spec.frames}F`
          });
        }
      }
    }
  }

  console.log(`Matched in DB: ${matchedInDb}`);
  console.log(`Mismatches in DB: ${mismatchesInDb}`);
  console.log('Sample mismatches:', JSON.stringify(sampleMismatches, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
