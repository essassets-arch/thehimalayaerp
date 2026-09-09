async function run() {
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });
  const token = (await loginRes.json()).data?.accessToken;
  const headers = { 
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };

  const woId = 'd5e78335-48ff-4024-9af8-3dab9a3e195b';

  console.log('1. Calling start-rework on WO-2026-00005...');
  const res1 = await fetch(`https://thehimalaya.cloud/api/v1/production/${woId}/start-rework`, {
    method: 'POST',
    headers
  });
  console.log('start-rework status:', res1.status);
  const data1 = await res1.json();
  console.log('start-rework response:', data1.message || data1.success || data1.error);

  console.log('2. Calling complete-rework on WO-2026-00005...');
  const res2 = await fetch(`https://thehimalaya.cloud/api/v1/production/${woId}/complete-rework`, {
    method: 'POST',
    headers
  });
  console.log('complete-rework status:', res2.status);
  const data2 = await res2.json();
  console.log('complete-rework response:', data2.message || data2.success || data2.error);

  console.log('3. Checking qc-pending endpoint...');
  const res3 = await fetch('https://thehimalaya.cloud/api/v1/production/qc-pending', { headers });
  const data3 = await res3.json();
  const list = data3.data?.data || data3.data || [];
  console.log('Total qc-pending items count:', list.length);
  const found = list.find(i => i.id === woId || i.workOrderNumber === 'WO-2026-00005');
  if (found) {
    console.log('SUCCESS! WO-2026-00005 is now in QC Pending:');
    console.log({
      id: found.id,
      workOrderNumber: found.workOrderNumber,
      status: found.status,
      productionStatus: found.productionStatus,
      qcInspectionId: found.qcInspectionId,
      qcInspectionStatus: found.qcInspectionStatus,
      orderNumber: found.productionPlan?.salesOrder?.orderNumber,
      projectName: found.productionPlan?.salesOrder?.sourceQuotation?.lead?.projectName
    });
  } else {
    console.log('NOT FOUND in qc-pending list.');
  }
}

run().catch(console.error);
