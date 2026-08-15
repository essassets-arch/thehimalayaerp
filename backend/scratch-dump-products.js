const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const products = await prisma.product.findMany();
  console.log('Total products:', products.length);
  if (products.length > 0) {
    console.log('Sample product:', JSON.stringify(products[0], null, 2));
    // Let's print out all products as a mapping of publicId/name to details
    const mapping = products.map(p => ({
      id: p.id,
      publicId: p.publicId,
      name: p.name,
      code: p.productCode,
      hsnCode: p.hsnCode,
      sku: p.sku
    }));
    console.log('All products list:');
    console.log(JSON.stringify(mapping, null, 2));
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
