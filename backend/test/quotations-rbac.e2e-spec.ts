import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

interface ResponseBody {
  data?: {
    accessToken?: string;
  };
  accessToken?: string;
}

const api = (app: INestApplication) =>
  request(app.getHttpServer() as Parameters<typeof request>[0]);

describe('Quotations RBAC E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let salesExecToken: string;
  let salesMgrToken: string;
  let superAdminToken: string;
  let hrToken: string;

  beforeAll(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = mod.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Ensure permissions exist in test DB
    const quotationPermCodes = [
      'crm.quotations.read',
      'crm.quotations.create',
      'crm.quotations.update',
      'crm.quotations.send',
      'crm.quotations.accept',
      'crm.quotations.convert',
      'crm.quotations.delete',
    ];

    for (const code of quotationPermCodes) {
      await prisma.permission.upsert({
        where: { code },
        update: {},
        create: { code, name: code, publicId: `PERM-${code}` },
      });
    }

    // Ensure roles exist and permissions assigned
    const salesExecRole = await prisma.role.findUnique({ where: { code: 'SALES_EXECUTIVE' } });
    if (salesExecRole) {
      const perms = await prisma.permission.findMany({
        where: { code: { in: ['crm.quotations.read', 'crm.quotations.create', 'crm.quotations.update', 'crm.quotations.send'] } },
      });
      for (const perm of perms) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: salesExecRole.id, permissionId: perm.id } },
          update: {},
          create: { roleId: salesExecRole.id, permissionId: perm.id },
        });
      }
    }

    const salesMgrRole = await prisma.role.findUnique({ where: { code: 'SALES_MANAGER' } });
    if (salesMgrRole) {
      const perms = await prisma.permission.findMany({
        where: { code: { in: quotationPermCodes } },
      });
      for (const perm of perms) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: salesMgrRole.id, permissionId: perm.id } },
          update: {},
          create: { roleId: salesMgrRole.id, permissionId: perm.id },
        });
      }
    }

    const superAdminRole = await prisma.role.findUnique({ where: { code: 'SUPER_ADMIN' } });
    if (superAdminRole) {
      const allPerms = await prisma.permission.findMany();
      for (const perm of allPerms) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: perm.id } },
          update: {},
          create: { roleId: superAdminRole.id, permissionId: perm.id },
        });
      }
    }

    // Obtain fresh JWTs after seeding
    const loginUser = async (email: string) => {
      const res = await api(app)
        .post('/auth/login')
        .send({ email, password: 'admin123' })
        .expect(201);
      const body = res.body as ResponseBody;
      return body.data?.accessToken || body.accessToken || '';
    };

    salesExecToken = await loginUser('sales.executive@himalayaerp.com');
    salesMgrToken = await loginUser('sales.manager@himalayaerp.com');
    superAdminToken = await loginUser('super.admin@himalayaerp.com');
    hrToken = await loginUser('hr@himalayaerp.com');
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Unauthenticated request to GET /crm/quotations returns 401', async () => {
    const res = await api(app).get('/crm/quotations');
    expect(res.status).toBe(401);
  });

  it('2. User without crm.quotations.read (HR role) returns 403', async () => {
    const res = await api(app)
      .get('/crm/quotations')
      .set('Authorization', `Bearer ${hrToken}`);
    expect(res.status).toBe(403);
    expect(res.body.message || res.body.error?.message).toContain('Insufficient permissions');
  });

  it('3. Sales Executive with crm.quotations.read returns 200', async () => {
    const res = await api(app)
      .get('/crm/quotations')
      .set('Authorization', `Bearer ${salesExecToken}`);
    expect(res.status).toBe(200);
    const list = Array.isArray(res.body) ? res.body : res.body.data;
    expect(Array.isArray(list)).toBe(true);
  });

  it('4. Sales Manager returns 200', async () => {
    const res = await api(app)
      .get('/crm/quotations')
      .set('Authorization', `Bearer ${salesMgrToken}`);
    expect(res.status).toBe(200);
    const list = Array.isArray(res.body) ? res.body : res.body.data;
    expect(Array.isArray(list)).toBe(true);
  });

  it('5. Super Admin returns 200', async () => {
    const res = await api(app)
      .get('/crm/quotations')
      .set('Authorization', `Bearer ${superAdminToken}`);
    expect(res.status).toBe(200);
    const list = Array.isArray(res.body) ? res.body : res.body.data;
    expect(Array.isArray(list)).toBe(true);
  });
});
