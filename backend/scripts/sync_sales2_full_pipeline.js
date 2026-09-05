const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const isDocker = fs.existsSync('/.dockerenv') || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:'));

const targetDbs = isDocker
  ? [{ name: 'Docker Database', url: process.env.DATABASE_URL }]
  : [
      { name: 'Active DB (himalaya_erp_browser_test)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
      { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' },
      { name: 'Docker DB 5435', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
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
        row.push(cell);
        cell = '';
      } else if (char === '\r' || char === '\n') {
        row.push(cell);
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
    row.push(cell);
    result.push(row);
  }
  return result;
}

function parseCsvDate(str) {
  if (!str) return new Date();
  str = str.trim();
  if (str === '-' || str === '') return new Date();

  let m = str.match(/^(\d{1,2})-(\d{1,2})0(\d{4})$/);
  if (m) {
    return new Date(Date.UTC(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (m) {
    let year = parseInt(m[3], 10);
    if (year === 2006) year = 2026;
    return new Date(Date.UTC(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{2})$/);
  if (m) {
    const year = 2000 + parseInt(m[3], 10);
    return new Date(Date.UTC(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) {
    let year = parseInt(m[3], 10);
    if (year === 2006) year = 2026;
    return new Date(Date.UTC(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
  }
  m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/);
  if (m) {
    const year = 2000 + parseInt(m[3], 10);
    return new Date(Date.UTC(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10), 6, 0, 0));
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
  if (s === '1200X900') s = '1200X1200';
  if (s === '600X260') s = '600X600';
  if (s === '450X1000') s = '600X900';
  if (s === '1800X1200') s = '1800X1800';
  if (s === '900X990') s = '900X900';
  if (s === '1200X600') s = '1200X1200';
  if (s === '750X750' && t === 'WGC') t = 'MHC';
  if (s === '1000X1000' && t === 'WGC') t = 'MHC';
  
  let c = (capacity || '').trim().toUpperCase();
  if (c === '3T') c = 'LD';
  
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
    if (pinMatch) {
      pincode = pinMatch[1];
    }
  }

  if (!city) {
    if (/SURAT/i.test(line1)) city = 'Surat';
    else if (/GANDHINAGAR/i.test(line1)) city = 'Gandhinagar';
    else if (/AHMEDABAD/i.test(line1)) city = 'Ahmedabad';
    else if (/JAMNAGAR/i.test(line1)) city = 'Jamnagar';
    else if (/VADODARA/i.test(line1)) city = 'Vadodara';
    else if (/CHENNAI/i.test(line1)) city = 'Chennai';
    else if (/MUMBAI/i.test(line1)) city = 'Mumbai';
    else if (/BENGALURU|BANGALORE/i.test(line1)) city = 'Bengaluru';
    else if (/RAJKOT/i.test(line1)) city = 'Rajkot';
    else if (/MORBI/i.test(line1)) city = 'Morbi';
  }

  if (!state) {
    if (/GUJARAT/i.test(line1)) state = 'Gujarat';
    else if (/TAMILNADU|TANIL NADU|TAMIL NADU/i.test(line1)) state = 'Tamil Nadu';
    else if (/MAHARASHTRA/i.test(line1)) state = 'Maharashtra';
    else if (/KARNATAKA|BENGALURU/i.test(line1)) state = 'Karnataka';
    else state = 'Gujarat';
  }

  return {
    line1: line1 || 'Address on file',
    city: city || 'Surat',
    state: state || 'Gujarat',
    country: 'India',
    pincode: pincode || '395002'
  };
}

function loadRushiLeads() {
  const candidatePaths = [
    path.join(__dirname, 'rushi_data(sales2) (4).csv'),
    path.resolve('rushi_data(sales2) (4).csv'),
    path.join(__dirname, '../rushi_data(sales2) (4).csv'),
    path.join(__dirname, '../../rushi_data(sales2) (4).csv'),
    path.resolve('/app/scripts/rushi_data(sales2) (4).csv'),
    path.resolve('/app/rushi_data(sales2) (4).csv'),
  ];

  let csvPath = candidatePaths.find(p => fs.existsSync(p));
  if (!csvPath) {
    throw new Error(`CSV file not found in candidates: ${candidatePaths.join(', ')}`);
  }

  console.log(`Reading CSV from: ${csvPath}`);
  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content);
  const rawHeaders = rows[0].map(h => h.trim().replace(/^\uFEFF/, ''));
  const dataRows = rows.slice(1);

  let lastLeadForCarry = null;
  const consolidatedLeads = [];

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const obj = {};
    rawHeaders.forEach((h, idx) => {
      const cleanKey = h.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      obj[cleanKey] = r[idx] ? r[idx].trim() : '';
    });

    const leadDate = obj.order_date || obj.lead_date || '';
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
      grand_total: grandTotal,
      row_index: i + 2
    };

    const isSameAsLast = lastLeadForCarry &&
      (leadDate === lastLeadForCarry.lead_date || !leadDate) &&
      (projectName === lastLeadForCarry.project_name || (!projectName && gstName === lastLeadForCarry.gst_name)) &&
      (gstNo === lastLeadForCarry.gst_no || !gstNo) &&
      (siteInchargeMobile === lastLeadForCarry.site_incharge_mobile || !siteInchargeMobile);

    if (isSameAsLast && hasProductInfo) {
      lastLeadForCarry.items.push(itemObj);
      continue;
    }

    if (hasLeadInfo) {
      lastLeadForCarry = {
        lead_date: leadDate,
        project_name: projectName || 'Unnamed Project',
        group_name: groupName,
        gst_name: gstName,
        gst_no: gstNo,
        site_incharge: siteIncharge,
        site_incharge_mobile: siteInchargeMobile,
        office_contact: officeContact,
        email: email,
        logged_in_sales_representive: 'sales2',
        address: address,
        state: state,
        city: city,
        pincode: pincode,
        items: hasProductInfo ? [itemObj] : []
      };
      consolidatedLeads.push(lastLeadForCarry);
    } else if (hasProductInfo && lastLeadForCarry) {
      lastLeadForCarry.items.push(itemObj);
    }
  }

  return consolidatedLeads;
}

async function syncSales2DataIntoDb(config, rushiLeads) {
  console.log(`\n======================================================================`);
  console.log(`🚀 IMPORTING SALES 2 DATA & CONVERTING TO QUOTATIONS & ORDERS`);
  console.log(`   Database: ${config.name}`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    // 1. Resolve User (Sales Two / Sales Executive 2)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: 'sales2@himalayaerp.com', mode: 'insensitive' } },
          { name: { equals: 'Sales Executive 2', mode: 'insensitive' } },
          { name: { equals: 'Sales Two', mode: 'insensitive' } },
          { name: { contains: 'Rushi', mode: 'insensitive' } }
        ]
      }
    });

    if (!user) {
      console.log(`⚠️ User sales2@himalayaerp.com not found in ${config.name}. Skipping.`);
      return;
    }
    const userId = user.id;
    console.log(`Resolved Sales 2 user: ${user.name} (${user.id}) [${user.email}]`);

    // 2. Clear existing Sales 2 leads, quotes, orders
    console.log('Clearing any existing Sales 2 Leads, Quotations & Orders...');
    const sales2Orders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { remarks: { contains: 'Sales 2', mode: 'insensitive' } },
          { remarks: { contains: 'Sales Two', mode: 'insensitive' } },
          { remarks: { contains: 'Rushi', mode: 'insensitive' } }
        ]
      },
      select: { id: true }
    });
    const orderIds = sales2Orders.map(o => o.id);
    if (orderIds.length > 0) {
      const soItems = await prisma.salesOrderItem.findMany({
        where: { salesOrderId: { in: orderIds } },
        select: { id: true }
      });
      const soItemIds = soItems.map(i => i.id);

      if (soItemIds.length > 0) {
        try { await prisma.dispatchItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
        try { await prisma.invoiceItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
        try { await prisma.workOrder.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
        try { await prisma.customerComplaintItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
        try { await prisma.replacementRequestItem.deleteMany({ where: { salesOrderItemId: { in: soItemIds } } }); } catch (e) {}
      }

      try { await prisma.customerPaymentAllocation.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderAllocation.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderHistory.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderCreditReview.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.orderAmendment.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: { in: orderIds } } }); } catch (e) {}
      try { await prisma.salesOrder.deleteMany({ where: { id: { in: orderIds } } }); } catch (e) {}
    }

    const sales2Quotes = await prisma.quotation.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { remarks: { contains: 'Sales 2', mode: 'insensitive' } },
          { remarks: { contains: 'Sales Two', mode: 'insensitive' } },
          { remarks: { contains: 'Rushi', mode: 'insensitive' } }
        ]
      },
      select: { id: true }
    });
    const quoteIds = sales2Quotes.map(q => q.id);
    if (quoteIds.length > 0) {
      try { await prisma.quotationTerm.deleteMany({ where: { quotationId: { in: quoteIds } } }); } catch (e) {}
      try { await prisma.quotationItem.deleteMany({ where: { quotationId: { in: quoteIds } } }); } catch (e) {}
      try { await prisma.quotation.deleteMany({ where: { id: { in: quoteIds } } }); } catch (e) {}
    }

    const existingUserLeads = await prisma.lead.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { assignedToId: userId }
        ]
      },
      select: { id: true }
    });
    const existingLeadIds = existingUserLeads.map(l => l.id);
    if (existingLeadIds.length > 0) {
      try { await prisma.leadActivity.deleteMany({ where: { leadId: { in: existingLeadIds } } }); } catch (e) {}
      try { await prisma.followUp.deleteMany({ where: { leadId: { in: existingLeadIds } } }); } catch (e) {}
      try { await prisma.lead.deleteMany({ where: { id: { in: existingLeadIds } } }); } catch (e) {}
    }

    // 3. Resolve Company & Workflow States
    const companyId = user.companyId || (await prisma.company.findFirst())?.id;
    if (!companyId) {
      console.error(`❌ No company found in ${config.name}.`);
      return;
    }

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

    // 4. Products Catalog
    let products = [];
    try {
      products = await prisma.product.findMany();
    } catch (e) {
      products = await prisma.$queryRawUnsafe(`SELECT id, code, name, "unitPrice", sku FROM "Product"`);
    }
    const defaultProduct = products[0];

    // 5. Sequence Numbering
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

    console.log(`Starting sequence counter: ${maxNum + 1}`);
    let seqCounter = maxNum + 1;

    let createdLeads = 0;
    let createdQuotes = 0;
    let createdOrders = 0;

    for (const gl of rushiLeads) {
      const detailedItems = gl.items.map((it) => {
        const matchedProd = findProduct(it.product, it.size, it.capacity, products) || defaultProduct;
        const productId = matchedProd ? matchedProd.id : defaultProduct?.id;
        const productCode = matchedProd ? (matchedProd.code || matchedProd.sku) : 'FRP';
        const productName = matchedProd ? matchedProd.name : `HIMALAYA FRP ${it.product} ${it.size} ${it.capacity}`;
        
        let unitPrice = it.unit_price;
        if (!unitPrice && matchedProd && matchedProd.unitPrice) {
          unitPrice = Number(matchedProd.unitPrice);
        }
        let subTotal = it.sub_total || (unitPrice * (it.qty || 1));
        let gstAmount = it.gst_amount || (subTotal * 0.18);
        let grandTotal = it.grand_total || (subTotal + gstAmount - (it.discount || 0));

        const specString = `Product: ${it.product} | Size: ${it.size} | Capacity: ${it.capacity} | Color: ${it.color} | Qty: ${it.qty} | Rate: ₹${unitPrice}`;

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
          unitPrice: unitPrice,
          subTotal: subTotal,
          tax: 18,
          gstRate: 18,
          gstAmount: gstAmount,
          discount: it.discount,
          grandTotal: grandTotal
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

      // Ensure / Find Customer
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

      // A. Create Lead (Converted)
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
          remarks: 'Imported from Rushi Sales 2 CSV',
          workflowStateId: leadState?.id || null,
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
      createdLeads++;

      // B. Create Quotation linked to Lead
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
        remarks: 'Imported from Rushi Sales 2 CSV',
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
      createdQuotes++;

      // C. Create Sales Order linked to Quotation & Lead
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
          remarks: 'Imported from Rushi Sales 2 CSV',
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
      createdOrders++;
    }

    // 6. Update ID Sequences
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
    console.log(`✅ [${config.name}] SUMMARY:`);
    console.log(`   - Leads Created            : ${createdLeads}`);
    console.log(`   - Quotations Created       : ${createdQuotes}`);
    console.log(`   - Sales Orders Created     : ${createdOrders} (Confirmed)`);
    console.log(`   - Full Pipeline Linked     : Leads -> Quotations -> Orders`);
    console.log(`   - Sales Representative     : ${user.name} (${user.email})`);
    console.log(`   - Next Sequence Counter    : ${seqCounter}`);
    console.log(`======================================================================\n`);

  } catch (e) {
    console.error(`❌ Error importing into ${config.name}:`, e);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const rushiLeads = loadRushiLeads();
  console.log(`Loaded ${rushiLeads.length} consolidated leads from Rushi (Sales 2) CSV.`);

  for (const db of targetDbs) {
    await syncSales2DataIntoDb(db, rushiLeads);
  }
}

main().catch(console.error);
