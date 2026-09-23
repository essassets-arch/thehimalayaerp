const fs = require('fs');

async function checkCloudProducts() {
  console.log('Logging in to https://thehimalaya.cloud...');
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });

  const authData = await loginRes.json();
  const token = authData.data?.accessToken;
  if (!token) {
    console.error('Login failed:', authData);
    return;
  }
  console.log('Logged in successfully!');

  const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };

  const res = await fetch('https://thehimalaya.cloud/api/v1/products?scope=catalog&limit=5000', { headers });
  const data = await res.json();
  const products = data.data || [];
  console.log(`Total catalog products on cloud: ${products.length}`);

  const trading = products.filter(p => p.productType === 'TRADING');
  const mfg = products.filter(p => p.productType === 'MANUFACTURING');
  const d1 = products.filter(p => p.dispatchCategory === 'D1');
  const d2 = products.filter(p => p.dispatchCategory === 'D2');

  console.log(`Cloud product stats:`);
  console.log(` - TRADING: ${trading.length}`);
  console.log(` - MANUFACTURING: ${mfg.length}`);
  console.log(` - D1: ${d1.length}`);
  console.log(` - D2: ${d2.length}`);

  // List of items from user request
  const rawUserList = [
    "FRP MOULDED GRATING 25MM",
    "HIMALAYA FRP MOULDED GRATING 30MM",
    "HIMALAYA FRP MOULDED GRATING 38MM",
    "HIMALAYA FRP MOULDED FRATINGS 50MM",
    "HIMALAYA RCC HUME PIPE NP2 CLASS",
    "HIMALAYA RCC HUME PIPE NP3 CLASS",
    "HIMALAYA RCC HUME PIPE NP4 CLASS",
    "HIMALAYA FRCSQRC24x24 LD3",
    "HIMALAYA FRCSQRC24x24 LD5",
    "HIMALAYA FRCSQRC24x24 MD10",
    "HIMALAYA FRCSQRC30x30 LD5",
    "HIMALAYA FRCSQRC30x30 MD10",
    "HIMALAYA FRCSQRC30x30 HD20",
    "HIMALAYA FRCSQRC33x33 HD20",
    "HIMALAYA FRCSQRC34x34 LD5",
    "HIMALAYA FRCSQRC34x34 HD20",
    "HIMALAYA FRCSQRC34x34 EHD35",
    "HIMALAYA FRCSQRC36x36 LD5",
    "HIMALAYA FRCSQRC36x36 MD10",
    "HIMALAYA FRCSQRC36x36 HD20",
    "HIMALAYA FRCSQRC36x36 EHD35",
    "HIMALAYA FRCSQRC42x42 LD5",
    "HIMALAYA FRCSQRC42x42 HD20",
    "HIMALAYA FRCSQRC42x42 EHD35",
    "HIMALAYA FRCSQRC48x48 LD5",
    "HIMALAYA FRCSQRC48x48 HD20",
    "HIMALAYA FRCSQRC48x48 EHD35",
    "HIMALAYA FRCRFRC24x18 LD1",
    "HIMALAYA FRCRFRC28x22 LD2",
    "HIMALAYA FRCRFRC28x22 LD5",
    "HIMALAYA FRCRFRC28x22 MD10",
    "HIMALAYA FRCRFRC30x24 LD3",
    "HIMALAYA FRCRFRC32x26 LD5",
    "HIMALAYA FRCRFRC32x26 MD10",
    "HIMALAYA FRCRFRC32x26 HD20",
    "HIMALAYA FRCRFRC36x24 MD10",
    "HIMALAYA FRCRFRC38x26 LD5",
    "HIMALAYA FRCRFRC44x26 LD5",
    "HIMALAYA FRCRFRC38x32 MD10",
    "HIMALAYA FRCRFRC38x32 HD20",
    "HIMALAYA FRCRFRC41x35.5 EHD35",
    "HIMALAYA FRCRFRC44x26 MD10",
    "HIMALAYA FRCRFRC44x26 HD20",
    "HIMALAYA FRCRFRC44x34 MD10",
    "HIMALAYA FRCRFRC44x34 HD20",
    "HIMALAYA FRCRFRC42x48 HD20",
    "HIMALAYA FRCRFRC48x44 HD20",
    "HIMALAYA FRCRFRC52x42 EHD35",
    "HIMALAYA FRCRFRC60x48 LD5",
    "HIMALAYA FRCRFRC60x48 HD20",
    "HIMALAYA FRCRFRC60x48 EHD35",
    "HIMALAYA FRCSFSC12x12",
    "HIMALAYA FRCSFSC15x15",
    "HIMALAYA FRCSFSC18x18 LD1",
    "HIMALAYA FRCSFSC18x18 MD10",
    "HIMALAYA FRCSFSC18x18 HD20",
    "HIMALAYA FRCSFSC24x24 LD2",
    "HIMALAYA FRCSFSC24x24 LD5",
    "HIMALAYA FRCSFSC24x24 HD20",
    "HIMALAYA FRCSFSC27x27 LD3",
    "HIMALAYA FRCSFSC30x30 LD5",
    "HIMALAYA FRCSFSC30x30 MD10",
    "HIMALAYA FRCSFSC30x30 HD20",
    "HIMALAYA FRCSFSC30x30 EHD35",
    "HIMALAYA FRCSFSC32.5x32.5 LD5",
    "HIMALAYA FRCSFSC32.5x32.5 MD10",
    "HIMALAYA FRCSFSC36x36 HD20",
    "HIMALAYA FRCSFSC36x36 EHD35",
    "HIMALAYA FRCSFSC38x38 LD5",
    "HIMALAYA FRCSFSC42x42 MD10",
    "HIMALAYA FRCSFSC42x42 HD20",
    "HIMALAYA FRCSFSC42x42 EHD35",
    "HIMALAYA FRCSFSC48x48 HD20",
    "HIMALAYA FRCSFSC48x48 EHD35",
    "HIMALAYA FRCSFSC55x55 HD20",
    "HIMALAYA FRCSFSC55x55 EHD35",
    "HIMALAYA FRCSFSC63x63 HD20",
    "HIMALAYA FRCSFSC63x63 EHD35",
    "HIMALAYA FRCSFSC67x67 HD20",
    "HIMALAYA FRCSFSC67x67 EHD35",
    "HIMALAYA FRCROFROC30 dia MD10",
    "HIMALAYA FRCROFROC30 dia HD20",
    "HIMALAYA FRCROFROC31.5 dia HD20",
    "HIMALAYA FRCROFROC31.5 dia EHD35",
    "HIMALAYA FRCROFROC33 dia HD20",
    "HIMALAYA FRCROFROC34 dia HD20",
    "HIMALAYA FRCROFROC34 dia EHD35",
    "HIMALAYA FRCCP24x24 LD5",
    "HIMALAYA FRCCP24x24 HD20",
    "HIMALAYA FRCCP28x22 MD10",
    "HIMALAYA FRCCP30x30 LD5",
    "HIMALAYA FRCCP30x30 MD10",
    "HIMALAYA FRCCP30x30 HD20",
    "HIMALAYA FRCCP32x26 LD5",
    "HIMALAYA FRCCP32x26 MD10",
    "HIMALAYA FRCCP32x26 HD20",
    "HIMALAYA FRCCP32.5x32.5 LD5",
    "HIMALAYA FRCCP32.5x32.5 MD10",
    "HIMALAYA FRCCP36x36 HD20",
    "HIMALAYA FRCCP36x36 EHD35",
    "HIMALAYA FRCCP42x42 MD10",
    "HIMALAYA FRCCP42x42 HD20",
    "HIMALAYA FRCCP42x42 EHD35",
    "HIMALAYA FRCCP44x34 MD10",
    "HIMALAYA FRCCP44x34 HD20",
    "HIMALAYA FRCCP48x48 HD20",
    "HIMALAYA FRCCP48x48 EHD35",
    "HIMALAYA FRCCP60x48 HD20",
    "HIMALAYA FRCCP60x48 EHD35",
    "HIMALAYA FRCGT ONLY CO12x12",
    "HIMALAYA FRCGT FC 12x12",
    "HIMALAYA FRCTSOC 24 x 12x2",
    "HIMALAYA FRCTSOC 28 x 12x2",
    "HIMALAYA FRCTSOC 24 x 18x2",
    "HIMALAYA FRCTSOC 24 x 24x2R",
    "HIMALAYA FRCTSOC 36 x 18x2",
    "HIMALAYA FRCTSOC 36 x 24x2R",
    "HIMALAYA FRCTSOC 36 x 24x4R",
    "HIMALAYA FRCTPEC 24 x 12x2",
    "HIMALAYA FRCTPEC 24 x 16x2",
    "HIMALAYA FRCTPEC 24 x 18x2",
    "HIMALAYA FRCTPEC 30 x 24x2",
    "HIMALAYA WCB 20MM",
    "HIMALAYA WCB 25MM",
    "HIMALAYA WCB 30MM",
    "HIMALAYA WCB 40MM",
    "HIMALAYA WCB 50MM",
    "HIMALAYA PCB 40 MM",
    "HIMALAYA PCB 50 MM",
    "HIMALAYA PCB 75MM",
    "HIMALAYA HTCB 40 MM",
    "HIMALAYA HTCB 50 MM",
    "HIMALAYA HTCB 75 MM",
    "HIMALAYA DTCB 20MM",
    "HIMALAYA DTCB 25MM",
    "HIMALAYA DTCB 30MM",
    "HIMALAYA DTCB 40MM",
    "HIMALAYA DTCB 50MM",
    "HIMALAYA DTCB 60MM",
    "HIMALAYA DTCB 75MM",
    "HIMALAYA DTCB 100MM",
    "HIMALAYA MCB 30X40MM",
    "HIMALAYA MCB35X40X45MM",
    "HIMALAYA MCB 20X25X40X50MM"
  ];

  console.log(`\nChecking user's items against cloud products...`);
  const notFound = [];
  const foundMfg = [];
  const foundTrading = [];

  for (const item of rawUserList) {
    const cleanItem = item.trim();
    const withoutHimalaya = cleanItem.replace(/^HIMALAYA\s+/i, '').trim();
    const match = products.find(p => {
      const pName = (p.name || '').trim();
      const pSku = (p.sku || '').trim();
      return pName.toLowerCase() === cleanItem.toLowerCase() ||
             pName.toLowerCase() === withoutHimalaya.toLowerCase() ||
             pName.toLowerCase() === ('HIMALAYA ' + withoutHimalaya).toLowerCase() ||
             pSku.toLowerCase() === cleanItem.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() ||
             pSku.toLowerCase() === withoutHimalaya.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    });

    if (!match) {
      notFound.push(cleanItem);
    } else {
      if (match.productType === 'TRADING' && match.dispatchCategory === 'D2') {
        foundTrading.push({ name: match.name, sku: match.sku, productType: match.productType, dispatchCategory: match.dispatchCategory });
      } else {
        foundMfg.push({ name: match.name, sku: match.sku, productType: match.productType, dispatchCategory: match.dispatchCategory, id: match.id });
      }
    }
  }

  console.log(`\nResults:`);
  console.log(` - Already Trading / D2: ${foundTrading.length}`);
  console.log(` - Found but NOT Trading / D2 (e.g. MFG or D1): ${foundMfg.length}`);
  console.log(` - Not found at all: ${notFound.length}`);

  if (foundMfg.length > 0) {
    console.log(`\nSample of found products that are NOT Trading/D2:`);
    foundMfg.slice(0, 15).forEach(p => console.log(`   ${p.name} -> type: ${p.productType}, cat: ${p.dispatchCategory}`));
  }

  if (notFound.length > 0) {
    console.log(`\nSample of not found products:`);
    notFound.slice(0, 15).forEach(p => console.log(`   ${p}`));
  }
}

checkCloudProducts().catch(console.error);
