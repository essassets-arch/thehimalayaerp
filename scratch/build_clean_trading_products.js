const fs = require('fs');
const path = require('path');

function extractTradingProducts() {
  const content = fs.readFileSync(path.resolve(__dirname, 'raw_trading_prompt.txt'), 'utf8');
  const req = content.slice(content.indexOf('now add this all data in trading products') + 'now add this all data in trading products'.length);
  const userText = req.slice(0, req.indexOf('</USER_REQUEST>')).trim();

  const chunks = userText.split(/\tHIMALAYA/);
  const items = [];
  for (let i = 0; i < chunks.length; i++) {
    let item = chunks[i].trim().replace(/\s+/g, ' ');
    if (item) items.push(item);
  }

  // Deduplicate while preserving order
  const seen = new Set();
  const uniqueNames = [];
  for (const name of items) {
    if (!seen.has(name)) {
      seen.add(name);
      uniqueNames.push(name);
    }
  }

  console.log(`Parsed ${items.length} raw trading items -> ${uniqueNames.length} unique products.`);

  const products = uniqueNames.map((name, index) => {
    let category = 'FRC COVER';
    let hsnCode = '68109990';
    let unit = 'SET';

    if (name.includes('FRP MOULDED')) {
      category = 'FRP GRATINGS';
      hsnCode = '39259090';
      unit = 'PCS';
    } else if (name.includes('HUME PIPE')) {
      category = 'RCC PIPE';
      hsnCode = '68109990';
      unit = 'PCS';
    } else if (name.startsWith('FRC')) {
      category = 'FRC COVER';
      hsnCode = '68109990';
      unit = 'SET';
    }

    const sku = name.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    return {
      index: index + 1,
      name,
      sku,
      category,
      productType: 'TRADING',
      brand: 'HIMALAYA',
      dispatchCategory: 'D2',
      gstRate: 18,
      hsnCode,
      variantDetails: name,
      description: name,
      unit,
      unitPrice: 0,
      minimumStock: 0,
      coversPerSet: 1,
      framesPerSet: 1,
      type: category,
      isActive: true
    };
  });

  return products;
}

const products = extractTradingProducts();
fs.writeFileSync(path.resolve(__dirname, 'clean_trading_products.json'), JSON.stringify(products, null, 2), 'utf8');
console.log(`Saved ${products.length} products to scratch/clean_trading_products.json`);
