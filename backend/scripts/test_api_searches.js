const fetch = globalThis.fetch;

async function main() {
  const loginRes = await fetch('http://localhost:3000/api/backend/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'admin123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  const queries = ['MHC 1200X1200', 'WGC 1200X1200', 'RCS 1800X1800', 'ONGC 600X1000'];

  for (const q of queries) {
    const res = await fetch('http://localhost:3000/api/backend/products?search=' + encodeURIComponent(q), {
      headers: { Authorization: 'Bearer ' + token },
    });
    const data = await res.json();
    const items = data.data || data || [];
    console.log(`Search: "${q}" => found ${items.length} items. Sample: ${items[0]?.name}`);
  }
}

main().catch(console.error);
