const fs = require('fs');

const mismatched = JSON.parse(fs.readFileSync('scratch/mismatched_orders.json', 'utf8'));
console.log('Total mismatched orders:', mismatched.length);

const companyMap = new Map();
for (const m of mismatched) {
  const name = m.leadCompanyName?.trim();
  if (!companyMap.has(name)) {
    companyMap.set(name, {
      name,
      orders: [],
      leadAddress: m.leadAddress,
      leadPhone: m.leadPhone,
      leadEmail: m.leadEmail,
      leadGstin: m.leadGstin,
    });
  }
  companyMap.get(name).orders.push(m.orderNumber);
}

console.log('Distinct companies among mismatched orders:', companyMap.size);
for (const [name, info] of companyMap.entries()) {
  console.log(`- "${name}": ${info.orders.length} orders (e.g. ${info.orders.slice(0, 3).join(', ')}) | Address: ${typeof info.leadAddress === 'object' ? JSON.stringify(info.leadAddress) : info.leadAddress}`);
}
