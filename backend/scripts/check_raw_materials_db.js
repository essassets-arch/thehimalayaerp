const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rms = await prisma.rawMaterial.findMany({
    select: { id: true, publicId: true, sku: true, name: true, companyId: true, minimumStock: true }
  });
  console.log('Total RawMaterials in DB:', rms.length);
  const sample = rms.slice(0, 5);
  console.log('Sample RawMaterials in DB:', sample);

  const rawProducts = await prisma.product.findMany({
    where: { productType: 'RAW_MATERIAL' },
    select: { id: true, publicId: true, sku: true, name: true, companyId: true }
  });
  console.log('Total Product (RAW_MATERIAL) in DB:', rawProducts.length);

  const hcpplRms = rms.filter(r => r.sku && r.sku.startsWith('HCPPL'));
  console.log('HCPPL RawMaterials in DB:', hcpplRms.length);

  const hmRms = rms.filter(r => r.sku && r.sku.startsWith('HM'));
  console.log('HM RawMaterials in DB:', hmRms.length);

  const otherRms = rms.filter(r => !r.sku || (!r.sku.startsWith('HCPPL') && !r.sku.startsWith('HM')));
  console.log('Other RawMaterials in DB:', otherRms);
}

main().catch(console.error).finally(() => prisma.$disconnect());
