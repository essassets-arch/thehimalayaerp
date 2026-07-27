const fs = require('fs');
const filePath = 'd:/prototype-next/app/(dashboard)/dispatch/create-dispatch/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace orderNo || id with workOrderNo || orderNo || id
content = content.replace(/o\.orderNo \|\| o\.id/g, 'o.workOrderNo || o.orderNo || o.id');
content = content.replace(/order\.orderNo \|\| order\.id/g, 'order.workOrderNo || order.orderNo || order.id');
content = content.replace(/alloc\.order\.orderNo \|\| alloc\.order\.id/g, 'alloc.order.workOrderNo || alloc.order.orderNo || alloc.order.id');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed orderNo references');
