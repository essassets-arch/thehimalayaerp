const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const raw = fs.readFileSync(__dirname + '/../scratch/raw_full_user_request.txt', 'utf8');
  const fullRowRegex = /(?:(\d+)\s+)?(HIMA?LAYA\s+FRP\s+(?:WGC|MHC|ONGC|RCS)\s+[A-Z0-9X\s\.-]+?)\s+(?:HIMA?LAYA\s+)?MFG\s+(\d+)\s+(\d+)(?:\s+(\d+))?/gi;

  const specMap = new Map();
  let m;
  while ((m = fullRowRegex.exec(raw)) !== null) {
    let [_, strayNum, rawName, col1, col2, col3] = m;
    let cleanName = rawName.trim().replace(/\s+/g, ' ').replace(/^HIMLAYA\b/i, 'HIMALAYA').toUpperCase();
    const withoutColor = cleanName.replace(/\s+(WHITE|RED|GRAY|BLACK|GREEN)$/i, '').trim();
    const covers = parseInt(col1, 10);
    const frames = parseInt(col2, 10);
    if (!specMap.has(withoutColor) || covers > specMap.get(withoutColor).covers) {
      specMap.set(withoutColor, { covers, frames });
    }
  }
  console.log('Unique specs without color:', specMap.size);

  const products = await prisma.product.findMany({
    select: { id: true, name: true, coversPerSet: true, framesPerSet: true }
  });

  let matched = 0;
  let multiCoverMatched = 0;
  const updates = [];

  for (const p of products) {
    const pName = (p.name || '').trim().toUpperCase();
    const spec = specMap.get(pName);
    if (spec) {
      matched++;
      if (spec.covers > 1) {
        multiCoverMatched++;
        if (p.coversPerSet !== spec.covers) {
          updates.push({ id: p.id, name: p.name, current: p.coversPerSet, target: spec.covers });
        }
      }
    }
  }

  console.log('Products matching spec without color:', matched);
  console.log('Multi-cover products matching spec:', multiCoverMatched);
  console.log('Updates needed in DB:', updates.length);
  console.log('Sample updates needed:');
  console.log(JSON.stringify(updates.slice(0, 20), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
