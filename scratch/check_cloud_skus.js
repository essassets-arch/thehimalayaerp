async function checkCloudItems() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const res = await fetch('https://thehimalaya.cloud/api/v1/products?type=RAW_MATERIAL&limit=1000', { headers });
  const rawProducts = (await res.json()).data || [];

  const hmItems = rawProducts.filter(p => p.sku?.startsWith('HM'));
  const hcpplItems = rawProducts.filter(p => p.sku?.startsWith('HCPPL'));
  const otherItems = rawProducts.filter(p => !p.sku?.startsWith('HM') && !p.sku?.startsWith('HCPPL'));

  console.log(`Total live items: ${rawProducts.length}`);
  console.log(`  HM items: ${hmItems.length}`);
  console.log(`  HCPPL items: ${hcpplItems.length}`);
  console.log(`  Other items: ${otherItems.length}`);
}

checkCloudItems().catch(console.error);
