// scratch/verify_production_store_releases.js
const assert = require('assert');

// 1. Mock Data Sources
const STORE_RELEASE_HISTORY_KEY = 'store_release_history_v1';
const STORE_ISSUED_QTY_KEY = 'store_issued_quantities';

const mockStorage = {
  [STORE_RELEASE_HISTORY_KEY]: JSON.stringify([
    {
      id: 'REL-001',
      issueReference: 'ISS-WO-109-178582',
      workOrderNo: 'WO-109',
      requestNo: 'MR-2026-089',
      materialName: 'Steel Plates (Grade 304)',
      quantityIssued: 150,
      unit: 'Units',
      department: 'Production Assembly',
      issuedBy: 'Store Manager',
      issuedAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'ISSUED_TO_PRODUCTION'
    },
    {
      id: 'REL-002',
      issueReference: 'ISS-WO-2026-074-9912',
      workOrderNo: 'WO-2026-074',
      requestNo: 'MR-2026-098',
      materialName: 'Pigment Red Iron Oxide',
      quantityIssued: 500,
      unit: 'Kg',
      department: 'Production Assembly',
      issuedBy: 'Store Manager',
      issuedAt: new Date(Date.now() - 7200000).toISOString(),
      status: 'ISSUED_TO_PRODUCTION'
    }
  ]),
  [STORE_ISSUED_QTY_KEY]: JSON.stringify({
    'req-101-it-1': 50,
    'req-101-it-2': 20
  })
};

const mockBackendRequests = [
  {
    id: 'req-101',
    requestNo: 'MR-2026-101',
    workOrderNo: 'WO-2026-088',
    department: 'Production Floor',
    status: 'STORE_APPROVED',
    metadata: {
      issueReference: 'ISS-WO-2026-088-3310',
      issuedBy: 'Store Officer'
    },
    items: [
      { id: 'it-1', materialId: 'it-1', materialName: 'OPC Cement Grade 53', approvedQty: 50, issuedQty: 50, unit: 'Bags' },
      { id: 'it-2', materialId: 'it-2', materialName: 'River Sand Grade-1', approvedQty: 20, issuedQty: 20, unit: 'Tons' },
      // Unissued item - must NOT appear!
      { id: 'it-3', materialId: 'it-3', materialName: 'Granite Aggregate (Unissued)', approvedQty: 10, issuedQty: 0, unit: 'Tons' }
    ]
  },
  // Entirely pending request (not issued by store) - must NOT appear!
  {
    id: 'req-pending-999',
    requestNo: 'MR-2026-999',
    workOrderNo: 'WO-2026-999',
    department: 'Plant Head',
    status: 'PLANT_HEAD_APPROVED',
    items: [
      { id: 'it-99', materialName: 'Unapproved Raw Chemical', approvedQty: 100, issuedQty: 0, unit: 'Liters' }
    ]
  }
];

// Logic under test: Aggregate issued materials
function aggregateIssuedMaterials(storeLedger, allRequests, savedQuantities) {
  const itemsMap = new Map();

  // 1. Transactions from Store Releases ledger
  storeLedger.forEach((tx) => {
    if (!tx || !tx.materialName || Number(tx.quantityIssued || 0) <= 0) return;
    const key = `${tx.issueReference || tx.id}-${tx.materialName}`;
    itemsMap.set(key, {
      id: tx.id,
      issueReference: tx.issueReference,
      workOrderNo: tx.workOrderNo || 'Direct Issue',
      requestNo: tx.requestNo || 'MR-STORE',
      materialName: tx.materialName,
      quantityIssued: Number(tx.quantityIssued),
      unit: tx.unit || 'Units',
      department: tx.department || 'Production Floor',
      issuedBy: tx.issuedBy || 'Store Manager',
      issuedAt: tx.issuedAt || new Date().toISOString(),
      status: tx.status || 'ISSUED_TO_PRODUCTION'
    });
  });

  // 2. Ingest backend requests where issuedQty > 0
  (allRequests || []).forEach((req) => {
    const wo = req.workOrderNo || req.orderId || 'Direct Requisition';
    const reqNum = req.requestNo || req.publicId || req.id;
    const dept = req.metadata?.issuedToDepartment || req.department || 'Production';
    const issuer = req.metadata?.issuedBy || req.issuedBy || 'Store';
    const ref = req.metadata?.issueReference || req.issueReference || `ISS-${wo}-${reqNum.slice(-4)}`;
    const time = req.metadata?.issuedAt || req.updatedAt || req.createdAt || new Date().toISOString();

    (req.items || []).forEach((item, idx) => {
      const itemKey = `${req.id}-${item.materialId || idx}`;
      let qty = 0;
      if (savedQuantities[itemKey] !== undefined) {
        qty = Number(savedQuantities[itemKey]);
      } else {
        qty = Number(item.issuedQty || 0);
        if (qty === 0 && ['ISSUED_TO_PRODUCTION', 'RECEIVED', 'CONSUMING'].includes(req.status)) {
          qty = Number(item.approvedQty || item.quantity || 0);
        }
      }

      if (qty > 0) {
        const mapKey = `${ref}-${item.materialName || item.material}`;
        if (!itemsMap.has(mapKey)) {
          itemsMap.set(mapKey, {
            id: `${req.id}-${item.id || idx}`,
            issueReference: ref,
            workOrderNo: wo,
            requestNo: reqNum,
            materialName: item.materialName || item.material,
            quantityIssued: qty,
            unit: item.unit || 'Units',
            department: req.metadata?.itemDepartments?.[item.id] || dept,
            issuedBy: issuer,
            issuedAt: time,
            status: req.status || 'ISSUED_TO_PRODUCTION'
          });
        }
      }
    });
  });

  return Array.from(itemsMap.values()).sort((a, b) => {
    const timeA = new Date(a.issuedAt).getTime() || 0;
    const timeB = new Date(b.issuedAt).getTime() || 0;
    return timeB - timeA;
  });
}

console.log('--- RUNNING VERIFICATION FOR PRODUCTION STORE RELEASES ---');

const storeLedger = JSON.parse(mockStorage[STORE_RELEASE_HISTORY_KEY]);
const savedQuantities = JSON.parse(mockStorage[STORE_ISSUED_QTY_KEY]);
const issued = aggregateIssuedMaterials(storeLedger, mockBackendRequests, savedQuantities);

// Test 1: Only issued materials are included
console.log(`Total issued materials aggregated: ${issued.length}`);
assert.strictEqual(issued.length, 4, 'Expected exactly 4 issued materials');

const hasUnissued = issued.some(m => m.materialName.includes('Unissued') || m.materialName.includes('Unapproved'));
assert.strictEqual(hasUnissued, false, 'Unissued materials must NEVER be shown on this page');
console.log('✓ Test 1 Passed: Strictly only materials issued by store are present.');

// Test 2: Quantity verification
const steelPlates = issued.find(m => m.materialName === 'Steel Plates (Grade 304)');
assert.ok(steelPlates);
assert.strictEqual(steelPlates.quantityIssued, 150);
assert.strictEqual(steelPlates.workOrderNo, 'WO-109');
assert.strictEqual(steelPlates.issueReference, 'ISS-WO-109-178582');

const cement = issued.find(m => m.materialName === 'OPC Cement Grade 53');
assert.ok(cement);
assert.strictEqual(cement.quantityIssued, 50);
assert.strictEqual(cement.unit, 'Bags');
console.log('✓ Test 2 Passed: Quantity and unit details are preserved accurately.');

// Test 3: KPI Metrics Calculation
const uniqueMaterials = new Set(issued.map(m => m.materialName)).size;
const totalUnits = issued.reduce((sum, m) => sum + m.quantityIssued, 0);
const uniqueVouchers = new Set(issued.map(m => m.issueReference)).size;
const uniqueWos = new Set(issued.map(m => m.workOrderNo)).size;

assert.strictEqual(uniqueMaterials, 4);
assert.strictEqual(totalUnits, 150 + 500 + 50 + 20); // 720
assert.strictEqual(uniqueVouchers, 3);
assert.strictEqual(uniqueWos, 3);
console.log(`✓ Test 3 Passed: KPI Calculations verified (Materials: ${uniqueMaterials}, Total Units: ${totalUnits}, Vouchers: ${uniqueVouchers}, Work Orders: ${uniqueWos}).`);

// Test 4: Search and Filter Functionality
function filterMaterials(list, query, selectedWo) {
  return list.filter(item => {
    const q = (query || '').toLowerCase().trim();
    const matchesSearch =
      !q ||
      (item.materialName || '').toLowerCase().includes(q) ||
      (item.issueReference || '').toLowerCase().includes(q) ||
      (item.workOrderNo || '').toLowerCase().includes(q) ||
      (item.requestNo || '').toLowerCase().includes(q) ||
      (item.department || '').toLowerCase().includes(q) ||
      (item.issuedBy || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (selectedWo && selectedWo !== 'ALL' && item.workOrderNo !== selectedWo) return false;
    return true;
  });
}

const searchResult = filterMaterials(issued, 'Plates', 'ALL');
assert.strictEqual(searchResult.length, 1);
assert.strictEqual(searchResult[0].materialName, 'Steel Plates (Grade 304)');

const woFilterResult = filterMaterials(issued, '', 'WO-2026-088');
assert.strictEqual(woFilterResult.length, 2);
console.log('✓ Test 4 Passed: Search by query and Work Order filter verified.');

// Test 5: Work Order Grouping
function groupMaterialsByWorkOrder(list) {
  const groups = {};
  list.forEach(item => {
    const wo = item.workOrderNo || 'Direct Issue';
    if (!groups[wo]) {
      groups[wo] = { workOrderNo: wo, items: [], totalQty: 0 };
    }
    groups[wo].items.push(item);
    groups[wo].totalQty += item.quantityIssued;
  });
  return Object.values(groups);
}

const groups = groupMaterialsByWorkOrder(issued);
assert.strictEqual(groups.length, 3);
const wo88Group = groups.find(g => g.workOrderNo === 'WO-2026-088');
assert.strictEqual(wo88Group.items.length, 2);
assert.strictEqual(wo88Group.totalQty, 70);
console.log('✓ Test 5 Passed: Work Order Grouped cards logic verified.');

console.log('--- ALL PRODUCTION STORE RELEASES TESTS PASSED SUCCESSFULLY! ---');
