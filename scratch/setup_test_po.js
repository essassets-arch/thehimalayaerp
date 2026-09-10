const { PrismaClient } = require('@prisma/client');

async function setupDB(name, url) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    console.log(`=== Setting up ${name} ===`);
    // 1. Find handle product & raw material
    const user = await prisma.user.findFirst({ where: { email: 'sana.r@himalayaerp.com' } });
    const company = user ? await prisma.company.findUnique({ where: { id: user.companyId } }) : await prisma.company.findFirst();
    const companyId = company.id;

    // 1. Find existing handle product & raw material across DB or for this company
    let product = await prisma.product.findFirst({
      where: {
        OR: [
          { sku: 'HM204' },
          { name: { equals: 'handle', mode: 'insensitive' } }
        ]
      }
    });
    let rawMaterial = await prisma.rawMaterial.findFirst({
      where: {
        OR: [
          { sku: 'HM204' },
          { name: { equals: 'handle', mode: 'insensitive' } }
        ]
      }
    });

    if (!product) {
      const pSku = 'RM-HDL-' + Date.now().toString().slice(-4);
      product = await prisma.product.create({
        data: {
          publicId: 'PROD-HANDLE-101',
          companyId,
          name: 'handle',
          sku: pSku,
          category: 'Raw Material',
          productType: 'RAW_MATERIAL',
          unit: 'PCS',
          unitPrice: 120,
          minimumStock: 5,
        }
      });
      console.log('Created product handle:', product.id);
    }
    if (!rawMaterial) {
      const rmSku = product.sku || ('RM-HDL-' + Date.now().toString().slice(-4));
      rawMaterial = await prisma.rawMaterial.create({
        data: {
          publicId: 'RM-HANDLE-101',
          companyId,
          name: 'handle',
          sku: rmSku,
          category: 'Raw Material',
          unit: 'PCS',
          minimumStock: 5,
        }
      });
      console.log('Created rawMaterial handle:', rawMaterial.id);
    }

    // 2. Clear any previous inventory transactions & stock history for handle so baseline is 0
    const targetIds = [product.id, rawMaterial.id].filter(Boolean);
    await prisma.inventoryTransaction.deleteMany({
      where: {
        OR: [
          { productId: { in: targetIds } },
          { rawMaterialId: { in: targetIds } },
          { referenceId: 'PO-REJ-581697' }
        ]
      }
    });
    await prisma.stockHistory.deleteMany({
      where: {
        OR: [
          { productId: { in: targetIds } },
          { referenceNumber: 'PO-REJ-581697' }
        ]
      }
    });

    // 3. Clear existing GRNs for PO-REJ-581697
    const existingPo = await prisma.purchaseOrder.findFirst({
      where: { poNumber: 'PO-REJ-581697' },
      include: { grns: true, items: true }
    });

    if (existingPo) {
      for (const grn of existingPo.grns) {
        await prisma.goodsReceiptNoteItem.deleteMany({ where: { goodsReceiptNoteId: grn.id } });
        await prisma.goodsReceiptNote.delete({ where: { id: grn.id } });
      }
      await prisma.materialRejection.deleteMany({ where: { purchaseOrderId: existingPo.id } });

      // Update PO items to ordered 10, received 0
      for (const item of existingPo.items) {
        await prisma.purchaseOrderItem.update({
          where: { id: item.id },
          data: {
            productId: product.id,
            materialNameSnapshot: 'handle',
            materialCodeSnapshot: 'HM204',
            uomSnapshot: 'PCS',
            quantity: 10,
            receivedQuantity: 0,
            acceptedQuantity: 0,
          }
        });
      }

      await prisma.purchaseOrder.update({
        where: { id: existingPo.id },
        data: {
          companyId,
          status: 'PO_ISSUED',
        }
      });
      console.log('Reset existing PO-REJ-581697 to ordered=10, received=0, status=PO_ISSUED');
    } else {
      let supplier = await prisma.supplier.findFirst({ where: { companyId } });
      if (!supplier) {
        supplier = await prisma.supplier.create({
          data: {
            publicId: 'SUP-001',
            companyId,
            name: 'Default Supplier',
            gstin: '27AAACH7423P1Z0'
          }
        });
      }

      const newPo = await prisma.purchaseOrder.create({
        data: {
          publicId: 'PO-REJ-581697',
          poNumber: 'PO-REJ-581697',
          poNo: 'PO-REJ-581697',
          draftPoNo: 'PO-REJ-581697',
          companyId,
          supplierId: supplier.id,
          status: 'PO_ISSUED',
          totalAmount: 1200,
          items: {
            create: [
              {
                productId: product.id,
                quantity: 10,
                receivedQuantity: 0,
                acceptedQuantity: 0,
                unitPrice: 120,
              }
            ]
          }
        },
        include: { items: true }
      });
      console.log('Created fresh PO-REJ-581697:', newPo.id);
    }
  } catch (err) {
    console.error(`Error configuring ${name}:`, err);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await setupDB('Docker DB (Port 5435)', 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public');
  await setupDB('Local Test DB (Port 5432)', 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public');
}

main();
