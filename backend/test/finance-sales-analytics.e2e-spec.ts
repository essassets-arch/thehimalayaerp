import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Finance Sales Analytics — E2E Suite', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let companyId: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Sales Analytics APIs', () => {
    it('GET /finance/sales-analytics/summary requires authentication', async () => {
      await request(app.getHttpServer())
        .get('/finance/sales-analytics/summary')
        .expect(401);
    });

    it('GET /finance/sales-analytics/summary returns valid summary data', async () => {
      const res = await request(app.getHttpServer())
        .get('/finance/sales-analytics/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toBeDefined();
      expect(typeof res.body.data.summary.totalSalespersons).toBe('number');
      expect(typeof res.body.data.summary.confirmedSalesValue).toBe('number');
    });

    it('GET /finance/sales-analytics/salespersons returns salesperson table', async () => {
      const res = await request(app.getHttpServer())
        .get('/finance/sales-analytics/salespersons')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.salespersons)).toBe(true);
    });

    it('GET /finance/sales-analytics/charts returns trend charts data', async () => {
      const res = await request(app.getHttpServer())
        .get('/finance/sales-analytics/charts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.monthlyTrend).toBeDefined();
    });

    it('GET /finance/sales-analytics/export returns sanitized CSV data', async () => {
      const res = await request(app.getHttpServer())
        .get('/finance/sales-analytics/export')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.rows)).toBe(true);
    });
  });
});
