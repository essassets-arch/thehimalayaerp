const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public"
    }
  }
});

async function main() {
  const prods = await prisma.product.findMany({
    where: { name: { contains: 'WGC 600X900 LD BLACK', mode: 'insensitive' } }
  });
  console.log('Products matching WGC 600X900 LD BLACK:', prods.length);
  prods.forEach(p => console.log('ID:', p.id, 'SKU:', p.sku, 'Name:', p.name, 'Company:', p.companyId));
}

main().catch(console.error).finally(() => prisma.$disconnect());
