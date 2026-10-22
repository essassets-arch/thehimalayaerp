const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function isValidCustomerName(name) {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower === "n/a" ||
    lower === "na" ||
    lower === "null" ||
    lower === "undefined" ||
    lower === "factory stock staging" ||
    lower === "factory staging area" ||
    lower === "consignee client" ||
    lower === "customer designated delivery site" ||
    lower === "direct dispatch item" ||
    lower === "unknown" ||
    lower === "unknown customer" ||
    lower === "none" ||
    lower === "finished product" ||
    trimmed === "—" ||
    trimmed === "-" ||
    trimmed === "--"
  ) {
    return false;
  }
  return true;
}

function resolveCustomerName(entity, ...fallbackEntities) {
  const allEntities = [entity, ...fallbackEntities].filter(Boolean);

  // 0. Check if any entity has an authoritative Lead companyName that was incorrectly merged with SHYAM SOHAM REALTY
  for (const obj of allEntities) {
    if (!obj || typeof obj !== "object") continue;
    const leadComp =
      obj.quotation?.lead?.companyName ||
      obj.sourceQuotation?.lead?.companyName ||
      obj.lead?.companyName ||
      obj.productionPlan?.salesOrder?.quotation?.lead?.companyName ||
      obj.productionPlan?.salesOrder?.sourceQuotation?.lead?.companyName ||
      obj.productionPlan?.salesOrder?.lead?.companyName ||
      obj.salesOrder?.quotation?.lead?.companyName ||
      obj.salesOrder?.sourceQuotation?.lead?.companyName ||
      obj.salesOrder?.lead?.companyName ||
      obj.workOrder?.productionPlan?.salesOrder?.quotation?.lead?.companyName;

    if (isValidCustomerName(leadComp)) {
      const custComp = String(
        obj.customer?.companyName ||
        obj.salesOrder?.customer?.companyName ||
        obj.productionPlan?.salesOrder?.customer?.companyName ||
        ""
      ).trim();
      const normLead = String(leadComp).trim().toLowerCase();
      const normCust = custComp.toLowerCase();
      if (normCust.includes("shyam soham") && !normLead.includes("shyam soham")) {
        return String(leadComp).trim();
      }
    }
  }

  for (const obj of allEntities) {
    if (!obj) continue;
    if (typeof obj === "string") {
      if (isValidCustomerName(obj)) return obj.trim();
      continue;
    }
    if (typeof obj !== "object") continue;

    const directCandidates = [
      obj.customer?.companyName,
      obj.customer?.name,
      obj.customer?.partyName,
      obj.customer?.buyerName,
      obj.customer?.clientName,
      obj.customer?.gstName,
      obj.customerName,
      obj.customerNameSnapshot,
      obj.clientName,
      obj.companyName,
      obj.partyName,
      obj.buyerName,
      obj.quotation?.lead?.companyName,
      obj.quotation?.lead?.projectName,
      obj.quotation?.lead?.name,
      obj.quotation?.lead?.customerName,
      obj.quotation?.lead?.gstName,
      obj.quotation?.customerName,
      obj.quotation?.customer?.companyName,
      obj.quotation?.customer?.name,
      obj.sourceQuotation?.lead?.companyName,
      obj.sourceQuotation?.lead?.projectName,
      obj.sourceQuotation?.lead?.name,
      obj.sourceQuotation?.lead?.customerName,
      obj.sourceQuotation?.lead?.gstName,
      obj.sourceQuotation?.customerName,
      obj.sourceQuotation?.customer?.companyName,
      obj.sourceQuotation?.customer?.name,
      obj.lead?.companyName,
      obj.lead?.projectName,
      obj.lead?.name,
      obj.lead?.customerName,
      obj.lead?.gstName,
      obj.productionPlan?.salesOrder?.customer?.companyName,
      obj.productionPlan?.salesOrder?.customer?.name,
      obj.productionPlan?.salesOrder?.customerName,
      obj.productionPlan?.salesOrder?.customerNameSnapshot,
      obj.productionPlan?.salesOrder?.quotation?.lead?.companyName,
      obj.productionPlan?.salesOrder?.quotation?.lead?.projectName,
      obj.productionPlan?.salesOrder?.quotation?.customerName,
      obj.productionPlan?.salesOrder?.sourceQuotation?.lead?.companyName,
      obj.productionPlan?.salesOrder?.sourceQuotation?.lead?.projectName,
      obj.productionPlan?.salesOrder?.sourceQuotation?.customerName,
      obj.productionPlan?.salesOrder?.lead?.companyName,
      obj.productionPlan?.salesOrder?.lead?.projectName,
      obj.salesOrder?.customer?.companyName,
      obj.salesOrder?.customer?.name,
      obj.salesOrder?.customerName,
      obj.salesOrder?.customerNameSnapshot,
      obj.salesOrder?.quotation?.lead?.companyName,
      obj.salesOrder?.quotation?.lead?.projectName,
      obj.salesOrder?.quotation?.customerName,
      obj.salesOrder?.sourceQuotation?.lead?.companyName,
      obj.salesOrder?.sourceQuotation?.lead?.projectName,
      obj.salesOrder?.sourceQuotation?.customerName,
      obj.salesOrder?.lead?.companyName,
      obj.salesOrder?.lead?.projectName,
      obj.workOrder?.productionPlan?.salesOrder?.customer?.companyName,
      obj.workOrder?.productionPlan?.salesOrder?.customerName,
      obj.workOrder?.productionPlan?.salesOrder?.quotation?.lead?.companyName,
      obj.workOrder?.productionPlan?.salesOrder?.sourceQuotation?.lead?.companyName,
      obj.workOrder?.customer?.companyName,
      obj.workOrder?.customerName,
      obj.workOrder?.companyName,
      obj.projectName,
      obj.siteName,
    ];

    for (const cand of directCandidates) {
      if (isValidCustomerName(cand)) {
        return String(cand).trim();
      }
    }

    const addrSources = [obj.billingAddress, obj.shippingAddress, obj.salesOrder?.billingAddress, obj.salesOrder?.shippingAddress];
    for (const addr of addrSources) {
      if (addr && typeof addr === "object") {
        const addrCand = addr.companyName || addr.customerName || addr.name || addr.contactPerson;
        if (isValidCustomerName(addrCand)) {
          return String(addrCand).trim();
        }
      }
    }
  }

  for (const obj of allEntities) {
    if (!obj || typeof obj !== "object") continue;
    const soNo = obj.orderNumber || obj.salesOrder?.orderNumber || obj.orderNo;
    if (soNo && typeof soNo === "string" && soNo.trim()) {
      return `Client Order (${soNo.trim()})`;
    }
  }

  return "Client Order";
}

async function main() {
  const salesOrders = await prisma.salesOrder.findMany({
    include: {
      customer: true,
      quotation: {
        include: { lead: true }
      },
      items: {
        include: { product: true }
      }
    }
  });

  const products = await prisma.product.findMany();
  const productsMap = new Map();
  products.forEach(p => {
    productsMap.set(p.id, p);
    productsMap.set(p.sku, p);
  });

  console.log('=== ORDERS THAT APPEAR IN /dispatch-2/orders ===');
  for (const so of salesOrders) {
    const hasD2 = (so.items || []).some(it => {
      const p = it.product || productsMap.get(it.productId);
      const cat = String(p?.dispatchCategory || p?.category || '').toUpperCase();
      return cat.includes('2') || cat === 'D2' || p?.isTrading;
    });

    if (!hasD2) continue;

    const custName = resolveCustomerName(so, so.customer);
    console.log({
      orderNumber: so.orderNumber,
      resolvedCustomerName: custName,
      customerCompanyName: so.customer?.companyName,
      customerContactPerson: so.customer?.contactPerson,
      customerNameField: so.customer?.name,
      quotationCustomerName: so.quotation?.customerName,
      quotationLeadCompany: so.quotation?.lead?.companyName,
      products: so.items.map(it => it.productNameSnapshot || it.product?.name)
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
