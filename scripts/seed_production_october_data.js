const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('--- Starting October 2026 Production Seeding in PostgreSQL ---');

  // 1. Get or create Company
  let company = await prisma.company.findFirst({
    where: { name: { contains: 'Himalaya' } }
  });
  if (!company) {
    company = await prisma.company.create({
      data: {
        publicId: 'COMP-HIMALAYA-FRP',
        name: 'Himalaya FRP & Construction Products'
      }
    });
  } else {
    company = await prisma.company.update({
      where: { id: company.id },
      data: { name: 'Himalaya FRP & Construction Products' }
    });
  }
  console.log('Company:', company.name, company.id);

  // 2. Get or create Plant Head User
  let plantHeadUser = await prisma.user.findFirst({
    where: { email: 'plant.head@himalayaerp.com' }
  });
  if (!plantHeadUser) {
    const defaultRole = await prisma.role.findFirst({ where: { code: 'PLANT_HEAD' } });
    plantHeadUser = await prisma.user.create({
      data: {
        email: 'plant.head@himalayaerp.com',
        name: 'Plant Head',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuv',
        roleId: defaultRole?.id || (await prisma.role.findFirst()).id,
        companyId: company.id
      }
    });
  }
  console.log('Plant Head User:', plantHeadUser.name, plantHeadUser.id);

  // 3. Customers
  const customerData = [
    { code: 'CUST-ABC', name: 'ABC Infra', contact: 'Rajesh Sharma' },
    { code: 'CUST-XYZ', name: 'XYZ Builders', contact: 'Vikas Gupta' },
    { code: 'CUST-METRO', name: 'Metro Corp', contact: 'Anil Verma' },
    { code: 'CUST-GREENTECH', name: 'Green Tech', contact: 'Sunil Patil' },
    { code: 'CUST-SUMMIT', name: 'Summit Infra', contact: 'Pooja Mehta' },
    { code: 'CUST-SUNRISE', name: 'Sunrise Ltd', contact: 'Alok Roy' }
  ];

  const customers = {};
  for (const c of customerData) {
    let cust = await prisma.customer.findFirst({
      where: { companyName: c.name }
    });
    if (!cust) {
      cust = await prisma.customer.create({
        data: {
          customerCode: c.code,
          companyName: c.name,
          contactPerson: c.contact,
          companyId: company.id,
          status: 'ACTIVE'
        }
      });
    }
    customers[c.name] = cust;
  }
  console.log('Customers verified:', Object.keys(customers).length);

  // 4. Products with exact Product Master composition
  const productDefinitions = [
    {
      sku: 'PRD-600-600-40T',
      name: '600×600 Cover + Frame (40T)',
      size: '600×600',
      capacity: '40T',
      weight: 80,
      coverUnitWeight: 45,
      frameUnitWeight: 35,
      coversPerSet: 1,
      framesPerSet: 1,
      componentType: 'SET'
    },
    {
      sku: 'PRD-450-450-25T-FRM',
      name: '450×450 Frame (25T)',
      size: '450×450',
      capacity: '25T',
      weight: 22,
      coverUnitWeight: 0,
      frameUnitWeight: 22,
      coversPerSet: 0,
      framesPerSet: 1,
      componentType: 'FRAME'
    },
    {
      sku: 'PRD-600-600-40T-COV',
      name: '600×600 Cover (40T)',
      size: '600×600',
      capacity: '40T',
      weight: 45,
      coverUnitWeight: 45,
      frameUnitWeight: 0,
      coversPerSet: 1,
      framesPerSet: 0,
      componentType: 'COVER'
    },
    {
      sku: 'PRD-300-300-125T-FRM',
      name: '300×300 Frame (12.5T)',
      size: '300×300',
      capacity: '12.5T',
      weight: 14,
      coverUnitWeight: 0,
      frameUnitWeight: 14,
      coversPerSet: 0,
      framesPerSet: 1,
      componentType: 'FRAME'
    },
    {
      sku: 'PRD-1000-1000-50T',
      name: '1000×1000 Cover + Frame (50T)',
      size: '1000×1000',
      capacity: '50T',
      weight: 170,
      coverUnitWeight: 95,
      frameUnitWeight: 75,
      coversPerSet: 1,
      framesPerSet: 1,
      componentType: 'SET'
    },
    {
      sku: 'PRD-450-450-25T-COV',
      name: '450×450 Cover (25T)',
      size: '450×450',
      capacity: '25T',
      weight: 24,
      coverUnitWeight: 24,
      frameUnitWeight: 0,
      coversPerSet: 1,
      framesPerSet: 0,
      componentType: 'COVER'
    }
  ];

  const products = {};
  for (const p of productDefinitions) {
    let prod = await prisma.product.findFirst({ where: { sku: p.sku } });
    if (!prod) {
      prod = await prisma.product.create({
        data: {
          publicId: `PUB-${p.sku}`,
          sku: p.sku,
          name: p.name,
          companyId: company.id,
          unit: 'SET',
          unitPrice: 2500,
          size: p.size,
          capacity: p.capacity,
          weight: p.weight,
          coverUnitWeight: p.coverUnitWeight,
          frameUnitWeight: p.frameUnitWeight,
          coversPerSet: p.coversPerSet,
          framesPerSet: p.framesPerSet,
          componentType: p.componentType,
          isActive: true
        }
      });
    } else {
      prod = await prisma.product.update({
        where: { id: prod.id },
        data: {
          name: p.name,
          size: p.size,
          capacity: p.capacity,
          weight: p.weight,
          coverUnitWeight: p.coverUnitWeight,
          frameUnitWeight: p.frameUnitWeight,
          coversPerSet: p.coversPerSet,
          framesPerSet: p.framesPerSet,
          componentType: p.componentType
        }
      });
    }
    products[p.sku] = prod;
  }
  console.log('Products verified:', Object.keys(products).length);

  // 5. Machines: HM001 through HM006
  const machineSpecs = [
    { machineId: 'HM001', name: '300T Hydraulic Press', type: 'Hydraulic Press', capacity: '300T', runtime: 6.2, idle: 1.1, oee: 87, op: 'Ramesh', shift: 'A', status: 'Running', wo: 'WO-1042', prod: '600×600 Cover' },
    { machineId: 'HM002', name: '300T Hydraulic Press', type: 'Hydraulic Press', capacity: '300T', runtime: 5.8, idle: 1.4, oee: 82, op: 'Suresh', shift: 'A', status: 'Running', wo: 'WO-1043', prod: '450×450 Frame' },
    { machineId: 'HM003', name: '200T Hydraulic Press', type: 'Hydraulic Press', capacity: '200T', runtime: 3.2, idle: 4.0, oee: 76, op: 'Mahesh', shift: 'B', status: 'Idle', wo: 'WO-1045', prod: '600×600 Cover' },
    { machineId: 'HM004', name: '200T Hydraulic Press', type: 'Hydraulic Press', capacity: '200T', runtime: 5.4, idle: 0.8, oee: 85, op: 'Raju', shift: 'B', status: 'Running', wo: 'WO-1046', prod: '300×300 Frame' },
    { machineId: 'HM005', name: '500T Hydraulic Press', type: 'Hydraulic Press', capacity: '500T', runtime: 0.5, idle: 2.8, oee: 68, op: 'Sameer', shift: 'C', status: 'Mold Changeover', wo: 'WO-1047', prod: '1000×1000 Cover' },
    { machineId: 'HM006', name: '500T Hydraulic Press', type: 'Hydraulic Press', capacity: '500T', runtime: 0.0, idle: 8.0, oee: 0, op: '—', shift: 'C', status: 'Maintenance', wo: '—', prod: '—' }
  ];

  for (const m of machineSpecs) {
    let mach = await prisma.machine.findUnique({ where: { machineId: m.machineId } });
    if (!mach) {
      mach = await prisma.machine.create({
        data: {
          machineId: m.machineId,
          machineName: m.name,
          machineType: m.type,
          location: `Press Bay ${m.machineId.replace('HM', '')}`,
          isActive: true
        }
      });
    } else {
      mach = await prisma.machine.update({
        where: { id: mach.id },
        data: {
          machineName: m.name,
          machineType: m.type
        }
      });
    }

    // Upsert MachineDailyStatus for October 2026
    const octDate = new Date('2026-10-31T00:00:00.000Z');
    const existingMds = await prisma.machineDailyStatus.findFirst({
      where: { machineId: mach.id, workDate: octDate }
    });

    const statusPayload = JSON.stringify({
      runtimeHours: `${m.runtime}h`,
      idleHours: `${m.idle}h`,
      runtimeVal: m.runtime,
      idleVal: m.idle,
      oee: m.oee,
      operator: m.op,
      shift: m.shift,
      statusDisplay: m.status,
      activeWo: m.wo,
      product: m.prod,
      capacity: m.capacity
    });

    if (existingMds) {
      await prisma.machineDailyStatus.update({
        where: { id: existingMds.id },
        data: {
          status: m.status === 'Maintenance' ? 'NOT_USE' : 'USE',
          remarks: statusPayload,
          updatedById: plantHeadUser.id
        }
      });
    } else {
      await prisma.machineDailyStatus.create({
        data: {
          machineId: mach.id,
          workDate: octDate,
          status: m.status === 'Maintenance' ? 'NOT_USE' : 'USE',
          remarks: statusPayload,
          updatedById: plantHeadUser.id
        }
      });
    }
  }
  console.log('Hydraulic Press Fleet and Daily Statuses seeded.');

  // 6. Featured Active Work Orders (WO-1042 to WO-1048)
  const featuredWos = [
    {
      woNo: 'WO-1042',
      soNo: 'SO-2627/0001',
      cust: 'ABC Infra',
      sku: 'PRD-600-600-40T',
      qty: 500,
      produced: 320,
      shift: 'A',
      machineId: 'HM001',
      durationMins: 372, // 6h 12m
      status: 'STARTED',
      prodStatus: 'IN_PRODUCTION',
      qcRes: null
    },
    {
      woNo: 'WO-1043',
      soNo: 'SO-2627/0002',
      cust: 'XYZ Builders',
      sku: 'PRD-450-450-25T-FRM',
      qty: 800,
      produced: 620,
      shift: 'B',
      machineId: 'HM002',
      durationMins: 348, // 5h 48m
      status: 'QC_PENDING',
      prodStatus: 'QC_PENDING',
      qcRes: null
    },
    {
      woNo: 'WO-1045',
      soNo: 'SO-2627/0003',
      cust: 'Metro Corp',
      sku: 'PRD-600-600-40T-COV',
      qty: 600,
      produced: 540,
      shift: 'B',
      machineId: 'HM003',
      durationMins: 202, // 3h 22m
      status: 'PARTIALLY_COMPLETED',
      prodStatus: 'QC_FAILED',
      qcRes: 'FAIL'
    },
    {
      woNo: 'WO-1046',
      soNo: 'SO-2627/0004',
      cust: 'Green Tech',
      sku: 'PRD-300-300-125T-FRM',
      qty: 1000,
      produced: 780,
      shift: 'C',
      machineId: 'HM004',
      durationMins: 310, // 5h 10m
      status: 'STARTED',
      prodStatus: 'IN_PRODUCTION',
      qcRes: null
    },
    {
      woNo: 'WO-1047',
      soNo: 'SO-2627/0005',
      cust: 'Summit Infra',
      sku: 'PRD-1000-1000-50T',
      qty: 400,
      produced: 320,
      shift: 'C',
      machineId: 'HM005',
      durationMins: 165, // 2h 45m
      status: 'QC_PENDING',
      prodStatus: 'QC_PENDING',
      qcRes: null
    },
    {
      woNo: 'WO-1048',
      soNo: 'SO-2627/0006',
      cust: 'Sunrise Ltd',
      sku: 'PRD-450-450-25T-COV',
      qty: 300,
      produced: 0,
      shift: null,
      machineId: null,
      durationMins: 0,
      status: 'CREATED',
      prodStatus: 'IN_PRODUCTION',
      qcRes: null
    }
  ];

  for (const item of featuredWos) {
    const cust = customers[item.cust];
    const prod = products[item.sku];

    // Ensure SalesOrder
    let so = await prisma.salesOrder.findUnique({ where: { orderNumber: item.soNo } });
    if (!so) {
      so = await prisma.salesOrder.create({
        data: {
          orderNumber: item.soNo,
          customerId: cust.id,
          subtotal: item.qty * 2000,
          taxableAmount: item.qty * 2000,
          totalAmount: item.qty * 2000 * 1.18,
          createdById: plantHeadUser.id,
          orderDate: new Date('2026-10-01T08:00:00.000Z'),
          status: 'CONFIRMED'
        }
      });
    }

    // Ensure SalesOrderItem
    let soItem = await prisma.salesOrderItem.findFirst({
      where: { salesOrderId: so.id, productId: prod.id }
    });
    if (!soItem) {
      soItem = await prisma.salesOrderItem.create({
        data: {
          salesOrderId: so.id,
          productId: prod.id,
          productNameSnapshot: prod.name,
          orderedQuantity: item.qty,
          unit: 'SET',
          unitPrice: 2000,
          taxableAmount: item.qty * 2000,
          lineTotal: item.qty * 2000 * 1.18
        }
      });
    }

    // Ensure ProductionPlan
    const planNo = `PLAN-${item.soNo}`;
    let plan = await prisma.productionPlan.findUnique({ where: { planNumber: planNo } });
    if (!plan) {
      plan = await prisma.productionPlan.create({
        data: {
          planNumber: planNo,
          salesOrderId: so.id,
          status: 'RELEASED',
          plannedStartDate: new Date('2026-10-01T08:00:00.000Z'),
          plannedEndDate: new Date('2026-10-31T18:00:00.000Z'),
          priority: 'HIGH'
        }
      });
    }

    // Upsert WorkOrder
    let wo = await prisma.workOrder.findUnique({ where: { workOrderNumber: item.woNo } });
    const woCreatedAt = new Date('2026-10-05T08:00:00.000Z');
    const startedAt = item.durationMins > 0 ? new Date(Date.now() - item.durationMins * 60 * 1000) : null;

    if (!wo) {
      wo = await prisma.workOrder.create({
        data: {
          workOrderNumber: item.woNo,
          productionPlanId: plan.id,
          salesOrderItemId: soItem.id,
          status: item.status,
          productionStatus: item.prodStatus,
          quantity: item.qty,
          qcResult: item.qcRes,
          duration: item.durationMins,
          startedAt: startedAt,
          productionStartTime: startedAt,
          createdAt: woCreatedAt,
          reworkCount: item.status === 'QC_FAILED' ? 1 : 0
        }
      });
    } else {
      wo = await prisma.workOrder.update({
        where: { id: wo.id },
        data: {
          productionPlanId: plan.id,
          salesOrderItemId: soItem.id,
          status: item.status,
          productionStatus: item.prodStatus,
          quantity: item.qty,
          qcResult: item.qcRes,
          duration: item.durationMins,
          startedAt: startedAt,
          productionStartTime: startedAt
        }
      });
    }
  }
  console.log('Featured Active Work Orders seeded.');

  // 7. Populate Additional Work Orders for October 2026 Pipeline Balance
  // Target:
  // Incoming: 24 WO, 186.5 MT (need 23 more)
  // Floor Runs: 42 WO, 312.8 MT (need 40 more)
  // QC Testing: 18 WO, 121.4 MT (need 16 more)
  // Rework / Scrap: 6 WO, 18.7 MT (need 5 more)
  // Ready for Dispatch: 32 WO, 204.6 MT (need 32 more)
  // Dispatched: 28 WO, 176.3 MT (need 28 more)
  const defaultProd = products['PRD-600-600-40T'];
  const defaultCust = customers['ABC Infra'];

  async function ensurePipelineOrders(stageCode, countNeeded, totalWeightMt, status, prodStatus, qcRes) {
    const existing = await prisma.workOrder.count({
      where: {
        workOrderNumber: { startsWith: `WO-OCT-${stageCode}-` }
      }
    });

    if (existing >= countNeeded) return;

    // Weight per order = totalWeightMt / countNeeded
    // For 80kg product, quantity = (totalWeightMt * 1000) / countNeeded / 80
    const qtyPerWo = Math.max(1, Math.round(((totalWeightMt * 1000) / countNeeded) / 80));

    for (let i = 1; i <= countNeeded; i++) {
      const woNum = `WO-OCT-${stageCode}-${String(i).padStart(3, '0')}`;
      const existingWo = await prisma.workOrder.findUnique({ where: { workOrderNumber: woNum } });
      if (existingWo) continue;

      const soNum = `SO-OCT-${stageCode}-${String(i).padStart(3, '0')}`;
      let so = await prisma.salesOrder.findUnique({ where: { orderNumber: soNum } });
      if (!so) {
        so = await prisma.salesOrder.create({
          data: {
            orderNumber: soNum,
            customerId: defaultCust.id,
            subtotal: qtyPerWo * 2000,
            taxableAmount: qtyPerWo * 2000,
            totalAmount: qtyPerWo * 2000 * 1.18,
            createdById: plantHeadUser.id,
            orderDate: new Date('2026-10-02T09:00:00.000Z'),
            status: 'CONFIRMED'
          }
        });
      }

      let soItem = await prisma.salesOrderItem.findFirst({
        where: { salesOrderId: so.id }
      });
      if (!soItem) {
        soItem = await prisma.salesOrderItem.create({
          data: {
            salesOrderId: so.id,
            productId: defaultProd.id,
            productNameSnapshot: defaultProd.name,
            orderedQuantity: qtyPerWo,
            unit: 'SET',
            unitPrice: 2000,
            taxableAmount: qtyPerWo * 2000,
            lineTotal: qtyPerWo * 2000 * 1.18
          }
        });
      }

      let plan = await prisma.productionPlan.findUnique({ where: { planNumber: `PLAN-${soNum}` } });
      if (!plan) {
        plan = await prisma.productionPlan.create({
          data: {
            planNumber: `PLAN-${soNum}`,
            salesOrderId: so.id,
            status: 'RELEASED',
            plannedStartDate: new Date('2026-10-02T09:00:00.000Z'),
            plannedEndDate: new Date('2026-10-31T18:00:00.000Z')
          }
        });
      }

      const completedAt = ['READY_FOR_DISPATCH', 'DISPATCHED'].includes(prodStatus) ? new Date('2026-10-20T12:00:00.000Z') : null;
      const dispatchedAt = prodStatus === 'DISPATCHED' ? new Date('2026-10-25T14:00:00.000Z') : null;

      await prisma.workOrder.create({
        data: {
          workOrderNumber: woNum,
          productionPlanId: plan.id,
          salesOrderItemId: soItem.id,
          status,
          productionStatus: prodStatus,
          quantity: qtyPerWo,
          qcResult: qcRes,
          duration: 300,
          startedAt: new Date('2026-10-10T08:00:00.000Z'),
          completedAt,
          dispatchedAt,
          createdAt: new Date('2026-10-04T08:00:00.000Z'),
          reworkCount: stageCode === 'REWORK' ? 1 : 0
        }
      });
    }
  }

  await ensurePipelineOrders('INC', 23, 186.5 - (300 * 24 / 1000), 'CREATED', 'IN_PRODUCTION', null);
  await ensurePipelineOrders('FLR', 40, 312.8 - (320 * 80 / 1000 + 780 * 14 / 1000), 'STARTED', 'IN_PRODUCTION', null);
  await ensurePipelineOrders('QC', 16, 121.4 - (620 * 22 / 1000 + 320 * 170 / 1000), 'QC_PENDING', 'QC_PENDING', null);
  await ensurePipelineOrders('RWK', 5, 18.7 - (540 * 45 / 1000), 'PARTIALLY_COMPLETED', 'QC_FAILED', 'FAIL');
  await ensurePipelineOrders('RDY', 32, 204.6, 'READY_FOR_DISPATCH', 'READY_FOR_DISPATCH', 'PASS');
  await ensurePipelineOrders('DSP', 28, 176.3, 'DISPATCHED', 'DISPATCHED', 'PASS');
  console.log('Pipeline balancing Work Orders seeded.');

  // 8. Seed ProductionShiftEntry for October 2026
  // Shift A: 812 Sets, 1,248 Covers, 1,235 Frames, 158.4 MT
  // Shift B: 764 Sets, 1,176 Covers, 1,162 Frames, 142.7 MT
  // Shift C: 698 Sets, 1,062 Covers, 1,048 Frames, 128.3 MT
  // Total: 2,274 Sets, 3,486 Covers, 3,445 Frames, 429.4 MT
  const shiftConfigs = [
    { shift: 'Shift A (Morning)', supervisor: 'Ramesh Supervisor', target: 850, produced: 812, covers: 1248, frames: 1235, weightMt: 158.4 },
    { shift: 'Shift B (Evening)', supervisor: 'Mahesh Supervisor', target: 800, produced: 764, covers: 1176, frames: 1162, weightMt: 142.7 },
    { shift: 'Shift C (Night)', supervisor: 'Sameer Supervisor', target: 750, produced: 698, covers: 1062, frames: 1048, weightMt: 128.3 }
  ];

  const refWo1042 = await prisma.workOrder.findUnique({ where: { workOrderNumber: 'WO-1042' } });

  for (const sc of shiftConfigs) {
    const existing = await prisma.productionShiftEntry.findFirst({
      where: {
        shift: sc.shift,
        date: new Date('2026-10-31T00:00:00.000Z')
      }
    });

    if (!existing) {
      await prisma.productionShiftEntry.create({
        data: {
          workOrderId: refWo1042.id,
          shift: sc.shift,
          supervisor: sc.supervisor,
          targetQty: sc.target,
          producedQty: sc.produced,
          rejectedQty: 10,
          reworkQty: 8,
          date: new Date('2026-10-31T00:00:00.000Z')
        }
      });
    }

    // Also populate DailyProductionReport
    const dprNo = `DPR-2026-10-${sc.shift.includes('A') ? 'A' : sc.shift.includes('B') ? 'B' : 'C'}`;
    let dpr = await prisma.productionDailyReport.findUnique({ where: { reportNo: dprNo } });
    if (!dpr) {
      await prisma.productionDailyReport.create({
        data: {
          reportNo: dprNo,
          reportDate: new Date('2026-10-31T00:00:00.000Z'),
          shift: sc.shift,
          supervisorName: sc.supervisor,
          status: 'APPROVED',
          totalSets: sc.produced,
          totalCovers: sc.covers,
          totalFrames: sc.frames,
          totalWeight: sc.weightMt * 1000,
          createdById: plantHeadUser.id,
          companyId: company.id
        }
      });
    }
  }
  console.log('Shift production entries and DPRs seeded.');

  // 9. ProductionScrapEntry for October 2026
  // Categories: Hairline cracks 32% (395.2 kg), Surface voids 24% (296.4 kg), Rim mismatch 18% (222.3 kg), Incomplete curing 16% (197.6 kg), Weight deviation 12% (148.2 kg)
  // Total: 1,235 kg, Cost: ₹48,750 (₹39.5/kg)
  const scrapData = [
    { category: 'Hairline cracks', kg: 395.2 },
    { category: 'Surface voids', kg: 296.4 },
    { category: 'Rim mismatch', kg: 222.3 },
    { category: 'Incomplete curing', kg: 197.6 },
    { category: 'Weight deviation', kg: 148.2 }
  ];

  for (const s of scrapData) {
    const existing = await prisma.productionScrapEntry.findFirst({
      where: {
        category: s.category,
        date: new Date('2026-10-31T00:00:00.000Z')
      }
    });

    if (!existing) {
      await prisma.productionScrapEntry.create({
        data: {
          workOrderId: refWo1042.id,
          shift: 'Morning',
          supervisor: 'Plant Supervisor',
          scrapQty: s.kg,
          wastageQty: s.kg,
          category: s.category,
          remarks: `Pareto analysis batch scrap - Unit cost INR 39.5/kg`,
          date: new Date('2026-10-31T00:00:00.000Z')
        }
      });
    }
  }
  console.log('Scrap entries seeded.');

  // 10. QC Inspections: 2,821 Passed (98.9%), 32 Failed (1.1%), Load test ratings
  const existingProofQc = await prisma.qCInspection.count({
    where: {
      remarks: { contains: 'Proof Load Test Rating' }
    }
  });

  if (existingProofQc === 0) {
    const qcLoads = [
      { rating: '2.5T', countPassed: 790, countFailed: 9 },
      { rating: '12.5T', countPassed: 620, countFailed: 7 },
      { rating: '25T', countPassed: 677, countFailed: 8 },
      { rating: '40T', countPassed: 734, countFailed: 8 }
    ];

    for (const q of qcLoads) {
      await prisma.qCInspection.create({
        data: {
          workOrderId: refWo1042.id,
          status: 'PASSED',
          approvedQuantity: q.countPassed,
          rejectedQuantity: 0,
          remarks: `Proof Load Test Rating: ${q.rating} | Proof load compliant`,
          createdAt: new Date('2026-10-28T10:00:00.000Z')
        }
      });

      await prisma.qCInspection.create({
        data: {
          workOrderId: refWo1042.id,
          status: 'FAILED',
          approvedQuantity: 0,
          rejectedQuantity: q.countFailed,
          remarks: `Proof Load Test Rating: ${q.rating} | Defect observed`,
          createdAt: new Date('2026-10-28T11:00:00.000Z')
        }
      });
    }
  }
  console.log('QC Inspections seeded.');

  console.log('--- October 2026 Database Seeding Completed Successfully ---');
}

seed()
  .catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
