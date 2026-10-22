const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Fetch real active customers
  const customers = await prisma.customer.findMany({
    where: {
      status: 'ACTIVE',
      companyName: {
        notIn: ['MENVOC INFRASTRUCTURE', 'Test Customer', 'Sample Customer', 'Consignee Client', 'Test Company Customer']
      }
    },
    select: {
      id: true,
      companyName: true,
      contactPerson: true,
      shippingAddress: true,
      billingAddress: true
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Found ${customers.length} authentic customers to distribute.`);
  if (customers.length < 28) {
    throw new Error(`Not enough customers! Found only ${customers.length}`);
  }

  // 2. Fetch all SO-D2 orders and extra trading orders
  const targetOrderNumbers = [
    'SO-D2-2026-0002', 'SO-D2-2026-0003', 'SO-D2-2026-0004', 'SO-D2-2026-0005',
    'SO-D2-2026-0006', 'SO-D2-2026-0007', 'SO-D2-2026-0008', 'SO-D2-2026-0009',
    'SO-D2-2026-0010', 'SO-D2-2026-0011', 'SO-D2-2026-0012', 'SO-D2-2026-0013',
    'SO-D2-2026-0014', 'SO-D2-2026-0015', 'SO-D2-2026-0016', 'SO-D2-2026-0017',
    'SO-D2-2026-0018', 'SO-D2-2026-0019', 'SO-D2-2026-0020', 'SO-D2-2026-0021',
    'SO-D2-2026-0022', 'SO-D2-2026-0023', 'SO-D2-2026-0024', 'SO-D2-2026-0025',
    'SO-D2-2026-0026', 'SO-D2-2026-0027', 'SO-D2-2026-0028', 'SO-D2-2026-0029',
    'ORD-TEST-TRD-263232', 'ORD-TEST-TRD-328325', 'HCPPL/2627/0308', 'HCPPL/2627/0309', 'SO-TRD-091567'
  ];

  const salesOrders = await prisma.salesOrder.findMany({
    where: {
      orderNumber: { in: targetOrderNumbers }
    },
    include: {
      dispatches: true
    },
    orderBy: { orderNumber: 'asc' }
  });

  console.log(`Found ${salesOrders.length} sales orders to reassign.`);

  const formatAddressObj = (c) => {
    let addr = c.shippingAddress || c.billingAddress;
    if (addr && typeof addr === 'object') {
      return {
        line1: addr.line1 || addr.addressLine1 || addr.street || `${c.companyName} Depot Site`,
        city: addr.city || 'Ahmedabad',
        state: addr.state || 'Gujarat',
        pincode: addr.pincode || '380001',
        country: 'India'
      };
    }
    return {
      line1: `${c.companyName} Commercial Depot`,
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380001',
      country: 'India'
    };
  };

  const formatAddressStr = (addrObj) => {
    return `${addrObj.line1}, ${addrObj.city}, ${addrObj.state} ${addrObj.pincode}, India`;
  };

  console.log('\n--- Planned Mapping ---');
  salesOrders.forEach((so, idx) => {
    const cust = customers[idx % customers.length];
    const addrObj = formatAddressObj(cust);
    const addrStr = formatAddressStr(addrObj);
    console.log(`${so.orderNumber} -> Customer: [${cust.id}] ${cust.companyName} | Address: ${addrStr}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
