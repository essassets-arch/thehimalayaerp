const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

async function main() {
  const ind10 = await prisma.purchaseIndent.findFirst({
    where: { publicId: 'ind-0010' },
    include: { items: true }
  });
  if (!ind10) throw new Error('ind-0010 not found');

  const companyId = ind10.companyId;
  const requestedById = ind10.requestedById;

  // Let's create or find products Material A and Material B in this DB
  let prodA = await prisma.product.findFirst({ where: { companyId, name: 'Material A' } });
  if (!prodA) {
    prodA = await prisma.product.create({
      data: {
        publicId: `PROD-MATA-${Date.now()}`,
        companyId,
        name: 'Material A',
        sku: 'MAT-A',
        unit: 'KG',
        unitPrice: 250,
        productType: 'RAW_MATERIAL'
      }
    });
  }

  let prodB = await prisma.product.findFirst({ where: { companyId, name: 'Material B' } });
  if (!prodB) {
    prodB = await prisma.product.create({
      data: {
        publicId: `PROD-MATB-${Date.now()}`,
        companyId,
        name: 'Material B',
        sku: 'MAT-B',
        unit: 'KG',
        unitPrice: 300,
        productType: 'RAW_MATERIAL'
      }
    });
  }

  // Delete any previous ind-0011
  const existingInd11 = await prisma.purchaseIndent.findFirst({ where: { publicId: 'ind-0011' } });
  if (existingInd11) {
    await prisma.purchaseIndentStatusHistory.deleteMany({ where: { purchaseIndentId: existingInd11.id } });
    await prisma.purchaseIndentItem.deleteMany({ where: { purchaseIndentId: existingInd11.id } });
    await prisma.purchaseIndent.delete({ where: { id: existingInd11.id } });
  }

  const ind11 = await prisma.purchaseIndent.create({
    data: {
      publicId: 'ind-0011',
      indentNo: 'ind-0011',
      companyId,
      requestedById,
      status: 'PLANT_HEAD_APPROVED',
      department: 'PRODUCTION',
      priority: 'HIGH',
      remarks: 'Indent 0011 for Material A and B',
      items: {
        create: [
          {
            productId: prodA.id,
            materialName: 'Material A',
            materialCode: 'MAT-A',
            quantity: 10,
            approvedQuantity: 10,
            estimatedUnitRate: 250,
            uom: 'KG'
          },
          {
            productId: prodB.id,
            materialName: 'Material B',
            materialCode: 'MAT-B',
            quantity: 15,
            approvedQuantity: 15,
            estimatedUnitRate: 300,
            uom: 'KG'
          }
        ]
      }
    },
    include: { items: true }
  });

  console.log('Successfully created ind-0011 in Docker DB on port 5435!');
  console.log(`ind-0011 ID: ${ind11.id} with ${ind11.items.length} items`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
