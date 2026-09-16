async function inspectRawMaterials() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const res = await fetch('https://thehimalaya.cloud/api/v1/products?type=RAW_MATERIAL&limit=1000', { headers });
  const data = (await res.json()).data || [];
  
  console.log(`Fetched ${data.length} raw materials.`);
  // Print summary of IDs, SKUs, and Names
  const summary = data.slice(0, 20).map(x => ({
    id: x.id,
    sku: x.sku,
    name: x.name,
    category: x.category,
    companyId: x.companyId,
    productType: x.productType
  }));
  console.log('Sample 20:', summary);

  const last10 = data.slice(-10).map(x => ({
    id: x.id,
    sku: x.sku,
    name: x.name,
    category: x.category,
    companyId: x.companyId,
    productType: x.productType
  }));
  console.log('Last 10:', last10);
}

inspectRawMaterials().catch(console.error);
