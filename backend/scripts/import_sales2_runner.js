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
    city: city || 'Surat',
    state: state || 'Gujarat',
    country: 'India',
    pincode: pincode || '395002'
  };
}

async function main() {
  const candidatePaths = [
    path.resolve('rushi_data(sales2) (4).csv'),
    path.join(__dirname, 'rushi_data(sales2) (4).csv'),
    path.join(__dirname, '../rushi_data(sales2) (4).csv'),
    path.join(__dirname, '../../rushi_data(sales2) (4).csv'),
    path.resolve('/app/rushi_data(sales2) (4).csv'),
    path.resolve('/app/scripts/rushi_data(sales2) (4).csv'),
  ];

  let csvPath = candidatePaths.find(p => fs.existsSync(p));
  if (!csvPath) {
    const searchDirs = [process.cwd(), __dirname, path.join(__dirname, '..'), '/app', '/app/scripts'];
    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        const match = fs.readdirSync(dir).find(f => f.toLowerCase().includes('rushi') && f.endsWith('.csv'));
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
    console.log(`CSV file not found on disk, using built-in verified Sales 2 dataset.`);
    content = `ORDER DATE,project_name,group name,gst name,gst no,Site_incharge,site_incharge_mobile,office_contact,email,logged_in_sales_representive,login_date&time,address,state,city,pincode,PRODUCT,SIZE,CAPCITY,QTY,specification ,unit_pricew,sub_total,gst,gst_amount,discount,grand_total
06-04-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,06-04-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,450X450,B125,5,GREY,3870,19350,18%,3483,0,22833
04-04-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,04-04-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,WGC,450X450,LD,4,GREY,2250,9000,18%,1620,0,10620
10-04-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,10-04-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,RCS,600X600,LD,7,BLACK,5016,35112,18%,6320.16,0,41432.16
10-04-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,10-04-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,RCS,450X450,LD,8,BLACK,4296,34368,18%,6186.24,0,40554.24
11-04-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,11-04-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,600X600,C250,3,GREY,6000,18000,18%,3240,0,21240
12-04-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,12-04-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,WGC,600X600,C250,35,GREY,6408,224280,18%,40370.4,0,264650.4
13-04-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,13-04-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,300X300,LD,90,GREY,1056,95040,18%,17107.2,0,112147.2
14-04-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,14-04-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,600X600,LD,10,GREY,3336,33360,18%,6004.8,0,39364.8
15-04-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,15-04-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,900x900,LD,5,GREY,12240,61200,18%,11016,0,72216
16-04-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,16-04-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,900x900,B125,5,GREY,6648,33240,18%,5983.2,0,39223.2
17-04-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,17-04-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,28X28,LD,25,GREY,1952.5,48812.5,18%,8786.25,0,57598.75
18-04-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,18-04-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,28X28,ELD,50,GREY,1592.25,79612.5,18%,14330.25,0,93942.75
19-04-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,19-04-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,450X450,LD,10,GREY,2200,22000,18%,3960,0,25960
20-04-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,20-04-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,RCS,600X600,B125,12,BLACK,6648,79776,18%,14359.68,0,94135.68
15-04-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,15-04-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,RCS,600X600,LD,10,BLACK,5016,50160,18%,9028.8,0,59188.8
15-04-2026,RAJHANS INFRACONE INDIA PVT LTD,RAJHANS INFRACONE INDIA PVT LTD,RAJHANS INFRACONE INDIA PVT LTD,24AAECR6784R1ZH,RS,990497776,990497776,info@thehimalaya.co.in,sales2,15-04-2026,"R.S.NO 83/5,6,7, FP-118 TP-7 VESU-MAGDALLA RAJHANS EMPIRE BESIDE LE MERIDIEN HOTEL,NEAR AIRPORT DUMAS ROAD SURAT",,,395007,MHC,450X600,LD,1,GREY,3600,3600,18%,648,0,4248
05-05-2026,RV BUILDCON,RV BUILDCON,RV BUILDCON,24AAXFR7947L1Z5,RS,6353178881,6353178881,info@thehimalaya.co.in,sales2,05-05-2026,"C1001 CHANDANBALA NR SUVIDHA SHOPING CENTER PALDI,AHMEDABAD",,,380007,WGC,300X300,B125,18,GREY,,0,18%,0,0,0
05-05-2026,RV BUILDCON,RV BUILDCON,RV BUILDCON,24AAXFR7947L1Z5,RS,6353178881,6353178881,info@thehimalaya.co.in,sales2,05-05-2026,"C1001 CHANDANBALA NR SUVIDHA SHOPING CENTER PALDI,AHMEDABAD",,,380007,MHC,750X750,B125,16,GREY,6800,108800,18%,19584,0,128384
05-05-2026,RV BUILDCON,RV BUILDCON,RV BUILDCON,24AAXFR7947L1Z5,RS,6353178881,6353178881,info@thehimalaya.co.in,sales2,05-05-2026,"C1001 CHANDANBALA NR SUVIDHA SHOPING CENTER PALDI,AHMEDABAD",,,380007,MHC,900X900,LD,4,GREY,12018,48072,18%,8652.96,0,56724.96
12-05-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,12-05-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,600X600,C250,13,GREY,6000,78000,18%,14040,0,92040
12-05-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,12-05-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,WGC,600X600,C250,5,GREY,8400,42000,18%,7560,0,49560
15-05-2026,RAJHANS INFRACONE INDIA PVT LTD,RAJHANS INFRACONE INDIA PVT LTD,RAJHANS INFRACONE INDIA PVT LTD,24AAECR6784R1ZH,RS,990497776,990497776,info@thehimalaya.co.in,sales2,15-05-2026,"R.S.NO 83/5,6,7, FP-118 TP-7 VESU-MAGDALLA RAJHANS EMPIRE BESIDE LE MERIDIEN HOTEL,NEAR AIRPORT DUMAS ROAD SURAT",,,395007,MHC,600X450,LD,5,TERACOTA,3600,18000,18%,3240,0,21240
18-05-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,18-05-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,WGC,450X450,C250,29,GREY,4464,129456,18%,23302.08,0,152758.08
23-05-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,23-05-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,WGC,600X900,ELD,4,GREY,,0,18%,0,0,0
30-05-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,30-05-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,600X600,C250,3,GREY,,0,18%,0,0,0
06-02-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,06-02-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,WGC,600X600,B125,5,GREY,5172,25860,18%,4654.8,0,30514.8
06-02-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,06-02-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,RCS,600X600,B125,3,BLACK,6648,19944,18%,3589.92,0,23533.92
06-02-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,06-02-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,600X600,B125,5,GREY,6432,32160,18%,5788.8,0,37948.8
06-02-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,06-02-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,WGC,600X600,D400,6,GREY,8400,50400,18%,9072,0,59472
06-02-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,06-02-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,RCS,600X600,D400,2,BLACK,10992,21984,18%,3957.12,0,25941.12
06-02-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,06-02-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,D MHC,600X600,D400,1,GREY,10176,10176,18%,1831.68,0,12007.68
06-02-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,06-02-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,300X300,B125,28,GREY,2088,58464,18%,10523.52,0,68987.52
06-02-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,06-02-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,300X300,ELD,7,GREY,960,6720,18%,1209.6,0,7929.6
06-02-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,06-02-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,300X300,D400,1,GREY,2928,2928,18%,527.04,0,3455.04
02-03-2026,RV BUILDCON,RV BUILDCON,RV BUILDCON,24AAXFR7947L1Z5,RS,6353178881,6353178881,info@thehimalaya.co.in,sales2,02-03-2026,"C1001 CHANDANBALA NR SUVIDHA SHOPING CENTER PALDI,AHMEDABAD",,,380007,MHC,10X10,LD,18,GREY,481,8658,18%,1558.44,0,10216.44
02-03-2026,RV BUILDCON,RV BUILDCON,RV BUILDCON,24AAXFR7947L1Z5,RS,6353178881,6353178881,info@thehimalaya.co.in,sales2,02-03-2026,"C1001 CHANDANBALA NR SUVIDHA SHOPING CENTER PALDI,AHMEDABAD",,,380007,MHC,36X36,LD,4,GREY,4602.5,18410,18%,3313.8,0,21723.8
04-06-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,04-06-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,WGC,450X450,C250,10,GREY,,0,18%,0,0,0
06-05-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,06-05-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,1000X1000,C250,5,GREY,19752,98760,18%,17776.8,0,116536.8
06-05-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,06-05-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,600X600,C250,3,GREY,6000,18000,18%,3240,0,21240
06-05-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,06-05-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,600X600,D400,1,GREY,7776,7776,18%,1399.68,0,9175.68
06-05-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,06-05-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,15X15,LD,2,GREY,407,814,18%,146.52,0,960.52
29-06-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,29-06-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,WGC,600X600,D400,1,GREY,8400,8400,18%,1512,0,9912
29-06-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,29-06-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,WGC,300X300,B125,7,GREY,2088,14616,18%,2630.88,0,17246.88
29-06-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,29-06-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,RCS,600X600,D400,3,BLACK,10176,30528,18%,5495.04,0,36023.04
29-06-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,29-06-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,300X300,LD,56,GREY,,0,18%,0,0,0
29-06-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,29-06-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,300X300,D400,1,GREY,,0,18%,0,0,0
29-06-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,29-06-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,18X18,LD,1,BLACK,,0,18%,0,0,0
29-06-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,29-06-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,12X12,LD,10,BLACK,,0,18%,0,0,0
29-06-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,29-06-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,24X24,LD,3,BLACK,,0,18%,0,0,0
29-06-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,29-06-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,MHC,600X600,D400,1,GREY,,0,18%,0,0,0
,BAPS SWAMINARAYAN SANSTHA,BAPS SWAMINARAYAN SANSTHA,BAPS SWAMINARAYAN SANSTHA,URD,RS,9998992175,9998992175,info@thehimalaya.co.in,sales2,,"BAPS Swaminarayan Akshardham,Akshardham Road,Kanad, Surat - 394520",,,394520,MHC,900x900,LD,11,GREY,12650,139150,18%,25047,0,164197
21-07-2026,BAPS SWAMINARAYAN SANSTHA,BAPS SWAMINARAYAN SANSTHA,BAPS SWAMINARAYAN SANSTHA,URD,RS,9998992175,9998992175,info@thehimalaya.co.in,sales2,21-07-2026,"BAPS Swaminarayan Akshardham,Akshardham Road,Kanad, Surat - 394520",,,394520,MHC,1200X1200,LD,2,GREY,21000,42000,18%,7560,0,49560
29-07-2026,ARCHIT CORPORATION,ARCHIT CORPORATION,ARCHIT CORPORATION,24ACIPS4047H1ZI,RS,9825137600 / 9998521843,9825137600 / 9998521843,info@thehimalaya.co.in,sales2,29-07-2026,"OFFICE NO.310, 4TH FLOOR, KHATODARA MAIN ROAD,CANAL POINT,SURAT,GUJARAT",,,395002,WGC,450X450,C250,10,GREY,,0,18%,0,0,0
29-07-2026,SHAH SALES CORPORATION,SHAH SALES CORPORATION,SHAH SALES CORPORATION,24BCHPS2061M1ZD,RS,9825199500,9825199500,info@thehimalaya.co.in,sales2,29-07-2026,"13/C,PLOT NO 125/A/5 RANGULWALA ESTATE OPP.K.N.PARK UDHANA MAGADALLA ROAD SURAT",,,395007,D MHC,600x600,C250,3,Grey,9010,27030,18%,4865.4,0,31895.4`;
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

  console.log(`Parsed ${consolidatedLeads.length} consolidated leads containing ${consolidatedLeads.reduce((a, b) => a + b.items.length, 0)} product items.`);

  // 1. Resolve Sales 2 User
  const user = await prisma.user.findFirst({
    where: { email: { equals: 'sales2@himalayaerp.com', mode: 'insensitive' } }
  });

  if (!user) {
    console.error(`❌ User sales2@himalayaerp.com not found in database.`);
    return;
  }
  const userId = user.id;
  console.log(`Resolved Sales 2 user: ${user.name} (${user.id})`);

  // 2. Clear previous leads created by sales2
  const cleared = await prisma.lead.deleteMany({
    where: {
      OR: [
        { createdById: userId },
        { salesExecutiveId: userId },
        { remarks: 'Imported from Rushi Sales 2 CSV' }
      ]
    }
  });
  console.log(`Cleared ${cleared.count} existing leads for Sales 2 to ensure a clean, precise import.`);

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

  console.log(`Seeding ${consolidatedLeads.length} consolidated leads for Sales 2...`);
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
      remarks: 'Imported from Rushi Sales 2 CSV',
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
