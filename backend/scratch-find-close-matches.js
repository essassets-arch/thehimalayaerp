const fs = require('fs');

const products = JSON.parse(fs.readFileSync('scratch-products.json', 'utf8'));

const unmatchedList = [
  'WGC | 900X900 | D400',
  'WGC | 750X750 | D400',
  'WGC | 1200X600 | D400',
  'RCS | 600X600X32 | ELD',
  'RCS | 450X450X32 | ELD',
  'MHC | 600X450 | LD',
  'ONGC | 600X450 | D400',
  'MHC | 600X450 | D400',
  'ONGC | 600X260 | D400',
  'WGC | 750X750 | ELD',
  'MHC | 1200X900 | B125',
  'MHC | 900X600 | B125',
  'WGC | 900x900 | C250',
  'MHC | 1200X900 | C250',
  'ONGC | 450X1000 | LD',
  'MHC | 30X0 | LD',
  'WGC | 900X900 | ELD',
  'MHC | 1200X900 | LD',
  'ONGC | 450x1000 | LD',
  'RCS | 600X600X32 | D400',
  'WGC | 1200x900 | C250',
  'MHC | 1800x1200 | C250',
  'WGC | 900X900 | C250',
  'MHC | 900X990 | E600',
  'MHC | 1200X1200 | E600',
  'D MHC | 600X600 | B125',
  'D MHC | 600X600 | ELD',
  'RCS | 300X300X32 | ELD',
  'WGC | 600X600 | E600',
  'WGC | 900X900 | E600',
  'WGC | 1000X1000 | B125',
  'MHC | 900 Dai | C250',
  'RCS | 600x600 | 3T',
  'MHC | 15X15 | 3T'
];

unmatchedList.forEach(unmatched => {
  const parts = unmatched.split('|').map(p => p.trim());
  const type = parts[0].toLowerCase();
  const size = parts[1].toLowerCase().replace(/[^0-9x]/g, ''); // Extract numbers and x
  const cap = parts[2].toLowerCase();

  // Find close matches
  const sizeMatches = products.filter(p => {
    const pSkuNorm = p.sku.toLowerCase();
    const pNameNorm = p.name.toLowerCase();
    // Must match type and size
    return (pSkuNorm.includes(type) || pNameNorm.includes(type)) &&
           (pSkuNorm.includes(size) || pNameNorm.includes(size));
  });

  console.log(`\nUnmatched: ${unmatched} (size parsed: ${size})`);
  if (sizeMatches.length > 0) {
    console.log('Close matches:');
    sizeMatches.forEach(m => {
      console.log(`  - SKU: ${m.sku} | Name: ${m.name}`);
    });
  } else {
    // Try matching only size
    const onlySize = products.filter(p => {
      const pSkuNorm = p.sku.toLowerCase();
      const pNameNorm = p.name.toLowerCase();
      return pSkuNorm.includes(size) || pNameNorm.includes(size);
    });
    console.log(`No matches for type ${type} + size ${size}. Found ${onlySize.length} products with size ${size}:`);
    onlySize.slice(0, 5).forEach(m => {
      console.log(`  - SKU: ${m.sku} | Name: ${m.name}`);
    });
  }
});
