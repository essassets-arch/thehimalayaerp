const fs = require('fs');

const mismatched = JSON.parse(fs.readFileSync('scratch/mismatched_orders.json', 'utf8'));
console.log(`Testing unmerging logic on ${mismatched.length} orders...`);

let resolvedToExisting = 0;
let resolvedToNew = 0;
const companyCustomerMap = new Map();

// Seeded known existing customers
companyCustomerMap.set('TRIPUR BUILDERS', '80a9d7ae-ce23-4250-aaf6-0e560c961e20');
companyCustomerMap.set('TRIPURBUILDERS', '80a9d7ae-ce23-4250-aaf6-0e560c961e20');
companyCustomerMap.set('BALATRIPURA DEVELOPERS', '383dd9d1-e2dc-496e-9fb2-f4158adf713b');
companyCustomerMap.set('SHYAM INFRA', '5d31a93d-98a2-4461-b8b5-41422abc61d2');

for (const m of mismatched) {
  const comp = m.leadCompanyName?.trim();
  if (companyCustomerMap.has(comp)) {
    resolvedToExisting++;
  } else {
    // Generated customer for new client
    const newId = `NEW_CUST_${comp.replace(/\s+/g, '_')}`;
    companyCustomerMap.set(comp, newId);
    resolvedToNew++;
  }
}

console.log(`\nResults:`);
console.log(`- Linked to existing customers: ${resolvedToExisting} orders`);
console.log(`- Created separate new customer profiles: ${resolvedToNew} orders`);
console.log(`- Total distinct customer companies after unmerging: ${companyCustomerMap.size}`);

// Verify HCPPL/2627/0368 and HCPPL/2627/0367
console.log(`\nOrder HCPPL/2627/0368 -> Customer: ${mismatched.find(m => m.orderNumber === 'HCPPL/2627/0368')?.leadCompanyName} (ID: ${companyCustomerMap.get('TRIPURBUILDERS')})`);
console.log(`Order HCPPL/2627/0367 -> Customer: ${mismatched.find(m => m.orderNumber === 'HCPPL/2627/0367')?.leadCompanyName} (ID: ${companyCustomerMap.get('PARSHWA TRADERS')})`);
