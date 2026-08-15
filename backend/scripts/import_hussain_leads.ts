import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const isProd = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
const dbs = isProd 
  ? [
      { name: 'Production DB', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@postgres:5432/himalaya_erp?schema=public' }
    ]
  : [
      { name: 'Docker DB (Port 5433)', url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5433/himalaya_erp?schema=public' },
      { name: 'Standalone DB (Port 5432)', url: process.env.DATABASE_URL || 'postgresql://himalaya_erp_user:12345678@localhost:5432/himalaya_erp_browser_test?schema=public' },
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

async function processDb(db: typeof dbs[0], groupedLeads: any[]) {
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

    // 2. Clear previously imported leads from this script for safety
    const cleared = await prisma.lead.deleteMany({
      where: {
        createdById: userId,
        remarks: 'Imported from Hussain Sir Super Sales 1 CSV'
      }
    });
    console.log(`Cleared ${cleared.count} previously imported leads to prevent duplicates.`);

    // Reset sequence to 1
    await prisma.idSequence.upsert({
      where: { key: 'lead_number' },
      update: { nextValue: 1 },
      create: { key: 'lead_number', nextValue: 1 }
    });
    console.log('Reset lead_number sequence to 1.');

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
    if (!workflowStateId) {
      console.error(`❌ No Lead workflow state found in ${db.name}. Skipping database.`);
      return;
    }

    // 4. Resolve all products for matching
    const products = await prisma.product.findMany();

    console.log(`Seeding ${groupedLeads.length} consolidated leads...`);
    let successCount = 0;

    for (const gl of groupedLeads) {
      // Match each item of this lead to the database product
      const detailedItems = gl.items.map((it: any) => {
        const matchedProd = findProduct(it.product, it.size, it.capacity, products);
        const productId = matchedProd ? matchedProd.id : null;
        const productName = matchedProd ? matchedProd.name : `HIMALAYA FRP ${it.product} ${it.size} ${it.capacity}`;
        
        return {
          productId,
          productName,
          size: it.size,
          capacity: it.capacity,
          color: it.color,
          quantity: it.qty,
          unitPrice: it.unitPrice,
          subTotal: it.subTotal,
          tax: it.gstRate,
          gstAmount: it.gstAmount,
          discount: it.discount,
          grandTotal: it.grandTotal
        };
      });

      const totalQty = detailedItems.reduce((acc: number, item: any) => acc + item.quantity, 0);

      // Perform inside transaction to generate sequential leadNumber safely
      await prisma.$transaction(async (tx) => {
        let seqVal: number;
        let leadNumber = '';
        let isUnique = false;

        // Skip occupied sequence numbers dynamically
        while (!isUnique) {
          const seq = await tx.idSequence.upsert({
            where: { key: 'lead_number' },
            update: { nextValue: { increment: 1 } },
            create: { key: 'lead_number', nextValue: 1 },
          });
          seqVal = seq.nextValue - 1;
          const leadYear = gl.leadDate.getFullYear();
          const yy = String(leadYear).substring(2);
          const ny = String(leadYear + 1).substring(2);
          leadNumber = `HCCL/${yy}${ny}/${String(seqVal).padStart(4, '0')}`;

          const existingLead = await tx.lead.findUnique({
            where: { leadNumber }
          });
          if (!existingLead) {
            isUnique = true;
          }
        }

        const leadData = {
          leadNumber,
          leadDate: gl.leadDate,
          companyName: gl.companyName,
          groupName: gl.groupName,
          projectName: gl.projectName,
          contactPerson: gl.contactPerson,
          email: gl.email,
          phone: gl.phone,
          gstName: gl.gstName,
          gstNumber: gl.gstNumber,
          address: gl.address as any,
          source: 'OTHER' as const,
          productInterest: detailedItems[0]?.productName || null,
          detailedItems: detailedItems as any,
          estimatedQuantity: new Prisma.Decimal(totalQty),
          unit: 'SET',
          remarks: 'Imported from Hussain Sir Super Sales 1 CSV',
          workflowStateId: workflowStateId,
          assignedToId: userId,
          salesExecutiveId: userId,
          createdById: userId,
          companyId: companyId
        };

        await tx.lead.create({ data: leadData });
      });

      successCount++;
    }

    console.log(`✅ [SUCCESS] Imported ${successCount} leads successfully into ${db.name}.`);

  } catch (err: any) {
    console.error(`❌ Error seeding ${db.name}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  let csvPath = '';
  const candidates = [
    'd:/prototype-next-main/hussain_sir(super_sales1) (4).csv',
    path.resolve(__dirname, '../hussain_sir(super_sales1) (4).csv'),
    path.resolve(__dirname, '../../hussain_sir(super_sales1) (4).csv'),
    path.resolve('hussain_sir(super_sales1) (4).csv'),
    '/app/hussain_sir(super_sales1) (4).csv',
    'd:/prototype-next-main/hussain_sir(super_sales1) (2).csv',
    path.resolve(__dirname, '../hussain_sir(super_sales1) (2).csv'),
    path.resolve(__dirname, '../../hussain_sir(super_sales1) (2).csv'),
    path.resolve('hussain_sir(super_sales1) (2).csv'),
    '/app/hussain_sir(super_sales1) (2).csv',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      csvPath = c;
      break;
    }
  }
  if (!csvPath) {
    console.error('CSV file not found in any expected location.');
    process.exit(1);
  }
  console.log(`Using CSV file at: ${csvPath}`);

  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content);
  const headers = rows[0].map(h => h.trim().replace(/^\uFEFF/, ''));
  const dataRows = rows.slice(1);

  // Grouping mapping: key -> grouped lead details
  const leadGroups = new Map<string, any>();

  for (let idx = 0; idx < dataRows.length; idx++) {
    const r = dataRows[idx];
    if (r.length < headers.length) continue;
    
    const rowObj: any = {};
    headers.forEach((h, i) => {
      rowObj[h] = r[i] ? r[i].trim() : '';
    });
    
    if (!rowObj.project_name && !rowObj.PRODUCT && !rowObj.SIZE) continue;

    const leadDateRaw = rowObj.lead_date || '';
    const projectName = rowObj.project_name || 'Unknown Company';
    const groupName = rowObj['group name'] || projectName;
    const gstName = rowObj['gst name'] || groupName;
    const gstNumber = rowObj['gst no'] || null;
    const siteIncharge = rowObj.Site_incharge || 'Site Incharge';
    const addressStr = rowObj.ADDRESS || '';
    
    // Normalize phone number
    let phoneStr = (rowObj.site_incharge_mobile || rowObj.office_contact || '').trim();
    if (phoneStr.includes('/')) {
      phoneStr = phoneStr.split('/')[0].replace(/[^0-9]/g, '');
    } else {
      phoneStr = phoneStr.replace(/[^0-9]/g, '');
    }
    const phone = phoneStr.substring(0, 15) || null;
    const email = rowObj.email || null;

    // Structured address object
    const address = {
      line1: addressStr,
      city: rowObj.city || '',
      state: rowObj.state || '',
      pincode: rowObj.pincode || ''
    };

    // Construct grouping key
    const groupKey = `${leadDateRaw.trim()}||${projectName.trim().toLowerCase()}||${addressStr.trim().toLowerCase()}`;

    // Item details
    const qty = parseInt(rowObj.QTY || '1', 10) || 1;
    const unitPrice = parseFloat(rowObj.unit_pricew || '0') || 0;
    const subTotal = parseFloat(rowObj.sub_total || '0') || 0;
    const gstRate = parseFloat(rowObj.gst ? rowObj.gst.replace('%', '') : '18') || 18;
    const gstAmount = parseFloat(rowObj.gst_amount || '0') || 0;
    const discount = parseFloat(rowObj.discount || '0') || 0;
    const grandTotal = parseFloat(rowObj.grand_total || '0') || 0;

    const item = {
      product: rowObj.PRODUCT || '',
      size: rowObj.SIZE || '',
      capacity: rowObj.CAPCITY || '',
      color: rowObj.COLOR || 'GREY',
      qty,
      unitPrice,
      subTotal,
      gstRate,
      gstAmount,
      discount,
      grandTotal
    };

    if (!leadGroups.has(groupKey)) {
      leadGroups.set(groupKey, {
        leadDate: parseCsvDate(leadDateRaw),
        companyName: groupName,
        groupName,
        projectName,
        contactPerson: siteIncharge,
        email,
        phone,
        gstName,
        gstNumber,
        address,
        items: []
      });
    }

    leadGroups.get(groupKey).items.push(item);
  }

  const groupedLeads = Array.from(leadGroups.values());
  console.log(`Grouping complete. Parsed ${rows.length - 1} rows into ${groupedLeads.length} unique Leads.`);

  for (const db of dbs) {
    await processDb(db, groupedLeads);
  }

  console.log('\n🌟 ALL DATABASES PROCESSED SUCCESSFULLY');
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
