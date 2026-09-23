const fs = require('fs');

const userItems = [
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

async function checkDetails() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });

  const authData = await loginRes.json();
  const token = authData.data?.accessToken;
  const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };

  const res = await fetch('https://thehimalaya.cloud/api/v1/products?scope=catalog&limit=5000', { headers });
  const data = await res.json();
  const products = data.data || [];

  const matched = [];
  const unmatched = [];

  for (const raw of userItems) {
    const withoutH = raw.replace(/^HIMALAYA\s+/i, '').trim();
    const cleanSku = withoutH.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    const p = products.find(prod => {
      const pName = (prod.name || '').trim().toLowerCase();
      const pSku = (prod.sku || '').trim().toUpperCase();
      return pName === raw.toLowerCase() ||
             pName === withoutH.toLowerCase() ||
             pSku === cleanSku ||
             pSku === ('HIMALAYA' + cleanSku);
    });

    if (p) {
      matched.push({
        userInput: raw,
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        productType: p.productType,
        dispatchCategory: p.dispatchCategory
      });
    } else {
      unmatched.push(raw);
    }
  }

  console.log(`Matched: ${matched.length} / ${userItems.length}`);
  console.log(`Unmatched: ${unmatched.length}`);
  if (unmatched.length > 0) {
    console.log('Unmatched items:', unmatched);
  }

  const needUpdate = matched.filter(m => m.productType !== 'TRADING' || m.dispatchCategory !== 'D2');
  console.log(`Items needing update to TRADING & D2: ${needUpdate.length}`);
  needUpdate.forEach(u => console.log(` - [${u.id}] ${u.name} (type: ${u.productType}, cat: ${u.dispatchCategory})`));
}

checkDetails().catch(console.error);
