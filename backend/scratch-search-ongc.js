const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public"
    }
  }
});
async function main() {
  const res = await p.product.findMany({
    select: {
      category: true,
      productType: true,
      sku: true,
      name: true
    }
  });
  const cats = new Set(res.map(x => x.category));
  const types = new Set(res.map(x => x.productType));
  console.log('Categories in Product table:', Array.from(cats));
  console.log('Types in Product table:', Array.from(types));
  console.log('Sample materials/other in Product table:', res.filter(x => 
    x.category?.toLowerCase().includes('material') || 
    x.name?.toLowerCase().includes('material') ||
    x.category?.toLowerCase().includes('sand') ||
    x.category?.toLowerCase().includes('cement') ||
    x.category?.toLowerCase().includes('aggregate') ||
    x.productType === 'RAW_MATERIAL'
  ).slice(0, 10));
}
main().catch(console.error).finally(() => p.$disconnect());
