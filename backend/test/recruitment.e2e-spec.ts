import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Recruitment Domain — E2E Suite', () => {
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

  describe('1. Recruitment Request Operations', () => {
    let requestId: string;

    it('creates recruitment request', async () => {
      const res = await request(app.getHttpServer())
        .post('/hr/recruitment-requests')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: `Senior Chemist ${Date.now()}`,
          designation: 'Senior Chemist',
          department: 'QUALITY_CONTROL',
          vacancies: 2,
          reasonForHiring: 'EXPANSION',
          jobDescription: 'Conduct HPLC and QA testing',
          targetDate: new Date(Date.now() + 864000000).toISOString(),
        });
      expect([200, 201]).toContain(res.status);
      const data = res.body.data || res.body;
      requestId = data.id;
      expect(requestId).toBeDefined();
    });

    it('lists all recruitment requests', async () => {
      const res = await request(app.getHttpServer())
        .get('/hr/recruitment-requests')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });
});
