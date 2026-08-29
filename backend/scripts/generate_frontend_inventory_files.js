const fs = require('fs');
const path = require('path');

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const csvPath = path.resolve(__dirname, '../../Raw_Material_Inventory_Export_2026-08-18.csv');
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

const items = lines.slice(1).map((line, idx) => {
  const parts = parseCsvLine(line);
  const code = parts[0].trim();
  const name = parts[1].trim();
  const category = parts[2].trim() || 'Raw Material';
  const unit = parts[3].trim() || 'PCS';
  const currentStock = Number(parts[4]) || 0;
  const minStock = Number(parts[5]) || 0;
  const reorderLevel = Number(parts[6]) || 0;
  const unitRate = Number(parts[7]) || 0;
  const totalStockValue = Number(parts[8]) || 0;
  const stockStatus = parts[9].trim() || (currentStock <= 0 ? 'OUT OF STOCK' : 'IN STOCK');
  const fsnVelocity = parts[10].trim() || (currentStock <= 0 ? 'Non-Moving' : 'Fast Moving');
  const storageLocation = parts[11].trim() || 'Raw Material Store';

  return {
    srNo: idx + 1,
    id: `RM-${code}`,
    code,
    material: name,
    itemName: name,
    category,
    unit,
    stock: currentStock,
    balance: currentStock,
    minStock,
    reorderLevel,
    rate: unitRate,
    unitRate,
    totalStockValue,
    status: stockStatus === 'OUT OF STOCK' ? 'Out of Stock' : (currentStock <= minStock && minStock > 0 ? 'Low Stock' : 'In Stock'),
    stockStatus,
    fsn: fsnVelocity,
    fsnVelocity,
    storageLocation,
    description: name,
    transactions: currentStock > 0 ? [
      {
        id: `TX-INIT-${code}`,
        type: 'Stock In',
        quantity: currentStock,
        rate: unitRate,
        date: '2026-08-18',
        supplier: 'Initial Inventory Import',
        remarks: 'Opening balance imported from master catalog'
      }
    ] : []
  };
});

console.log(`Generated ${items.length} items.`);

// 1. Write frontend/shared/initialMaterials.js
const initialMaterialsContent = `// Master Raw Materials Inventory (Authoritative 217 items from Master CSV)
export const INITIAL_MATERIALS = ${JSON.stringify(items.map(it => ({
  id: it.id,
  code: it.code,
  material: it.material,
  unit: it.unit,
  stock: it.stock,
  category: it.category,
  reorderLevel: it.reorderLevel,
  minStock: it.minStock,
  rate: it.rate,
  storageLocation: it.storageLocation,
  status: it.status,
  fsn: it.fsn,
  description: it.description,
  transactions: it.transactions
})), null, 2)};
`;

fs.writeFileSync(
  path.resolve(__dirname, '../../frontend/shared/initialMaterials.js'),
  initialMaterialsContent,
  'utf8'
);
console.log('Updated frontend/shared/initialMaterials.js');

// 2. Write frontend/shared/data/inventoryMasterData.js
const inventoryMasterDataContent = `// Master Raw Materials Seed Items (Authoritative 217 items from Master CSV)
export const SEEDED_INVENTORY_ITEMS = ${JSON.stringify(items.map(it => ({
  srNo: it.srNo,
  itemName: it.material,
  code: it.code,
  unit: it.unit,
  balance: it.stock,
  stock: it.stock,
  category: it.category,
  minStock: it.minStock,
  reorderLevel: it.reorderLevel,
  rate: it.rate,
  storageLocation: it.storageLocation,
  status: it.status,
  fsn: it.fsn,
})), null, 2)};
`;

fs.writeFileSync(
  path.resolve(__dirname, '../../frontend/shared/data/inventoryMasterData.js'),
  inventoryMasterDataContent,
  'utf8'
);
console.log('Updated frontend/shared/data/inventoryMasterData.js');
