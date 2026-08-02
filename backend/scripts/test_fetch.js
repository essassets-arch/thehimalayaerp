const http = require('http');

async function testFetch() {
  const loginRes = await fetch('http://localhost:3000/api/backend/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@system.local', password: 'password' }) // guessing admin creds
  });
  if (!loginRes.ok) {
    console.log('Login failed:', loginRes.status);
    return;
  }
  const loginData = await loginRes.json();
  const token = loginData.token || loginData.access_token;
  
  const dispatchesRes = await fetch('http://localhost:3000/api/backend/logistics/dispatches', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Dispatches status:', dispatchesRes.status);
  const data = await dispatchesRes.json();
  console.log('Is Array?', Array.isArray(data));
  if (Array.isArray(data)) {
    console.log('Count:', data.length);
    console.log('Statuses:', data.map(d => d.status));
  } else {
    console.log('Response:', data);
  }
}

testFetch();
