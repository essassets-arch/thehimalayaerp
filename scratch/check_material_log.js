const axios = require('axios');

async function test() {
  const loginRes = await axios.post('http://localhost:4001/api/v1/auth/login', {
    email: 'makhdum@himalayaerp.com',
    password: 'Himalaya@1234'
  });
  const token = loginRes.data.token || loginRes.data.access_token || loginRes.data.data?.token || loginRes.data.data?.accessToken;
  console.log('Got token');

  const headers = { Authorization: `Bearer ${token}` };

  for (const q of ['handle', 'a3dd659b-c30f-45e5-8f8e-b23f3fc8f9dc', '5e91050b-3820-4de3-987c-d61099405970', 'HM204', 'PROD-HANDLE-101', 'RM-HANDLE-101']) {
    try {
      const res = await axios.get(`http://localhost:4001/api/v1/inventory/material-log/${encodeURIComponent(q)}`, { headers });
      console.log(`Log for [${q}]:`, {
        material: res.data.data?.material,
        currentStock: res.data.data?.currentStock,
        totalMovements: res.data.data?.totalMovements,
        historyCount: res.data.data?.history?.length,
        history: res.data.data?.history
      });
    } catch (e) {
      console.log(`Log for [${q}] failed:`, e.response?.status, e.response?.data);
    }
  }
}

test();
