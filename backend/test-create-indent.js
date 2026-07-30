const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const company = await prisma.company.findFirst();
  const user = await prisma.user.findFirst();
  const product = await prisma.product.findFirst();
  const warehouse = await prisma.warehouse.findFirst();

  console.log('Resolving parameters:');
  console.log('Company ID:', company?.id);
  console.log('User ID:', user?.id);
  console.log('Product ID:', product?.id);
  console.log('Warehouse ID:', warehouse?.id);

  try {
    const res = await prisma.$transaction(async tx => {
      const row = await tx.purchaseIndent.create({
        data: {
          publicId: 'PI-TEST-12345',
          companyId: company.id,
          requestedById: user.id,
          status: 'DRAFT',
          department: 'STORE',
          warehouseId: warehouse.id,
          requiredDate: new Date(),
          priority: 'NORMAL',
          businessReason: 'Test',
          remarks: 'Test remarks',
          items: {
            create: [
              {
                productId: product.id,
                quantity: 50,
                estimatedUnitRate: 10,
                lineRemarks: 'Test line remarks'
              }
            ]
          }
        }
      });
      return row;
    });
    console.log('Success! Created indent:', res);
  } catch (err) {
    console.error('Error creating indent:', err);
  }
}

run().finally(() => prisma.$disconnect());
