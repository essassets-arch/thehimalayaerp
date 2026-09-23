const fs = require('fs');

async function testOrderAction() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });

  const authData = await loginRes.json();
  const token = authData.data?.accessToken;
  const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };

  const orderId = '71c6caf8-38dd-4624-bd68-b690d794f1c1'; // HCPPL/2627/0395

  // Check order details
  const getRes = await fetch(`https://thehimalaya.cloud/api/v1/sales/orders/${orderId}`, { headers });
  const orderData = await getRes.json();
  console.log('Order status:', orderData.data?.status, 'workflowState:', orderData.data?.workflowStateCode);

  // Try action MARK_READY
  const actionRes = await fetch(`https://thehimalaya.cloud/api/v1/sales/orders/action`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      orderId,
      action: 'MARK_READY',
      remarks: 'Transition trading order to READY_FOR_DISPATCH'
    })
  });
  const actionData = await actionRes.json();
  console.log('Action MARK_READY response:', actionData);
}

testOrderAction().catch(console.error);
