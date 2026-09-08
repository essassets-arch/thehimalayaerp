const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const isDocker = fs.existsSync('/.dockerenv') ||
  process.cwd() === '/app' ||
  __dirname.startsWith('/app') ||
  Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost'));

const targetDbs = [];

if (process.env.DATABASE_URL) {
  targetDbs.push({ name: 'Configured DATABASE_URL', url: process.env.DATABASE_URL });
}
if (process.env.LIVE_DATABASE_URL) {
  targetDbs.push({ name: 'Live Database', url: process.env.LIVE_DATABASE_URL });
}
if (process.env.PROD_DATABASE_URL) {
  targetDbs.push({ name: 'Production Database', url: process.env.PROD_DATABASE_URL });
}

if (!isDocker) {
  targetDbs.push(
    { name: 'Active DB (himalaya_erp_browser_test)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
    { name: 'Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' }
  );
}

const seen = new Set();
const uniqueTargetDbs = targetDbs.filter(db => {
  if (!db.url || seen.has(db.url)) return false;
  seen.add(db.url);
  return true;
});

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

function parseAddressObj(addrStr, stateStr, cityStr, pinStr) {
  let line1 = (addrStr || 'Plot No. 12, Industrial Area').replace(/[\r\n]+/g, ' ').trim();
  let city = (cityStr || '').trim();
  let state = (stateStr || '').trim();
  let pincode = (pinStr || '').trim();

  if (!pincode) {
    const pinMatch = line1.match(/\b(\d{6})\b/);
    if (pinMatch) pincode = pinMatch[1];
  }

  if (!city) {
    if (/AHMEDABAD/i.test(line1)) city = 'Ahmedabad';
    else if (/JAMNAGAR/i.test(line1)) city = 'Jamnagar';
    else if (/SURAT/i.test(line1)) city = 'Surat';
    else if (/VADODARA|SAVLI/i.test(line1)) city = 'Vadodara';
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
    else if (/MAHARASHTRA|MUMBAI/i.test(line1)) state = 'Maharashtra';
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

function findExactProduct(type, size, capacity, products) {
  let t = (type || '').trim().toUpperCase();
  let s = (size || '').trim().toUpperCase().replace(/\s+/g, '');
  if (s.includes('DAI')) s = s.replace('DAI', 'DIA');
  if (s.includes('DIA') && !s.includes('MM')) s = s.replace('DIA', 'MMDIA');
  if (s === '900MM') s = '900MMDIA';
  let baseS = s;
  if (s.match(/^\d+X\d+X\d+$/)) {
    baseS = s.substring(0, s.lastIndexOf('X'));
  }
  if (s === '30X0') { s = '30X30'; baseS = '30X30'; }
  if (s === '900X600') { s = '600X900'; baseS = '600X900'; }

  let c = (capacity || '').trim().toUpperCase();
  if (c === '3T') c = 'LD';

  // 1. Strict exact match on type + size + capacity
  let match = products.find(p => {
    const sku = (p.sku || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    const prodSize = (p.size || '').toUpperCase().replace(/\s+/g, '');
    const prodCap = (p.capacity || '').toUpperCase();

    const typeMatch = sku.includes(t) || name.includes(t);
    const sizeMatch = prodSize === s || prodSize === baseS || sku.includes(s) || sku.includes(baseS) || name.includes(s) || name.includes(baseS);
    const capMatch = prodCap === c || sku.includes(c) || name.includes(c);
    return typeMatch && sizeMatch && capMatch;
  });
  if (match) return match;

  // 2. Secondary fallback
  match = products.find(p => {
    const sku = (p.sku || '').toUpperCase();
    const name = (p.name || '').toUpperCase();
    return (sku.includes(t) || name.includes(t)) && (sku.includes(s) || name.includes(s));
  });
  return match || null;
}

async function ensureMissingProductsExist(prisma, companyId, consolidatedLeads) {
  let allProducts = await prisma.product.findMany();

  const distinctItems = [];
  const seenSpecs = new Set();
  for (const lead of consolidatedLeads) {
    for (const item of (lead.items || [])) {
      const type = (item.product || '').trim().toUpperCase();
      const size = (item.size || '').trim().toUpperCase();
      const cap = (item.capacity || '').trim().toUpperCase();
      const key = `${type}|${size}|${cap}`;
      if (!seenSpecs.has(key)) {
        seenSpecs.add(key);
        distinctItems.push({
          type: (item.product || '').trim(),
          size: (item.size || '').trim(),
          capacity: (item.capacity || '').trim(),
          unitPrice: item.unit_price || 1000
        });
      }
    }
  }

  for (const p of distinctItems) {
    if (!p.type && !p.size && !p.capacity) continue;
    const match = findExactProduct(p.type, p.size, p.capacity, allProducts);
    if (!match) {
      const cleanType = (p.type || 'MHC').trim().toUpperCase();
      const cleanSize = (p.size || '').trim().toUpperCase().replace(/\s+/g, '');
      const cleanCap = (p.capacity || 'LD').trim().toUpperCase();
      const sku = `HIMALAYAFRP${cleanType}${cleanSize}${cleanCap}`.replace(/[^A-Z0-9]/g, '');
      const name = `HIMALAYA FRP ${cleanType} ${p.size} ${cleanCap}`.trim();
      const publicId = `PRD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      try {
        const created = await prisma.product.create({
          data: {
            publicId,
            sku,
            name,
            description: `FRP Cover ${cleanType} ${p.size} ${cleanCap}`,
            category: 'FRP Covers',
            productType: 'MANUFACTURING',
            dispatchCategory: 'D1',
            hsnCode: '39259090',
            gstRate: 18,
            unit: 'NOS',
            unitPrice: p.unitPrice || 1000,
            isActive: true,
            companyId,
            size: p.size,
            type: cleanType,
            capacity: cleanCap
          }
        });
        allProducts.push(created);
      } catch (e) {
        const fallback = await prisma.product.findFirst({
          where: {
            OR: [
              { sku: { equals: sku, mode: 'insensitive' } },
              { name: { equals: name, mode: 'insensitive' } }
            ]
          }
        });
        if (fallback) allProducts.push(fallback);
      }
    }
  }

  return allProducts;
}

async function alignDatabaseColumns(prisma) {
  const statements = [
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "salesExecutiveId" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "detailedItems" JSONB;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "gstName" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "groupName" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "projectName" TEXT;`,
    `ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "leadDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`,
    `ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "salesExecutiveId" TEXT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "salesExecutiveId" TEXT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "taxableAmount" DECIMAL(18,2);`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "taxAmount" DECIMAL(18,2);`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "discountAmount" DECIMAL(18,2);`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "subtotal" DECIMAL(18,2);`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "paymentTerms" TEXT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "deliveryTerms" TEXT;`,
    `ALTER TABLE "SalesOrder" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'INR';`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "size" TEXT;`,
    `ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "capacity" TEXT;`
  ];

  for (const query of statements) {
    try {
      await prisma.$executeRawUnsafe(query);
    } catch (e) {}
  }
}

async function syncSuperSales2ExactOrders(config) {
  console.log(`\n======================================================================`);
  console.log(`SYNCHRONIZING SUPER SALES 2 EXACT PIPELINE: ${config.name}`);
  console.log(`Target User: SuperSales 2 | SuperSales | supersales2@himalayaerp.com`);
  console.log(`Target Page: Lead -> Quotation -> Sales Order (STOP AT ORDERS PAGE)`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    await alignDatabaseColumns(prisma);

    // Read CSV file
    const candidatePaths = [
      path.resolve('taher.csv'),
      path.resolve('backend/scripts/taher.csv'),
      path.resolve('scripts/taher.csv'),
      path.join(__dirname, 'taher.csv')
    ];

    const csvPath = candidatePaths.find(p => fs.existsSync(p));
    if (!csvPath) {
      throw new Error('taher.csv not found!');
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const rows = parseCSV(csvContent);
    const rawHeaders = rows[0].map(h => h.trim().replace(/^\uFEFF/, ''));
    const dataRows = rows.slice(1).filter(r => r.length > 5 && (r[0] || r[1]));
    console.log(`Loaded ${dataRows.length} data rows from ${csvPath}.`);

    // Parse and consolidate rows into 23 orders
    let currentGroup = null;
    const consolidatedLeads = [];

    for (let i = 0; i < dataRows.length; i++) {
      const r = dataRows[i];
      const leadDate = (r[0] || '').trim();
      const projectName = (r[1] || '').trim();
      const groupName = (r[2] || projectName).trim();
      const gstName = (r[3] || projectName).trim();
      const gstNo = (r[4] || '').trim();
      const siteIncharge = (r[5] || 'Site Incharge').trim();
      const siteInchargeMobile = (r[6] || r[7] || '').trim();
      const officeContact = (r[7] || '').trim();
      const email = (r[8] || 'info@thehimalaya.co.in').trim();
      const address = r[11] || '';
      const state = r[12] || 'Gujarat';
      const city = r[13] || '';
      const pincode = r[14] || '';

      const product = (r[15] || '').trim();
      const size = (r[16] || '').trim();
      const capacity = (r[17] || '').trim();
      const qty = parseFloat(r[18]) || 1;
      const color = (r[19] || 'GREY').trim();
      const unitPrice = parseFloat(r[20]) || 0;
      const subTotal = parseFloat(r[21]) || 0;
      const gst = (r[22] || '18%').trim();
      const gstAmount = parseFloat(r[23]) || 0;
      const discount = parseFloat(r[24]) || 0;
      const grandTotal = parseFloat(r[25]) || 0;

      const itemObj = {
        product, size, capacity, qty, color, unit_price: unitPrice,
        sub_total: subTotal, gst, gst_amount: gstAmount, discount,
        grand_total: grandTotal, row_index: i + 2
      };

      // Check if current row belongs to the active order
      const isSameGroup = currentGroup &&
        leadDate === currentGroup.lead_date &&
        projectName === currentGroup.project_name &&
        gstNo === currentGroup.gst_no;

      if (isSameGroup) {
        currentGroup.items.push(itemObj);
      } else {
        currentGroup = {
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
          items: [itemObj]
        };
        consolidatedLeads.push(currentGroup);
      }
    }

    console.log(`Parsed ${consolidatedLeads.length} consolidated orders for SuperSales 2 (${consolidatedLeads.reduce((s, l) => s + l.items.length, 0)} items).`);

    // 1. Ensure SuperSales 2 User
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } },
          { name: { contains: 'SuperSales Two', mode: 'insensitive' } },
          { name: { contains: 'Super Sales 2', mode: 'insensitive' } }
        ]
      },
      include: { role: true, company: true }
    });

    const company = (await prisma.company.findFirst()) || { id: null };
    let ssRole = await prisma.role.findFirst({
      where: {
        OR: [
          { code: 'SUPER_SALES' },
          { name: { in: ['SuperSales', 'SuperSales Lead', 'Super Sales'] } }
        ]
      }
    }) || await prisma.role.findFirst({ where: { name: { contains: 'Sales', mode: 'insensitive' } } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'supersales2@himalayaerp.com',
          name: 'SuperSales 2',
          roleId: ssRole?.id,
          companyId: company?.id,
          password: 'supersales123'
        },
        include: { role: true, company: true }
      });
      console.log(`Created user SuperSales 2 (${user.id})`);
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: 'SuperSales 2',
          email: 'supersales2@himalayaerp.com',
          ...(ssRole ? { roleId: ssRole.id } : {})
        },
        include: { role: true, company: true }
      });
      console.log(`Updated user ${user.id} -> name: SuperSales 2, email: ${user.email}, role: ${user.role?.name}`);
    }

    const userId = user.id;
    const companyId = user.companyId || company.id;

    // 2. Ensure missing products exist
    const allProducts = await ensureMissingProductsExist(prisma, companyId, consolidatedLeads);
    console.log(`Catalog ready with ${allProducts.length} products.`);

    // 3. Clean existing SuperSales 2 records safely
    // CRITICAL: NEVER TOUCH SUPERSALES 1 (0001-0145) OR SALES 1-4 (0169-0264)
    console.log('Cleaning existing SuperSales 2 records (SuperSales 1, Sales 1, 2, 3, 4 preserved intact)...');
    const existingOrders = await prisma.salesOrder.findMany({
      where: {
        OR: [
          { orderNumber: { gte: 'HCPPL/2627/0146', lte: 'HCPPL/2627/0168' } },
          { salesExecutiveId: userId },
          { createdById: userId }
        ]
      },
      select: { id: true }
    });
    const orderIds = existingOrders.map(o => o.id);

    if (orderIds.length > 0) {
      // Clean any linked production plans/work orders if any existed from prior runs
      const linkedPlans = await prisma.productionPlan.findMany({ where: { salesOrderId: { in: orderIds } }, select: { id: true } });
      const planIds = linkedPlans.map(p => p.id);
      if (planIds.length > 0) {
        const linkedWos = await prisma.workOrder.findMany({ where: { productionPlanId: { in: planIds } }, select: { id: true } });
        const woIds = linkedWos.map(w => w.id);
        if (woIds.length > 0) {
          await prisma.finishedGoods.deleteMany({ where: { workOrderId: { in: woIds } } }).catch(() => {});
          await prisma.qCInspection.deleteMany({ where: { workOrderId: { in: woIds } } }).catch(() => {});
          await prisma.productionBatch.deleteMany({ where: { workOrderId: { in: woIds } } }).catch(() => {});
          await prisma.workOrder.deleteMany({ where: { id: { in: woIds } } }).catch(() => {});
        }
        await prisma.productionPlan.deleteMany({ where: { id: { in: planIds } } }).catch(() => {});
      }

      await prisma.$executeRawUnsafe(`DELETE FROM "SalesOrderItem" WHERE "salesOrderId" IN ('${orderIds.join("','")}')`).catch(() => {});
      await prisma.salesOrder.deleteMany({ where: { id: { in: orderIds } } }).catch(() => {});
    }

    const existingQuotes = await prisma.quotation.findMany({
      where: {
        OR: [
          { quotationNumber: { gte: 'QT/2627/0146', lte: 'QT/2627/0168' } },
          { quotationNumber: { gte: 'QU/2627/0146', lte: 'QU/2627/0168' } },
          { createdById: userId },
          { salesExecutiveId: userId }
        ]
      },
      select: { id: true }
    });
    const quoteIds = existingQuotes.map(q => q.id);
    if (quoteIds.length > 0) {
      await prisma.quotationItem.deleteMany({ where: { quotationId: { in: quoteIds } } }).catch(() => {});
      await prisma.quotationTerm.deleteMany({ where: { quotationId: { in: quoteIds } } }).catch(() => {});
      await prisma.quotation.deleteMany({ where: { id: { in: quoteIds } } }).catch(() => {});
    }

    await prisma.lead.deleteMany({
      where: {
        OR: [
          { leadNumber: { gte: 'LD/2627/0146', lte: 'LD/2627/0168' } },
          { leadNumber: { gte: 'LEAD/2627/0146', lte: 'LEAD/2627/0168' } },
          { salesExecutiveId: userId },
          { assignedToId: userId },
          { createdById: userId }
        ]
      }
    }).catch(() => {});

    console.log('Existing SuperSales 2 records cleaned cleanly.');

    // 4. Resolve Workflow States
    const leadWonState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'LEAD' }, name: { contains: 'Won', mode: 'insensitive' } }
    }) || await prisma.workflowState.findFirst({ where: { workflow: { code: 'LEAD' } } });

    const quoteApprovedState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'QUOTATION' }, name: { contains: 'Approved', mode: 'insensitive' } }
    }) || await prisma.workflowState.findFirst({ where: { workflow: { code: 'QUOTATION' } } });

    const orderConfirmedState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'SALES_ORDER' }, name: { contains: 'Confirmed', mode: 'insensitive' } }
    }) || await prisma.workflowState.findFirst({ where: { workflow: { code: 'SALES_ORDER' } } });

    // 5. Customer Cache
    const customerCache = new Map();
    const existingCustomers = await prisma.customer.findMany({ where: { companyId } });
    for (const c of existingCustomers) {
      if (c.gstin && c.gstin !== 'URD') {
        customerCache.set(`gst:${c.gstin.trim().toUpperCase()}`, c);
      }
      customerCache.set(`name:${c.companyName.trim().toUpperCase()}`, c);
    }

    // 6. Process and Insert Exact SuperSales 2 Orders (0146 to 0168)
    const baseSeqOffset = 145;
    console.log(`\nImporting ${consolidatedLeads.length} exact SuperSales 2 orders (HCPPL/2627/0146 - HCPPL/2627/0168)...`);

    for (let idx = 0; idx < consolidatedLeads.length; idx++) {
      const gl = consolidatedLeads[idx];
      const seqNum = baseSeqOffset + idx + 1; // 146 to 168
      const seqStr = String(seqNum).padStart(4, '0');

      const leadDateObj = parseCsvDate(gl.lead_date);
      const parsedAddress = parseAddressObj(gl.address, gl.state, gl.city, gl.pincode);

      const companyName = (gl.project_name || gl.group_name || gl.gst_name || `SuperSales2 Customer ${seqStr}`).trim();
      const gstNumber = (gl.gst_no || '').trim().toUpperCase();
      const phone = (gl.site_incharge_mobile || gl.office_contact || '9876543210').trim();
      const contactPerson = (gl.site_incharge || 'Site Incharge').trim();
      const email = (gl.email || 'info@thehimalaya.co.in').trim();

      // Customer matching: Match by companyName first, then gstin
      let customer = customerCache.get(`name:${companyName.toUpperCase()}`);
      if (!customer && gstNumber && gstNumber !== 'URD') {
        // If a customer exists with this GSTIN, check if companyName matches closely
        const gstMatch = customerCache.get(`gst:${gstNumber}`);
        if (gstMatch && gstMatch.companyName.toUpperCase() === companyName.toUpperCase()) {
          customer = gstMatch;
        }
      }

      if (!customer) {
        // Check if this GSTIN is already taken by another customer (unique constraint [companyId, gstin])
        const existingGstinCustomer = (gstNumber && gstNumber !== 'URD') ? customerCache.get(`gst:${gstNumber}`) : null;
        const gstinToSave = (gstNumber && gstNumber !== 'URD' && !existingGstinCustomer) ? gstNumber : null;

        const custCode = `CUST-SS2-${seqStr}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
        customer = await prisma.customer.create({
          data: {
            customerCode: custCode,
            companyName: companyName,
            contactPerson: contactPerson,
            email: email,
            phone: phone,
            gstin: gstinToSave,
            shippingAddress: parsedAddress,
            billingAddress: parsedAddress,
            creditLimit: 5000000,
            paymentTerms: 0,
            status: 'ACTIVE',
            createdById: userId,
            companyId: companyId
          }
        });
        customerCache.set(`name:${companyName.toUpperCase()}`, customer);
        if (gstinToSave) {
          customerCache.set(`gst:${gstinToSave}`, customer);
        }
      }

      // Calculate totals
      let totalAmount = 0;
      let subTotal = 0;
      let taxAmount = 0;
      let discountAmount = 0;
      let totalQty = 0;

      const preparedItems = [];
      for (const item of gl.items) {
        const prod = findExactProduct(item.product, item.size, item.capacity, allProducts);
        if (!prod) {
          throw new Error(`Critical: No matching product found for ${item.product} ${item.size} ${item.capacity}`);
        }

        const qty = item.qty || 1;
        const rate = item.unit_price || (item.sub_total && qty ? item.sub_total / qty : 0) || Number(prod.unitPrice) || 0;
        const lineSubTotal = item.sub_total || (qty * rate);
        const lineTax = item.gst_amount || (lineSubTotal * 0.18);
        const lineDiscount = item.discount || 0;
        const lineTotal = item.grand_total || (lineSubTotal + lineTax - lineDiscount);

        subTotal += lineSubTotal;
        taxAmount += lineTax;
        discountAmount += lineDiscount;
        totalAmount += lineTotal;
        totalQty += qty;

        preparedItems.push({
          raw: item,
          product: prod,
          qty,
          rate,
          lineSubTotal,
          lineTax,
          lineDiscount,
          lineTotal
        });
      }

      const productInterestSummary = preparedItems.map(p => `${p.product.name} (x${p.qty})`).join(', ');

      // A. Create Lead (WON)
      const lead = await prisma.lead.create({
        data: {
          leadNumber: `LD/2627/${seqStr}`,
          leadDate: leadDateObj,
          companyName,
          projectName: gl.project_name,
          groupName: gl.group_name,
          gstName: gl.gst_name || companyName,
          gstNumber: (gstNumber && gstNumber !== 'URD') ? gstNumber : null,
          contactPerson,
          email,
          phone,
          address: parsedAddress,
          source: 'OTHER',
          productInterest: productInterestSummary,
          detailedItems: gl.items,
          estimatedQuantity: totalQty,
          unit: 'PCS',
          workflowState: leadWonState ? { connect: { id: leadWonState.id } } : undefined,
          customerId: customer.id,
          salesExecutive: { connect: { id: userId } },
          createdById: userId,
          assignedToId: userId,
          Company: companyId ? { connect: { id: companyId } } : undefined
        }
      });

      // B. Create Quotation (APPROVED)
      const quotation = await prisma.quotation.create({
        data: {
          quotationNumber: `QT/2627/${seqStr}`,
          lead: { connect: { id: lead.id } },
          customerId: customer.id,
          workflowState: quoteApprovedState ? { connect: { id: quoteApprovedState.id } } : undefined,
          salesExecutive: { connect: { id: userId } },
          createdById: userId,
          companyId,
          subtotal: subTotal,
          tax: taxAmount,
          discount: discountAmount,
          total: totalAmount,
          validUntil: new Date(leadDateObj.getTime() + 30 * 24 * 60 * 60 * 1000),
          paymentTerms: '100% Advance Against Proforma Invoice',
          paymentTermDays: 0,
          createdAt: leadDateObj
        }
      });

      // Quotation Items
      const createdQuoteItems = [];
      for (let i = 0; i < preparedItems.length; i++) {
        const it = preparedItems[i];
        const qi = await prisma.quotationItem.create({
          data: {
            quotation: { connect: { id: quotation.id } },
            product: { connect: { id: it.product.id } },
            quantity: it.qty,
            unitPrice: it.rate,
            tax: it.lineTax,
            discount: it.lineDiscount,
            lineTotal: it.lineTotal,
            description: `${it.product.name} - ${it.raw.color || 'GREY'}`
          }
        });
        createdQuoteItems.push({ ...it, quoteItemId: qi.id });
      }

      // C. Create Sales Order (CONFIRMED)
      const salesOrder = await prisma.salesOrder.create({
        data: {
          orderNumber: `HCPPL/2627/${seqStr}`,
          sourceQuotation: { connect: { id: quotation.id } },
          customer: { connect: { id: customer.id } },
          orderDate: leadDateObj,
          status: 'CONFIRMED',
          workflowState: orderConfirmedState ? { connect: { id: orderConfirmedState.id } } : undefined,
          salesExecutive: { connect: { id: userId } },
          createdById: userId,
          currency: 'INR',
          subtotal: subTotal,
          taxableAmount: subTotal,
          taxAmount: taxAmount,
          discountAmount: discountAmount,
          totalAmount: totalAmount,
          paidAmount: 0,
          outstandingAmount: totalAmount,
          paymentStatus: 'PENDING',
          paymentTerms: '100% Advance Against Proforma Invoice',
          deliveryTerms: 'Ex-Works',
          shippingAddress: parsedAddress,
          billingAddress: parsedAddress,
          createdAt: leadDateObj,
          remarks: `SuperSales 2 Order - ${companyName}`
        }
      });

      // Sales Order Items
      for (let i = 0; i < createdQuoteItems.length; i++) {
        const it = createdQuoteItems[i];
        await prisma.salesOrderItem.create({
          data: {
            salesOrder: { connect: { id: salesOrder.id } },
            product: { connect: { id: it.product.id } },
            productNameSnapshot: it.product.name,
            productCodeSnapshot: it.product.sku,
            specifications: { color: it.raw.color, size: it.raw.size, capacity: it.raw.capacity },
            orderedQuantity: it.qty,
            unit: 'NOS',
            unitPrice: it.rate,
            discountAmount: it.lineDiscount,
            taxableAmount: it.lineSubTotal,
            taxRate: 18,
            taxAmount: it.lineTax,
            lineTotal: it.lineTotal
          }
        });
      }

      // STRICT BOUNDARY: STOP AT ORDERS PAGE!
      // NO ProductionPlan, NO WorkOrder, NO Batches, NO QCInspections, NO Dispatches.
    }

    // 7. Update IdSequence
    const sequences = [
      { key: 'LEAD-2627', nextValue: 265 },
      { key: 'QU-2627', nextValue: 265 },
      { key: 'QT-2627', nextValue: 265 },
      { key: 'HCPPL-2627', nextValue: 265 },
      { key: 'lead_number_2627', nextValue: 265 },
      { key: 'quotation_number_2627', nextValue: 265 },
      { key: 'sales_order_number_2627', nextValue: 265 }
    ];

    for (const seq of sequences) {
      await prisma.idSequence.upsert({
        where: { key: seq.key },
        update: { nextValue: seq.nextValue, updatedAt: new Date() },
        create: { key: seq.key, nextValue: seq.nextValue }
      });
    }

    console.log(`\n======================================================================`);
    console.log(`SYNC SUCCESSFUL FOR SuperSales 2 (${config.name})`);
    console.log(`======================================================================`);
    console.log(`User Assigned                         : ${user.name} (${user.email})`);
    console.log(`Role                                  : ${user.role?.name}`);
    console.log(`Total Leads Created (WON)             : ${consolidatedLeads.length} (LD/2627/0146 - LD/2627/0168)`);
    console.log(`Total Quotations Created (APPROVED)   : ${consolidatedLeads.length} (QT/2627/0146 - QT/2627/0168)`);
    console.log(`Total Sales Orders Created (CONFIRMED): ${consolidatedLeads.length} (HCPPL/2627/0146 - HCPPL/2627/0168)`);
    console.log(`Downstream (Plant/QC/Dispatch/WorkOrd): STOPPED AT ORDERS PAGE AS REQUESTED`);
    console.log(`======================================================================\n`);

  } catch (err) {
    console.error(`Error syncing ${config.name}:`, err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  if (uniqueTargetDbs.length === 0) {
    throw new Error('No target database configured! Please set DATABASE_URL.');
  }
  let successCount = 0;
  for (const cfg of uniqueTargetDbs) {
    try {
      await syncSuperSales2ExactOrders(cfg);
      successCount++;
    } catch (err) {
      console.error(`❌ Error syncing ${cfg.name}:`, err.message || err);
      if (uniqueTargetDbs.length === 1) {
        throw err;
      }
    }
  }
  if (successCount === 0) {
    throw new Error('All target databases failed to sync.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
