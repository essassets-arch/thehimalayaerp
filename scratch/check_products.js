async function check() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const prodRes = await fetch('https://thehimalaya.cloud/api/v1/products?limit=5000', { headers });
  const prodJson = await prodRes.json();
  const products = Array.isArray(prodJson.data) ? prodJson.data : (prodJson.data?.data || []);

  const targets = ['600X600', '450X450', '600X450', '900X900', '28X28', '750X750'];
  for (const t of targets) {
    const matches = products.filter(p => p.sku?.toUpperCase().includes(t) || p.name?.toUpperCase().includes(t));
    console.log(`=== Matches for ${t} (${matches.length}) ===`);
    for (const m of matches.slice(0, 6)) {
      console.log(`  ${m.name} | SKU: ${m.sku}`);
    }
  }
}
check().catch(console.error);
