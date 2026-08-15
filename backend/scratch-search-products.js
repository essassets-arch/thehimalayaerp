const fs = require('fs');
const products = JSON.parse(fs.readFileSync('scratch-products.json', 'utf8'));

const sizes = ['1200x900', '600x260', '450x1000', '30x30', '1800x1200', '900x990', '1200x600', '30x0'];

sizes.forEach(size => {
  const norm = size.replace(/[^0-9x]/g, '');
  const matches = products.filter(p => {
    const sku = p.sku.toLowerCase();
    const name = p.name.toLowerCase();
    return sku.includes(norm) || name.includes(norm);
  });
  console.log(`\nSize search: ${size}`);
  if (matches.length > 0) {
    matches.forEach(m => console.log(`  - SKU: ${m.sku} | Name: ${m.name}`));
  } else {
    console.log('  No matches found.');
  }
});
