const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rms = await prisma.rawMaterial.findMany();
  console.log('RawMaterial count:', rms.length);
  
  const products = await prisma.product.findMany({ where: { productType: 'RAW_MATERIAL' } });
  console.log('Product RAW_MATERIAL count:', products.length);
  
  const tapeProducts = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'tape', mode: 'insensitive' } },
        { sku: '12' },
        { publicId: { contains: '12', mode: 'insensitive' } }
      ]
    }
  });
  console.log('Tape or 12 products in Product table:', tapeProducts);

  const tapeRMs = await prisma.rawMaterial.findMany({
    where: {
      OR: [
        { name: { contains: 'tape', mode: 'insensitive' } },
        { sku: '12' },
        { publicId: { contains: '12', mode: 'insensitive' } }
      ]
    }
  });
  console.log('Tape or 12 in RawMaterial table:', tapeRMs);

  const companies = await prisma.company.findMany();
  console.log('Companies:', companies.map(c => ({ id: c.id, name: c.name, code: c.code })));

  const warehouses = await prisma.warehouse.findMany();
  console.log('Warehouses:', warehouses.map(w => ({ id: w.id, name: w.name, companyId: w.companyId })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
