const fs = require('fs');

const orders = JSON.parse(fs.readFileSync('scratch/target_orders_dump.json', 'utf8'));

console.log('Orders found:', orders.length);
orders.forEach((o, i) => {
  console.log(`\n--- [${i + 1}] Order #${o.orderNumber} (ID: ${o.id}) ---`);
  console.log('customerId:', o.customerId);
  console.log('customer.id:', o.customer?.id);
  console.log('customer.companyName:', o.customer?.companyName);
  console.log('customer.name:', o.customer?.name);
  console.log('customerName field:', o.customerName);
  console.log('projectName field:', o.projectName);
  console.log('lead.id:', o.lead?.id);
  console.log('lead.companyName:', o.lead?.companyName);
  console.log('lead.projectName:', o.lead?.projectName);
  console.log('quotation.lead.companyName:', o.quotation?.lead?.companyName);
  console.log('quotation.lead.projectName:', o.quotation?.lead?.projectName);
  console.log('quotation.customer.companyName:', o.quotation?.customer?.companyName);
  console.log('sourceQuotation.lead.companyName:', o.sourceQuotation?.lead?.companyName);
  console.log('sourceQuotation.lead.projectName:', o.sourceQuotation?.lead?.projectName);
});
