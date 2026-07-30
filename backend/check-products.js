const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const products = await p.product.findMany({ take: 5, select: { id: true, publicId: true, name: true } });
  console.log('Products:', JSON.stringify(products, null, 2));
  console.log('Count:', products.length);
  const warehouses = await p.warehouse.findMany({ take: 3, select: { id: true, name: true } });
  console.log('Warehouses:', JSON.stringify(warehouses, null, 2));
  await p.$disconnect();
}
main().catch(e => { console.error(e.message); p.$disconnect(); });
