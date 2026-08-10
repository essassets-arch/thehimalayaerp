const TARGET_ACCOUNTS = [
  { email: 'supersales1@himalayaerp.com', pass: 'HimalayaSuperSales#1' },
  { email: 'supersales2@himalayaerp.com', pass: 'HimalayaSuperSales#2' },
  { email: 'sales1@himalayaerp.com', pass: 'HimalayaSales#1' },
  { email: 'sales2@himalayaerp.com', pass: 'HimalayaSales#2' },
  { email: 'sales3@himalayaerp.com', pass: 'HimalayaSales#3' },
  { email: 'sales4@himalayaerp.com', pass: 'HimalayaSales#4' },
  { email: 'sales5@himalayaerp.com', pass: 'HimalayaSales#5' },
  { email: 'sales6@himalayaerp.com', pass: 'HimalayaSales#6' },
  { email: 'sales7@himalayaerp.com', pass: 'HimalayaSales#7' },
];

async function main() {
  console.log('======================================================================');
  console.log(' VERIFYING 9/9 TARGET SALES ACCOUNT LOGINS VIA AUTH API');
  console.log('======================================================================\n');

  let successCount = 0;

  for (const acc of TARGET_ACCOUNTS) {
    try {
      const res = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: acc.email, password: acc.pass }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        successCount++;
        console.log(`✓ 200 OK — ${acc.email.padEnd(30)} | Name: ${json.data.user.name.padEnd(20)} | Token: Present`);
      } else {
        console.error(`❌ FAILED — ${acc.email}: ${json.error?.message || 'Login failed'}`);
      }
    } catch (err: any) {
      console.error(`❌ EXCEPTION — ${acc.email}: ${err.message}`);
    }
  }

  console.log('\n======================================================================');
  console.log(` SUMMARY: ${successCount} / 9 TARGET ACCOUNTS LOGGED IN SUCCESSFULLY`);
  console.log('======================================================================');

  if (successCount !== 9) {
    process.exit(1);
  }
}

main();
