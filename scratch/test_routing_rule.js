const {
  isTradingProduct,
  isPureTradingOrder,
  hasManufacturingItems,
  normalizeDispatchCategory,
  getProductDispatchRoute
} = require('../backend/dist/common/utils/trading-product.util');

console.log('--- TEST 1: Dispatch Category normalization ---');
console.log('D1:', normalizeDispatchCategory('D1')); // D1
console.log('DISPATCH 1:', normalizeDispatchCategory('DISPATCH 1')); // D1
console.log('DISPATCH_1:', normalizeDispatchCategory('DISPATCH_1')); // D1
console.log('D2:', normalizeDispatchCategory('D2')); // D2
console.log('DISPATCH 2:', normalizeDispatchCategory('DISPATCH 2')); // D2
console.log('DISPATCH_2:', normalizeDispatchCategory('DISPATCH_2')); // D2

console.log('\n--- TEST 2: Product Master Authoritative Routing Rules ---');

// Case A: Dispatch 1 product with a name that previously would trigger a heuristic false positive
const mfgProduct = {
  name: 'FRC HEAVY DUTY COVER 600X600',
  sku: 'FRCSQRC600',
  category: 'FRC COVER',
  productType: 'MANUFACTURING',
  dispatchCategory: 'D1',
  isTrading: false
};
console.log('Mfg Product Route:', getProductDispatchRoute(mfgProduct)); // Should be DISPATCH_1
console.log('Mfg Product isTrading:', isTradingProduct(mfgProduct)); // Should be false! (Not trading!)

// Case B: Trading product
const tradingProduct = {
  name: 'WCB 25MM',
  sku: 'WCB25',
  category: 'Cover Block',
  productType: 'TRADING',
  dispatchCategory: 'D2',
  isTrading: true
};
console.log('Trading Product Route:', getProductDispatchRoute(tradingProduct)); // Should be DISPATCH_2
console.log('Trading Product isTrading:', isTradingProduct(tradingProduct)); // Should be true!

// Case C: Pure Trading Order routing
const pureTradingOrder = {
  orderNumber: 'SO/2627/0001',
  items: [
    { product: tradingProduct, orderedQuantity: 50 },
    { product: { ...tradingProduct, name: 'WCB 30MM' }, orderedQuantity: 100 }
  ]
};
console.log('Pure Trading Order isPureTradingOrder:', isPureTradingOrder(pureTradingOrder)); // true
console.log('Pure Trading Order hasManufacturingItems:', hasManufacturingItems(pureTradingOrder)); // false

// Case D: Pure Manufacturing Order routing
const pureMfgOrder = {
  orderNumber: 'SO/2627/0002',
  items: [
    { product: mfgProduct, orderedQuantity: 10 }
  ]
};
console.log('Pure Mfg Order isPureTradingOrder:', isPureTradingOrder(pureMfgOrder)); // false
console.log('Pure Mfg Order hasManufacturingItems:', hasManufacturingItems(pureMfgOrder)); // true

console.log('\nAll tests executed successfully!');
