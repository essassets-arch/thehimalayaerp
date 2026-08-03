import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

const hashAsync = hash as unknown as (
  data: string,
  saltOrRounds: number,
) => Promise<string>;

interface ResponseBody {
  data?: {
    accessToken?: string;
    elevationToken?: string;
    id?: string;
  };
  accessToken?: string;
  elevationToken?: string;
  id?: string;
  error?: {
    message?: string;
  };
}

interface ExpressAppInstance {
  set?: (setting: string, val: unknown) => void;
}

const api = (app: INestApplication) =>
  request(app.getHttpServer() as Parameters<typeof request>[0]);

async function createTestApp() {
  const mod: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = mod.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const instance = app.getHttpAdapter().getInstance() as ExpressAppInstance;
  if (instance && typeof instance.set === 'function') {
    instance.set('trust proxy', 1);
  }
  await app.init();
  const prisma = app.get<PrismaService>(PrismaService);
  return { app, prisma };
}

async function login(app: INestApplication, email: string): Promise<string> {
  const res = await api(app)
    .post('/auth/login')
    .send({ email, password: 'admin123' })
    .expect(201);
  const body = res.body as ResponseBody;
  return body.data?.accessToken || body.accessToken || '';
}

describe('Security Phase D: Independent E2E Tests', () => {
  let prisma: PrismaService;

  let superUserId: string;
  let unprivUserId: string;
  let companyId: string;
  let productId: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    prisma = testApp.prisma;

    const company = await prisma.company.findFirst();
    companyId = company!.id;
    let product = await prisma.product.findFirst();
    if (!product) {
      product = await prisma.product.create({
        data: {
          name: 'Test Product',
          sku: 'TST-001',
          companyId,
          publicId: 'PRD-TEST',
          unit: 'kg',
          unitPrice: 10,
        },
      });
    }
    productId = product.id;

    let warehouse = await prisma.warehouse.findFirst();
    if (!warehouse) {
      warehouse = await prisma.warehouse.create({
        data: { name: 'Test Warehouse', location: 'Test', companyId },
      });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: 'super.admin@himalayaerp.com' },
    });
    superUserId = dbUser!.id;

    const unprivUser = await prisma.user.findUnique({
      where: { email: 'sales.executive@himalayaerp.com' },
    });
    unprivUserId = unprivUser!.id;

    await testApp.app.close();
  });

  afterAll(async () => {
    await prisma.user.updateMany({
      where: {
        email: {
          in: [
            'super.admin@himalayaerp.com',
            'sales.executive@himalayaerp.com',
          ],
        },
      },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  });

  describe('1. Rate Limiting Architecture (Isolated)', () => {
    let localApp: INestApplication;
    beforeAll(async () => {
      const testApp = await createTestApp();
      localApp = testApp.app;
    });
    afterAll(async () => await localApp.close());

    it('Login throttling returns 429 after threshold', async () => {
      const testIp = '10.0.0.1';
      let status = 200;
      for (let i = 0; i < 6; i++) {
        const res = await api(localApp)
          .post('/auth/login')
          .set('X-Forwarded-For', testIp)
          .send({ email: 'fake@example.com', password: 'admin123' });
        status = res.status;
      }
      expect(status).toBe(429);
    });

    it('Refresh throttling returns 429 independently', async () => {
      const testIp = '10.0.0.2';
      let status = 200;
      for (let i = 0; i < 11; i++) {
        const res = await api(localApp)
          .post('/auth/refresh')
          .set('X-Forwarded-For', testIp)
          .send({});
        status = res.status;
      }
      expect(status).toBe(429);
    });
  });

  describe('2. Account Lockout', () => {
    let localApp: INestApplication;
    const testEmail = `lockout-${Date.now()}@test.com`;
    let testUserId: string;

    beforeAll(async () => {
      const testApp = await createTestApp();
      localApp = testApp.app;
      const role = await prisma.role.findFirst();
      const passwordHash = await hashAsync('admin123', 10);
      const user = await prisma.user.create({
        data: {
          email: testEmail,
          password: passwordHash,
          name: 'Lockout Test',
          roleId: role!.id,
          companyId,
          publicId: `U-${Date.now()}`,
        },
      });
      testUserId = user.id;
    });

    afterAll(async () => {
      await prisma.user.delete({ where: { id: testUserId } });
      await localApp.close();
    });

    it('Five login failures trigger lockout', async () => {
      for (let i = 0; i < 5; i++) {
        await api(localApp)
          .post('/auth/login')
          .set('X-Forwarded-For', `10.0.1.${i}`)
          .send({ email: testEmail, password: 'wrongpassword' });
      }
      const user = await prisma.user.findUnique({ where: { id: testUserId } });
      expect(user!.failedLoginAttempts).toBeGreaterThanOrEqual(5);
      expect(user!.lockedUntil).not.toBeNull();
    });

    it('Locked users cannot log in even with correct password', async () => {
      const res = await api(localApp)
        .post('/auth/login')
        .set('X-Forwarded-For', '10.0.1.99')
        .send({ email: testEmail, password: 'admin123' });
      const body = res.body as ResponseBody;
      expect(res.status).toBe(401);
      expect(body.error?.message).toContain('Account is temporarily locked');
    });

    it('Successful login resets failure count', async () => {
      await prisma.user.update({
        where: { id: testUserId },
        data: { failedLoginAttempts: 3, lockedUntil: null },
      });

      const res = await api(localApp)
        .post('/auth/login')
        .set('X-Forwarded-For', '10.0.1.100')
        .send({ email: testEmail, password: 'admin123' });
      expect(res.status).toBe(201);

      const user = await prisma.user.findUnique({ where: { id: testUserId } });
      expect(user!.failedLoginAttempts).toBe(0);
      expect(user!.lockedUntil).toBeNull();
    });
  });

  describe('3. Super Admin Elevation', () => {
    let localApp: INestApplication;
    let elevationToken: string;
    let localSuperToken: string;
    let jwtService: JwtService;

    beforeAll(async () => {
      const testApp = await createTestApp();
      localApp = testApp.app;
      jwtService = localApp.get(JwtService);
      localSuperToken = await login(localApp, 'super.admin@himalayaerp.com');
    });

    afterAll(async () => await localApp.close());

    it('Generates elevation token with valid password', async () => {
      const res = await api(localApp)
        .post('/auth/elevate')
        .set('Authorization', `Bearer ${localSuperToken}`)
        .send({ password: 'admin123' });
      expect(res.status).toBe(201);
      const body = res.body as ResponseBody;
      elevationToken = body.data?.elevationToken || body.elevationToken || '';
      expect(elevationToken).toBeDefined();
    });

    it('Admin unlock requires permission and elevation', async () => {
      const res = await api(localApp)
        .post(`/auth/unlock/${unprivUserId}`)
        .set('Authorization', `Bearer ${localSuperToken}`)
        .set('x-elevation-token', elevationToken);
      expect(res.status).toBe(201);
    });

    it('Ordinary JWT cannot be used as elevation token', async () => {
      const res = await api(localApp)
        .post(`/auth/unlock/${unprivUserId}`)
        .set('Authorization', `Bearer ${localSuperToken}`)
        .set('x-elevation-token', localSuperToken);
      expect(res.status).toBe(401);
    });

    it('Elevation token cannot be used as ordinary access token', async () => {
      const res = await api(localApp)
        .get('/procurement/indents')
        .set('Authorization', `Bearer ${elevationToken}`);
      expect(res.status).toBe(401);
    });

    it('Expired elevation token is rejected', async () => {
      const decoded = jwtService.decode<{ jti: string }>(elevationToken);
      await prisma.elevationSession.update({
        where: { id: decoded.jti },
        data: { expiresAt: new Date(Date.now() - 10000) },
      });

      const res = await api(localApp)
        .post(`/auth/unlock/${unprivUserId}`)
        .set('Authorization', `Bearer ${localSuperToken}`)
        .set('x-elevation-token', elevationToken);
      expect(res.status).toBe(401);
    });
  });

  describe('4. Segregation of Duties (SOD)', () => {
    let localApp: INestApplication;
    let localSuperToken: string;
    let testIndentId: string;

    beforeAll(async () => {
      const testApp = await createTestApp();
      localApp = testApp.app;
      localSuperToken = await login(localApp, 'super.admin@himalayaerp.com');
    });

    afterAll(async () => {
      if (testIndentId) {
        await prisma.purchaseIndentItem.deleteMany({
          where: { purchaseIndentId: testIndentId },
        });
        await prisma.purchaseIndent.delete({ where: { id: testIndentId } });
      }
      await localApp.close();
    });

    it('Creator cannot approve own indent', async () => {
      const res = await api(localApp)
        .post('/procurement/indents')
        .set('Authorization', `Bearer ${localSuperToken}`)
        .send({
          companyId,
          requestedById: superUserId,
          department: 'Test',
          items: [{ productId, quantity: 10 }],
        });
      const body = res.body as ResponseBody;
      testIndentId = body.data?.id || body.id || '';

      await api(localApp)
        .post(`/procurement/indents/${testIndentId}/submit`)
        .set('Authorization', `Bearer ${localSuperToken}`)
        .send({});

      const approveRes = await api(localApp)
        .post(`/procurement/indents/${testIndentId}/approve`)
        .set('Authorization', `Bearer ${localSuperToken}`)
        .send({
          items: [{ productId, approvedQuantity: 10 }],
        });
      const approveBody = approveRes.body as ResponseBody;
      expect([400, 409]).toContain(approveRes.status);
      expect(approveBody.error?.message).toContain('Segregation of Duties');
    });
  });

  describe('5. Row-level access', () => {
    let localApp: INestApplication;
    let localUnprivToken: string;

    beforeAll(async () => {
      const testApp = await createTestApp();
      localApp = testApp.app;
      localUnprivToken = await login(
        localApp,
        'sales.executive@himalayaerp.com',
      );
    });

    afterAll(async () => await localApp.close());

    it('Cross-company reads return no data or 404', async () => {
      const res = await api(localApp)
        .get('/sales/orders')
        .set('Authorization', `Bearer ${localUnprivToken}`);
      expect(res.status).toBe(200);

      const foreignOrder = await prisma.salesOrder.findFirst({
        where: { createdById: { not: unprivUserId } },
      });
      if (foreignOrder) {
        const fetchRes = await api(localApp)
          .get(`/sales/orders/${foreignOrder.id}`)
          .set('Authorization', `Bearer ${localUnprivToken}`);
        expect(fetchRes.status).toBe(404);
      }
    });
  });

  describe('6. Optimistic Concurrency', () => {
    let localApp: INestApplication;
    let localSuperToken: string;
    let concIndentId: string;
    let version: number;

    beforeAll(async () => {
      const testApp = await createTestApp();
      localApp = testApp.app;
      localSuperToken = await login(localApp, 'super.admin@himalayaerp.com');

      const res = await api(localApp)
        .post('/procurement/indents')
        .set('Authorization', `Bearer ${localSuperToken}`)
        .send({
          companyId,
          requestedById: unprivUserId,
          department: 'Test',
          items: [{ productId, quantity: 10 }],
        });
      const body = res.body as ResponseBody;
      concIndentId = body.data?.id || body.id || '';
      const indent = await prisma.purchaseIndent.findUnique({
        where: { id: concIndentId },
      });
      version = indent!.version;
    });

    afterAll(async () => {
      if (concIndentId) {
        await prisma.purchaseIndentItem.deleteMany({
          where: { purchaseIndentId: concIndentId },
        });
        await prisma.purchaseIndent.delete({ where: { id: concIndentId } });
      }
      await localApp.close();
    });

    it('Stale expectedVersion returns 409', async () => {
      const res = await api(localApp)
        .post(`/procurement/indents/${concIndentId}/submit`)
        .set('Authorization', `Bearer ${localSuperToken}`)
        .send({ expectedVersion: version - 1 });
      const body = res.body as ResponseBody;
      expect(res.status).toBe(409);
      expect(body.error?.message).toContain('Concurrency Error');
    });

    it('Successful update increments version exactly once', async () => {
      const res = await api(localApp)
        .post(`/procurement/indents/${concIndentId}/submit`)
        .set('Authorization', `Bearer ${localSuperToken}`)
        .send({ expectedVersion: version });
      expect(res.status).toBe(201);

      const indent = await prisma.purchaseIndent.findUnique({
        where: { id: concIndentId },
      });
      expect(indent!.version).toBe(version + 1);
    });
  });

  describe('7. Route Auth Types (@Public, Private, OptionalAuth)', () => {
    let localApp: INestApplication;
    let localSuperToken: string;

    beforeAll(async () => {
      const testApp = await createTestApp();
      localApp = testApp.app;
      localSuperToken = await login(localApp, 'super.admin@himalayaerp.com');
    });

    afterAll(async () => {
      await localApp.close();
    });

    it('@Public route accepts request without Bearer token', async () => {
      const res = await api(localApp).get('/crm/leads');
      expect(res.status).toBe(200);
    });

    it('Private route rejects request without Bearer token (HTTP 401)', async () => {
      const res = await api(localApp).get('/procurement/indents');
      expect(res.status).toBe(401);
    });

    it('Private route accepts request with valid Bearer token', async () => {
      const res = await api(localApp)
        .get('/procurement/indents')
        .set('Authorization', `Bearer ${localSuperToken}`);
      expect(res.status).toBe(200);
    });
  });
});
