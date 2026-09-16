async function testLocalApi() {
  const loginRes = await fetch('http://localhost:4001/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const [rawProdRes, stockRes] = await Promise.all([
    fetch('http://localhost:4001/api/v1/products?type=RAW_MATERIAL&limit=1000', { headers }),
    fetch('http://localhost:4001/api/v1/inventory/stock-levels', { headers })
  ]);

  const rawProducts = (await rawProdRes.json()).data || [];
  const stocks = (await stockRes.json()).data || [];

  console.log(`Local RAW_MATERIAL products count: ${rawProducts.length}`);
  console.log(`Local stock levels count: ${stocks.length}`);
}

testLocalApi().catch(console.error);
