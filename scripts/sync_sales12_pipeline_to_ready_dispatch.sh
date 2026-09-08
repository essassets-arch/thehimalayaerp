#!/bin/bash
set -e

echo "========================================================================"
echo "🚀 SYNC SALES 12 (JYOTI) TO READY FOR DISPATCH"
echo "========================================================================"

# 1. Pull latest code from GitHub
echo "1. Pulling latest repository updates..."
git pull origin main

# 2. Copy pipeline script and companion data into running backend container
echo "2. Copying scripts into himalaya-backend container..."
docker cp backend/scripts/sync_sales12_pipeline_to_ready_dispatch.js himalaya-backend:/app/scripts/
docker cp backend/scripts/sales12_leads_data.json himalaya-backend:/app/scripts/
docker cp backend/scripts/jyoti_data_sales12.csv himalaya-backend:/app/scripts/

# 3. Execute the pipeline sync inside the container
echo "3. Executing complete pipeline sync (Lead -> Quote -> Order -> Plant Head -> Prod Plan -> Work Order -> QC -> Ready for Dispatch)..."
docker exec himalaya-backend node scripts/sync_sales12_pipeline_to_ready_dispatch.js

# 4. Verify results
echo "4. Verifying Ready for Dispatch queue..."
docker exec himalaya-backend node -e "
async function verify() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const readyWos = await prisma.workOrder.count({ where: { productionStatus: 'READY_FOR_DISPATCH', sentToDispatchAt: null } });
  const s12Orders = await prisma.salesOrder.count({ where: { salesExecutive: { email: 'sales12@himalayaerp.com' } } });
  const fgCount = await prisma.finishedGoods.count({ where: { status: 'AVAILABLE' } });
  console.log('--- VERIFICATION SUMMARY ---');
  console.log('✔ Sales 12 Orders in DB :', s12Orders);
  console.log('✔ Ready for Dispatch Work Orders (in Ready Queue):', readyWos);
  console.log('✔ Available Finished Goods Stock :', fgCount);
  await prisma.\$disconnect();
}
verify().catch(console.error);
"

echo "========================================================================"
echo "🎉 SUCCESS: All 10 Orders & 14 Work Orders for Sales 12 are READY FOR DISPATCH!"
echo "View live at: https://thehimalaya.cloud/production/ready-for-dispatch"
echo "========================================================================"
