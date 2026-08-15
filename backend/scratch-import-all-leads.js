const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

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

function parseDate(value) {
  if (!value) return null;
  value = value.trim();
  try {
    let clean = value.replace(/[\.\/]/g, '-').replace(/\s+/g, '');
    
    if (clean.includes('-')) {
      const parts = clean.split('-');
      let day = parts[0];
      let month = parts[1];
      let year = parts[2];
      
      if (!year && month && month.length >= 7) {
        const rest = month;
        month = rest.substring(0, 2);
        year = rest.substring(rest.length - 4);
      }
      
      if (year && year.length === 2) {
        year = '20' + year;
      }
      
      if (day && month && year) {
        const d = parseInt(day, 10);
        const m = parseInt(month, 10) - 1;
        let y = parseInt(year, 10);
        if (y < 2020) y = 2026; // Fix 2006 typo
        const date = new Date(Date.UTC(y, m, d, 0, 0, 0));
        return isNaN(date.getTime()) ? null : date;
      }
    }
    
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

function findProduct(type, size, capacity, products) {
  let t = type.trim().toUpperCase();
  if (t === 'D MHC') t = 'MHC';
  
  let s = size.trim().toUpperCase().replace(/\s+/g, '');
  if (s.includes('DAI')) s = s.replace('DAI', 'DIA');
  if (s.includes('DIA') && !s.includes('MM')) s = s.replace('DIA', 'MMDIA');
  if (s.match(/^\d+X\d+X\d+$/)) {
    s = s.substring(0, s.lastIndexOf('X'));
  }
  if (s === '30X0') s = '30X30';
  if (s === '900X600') s = '600X900';
  
  let c = capacity.trim().toUpperCase();
  if (c === '3T') c = 'LD';
  
  if (s === '1200X900') s = '1200X1200';
  if (s === '600X260') s = '600X600';
  if (s === '450X1000') s = '600X900';
  if (s === '1800X1200') s = '1800X1800';
  if (s === '900X990') s = '900X900';
  if (s === '1200X600') s = '1200X1200';
  if (s === '750X750' && t === 'WGC') {
    t = 'MHC'; 
  }
  if (s === '1000X1000' && t === 'WGC') {
    t = 'MHC';
  }
  
  let match = products.find(p => {
    const sku = p.sku.toUpperCase();
    const name = p.name.toUpperCase();
    return (sku.includes(t) || name.includes(t)) &&
           (sku.includes(s) || name.includes(s)) &&
           (sku.includes(c) || name.includes(c));
  });
  if (match) return match;
  
  match = products.find(p => {
    const sku = p.sku.toUpperCase();
    const name = p.name.toUpperCase();
    return (sku.includes(t) || name.includes(t)) &&
           (sku.includes(s) || name.includes(s));
  });
  if (match) return match;

  match = products.find(p => {
    const sku = p.sku.toUpperCase();
    const name = p.name.toUpperCase();
    return (sku.includes(s) || name.includes(s)) &&
           (sku.includes(c) || name.includes(c));
  });
  if (match) return match;

  match = products.find(p => {
    const sku = p.sku.toUpperCase();
    const name = p.name.toUpperCase();
    return sku.includes(s) || name.includes(s);
  });
  return match || null;
}

async function run() {
  const isDryRun = process.argv.includes('--live') ? false : true;
  console.log(`🚀 RUNNING IMPORT SCRIPT: MODE = ${isDryRun ? 'DRY-RUN' : 'LIVE'}`);

  // Fetch db configuration details
  const user = await prisma.user.findFirst({ where: { email: 'supersales1@himalayaerp.com' } });
  if (!user) {
    console.error('❌ User supersales1@himalayaerp.com not found in DB!');
    return;
  }
  console.log(`👤 Sales Executive user found: ${user.name} (ID: ${user.id})`);

  const company = await prisma.company.findFirst();
  const companyId = company ? company.id : null;
  console.log(`🏢 Default Company ID: ${companyId}`);

  const pendingState = await prisma.workflowState.findFirst({ where: { code: 'PENDING' } });
  if (!pendingState) {
    console.error('❌ WorkflowState with code PENDING not found in DB!');
    return;
  }
  console.log(`🔄 PENDING Workflow State ID: ${pendingState.id}`);

  // Get highest LEAD-2026 number
  const leadsInDb = await prisma.lead.findMany({
    select: { leadNumber: true }
  });
  let maxNum = 0;
  leadsInDb.forEach(l => {
    if (l.leadNumber && l.leadNumber.startsWith('LEAD-2026-')) {
      const numPart = parseInt(l.leadNumber.replace('LEAD-2026-', ''), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  });
  console.log(`📈 Current max LEAD-2026 number suffix in database: ${maxNum}`);

  const products = await prisma.product.findMany();
  console.log(`📦 Loaded ${products.length} products from database`);

  // Read CSV
  const csvPath = 'd:\\prototype-next-main\\hussain_sir(super_sales1) (2).csv';
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found at:', csvPath);
    return;
  }
  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content);
  const headers = rows[0].map(h => h.trim());
  const dataRows = rows.slice(1);

  // Grouping
  const groupedLeads = {};
  dataRows.forEach((row, idx) => {
    if (row.length < headers.length) return;
    
    const rowObj = {};
    headers.forEach((h, i) => {
      rowObj[h] = row[i] ? row[i].trim() : '';
    });
    
    if (!rowObj.project_name && !rowObj.PRODUCT && !rowObj.SIZE) return;
    
    const leadDate = parseDate(rowObj.lead_date);
    const companyName = rowObj.project_name || rowObj['group name'] || rowObj['gst name'] || 'Unknown Company';
    const project = rowObj.project_name || '';
    const gstNo = rowObj['gst no'] || '';
    const addr = rowObj.ADDRESS || '';
    const phone = rowObj.site_incharge_mobile || rowObj.office_contact || '';
    
    // Unique key for the lead
    const dateStr = leadDate ? leadDate.toISOString().split('T')[0] : 'no-date';
    const key = `${dateStr}_${companyName}_${project}_${gstNo}_${addr.substring(0, 30)}_${phone}`;
    
    if (!groupedLeads[key]) {
      groupedLeads[key] = {
        leadDate,
        companyName,
        groupName: rowObj['group name'] || null,
        projectName: project,
        contactPerson: rowObj.Site_incharge || 'Contact Person',
        email: rowObj.email || null,
        phone: phone || null,
        gstName: rowObj['gst name'] || null,
        gstNumber: gstNo || null,
        address: addr,
        city: rowObj.city || '',
        state: rowObj.state || '',
        pincode: rowObj.pincode || '',
        rows: []
      };
    }
    groupedLeads[key].rows.push(rowObj);
  });

  const keys = Object.keys(groupedLeads);
  console.log(`📂 Found ${keys.length} distinct grouped leads to import.`);

  let insertedCount = 0;
  
  for (let kIdx = 0; kIdx < keys.length; kIdx++) {
    const key = keys[kIdx];
    const grouped = groupedLeads[key];
    
    // Generate lead number
    const leadNum = maxNum + kIdx + 1;
    const leadNumber = `LEAD-2026-${String(leadNum).padStart(5, '0')}`;
    
    // Parse Address JSON
    let city = grouped.city;
    let state = grouped.state;
    if (!city || !state) {
      const addrClean = (grouped.address || '').replace(/\r?\n/g, ' ').replace(/\./g, '').trim();
      const parts = addrClean.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        if (!state) state = parts[parts.length - 1];
        if (!city) city = parts[parts.length - 2];
      }
    }
    
    const addressJson = {
      line1: (grouped.address || '').trim(),
      city: (city || '').trim(),
      state: (state || '').trim(),
      country: 'India',
      pincode: (grouped.pincode || '').trim()
    };
    
    // Parse detailed items
    const detailedItems = [];
    let totalQty = 0;
    const productInterestArr = [];
    
    grouped.rows.forEach(r => {
      const qty = parseInt(r.QTY, 10) || 1;
      const unitPrice = parseFloat(r.unit_pricew) || 0;
      const discount = parseFloat(r.discount) || 0;
      
      const matchedProd = findProduct(r.PRODUCT, r.SIZE, r.CAPCITY, products);
      if (matchedProd) {
        detailedItems.push({
          tax: 18,
          discount: discount,
          quantity: qty,
          productId: matchedProd.id,
          unitPrice: unitPrice,
          productCode: matchedProd.sku,
          productName: matchedProd.name,
          specification: `Color: ${r.COLOR || 'Grey'}`,
          productPublicId: matchedProd.publicId,
          additionalCharges: 0
        });
        
        productInterestArr.push(`${matchedProd.name} (x${qty})`);
        totalQty += qty;
      }
    });
    
    const productInterest = productInterestArr.join(', ');
    
    const payload = {
      leadNumber,
      leadDate: grouped.leadDate,
      companyName: grouped.companyName,
      groupName: grouped.groupName,
      projectName: grouped.projectName,
      contactPerson: grouped.contactPerson,
      email: grouped.email,
      phone: grouped.phone,
      gstName: grouped.gstName,
      gstNumber: grouped.gstNumber,
      address: addressJson,
      source: 'OTHER',
      productInterest,
      detailedItems,
      estimatedQuantity: totalQty,
      unit: 'SET',
      workflowStateId: pendingState.id,
      assignedToId: user.id,
      salesExecutiveId: user.id,
      companyId,
      createdById: user.id,
      createdAt: grouped.leadDate || new Date(),
      updatedAt: grouped.leadDate || new Date()
    };
    
    if (isDryRun) {
      if (kIdx < 3) {
        console.log(`[DRY-RUN] Will create Lead #${kIdx + 1}: ${leadNumber}`);
        console.log(JSON.stringify(payload, null, 2));
      }
      insertedCount++;
    } else {
      try {
        await prisma.lead.create({
          data: payload
        });
        insertedCount++;
        if (insertedCount % 20 === 0 || insertedCount === keys.length) {
          console.log(`✅ [LIVE] Created ${insertedCount}/${keys.length} leads...`);
        }
      } catch (err) {
        console.error(`❌ Error creating lead ${leadNumber}:`, err.message);
      }
    }
  }
  
  console.log(`\n🎉 Done! Total leads processed: ${insertedCount}`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
