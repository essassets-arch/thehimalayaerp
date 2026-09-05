const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

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

function parseCsvDate(str) {
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

async function main() {
  const candidatePaths = [
    path.resolve('Gulshan_data(sales5) (1).csv'),
    path.join(__dirname, 'Gulshan_data(sales5) (1).csv'),
    path.join(__dirname, '../Gulshan_data(sales5) (1).csv'),
    path.join(__dirname, '../../Gulshan_data(sales5) (1).csv'),
    path.resolve('/app/Gulshan_data(sales5) (1).csv'),
    path.resolve('/app/scripts/Gulshan_data(sales5) (1).csv'),
  ];

  let csvPath = candidatePaths.find(p => fs.existsSync(p));
  if (!csvPath) {
    const searchDirs = [process.cwd(), __dirname, path.join(__dirname, '..'), '/app', '/app/scripts'];
    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        const match = fs.readdirSync(dir).find(f => f.toLowerCase().includes('gulshan') && f.endsWith('.csv'));
        if (match) {
          csvPath = path.join(dir, match);
          break;
        }
      }
    }
  }

  let content = '';
  if (csvPath && fs.existsSync(csvPath)) {
    console.log(`Reading CSV from: ${csvPath}`);
    content = fs.readFileSync(csvPath, 'utf8');
  } else {
    console.log(`CSV file not found on disk, using built-in verified Gulshan Sales 4 dataset.`);
    content = `lead_date,project_name,group name,gst name,gst no,Site_incharge,site_incharge_mobile,office_contact,email,logged_in_sales_representive,login_date&time,ADDRESS,state,city,pincode,PRODUCT,SIZE,CAPCITY,QTY,specification,unit_pricew,sub_total,gst,gst_amount,discount,grand_total
20-05-2026,FACTORY RETAILS SALES,FACTORY RETAILS SALES,FACTORY RETAILS SALES,24AAGFO6914P1ZS,GK,9624659592,9624659592,info@thehimalaya.co.in,sales5,20-05-2026,"T.P. SCHEME NUMBER 128, PLOT NO.88,VATVA,AHMEDABAD,GUJARAT",,,382443,MHC,600X600,ELD,1,GREY,5800,5800,18%,1044,0,6844
27-05-2026,ORANGE INFRA,ORANGE INFRA,ORANGE INFRA,24AAGFO6914P1ZS,GK,9624659592,9624659592,info@thehimalaya.co.in,sales5,27-05-2026,"T.P. SCHEME NUMBER 128, PLOT NO.88,VATVA,AHMEDABAD,GUJARAT",,,382443,MHC,12X12,ELD,25,GREY,480,12000,18%,2160,0,14160
27-05-2026,ORANGE INFRA,ORANGE INFRA,ORANGE INFRA,24AAGFO6914P1ZS,GK,9624659592,9624659592,info@thehimalaya.co.in,sales5,27-05-2026,"T.P. SCHEME NUMBER 128, PLOT NO.88,VATVA,AHMEDABAD,GUJARAT",,,382443,MHC,28X28,ELD,3,GREY,2025,6075,18%,1093.5,0,7168.5
02-07-2026,UNITED BROTHERS CREATION INFRA,UNITED BROTHERS CREATION INFRA,UNITED BROTHERS CREATION INFRA,24AAHFU3509M1ZY,GK,MO : 9586362138,MO : 9586362138,info@thehimalaya.co.in,sales5,02-07-2026,"FF-8, DARSHAN COMPLEX, BOPAL ROAD,
NEAR UMIYA TEMPLE,BOPAL,AHMEDABAD",,,380058,MHC,750x750,B125,1,GREY,10500,10500,18%,1890,0,12390
04-06-2026,RAJESH HARDWARE MART,RAJESH HARDWARE MART,RAJESH HARDWARE MART,24ABIPP9184F1ZB,GK,8200256431,8200256431,info@thehimalaya.co.in,sales5,04-06-2026,"G.F.31, F.P.418,T.P. NO.39,AVANI PLAZA,NR.HARIOM SOCIETY,NR. SANT ASHIS SOCIETY,KATHWADA ROAD NARODA,AHMEDABAD,GUJARAT",,,382330,MHC,900X900,C250,1,GREY,19370,19370,18%,3486.6,0,22856.6
06-08-2026,AROMA REALTIES LIMITED,AROMA REALTIES LIMITED,AROMA REALTIES LIMITED,24AAHCA3306M1ZT,GK,9099065008,9099065008,info@thehimalaya.co.in,sales5,06-08-2026,"UG-1-2-3, MILESTONE BUILDING,NR. DRIVW IN CINEMA, THALTEJ,AHMEDABAD",,,380052,MHC,600X600,LD,42,GREY,3822,160524,18%,28894.32,0,189418.32
06-08-2026,AROMA REALTIES LIMITED,AROMA REALTIES LIMITED,AROMA REALTIES LIMITED,24AAHCA3306M1ZT,GK,9099065008,9099065008,info@thehimalaya.co.in,sales5,06-08-2026,"UG-1-2-3, MILESTONE BUILDING,NR. DRIVW IN CINEMA, THALTEJ,AHMEDABAD",,,380052,MHC,21X21,ELD,112,GREY,1045,117040,18%,21067.2,0,138107.2
06-08-2026,AROMA REALTIES LIMITED,AROMA REALTIES LIMITED,AROMA REALTIES LIMITED,24AAHCA3306M1ZT,GK,9099065008,9099065008,info@thehimalaya.co.in,sales5,06-08-2026,"UG-1-2-3, MILESTONE BUILDING,NR. DRIVW IN CINEMA, THALTEJ,AHMEDABAD",,,380052,MHC,21X21,LD,20,GREY,1045,20900,18%,3762,0,24662
06-08-2026,AROMA REALTIES LIMITED,AROMA REALTIES LIMITED,AROMA REALTIES LIMITED,24AAHCA3306M1ZT,GK,9099065008,9099065008,info@thehimalaya.co.in,sales5,06-08-2026,"UG-1-2-3, MILESTONE BUILDING,NR. DRIVW IN CINEMA, THALTEJ,AHMEDABAD",,,380052,MHC,12X12,ELD,12,GREY,378,4536,18%,816.48,0,5352.48
13-06-2026,GAJANAND CORPORATION,GAJANAND CORPORATION,GAJANAND CORPORATION,24AANFG5366J1Z1,GK,9925047840,9925047840,info@thehimalaya.co.in,sales5,13-06-2026,"15, RADHE ROW HOUSE DUPLEX,NR. BARODA EXPRESS HIGHWAY, NR. KADVA PATIDAR VADI, C.T.M, GHODASAR,AHMEDABAD,GUJARAT",,,380026,MHC,24X24,LD,2,GREY,1980,3960,18%,712.8,0,4672.8
13-06-2026,GAJANAND CORPORATION,GAJANAND CORPORATION,GAJANAND CORPORATION,24AANFG5366J1Z1,GK,9925047840,9925047840,info@thehimalaya.co.in,sales5,13-06-2026,"15, RADHE ROW HOUSE DUPLEX,NR. BARODA EXPRESS HIGHWAY, NR. KADVA PATIDAR VADI, C.T.M, GHODASAR,AHMEDABAD,GUJARAT",,,380026,MHC,24X24,LD,1,GREY,1525,1525,18%,274.5,0,1799.5
30-06-2026,ORANGE INFRA,ORANGE INFRA,ORANGE INFRA,24AAGFO6914P1ZS,GK,9624659592,9624659592,info@thehimalaya.co.in,sales5,30-06-2026,"T.P. SCHEME NUMBER 128, PLOT NO.88,VATVA,AHMEDABAD,GUJARAT",,,382443,MHC,12X12,LD,30,GREY,480,14400,18%,2592,0,16992
30-06-2026,ORANGE INFRA,ORANGE INFRA,ORANGE INFRA,24AAGFO6914P1ZS,GK,9624659592,9624659592,info@thehimalaya.co.in,sales5,30-06-2026,"T.P. SCHEME NUMBER 128, PLOT NO.88,VATVA,AHMEDABAD,GUJARAT",,,382443,MHC,18X24,LD,30,GREY,1001,30030,18%,5405.4,0,35435.4
30-06-2026,ORANGE INFRA,ORANGE INFRA,ORANGE INFRA,24AAGFO6914P1ZS,GK,9624659592,9624659592,info@thehimalaya.co.in,sales5,30-06-2026,"T.P. SCHEME NUMBER 128, PLOT NO.88,VATVA,AHMEDABAD,GUJARAT",,,382443,MHC,28X28,LD,10,GREY,2025,20250,18%,3645,0,23895
07-03-2026,RAJ ENTERPRISES,RAJ ENTERPRISES,RAJ ENTERPRISES,24AAXFR8160K1ZG,GK,9265026451,9265026451,info@thehimalaya.co.in,sales5,07-03-2026,"4094/A+B PAIKI 4TH FLOOR, ARZOO MENSON,CAMA HOTEL,KHANPUR,AHMEDABAD",,,380001,MHC,600X450,C250,1,GREY,7320,7320,18%,1317.6,0,8637.6
15-07-2026,UNITED BROTHERS CREATION INFRA,UNITED BROTHERS CREATION INFRA,UNITED BROTHERS CREATION INFRA,24AAHFU3509M1ZY,GK,9586362138,9586362138,info@thehimalaya.co.in,sales5,15-07-2026,"FF-8, DARSHAN COMPLEX, BOPAL ROAD,NEAR UMIYA TEMPLE,BOPAL,AHMEDABAD",,,380058,MHC,600X600,LD,2,GREY,6600,13200,18%,2376,0,15576
14-07-2026,MILLENIUM INFRASTUCTURE,MILLENIUM INFRASTUCTURE,MILLENIUM INFRASTUCTURE,24ABRFM8550B1Z6,GK,MO. : 7978637383,MO. : 7978637383,info@thehimalaya.co.in,sales5,14-07-2026,"1/G/3 SUR 726, 729 PAIKI OPP SONAL
CINEMA VEJALPUR ROAD AHMEDABAD,
AMINA KHATOON GEMERA; HOSPITAL AHMEDABAD",,,380055,MHC,600x600,D400,6,Grey,9500,57000,18%,10260,0,67260`;
  }

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
        logged_in_sales_representive: 'sales4',
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

  // 1. Resolve Sales 4 User
  const user = await prisma.user.findFirst({
    where: { email: { equals: 'sales4@himalayaerp.com', mode: 'insensitive' } }
  });

  if (!user) {
    console.error(`❌ User sales4@himalayaerp.com not found in database.`);
    return;
  }
  const userId = user.id;
  console.log(`Resolved Sales 4 user: ${user.name} (${user.id})`);

  // 2. Clear previous leads created by sales4
  const cleared = await prisma.lead.deleteMany({
    where: {
      OR: [
        { createdById: userId },
        { salesExecutiveId: userId },
        { remarks: 'Imported from Gulshan Sales 4 CSV' }
      ]
    }
  });
  console.log(`Cleared ${cleared.count} existing leads for Sales 4 to ensure a clean, precise import.`);

  // 3. Resolve default company and initial workflow state
  const companyId = user.companyId || (await prisma.company.findFirst())?.id;
  if (!companyId) {
    console.error(`❌ No company found in database.`);
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

  console.log(`Seeding ${consolidatedLeads.length} consolidated leads for Sales 4...`);
  let successCount = 0;

  for (const gl of consolidatedLeads) {
    const detailedItems = gl.items.map((it) => {
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

    const totalQty = detailedItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
    const leadDateObj = parseCsvDate(gl.lead_date);
    const parsedAddress = parseAddressObj(gl.address, gl.state, gl.city, gl.pincode);

    const leadYear = leadDateObj.getFullYear();
    const yy = String(leadYear).substring(2);
    const ny = String(leadYear + 1).substring(2);
    const leadNumber = `LEAD/${yy}${ny}/${String(sequenceCounter++).padStart(4, '0')}`;

    const primaryProduct = detailedItems[0] || {};
    const productInterestStr = detailedItems.length === 1
      ? `${primaryProduct.product || ''} ${primaryProduct.size || ''} ${primaryProduct.capacity || ''} (${primaryProduct.quantity || 1} Qty, ${primaryProduct.color || 'GREY'})`
      : `${detailedItems.length} Products: ${detailedItems.map((d) => `${d.product} ${d.size} ${d.capacity}`).slice(0, 3).join(', ')}${detailedItems.length > 3 ? '...' : ''}`;

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
      address: parsedAddress,
      source: 'OTHER',
      productInterest: productInterestStr,
      detailedItems: detailedItems,
      estimatedQuantity: new Prisma.Decimal(totalQty || 1),
      unit: 'SET',
      remarks: 'Imported from Gulshan Sales 4 CSV',
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

  console.log(`✅ [SUCCESS] Imported ${successCount} leads with ${consolidatedLeads.reduce((a, b) => a + b.items.length, 0)} total line items.`);
  console.log(`✅ Updated lead_number sequence nextValue to ${sequenceCounter}.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
