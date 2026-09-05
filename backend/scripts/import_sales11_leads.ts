import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
const dbs = isProd
  ? [
      { name: 'Production DB', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@postgres:5432/himalaya_erp?schema=public' }
    ]
  : [
      { name: 'Active DB (DATABASE_URL)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' }
    ];

function parseCSV(content: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
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

function parseCsvDate(str: string): Date {
  if (!str) return new Date();
  str = str.trim();
  if (str === '-' || str === '') return new Date();
  
  let m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (m) {
    return new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
  }
  m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{2})$/);
  if (m) {
    const year = 2000 + parseInt(m[3], 10);
    return new Date(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10));
  }
  m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) {
    return new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
  }
  m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/);
  if (m) {
    const year = 2000 + parseInt(m[3], 10);
    return new Date(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10));
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
}

function findProduct(type: string, size: string, capacity: string, products: any[]): any {
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
  if (s === '750X750' && t === 'WGC') {
    t = 'MHC'; 
  }
  if (s === '1000X1000' && t === 'WGC') {
    t = 'MHC';
  }
  
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

function parseAddressObj(addrStr: string, stateStr?: string, cityStr?: string, pincodeStr?: string) {
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
    if (/AHMEDABAD|AHEDMABAD/i.test(line1)) city = 'Ahmedabad';
    else if (/SURAT/i.test(line1)) city = 'Surat';
    else if (/MUMBAI|MANKHURD/i.test(line1)) city = 'Mumbai';
    else if (/GANDHINAGAR/i.test(line1)) city = 'Gandhinagar';
  }

  if (!state) {
    if (/GUJARAT/i.test(line1)) state = 'Gujarat';
    else if (/MUMBAI|MAHARASHTRA|MANKHURD/i.test(line1)) state = 'Maharashtra';
    else state = 'Gujarat';
  }

  return {
    line1: line1 || 'Address on file',
    city: city || 'Ahmedabad',
    state: state || 'Gujarat',
    country: 'India',
    pincode: pincode || '380015'
  };
}

async function processDb(db: typeof dbs[0], consolidatedLeads: any[]) {
  console.log(`\n======================================================`);
  console.log(` RUNNING SALES 11 (HL) IMPORT ON: ${db.name}`);
  console.log(`======================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: db.url } } });

  try {
    // 1. Resolve Sales 11 User
    const user = await prisma.user.findFirst({
      where: { email: { equals: 'sales11@himalayaerp.com', mode: 'insensitive' } }
    });

    if (!user) {
      console.error(`❌ User sales11@himalayaerp.com not found in ${db.name}. Skipping database.`);
      return;
    }
    const userId = user.id;
    console.log(`Resolved Sales 11 user: ${user.name} (${user.id})`);

    // 2. Clear previous leads created by sales11
    const cleared = await prisma.lead.deleteMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { remarks: 'Imported from HL Sales 11 CSV' }
        ]
      }
    });
    console.log(`Cleared ${cleared.count} existing leads for Sales 11 to ensure a clean, precise import.`);

    // 3. Resolve default company and initial workflow state
    const companyId = user.companyId || (await prisma.company.findFirst())?.id;
    if (!companyId) {
      console.error(`❌ No company found in ${db.name}. Skipping database.`);
      return;
    }

    const workflowState = await prisma.workflowState.findFirst({
      where: { workflow: { code: 'LEAD' }, isInitial: true }
    }) || await prisma.workflowState.findFirst({
      where: { workflow: { code: 'LEAD' } }
    });
    const workflowStateId = workflowState ? workflowState.id : null;

    // 4. Resolve all products for matching
    const products = await prisma.product.findMany();
    console.log(`Loaded ${products.length} products from catalog.`);

    // 5. Determine highest existing lead sequence number
    const existingLeads = await prisma.lead.findMany({ select: { leadNumber: true } });
    let maxLeadNum = 0;
    for (const l of existingLeads) {
      if (l.leadNumber) {
        const match = l.leadNumber.match(/(?:LEAD(?:\/\d{4}\/|-)|HCCL\/\d{4}\/)(\d{1,6})$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num < 1000000 && num > maxLeadNum) maxLeadNum = num;
        }
      }
    }
    console.log(`Highest existing lead number sequence: ${maxLeadNum}`);
    let sequenceCounter = maxLeadNum + 1;

    console.log(`Seeding ${consolidatedLeads.length} consolidated leads for Sales 11...`);
    let successCount = 0;

    for (const gl of consolidatedLeads) {
      const detailedItems = gl.items.map((it: any) => {
        const matchedProd = findProduct(it.product, it.size, it.capacity, products);
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

      const totalQty = detailedItems.reduce((acc: number, item: any) => acc + (Number(item.quantity) || 0), 0);
      const leadDateObj = parseCsvDate(gl.lead_date);
      const parsedAddress = parseAddressObj(gl.address, gl.state, gl.city, gl.pincode);

      const leadYear = leadDateObj.getFullYear();
      const yy = String(leadYear).substring(2);
      const ny = String(leadYear + 1).substring(2);
      const leadNumber = `LEAD/${yy}${ny}/${String(sequenceCounter++).padStart(4, '0')}`;

      const primaryProduct = detailedItems[0] || {};
      const productInterestStr = detailedItems.length === 1
        ? `${primaryProduct.product || ''} ${primaryProduct.size || ''} ${primaryProduct.capacity || ''} (${primaryProduct.quantity || 1} Qty, ${primaryProduct.color || 'GREY'})`
        : `${detailedItems.length} Products: ${detailedItems.map((d: any) => `${d.product} ${d.size} ${d.capacity}`).slice(0, 3).join(', ')}${detailedItems.length > 3 ? '...' : ''}`;

      const companyName = (gl.project_name || gl.group_name || gl.gst_name || 'Himalaya Client').trim();

      const leadData = {
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
        address: parsedAddress as any,
        source: 'OTHER' as const,
        productInterest: productInterestStr,
        detailedItems: detailedItems as any,
        estimatedQuantity: new Prisma.Decimal(totalQty || 1),
        unit: 'SET',
        remarks: 'Imported from HL Sales 11 CSV',
        workflowStateId: workflowStateId,
        assignedToId: userId,
        salesExecutiveId: userId,
        createdById: userId,
        companyId: companyId
      };

      await prisma.lead.create({ data: leadData });
      successCount++;
    }

    // Update idSequence for next leads (both FY key and generic key)
    const currentFY = '2627';
    await prisma.idSequence.upsert({
      where: { key: `lead_number_${currentFY}` },
      update: { nextValue: sequenceCounter },
      create: { key: `lead_number_${currentFY}`, nextValue: sequenceCounter }
    });
    await prisma.idSequence.upsert({
      where: { key: 'lead_number' },
      update: { nextValue: sequenceCounter },
      create: { key: 'lead_number', nextValue: sequenceCounter }
    });

    console.log(`✅ [SUCCESS] Imported ${successCount} leads with ${consolidatedLeads.reduce((a, b) => a + b.items.length, 0)} total line items into ${db.name}.`);
    console.log(`✅ Updated lead_number sequence nextValue to ${sequenceCounter}.`);

  } catch (err: any) {
    console.error(`❌ Error seeding ${db.name}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const candidatePaths = [
    path.resolve('HL_data(sales3) (1).csv'),
    path.join(__dirname, 'HL_data(sales3) (1).csv'),
    path.join(__dirname, '../HL_data(sales3) (1).csv'),
    path.join(__dirname, '../../HL_data(sales3) (1).csv'),
    path.resolve('/app/HL_data(sales3) (1).csv'),
    path.resolve('/app/scripts/HL_data(sales3) (1).csv'),
  ];

  let csvPath = candidatePaths.find(p => fs.existsSync(p));
  if (!csvPath) {
    const searchDirs = [process.cwd(), __dirname, path.join(__dirname, '..'), '/app', '/app/scripts'];
    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        const match = fs.readdirSync(dir).find(f => f.toLowerCase().includes('hl') && f.endsWith('.csv'));
        if (match) {
          csvPath = path.join(dir, match);
          break;
        }
      }
    }
  }

  if (!csvPath || !fs.existsSync(csvPath)) {
    console.error(`CSV file not found in candidates: ${candidatePaths.join(', ')}`);
    process.exit(1);
  }

  console.log(`Reading CSV from: ${csvPath}`);
  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content);
  const rawHeaders = rows[0].map(h => h.trim().replace(/^\uFEFF/, ''));
  const dataRows = rows.slice(1);

  let lastLeadForCarry: any = null;
  const consolidatedLeads: any[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const obj: any = {};
    rawHeaders.forEach((h, idx) => {
      const cleanKey = h.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      obj[cleanKey] = r[idx] ? r[idx].trim() : '';
    });

    const leadDate = obj.lead_date || obj.order_date || '';
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
    const color = obj.specification || obj.specidication || obj.color || 'GREY';
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
        logged_in_sales_representive: 'sales11',
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

  console.log(`Parsed ${consolidatedLeads.length} consolidated leads containing ${consolidatedLeads.reduce((a, b) => a + b.items.length, 0)} product items.`);

  for (const db of dbs) {
    await processDb(db, consolidatedLeads);
  }
}

main().catch(console.error);
