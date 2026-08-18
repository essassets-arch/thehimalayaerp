const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createPendingPOForSuperAdmin() {
  console.log('=== SEEDING PENDING SUPER ADMIN PO REQUEST ===');

  const company = await prisma.company.findFirst();
  const supplier = await prisma.supplier.findFirst();
  const product = await prisma.product.findFirst();

  const poNumber = `PO-REQ-${Date.now().toString().slice(-6)}`;
  
  const newPO = await prisma.purchaseOrder.create({
    data: {
      publicId: poNumber,
      poNumber,
      companyId: company?.id || '46be0689-1169-4adc-bcf9-d4100032a0ee',
      supplierId: supplier?.id,
      status: 'PENDING_SUPER_ADMIN_APPROVAL',
      totalAmount: 154000,
      paymentTerms: '30 Days Net',
      items: {
        create: [
          {
            productId: product?.id,
            quantity: 500,
            unitPrice: 308,
          }
        ]
      }
    }
  });

  console.log('Successfully created pending PO for Super Admin Approval:', newPO.id, newPO.poNumber, newPO.status);
}

createPendingPOForSuperAdmin().finally(() => prisma.$disconnect());
