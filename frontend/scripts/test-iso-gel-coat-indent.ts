/**
 * ISO GEL-COAT (HCPPL102) Material Indent Diagnostic Test
 *
 * Run with:
 *   npx tsx scripts/test-iso-gel-coat-indent.ts
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

const PASS = (msg: string) => console.log(`✅ PASSED: ${msg}`);
const FAIL = (msg: string, details?: unknown): never => {
  console.error(`❌ FAILED: ${msg}`);
  if (details !== undefined) console.error(details);
  process.exit(1);
};

const asArray = (val: unknown): AnyRecord[] => (Array.isArray(val) ? val : []);

async function main() {
  console.log("=== ISO GEL-COAT (HCPPL102) Material Indent Test ===\n");

  const storeModule = await import("../store/erpStore");
  const store = storeModule.useERPStore;
  let state = store.getState();

  // 1. Create ISO GEL-COAT Material Indent
  console.log("Step 1: Submitting Material Indent for ISO GEL-COAT (HCPPL102)...");

  const createMaterialIndent = state.createMaterialIndent;
  assert.equal(typeof createMaterialIndent, "function", "createMaterialIndent must be a function");

  const payload = {
    materialId: "HCPPL102",
    materialCode: "HCPPL102",
    materialName: "ISO GEL-COAT",
    currentStock: 0,
    minimumStock: 0,
    requiredQuantity: 10,
    quantity: 10,
    unit: "BARREL",
    targetDate: "2026-08-15",
    priority: "HIGH",
    remarks: "Out of Stock alert purchase indent request",
    source: "LOW_STOCK_ALERT",
    requestedByDepartment: "STORE",
  };

  const createdIndent = await Promise.resolve(createMaterialIndent(payload));
  state = store.getState();

  const allIndents = asArray(state.procurement?.materialIndents);
  const foundIndent = allIndents.find(
    (i) => i.materialCode === "HCPPL102" || i.materialId === "HCPPL102"
  );

  if (!foundIndent) {
    FAIL("ISO GEL-COAT indent was not found in state.procurement.materialIndents", {
      totalIndents: allIndents.length,
    });
  }

  PASS(`ISO GEL-COAT Indent created with ID: ${foundIndent.id}`);
  assert.equal(foundIndent.materialName, "ISO GEL-COAT", "Material name must match");
  assert.equal(foundIndent.materialCode, "HCPPL102", "Material code must match");
  assert.equal(foundIndent.unit, "BARREL", "Unit must be BARREL");
  assert.equal(foundIndent.requiredQuantity, 10, "Required quantity must be 10");
  assert.equal(foundIndent.status, "PENDING_PLANT_HEAD_APPROVAL", "Initial status must be PENDING_PLANT_HEAD_APPROVAL");
  PASS("Indent properties (Code: HCPPL102, Name: ISO GEL-COAT, Unit: BARREL, Qty: 10) verified");

  // 2. Test Plant Head Selector Visibility
  console.log("\nStep 2: Testing Plant Head Portal Selector...");
  const plantHeadPendingList = allIndents.filter(
    (i) =>
      i.status === "PENDING_PLANT_HEAD_APPROVAL" ||
      i.status === "PENDING_PLANT_HEAD" ||
      i.status === "PENDING"
  );

  const visibleToPlantHead = plantHeadPendingList.find((i) => i.id === foundIndent.id);
  if (!visibleToPlantHead) {
    FAIL("Plant Head selector failed to list ISO GEL-COAT indent", {
      pendingCount: plantHeadPendingList.length,
    });
  }
  PASS(`Plant Head page sees ISO GEL-COAT indent (${foundIndent.id}) in Pending list`);

  // 3. Test Plant Head Approval Action
  console.log("\nStep 3: Approving Indent by Plant Head...");
  const approveAction = state.approveMaterialIndent;
  assert.equal(typeof approveAction, "function", "approveMaterialIndent must be a function");

  await Promise.resolve(approveAction(foundIndent.id, 10, "Approved 10 BARREL ISO GEL-COAT"));
  state = store.getState();

  const updatedIndents = asArray(state.procurement?.materialIndents);
  const approvedIndent = updatedIndents.find((i) => i.id === foundIndent.id);

  if (!approvedIndent) {
    FAIL("Indent disappeared after approval");
  }

  assert.equal(approvedIndent.status, "PLANT_HEAD_APPROVED", "Status must be PLANT_HEAD_APPROVED after approval");
  assert.equal(approvedIndent.approvedQuantity, 10, "Approved quantity must be set to 10");
  PASS(`Plant Head approved ISO GEL-COAT indent (${foundIndent.id}). Status: PLANT_HEAD_APPROVED`);

  // 4. Test Finance Visibility
  console.log("\nStep 4: Testing Finance Portal Approval-to-PO List...");
  const financeApprovedList = updatedIndents.filter(
    (i) =>
      i.status === "PLANT_HEAD_APPROVED" &&
      (!i.poId || i.poId === "")
  );

  const visibleToFinance = financeApprovedList.find((i) => i.id === foundIndent.id);
  if (!visibleToFinance) {
    FAIL("Approved ISO GEL-COAT indent is not visible in Finance PO creation list");
  }
  PASS("Finance portal sees approved ISO GEL-COAT indent ready for Draft PO creation");

  console.log("\n🎉 All tests for ISO GEL-COAT (HCPPL102) Material Indent flow passed!");
}

main().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
