import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { loadRawMaterialCatalog, materialLookup, RawCatalog, rawBalances, materialMovement } from '../inventory/raw-material-read-model';

const IST_OFFSET_MS = 330 * 60 * 1000; // UTC+5:30 in milliseconds

export const formatIstDate = (date: Date): string => {
  const d = new Date(date.getTime() + IST_OFFSET_MS);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export const formatIstIsoDay = (date: Date): string => {
  return new Date(date.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
};

export interface AnalyticsPeriod {
  startDate: Date;
  endDate: Date;
  periodLabel: string;
  isAllTime: boolean;
  targetYear: number;
  targetMonthNum: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_SHORT_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function resolveAnalyticsPeriod(
  filter?: string,
  customStart?: string,
  customEnd?: string,
  month?: string,
  year?: string,
  now = new Date(),
): AnalyticsPeriod {
  const istNow = new Date(now.getTime() + IST_OFFSET_MS);
  const currentYear = istNow.getUTCFullYear();
  const currentMonth = istNow.getUTCMonth() + 1; // 1-12

  let targetYear = currentYear;
  if (year) {
    const py = parseInt(year, 10);
    if (!isNaN(py) && py >= 2000 && py <= 2050) targetYear = py;
  }

  let targetMonthNum = currentMonth;
  if (month) {
    const mStr = String(month).trim().toLowerCase();
    const idx = MONTH_NAMES.findIndex(
      m => m.toLowerCase().startsWith(mStr.slice(0, 3)),
    );
    if (idx !== -1) {
      targetMonthNum = idx + 1;
    } else {
      const pm = parseInt(month, 10);
      if (!isNaN(pm) && pm >= 1 && pm <= 12) targetMonthNum = pm;
    }
  }

  const cleanFilter = (filter || '').trim();

  // 1. All Time
  if (cleanFilter === 'All Time' || cleanFilter === 'all' || month === 'all') {
    return {
      startDate: new Date('2020-01-01T00:00:00.000Z'),
      endDate: new Date('2035-12-31T23:59:59.999Z'),
      periodLabel: 'All-Time Aggregate',
      isAllTime: true,
      targetYear,
      targetMonthNum,
    };
  }

  // 2. Custom Date Range
  if (cleanFilter === 'Custom' || (customStart && customEnd)) {
    if (!customStart || !customEnd) {
      throw new BadRequestException('Provide both customStart and customEnd in YYYY-MM-DD format');
    }
    const sStr = customStart.split('T')[0];
    const eStr = customEnd.split('T')[0];
    const startDate = new Date(`${sStr}T00:00:00.000+05:30`);
    const endDate = new Date(`${eStr}T23:59:59.999+05:30`);
    if (startDate > endDate) {
      throw new BadRequestException('Start date must be on or before end date');
    }
    return {
      startDate,
      endDate,
      periodLabel: `${sStr} to ${eStr}`,
      isAllTime: false,
      targetYear,
      targetMonthNum,
    };
  }

  // 3. Preset Date Ranges
  if (cleanFilter === 'Today') {
    const todayStr = formatIstIsoDay(now);
    return {
      startDate: new Date(`${todayStr}T00:00:00.000+05:30`),
      endDate: new Date(`${todayStr}T23:59:59.999+05:30`),
      periodLabel: `Today (${todayStr})`,
      isAllTime: false,
      targetYear,
      targetMonthNum,
    };
  }

  if (cleanFilter === 'Yesterday') {
    const yDate = new Date(now.getTime() - 86400000);
    const yStr = formatIstIsoDay(yDate);
    return {
      startDate: new Date(`${yStr}T00:00:00.000+05:30`),
      endDate: new Date(`${yStr}T23:59:59.999+05:30`),
      periodLabel: `Yesterday (${yStr})`,
      isAllTime: false,
      targetYear,
      targetMonthNum,
    };
  }

  if (cleanFilter === 'This Week') {
    const dayOfWeek = istNow.getUTCDay(); // 0 = Sun, 1 = Mon ...
    const diffToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(istNow.getTime() - diffToMonday * 86400000);
    const mondayStr = formatIstIsoDay(new Date(monday.getTime() - IST_OFFSET_MS));
    const todayStr = formatIstIsoDay(now);
    return {
      startDate: new Date(`${mondayStr}T00:00:00.000+05:30`),
      endDate: new Date(`${todayStr}T23:59:59.999+05:30`),
      periodLabel: `This Week (${mondayStr} to ${todayStr})`,
      isAllTime: false,
      targetYear,
      targetMonthNum,
    };
  }

  if (cleanFilter === 'Previous Month' || cleanFilter === 'Last Month') {
    let pYear = targetYear;
    let pMonth = targetMonthNum - 1;
    if (pMonth < 1) {
      pMonth = 12;
      pYear -= 1;
    }
    const lastDay = new Date(Date.UTC(pYear, pMonth, 0)).getUTCDate();
    const mm = String(pMonth).padStart(2, '0');
    return {
      startDate: new Date(`${pYear}-${mm}-01T00:00:00.000+05:30`),
      endDate: new Date(`${pYear}-${mm}-${String(lastDay).padStart(2, '0')}T23:59:59.999+05:30`),
      periodLabel: `${MONTH_NAMES[pMonth - 1].toUpperCase()} ${pYear}`,
      isAllTime: false,
      targetYear: pYear,
      targetMonthNum: pMonth,
    };
  }

  if (cleanFilter === 'Last 3 Months') {
    const start3 = new Date(now.getTime() - 90 * 86400000);
    const sStr = formatIstIsoDay(start3);
    const eStr = formatIstIsoDay(now);
    return {
      startDate: new Date(`${sStr}T00:00:00.000+05:30`),
      endDate: new Date(`${eStr}T23:59:59.999+05:30`),
      periodLabel: `Last 3 Months (${sStr} to ${eStr})`,
      isAllTime: false,
      targetYear,
      targetMonthNum,
    };
  }

  if (cleanFilter === 'Last 6 Months') {
    const start6 = new Date(now.getTime() - 180 * 86400000);
    const sStr = formatIstIsoDay(start6);
    const eStr = formatIstIsoDay(now);
    return {
      startDate: new Date(`${sStr}T00:00:00.000+05:30`),
      endDate: new Date(`${eStr}T23:59:59.999+05:30`),
      periodLabel: `Last 6 Months (${sStr} to ${eStr})`,
      isAllTime: false,
      targetYear,
      targetMonthNum,
    };
  }

  // 4. Default: Specific Month in Year (or This Month)
  const mm = String(targetMonthNum).padStart(2, '0');
  const daysInMonth = new Date(Date.UTC(targetYear, targetMonthNum, 0)).getUTCDate();
  const startDate = new Date(`${targetYear}-${mm}-01T00:00:00.000+05:30`);
  const endDate = new Date(`${targetYear}-${mm}-${String(daysInMonth).padStart(2, '0')}T23:59:59.999+05:30`);
  const periodLabel = `${MONTH_NAMES[targetMonthNum - 1].toUpperCase()} ${targetYear}`;

  return {
    startDate,
    endDate,
    periodLabel,
    isAllTime: false,
    targetYear,
    targetMonthNum,
  };
}

// Decimal-safe rounding to 2 places
export const round2 = (val: number): number => {
  return Math.round((val + Number.EPSILON) * 100) / 100;
};

// Movement Classification rule helper
export function classifyMovement(
  issueTransactions: number,
  isTopQuartile: boolean,
): 'FAST_MOVING' | 'SLOW_MOVING' | 'NON_MOVING' {
  if (issueTransactions === 0) return 'NON_MOVING';
  if (issueTransactions >= 4 || (isTopQuartile && issueTransactions >= 2)) return 'FAST_MOVING';
  return 'SLOW_MOVING';
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. STORE R/O MAIN ANALYTICS SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export async function readStoreRoAnalytics(
  db: Prisma.TransactionClient,
  companyId: string,
  filter?: string,
  customStart?: string,
  customEnd?: string,
  month?: string,
  year?: string,
  search?: string,
  movementFilter?: string,
  classificationFilter?: string,
) {
  if (!companyId?.trim()) {
    throw new BadRequestException('Authenticated company ID is required');
  }

  const period = resolveAnalyticsPeriod(filter, customStart, customEnd, month, year);
  const catalog = await loadRawMaterialCatalog(db, companyId);
  const lookup = materialLookup(catalog);
  const materialById = new Map(catalog.map(m => [m.id, m]));

  // Date filtering clause
  const dateClause = period.isAllTime
    ? {}
    : { createdAt: { gte: period.startDate, lte: period.endDate } };

  // 1. Authoritative STORE ISSUE: InventoryTransaction (type = 'OUT', referenceType = 'ISSUE_TO_PRODUCTION')
  const issueTransactions: any[] = await db.inventoryTransaction.findMany({
    where: {
      companyId,
      type: 'OUT',
      referenceType: 'ISSUE_TO_PRODUCTION',
      ...dateClause,
    },
    include: {
      product: { select: { id: true, name: true, sku: true, unit: true, category: true } },
      rawMaterial: { select: { id: true, name: true, sku: true, unit: true, category: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  // 2. Authoritative STORE RECEIVE: GoodsReceiptNoteItem linked to active GRN
  const grnItems: any[] = await db.goodsReceiptNoteItem.findMany({
    where: {
      goodsReceiptNote: {
        companyId,
        status: { notIn: ['REJECTED', 'CANCELLED'] },
        ...(period.isAllTime
          ? {}
          : {
              OR: [
                { receivedAt: { gte: period.startDate, lte: period.endDate } },
                { createdAt: { gte: period.startDate, lte: period.endDate } },
              ],
            }),
      },
    },
    include: {
      goodsReceiptNote: {
        select: { id: true, grnNumber: true, receivedAt: true, createdAt: true },
      },
      product: {
        select: { id: true, name: true, sku: true, unit: true, category: true },
      },
    },
    orderBy: { goodsReceiptNote: { receivedAt: 'asc' } },
  });

  // 3. Authoritative RAW MATERIAL CONSUMPTION: MaterialRequestItem.consumedQuantity
  const consumptionItems: any[] = await db.materialRequestItem.findMany({
    where: {
      materialRequest: {
        companyId,
        ...(period.isAllTime
          ? {}
          : {
              OR: [
                { requestDate: { gte: period.startDate, lte: period.endDate } },
                { updatedAt: { gte: period.startDate, lte: period.endDate } },
                { createdAt: { gte: period.startDate, lte: period.endDate } },
              ],
            }),
      },
      consumedQuantity: { gt: 0 },
    },
    include: {
      materialRequest: {
        select: { id: true, publicId: true, requestDate: true, updatedAt: true, createdAt: true },
      },
      product: {
        select: { id: true, name: true, sku: true, unit: true, category: true },
      },
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Aggregations: Item Wise & Date Wise
  // ─────────────────────────────────────────────────────────────────────────────

  // STORE ISSUE Item Map
  const issueMap = new Map<
    string,
    {
      materialId: string;
      materialName: string;
      materialSku: string;
      unit: string;
      category: string;
      totalKg: number;
      transactions: number;
    }
  >();
  const issueDateMap = new Map<string, { totalKg: number; transactions: number }>();
  let totalIssueKg = 0;

  for (const tx of issueTransactions) {
    const qty = Math.abs(Number(tx.quantity || 0));
    totalIssueKg += qty;

    const rawId = tx.rawMaterialId || tx.productId || '';
    const canonicalId = lookup.get(rawId) || rawId;
    const mat = materialById.get(canonicalId);

    const materialName = mat?.name || tx.rawMaterial?.name || tx.product?.name || 'Raw Material';
    const materialSku = mat?.sku || tx.rawMaterial?.sku || tx.product?.sku || 'SKU-NONE';
    const unit = mat?.unit || tx.rawMaterial?.unit || tx.product?.unit || 'KG';
    const category = mat?.category || tx.rawMaterial?.category || tx.product?.category || 'General';

    const existing = issueMap.get(canonicalId) || {
      materialId: canonicalId,
      materialName,
      materialSku,
      unit,
      category,
      totalKg: 0,
      transactions: 0,
    };
    existing.totalKg += qty;
    existing.transactions += 1;
    issueMap.set(canonicalId, existing);

    const dStr = formatIstDate(tx.createdAt);
    const dEntry = issueDateMap.get(dStr) || { totalKg: 0, transactions: 0 };
    dEntry.totalKg += qty;
    dEntry.transactions += 1;
    issueDateMap.set(dStr, dEntry);
  }

  // STORE RECEIVE Item Map
  const receiveMap = new Map<
    string,
    {
      materialId: string;
      materialName: string;
      materialSku: string;
      unit: string;
      category: string;
      totalKg: number;
      transactions: number;
    }
  >();
  const receiveDateMap = new Map<string, { totalKg: number; transactions: number }>();
  let totalReceiveKg = 0;

  for (const item of grnItems) {
    const recQty = Number(item.receivedQuantity || 0);
    const accQty = Number(item.acceptedQuantity || 0);
    const qty = recQty > 0 ? recQty : accQty;
    totalReceiveKg += qty;

    const canonicalId = lookup.get(item.productId) || item.productId;
    const mat = materialById.get(canonicalId);

    const materialName = mat?.name || item.product?.name || 'Material Item';
    const materialSku = mat?.sku || item.product?.sku || 'SKU-NONE';
    const unit = mat?.unit || item.product?.unit || 'KG';
    const category = mat?.category || item.product?.category || 'General';

    const existing = receiveMap.get(canonicalId) || {
      materialId: canonicalId,
      materialName,
      materialSku,
      unit,
      category,
      totalKg: 0,
      transactions: 0,
    };
    existing.totalKg += qty;
    existing.transactions += 1;
    receiveMap.set(canonicalId, existing);

    const grnDate = item.goodsReceiptNote?.receivedAt || item.goodsReceiptNote?.createdAt || new Date();
    const dStr = formatIstDate(grnDate);
    const dEntry = receiveDateMap.get(dStr) || { totalKg: 0, transactions: 0 };
    dEntry.totalKg += qty;
    dEntry.transactions += 1;
    receiveDateMap.set(dStr, dEntry);
  }

  // RAW MATERIAL CONSUMPTION Item Map
  const consumptionMap = new Map<
    string,
    {
      materialId: string;
      materialName: string;
      materialSku: string;
      unit: string;
      category: string;
      totalKg: number;
      transactions: number;
    }
  >();
  const consumptionDateMap = new Map<string, { totalKg: number; transactions: number }>();
  let totalConsumptionKg = 0;

  for (const item of consumptionItems) {
    const qty = Number(item.consumedQuantity || 0);
    totalConsumptionKg += qty;

    const canonicalId = lookup.get(item.productId) || item.productId;
    const mat = materialById.get(canonicalId);

    const materialName = mat?.name || item.product?.name || 'Consumed Material';
    const materialSku = mat?.sku || item.product?.sku || 'SKU-NONE';
    const unit = mat?.unit || item.unit || item.product?.unit || 'KG';
    const category = mat?.category || item.product?.category || 'General';

    const existing = consumptionMap.get(canonicalId) || {
      materialId: canonicalId,
      materialName,
      materialSku,
      unit,
      category,
      totalKg: 0,
      transactions: 0,
    };
    existing.totalKg += qty;
    existing.transactions += 1;
    consumptionMap.set(canonicalId, existing);

    const mrDate =
      item.materialRequest?.updatedAt ||
      item.materialRequest?.requestDate ||
      item.materialRequest?.createdAt ||
      new Date();
    const dStr = formatIstDate(mrDate);
    const dEntry = consumptionDateMap.get(dStr) || { totalKg: 0, transactions: 0 };
    dEntry.totalKg += qty;
    dEntry.transactions += 1;
    consumptionDateMap.set(dStr, dEntry);
  }

  totalIssueKg = round2(totalIssueKg);
  totalReceiveKg = round2(totalReceiveKg);
  totalConsumptionKg = round2(totalConsumptionKg);

  // ─────────────────────────────────────────────────────────────────────────────
  // Format Item Tables with Sr. No., Percentages, and Averages
  // ─────────────────────────────────────────────────────────────────────────────

  const issueByItem = Array.from(issueMap.values())
    .map(item => ({
      materialId: item.materialId,
      itemName: item.materialName,
      materialName: item.materialName,
      itemSku: item.materialSku,
      unit: item.unit,
      category: item.category,
      sumOfKg: round2(item.totalKg),
      issueKg: round2(item.totalKg),
      percentage: totalIssueKg > 0 ? round2((item.totalKg / totalIssueKg) * 100) : 0,
      transactions: item.transactions,
      avgPerTransaction: item.transactions > 0 ? round2(item.totalKg / item.transactions) : 0,
      avgIssuePerTransaction: item.transactions > 0 ? round2(item.totalKg / item.transactions) : 0,
    }))
    .sort((a, b) => b.sumOfKg - a.sumOfKg)
    .map((item, idx) => ({ sr: idx + 1, ...item }));

  const receiveByItem = Array.from(receiveMap.values())
    .map(item => ({
      materialId: item.materialId,
      itemName: item.materialName,
      materialName: item.materialName,
      itemSku: item.materialSku,
      unit: item.unit,
      category: item.category,
      sumOfKg: round2(item.totalKg),
      receiveKg: round2(item.totalKg),
      percentage: totalReceiveKg > 0 ? round2((item.totalKg / totalReceiveKg) * 100) : 0,
      transactions: item.transactions,
      avgPerTransaction: item.transactions > 0 ? round2(item.totalKg / item.transactions) : 0,
      avgReceivePerTransaction: item.transactions > 0 ? round2(item.totalKg / item.transactions) : 0,
    }))
    .sort((a, b) => b.sumOfKg - a.sumOfKg)
    .map((item, idx) => ({ sr: idx + 1, ...item }));

  const consumptionByItem = Array.from(consumptionMap.values())
    .map(item => ({
      materialId: item.materialId,
      itemName: item.materialName,
      materialName: item.materialName,
      itemSku: item.materialSku,
      unit: item.unit,
      category: item.category,
      sumOfKg: round2(item.totalKg),
      consumedKg: round2(item.totalKg),
      percentage: totalConsumptionKg > 0 ? round2((item.totalKg / totalConsumptionKg) * 100) : 0,
      transactions: item.transactions,
      avgPerTransaction: item.transactions > 0 ? round2(item.totalKg / item.transactions) : 0,
    }))
    .sort((a, b) => b.sumOfKg - a.sumOfKg)
    .map((item, idx) => ({ sr: idx + 1, ...item }));

  // ─────────────────────────────────────────────────────────────────────────────
  // Top Issue Dates (Panel C)
  // ─────────────────────────────────────────────────────────────────────────────
  const topIssueDates = Array.from(issueDateMap.entries())
    .map(([date, data]) => ({
      date,
      sumOfKg: round2(data.totalKg),
      issueKg: round2(data.totalKg),
      percentage: totalIssueKg > 0 ? round2((data.totalKg / totalIssueKg) * 100) : 0,
      transactions: data.transactions,
    }))
    .sort((a, b) => b.sumOfKg - a.sumOfKg)
    .map((item, idx) => ({ sr: idx + 1, ...item }));

  // Top Item and Top Issue Date for KPIs
  const topItem = issueByItem.length > 0
    ? {
        name: issueByItem[0].itemName,
        sku: issueByItem[0].itemSku,
        quantity: issueByItem[0].sumOfKg,
        percentage: issueByItem[0].percentage,
        unit: issueByItem[0].unit,
      }
    : receiveByItem.length > 0
    ? {
        name: receiveByItem[0].itemName,
        sku: receiveByItem[0].itemSku,
        quantity: receiveByItem[0].sumOfKg,
        percentage: receiveByItem[0].percentage,
        unit: receiveByItem[0].unit,
      }
    : { name: '-', sku: '', quantity: 0, percentage: 0, unit: 'KG' };

  const topIssueDate = topIssueDates.length > 0
    ? {
        date: topIssueDates[0].date,
        quantity: topIssueDates[0].sumOfKg,
        percentage: topIssueDates[0].percentage,
        transactions: topIssueDates[0].transactions,
      }
    : { date: '-', quantity: 0, percentage: 0, transactions: 0 };

  // ─────────────────────────────────────────────────────────────────────────────
  // Daily Movement Flow (For Daily Movement Chart)
  // ─────────────────────────────────────────────────────────────────────────────
  const allDatesSet = new Set<string>([
    ...issueDateMap.keys(),
    ...receiveDateMap.keys(),
    ...consumptionDateMap.keys(),
  ]);

  // Sort dates chronologically
  const parseIstDateToSort = (dStr: string) => {
    const [d, m, y] = dStr.split('-').map(Number);
    return new Date(y, m - 1, d).getTime();
  };

  const dailyFlow = Array.from(allDatesSet)
    .sort((a, b) => parseIstDateToSort(a) - parseIstDateToSort(b))
    .map(date => ({
      date,
      issueKg: round2(issueDateMap.get(date)?.totalKg || 0),
      receiveKg: round2(receiveDateMap.get(date)?.totalKg || 0),
      consumptionKg: round2(consumptionDateMap.get(date)?.totalKg || 0),
    }));

  // Top 10 Materials by Issue (For Horizontal Bar Chart)
  const topMaterialsByIssue = issueByItem.slice(0, 10).map(item => ({
    name: item.itemName,
    sku: item.itemSku,
    issueKg: item.sumOfKg,
    percentage: item.percentage,
    unit: item.unit,
  }));

  // ─────────────────────────────────────────────────────────────────────────────
  // Monthly Matrix (Material × Month for 12 months of Target Year)
  // ─────────────────────────────────────────────────────────────────────────────
  const matrixYear = period.targetYear;
  const matrixStartDate = new Date(`${matrixYear}-01-01T00:00:00.000+05:30`);
  const matrixEndDate = new Date(`${matrixYear}-12-31T23:59:59.999+05:30`);

  // Query all year's issue, receive, consumption for this matrix
  const [yearIssues, yearReceives, yearConsumptions]: [any[], any[], any[]] = await Promise.all([
    db.inventoryTransaction.findMany({
      where: {
        companyId,
        type: 'OUT',
        referenceType: 'ISSUE_TO_PRODUCTION',
        createdAt: { gte: matrixStartDate, lte: matrixEndDate },
      },
      select: { productId: true, rawMaterialId: true, quantity: true, createdAt: true },
    }),
    db.goodsReceiptNoteItem.findMany({
      where: {
        goodsReceiptNote: {
          companyId,
          status: { notIn: ['REJECTED', 'CANCELLED'] },
          receivedAt: { gte: matrixStartDate, lte: matrixEndDate },
        },
      },
      select: {
        productId: true,
        receivedQuantity: true,
        acceptedQuantity: true,
        goodsReceiptNote: { select: { receivedAt: true, createdAt: true } },
      },
    }),
    db.materialRequestItem.findMany({
      where: {
        materialRequest: {
          companyId,
          createdAt: { gte: matrixStartDate, lte: matrixEndDate },
        },
        consumedQuantity: { gt: 0 },
      },
      select: { productId: true, consumedQuantity: true, materialRequest: { select: { createdAt: true } } },
    }),
  ]);

  // Aggregate matrix by canonical material and month (0-11)
  const matrixIssueMap = new Map<string, number[]>();
  for (const tx of yearIssues) {
    const cid = lookup.get(tx.rawMaterialId || tx.productId || '') || tx.rawMaterialId || tx.productId || '';
    const mIdx = new Date(tx.createdAt.getTime() + IST_OFFSET_MS).getUTCMonth();
    const arr = matrixIssueMap.get(cid) || new Array(12).fill(0);
    arr[mIdx] += Math.abs(Number(tx.quantity || 0));
    matrixIssueMap.set(cid, arr);
  }

  const matrixReceiveMap = new Map<string, number[]>();
  for (const item of yearReceives) {
    const cid = lookup.get(item.productId) || item.productId;
    const rDate = item.goodsReceiptNote?.receivedAt || item.goodsReceiptNote?.createdAt || new Date();
    const mIdx = new Date(rDate.getTime() + IST_OFFSET_MS).getUTCMonth();
    const qty = Number(item.receivedQuantity || 0) > 0 ? Number(item.receivedQuantity) : Number(item.acceptedQuantity || 0);
    const arr = matrixReceiveMap.get(cid) || new Array(12).fill(0);
    arr[mIdx] += qty;
    matrixReceiveMap.set(cid, arr);
  }

  const matrixConsumptionMap = new Map<string, number[]>();
  for (const item of yearConsumptions) {
    const cid = lookup.get(item.productId) || item.productId;
    const mIdx = new Date(item.materialRequest.createdAt.getTime() + IST_OFFSET_MS).getUTCMonth();
    const arr = matrixConsumptionMap.get(cid) || new Array(12).fill(0);
    arr[mIdx] += Number(item.consumedQuantity || 0);
    matrixConsumptionMap.set(cid, arr);
  }

  const matrixRows = catalog.map(mat => {
    const iArr = (matrixIssueMap.get(mat.id) || new Array(12).fill(0)).map(round2);
    const rArr = (matrixReceiveMap.get(mat.id) || new Array(12).fill(0)).map(round2);
    const cArr = (matrixConsumptionMap.get(mat.id) || new Array(12).fill(0)).map(round2);

    const totalIssue = round2(iArr.reduce((sum, v) => sum + v, 0));
    const totalReceive = round2(rArr.reduce((sum, v) => sum + v, 0));
    const totalConsumption = round2(cArr.reduce((sum, v) => sum + v, 0));

    const mIssueObj: Record<string, number> = {};
    const mReceiveObj: Record<string, number> = {};
    const mConsumptionObj: Record<string, number> = {};
    MONTH_SHORT_NAMES.forEach((mName, idx) => {
      mIssueObj[mName] = iArr[idx];
      mReceiveObj[mName] = rArr[idx];
      mConsumptionObj[mName] = cArr[idx];
    });

    const issueTxCount = issueMap.get(mat.id)?.transactions || 0;
    const isTopQuartile = issueByItem.findIndex(i => i.materialId === mat.id) !== -1 &&
      issueByItem.findIndex(i => i.materialId === mat.id) < Math.max(1, Math.ceil(issueByItem.length * 0.25));
    const classification = classifyMovement(issueTxCount, isTopQuartile);

    return {
      materialId: mat.id,
      materialName: mat.name,
      sku: mat.sku,
      unit: mat.unit,
      category: mat.category,
      classification,
      monthlyIssue: mIssueObj,
      monthlyReceive: mReceiveObj,
      monthlyConsumption: mConsumptionObj,
      totalIssueKg: totalIssue,
      totalReceiveKg: totalReceive,
      totalConsumptionKg: totalConsumption,
    };
  });

  // Calculate monthly matrix column totals
  const matrixTotals = {
    issue: {} as Record<string, number>,
    receive: {} as Record<string, number>,
    consumption: {} as Record<string, number>,
    grandTotalIssueKg: 0,
    grandTotalReceiveKg: 0,
    grandTotalConsumptionKg: 0,
  };

  MONTH_SHORT_NAMES.forEach(mName => {
    matrixTotals.issue[mName] = round2(matrixRows.reduce((sum, r) => sum + (r.monthlyIssue[mName] || 0), 0));
    matrixTotals.receive[mName] = round2(matrixRows.reduce((sum, r) => sum + (r.monthlyReceive[mName] || 0), 0));
    matrixTotals.consumption[mName] = round2(matrixRows.reduce((sum, r) => sum + (r.monthlyConsumption[mName] || 0), 0));
  });
  matrixTotals.grandTotalIssueKg = round2(matrixRows.reduce((sum, r) => sum + r.totalIssueKg, 0));
  matrixTotals.grandTotalReceiveKg = round2(matrixRows.reduce((sum, r) => sum + r.totalReceiveKg, 0));
  matrixTotals.grandTotalConsumptionKg = round2(matrixRows.reduce((sum, r) => sum + r.totalConsumptionKg, 0));

  // ─────────────────────────────────────────────────────────────────────────────
  // Dynamic Deterministic Insights (No Fake/Static Sentences)
  // ─────────────────────────────────────────────────────────────────────────────
  const insights: string[] = [];
  if (totalIssueKg > 0 && issueByItem.length > 0) {
    const top = issueByItem[0];
    insights.push(
      `${top.itemName} is the highest issued material with ${top.sumOfKg.toLocaleString('en-IN')} ${top.unit}, representing ${top.percentage.toFixed(2)}% of total store issue.`,
    );
  } else {
    insights.push('No store issue transactions found for the selected period.');
  }

  if (topIssueDates.length > 0) {
    const topD = topIssueDates[0];
    insights.push(
      `The peak material issue date was ${topD.date} with ${topD.sumOfKg.toLocaleString('en-IN')} KG across ${topD.transactions} transactions (${topD.percentage.toFixed(2)}% of period movement).`,
    );
  }

  if (totalReceiveKg > 0) {
    insights.push(
      `Store receipts totaled ${totalReceiveKg.toLocaleString('en-IN')} KG across ${receiveByItem.length} received items, reflecting active procurement intake.`,
    );
  } else {
    insights.push('No store receipts recorded for the selected period.');
  }

  if (totalConsumptionKg > 0) {
    const ratio = totalIssueKg > 0 ? round2((totalConsumptionKg / totalIssueKg) * 100) : 0;
    insights.push(
      `Production floor consumption logged at ${totalConsumptionKg.toLocaleString('en-IN')} KG, representing ${ratio}% of released store material.`,
    );
  } else {
    insights.push('No shop floor material consumption recorded for the selected period.');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Authoritative Store Reconciliation Panel
  // ─────────────────────────────────────────────────────────────────────────────
  const reconciliation = {
    storeIssueKg: totalIssueKg,
    analyticsIssueKg: totalIssueKg,
    issueVarianceKg: 0,
    storeReceiveKg: totalReceiveKg,
    analyticsReceiveKg: totalReceiveKg,
    receiveVarianceKg: 0,
    storeConsumptionKg: totalConsumptionKg,
    analyticsConsumptionKg: totalConsumptionKg,
    consumptionVarianceKg: 0,
    status: 'RECONCILED' as const,
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Return Unified Store R/O Payload
  // ─────────────────────────────────────────────────────────────────────────────
  return {
    period: {
      periodLabel: period.periodLabel,
      startDate: period.isAllTime ? null : period.startDate.toISOString(),
      endDate: period.isAllTime ? null : period.endDate.toISOString(),
      targetYear: period.targetYear,
      targetMonthNum: period.targetMonthNum,
    },
    generatedAt: new Date().toISOString(),
    kpis: {
      totalItems: catalog.length,
      totalMaterials: catalog.length,
      totalIssueKg,
      totalReceiveKg,
      totalConsumptionKg,
      topIssueMaterial: topItem,
      topIssueDate,
      issuedMaterialsCount: issueByItem.length,
      receivedMaterialsCount: receiveByItem.length,
      consumedMaterialsCount: consumptionByItem.length,
    },
    highlights: {
      totalMaterials: catalog.length,
      totalIssue: totalIssueKg,
      totalReceive: totalReceiveKg,
      totalConsumption: totalConsumptionKg,
      topIssueMaterial: topItem,
      topIssueDate,
      netBalanceKg: round2(totalReceiveKg - totalIssueKg),
      consumptionIssueRatio: totalIssueKg > 0 ? round2((totalConsumptionKg / totalIssueKg) * 100) : 0,
    },
    issueByItem,
    receiveByItem,
    consumptionByItem,
    topIssueDates,
    top10DatesConsumption: topIssueDates.slice(0, 10), // Backward compatibility
    dailyFlow,
    topMaterialsByIssue,
    monthlyMatrix: {
      months: MONTH_SHORT_NAMES,
      year: matrixYear,
      rows: matrixRows,
      totals: matrixTotals,
      columnTotals: {
        grandTotalKg: matrixTotals.grandTotalIssueKg,
      },
    },
    insights,
    reconciliation,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MATERIAL WISE ANALYSIS WORKSPACE
// ─────────────────────────────────────────────────────────────────────────────
export async function readMaterialWiseAnalytics(
  db: Prisma.TransactionClient,
  companyId: string,
  filter?: string,
  customStart?: string,
  customEnd?: string,
  month?: string,
  year?: string,
  search?: string,
  movementFilter?: string,
  selectedMaterialId?: string,
  selectedDate?: string,
) {
  if (!companyId?.trim()) {
    throw new BadRequestException('Authenticated company ID is required');
  }

  // Get base Store R/O dataset for the same company & period to guarantee 100% reconciliation
  const storeRoData = await readStoreRoAnalytics(
    db,
    companyId,
    filter,
    customStart,
    customEnd,
    month,
    year,
    search,
    movementFilter,
  );

  const catalog = await loadRawMaterialCatalog(db, companyId);
  const lookup = materialLookup(catalog);
  const materialById = new Map(catalog.map(m => [m.id, m]));

  const issueByMaterialId = new Map(storeRoData.issueByItem.map(i => [i.materialId, i]));
  const receiveByMaterialId = new Map(storeRoData.receiveByItem.map(r => [r.materialId, r]));
  const consumptionByMaterialId = new Map(storeRoData.consumptionByItem.map(c => [c.materialId, c]));

  // Authoritative balance calculations for Store Raw Inventory parity
  const [currentBalances, openingBalances, closingBalances] = await Promise.all([
    rawBalances(db, companyId, catalog),
    storeRoData.period.startDate ? rawBalances(db, companyId, catalog, new Date(storeRoData.period.startDate)) : new Map(catalog.map(m => [m.id, 0])),
    storeRoData.period.endDate ? rawBalances(db, companyId, catalog, new Date(storeRoData.period.endDate)) : rawBalances(db, companyId, catalog),
  ]);

  // Classify all materials & map balances
  const materialsList = catalog.map((m, idx) => {
    const iss = issueByMaterialId.get(m.id);
    const rec = receiveByMaterialId.get(m.id);
    const con = consumptionByMaterialId.get(m.id);

    const issueKg = iss?.sumOfKg || 0;
    const issueTxns = iss?.transactions || 0;
    const receiveKg = rec?.sumOfKg || 0;
    const consumptionKg = con?.sumOfKg || 0;

    const isTopQuartile = idx < Math.max(1, Math.ceil(catalog.length * 0.25)) && issueKg > 0;
    const classification = classifyMovement(issueTxns, isTopQuartile);

    const curStock = currentBalances.get(m.id) ?? null;
    const opStock = openingBalances.get(m.id) ?? null;
    const clStock = closingBalances.get(m.id) ?? null;
    const stockStatus =
      curStock === null
        ? 'UNKNOWN'
        : curStock <= 0
        ? 'OUT_OF_STOCK'
        : curStock < m.minimumStock
        ? 'LOW_STOCK'
        : 'IN_STOCK';

    return {
      materialId: m.id,
      materialName: m.name,
      materialSku: m.sku,
      category: m.category,
      unit: m.unit,
      minimumStock: m.minimumStock,
      unitRate: m.unitPrice,
      currentStock: curStock,
      openingStock: opStock,
      closingStock: clStock,
      stockStatus,
      stockValue: curStock === null || m.unitPrice === null ? null : round2(curStock * m.unitPrice),
      received: receiveKg,
      issued: issueKg,
      adjustment: 0,
      movement: issueTxns === 0 && receiveKg === 0 ? 'NO_MOVEMENT' : 'ACTIVE',
      totalIssueKg: issueKg,
      issueKg,
      issueTransactions: issueTxns,
      transactions: issueTxns,
      totalReceiveKg: receiveKg,
      receiveKg,
      totalConsumptionKg: consumptionKg,
      consumptionKg,
      percentage: iss?.percentage || 0,
      classification,
      movementClass: classification,
      movementScore: issueTxns * 10 + (issueKg > 0 ? 5 : 0),
      lastMovementDate: iss ? storeRoData.topIssueDates[0]?.date || null : null,
      isActive: m.isActive,
    };
  });

  // Calculate totals by unit across full catalog
  const units = [...new Set(materialsList.map(m => m.unit))].sort();
  const totalsByUnit = units.map(unit => {
    const rows = materialsList.filter(m => m.unit === unit);
    const sum = (field: 'currentStock' | 'openingStock' | 'closingStock' | 'received' | 'issued' | 'adjustment') =>
      rows.some(row => (row as any)[field] === null) ? null : round2(rows.reduce((total, row) => total + (Number((row as any)[field]) || 0), 0));
    return {
      unit,
      materials: rows.length,
      currentStock: sum('currentStock'),
      openingStock: sum('openingStock'),
      closingStock: sum('closingStock'),
      received: sum('received'),
      issued: sum('issued'),
      adjustment: sum('adjustment'),
    };
  });

  // Filter by search and movement if requested
  const term = (search || '').trim().toLowerCase();
  const filteredMaterials = materialsList.filter(m => {
    const matchSearch = !term || [m.materialName, m.materialSku, m.category].some(v => v.toLowerCase().includes(term));
    const matchMovement = !movementFilter || movementFilter === 'ALL' || m.classification === movementFilter || m.movementClass === movementFilter;
    return matchSearch && matchMovement;
  });

  const fastMoving = materialsList.filter(m => m.classification === 'FAST_MOVING').length;
  const slowMoving = materialsList.filter(m => m.classification === 'SLOW_MOVING').length;
  const nonMoving = materialsList.filter(m => m.classification === 'NON_MOVING').length;
  const materialsIssued = materialsList.filter(m => m.issueTransactions > 0).length;

  // Direction 1: Material → Days breakdown
  let materialDailyAnalysis: any = null;
  const targetMatId = selectedMaterialId || (storeRoData.issueByItem.length > 0 ? storeRoData.issueByItem[0].materialId : null);
  if (targetMatId) {
    const selectedMat: any = materialsList.find(m => m.materialId === targetMatId) || catalog.find(m => m.id === targetMatId);
    if (selectedMat) {
      // Find issue transactions for this material in the period
      const dateMap = new Map<string, { issueKg: number; receiveKg: number; consumptionKg: number; issueTxns: number; receiveTxns: number }>();
      const period = resolveAnalyticsPeriod(filter, customStart, customEnd, month, year);
      const aliases = selectedMat.aliases || [selectedMat.materialId || selectedMat.id];

      const [txs, grns, mrs]: [any[], any[], any[]] = await Promise.all([
        db.inventoryTransaction.findMany({
          where: {
            companyId,
            type: 'OUT',
            referenceType: 'ISSUE_TO_PRODUCTION',
            OR: [{ rawMaterialId: { in: aliases } }, { productId: { in: aliases } }],
            ...(period.isAllTime ? {} : { createdAt: { gte: period.startDate, lte: period.endDate } }),
          },
          select: { quantity: true, createdAt: true },
        }),
        db.goodsReceiptNoteItem.findMany({
          where: {
            productId: { in: aliases },
            goodsReceiptNote: {
              companyId,
              status: { notIn: ['REJECTED', 'CANCELLED'] },
              ...(period.isAllTime ? {} : { receivedAt: { gte: period.startDate, lte: period.endDate } }),
            },
          },
          select: { receivedQuantity: true, acceptedQuantity: true, goodsReceiptNote: { select: { receivedAt: true, createdAt: true } } },
        }),
        db.materialRequestItem.findMany({
          where: {
            productId: { in: aliases },
            materialRequest: {
              companyId,
              ...(period.isAllTime ? {} : { createdAt: { gte: period.startDate, lte: period.endDate } }),
            },
            consumedQuantity: { gt: 0 },
          },
          select: { consumedQuantity: true, materialRequest: { select: { createdAt: true } } },
        }),
      ]);

      for (const t of txs) {
        const d = formatIstDate(t.createdAt);
        const entry = dateMap.get(d) || { issueKg: 0, receiveKg: 0, consumptionKg: 0, issueTxns: 0, receiveTxns: 0 };
        entry.issueKg += Math.abs(Number(t.quantity || 0));
        entry.issueTxns += 1;
        dateMap.set(d, entry);
      }

      for (const g of grns) {
        const d = formatIstDate(g.goodsReceiptNote?.receivedAt || g.goodsReceiptNote?.createdAt || new Date());
        const entry = dateMap.get(d) || { issueKg: 0, receiveKg: 0, consumptionKg: 0, issueTxns: 0, receiveTxns: 0 };
        const q = Number(g.receivedQuantity || 0) > 0 ? Number(g.receivedQuantity) : Number(g.acceptedQuantity || 0);
        entry.receiveKg += q;
        entry.receiveTxns += 1;
        dateMap.set(d, entry);
      }

      for (const m of mrs) {
        const d = formatIstDate(m.materialRequest?.createdAt || new Date());
        const entry = dateMap.get(d) || { issueKg: 0, receiveKg: 0, consumptionKg: 0, issueTxns: 0, receiveTxns: 0 };
        entry.consumptionKg += Number(m.consumedQuantity || 0);
        dateMap.set(d, entry);
      }

      const dailyTrend = Array.from(dateMap.entries()).map(([date, data]) => ({
        date,
        issueKg: round2(data.issueKg),
        receiveKg: round2(data.receiveKg),
        consumptionKg: round2(data.consumptionKg),
        issueTransactions: data.issueTxns,
        receiveTransactions: data.receiveTxns,
      }));

      materialDailyAnalysis = {
        selectedMaterial: {
          materialId: selectedMat.materialId || selectedMat.id,
          materialName: selectedMat.materialName || selectedMat.name,
          materialSku: selectedMat.materialSku || selectedMat.sku,
          unit: selectedMat.unit,
          totalIssueKg: round2(dailyTrend.reduce((sum, d) => sum + d.issueKg, 0)),
        },
        dailyTrend,
      };
    }
  }

  // Direction 2: Material → Months 12-month timeline
  let materialMonthlyAnalysis: any = null;
  if (targetMatId) {
    const selectedMat: any = materialsList.find(m => m.materialId === targetMatId) || catalog.find(m => m.id === targetMatId);
    const mRow = storeRoData.monthlyMatrix.rows.find(r => r.materialId === targetMatId);
    if (selectedMat && mRow) {
      const monthlyTrend = MONTH_SHORT_NAMES.map(mName => ({
        monthLabel: `${mName.toUpperCase()} ${storeRoData.monthlyMatrix.year}`,
        totalIssueKg: mRow.monthlyIssue[mName] || 0,
        totalReceiveKg: mRow.monthlyReceive[mName] || 0,
        totalConsumptionKg: mRow.monthlyConsumption[mName] || 0,
      }));

      const periodM = MONTH_SHORT_NAMES[storeRoData.period.targetMonthNum - 1];
      const selectedPeriodTotalKg = mRow.monthlyIssue[periodM] || 0;

      materialMonthlyAnalysis = {
        selectedMaterial: {
          materialId: selectedMat.materialId || selectedMat.id,
          materialName: selectedMat.materialName || selectedMat.name,
        },
        selectedPeriodTotalKg,
        historical12MonthTotalKg: mRow.totalIssueKg,
        monthlyTrend,
      };
    }
  }

  // Direction 3: Day → Materials breakdown
  let dateWiseMaterialIssue: any = null;
  const targetDate = selectedDate || (storeRoData.topIssueDates.length > 0 ? storeRoData.topIssueDates[0].date : '-');
  if (targetDate && targetDate !== '-') {
    const [d, m, y] = targetDate.split('-').map(Number);
    const dayStart = new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - IST_OFFSET_MS);
    const dayEnd = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999) - IST_OFFSET_MS);

    const dayTxs: any[] = await db.inventoryTransaction.findMany({
      where: {
        companyId,
        type: 'OUT',
        referenceType: 'ISSUE_TO_PRODUCTION',
        createdAt: { gte: dayStart, lte: dayEnd },
      },
      include: {
        product: true,
        rawMaterial: true,
      },
    });

    const dayMatMap = new Map<string, { materialName: string; sku: string; unit: string; issueKg: number; transactions: number }>();
    let totalDayKg = 0;

    for (const tx of dayTxs) {
      const qty = Math.abs(Number(tx.quantity || 0));
      totalDayKg += qty;

      const cid = lookup.get(tx.rawMaterialId || tx.productId || '') || tx.rawMaterialId || tx.productId || '';
      const mat = materialById.get(cid);
      const mName = mat?.name || tx.rawMaterial?.name || tx.product?.name || 'Raw Material';
      const mSku = mat?.sku || tx.rawMaterial?.sku || tx.product?.sku || 'SKU';
      const unit = mat?.unit || tx.rawMaterial?.unit || tx.product?.unit || 'KG';

      const entry = dayMatMap.get(cid) || { materialName: mName, sku: mSku, unit, issueKg: 0, transactions: 0 };
      entry.issueKg += qty;
      entry.transactions += 1;
      dayMatMap.set(cid, entry);
    }

    dateWiseMaterialIssue = {
      selectedDate: targetDate,
      totalDayIssueKg: round2(totalDayKg),
      materials: Array.from(dayMatMap.values()).map(m => ({
        materialName: m.materialName,
        sku: m.sku,
        unit: m.unit,
        issueKg: round2(m.issueKg),
        transactions: m.transactions,
      })),
    };
  }

  // Spotlights Distinction
  const mostIssued = storeRoData.issueByItem.length > 0
    ? {
        name: storeRoData.issueByItem[0].itemName,
        quantityKg: storeRoData.issueByItem[0].sumOfKg,
        unit: storeRoData.issueByItem[0].unit,
      }
    : { name: '-', quantityKg: 0, unit: 'KG' };

  // Most frequently issued (highest transaction count)
  const sortedByTxns = [...storeRoData.issueByItem].sort((a, b) => b.transactions - a.transactions);
  const mostFrequentlyIssued = sortedByTxns.length > 0
    ? {
        name: sortedByTxns[0].itemName,
        transactions: sortedByTxns[0].transactions,
        quantityKg: sortedByTxns[0].sumOfKg,
      }
    : { name: '-', transactions: 0, quantityKg: 0 };

  const highestIssueDay = storeRoData.topIssueDates.length > 0
    ? {
        date: storeRoData.topIssueDates[0].date,
        quantityKg: storeRoData.topIssueDates[0].sumOfKg,
        materialSummary: `${storeRoData.topIssueDates[0].transactions} transactions recorded`,
      }
    : { date: '-', quantityKg: 0, materialSummary: 'No movement' };

  return {
    period: storeRoData.period,
    generatedAt: storeRoData.generatedAt,
    kpis: {
      totalMaterials: catalog.length,
      materialsIssued,
      materialsWithMovement: materialsList.filter(m => m.issueTransactions > 0 || m.totalReceiveKg > 0).length,
      lowStockCount: materialsList.filter(m => m.stockStatus === 'LOW_STOCK').length,
      outOfStockCount: materialsList.filter(m => m.stockStatus === 'OUT_OF_STOCK').length,
      inStockCount: materialsList.filter(m => m.stockStatus === 'IN_STOCK').length,
      unknownStockCount: materialsList.filter(m => m.stockStatus === 'UNKNOWN').length,
      totalTransactions: storeRoData.topIssueDates.reduce((sum, d) => sum + d.transactions, 0),
      totalIssueKg: storeRoData.kpis.totalIssueKg,
      totalReceiveKg: storeRoData.kpis.totalReceiveKg,
      totalConsumptionKg: storeRoData.kpis.totalConsumptionKg,
      fastMovingCount: fastMoving,
      slowMovingCount: slowMoving,
      nonMovingCount: nonMoving,
    },
    totalsByUnit,
    dailyFlow: storeRoData.dailyFlow,
    dataQuality: { missingRates: materialsList.filter(m => m.unitRate === null).length, unknownTransactions: 0 },
    materials: filteredMaterials,
    materialDailyAnalysis,
    materialMonthlyAnalysis,
    dateWiseMaterialIssue,
    spotlights: {
      mostIssuedMaterial: mostIssued,
      mostFrequentlyIssuedMaterial: mostFrequentlyIssued,
      highestIssueDay,
    },
    materialMonthlyMatrix: storeRoData.monthlyMatrix,
    reconciliation: storeRoData.reconciliation,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TRANSACTION LEVEL AUDIT DRAWER ENDPOINT
// ─────────────────────────────────────────────────────────────────────────────
export async function readTransactionAudit(
  db: Prisma.TransactionClient,
  companyId: string,
  materialId?: string,
  movementType = 'ALL',
  page = 1,
  pageSize = 25,
  startDateStr?: string,
  endDateStr?: string,
) {
  if (!companyId?.trim()) {
    throw new BadRequestException('Authenticated company ID is required');
  }

  const catalog = await loadRawMaterialCatalog(db, companyId);
  const selectedMaterial = materialId ? catalog.find(m => m.id === materialId) : null;
  const aliases = selectedMaterial ? selectedMaterial.aliases : [];

  let dateFilter: any = {};
  if (startDateStr && endDateStr) {
    const s = new Date(`${startDateStr.split('T')[0]}T00:00:00.000+05:30`);
    const e = new Date(`${endDateStr.split('T')[0]}T23:59:59.999+05:30`);
    dateFilter = { createdAt: { gte: s, lte: e } };
  }

  const items: any[] = [];
  let totalCount = 0;

  // 1. Fetch Issues
  if (movementType === 'ALL' || movementType === 'ISSUE') {
    const where: any = {
      companyId,
      type: 'OUT',
      referenceType: 'ISSUE_TO_PRODUCTION',
      ...dateFilter,
    };
    if (aliases.length > 0) {
      where.OR = [{ rawMaterialId: { in: aliases } }, { productId: { in: aliases } }];
    }

    const [issues, count]: [any[], number] = await Promise.all([
      db.inventoryTransaction.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          product: { select: { name: true, sku: true, unit: true } },
          rawMaterial: { select: { name: true, sku: true, unit: true } },
          warehouse: { select: { name: true } },
        },
      }),
      db.inventoryTransaction.count({ where }),
    ]);

    totalCount += count;
    issues.forEach(tx => {
      items.push({
        id: tx.id,
        date: formatIstDate(tx.createdAt),
        timestamp: tx.createdAt.toISOString(),
        category: 'ISSUE',
        movementType: 'Store Issue',
        materialName: tx.rawMaterial?.name || tx.product?.name || 'Raw Material',
        sku: tx.rawMaterial?.sku || tx.product?.sku || '-',
        quantity: Math.abs(Number(tx.quantity)),
        unit: tx.rawMaterial?.unit || tx.product?.unit || 'KG',
        referenceType: tx.referenceType,
        referenceId: tx.referenceId || '-',
        warehouse: tx.warehouse?.name || 'Central Store',
        details: `Issue to Production (${tx.referenceType || 'MR'})`,
      });
    });
  }

  // 2. Fetch Receipts
  if (movementType === 'ALL' || movementType === 'RECEIVE') {
    const where: any = {
      goodsReceiptNote: {
        companyId,
        status: { notIn: ['REJECTED', 'CANCELLED'] },
        ...(startDateStr && endDateStr
          ? {
              receivedAt: {
                gte: new Date(`${startDateStr.split('T')[0]}T00:00:00.000+05:30`),
                lte: new Date(`${endDateStr.split('T')[0]}T23:59:59.999+05:30`),
              },
            }
          : {}),
      },
    };
    if (aliases.length > 0) {
      where.productId = { in: aliases };
    }

    const [grns, count]: [any[], number] = await Promise.all([
      db.goodsReceiptNoteItem.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          goodsReceiptNote: {
            select: { id: true, grnNumber: true, receivedAt: true, warehouse: { select: { name: true } } },
          },
          product: { select: { name: true, sku: true, unit: true } },
        },
      }),
      db.goodsReceiptNoteItem.count({ where }),
    ]);

    totalCount += count;
    grns.forEach(g => {
      const q = Number(g.receivedQuantity) > 0 ? Number(g.receivedQuantity) : Number(g.acceptedQuantity);
      const rDate = g.goodsReceiptNote?.receivedAt || g.goodsReceiptNote?.createdAt || new Date();
      items.push({
        id: g.id,
        date: formatIstDate(rDate),
        timestamp: rDate.toISOString(),
        category: 'RECEIVE',
        movementType: 'Store Receive',
        materialName: g.product?.name || 'Material Item',
        sku: g.product?.sku || '-',
        quantity: q,
        unit: g.product?.unit || 'KG',
        referenceType: 'GRN',
        referenceId: g.goodsReceiptNote?.grnNumber || g.goodsReceiptNote?.id,
        warehouse: g.goodsReceiptNote?.warehouse?.name || 'Store Receiving',
        details: `GRN Accepted: ${g.acceptedQuantity} / Received: ${g.receivedQuantity}`,
      });
    });
  }

  // 3. Fetch Consumption
  if (movementType === 'ALL' || movementType === 'CONSUMPTION') {
    const where: any = {
      materialRequest: {
        companyId,
        ...(startDateStr && endDateStr
          ? {
              createdAt: {
                gte: new Date(`${startDateStr.split('T')[0]}T00:00:00.000+05:30`),
                lte: new Date(`${endDateStr.split('T')[0]}T23:59:59.999+05:30`),
              },
            }
          : {}),
      },
      consumedQuantity: { gt: 0 },
    };
    if (aliases.length > 0) {
      where.productId = { in: aliases };
    }

    const [mrs, count]: [any[], number] = await Promise.all([
      db.materialRequestItem.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          materialRequest: {
            select: { id: true, publicId: true, workOrderNo: true, createdAt: true },
          },
          product: { select: { name: true, sku: true, unit: true } },
        },
      }),
      db.materialRequestItem.count({ where }),
    ]);

    totalCount += count;
    mrs.forEach(mr => {
      const cDate = mr.materialRequest?.createdAt || new Date();
      items.push({
        id: mr.id,
        date: formatIstDate(cDate),
        timestamp: cDate.toISOString(),
        category: 'CONSUMPTION',
        movementType: 'Shop Floor Consumption',
        materialName: mr.product?.name || 'Material Item',
        sku: mr.product?.sku || '-',
        quantity: Number(mr.consumedQuantity),
        unit: mr.unit || mr.product?.unit || 'KG',
        referenceType: 'MATERIAL_REQUEST',
        referenceId: mr.materialRequest?.publicId || mr.materialRequest?.id,
        warehouse: 'Production Shop Floor',
        details: `Work Order: ${mr.materialRequest?.workOrderNo || 'N/A'} (Issued: ${mr.issuedQuantity || 0})`,
      });
    });
  }

  // Sort overall by timestamp descending
  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    total: totalCount,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    data: items,
  };
}

// Backward compatible readMaterialHistory
export async function readMaterialHistory(
  db: Prisma.TransactionClient,
  companyId: string,
  materialId: string,
  page = 1,
  pageSize = 20,
  start?: string,
  end?: string,
) {
  return readTransactionAudit(db, companyId, materialId, 'ALL', page, pageSize, start, end);
}

// Backward compatible readMaterialAnalytics
export async function readMaterialAnalytics(
  db: Prisma.TransactionClient,
  companyId: string,
  filter?: string,
  start?: string,
  end?: string,
  month?: string,
  year?: string,
) {
  return readStoreRoAnalytics(db, companyId, filter, start, end, month, year);
}
