// Execute the actual loader with isolated API responses; no application API is called.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');

const filename = path.resolve(__dirname, '../modules/store/pages/StorePortal.jsx');
const source = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JSX);
let callback;
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'fetchRawInventory') callback = node.initializer.arguments[0].getText(source);
  ts.forEachChild(node, visit);
}
visit(source);
assert(callback, 'Store inventory callback exists');

const pending = [];
const state = { data: [], loading: false, error: null };
const load = vm.runInNewContext(`(${callback})`, {
  rawInventoryRequest: { current: 0 },
  apiClient: { get: () => new Promise((resolve, reject) => pending.push({ resolve, reject })) },
  setDbRawInventory: data => { state.data = data; },
  setLoadingRawInventory: loading => { state.loading = loading; },
  setRawInventoryError: error => { state.error = error; },
});
const response = id => ({ data: [{ id, name: id, quantity: 10, stockStatus: 'IN_STOCK' }] });

(async () => {
  const success = load();
  assert.equal(state.loading, true);
  pending.shift().resolve(response('first'));
  await success;
  assert.equal(state.data[0].id, 'first');
  assert.equal(state.loading, false);

  const failure = load();
  pending.shift().reject(new Error('API unavailable'));
  await failure;
  assert.equal(state.data.length, 0);
  assert.match(state.error, /Unable to load/);
  assert.equal(state.loading, false);

  const old = load();
  const oldRequest = pending.shift();
  const latest = load();
  const latestRequest = pending.shift();
  oldRequest.resolve(response('stale'));
  await old;
  assert.equal(state.loading, true, 'Old response must not end latest loading state');
  assert.equal(state.data.length, 0, 'Old response must not set data');
  latestRequest.resolve(response('latest'));
  await latest;
  assert.equal(state.data[0].id, 'latest');
  assert.equal(state.loading, false);

  const staleFailure = load();
  const staleRequest = pending.shift();
  const newer = load();
  pending.shift().resolve(response('newer'));
  await newer;
  staleRequest.reject(new Error('Stale API error'));
  await staleFailure;
  assert.equal(state.data[0].id, 'newer');
  assert.equal(state.error, null);
  console.log('PASS: Store loader success, failure, overlapping refreshes and stale errors.');
})().catch(error => { console.error(error); process.exitCode = 1; });
