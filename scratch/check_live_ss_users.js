async function checkLiveUsers() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  // Check users
  const usersRes = await fetch('https://thehimalaya.cloud/api/v1/users', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const usersJson = await usersRes.json();
  const users = usersJson.data?.items || usersJson.data || [];
  const ssUsers = users.filter(u => u.email?.includes('supersales') || u.name?.toLowerCase().includes('supersales'));
  console.log('SuperSales users in /api/v1/users on live:', ssUsers.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role?.name
  })));

  // Try logging in as supersales1
  const ss1Login = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales1@himalayaerp.com', password: 'supersales123' })
  });
  console.log('supersales1 login status:', ss1Login.status);
  const ss1Data = await ss1Login.json();
  console.log('supersales1 user data:', ss1Data.data?.user ? {
    id: ss1Data.data.user.id,
    name: ss1Data.data.user.name,
    email: ss1Data.data.user.email,
    role: ss1Data.data.user.role
  } : ss1Data);

  // Try logging in as supersales2
  const ss2Login = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'supersales2@himalayaerp.com', password: 'supersales124' })
  });
  console.log('supersales2 login status:', ss2Login.status);
  const ss2Data = await ss2Login.json();
  console.log('supersales2 user data:', ss2Data.data?.user ? {
    id: ss2Data.data.user.id,
    name: ss2Data.data.user.name,
    email: ss2Data.data.user.email,
    role: ss2Data.data.user.role
  } : ss2Data);
}

checkLiveUsers().catch(console.error);
