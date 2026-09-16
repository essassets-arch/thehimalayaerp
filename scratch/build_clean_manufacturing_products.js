const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function extractCleanProducts() {
  const content = fs.readFileSync(path.resolve(__dirname, 'raw_user_prompt.txt'), 'utf8');
  const chunks = content.split(/\tHIMALAYA\tMFG/);

  const items = [];
  for (let i = 0; i < chunks.length - 1; i++) {
    let chunk = chunks[i].trim();
    const match = chunk.match(/HIM(?:A)?LAYA\s+.+/);
    if (match) {
      let name = match[0].trim().replace(/\s+/g, ' ');
      // Normalize typo HIMLAYA -> HIMALAYA
      if (name.startsWith('HIMLAYA ')) {
        name = name.replace('HIMLAYA ', 'HIMALAYA ');
      }
      items.push(name);
    }
  }

  // Deduplicate while preserving first-seen order
  const seen = new Set();
  const uniqueNames = [];
  for (const name of items) {
    if (!seen.has(name)) {
      seen.add(name);
      uniqueNames.push(name);
    }
  }

  console.log(`Extracted ${items.length} raw items -> ${uniqueNames.length} unique products.`);

  const products = uniqueNames.map((name, index) => {
    const sku = name.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    // Extract type (WGC, MHC, ONGC, RCS)
    let type = 'FRP COVER';
    if (name.includes(' WGC ')) type = 'WGC';
    else if (name.includes(' MHC ')) type = 'MHC';
    else if (name.includes(' ONGC ')) type = 'ONGC';
    else if (name.includes(' RCS ')) type = 'RCS';

    // Extract capacity / load rating
    let capacity = null;
    const capMatch = name.match(/\b(ELD|LD|B125|C250|D400|E600|F600|E900|F900)\b/);
    if (capMatch) capacity = capMatch[1];

    // Extract size
    let size = null;
    const sizeMatch = name.match(/\b(\d+X\d+(?:X\d+)?|\d+MM(?:X\d+)?\s+DIA|\d+MM\s+DIA)\b/);
    if (sizeMatch) size = sizeMatch[1];

    const variantDetails = name.replace(/^HIMALAYA\s+FRP\s+/, '').trim();

    return {
      index: index + 1,
      name,
      sku,
      category: 'FRP COVERS',
      productType: 'MANUFACTURING',
      brand: 'HIMALAYA',
      dispatchCategory: 'D1',
      gstRate: 18,
      hsnCode: '39259090',
      variantDetails,
      description: name,
      unit: 'SET',
      unitPrice: 0,
      minimumStock: 0,
      coversPerSet: 1,
      framesPerSet: 1,
      type,
      size,
      capacity,
      isActive: true
    };
  });

  return products;
}

const products = extractCleanProducts();
fs.writeFileSync(path.resolve(__dirname, 'clean_manufacturing_products.json'), JSON.stringify(products, null, 2), 'utf8');
console.log(`Saved ${products.length} products to scratch/clean_manufacturing_products.json`);
