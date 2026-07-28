const fs = require('fs');
const filePath = 'd:/prototype-next/app/(dashboard)/dispatch/create-dispatch/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace logic inside activeOrders.map
content = content.replace(
  /const remaining = parseFloat\(o\.outstandingDispatch \|\| o\.quantity \|\| '0'\) \|\| 0;/g,
  "const remaining = parseFloat(String(o.dispatchQuantity || o.qcApprovedQuantity || o.outstandingDispatch || o.quantity || '0')) || 0;"
);

content = content.replace(
  /\{o\.totalWeight \|\| o\.quantity\}/g,
  "{o.dispatchQuantity || o.qcApprovedQuantity || o.totalWeight || o.quantity || o.producedQuantity || '0'}"
);

content = content.replace(
  /\{o\.outstandingDispatch \|\| o\.quantity\}/g,
  "{o.dispatchQuantity || o.qcApprovedQuantity || o.outstandingDispatch || o.quantity || '0'}"
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed Summary quantities');
