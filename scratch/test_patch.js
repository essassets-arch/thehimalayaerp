async function testPatch() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const auth = await loginRes.json();
  const token = auth.data.accessToken;
  const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };

  // Find a product: HIMALAYA FRP WGC 1200X1200 ELD WHITE
  const searchRes = await fetch('https://thehimalaya.cloud/api/v1/products?search=HIMALAYA+FRP+WGC+1200X1200+ELD+WHITE&scope=catalog', { headers });
  const searchData = await searchRes.json();
  const prod = searchData.data?.[0];
  if (!prod) {
    console.log('Product not found');
    return;
  }
  console.log('Found product:', prod.id, prod.name, 'current covers:', prod.coversPerSet, 'frames:', prod.framesPerSet);

  // Test PATCH
  const patchRes = await fetch(`https://thehimalaya.cloud/api/v1/products/${prod.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      coversPerSet: 2,
      framesPerSet: 1,
      setRatio: 1
    })
  });
  const patchData = await patchRes.json();
  console.log('Patch status:', patchRes.status);
  console.log('Patch result:', patchData);
}

testPatch().catch(console.error);
