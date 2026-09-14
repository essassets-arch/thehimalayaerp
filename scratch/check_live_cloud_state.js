async function checkLiveCloud() {
  console.log('--- Checking https://thehimalaya.cloud ---');

  // 1. Login as Super Admin or Sales 1
  const loginRes = await fetch('https://thehimalaya.cloud/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' })
  });

  console.log('Login status:', loginRes.status);
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;
  if (!token) {
    console.error('Failed to log in to live cloud:', loginData);
    return;
  }

  console.log('Logged in to live cloud.');

  // 2. Fetch quotations on live cloud
  const qRes = await fetch('https://thehimalaya.cloud/api/v1/crm/quotations?limit=10', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Quotations status:', qRes.status);
  const qData = await qRes.json();
  console.log('Quotations sample:', (qData.data || []).slice(0, 3).map(q => ({
    quotationNumber: q.quotationNumber,
    salesExecutiveMobile: q.salesExecutiveMobile,
    salesExecutivePhone: q.salesExecutivePhone,
    salesExec: q.salesExecutive
  })));

  // Look for QU/2627/0072
  const q0072 = (qData.data || []).find(q => q.quotationNumber === 'QU/2627/0072');
  console.log('QU/2627/0072 on live cloud:', q0072 ? {
    num: q0072.quotationNumber,
    salesMobile: q0072.salesExecutiveMobile,
    salesExecutive: q0072.salesExecutive
  } : 'Not found in first 10');

  // 3. Fetch employees on live cloud to see their phone numbers
  const empRes = await fetch('https://thehimalaya.cloud/api/v1/hr/employees?limit=50', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Employees status:', empRes.status);
  const empData = await empRes.json();
  const salesEmps = (empData.data?.items || empData.data || []).filter(e => e.workEmail?.includes('sales') || e.jobTitle?.includes('Sales'));
  console.log('Live Sales Employees Phone Numbers:');
  console.log(salesEmps.map(e => ({ name: e.fullName, email: e.workEmail, phone: e.phoneNumber, compPhone: e.companyPhoneNumber })));
}

checkLiveCloud().catch(console.error);
