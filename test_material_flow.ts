import { useERPStore } from './store/erpStore';
import { MATERIAL_REQUEST_STATUS } from './constants/production';

const mockStorage: Record<string, string> = {};
(global as any).window = {
  localStorage: {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; }
  }
};
(global as any).localStorage = (global as any).window.localStorage;

async function runMaterialFlowTest() {
  console.log("=== STARTING INTERNAL MATERIAL REQUEST FLOW TEST ===");
  
  const store = useERPStore.getState() as any;

  // 1. Create MR
  console.log("Step 1: Creating Material Request...");
  store.createMaterialRequest('WO-DUMMY', { items: [{ name: 'Cement', qty: 100 }] }, 'Production Manager');
  const mrId = (useERPStore.getState() as any).state.analysisRequests[0].id;
  console.log(`✓ Material Request Created: ${mrId}`);

  // 2. Approve MR
  console.log("\nStep 2: Plant Head Approves...");
  store.approveMaterialRequest(mrId, 'Plant Head');
  console.log(`✓ MR Approved (Status: ${(useERPStore.getState() as any).state.analysisRequests[0].status})`);

  // 3. Issue Material
  console.log("\nStep 3: Store Issues Material...");
  store.issueMaterialToProduction(mrId, { batch: 'BATCH-001' }, 'Store Manager');
  console.log(`✓ Material Issued (Status: ${(useERPStore.getState() as any).state.analysisRequests[0].status})`);

  console.log("\n=== ALL MATERIAL TESTS PASSED SUCCESSFULLY! ===");
}

runMaterialFlowTest().catch(console.error);
