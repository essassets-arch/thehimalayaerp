require('dotenv').config({ path: 'd:/prototype-next-main/backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const prodRMs = await prisma.product.findMany({
    where: {
      OR: [
        { productType: 'RAW_MATERIAL' },
        { type: 'RAW_MATERIAL' },
        { category: { contains: 'Raw', mode: 'insensitive' } }
      ]
    },
    select: { id: true, name: true, sku: true, type: true, productType: true }
  });
  const rms = await prisma.rawMaterial.findMany({
    select: { id: true, name: true, sku: true }
  });
  const rmSkus = new Set(rms.map(r => (r.sku || '').toLowerCase().trim()));
  const rmNames = new Set(rms.map(r => (r.name || '').toLowerCase().trim()));
  const missing = prodRMs.filter(p => !rmSkus.has((p.sku || '').toLowerCase().trim()) && !rmNames.has((p.name || '').toLowerCase().trim()));
  console.log('Total Raw Products:', prodRMs.length, 'Total RawMaterials:', rms.length, 'Missing from RawMaterial:', missing.length);
  const companyIds = new Set(missing.map(m => m.companyId));
  console.log('Unique company IDs among missing:', Array.from(companyIds));
}
run().catch(console.error).finally(() => prisma.$disconnect());
