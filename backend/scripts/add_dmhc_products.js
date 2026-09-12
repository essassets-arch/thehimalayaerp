const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const SIZES = [
  '300X300',
  '450X450',
  '450X600',
  '450X900',
  '450X1200',
  '600X600',
  '600X900',
  '600X1200',
  '750X900',
  '750X750',
  '750X1200',
  '900X900',
  '900X1200',
  '1000X1000',
  '1200X1200',
  '1500X1500',
  '1800X1800',
  '560MM DIA',
  '600MM DIA',
  '900MM DIA'
];

const CAPACITIES = [
  { code: 'ELD', label: 'Extra Light Duty (ELD)' },
  { code: 'LD', label: 'Light Duty (LD)' },
  { code: 'B125', label: 'Medium Duty (B125 Class - 12.5T)' },
  { code: 'C250', label: 'Heavy Duty (C250 Class - 25T)' },
  { code: 'D400', label: 'Extra Heavy Duty (D400 Class - 40T)' },
  { code: 'E600', label: 'Super Heavy Duty (E600 Class - 60T)' },
  { code: 'F900', label: 'Airport Heavy Duty (F900 Class - 90T)' },
];

function getCoverSpecs(size, capacity) {
  let coverType = 'SINGLE';
  let coversCount = 1;

  if (size === '1500X1500' || size === '1800X1800') {
    coverType = '3 COVER';
    coversCount = 3;
  } else if (size === '1200X1200') {
    if (capacity === 'E600' || capacity === 'F900') {
      coverType = '3 COVER';
      coversCount = 3;
    } else {
      coverType = 'DOUBLE';
      coversCount = 2;
    }
  } else if (size === '900X900' || size === '900X1200') {
    if (['C250', 'D400', 'E600', 'F900'].includes(capacity)) {
      coverType = 'DOUBLE';
      coversCount = 2;
    } else {
      coverType = 'SINGLE';
      coversCount = 1;
    }
  } else if (size === '1000X1000') {
    if (['C250', 'D400', 'E600', 'F900'].includes(capacity)) {
      coverType = 'SINGLE/DOUBLE';
      coversCount = 1;
    } else {
      coverType = 'SINGLE';
      coversCount = 1;
    }
  } else {
    coverType = 'SINGLE';
    coversCount = 1;
  }

  return { coverType, coversCount };
}

function generateSku(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 50);
}

function uid(prefix = 'PROD') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

function buildDMHCProducts() {
  const products = [];
  for (const size of SIZES) {
    for (const cap of CAPACITIES) {
      const { coverType, coversCount } = getCoverSpecs(size, cap.code);
      const canonicalName = `HIMALAYA FRP DMHC ${size} ${cap.code}`;
      const sku = generateSku(canonicalName);

      products.push({
        name: canonicalName,
        sku,
        brand: 'HIMALAYA',
        category: 'FRP COVERS',
        productType: 'MANUFACTURING',
        dispatchCategory: 'D1',
        unit: 'SET',
        unitPrice: 0,
        gstRate: 18,
        hsnCode: '39259090',
        size,
        capacity: cap.code,
        type: coverType,
        coversPerSet: coversCount,
        framesPerSet: 1,
        variantDetails: `DMHC ${size} ${cap.code}`,
        description: `FRP DMHC ${size} - ${cap.label} (${coverType})`,
        isActive: true,
      });
    }
  }
  return products;
}

const DMHC_PRODUCTS = buildDMHCProducts();

async function syncToLiveCloud() {
  console.log('\n================================================================');
  console.log(` 1. SYNCING ${DMHC_PRODUCTS.length} DMHC PRODUCTS TO LIVE CLOUD (thehimalaya.cloud)`);
  console.log('================================================================\n');

  try {
    const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
    });

    if (!loginRes.ok) {
      throw new Error(`Login failed with status: ${loginRes.status}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.data?.accessToken;
    if (!token) throw new Error('No access token returned from login');

    console.log('Logged in to thehimalaya.cloud as Super Admin.');
    const headers = {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    };

    // Fetch existing live catalog
    const fetchRes = await fetch('https://thehimalaya.cloud/api/v1/products?scope=catalog&limit=5000', { headers });
    const fetchJson = await fetchRes.json();
    const existingList = fetchJson.data?.items || fetchJson.data || [];
    console.log(`Currently ${existingList.length} products on live catalog.`);

    const existingBySku = new Map();
    const existingByName = new Map();
    existingList.forEach(p => {
      if (p.sku) existingBySku.set(p.sku.toUpperCase().trim(), p);
      if (p.name) existingByName.set(p.name.toUpperCase().trim(), p);
    });

    let createdCount = 0;
    let updatedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < DMHC_PRODUCTS.length; i++) {
      const p = DMHC_PRODUCTS[i];
      const existing = existingBySku.get(p.sku) || existingByName.get(p.name.toUpperCase());

      if (!existing) {
        // Create product
        const createRes = await fetch('https://thehimalaya.cloud/api/v1/products', {
          method: 'POST',
          headers,
          body: JSON.stringify(p)
        });

        if (createRes.ok) {
          createdCount++;
        } else {
          const errBody = await createRes.text();
          console.error(`  [FAIL CREATE] ${p.name}: ${createRes.status} - ${errBody}`);
          failedCount++;
        }
      } else {
        // Update if needed
        const patchRes = await fetch(`https://thehimalaya.cloud/api/v1/products/${existing.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            name: p.name,
            sku: p.sku,
            category: p.category,
            productType: p.productType,
            dispatchCategory: p.dispatchCategory,
            unit: p.unit,
            gstRate: p.gstRate,
            hsnCode: p.hsnCode,
            description: p.description,
            variantDetails: p.variantDetails,
            isActive: true
          })
        });

        if (patchRes.ok) {
          updatedCount++;
        } else {
          console.error(`  [FAIL UPDATE] ${p.name}: ${patchRes.status}`);
          failedCount++;
        }
      }

      if ((i + 1) % 20 === 0 || i === DMHC_PRODUCTS.length - 1) {
        console.log(`  Processed ${i + 1}/${DMHC_PRODUCTS.length} live products... (Created: ${createdCount}, Updated: ${updatedCount}, Failed: ${failedCount})`);
      }
    }

    console.log(`\nLive Cloud Sync Complete: Created: ${createdCount}, Updated: ${updatedCount}, Failed: ${failedCount}`);

    // Verify
    const verifyRes = await fetch('https://thehimalaya.cloud/api/v1/products?scope=catalog&limit=5000', { headers });
    const verifyJson = await verifyRes.json();
    const verifiedList = verifyJson.data?.items || verifyJson.data || [];
    const dmhcInLive = verifiedList.filter(p => p.name?.includes('DMHC') || p.sku?.includes('DMHC'));
    console.log(`Verified DMHC products in Live Cloud catalog: ${dmhcInLive.length} / ${DMHC_PRODUCTS.length}`);

  } catch (err) {
    console.error('Error syncing to Live Cloud:', err);
  }
}

async function syncToLocalDatabases() {
  console.log('\n================================================================');
  console.log(` 2. SYNCING ${DMHC_PRODUCTS.length} DMHC PRODUCTS TO LOCAL DATABASES`);
  console.log('================================================================\n');

  const dbs = [
    {
      name: 'Standalone DB (Port 5432)',
      url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public',
    },
    {
      name: 'Docker DB (Port 5433)',
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public',
    },
    {
      name: 'Docker DB (Port 5435)',
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public',
    },
  ].filter((db, idx, arr) => db.url && arr.findIndex((x) => x.url === db.url) === idx);

  for (const db of dbs) {
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

        for (const p of DMHC_PRODUCTS) {
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
                variantDetails: p.variantDetails,
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
                variantDetails: p.variantDetails || existing.variantDetails,
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

async function main() {
  await syncToLiveCloud();
  await syncToLocalDatabases();
  console.log('\n================================================================');
  console.log(' ALL DMHC PRODUCTS SYNCED SUCCESSFULLY!');
  console.log('================================================================\n');
}

main().catch(console.error);
