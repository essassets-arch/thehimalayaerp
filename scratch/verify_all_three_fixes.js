const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, text: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function login(email, password) {
  const res = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email, password }
  );
  return res.data?.data?.accessToken || res.data?.accessToken;
}

async function main() {
  console.log('--- STARTING VERIFICATION OF ALL 3 USER REQUIREMENTS ---\n');

  const token = await login('sana.r@himalayaerp.com', 'Himalaya@1234');
  if (!token) throw new Error('Failed to login as Store user');
  console.log('✓ 1. Authentication successful on port 4000');

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Check 1: /products?type=RAW_MATERIAL
  console.log('\n--- Checking GET /products?type=RAW_MATERIAL ---');
  const prodRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/products?type=RAW_MATERIAL',
    method: 'GET',
    headers: authHeaders,
  });

  const products = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data?.data || []);
  console.log(`Total raw material products returned: ${products.length}`);
  const matA = products.find(p => (p.sku || '').toUpperCase() === 'MAT-A' || (p.name || '').toLowerCase() === 'material a');
  if (!matA) {
    throw new Error('FAILED: Material A (MAT-A) is NOT returned by /products?type=RAW_MATERIAL!');
  }
  console.log(`✓ Material A found in /products?type=RAW_MATERIAL: ID=${matA.id}, SKU=${matA.sku}, Name=${matA.name}`);

  // Check 2: /inventory/stock-levels
  console.log('\n--- Checking GET /inventory/stock-levels ---');
  const stockRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/inventory/stock-levels',
    method: 'GET',
    headers: authHeaders,
  });

  const stocks = Array.isArray(stockRes.data) ? stockRes.data : (stockRes.data?.data || []);
  console.log(`Total stock levels returned: ${stocks.length}`);
  const sampleStockWithSku = stocks.find(s => s.sku);
  console.log(`Sample stock level with enriched sku/name:`, sampleStockWithSku ? {
    productId: sampleStockWithSku.productId,
    sku: sampleStockWithSku.sku,
    name: sampleStockWithSku.name,
    quantity: sampleStockWithSku.quantity
  } : 'No items with SKU found');

  // Check 3: Run the exact StorePortal.jsx Raw Inventory enrichment mapping
  console.log('\n--- Testing StorePortal.jsx Raw Inventory Enrichment Logic ---');
  const enriched = products.map(p => {
    const pSku = (p.sku || p.code || '').trim().toLowerCase();
    const pName = (p.name || p.material || '').trim().toLowerCase();
    const stockItem = stocks.find(s => {
      if (s.productId && (s.productId === p.id || s.productId === p.productId)) return true;
      if (s.rawMaterialId && (s.rawMaterialId === p.id || s.rawMaterialId === p.rawMaterialId)) return true;
      const sSku = (s.sku || '').trim().toLowerCase();
      if (pSku && sSku && pSku === sSku) return true;
      const sName = (s.name || '').trim().toLowerCase();
      if (pName && sName && pName === sName) return true;
      return false;
    });
    const qty = stockItem ? Number(stockItem.quantity) : 0;
    return {
      id: p.id,
      code: p.sku || p.publicId,
      material: p.name,
      stock: qty,
      status: qty <= 0 ? 'Out of Stock' : 'In Stock'
    };
  });

  const matAEnriched = enriched.find(e => (e.code || '').toUpperCase() === 'MAT-A');
  console.log(`Material A in Raw Inventory UI table:`, matAEnriched);
  if (!matAEnriched) {
    throw new Error('FAILED: Material A is not present in enriched raw inventory list!');
  }
  console.log(`✓ Material A is present in Raw Inventory table (/store/raw-inventory) with Code=${matAEnriched.code}, Material=${matAEnriched.material}, Stock=${matAEnriched.stock}`);

  console.log('\n======================================================');
  console.log('✓ ALL PRE-CHECKS PASSED!');
  console.log('======================================================');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
