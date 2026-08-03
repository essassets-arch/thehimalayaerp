const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' } }
});

async function main() {
  const p = await prisma.product.findUnique({ where: { publicId: 'FG-INACTIVE-PROD' } });
  console.log(p);
  process.exit(0);
}
main();
