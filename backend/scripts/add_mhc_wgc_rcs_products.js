const { PrismaClient } = require('@prisma/client');

function generateSku(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 50);
}

function uid(prefix = 'PROD') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

const CLASSES = [
  { code: 'ELD', label: 'Extra Light Duty' },
  { code: 'LD', label: 'Light Duty' },
  { code: 'B125', label: 'Medium Duty (B125 Class - 12.5T)' },
  { code: 'C250', label: 'Heavy Duty (C250 Class - 25T)' },
  { code: 'D400', label: 'Extra Heavy Duty (D400 Class - 40T)' },
  { code: 'E600', label: 'Super Heavy Duty (E600 Class - 60T)' },
  { code: 'F900', label: 'Airport Heavy Duty (F900 Class - 90T)' },
];

// Helper to determine cover count from coverType string
function parseCoversCount(coverType) {
  if (!coverType) return 1;
  const upper = coverType.toUpperCase();
  if (upper.includes('3 COVER') || upper.includes('TRIPLE')) return 3;
  if (upper.includes('DOUBLE')) return 2;
  return 1;
}

// ─── 1. MHC SPECIFICATIONS ──────────────────────────────────────────────────
const MHC_SPECS = [
  { size: '300X300', classes: { all: 'SINGLE' } },
  { size: '450X450', classes: { all: 'SINGLE' } },
  { size: '450X600', classes: { all: 'SINGLE' } },
  { size: '450X900', classes: { all: 'SINGLE' } },
  { size: '450X1200', classes: { all: 'SINGLE' } },
  { size: '600X600', classes: { all: 'SINGLE' } },
  { size: '600X900', classes: { all: 'SINGLE' } },
  { size: '600X1200', classes: { all: 'SINGLE' } },
  { size: '750X450', classes: { all: 'SINGLE' } },
  { size: '750X750', classes: { all: 'SINGLE' } },
  { size: '750X1200', classes: { all: 'SINGLE' } },
  {
    size: '900X900',
    classes: {
      ELD: 'SINGLE',
      LD: 'SINGLE',
      B125: 'SINGLE',
      C250: 'DOUBLE',
      D400: 'DOUBLE',
      E600: 'DOUBLE',
      F900: 'DOUBLE',
    },
  },
  {
    size: '900X1200',
    classes: {
      ELD: 'SINGLE',
      LD: 'SINGLE',
      B125: 'SINGLE',
      C250: 'DOUBLE',
      D400: 'DOUBLE',
      E600: 'DOUBLE',
      F900: 'DOUBLE',
    },
  },
  {
    size: '1000X1000',
    classes: {
      ELD: 'SINGLE',
      LD: 'SINGLE',
      B125: 'SINGLE',
      C250: 'SINGLE/DOUBLE',
      D400: 'SINGLE/DOUBLE',
      E600: 'SINGLE/DOUBLE',
      F900: 'SINGLE/DOUBLE',
    },
  },
  {
    size: '1200X1200',
    classes: {
      ELD: 'DOUBLE',
      LD: 'DOUBLE',
      B125: 'DOUBLE',
      C250: 'DOUBLE',
      D400: 'DOUBLE',
      E600: '3 COVER',
      F900: '3 COVER',
    },
  },
  { size: '1500X1500', classes: { all: '3 COVER' } },
  { size: '1800X1800', classes: { all: '3 COVER' } },
  { size: '560MM DIA', classes: { all: 'SINGLE' } },
  { size: '600MM DIA', classes: { all: 'SINGLE' } },
  { size: '900MM DIA', classes: { all: 'SINGLE' } },
];

// ─── 2. WGC SPECIFICATIONS ──────────────────────────────────────────────────
const WGC_SPECS = [
  { size: '300X300', classes: { all: 'SINGLE' } },
  { size: '450X450', classes: { all: 'SINGLE' } },
  { size: '450X600', classes: { all: 'SINGLE' } },
  { size: '450X900', classes: { all: 'SINGLE' } },
  { size: '450X1200', classes: { all: 'SINGLE' } },
  { size: '600X600', classes: { all: 'SINGLE' } },
  { size: '600X900', classes: { all: 'SINGLE' } },
  { size: '600X1200', classes: { all: 'SINGLE' } },
  { size: '750X750', classes: { all: 'SINGLE' } },
  { size: '900X900', classes: { all: 'SINGLE' } },
  { size: '900X1200', classes: { all: 'SINGLE' } },
  { size: '1000X1000', classes: { all: 'SINGLE' } },
  { size: '1200X1200', classes: { all: 'DOUBLE' } },
];

// ─── 3. RCS SPECIFICATIONS ──────────────────────────────────────────────────
const RCS_SPECS = [
  { size: '300X300', classes: { all: 'SINGLE' } },
  { size: '450X450', classes: { all: 'SINGLE' } },
  { size: '450X600', classes: { all: 'SINGLE' } },
  { size: '450X900', classes: { all: 'SINGLE' } },
  { size: '450X1200', classes: { all: 'SINGLE' } },
  { size: '600X600', classes: { all: 'SINGLE' } },
  { size: '600X900', classes: { all: 'SINGLE' } },
  { size: '600X1200', classes: { all: 'SINGLE' } },
  { size: '750X450', classes: { all: 'SINGLE' } },
  { size: '750X750', classes: { all: 'SINGLE' } },
  { size: '750X1200', classes: { all: 'SINGLE' } },
  {
    size: '900X900',
    classes: {
      ELD: 'SINGLE',
      LD: 'SINGLE',
      B125: 'SINGLE',
      C250: 'DOUBLE',
      D400: 'DOUBLE',
      E600: 'DOUBLE',
      F900: 'DOUBLE',
    },
  },
  {
    size: '900X1200',
    classes: {
      ELD: 'SINGLE',
      LD: 'SINGLE',
      B125: 'SINGLE',
      C250: 'DOUBLE',
      D400: 'DOUBLE',
      E600: 'DOUBLE',
      F900: 'DOUBLE',
    },
  },
  {
    size: '1000X1000',
    classes: {
      ELD: 'SINGLE',
      LD: 'SINGLE',
      B125: 'SINGLE',
      C250: 'SINGLE/DOUBLE',
      D400: 'SINGLE/DOUBLE',
      E600: 'SINGLE/DOUBLE',
      F900: 'SINGLE/DOUBLE',
    },
  },
  {
    size: '1200X1200',
    classes: {
      ELD: 'DOUBLE',
      LD: 'DOUBLE',
      B125: 'DOUBLE',
      C250: 'DOUBLE',
      D400: 'DOUBLE',
      E600: '3 COVER',
      F900: '3 COVER',
    },
  },
  { size: '1500X1500', classes: { all: '3 COVER' } },
  { size: '1800X1800', classes: { all: '3 COVER' } },
  { size: '560MM DIA', classes: { all: 'SINGLE' } },
  { size: '600MM DIA', classes: { all: 'SINGLE' } },
  { size: '900MM DIA', classes: { all: 'SINGLE' } },
];

function buildProductList() {
  const allProducts = [];

  function processSeries(prefix, subCategory, specs) {
    for (const spec of specs) {
      for (const cls of CLASSES) {
        const coverType = spec.classes.all || spec.classes[cls.code] || 'SINGLE';
        const coversCount = parseCoversCount(coverType);

        // Standard canonical name
        const canonicalName = `HIMALAYA FRP ${prefix} ${spec.size} ${cls.code}`;
        const canonicalSku = generateSku(canonicalName);

        allProducts.push({
          name: canonicalName,
          sku: canonicalSku,
          brand: 'HIMALAYA',
          category: 'FRP COVERS',
          subCategory,
          productType: 'MANUFACTURING',
          dispatchCategory: 'D1',
          unit: 'SET',
          unitPrice: 0,
          gstRate: 18,
          hsnCode: '39259090',
          size: spec.size,
          capacity: cls.code,
          type: coverType,
          coversPerSet: coversCount,
          framesPerSet: 1,
          description: `FRP ${subCategory} ${spec.size} - ${cls.label} (${coverType})`,
          isActive: true,
        });

        // Also add explicit variant name with cover type if different from single
        if (coverType !== 'SINGLE') {
          const typeSuffix = coverType.replace('/', '_').toUpperCase();
          const explicitName = `HIMALAYA FRP ${prefix} ${spec.size} ${cls.code} ${typeSuffix}`;
          const explicitSku = generateSku(explicitName);

          allProducts.push({
            name: explicitName,
            sku: explicitSku,
            brand: 'HIMALAYA',
            category: 'FRP COVERS',
            subCategory,
            productType: 'MANUFACTURING',
            dispatchCategory: 'D1',
            unit: 'SET',
            unitPrice: 0,
            gstRate: 18,
            hsnCode: '39259090',
            size: spec.size,
            capacity: cls.code,
            type: coverType,
            coversPerSet: coversCount,
            framesPerSet: 1,
            description: `FRP ${subCategory} ${spec.size} - ${cls.label} (${coverType})`,
            isActive: true,
          });
        }
      }
    }
  }

  processSeries('MHC', 'Manhole Cover', MHC_SPECS);
  processSeries('WGC', 'With Grate Cover', WGC_SPECS);
  processSeries('RCS', 'Round Cover Square Frame', RCS_SPECS);

  return allProducts;
}

const ALL_NEW_PRODUCTS = buildProductList();

const DBS = [
  { name: 'Primary/Default DB', url: process.env.DATABASE_URL },
  {
    name: 'Docker DB (Port 5433)',
    url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public',
  },
  {
    name: 'Standalone DB (Port 5432)',
    url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public',
  },
].filter((db, idx, arr) => db.url && arr.findIndex((x) => x.url === db.url) === idx);

async function main() {
  console.log('================================================================');
  console.log(` SEEDING ${ALL_NEW_PRODUCTS.length} MHC, WGC, RCS PRODUCTS`);
  console.log('================================================================\n');

  for (const db of DBS) {
    console.log(`Connecting to: ${db.name} ...`);
    let prisma;
    try {
      prisma = new PrismaClient({ datasources: { db: { url: db.url } } });
      const companies = await prisma.company.findMany();
      if (companies.length === 0) {
        console.log(`  [SKIP] No companies found in ${db.name}\n`);
        await prisma.$disconnect();
        continue;
      }

      for (const comp of companies) {
        console.log(`  Processing Company: ${comp.name} (${comp.id})`);
        let created = 0;
        let updated = 0;

        for (const p of ALL_NEW_PRODUCTS) {
          const existing = await prisma.product.findFirst({
            where: {
              companyId: comp.id,
              OR: [
                { sku: p.sku },
                { name: p.name },
                { sku: generateSku(p.name) },
              ],
            },
          });

          if (!existing) {
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
              where: { id: existing.id },
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
                size: p.size || existing.size,
                capacity: p.capacity || existing.capacity,
                type: p.type || existing.type,
                coversPerSet: p.coversPerSet || existing.coversPerSet,
                framesPerSet: p.framesPerSet || existing.framesPerSet,
                description: p.description || existing.description,
                isActive: true,
              },
            });
            updated++;
          }
        }
        console.log(`    ✓ Created: ${created}, Updated: ${updated}`);
      }
      console.log(`  [SUCCESS] Finished ${db.name}\n`);
    } catch (err) {
      console.error(`  [ERROR] Could not process ${db.name}:`, err.message);
    } finally {
      if (prisma) await prisma.$disconnect();
    }
  }
}

main().catch(console.error);
