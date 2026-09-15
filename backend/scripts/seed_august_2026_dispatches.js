const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');

const isDocker = fs.existsSync('/.dockerenv') || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:'));

const targetDbs = isDocker
  ? [{ name: 'Docker Database', url: process.env.DATABASE_URL }]
  : [
      { name: 'Active DB (himalaya_erp_browser_test)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
      { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
    ];

// August 2026 Daily Dispatches
const AUGUST_DAYS = [
  { day: 1, dateStr: '2026-08-01', weight: 3820, pcs: 88, freight: 9000, transporter: 'Dipak Bhai Express', vehicle: 'GJ01TF0620', driver: 'Dipak Bhai', customer: 'Vastu Nirman Buildcon', salesRef: 'MTH', product: 'MHC', size: '600 × 600', capacity: 'LD', colour: 'Grey' },
  { day: 3, dateStr: '2026-08-03', weight: 14396, pcs: 318, freight: 34100, transporter: 'Rajesh Bhai Carriers', vehicle: 'GJ36V0569', driver: 'Rajesh Bhai', customer: 'P. Das Infrastructure', salesRef: 'MTH', product: 'RCS', size: '1200 × 1200', capacity: 'D400', colour: 'Grey' },
  { day: 4, dateStr: '2026-08-04', weight: 4120, pcs: 94, freight: 9800, transporter: 'Ibrahim Bhai Transport', vehicle: 'GJ27TE8348', driver: 'Ibrahim Bhai', customer: 'Sagar Construction', salesRef: 'TL', product: 'MHC', size: '600 × 600', capacity: 'LD', colour: 'Grey' },
  { day: 5, dateStr: '2026-08-05', weight: 5210, pcs: 115, freight: 12400, transporter: 'Ibrahim Bhai Transport', vehicle: 'GJ27TJ2274', driver: 'Ibrahim Bhai', customer: 'Sagar Construction', salesRef: 'MTH', product: 'MHC', size: '600 × 600', capacity: 'C250', colour: 'Grey' },
  { day: 6, dateStr: '2026-08-06', weight: 4680, pcs: 104, freight: 11100, transporter: 'Dipak Bhai Express', vehicle: 'GJ01TF0620', driver: 'Dipak Bhai', customer: 'Suvidha Construction', salesRef: 'MTH', product: 'MHC', size: '600 × 600', capacity: 'LD', colour: 'Grey' },
  { day: 8, dateStr: '2026-08-08', weight: 3450, pcs: 78, freight: 8200, transporter: 'Khengar Bhai Logistics', vehicle: 'GJ27TB9338', driver: 'Khengar Bhai', customer: 'Khodiyar Fabricator', salesRef: 'JP', product: 'ONGC', size: '900 MM', capacity: 'C250', colour: 'P. Green' },
  { day: 10, dateStr: '2026-08-10', weight: 4980, pcs: 112, freight: 11800, transporter: 'Khengar Bhai Logistics', vehicle: 'GJ27TB9338', driver: 'Khengar Bhai', customer: 'Aum Ceramics', salesRef: 'MTH', product: 'MHC', size: '600 × 600', capacity: 'C250', colour: 'Grey' },
  { day: 11, dateStr: '2026-08-11', weight: 10472, pcs: 236, freight: 24800, transporter: 'Ibrahim Bhai Transport', vehicle: 'GJ27TE8348', driver: 'Ibrahim Bhai', customer: 'Shreya Construction', salesRef: 'MTH', product: 'WGC', size: '450 × 600', capacity: 'B125', colour: 'Black' },
  { day: 12, dateStr: '2026-08-12', weight: 3950, pcs: 86, freight: 9400, transporter: 'Dipak Bhai Express', vehicle: 'GJ01TF0620', driver: 'Dipak Bhai', customer: 'Super Shaligram LLP', salesRef: 'MTH', product: 'MHC', size: '600 × 600', capacity: 'LD', colour: 'Grey' },
  { day: 13, dateStr: '2026-08-13', weight: 4230, pcs: 96, freight: 10000, transporter: 'Rajesh Bhai Carriers', vehicle: 'GJ36V5850', driver: 'Rajesh Bhai', customer: 'Rainbirds Buildcon LLP', salesRef: 'RT', product: 'MHC', size: '600 × 600', capacity: 'LD', colour: 'Grey' },
  { day: 15, dateStr: '2026-08-15', weight: 9839, pcs: 221, freight: 23400, transporter: 'Dipak Bhai Express', vehicle: 'GJ01TF0620', driver: 'Dipak Bhai', customer: 'Padma Engineer', salesRef: 'MTH', product: 'MHC', size: '600 × 600', capacity: 'C250', colour: 'Grey' },
  { day: 17, dateStr: '2026-08-17', weight: 4560, pcs: 102, freight: 10800, transporter: 'Rajesh Bhai Carriers', vehicle: 'GJ36V5850', driver: 'Rajesh Bhai', customer: 'Midas Infracon Private Ltd', salesRef: 'MTH', product: 'ONGC', size: '900 MM', capacity: 'C250', colour: 'Grey' },
  { day: 18, dateStr: '2026-08-18', weight: 7977, pcs: 178, freight: 18900, transporter: 'Khengar Bhai Logistics', vehicle: 'GJ27U9661', driver: 'Khengar Bhai', customer: 'Tasneem Enterprise', salesRef: 'MTH', product: 'MHC', size: '600 × 600', capacity: 'LD', colour: 'Grey' },
  { day: 19, dateStr: '2026-08-19', weight: 3620, pcs: 80, freight: 8600, transporter: 'Ibrahim Bhai Transport', vehicle: 'GJ27TE8348', driver: 'Ibrahim Bhai', customer: 'Khodiyar Fabricator', salesRef: 'RS', product: 'ONGC', size: '900 MM', capacity: 'C250', colour: 'P. Green' },
  { day: 21, dateStr: '2026-08-21', weight: 4310, pcs: 95, freight: 10200, transporter: 'Dipak Bhai Express', vehicle: 'GJ01TF0620', driver: 'Dipak Bhai', customer: 'Vastu Nirman Buildcon', salesRef: 'TG', product: 'MHC', size: '600 × 600', capacity: 'LD', colour: 'Grey' },
  { day: 22, dateStr: '2026-08-22', weight: 3890, pcs: 88, freight: 9200, transporter: 'Dipak Bhai Express', vehicle: 'GJ01TF0620', driver: 'Dipak Bhai', customer: 'Parmi Sales', salesRef: 'MTH', product: 'WGC', size: '450 × 600', capacity: 'B125', colour: 'Black' },
  { day: 24, dateStr: '2026-08-24', weight: 16741, pcs: 375, freight: 39500, transporter: 'Khengar Bhai Logistics', vehicle: 'GJ27TB9338', driver: 'Khengar Bhai', customer: 'Larsen & Toubro Ltd', salesRef: 'MTH', product: 'MHC', size: '600 × 600', capacity: 'C250', colour: 'Grey' },
  { day: 25, dateStr: '2026-08-25', weight: 4420, pcs: 98, freight: 10500, transporter: 'Ibrahim Bhai Transport', vehicle: 'GJ27TE8348', driver: 'Ibrahim Bhai', customer: 'Super Shaligram LLP', salesRef: 'MTH', product: 'MHC', size: '600 × 600', capacity: 'C250', colour: 'Grey' },
  { day: 26, dateStr: '2026-08-26', weight: 3780, pcs: 84, freight: 9000, transporter: 'Ibrahim Bhai Transport', vehicle: 'GJ27TJ2274', driver: 'Ibrahim Bhai', customer: 'Nest Infracon', salesRef: 'GN', product: 'RCS', size: '1200 × 1200', capacity: 'D400', colour: 'Black' },
  { day: 28, dateStr: '2026-08-28', weight: 4180, pcs: 92, freight: 9900, transporter: 'Dipak Bhai Express', vehicle: 'GJ01TF0620', driver: 'Dipak Bhai', customer: 'Super Shaligram LLP', salesRef: 'MTH', product: 'MHC', size: '600 × 600', capacity: 'C250', colour: 'Grey' },
  { day: 29, dateStr: '2026-08-29', weight: 3771.4, pcs: 69, freight: 8900, transporter: 'Dipak Bhai Express', vehicle: 'GJ01TF0620', driver: 'Dipak Bhai', customer: 'Suvidha Construction', salesRef: 'MK', product: 'D MHC', size: '600 × 600', capacity: 'LD', colour: 'Grey' }
];

async function seedDatabase(config) {
  console.log(`\n======================================================`);
  console.log(` SEEDING AUGUST 2026 DISPATCH DATA INTO: ${config.name}`);
  console.log(`======================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    const company = await prisma.company.findFirst();
    if (!company) {
      console.log('❌ No company found.');
      return;
    }

    const defaultUser = await prisma.user.findFirst();

    // Map sales references to user or default
    const salesMap = {};
    const salesRefs = ['MTH', 'TL', 'JP', 'RT', 'RS', 'TG', 'GN', 'MK'];
    for (const ref of salesRefs) {
      let user = await prisma.user.findFirst({
        where: { name: { contains: ref, mode: 'insensitive' } }
      });
      if (!user) {
        user = defaultUser;
      }
      salesMap[ref] = user.id;
    }

    let createdCount = 0;
    let totalWeightSeeded = 0;
    let totalFreightSeeded = 0;
    let totalPcsSeeded = 0;

    for (let i = 0; i < AUGUST_DAYS.length; i++) {
      const d = AUGUST_DAYS[i];
      const dNum = `DISP-2026-AUG-${String(i + 1).padStart(3, '0')}`;
      const soNum = `HCPPL/2627/AUG-${String(i + 1).padStart(3, '0')}`;
      const dDate = new Date(`${d.dateStr}T11:00:00.000Z`);

      // 1. Ensure Customer
      let customer = await prisma.customer.findFirst({
        where: { companyName: { equals: d.customer, mode: 'insensitive' } }
      });
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            companyName: d.customer,
            customerCode: `CUST-AUG-${String(i + 1).padStart(3, '0')}`,
            companyId: company.id,
            contactPerson: 'Project Site Manager',
            phone: '9876543210',
            billingAddress: 'Gujarat, India',
            shippingAddress: 'Project Site, India',
            status: 'ACTIVE'
          }
        });
      }

      // 2. Ensure Product
      let product = await prisma.product.findFirst({
        where: { name: { contains: d.product, mode: 'insensitive' } }
      }) || await prisma.product.findFirst();

      // 3. Ensure SalesOrder
      let so = await prisma.salesOrder.findFirst({
        where: { orderNumber: soNum }
      });
      if (!so) {
        so = await prisma.salesOrder.create({
          data: {
            orderNumber: soNum,
            customerId: customer.id,
            salesExecutiveId: salesMap[d.salesRef] || defaultUser.id,
            createdById: defaultUser.id,
            status: 'CONFIRMED',
            subtotal: new Prisma.Decimal(d.weight * 50),
            discountAmount: new Prisma.Decimal(0),
            taxableAmount: new Prisma.Decimal(d.weight * 50),
            taxAmount: new Prisma.Decimal(d.weight * 9),
            freightAmount: new Prisma.Decimal(d.freight),
            totalAmount: new Prisma.Decimal(d.weight * 59 + d.freight),
            createdAt: dDate,
            items: {
              create: [
                {
                  productId: product.id,
                  productNameSnapshot: product.name,
                  specifications: {
                    size: d.size,
                    capacity: d.capacity,
                    colour: d.colour,
                    salesRef: d.salesRef
                  },
                  orderedQuantity: new Prisma.Decimal(d.pcs),
                  unit: 'NOS',
                  unitPrice: new Prisma.Decimal(50),
                  taxableAmount: new Prisma.Decimal(d.weight * 50),
                  taxAmount: new Prisma.Decimal(d.weight * 9),
                  lineTotal: new Prisma.Decimal(d.weight * 59)
                }
              ]
            }
          },
          include: { items: true }
        });
      }

      // 4. Upsert Dispatch
      let dispatch = await prisma.dispatch.findFirst({
        where: { dispatchNo: dNum }
      });

      const dispatchPayload = {
        dispatchNo: dNum,
        salesOrderId: so.id,
        dispatchCategory: 'D1',
        status: 'DELIVERED',
        isSubmitted: true,
        deliveryAddress: `${d.customer} Site, India`,
        packageCount: d.pcs,
        packageType: 'WOODEN_PALLET',
        totalWeight: new Prisma.Decimal(d.weight),
        transporterName: d.transporter,
        vehicleNumber: d.vehicle,
        vehicleType: 'TRUCK',
        driverName: d.driver,
        driverPhone: '9876543210',
        freightType: 'PAID',
        freightAmount: new Prisma.Decimal(d.freight),
        dispatchedAt: dDate,
        deliveredAt: dDate,
        createdAt: dDate,
        updatedAt: dDate
      };

      if (!dispatch) {
        dispatch = await prisma.dispatch.create({
          data: {
            ...dispatchPayload,
            items: {
              create: [
                {
                  salesOrderItemId: so.items[0].id,
                  quantity: new Prisma.Decimal(d.pcs)
                }
              ]
            }
          }
        });
        createdCount++;
      } else {
        await prisma.dispatch.update({
          where: { id: dispatch.id },
          data: dispatchPayload
        });
      }

      totalWeightSeeded += d.weight;
      totalFreightSeeded += d.freight;
      totalPcsSeeded += d.pcs;
    }

    console.log(`✅ Seeded ${AUGUST_DAYS.length} August 2026 dispatches into ${config.name}!`);
    console.log(`   - Total Pieces: ${totalPcsSeeded}`);
    console.log(`   - Total Weight: ${totalWeightSeeded.toFixed(2)} kg`);
    console.log(`   - Total Freight: ₹${totalFreightSeeded.toLocaleString()}`);
  } catch (err) {
    console.error(`❌ Error seeding ${config.name}:`, err);
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  for (const db of targetDbs) {
    await seedDatabase(db);
  }
}

run();
