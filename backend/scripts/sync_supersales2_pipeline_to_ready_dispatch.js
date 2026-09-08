const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const isDocker = fs.existsSync('/.dockerenv') || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:'));

const targetDbs = process.env.DATABASE_URL
  ? [{ name: 'Target Database (from DATABASE_URL)', url: process.env.DATABASE_URL }]
  : [
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
  if (str === '-' || str === '') return new Date();
  
  let m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (m) {
    return new Date(Date.UTC(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{2})$/);
  if (m) {
    const year = 2000 + parseInt(m[3], 10);
    return new Date(Date.UTC(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) {
    return new Date(Date.UTC(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
}

function findProduct(type, size, capacity, products) {
  let t = (type || '').trim().toUpperCase();
  if (t === 'D MHC') t = 'MHC';
  
  let s = (size || '').trim().toUpperCase().replace(/\s+/g, '');
  if (s.includes('DAI')) s = s.replace('DAI', 'DIA');
  if (s.includes('DIA') && !s.includes('MM')) s = s.replace('DIA', 'MMDIA');
  if (s === '900MM') s = '900MMDIA';
  if (s.match(/^\d+X\d+X\d+$/)) {
    s = s.substring(0, s.lastIndexOf('X'));
  }
  if (s === '30X0') s = '30X30';
  if (s === '900X600') s = '600X900';
  
  let c = (capacity || '').trim().toUpperCase();
  if (c === '3T') c = 'LD';
  
  if (s === '1200X900') s = '1200X1200';
  if (s === '600X260') s = '600X600';
  if (s === '450X1000') s = '600X900';
  if (s === '1800X1200') s = '1800X1800';
  if (s === '900X990') s = '900X900';
  if (s === '1200X600') s = '1200X1200';
  if (s === '750X750' && t === 'WGC') t = 'MHC';
  if (s === '1000X1000' && t === 'WGC') t = 'MHC';
  
  let match = products.find(p => {
    const sku = (p.sku || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(t) || name.includes(t)) &&
           (sku.includes(s) || name.includes(s)) &&
           (sku.includes(c) || name.includes(c));
  });
  if (match) return match;
  
  match = products.find(p => {
    const sku = (p.sku || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(t) || name.includes(t)) &&
           (sku.includes(s) || name.includes(s));
  });
  if (match) return match;

  match = products.find(p => {
    const sku = (p.sku || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(s) || name.includes(s)) &&
           (sku.includes(c) || name.includes(c));
  });
  if (match) return match;

  match = products.find(p => {
    const sku = (p.sku || '').toUpperCase();
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
    if (/AHMEDABAD/i.test(line1)) city = 'Ahmedabad';
    else if (/SURAT/i.test(line1)) city = 'Surat';
    else if (/RAJKOT/i.test(line1)) city = 'Rajkot';
    else if (/VADODARA/i.test(line1)) city = 'Vadodara';
    else if (/MUMBAI/i.test(line1)) city = 'Mumbai';
    else city = 'Ahmedabad';
  }

  if (!state) {
    if (/MAHARASHTRA|MUMBAI/i.test(line1)) state = 'Maharashtra';
    else state = 'Gujarat';
  }

  return {
    line1: line1 || 'Address on file',
    city: city || 'Ahmedabad',
    state: state || 'Gujarat',
    country: 'India',
    pincode: pincode || '380001'
  };
}

function cleanPhone(str) {
  if (!str) return '9998184929';
  return str.replace(/^MO\s*:\s*/i, '')
            .replace(/^MOB\s*[\.:]\s*/i, '')
            .replace(/^MO-\s*/i, '')
            .replace(/^mo:\s*/i, '')
            .replace(/^Mo:\s*/i, '')
            .trim();
}

function loadTaherLeads() {
  const jsonCandidates = [
    path.resolve('scripts/supersales2_leads_data.json'),
    path.resolve('/app/scripts/supersales2_leads_data.json'),
    path.join(__dirname, 'supersales2_leads_data.json'),
  ];
  let jsonPath = jsonCandidates.find(p => fs.existsSync(p));
  if (jsonPath) {
    console.log(`Loading pre-parsed leads JSON from: ${jsonPath}`);
    const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    return raw.map(l => ({
      ...l,
      leadDate: new Date(l.leadDate),
      items: l.items || l.detailedItems || []
    })).sort((a, b) => a.leadDate.getTime() - b.leadDate.getTime());
  }

  const candidatePaths = [
    path.resolve('scripts/taher_sir_super_sales2.csv'),
    path.resolve('/app/scripts/taher_sir_super_sales2.csv'),
    path.resolve('backend/scripts/taher_sir(super_sales2) (3).csv'),
    path.resolve('scripts/taher_sir(super_sales2) (3).csv'),
    path.resolve('/app/scripts/taher_sir(super_sales2) (3).csv'),
    path.join(__dirname, 'taher_sir(super_sales2) (3).csv'),
    path.resolve('taher_sir(super_sales2) (1) (2).csv'),
  ];

  let csvPath = candidatePaths.find(p => fs.existsSync(p));
  if (!csvPath) {
    throw new Error(`SuperSales 2 CSV not found in candidate paths: ${candidatePaths.join(', ')}`);
  }

  console.log(`Reading SuperSales 2 CSV from: ${csvPath}`);
  const content = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
  const rows = parseCSV(content);
  const dataRows = rows.slice(1);

  let lastLead = null;
  const groupedLeads = [];

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const leadDateStr = r[0] || '';
    const projectName = (r[1] || '').trim();
    const groupName = (r[2] || projectName).trim();
    const gstName = (r[3] || projectName).trim();
    const gstNo = (r[4] || '').trim();
    let siteIncharge = (r[5] || 'Site Incharge').trim();
    let siteInchargeMobile = cleanPhone(r[6] || r[7] || '');
    let officeContact = cleanPhone(r[7] || '');
    const email = (r[8] || 'info@thehimalaya.co.in').trim();
    const address = (r[11] || '').trim();
    const state = (r[12] || 'Gujarat').trim();
    const city = (r[13] || '').trim();
    const pincode = (r[14] || '').trim();

    if (siteInchargeMobile.includes(':')) {
      const parts = siteInchargeMobile.split(':');
      siteIncharge = parts[0].trim();
      siteInchargeMobile = parts[1].trim();
    }

    const productType = (r[15] || '').trim();
    const size = (r[16] || '').trim();
    const capacity = (r[17] || '').trim();
    const qty = parseFloat(r[18]) || 1;
    const color = (r[19] || 'GREY').trim().toUpperCase();
    const unitPrice = parseFloat(r[20]) || 0;
    const subTotal = parseFloat(r[21]) || (qty * unitPrice);
    const gst = (r[22] || '18%').trim();
    const gstAmount = parseFloat(r[23]) || Math.round(subTotal * 0.18 * 100) / 100;
    const discount = parseFloat(r[24]) || 0;
    const grandTotal = parseFloat(r[25]) || (subTotal + gstAmount - discount);

    const hasLeadInfo = Boolean(projectName || groupName || gstName || gstNo);
    const hasProductInfo = Boolean(productType || size || capacity);
    if (!hasLeadInfo && !hasProductInfo) continue;

    const exactProductName = `HIMALAYA FRP ${productType} ${size} ${capacity}`.trim();

    const itemObj = {
      product: productType,
      size: size,
      capacity: capacity,
      productName: exactProductName,
      productCode: [productType, size.replace(/\s+/g, ''), capacity].filter(Boolean).join('-'),
      specification: `Product: ${productType} | Size: ${size} | Capacity: ${capacity} | Color: ${color} | Qty: ${qty} | Rate: ₹${unitPrice}`,
      color: color,
      quantity: qty,
      unitPrice: unitPrice,
      subTotal: subTotal,
      tax: 18,
      gstRate: 18,
      gstAmount: gstAmount,
      discount: discount,
      grandTotal: grandTotal
    };

    const isSameAsLast = lastLead &&
      (leadDateStr === lastLead.rawDate || !leadDateStr) &&
      (projectName === lastLead.companyName || (!projectName && gstName === lastLead.gstName)) &&
      (gstNo === lastLead.gstNumber || !gstNo) &&
      (siteInchargeMobile === lastLead.phone || !siteInchargeMobile);

    if (isSameAsLast && hasProductInfo) {
      lastLead.items.push(itemObj);
      continue;
    }

    if (hasLeadInfo) {
      const parsedAddr = parseAddressObj(address, state, city, pincode);
      lastLead = {
        rawDate: leadDateStr,
        leadDate: parseCsvDate(leadDateStr),
        companyName: projectName || groupName || gstName || 'Client',
        groupName: groupName || projectName,
        projectName: projectName || groupName,
        gstName: gstName || projectName,
        gstNumber: (gstNo && gstNo !== 'URD') ? gstNo : undefined,
        contactPerson: siteIncharge || 'Site Incharge',
        phone: siteInchargeMobile || officeContact || '9998184929',
        email: email || 'info@thehimalaya.co.in',
        address: parsedAddr,
        remarks: 'SuperSales 2 Lead (Converted to Quotation, Order & Ready for Dispatch)',
        source: 'OTHER',
        items: hasProductInfo ? [itemObj] : []
      };
      groupedLeads.push(lastLead);
    } else if (hasProductInfo && lastLead) {
      lastLead.items.push(itemObj);
    }
  }

  // Sort strictly chronologically by leadDate
  groupedLeads.sort((a, b) => a.leadDate.getTime() - b.leadDate.getTime());

  console.log(`Parsed & sorted ${groupedLeads.length} distinct grouped transactions.`);
  return groupedLeads;
}

async function syncSuperSales2PipelineToReadyDispatch(config, groups) {
  console.log(`\n======================================================================`);
  console.log(`🚀 SYNCING SUPERSALES 2 FULL PIPELINE (LEAD -> QUOTE -> ORDER -> PROD -> QC -> READY FOR DISPATCH)`);
  console.log(`Database: ${config.name}`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    // 1. Identify SuperSales 2 User
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } },
          { name: { contains: 'SuperSales 2', mode: 'insensitive' } },
          { name: { contains: 'Super Sales 2', mode: 'insensitive' } },
          { name: { contains: 'SuperSales Two', mode: 'insensitive' } }
        ]
      }
    });

    if (!user) {
      console.log(`❌ SuperSales 2 user not found in ${config.name}. Skipping.`);
      return;
    }

    const userId = user.id;
    const companyId = user.companyId || (await prisma.company.findFirst())?.id || '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
    console.log(`Resolved SuperSales 2 user: ${user.name} (${user.email} - ${user.id})`);

    // Find Plant Head User
    const plantHeadUser = await prisma.user.findFirst({
      where: {
        isActive: true,
        role: { code: 'PLANT_HEAD' }
      },
      select: { id: true, name: true, email: true }
    }) || await prisma.user.findFirst({
      where: {
        isActive: true,
        role: { code: 'SUPER_ADMIN' }
      },
      select: { id: true, name: true, email: true }
    });
    console.log(`Resolved Plant Head user: ${plantHeadUser?.name} (${plantHeadUser?.id})`);

    // 2. Clean previous SuperSales 2 orders/quotations cleanly to avoid duplicates
    console.log('Cleaning previous SuperSales 2 orders, quotes, plans, and work orders...');
    const existingOrders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { salesExecutiveId: userId },
          { createdById: userId },
          { orderNumber: { startsWith: 'HCPPL/2526/0' } },
          { orderNumber: { startsWith: 'HCPPL/2627/0' } }
        ]
      },
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
      where: {
        OR: [
          { salesExecutiveId: userId },
          { createdById: userId },
          { quotationNumber: { startsWith: 'QT/2526/0' } },
          { quotationNumber: { startsWith: 'QT/2627/0' } }
        ]
      },
      select: { id: true }
    });
    const quoteIds = quotes.map(q => q.id);
    if (quoteIds.length > 0) {
      try { await prisma.quotationItem.deleteMany({ where: { quotationId: { in: quoteIds } } }); } catch (e) {}
      try { await prisma.quotationTerm.deleteMany({ where: { quotationId: { in: quoteIds } } }); } catch (e) {}
      try { await prisma.quotation.deleteMany({ where: { id: { in: quoteIds } } }); } catch (e) {}
    }

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

    let count2526 = 0;
    let count2627 = 0;
    let totalWorkOrdersCount = 0;
    let totalUnits = 0;
    const now = new Date();

    for (let idx = 0; idx < groups.length; idx++) {
      const g = groups[idx];
      const leadDateObj = g.leadDate;
      const parsedAddr = g.address;
      const companyName = g.companyName;
      const contactPerson = g.contactPerson || 'Site Incharge';
      const phone = g.phone || '9998184929';
      const email = g.email || 'info@thehimalaya.co.in';
      const gstNumber = g.gstNumber || null;
      const gstName = g.gstName || companyName;

      // Determine Financial Year
      const month = leadDateObj.getUTCMonth(); // 0=Jan, 1=Feb, 2=Mar, 3=Apr...
      const year = leadDateObj.getUTCFullYear();
      let fyPrefix = '2627';
      let seqNum = 0;
      if (year === 2026 && (month === 1 || month === 2)) { // Feb or Mar 2026
        fyPrefix = '2526';
        count2526++;
        seqNum = count2526;
      } else {
        count2627++;
        seqNum = count2627;
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

      // Calculate item totals & enrich with real catalog products
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
      let createdLead = null;
      createdLead = await prisma.lead.findFirst({
        where: {
          salesExecutiveId: userId,
          companyName,
          leadDate: leadDateObj
        }
      }) || await prisma.lead.findFirst({
        where: {
          leadNumber: `LEAD/${fyPrefix}/${seqStr}`
        }
      });

      const fallbackLeadNumber = `LEAD/${fyPrefix}/${seqStr}`;

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
        remarks: 'SuperSales 2 Lead (Converted to Quotation, Order & Ready for Dispatch)',
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
        // NEVER update leadNumber on existing lead to avoid unique constraint collisions
        createdLead = await prisma.lead.update({
          where: { id: createdLead.id },
          data: leadPayload
        });
      } else {
        createdLead = await prisma.lead.create({
          data: {
            ...leadPayload,
            leadNumber: fallbackLeadNumber
          }
        });
      }

      // Extract sequence from actual leadNumber: e.g. "LEAD/2627/0001" -> activeFy="2627", activeSeq="0001"
      const match = (createdLead.leadNumber || '').match(/LEAD\/(\d+)\/(\d+)/);
      const activeFy = match ? match[1] : fyPrefix;
      const activeSeq = match ? match[2] : seqStr;

      // C. Create Quotation (APPROVED)
      const quotationNumber = `QT/${activeFy}/${activeSeq}`;
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
          subtotal: new Prisma.Decimal(subTotal),
          discount: new Prisma.Decimal(0),
          tax: new Prisma.Decimal(totalTax),
          total: new Prisma.Decimal(grandTotal),
          expectedTransportationCost: new Prisma.Decimal(0),
          workflowStateId: quoteApprovedState?.id || null,
          createdAt: leadDateObj,
          remarks: 'Converted from SuperSales 2 Lead - Ready for Order',
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

      // D. Create Sales Order (CONFIRMED & READY_FOR_DISPATCH, Plant Head Accepted)
      const orderNumber = `HCPPL/${activeFy}/${activeSeq}`;
      const createdOrder = await prisma.salesOrder.create({
        data: {
          orderNumber,
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
          remarks: 'SuperSales 2 Order - Plant Head Accepted - Production & QC Passed - Ready For Dispatch',
          version: 1,
          createdAt: leadDateObj,
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
        },
        include: { items: true }
      });

      // E. Create Production Plan (COMPLETED)
      const planNumber = `PP/${activeFy}/${activeSeq}`;
      const createdPlan = await prisma.productionPlan.create({
        data: {
          planNumber,
          salesOrderId: createdOrder.id,
          assignedToId: plantHeadUser?.id || userId,
          status: 'COMPLETED',
          priority: 'NORMAL',
          plannedStartDate: leadDateObj,
          plannedEndDate: new Date(leadDateObj.getTime() + 7 * 24 * 60 * 60 * 1000),
          productionLine: 'Main FRP Molding Line',
          workflowStateId: prodCompletedState?.id || null,
          createdAt: leadDateObj
        }
      });

      // F. Create Work Orders, Batches, QC Inspections, and Finished Goods for each line item
      for (let itemIdx = 0; itemIdx < createdOrder.items.length; itemIdx++) {
        const orderItem = createdOrder.items[itemIdx];
        totalWorkOrdersCount++;
        const woSeqStr = String(itemIdx + 1).padStart(2, '0');
        const workOrderNumber = `WO/${activeFy}/${activeSeq}-${woSeqStr}`;

        // 1. Work Order
        const createdWO = await prisma.workOrder.create({
          data: {
            workOrderNumber,
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
            sentToDispatchAt: now,
            sentToDispatchById: userId,
            qcResult: 'PASS',
            qcRemarks: 'Technical QC Passed - All Dimension, Load & Visual Checks OK',
            qcTimestamp: now,
            reworkCount: 0,
            workflowStateId: woCompletedState?.id || null,
            createdById: userId,
            createdAt: leadDateObj
          }
        });

        // 2. Production Batch
        const batchNumber = `BATCH/${activeFy}/${activeSeq}-${woSeqStr}`;
        await prisma.productionBatch.create({
          data: {
            batchNumber,
            workOrderId: createdWO.id,
            quantity: orderItem.orderedQuantity,
            createdAt: leadDateObj
          }
        });

        // 3. QC Inspection (PASSED)
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

        // 4. Finished Goods (Staged for Dispatch)
        await prisma.finishedGoods.create({
          data: {
            workOrderId: createdWO.id,
            productId: orderItem.productId,
            salesOrderId: createdOrder.id,
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

      console.log(`  ✔ [${idx + 1}/27] Lead [${createdLead.leadNumber}] -> Quote [${quotationNumber}] -> Order [${orderNumber}] -> Plan [${planNumber}] -> ${createdOrder.items.length} Work Orders READY FOR DISPATCH!`);
    }

    // 4. Update ID Sequences in DB so subsequent manual creation starts from next sequence
    try {
      await prisma.idSequence.upsert({ where: { key: 'lead_number_2526' }, update: { nextValue: count2526 + 1 }, create: { key: 'lead_number_2526', nextValue: count2526 + 1 } });
      await prisma.idSequence.upsert({ where: { key: 'lead_number_2627' }, update: { nextValue: count2627 + 1 }, create: { key: 'lead_number_2627', nextValue: count2627 + 1 } });
      await prisma.idSequence.upsert({ where: { key: 'quotation_number_2526' }, update: { nextValue: count2526 + 1 }, create: { key: 'quotation_number_2526', nextValue: count2526 + 1 } });
      await prisma.idSequence.upsert({ where: { key: 'quotation_number_2627' }, update: { nextValue: count2627 + 1 }, create: { key: 'quotation_number_2627', nextValue: count2627 + 1 } });
      await prisma.idSequence.upsert({ where: { key: 'sales_order_number_2526' }, update: { nextValue: count2526 + 1 }, create: { key: 'sales_order_number_2526', nextValue: count2526 + 1 } });
      await prisma.idSequence.upsert({ where: { key: 'sales_order_number_2627' }, update: { nextValue: count2627 + 1 }, create: { key: 'sales_order_number_2627', nextValue: count2627 + 1 } });
      await prisma.idSequence.upsert({ where: { key: 'production_plan_number_2526' }, update: { nextValue: count2526 + 1 }, create: { key: 'production_plan_number_2526', nextValue: count2526 + 1 } });
      await prisma.idSequence.upsert({ where: { key: 'production_plan_number_2627' }, update: { nextValue: count2627 + 1 }, create: { key: 'production_plan_number_2627', nextValue: count2627 + 1 } });
      await prisma.idSequence.upsert({ where: { key: 'work_order_number_2526' }, update: { nextValue: 3 }, create: { key: 'work_order_number_2526', nextValue: 3 } });
      await prisma.idSequence.upsert({ where: { key: 'work_order_number_2627' }, update: { nextValue: 57 }, create: { key: 'work_order_number_2627', nextValue: 57 } });
    } catch (e) {}

    console.log(`\n======================================================================`);
    console.log(`🎉 COMPLETE LIFECYCLE SYNCED SUCCESSFULLY FOR ${config.name}!`);
    console.log(`   - Leads Created / Won               : ${groups.length}`);
    console.log(`   - Quotations Created (APPROVED)     : ${groups.length}`);
    console.log(`   - Sales Orders (READY_FOR_DISPATCH) : ${groups.length}`);
    console.log(`   - Plant Head Acceptance             : ${groups.length} Orders Accepted`);
    console.log(`   - Production Plans (COMPLETED)      : ${groups.length}`);
    console.log(`   - Work Orders (READY_FOR_DISPATCH)  : ${totalWorkOrdersCount}`);
    console.log(`   - Total Finished Units Staged       : ${totalUnits} Units`);
    console.log(`   - Production Batches Generated      : ${totalWorkOrdersCount}`);
    console.log(`   - QC Inspections (PASSED)           : ${totalWorkOrdersCount}`);
    console.log(`   - Finished Goods Stock Staged       : ${totalWorkOrdersCount}`);
    console.log(`======================================================================\n`);

  } catch (err) {
    console.error(`❌ Error syncing pipeline in ${config.name}:`, err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const groups = loadTaherLeads();
  for (const target of targetDbs) {
    await syncSuperSales2PipelineToReadyDispatch(target, groups);
  }
}

main().catch(console.error);
