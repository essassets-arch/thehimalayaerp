const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst();
  if (!company) {
    console.error('No company found!');
    return;
  }

  const existing = await prisma.product.findFirst({
    where: { name: { contains: 'harsh', mode: 'insensitive' } }
  });

  if (existing) {
    console.log('Product matching harsh already exists:', existing.name);
    return;
  }

  const created = await prisma.product.create({
    data: {
      publicId: 'PRD-HARSH-001',
      companyId: company.id,
      name: 'HARSH FRP COVER 600X600',
      sku: 'HARSHFRP600X600',
      category: 'FRP COVERS',
      productType: 'MANUFACTURING',
      brand: 'HIMALAYA',
      dispatchCategory: 'D1',
      gstRate: 18,
      unit: 'PCS',
      unitPrice: 1500,
      isActive: true
    }
  });

  console.log('Created product:', created);
}

main().catch(console.error).finally(() => prisma.$disconnect());
