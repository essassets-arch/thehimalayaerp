require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const RAW_KEYWORDS = [
  'cement', 'sand', 'aggregate', 'gravel', 'stone', 'pigment', 'powder', 
  'water paper', 'brush', 'welcor', 'haksaw', 'drill', 'thappi', 'chisel', 
  'clamp', 'hammer', 'bucket', 'ghamela', 'carbon', 'pva', 'wax', 'polish', 
  'resin', 'cobalt', 'catalyst', 'fly ash', 'admixture'
];

function isCatalogProduct(p) {
  if (!p) return false;
  const origType = String(p.productType || '').toUpperCase();
  const family = String(p.category || '').toLowerCase();
  const code = String(p.sku || p.publicId || '').toUpperCase();
  const name = String(p.name || '').toLowerCase();

  if (origType === 'RAW_MATERIAL' || origType === 'HARDWARE') return false;
  if (['raw material', 'hardware', 'electric', 'consumables', 'consumable'].includes(family)) return false;
  if (code.startsWith('HCPPL') || code.startsWith('RM-') || code.startsWith('HM')) return false;
  if (RAW_KEYWORDS.some((kw) => name.includes(kw))) return false;
  return true;
}

async function testGetAllStock() {
  const company = await prisma.company.findFirst();
  const companyId = company.id;

  const rawProducts = await prisma.product.findMany({
    where: {
      companyId,
      isActive: true,
      productType: { notIn: ['RAW_MATERIAL', 'HARDWARE'] },
    },
    orderBy: { name: 'asc' },
  });

  const catalogProducts = rawProducts.filter(isCatalogProduct);
  const productIds = catalogProducts.map((p) => p.id);

  const [
    fgGroups,
    stockHistoryGroups,
    openingTransactions,
    prodReportGroups,
    dispatchReportGroups,
  ] = await Promise.all([
    prisma.finishedGoods.groupBy({
      by: ['productId'],
      where: { productId: { in: productIds } },
      _sum: {
        quantity: true,
        availableQuantity: true,
        reservedQuantity: true,
      },
    }),
    prisma.stockHistory.groupBy({
      by: ['productId', 'event'],
      where: { productId: { in: productIds } },
      _sum: {
        quantity: true,
      },
    }),
    prisma.inventoryTransaction.groupBy({
      by: ['productId'],
      where: {
        productId: { in: productIds },
        OR: [
          { type: { in: ['OPENING_STOCK', 'OPENING', 'INITIAL_STOCK'] } },
          { referenceType: { in: ['OPENING_STOCK', 'OPENING', 'INITIAL_STOCK'] } },
        ],
      },
      _sum: {
        quantity: true,
      },
    }),
    prisma.productionDailyReportItem.groupBy({
      by: ['productId'],
      where: {
        productId: { in: productIds },
        report: { status: { in: ['SUBMITTED', 'APPROVED', 'POSTED'] } },
      },
      _sum: {
        setQty: true,
        extraCoverQty: true,
        extraFrameQty: true,
      },
    }),
    prisma.dispatchDailyReportItem.groupBy({
      by: ['productId'],
      where: {
        productId: { in: productIds },
        report: { status: { in: ['SUBMITTED', 'APPROVED', 'POSTED'] } },
      },
      _sum: {
        setQty: true,
        extraCoverQty: true,
        extraFrameQty: true,
      },
    }),
  ]);

  const fgMap = new Map();
  for (const fg of fgGroups) {
    if (!fg.productId) continue;
    fgMap.set(fg.productId, {
      quantity: Number(fg._sum.quantity || 0),
      availableQuantity: Number(fg._sum.availableQuantity || 0),
      reservedQuantity: Number(fg._sum.reservedQuantity || 0),
    });
  }

  const historyMap = new Map();
  for (const sh of stockHistoryGroups) {
    if (!sh.productId) continue;
    if (!historyMap.has(sh.productId)) {
      historyMap.set(sh.productId, new Map());
    }
    historyMap.get(sh.productId).set(sh.event, Number(sh._sum.quantity || 0));
  }

  const openingMap = new Map();
  for (const ot of openingTransactions) {
    if (!ot.productId) continue;
    openingMap.set(ot.productId, Number(ot._sum.quantity || 0));
  }

  const prodReportMap = new Map();
  for (const pr of prodReportGroups) {
    if (!pr.productId) continue;
    prodReportMap.set(pr.productId, {
      setQty: Number(pr._sum.setQty || 0),
      extraCoverQty: Number(pr._sum.extraCoverQty || 0),
      extraFrameQty: Number(pr._sum.extraFrameQty || 0),
    });
  }

  const dispatchReportMap = new Map();
  for (const dr of dispatchReportGroups) {
    if (!dr.productId) continue;
    dispatchReportMap.set(dr.productId, {
      setQty: Number(dr._sum.setQty || 0),
      extraCoverQty: Number(dr._sum.extraCoverQty || 0),
      extraFrameQty: Number(dr._sum.extraFrameQty || 0),
    });
  }

  const items = catalogProducts.map((p) => {
    const pId = p.id;
    const fg = fgMap.get(pId) || { quantity: 0, availableQuantity: 0, reservedQuantity: 0 };
    const shEvents = historyMap.get(pId) || new Map();
    const pdr = prodReportMap.get(pId) || { setQty: 0, extraCoverQty: 0, extraFrameQty: 0 };
    const ddr = dispatchReportMap.get(pId) || { setQty: 0, extraCoverQty: 0, extraFrameQty: 0 };

    const openingStock = openingMap.get(pId) || 0;
    const reportProdIn = pdr.setQty;
    const shProdIn = (shEvents.get('PRODUCTION_IN') || 0) + (shEvents.get('STOCK_IN') || 0);
    const productionIn = Math.max(fg.quantity, reportProdIn + shProdIn);

    const shExtraCover = (shEvents.get('EXTRA_COVER_IN') || 0) - (shEvents.get('EXTRA_COVER_REVERSAL') || 0);
    const extraCover = Math.max(0, pdr.extraCoverQty - ddr.extraCoverQty + shExtraCover);

    const shExtraFrame = (shEvents.get('EXTRA_FRAME_IN') || 0) - (shEvents.get('EXTRA_FRAME_REVERSAL') || 0);
    const extraFrame = Math.max(0, pdr.extraFrameQty - ddr.extraFrameQty + shExtraFrame);

    const reportDispatchOut = ddr.setQty;
    const shDispatchOut = Math.abs(shEvents.get('DISPATCH_OUT') || 0);
    const dispatchOut = Math.max(reportDispatchOut, shDispatchOut);

    const reservedQty = Math.max(0, fg.reservedQuantity);

    let calculatedAvailable = openingStock + productionIn + extraCover + extraFrame - dispatchOut - reservedQty;
    if (calculatedAvailable < 0) calculatedAvailable = 0;
    const availableStock = Math.max(calculatedAvailable, fg.availableQuantity);

    const status = availableStock <= 0 ? 'OUT_OF_STOCK' : 'IN_STOCK';

    return {
      id: p.id,
      productId: p.id,
      itemCode: p.sku || p.publicId || '-',
      productCode: p.sku || p.publicId || '-',
      name: p.name,
      productName: p.name,
      category: p.category || 'Manufactured',
      productType: p.productType || 'MANUFACTURING',
      brand: p.brand || 'HIMALAYA',
      unit: (p.unit || 'PCS').toUpperCase(),
      dispatchCategory: p.dispatchCategory || 'D1',
      openingStock,
      productionIn,
      extraCover,
      extraFrame,
      dispatchOut,
      reservedQty,
      availableStock,
      status,
      isActive: p.isActive !== false,
    };
  });

  console.log(`Total Products: ${items.length}`);
  const inStock = items.filter(i => i.status === 'IN_STOCK');
  const outOfStock = items.filter(i => i.status === 'OUT_OF_STOCK');
  console.log(`In Stock: ${inStock.length}, Out of Stock: ${outOfStock.length}`);
  console.log('Sample In Stock:\n', JSON.stringify(inStock.slice(0, 3), null, 2));
  console.log('Sample Out of Stock:\n', JSON.stringify(outOfStock.slice(0, 3), null, 2));
}

testGetAllStock()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
