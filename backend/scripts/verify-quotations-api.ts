async function verifyQuotations() {
  try {
    console.log('1. Logging in as sales.executive@himalayaerp.com...');
    const loginRes = await fetch('http://localhost:4000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sales.executive@himalayaerp.com', password: 'admin123' }),
    });

    if (!loginRes.ok) {
      throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.data?.accessToken || loginData.accessToken;
    console.log('✓ Fresh JWT Token acquired successfully.');

    const endpoints = [
      '/api/backend/crm/quotations',
      '/api/backend/products',
      '/api/backend/warehouses',
      '/api/backend/suppliers',
      '/api/backend/inventory/stock-levels',
      '/api/backend/sales/complaints',
    ];

    console.log('\n2. Testing endpoints via Next.js API Bridge...');
    let allOk = true;

    for (const ep of endpoints) {
      const res = await fetch(`http://localhost:3000${ep}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`${ep} => Status ${res.status} ${res.statusText}`);
      if (res.status !== 200) {
        allOk = false;
      }
    }

    if (allOk) {
      console.log('\n✅ ALL ENDPOINTS RETURNED 200 OK SUCCESS!');
      process.exit(0);
    } else {
      console.error('\n❌ VERIFICATION FAILED FOR ONE OR MORE ENDPOINTS.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error during verification:', err);
    process.exit(1);
  }
}

verifyQuotations();
