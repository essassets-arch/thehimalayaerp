import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Leave Domain — E2E Suite', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let hrToken: string;
  let salesToken: string;
  let plantHeadToken: string;
  let companyId: string;
  let leaveId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);

    // Resolve test company
    const company = await prisma.company.findFirst();
    if (!company) {
      throw new Error('Test environment missing seeded Company.');
    }
    companyId = company.id;

    // Resolve or upsert Roles
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

    // Create users
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 12);

    await prisma.user.upsert({
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

    await prisma.user.upsert({
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

    await prisma.user.upsert({
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

    await prisma.user.upsert({
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

    // Login and retrieve tokens
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
    await prisma.$disconnect();
    await app.close();
  });

  describe('Leave Requests Flow', () => {
    it('submits a new leave request as Sales employee (goes to PENDING_HR)', async () => {
      const res = await request(app.getHttpServer())
        .post('/leaves')
        .set('Authorization', `Bearer ${salesToken}`)
        .send({
          leaveType: 'CASUAL',
          fromDate: '2026-08-20',
          toDate: '2026-08-22',
          reason: 'Family event',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING_HR');
      leaveId = res.body.data.id;
    });

    it('lists pending leave requests as HR (sees the Sales request)', async () => {
      const res = await request(app.getHttpServer())
        .get('/leaves/pending')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const requestItem = res.body.data.find((l: any) => l.id === leaveId);
      expect(requestItem).toBeDefined();
    });

    it('approves the leave request as HR (status changes directly to APPROVED)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/leaves/${leaveId}/approve`)
        .set('Authorization', `Bearer ${hrToken}`)
        .send({ remarks: 'Approved by HR' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('APPROVED');
    });

    it('lists pending leaves as Super Admin (the Sales request is gone)', async () => {
      const res = await request(app.getHttpServer())
        .get('/leaves/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const requestItem = res.body.data.find((l: any) => l.id === leaveId);
      expect(requestItem).toBeUndefined();
    });

    it('submits a new leave request as Plant Head employee (goes directly to PENDING_SUPER_ADMIN)', async () => {
      const res = await request(app.getHttpServer())
        .post('/leaves')
        .set('Authorization', `Bearer ${plantHeadToken}`)
        .send({
          leaveType: 'CASUAL',
          fromDate: '2026-09-01',
          toDate: '2026-09-03',
          reason: 'Plant Head medical leave',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING_SUPER_ADMIN');

      const plantHeadLeaveId = res.body.data.id;

      // HR checks pending list -> should NOT see it
      const hrRes = await request(app.getHttpServer())
        .get('/leaves/pending')
        .set('Authorization', `Bearer ${hrToken}`);
      const hrLeave = hrRes.body.data?.find(
        (l: any) => l.id === plantHeadLeaveId,
      );
      expect(hrLeave).toBeUndefined();

      // Super Admin checks pending list -> should see it
      const adminRes = await request(app.getHttpServer())
        .get('/leaves/pending')
        .set('Authorization', `Bearer ${adminToken}`);
      const adminLeave = adminRes.body.data?.find(
        (l: any) => l.id === plantHeadLeaveId,
      );
      expect(adminLeave).toBeDefined();

      // Super Admin approves it -> APPROVED directly
      const approveRes = await request(app.getHttpServer())
        .patch(`/leaves/${plantHeadLeaveId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ remarks: 'Approved by SA' });
      expect(approveRes.status).toBe(200);
      expect(approveRes.body.data.status).toBe('APPROVED');
    });
  });
});
