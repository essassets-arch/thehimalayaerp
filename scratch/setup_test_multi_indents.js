require('dotenv').config({ path: 'backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst({
    where: { id: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015' }
  });
  if (!company) throw new Error('Company not found');

  const user = await prisma.user.findFirst({
    where: { companyId: company.id }
  });
  if (!user) throw new Error('User not found');

  // Let's find or create products
  const materials = [
    { name: 'WATER PAPER 60', sku: 'WP-60', unit: 'PCS' },
    { name: 'WATER PAPER 80', sku: 'WP-80', unit: 'PCS' },
    { name: 'WATER PAPER 120', sku: 'WP-120', unit: 'PCS' },
    { name: 'WATER PAPER 150', sku: 'WP-150', unit: 'PCS' },
    { name: 'Material A', sku: 'MAT-A', unit: 'KG' },
    { name: 'Material B', sku: 'MAT-B', unit: 'KG' }
  ];

  const productMap = {};
  for (const mat of materials) {
    let p = await prisma.product.findFirst({
      where: { companyId: company.id, name: mat.name }
    });
    if (!p) {
      p = await prisma.product.create({
        data: {
          publicId: `PROD-${mat.sku}-${Date.now()}`,
          companyId: company.id,
          name: mat.name,
          sku: mat.sku,
          unit: mat.unit,
          unitPrice: 100,
          type: 'RAW_MATERIAL'
        }
      });
    }
    productMap[mat.name] = p;
  }

  // Delete any existing IND-0010 or IND-0011 to start fresh
  const existingIndents = await prisma.purchaseIndent.findMany({
    where: { publicId: { in: ['IND-0010', 'IND-0011'] } },
    include: { items: true }
  });
  for (const ex of existingIndents) {
    // Delete status history
    await prisma.purchaseIndentStatusHistory.deleteMany({ where: { purchaseIndentId: ex.id } });
    // Delete items
    await prisma.purchaseIndentItem.deleteMany({ where: { purchaseIndentId: ex.id } });
    // Delete indent
    await prisma.purchaseIndent.delete({ where: { id: ex.id } });
  }

  // Create IND-0010
  const ind10 = await prisma.purchaseIndent.create({
    data: {
      publicId: 'IND-0010',
      indentNo: 'IND-0010',
      companyId: company.id,
      requestedById: user.id,
      status: 'PLANT_HEAD_APPROVED',
      department: 'STORE',
      priority: 'NORMAL',
      remarks: 'Indent 0010 for water papers',
      items: {
        create: [
          {
            productId: productMap['WATER PAPER 60'].id,
            materialName: 'WATER PAPER 60',
            materialCode: 'WP-60',
            quantity: 20,
            approvedQuantity: 20,
            estimatedUnitRate: 125,
            uom: 'PCS'
          },
          {
            productId: productMap['WATER PAPER 80'].id,
            materialName: 'WATER PAPER 80',
            materialCode: 'WP-80',
            quantity: 20,
            approvedQuantity: 20,
            estimatedUnitRate: 80,
            uom: 'PCS'
          },
          {
            productId: productMap['WATER PAPER 120'].id,
            materialName: 'WATER PAPER 120',
            materialCode: 'WP-120',
            quantity: 20,
            approvedQuantity: 20,
            estimatedUnitRate: 95,
            uom: 'PCS'
          },
          {
            productId: productMap['WATER PAPER 150'].id,
            materialName: 'WATER PAPER 150',
            materialCode: 'WP-150',
            quantity: 20,
            approvedQuantity: 20,
            estimatedUnitRate: 110,
            uom: 'PCS'
          }
        ]
      }
    },
    include: { items: true }
  });

  // Create IND-0011
  const ind11 = await prisma.purchaseIndent.create({
    data: {
      publicId: 'IND-0011',
      indentNo: 'IND-0011',
      companyId: company.id,
      requestedById: user.id,
      status: 'PLANT_HEAD_APPROVED',
      department: 'PRODUCTION',
      priority: 'HIGH',
      remarks: 'Indent 0011 for raw materials A & B',
      items: {
        create: [
          {
            productId: productMap['Material A'].id,
            materialName: 'Material A',
            materialCode: 'MAT-A',
            quantity: 10,
            approvedQuantity: 10,
            estimatedUnitRate: 250,
            uom: 'KG'
          },
          {
            productId: productMap['Material B'].id,
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

  console.log('Successfully created IND-0010 and IND-0011!');
  console.log(`IND-0010 (${ind10.id}): ${ind10.items.length} items`);
  console.log(`IND-0011 (${ind11.id}): ${ind11.items.length} items`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
