const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const isDocker = fs.existsSync('/.dockerenv') || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:'));

const targetDbs = isDocker
  ? [{ name: 'Docker Production Database', url: process.env.DATABASE_URL }]
  : [
      { name: 'Active Browser Test DB', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
      { name: 'Main Himalaya ERP DB', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
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
      else if (char === ',') { row.push(cell); cell = ''; }
      else if (char === '\r' || char === '\n') {
        row.push(cell);
        if (row.length > 1 || row[0] !== '') result.push(row);
        row = []; cell = '';
        if (char === '\r' && nextChar === '\n') i++;
      } else { cell += char; }
    }
  }
  if (cell !== '' || row.length > 0) { row.push(cell); result.push(row); }
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

function loadSuperSales2Leads() {
  const candidatePaths = [
    path.join(__dirname, 'taher_sir(super_sales2) (3).csv'),
    path.resolve('taher_sir(super_sales2) (3).csv'),
    path.join(__dirname, '../taher_sir(super_sales2) (3).csv'),
    path.join(__dirname, '../../taher_sir(super_sales2) (3).csv'),
    path.resolve('scripts/taher_sir(super_sales2) (3).csv'),
    path.resolve('backend/scripts/taher_sir(super_sales2) (3).csv'),
    path.resolve('/app/scripts/taher_sir(super_sales2) (3).csv'),
    path.resolve('/app/taher_sir(super_sales2) (3).csv'),
  ];

  let csvPath = candidatePaths.find(p => fs.existsSync(p));
  if (!csvPath) {
    throw new Error(`CSV file not found in candidate paths: ${candidatePaths.join(', ')}`);
  }

  console.log(`Reading SuperSales 2 CSV from: ${csvPath}`);
  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content);
  const headers = rows[0].map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'));
  const dataRows = rows.slice(1);

  let lastLead = null;
  const groupedLeads = [];

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = r[idx] ? r[idx].trim() : ''; });

    const leadDate = obj.lead_date || '';
    const projectName = obj.project_name || obj.group_name || obj.gst_name || '';
    const groupName = obj.group_name || projectName;
    const gstName = obj.gst_name || projectName;
    const gstNo = obj.gst_no || '';
    const siteIncharge = obj.site_incharge || 'Site Incharge';
    const siteInchargeMobile = obj.site_incharge_mobile || obj.office_contact || '';
    const officeContact = obj.office_contact || '';
    const email = obj.email || 'info@thehimalaya.co.in';
    const address = obj.address || '';
    const state = obj.state || 'Gujarat';
    const city = obj.city || '';
    const pincode = obj.pincode || '';

    const product = obj.product || '';
    const size = obj.size || '';
    const capacity = obj.capcity || obj.capacity || '';
    const qty = parseFloat(obj.qty) || 1;
    const color = obj.specification || obj.color || 'GREY';
    const unitPrice = parseFloat(obj.unit_pricew || obj.unit_price || 0) || 0;
    const subTotal = parseFloat(obj.sub_total || 0) || 0;
    const gst = obj.gst || '18%';
    const gstAmount = parseFloat(obj.gst_amount || 0) || 0;
    const discount = parseFloat(obj.discount || 0) || 0;
    const grandTotal = parseFloat(obj.grand_total || 0) || 0;

    const hasLeadInfo = Boolean(projectName || groupName || gstName || gstNo);
    const hasProductInfo = Boolean(product || size || capacity);
    if (!hasLeadInfo && !hasProductInfo) continue;

    const itemObj = {
      product,
      size,
      capacity,
      qty,
      color,
      unit_price: unitPrice,
      sub_total: subTotal,
      gst,
      gst_amount: gstAmount,
      discount,
      grand_total: grandTotal
    };

    const isSameAsLast = lastLead &&
      (leadDate === lastLead.lead_date || !leadDate) &&
      (projectName === lastLead.project_name || (!projectName && gstName === lastLead.gst_name)) &&
      (gstNo === lastLead.gst_no || !gstNo) &&
      (siteInchargeMobile === lastLead.site_incharge_mobile || !siteInchargeMobile);

    if (isSameAsLast && hasProductInfo) {
      lastLead.items.push(itemObj);
      continue;
    }

    if (hasLeadInfo) {
      lastLead = {
        lead_date: leadDate,
        project_name: projectName,
        group_name: groupName,
        gst_name: gstName,
        gst_no: gstNo,
        site_incharge: siteIncharge,
        site_incharge_mobile: siteInchargeMobile,
        office_contact: officeContact,
        email: email,
        address: address,
        state: state,
        city: city,
        pincode: pincode,
        items: hasProductInfo ? [itemObj] : []
      };
      groupedLeads.push(lastLead);
    } else if (hasProductInfo && lastLead) {
      lastLead.items.push(itemObj);
    }
  }

  console.log(`Parsed ${groupedLeads.length} distinct leads for SuperSales 2 from CSV.`);
  return groupedLeads;
}

async function syncSuperSales2FullPipeline(config, leadsList) {
  console.log(`\n======================================================================`);
  console.log(`🚀 SYNCING SUPERSALES 2 (LEADS, QUOTATIONS & ORDERS) IN: ${config.name}`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    // 1. Resolve SuperSales 2 User
    const user = await prisma.user.findFirst({
      where: { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } }
    });

    if (!user) {
      console.log(`❌ User supersales2@himalayaerp.com not found in ${config.name}. Skipping.`);
      return;
    }
    const userId = user.id;
    const companyId = user.companyId || (await prisma.company.findFirst())?.id;
    console.log(`Resolved SuperSales 2 user: ${user.name} (${user.id})`);

    // 2. Cascade Delete all existing Orders, Production, Dispatches, Invoices, Quotes, Leads for SuperSales 2
    console.log('Cleaning existing records for fresh pipeline sync...');
    const orders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { remarks: { contains: 'Super Sales 2', mode: 'insensitive' } },
          { remarks: { contains: 'SuperSales 2', mode: 'insensitive' } }
        ]
      },
      select: { id: true, orderNumber: true }
    });
    const orderIds = orders.map(o => o.id);

    if (orderIds.length > 0) {
      const soItems = await prisma.salesOrderItem.findMany({
        where: { salesOrderId: { in: orderIds } },
        select: { id: true }
      });
      const soItemIds = soItems.map(i => i.id);

      // A. Production Plans & Work Orders
      const prodPlans = await prisma.productionPlan.findMany({
        where: {
          OR: [
            { salesOrderId: { in: orderIds } },
            { assignedToId: userId }
          ]
        },
        select: { id: true }
      });
      const planIds = prodPlans.map(p => p.id);

      const workOrders = await prisma.workOrder.findMany({
        where: {
          OR: [
            { productionPlanId: { in: planIds } },
            { salesOrderItemId: { in: soItemIds } },
            { createdById: userId }
          ]
        },
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
        try { await prisma.productionDailyReportItem.deleteMany({ where: { workOrderId: { in: workOrderIds } } }); } catch (e) {}
        try { await prisma.workOrder.deleteMany({ where: { id: { in: workOrderIds } } }); } catch (e) {}
      }

      if (planIds.length > 0) {
        try { await prisma.productionPlan.deleteMany({ where: { id: { in: planIds } } }); } catch (e) {}
      }

      // B. Dispatches
      const dispatches = await prisma.dispatch.findMany({
        where: {
          OR: [
            { salesOrderId: { in: orderIds } },
            { createdById: userId }
          ]
        },
        select: { id: true }
      });
      const dispatchIds = dispatches.map(d => d.id);

      if (dispatchIds.length > 0) {
        try { await prisma.dispatchTracking.deleteMany({ where: { dispatchId: { in: dispatchIds } } }); } catch (e) {}
        try { await prisma.dispatchItem.deleteMany({ where: { dispatchId: { in: dispatchIds } } }); } catch (e) {}
        try { await prisma.dispatchDailyReportItem.deleteMany({ where: { dispatchId: { in: dispatchIds } } }); } catch (e) {}
        try { await prisma.dispatch.deleteMany({ where: { id: { in: dispatchIds } } }); } catch (e) {}
      }

      if (soItemIds.length > 0) {
        try { await prisma.dispatchItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
        try { await prisma.invoiceItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
        try { await prisma.customerComplaintItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
        try { await prisma.replacementRequestItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
      }

      // C. Invoices & Payments
      const invoices = await prisma.salesInvoice.findMany({
        where: {
          OR: [
            { salesOrderId: { in: orderIds } },
            { createdById: userId }
          ]
        },
        select: { id: true }
      });
      const invoiceIds = invoices.map(inv => inv.id);

      if (invoiceIds.length > 0) {
        try { await prisma.invoiceItem.deleteMany({ where: { invoiceId: { in: invoiceIds } } }); } catch (e) {}
        try { await prisma.customerPaymentAllocation.deleteMany({ where: { invoiceId: { in: invoiceIds } } }); } catch (e) {}
        try { await prisma.salesInvoice.deleteMany({ where: { id: { in: invoiceIds } } }); } catch (e) {}
      }

      try { await prisma.customerPaymentAllocation.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderAllocation.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderHistory.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderCreditReview.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.orderAmendment.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      await prisma.salesOrder.deleteMany({ where: { id: { in: orderIds } } });
      console.log(`✓ Deleted ${orderIds.length} existing Sales Orders.`);
    }

    // D. Quotations
    const quotes = await prisma.quotation.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { remarks: { contains: 'Super Sales 2', mode: 'insensitive' } },
          { remarks: { contains: 'SuperSales 2', mode: 'insensitive' } }
        ]
      },
      select: { id: true }
    });
    const quoteIds = quotes.map(q => q.id);
    if (quoteIds.length > 0) {
      try { await prisma.quotationTerm.deleteMany({ where: { quotationId: { in: quoteIds } } }); } catch (e) {}
      try { await prisma.quotationItem.deleteMany({ where: { quotationId: { in: quoteIds } } }); } catch (e) {}
      await prisma.quotation.deleteMany({ where: { id: { in: quoteIds } } });
      console.log(`✓ Deleted ${quoteIds.length} existing Quotations.`);
    }

    // E. Clear previous leads for SuperSales 2
    const deletedLeads = await prisma.lead.deleteMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { assignedToId: userId },
          { remarks: { contains: 'Super Sales 2', mode: 'insensitive' } },
          { remarks: { contains: 'SuperSales 2', mode: 'insensitive' } }
        ]
      }
    });
    console.log(`✓ Cleared ${deletedLeads.count} existing leads for SuperSales 2.`);

    // 3. Resolve initial workflow states and products
    const leadState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'LEAD' }, isInitial: true }
    }) || await prisma.workflowState.findFirst({
      where: { workflow: { code: 'LEAD' } }
    });

    const quoteState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'QUOTATION' }, isInitial: true }
    }) || await prisma.workflowState.findFirst({
      where: { workflow: { code: 'QUOTATION' } }
    });

    const orderState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'SALES_ORDER' } }
    });

    let products = [];
    try {
      products = await prisma.product.findMany();
    } catch (e) {
      products = await prisma.$queryRawUnsafe(`SELECT id, code, name, "unitPrice", sku FROM "Product"`);
    }
    const defaultProduct = products[0];

    // 4. Determine starting sequence counter across all models
    const existingLeads = await prisma.lead.findMany({ select: { leadNumber: true } });
    const existingQuotes = await prisma.quotation.findMany({ select: { quotationNumber: true } });
    const existingOrders = await prisma.salesOrder.findMany({ select: { orderNumber: true } });

    let maxNum = 0;
    for (const l of existingLeads) {
      if (l.leadNumber) {
        const match = l.leadNumber.match(/(?:LEAD(?:\/\d{4}\/|-)|HCCL\/\d{4}\/)(\d{1,6})$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num < 1000000 && num > maxNum) maxNum = num;
        }
      }
    }
    for (const q of existingQuotes) {
      if (q.quotationNumber) {
        const match = q.quotationNumber.match(/(?:QU(?:\/\d{4}\/|-))(\d{1,6})$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num < 1000000 && num > maxNum) maxNum = num;
        }
      }
    }
    for (const o of existingOrders) {
      if (o.orderNumber) {
        const match = o.orderNumber.match(/(?:HCPPL(?:\/\d{4}\/|-)|SO(?:\/\d{4}\/|-))(\d{1,6})$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num < 1000000 && num > maxNum) maxNum = num;
        }
      }
    }

    let seqCounter = maxNum + 1;
    console.log(`Starting sequence counter across models: ${seqCounter}`);

    let createdCount = 0;

    for (const gl of leadsList) {
      const detailedItems = gl.items.map((it) => {
        const matchedProd = findProduct(it.product, it.size, it.capacity, products) || defaultProduct;
        const productId = matchedProd ? matchedProd.id : defaultProduct?.id;
        const productCode = matchedProd ? (matchedProd.code || matchedProd.sku) : 'FRP';
        const productName = matchedProd ? matchedProd.name : `HIMALAYA FRP ${it.product} ${it.size} ${it.capacity}`;
        
        const specString = `Product: ${it.product} | Size: ${it.size} | Capacity: ${it.capacity} | Color: ${it.color} | Qty: ${it.qty} | Rate: ₹${it.unit_price}`;

        return {
          productId,
          productCode,
          productName,
          specification: specString,
          product: it.product,
          size: it.size,
          capacity: it.capacity,
          color: it.color,
          quantity: it.qty,
          unitPrice: it.unit_price,
          subTotal: it.sub_total,
          tax: 18,
          gstRate: 18,
          gstAmount: it.gst_amount,
          discount: it.discount,
          grandTotal: it.grand_total
        };
      });

      const totalQty = detailedItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
      const subtotalVal = detailedItems.reduce((acc, item) => acc + (Number(item.subTotal) || 0), 0);
      const taxVal = detailedItems.reduce((acc, item) => acc + (Number(item.gstAmount) || 0), 0);
      const discountVal = detailedItems.reduce((acc, item) => acc + (Number(item.discount) || 0), 0);
      const grandTotalVal = detailedItems.reduce((acc, item) => acc + (Number(item.grandTotal) || 0), 0);

      const leadDateObj = parseCsvDate(gl.lead_date);
      const parsedAddress = parseAddressObj(gl.address, gl.state, gl.city, gl.pincode);
      const companyName = (gl.project_name || gl.group_name || gl.gst_name || 'Himalaya Client').trim();
      const contactPerson = gl.site_incharge || 'Site Incharge';
      const phone = gl.site_incharge_mobile || gl.office_contact || 'N/A';
      const email = gl.email || 'info@thehimalaya.co.in';
      const gstNumber = gl.gst_no || null;
      const gstName = gl.gst_name || companyName;

      // Find or create Customer
      let customer = null;
      if (gstNumber && gstNumber !== 'URD') {
        customer = await prisma.customer.findFirst({
          where: { companyId, gstin: gstNumber }
        });
      }
      if (!customer) {
        customer = await prisma.customer.findFirst({
          where: { companyId, companyName: { equals: companyName, mode: 'insensitive' } }
        });
      }
      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            companyName,
            contactPerson,
            email,
            phone,
            gstin: (gstNumber && gstNumber !== 'URD') ? gstNumber : null,
            billingAddress: parsedAddress,
            shippingAddress: parsedAddress,
            companyId,
            status: 'ACTIVE'
          }
        });
      }

      let seqStr = String(seqCounter).padStart(4, '0');
      let leadNumber = `LEAD/2627/${seqStr}`;
      let quotationNumber = `QU/2627/${seqStr}`;
      let orderNumber = `HCPPL/2627/${seqStr}`;

      while (
        (await prisma.lead.findFirst({ where: { leadNumber }, select: { id: true } })) ||
        (await prisma.quotation.findFirst({ where: { quotationNumber }, select: { id: true } })) ||
        (await prisma.salesOrder.findFirst({ where: { orderNumber }, select: { id: true } }))
      ) {
        seqCounter++;
        seqStr = String(seqCounter).padStart(4, '0');
        leadNumber = `LEAD/2627/${seqStr}`;
        quotationNumber = `QU/2627/${seqStr}`;
        orderNumber = `HCPPL/2627/${seqStr}`;
      }
      seqCounter++;

      const primaryProduct = detailedItems[0] || {};
      const productInterestStr = detailedItems.length === 1
        ? `${primaryProduct.product || ''} ${primaryProduct.size || ''} ${primaryProduct.capacity || ''} (${primaryProduct.quantity || 1} Qty, ${primaryProduct.color || 'GREY'})`
        : `${detailedItems.length} Products: ${detailedItems.map((d) => `${d.product} ${d.size} ${d.capacity}`).slice(0, 3).join(', ')}${detailedItems.length > 3 ? '...' : ''}`;

      // A. Create Lead
      const createdLead = await prisma.lead.create({
        data: {
          leadNumber,
          leadDate: leadDateObj,
          companyName,
          groupName: gl.group_name || companyName,
          projectName: gl.project_name || companyName,
          contactPerson,
          email,
          phone,
          gstName,
          gstNumber: (gstNumber && gstNumber !== 'URD') ? gstNumber : null,
          address: parsedAddress,
          source: 'OTHER',
          productInterest: productInterestStr,
          detailedItems,
          estimatedQuantity: new Prisma.Decimal(totalQty || 1),
          unit: 'SET',
          remarks: 'Imported from Taher Sir Super Sales 2 CSV',
          workflowStateId: leadState?.id || null,
          assignedToId: userId,
          salesExecutiveId: userId,
          createdById: userId,
          companyId,
          customerId: customer.id
        }
      });

      // B. Create Quotation
      const quotationBaseData = {
        quotationNumber,
        companyId,
        workflowStateId: quoteState?.id || null,
        leadId: createdLead.id,
        customerId: customer.id,
        salesExecutiveId: userId,
        createdById: userId,
        subtotal: new Prisma.Decimal(subtotalVal),
        discount: new Prisma.Decimal(discountVal),
        tax: new Prisma.Decimal(taxVal),
        total: new Prisma.Decimal(grandTotalVal),
        expectedTransportationCost: new Prisma.Decimal(0),
        remarks: 'Imported from Taher Sir Super Sales 2 CSV',
        version: 1,
        createdAt: leadDateObj,
        items: {
          create: detailedItems.map(it => ({
            productId: it.productId || defaultProduct?.id,
            description: it.productName,
            quantity: new Prisma.Decimal(it.quantity || 1),
            unitPrice: new Prisma.Decimal(it.unitPrice || 0),
            tax: new Prisma.Decimal(it.gstRate || 18),
            discount: new Prisma.Decimal(it.discount || 0),
            lineTotal: new Prisma.Decimal(it.grandTotal || 0)
          }))
        }
      };

      let createdQuote = null;
      try {
        createdQuote = await prisma.quotation.create({
          data: {
            ...quotationBaseData,
            selectedTerms: {
              create: [
                { termId: 'payment-terms', text: 'Payment Terms', sortOrder: 1 },
                { termId: 'unloading-breakage', text: 'Unloading at Client scope & breakage risk & responsibility', sortOrder: 2 },
                { termId: 'delivery-timeline', text: 'Delivery timeline', sortOrder: 3 },
                { termId: 'jurisdiction', text: 'Any Dispute Shall Be Subject To Ahmedabad Jurisdiction', sortOrder: 4 },
                { termId: 'manufacturer-test-report', text: 'Manufacturer Test Report shall be provided', sortOrder: 5 }
              ]
            }
          }
        });
      } catch (termErr) {
        createdQuote = await prisma.quotation.create({
          data: quotationBaseData
        });
      }

      // C. Create Sales Order
      await prisma.salesOrder.create({
        data: {
          orderNumber,
          customerId: customer.id,
          quotationId: createdQuote.id,
          sourceQuotationId: createdQuote.id,
          salesExecutiveId: userId,
          createdById: userId,
          orderDate: leadDateObj,
          status: 'CONFIRMED',
          workflowStateId: orderState?.id || null,
          subtotal: new Prisma.Decimal(subtotalVal),
          taxableAmount: new Prisma.Decimal(subtotalVal),
          taxAmount: new Prisma.Decimal(taxVal),
          discountAmount: new Prisma.Decimal(discountVal),
          freightAmount: new Prisma.Decimal(0),
          totalAmount: new Prisma.Decimal(grandTotalVal),
          currency: 'INR',
          paidAmount: new Prisma.Decimal(0),
          outstandingAmount: new Prisma.Decimal(grandTotalVal),
          paymentStatus: 'PENDING',
          billingAddress: parsedAddress,
          shippingAddress: parsedAddress,
          remarks: 'Imported from Taher Sir Super Sales 2 CSV',
          version: 1,
          createdAt: leadDateObj,
          items: {
            create: detailedItems.map(it => ({
              productId: it.productId || defaultProduct?.id,
              productNameSnapshot: it.productName,
              productCodeSnapshot: it.productCode,
              specifications: {
                product: it.product,
                size: it.size,
                capacity: it.capacity,
                color: it.color
              },
              orderedQuantity: new Prisma.Decimal(it.quantity || 1),
              unit: 'SET',
              unitPrice: new Prisma.Decimal(it.unitPrice || 0),
              discountAmount: new Prisma.Decimal(it.discount || 0),
              taxableAmount: new Prisma.Decimal(it.subTotal || 0),
              taxRate: new Prisma.Decimal(it.gstRate || 18),
              taxAmount: new Prisma.Decimal(it.gstAmount || 0),
              lineTotal: new Prisma.Decimal(it.grandTotal || 0)
            }))
          }
        }
      });

      createdCount++;
    }

    // 5. Update ID Sequences
    const currentFY = '2627';
    await prisma.idSequence.upsert({
      where: { key: `lead_number_${currentFY}` },
      update: { nextValue: seqCounter },
      create: { key: `lead_number_${currentFY}`, nextValue: seqCounter }
    });
    await prisma.idSequence.upsert({
      where: { key: `quotation_number_${currentFY}` },
      update: { nextValue: seqCounter },
      create: { key: `quotation_number_${currentFY}`, nextValue: seqCounter }
    });
    await prisma.idSequence.upsert({
      where: { key: `sales_order_number_${currentFY}` },
      update: { nextValue: seqCounter },
      create: { key: `sales_order_number_${currentFY}`, nextValue: seqCounter }
    });
    await prisma.idSequence.upsert({
      where: { key: 'lead_number' },
      update: { nextValue: seqCounter },
      create: { key: 'lead_number', nextValue: seqCounter }
    });
    await prisma.idSequence.upsert({
      where: { key: 'quotation_number' },
      update: { nextValue: seqCounter },
      create: { key: 'quotation_number', nextValue: seqCounter }
    });
    await prisma.idSequence.upsert({
      where: { key: 'sales_order_number' },
      update: { nextValue: seqCounter },
      create: { key: 'sales_order_number', nextValue: seqCounter }
    });

    console.log(`\n======================================================================`);
    console.log(`✅ FINAL STATUS FOR SUPERSALES 2 (${user.email}):`);
    console.log(`   - Leads Created       : ${createdCount}`);
    console.log(`   - Quotations Created  : ${createdCount}`);
    console.log(`   - Sales Orders Created: ${createdCount}`);
    console.log(`======================================================================\n`);

  } catch (err) {
    console.error(`❌ Error in ${config.name}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const leadsList = loadSuperSales2Leads();
  console.log(`Loaded ${leadsList.length} leads for SuperSales 2.`);

  for (const db of targetDbs) {
    await syncSuperSales2FullPipeline(db, leadsList);
  }
}

main().catch(console.error);
