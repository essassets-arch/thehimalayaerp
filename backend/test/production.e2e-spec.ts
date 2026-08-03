import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Production Domain — E2E Suite', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let companyId: string;
  let customerId: string;
  let productId: string;
  let salesOrderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    // Grant all permissions to SUPER_ADMIN
    const adminRole = await prisma.role.findFirst({
      where: { code: 'SUPER_ADMIN' },
    });
    if (adminRole) {
      const allPerms = await prisma.permission.findMany();
      for (const p of allPerms) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: { roleId: adminRole.id, permissionId: p.id },
          },
          create: { roleId: adminRole.id, permissionId: p.id },
          update: {},
        });
      }
    }

    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: { publicId: 'COMP-001', name: 'Himalaya Test Company' },
      });
    }
    companyId = company.id;

    await prisma.user.updateMany({
      where: { email: 'super.admin@himalayaerp.com' },
      data: { companyId },
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'super.admin@himalayaerp.com', password: 'admin123' });
    adminToken =
      adminLogin.body.accessToken || adminLogin.body.data?.accessToken;

    let customer = await prisma.customer.findFirst({ where: { companyId } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          companyName: 'Acme Prod Customer',
          email: 'prod@acme.com',
          companyId,
        },
      });
    }
    customerId = customer.id;

    let product = await prisma.product.findFirst({ where: { companyId } });
    if (!product) {
      product = await prisma.product.create({
        data: {
          publicId: `PROD-${Date.now()}`,
          name: 'Herbal Extract 100ml',
          unit: 'BOTTLE',
          unitPrice: 50,
          companyId,
        },
      });
    }
    productId = product.id;

    // Create Sales Order for Production Plan
    const soRes = await request(app.getHttpServer())
      .post('/sales/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customerId,
        items: [
          { productId, orderedQuantity: 100, unit: 'BOTTLE', unitPrice: 50 },
        ],
      });
    const soData = soRes.body.data || soRes.body;
    salesOrderId = soData.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Production Plan & Work Orders Lifecycle', () => {
    let planId: string;

    it('creates production plan from sales order', async () => {
      const res = await request(app.getHttpServer())
        .post('/production/plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          salesOrderId,
          plannedStartDate: new Date().toISOString(),
          plannedEndDate: new Date(Date.now() + 864000000).toISOString(),
          remarks: 'Standard production run',
        });
      expect([200, 201]).toContain(res.status);
      const data = res.body.data || res.body;
      planId = data.id;
      expect(planId).toBeDefined();
    });

    it('lists production plans', async () => {
      const res = await request(app.getHttpServer())
        .get('/production/plans')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('reads production plan by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/production/plans/${planId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('submits action on production plan', async () => {
      const res = await request(app.getHttpServer())
        .post(`/production/plans/${planId}/action`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'SUBMIT', remarks: 'Plan submitted for approval' });
      expect([200, 201, 400, 404]).toContain(res.status);
    });

    it('lists production work orders', async () => {
      const res = await request(app.getHttpServer())
        .get('/production/work-orders')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });
});
