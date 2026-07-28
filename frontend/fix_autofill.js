const fs = require('fs');
const filePath = 'd:/prototype-next/app/(dashboard)/dispatch/create-dispatch/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace outstandingDispatch in handleAutoFillOne and handleDistributeEqually
content = content.replace(
  /const remaining = parseFloat\(o\.outstandingDispatch \|\| o\.quantity \|\| '1'\) \|\| 1;/g,
  "const remaining = parseFloat(String(o.dispatchQuantity || o.qcApprovedQuantity || o.outstandingDispatch || o.quantity || '1')) || 1;"
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed auto-fill logic');
