const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

function generateSku(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 50);
}

function parseCoversCount(coverType) {
  if (!coverType) return 1;
  const upper = coverType.toUpperCase();
  if (upper.includes('3 COVER') || upper.includes('TRIPLE')) return 3;
  if (upper.includes('DOUBLE')) return 2;
  return 1;
}

function getCoverType(series, size, capacity) {
  if (size.includes('1500X1500') || size.includes('1800X1800')) {
    return '3 COVER';
  }
  if (size.includes('1200X1200')) {
    if (['E600', 'F900'].includes(capacity) && series !== 'WGC') return '3 COVER';
    return 'DOUBLE';
  }
  if (size.includes('900X900') || size.includes('900X1200')) {
    if (['C250', 'D400', 'E600', 'F900'].includes(capacity) && series !== 'WGC' && series !== 'ONGC') {
      return 'DOUBLE';
    }
  }
  return 'SINGLE';
}

async function main() {
  const rawMatches = JSON.parse(fs.readFileSync('scratch/parsed_matches.json', 'utf8'));
  console.log('Total raw matches from user:', rawMatches.length);

  const productMap = new Map();

  // 1. Process all raw matches
  rawMatches.forEach(raw => {
    let name = raw.trim().replace(/\s+/g, ' ');
    const sku = generateSku(name);

    let type = null;
    if (name.includes(' WGC ')) type = 'WGC';
    else if (name.includes(' MHC ')) type = 'MHC';
    else if (name.includes(' ONGC ')) type = 'ONGC';
    else if (name.includes(' RCS ')) type = 'RCS';

    let subCategory = 'FRP Cover';
    if (type === 'WGC') subCategory = 'With Grate Cover';
    else if (type === 'MHC') subCategory = 'Manhole Cover';
    else if (type === 'ONGC') subCategory = 'ONGC Cover';
    else if (type === 'RCS') subCategory = 'Round Cover Square Frame';

    const capMatch = name.match(/\b(ELD|LD|B125|C250|D400|E600|F900|E900|F600)\b$/i);
    const capacity = capMatch ? capMatch[1].toUpperCase() : 'B125';

    let size = '';
    if (type) {
      const typeIndex = name.indexOf(type);
      const beforeCap = name.substring(typeIndex + type.length).trim();
      size = beforeCap.substring(0, beforeCap.lastIndexOf(capacity)).trim();
    }

    const coverType = getCoverType(type, size, capacity);
    const coversCount = parseCoversCount(coverType);

    productMap.set(sku, {
      name,
      sku,
      brand: 'HIMALAYA',
      category: 'FRP COVERS',
      subCategory,
      productType: 'MANUFACTURING',
      dispatchCategory: 'D1',
      unit: 'SET',
      unitPrice: 0,
      gstRate: 18,
      hsnCode: '39259090',
      size,
      capacity,
      type: coverType,
      coversPerSet: coversCount,
      framesPerSet: 1,
      description: `FRP ${subCategory} ${size} - ${capacity} (${coverType})`,
      isActive: true,
    });

    // Also add standardized name if typo was HIMLAYA
    if (name.startsWith('HIMLAYA ')) {
      const fixedName = name.replace('HIMLAYA ', 'HIMALAYA ');
      const fixedSku = generateSku(fixedName);
      if (!productMap.has(fixedSku)) {
        productMap.set(fixedSku, {
          ...productMap.get(sku),
          name: fixedName,
          sku: fixedSku,
        });
      }
    }
  });

  // 2. Also add the companion classes for the ones where only ELD was pasted 7 times (WGC 750X750, RCS 1500X1500X65, RCS 1500X1500X32)
  // and missing D400 for ONGC 450X1000
  const STANDARD_CLASSES = ['ELD', 'LD', 'B125', 'C250', 'D400', 'E600', 'F900'];
  
  // WGC 750X750
  for (const cls of STANDARD_CLASSES) {
    const name = `HIMALAYA FRP WGC 750X750 ${cls}`;
    const sku = generateSku(name);
    if (!productMap.has(sku)) {
      productMap.set(sku, {
        name,
        sku,
        brand: 'HIMALAYA',
        category: 'FRP COVERS',
        subCategory: 'With Grate Cover',
        productType: 'MANUFACTURING',
        dispatchCategory: 'D1',
        unit: 'SET',
        unitPrice: 0,
        gstRate: 18,
        hsnCode: '39259090',
        size: '750X750',
        capacity: cls,
        type: 'SINGLE',
        coversPerSet: 1,
        framesPerSet: 1,
        description: `FRP With Grate Cover 750X750 - ${cls} (SINGLE)`,
        isActive: true,
      });
    }
  }

  // RCS 1500X1500X65
  for (const cls of STANDARD_CLASSES) {
    const name = `HIMALAYA FRP RCS 1500X1500X65 ${cls}`;
    const sku = generateSku(name);
    if (!productMap.has(sku)) {
      productMap.set(sku, {
        name,
        sku,
        brand: 'HIMALAYA',
        category: 'FRP COVERS',
        subCategory: 'Round Cover Square Frame',
        productType: 'MANUFACTURING',
        dispatchCategory: 'D1',
        unit: 'SET',
        unitPrice: 0,
        gstRate: 18,
        hsnCode: '39259090',
        size: '1500X1500X65',
        capacity: cls,
        type: '3 COVER',
        coversPerSet: 3,
        framesPerSet: 1,
        description: `FRP Round Cover Square Frame 1500X1500X65 - ${cls} (3 COVER)`,
        isActive: true,
      });
    }
  }

  // RCS 1500X1500X32
  for (const cls of STANDARD_CLASSES) {
    const name = `HIMALAYA FRP RCS 1500X1500X32 ${cls}`;
    const sku = generateSku(name);
    if (!productMap.has(sku)) {
      productMap.set(sku, {
        name,
        sku,
        brand: 'HIMALAYA',
        category: 'FRP COVERS',
        subCategory: 'Round Cover Square Frame',
        productType: 'MANUFACTURING',
        dispatchCategory: 'D1',
        unit: 'SET',
        unitPrice: 0,
        gstRate: 18,
        hsnCode: '39259090',
        size: '1500X1500X32',
        capacity: cls,
        type: '3 COVER',
        coversPerSet: 3,
        framesPerSet: 1,
        description: `FRP Round Cover Square Frame 1500X1500X32 - ${cls} (3 COVER)`,
        isActive: true,
      });
    }
  }

  // ONGC 450X1000 D400
  const ongcD400Name = 'HIMALAYA FRP ONGC 450X1000 D400';
  const ongcD400Sku = generateSku(ongcD400Name);
  if (!productMap.has(ongcD400Sku)) {
    productMap.set(ongcD400Sku, {
      name: ongcD400Name,
      sku: ongcD400Sku,
      brand: 'HIMALAYA',
      category: 'FRP COVERS',
      subCategory: 'ONGC Cover',
      productType: 'MANUFACTURING',
      dispatchCategory: 'D1',
      unit: 'SET',
      unitPrice: 0,
      gstRate: 18,
      hsnCode: '39259090',
      size: '450X1000',
      capacity: 'D400',
      type: 'SINGLE',
      coversPerSet: 1,
      framesPerSet: 1,
      description: `FRP ONGC Cover 450X1000 - D400 (SINGLE)`,
      isActive: true,
    });
  }

  // RCS 300X300X65 F900 & RCS 300X300X32 F900
  ['300X300X65', '300X300X32'].forEach(sz => {
    const name = `HIMALAYA FRP RCS ${sz} F900`;
    const sku = generateSku(name);
    if (!productMap.has(sku)) {
      productMap.set(sku, {
        name,
        sku,
        brand: 'HIMALAYA',
        category: 'FRP COVERS',
        subCategory: 'Round Cover Square Frame',
        productType: 'MANUFACTURING',
        dispatchCategory: 'D1',
        unit: 'SET',
        unitPrice: 0,
        gstRate: 18,
        hsnCode: '39259090',
        size: sz,
        capacity: 'F900',
        type: 'SINGLE',
        coversPerSet: 1,
        framesPerSet: 1,
        description: `FRP Round Cover Square Frame ${sz} - F900 (SINGLE)`,
        isActive: true,
      });
    }
  });

  // RCS 1800X1800X65 E600 & RCS 1800X1800X32 E600
  ['1800X1800X65', '1800X1800X32'].forEach(sz => {
    const name = `HIMALAYA FRP RCS ${sz} E600`;
    const sku = generateSku(name);
    if (!productMap.has(sku)) {
      productMap.set(sku, {
        name,
        sku,
        brand: 'HIMALAYA',
        category: 'FRP COVERS',
        subCategory: 'Round Cover Square Frame',
        productType: 'MANUFACTURING',
        dispatchCategory: 'D1',
        unit: 'SET',
        unitPrice: 0,
        gstRate: 18,
        hsnCode: '39259090',
        size: sz,
        capacity: 'E600',
        type: '3 COVER',
        coversPerSet: 3,
        framesPerSet: 1,
        description: `FRP Round Cover Square Frame ${sz} - E600 (3 COVER)`,
        isActive: true,
      });
    }
  });

  const allProductsToSeed = Array.from(productMap.values());
  console.log(`Total products ready to seed: ${allProductsToSeed.length}`);

  const companies = await prisma.company.findMany();
  for (const comp of companies) {
    console.log(`\nAnalyzing Company: ${comp.name} (${comp.id})`);
    const existing = await prisma.product.findMany({
      where: { companyId: comp.id },
      select: { id: true, sku: true, name: true }
    });

    const skuMap = new Set(existing.map(e => (e.sku || '').toUpperCase()));
    const nameMap = new Set(existing.map(e => (e.name || '').toUpperCase()));

    let toCreate = 0;
    let toUpdate = 0;

    allProductsToSeed.forEach(p => {
      if (skuMap.has(p.sku) || nameMap.has(p.name.toUpperCase())) {
        toUpdate++;
      } else {
        toCreate++;
      }
    });

    console.log(`  To Create: ${toCreate}`);
    console.log(`  To Update: ${toUpdate}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
