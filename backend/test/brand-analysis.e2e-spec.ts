import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Brand Analysis Domain — E2E Suite', () => {
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

  describe('1. Brand Analysis Request Operations', () => {
    it('lists brand analysis requests', async () => {
      const res = await request(app.getHttpServer())
        .get('/brand-analysis/super-admin/requests')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });
});
