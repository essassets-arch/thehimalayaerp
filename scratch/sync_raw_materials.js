require('dotenv').config({ path: 'd:/prototype-next-main/backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sync() {
  const company = await prisma.company.findFirst();
  if (!company) {
    console.error('No company found');
    return;
  }
  const companyId = company.id;

  const rawProducts = await prisma.product.findMany({
    where: {
      OR: [
        { productType: 'RAW_MATERIAL' },
        { type: 'RAW_MATERIAL' },
        { category: { contains: 'Raw', mode: 'insensitive' } }
      ]
    }
  });

  const existingRms = await prisma.rawMaterial.findMany();
  const existingSkus = new Set(existingRms.map(r => (r.sku || '').toLowerCase().trim()));
  const existingNames = new Set(existingRms.map(r => (r.name || '').toLowerCase().trim()));

  let createdCount = 0;
  for (const prod of rawProducts) {
    const skuKey = (prod.sku || '').toLowerCase().trim();
    const nameKey = (prod.name || '').toLowerCase().trim();

    if ((skuKey && existingSkus.has(skuKey)) || (nameKey && existingNames.has(nameKey))) {
      continue;
    }

    const publicId = `RM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await prisma.rawMaterial.create({
      data: {
        publicId,
        companyId: prod.companyId || companyId,
        name: prod.name,
        sku: prod.sku || `RM-${Math.floor(1000 + Math.random() * 9000)}`,
        category: prod.category || 'Raw Material',
        unit: prod.unit || 'Kg',
        minimumStock: prod.minimumStock || 0,
        storageLocation: 'Raw Material Store',
        isActive: true,
      }
    });

    if (skuKey) existingSkus.add(skuKey);
    if (nameKey) existingNames.add(nameKey);
    createdCount++;
  }

  console.log(`Successfully synced ${createdCount} missing raw materials into RawMaterial table!`);
  const finalRmCount = await prisma.rawMaterial.count();
  console.log(`Total RawMaterial count in database now: ${finalRmCount}`);
}

sync().catch(console.error).finally(() => prisma.$disconnect());
