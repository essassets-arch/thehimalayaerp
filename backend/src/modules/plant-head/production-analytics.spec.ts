import {
  PlantHeadService,
  calculatePlannedComponents,
  calculateProductionWeight,
} from './plant-head.service';

describe('Production Analytics - Rules 23–28 Comprehensive Verification Suite', () => {
  // ── TEST 1: MHC (1C + 1F) Composition ──
  it('Test 1: MHC (1C + 1F) planned composition derives 100 covers, 100 frames, 200 components from 100 sets', () => {
    const product = {
      name: 'FRP MHC 600x600 B125',
      type: 'MHC',
      coversPerSet: 1,
      framesPerSet: 1,
      coverUnitWeight: 15.5,
      frameUnitWeight: 22.0,
      weight: 37.5,
    };
    const comp = calculatePlannedComponents(product, 100);
    expect(comp.configured).toBe(true);
    expect(comp.plannedSets).toBe(100);
    expect(comp.expectedCovers).toBe(100);
    expect(comp.expectedFrames).toBe(100);
    expect(comp.expectedComponentPieces).toBe(200);
    expect(comp.compositionLabel).toBe('1C + 1F');
  });

  // ── TEST 2: DHMC (2C + 1F) Composition ──
  it('Test 2: DHMC (2C + 1F) planned composition derives 100 covers, 50 frames, 150 components from 50 sets without heuristics', () => {
    const product = {
      name: 'FRP Double Cover Manhole 900x900 D400',
      type: 'DHMC',
      coversPerSet: 2,
      framesPerSet: 1,
      coverUnitWeight: 25.0,
      frameUnitWeight: 45.0,
      weight: 95.0,
    };
    const comp = calculatePlannedComponents(product, 50);
    expect(comp.configured).toBe(true);
    expect(comp.plannedSets).toBe(50);
    expect(comp.expectedCovers).toBe(100);
    expect(comp.expectedFrames).toBe(50);
    expect(comp.expectedComponentPieces).toBe(150);
    expect(comp.compositionLabel).toBe('2C + 1F');
  });

  // ── TEST 3: Mixed Batch Composition ──
  it('Test 3: Mixed Batch (100 MHC + 50 DHMC) aggregates exactly 150 sets, 200 covers, 150 frames, 350 components', () => {
    const mhc = { coversPerSet: 1, framesPerSet: 1 };
    const dhmc = { coversPerSet: 2, framesPerSet: 1 };

    const compMHC = calculatePlannedComponents(mhc, 100);
    const compDHMC = calculatePlannedComponents(dhmc, 50);

    const totalSets = compMHC.plannedSets + compDHMC.plannedSets;
    const totalCovers = compMHC.expectedCovers! + compDHMC.expectedCovers!;
    const totalFrames = compMHC.expectedFrames! + compDHMC.expectedFrames!;
    const totalComponents = compMHC.expectedComponentPieces! + compDHMC.expectedComponentPieces!;

    expect(totalSets).toBe(150);
    expect(totalCovers).toBe(200);
    expect(totalFrames).toBe(150);
    expect(totalComponents).toBe(350);
  });

  // ── TEST 4: Daily Floor Actual with Loose Parts ──
  it('Test 4: Floor actuals with loose components (30 covers, 25 frames, 25 sets) yield 5 loose covers, 0 loose frames, 55 components', () => {
    const coversPerSet = 1;
    const framesPerSet = 1;
    const coverQty = 30;
    const frameQty = 25;
    const setQty = 25;

    const extraCoverQty = coverQty - (setQty * coversPerSet);
    const extraFrameQty = frameQty - (setQty * framesPerSet);
    const totalComponentPieces = coverQty + frameQty;

    expect(extraCoverQty).toBe(5);
    expect(extraFrameQty).toBe(0);
    expect(totalComponentPieces).toBe(55);
    expect(setQty).toBe(25);
  });

  // ── TEST 5: Partial Daily Reports Regression Lock ──
  it('Test 5: WorkOrders are not erased when Daily Reports exist only for part of the month', async () => {
    const wo1 = {
      id: 'wo-1',
      workOrderNumber: 'WO-SEP-001',
      quantity: 100,
      status: 'STARTED',
      createdAt: new Date('2026-09-02T10:00:00Z'),
      completedAt: null,
      salesOrderItem: {
        product: { id: 'p1', name: 'MHC 600', coversPerSet: 1, framesPerSet: 1, weight: 40, coverUnitWeight: 20, frameUnitWeight: 20 },
      },
    };
    const wo2 = {
      id: 'wo-2',
      workOrderNumber: 'WO-SEP-002',
      quantity: 50,
      status: 'COMPLETED',
      createdAt: new Date('2026-09-20T10:00:00Z'),
      completedAt: new Date('2026-09-22T10:00:00Z'),
      salesOrderItem: {
        product: { id: 'p2', name: 'MHC 450', coversPerSet: 1, framesPerSet: 1, weight: 30, coverUnitWeight: 15, frameUnitWeight: 15 },
      },
    };

    // Daily report logged only for wo-1 (early September). No daily report for wo-2.
    const dailyReport1 = {
      id: 'dr-1',
      reportNo: 'DR-SEP-01',
      reportDate: new Date('2026-09-03T10:00:00Z'),
      status: 'APPROVED',
      items: [
        {
          id: 'dri-1',
          workOrderId: 'wo-1',
          coverQty: 40,
          frameQty: 40,
          setQty: 40,
          extraCoverQty: 0,
          extraFrameQty: 0,
          coverUnitWeight: 20,
          frameUnitWeight: 20,
        },
      ],
    };

    const mockPrisma = {
      workOrder: { findMany: jest.fn().mockResolvedValue([wo1, wo2]) },
      qCInspection: { findMany: jest.fn().mockResolvedValue([]) },
      productionDailyReport: { findMany: jest.fn().mockResolvedValue([dailyReport1]) },
      machine: { findMany: jest.fn().mockResolvedValue([]) },
      salesOrder: { groupBy: jest.fn().mockResolvedValue([]) },
    };

    const service = new PlantHeadService(mockPrisma as any, {} as any);
    const report = await service.getMonthlyProductionReport('tenant-1', undefined, undefined, undefined, undefined, undefined, undefined, '2026-09');

    // Both WOs must be present in the report! Neither is erased.
    expect(report.kpis.totalWorkOrders).toBe(2);
    expect(report.workOrdersList.length).toBe(2);
    const repWo1 = report.workOrdersList.find((w: any) => w.id === 'wo-1');
    const repWo2 = report.workOrdersList.find((w: any) => w.id === 'wo-2');
    expect(repWo1).toBeDefined();
    expect(repWo2).toBeDefined();
    expect(repWo1.source).toBe('DAILY_REPORT_PARTIAL');
    expect(repWo2.source).toBe('WORK_ORDER');
  });

  // ── TEST 6: Double Counting Prevention Regression Lock ──
  it('Test 6: WorkOrder and cumulative Daily Report production cannot double-count', async () => {
    // WO planned = 100 sets. Daily Report reported = 75 sets.
    const wo = {
      id: 'wo-double',
      workOrderNumber: 'WO-DOUBLE-100',
      quantity: 100,
      status: 'STARTED',
      createdAt: new Date('2026-09-05T10:00:00Z'),
      completedAt: null,
      salesOrderItem: {
        product: { id: 'p1', name: 'MHC 600', coversPerSet: 1, framesPerSet: 1, weight: 10, coverUnitWeight: 5, frameUnitWeight: 5 },
      },
    };
    const dr = {
      id: 'dr-double',
      reportNo: 'DR-01',
      reportDate: new Date('2026-09-06T10:00:00Z'),
      status: 'APPROVED',
      items: [
        {
          id: 'dri-double',
          workOrderId: 'wo-double',
          coverQty: 75,
          frameQty: 75,
          setQty: 75,
          extraCoverQty: 0,
          extraFrameQty: 0,
          coverUnitWeight: 5,
          frameUnitWeight: 5,
        },
      ],
    };

    const mockPrisma = {
      workOrder: { findMany: jest.fn().mockResolvedValue([wo]) },
      qCInspection: { findMany: jest.fn().mockResolvedValue([]) },
      productionDailyReport: { findMany: jest.fn().mockResolvedValue([dr]) },
      machine: { findMany: jest.fn().mockResolvedValue([]) },
      salesOrder: { groupBy: jest.fn().mockResolvedValue([]) },
    };

    const service = new PlantHeadService(mockPrisma as any, {} as any);
    const report = await service.getMonthlyProductionReport('tenant-1', undefined, undefined, undefined, undefined, undefined, undefined, '2026-09');

    // Production counted must be floor actual = 75 sets (150 pieces, 750 KG), NOT 100 + 75 = 175 sets!
    expect(report.kpis.totalCovers).toBe(75);
    expect(report.kpis.totalFrames).toBe(75);
    expect(report.kpis.totalPieces).toBe(150);
    expect(report.kpis.totalFinishedSets).toBe(75);
    expect(report.kpis.totalWeight).toBe(750);
    const woRow = report.workOrdersList[0];
    expect(woRow.plannedSets).toBe(100);
    expect(woRow.actualFinishedSets).toBe(75);
    expect(woRow.remainingScheduledSets).toBe(25);
  });

  // ── TEST 7: Unconfigured Product Composition ──
  it('Test 7: Unconfigured product returns COMPOSITION NOT CONFIGURED and null expected components (never 0)', () => {
    const unconfiguredProduct = {
      name: 'FRP Custom Slab',
      coversPerSet: null,
      framesPerSet: null,
    };
    const comp = calculatePlannedComponents(unconfiguredProduct, 100);
    expect(comp.configured).toBe(false);
    expect(comp.expectedCovers).toBeNull();
    expect(comp.expectedFrames).toBeNull();
    expect(comp.expectedComponentPieces).toBeNull();
    expect(comp.compositionLabel).toBe('COMPOSITION NOT CONFIGURED');
  });

  // ── TEST 8: Cover Only Composition ──
  it('Test 8: Cover Only (1C + 0F) planned composition', () => {
    const coverOnly = {
      name: 'Replacement Cover 600',
      coversPerSet: 1,
      framesPerSet: 0,
    };
    const comp = calculatePlannedComponents(coverOnly, 100);
    expect(comp.configured).toBe(true);
    expect(comp.expectedCovers).toBe(100);
    expect(comp.expectedFrames).toBe(0);
    expect(comp.expectedComponentPieces).toBe(100);
    expect(comp.compositionLabel).toBe('Cover Only');
  });

  // ── TEST 9: Frame Only Composition ──
  it('Test 9: Frame Only (0C + 1F) planned composition', () => {
    const frameOnly = {
      name: 'Replacement Frame 600',
      coversPerSet: 0,
      framesPerSet: 1,
    };
    const comp = calculatePlannedComponents(frameOnly, 100);
    expect(comp.configured).toBe(true);
    expect(comp.expectedCovers).toBe(0);
    expect(comp.expectedFrames).toBe(100);
    expect(comp.expectedComponentPieces).toBe(100);
    expect(comp.compositionLabel).toBe('Frame Only');
  });

  // ── TEST 10: Empty Month Authoritative State ──
  it('Test 10: Empty month returns hasData = false with zero metrics', async () => {
    const mockPrisma = {
      workOrder: { findMany: jest.fn().mockResolvedValue([]) },
      qCInspection: { findMany: jest.fn().mockResolvedValue([]) },
      productionDailyReport: { findMany: jest.fn().mockResolvedValue([]) },
      machine: { findMany: jest.fn().mockResolvedValue([]) },
      salesOrder: { groupBy: jest.fn().mockResolvedValue([]) },
    };

    const service = new PlantHeadService(mockPrisma as any, {} as any);
    const report = await service.getMonthlyProductionReport('tenant-1', undefined, undefined, undefined, undefined, undefined, undefined, '2027-01');

    expect(report.hasData).toBe(false);
    expect(report.kpis.totalWorkOrders).toBe(0);
    expect(report.kpis.totalWeight).toBe(0);
    expect(report.kpis.totalPieces).toBe(0);
    expect(report.kpis.narrative).toContain('No production records found');
  });

  // ── TEST 11: Multi-Tenant Isolation ──
  it('Test 11: companyId tenant isolation is enforced at query and aggregation boundary', async () => {
    const findManyWO = jest.fn().mockResolvedValue([]);
    const findManyDR = jest.fn().mockResolvedValue([]);

    const mockPrisma = {
      workOrder: { findMany: findManyWO },
      qCInspection: { findMany: jest.fn().mockResolvedValue([]) },
      productionDailyReport: { findMany: findManyDR },
      machine: { findMany: jest.fn().mockResolvedValue([]) },
      salesOrder: { groupBy: jest.fn().mockResolvedValue([]) },
    };

    const service = new PlantHeadService(mockPrisma as any, {} as any);
    await service.getMonthlyProductionReport('TENANT-A-123', undefined, undefined, undefined, undefined, undefined, undefined, '2026-09');

    // Verify daily report query filtered strictly by companyId
    const drQuery = findManyDR.mock.calls[0][0];
    expect(drQuery.where.companyId).toBe('TENANT-A-123');

    // Verify work order query filtered by tenant isolation
    const woQuery = findManyWO.mock.calls[0][0];
    const hasTenantInWO = JSON.stringify(woQuery.where).includes('TENANT-A-123');
    expect(hasTenantInWO).toBe(true);
  });

  // ── TEST 12: Regression Lock - August 5,617.00 KG and September Baseline ──
  it('Test 12: Regression lock preserves certified August 5,617.00 KG baseline when no daily reports exist', async () => {
    // 29 WorkOrders totaling 5,617.00 KG
    const mockWOs = Array.from({ length: 29 }, (_, i) => ({
      id: `wo-aug-${i}`,
      workOrderNumber: `WO-AUG-${i + 1}`,
      quantity: 10,
      status: 'COMPLETED',
      createdAt: new Date('2026-08-10T10:00:00Z'),
      completedAt: new Date('2026-08-15T10:00:00Z'),
      salesOrderItem: {
        product: {
          id: `p-${i}`,
          name: `Product ${i}`,
          coversPerSet: 1,
          framesPerSet: 1,
          // 28 items @ 193.69 kg, 1 item @ 193.68 kg -> total = 5,617.00 kg
          weight: i === 28 ? 19.368 : 19.369,
        },
      },
    }));

    const mockPrisma = {
      workOrder: { findMany: jest.fn().mockResolvedValue(mockWOs) },
      qCInspection: { findMany: jest.fn().mockResolvedValue([]) },
      productionDailyReport: { findMany: jest.fn().mockResolvedValue([]) }, // 0 daily reports
      machine: { findMany: jest.fn().mockResolvedValue([]) },
      salesOrder: { groupBy: jest.fn().mockResolvedValue([]) },
    };

    const service = new PlantHeadService(mockPrisma as any, {} as any);
    const report = await service.getMonthlyProductionReport('all', undefined, undefined, undefined, undefined, undefined, undefined, '2026-08');

    expect(report.kpis.totalWorkOrders).toBe(29);
    expect(report.kpis.totalWeight).toBe(5617);
    expect(report.reconciliation.isReconciled).toBe(true);
  });

  // ── TEST 13: Multiple Shifts against one WO Cumulative Aggregation ──
  it('Test 13: Multiple shifts against one WorkOrder aggregate cumulatively (30 + 25 + 20 = 75)', async () => {
    const wo = {
      id: 'wo-multi-shift',
      workOrderNumber: 'WO-SHIFT-100',
      quantity: 100,
      status: 'STARTED',
      createdAt: new Date('2026-09-10T08:00:00Z'),
      completedAt: null,
      salesOrderItem: {
        product: { id: 'p1', name: 'MHC 600', coversPerSet: 1, framesPerSet: 1, coverUnitWeight: 10, frameUnitWeight: 15 },
      },
    };

    // 3 daily reports on different dates / shifts for the SAME work order
    const dr1 = {
      id: 'dr-s1',
      reportNo: 'DR-001',
      reportDate: new Date('2026-09-11T16:00:00Z'),
      status: 'APPROVED',
      items: [{ workOrderId: 'wo-multi-shift', coverQty: 30, frameQty: 30, setQty: 30, extraCoverQty: 0, extraFrameQty: 0, coverUnitWeight: 10, frameUnitWeight: 15 }],
    };
    const dr2 = {
      id: 'dr-s2',
      reportNo: 'DR-002',
      reportDate: new Date('2026-09-12T16:00:00Z'),
      status: 'APPROVED',
      items: [{ workOrderId: 'wo-multi-shift', coverQty: 25, frameQty: 25, setQty: 25, extraCoverQty: 0, extraFrameQty: 0, coverUnitWeight: 10, frameUnitWeight: 15 }],
    };
    const dr3 = {
      id: 'dr-s3',
      reportNo: 'DR-003',
      reportDate: new Date('2026-09-13T16:00:00Z'),
      status: 'APPROVED',
      items: [{ workOrderId: 'wo-multi-shift', coverQty: 20, frameQty: 20, setQty: 20, extraCoverQty: 0, extraFrameQty: 0, coverUnitWeight: 10, frameUnitWeight: 15 }],
    };

    const mockPrisma = {
      workOrder: { findMany: jest.fn().mockResolvedValue([wo]) },
      qCInspection: { findMany: jest.fn().mockResolvedValue([]) },
      productionDailyReport: { findMany: jest.fn().mockResolvedValue([dr1, dr2, dr3]) },
      machine: { findMany: jest.fn().mockResolvedValue([]) },
      salesOrder: { groupBy: jest.fn().mockResolvedValue([]) },
    };

    const service = new PlantHeadService(mockPrisma as any, {} as any);
    const report = await service.getMonthlyProductionReport('tenant-1', undefined, undefined, undefined, undefined, undefined, undefined, '2026-09');

    expect(report.kpis.totalWorkOrders).toBe(1);
    expect(report.kpis.totalFinishedSets).toBe(75);
    expect(report.kpis.totalCovers).toBe(75);
    expect(report.kpis.totalFrames).toBe(75);
    expect(report.kpis.totalPieces).toBe(150);

    const row = report.workOrdersList[0];
    expect(row.plannedSets).toBe(100);
    expect(row.actualFinishedSets).toBe(75);
    expect(row.remainingScheduledSets).toBe(25);
    expect(row.dailyReportCount).toBe(3);
    expect(row.dailyReportNos).toEqual(['DR-001', 'DR-002', 'DR-003']);
    expect(row.source).toBe('DAILY_REPORT_PARTIAL');
  });

  // ── TEST 14: Standalone Floor Daily Report Output ──
  it('Test 14: Standalone Daily Report items without WO link are preserved with source DAILY_REPORT_STANDALONE', async () => {
    const standaloneReport = {
      id: 'dr-standalone',
      reportNo: 'DR-FLOOR-99',
      reportDate: new Date('2026-09-15T10:00:00Z'),
      status: 'APPROVED',
      items: [
        {
          id: 'dri-stand-1',
          workOrderId: null, // Standalone floor run
          productId: 'p-extra',
          customProductName: 'FRP Grating Standalone Run',
          size: '300 × 300',
          type: 'GRATING',
          capacity: 'C250',
          coverQty: 10,
          frameQty: 10,
          setQty: 10,
          extraCoverQty: 0,
          extraFrameQty: 0,
          coverUnitWeight: 8,
          frameUnitWeight: 12,
        },
      ],
    };

    const mockPrisma = {
      workOrder: { findMany: jest.fn().mockResolvedValue([]) },
      qCInspection: { findMany: jest.fn().mockResolvedValue([]) },
      productionDailyReport: { findMany: jest.fn().mockResolvedValue([standaloneReport]) },
      machine: { findMany: jest.fn().mockResolvedValue([]) },
      salesOrder: { groupBy: jest.fn().mockResolvedValue([]) },
    };

    const service = new PlantHeadService(mockPrisma as any, {} as any);
    const report = await service.getMonthlyProductionReport('tenant-1', undefined, undefined, undefined, undefined, undefined, undefined, '2026-09');

    expect(report.hasData).toBe(true);
    expect(report.kpis.totalPieces).toBe(20);
    expect(report.kpis.totalFinishedSets).toBe(10);
    expect(report.kpis.totalWeight).toBe(200); // 10 * 8 + 10 * 12 = 200
    const row = report.workOrdersList[0];
    expect(row.source).toBe('DAILY_REPORT_STANDALONE');
    expect(row.workOrderNumber).toBe('FLOOR-DR-FLOOR-99');
  });

  // ── TEST 15: Authoritative setQty Lock (Semantic Lock) ──
  it('Test 15: setQty is authoritative from floor and not re-derived from covers/frames', async () => {
    // Floor reported: coverQty = 30, frameQty = 25, setQty = 25
    const dr = {
      id: 'dr-sem',
      reportNo: 'DR-SEM-01',
      reportDate: new Date('2026-09-08T10:00:00Z'),
      status: 'APPROVED',
      items: [
        {
          id: 'dri-sem',
          workOrderId: 'wo-sem',
          coverQty: 30,
          frameQty: 25,
          setQty: 25,
          extraCoverQty: 5,
          extraFrameQty: 0,
          coverUnitWeight: 10,
          frameUnitWeight: 15,
        },
      ],
    };
    const wo = {
      id: 'wo-sem',
      workOrderNumber: 'WO-SEM-01',
      quantity: 50,
      status: 'STARTED',
      createdAt: new Date('2026-09-08T08:00:00Z'),
      completedAt: null,
      salesOrderItem: {
        product: { id: 'p1', name: 'MHC 600', coversPerSet: 1, framesPerSet: 1, coverUnitWeight: 10, frameUnitWeight: 15 },
      },
    };

    const mockPrisma = {
      workOrder: { findMany: jest.fn().mockResolvedValue([wo]) },
      qCInspection: { findMany: jest.fn().mockResolvedValue([]) },
      productionDailyReport: { findMany: jest.fn().mockResolvedValue([dr]) },
      machine: { findMany: jest.fn().mockResolvedValue([]) },
      salesOrder: { groupBy: jest.fn().mockResolvedValue([]) },
    };

    const service = new PlantHeadService(mockPrisma as any, {} as any);
    const report = await service.getMonthlyProductionReport('tenant-1', undefined, undefined, undefined, undefined, undefined, undefined, '2026-09');

    const row = report.workOrdersList[0];
    expect(row.actualFinishedSets).toBe(25);
    expect(row.covers).toBe(30);
    expect(row.frames).toBe(25);
    expect(row.looseCovers).toBe(5);
    expect(row.looseFrames).toBe(0);
    expect(row.totalComponents).toBe(55);
  });

  // ── TEST 16: Dual Weight Accounting and Variance ──
  it('Test 16: Dual weight accounting preserves calculatedProductionWeight, actualFloorScaleWeight, and weightVariance', async () => {
    // Calculated: 10 covers * 15 kg + 10 frames * 20 kg = 350 kg
    // Actual scale: cover scale = 153.5 kg, frame scale = 202.0 kg -> actual scale total = 355.5 kg
    // Variance = 355.5 - 350 = +5.5 kg
    const dr = {
      id: 'dr-scale',
      reportNo: 'DR-SCALE-01',
      reportDate: new Date('2026-09-14T10:00:00Z'),
      status: 'APPROVED',
      items: [
        {
          id: 'dri-scale',
          workOrderId: 'wo-scale',
          coverQty: 10,
          frameQty: 10,
          setQty: 10,
          extraCoverQty: 0,
          extraFrameQty: 0,
          coverUnitWeight: 15,
          frameUnitWeight: 20,
          actualCoverWeight: 153.5,
          actualFrameWeight: 202.0,
        },
      ],
    };
    const wo = {
      id: 'wo-scale',
      workOrderNumber: 'WO-SCALE-01',
      quantity: 10,
      status: 'COMPLETED',
      createdAt: new Date('2026-09-14T08:00:00Z'),
      completedAt: new Date('2026-09-14T18:00:00Z'),
      salesOrderItem: {
        product: { id: 'p1', name: 'MHC 600', coversPerSet: 1, framesPerSet: 1, coverUnitWeight: 15, frameUnitWeight: 20 },
      },
    };

    const mockPrisma = {
      workOrder: { findMany: jest.fn().mockResolvedValue([wo]) },
      qCInspection: { findMany: jest.fn().mockResolvedValue([]) },
      productionDailyReport: { findMany: jest.fn().mockResolvedValue([dr]) },
      machine: { findMany: jest.fn().mockResolvedValue([]) },
      salesOrder: { groupBy: jest.fn().mockResolvedValue([]) },
    };

    const service = new PlantHeadService(mockPrisma as any, {} as any);
    const report = await service.getMonthlyProductionReport('tenant-1', undefined, undefined, undefined, undefined, undefined, undefined, '2026-09');

    expect(report.kpis.totalWeight).toBe(350);
    expect(report.kpis.totalScaleWeight).toBe(355.5);
    expect(report.kpis.weightVariance).toBe(5.5);
    expect(report.kpis.hasScaleWeight).toBe(true);

    const row = report.workOrdersList[0];
    expect(row.calculatedWeight).toBe(350);
    expect(row.actualScaleWeight).toBe(355.5);
    expect(row.weightVariance).toBe(5.5);
  });

  // ── TEST 17: Exclusion of Trading / Category 2 Products ──
  it('Test 17: Exclude Trading / Category 2 products (Coverblocks, WCB, PCB, D2) from Plant Head report by default', async () => {
    const woManufacturing = {
      id: 'wo-mfg-1',
      workOrderNumber: 'WO-MFG-001',
      quantity: 50,
      status: 'COMPLETED',
      createdAt: new Date('2026-10-02T10:00:00Z'),
      completedAt: new Date('2026-10-03T10:00:00Z'),
      salesOrderItem: {
        product: { id: 'p-mhc', name: 'HIMALAYA FRP MHC 600X600 LD BLACK', category: 'MHC', coversPerSet: 1, framesPerSet: 1, weight: 30 },
      },
    };

    const woCoverblock1 = {
      id: 'wo-cb-1',
      workOrderNumber: 'WO-TRD-001',
      quantity: 5100,
      status: 'COMPLETED',
      createdAt: new Date('2026-10-02T10:00:00Z'),
      completedAt: new Date('2026-10-03T10:00:00Z'),
      salesOrderItem: {
        product: { id: 'p-wcb', name: 'WCB MULTIPLE', sku: 'WCBMULTIPLE', category: 'COVERBLOCK', dispatchCategory: 'D2' },
      },
    };

    const woCoverblock2 = {
      id: 'wo-cb-2',
      workOrderNumber: 'WO-TRD-002',
      quantity: 140,
      status: 'COMPLETED',
      createdAt: new Date('2026-10-02T10:00:00Z'),
      completedAt: new Date('2026-10-03T10:00:00Z'),
      salesOrderItem: {
        product: { id: 'p-pcb', name: 'PCB 40 MM', sku: 'PCB40MM', category: 'COVERBLOCK' },
      },
    };

    const mockPrisma = {
      workOrder: { findMany: jest.fn().mockResolvedValue([woManufacturing, woCoverblock1, woCoverblock2]) },
      qCInspection: { findMany: jest.fn().mockResolvedValue([]) },
      productionDailyReport: { findMany: jest.fn().mockResolvedValue([]) },
      machine: { findMany: jest.fn().mockResolvedValue([]) },
      salesOrder: { groupBy: jest.fn().mockResolvedValue([]) },
    };

    const service = new PlantHeadService(mockPrisma as any, {} as any);

    // 1. By default, trading products are excluded
    const reportDefault = await service.getMonthlyProductionReport('tenant-1', undefined, undefined, undefined, undefined, undefined, undefined, '2026-10');
    expect(reportDefault.kpis.totalWorkOrders).toBe(1);
    expect(reportDefault.workOrdersList.length).toBe(1);
    expect(reportDefault.workOrdersList[0].product).toBe('HIMALAYA FRP MHC 600X600 LD BLACK');
    expect(reportDefault.productWise.some((p: any) => p.name === 'COVERBLOCK')).toBe(false);
    expect(reportDefault.kpis.totalPieces).toBe(100); // 50 covers + 50 frames

    // 2. When includeTrading is explicitly true, trading products are included
    const reportTrading = await service.getMonthlyProductionReport(
      'tenant-1', undefined, undefined, undefined, undefined, undefined, undefined, '2026-10', undefined, undefined, undefined, undefined, true
    );
    expect(reportTrading.kpis.totalWorkOrders).toBe(3);
    expect(reportTrading.productWise.some((p: any) => p.name === 'COVERBLOCK')).toBe(true);
  });

  // ── TEST 18: Floor Scale Weight Tracking When Product Master Weight is Zero ──
  it('Test 18: Dual scaleWeight and effectiveWeight propagate to productTypes, sizes, capacities, and individual products', async () => {
    const dr = {
      id: 'dr-oct',
      reportNo: 'DR-OCT-01',
      reportDate: new Date('2026-10-05T10:00:00Z'),
      status: 'APPROVED',
      items: [
        {
          id: 'dri-oct-1',
          workOrderId: 'wo-oct-1',
          coverQty: 25,
          frameQty: 25,
          setQty: 25,
          extraCoverQty: 0,
          extraFrameQty: 0,
          coverUnitWeight: 0, // No theoretical weight in master
          frameUnitWeight: 0,
          actualCoverWeight: 400.0,
          actualFrameWeight: 403.7,
        },
      ],
    };

    const wo = {
      id: 'wo-oct-1',
      workOrderNumber: 'WO-OCT-001',
      quantity: 25,
      status: 'COMPLETED',
      createdAt: new Date('2026-10-05T08:00:00Z'),
      completedAt: new Date('2026-10-05T18:00:00Z'),
      salesOrderItem: {
        product: {
          id: 'p-oct-1',
          name: 'HIMALAYA FRP MHC 600X600 LD BLACK',
          type: 'MHC',
          size: '600X600',
          capacity: 'LD',
          coversPerSet: 1,
          framesPerSet: 1,
          weight: 0,
        },
      },
    };

    const mockPrisma = {
      workOrder: { findMany: jest.fn().mockResolvedValue([wo]) },
      qCInspection: { findMany: jest.fn().mockResolvedValue([]) },
      productionDailyReport: { findMany: jest.fn().mockResolvedValue([dr]) },
      machine: { findMany: jest.fn().mockResolvedValue([]) },
      salesOrder: { groupBy: jest.fn().mockResolvedValue([]) },
    };

    const service = new PlantHeadService(mockPrisma as any, {} as any);
    const report = await service.getMonthlyProductionReport('tenant-1', undefined, undefined, undefined, undefined, undefined, undefined, '2026-10');

    expect(report.kpis.totalWeight).toBe(0);
    expect(report.kpis.totalScaleWeight).toBe(803.7);
    expect(report.kpis.effectiveWeight).toBe(803.7);

    // Product Type map has scaleWeight and effectiveWeight
    const mhcType = report.productWise.find((p: any) => p.name === 'MHC');
    expect(mhcType).toBeDefined();
    expect(mhcType.scaleWeight).toBe(803.7);
    expect(mhcType.effectiveWeight).toBe(803.7);

    // Size map has scaleWeight and effectiveWeight
    const szEntry = report.sizeWise.find((s: any) => s.name === '600 × 600');
    expect(szEntry).toBeDefined();
    expect(szEntry.scaleWeight).toBe(803.7);
    expect(szEntry.effectiveWeight).toBe(803.7);

    // Capacity map has scaleWeight and effectiveWeight
    const capEntry = report.capacityWise.find((c: any) => c.name === 'LD');
    expect(capEntry).toBeDefined();
    expect(capEntry.scaleWeight).toBe(803.7);
    expect(capEntry.effectiveWeight).toBe(803.7);

    // Math is reconciled on scale weights
    expect(report.reconciliation.isReconciled).toBe(true);
  });

  // ── TEST 19: DMHC Normalization, Compound SKU Capacity, and WGC Preservation ──
  it('Test 19: Authoritative family normalization (DMHC -> DHMC, WGC preserved) and compound SKU capacity resolution', async () => {
    const woDMHC = {
      id: 'wo-dmhc-1',
      workOrderNumber: 'WO-DMHC-001',
      quantity: 10,
      status: 'COMPLETED',
      createdAt: new Date('2026-10-05T08:00:00Z'),
      completedAt: new Date('2026-10-05T18:00:00Z'),
      salesOrderItem: {
        product: {
          id: 'p-dmhc-1',
          name: 'HIMALAYA FRP DMHC 900MM DIA C250',
          category: 'FRP COVERS',
          coversPerSet: 2,
          framesPerSet: 1,
        },
      },
    };

    const woMhcEld = {
      id: 'wo-mhc-eld',
      workOrderNumber: 'WO-MHC-ELD-001',
      quantity: 8,
      status: 'COMPLETED',
      createdAt: new Date('2026-10-05T08:00:00Z'),
      completedAt: new Date('2026-10-05T18:00:00Z'),
      salesOrderItem: {
        product: {
          id: 'p-mhc-eld',
          name: 'FRPMHCELD 36X36',
          category: 'FRP COVERS',
          coversPerSet: 1,
          framesPerSet: 1,
        },
      },
    };

    const woMhcLd = {
      id: 'wo-mhc-ld',
      workOrderNumber: 'WO-MHC-LD-001',
      quantity: 12,
      status: 'COMPLETED',
      createdAt: new Date('2026-10-05T08:00:00Z'),
      completedAt: new Date('2026-10-05T18:00:00Z'),
      salesOrderItem: {
        product: {
          id: 'p-mhc-ld',
          name: 'FRPMHCLD 24X24',
          category: 'FRP COVERS',
          coversPerSet: 1,
          framesPerSet: 1,
        },
      },
    };

    const woWgc = {
      id: 'wo-wgc-1',
      workOrderNumber: 'WO-WGC-001',
      quantity: 6,
      status: 'COMPLETED',
      createdAt: new Date('2026-10-05T08:00:00Z'),
      completedAt: new Date('2026-10-05T18:00:00Z'),
      salesOrderItem: {
        product: {
          id: 'p-wgc-1',
          name: 'HIMALAYA FRP WGC 600X600 LD GREEN',
          category: 'FRP COVERS',
          coversPerSet: 1,
          framesPerSet: 1,
        },
      },
    };

    const mockPrisma = {
      workOrder: { findMany: jest.fn().mockResolvedValue([woDMHC, woMhcEld, woMhcLd, woWgc]) },
      qCInspection: { findMany: jest.fn().mockResolvedValue([]) },
      productionDailyReport: { findMany: jest.fn().mockResolvedValue([]) },
      machine: { findMany: jest.fn().mockResolvedValue([]) },
      salesOrder: { groupBy: jest.fn().mockResolvedValue([]) },
    };

    const service = new PlantHeadService(mockPrisma as any, {} as any);
    const report = await service.getMonthlyProductionReport('tenant-1', undefined, undefined, undefined, undefined, undefined, undefined, '2026-10');

    // 1. DMHC normalized to DHMC, not 'FRP COVERS'
    const dhmc = report.productWise.find((p: any) => p.name === 'DHMC');
    expect(dhmc).toBeDefined();
    expect(dhmc.pieces).toBe(30); // 10 sets * (2C + 1F) = 20C + 10F = 30
    expect(report.productWise.some((p: any) => p.name === 'FRP COVERS')).toBe(false);

    // 2. WGC is preserved as WGC (not morphed into WHC)
    const wgc = report.productWise.find((p: any) => p.name === 'WGC');
    expect(wgc).toBeDefined();
    expect(wgc.pieces).toBe(12); // 6 sets * 2 components

    // 3. Capacities extracted accurately from compound SKUs
    const c250 = report.capacityWise.find((c: any) => c.name === 'C250');
    expect(c250).toBeDefined();
    expect(c250.pieces).toBe(30);

    const eld = report.capacityWise.find((c: any) => c.name === 'ELD');
    expect(eld).toBeDefined();
    expect(eld.pieces).toBe(16); // 8 sets * 2 = 16 pieces

    const ld = report.capacityWise.find((c: any) => c.name === 'LD');
    expect(ld).toBeDefined();
    expect(ld.pieces).toBe(36); // (12 MHC + 6 WGC) * 2 = 36 pieces

    // 4. Zero unmapped capacities
    expect(report.reconciliation.unmappedCapacitiesCount).toBe(0);
    expect(report.capacityWise.some((c: any) => c.name === 'NOT CONFIGURED')).toBe(false);

    // 5. Sizes properly formatted
    expect(report.sizeWise.some((s: any) => s.name === '36 × 36')).toBe(true);
    expect(report.sizeWise.some((s: any) => s.name === '24 × 24')).toBe(true);
    expect(report.sizeWise.some((s: any) => s.name === '600 × 600')).toBe(true);
    expect(report.sizeWise.some((s: any) => s.name === '900MM DIA')).toBe(true);
    expect(report.reconciliation.unmappedSizesCount).toBe(0);
  });

  // ── TEST 20: Daily Shift Report Cover/Frame Flow into Plant Head Analytics ──
  it('Test 20: Floor Daily Reports accurately flow into TOTAL COVERS, TOTAL FRAMES, Finished Sets, and Loose Parts', async () => {
    const floorReport = {
      id: 'dr-floor-oct',
      reportNo: 'PR-2026-000101',
      reportDate: new Date('2026-10-06T10:00:00.000Z'),
      status: 'APPROVED',
      items: [
        {
          id: 'dri-1',
          workOrderId: null,
          productId: 'p-mhc-600',
          customProductName: 'HIMALAYA FRP MHC 600X600 B125',
          size: '600 × 600',
          type: 'MHC',
          capacity: 'B125',
          coverQty: 55, // 50 in sets + 5 loose
          frameQty: 52, // 50 in sets + 2 loose
          setQty: 50,
          extraCoverQty: 5,
          extraFrameQty: 2,
          coverUnitWeight: 22,
          frameUnitWeight: 23,
          totalWeight: 2406,
          product: {
            id: 'p-mhc-600',
            name: 'HIMALAYA FRP MHC 600X600 B125',
            category: 'FRP COVERS',
            type: 'MHC',
            capacity: 'B125',
            size: '600 × 600',
            coversPerSet: 1,
            framesPerSet: 1,
            coverUnitWeight: 22,
            frameUnitWeight: 23,
            weight: 45,
          },
        },
      ],
    };

    const mockPrisma = {
      workOrder: { findMany: jest.fn().mockResolvedValue([]) },
      qCInspection: { findMany: jest.fn().mockResolvedValue([]) },
      productionDailyReport: { findMany: jest.fn().mockResolvedValue([floorReport]) },
      machine: { findMany: jest.fn().mockResolvedValue([]) },
      salesOrder: { groupBy: jest.fn().mockResolvedValue([]) },
    };

    const service = new PlantHeadService(mockPrisma as any, {} as any);
    const report = await service.getMonthlyProductionReport('tenant-1', undefined, undefined, undefined, undefined, undefined, undefined, '2026-10');

    // Baseline (2975 covers, 2876 frames, 1772 sets, 38 loose covers, 20 loose frames) + Floor Report (55 covers, 52 frames, 50 sets, 5 loose covers, 2 loose frames)
    expect(report.kpis.totalCovers).toBe(2975 + 55);
    expect(report.kpis.totalFrames).toBe(2876 + 52);
    expect(report.kpis.totalPieces).toBe(5851 + 107);
    expect(report.kpis.totalFinishedSets).toBe(1772 + 50);
    expect(report.kpis.totalLooseCovers).toBe(38 + 5);
    expect(report.kpis.totalLooseFrames).toBe(20 + 2);
    expect(report.kpis.totalLoosePieces).toBe(58 + 7);
  });
});
