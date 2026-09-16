import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function calculateFiscalQuarter(date: Date): string {
  const d = new Date(date);
  const month = d.getMonth(); // 0-11: 0=Jan, 3=Apr
  const year = d.getFullYear();
  let qNum: number;
  let startYear: number;
  let endYear: number;

  if (month >= 3 && month <= 5) {
    qNum = 1;
    startYear = year;
    endYear = year + 1;
  } else if (month >= 6 && month <= 8) {
    qNum = 2;
    startYear = year;
    endYear = year + 1;
  } else if (month >= 9 && month <= 11) {
    qNum = 3;
    startYear = year;
    endYear = year + 1;
  } else {
    qNum = 4;
    startYear = year - 1;
    endYear = year;
  }
  const endShort = String(endYear).slice(-2);
  return `Q${qNum}-${startYear}/${endShort}`;
}

async function main() {
  console.log('--- SEEDING BACK OFFICE LOCAL DATA (SAFE & ADDITIVE) ---');

  // 1. Ensure Back Office User
  const email = 'backoffice@himalayaerp.com';
  let boUser = await prisma.user.findUnique({ where: { email } });

  const boRole = await prisma.role.findFirst({
    where: { OR: [{ code: 'BACK_OFFICE' }, { name: 'Back Office' }] }
  });

  if (!boRole) {
    throw new Error('BACK_OFFICE role missing in database');
  }

  const company = await prisma.company.findFirst();
  if (!company) {
    throw new Error('No company found in database');
  }

  if (!boUser) {
    const hashedPassword = await bcrypt.hash('ARHIMALAYA12', 10);
    boUser = await prisma.user.create({
      data: {
        publicId: 'USR-BACKOFFICE-LOCAL',
        email,
        password: hashedPassword,
        name: 'Back Office Executive',
        roleId: boRole.id,
        companyId: company.id,
        isActive: true,
      },
    });
    console.log('Created local back-office user:', boUser.email);
  } else {
    console.log('Local back-office user already exists:', boUser.email);
  }

  // 2. Fetch real ERP Sales Orders & Customers
  const orders = await prisma.salesOrder.findMany({
    include: {
      customer: true,
      salesExecutive: true,
      dispatches: true,
      items: true
    },
    orderBy: { orderDate: 'asc' }
  });

  console.log(`Found ${orders.length} real ERP sales orders to seed reporting sheets.`);

  // Clean only BackOfficeArInvoice (this is our new additive reporting table)
  await prisma.backOfficeArInvoice.deleteMany();
  console.log('Reset BackOfficeArInvoice table for clean local seeding.');

  const applInvoices: any[] = [];
  const hcpplInvoices: any[] = [];

  let applSr = 1;
  let hcpplSr = 1;

  const now = new Date();

  // Distribute real orders into APPL and HCPPL
  // ~120 orders to APPL (invoice register), ~185 orders to HCPPL (summary matrices)
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const cust = order.customer;
    const exec = order.salesExecutive;

    const companyName = cust?.companyName || 'Apex Infrastructure Pvt Ltd';
    const city = (cust?.shippingAddress as any)?.city || (cust?.billingAddress as any)?.city || 'Ahmedabad';
    const siteName = (cust?.shippingAddress as any)?.line1 ? (cust?.shippingAddress as any).line1.split(',')[0] : `${companyName} Project Site`;
    const salesPerson = exec?.name?.replace('SuperSales ', 'SS') || cust?.contactPerson || 'RT';

    // Distribute across FY 26-27 quarters for realistic reporting:
    // Q1: Apr-Jun 2026, Q2: Jul-Sep 2026, Q3: Oct-Dec 2026, Q4: Jan-Mar 2027
    let orderDate = new Date(order.orderDate);
    // Ensure all seed reporting records fall within FY 2026/27
    const quarterMod = i % 4;
    if (quarterMod === 0) {
      // Q1: May 2026
      orderDate = new Date(2026, 4, 10 + (i % 15));
    } else if (quarterMod === 1) {
      // Q2: Aug 2026
      orderDate = new Date(2026, 7, 5 + (i % 20));
    } else if (quarterMod === 2) {
      // Q3: Nov 2026
      orderDate = new Date(2026, 10, 8 + (i % 18));
    } else {
      // Q4: Feb 2027
      orderDate = new Date(2027, 1, 12 + (i % 14));
    }

    const quarter = calculateFiscalQuarter(orderDate);

    // Give termDays variation (15, 30, 45, 60, 90) to populate all 7 ageing buckets
    const termChoices = [15, 30, 45, 60, 90];
    const termDays = termChoices[i % termChoices.length];
    const dueDate = new Date(orderDate.getTime() + termDays * 24 * 60 * 60 * 1000);

    const basicAmount = Number(order.subtotal) || 25000;
    const invoiceAmount = Number(order.totalAmount) || Math.round(basicAmount * 1.18);

    // Seed APPL Register (first ~120 orders)
    if (i < 120) {
      // Set status variations: Paid (25%), Partial (20%), Unpaid (45%), RT (10%)
      let status = 'UNPAID';
      let amtRcvd = 0;
      let amtRcvdDate: Date | null = null;
      let completePaymentDate: Date | null = null;
      let salesType = 'Regular';

      if (i % 10 === 0) {
        status = 'RT';
        salesType = 'RT';
        amtRcvd = Math.round(invoiceAmount * 0.9); // 10% retention remaining
        amtRcvdDate = new Date(orderDate.getTime() + 15 * 24 * 60 * 60 * 1000);
      } else if (i % 4 === 0) {
        status = 'PAID';
        amtRcvd = invoiceAmount;
        amtRcvdDate = new Date(dueDate.getTime() - 2 * 24 * 60 * 60 * 1000);
        completePaymentDate = amtRcvdDate;
      } else if (i % 3 === 0) {
        status = 'PARTIAL';
        amtRcvd = Math.round(invoiceAmount * 0.5);
        amtRcvdDate = new Date(orderDate.getTime() + 10 * 24 * 60 * 60 * 1000);
      } else {
        status = 'UNPAID';
        amtRcvd = 0;
      }

      const outstanding = Number((invoiceAmount - amtRcvd).toFixed(2));
      const invoiceNumber = `APPL/2627/${String(applSr).padStart(4, '0')}`;

      applInvoices.push({
        entity: 'APPL',
        srNo: applSr++,
        invoiceNumber,
        invoiceDate: orderDate,
        basicAmount: basicAmount.toFixed(2),
        invoiceAmount: invoiceAmount.toFixed(2),
        companyName,
        siteName,
        city,
        salesType,
        salesPerson,
        paymentTermDays: termDays,
        dueDate,
        status,
        amtRcvd: amtRcvd.toFixed(2),
        amtRcvdDate,
        completePaymentDate,
        outstanding: outstanding.toFixed(2),
        remarks: order.remarks || (status === 'RT' ? 'Retention payment pending inspection' : 'Commercial invoice'),
        quarter,
      });
    }

    // Seed HCPPL (all orders from index 50 onwards, so ~255 records with wide quarter/ageing spread)
    if (i >= 50) {
      const isRt = (i % 5 === 0);
      const status = isRt ? 'RT' : (i % 7 === 0 ? 'PARTIAL' : 'UNPAID');
      const salesType = isRt ? 'RT' : 'Regular';

      let amtRcvd = 0;
      if (status === 'PARTIAL') {
        amtRcvd = Math.round(invoiceAmount * 0.4);
      } else if (status === 'RT') {
        amtRcvd = Math.round(invoiceAmount * 0.85); // 15% RT balance
      }
      const outstanding = Number((invoiceAmount - amtRcvd).toFixed(2));
      const invoiceNumber = `HCPPL/2627/${String(hcpplSr).padStart(4, '0')}`;

      hcpplInvoices.push({
        entity: 'HCPPL',
        srNo: hcpplSr++,
        invoiceNumber,
        invoiceDate: orderDate,
        basicAmount: basicAmount.toFixed(2),
        invoiceAmount: invoiceAmount.toFixed(2),
        companyName,
        siteName,
        city,
        salesType,
        salesPerson,
        paymentTermDays: termDays,
        dueDate,
        status,
        amtRcvd: amtRcvd.toFixed(2),
        amtRcvdDate: amtRcvd > 0 ? new Date(orderDate.getTime() + 14 * 24 * 60 * 60 * 1000) : null,
        completePaymentDate: null,
        outstanding: outstanding.toFixed(2),
        remarks: isRt ? 'HCPPL Retention / RT Term' : 'Commercial credit overdue',
        quarter,
      });
    }
  }

  // Bulk insert
  for (const inv of applInvoices) {
    await prisma.backOfficeArInvoice.create({ data: inv });
  }
  console.log(`Seeded ${applInvoices.length} APPL invoice records into BackOfficeArInvoice.`);

  for (const inv of hcpplInvoices) {
    await prisma.backOfficeArInvoice.create({ data: inv });
  }
  console.log(`Seeded ${hcpplInvoices.length} HCPPL invoice records into BackOfficeArInvoice.`);

  console.log('--- BACK OFFICE LOCAL SEEDING COMPLETE ---');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
