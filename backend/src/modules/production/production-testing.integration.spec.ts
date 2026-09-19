import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { ProductionTestingService } from './production-testing.service';
import { ProductionWorkflowService } from './production-workflow.service';
import { InventoryService } from '../inventory/inventory.service';
import { PrismaService } from '../../database/prisma.service';
import { Test } from '@nestjs/testing';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import request from 'supertest';
import { ProductionTestingController } from './production-testing.controller';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { ProductsController } from '../products/products.controller';
import { ProductsService } from '../products/products.service';
import { readFileSync } from 'fs';
import { join } from 'path';

const url = process.env.TEST_DATABASE_URL;
const integration = url ? describe : describe.skip;
if (url) {
  const parsed = new URL(url);
  if (
    !['127.0.0.1', 'localhost'].includes(parsed.hostname) ||
    !parsed.pathname.startsWith('/testing_')
  ) {
    throw new Error(
      'Tests require an explicitly configured isolated localhost testing_* database.',
    );
  }
}

integration('Testing inventory integration (real PostgreSQL)', () => {
  const db = new PrismaClient({
    datasources: {
      db: { url: url || 'postgresql://unused:unused@127.0.0.1/testing_unused' },
    },
  });
  const prisma = db as PrismaService;
  const inventory = new InventoryService(prisma);
  const workflow = new ProductionWorkflowService(prisma, inventory);
  const service = new ProductionTestingService(prisma, inventory, workflow);
  let app: INestApplication;
  const jwt = new JwtService({ secret: 'isolated-test-secret' });
  let companyId: string, userId: string, planId: string, warehouseId: string;
  beforeAll(async () => {
    const key = randomUUID();
    const company = await db.company.create({
      data: { publicId: key, name: 'Isolated testing fixture' },
    });
    companyId = company.id;
    const role = await db.role.create({
      data: { publicId: key, code: key, name: 'Testing fixture' },
    });
    const user = await db.user.create({
      data: {
        publicId: key,
        name: 'Test operator',
        email: key + '@test.invalid',
        password: 'not-a-login',
        companyId,
        roleId: role.id,
      },
    });
    userId = user.id;
    const plan = await db.productionPlan.create({
      data: {
        planNumber: key,
        salesOrder: {
          create: {
            orderNumber: key,
            subtotal: 0,
            taxableAmount: 0,
            totalAmount: 0,
            createdById: userId,
            customer: {
              create: { companyId, companyName: 'Fixture', customerCode: key },
            },
          },
        },
      },
    });
    planId = plan.id;
    const warehouse = await db.warehouse.create({
      data: { companyId, name: 'Fixture' },
    });
    warehouseId = warehouse.id;
    const module = await Test.createTestingModule({
      imports: [PassportModule],
      controllers: [ProductionTestingController, ProductsController],
      providers: [
        { provide: PrismaService, useValue: prisma },
        { provide: ProductionTestingService, useValue: service },
        { provide: ProductsService, useValue: new ProductsService(prisma) },
        {
          provide: ConfigService,
          useValue: new ConfigService({
            jwt: { accessSecret: 'isolated-test-secret' },
          }),
        },
        JwtStrategy,
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: false },
      }),
    );
    await app.init();
  });
  afterAll(async () => {
    await app?.close();
    await db.$disconnect();
  });

  async function fixture(
    quantity: number,
    mode: 'legacy' | 'report' | 'opening' = 'legacy',
    materialized = true,
  ) {
    const key = randomUUID();
    const product = await db.product.create({
      data: {
        publicId: key,
        sku: key,
        name: 'DTCB 100MM ' + key,
        companyId,
        unit: 'PCS',
        unitPrice: 0,
        productType: 'MANUFACTURING',
      },
    });
    if (materialized) {
      const wo = await db.workOrder.create({
        data: {
          workOrderNumber: key,
          productionPlanId: planId,
          quantity,
          status: 'COMPLETED',
        },
      });
      await db.finishedGoods.create({
        data: {
          workOrderId: wo.id,
          productId: product.id,
          quantity,
          availableQuantity: quantity,
          unit: 'PCS',
          status: quantity ? 'AVAILABLE' : 'OUT_OF_STOCK',
        },
      });
    }
    if (mode === 'report')
      await db.productionDailyReport.create({
        data: {
          reportNo: key,
          reportDate: new Date(),
          companyId,
          createdById: userId,
          status: 'SUBMITTED',
          items: {
            create: { productId: product.id, srNo: 1, setQty: quantity },
          },
        },
      });
    if (mode === 'opening')
      await db.inventoryTransaction.create({
        data: {
          companyId,
          warehouseId,
          productId: product.id,
          type: 'OPENING_STOCK',
          quantity,
        },
      });
    return product.id;
  }
  const submit = (
    productId: string,
    quantity: number,
    requestId = randomUUID(),
  ) =>
    service.createTestingRecord(
      { productId, quantity, requestId, remarks: 'Testing sample' },
      userId,
      companyId,
    );
  const balance = async (productId: string) =>
    (
      await workflow.getAllStock(
        companyId,
        userId,
        undefined,
        prisma,
        productId,
      )
    ).items[0].availableStock;

  test('HTTP authenticates, authorizes, validates DTO, and returns persisted stock', async () => {
    const id = await fixture(50);
    const payload = { productId: id, quantity: 5, requestId: randomUUID() };
    await request(app.getHttpServer())
      .post('/production/testing')
      .send(payload)
      .expect(401);
    const readToken = jwt.sign({
      sub: userId,
      companyId,
      permissions: ['production.testing.read'],
    });
    await request(app.getHttpServer())
      .post('/production/testing')
      .auth(readToken, { type: 'bearer' })
      .send(payload)
      .expect(403);
    const token = jwt.sign({
      sub: userId,
      companyId,
      permissions: ['production.testing.create', 'production.testing.read'],
    });
    const catalog = await request(app.getHttpServer())
      .get('/products?scope=catalog&limit=5000')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(catalog.body.some((p: any) => p.id === id)).toBe(true);
    await request(app.getHttpServer())
      .post('/production/testing')
      .auth(token, { type: 'bearer' })
      .send({ ...payload, quantity: 2.5 })
      .expect(400);
    const response = await request(app.getHttpServer())
      .post('/production/testing')
      .auth(token, { type: 'bearer' })
      .send({ ...payload, currentStock: 999, createdById: 'untrusted' })
      .expect(201);
    expect(response.body.stock.remainingQuantity).toBe(45);
    expect(response.body.testingRecord.createdById).toBe(userId);
    const refreshed = await request(app.getHttpServer())
      .get('/production/testing')
      .auth(token, { type: 'bearer' })
      .expect(200);
    expect(
      refreshed.body.data.some(
        (r: any) => r.id === response.body.testingRecord.id,
      ),
    ).toBe(true);
  });

  test.each(['legacy', 'report', 'opening'] as const)(
    '50 minus 5 is persistently 45 (%s)',
    async (mode) => {
      const id = await fixture(50, mode);
      const result = await submit(id, 5);
      expect(result.stock).toEqual({
        productId: id,
        previousQuantity: 50,
        deductedQuantity: 5,
        remainingQuantity: 45,
      });
      expect(await balance(id)).toBe(45);
      const record = await service.getTestingRecord(
        result.testingRecord.id,
        companyId,
      );
      expect(record.productName).toContain('DTCB 100MM');
      expect(record.createdBy.name).toBe('Test operator');
      expect(
        (await service.listTestingRecords(companyId)).some(
          (r) => r.id === record.id,
        ),
      ).toBe(true);
      const history = await db.stockHistory.findFirstOrThrow({
        where: { sourceId: record.id, event: 'TESTING' },
      });
      expect(Number(history.quantity)).toBe(-5);
      expect(Number(history.beforeQuantity)).toBe(50);
      expect(Number(history.afterQuantity)).toBe(45);
      expect(history.actor).toBe(userId);
    },
  );
  test('one minus one reaches zero; another request fails', async () => {
    const id = await fixture(1);
    await submit(id, 1);
    expect(await balance(id)).toBe(0);
    await expect(submit(id, 1)).rejects.toThrow('Insufficient stock');
    expect(
      await db.productionTestingRecord.count({ where: { productId: id } }),
    ).toBe(1);
  });
  test.each([
    [0, 1],
    [3, 5],
  ])(
    'insufficient %s for %s leaves no record or movement',
    async (stock, qty) => {
      const id = await fixture(stock);
      await expect(submit(id, qty)).rejects.toThrow(`Available: ${stock} PCS`);
      expect(await balance(id)).toBe(stock);
      expect(
        await db.productionTestingRecord.count({ where: { productId: id } }),
      ).toBe(0);
      expect(await db.stockHistory.count({ where: { productId: id } })).toBe(0);
    },
  );
  test('simultaneous distinct requests cannot overdraw', async () => {
    const id = await fixture(5, 'report');
    const results = await Promise.allSettled([submit(id, 4), submit(id, 4)]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(await balance(id)).toBe(1);
    expect(
      await db.productionTestingRecord.count({ where: { productId: id } }),
    ).toBe(1);
  });
  test('concurrent duplicate and subsequent retry deduct only once', async () => {
    const id = await fixture(50),
      key = randomUUID();
    const results = await Promise.all([submit(id, 5, key), submit(id, 5, key)]);
    expect(results[0].testingRecord.id).toBe(results[1].testingRecord.id);
    expect((await submit(id, 5, key)).testingRecord.id).toBe(
      results[0].testingRecord.id,
    );
    expect(await balance(id)).toBe(45);
    expect(
      await db.stockHistory.count({
        where: { productId: id, event: 'TESTING' },
      }),
    ).toBe(1);
    await expect(submit(id, 6, key)).rejects.toThrow(
      'different testing record',
    );
  });
  test.each([0, -5, 2.5, NaN, Infinity, '5', null])(
    'rejects invalid quantity %s',
    async (qty) => {
      await expect(submit('unused', qty as number)).rejects.toThrow(
        'positive whole number',
      );
    },
  );
  test('invalid and foreign-company products are rejected', async () => {
    await expect(submit(randomUUID(), 1)).rejects.toThrow(
      'no longer available',
    );
    const id = await fixture(5);
    await expect(
      service.createTestingRecord(
        { productId: id, quantity: 1, requestId: randomUUID() },
        userId,
        randomUUID(),
      ),
    ).rejects.toThrow('no longer available');
  });
  test('history failure rolls back the record and stock update', async () => {
    const id = await fixture(50);
    const broken = new ProductionTestingService(
      prisma,
      {
        stockOutFinishedGoods: async (...args: any[]) => {
          await (inventory.stockOutFinishedGoods as any)(...args);
          throw new Error('Injected failure before commit');
        },
      } as InventoryService,
      workflow,
    );
    await expect(
      broken.createTestingRecord(
        { productId: id, quantity: 5, requestId: randomUUID() },
        userId,
        companyId,
      ),
    ).rejects.toThrow();
    expect(await balance(id)).toBe(50);
    expect(
      await db.productionTestingRecord.count({ where: { productId: id } }),
    ).toBe(0);
    expect(await db.stockHistory.count({ where: { productId: id } })).toBe(0);
  });
  test('existing stock-in and dispatch services work after testing', async () => {
    const id = await fixture(50);
    await submit(id, 5);
    await db.$transaction((tx) =>
      inventory.stockInFinishedGoods(
        tx,
        companyId,
        id,
        10,
        'PRODUCTION',
        randomUUID(),
        null,
        'IN-TEST',
        userId,
      ),
    );
    expect(await balance(id)).toBe(55);
    await db.$transaction((tx) =>
      inventory.stockOutFinishedGoods(
        tx,
        companyId,
        id,
        7,
        'DISPATCH',
        randomUUID(),
        null,
        'OUT-TEST',
        userId,
      ),
    );
    expect(await balance(id)).toBe(48);
  });
  test('consumed opening stock cannot be recreated by dispatch', async () => {
    const id = await fixture(5, 'opening', false);
    await submit(id, 5);
    expect(await balance(id)).toBe(0);
    await expect(
      db.$transaction((tx) =>
        inventory.stockOutFinishedGoods(
          tx,
          companyId,
          id,
          1,
          'DISPATCH',
          randomUUID(),
          null,
          'OUT-TEST',
          userId,
        ),
      ),
    ).rejects.toThrow('Insufficient');
    expect(await balance(id)).toBe(0);
  });
  test('notes remain editable but stock quantities and audit records are immutable', async () => {
    const id = await fixture(5),
      result = await submit(id, 1),
      recordId = result.testingRecord.id;
    await service.updateTestingRecord(
      recordId,
      { remarks: 'Reviewed sample' },
      companyId,
    );
    await expect(
      service.updateTestingRecord(recordId, { quantity: 2 }, companyId),
    ).rejects.toThrow('cannot be changed');
    await expect(
      service.deleteTestingRecord(recordId, companyId),
    ).rejects.toThrow('cannot be deleted');
    await expect(
      service.getTestingRecord(recordId, randomUUID()),
    ).rejects.toThrow('not found');
    expect(await balance(id)).toBe(4);
  });

  test('testing and dispatch cannot consume the same limited stock', async () => {
    const id = await fixture(5);
    const results = await Promise.allSettled([
      submit(id, 4),
      db.$transaction((tx) =>
        inventory.stockOutFinishedGoods(
          tx,
          companyId,
          id,
          4,
          'DISPATCH',
          randomUUID(),
          null,
          'CONCURRENT-OUT',
          userId,
        ),
      ),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(await balance(id)).toBe(1);
  });

  test('reserved stock is not consumed', async () => {
    const id = await fixture(5);
    await db.finishedGoods.updateMany({
      where: { productId: id },
      data: { reservedQuantity: 4, availableQuantity: 1 },
    });
    await expect(submit(id, 2)).rejects.toThrow('Available: 1 PCS');
    await submit(id, 1);
    const fg = await db.finishedGoods.findFirstOrThrow({
      where: { productId: id },
    });
    expect(Number(fg.quantity)).toBe(4);
    expect(Number(fg.reservedQuantity)).toBe(4);
    expect(await balance(id)).toBe(0);
  });

  test('additive migration preserves existing records without stock backfill', async () => {
    const schema = 'migration_' + randomUUID().replace(/-/g, '');
    await db.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    const migrationUrl = new URL(url!);
    migrationUrl.searchParams.set('schema', schema);
    const isolated = new PrismaClient({
      datasources: { db: { url: migrationUrl.toString() } },
    });
    try {
      await isolated.$executeRawUnsafe(
        "CREATE TYPE \"StockHistoryEvent\" AS ENUM ('STOCK_IN', 'DISPATCH_OUT')",
      );
      await isolated.$executeRawUnsafe(
        'CREATE TABLE "Product" ("id" TEXT PRIMARY KEY)',
      );
      await isolated.$executeRawUnsafe(
        'CREATE TABLE "User" ("id" TEXT PRIMARY KEY)',
      );
      await isolated.$executeRawUnsafe(
        'CREATE TABLE "ProductionTestingRecord" ("id" TEXT PRIMARY KEY, "companyId" TEXT NOT NULL, "productName" TEXT NOT NULL, "createdAt" TIMESTAMP NOT NULL)',
      );
      await isolated.$executeRawUnsafe(
        "INSERT INTO \"ProductionTestingRecord\" VALUES ('legacy', 'company', 'Historical sample', NOW())",
      );
      const sql = readFileSync(
        join(
          __dirname,
          '../../..',
          'prisma/migrations/20260919000000_testing_stock_deduction/migration.sql',
        ),
        'utf8',
      );
      for (const statement of sql.split(';').filter((s) => s.trim()))
        await isolated.$executeRawUnsafe(statement);
      const rows = await isolated.$queryRaw<
        any[]
      >`SELECT * FROM "ProductionTestingRecord"`;
      expect(rows).toHaveLength(1);
      expect(rows[0].productName).toBe('Historical sample');
      expect(rows[0].productId).toBeNull();
      expect(rows[0].requestId).toBeNull();
    } finally {
      await isolated.$disconnect();
    }
  });
});
