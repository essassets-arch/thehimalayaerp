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
    else if (/JAMNAGAR/i.test(line1)) city = 'Jamnagar';
    else if (/SURAT/i.test(line1)) city = 'Surat';
    else if (/VADODARA/i.test(line1)) city = 'Vadodara';
    else if (/GANDHINAGAR/i.test(line1)) city = 'Gandhinagar';
    else if (/CHENNAI/i.test(line1)) city = 'Chennai';
    else if (/MUMBAI/i.test(line1)) city = 'Mumbai';
    else if (/BENGALURU|BANGALORE/i.test(line1)) city = 'Bengaluru';
    else if (/RAJKOT/i.test(line1)) city = 'Rajkot';
    else if (/MORBI/i.test(line1)) city = 'Morbi';
    else city = 'Ahmedabad';
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
    city: city || 'Ahmedabad',
    state: state || 'Gujarat',
    country: 'India',
    pincode: pincode || '380001'
  };
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
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "size" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "capacity" TEXT;`
  ];

  for (const s of statements) {
    try {
      await prisma.$executeRawUnsafe(s);
    } catch (e) {}
  }
}

async function importLeadsOnlyForDb(config, consolidatedLeads) {
  console.log(`\n======================================================================`);
  console.log(` IMPORTING LEADS ONLY INTO: ${config.name}`);
  console.log(` URL: ${config.url.replace(/:[^:@]+@/, ':****@')}`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    await alignDatabaseColumns(prisma);

    // 1. Resolve SuperSales 1 User
    const user = await prisma.user.findFirst({
      where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } }
    });

    if (!user) {
      console.error(`❌ User supersales1@himalayaerp.com not found in ${config.name}.`);
      return;
    }
    const userId = user.id;
    const companyId = user.companyId || (await prisma.company.findFirst())?.id;
    console.log(`Resolved SuperSales 1 user: ${user.name} (${user.id}) in company: ${companyId}`);

    // Update user name to "SuperSales 1"
    await prisma.user.update({
      where: { id: userId },
      data: { name: 'SuperSales 1' }
    });

    // 2. Resolve Lead Workflow State
    const leadState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'LEAD' }, isInitial: true }
    }) || await prisma.workflowState.findFirst({ where: { workflow: { code: 'LEAD' } } });

    // 3. Clear existing SuperSales 1 Sales Orders and Quotations created from CSV
    console.log('Removing any generated Sales Orders & Quotations for SuperSales 1...');
    const ss1Orders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { remarks: 'Imported from Hussain Sir Super Sales 1 CSV' }
        ]
      },
      select: { id: true }
    });
    const ss1OrderIds = ss1Orders.map(o => o.id);

    if (ss1OrderIds.length > 0) {
      const orderItems = await prisma.salesOrderItem.findMany({ where: { salesOrderId: { in: ss1OrderIds } }, select: { id: true } });
      const orderItemIds = orderItems.map(x => x.id);

      if (orderItemIds.length > 0) {
        try { await prisma.dispatchItem.deleteMany({ where: { salesOrderItemId: { in: orderItemIds } } }); } catch (e) {}
        try { await prisma.invoiceItem.deleteMany({ where: { salesOrderItemId: { in: orderItemIds } } }); } catch (e) {}
        try { await prisma.workOrder.deleteMany({ where: { salesOrderItemId: { in: orderItemIds } } }); } catch (e) {}
        try { await prisma.customerComplaintItem.deleteMany({ where: { orderItemId: { in: orderItemIds } } }); } catch (e) {}
      }

      try { await prisma.salesOrderItem.deleteMany({ where: { salesOrderId: { in: ss1OrderIds } } }); } catch (e) {}
      try { await prisma.salesOrderAllocation.deleteMany({ where: { salesOrderId: { in: ss1OrderIds } } }); } catch (e) {}
      try { await prisma.salesOrderCreditReview.deleteMany({ where: { salesOrderId: { in: ss1OrderIds } } }); } catch (e) {}
      try { await prisma.salesOrderLoss.deleteMany({ where: { salesOrderId: { in: ss1OrderIds } } }); } catch (e) {}
      try { await prisma.productionPlan.deleteMany({ where: { salesOrderId: { in: ss1OrderIds } } }); } catch (e) {}
      try { await prisma.salesOrder.deleteMany({ where: { id: { in: ss1OrderIds } } }); } catch (e) {}
    }

    const ss1Quotes = await prisma.quotation.findMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { remarks: 'Imported from Hussain Sir Super Sales 1 CSV' }
        ]
      },
      select: { id: true }
    });
    const ss1QuoteIds = ss1Quotes.map(q => q.id);
    if (ss1QuoteIds.length > 0) {
      try { await prisma.quotationItem.deleteMany({ where: { quotationId: { in: ss1QuoteIds } } }); } catch (e) {}
      try { await prisma.quotationTerm.deleteMany({ where: { quotationId: { in: ss1QuoteIds } } }); } catch (e) {}
      try { await prisma.quotation.deleteMany({ where: { id: { in: ss1QuoteIds } } }); } catch (e) {}
    }

    // Clear existing SuperSales 1 Leads
    console.log('Clearing existing SuperSales 1 Leads...');
    await prisma.lead.deleteMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { assignedToId: userId },
          { remarks: 'Imported from Hussain Sir Super Sales 1 CSV' }
        ]
      }
    });

    // 4. Resolve Products
    let products = [];
    try {
      products = await prisma.product.findMany();
    } catch (e) {
      products = await prisma.$queryRawUnsafe(`SELECT id, code, name, "unitPrice" FROM "Product"`);
    }
    const defaultProduct = products[0];

    // 5. Sequence numbering for SuperSales 1:
    // Format: LEAD/2627/0001 - LEAD/2627/0144
    let leadSeq = 1;
    let createdLeads = 0;

    console.log(`\nImporting ${consolidatedLeads.length} leads for SuperSales 1...`);

    for (const gl of consolidatedLeads) {
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
      if (gstNumber) {
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
            gstin: gstNumber,
            billingAddress: parsedAddress,
            shippingAddress: parsedAddress,
            companyId: companyId,
            status: 'ACTIVE'
          }
        });
      }

      // Map Line Items
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

      const leadYear = leadDateObj.getFullYear();
      const yy = String(leadYear).substring(2);
      const ny = String(leadYear + 1).substring(2);
      const fy = `${yy}${ny}`;

      let leadNumber = `LEAD/${fy}/${String(leadSeq++).padStart(4, '0')}`;
      while (await prisma.lead.findFirst({ where: { leadNumber }, select: { id: true } })) {
        leadNumber = `LEAD/${fy}/${String(leadSeq++).padStart(4, '0')}`;
      }

      const primaryProduct = detailedItems[0] || {};
      const productInterestStr = detailedItems.length === 1
        ? `${primaryProduct.product || ''} ${primaryProduct.size || ''} ${primaryProduct.capacity || ''} (${primaryProduct.quantity || 1} Qty, ${primaryProduct.color || 'GREY'})`
        : `${detailedItems.length} Products: ${detailedItems.map((d) => `${d.product} ${d.size} ${d.capacity}`).slice(0, 3).join(', ')}${detailedItems.length > 3 ? '...' : ''}`;

      // Create Lead Only
      await prisma.lead.create({
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
          gstNumber,
          address: parsedAddress,
          source: 'OTHER',
          productInterest: productInterestStr,
          detailedItems,
          estimatedQuantity: new Prisma.Decimal(totalQty || 1),
          unit: 'SET',
          remarks: 'Imported from Hussain Sir Super Sales 1 CSV',
          workflowStateId: leadState?.id || null,
          assignedToId: userId,
          salesExecutiveId: userId,
          createdById: userId,
          companyId,
          customerId: customer.id
        }
      });
      createdLeads++;
    }

    // Update Sequence for next creation
    await prisma.idSequence.upsert({
      where: { key: 'lead_number_2627' },
      update: { nextValue: leadSeq },
      create: { key: 'lead_number_2627', nextValue: leadSeq }
    });

    console.log(`✅ [${config.name}] Successfully imported:`);
    console.log(`   - ${createdLeads} Leads (LEAD/2627/0001 - LEAD/2627/${String(createdLeads).padStart(4, '0')})`);
    console.log(`   - Data populated ONLY in Leads tab (/supersales/leads)`);

  } catch (err) {
    console.error(`❌ Error in ${config.name}:`, err);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const candidatePaths = [
    path.join(__dirname, 'hussain_sir(super_sales1) (6).csv'),
    path.resolve('d:/prototype-next-main/backend/scripts/hussain_sir(super_sales1) (6).csv'),
    path.resolve('d:/prototype-next-main/hussain_sir(super_sales1) (6).csv'),
    path.resolve('hussain_sir(super_sales1) (6).csv'),
    path.join(__dirname, '../hussain_sir(super_sales1) (6).csv'),
    path.resolve('/app/scripts/hussain_sir(super_sales1) (6).csv'),
  ];

  let csvPath = candidatePaths.find(p => fs.existsSync(p));
  if (!csvPath) {
    console.error('CSV file not found.');
    process.exit(1);
  }

  console.log(`Reading CSV from: ${csvPath}`);
  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content);
  const rawHeaders = rows[0].map(h => h.trim().replace(/^\uFEFF/, ''));
  const dataRows = rows.slice(1);

  let lastLeadForCarry = null;
  const rawConsolidatedLeads = [];

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const obj = {};
    rawHeaders.forEach((h, idx) => {
      const cleanKey = h.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      obj[cleanKey] = r[idx] ? r[idx].trim() : '';
    });

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
        group_name: groupName || projectName || 'Unnamed Project',
        gst_name: gstName || projectName || 'Unnamed Project',
        gst_no: gstNo,
        site_incharge: siteIncharge,
        site_incharge_mobile: siteInchargeMobile,
        office_contact: officeContact,
        email: email,
        address: address,
        state: state,
        city: city,
        pincode: pincode,
        items: []
      };
      if (hasProductInfo) {
        lastLeadForCarry.items.push(itemObj);
      }
      rawConsolidatedLeads.push(lastLeadForCarry);
    } else if (hasProductInfo && lastLeadForCarry) {
      lastLeadForCarry.items.push(itemObj);
    } else if (hasProductInfo && !lastLeadForCarry) {
      lastLeadForCarry = {
        lead_date: leadDate,
        project_name: 'Direct Inquiries',
        group_name: 'Direct Inquiries',
        gst_name: 'Direct Inquiries',
        gst_no: '',
        site_incharge: siteIncharge,
        site_incharge_mobile: siteInchargeMobile,
        office_contact: officeContact,
        email: email,
        address: address,
        state: state,
        city: city,
        pincode: pincode,
        items: [itemObj]
      };
      rawConsolidatedLeads.push(lastLeadForCarry);
    }
  }

  const consolidatedLeads = rawConsolidatedLeads.filter(l => l.items && l.items.length > 0);
  console.log(`Parsed ${consolidatedLeads.length} valid consolidated leads.`);

  for (const db of targetDbs) {
    await importLeadsOnlyForDb(db, consolidatedLeads);
  }
}

main().catch(console.error);
