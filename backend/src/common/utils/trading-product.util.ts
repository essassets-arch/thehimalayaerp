/**
 * Authoritative Trading Product & Order Classification Utility
 * 
 * Rules:
 * Category 1 (D1) = Manufacturing Products (Factory Dispatch)
 * Category 2 (D2) = Trading Products (Sahad Dispatch - Direct Dispatch 2)
 *
 * Trading Products MUST bypass Plant Head and Factory Production entirely.
 * After Sales Order, they route directly to Dispatch 2 in READY_FOR_DISPATCH status.
 */

export function isTradingProduct(product?: any, item?: any): boolean {
  if (!product && !item) return false;

  // 1. Direct boolean flags
  if (product?.isTrading === true || item?.isTrading === true) return true;
  if (product?.isTrading === false && item?.isTrading === false) return false;

  // 2. Explicit TRADING productType
  const pType = String(
    product?.productType ||
    product?.product_type ||
    item?.productType ||
    item?.product_type ||
    ''
  ).toUpperCase();
  if (pType === 'TRADING') return true;

  // 3. Explicit D2 Dispatch Category
  const dCat = String(
    product?.dispatchCategory ||
    product?.dispatch_category ||
    item?.dispatchCategory ||
    item?.dispatch_category ||
    ''
  ).toUpperCase();
  if (
    dCat === 'D2' ||
    dCat === 'DISPATCH 2' ||
    dCat === 'DISPATCH_2' ||
    dCat.includes('CAT 2') ||
    dCat.includes('CATEGORY 2')
  ) {
    return true;
  }

  // 4. Category inspection (case-insensitive)
  const cat = String(
    product?.category ||
    product?.product_family ||
    item?.category ||
    item?.product_family ||
    item?.brand ||
    ''
  ).toUpperCase();

  if (
    cat.includes('COVERBLOCK') ||
    cat.includes('COVER BLOCK') ||
    cat.includes('FRC COVER') ||
    cat.includes('RCC PIPE') ||
    cat.includes('OTHERS') ||
    cat.includes('TRADING') ||
    cat.includes('GRATING') ||
    cat.includes('FRP GRATING')
  ) {
    return true;
  }

  // 5. Name & SKU string patterns
  const name = String(
    product?.name ||
    product?.productName ||
    item?.productName ||
    item?.name ||
    item?.productNameSnapshot ||
    item?.description ||
    ''
  ).toUpperCase();

  const sku = String(
    product?.sku ||
    product?.productCode ||
    product?.productSku ||
    item?.sku ||
    item?.productSku ||
    item?.product_sku ||
    item?.productCode ||
    item?.productCodeSnapshot ||
    ''
  ).toUpperCase();

  const cleanName = name.replace(/^HIMALAYA\s+/i, '').trim();
  const cleanSku = sku.replace(/^HIMALAYA\s+/i, '').trim();
  const combined = `${name} ${sku} ${cleanName} ${cleanSku}`;

  if (
    combined.includes('MOULDED') ||
    combined.includes('GRATING') ||
    combined.includes('COVERBLOCK') ||
    combined.includes('COVER BLOCK') ||
    combined.includes('FRC COVER') ||
    combined.includes('RCC PIPE') ||
    cleanSku.startsWith('FRPMOULDED') ||
    cleanSku.startsWith('FRPGRT') ||
    cleanSku.startsWith('WCB') ||
    cleanSku.startsWith('PCB') ||
    cleanSku.startsWith('HTCB') ||
    cleanSku.startsWith('DTCB') ||
    cleanSku.startsWith('MCB') ||
    cleanSku.startsWith('BTCB') ||
    cleanSku.startsWith('FRCCP') ||
    cleanSku.startsWith('FRCT') ||
    cleanSku.startsWith('FRCSQRC') ||
    cleanSku.startsWith('FRCRFRC') ||
    cleanSku.startsWith('FRCSFSC') ||
    cleanSku.startsWith('FRCROFROC') ||
    cleanSku.startsWith('FRCGT') ||
    cleanSku.startsWith('FRCTSOC') ||
    cleanSku.startsWith('FRCTPEC') ||
    cleanSku.startsWith('FRC') ||
    cleanSku.startsWith('RCC') ||
    cleanName.startsWith('WCB') ||
    cleanName.startsWith('PCB') ||
    cleanName.startsWith('HTCB') ||
    cleanName.startsWith('DTCB') ||
    cleanName.startsWith('MCB') ||
    cleanName.startsWith('BTCB') ||
    cleanName.startsWith('FRCCP') ||
    cleanName.startsWith('FRCT') ||
    cleanName.startsWith('FRCSQRC') ||
    cleanName.startsWith('FRCRFRC') ||
    cleanName.startsWith('FRCSFSC') ||
    cleanName.startsWith('FRCROFROC') ||
    cleanName.startsWith('FRCGT') ||
    cleanName.startsWith('FRCTSOC') ||
    cleanName.startsWith('FRCTPEC') ||
    cleanName.startsWith('FRC') ||
    cleanName.startsWith('RCC')
  ) {
    return true;
  }

  // 6. Explicit manufacturing / hardware / raw material checks
  if (
    cat.includes('HARDWARE') ||
    cat.includes('ELECTRIC') ||
    cat.includes('RAW MATERIAL') ||
    cat.includes('FRP COVERS') ||
    cat.includes('MANUFACTURING') ||
    pType === 'MANUFACTURING' ||
    dCat === 'D1'
  ) {
    return false;
  }

  return false;
}

export function isPureTradingOrder(order: any): boolean {
  if (!order) return false;
  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : (Array.isArray(order.orderItems) && order.orderItems.length > 0
      ? order.orderItems
      : (Array.isArray(order.detailedItems) && order.detailedItems.length > 0
        ? order.detailedItems
        : []));

  if (items.length === 0) {
    return isTradingProduct(order);
  }

  return items.every((it: any) => isTradingProduct(it.product || it, it));
}

export function hasManufacturingItems(order: any): boolean {
  if (!order) return false;
  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items
    : (Array.isArray(order.orderItems) && order.orderItems.length > 0
      ? order.orderItems
      : (Array.isArray(order.detailedItems) && order.detailedItems.length > 0
        ? order.detailedItems
        : []));

  if (items.length === 0) {
    return !isTradingProduct(order);
  }

  return items.some((it: any) => !isTradingProduct(it.product || it, it));
}
