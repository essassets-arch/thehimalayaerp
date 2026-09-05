const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function cleanAndImportDb(config, consolidatedLeads) {
  console.log(`\n======================================================================`);
  console.log(` IMPORTING SUPERSALES 2 INTO: ${config.name}`);
  console.log(` URL: ${config.url.replace(/:[^:@]+@/, ':****@')}`);
  console.log(`======================================================================`);

  let prisma;
  try {
    prisma = new PrismaClient({ datasources: { db: { url: config.url } } });
    await prisma.$connect();
  } catch (connErr) {
    console.warn(`⚠️ Could not connect to ${config.name}: ${connErr.message}. Skipping.`);
    return;
  }

  try {
    // 1. Resolve SuperSales 2 User
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' }
      }
    });

    if (!user) {
      console.error(`❌ User supersales2@himalayaerp.com not found in ${config.name}.`);
      return;
    }
    const userId = user.id;
    console.log(`Resolved SuperSales 2 user: ${user.name} (${user.id}) in company: ${user.companyId}`);

    // Clean any existing quotes for supersales2 or matching our range 0145-0170
    const quoteNumsToClean = [];
    for (let i = 145; i <= 170; i++) {
      quoteNumsToClean.push(`QU/2627/${String(i).padStart(4, '0')}`);
      quoteNumsToClean.push(`LEAD/2627/${String(i).padStart(4, '0')}`);
    }

    try {
      await prisma.quotationItem.deleteMany({
        where: {
          quotation: {
            OR: [
              { createdById: userId },
              { salesExecutiveId: userId },
              { quotationNumber: { in: quoteNumsToClean } },
              { remarks: { contains: 'Super Sales 2', mode: 'insensitive' } },
              { remarks: { contains: 'SuperSales 2', mode: 'insensitive' } }
            ]
          }
        }
      });
    } catch (_) {}

    try {
      await prisma.quotationTerm.deleteMany({
        where: {
          quotation: {
            OR: [
              { createdById: userId },
              { salesExecutiveId: userId },
              { quotationNumber: { in: quoteNumsToClean } },
              { remarks: { contains: 'Super Sales 2', mode: 'insensitive' } },
              { remarks: { contains: 'SuperSales 2', mode: 'insensitive' } }
            ]
          }
        }
      });
    } catch (_) {}

    const deletedQuotes = await prisma.quotation.deleteMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { quotationNumber: { in: quoteNumsToClean } },
          { remarks: { contains: 'Super Sales 2', mode: 'insensitive' } },
          { remarks: { contains: 'SuperSales 2', mode: 'insensitive' } }
        ]
      }
    });
    console.log(`Deleted ${deletedQuotes.count} existing quotations.`);

    const deletedLeads = await prisma.lead.deleteMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { assignedToId: userId },
          { leadNumber: { in: quoteNumsToClean } },
          { remarks: { contains: 'Super Sales 2', mode: 'insensitive' } },
          { remarks: { contains: 'SuperSales 2', mode: 'insensitive' } }
        ]
      }
    });
    console.log(`Deleted ${deletedLeads.count} existing leads.`);

    const companyId = user.companyId || (await prisma.company.findFirst())?.id;

    const leadWorkflowState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'LEAD' }, isInitial: true }
    }) || await prisma.workflowState.findFirst({
      where: { workflow: { code: 'LEAD' } }
    });
    const leadWorkflowStateId = leadWorkflowState ? leadWorkflowState.id : null;

    const quoteWorkflowState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'QUOTATION' }, isInitial: true }
    }) || await prisma.workflowState.findFirst({
      where: { workflow: { code: 'QUOTATION' } }
    });
    const quoteWorkflowStateId = quoteWorkflowState ? quoteWorkflowState.id : null;

    const products = await prisma.product.findMany();
    console.log(`Loaded ${products.length} products from catalog.`);

    let sequenceCounter = 145;

    console.log(`Seeding ${consolidatedLeads.length} strictly deduplicated accounts for SuperSales 2...`);
    let successCount = 0;

    for (const gl of consolidatedLeads) {
      const detailedItems = gl.items.map((it) => {
        let t = (it.product || '').trim().toUpperCase();
        if (t === 'D MHC') t = 'MHC';
        let s = (it.size || '').trim().toUpperCase().replace(/\s+/g, '');
        if (s.includes('DAI')) s = s.replace('DAI', 'DIA');
        if (s.includes('DIA') && !s.includes('MM')) s = s.replace('DIA', 'MMDIA');
        if (s === '900MM') s = '900MMDIA';
        if (s.match(/^\d+X\d+X\d+$/)) s = s.substring(0, s.lastIndexOf('X'));
        if (s === '30X0') s = '30X30';
        if (s === '900X600') s = '600X900';
        let c = (it.capacity || '').trim().toUpperCase();
        if (c === '3T') c = 'LD';
        if (s === '1200X900') s = '1200X1200';
        if (s === '600X260') s = '600X600';
        if (s === '450X1000') s = '600X900';
        if (s === '1800X1200') s = '1800X1800';
        if (s === '900X990') s = '900X900';
        if (s === '1200X600') s = '1200X1200';
        if (s === '750X750' && t === 'WGC') t = 'MHC';
        if (s === '1000X1000' && t === 'WGC') t = 'MHC';

        let matchedProd = products.find(p => {
          const sku = (p.sku || '').toUpperCase();
          const name = (p.name || '').toUpperCase();
          return (sku.includes(t) || name.includes(t)) && (sku.includes(s) || name.includes(s)) && (sku.includes(c) || name.includes(c));
        }) || products.find(p => {
          const sku = (p.sku || '').toUpperCase();
          const name = (p.name || '').toUpperCase();
          return (sku.includes(t) || name.includes(t)) && (sku.includes(s) || name.includes(s));
        }) || products.find(p => {
          const sku = (p.sku || '').toUpperCase();
          const name = (p.name || '').toUpperCase();
          return sku.includes(s) || name.includes(s);
        });

        const productId = matchedProd ? matchedProd.id : null;
        const productCode = matchedProd ? (matchedProd.code || matchedProd.sku) : null;
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
      const leadDateObj = new Date(gl.lead_date ? gl.lead_date.split('-').reverse().join('-') : Date.now());
      const seqStr = String(sequenceCounter).padStart(4, '0');
      const leadNumber = `LEAD/2627/${seqStr}`;
      const quoteNumber = `QU/2627/${seqStr}`;
      sequenceCounter++;

      const primaryProduct = detailedItems[0] || {};
      const productInterestStr = detailedItems.length === 1
        ? `${primaryProduct.product || ''} ${primaryProduct.size || ''} ${primaryProduct.capacity || ''} (${primaryProduct.quantity || 1} Qty, ${primaryProduct.color || 'GREY'})`
        : `${detailedItems.length} Products: ${detailedItems.map((d) => `${d.product} ${d.size} ${d.capacity}`).slice(0, 3).join(', ')}${detailedItems.length > 3 ? '...' : ''}`;

      const companyName = (gl.project_name || gl.group_name || gl.gst_name || 'Himalaya Client').trim();

      const createdLead = await prisma.lead.create({
        data: {
          leadNumber,
          leadDate: leadDateObj,
          companyName,
          groupName: gl.group_name || companyName,
          projectName: gl.project_name || companyName,
          contactPerson: gl.site_incharge || 'Site Incharge',
          email: gl.email || 'info@thehimalaya.co.in',
          phone: gl.site_incharge_mobile || gl.office_contact || 'N/A',
          gstName: gl.gst_name || companyName,
          gstNumber: gl.gst_no || null,
          address: {
            line1: gl.address || 'Address on file',
            city: gl.city || 'Ahmedabad',
            state: gl.state || 'Gujarat',
            country: 'India',
            pincode: gl.pincode || '380001'
          },
          source: 'OTHER',
          productInterest: productInterestStr,
          detailedItems: detailedItems,
          estimatedQuantity: new Prisma.Decimal(totalQty || 1),
          unit: 'SET',
          remarks: 'Imported from Taher Sir Super Sales 2 CSV',
          workflowStateId: leadWorkflowStateId,
          assignedToId: userId,
          salesExecutiveId: userId,
          createdById: userId,
          companyId: companyId
        }
      });

      const subtotal = detailedItems.reduce((acc, item) => acc + (Number(item.subTotal) || 0), 0);
      const tax = detailedItems.reduce((acc, item) => acc + (Number(item.gstAmount) || 0), 0);
      const discount = detailedItems.reduce((acc, item) => acc + (Number(item.discount) || 0), 0);
      const grandTotal = detailedItems.reduce((acc, item) => acc + (Number(item.grandTotal) || 0), 0);
      const defaultProdId = products[0]?.id;

      const quotationBaseData = {
        quotationNumber: quoteNumber,
        companyId: companyId,
        workflowStateId: quoteWorkflowStateId,
        leadId: createdLead.id,
        salesExecutiveId: userId,
        createdById: userId,
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        total: grandTotal,
        remarks: 'Imported from Taher Sir Super Sales 2 CSV',
        version: 1,
        createdAt: leadDateObj,
        items: {
          create: detailedItems.map((item) => ({
            productId: item.productId || defaultProdId,
            description: item.productName || item.specification || 'FRP Product',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            tax: item.gstAmount,
            lineTotal: item.grandTotal
          }))
        }
      };

      try {
        await prisma.quotation.create({
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
        // Fallback without selectedTerms table
        await prisma.quotation.create({
          data: quotationBaseData
        });
      }

      successCount++;
    }

    const currentFY = '2627';
    await prisma.idSequence.upsert({
      where: { key: `lead_number_${currentFY}` },
      update: { nextValue: sequenceCounter },
      create: { key: `lead_number_${currentFY}`, nextValue: sequenceCounter }
    });
    await prisma.idSequence.upsert({
      where: { key: `quotation_number_${currentFY}` },
      update: { nextValue: sequenceCounter },
      create: { key: `quotation_number_${currentFY}`, nextValue: sequenceCounter }
    });
    await prisma.idSequence.upsert({
      where: { key: 'lead_number' },
      update: { nextValue: sequenceCounter },
      create: { key: 'lead_number', nextValue: sequenceCounter }
    });

    console.log(`✅ [${config.name}] Successfully imported ${successCount} deduplicated leads & quotations.`);
  } catch (e) {
    console.error(`❌ Error importing into ${config.name}:`, e);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const csvPath = path.resolve('taher_sir(super_sales2) (3).csv');
  const content = fs.readFileSync(csvPath, 'utf8');

  const rows = [];
  let currentRow = [];
  let inQuotes = false;
  let cell = '';
  
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
      else if (char === ',') { currentRow.push(cell); cell = ''; }
      else if (char === '\r' || char === '\n') {
        currentRow.push(cell);
        if (currentRow.length > 1 || currentRow[0] !== '') rows.push(currentRow);
        currentRow = []; cell = '';
        if (char === '\r' && nextChar === '\n') i++;
      } else { cell += char; }
    }
  }
  if (cell !== '' || currentRow.length > 0) { currentRow.push(cell); rows.push(currentRow); }

  const headers = rows[0].map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'));
  const dataRows = rows.slice(1);

  const companyMap = new Map();

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = r[idx] ? r[idx].trim() : '';
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

    const companyKey = (projectName || groupName || gstName || 'Unnamed Project').trim().toUpperCase();

    if (!companyMap.has(companyKey)) {
      companyMap.set(companyKey, {
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
      });
    }

    const currentLead = companyMap.get(companyKey);
    if (hasProductInfo) {
      currentLead.items.push(itemObj);
    }
  }

  const consolidatedLeads = Array.from(companyMap.values()).filter(l => l.items && l.items.length > 0);
  console.log(`Parsed ${consolidatedLeads.length} strictly deduplicated company accounts.`);

  const targetDbs = [
    { name: 'Active DB (himalaya_erp_browser_test)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
    { name: 'Local Main DB (himalaya_erp)', url: 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp?schema=public' },
    { name: 'Docker Postgres 5435', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public' }
  ];

  for (const db of targetDbs) {
    await cleanAndImportDb(db, consolidatedLeads);
  }
}

main().catch(console.error);
