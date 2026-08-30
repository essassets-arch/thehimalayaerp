import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

jest.setTimeout(60000);

describe('Expense Domain — E2E Suite', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let hrToken: string;
  let salesToken: string;
  let plantHeadToken: string;
  let companyId: string;
  let salesUserId: string;
  let hrUserId: string;

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

    // Get Company
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: { publicId: 'COMP-001', name: 'Himalaya Test Company' },
      });
    }
    companyId = company.id;

    // Set up roles if they don't exist
    const superAdminRole = await prisma.role.upsert({
      where: { code: 'SUPER_ADMIN' },
      update: {},
      create: { publicId: 'R-SA', name: 'Super Admin', code: 'SUPER_ADMIN' },
    });

    const hrRole = await prisma.role.upsert({
      where: { code: 'HR' },
      update: {},
      create: { publicId: 'R-HR', name: 'Human Resources', code: 'HR' },
    });

    const salesRole = await prisma.role.upsert({
      where: { code: 'SALES_EXECUTIVE' },
      update: {},
      create: {
        publicId: 'R-SALES',
        name: 'Sales Executive',
        code: 'SALES_EXECUTIVE',
      },
    });

    const plantHeadRole = await prisma.role.upsert({
      where: { code: 'PLANT_HEAD' },
      update: {},
      create: { publicId: 'R-PH', name: 'Plant Head', code: 'PLANT_HEAD' },
    });

    // Create users if they don't exist
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const superAdminUser = await prisma.user.upsert({
      where: { email: 'super.admin@himalayaerp.com' },
      update: { companyId, roleId: superAdminRole.id },
      create: {
        publicId: 'USR-SA',
        email: 'super.admin@himalayaerp.com',
        password: hashedPassword,
        name: 'Super Admin',
        roleId: superAdminRole.id,
        companyId,
      },
    });

    const hrUser = await prisma.user.upsert({
      where: { email: 'hr@himalayaerp.com' },
      update: { companyId, roleId: hrRole.id },
      create: {
        publicId: 'USR-HR',
        email: 'hr@himalayaerp.com',
        password: hashedPassword,
        name: 'HR Manager',
        roleId: hrRole.id,
        companyId,
      },
    });
    hrUserId = hrUser.id;

    const salesUser = await prisma.user.upsert({
      where: { email: 'sales1@himalayaerp.com' },
      update: { companyId, roleId: salesRole.id },
      create: {
        publicId: 'USR-SALES',
        email: 'sales1@himalayaerp.com',
        password: hashedPassword,
        name: 'Sales Exec 1',
        roleId: salesRole.id,
        companyId,
      },
    });
    salesUserId = salesUser.id;

    const plantHeadUser = await prisma.user.upsert({
      where: { email: 'planthead@himalayaerp.com' },
      update: { companyId, roleId: plantHeadRole.id },
      create: {
        publicId: 'USR-PH',
        email: 'planthead@himalayaerp.com',
        password: hashedPassword,
        name: 'Plant Head User',
        roleId: plantHeadRole.id,
        companyId,
      },
    });

    // Login and get tokens
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'super.admin@himalayaerp.com', password: 'admin123' });
    adminToken =
      adminLogin.body.accessToken || adminLogin.body.data?.accessToken;

    const hrLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'hr@himalayaerp.com', password: 'admin123' });
    hrToken = hrLogin.body.accessToken || hrLogin.body.data?.accessToken;

    const salesLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'sales1@himalayaerp.com', password: 'admin123' });
    salesToken =
      salesLogin.body.accessToken || salesLogin.body.data?.accessToken;

    const phLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'planthead@himalayaerp.com', password: 'admin123' });
    plantHeadToken = phLogin.body.accessToken || phLogin.body.data?.accessToken;
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  describe('Expense APIs', () => {
    let expenseId: string;

    it('submits a new expense claim as Sales', async () => {
      const res = await request(app.getHttpServer())
        .post('/expenses')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          expenseName: 'Client Site Conveyance',
          amount: 1500.5,
          expenseDate: new Date(),
        });

      expect(res.status).toBe(201);
      console.log(
        'SUBMIT EXPENSE RESPONSE BODY:',
        JSON.stringify(res.body, null, 2),
      );
      expect(res.body.success).toBe(true);
      expect(res.body.data.expenseName).toBe('Client Site Conveyance');
      expect(res.body.data.status).toBe('PENDING_HR');
      expenseId = res.body.data.id;
    });

    it('lists my expenses as Sales', async () => {
      const res = await request(app.getHttpServer())
        .get('/expenses/my')
        .set('Authorization', `Bearer ${salesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].expenseName).toBe('Client Site Conveyance');
    });

    it('lists pending expenses as HR', async () => {
      const res = await request(app.getHttpServer())
        .get('/expenses/pending')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const claim = res.body.data.find((e: any) => e.id === expenseId);
      expect(claim).toBeDefined();
      expect(claim.status).toBe('PENDING_HR');
    });

    it('approves expense as HR (sends to APPROVED directly)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/expenses/${expenseId}/approve`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ remarks: 'Looks good' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('APPROVED');
    });

    it('lists pending expenses as Super Admin (operational claim is not there)', async () => {
      const res = await request(app.getHttpServer())
        .get('/expenses/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const claim = res.body.data.find((e: any) => e.id === expenseId);
      expect(claim).toBeUndefined();
    });

    it('submits a new expense claim as Plant Head (goes straight to PENDING_SUPER_ADMIN)', async () => {
      const res = await request(app.getHttpServer())
        .post('/expenses')
        .set('Authorization', `Bearer ${plantHeadToken}`)
        .send({
          expenseName: 'Plant Machine Part Conveyance',
          amount: 4500.0,
          expenseDate: new Date(),
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING_SUPER_ADMIN');

      const plantHeadClaimId = res.body.data.id;

      // HR checks pending list -> should NOT see it
      const hrRes = await request(app.getHttpServer())
        .get('/expenses/pending')
        .set('Authorization', `Bearer ${hrToken}`);
      const hrClaim = hrRes.body.data?.find(
        (e: any) => e.id === plantHeadClaimId,
      );
      expect(hrClaim).toBeUndefined();

      // Super Admin checks pending list -> should see it
      const adminRes = await request(app.getHttpServer())
        .get('/expenses/pending')
        .set('Authorization', `Bearer ${adminToken}`);
      const adminClaim = adminRes.body.data?.find(
        (e: any) => e.id === plantHeadClaimId,
      );
      expect(adminClaim).toBeDefined();

      // Super Admin approves Plant Head claim -> becomes APPROVED
      const approveRes = await request(app.getHttpServer())
        .patch(`/expenses/${plantHeadClaimId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ remarks: 'Approved by SA' });
      expect(approveRes.status).toBe(200);
      expect(approveRes.body.data.status).toBe('APPROVED');
    });
  });
});
