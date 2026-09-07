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
    const subTotal = parseFloat(r[21]) || 0;
    const gst = r[22] || '18%';
    const gstAmount = parseFloat(r[23]) || 0;
    const discount = parseFloat(r[24]) || 0;
    const grandTotal = parseFloat(r[25]) || 0;

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

  console.log(`Parsed ${groupedLeads.length} distinct leads from taher.csv.`);
  return groupedLeads;
}

async function syncSuperSales2Leads(config, leadsList) {
  console.log(`\n======================================================================`);
  console.log(`🚀 SYNCING SUPERSALES 2 LEADS IN: ${config.name}`);
  console.log(`======================================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: config.url } } });

  try {
    // 1. Resolve SuperSales 2 User
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

    // 2. Clear any existing leads for SuperSales 2
    const deleted = await prisma.lead.deleteMany({
      where: {
        OR: [
          { salesExecutiveId: userId },
          { createdById: userId },
          { assignedToId: userId }
        ]
      }
    });
    console.log(`Cleared ${deleted.count} previous leads for SuperSales 2.`);

    // 3. Resolve Lead initial workflow state
    let leadState = null;
    try {
      leadState = await prisma.workflowState.findFirst({
        where: { workflow: { code: 'LEAD' }, isInitial: true }
      }) || await prisma.workflowState.findFirst({
        where: { workflow: { code: 'LEAD' } }
      });
    } catch (e) {}

    // 4. Resolve default product for fallback ID reference if required by schema
    let products = [];
    try {
      products = await prisma.product.findMany({ select: { id: true, name: true, sku: true, size: true, type: true, capacity: true } });
    } catch (e) {
      try {
        products = await prisma.$queryRawUnsafe(`SELECT id, name, sku FROM "Product"`);
      } catch (err) {}
    }
    const defaultProduct = products[0] || null;

    let seqCounter = 145;
    let createdCount = 0;

    for (const gl of leadsList) {
      const detailedItems = gl.items.map((it) => {
        // Find best matched product ID for referential links, but keep the exact name from CSV
        let matchedProd = products.find(p => {
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

        const productId = matchedProd ? matchedProd.id : defaultProduct?.id || null;

        return {
          productId,
          productCode: it.productCode,
          productName: it.productName, // EXACT PRODUCT NAME FROM CSV
          specification: it.specification,
          product: it.product,
          size: it.size,
          capacity: it.capacity,
          color: it.color,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          subTotal: it.subTotal,
          tax: it.tax,
          gstRate: it.gstRate,
          gstAmount: it.gstAmount,
          discount: it.discount,
          grandTotal: it.grandTotal
        };
      });

      const totalQty = detailedItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
      const leadDateObj = parseCsvDate(gl.leadDate);
      const parsedAddress = parseAddressObj(gl.address, gl.state, gl.city, gl.pincode);
      const companyName = (gl.projectName || gl.groupName || gl.gstName || 'Himalaya Client').trim();
      const contactPerson = gl.siteIncharge || 'Site Incharge';
      const phone = gl.siteInchargeMobile || gl.officeContact || 'N/A';
      const email = gl.email || 'info@thehimalaya.co.in';
      const gstNumber = gl.gstNo || null;
      const gstName = gl.gstName || companyName;

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
      let leadNumber = `LD/2627/${seqStr}`;
      while (await prisma.lead.findFirst({ where: { leadNumber }, select: { id: true } })) {
        seqCounter++;
        seqStr = String(seqCounter).padStart(4, '0');
        leadNumber = `LD/2627/${seqStr}`;
      }
      seqCounter++;

      // Exact product string for lead summary
      const productInterestStr = detailedItems
        .map(d => `${d.productName} (${d.quantity} Qty, ${d.color})`)
        .join(', ');

      await prisma.lead.create({
        data: {
          leadNumber,
          leadDate: leadDateObj,
          companyName,
          groupName: gl.groupName || companyName,
          projectName: gl.projectName || companyName,
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
          remarks: 'SuperSales 2 Lead (from taher.csv)',
          workflowStateId: leadState?.id || null,
          assignedToId: userId,
          salesExecutiveId: userId,
          createdById: userId,
          companyId,
          customerId: customer.id
        }
      });

      console.log(`  ✔ Created Lead [${leadNumber}] - ${companyName} (${detailedItems.length} items: ${detailedItems.map(d => d.productName).join('; ')})`);
      createdCount++;
    }

    // Update Sequences
    try {
      await prisma.idSequence.upsert({
        where: { key: 'lead_number_2627' },
        update: { nextValue: seqCounter },
        create: { key: 'lead_number_2627', nextValue: seqCounter }
      });
      await prisma.idSequence.upsert({
        where: { key: 'lead_number' },
        update: { nextValue: seqCounter },
        create: { key: 'lead_number', nextValue: seqCounter }
      });
    } catch (e) {}

    console.log(`\n🎉 Successfully synced ${createdCount} leads for SuperSales 2 in ${config.name}!`);

  } catch (err) {
    console.error(`❌ Error syncing leads in ${config.name}:`, err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const leadsList = loadTaherLeads();
  for (const target of targetDbs) {
    await syncSuperSales2Leads(target, leadsList);
  }
}

main().catch(console.error);
