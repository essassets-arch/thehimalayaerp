const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

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

function loadTaherLeads() {
  const candidatePaths = [
    path.resolve('taher.csv'),
    path.join(__dirname, 'taher.csv'),
    path.join(__dirname, '../taher.csv'),
    path.join(__dirname, '../../taher.csv'),
    path.resolve('backend/scripts/taher.csv'),
    path.resolve('scripts/taher.csv'),
    path.resolve('/app/scripts/taher.csv'),
    path.resolve('/app/taher.csv'),
  ];

  let csvPath = candidatePaths.find(p => fs.existsSync(p));
  if (!csvPath) {
    throw new Error(`taher.csv not found in candidate paths: ${candidatePaths.join(', ')}`);
  }

  console.log(`Reading taher.csv from: ${csvPath}`);
  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content);
  const dataRows = rows.slice(1);

  let lastLead = null;
  const groupedLeads = [];

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const leadDate = r[0] || '';
    const projectName = r[1] || '';
    const groupName = r[2] || projectName;
    const gstName = r[3] || projectName;
    const gstNo = r[4] || '';
    const siteIncharge = r[5] || '';
    const siteInchargeMobile = r[6] || '';
    const officeContact = r[7] || '';
    const email = r[8] || 'info@thehimalaya.co.in';
    const address = r[11] || '';
    const state = r[12] || 'Gujarat';
    const city = r[13] || '';
    const pincode = r[14] || '';

    const productType = (r[15] || '').trim();
    const size = (r[16] || '').trim();
    const capacity = (r[17] || '').trim();
    const qty = parseFloat(r[18]) || 1;
    const specification = (r[19] || '').trim();
    const unitPrice = parseFloat(r[20]) || 0;
    const subTotal = parseFloat(r[21]) || (qty * unitPrice);
    const gst = r[22] || '18%';
    const gstAmount = parseFloat(r[23]) || (subTotal * 0.18);
    const discount = parseFloat(r[24]) || 0;
    const grandTotal = parseFloat(r[25]) || (subTotal + gstAmount);

    const hasLeadInfo = Boolean(projectName || groupName || gstName || gstNo);
    const hasProductInfo = Boolean(productType || size || capacity);
    if (!hasLeadInfo && !hasProductInfo) continue;

    // Build the EXACT product name as requested without altering product name
    const exactProductName = [productType, size, capacity].filter(Boolean).join(' ');

    const itemObj = {
      product: productType,
      size: size,
      capacity: capacity,
      productName: exactProductName,
      productCode: [productType, size.replace(/\s+/g, ''), capacity].filter(Boolean).join('-'),
      specification: `Product: ${productType} | Size: ${size} | Capacity: ${capacity} | Color: ${specification || 'GREY'} | Qty: ${qty} | Rate: ₹${unitPrice}`,
      color: specification || 'GREY',
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
      (leadDate === lastLead.leadDate || !leadDate) &&
      (projectName === lastLead.projectName || (!projectName && gstName === lastLead.gstName)) &&
      (gstNo === lastLead.gstNo || !gstNo) &&
      (siteInchargeMobile === lastLead.siteInchargeMobile || !siteInchargeMobile);

    if (isSameAsLast && hasProductInfo) {
      lastLead.items.push(itemObj);
      continue;
    }

    if (hasLeadInfo) {
      lastLead = {
        leadDate,
        projectName,
        groupName,
        gstName,
        gstNo,
        siteIncharge,
        siteInchargeMobile,
        officeContact,
        email,
        address,
        state,
        city,
        pincode,
        items: hasProductInfo ? [itemObj] : []
      };
      groupedLeads.push(lastLead);
    } else if (hasProductInfo && lastLead) {
      lastLead.items.push(itemObj);
    }
  }

  console.log(`Parsed ${groupedLeads.length} distinct grouped transactions from taher.csv.`);
  return groupedLeads;
}

async function syncSuperSales2CompletePipeline(config, groups) {
  console.log(`\n======================================================================`);
  console.log(`🚀 SYNCING SUPERSALES 2 COMPLETE LIFECYCLE (LEAD -> QUOTE -> ORDER -> PROD -> QC -> READY FOR DISPATCH)`);
  console.log(`Database: ${config.name}`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    // 1. Identify User
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
    const companyId = user.companyId || (await prisma.company.findFirst())?.id;
    console.log(`Resolved SuperSales 2 user: ${user.name} (${user.email} - ${user.id})`);

    // 2. Wipe previous SuperSales 2 records cleanly
    console.log('Cleaning previous SuperSales 2 records before full sync...');
    const existingOrders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { salesExecutiveId: userId },
          { createdById: userId },
          { orderNumber: { gte: 'HCPPL/2627/0145', lte: 'HCPPL/2627/0167' } }
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
          { quotationNumber: { gte: 'QT/2627/0145', lte: 'QT/2627/0167' } }
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

    try {
      await prisma.lead.deleteMany({
        where: {
          OR: [
            { salesExecutiveId: userId },
            { createdById: userId },
            { assignedToId: userId },
            { leadNumber: { gte: 'LD/2627/0145', lte: 'LD/2627/0167' } }
          ]
        }
      });
    } catch (e) {}

    // 3. Products & Workflow States
    let products = [];
    try {
      products = await prisma.product.findMany({ select: { id: true, name: true, sku: true, size: true, type: true, capacity: true } });
    } catch (e) {
      try { products = await prisma.$queryRawUnsafe(`SELECT id, name, sku FROM "Product"`); } catch (err) {}
    }
    const defaultProduct = products[0] || null;

    let leadWonState = null;
    let quoteApprovedState = null;
    let orderConfirmedState = null;
    let prodCompletedState = null;
    let woCompletedState = null;

    try {
      leadWonState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'LEAD' }, name: { contains: 'Won', mode: 'insensitive' } } });
      quoteApprovedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'QUOTATION' }, name: { contains: 'Approved', mode: 'insensitive' } } });
      orderConfirmedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'SALES_ORDER' }, name: { contains: 'Confirmed', mode: 'insensitive' } } });
      prodCompletedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'PRODUCTION_PLAN' }, name: { contains: 'Completed', mode: 'insensitive' } } }) ||
                           await prisma.workflowState.findFirst({ where: { workflow: { code: 'PRODUCTION_PLAN' }, name: { contains: 'Released', mode: 'insensitive' } } });
      woCompletedState = await prisma.workflowState.findFirst({ where: { workflow: { code: 'WORK_ORDER' }, name: { contains: 'Completed', mode: 'insensitive' } } }) ||
                         await prisma.workflowState.findFirst({ where: { workflow: { code: 'WORK_ORDER' }, name: { contains: 'In Progress', mode: 'insensitive' } } });
    } catch (e) {}

    let totalWorkOrdersCount = 0;
    const now = new Date();

    for (let idx = 0; idx < groups.length; idx++) {
      const g = groups[idx];
      const seqStr = String(144 + idx + 1).padStart(4, '0');
      const leadDateObj = parseCsvDate(g.leadDate);
      const parsedAddr = parseAddressObj(g.address, g.state, g.city, g.pincode);
      const companyName = (g.projectName || g.groupName || g.gstName || 'Himalaya Client').trim();
      const contactPerson = g.siteIncharge || 'Site Incharge';
      const phone = g.siteInchargeMobile || g.officeContact || 'N/A';
      const email = g.email || 'info@thehimalaya.co.in';
      const gstNumber = (g.gstNo && g.gstNo !== 'URD') ? g.gstNo : null;
      const gstName = g.gstName || companyName;

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

      // Calculate totals
      let subTotal = 0;
      let totalTax = 0;
      let grandTotal = 0;
      let totalQty = 0;

      const groupItemsData = g.items.map(it => {
        totalQty += it.quantity;
        subTotal += it.subTotal;
        totalTax += it.gstAmount;
        grandTotal += it.grandTotal;

        // Find matched product if possible
        const matchedProd = products.find(p => {
          const sku = (p.sku || '').toUpperCase();
          const name = (p.name || '').toUpperCase();
          const t = it.product.toUpperCase();
          const s = it.size.toUpperCase().replace(/\s+/g, '');
          const c = it.capacity.toUpperCase();
          return (sku.includes(t) || name.includes(t)) && (sku.includes(s) || name.includes(s)) && (sku.includes(c) || name.includes(c));
        }) || products.find(p => {
          const sku = (p.sku || '').toUpperCase();
          const name = (p.name || '').toUpperCase();
          const t = it.product.toUpperCase();
          const s = it.size.toUpperCase().replace(/\s+/g, '');
          return (sku.includes(t) || name.includes(t)) && (sku.includes(s) || name.includes(s));
        }) || defaultProduct;

        return {
          ...it,
          productRef: matchedProd,
          productId: matchedProd?.id || defaultProduct?.id || null
        };
      });

      const productInterestStr = groupItemsData
        .map(d => `${d.productName} (${d.quantity} Qty, ${d.color})`)
        .join(', ');

      // B. Create Lead (WON)
      const leadNumber = `LD/2627/${seqStr}`;
      const createdLead = await prisma.lead.create({
        data: {
          leadNumber,
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
          detailedItems: groupItemsData.map(gi => ({
            productId: gi.productId,
            productCode: gi.productCode,
            productName: gi.productName,
            specification: gi.specification,
            product: gi.product,
            size: gi.size,
            capacity: gi.capacity,
            color: gi.color,
            quantity: gi.quantity,
            unitPrice: gi.unitPrice,
            subTotal: gi.subTotal,
            tax: gi.tax,
            gstRate: gi.gstRate,
            gstAmount: gi.gstAmount,
            discount: gi.discount,
            grandTotal: gi.grandTotal
          })),
          estimatedQuantity: new Prisma.Decimal(totalQty),
          unit: 'SET',
          remarks: 'SuperSales 2 Lead (Converted to Quotation & Order)',
          workflowStateId: leadWonState?.id || null,
          assignedToId: userId,
          salesExecutiveId: userId,
          createdById: userId,
          companyId,
          customerId: customer.id,
          convertedCustomerId: customer.id,
          convertedAt: leadDateObj,
          convertedById: userId
        }
      });

      // C. Create Quotation (APPROVED)
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
              description: gi.productName, // EXACT PRODUCT NAME
              quantity: new Prisma.Decimal(gi.quantity),
              unitPrice: new Prisma.Decimal(gi.unitPrice),
              tax: new Prisma.Decimal(18),
              discount: new Prisma.Decimal(0),
              lineTotal: new Prisma.Decimal(gi.grandTotal)
            }))
          }
        }
      });

      // D. Create Sales Order (CONFIRMED)
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
          remarks: 'SuperSales 2 Order - Production & QC Passed - Ready For Dispatch',
          version: 1,
          createdAt: leadDateObj,
          items: {
            create: groupItemsData.map(gi => ({
              productId: gi.productId,
              productNameSnapshot: gi.productName, // EXACT PRODUCT NAME
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

      // E. Create Production Plan (COMPLETED / RELEASED)
      const planNumber = `PP/2627/${seqStr}`;
      const createdPlan = await prisma.productionPlan.create({
        data: {
          planNumber,
          salesOrderId: createdOrder.id,
          assignedToId: userId,
          status: 'COMPLETED',
          priority: 'NORMAL',
          plannedStartDate: leadDateObj,
          plannedEndDate: new Date(leadDateObj.getTime() + 7 * 24 * 60 * 60 * 1000),
          productionLine: 'Main FRP Molding Line',
          workflowStateId: prodCompletedState?.id || null,
          createdAt: leadDateObj
        }
      });

      // F. Create Work Orders (COMPLETED, READY_FOR_DISPATCH, QC PASSED)
      for (let itemIdx = 0; itemIdx < createdOrder.items.length; itemIdx++) {
        const orderItem = createdOrder.items[itemIdx];
        const woSeqStr = String(315 + (++totalWorkOrdersCount)).padStart(4, '0');
        const workOrderNumber = `WO/2627/${woSeqStr}`;

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

        // G. Create Production Batch
        const batchNumber = `BATCH/2627/${woSeqStr}`;
        await prisma.productionBatch.create({
          data: {
            batchNumber,
            workOrderId: createdWO.id,
            quantity: orderItem.orderedQuantity,
            createdAt: leadDateObj
          }
        });

        // H. Create QC Inspection (PASSED)
        await prisma.qCInspection.create({
          data: {
            workOrderId: createdWO.id,
            status: 'PASSED',
            approvedQuantity: orderItem.orderedQuantity,
            rejectedQuantity: new Prisma.Decimal(0),
            remarks: 'Technical QC Passed - All Dimension, Load & Visual Checks OK',
            approvedAt: now,
            inspectorId: userId,
            createdAt: leadDateObj
          }
        });
      }

      console.log(`  ✔ [${idx + 1}/23] Lead [${leadNumber}] -> Quote [${quotationNumber}] -> Order [${orderNumber}] -> Plan [${planNumber}] -> Ready to Dispatch!`);
    }

    // 4. Update ID Sequences
    try {
      await prisma.idSequence.upsert({ where: { key: 'lead_number_2627' }, update: { nextValue: 168 }, create: { key: 'lead_number_2627', nextValue: 168 } });
      await prisma.idSequence.upsert({ where: { key: 'quotation_number_2627' }, update: { nextValue: 168 }, create: { key: 'quotation_number_2627', nextValue: 168 } });
      await prisma.idSequence.upsert({ where: { key: 'sales_order_number_2627' }, update: { nextValue: 168 }, create: { key: 'sales_order_number_2627', nextValue: 168 } });
      await prisma.idSequence.upsert({ where: { key: 'production_plan_number_2627' }, update: { nextValue: 168 }, create: { key: 'production_plan_number_2627', nextValue: 168 } });
      await prisma.idSequence.upsert({ where: { key: 'work_order_number_2627' }, update: { nextValue: 316 + totalWorkOrdersCount }, create: { key: 'work_order_number_2627', nextValue: 316 + totalWorkOrdersCount } });
    } catch (e) {}

    console.log(`\n======================================================================`);
    console.log(`🎉 COMPLETE LIFECYCLE SYNCED SUCCESSFULLY FOR ${config.name}!`);
    console.log(`   - Leads Created (WON)               : ${groups.length}`);
    console.log(`   - Quotations Created (APPROVED)     : ${groups.length}`);
    console.log(`   - Sales Orders Created (CONFIRMED)  : ${groups.length}`);
    console.log(`   - Production Plans (COMPLETED)      : ${groups.length}`);
    console.log(`   - Work Orders (READY_FOR_DISPATCH)  : ${totalWorkOrdersCount}`);
    console.log(`   - Production Batches Generated      : ${totalWorkOrdersCount}`);
    console.log(`   - QC Inspections (PASSED)           : ${totalWorkOrdersCount}`);
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
    await syncSuperSales2CompletePipeline(target, groups);
  }
}

main().catch(console.error);
