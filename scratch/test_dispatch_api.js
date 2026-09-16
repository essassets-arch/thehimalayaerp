const run = async () => {
  const res = await fetch('http://localhost:3000/api/backend/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'super.admin@himalayaerp.com', password: 'SuperAdmin@hcppl' }),
  });
  const data = await res.json();
  const token = data.data?.accessToken;

  console.log('Completing dispatch inspection...');
  const completeRes = await fetch('http://localhost:3000/api/backend/dispatch/complaints/cmu3yr55d00026ovrv67odgv3/complete', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      evidenceUrl: '/uploads/attachments/test-dispatch-evidence.png',
      remarks: 'Inspected 1 unit wrong finish at dispatch bay. Forwarded to Finance.',
    }),
  });

  const completeData = await completeRes.json();
  console.log('Complete status:', completeRes.status, completeData);
};

run();
