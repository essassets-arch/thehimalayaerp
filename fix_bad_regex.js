const fs = require('fs');
const filePath = 'd:/prototype-next/app/(dashboard)/dispatch/create-dispatch/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Fix the bad regex replacement
content = content.replace(/o\.id === orderIdParam \|\| o\.workOrderNo === orderIdParam \|\| o\.orderNo === orderIdParam \? orderIdParam : null/g, 'o.workOrderNo || o.orderNo || o.id');

// Also fix the double o.workOrderNo in the find loops
content = content.replace(/String\(o\.workOrderNo \|\| o\.workOrderNo \|\| o\.orderNo \|\| o\.id\)/g, 'String(o.workOrderNo || o.orderNo || o.id)');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed bad regex replacements');
