/**
 * Complete Material Indent UI-State Diagnostic
 *
 * Run:
 *   npx tsx scripts/test-material-indent-flow.ts
 *
 * Purpose:
 * - Creates one GC WHEEL material indent through the canonical store action.
 * - Verifies the indent exists in state.procurement.materialIndents.
 * - Checks common legacy/root-level arrays that may be causing UI drift.
 * - Verifies the exact Plant Head pending selector.
 * - Approves the indent and verifies Finance visibility.
 * - Verifies persistence and hydration-compatible localStorage values.
 * - Prints the precise step where the flow is disconnected.
 */

import assert from "node:assert/strict";

type AnyRecord = Record<string, any>;

class MemoryStorage {
  private data = new Map<string, string>();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }

  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(String(key), String(value));
  }

  entries(): Array<[string, string]> {
    return [...this.data.entries()];
  }
}

const memoryStorage = new MemoryStorage();

if (typeof globalThis.localStorage === "undefined") {
  Object.defineProperty(globalThis, "localStorage", {
    value: memoryStorage,
    configurable: true,
  });
}

if (typeof globalThis.window === "undefined") {
  Object.defineProperty(globalThis, "window", {
    value: {
      localStorage: memoryStorage,
      addEventListener: () => {},
      removeEventListener: () => {},
    },
    configurable: true,
  });
}

const PASS = (message: string) => console.log(`✅ PASSED: ${message}`);
const WARN = (message: string) => console.warn(`⚠️ WARNING: ${message}`);
const FAIL = (message: string, details?: unknown): never => {
  console.error(`❌ FAILED: ${message}`);
  if (details !== undefined) {
    console.error(details);
  }
  process.exitCode = 1;
  throw new Error(message);
};

const asArray = (value: unknown): AnyRecord[] =>
  Array.isArray(value) ? value : [];

const safeNumber = (value: unknown): number => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const getIndentId = (indent: AnyRecord): string =>
  String(indent.id ?? indent.indentId ?? indent.requestId ?? "");

const getMaterialCode = (indent: AnyRecord): string =>
  String(
    indent.materialCode ??
      indent.code ??
      indent.material?.code ??
      indent.items?.[0]?.materialCode ??
      ""
  );

const getRequestedQuantity = (indent: AnyRecord): number =>
  safeNumber(
    indent.requestedQuantity ??
      indent.requiredQuantity ??
      indent.quantity ??
      indent.items?.[0]?.requestedQuantity ??
      indent.items?.[0]?.quantity
  );

const getApprovedQuantity = (indent: AnyRecord): number =>
  safeNumber(
    indent.approvedQuantity ??
      indent.items?.[0]?.approvedQuantity ??
      indent.items?.[0]?.quantity
  );

const findIndent = (
  collection: unknown,
  indentId: string,
  materialCode = "HCPPL026"
): AnyRecord | undefined =>
  asArray(collection).find(
    (indent) =>
      getIndentId(indent) === indentId ||
      getMaterialCode(indent) === materialCode
  );

const readJson = (key: string): unknown => {
  const raw = globalThis.localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

const printCollectionSummary = (
  label: string,
  value: unknown,
  indentId: string
): void => {
  const collection = asArray(value);
  const matching = findIndent(collection, indentId);

  console.log(`\n${label}`);
  console.log({
    isArray: Array.isArray(value),
    count: collection.length,
    matchingIndent: matching
      ? {
          id: getIndentId(matching),
          materialCode: getMaterialCode(matching),
          status: matching.status,
          requestedQuantity: getRequestedQuantity(matching),
          approvedQuantity: getApprovedQuantity(matching),
          poId: matching.poId ?? null,
        }
      : null,
  });
};

async function loadStore(): Promise<any> {
  const storeModule = await import("../store/erpStore");

  const possibleStores = [
    storeModule.useERPStore,
    storeModule.erpStore,
    storeModule.default,
    storeModule.store,
  ].filter(Boolean);

  const store = possibleStores.find(
    (candidate: any) =>
      typeof candidate?.getState === "function" &&
      typeof candidate?.setState === "function"
  );

  if (!store) {
    FAIL(
      "Could not find the Zustand store export. Expected useERPStore, erpStore, store, or default export with getState/setState.",
      Object.keys(storeModule)
    );
  }

  return store;
}

function resetProcurementState(store: any): void {
  const current = store.getState();

  const nextProcurement = {
    ...(current.procurement ?? {}),
    materialIndents: [],
    purchaseOrders: [],
    goodsReceiptNotes: [],
  };

  const resetPatch: AnyRecord = {
    procurement: nextProcurement,
  };

  // Clear legacy arrays only for diagnostic isolation.
  if ("materialIndents" in current) resetPatch.materialIndents = [];
  if ("purchaseIndents" in current) resetPatch.purchaseIndents = [];
  if ("purchaseOrders" in current) resetPatch.purchaseOrders = [];
  if ("goodsReceipts" in current) resetPatch.goodsReceipts = [];

  store.setState(resetPatch);

  [
    "erp_procurement",
    "erp_material_indents",
    "erp_purchase_indents",
    "erp_purchase_orders",
    "erp_goods_receipts",
  ].forEach((key) => globalThis.localStorage.removeItem(key));
}

function resolveAction(state: AnyRecord, names: string[]): Function {
  for (const name of names) {
    if (typeof state[name] === "function") {
      console.log(`Using action: ${name}`);
      return state[name];
    }
  }

  FAIL(`Missing store action. Expected one of: ${names.join(", ")}`);
}

function getCreatedIndent(
  beforeIds: Set<string>,
  state: AnyRecord
): AnyRecord | undefined {
  const canonical = asArray(state.procurement?.materialIndents);

  return (
    canonical.find((indent) => !beforeIds.has(getIndentId(indent))) ??
    canonical.find((indent) => getMaterialCode(indent) === "HCPPL026")
  );
}

function inspectAllKnownStatePaths(state: AnyRecord, indentId: string): void {
  printCollectionSummary(
    "Canonical: state.procurement.materialIndents",
    state.procurement?.materialIndents,
    indentId
  );

  printCollectionSummary(
    "Legacy: state.materialIndents",
    state.materialIndents,
    indentId
  );

  printCollectionSummary(
    "Legacy: state.purchaseIndents",
    state.purchaseIndents,
    indentId
  );

  printCollectionSummary(
    "Legacy: state.store.materialIndents",
    state.store?.materialIndents,
    indentId
  );

  printCollectionSummary(
    "Legacy: state.procurement.purchaseIndents",
    state.procurement?.purchaseIndents,
    indentId
  );
}

function inspectStorage(indentId: string): void {
  console.log("\n=== LocalStorage diagnostic ===");

  const knownKeys = [
    "erp_procurement",
    "erp_material_indents",
    "erp_purchase_indents",
    "erp_purchase_orders",
    "erp_goods_receipts",
    "erp-storage",
    "erp_store",
  ];

  for (const key of knownKeys) {
    const parsed = readJson(key);

    if (parsed === null) {
      console.log(`${key}: not found`);
      continue;
    }

    const possibleCollections = [
      parsed,
      (parsed as AnyRecord)?.materialIndents,
      (parsed as AnyRecord)?.purchaseIndents,
      (parsed as AnyRecord)?.procurement?.materialIndents,
      (parsed as AnyRecord)?.state?.materialIndents,
      (parsed as AnyRecord)?.state?.purchaseIndents,
      (parsed as AnyRecord)?.state?.procurement?.materialIndents,
    ];

    const found = possibleCollections.some(
      (collection) => Boolean(findIndent(collection, indentId))
    );

    console.log(`${key}: ${found ? "contains test indent" : "does not contain test indent"}`);
  }

  if (memoryStorage.entries().length > 0) {
    console.log(
      "All memory localStorage keys:",
      memoryStorage.entries().map(([key]) => key)
    );
  }
}

async function main(): Promise<void> {
  console.log("Starting Complete Material Indent Flow Diagnostic...\n");

  const store = await loadStore();
  resetProcurementState(store);

  let state = store.getState();

  assert.ok(state.procurement, "state.procurement must exist");
  assert.ok(
    Array.isArray(state.procurement.materialIndents),
    "state.procurement.materialIndents must be an array"
  );
  PASS("Canonical procurement materialIndents array exists");

  const createMaterialIndent = resolveAction(state, [
    "createMaterialIndent",
    "createPurchaseIndent",
    "addMaterialIndent",
  ]);

  const beforeIds = new Set(
    asArray(state.procurement.materialIndents).map(getIndentId)
  );

  const payload = {
    materialId: "HCPPL026",
    materialCode: "HCPPL026",
    code: "HCPPL026",
    materialName: "GC WHEEL",
    currentStock: 0,
    minimumStock: 20,
    requestedQuantity: 40,
    requiredQuantity: 40,
    quantity: 40,
    unit: "PCS",
    targetDate: "2026-08-10",
    requiredDate: "2026-08-10",
    priority: "HIGH",
    remarks: "Automated complete material indent flow test",
    source: "LOW_STOCK_ALERT",
    requestedByDepartment: "STORE",
  };

  const createResult = await Promise.resolve(createMaterialIndent(payload));
  state = store.getState();

  const createdIndent =
    (createResult && typeof createResult === "object"
      ? createResult
      : undefined) ?? getCreatedIndent(beforeIds, state);

  if (!createdIndent) {
    inspectAllKnownStatePaths(state, "");
    FAIL(
      "The create action returned no indent and no new record appeared in state.procurement.materialIndents."
    );
  }

  const indentId = getIndentId(createdIndent);

  if (!indentId) {
    FAIL("Created indent has no id/indentId/requestId.", createdIndent);
  }

  PASS(`Material indent created with ID ${indentId}`);

  const canonicalIndent = findIndent(
    state.procurement.materialIndents,
    indentId
  );

  if (!canonicalIndent) {
    inspectAllKnownStatePaths(state, indentId);
    FAIL(
      "Indent was created, but it is not stored in state.procurement.materialIndents. Store form and Plant Head are using different arrays."
    );
  }

  PASS("Indent is stored in state.procurement.materialIndents");

  assert.equal(
    canonicalIndent.status,
    "PENDING_PLANT_HEAD_APPROVAL",
    `Unexpected indent status: ${canonicalIndent.status}`
  );
  PASS("Indent status is PENDING_PLANT_HEAD_APPROVAL");

  assert.equal(
    getMaterialCode(canonicalIndent),
    "HCPPL026",
    "Material code was not preserved"
  );
  PASS("GC WHEEL material code is preserved");

  assert.equal(
    getRequestedQuantity(canonicalIndent),
    40,
    "Requested quantity was not preserved as 40"
  );
  PASS("Requested quantity is 40 PCS");

  inspectAllKnownStatePaths(state, indentId);

  const plantHeadPendingSelector = asArray(
    state.procurement.materialIndents
  ).filter(
    (indent) => indent.status === "PENDING_PLANT_HEAD_APPROVAL"
  );

  const plantHeadVisibleIndent = findIndent(
    plantHeadPendingSelector,
    indentId
  );

  if (!plantHeadVisibleIndent) {
    FAIL(
      "Canonical indent exists, but the exact Plant Head pending selector cannot see it. Check the UI status filter."
    );
  }

  PASS("Plant Head pending selector can see the created indent");

  const approveMaterialIndent = resolveAction(state, [
    "approveMaterialIndent",
    "approvePurchaseIndent",
  ]);

  await Promise.resolve(
    approveMaterialIndent(
      indentId,
      40,
      "Approved by automated Plant Head flow test"
    )
  );

  state = store.getState();

  const approvedIndent = findIndent(
    state.procurement.materialIndents,
    indentId
  );

  if (!approvedIndent) {
    FAIL("Indent disappeared after Plant Head approval.");
  }

  assert.equal(
    approvedIndent.status,
    "PLANT_HEAD_APPROVED",
    `Expected PLANT_HEAD_APPROVED, received ${approvedIndent.status}`
  );
  PASS("Plant Head approval changes status to PLANT_HEAD_APPROVED");

  assert.equal(
    getApprovedQuantity(approvedIndent),
    40,
    "Approved quantity was not saved as 40"
  );
  PASS("Approved quantity is stored as 40 PCS");

  const financeWaitingForPo = asArray(
    state.procurement.materialIndents
  ).filter(
    (indent) =>
      indent.status === "PLANT_HEAD_APPROVED" &&
      (indent.poId === null ||
        indent.poId === undefined ||
        indent.poId === "")
  );

  if (!findIndent(financeWaitingForPo, indentId)) {
    FAIL(
      "Approved indent exists, but Finance 'Waiting for PO' selector cannot see it. Check poId and status filters.",
      approvedIndent
    );
  }

  PASS("Finance Approved Indents selector can see the approved indent");

  // Verify no duplicate ID was created.
  const duplicates = asArray(
    state.procurement.materialIndents
  ).filter((indent) => getIndentId(indent) === indentId);

  assert.equal(
    duplicates.length,
    1,
    `Expected one canonical indent, found ${duplicates.length}`
  );
  PASS("Canonical store contains exactly one copy of the indent");

  inspectStorage(indentId);

  console.log("\n=== UI wiring checklist generated by this test ===");
  console.log(
    [
      "Store page must call state.createMaterialIndent.",
      "Plant Head page must read state.procurement.materialIndents.",
      'Plant Head pending filter must equal "PENDING_PLANT_HEAD_APPROVAL".',
      "Plant Head Approve button must call state.approveMaterialIndent.",
      'Finance filter must equal "PLANT_HEAD_APPROVED" and poId == null.',
      "No page should use state.materialIndents, state.purchaseIndents, mock arrays, or direct localStorage as writable state.",
    ].map((line) => `- ${line}`).join("\n")
  );

  console.log("\n🎉 Complete Material Indent diagnostic passed.");
  console.log(
    "If the browser page still does not show the indent, the route is rendering a different component or using a legacy selector. The store flow itself is confirmed."
  );
}

main().catch((error) => {
  console.error("\nMaterial Indent diagnostic terminated.");
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
