require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const INDIAN_VEHICLES = [
  'GJ27TJ2274', 'GJ01AB1294', 'GJ06TK5541', 'GJ03ER8892', 'GJ27AB9012',
  'GJ01CD3412', 'GJ04TK7721', 'GJ18AB4419', 'GJ06ER2291', 'GJ27TK6612',
  'GJ01EF8812', 'GJ05TK1124', 'GJ03AB5591', 'GJ27CD3391', 'GJ01GH6612',
  'GJ06TK4491', 'GJ04AB2219', 'GJ18TK9912', 'GJ27EF7712', 'GJ01TK3319',
  'MH04AB5512', 'MH12TK8891', 'RJ14CD4412', 'GJ27GH1192', 'GJ01IJ2219'
];

const DRIVERS = [
  { name: 'Ibrahim Bhai', phone: '7802055934' },
  { name: 'Ramesh Patel', phone: '9825123412' },
  { name: 'Suresh Kumar', phone: '9898234567' },
  { name: 'Vikram Singh', phone: '9724123890' },
  { name: 'Mukesh Sharma', phone: '9909123456' },
  { name: 'Abdul Khan', phone: '9824567890' },
  { name: 'Dilip Bhai', phone: '9426123456' },
  { name: 'Rajesh Solanki', phone: '9879123456' },
  { name: 'Pravin Vaghela', phone: '9712123456' },
  { name: 'Dinesh Prajapati', phone: '9825987654' }
];

const RECEIVERS = [
  { name: 'Ravi', phone: '7802055934', designation: 'Site Incharge' },
  { name: 'Mahesh Sharma', phone: '9825123412', designation: 'Project Manager' },
  { name: 'Prakash Patel', phone: '9898234567', designation: 'Store Manager' },
  { name: 'Kiran Desai', phone: '9724123890', designation: 'Site Engineer' },
  { name: 'Haresh Bhai', phone: '9909123456', designation: 'Supervisor' },
  { name: 'Ajay Varma', phone: '9824567890', designation: 'Receiving Officer' }
];

async function alignRemaining() {
  console.log('=== COMPLETING READY QUEUE & DISPATCH 2 CONFIGURATION ===');

  // Check how many orders are in Ready Queue currently
  const readyWorkOrders = await prisma.workOrder.findMany({
    where: {
      OR: [
        { status: 'READY_FOR_DISPATCH' },
        { productionStatus: 'READY_FOR_DISPATCH' },
        { sentToDispatchAt: { not: null } },
      ],
    },
    include: {
      salesOrderItem: { include: { product: true } },
      productionPlan: {
        include: {
          salesOrder: {
            include: {
              customer: true,
              salesExecutive: { select: { id: true, name: true, email: true } },
            },
          },
        },
      },
    },
  });

  const ordersMap = new Map();
  for (const wo of readyWorkOrders) {
    const key = wo.productionPlan?.salesOrder?.id || wo.id;
    ordersMap.set(key, true);
  }
  console.log(`Current unique ready orders: ${ordersMap.size} (Target: 139)`);

  const neededReady = 139 - ordersMap.size;
  console.log(`Needed ready orders to add: ${neededReady}`);

  // --- E. DISPATCH 2 (SAHAD TRADING) DEDICATED DATA ---
  console.log('\n--- Configuring Dispatch 2 (Sahad Trading) Dedicated Operations ---');
  const existingD2 = await prisma.dispatch.count({ where: { dispatchCategory: 'D2' } });
  if (existingD2 === 0) {
    const sahadUser = await prisma.user.findFirst({
      where: { email: { contains: 'sahad.dispatch', mode: 'insensitive' } }
    });
    const sahadId = sahadUser ? sahadUser.id : '6bb1f9b2-5689-4a75-be08-060fc746e538';

    const tradingProducts = await prisma.product.findMany({
      where: {
        OR: [
          { dispatchCategory: 'D2' },
          { productType: 'TRADING' }
        ]
      },
      take: 20
    });

    const d2Customer = await prisma.customer.findFirst({
      where: { companyId: '88c57ebc-b3b7-49e3-8d5d-6321a0e89015' }
    });

    if (tradingProducts.length > 0 && d2Customer) {
      console.log(`Found ${tradingProducts.length} trading products for D2.`);

      const d2Counts = [
        { status: 'DELIVERED', count: 12 },
        { status: 'IN_TRANSIT', count: 4 },
        { status: 'OUT_FOR_DELIVERY', count: 2 }
      ];

      let d2DispCounter = 1;
      for (const group of d2Counts) {
        for (let i = 0; i < group.count; i++) {
          d2DispCounter++;
          const prod = tradingProducts[d2DispCounter % tradingProducts.length];
          const veh = INDIAN_VEHICLES[(d2DispCounter + 5) % INDIAN_VEHICLES.length];
          const drv = DRIVERS[(d2DispCounter + 3) % DRIVERS.length];
          const rec = RECEIVERS[(d2DispCounter + 2) % RECEIVERS.length];

          const so = await prisma.salesOrder.create({
            data: {
              orderNumber: `SO-D2-2026-${String(d2DispCounter).padStart(4, '0')}`,
              customerId: d2Customer.id,
              status: 'READY_FOR_DISPATCH',
              subtotal: '25000',
              taxableAmount: '25000',
              taxAmount: '4500',
              totalAmount: '29500',
              currency: 'INR',
              salesExecutiveId: sahadId,
              createdById: sahadId,
              shippingAddress: {
                line1: 'Sahad Depot Staging, Sarkhej Road',
                city: 'Ahmedabad',
                state: 'Gujarat',
                pincode: '382210',
                country: 'India'
              },
              items: {
                create: [
                  {
                    productId: prod.id,
                    productNameSnapshot: prod.name,
                    productCodeSnapshot: prod.sku,
                    orderedQuantity: '10',
                    unitPrice: '2500',
                    discountAmount: '0',
                    taxableAmount: '25000',
                    taxRate: '18',
                    taxAmount: '4500',
                    lineTotal: '29500',
                    unit: prod.unit || 'PCS'
                  }
                ]
              }
            },
            include: { items: true }
          });

          const soItem = so.items[0];
          const dispatchedDate = new Date(Date.now() - (i + 1) * 24 * 3600 * 1000);
          const deliveredDate = group.status === 'DELIVERED' ? new Date(dispatchedDate.getTime() + 18 * 3600 * 1000) : null;
          const outDate = ['DELIVERED', 'OUT_FOR_DELIVERY'].includes(group.status) ? new Date(dispatchedDate.getTime() + 12 * 3600 * 1000) : null;

          await prisma.dispatch.create({
            data: {
              dispatchNo: `DISP-D2-2026-${String(d2DispCounter).padStart(4, '0')}`,
              salesOrderId: so.id,
              dispatchCategory: 'D2',
              status: group.status,
              isSubmitted: true,
              deliveryAddress: 'Sahad Depot Staging, Sarkhej Road, Ahmedabad, Gujarat, 382210',
              packageCount: 2,
              packageType: 'WOODEN_PALLET',
              totalWeight: '450',
              transporterName: 'Sahad Express Freight',
              vehicleNumber: veh,
              vehicleType: 'TEMPO',
              driverName: drv.name,
              driverPhone: drv.phone,
              lrNumber: `LR-D2-2026-${String(d2DispCounter).padStart(4, '0')}`,
              freightType: 'PAID',
              freightAmount: '0',
              dispatchedAt: dispatchedDate,
              dispatchedById: sahadId,
              gateOutAt: dispatchedDate,
              gatePassNumber: `GP-D2-2026-${String(d2DispCounter).padStart(4, '0')}`,
              gateSecurityConfirmed: true,
              invoiceNumber: `INV-D2-2026-${String(d2DispCounter).padStart(4, '0')}`,
              ewayBillNumber: `EWB-D2-2026-${String(d2DispCounter).padStart(6, '0')}`,
              outForDeliveryAt: outDate,
              deliveredAt: deliveredDate,
              deliveredQuantity: group.status === 'DELIVERED' ? '10' : null,
              receivedBy: group.status === 'DELIVERED' ? rec.name : null,
              receiverPhone: group.status === 'DELIVERED' ? rec.phone : null,
              deliveryRemarks: group.status === 'DELIVERED' ? 'Delivered successfully with verified POD' : null,
              podUrl: group.status === 'DELIVERED' ? '/uploads/pod/1788590475711-IMG-20260817-WA0008.jpg' : null,
              podStatus: group.status === 'DELIVERED' ? 'APPROVED' : null,
              createdById: sahadId,
              version: 1,
              createdAt: dispatchedDate,
              updatedAt: deliveredDate || dispatchedDate,
              items: {
                create: [
                  {
                    salesOrderItemId: soItem.id,
                    quantity: 10
                  }
                ]
              }
            }
          });
        }
      }

      // Create 10 D2 Ready orders (with allocations)
      for (let j = 0; j < 10; j++) {
        d2DispCounter++;
        const prod = tradingProducts[d2DispCounter % tradingProducts.length];
        const so = await prisma.salesOrder.create({
          data: {
            orderNumber: `SO-D2-2026-${String(d2DispCounter).padStart(4, '0')}`,
            customerId: d2Customer.id,
            status: 'READY_FOR_DISPATCH',
            subtotal: '15000',
            taxableAmount: '15000',
            taxAmount: '2700',
            totalAmount: '17700',
            currency: 'INR',
            salesExecutiveId: sahadId,
            createdById: sahadId,
            shippingAddress: {
              line1: 'Sahad Depot Staging, Sarkhej Road',
              city: 'Ahmedabad',
              state: 'Gujarat',
              pincode: '382210',
              country: 'India'
            },
            items: {
              create: [
                {
                  productId: prod.id,
                  productNameSnapshot: prod.name,
                  productCodeSnapshot: prod.sku,
                  orderedQuantity: '5',
                  unitPrice: '3000',
                  discountAmount: '0',
                  taxableAmount: '15000',
                  taxRate: '18',
                  taxAmount: '2700',
                  lineTotal: '17700',
                  unit: prod.unit || 'PCS'
                }
              ]
            }
          },
          include: { items: true }
        });

        await prisma.salesOrderAllocation.create({
          data: {
            salesOrderId: so.id,
            salesOrderItemId: so.items[0].id,
            allocationType: 'FINISHED_GOODS_RESERVATION',
            requiredQuantity: 5,
            reservedQuantity: 5
          }
        });
      }
      console.log('Created dedicated D2 Trading dispatches & ready orders.');
    }
  } else {
    console.log(`D2 dispatches already exist (${existingD2}).`);
  }

  console.log('\n=== FINAL VERIFICATION OF DATABASE COUNTS ===');
  const d1Delivered = await prisma.dispatch.count({
    where: {
      OR: [{ dispatchCategory: 'D1' }, { dispatchCategory: null }],
      status: 'DELIVERED'
    }
  });
  const d1InTransit = await prisma.dispatch.count({
    where: {
      OR: [{ dispatchCategory: 'D1' }, { dispatchCategory: null }],
      status: 'IN_TRANSIT'
    }
  });
  const d1OutDelivery = await prisma.dispatch.count({
    where: {
      OR: [{ dispatchCategory: 'D1' }, { dispatchCategory: null }],
      status: 'OUT_FOR_DELIVERY'
    }
  });
  console.log(`D1 DELIVERED: ${d1Delivered} (Target: 144)`);
  console.log(`D1 IN_TRANSIT: ${d1InTransit} (Target: 19)`);
  console.log(`D1 OUT_FOR_DELIVERY: ${d1OutDelivery} (Target: 3)`);

  const d2Delivered = await prisma.dispatch.count({
    where: { dispatchCategory: 'D2', status: 'DELIVERED' }
  });
  const d2InTransit = await prisma.dispatch.count({
    where: { dispatchCategory: 'D2', status: 'IN_TRANSIT' }
  });
  const d2OutDelivery = await prisma.dispatch.count({
    where: { dispatchCategory: 'D2', status: 'OUT_FOR_DELIVERY' }
  });
  console.log(`D2 DELIVERED: ${d2Delivered}`);
  console.log(`D2 IN_TRANSIT: ${d2InTransit}`);
  console.log(`D2 OUT_FOR_DELIVERY: ${d2OutDelivery}`);

  console.log('=== ALIGNMENT SCRIPT COMPLETE ===');
}

alignRemaining().catch(console.error).finally(() => prisma.$disconnect());
