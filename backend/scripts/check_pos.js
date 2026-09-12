require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pos = await prisma.purchaseOrder.findMany({
    include: {
      items: { include: { product: true } },
      grns: {
        where: {
          status: { notIn: ['CANCELLED', 'RETURNED_TO_STORE', 'FINANCE_AUDIT_REJECTED', 'REJECTED', 'VOID', 'VOIDED'] }
        },
        include: { items: true }
      },
      supplier: true,
      purchaseIndent: true
    },
    take: 10,
    orderBy: { createdAt: 'desc' }
  });

  console.log(`Found ${pos.length} purchase orders.`);
  for (const po of pos) {
    console.log(`\nPO: ${po.poNumber || po.id} | Status: ${po.status} | Supplier: ${po.supplier?.name}`);
    console.log(`  Items count: ${po.items.length}, GRNs count: ${po.grns.length}`);
    for (const item of po.items) {
      let rec = 0;
      po.grns.forEach(g => {
        (g.items || []).forEach(gi => {
          if (
            (gi.purchaseOrderItemId && gi.purchaseOrderItemId === item.id) ||
            (gi.productId && (gi.productId === item.productId || gi.productId === item.materialId))
          ) {
            rec += Number(gi.acceptedQuantity || gi.receivedQuantity || 0);
          }
        });
      });
      const ord = Number(item.quantity || 0);
      const rem = Math.max(0, ord - rec);
      console.log(`    - Item: ${item.product?.name || item.materialName || item.id} | Ord: ${ord} | Rec: ${rec} | Rem: ${rem} | Status: ${rec === 0 ? 'Not Received' : rem === 0 ? 'Fully Delivered' : 'Partial'}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
