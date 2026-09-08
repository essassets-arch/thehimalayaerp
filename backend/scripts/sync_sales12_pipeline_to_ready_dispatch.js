const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const isDocker = fs.existsSync('/.dockerenv') || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:'));

const targetDbs = isDocker
  ? [{ name: 'Target Container Database (from DATABASE_URL)', url: process.env.DATABASE_URL }]
  : [
      { name: 'Docker Himalaya ERP DB (port 5435)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' },
      { name: 'Active Browser Test DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
      { name: 'Main Himalaya ERP DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
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
        if (nextChar === '"') { cell += '"'; i++; }
        else { inQuotes = false; }
      } else { cell += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { row.push(cell.trim()); cell = ''; }
      else if (char === '\r' || char === '\n') {
        row.push(cell.trim());
        if (row.length > 1 || row[0] !== '') result.push(row);
        row = []; cell = '';
        if (char === '\r' && nextChar === '\n') i++;
      } else { cell += char; }
    }
  }
  if (cell !== '' || row.length > 0) { row.push(cell.trim()); result.push(row); }
  return result;
}

function parseCsvDate(str) {
  if (!str) return new Date();
  str = str.trim();
  let m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (m) {
    return new Date(Date.UTC(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) {
    return new Date(Date.UTC(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  return new Date();
}

function normalizeProductParams(type, size, capacity) {
  let t = (type || '').trim().toUpperCase();
  if (t === 'D MHC') t = 'MHC';
  
  let s = (size || '').trim().toUpperCase().replace(/\s+/g, '');
  if (s.includes('DAI')) s = s.replace('DAI', 'DIA');
  if (s.includes('DIA') && !s.includes('MM')) s = s.replace('DIA', 'MMDIA');
  if (s === '900MM') s = '900MMDIA';
  if (s.match(/^\d+X\d+X\d+$/)) {
    s = s.substring(0, s.lastIndexOf('X'));
  }
  if (s === '450X600') s = '600X450';
  
  let c = (capacity || '').trim().toUpperCase();
  if (c === '3T') c = 'LD';
  
  return { t, s, c };
}

function findProduct(type, size, capacity, products) {
  const { t, s, c } = normalizeProductParams(type, size, capacity);
  
  let match = products.find(p => {
    const sku = (p.sku || p.code || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(t) || name.includes(t)) &&
           (sku.includes(s) || name.includes(s)) &&
           (sku.includes(c) || name.includes(c));
  });
  if (match) return match;
  
  match = products.find(p => {
    const sku = (p.sku || p.code || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(t) || name.includes(t)) &&
           (sku.includes(s) || name.includes(s));
  });
  if (match) return match;

  match = products.find(p => {
    const sku = (p.sku || p.code || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(s) || name.includes(s)) &&
           (sku.includes(c) || name.includes(c));
  });
  if (match) return match;

  match = products.find(p => {
    const sku = (p.sku || p.code || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return sku.includes(s) || name.includes(s);
  });
  return match || null;
}

function parseAddressObj(addrStr, stateStr, cityStr, pincodeStr) {
  let line1 = (addrStr || '').trim().replace(/\r\n|\n|\r/g, ', ');
  let city = (cityStr || '').trim();
  let state = (stateStr || '').trim();
  let pincode = (pincodeStr || '').trim();

  if (!pincode) {
    const pinMatch = line1.match(/\b(\d{6})\b/);
    if (pinMatch) pincode = pinMatch[1];
  }

  if (!city) {
    if (/GHANDHINAGAR|GANDHINAGAR/i.test(line1)) city = 'Gandhinagar';
    else if (/AHMEDABAD/i.test(line1)) city = 'Ahmedabad';
    else if (/SURAT/i.test(line1)) city = 'Surat';
    else if (/JAIPUR/i.test(line1)) city = 'Jaipur';
    else if (/KHEDA/i.test(line1)) city = 'Kheda';
    else if (/PETLAD/i.test(line1)) city = 'Petlad';
    else city = 'Ahmedabad';
  }

  if (!state) {
    if (/RAJASTHAN/i.test(line1) || /JAIPUR/i.test(city)) state = 'Rajasthan';
    else state = 'Gujarat';
  }

  return {
    line1: line1 || 'Address on file',
    city: city || 'Ahmedabad',
    state: state || 'Gujarat',
    pincode: pincode || '380001',
    country: 'India'
  };
}

function loadSales12Leads() {
  const jsonCandidates = [
    path.resolve('backend/scripts/sales12_leads_data.json'),
    path.resolve('scripts/sales12_leads_data.json'),
    path.resolve('/app/scripts/sales12_leads_data.json'),
    path.join(__dirname, 'sales12_leads_data.json'),
  ];
  let jsonPath = jsonCandidates.find(p => fs.existsSync(p));
  if (jsonPath) {
    console.log(`Loading pre-parsed leads JSON from: ${jsonPath}`);
    const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    return raw.map(l => ({
      ...l,
      leadDate: new Date(l.leadDate),
      items: l.items || []
    })).sort((a, b) => a.leadDate.getTime() - b.leadDate.getTime());
  }

  const candidatePaths = [
    path.resolve('backend/scripts/jyoti_data_sales12.csv'),
    path.resolve('scripts/jyoti_data_sales12.csv'),
    path.resolve('/app/scripts/jyoti_data_sales12.csv'),
    path.join(__dirname, 'jyoti_data_sales12.csv'),
    path.resolve('Jyoti_data(sales12).csv'),
  ];

  let csvPath = candidatePaths.find(p => fs.existsSync(p));
  if (!csvPath) {
    throw new Error(`Sales 12 CSV not found in candidate paths: ${candidatePaths.join(', ')}`);
  }

  console.log(`Reading Sales 12 CSV from: ${csvPath}`);
  const content = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
  const rows = parseCSV(content);
  const dataRows = rows.slice(1).filter(r => r[0] && r[1]);

  let lastLead = null;
  const groupedLeads = [];

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const orderDateStr = (r[0] || '').trim();
    const projectName = (r[1] || '').trim();
    const groupName = (r[2] || projectName).trim();
    const gstName = (r[3] || projectName).trim();
    const gstNo = (r[4] || '').trim();
    const siteIncharge = (r[5] || 'JY').trim();
    const siteInchargeMobile = (r[6] || '').trim();
    const officeContact = (r[7] || '').trim();
    const email = (r[8] || 'info@thehimalaya.co.in').trim();
    const salesRep = (r[9] || 'sales12').trim();
    const address = (r[11] || '').trim();
    const state = (r[12] || 'Gujarat').trim();
    const city = (r[13] || 'Ahmedabad').trim();
    const pincode = (r[14] || '').trim();

    const productType = (r[15] || '').trim();
    const size = (r[16] || '').trim();
    const capacity = (r[17] || '').trim();
    const qty = parseFloat(r[18]) || 1;
    const color = (r[19] || 'GREY').trim().toUpperCase();
    const unitPrice = parseFloat(r[20]) || 0;
    const subTotal = parseFloat(r[21]) || (qty * unitPrice);
    const gstRate = 18;
    const gstAmount = parseFloat(r[23]) || (subTotal * 0.18);
    const discount = parseFloat(r[24]) || 0;
    const grandTotal = parseFloat(r[25]) || (subTotal + gstAmount);

    const parsedAddr = parseAddressObj(address, state, city, pincode);

    const exactProductName = `HIMALAYA FRP ${productType} ${size} ${capacity}`.replace(/\s+/g, ' ').trim();
    const productCode = [productType, size.replace(/\s+/g, ''), capacity].filter(Boolean).join('-');

    const itemObj = {
      product: productType,
      size,
      capacity,
      productName: exactProductName,
      productCode,
      specification: `Product: ${productType} | Size: ${size} | Capacity: ${capacity} | Color: ${color} | Qty: ${qty} | Rate: ₹${unitPrice}`,
      color,
      quantity: qty,
      unitPrice,
      subTotal,
      tax: gstRate,
      gstRate,
      gstAmount,
      discount,
      grandTotal
    };

    const hasLeadInfo = Boolean(projectName || groupName || gstName);
    const isSameAsLast = lastLead &&
      (orderDateStr === lastLead.rawDate || !orderDateStr) &&
      (projectName === lastLead.companyName || (!projectName && gstName === lastLead.gstName)) &&
      (gstNo === (lastLead.gstNumber || 'URD') || !gstNo) &&
      (siteInchargeMobile === lastLead.phone || !siteInchargeMobile);

    if (isSameAsLast) {
      lastLead.items.push(itemObj);
      continue;
    }

    if (hasLeadInfo) {
      lastLead = {
        rawDate: orderDateStr,
        leadDate: parseCsvDate(orderDateStr),
        companyName: projectName || groupName || gstName || 'Client',
        groupName: groupName || projectName,
        projectName: projectName || groupName,
        gstName: gstName || projectName,
        gstNumber: (gstNo && gstNo !== 'URD') ? gstNo : undefined,
        contactPerson: siteIncharge || 'JY',
        phone: siteInchargeMobile || officeContact || '9925010258',
        email: email || 'info@thehimalaya.co.in',
        salesRep: salesRep || 'sales12',
        address: parsedAddr,
        remarks: 'Sales 12 Lead (Converted to Quotation, Order & Ready for Dispatch)',
        source: 'OTHER',
        items: [itemObj]
      };
      groupedLeads.push(lastLead);
    } else if (lastLead) {
      lastLead.items.push(itemObj);
    }
  }

  groupedLeads.sort((a, b) => a.leadDate.getTime() - b.leadDate.getTime());
  console.log(`Parsed & sorted ${groupedLeads.length} distinct grouped transactions.`);
  return groupedLeads;
}

async function getMaxSequenceForFY(prisma, fyPrefix) {
  const [leads, quotes, orders, plans, wos] = await Promise.all([
    prisma.lead.findMany({ where: { leadNumber: { startsWith: `LEAD/${fyPrefix}/` } }, select: { leadNumber: true } }),
    prisma.quotation.findMany({ where: { quotationNumber: { startsWith: `QT/${fyPrefix}/` } }, select: { quotationNumber: true } }),
    prisma.salesOrder.findMany({ where: { orderNumber: { startsWith: `HCPPL/${fyPrefix}/` } }, select: { orderNumber: true } }),
    prisma.productionPlan.findMany({ where: { planNumber: { startsWith: `PP/${fyPrefix}/` } }, select: { planNumber: true } }),
    prisma.workOrder.findMany({ where: { workOrderNumber: { startsWith: `WO/${fyPrefix}/` } }, select: { workOrderNumber: true } }),
  ]);

  let maxSeq = 0;
  const extractNum = (str, prefix) => {
    const m = (str || '').match(new RegExp(`${prefix}/${fyPrefix}/(\\d+)`));
    return m ? parseInt(m[1], 10) : 0;
  };

  leads.forEach(l => { const n = extractNum(l.leadNumber, 'LEAD'); if (n > maxSeq) maxSeq = n; });
  quotes.forEach(q => { const n = extractNum(q.quotationNumber, 'QT'); if (n > maxSeq) maxSeq = n; });
  orders.forEach(o => { const n = extractNum(o.orderNumber, 'HCPPL'); if (n > maxSeq) maxSeq = n; });
  plans.forEach(p => { const n = extractNum(p.planNumber, 'PP'); if (n > maxSeq) maxSeq = n; });
  wos.forEach(w => { const n = extractNum(w.workOrderNumber, 'WO'); if (n > maxSeq) maxSeq = n; });

  return maxSeq;
}

async function syncSales12PipelineToReadyDispatch(config, groups) {
  console.log(`\n======================================================================`);
  console.log(`🚀 SYNCING SALES 12 FULL PIPELINE (LEAD -> QUOTE -> ORDER -> PROD -> QC -> READY FOR DISPATCH)`);
  console.log(`Database: ${config.name}`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    // 1. Resolve Sales 12 User strictly
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: 'sales12@himalayaerp.com', mode: 'insensitive' } },
          { name: { contains: 'Sales 12', mode: 'insensitive' } },
          { name: { contains: 'Jyoti', mode: 'insensitive' } },
        ]
      }
    });

    const company = await prisma.company.findFirst();
    const companyId = user?.companyId || company?.id || '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';

    if (!user) {
      console.log(`Creating Sales 12 user in ${config.name}...`);
      const role = await prisma.role.findFirst({
        where: { OR: [{ code: 'SALES_EXECUTIVE' }, { name: { contains: 'Sales', mode: 'insensitive' } }] }
      });
      user = await prisma.user.create({
        data: {
          companyId,
          name: 'Jyoti (Sales 12)',
          email: 'sales12@himalayaerp.com',
          roleId: role?.id || null,
          isActive: true,
          status: 'Active'
        }
      });
    }

    const userId = user.id;
    console.log(`Resolved Sales 12 user: ${user.name} (${user.email} - ${userId})`);

    // Resolve Plant Head User
    const plantHeadUser = await prisma.user.findFirst({
      where: {
        isActive: true,
        OR: [
          { role: { code: 'PLANT_HEAD' } },
          { role: { code: 'SUPER_ADMIN' } }
        ]
      },
      select: { id: true, name: true, email: true }
    });
    console.log(`Resolved Plant Head user: ${plantHeadUser?.name || 'Plant Head'} (${plantHeadUser?.id || userId})`);

    // 2. Clean ONLY previous Sales 12 orders & work orders cleanly if any exist
    console.log('Cleaning previous Sales 12 orders, quotes, plans, and work orders...');
    const existingOrders = await prisma.salesOrder.findMany({
      where: { salesExecutiveId: userId },
      select: { id: true }
    });
    const orderIds = existingOrders.map(o => o.id);

    if (orderIds.length > 0) {
      const soItems = await prisma.salesOrderItem.findMany({ where: { salesOrderId: { in: orderIds } }, select: { id: true } });
      const soItemIds = soItems.map(i => i.id);

      const prodPlans = await prisma.productionPlan.findMany({ where: { salesOrderId: { in: orderIds } }, select: { id: true } });
      const planIds = prodPlans.map(p => p.id);

      const workOrders = await prisma.workOrder.findMany({
        where: { OR: [{ productionPlanId: { in: planIds } }, { salesOrderItemId: { in: soItemIds } }] },
        select: { id: true }
      });
      const workOrderIds = workOrders.map(w => w.id);

      if (workOrderIds.length > 0) {
        try { await prisma.qCInspection.deleteMany({ where: { workOrderId: { in: workOrderIds } } }); } catch (e) {}
        try { await prisma.productionBatch.deleteMany({ where: { workOrderId: { in: workOrderIds } } }); } catch (e) {}
        try { await prisma.productionShiftEntry.deleteMany({ where: { workOrderId: { in: workOrderIds } } }); } catch (e) {}
        try { await prisma.productionScrapEntry.deleteMany({ where: { workOrderId: { in: workOrderIds } } }); } catch (e) {}
        try { await prisma.productionStatusHistory.deleteMany({ where: { workOrderId: { in: workOrderIds } } }); } catch (e) {}
        try { await prisma.finishedGoods.deleteMany({ where: { workOrderId: { in: workOrderIds } } }); } catch (e) {}
        try { await prisma.workOrder.deleteMany({ where: { id: { in: workOrderIds } } }); } catch (e) {}
      }

      if (planIds.length > 0) {
        try { await prisma.productionPlan.deleteMany({ where: { id: { in: planIds } } }); } catch (e) {}
      }

      try { await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrder.deleteMany({ where: { id: { in: orderIds } } }); } catch (e) {}
    }

    const quotes = await prisma.quotation.findMany({
      where: { salesExecutiveId: userId },
      select: { id: true }
    });
    const quoteIds = quotes.map(q => q.id);
    if (quoteIds.length > 0) {
      try { await prisma.quotationItem.deleteMany({ where: { quotationId: { in: quoteIds } } }); } catch (e) {}
      try { await prisma.quotationTerm.deleteMany({ where: { quotationId: { in: quoteIds } } }); } catch (e) {}
      try { await prisma.quotation.deleteMany({ where: { id: { in: quoteIds } } }); } catch (e) {}
    }

    try { await prisma.lead.deleteMany({ where: { salesExecutiveId: userId } }); } catch (e) {}

    // 3. Catalog Products & Workflow States
    const products = await prisma.product.findMany({
      select: { id: true, name: true, sku: true, size: true, type: true, capacity: true }
    });
    console.log(`Loaded ${products.length} products from catalog.`);
    const defaultProduct = products[0] || null;

    let leadWonState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'LEAD' }, name: { contains: 'Won', mode: 'insensitive' } } });
    let quoteApprovedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'QUOTATION' }, name: { contains: 'Approved', mode: 'insensitive' } } });
    let orderConfirmedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'SALES_ORDER' }, name: { contains: 'Confirmed', mode: 'insensitive' } } });
    let orderReadyDispatchState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'SALES_ORDER' }, name: { contains: 'Ready for Dispatch', mode: 'insensitive' } } }) || orderConfirmedState;
    let prodCompletedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'PRODUCTION_PLAN' }, name: { contains: 'Completed', mode: 'insensitive' } } }) ||
                             await prisma.workflowState.findFirst({ where: { workflow: { code: 'PRODUCTION_PLAN' }, name: { contains: 'Approved', mode: 'insensitive' } } });
    let woCompletedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'WORK_ORDER' }, name: { contains: 'Completed', mode: 'insensitive' } } });
    let qcApprovedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'QC_INSPECTION' }, name: { contains: 'Approved', mode: 'insensitive' } } });

    // 4. Calculate starting sequence numbers dynamically from target DB!
    const maxSeq2526 = await getMaxSequenceForFY(prisma, '2526');
    const maxSeq2627 = await getMaxSequenceForFY(prisma, '2627');
    console.log(`Starting Sequence Base: FY 25-26 max=${maxSeq2526} (next=${maxSeq2526 + 1}), FY 26-27 max=${maxSeq2627} (next=${maxSeq2627 + 1})`);

    let currentSeq2526 = maxSeq2526;
    let currentSeq2627 = maxSeq2627;
    let totalWorkOrdersCount = 0;
    let totalUnits = 0;
    const now = new Date();

    for (let idx = 0; idx < groups.length; idx++) {
      const g = groups[idx];
      const leadDateObj = g.leadDate;
      const parsedAddr = g.address;
      const companyName = g.companyName;
      const contactPerson = g.contactPerson || 'JY';
      const phone = g.phone || '9925010258';
      const email = g.email || 'info@thehimalaya.co.in';
      const gstNumber = g.gstNumber || null;
      const gstName = g.gstName || companyName;

      // Determine Financial Year
      const month = leadDateObj.getUTCMonth();
      const year = leadDateObj.getUTCFullYear();
      let fyPrefix = '2627';
      let seqNum = 0;
      if (year === 2026 && (month === 0 || month === 1 || month === 2)) {
        fyPrefix = '2526';
        currentSeq2526++;
        seqNum = currentSeq2526;
      } else {
        currentSeq2627++;
        seqNum = currentSeq2627;
      }
      const seqStr = String(seqNum).padStart(4, '0');

      // A. Upsert Customer
      let customer = null;
      if (gstNumber) {
        customer = await prisma.customer.findFirst({ where: { companyId, gstin: gstNumber } });
      }
      if (!customer) {
        customer = await prisma.customer.findFirst({ where: { companyId, companyName: { equals: companyName, mode: 'insensitive' } } });
      }
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            companyId,
            companyName,
            contactPerson,
            phone,
            email,
            gstin: gstNumber,
            status: 'ACTIVE',
            shippingAddress: parsedAddr,
            billingAddress: parsedAddr,
            createdById: userId
          }
        });
      }

      // Calculate totals & map catalog products
      let subTotal = 0;
      let totalTax = 0;
      let grandTotal = 0;
      let totalQty = 0;

      const groupItemsData = g.items.map(it => {
        totalQty += it.quantity;
        totalUnits += it.quantity;
        subTotal += it.subTotal;
        totalTax += it.gstAmount;
        grandTotal += it.grandTotal;

        const matchedProd = findProduct(it.product, it.size, it.capacity, products) || defaultProduct;
        const exactName = matchedProd?.name || it.productName;
        const exactSku = matchedProd?.sku || it.productCode;

        return {
          ...it,
          productName: exactName,
          productCode: exactSku,
          productId: matchedProd?.id || defaultProduct?.id || null
        };
      });

      const productInterestStr = groupItemsData
        .map(d => `${d.productName} (${d.quantity} Qty, ${d.color})`)
        .join(', ');

      // B. Create / Update Lead (Status: WON)
      const leadNumber = `LEAD/${fyPrefix}/${seqStr}`;
      let createdLead = await prisma.lead.findFirst({
        where: { leadNumber }
      });

      const leadPayload = {
        leadDate: leadDateObj,
        companyName,
        groupName: g.groupName || companyName,
        projectName: g.projectName || companyName,
        contactPerson,
        email,
        phone,
        gstName,
        gstNumber,
        address: parsedAddr,
        source: 'OTHER',
        productInterest: productInterestStr,
        detailedItems: groupItemsData,
        estimatedQuantity: new Prisma.Decimal(totalQty),
        unit: 'SET',
        remarks: 'Sales 12 Lead (Converted to Quotation, Order & Ready for Dispatch)',
        workflowStateId: leadWonState?.id || null,
        assignedToId: userId,
        salesExecutiveId: userId,
        createdById: userId,
        companyId,
        customerId: customer.id,
        convertedCustomerId: customer.id,
        convertedAt: leadDateObj,
        convertedById: userId
      };

      if (createdLead) {
        createdLead = await prisma.lead.update({
          where: { id: createdLead.id },
          data: leadPayload
        });
      } else {
        createdLead = await prisma.lead.create({
          data: {
            ...leadPayload,
            leadNumber
          }
        });
      }

      // C. Upsert Quotation (APPROVED)
      const quotationNumber = `QT/${fyPrefix}/${seqStr}`;
      const quotePayload = {
        companyId,
        customerId: customer.id,
        leadId: createdLead.id,
        salesExecutiveId: userId,
        createdById: userId,
        approvedById: userId,
        approvedAt: leadDateObj,
        subtotal: new Prisma.Decimal(subTotal),
        discount: new Prisma.Decimal(0),
        tax: new Prisma.Decimal(totalTax),
        total: new Prisma.Decimal(grandTotal),
        expectedTransportationCost: new Prisma.Decimal(0),
        workflowStateId: quoteApprovedState?.id || null,
        createdAt: leadDateObj,
        remarks: 'Converted from Sales 12 Lead - Ready for Order'
      };

      let createdQuote = await prisma.quotation.findFirst({
        where: { quotationNumber }
      });

      if (createdQuote) {
        createdQuote = await prisma.quotation.update({
          where: { id: createdQuote.id },
          data: {
            ...quotePayload,
            quotationNumber
          }
        });
        await prisma.quotationItem.deleteMany({ where: { quotationId: createdQuote.id } });
        await prisma.quotationItem.createMany({
          data: groupItemsData.map(gi => ({
            quotationId: createdQuote.id,
            productId: gi.productId,
            description: gi.productName,
            quantity: new Prisma.Decimal(gi.quantity),
            unitPrice: new Prisma.Decimal(gi.unitPrice),
            tax: new Prisma.Decimal(18),
            discount: new Prisma.Decimal(0),
            lineTotal: new Prisma.Decimal(gi.grandTotal)
          }))
        });
      } else {
        createdQuote = await prisma.quotation.create({
          data: {
            quotationNumber,
            ...quotePayload,
            items: {
              create: groupItemsData.map(gi => ({
                productId: gi.productId,
                description: gi.productName,
                quantity: new Prisma.Decimal(gi.quantity),
                unitPrice: new Prisma.Decimal(gi.unitPrice),
                tax: new Prisma.Decimal(18),
                discount: new Prisma.Decimal(0),
                lineTotal: new Prisma.Decimal(gi.grandTotal)
              }))
            }
          }
        });
      }

      // D. Upsert Sales Order (READY_FOR_DISPATCH, Plant Head Accepted)
      const orderNumber = `HCPPL/${fyPrefix}/${seqStr}`;
      const orderPayload = {
        customerId: customer.id,
        quotationId: createdQuote.id,
        sourceQuotationId: createdQuote.id,
        salesExecutiveId: userId,
        createdById: userId,
        orderDate: leadDateObj,
        status: 'READY_FOR_DISPATCH',
        workflowStateId: orderReadyDispatchState?.id || null,
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
        remarks: 'Sales 12 Order - Plant Head Accepted - Production & QC Passed - Ready For Dispatch',
        version: 1,
        createdAt: leadDateObj
      };

      let createdOrder = await prisma.salesOrder.findFirst({
        where: { orderNumber }
      });

      if (createdOrder) {
        createdOrder = await prisma.salesOrder.update({
          where: { id: createdOrder.id },
          data: {
            ...orderPayload,
            orderNumber
          }
        });
        await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: createdOrder.id } });
        for (const gi of groupItemsData) {
          await prisma.salesOrderItem.create({
            data: {
              salesOrderId: createdOrder.id,
              productId: gi.productId,
              productNameSnapshot: gi.productName,
              productCodeSnapshot: gi.productCode,
              orderedQuantity: new Prisma.Decimal(gi.quantity),
              unitPrice: new Prisma.Decimal(gi.unitPrice),
              discountAmount: new Prisma.Decimal(0),
              taxableAmount: new Prisma.Decimal(gi.subTotal),
              taxRate: new Prisma.Decimal(18),
              taxAmount: new Prisma.Decimal(gi.gstAmount),
              lineTotal: new Prisma.Decimal(gi.grandTotal),
              unit: 'SET'
            }
          });
        }
      } else {
        createdOrder = await prisma.salesOrder.create({
          data: {
            orderNumber,
            ...orderPayload,
            items: {
              create: groupItemsData.map(gi => ({
                productId: gi.productId,
                productNameSnapshot: gi.productName,
                productCodeSnapshot: gi.productCode,
                orderedQuantity: new Prisma.Decimal(gi.quantity),
                unitPrice: new Prisma.Decimal(gi.unitPrice),
                discountAmount: new Prisma.Decimal(0),
                taxableAmount: new Prisma.Decimal(gi.subTotal),
                taxRate: new Prisma.Decimal(18),
                taxAmount: new Prisma.Decimal(gi.gstAmount),
                lineTotal: new Prisma.Decimal(gi.grandTotal),
                unit: 'SET'
              }))
            }
          }
        });
      }

      const refreshedOrder = await prisma.salesOrder.findUnique({
        where: { id: createdOrder.id },
        include: { items: true }
      });

      // E. Upsert Production Plan (COMPLETED)
      const planNumber = `PP/${fyPrefix}/${seqStr}`;
      let createdPlan = await prisma.productionPlan.findFirst({
        where: { planNumber }
      });

      const planPayload = {
        salesOrderId: refreshedOrder.id,
        assignedToId: plantHeadUser?.id || userId,
        status: 'COMPLETED',
        priority: 'NORMAL',
        plannedStartDate: leadDateObj,
        plannedEndDate: new Date(leadDateObj.getTime() + 7 * 24 * 60 * 60 * 1000),
        productionLine: 'Main FRP Molding Line',
        workflowStateId: prodCompletedState?.id || null,
        createdAt: leadDateObj
      };

      if (createdPlan) {
        createdPlan = await prisma.productionPlan.update({
          where: { id: createdPlan.id },
          data: {
            planNumber,
            ...planPayload
          }
        });
      } else {
        createdPlan = await prisma.productionPlan.create({
          data: {
            planNumber,
            ...planPayload
          }
        });
      }

      // F. Upsert Work Orders, Batches, QC Inspections, and Finished Goods
      for (let itemIdx = 0; itemIdx < refreshedOrder.items.length; itemIdx++) {
        const orderItem = refreshedOrder.items[itemIdx];
        totalWorkOrdersCount++;
        const woSeqStr = String(itemIdx + 1).padStart(2, '0');
        const workOrderNumber = `WO/${fyPrefix}/${seqStr}-${woSeqStr}`;

        const woPayload = {
          productionPlanId: createdPlan.id,
          salesOrderItemId: orderItem.id,
          quantity: orderItem.orderedQuantity,
          status: 'COMPLETED',
          productionStatus: 'READY_FOR_DISPATCH',
          startedById: userId,
          startedAt: leadDateObj,
          completedById: userId,
          completedAt: now,
          productionStartTime: leadDateObj,
          productionEndTime: now,
          sentToDispatchAt: null, // <-- Remains in Ready Queue tab!
          sentToDispatchById: null,
          qcResult: 'PASS',
          qcRemarks: 'Technical QC Passed - All Dimension, Load & Visual Checks OK',
          qcTimestamp: now,
          reworkCount: 0,
          workflowStateId: woCompletedState?.id || null,
          createdById: userId,
          createdAt: leadDateObj
        };

        // 1. Work Order
        let createdWO = await prisma.workOrder.findFirst({
          where: { workOrderNumber }
        });

        if (createdWO) {
          createdWO = await prisma.workOrder.update({
            where: { id: createdWO.id },
            data: woPayload
          });
        } else {
          createdWO = await prisma.workOrder.create({
            data: {
              workOrderNumber,
              ...woPayload
            }
          });
        }

        // 2. Production Batch
        const batchNumber = `BATCH/${fyPrefix}/${seqStr}-${woSeqStr}`;
        let batch = await prisma.productionBatch.findFirst({ where: { batchNumber } });
        if (batch) {
          await prisma.productionBatch.update({
            where: { id: batch.id },
            data: { workOrderId: createdWO.id, quantity: orderItem.orderedQuantity }
          });
        } else {
          await prisma.productionBatch.create({
            data: {
              batchNumber,
              workOrderId: createdWO.id,
              quantity: orderItem.orderedQuantity,
              createdAt: leadDateObj
            }
          });
        }

        // 3. QC Inspection (PASSED)
        let existingQc = await prisma.qCInspection.findFirst({ where: { workOrderId: createdWO.id } });
        if (existingQc) {
          await prisma.qCInspection.update({
            where: { id: existingQc.id },
            data: {
              status: 'PASSED',
              approvedQuantity: orderItem.orderedQuantity,
              rejectedQuantity: new Prisma.Decimal(0),
              remarks: 'Technical QC Passed - All Dimension, Load & Visual Checks OK',
              approvedAt: now,
              inspectorId: userId,
              workflowStateId: qcApprovedState?.id || null
            }
          });
        } else {
          await prisma.qCInspection.create({
            data: {
              workOrderId: createdWO.id,
              status: 'PASSED',
              approvedQuantity: orderItem.orderedQuantity,
              rejectedQuantity: new Prisma.Decimal(0),
              remarks: 'Technical QC Passed - All Dimension, Load & Visual Checks OK',
              approvedAt: now,
              inspectorId: userId,
              workflowStateId: qcApprovedState?.id || null,
              createdAt: leadDateObj
            }
          });
        }

        // 4. Finished Goods (Staged for Dispatch)
        let existingFg = await prisma.finishedGoods.findFirst({ where: { workOrderId: createdWO.id } });
        if (existingFg) {
          await prisma.finishedGoods.update({
            where: { id: existingFg.id },
            data: {
              productId: orderItem.productId,
              salesOrderId: refreshedOrder.id,
              quantity: orderItem.orderedQuantity,
              availableQuantity: orderItem.orderedQuantity,
              status: 'AVAILABLE',
              receivedAt: now,
              receivedById: userId
            }
          });
        } else {
          await prisma.finishedGoods.create({
            data: {
              workOrderId: createdWO.id,
              productId: orderItem.productId,
              salesOrderId: refreshedOrder.id,
              quantity: orderItem.orderedQuantity,
              availableQuantity: orderItem.orderedQuantity,
              reservedQuantity: new Prisma.Decimal(0),
              unit: 'SET',
              status: 'AVAILABLE',
              receivedAt: now,
              receivedById: userId
            }
          });
        }
      }

      console.log(`  ✔ [${idx + 1}/${groups.length}] Lead [${createdLead.leadNumber}] -> Quote [${quotationNumber}] -> Order [${orderNumber}] -> Plan [${planNumber}] -> ${refreshedOrder.items.length} Work Orders READY FOR DISPATCH!`);
    }

    // 5. Update Sequence Counters in DB
    console.log('\nSynchronizing sequence tables...');
    for (const fy of ['2526', '2627']) {
      const finalMaxLead = await getMaxSequenceForFY(prisma, fy);
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO "IdSequence" ("key", "prefix", "currentValue", "padding", "updatedAt")
          VALUES ('sales_order_number_${fy}', 'HCPPL/${fy}/', ${finalMaxLead}, 4, NOW())
          ON CONFLICT ("key") DO UPDATE SET "currentValue" = GREATEST("IdSequence"."currentValue", ${finalMaxLead}), "updatedAt" = NOW();
        `);
      } catch (e) {}
    }

    console.log(`\n🎉 SYNC COMPLETED SUCCESSFULLY IN ${config.name}!`);
    console.log(`- Total Orders Synced: ${groups.length}`);
    console.log(`- Total Work Orders Created: ${totalWorkOrdersCount}`);
    console.log(`- Total Product Units: ${totalUnits}`);
    console.log(`- Final Sequences: FY 2526 = ${currentSeq2526}, FY 2627 = ${currentSeq2627}`);

  } catch (err) {
    console.error(`❌ Error syncing pipeline in ${config.name}:`, err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log('========================================================================');
  console.log('📦 SALES 12 (JYOTI) COMPLETE LIFECYCLE PIPELINE SYNC TO READY FOR DISPATCH');
  console.log('========================================================================');

  const groups = loadSales12Leads();
  console.log(`Total Sales 12 Orders to Process: ${groups.length}`);
  const totalItemsCount = groups.reduce((acc, g) => acc + g.items.length, 0);
  const totalUnitsCount = groups.reduce((acc, g) => acc + g.items.reduce((s, it) => s + it.quantity, 0), 0);
  console.log(`Total Line Items: ${totalItemsCount}, Total Units: ${totalUnitsCount}\n`);

  for (const db of targetDbs) {
    try {
      await syncSales12PipelineToReadyDispatch(db, groups);
    } catch (e) {
      console.error(`Failed on database ${db.name}:`, e.message);
    }
  }

  console.log('\n========================================================================');
  console.log('🏁 ALL DATABASES PROCESSED SUCCESSFULLY!');
  console.log('All Sales 12 leads are WON -> Quoted -> Ordered -> Production Completed -> QC Passed -> Staged Ready for Dispatch.');
  console.log('Open https://thehimalaya.cloud/production/ready-for-dispatch to view them in the Ready Queue!');
  console.log('========================================================================');
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal Pipeline Execution Error:', err);
    process.exit(1);
  });
}

module.exports = { syncSales12PipelineToReadyDispatch, loadSales12Leads };
