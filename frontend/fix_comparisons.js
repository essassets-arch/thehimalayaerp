const fs = require('fs');
const filePath = 'd:/prototype-next/app/(dashboard)/dispatch/create-dispatch/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(/o\.workOrderNo \|\| o\.orderNo \|\| o\.id/g, 'o.id === orderIdParam || o.workOrderNo === orderIdParam || o.orderNo === orderIdParam ? orderIdParam : null');
content = content.replace(/order\.workOrderNo \|\| order\.orderNo \|\| order\.id/g, 'order.id');
content = content.replace(/alloc\.order\.workOrderNo \|\| alloc\.order\.orderNo \|\| alloc\.order\.id/g, 'alloc.order.id');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed order ID comparisons');
