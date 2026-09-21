const fs = require('fs');

async function fetchLiveProducts() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales1@himalayaerp.com', password: 'supersales123' })
  });

  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  const prodRes = await fetch('https://thehimalaya.cloud/api/v1/products?limit=5000', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const prodData = await prodRes.json();
  const products = Array.isArray(prodData) ? prodData : (prodData.data || []);
  console.log(`Fetched ${products.length} products from live cloud.`);
  if (products.length > 0) {
    console.log('Sample product:', {
      id: products[0].id,
      code: products[0].code || products[0].sku,
      name: products[0].name,
      type: products[0].type,
      size: products[0].size,
      capacity: products[0].capacity,
      unitPrice: products[0].unitPrice
    });
    fs.writeFileSync('scratch/live_products.json', JSON.stringify(products, null, 2));
    console.log('Saved products to scratch/live_products.json');
  }
}

fetchLiveProducts().catch(console.error);
