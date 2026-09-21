async function testLiveLogins() {
  const users = [
    { email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' },
    { email: 'supersales1@himalayaerp.com', password: 'supersales123' },
    { email: 'sana.reddy@himalayaerp.com', password: 'Himalaya@1234' },
    { email: 'sana.r@himalayaerp.com', password: 'Himalaya@1234' },
    { email: 'moksha.naik@himalayaerp.com', password: 'Production@hcppl' },
    { email: 'moksha.n@himalayaerp.com', password: 'Production@hcppl' },
    { email: 'hussain.tinwala@himalayaerp.com', password: 'Rnd@hcppl' },
    { email: 'hussain.t@himalayaerp.com', password: 'Rnd@hcppl' },
  ];

  for (const u of users) {
    try {
      const res = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(u)
      });
      const data = await res.json();
      if (res.ok && data.data?.accessToken) {
        console.log(`✅ Success: ${u.email} -> Role: ${data.data?.user?.role?.code || data.data?.user?.role?.name || data.data?.user?.role}`);
      } else {
        console.log(`❌ Failed: ${u.email} -> Status: ${res.status}`);
      }
    } catch (e) {
      console.log(`💥 Error: ${u.email} -> ${e.message}`);
    }
  }
}

testLiveLogins();
