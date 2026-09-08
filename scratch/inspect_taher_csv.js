const fs = require('fs');

const fileStream = fs.readFileSync('taher_sir(super_sales2) (1) (2).csv', 'utf8')
  .replace(/^\uFEFF/, '')
  .split(/\r?\n/)
  .filter(l => l.replace(/,/g, '').trim().length > 0);

console.log('Total valid rows in taher_sir(super_sales2) (1) (2).csv:', fileStream.length);
console.log('First line:', fileStream[0]);
console.log('Last line:', fileStream[fileStream.length - 1]);
