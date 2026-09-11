async function run() {
  const loginRes = await fetch('http://127.0.0.1:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' }),
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.accessToken;

  const res = await fetch('http://127.0.0.1:4000/api/v1/production/all-stock', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  console.log('Keys of json:', Object.keys(json));
  console.log('Keys of json.data:', json.data ? Object.keys(json.data) : null);
  if (json.data && json.data.items) {
    console.log('json.data.items.length:', json.data.items.length);
  } else if (Array.isArray(json.data)) {
    console.log('json.data is Array, length:', json.data.length);
  }
}
run();
