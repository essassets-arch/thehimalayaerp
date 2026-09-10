const fs = require('fs');

const matches = JSON.parse(fs.readFileSync('scratch/parsed_matches.json', 'utf8'));

const fileHeader = `const { PrismaClient } = require('@prisma/client');

function generateSku(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 50);
}

function uid(prefix = 'PROD') {
  return \`\${prefix}-\${Date.now()}-\${Math.random().toString(36).substring(2, 7)}\`;
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

const RAW_MATCHES = ${JSON.stringify(matches, null, 2)};

function buildAllProducts() {
  const productMap = new Map();

  function addProduct(name, forcedSize = null, forcedCap = null, forcedType = null) {
    name = name.trim().replace(/\\s+/g, ' ');
    const sku = generateSku(name);

    let type = forcedType;
    if (!type) {
      if (name.includes(' WGC ')) type = 'WGC';
      else if (name.includes(' MHC ')) type = 'MHC';
      else if (name.includes(' ONGC ')) type = 'ONGC';
      else if (name.includes(' RCS ')) type = 'RCS';
    }

    let subCategory = 'FRP Cover';
    if (type === 'WGC') subCategory = 'With Grate Cover';
    else if (type === 'MHC') subCategory = 'Manhole Cover';
    else if (type === 'ONGC') subCategory = 'ONGC Cover';
    else if (type === 'RCS') subCategory = 'Round Cover Square Frame';

    let capacity = forcedCap;
    if (!capacity) {
      const capMatch = name.match(/\\b(ELD|LD|B125|C250|D400|E600|F900|E900|F600)\\b$/i);
      capacity = capMatch ? capMatch[1].toUpperCase() : 'B125';
    }

    let size = forcedSize;
    if (!size && type) {
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
      description: \`FRP \${subCategory} \${size} - \${capacity} (\${coverType})\`,
      isActive: true,
    });

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
  }

  RAW_MATCHES.forEach(raw => addProduct(raw));

  const STANDARD_CLASSES = ['ELD', 'LD', 'B125', 'C250', 'D400', 'E600', 'F900'];

  for (const cls of STANDARD_CLASSES) {
    addProduct(\`HIMALAYA FRP WGC 750X750 \${cls}\`, '750X750', cls, 'WGC');
  }

  for (const cls of STANDARD_CLASSES) {
    addProduct(\`HIMALAYA FRP RCS 1500X1500X65 \${cls}\`, '1500X1500X65', cls, 'RCS');
  }

  for (const cls of STANDARD_CLASSES) {
    addProduct(\`HIMALAYA FRP RCS 1500X1500X32 \${cls}\`, '1500X1500X32', cls, 'RCS');
  }

  addProduct('HIMALAYA FRP ONGC 450X1000 D400', '450X1000', 'D400', 'ONGC');

  addProduct('HIMALAYA FRP RCS 300X300X65 F900', '300X300X65', 'F900', 'RCS');
  addProduct('HIMALAYA FRP RCS 300X300X32 F900', '300X300X32', 'F900', 'RCS');

  addProduct('HIMALAYA FRP RCS 1800X1800X65 E600', '1800X1800X65', 'E600', 'RCS');
  addProduct('HIMALAYA FRP RCS 1800X1800X32 E600', '1800X1800X32', 'E600', 'RCS');

  return Array.from(productMap.values());
}

const ALL_PRODUCTS = buildAllProducts();

const DBS = [
  {
    name: 'Environment DATABASE_URL',
    url: process.env.DATABASE_URL,
  },
  {
    name: 'Docker Host Port 5435',
    url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public',
  },
  {
    name: 'Docker Internal Postgres 5432',
    url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@postgres:5432/himalaya_erp?schema=public',
  },
  {
    name: 'Standalone DB (Port 5432)',
    url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public',
  },
].filter((db, idx, arr) => db.url && arr.findIndex(x => x.url === db.url) === idx);

async function seedDatabase(dbConfig) {
  console.log(\`\\n======================================================\`);
  console.log(\`Connecting to: \${dbConfig.name}\`);
  console.log(\`======================================================\`);

  let prisma;
  try {
    prisma = new PrismaClient({ datasources: { db: { url: dbConfig.url } } });
    const companies = await prisma.company.findMany();
    if (companies.length === 0) {
      console.log(\`  [SKIP] No companies found in \${dbConfig.name}\`);
      await prisma.$disconnect();
      return;
    }

    for (const comp of companies) {
      console.log(\`\\nProcessing Company: \${comp.name} (\${comp.id})\`);

      const existing = await prisma.product.findMany({
        where: { companyId: comp.id },
      });

      const existingBySku = new Map();
      const existingByName = new Map();
      existing.forEach(e => {
        if (e.sku) existingBySku.set(e.sku.toUpperCase(), e);
        if (e.name) existingByName.set(e.name.toUpperCase(), e);
      });

      let created = 0;
      let updated = 0;

      const batchSize = 50;
      for (let i = 0; i < ALL_PRODUCTS.length; i += batchSize) {
        const batch = ALL_PRODUCTS.slice(i, i + batchSize);

        for (const p of batch) {
          const match = existingBySku.get(p.sku) || existingByName.get(p.name.toUpperCase());

          if (!match) {
            await prisma.product.create({
              data: {
                publicId: uid('PROD'),
                companyId: comp.id,
                name: p.name,
                sku: p.sku,
                brand: p.brand,
                category: p.category,
                productType: p.productType,
                dispatchCategory: p.dispatchCategory,
                unit: p.unit,
                unitPrice: p.unitPrice,
                gstRate: p.gstRate,
                hsnCode: p.hsnCode,
                size: p.size,
                capacity: p.capacity,
                type: p.type,
                coversPerSet: p.coversPerSet,
                framesPerSet: p.framesPerSet,
                description: p.description,
                isActive: true,
              },
            });
            created++;
          } else {
            await prisma.product.update({
              where: { id: match.id },
              data: {
                name: p.name,
                sku: p.sku,
                brand: p.brand,
                category: p.category,
                productType: p.productType,
                dispatchCategory: p.dispatchCategory,
                unit: p.unit,
                gstRate: p.gstRate,
                hsnCode: p.hsnCode,
                size: p.size || match.size,
                capacity: p.capacity || match.capacity,
                type: p.type || match.type,
                coversPerSet: p.coversPerSet || match.coversPerSet,
                framesPerSet: p.framesPerSet || match.framesPerSet,
                description: p.description || match.description,
                isActive: true,
              },
            });
            updated++;
          }
        }
      }

      console.log(\`  ✓ Company \${comp.name}: Created \${created} products, Updated \${updated} products.\`);

      const mfgCount = await prisma.product.count({
        where: {
          companyId: comp.id,
          productType: 'MANUFACTURING',
          isActive: true,
        },
      });
      console.log(\`  📊 Current Active Manufacturing Products in \${comp.name}: \${mfgCount}\`);
    }

    console.log(\`\\n✅ Completed seeding for \${dbConfig.name}\`);
  } catch (err) {
    console.error(\`❌ Error with \${dbConfig.name}: \${err.message}\`);
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

async function main() {
  console.log(\`Starting Product Seeder: Total products to process = \${ALL_PRODUCTS.length}\`);
  for (const db of DBS) {
    await seedDatabase(db);
  }
  console.log(\`\\n🎉 All done!\`);
}

main().catch(console.error);
`;

fs.writeFileSync('backend/scripts/seed_all_mfg_products.js', fileHeader, 'utf8');
console.log('Successfully wrote self-contained seed_all_mfg_products.js');
