const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const targetDbs = process.env.DATABASE_URL
  ? [{ name: 'Production Database', url: process.env.DATABASE_URL }]
  : [
      { name: 'Active DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
      { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
    ];

function parseCSV(content) {
  const result = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(cell.trim());
        cell = '';
      } else if (char === '\r' || char === '\n') {
        row.push(cell.trim());
        if (row.length > 1 || row[0] !== '') {
          result.push(row);
        }
        row = [];
        cell = '';
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
      } else {
        cell += char;
      }
    }
  }
  
  if (cell !== '' || row.length > 0) {
    row.push(cell.trim());
    result.push(row);
  }
  
  return result;
}

function parseCsvDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return new Date();
  const parts = dateStr.trim().split(/[-/]/);
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    const date = new Date(y, m, d, 10, 0, 0);
    if (!isNaN(date.getTime())) return date;
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

function parseAddressObj(addressStr, stateStr, cityStr, pinStr) {
  const line1 = (addressStr || 'Ahmedabad, Gujarat').trim().replace(/\r?\n/g, ' ');
  const city = (cityStr || 'Ahmedabad').trim();
  const state = (stateStr || 'Gujarat').trim();
  const pincode = (pinStr || '380001').trim();
  return {
    line1,
    city,
    state,
    pincode,
    country: 'India'
  };
}

function findProduct(prodType, prodSize, prodCap, allProducts) {
  const normType = (prodType || '').toUpperCase().trim();
  const normSize = (prodSize || '').toUpperCase().trim().replace(/MM/g, '').trim();
  const normCap = (prodCap || '').toUpperCase().trim();

  // Try exact match
  let matched = allProducts.find(p => {
    const pName = (p.name || '').toUpperCase();
    const pSku = (p.sku || '').toUpperCase();
    const matchType = pName.includes(normType) || pSku.includes(normType);
    const matchSize = normSize && (pName.includes(normSize) || pSku.includes(normSize));
    return matchType && matchSize;
  });

  if (matched) return matched;

  // Try type match
  matched = allProducts.find(p => {
    const pName = (p.name || '').toUpperCase();
    return pName.includes(normType);
  });

  return matched || allProducts[0];
}

async function alignDatabaseColumns(prisma) {
  const statements = [
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "salesExecutiveId" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "detailedItems" JSONB;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "gstName" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "groupName" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "projectName" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "leadDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "nextReminder" TIMESTAMP(3);`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "notes" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "unit" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "assignedToId" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "estimatedQuantity" DECIMAL(65,30);`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "lostAt" TIMESTAMP(3);`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "lostReason" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "lostComplaintId" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "wonAt" TIMESTAMP(3);`,
    `ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "nextReminder" TIMESTAMP(3);`,
    `ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "salesExecutiveId" TEXT;`,
    `ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "companyId" TEXT;`,
    `ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "lostReason" TEXT;`,
    `ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "lostAt" TIMESTAMP(3);`,
    `ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "paymentTerms" TEXT;`,
    `ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "paymentTermDays" INT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "nextReminder" TIMESTAMP(3);`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "sourceQuotationId" TEXT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "salesExecutiveId" TEXT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentTerms" TEXT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentTermDays" INT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentTermStartDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentDueDate" TIMESTAMP(3);`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentTermsDays" INT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paidAmount" DECIMAL(18,2) DEFAULT 0;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "outstandingAmount" DECIMAL(18,2);`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'PENDING';`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "deliveryTerms" TEXT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'INR';`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "freightAmount" DECIMAL(18,2) DEFAULT 0;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "lostReason" TEXT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "lostAt" TIMESTAMP(3);`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "lostComplaintId" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "size" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "capacity" TEXT;`,
    `ALTER TABLE "ProductionPlan" ADD COLUMN IF NOT EXISTS "priority" TEXT DEFAULT 'NORMAL';`,
    `ALTER TABLE "ProductionPlan" ADD COLUMN IF NOT EXISTS "productionLine" TEXT;`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "productionStatus" TEXT DEFAULT 'READY_FOR_DISPATCH';`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "qcResult" TEXT;`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "qcRemarks" TEXT;`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "startedById" TEXT;`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "completedById" TEXT;`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3);`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "productionEndTime" TIMESTAMP(3);`,
    `ALTER TABLE "WorkOrder" ADD COLUMN IF NOT EXISTS "qcTimestamp" TIMESTAMP(3);`,
    `ALTER TABLE "QCInspection" ADD COLUMN IF NOT EXISTS "approvedQuantity" DECIMAL(18,3);`,
    `ALTER TABLE "QCInspection" ADD COLUMN IF NOT EXISTS "rejectedQuantity" DECIMAL(18,3);`,
    `ALTER TABLE "QCInspection" ADD COLUMN IF NOT EXISTS "remarks" TEXT;`,
    `ALTER TABLE "QCInspection" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);`,
    `ALTER TABLE "QCInspection" ADD COLUMN IF NOT EXISTS "inspectorId" TEXT;`
  ];

  for (const query of statements) {
    try {
      await prisma.$executeRawUnsafe(query);
    } catch (e) {}
  }
}

async function syncSales1Database(config) {
  console.log(`\n======================================================================`);
  console.log(`SYNCHRONIZING SALES 1 (sales1@himalayaerp.com): ${config.name}`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    await alignDatabaseColumns(prisma);

    // 1. Locate CSV file
    const possiblePaths = [
      path.join(__dirname, '..', '..', 'JP_data(sales6) (1).csv'),
      path.join(__dirname, 'JP_data(sales6) (1).csv'),
      path.join(process.cwd(), 'JP_data(sales6) (1).csv'),
      path.join(process.cwd(), 'scripts', 'JP_data(sales6) (1).csv'),
      path.join(process.cwd(), 'backend', 'scripts', 'JP_data(sales6) (1).csv'),
      '/app/JP_data(sales6) (1).csv',
      '/app/scripts/JP_data(sales6) (1).csv'
    ];

    let csvPath = possiblePaths.find(p => fs.existsSync(p));
    if (!csvPath) {
      throw new Error(`CSV file JP_data(sales6) (1).csv could not be found.`);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const rows = parseCSV(csvContent);
    const dataRows = rows.slice(1).filter(r => r.length > 5 && r[0]);
    console.log(`Loaded ${dataRows.length} item rows from Sales 1 CSV.`);

    // 2. Locate or Ensure Sales 1 User
    let sales1User = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'sales1@himalayaerp.com' },
          { name: { contains: 'Sales 1' } },
          { name: { contains: 'Sales One' } }
        ]
      },
      include: { role: true, company: true }
    });

    const company = await prisma.company.findFirst() || { id: 'default-company-id' };
    const salesRole = await prisma.role.findFirst({
      where: { OR: [{ code: 'SALES_REP' }, { code: 'SALES_EXECUTIVE' }, { name: 'Sales Executive' }] }
    });

    if (!sales1User) {
      console.log('Creating Sales 1 user in DB...');
      sales1User = await prisma.user.create({
        data: {
          publicId: `usr-sales1-${Date.now().toString().slice(-6)}`,
          email: 'sales1@himalayaerp.com',
          name: 'Sales One',
          password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xgn3LqjHdwWVvZV4ime', // 12345678
          roleId: salesRole?.id || '',
          companyId: company.id
        },
        include: { role: true, company: true }
      });
    }

    const userId = sales1User.id;
    const companyId = sales1User.companyId || company.id;
    console.log(`Sales 1 User: ${sales1User.name} (${sales1User.email}), ID: ${userId}`);

    const allSales1Users = await prisma.user.findMany({
      where: {
        OR: [
          { email: 'sales1@himalayaerp.com' },
          { name: { contains: 'Sales 1' } },
          { name: { contains: 'Sales One' } }
        ]
      }
    });
    const allSales1UserIds = allSales1Users.map(u => u.id);

    // 3. Locate or Ensure Plant Head User for assignments
    const plantHeadUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'planthead@himalayaerp.com' },
          { role: { code: 'PLANT_HEAD' } },
          { role: { name: 'Plant Head' } }
        ]
      }
    }) || sales1User;

    // 4. Locate Workflow States
    const leadWonState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'LEAD' }, name: { contains: 'Won', mode: 'insensitive' } } });
    const quoteApprovedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'QUOTATION' }, name: { contains: 'Approved', mode: 'insensitive' } } });
    const orderConfirmedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'SALES_ORDER' }, name: { contains: 'Confirmed', mode: 'insensitive' } } });
    const prodReleasedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'PRODUCTION_PLAN' }, name: { contains: 'Released', mode: 'insensitive' } } }) ||
                              await prisma.workflowState.findFirst({ where: { workflow: { code: 'PRODUCTION_PLAN' }, name: { contains: 'In Progress', mode: 'insensitive' } } }) ||
                              await prisma.workflowState.findFirst({ where: { workflow: { code: 'PRODUCTION_PLAN' }, name: { contains: 'Completed', mode: 'insensitive' } } });

    // 5. Clean existing Sales 1 records cleanly (preserving SuperSales 1 & 2 intact)
    console.log('Cleaning existing Sales 1 records (SuperSales 1 & 2 remain untouched)...');
    const existingSales1Orders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { salesExecutiveId: { in: allSales1UserIds } },
          { createdById: { in: allSales1UserIds } },
          { orderNumber: { gte: 'HCPPL/2627/0168', lte: 'HCPPL/2627/0300' } },
          { remarks: { contains: 'Sales 1', mode: 'insensitive' } }
        ]
      },
      select: { id: true }
    });
    const existingOrderIds = existingSales1Orders.map(o => o.id);

    if (existingOrderIds.length > 0) {
      const orderItems = await prisma.salesOrderItem.findMany({ where: { salesOrderId: { in: existingOrderIds } }, select: { id: true } });
      const orderItemIds = orderItems.map(x => x.id);

      const dispatches = await prisma.dispatch.findMany({ where: { salesOrderId: { in: existingOrderIds } }, select: { id: true } });
      const dispatchIds = dispatches.map(d => d.id);

      const invoices = await prisma.salesInvoice.findMany({ where: { salesOrderId: { in: existingOrderIds } }, select: { id: true } });
      const invoiceIds = invoices.map(i => i.id);

      const existingPlans = await prisma.productionPlan.findMany({
        where: { salesOrderId: { in: existingOrderIds } },
        select: { id: true }
      });
      const planIds = existingPlans.map(p => p.id);

      const existingWOs = await prisma.workOrder.findMany({
        where: { OR: [{ productionPlanId: { in: planIds } }, { salesOrderItemId: { in: orderItemIds } }] },
        select: { id: true }
      });
      const woIds = existingWOs.map(w => w.id);

      try { await prisma.customerPaymentAllocation.deleteMany({ where: { salesOrderId: { in: existingOrderIds } } }); } catch (e) {}
      try { await prisma.paymentAllocation.deleteMany({ where: { invoiceId: { in: invoiceIds } } }); } catch (e) {}
      try { await prisma.invoiceItem.deleteMany({ where: { invoiceId: { in: invoiceIds } } }); } catch (e) {}
      try { await prisma.salesInvoice.deleteMany({ where: { id: { in: invoiceIds } } }); } catch (e) {}

      try { await prisma.dispatchItem.deleteMany({ where: { dispatchId: { in: dispatchIds } } }); } catch (e) {}
      try { await prisma.dispatch.deleteMany({ where: { id: { in: dispatchIds } } }); } catch (e) {}

      try { await prisma.finishedGoods.deleteMany({ where: { OR: [{ workOrderId: { in: woIds } }, { salesOrderId: { in: existingOrderIds } }] } }); } catch (e) {}
      try { await prisma.qCInspection.deleteMany({ where: { workOrderId: { in: woIds } } }); } catch (e) {}
      try { await prisma.productionBatch.deleteMany({ where: { workOrderId: { in: woIds } } }); } catch (e) {}
      try { await prisma.productionShiftEntry.deleteMany({ where: { workOrderId: { in: woIds } } }); } catch (e) {}
      try { await prisma.productionScrapEntry.deleteMany({ where: { workOrderId: { in: woIds } } }); } catch (e) {}
      try { await prisma.productionStatusHistory.deleteMany({ where: { workOrderId: { in: woIds } } }); } catch (e) {}
      try { await prisma.workOrder.deleteMany({ where: { id: { in: woIds } } }); } catch (e) {}
      try { await prisma.productionPlan.deleteMany({ where: { id: { in: planIds } } }); } catch (e) {}

      try { await prisma.salesOrderAllocation.deleteMany({ where: { salesOrderId: { in: existingOrderIds } } }); } catch (e) {}
      try { await prisma.salesOrderCreditReview.deleteMany({ where: { salesOrderId: { in: existingOrderIds } } }); } catch (e) {}
      try { await prisma.salesOrderLoss.deleteMany({ where: { salesOrderId: { in: existingOrderIds } } }); } catch (e) {}
      try { await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: { in: existingOrderIds } } }); } catch (e) {}
      try { await prisma.salesOrder.deleteMany({ where: { id: { in: existingOrderIds } } }); } catch (e) {}
    }

    try {
      await prisma.quotationItem.deleteMany({
        where: { quotation: { OR: [{ createdById: { in: allSales1UserIds } }, { salesExecutiveId: { in: allSales1UserIds } }, { quotationNumber: { gte: 'QT/2627/0168', lte: 'QT/2627/0300' } }] } }
      });
      await prisma.quotation.deleteMany({
        where: { OR: [{ createdById: { in: allSales1UserIds } }, { salesExecutiveId: { in: allSales1UserIds } }, { quotationNumber: { gte: 'QT/2627/0168', lte: 'QT/2627/0300' } }] }
      });
    } catch (e) {}

    try {
      await prisma.lead.deleteMany({
        where: { OR: [{ createdById: { in: allSales1UserIds } }, { salesExecutiveId: { in: allSales1UserIds } }, { leadNumber: { gte: 'LD/2627/0168', lte: 'LD/2627/0300' } }] }
      });
    } catch (e) {}

    console.log('Existing Sales 1 records wiped cleanly. (SuperSales 1 & 2 preserved intact)');

    // 6. Group items into distinct transactions
    const groups = [];
    let currentGroup = null;

    for (let i = 0; i < dataRows.length; i++) {
      const r = dataRows[i];
      const date = (r[0] || '').trim();
      const proj = (r[1] || '').trim();
      const grp = (r[2] || '').trim();
      const gstName = (r[3] || '').trim();
      const phone = (r[6] || '').trim();
      const key = `${date}|${proj}|${grp}|${gstName}|${phone}`;

      if (!currentGroup || currentGroup.key !== key) {
        currentGroup = {
          index: groups.length + 1,
          key,
          date,
          projectName: proj,
          groupName: grp,
          gstName: gstName,
          gstNo: (r[4] || '').trim(),
          incharge: (r[5] || '').trim(),
          phone: phone,
          email: (r[8] || '').trim() || 'info@thehimalaya.co.in',
          addressStr: r[11],
          stateStr: r[12],
          cityStr: r[13],
          pincodeStr: r[14],
          items: []
        };
        groups.push(currentGroup);
      }

      currentGroup.items.push(r);
    }

    console.log(`Processing ${groups.length} distinct grouped transactions for Sales 1...`);

    // 7. Load Master Products
    const allProducts = await prisma.product.findMany();
    let defaultProduct = allProducts[0];
    if (!defaultProduct) {
      defaultProduct = await prisma.product.create({
        data: {
          publicId: `prod-frp-default`,
          name: 'HIMALAYA FRP Standard Manhole Cover',
          sku: 'FRP-STD-01',
          code: 'FRP-STD-01',
          unit: 'SET',
          basePrice: new Prisma.Decimal(2500),
          companyId
        }
      });
    }

    let totalWorkOrdersCount = 0;

    for (let idx = 0; idx < groups.length; idx++) {
      const g = groups[idx];
      // Sales 1 sequence starts right after SuperSales 2 (167 + idx + 1) -> 0168
      const seqStr = String(167 + idx + 1).padStart(4, '0');
      const leadDateObj = parseCsvDate(g.date);
      const parsedAddr = parseAddressObj(g.addressStr, g.stateStr, g.cityStr, g.pincodeStr);

      const customerName = g.gstName || g.projectName || g.groupName || `Customer S1-${idx + 1}`;
      const gstinVal = (g.gstNo && g.gstNo !== 'URD') ? g.gstNo : null;

      // A. Upsert Customer
      let customer = null;
      if (gstinVal) {
        customer = await prisma.customer.findFirst({
          where: { companyId, gstin: gstinVal }
        });
      }
      if (!customer) {
        customer = await prisma.customer.findFirst({
          where: {
            companyId,
            companyName: { equals: customerName, mode: 'insensitive' }
          }
        });
      }

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            customerCode: `CUST-S1-${seqStr}`,
            companyName: customerName,
            contactPerson: g.incharge || 'Site Incharge',
            phone: g.phone || '9999999999',
            email: g.email || 'info@thehimalaya.co.in',
            gstin: gstinVal,
            status: 'ACTIVE',
            billingAddress: parsedAddr,
            shippingAddress: parsedAddr,
            createdById: userId,
            companyId
          }
        });
      }

      // Calculate totals for items
      let subTotal = 0;
      let totalTax = 0;
      let grandTotal = 0;
      let totalQty = 0;

      const groupItemsData = g.items.map(it => {
        const prodType = it[15];
        const prodSize = it[16];
        const prodCap = it[17];
        const qty = parseFloat(it[18]) || 1;
        const spec = it[19] || 'GREY';
        const unitPrice = parseFloat(it[20]) || 1000;
        const itemSubTotal = parseFloat(it[21]) || (qty * unitPrice);
        const itemGstAmt = parseFloat(it[23]) || (itemSubTotal * 0.18);
        const itemGrand = parseFloat(it[25]) || (itemSubTotal + itemGstAmt);

        totalQty += qty;
        subTotal += itemSubTotal;
        totalTax += itemGstAmt;
        grandTotal += itemGrand;

        const matchedProd = findProduct(prodType, prodSize, prodCap, allProducts) || defaultProduct;

        return {
          product: matchedProd,
          prodType,
          prodSize,
          prodCap,
          qty,
          spec,
          unitPrice,
          itemSubTotal,
          itemGstAmt,
          itemGrand,
          specifications: {
            size: prodSize || '',
            capacity: prodCap || '',
            color: spec,
            specification: spec
          }
        };
      });

      const primaryProduct = groupItemsData[0]?.product;
      const productInterestStr = `${primaryProduct?.name || 'FRP Products'} (${totalQty} Qty)`;

      // B. Create Lead (1:1) in sequence LD/2627/0168...
      const leadNumber = `LD/2627/${seqStr}`;
      const createdLead = await prisma.lead.create({
        data: {
          leadNumber,
          leadDate: leadDateObj,
          companyName: customer.companyName,
          groupName: g.groupName || g.projectName,
          projectName: g.projectName,
          contactPerson: g.incharge || customer.contactPerson,
          phone: g.phone || customer.phone,
          email: g.email || customer.email,
          gstName: g.gstName || customer.companyName,
          gstNumber: gstinVal,
          address: parsedAddr,
          source: 'OTHER',
          productInterest: productInterestStr,
          detailedItems: groupItemsData.map(gi => ({
            productName: `${gi.product.name} ${gi.prodSize} ${gi.prodCap}`.trim(),
            sku: gi.product.sku,
            quantity: gi.qty,
            rate: gi.unitPrice,
            amount: gi.itemSubTotal
          })),
          estimatedQuantity: new Prisma.Decimal(totalQty),
          unit: 'SET',
          workflowStateId: leadWonState?.id || null,
          assignedToId: userId,
          salesExecutiveId: userId,
          createdById: userId,
          companyId,
          customerId: customer.id,
          convertedCustomerId: customer.id,
          convertedAt: leadDateObj,
          convertedById: userId,
          remarks: 'Imported from Sales 1 CSV (JP)',
          version: 1,
          createdAt: leadDateObj
        }
      });

      // C. Create Quotation (1:1) in sequence QT/2627/0168...
      const quotationNumber = `QT/2627/${seqStr}`;
      const createdQuote = await prisma.quotation.create({
        data: {
          quotationNumber,
          companyId,
          customerId: customer.id,
          leadId: createdLead.id,
          salesExecutiveId: userId,
          createdById: userId,
          approvedById: userId,
          approvedAt: leadDateObj,
          validUntil: new Date(leadDateObj.getTime() + 30 * 24 * 60 * 60 * 1000),
          subtotal: new Prisma.Decimal(subTotal),
          discount: new Prisma.Decimal(0),
          tax: new Prisma.Decimal(totalTax),
          total: new Prisma.Decimal(grandTotal),
          expectedTransportationCost: new Prisma.Decimal(0),
          workflowStateId: quoteApprovedState?.id || null,
          paymentTerms: 'Payment on delivery',
          remarks: 'Approved Quotation from Sales 1',
          version: 1,
          createdAt: leadDateObj,
          items: {
            create: groupItemsData.map(gi => ({
              productId: gi.product.id,
              description: `${gi.product.name} ${gi.prodSize} ${gi.prodCap}`.trim(),
              quantity: new Prisma.Decimal(gi.qty),
              unitPrice: new Prisma.Decimal(gi.unitPrice),
              tax: new Prisma.Decimal(18),
              discount: new Prisma.Decimal(0),
              lineTotal: new Prisma.Decimal(gi.itemGrand)
            }))
          }
        }
      });

      // D. Create Sales Order (1:1) in sequence HCPPL/2627/0168...
      const orderNumber = `HCPPL/2627/${seqStr}`;
      const createdOrder = await prisma.salesOrder.create({
        data: {
          orderNumber,
          customerId: customer.id,
          quotationId: createdQuote.id,
          sourceQuotationId: createdQuote.id,
          salesExecutiveId: userId,
          createdById: userId,
          orderDate: leadDateObj,
          status: 'CONFIRMED',
          workflowStateId: orderConfirmedState?.id || null,
          confirmedAt: leadDateObj,
          subtotal: new Prisma.Decimal(subTotal),
          taxableAmount: new Prisma.Decimal(subTotal),
          discountAmount: new Prisma.Decimal(0),
          taxAmount: new Prisma.Decimal(totalTax),
          freightAmount: new Prisma.Decimal(0),
          totalAmount: new Prisma.Decimal(grandTotal),
          currency: 'INR',
          paidAmount: new Prisma.Decimal(0),
          outstandingAmount: new Prisma.Decimal(grandTotal),
          paymentStatus: 'PENDING',
          billingAddress: parsedAddr,
          shippingAddress: parsedAddr,
          remarks: 'Imported from Sales 1 CSV (JP) - Ready for Dispatch',
          version: 1,
          createdAt: leadDateObj,
          items: {
            create: groupItemsData.map(gi => ({
              productId: gi.product.id,
              productNameSnapshot: `${gi.product.name} ${gi.prodSize} ${gi.prodCap}`.trim(),
              productCodeSnapshot: gi.product.sku,
              orderedQuantity: new Prisma.Decimal(gi.qty),
              unitPrice: new Prisma.Decimal(gi.unitPrice),
              discountAmount: new Prisma.Decimal(0),
              taxableAmount: new Prisma.Decimal(gi.itemSubTotal),
              taxRate: new Prisma.Decimal(18),
              taxAmount: new Prisma.Decimal(gi.itemGstAmt),
              lineTotal: new Prisma.Decimal(gi.itemGrand),
              unit: 'SET',
              createdAt: leadDateObj
            }))
          }
        },
        include: { items: true }
      });

      // E. Production Plan in sequence PLAN/2627/0168...
      const planNumber = `PLAN/2627/${seqStr}`;
      const createdPlan = await prisma.productionPlan.create({
        data: {
          planNumber,
          salesOrderId: createdOrder.id,
          assignedToId: plantHeadUser.id,
          status: 'RELEASED',
          priority: 'NORMAL',
          plannedStartDate: leadDateObj,
          plannedEndDate: new Date(leadDateObj.getTime() + 3 * 24 * 60 * 60 * 1000),
          productionLine: 'Main FRP Molding Line',
          workflowStateId: prodReleasedState?.id || null,
          version: 1,
          createdAt: leadDateObj
        }
      });

      // F. Work Orders in sequence WO/2627/0368... (passed QC -> READY_FOR_DISPATCH)
      for (let itemIdx = 0; itemIdx < createdOrder.items.length; itemIdx++) {
        const orderItem = createdOrder.items[itemIdx];
        const woSeqStr = String(367 + (++totalWorkOrdersCount)).padStart(4, '0');
        const workOrderNumber = `WO/2627/${woSeqStr}`;

        const createdWO = await prisma.workOrder.create({
          data: {
            workOrderNumber,
            productionPlanId: createdPlan.id,
            salesOrderItemId: orderItem.id,
            quantity: orderItem.orderedQuantity,
            status: 'COMPLETED',
            productionStatus: 'READY_FOR_DISPATCH',
            qcResult: 'PASS',
            qcRemarks: 'Technical QC Passed - Verified Dimensions & Load Rating',
            qcTimestamp: leadDateObj,
            completedAt: leadDateObj,
            productionEndTime: leadDateObj,
            createdById: plantHeadUser.id,
            version: 1,
            createdAt: leadDateObj
          }
        });

        // Create Production Batch
        const batchNumber = `BATCH/2627/${woSeqStr}`;
        await prisma.productionBatch.create({
          data: {
            batchNumber,
            workOrderId: createdWO.id,
            quantity: orderItem.orderedQuantity,
            createdAt: leadDateObj
          }
        });

        // Create QC Inspection (PASSED)
        await prisma.qCInspection.create({
          data: {
            workOrderId: createdWO.id,
            status: 'PASSED',
            remarks: '100% Passed Technical QC Sheet Inspection (Dimension, Finish, Load Rating OK)',
            approvedAt: leadDateObj
          }
        });
      }
    }

    console.log(`\n======================================================================`);
    console.log(`SYNC FINISHED FOR Sales 1 (${config.name})`);
    console.log(`======================================================================`);
    console.log(`Total Leads Created (WON)               : ${groups.length}`);
    console.log(`Total Quotations Created (APPROVED)     : ${groups.length}`);
    console.log(`Total Sales Orders Created (CONFIRMED)  : ${groups.length}`);
    console.log(`Total Production Plans (To Plant Head)  : ${groups.length}`);
    console.log(`Total Work Orders Generated (READY DISPATCH): ${totalWorkOrdersCount}`);

  } catch (err) {
    console.error(`Error syncing ${config.name}:`, err);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const cfg of targetDbs) {
    await syncSales1Database(cfg);
  }
}

main();
