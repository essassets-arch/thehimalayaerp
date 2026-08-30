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
    path.resolve('taher_sir(super_sales2) (3).csv'),
    path.join(__dirname, 'taher_sir(super_sales2) (3).csv'),
    path.join(__dirname, '../taher_sir(super_sales2) (3).csv'),
    path.join(__dirname, '../../taher_sir(super_sales2) (3).csv'),
    path.resolve('/app/taher_sir(super_sales2) (3).csv'),
    path.resolve('/app/scripts/taher_sir(super_sales2) (3).csv'),
  ];

  let csvPath = candidatePaths.find(p => fs.existsSync(p));
  if (!csvPath) {
    const searchDirs = [process.cwd(), __dirname, path.join(__dirname, '..'), '/app', '/app/scripts'];
    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        const match = fs.readdirSync(dir).find(f => f.toLowerCase().includes('taher') && f.endsWith('.csv'));
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
    console.log(`CSV file not found on disk, using built-in verified SuperSales 2 dataset.`);
    content = `lead_date,project_name,Group_name,Gst_name,Gst_no,Site_incharge,site_incharge_mobile,office_contact,email,logged_in_sales_representive,login_date&time,Address,state,city,Pincode,PRODUCT,SIZE,CAPCITY,QTY,Specification ,unit_pricew,sub_total,gst,gst_amount,discount,grand_total
02-04-2026,VISHAN REAL ESTATE PVT LTD,VISHAN REAL ESTATE PVT LTD,VISHAN REAL ESTATE PVT LTD,24AAKCV4374K1ZV,TL,MO : 9998184929,MO : 9998184929,info@thehimalaya.co.in,supersales2,02-04-2026,"302, TRINITY COMPLEX,\r\nOPP. SIGNATURE COMPLES,AHMEDABAD\r\nGUJARAT.",,,380059,RCS,300x300x32,ELD,1,BLACK,2695,2695,18%,485.1,0,3180.1
02-04-2026,VISHAN REAL ESTATE PVT LTD,VISHAN REAL ESTATE PVT LTD,VISHAN REAL ESTATE PVT LTD,24AAKCV4374K1ZV,TL,MO : 9998184929,MO : 9998184929,info@thehimalaya.co.in,supersales2,02-04-2026,"302, TRINITY COMPLEX,\r\nOPP. SIGNATURE COMPLES,AHMEDABAD\r\nGUJARAT.",,,380059,RCS,600x600x32,ELD,1,BLACK,5225,5225,18%,940.5,0,6165.5
02-04-2026,VISHAN REAL ESTATE PVT LTD,VISHAN REAL ESTATE PVT LTD,VISHAN REAL ESTATE PVT LTD,24AAKCV4374K1ZV,TL,MO : 9998184929,MO : 9998184929,info@thehimalaya.co.in,supersales2,02-04-2026,"302, TRINITY COMPLEX,\r\nOPP. SIGNATURE COMPLES,AHMEDABAD\r\nGUJARAT.",,,380059,MHC,450X900,ELD,1,GREY,3825,3825,18%,688.5,0,4513.5
09-04-2026,SHUBH INFRA,SHUBH INFRA,SHUBH INFRA,24AESFS2868G1ZI,TL,MO:+91 70697 41838,MO:+91 70697 41838,info@thehimalaya.co.in,supersales2,09-04-2026,"D-402,DEV SHRUSTHTI APARTMENT,\r\nNIKOL NARODA ROAD AHMEDABAD",,,380049,RCS,300X300,D400,5,BLACK,4300,21500,18%,3870,0,25370
09-04-2026,SHUBH INFRA,SHUBH INFRA,SHUBH INFRA,24AESFS2868G1ZI,TL,MO:+91 70697 41838,MO:+91 70697 41838,info@thehimalaya.co.in,supersales2,09-04-2026,"D-402,DEV SHRUSTHTI APARTMENT,\r\nNIKOL NARODA ROAD AHMEDABAD",,,380049,RCS,600X600,D400,3,BLACK,12500,37500,18%,6750,0,44250
09-04-2026,SHUBH INFRA,SHUBH INFRA,SHUBH INFRA,24AESFS2868G1ZI,TL,MO:+91 70697 41838,MO:+91 70697 41838,info@thehimalaya.co.in,supersales2,09-04-2026,"D-402,DEV SHRUSTHTI APARTMENT,\r\nNIKOL NARODA ROAD AHMEDABAD",,,380049,RCS,750X750,D400,2,BLACK,20600,41200,18%,7416,0,48616
09-04-2026,KAPIL RAYON INDIA PVT LTD,KAPIL RAYON INDIA PVT LTD,KAPIL RAYON INDIA PVT LTD,27AABCK5687M1ZV,TL,MO : 9820328190,MO : 9820328190,info@thehimalaya.co.in,supersales2,09-04-2026,"SHOP NO.7, PLOT NO-146, GROUND FLOOE,\r\nKRISHNA BUILDING,SR. VIEGAS STREET,MUMBAI,\r\nMAHARSHTRA.",,,400002,ONGC,300X700,C250,9,GREY,2530,22770,18%,4098.6,0,26868.6
11-04-2026,SHUBH INFRA,SHUBH INFRA,SHUBH INFRA,24AESFS2868G1ZI,TL,MO:+91 70697 41838,MO:+91 70697 41838,info@thehimalaya.co.in,supersales2,11-04-2026,"D-402,DEV SHRUSTHTI APARTMENT,\r\nNIKOL NARODA ROAD AHMEDABAD",,,380049,MHC,900X900,D400,1,GREY,27170,27170,18%,4890.6,0,32060.6
24-04-2026,BHADANI INDUSTRIES,BHADANI INDUSTRIES,BHADANI INDUSTRIES,24AIXPP7241F1ZV,TL,MO : 9909319595,MO : 9909319595,info@thehimalaya.co.in,supersales2,24-04-2026,"0, GOTHADA,SAVLI,\r\nVADODARA,GUJARAT",,,391770,MHC,600X600,D400,15,GREY,8564,128460,18%,23122.8,0,151582.8
24-04-2026,BHADANI INDUSTRIES,BHADANI INDUSTRIES,BHADANI INDUSTRIES,24AIXPP7241F1ZV,TL,MO : 9909319595,MO : 9909319595,info@thehimalaya.co.in,supersales2,24-04-2026,"0, GOTHADA,SAVLI,\r\nVADODARA,GUJARAT",,,391770,MHC,600X600,LD,15,GREY,3670,55050,18%,9909,0,64959
24-04-2026,BHADANI INDUSTRIES,BHADANI INDUSTRIES,BHADANI INDUSTRIES,24AIXPP7241F1ZV,TL,MO : 9909319595,MO : 9909319595,info@thehimalaya.co.in,supersales2,24-04-2026,"0, GOTHADA,SAVLI,\r\nVADODARA,GUJARAT",,,391770,MHC,900 MM,D400,3,GREY,13147,39441,18%,7099.38,0,46540.38
24-04-2026,BHADANI INDUSTRIES,BHADANI INDUSTRIES,BHADANI INDUSTRIES,24AIXPP7241F1ZV,TL,MO : 9909319595,MO : 9909319595,info@thehimalaya.co.in,supersales2,24-04-2026,"0, GOTHADA,SAVLI,\r\nVADODARA,GUJARAT",,,391770,MHC,900X900,D400,1,GREY,22070,22070,18%,3972.6,0,26042.6
24-04-2026,BHADANI INDUSTRIES,BHADANI INDUSTRIES,BHADANI INDUSTRIES,24AIXPP7241F1ZV,TL,MO : 9909319595,MO : 9909319595,info@thehimalaya.co.in,supersales2,24-04-2026,"0, GOTHADA,SAVLI,\r\nVADODARA,GUJARAT",,,391770,MHC,1000X1000,D400,3,GREY,28169,84507,18%,15211.26,0,99718.26
24-04-2026,BHADANI INDUSTRIES,BHADANI INDUSTRIES,BHADANI INDUSTRIES,24AIXPP7241F1ZV,TL,MO : 9909319595,MO : 9909319595,info@thehimalaya.co.in,supersales2,24-04-2026,"0, GOTHADA,SAVLI,\r\nVADODARA,GUJARAT",,,391770,MHC,1000X1000,B125,1,GREY,19483,19483,18%,3506.94,0,22989.94
01-05-2026,D.D RETAILS SALES,D.D RETAILS SALES,D.D RETAILS SALES,24AIXPP7241F1ZV,TL, 84888 11670,,info@thehimalaya.co.in,supersales2,01-05-2026,DELHI DARWAJA,,,380001,MHC,450X450,ELD,1,GREY,2245,2245,18%,404.1,0,2649.1
01-05-2026,VISHAN REAL ESTATE PVT LTD,VISHAN REAL ESTATE PVT LTD,VISHAN REAL ESTATE PVT LTD,24AAKCV4374K1ZV,TL,MO : 9998184929,MO : 9998184929,info@thehimalaya.co.in,supersales2,01-05-2026,"302, TRINITY COMPLEX,\r\nOPP. SIGNATURE COMPLES,AHMEDABAD\r\nGUJARAT.",,,380059,MHC,12X12,ELD,1,GREY,480,480,18%,86.4,0,566.4
25-05-2026,MAHALAXMI CORPORATION,MAHALAXMI CORPORATION,MAHALAXMI CORPORATION,24AOVPP1771L1Z9,TL,HITESH BHAI : 7575876516,HITESH BHAI : 7575876516,info@thehimalaya.co.in,supersales2,25-05-2026,"B-8, DRIVE IN ROAD, BALAJI CENTRE,\r\nOPP. GURUKUL,MEMNAGAR,AHMEDABAD",,,380052,MHC,300X300,D400,1,GREY,4345,4345,18%,782.1,0,5127.1
25-05-2026,MAHALAXMI CORPORATION,MAHALAXMI CORPORATION,MAHALAXMI CORPORATION,24AOVPP1771L1Z9,TL,HITESH BHAI : 7575876516,HITESH BHAI : 7575876516,info@thehimalaya.co.in,supersales2,25-05-2026,"B-8, DRIVE IN ROAD, BALAJI CENTRE,\r\nOPP. GURUKUL,MEMNAGAR,AHMEDABAD",,,380052,WGC,600X600,D400,2,GREY,9625,19250,18%,3465,0,22715
25-05-2026,MAHALAXMI CORPORATION,MAHALAXMI CORPORATION,MAHALAXMI CORPORATION,24AOVPP1771L1Z9,TL,HITESH BHAI : 7575876516,HITESH BHAI : 7575876516,info@thehimalaya.co.in,supersales2,25-05-2026,"B-8, DRIVE IN ROAD, BALAJI CENTRE,\r\nOPP. GURUKUL,MEMNAGAR,AHMEDABAD",,,380052,MHC,600X600,D400,1,GREY,8910,8910,18%,1603.8,0,10513.8
25-05-2026,MAHALAXMI CORPORATION,MAHALAXMI CORPORATION,MAHALAXMI CORPORATION,24AOVPP1771L1Z9,TL,HITESH BHAI : 7575876516,HITESH BHAI : 7575876516,info@thehimalaya.co.in,supersales2,25-05-2026,"B-8, DRIVE IN ROAD, BALAJI CENTRE,\r\nOPP. GURUKUL,MEMNAGAR,AHMEDABAD",,,380052,RCS,600X600,D400,9,BLACK,12595,113355,18%,20403.9,0,133758.9
25-05-2026,MAHALAXMI CORPORATION,MAHALAXMI CORPORATION,MAHALAXMI CORPORATION,24AOVPP1771L1Z9,TL,HITESH BHAI : 7575876516,HITESH BHAI : 7575876516,info@thehimalaya.co.in,supersales2,25-05-2026,"B-8, DRIVE IN ROAD, BALAJI CENTRE,\r\nOPP. GURUKUL,MEMNAGAR,AHMEDABAD",,,380052,RCS,900X900,D400,3,BLACK,29425,88275,18%,15889.5,0,104164.5
25-05-2026,MAHALAXMI CORPORATION,MAHALAXMI CORPORATION,MAHALAXMI CORPORATION,24AOVPP1771L1Z9,TL,HITESH BHAI : 7575876516,HITESH BHAI : 7575876516,info@thehimalaya.co.in,supersales2,25-05-2026,"B-8, DRIVE IN ROAD, BALAJI CENTRE,\r\nOPP. GURUKUL,MEMNAGAR,AHMEDABAD",,,380052,ONGC,385X700,D400,19,GREY,4895,93005,18%,16740.9,0,109745.9
27-05-2026,SHREE MOMAI INFRA CONSTRUCTION,SHREE MOMAI INFRA CONSTRUCTION,SHREE MOMAI INFRA CONSTRUCTION,24BMGPC4206F1ZP,TL, 84888 11670, 84888 11670,info@thehimalaya.co.in,supersales2,27-05-2026,"B-641, 6TH FLOOR, MONEY PLANT HIGH STREER,\r\nOPP. BSNL OFFICE, GODREJ GARDEN CITY,\r\nJAGATPUR,AHMEDABAD.",,,382470,WGC,600x600,C250,15,gray,6900,103500,18%,18630,0,122130
29-05-2026,SHREE MOMAI INFRA CONSTRUCTION,SHREE MOMAI INFRA CONSTRUCTION,SHREE MOMAI INFRA CONSTRUCTION,24BMGPC4206F1ZP,TL, 84888 11670, 84888 11670,info@thehimalaya.co.in,supersales2,29-05-2026,"B-641, 6TH FLOOR, MONEY PLANT HIGH STREER,\r\nOPP. BSNL OFFICE, GODREJ GARDEN CITY,\r\nJAGATPUR,AHMEDABAD.",,,382470,WGC,600x600,C250,27,grey,6900,186300,18%,33534,0,219834
01-06-2026,NILKANTH CORPORATION,NILKANTH CORPORATION,NILKANTH CORPORATION,24AAWFN5011G1ZA,TL,MO:+91 99049 85658,MO:+91 99049 85658,info@thehimalaya.co.in,supersales2,01-06-2026,"SURVEY NO. 835,TP NO.124/D,FP NO.19\r\nSUB DIVISION-1,GOPINATH EMPIRE\r\nGopinath Empire NIKOL NARODA ROAD\r\nAHMEDABAD",,,382345,MHC,600X600,C250,1,GREY,8000,8000,18%,1440,0,9440
01-06-2026,NILKANTH CORPORATION,NILKANTH CORPORATION,NILKANTH CORPORATION,24AAWFN5011G1ZA,TL,MO:+91 99049 85658,MO:+91 99049 85658,info@thehimalaya.co.in,supersales2,01-06-2026,"SURVEY NO. 835,TP NO.124/D,FP NO.19\r\nSUB DIVISION-1,GOPINATH EMPIRE\r\nGopinath Empire NIKOL NARODA ROAD\r\nAHMEDABAD",,,382345,MHC,600X450,C250,1,GREY,5576,5576,18%,1003.68,0,6579.68
06-02-2026,SHIVALIK INSTITUTE OF REAL ESTATE PVT LTD,SHIVALIK INSTITUTE OF REAL ESTATE PVT LTD,SHIVALIK INSTITUTE OF REAL ESTATE PVT LTD,24ABJCS8211L1Z3,TL,MO : 9727599235,MO : 9727599235,info@thehimalaya.co.in,supersales2,06-02-2026,"1, GROUND FLOOR, SHIVALIK HOUSE,\r\nNEAR SATELLITE POLICE STATION,\r\nAHMEDABAD,GUJARAT",,,380015,MHC,600X600,LD,2,GREY,4280,8560,18%,1540.8,0,10100.8
06-09-2026,MAHALAXMI CORPORATION,MAHALAXMI CORPORATION,MAHALAXMI CORPORATION,24AOVPP1771L1Z9,TL,HITESH BHAI : 7575876516,HITESH BHAI : 7575876516,info@thehimalaya.co.in,supersales2,06-09-2026,"B-8, DRIVE IN ROAD, BALAJI CENTRE,\r\nOPP. GURUKUL,MEMNAGAR,AHMEDABAD",,,380052,MHC,1200X1200,D400,1,GREY,47790,47790,18%,8602.2,0,56392.2
07-03-2026,DARSHIT TRADING CO,DARSHIT TRADING CO,DARSHIT TRADING CO,24AALPN5538R1ZX,TL,MO : 9099060116,MO : 9099060116,info@thehimalaya.co.in,supersales2,07-03-2026,"404, SHIVALIK-09, VASUDHARA SOCIETY,\r\nGULBAI TEKRA,AHMEDABAD,GUJARAT",,,380006,MHC,1000X1000,ELD,1,GREY,13915,13915,18%,2504.7,0,16419.7
04-07-2026,HARIKA DEVELOPERS,HARIKA DEVELOPERS,HARIKA DEVELOPERS,24AASFH7669G1ZS,TL,MO : 7069741838,MO : 7069741838,info@thehimalaya.co.in,supersales2,04-07-2026,"3, NIRANT CROSS ROAD,VASTRAL, GOPALCHARAN\r\nBUNGLOWS, NR. ARPAN SCHOOL,VASTRAL,AHMEDABAD\r\n",,,382418,RCS,600X600,D400,2,BLACK,13740,27480,18%,4946.4,0,32426.4
04-07-2026,SHUBH INFRA,SHUBH INFRA,SHUBH INFRA,24AESFS2868G1ZI,TL,MO:+91 70697 41838,MO:+91 70697 41838,info@thehimalaya.co.in,supersales2,04-07-2026,"D-402,DEV SHRUSTHTI APARTMENT,\r\nNIKOL NARODA ROAD AHMEDABAD",,,380049,RCS,600X600,D400,1,BLACK,13740,13740,18%,2473.2,0,16213.2
07-07-2026,CLASSIC ENTERPRISE,CLASSIC ENTERPRISE,CLASSIC ENTERPRISE,24AAPFC1258F1ZL,TL,MOB.9727220852,MOB.9727220852,info@thehimalaya.co.in,supersales2,07-07-2026,"Ground floor,Survey No 2333,Near ISMAILJI TIMBER,3 LATI\r\nPLOT RAJKOT 360003Ground floor,Survey No 2333,Near ISMAILJI TIMBER,3 LATI\r\nPLOT RAJKOT 360003",,,360003,MHC,12X12,LD,12,GREY,630,7560,18%,1360.8,0,8920.8
07-07-2026,CLASSIC ENTERPRISE,CLASSIC ENTERPRISE,CLASSIC ENTERPRISE,24AAPFC1258F1ZL,TL,MOB.9727220852,MOB.9727220852,info@thehimalaya.co.in,supersales2,07-07-2026,"Ground floor,Survey No 2333,Near ISMAILJI TIMBER,3 LATI\r\nPLOT RAJKOT 360003Ground floor,Survey No 2333,Near ISMAILJI TIMBER,3 LATI\r\nPLOT RAJKOT 360003",,,360003,MHC,18X18,LD,9,GREY,1350,12150,18%,2187,0,14337
07-07-2026,CLASSIC ENTERPRISE,CLASSIC ENTERPRISE,CLASSIC ENTERPRISE,24AAPFC1258F1ZL,TL,MOB.9727220852,MOB.9727220852,info@thehimalaya.co.in,supersales2,07-07-2026,"Ground floor,Survey No 2333,Near ISMAILJI TIMBER,3 LATI\r\nPLOT RAJKOT 360003Ground floor,Survey No 2333,Near ISMAILJI TIMBER,3 LATI\r\nPLOT RAJKOT 360003",,,360003,MHC,18X24,LD,12,GREY,1430,17160,18%,3088.8,0,20248.8
07-07-2026,CLASSIC ENTERPRISE,CLASSIC ENTERPRISE,CLASSIC ENTERPRISE,24AAPFC1258F1ZL,TL,MOB.9727220852,MOB.9727220852,info@thehimalaya.co.in,supersales2,07-07-2026,"Ground floor,Survey No 2333,Near ISMAILJI TIMBER,3 LATI\r\nPLOT RAJKOT 360003Ground floor,Survey No 2333,Near ISMAILJI TIMBER,3 LATI\r\nPLOT RAJKOT 360003",,,360003,MHC,24X24,LD,6,GREY,1995,11970,18%,2154.6,0,14124.6
11-07-2026,SAANVI GREEN ENERGY PVT LTD,SAANVI GREEN ENERGY PVT LTD,SAANVI GREEN ENERGY PVT LTD,24ABPCS3394A1ZA,TL,MO : 8655852860,MO : 8655852860,info@thehimalaya.co.in,supersales2,11-07-2026,"SHOP NO.510, INTERNATIONAL WEALTH CENTRE,\r\nVIP ROAD,SURAT,GUJARAT",,,395007,MHC,24x24,LD,10,GREY,1297,12970,18%,2334.6,0,15304.6
11-07-2026,SAANVI GREEN ENERGY PVT LTD,SAANVI GREEN ENERGY PVT LTD,SAANVI GREEN ENERGY PVT LTD,24ABPCS3394A1ZA,TL,MO : 8655852860,MO : 8655852860,info@thehimalaya.co.in,supersales2,11-07-2026,"SHOP NO.510, INTERNATIONAL WEALTH CENTRE,\r\nVIP ROAD,SURAT,GUJARAT",,,395007,MHC,750x750,C250,3,GREY,10150,30450,18%,5481,0,35931
13-07-2026,RATNAM LEASING LLP,RATNAM LEASING LLP,RATNAM LEASING LLP,24ABMFR2326M1ZX,TL,MO : 9974108813,MO : 9974108813,info@thehimalaya.co.in,supersales2,13-07-2026,"25, GROUND FLOOR,SHREE DATTA CO-OPERATIVE\r\nHOUSING SOCIETY LTD,SARKHEJ BHATHA ROAD,\r\nSARKHEJ,AHMEDABAD,GUJARAT",,,380007,WGC,600x600,LD,1,GREY,4509,4509,18%,811.62,0,5320.62
13-07-2026,RATNAM LEASING LLP,RATNAM LEASING LLP,RATNAM LEASING LLP,24ABMFR2326M1ZX,TL,MO : 9974108813,MO : 9974108813,info@thehimalaya.co.in,supersales2,13-07-2026,"25, GROUND FLOOR,SHREE DATTA CO-OPERATIVE\r\nHOUSING SOCIETY LTD,SARKHEJ BHATHA ROAD,\r\nSARKHEJ,AHMEDABAD,GUJARAT",,,380007,WGC,900x900,LD,1,GREY,11917,11917,18%,2145.06,0,14062.06
13-07-2026,RATNAM LEASING LLP,RATNAM LEASING LLP,RATNAM LEASING LLP,24ABMFR2326M1ZX,TL,MO : 9974108813,MO : 9974108813,info@thehimalaya.co.in,supersales2,13-07-2026,"25, GROUND FLOOR,SHREE DATTA CO-OPERATIVE\r\nHOUSING SOCIETY LTD,SARKHEJ BHATHA ROAD,\r\nSARKHEJ,AHMEDABAD,GUJARAT",,,380007,WGC,900x900,ELD,2,GREY,8764,17528,18%,3155.04,0,20683.04
13-07-2026,RATNAM LEASING LLP,RATNAM LEASING LLP,RATNAM LEASING LLP,24ABMFR2326M1ZX,TL,MO : 9974108813,MO : 9974108813,info@thehimalaya.co.in,supersales2,13-07-2026,"25, GROUND FLOOR,SHREE DATTA CO-OPERATIVE\r\nHOUSING SOCIETY LTD,SARKHEJ BHATHA ROAD,\r\nSARKHEJ,AHMEDABAD,GUJARAT",,,380007,MHC,600x600,C250,1,GREY,8418,8418,18%,1515.24,0,9933.24
13-07-2026,RATNAM LEASING LLP,RATNAM LEASING LLP,RATNAM LEASING LLP,24ABMFR2326M1ZX,TL,MO : 9974108813,MO : 9974108813,info@thehimalaya.co.in,supersales2,13-07-2026,"25, GROUND FLOOR,SHREE DATTA CO-OPERATIVE\r\nHOUSING SOCIETY LTD,SARKHEJ BHATHA ROAD,\r\nSARKHEJ,AHMEDABAD,GUJARAT",,,380007,WGC,450x450,C250,2,GREY,5864,11728,18%,2111.04,0,13839.04
18-07-2026,SHREE MOMAI INFRA CONSTRUCTION,SHREE MOMAI INFRA CONSTRUCTION,SHREE MOMAI INFRA CONSTRUCTION,24BMGPC4206F1ZP,TL, 84888 11670, 84888 11670,info@thehimalaya.co.in,supersales2,18-07-2026,"B-641, 6TH FLOOR, MONEY PLANT HIGH STREER,\r\nOPP. BSNL OFFICE, GODREJ GARDEN CITY,\r\nJAGATPUR,AHMEDABAD.",,,382470,WGC,600x600,C250,8,Grey,6900,55200,18%,9936,0,65136
31-07-2026,RAJ TREDERS,RAJ TREDERS,RAJ TREDERS,24AUXPB2439F1ZN,TL,MO-95104 76067,MO-95104 76067,info@thehimalaya.co.in,supersales2,31-07-2026,"71 RS NO23,HIRACHAND NAGAR\r\nMAGDFALLA ROAD\r\nSURAT,OPP RAKTADAN KENDRA,SURAT-395017",,,395017,MHC,1000x1000,C250,1,GREY,21810,21810,18%,3925.8,0,25735.8
03-08-2026,DHARNI AGENCY,DHARNI AGENCY,DHARNI AGENCY,24AFVPP8447E1ZW,TL,mo:+91 99250 00586,mo:+91 99250 00586,info@thehimalaya.co.in,supersales2,03-08-2026,"G-1,NR PRERNATIRTH DERASAR\r\nSUGUN COMPLEX\r\nJODHPUR SATELLITE ROAD\r\nAHMEDABAD",,,380015,MHC,10x10,LD,8,GREY,354,2832,18%,509.76,0,3341.76
03-08-2026,DHARNI AGENCY,DHARNI AGENCY,DHARNI AGENCY,24AFVPP8447E1ZW,TL,mo:+91 99250 00586,mo:+91 99250 00586,info@thehimalaya.co.in,supersales2,03-08-2026,"G-1,NR PRERNATIRTH DERASAR\r\nSUGUN COMPLEX\r\nJODHPUR SATELLITE ROAD\r\nAHMEDABAD",,,380015,MHC,12x12,LD,3,GREY,378,1134,18%,204.12,0,1338.12
03-08-2026,DHARNI AGENCY,DHARNI AGENCY,DHARNI AGENCY,24AFVPP8447E1ZW,TL,mo:+91 99250 00586,mo:+91 99250 00586,info@thehimalaya.co.in,supersales2,03-08-2026,"G-1,NR PRERNATIRTH DERASAR\r\nSUGUN COMPLEX\r\nJODHPUR SATELLITE ROAD\r\nAHMEDABAD",,,380015,MHC,30x30,LD,3,GREY,2550,7650,18%,1377,0,9027
03-08-2026,DHARNI AGENCY,DHARNI AGENCY,DHARNI AGENCY,24AFVPP8447E1ZW,TL,mo:+91 99250 00586,mo:+91 99250 00586,info@thehimalaya.co.in,supersales2,03-08-2026,"G-1,NR PRERNATIRTH DERASAR\r\nSUGUN COMPLEX\r\nJODHPUR SATELLITE ROAD\r\nAHMEDABAD",,,380015,MHC,18x24,LD,2,GREY,,0,18%,0,0,0
03-08-2026,DHARNI AGENCY,DHARNI AGENCY,DHARNI AGENCY,24AFVPP8447E1ZW,TL,mo:+91 99250 00586,mo:+91 99250 00586,info@thehimalaya.co.in,supersales2,03-08-2026,"G-1,NR PRERNATIRTH DERASAR\r\nSUGUN COMPLEX\r\nJODHPUR SATELLITE ROAD\r\nAHMEDABAD",,,380015,MHC,24x24,LD,3,GREY,,0,18%,0,0,0
05-08-2026,DHARNI AGENCY,DHARNI AGENCY,DHARNI AGENCY,24AFVPP8447E1ZW,TL,mo:+91 99250 00586,mo:+91 99250 00586,info@thehimalaya.co.in,supersales2,05-08-2026,"G-1,NR PRERNATIRTH DERASAR\r\nSUGUN COMPLEX\r\nJODHPUR SATELLITE ROAD\r\nAHMEDABAD",,,380015,MHC,10x10,LD,8,GREY,354,2832,18%,509.76,0,3341.76
05-08-2026,DHARNI AGENCY,DHARNI AGENCY,DHARNI AGENCY,24AFVPP8447E1ZW,TL,mo:+91 99250 00586,mo:+91 99250 00586,info@thehimalaya.co.in,supersales2,05-08-2026,"G-1,NR PRERNATIRTH DERASAR\r\nSUGUN COMPLEX\r\nJODHPUR SATELLITE ROAD\r\nAHMEDABAD",,,380015,MHC,12x12,LD,3,GREY,378,1134,18%,204.12,0,1338.12
05-08-2026,DHARNI AGENCY,DHARNI AGENCY,DHARNI AGENCY,24AFVPP8447E1ZW,TL,mo:+91 99250 00586,mo:+91 99250 00586,info@thehimalaya.co.in,supersales2,05-08-2026,"G-1,NR PRERNATIRTH DERASAR\r\nSUGUN COMPLEX\r\nJODHPUR SATELLITE ROAD\r\nAHMEDABAD",,,380015,MHC,30x30,LD,3,GREY,2550,7650,18%,1377,0,9027`;
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
        group_name: groupName,
        gst_name: gstName,
        gst_no: gstNo,
        site_incharge: siteIncharge,
        site_incharge_mobile: siteInchargeMobile,
        office_contact: officeContact,
        email: email,
        logged_in_sales_representive: 'supersales2',
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

  // 1. Resolve SuperSales 2 User
  const user = await prisma.user.findFirst({
    where: { email: { equals: 'supersales2@himalayaerp.com', mode: 'insensitive' } }
  });

  if (!user) {
    console.error(`❌ User supersales2@himalayaerp.com not found in database.`);
    return;
  }
  const userId = user.id;
  console.log(`Resolved SuperSales 2 user: ${user.name} (${user.id})`);

  // 2. Clear previous leads created by supersales2
  const cleared = await prisma.lead.deleteMany({
    where: {
      OR: [
        { createdById: userId },
        { salesExecutiveId: userId },
        { remarks: 'Imported from Taher Sir Super Sales 2 CSV' }
      ]
    }
  });
  console.log(`Cleared ${cleared.count} existing leads for SuperSales 2 to ensure a clean, precise import.`);

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

  console.log(`Seeding ${consolidatedLeads.length} consolidated leads for SuperSales 2...`);
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
    const leadNumber = `HCCL/${yy}${ny}/${String(sequenceCounter++).padStart(4, '0')}`;

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
      remarks: 'Imported from Taher Sir Super Sales 2 CSV',
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
