import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const dbs = [
  {
    name: 'PostgreSQL Database (Port 5435 / Docker)',
    url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
  }
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

  // Extract pincode if embedded in address and not explicitly given
  if (!pincode) {
    const pinMatch = line1.match(/\b(\d{6})\b/);
    if (pinMatch) {
      pincode = pinMatch[1];
    }
  }

  // Extract city/state if common keywords present
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

async function processDb(db: typeof dbs[0], consolidatedLeads: any[]) {
  console.log(`\n======================================================`);
  console.log(` RUNNING IMPORT ON: ${db.name}`);
  console.log(`======================================================`);

  const prisma = new PrismaClient({ datasources: { db: { url: db.url } } });

  try {
    // 1. Resolve SuperSales 1 User
    const user = await prisma.user.findFirst({
      where: { email: { equals: 'supersales1@himalayaerp.com', mode: 'insensitive' } }
    });

    if (!user) {
      console.error(`❌ User supersales1@himalayaerp.com not found in ${db.name}. Skipping database.`);
      return;
    }
    const userId = user.id;
    console.log(`Resolved SuperSales 1 user: ${user.name} (${user.id})`);

    // 2. Clear previous leads created by supersales1
    const cleared = await prisma.lead.deleteMany({
      where: {
        OR: [
          { createdById: userId },
          { salesExecutiveId: userId },
          { remarks: 'Imported from Hussain Sir Super Sales 1 CSV' }
        ]
      }
    });
    console.log(`Cleared ${cleared.count} existing leads for SuperSales 1 to ensure a clean, precise import.`);

    // 3. Resolve default company and initial workflow state
    const company = await prisma.company.findFirst();
    const companyId = company ? company.id : null;
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

    console.log(`Seeding ${consolidatedLeads.length} consolidated leads for SuperSales 1...`);
    let successCount = 0;
    let sequenceCounter = 1;

    for (const gl of consolidatedLeads) {
      // Match each item of this lead to the database product
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

      // Lead Number format: LEAD/2627/XXXX
      const leadYear = leadDateObj.getFullYear();
      const yy = String(leadYear).substring(2);
      const ny = String(leadYear + 1).substring(2);
      const leadNumber = `LEAD/${yy}${ny}/${String(sequenceCounter++).padStart(4, '0')}`;

      const primaryProduct = detailedItems[0];
      const productInterestStr = detailedItems.length === 1
        ? `${primaryProduct.product} ${primaryProduct.size} ${primaryProduct.capacity} (${primaryProduct.quantity} Qty, ${primaryProduct.color})`
        : `${detailedItems.length} Products: ${detailedItems.map((d: any) => `${d.product} ${d.size} ${d.capacity}`).slice(0, 3).join(', ')}${detailedItems.length > 3 ? '...' : ''}`;

      const companyName = (gl.project_name || gl.group_name || gl.gst_name || 'Himalaya Client').trim();

      const leadData = {
        leadNumber,
        leadDate: leadDateObj,
        companyName,
        groupName: gl.group_name || companyName,
        projectName: gl.project_name || companyName,
        contactPerson: gl.Site_incharge || 'Site Incharge',
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
        remarks: 'Imported from Hussain Sir Super Sales 1 CSV',
        workflowStateId: workflowStateId,
        assignedToId: userId,
        salesExecutiveId: userId,
        createdById: userId,
        companyId: companyId
      };

      await prisma.lead.create({ data: leadData });
      successCount++;
    }

    // Update idSequence for next leads
    await prisma.idSequence.upsert({
      where: { key: 'lead_number' },
      update: { nextValue: sequenceCounter },
      create: { key: 'lead_number', nextValue: sequenceCounter }
    });

    console.log(`✅ [SUCCESS] Imported ${successCount} leads with ${consolidatedLeads.reduce((a, b) => a + b.items.length, 0)} total line items into ${db.name}.`);

  } catch (err: any) {
    console.error(`❌ Error seeding ${db.name}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const csvPath = 'd:/prototype-next-main/hussain_sir(super_sales1) (2).csv';
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  console.log(`Reading CSV from: ${csvPath}`);
  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content);
  const headers = rows[0].map(h => h.trim().replace(/^\uFEFF/, ''));
  const dataRows = rows.slice(1);

  let lastLeadForCarry: any = null;
  const consolidatedLeads: any[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataRows[i];
    const obj: any = {};
    headers.forEach((h, idx) => obj[h] = r[idx] ? r[idx].trim() : '');
    
    const hasLeadInfo = Boolean(obj.project_name || obj['group name'] || obj['gst name'] || obj['gst no']);
    const hasProductInfo = Boolean(obj.PRODUCT || obj.SIZE || obj.CAPCITY);

    if (!hasLeadInfo && !hasProductInfo) continue;

    if (hasLeadInfo) {
      const isSameAsLast = lastLeadForCarry &&
        (obj.lead_date === lastLeadForCarry.lead_date || !obj.lead_date) &&
        (obj.project_name === lastLeadForCarry.project_name || (!obj.project_name && obj.gst_name === lastLeadForCarry.gst_name)) &&
        (obj.gst_no === lastLeadForCarry.gst_no || !obj.gst_no) &&
        (obj.site_incharge_mobile === lastLeadForCarry.site_incharge_mobile || !obj.site_incharge_mobile);

      if (isSameAsLast && hasProductInfo) {
        lastLeadForCarry.items.push({
          product: obj.PRODUCT,
          size: obj.SIZE,
          capacity: obj.CAPCITY,
          qty: parseFloat(obj.QTY) || 1,
          color: obj.COLOR || 'GREY',
          unit_price: parseFloat(obj.unit_pricew) || 0,
          sub_total: parseFloat(obj.sub_total) || 0,
          gst: obj.gst || '18%',
          gst_amount: parseFloat(obj.gst_amount) || 0,
          discount: parseFloat(obj.discount) || 0,
          grand_total: parseFloat(obj.grand_total) || 0,
          row_index: i + 2
        });
        continue;
      }

      lastLeadForCarry = {
        lead_date: obj.lead_date,
        project_name: obj.project_name || obj['group name'] || obj['gst name'] || 'Unnamed Project',
        group_name: obj['group name'] || obj.project_name || '',
        gst_name: obj['gst name'] || obj.project_name || '',
        gst_no: obj['gst no'] || '',
        Site_incharge: obj.Site_incharge || 'Site Incharge',
        site_incharge_mobile: obj.site_incharge_mobile || obj.office_contact || '',
        office_contact: obj.office_contact || '',
        email: obj.email || 'info@thehimalaya.co.in',
        logged_in_sales_representive: obj.logged_in_sales_representive || 'supersales1',
        login_datetime: obj['login_date&time'] || '',
        address: obj.ADDRESS || '',
        state: obj.state || 'Gujarat',
        city: obj.city || '',
        pincode: obj.pincode || '',
        items: []
      };
      if (hasProductInfo) {
        lastLeadForCarry.items.push({
          product: obj.PRODUCT,
          size: obj.SIZE,
          capacity: obj.CAPCITY,
          qty: parseFloat(obj.QTY) || 1,
          color: obj.COLOR || 'GREY',
          unit_price: parseFloat(obj.unit_pricew) || 0,
          sub_total: parseFloat(obj.sub_total) || 0,
          gst: obj.gst || '18%',
          gst_amount: parseFloat(obj.gst_amount) || 0,
          discount: parseFloat(obj.discount) || 0,
          grand_total: parseFloat(obj.grand_total) || 0,
          row_index: i + 2
        });
      }
      consolidatedLeads.push(lastLeadForCarry);
    } else if (hasProductInfo && lastLeadForCarry) {
      lastLeadForCarry.items.push({
        product: obj.PRODUCT,
        size: obj.SIZE,
        capacity: obj.CAPCITY,
        qty: parseFloat(obj.QTY) || 1,
        color: obj.COLOR || 'GREY',
        unit_price: parseFloat(obj.unit_pricew) || 0,
        sub_total: parseFloat(obj.sub_total) || 0,
        gst: obj.gst || '18%',
        gst_amount: parseFloat(obj.gst_amount) || 0,
        discount: parseFloat(obj.discount) || 0,
        grand_total: parseFloat(obj.grand_total) || 0,
        row_index: i + 2
      });
    }
  }

  console.log(`Parsed ${consolidatedLeads.length} consolidated leads containing ${consolidatedLeads.reduce((a, b) => a + b.items.length, 0)} product items.`);

  for (const db of dbs) {
    await processDb(db, consolidatedLeads);
  }
}

main().catch(console.error);
