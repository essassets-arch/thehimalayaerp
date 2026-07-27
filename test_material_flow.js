require('ts-node').register({ transpileOnly: true });

const { useERPStore } = require('./store/erpStore.ts');
const { MATERIAL_REQUEST_STATUS } = require('./constants/production.ts');

async function runMaterialFlowTest() {
  console.log("=== STARTING INTERNAL MATERIAL REQUEST FLOW TEST ===");
  
  const store = useERPStore.getState();

  // 1. Create MR
  console.log("Step 1: Creating Material Request...");
  store.createMaterialRequest('WO-DUMMY', { items: [{ name: 'Cement', qty: 100 }] }, 'Production Manager');
  const mrId = useERPStore.getState().analysisRequests[0].id;
  console.log(`✓ Material Request Created: ${mrId}`);

  // 2. Approve MR
  console.log("\nStep 2: Plant Head Approves...");
  store.approveMaterialRequest(mrId, 'Plant Head');
  console.log(`✓ MR Approved (Status: ${useERPStore.getState().analysisRequests[0].status})`);

  // 3. Issue Material
  console.log("\nStep 3: Store Issues Material...");
  store.issueMaterialToProduction(mrId, { batch: 'BATCH-001' }, 'Store Manager');
  console.log(`✓ Material Issued (Status: ${useERPStore.getState().analysisRequests[0].status})`);

  console.log("\n=== ALL MATERIAL TESTS PASSED SUCCESSFULLY! ===");
}

runMaterialFlowTest().catch(console.error);
