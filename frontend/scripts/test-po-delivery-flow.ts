import assert from "node:assert/strict";
import { PrismaClient } from '@prisma/client';

// Mock localStorage and window for Node environment
class MemoryStorage {
  private data = new Map<string, string>();
  get length(): number { return this.data.size; }
  clear(): void { this.data.clear(); }
  getItem(key: string): string | null { return this.data.has(key) ? this.data.get(key)! : null; }
  key(index: number): string | null { return [...this.data.keys()][index] ?? null; }
  removeItem(key: string): void { this.data.delete(key); }
  setItem(key: string, value: string): void { this.data.set(String(key), String(value)); }
}
const memoryStorage = new MemoryStorage();
const sessionStorageMock = new MemoryStorage();
if (typeof globalThis.localStorage === "undefined") {
  Object.defineProperty(globalThis, "localStorage", { value: memoryStorage, configurable: true });
}
if (typeof globalThis.sessionStorage === "undefined") {
  Object.defineProperty(globalThis, "sessionStorage", { value: sessionStorageMock, configurable: true });
}
if (typeof globalThis.window === "undefined") {
  Object.defineProperty(globalThis, "window", {
    value: { 
      localStorage: memoryStorage, 
      sessionStorage: sessionStorageMock, 
      addEventListener: () => {}, 
      removeEventListener: () => {} 
    },
    configurable: true
  });
}

const originalFetch = globalThis.fetch;
globalThis.fetch = function (input: any, init: any) {
  if (typeof input === 'string' && input.startsWith('/')) {
    input = `http://localhost:3000${input}`;
  }
  return originalFetch(input, init);
} as any;

import { useERPStore } from '../store/erpStore';
import {
  createMaterialIndent,
  approveMaterialIndent,
  createPurchaseOrder,
  submitPurchaseOrder,
  approvePurchaseOrder,
  issuePurchaseOrder,
  verifyPODelivery
} from '../store/procurementActions';

const PASS = (msg: string) => console.log(`✅ PASSED: ${msg}`);

async function main() {
  console.log("Starting E2E PO and Store Delivery Verification...");

  const prisma = new PrismaClient();
  
  // Query first valid product, supplier and warehouse
  const firstProduct = await prisma.product.findFirst();
  if (!firstProduct) throw new Error("No products found in the database!");
  const materialId = firstProduct.id;
  const materialName = firstProduct.name;
  console.log(`Using database product: ${materialName} (${materialId})`);

  const firstSupplier = await prisma.supplier.findFirst();
  if (!firstSupplier) throw new Error("No suppliers found in the database!");
  const supplierId = firstSupplier.id;
  console.log(`Using database supplier: ${firstSupplier.name} (${supplierId})`);

  const firstWarehouse = await prisma.warehouse.findFirst();
  if (!firstWarehouse) throw new Error("No warehouses found in the database!");
  const warehouseId = firstWarehouse.id;
  console.log(`Using database warehouse: ${firstWarehouse.name} (${warehouseId})`);
  
  // 1. Create indent
  console.log("Step 1: Creating material indent...");
  const indentPayload = {
    materialId: materialId,
    materialCode: firstProduct.sku || 'SKU-001',
    materialName: materialName,
    currentStock: 5,
    minimumStock: 20,
    requestedQuantity: 50,
    unit: firstProduct.unit || 'PCS',
    targetDate: "2026-08-15",
    priority: "NORMAL",
    remarks: "E2E PO Delivery verification test",
    source: "LOW_STOCK_ALERT",
    requestedByDepartment: "STORE"
  };
  const indent = await createMaterialIndent(indentPayload, "Store Manager");
  const indentId = indent.id || indent.publicId;
  assert.ok(indentId, "Indent creation should return a valid ID");
  PASS(`Indent created successfully: ${indentId} in status: ${indent.status}`);

  // Check the actual current status in DB before approve
  const currentIndent = await prisma.purchaseIndent.findUnique({ where: { id: indentId } });
  console.log(`   Indent DB status after create+submit: ${currentIndent?.status}`);

  // 2. Approve indent
  console.log("Step 2: Approving indent by Plant Head...");
  const approvedItems = [
    { productId: materialId, approvedQuantity: 50, quantity: 50 }
  ];
  const approvedIndent = await approveMaterialIndent(indentId, approvedItems, "Approved in full", "Plant Head");
  assert.equal(approvedIndent.status, "PLANT_HEAD_APPROVED");
  PASS(`Indent approved by Plant Head. Status: ${approvedIndent.status}`);

  // 3. Create PO from approved indent
  console.log("Step 3: Creating Purchase Order from Indent...");
  const poData = {
    supplierId: supplierId,
    totalAmount: 10000,
    items: [
      { productId: materialId, quantity: 50, unitPrice: 200, discountPercent: 0, gstPercent: 18 }
    ]
  };

  const po = await createPurchaseOrder(indentId, poData, "Finance");
  const poId = po.id || po.publicId;
  assert.ok(poId, "PO creation should return a valid ID");
  assert.equal(po.status, "DRAFT");
  PASS(`PO created in draft. ID: ${poId}`);

  // 4. Submit PO
  console.log("Step 4: Submitting Purchase Order to Super Admin...");
  const submittedPO = await submitPurchaseOrder(poId, "Finance");
  assert.equal(submittedPO.status, "PENDING_SUPER_ADMIN_APPROVAL");
  PASS(`PO submitted for approval. Status: ${submittedPO.status}`);

  // 5. Approve PO by Super Admin
  console.log("Step 5: Approving PO by Super Admin...");
  const approvedPO = await approvePurchaseOrder(poId, "Approved by Super Admin E2E test", "Super Admin");
  assert.equal(approvedPO.status, "SUPER_ADMIN_APPROVED");
  PASS(`PO approved by Super Admin. Status: ${approvedPO.status}`);

  // 6. Issue PO by Finance
  console.log("Step 6: Issuing PO by Finance...");
  const issuedPO = await issuePurchaseOrder(poId, "Finance");
  assert.ok(issuedPO.poNumber, "Issued PO should have a final PO number generated");
  assert.equal(issuedPO.status, "PO_ISSUED");
  PASS(`PO officially issued. PO Number: ${issuedPO.poNumber}, Status: ${issuedPO.status}`);

  // 7. Verify delivery in Store
  console.log("Step 7: Verifying delivery and generating GRN...");
  const grnPayload = {
    warehouseId: warehouseId,
    deliveryDate: new Date().toISOString(),
    challanNo: "DC-E2E-99",
    vendorInvoiceNo: "INV-E2E-99",
    remarks: "Received and inspected E2E delivery",
    items: [
      { productId: materialId, deliveredQty: 50, acceptedQty: 50, rejectedQty: 0, inspectionRemarks: "Inspected ok" }
    ]
  };
  const verifyResult = await verifyPODelivery(poId, grnPayload, "Store Operator");
  assert.equal(verifyResult.purchaseOrderStatus, "RECEIVED");
  assert.equal(verifyResult.delivery.status, "FINANCE_AUDIT_APPROVED");
  PASS(`Delivery verified successfully! PO status changed to ${verifyResult.purchaseOrderStatus}. GRN posted: ${verifyResult.delivery.grnNumber}`);

  await prisma.$disconnect();
  console.log("\n🎉 ALL E2E PO AND STORE DELIVERY FLOW TESTS PASSED SUCCESSFULLY!");
}

main().catch(err => {
  console.error("❌ E2E PO Delivery verification failed:", err);
  if (err && typeof err === 'object') {
    console.error("Status:", err.status);
    console.error("Code:", err.code);
    console.error("Details:", JSON.stringify(err.details, null, 2));
    if (err.cause) console.error("Cause:", err.cause);
  }
  process.exit(1);
});
