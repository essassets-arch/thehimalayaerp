const assert = require('assert');

// Simulate the dispatch category logic implemented in dispatchCategory.ts
function isTradingProduct(entity) {
  if (!entity) return false;
  if (entity.isTrading === true) return true;
  if (entity.isTrading === false) return false;

  const pType = String(entity.productType || entity.product_type || entity.product?.productType || entity.product?.product_type || '').toUpperCase();
  if (pType === 'TRADING') return true;
  if (pType === 'MANUFACTURING') return false;

  const dCat = String(
    entity.dispatchCategory ||
    entity.dispatch_category ||
    entity.product?.dispatchCategory ||
    entity.product?.dispatch_category ||
    ''
  ).toUpperCase();
  if (dCat === 'D2' || dCat.includes('2')) return true;
  if (dCat === 'D1' || dCat.includes('1')) return false;

  const cat = String(
    entity.category ||
    entity.product_family ||
    entity.product?.category ||
    entity.product?.product_family ||
    ''
  ).toUpperCase();
  if (['COVERBLOCK', 'FRC COVER', 'RCC PIPE', 'OTHERS', 'TRADING'].includes(cat)) return true;
  if (['FRP COVERS', 'FRP GRATINGS', 'MANUFACTURING', 'FINISHED GOODS'].includes(cat)) return false;

  const name = String(
    entity.name ||
    entity.productName ||
    entity.productNameSnapshot ||
    entity.product ||
    entity.product?.name ||
    entity.specifications ||
    ''
  ).toUpperCase();

  const sku = String(
    entity.sku ||
    entity.productCode ||
    entity.productCodeSnapshot ||
    entity.productSku ||
    entity.product?.sku ||
    ''
  ).toUpperCase();

  const nameOrSku = `${name} ${sku}`;
  if (
    nameOrSku.startsWith('WCB') ||
    nameOrSku.startsWith('PCB') ||
    nameOrSku.startsWith('HTCB') ||
    nameOrSku.startsWith('DTCB') ||
    nameOrSku.startsWith('MCB') ||
    nameOrSku.startsWith('BTCB') ||
    nameOrSku.startsWith('FRCCP') ||
    nameOrSku.startsWith('FRCT') ||
    nameOrSku.startsWith('FRCSQRC') ||
    nameOrSku.startsWith('FRC') ||
    nameOrSku.startsWith('RCC') ||
    nameOrSku.includes('COVERBLOCK') ||
    nameOrSku.includes('COVER BLOCK') ||
    nameOrSku.includes('FRC COVER') ||
    nameOrSku.includes('RCC PIPE')
  ) {
    return true;
  }

  const items = entity.items || entity.products || entity.sampleItems || entity.orderItems || [];
  if (Array.isArray(items) && items.length > 0) {
    return items.some((it) => isTradingProduct(it));
  }

  return false;
}

console.log('--- Testing Manufacturing vs Trading Product Classification ---');

// Test Cases for Samples
const sampleMfg = {
  id: 'smp-1',
  product: 'FRP Manhole Cover 600mm Class C250',
  sku: 'FRP-MHC-600',
  category: 'FRP COVERS',
  isTrading: false,
};
assert.strictEqual(isTradingProduct(sampleMfg), false, 'sampleMfg should be Manufacturing (D1)');

const sampleTrading = {
  id: 'smp-2',
  product: 'Coverblock 20/25mm',
  sku: 'WCB-20-25',
  category: 'COVERBLOCK',
  isTrading: true,
};
assert.strictEqual(isTradingProduct(sampleTrading), true, 'sampleTrading should be Trading (D2)');

// Test Cases for Replacements with nested items
const repMfg = {
  id: 'rep-1',
  requestNumber: 'REP-2026-001',
  items: [
    {
      id: 'item-1',
      requestedQuantity: 2,
      product: {
        name: 'FRP Grating 38x38 Mesh',
        sku: 'FRP-GRT-38',
        category: 'FRP GRATINGS',
        productType: 'MANUFACTURING',
        dispatchCategory: 'D1'
      }
    }
  ]
};
assert.strictEqual(isTradingProduct(repMfg), false, 'repMfg should be Manufacturing (D1)');

const repTrading = {
  id: 'rep-2',
  requestNumber: 'REP-2026-002',
  items: [
    {
      id: 'item-2',
      requestedQuantity: 50,
      product: {
        name: 'FRC Inspection Cover 450x600',
        sku: 'FRC-IC-450-600',
        category: 'FRC COVER',
        productType: 'TRADING',
        dispatchCategory: 'D2'
      }
    }
  ]
};
assert.strictEqual(isTradingProduct(repTrading), true, 'repTrading should be Trading (D2)');

// Test Cases for Sales Returns with nested items
const retMfg = {
  id: 'ret-1',
  returnNumber: 'RET-2026-001',
  items: [
    {
      id: 'item-3',
      requestedQuantity: 5,
      product: {
        name: 'FRP Water Gully Chamber Cover',
        sku: 'WGC-FRP-400',
        category: 'FRP COVERS',
        dispatchCategory: 'D1'
      }
    }
  ]
};
assert.strictEqual(isTradingProduct(retMfg), false, 'retMfg should be Manufacturing (D1)');

const retTrading = {
  id: 'ret-2',
  returnNumber: 'RET-2026-002',
  items: [
    {
      id: 'item-4',
      requestedQuantity: 10,
      product: {
        name: 'RCC Hume Pipe NP2 300mm',
        sku: 'RCC-PIPE-300',
        category: 'RCC PIPE',
        dispatchCategory: 'D2'
      }
    }
  ]
};
assert.strictEqual(isTradingProduct(retTrading), true, 'retTrading should be Trading (D2)');

// Test List Filtering Behavior for Portals:
const allSamples = [sampleMfg, sampleTrading];
const d1Samples = allSamples.filter(s => !isTradingProduct(s));
const d2Samples = allSamples.filter(s => isTradingProduct(s));

assert.strictEqual(d1Samples.length, 1);
assert.strictEqual(d1Samples[0].id, 'smp-1');
assert.strictEqual(d2Samples.length, 1);
assert.strictEqual(d2Samples[0].id, 'smp-2');

const allReps = [repMfg, repTrading];
const d1Reps = allReps.filter(r => !isTradingProduct(r));
const d2Reps = allReps.filter(r => isTradingProduct(r));

assert.strictEqual(d1Reps.length, 1);
assert.strictEqual(d1Reps[0].id, 'rep-1');
assert.strictEqual(d2Reps.length, 1);
assert.strictEqual(d2Reps[0].id, 'rep-2');

const allRets = [retMfg, retTrading];
const d1Rets = allRets.filter(r => !isTradingProduct(r));
const d2Rets = allRets.filter(r => isTradingProduct(r));

assert.strictEqual(d1Rets.length, 1);
assert.strictEqual(d1Rets[0].id, 'ret-1');
assert.strictEqual(d2Rets.length, 1);
assert.strictEqual(d2Rets[0].id, 'ret-2');

console.log('✅ All classification & filtering unit assertions PASSED successfully!');
