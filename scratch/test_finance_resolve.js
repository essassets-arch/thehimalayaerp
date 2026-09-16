const resolveFinance = async () => {
  const loginRes = await fetch('http://localhost:3000/api/backend/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  console.log('Resolving complaint CC/2627/0001 in Finance...');
  const res = await fetch('http://localhost:3000/api/backend/finance/complaints/cmu3yr55d00026ovrv67odgv3/resolve', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      approvedReturnAmount: 859.95,
      financeRemarks: 'Credit deduction approved for 1 defective unit. Reconciled net realization.',
    }),
  });

  const data = await res.json();
  console.log('Finance resolve status:', res.status, data);
};

resolveFinance();
