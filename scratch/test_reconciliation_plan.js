const fs = require('fs');

// Test the reconciliation logic on the dumped orders
const mismatched = JSON.parse(fs.readFileSync('scratch/mismatched_orders.json', 'utf8'));
console.log('Mismatched orders to re-link:', mismatched.length);

const groupedByCompany = {};
for (const m of mismatched) {
  const comp = m.leadCompanyName?.trim();
  if (!groupedByCompany[comp]) {
    groupedByCompany[comp] = [];
  }
  groupedByCompany[comp].push(m);
}

console.log('Distinct companies needing separation from SHYAM SOHAM REALTY:', Object.keys(groupedByCompany).length);
console.log('\nTop 10 companies by order count:');
const sorted = Object.entries(groupedByCompany).sort((a, b) => b[1].length - a[1].length);
sorted.slice(0, 10).forEach(([comp, orders]) => {
  console.log(`- ${comp}: ${orders.length} orders (${orders.map(o => o.orderNumber).slice(0, 4).join(', ')})`);
});
