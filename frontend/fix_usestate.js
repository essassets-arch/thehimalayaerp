const fs = require('fs');
const filePathTransit = 'd:/prototype-next/app/(dashboard)/dispatch/in-transit/page.tsx';
let contentTransit = fs.readFileSync(filePathTransit, 'utf-8');

// Use React.useState instead of useState
contentTransit = contentTransit.replace(
  /const \[localActive, setLocalActive\] = useState<any\[\]>\(\[\]\);/g,
  'const [localActive, setLocalActive] = React.useState<any[]>([]);'
);

fs.writeFileSync(filePathTransit, contentTransit, 'utf-8');

const filePathDelivery = 'd:/prototype-next/app/(dashboard)/dispatch/delivery/page.tsx';
let contentDelivery = fs.readFileSync(filePathDelivery, 'utf-8');

contentDelivery = contentDelivery.replace(
  /const \[localActive, setLocalActive\] = useState<any\[\]>\(\[\]\);/g,
  'const [localActive, setLocalActive] = React.useState<any[]>([]);'
);

fs.writeFileSync(filePathDelivery, contentDelivery, 'utf-8');
console.log('Fixed React.useState references');
