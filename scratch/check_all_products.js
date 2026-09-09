const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, sku: true, unit: true, unitPrice: true }
  });
  console.log(`Products in Docker DB (${products.length}):`);
  for (const p of products) {
    console.log(`- ${p.name} (${p.sku}) | unit: ${p.unit} | unitPrice: ${p.unitPrice}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
