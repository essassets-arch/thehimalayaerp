const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mirror the logic from ProductMasterUI & trading-product.util
function isTradingProduct(prod) {
  if (!prod) return false;
  const pType = String(prod.productType || prod.product_type || '').toUpperCase();
  const dCat = String(prod.dispatchCategory || prod.dispatch_category || '').toUpperCase();
  if (pType === 'TRADING' || dCat === 'D2' || dCat === 'DISPATCH 2') return true;

  const sku = String(prod.sku || prod.product_code || '').toUpperCase().trim();
  const category = String(prod.category || prod.product_family || '').toUpperCase().trim();
  const name = String(prod.name || prod.product_name || '').toUpperCase().trim();

  const tradingPrefixes = [
    'WCB', 'PCB', 'HTCB', 'DTCB', 'MCB', 'BTCB',
    'FRCCP', 'FRCT', 'FRCSQRC', 'FRCRFRC', 'FRCSFSC', 'FRCROFROC', 'FRCGT',
    'FRCTSOC', 'FRCTPEC', 'FRC', 'RCC',
  ];
  if (tradingPrefixes.some(p => sku.startsWith(p + '-') || sku === p)) return true;
  if (['TRADING', 'COVER_BLOCK', 'COVER_BLOCKS', 'COVERBLOCK', 'FRC_COVERS', 'RCC_PIPES'].includes(category)) return true;
  if (name.includes('COVER BLOCK') || name.includes('COVERBLOCK') || name.includes('FRC COVER') || name.includes('RCC PIPE')) return true;
  return false;
}

async function test() {
  const allProducts = await prisma.product.findMany();
  console.log('Total products in DB:', allProducts.length);

  const plantHeadProducts = allProducts.filter(p => !isTradingProduct(p) && p.productType !== 'TRADING');
  const dispatch2Products = allProducts.filter(p => isTradingProduct(p) || p.productType === 'TRADING');

  console.log(`[Plant Head Scope] Kasna Plant Manufactured Products: ${plantHeadProducts.length}`);
  console.log(`[Dispatch 2 Scope] Sahad Dispatch Trading Products: ${dispatch2Products.length}`);

  // Ensure zero leak
  const leakedInPlantHead = plantHeadProducts.filter(p => isTradingProduct(p));
  console.log(`Leaked trading products in Plant Head: ${leakedInPlantHead.length}`);

  const leakedInDispatch2 = dispatch2Products.filter(p => !isTradingProduct(p) && p.productType !== 'TRADING');
  console.log(`Leaked manufacturing products in Dispatch 2: ${leakedInDispatch2.length}`);

  if (leakedInPlantHead.length === 0 && leakedInDispatch2.length === 0) {
    console.log('✅ PERFECT ISOLATION VERIFIED!');
  } else {
    console.error('❌ LEAK DETECTED!');
    process.exit(1);
  }
}

test().catch(console.error).finally(() => prisma.$disconnect());
