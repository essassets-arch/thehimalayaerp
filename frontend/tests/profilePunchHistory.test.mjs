import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadPunchHistory, filterPunchHistory, countPunches } from '../lib/profilePunchHistory.mjs';

test('loads history beyond ten rows and follows the server page size', async () => {
  const records = Array.from({ length: 25 }, (_, id) => ({ id, punchInAt: '2026-09-24T04:00:00Z' }));
  const pages = [];
  const result = await loadPunchHistory({ get: async (path) => {
    const page = Number(new URL(path, 'https://example.test').searchParams.get('page'));
    pages.push(page);
    return { success: true, data: { data: records.slice((page - 1) * 10, page * 10), meta: { total: 25, page, limit: 10 } } };
  } });
  assert.deepEqual(result, records);
  assert.deepEqual(pages, [1, 2, 3]);
  assert.equal(countPunches(result).punchIns, 25);
});

test('supports unwrapped API responses and empty history', async () => {
  assert.deepEqual(await loadPunchHistory({ get: async () => ({ data: [], meta: { total: 0 } }) }), []);
});

test('failed later pages do not return misleading partial totals', async () => {
  let calls = 0;
  await assert.rejects(loadPunchHistory({ get: async () => ++calls === 1
    ? { data: [{ id: 1 }], meta: { total: 2 } }
    : { success: false, message: 'Request failed' }
  }), /Request failed/);
});

test('filters attendance dates in India and counts both punches on completed days', () => {
  const records = [
    { attendanceDate: '2026-09-23T18:30:00Z', punchInAt: '2026-09-24T04:00:00Z', punchOutAt: '2026-09-24T12:00:00Z' },
    { attendanceDate: '2026-09-01T00:00:00Z', punchInAt: '2026-09-01T04:00:00Z' },
    { attendanceDate: '2026-08-31T00:00:00Z', punchInAt: '2026-08-31T04:00:00Z' },
    { attendanceDate: '2025-12-31T00:00:00Z', punchInAt: '2025-12-31T04:00:00Z' },
  ];
  const now = new Date('2026-09-23T20:00:00Z');
  assert.deepEqual(countPunches(filterPunchHistory(records, 'today', now)), { total: 2, punchIns: 1, punchOuts: 1 });
  assert.equal(filterPunchHistory(records, 'monthly', now).length, 2);
  assert.equal(filterPunchHistory(records, 'yearly', now).length, 3);
  assert.equal(filterPunchHistory(records, 'all', now).length, 4);
  assert.deepEqual(countPunches([]), { total: 0, punchIns: 0, punchOuts: 0 });
});
