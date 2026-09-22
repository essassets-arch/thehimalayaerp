const fs = require('fs');

async function testDispatchPayloads() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.accessToken;
  const headers = { 'Authorization': 'Bearer ' + token };

  const [wosRes, readyRes, soRes, fgRes, qRes] = await Promise.all([
    fetch('https://thehimalaya.cloud/api/v1/production/work-orders?status=READY_FOR_DISPATCH,SENT_TO_DISPATCH,QC_APPROVED,COMPLETED&limit=1000', { headers }),
    fetch('https://thehimalaya.cloud/api/v1/production/ready-for-dispatch', { headers }),
    fetch('https://thehimalaya.cloud/api/v1/sales/orders?limit=1000', { headers }),
    fetch('https://thehimalaya.cloud/api/v1/production/finished-goods', { headers }),
    fetch('https://thehimalaya.cloud/api/v1/logistics/dispatches/queue?category=D1', { headers }),
  ]);

  const wosData = await wosRes.json();
  const readyData = await readyRes.json();
  const soData = await soRes.json();
  const fgData = await fgRes.json();
  const qData = await qRes.json();

  const wos = Array.isArray(wosData) ? wosData : wosData.data?.data || wosData.data || wosData.items || [];
  const ready = Array.isArray(readyData) ? readyData : readyData.data?.data || readyData.data || readyData.items || [];
  const sos = Array.isArray(soData) ? soData : soData.data?.data || soData.data || soData.items || [];
  const fg = Array.isArray(fgData) ? fgData : fgData.data?.data || fgData.data || fgData.items || [];
  const queue = Array.isArray(qData) ? qData : qData.data?.data || qData.data || qData.items || [];

  console.log('--- Checking WOs for 0368 / 00441 / 00440 ---');
  const matchedWos = [...wos, ...ready].filter(w => 
    w.workOrderNumber?.includes('00441') ||
    w.workOrderNumber?.includes('00440') ||
    w.workOrderNumber?.includes('0368') ||
    w.salesOrderNumber?.includes('0368') ||
    w.productionPlan?.salesOrder?.orderNumber?.includes('0368')
  );
  for (const w of matchedWos) {
    console.log('\nWO Number:', w.workOrderNumber);
    console.log('Customer:', w.customer);
    console.log('CustomerName:', w.customerName);
    console.log('productionPlan.salesOrder.customer:', w.productionPlan?.salesOrder?.customer);
    console.log('salesOrder.customer:', w.salesOrder?.customer);
  }

  console.log('\n--- Checking Finished Goods ---');
  const matchedFg = fg.filter(f => 
    f.jobNo?.includes('00441') || f.jobNo?.includes('00440') || f.jobNo?.includes('0368')
  );
  for (const f of matchedFg) {
    console.log('\nFG jobNo:', f.jobNo);
    console.log('FG customer:', f.customer);
    console.log('FG customerName:', f.customerName);
    console.log('FG workOrder:', f.workOrder?.workOrderNumber);
    console.log('FG workOrder.customer:', f.workOrder?.customer);
    console.log('FG workOrder.productionPlan.salesOrder.customer:', f.workOrder?.productionPlan?.salesOrder?.customer);
  }

  console.log('\n--- Checking Queue ---');
  const matchedQ = queue.filter(q => 
    q.orderNo?.includes('0368') || q.orderId?.includes('0368')
  );
  for (const q of matchedQ) {
    console.log('\nQueue item:', q.orderNo, q.orderId);
    console.log('Queue customer:', q.customer);
    console.log('Queue customerName:', q.customerName);
  }
}

testDispatchPayloads().catch(console.error);
