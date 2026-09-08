async function sendAllViaLiveApi() {
  console.log('--- CALLING LIVE PRODUCTION SEND-TO-DISPATCH API ---');
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

  // Fetch all ready work orders
  const readyRes = await fetch('https://thehimalaya.cloud/api/v1/production/ready-for-dispatch', { headers });
  const raw = await readyRes.json();
  const list = Array.isArray(raw.data) ? raw.data : (raw.data?.data || []);
  console.log(`Found ${list.length} work orders in ready-for-dispatch.`);

  if (list.length === 0) {
    console.log('No work orders left to send to dispatch!');
    return;
  }

  const workOrderIds = list.map(item => item.id);
  console.log(`Sending batch of ${workOrderIds.length} work orders to dispatch...`);

  // Call the live API
  const sendRes = await fetch('https://thehimalaya.cloud/api/v1/production/send-to-dispatch', {
    method: 'POST',
    headers,
    body: JSON.stringify({ workOrderIds })
  });

  console.log('API Status:', sendRes.status);
  const result = await sendRes.json();
  console.log('API Result:', {
    success: result.success,
    count: result.data?.count,
    sample: result.data?.data?.slice(0, 3)
  });

  // Check remaining count on ready-for-dispatch
  const verifyRes = await fetch('https://thehimalaya.cloud/api/v1/production/ready-for-dispatch', { headers });
  const verifyRaw = await verifyRes.json();
  const remaining = Array.isArray(verifyRaw.data) ? verifyRaw.data : (verifyRaw.data?.data || []);
  console.log(`Remaining in ready-for-dispatch: ${remaining.length}`);

  // Check history count
  const histRes = await fetch('https://thehimalaya.cloud/api/v1/production/ready-for-dispatch-history', { headers });
  const histRaw = await histRes.json();
  const hist = Array.isArray(histRaw.data) ? histRaw.data : (histRaw.data?.data || []);
  console.log(`Dispatched history count: ${hist.length}`);
}

sendAllViaLiveApi().catch(console.error);
