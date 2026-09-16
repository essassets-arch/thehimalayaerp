async function inspect() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.accessToken;
  if (!token) {
    console.error('Failed to log in:', loginJson);
    return;
  }
  const headers = { 'Authorization': 'Bearer ' + token };

  const [rawProdRes, stockRes] = await Promise.all([
    fetch('https://thehimalaya.cloud/api/v1/products?type=RAW_MATERIAL&limit=1000', { headers }),
    fetch('https://thehimalaya.cloud/api/v1/inventory/stock-levels?limit=1000', { headers })
  ]);

  const rawProdData = await rawProdRes.json();
  const stockData = await stockRes.json();

  const rawProducts = Array.isArray(rawProdData?.data) ? rawProdData.data : (rawProdData?.data?.data || []);
  const stocks = Array.isArray(stockData?.data) ? stockData.data : (stockData?.data?.data || []);

  console.log(`Live RAW_MATERIAL products count: ${rawProducts.length}`);
  console.log(`Live stock levels count: ${stocks.length}`);

  console.log('Sample RAW_MATERIAL products (first 5):');
  console.log(JSON.stringify(rawProducts.slice(0, 5), null, 2));

  console.log('Sample stock levels (first 5):');
  console.log(JSON.stringify(stocks.slice(0, 5), null, 2));
}

inspect().catch(console.error);
