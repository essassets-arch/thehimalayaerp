const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://himalaya_erp_user:CHANGE_ME_TO_A_STRONG_PASSWORD@localhost:5435/himalaya_erp?schema=public'
    }
  }
});

function isTradingProduct(item, productsMap) {
  if (!item) return false;
  const pType = String(item.productType || item.product_type || item.product?.productType || item.product?.product_type || "").toUpperCase();
  if (pType === "TRADING") return true;
  if (item.isTrading === true || item.product?.isTrading === true) return true;
  
  const cat = String(item.category || item.product_family || item.product?.category || item.product?.product_family || "").toLowerCase();
  if (cat.includes("trading") || cat.includes("rcc pipe") || cat.includes("frc cover") || cat.includes("coverblock") || cat.includes("others")) return true;

  const name = String(item.productNameSnapshot || item.productName || item.name || item.product?.name || "").toUpperCase();
  if (name.startsWith("FRCCP") || name.startsWith("FRCT") || name.startsWith("BTCB") || name.startsWith("WCB") || name.startsWith("DTCB") || name.includes("FRC COVER") || name.includes("RCC PIPE")) return true;

  const sku = String(item.sku || item.productSku || item.product?.sku || "").toUpperCase();
  if (sku.startsWith("FRCCP") || sku.startsWith("FRCT") || sku.startsWith("BTCB") || sku.startsWith("WCB") || sku.startsWith("DTCB")) return true;

  const dCat = String(item.dispatchCategory || item.dispatch_category || item.product?.dispatchCategory || item.product?.dispatch_category || "").toUpperCase();
  if (dCat === "D2" || dCat === "DISPATCH 2" || dCat === "DISPATCH_2" || dCat.includes("CAT 2") || dCat.includes("CATEGORY 2")) return true;

  if (item.productId && productsMap.has(item.productId)) {
    const p = productsMap.get(item.productId);
    const pType2 = String(p.productType || p.product_type || "").toUpperCase();
    if (pType2 === "TRADING" || p.isTrading === true) return true;
    const dCat2 = String(p.dispatchCategory || p.dispatch_category || "").toUpperCase();
    if (dCat2 === "D2" || dCat2.includes("2")) return true;
    const cat2 = String(p.product_family || p.category || "").toLowerCase();
    if (cat2.includes("trading") || cat2.includes("rcc pipe") || cat2.includes("frc cover") || cat2.includes("coverblock")) return true;
  }
  return false;
}

async function main() {
  const products = await prisma.product.findMany();
  const productsMap = new Map();
  products.forEach(p => productsMap.set(p.id, p));

  const orders = await prisma.salesOrder.findMany({
    include: { items: { include: { product: true } }, customer: true }
  });

  orders.forEach(so => {
    console.log(`\nOrder: ${so.orderNumber} (${so.status})`);
    so.items.forEach(item => {
      const isTrading = isTradingProduct(item, productsMap);
      const cat = isTrading ? 'D2' : 'D1';
      console.log(` - Item: ${item.productNameSnapshot} (SKU: ${item.product?.sku}) -> isTrading: ${isTrading} -> Dispatch Category: ${cat}`);
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
