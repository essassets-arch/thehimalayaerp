// scratch/verify_store_releases_flow.js
const assert = require('assert');

// Mock localStorage
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; }
};

const STORE_RELEASE_HISTORY_KEY = 'store_release_history_v1';
const STORE_MR_HISTORY_KEY = 'store_material_requests_history_v1';

// Initial sample data
const INITIAL_RELEASE_HISTORY = [
  {
    id: 'REL-INIT-001',
    issueReference: 'ISS-WO-109-178582',
    requestId: 'mr-sample-wo109',
    requestNo: 'MR-2026-089',
    workOrderNo: 'WO-109',
    materialName: 'Steel Plates (Grade 304)',
    quantityIssued: 150,
    unit: 'Units',
    department: 'Production Assembly',
    issuedBy: 'Store Manager',
    issuedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'ISSUED_TO_PRODUCTION'
  },
  {
    id: 'REL-INIT-002',
    issueReference: 'ISS-WO-2026-074-9912',
    requestId: 'mr-sample-004',
    requestNo: 'MR-2026-098',
    workOrderNo: 'WO-2026-074',
    materialName: 'Pigment Red Iron Oxide',
    quantityIssued: 500,
    unit: 'Kg',
    department: 'Production Assembly',
    issuedBy: 'Store Manager',
    issuedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: 'ISSUED_TO_PRODUCTION'
  }
];

// Test 1: Release History records and loads
console.log('Testing Store Releases persistence & transaction recording...');

let releaseHistory = INITIAL_RELEASE_HISTORY;

function recordReleaseTransaction(newTx) {
  releaseHistory = [newTx, ...releaseHistory];
  localStorage.setItem(STORE_RELEASE_HISTORY_KEY, JSON.stringify(releaseHistory));
}

function recordMultipleReleaseTransactions(newTxs) {
  releaseHistory = [...newTxs, ...releaseHistory];
  localStorage.setItem(STORE_RELEASE_HISTORY_KEY, JSON.stringify(releaseHistory));
}

// Perform single issue
const tx1 = {
  id: 'REL-TEST-001',
  issueReference: 'ISS-MR-2026-101-1234',
  requestId: 'mr-sample-001',
  requestNo: 'MR-2026-101',
  workOrderNo: 'WO-2026-088',
  materialName: 'OPC Cement Grade 53',
  quantityIssued: 25,
  unit: 'Bags',
  department: 'Production Assembly',
  issuedBy: 'Store Officer',
  issuedAt: new Date().toISOString(),
  status: 'ISSUED_TO_PRODUCTION'
};

recordReleaseTransaction(tx1);

assert.strictEqual(releaseHistory.length, 3);
assert.strictEqual(releaseHistory[0].issueReference, 'ISS-MR-2026-101-1234');
console.log('✓ Single release transaction recorded successfully.');

// Test 2: Bulk issue
const bulkTxs = [
  {
    id: 'REL-TEST-002',
    issueReference: 'ISS-MR-2026-102-5678',
    requestId: 'mr-sample-002',
    requestNo: 'MR-2026-102',
    workOrderNo: 'WO-2026-092',
    materialName: 'Resin Epoxy Binder',
    quantityIssued: 15,
    unit: 'Barrels',
    department: 'Chemical Processing',
    issuedBy: 'Store Officer',
    issuedAt: new Date().toISOString(),
    status: 'ISSUED_TO_PRODUCTION'
  },
  {
    id: 'REL-TEST-003',
    issueReference: 'ISS-MR-2026-102-5678',
    requestId: 'mr-sample-002',
    requestNo: 'MR-2026-102',
    workOrderNo: 'WO-2026-092',
    materialName: 'Industrial Accelerator B-4',
    quantityIssued: 50,
    unit: 'Kg',
    department: 'Chemical Processing',
    issuedBy: 'Store Officer',
    issuedAt: new Date().toISOString(),
    status: 'ISSUED_TO_PRODUCTION'
  }
];

recordMultipleReleaseTransactions(bulkTxs);
assert.strictEqual(releaseHistory.length, 5);
console.log('✓ Bulk release transactions recorded successfully.');

// Test 3: LocalStorage retrieval
const saved = JSON.parse(localStorage.getItem(STORE_RELEASE_HISTORY_KEY));
assert.strictEqual(saved.length, 5);
console.log('✓ LocalStorage persistence verified.');

// Test 4: Search & Filter functionality
function filterHistory(history, query, dept) {
  return history.filter(tx => {
    const q = (query || '').toLowerCase().trim();
    const matchesSearch = !q ||
      (tx.issueReference || '').toLowerCase().includes(q) ||
      (tx.materialName || '').toLowerCase().includes(q) ||
      (tx.workOrderNo || '').toLowerCase().includes(q) ||
      (tx.requestNo || '').toLowerCase().includes(q) ||
      (tx.department || '').toLowerCase().includes(q) ||
      (tx.issuedBy || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (dept && dept !== 'ALL' && tx.department !== dept) return false;
    return true;
  });
}

const chemicalResults = filterHistory(releaseHistory, '', 'Chemical Processing');
assert.strictEqual(chemicalResults.length, 2);
assert.strictEqual(chemicalResults[0].department, 'Chemical Processing');
console.log('✓ Department filter verified.');

const searchResults = filterHistory(releaseHistory, 'Epoxy', 'ALL');
assert.strictEqual(searchResults.length, 1);
assert.strictEqual(searchResults[0].materialName, 'Resin Epoxy Binder');
console.log('✓ Keyword search verified.');

console.log('All Store Releases Flow tests passed successfully!');
