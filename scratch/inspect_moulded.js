const fs = require('fs');

async function inspectAll() {
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

  const fourMoulded = products.filter(p => p.name.includes('MOULDED'));
  console.log('Moulded grating products on cloud:');
  console.log(JSON.stringify(fourMoulded.map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    productType: p.productType,
    dispatchCategory: p.dispatchCategory,
    category: p.category
  })), null, 2));

  const allTrading = products.filter(p => p.productType === 'TRADING' || p.dispatchCategory === 'D2');
  console.log(`\nTotal Trading or D2 products: ${allTrading.length}`);
  const notTradingType = allTrading.filter(p => p.productType !== 'TRADING');
  console.log(`Not TRADING productType: ${notTradingType.length}`);
  notTradingType.forEach(p => console.log(` - ${p.name} (type: ${p.productType}, cat: ${p.dispatchCategory})`));

  const notD2 = allTrading.filter(p => p.dispatchCategory !== 'D2');
  console.log(`Not D2 dispatchCategory: ${notD2.length}`);
  notD2.forEach(p => console.log(` - ${p.name} (type: ${p.productType}, cat: ${p.dispatchCategory})`));
}

inspectAll().catch(console.error);
