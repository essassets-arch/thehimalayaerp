const assert = require('assert');

// Test 1: Verify status categorization and filtering logic
console.log('=== TEST 1: Status Classification Logic ===');

const testRequests = [
  { id: '1', requestNo: 'MR-001', status: 'PLANT_HEAD_APPROVED', items: [{ materialName: 'Cement', approvedQty: 10 }] },
  { id: '2', requestNo: 'MR-002', status: 'STORE_APPROVED', items: [{ materialName: 'Sand', approvedQty: 20 }] },
  { id: '3', requestNo: 'MR-003', status: 'STORE_REJECTED', items: [{ materialName: 'Iron', approvedQty: 5 }], storeRejectionRemarks: 'Stock unavailable' },
  { id: '4', requestNo: 'MR-004', status: 'PENDING_PLANT_HEAD_APPROVAL', items: [{ materialName: 'Wood', approvedQty: 15 }] },
  { id: '5', requestNo: 'MR-005', status: 'ISSUED_TO_PRODUCTION', items: [{ materialName: 'Resin', approvedQty: 30 }] },
  { id: '6', requestNo: 'MR-006', status: 'DRAFT', items: [{ materialName: 'Nails', approvedQty: 100 }] },
  { id: '7', requestNo: 'MR-007', status: 'PLANT_HEAD_REJECTED', items: [{ materialName: 'Glue', approvedQty: 5 }] },
];

// Pending classification:
const pending = testRequests.filter(req => {
  const isProcessed = req.status === 'STORE_APPROVED' || req.status === 'STORE_REJECTED' ||
    req.status === 'ISSUED_TO_PRODUCTION' || req.status === 'RECEIVED' || req.status === 'CONSUMING' || req.status === 'CLOSED';
  if (isProcessed) return false;
  return req.status === 'PLANT_HEAD_APPROVED' || req.status === 'PENDING_STORE_APPROVAL' || req.status === 'APPROVED';
});

assert.equal(pending.length, 1, 'Only PLANT_HEAD_APPROVED should be pending store verification');
assert.equal(pending[0].requestNo, 'MR-001', 'Pending item must be MR-001');
console.log('✓ Pending queue correctly contains only Plant Head approved requests awaiting Store action.');

// History classification:
const history = testRequests.filter(req => {
  const status = req.status;
  return (
    status === 'STORE_APPROVED' ||
    status === 'STORE_REJECTED' ||
    status === 'ISSUED_TO_PRODUCTION' ||
    status === 'RECEIVED' ||
    status === 'CONSUMING' ||
    status === 'RETURN_PENDING' ||
    status === 'RETURNED' ||
    status === 'CLOSED' ||
    status === 'PLANT_HEAD_REJECTED' ||
    status === 'REJECTED'
  );
});

assert.equal(history.length, 4, 'History must contain STORE_APPROVED, STORE_REJECTED, ISSUED_TO_PRODUCTION, PLANT_HEAD_REJECTED');
assert.ok(!history.some(r => r.status === 'PENDING_PLANT_HEAD_APPROVAL'), 'Pending plant head approval must not appear in history');
assert.ok(!history.some(r => r.status === 'DRAFT'), 'Draft must not appear in history');
assert.ok(!history.some(r => r.status === 'PLANT_HEAD_APPROVED'), 'Pending Store verification must not appear in history');
console.log('✓ History queue correctly contains all approved and rejected requests, excluding pending/drafts.');

// Test 2: Sub-filtering
console.log('\n=== TEST 2: History Sub-Filters ===');
const approvedHistory = history.filter(r =>
  r.status === 'STORE_APPROVED' ||
  r.status === 'ISSUED_TO_PRODUCTION' ||
  r.status === 'RECEIVED' ||
  r.status === 'CONSUMING' ||
  r.status === 'CLOSED' ||
  r.status === 'APPROVED'
);
const rejectedHistory = history.filter(r =>
  r.status === 'STORE_REJECTED' ||
  r.status === 'PLANT_HEAD_REJECTED' ||
  r.status === 'REJECTED'
);

assert.equal(approvedHistory.length, 2, 'Approved history should have MR-002 and MR-005');
assert.equal(rejectedHistory.length, 2, 'Rejected history should have MR-003 and MR-007');
console.log(`✓ History sub-filters work: ${approvedHistory.length} approved, ${rejectedHistory.length} rejected.`);

// Test 3: Simulation of Store Approval and Store Rejection Transition
console.log('\n=== TEST 3: State Transition from Pending to History ===');

let currentRequests = [...testRequests];
const localHistory = {};

function simulateApprove(reqId, approver) {
  const target = currentRequests.find(r => r.id === reqId);
  if (!target) throw new Error('Not found');
  const now = new Date().toISOString();
  localHistory[reqId] = {
    status: 'STORE_APPROVED',
    storeApprovedBy: approver,
    storeApprovedAt: now
  };
  // Merge
  currentRequests = currentRequests.map(r => r.id === reqId ? { ...r, ...localHistory[reqId] } : r);
}

function simulateReject(reqId, rejector, remarks) {
  const target = currentRequests.find(r => r.id === reqId);
  if (!target) throw new Error('Not found');
  const now = new Date().toISOString();
  localHistory[reqId] = {
    status: 'STORE_REJECTED',
    storeRejectedBy: rejector,
    storeRejectionRemarks: remarks,
    storeRejectedAt: now
  };
  // Merge
  currentRequests = currentRequests.map(r => r.id === reqId ? { ...r, ...localHistory[reqId] } : r);
}

// Approve MR-001
simulateApprove('1', 'Store Manager (Karan)');
const pendingAfterApprove = currentRequests.filter(req => {
  const isProcessed = req.status === 'STORE_APPROVED' || req.status === 'STORE_REJECTED';
  if (isProcessed) return false;
  return req.status === 'PLANT_HEAD_APPROVED';
});
const historyAfterApprove = currentRequests.filter(req => {
  return req.status === 'STORE_APPROVED' || req.status === 'STORE_REJECTED' || req.status === 'ISSUED_TO_PRODUCTION' || req.status === 'PLANT_HEAD_REJECTED';
});

assert.equal(pendingAfterApprove.length, 0, 'MR-001 must no longer be in Pending');
const newlyApproved = historyAfterApprove.find(r => r.id === '1');
assert.ok(newlyApproved, 'MR-001 must now be in History');
assert.equal(newlyApproved.status, 'STORE_APPROVED');
assert.equal(newlyApproved.storeApprovedBy, 'Store Manager (Karan)');
console.log('✓ Approve action moved request from Pending into History (Approved & Rejected) with approver details.');

console.log('\n=== ALL SIMULATION TESTS PASSED ===');
