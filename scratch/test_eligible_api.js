require('dotenv').config({ path: 'backend/.env' });
const axios = require('axios');

async function main() {
  // Login
  const loginRes = await axios.post('http://localhost:4001/api/v1/auth/login', {
    email: 'super.admin@himalayaerp.com',
    password: 'SuperAdmin@hcppl'
  });

  const token = loginRes.data?.data?.accessToken || loginRes.data?.accessToken;
  console.log('Login token obtained:', !!token);

  // Call eligibleForPO
  const res = await axios.get('http://localhost:4001/api/v1/procurement/finance/eligible-indents?limit=100', {
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log('Eligible Indents Response:');
  console.log(JSON.stringify(res.data, null, 2));
}

main().catch(err => {
  console.error('Error:', err.response?.data || err.message);
});
