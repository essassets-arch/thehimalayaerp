const fs = require('fs');
const filePath = 'd:/prototype-next/app/(dashboard)/dispatch/create-dispatch/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace productItem check to include o.product
content = content.replace(/const productItem = o\.products\?\.\[0\]\?\.productName \|\| o\.productName \|\|/g, "const productItem = o.product || o.products?.[0]?.productName || o.productName ||");

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed product reference');
