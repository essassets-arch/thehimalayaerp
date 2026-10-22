const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const d2Orders = await prisma.salesOrder.findMany({
    where: { orderNumber: { startsWith: 'SO-D2' } },
    include: {
      customer: true,
      quotation: {
        include: {
          lead: true
        }
      }
    }
  });
  console.log('Total SO-D2 orders:', d2Orders.length);
  for (const o of d2Orders) {
    console.log(o.orderNumber, 'customerId:', o.customerId, 'customerCompany:', o.customer?.companyName, 'quotationId:', o.quotationId, 'sourceQuotationId:', o.sourceQuotationId);
  }

  // Also check what other orders or work orders or finished goods exist with D2 items
  const d2Products = await prisma.product.findMany({
    where: {
      OR: [
        { dispatchCategory: 'D2' },
        { dispatchCategory: { contains: '2' } },
        { isTrading: true }
      ]
    }
  });

  const pIds = d2Products.map(p => p.id);
  const items = await prisma.salesOrderItem.findMany({
    where: { productId: { in: pIds } },
    include: {
      salesOrder: {
        include: {
          customer: true,
          quotation: { include: { lead: true } }
        }
      }
    }
  });

  console.log('\n--- ALL SOs WITH D2 PRODUCTS ---');
  const seenSo = new Set();
  for (const it of items) {
    const so = it.salesOrder;
    if (!so || seenSo.has(so.orderNumber)) continue;
    seenSo.add(so.orderNumber);
    console.log({
      orderNumber: so.orderNumber,
      status: so.status,
      customerCompany: so.customer?.companyName,
      customerContact: so.customer?.contactPerson,
      leadCompany: so.quotation?.lead?.companyName,
      leadName: so.quotation?.lead?.name,
      shippingAddress: so.shippingAddress
    });
  }

  // Also check dispatches for D2
  const d2Dispatches = await prisma.dispatch.findMany({
    where: {
      OR: [
        { dispatchCategory: 'D2' },
        { dispatchCategory: { contains: '2' } }
      ]
    },
    include: {
      salesOrder: {
        include: {
          customer: true,
          quotation: { include: { lead: true } }
        }
      }
    }
  });

  console.log('\n--- D2 DISPATCHES ---', d2Dispatches.length);
  for (const d of d2Dispatches) {
    console.log({
      dispatchNo: d.dispatchNo,
      status: d.status,
      customer: d.salesOrder?.customer?.companyName,
      soNumber: d.salesOrder?.orderNumber
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
