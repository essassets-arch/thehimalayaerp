const fs = require('fs');

async function updateCloudProducts() {
  console.log('Logging in to https://thehimalaya.cloud as Super Admin...');
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });

  const authData = await loginRes.json();
  const token = authData.data?.accessToken;
  if (!token) throw new Error('Failed to login: ' + JSON.stringify(authData));

  const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };

  const mouldedIds = [
    { id: '7959c393-60db-4c51-ba3d-715e2c85f1f1', name: 'FRP MOULDED GRATING 25MM' },
    { id: 'bf4a04d6-69a4-4081-9fa4-4d34467c21f3', name: 'FRP MOULDED GRATING 30MM' },
    { id: '5ce7a35c-fbb1-4344-901b-71611c62a606', name: 'FRP MOULDED GRATING 38MM' },
    { id: '65a49970-6327-4f67-bff4-a90116a064bb', name: 'FRP MOULDED FRATINGS 50MM' }
  ];

  console.log('Updating 4 FRP Moulded Grating products to TRADING / D2...');
  for (const item of mouldedIds) {
    const updateRes = await fetch(`https://thehimalaya.cloud/api/v1/products/${item.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        productType: 'TRADING',
        dispatchCategory: 'D2',
        brand: 'HIMALAYA',
        category: 'FRP GRATINGS',
        isActive: true
      })
    });

    const updateResult = await updateRes.json();
    console.log(` - Updated ${item.name}: success = ${updateRes.ok}`, updateResult.data ? `(type: ${updateResult.data.productType}, cat: ${updateResult.data.dispatchCategory})` : updateResult);
  }

  // Verify
  console.log('\nVerifying updated products...');
  for (const item of mouldedIds) {
    const checkRes = await fetch(`https://thehimalaya.cloud/api/v1/products/${item.id}`, { headers });
    const checkData = await checkRes.json();
    const p = checkData.data || checkData;
    console.log(` ✓ Verified [${p.id}] ${p.name}: productType = ${p.productType}, dispatchCategory = ${p.dispatchCategory}`);
  }
}

updateCloudProducts().catch(console.error);
