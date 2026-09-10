const axios = require('axios');

async function test() {
  const loginRes = await axios.post('http://localhost:4001/api/v1/auth/login', {
    email: 'makhdum@himalayaerp.com',
    password: 'Himalaya@1234'
  });
  const token = loginRes.data.token || loginRes.data.access_token || loginRes.data.data?.token || loginRes.data.data?.accessToken;
  const headers = { Authorization: `Bearer ${token}` };

  console.log('1. Fetching raw inventory items...');
  const invRes = await axios.get('http://localhost:4001/api/v1/products?type=RAW_MATERIAL', { headers });
  const items = invRes.data?.data || invRes.data || [];
  console.log(`Fetched ${items.length} materials`);
  
  const handleItem = items.find(i => (i.material || i.name || '').toLowerCase().includes('handle') && (i.code || i.sku) === 'HM204') || items[0];
  console.log('Target item:', { id: handleItem.id, name: handleItem.material || handleItem.name, code: handleItem.code || handleItem.sku, stock: handleItem.stock });

  // Test + In
  console.log('\n2. Testing Quick Stock In (+ In)...');
  try {
    const inRes = await axios.post('http://localhost:4001/api/v1/inventory/transactions', {
      productId: handleItem.id,
      type: 'IN',
      quantity: 2,
      referenceType: 'QUICK_STOCK_IN',
      referenceId: 'Test Inward 2 PCS'
    }, { headers });
    console.log('✓ Quick Stock In success:', inRes.data);
  } catch (e) {
    console.error('✗ Quick Stock In failed:', e.response?.status, e.response?.data || e.message);
  }

  // Test - Out
  console.log('\n3. Testing Quick Stock Out (- Out)...');
  try {
    const outRes = await axios.post('http://localhost:4001/api/v1/inventory/transactions', {
      productId: handleItem.id,
      type: 'OUT',
      quantity: 1,
      referenceType: 'QUICK_STOCK_OUT',
      referenceId: 'Test Issue 1 PCS'
    }, { headers });
    console.log('✓ Quick Stock Out success:', outRes.data);
  } catch (e) {
    console.error('✗ Quick Stock Out failed:', e.response?.status, e.response?.data || e.message);
  }

  // Test Adj
  console.log('\n4. Testing Quick Adjust (Adj)...');
  try {
    const adjRes = await axios.post('http://localhost:4001/api/v1/inventory/transactions', {
      productId: handleItem.id,
      type: 'IN',
      quantity: 3,
      referenceType: 'STOCK_ADJUSTMENT',
      referenceId: 'Physical Count Reconciliation'
    }, { headers });
    console.log('✓ Quick Adjust success:', adjRes.data);
  } catch (e) {
    console.error('✗ Quick Adjust failed:', e.response?.status, e.response?.data || e.message);
  }
}

test();
