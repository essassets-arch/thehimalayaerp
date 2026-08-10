const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSearch() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, companyId: true } });
  
  for (const user of users) {
    const search = 'FRPMHCLD 36X36';
    const scope = 'sales';
    const companyId = user.companyId;

    const where = { companyId, isActive: true };
    if (scope === 'sales') {
      where.AND = [
        {
          OR: [
            { productType: { in: ['MANUFACTURING', 'TRADING'] } },
            {
              AND: [
                { productType: null },
                { category: { notIn: ['Hardware', 'Raw Material', 'Electric'] } },
              ],
            },
          ],
        },
      ];
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const results = await prisma.product.findMany({ where });
    console.log(`User ${user.email} (companyId ${companyId}) search "${search}": found ${results.length} items`);
    if (results.length > 0) {
      console.log('  ->', results.map(r => ({ id: r.id, name: r.name, sku: r.sku })));
    }
  }
}

testSearch().finally(() => prisma.$disconnect());
