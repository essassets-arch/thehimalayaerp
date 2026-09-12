const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== CHECKING / SEEDING PARTIAL DELIVERY DATA ===\n');

  // Find company
  const company = await prisma.company.findFirst();
  if (!company) {
    console.error('No company found in database');
    return;
  }
  console.log(`Using company: ${company.name} (${company.id})`);

  // Find or create supplier
  let supplier = await prisma.supplier.findFirst({
    where: { companyId: company.id }
  });
  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: {
        companyId: company.id,
        name: 'Sana Enterprises Ltd',
        email: 'sales@sanaenterprises.com',
        phone: '+91 98765 43210',
        gstin: '27AABCS1429B1Z1'
      }
    });
  }
  console.log(`Supplier: ${supplier.name} (${supplier.id})`);

  // Find products for the test
  let prodWaterPaper120 = await prisma.product.findFirst({
    where: {
      name: { contains: 'WATER PAPER 120', mode: 'insensitive' }
    }
  });

  if (!prodWaterPaper120) {
    prodWaterPaper120 = await prisma.product.create({
      data: {
        companyId: company.id,
        name: 'WATER PAPER 120',
        code: 'WP-120',
        productType: 'RAW_MATERIAL',
        unit: 'PCS',
        currentStock: 100,
        minStock: 20
      }
    });
  }

  let prodWaterPaper60 = await prisma.product.findFirst({
    where: {
      name: { contains: 'WATER PAPER 60', mode: 'insensitive' }
    }
  });

  if (!prodWaterPaper60) {
    prodWaterPaper60 = await prisma.product.create({
      data: {
        companyId: company.id,
        name: 'WATER PAPER 60',
        code: 'WP-060',
        productType: 'RAW_MATERIAL',
        unit: 'PCS',
        currentStock: 80,
        minStock: 20
      }
    });
  }

  // Check if a partial delivery PO already exists
  const existingPartialPO = await prisma.purchaseOrder.findFirst({
    where: {
      poNumber: 'PO-2026-000019'
    },
    include: { items: true, grns: { include: { items: true } } }
  });

  if (!existingPartialPO) {
    console.log('Creating demo partial PO: PO-2026-000019 with 2 lines (Line 1: 40 ordered, Line 2: 20 ordered)...');
    const warehouse = await prisma.warehouse.findFirst({ where: { companyId: company.id } }) || await prisma.warehouse.findFirst();

    const newPO = await prisma.purchaseOrder.create({
      data: {
        companyId: company.id,
        supplierId: supplier.id,
        publicId: 'PO-2026-000019',
        poNumber: 'PO-2026-000019',
        status: 'ORDERED',
        totalAmount: 14160,
        expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            {
              productId: prodWaterPaper120.id,
              materialNameSnapshot: 'WATER PAPER 120',
              quantity: 40,
              unitPrice: 200,
              lineTotal: 8000
            },
            {
              productId: prodWaterPaper60.id,
              materialNameSnapshot: 'WATER PAPER 60',
              quantity: 20,
              unitPrice: 200,
              lineTotal: 4000
            }
          ]
        }
      },
      include: { items: true }
    });

    console.log(`Created PO: ${newPO.poNumber} (${newPO.id}) with items:`, newPO.items.length);

    // Create partial GRN: Store receives 25 for WATER PAPER 120, and 20 for WATER PAPER 60 (fully delivered)
    const item1 = newPO.items.find(i => i.productId === prodWaterPaper120.id) || newPO.items[0];
    const item2 = newPO.items.find(i => i.productId === prodWaterPaper60.id) || newPO.items[1];

    const grn = await prisma.goodsReceiptNote.create({
      data: {
        companyId: company.id,
        warehouseId: warehouse.id,
        purchaseOrderId: newPO.id,
        publicId: 'GRN-2026-000019-1',
        grnNumber: 'GRN-2026-000019-1',
        status: 'FINANCE_AUDIT_APPROVED',
        snapshot: {
          challanNumber: 'DC-SANA-9812',
          vehicleNumber: 'GJ-01-AX-9912'
        },
        items: {
          create: [
            {
              purchaseOrderItemId: item1.id,
              productId: item1.productId,
              receivedQuantity: 25,
              acceptedQuantity: 25,
              rejectedQuantity: 0
            },
            {
              purchaseOrderItemId: item2.id,
              productId: item2.productId,
              receivedQuantity: 20,
              acceptedQuantity: 20,
              rejectedQuantity: 0
            }
          ]
        }
      }
    });

    console.log(`Created GRN: ${grn.grnNumber} for PO ${newPO.poNumber}`);
  } else {
    console.log(`PO-2026-000019 already exists. Items: ${existingPartialPO.items.length}, GRNs: ${existingPartialPO.grns.length}`);
  }

  console.log('\nData check complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
