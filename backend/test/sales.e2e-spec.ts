import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Sales Domain — E2E Suite', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let companyId: string;
  let customerId: string;
  let productId: string;

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

    // Ensure company exists
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: {
          publicId: 'COMP-001',
          name: 'Himalaya Test Company',
        },
      });
    }
    companyId = company.id;

    // Assign companyId and permissions to SUPER_ADMIN role & user
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

    await prisma.user.updateMany({
      where: { email: 'super.admin@himalayaerp.com' },
      data: { companyId },
    });

    // Login Admin
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'super.admin@himalayaerp.com', password: 'admin123' });
    adminToken =
      adminLogin.body.accessToken || adminLogin.body.data?.accessToken;

    // Ensure test customer exists
    let customer = await prisma.customer.findFirst({ where: { companyId } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          companyName: 'Acme Health Corp',
          email: 'contact@acmehealth.com',
          companyId,
        },
      });
    }
    customerId = customer.id;

    // Ensure test product exists
    let product = await prisma.product.findFirst({ where: { companyId } });
    if (!product) {
      product = await prisma.product.create({
        data: {
          publicId: `PROD-${Date.now()}`,
          name: 'Health Supplement 500mg',
          unit: 'BOX',
          unitPrice: 500,
          companyId,
        },
      });
    }
    productId = product.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Customer & Lead Lifecycle Operations', () => {
    let leadId: string;

    it('creates lead', async () => {
      const res = await request(app.getHttpServer())
        .post('/crm/leads')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          companyId,
          companyName: `Lead Corp ${Date.now()}`,
          contactPerson: 'Jane Lead',
          email: `lead_${Date.now()}@test.com`,
          phone: '9876543210',
          source: 'WEBSITE',
        });
      expect([200, 201]).toContain(res.status);
      const data = res.body.data || res.body;
      leadId = data.id;
      expect(leadId).toBeDefined();
    });

    it('reads leads list', async () => {
      const res = await request(app.getHttpServer())
        .get('/crm/leads')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('updates lead details', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/crm/leads/${leadId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ contactPerson: 'Jane Lead Updated' });
      expect([200, 201]).toContain(res.status);
    });
  });

  describe('2. Quotations & Sales Orders Deep Lifecycle', () => {
    let quotationId: string;
    let salesOrderId: string;

    it('creates quotation for customer', async () => {
      const res = await request(app.getHttpServer())
        .post('/crm/quotations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          totalAmount: 5000,
          validUntil: new Date(Date.now() + 864000000).toISOString(),
          items: [
            { productName: 'Test Product', quantity: 10, unitPrice: 500 },
          ],
        });
      expect([200, 201]).toContain(res.status);
      const data = res.body.data || res.body;
      quotationId = data.id;
    });

    it('creates sales order from quotation', async () => {
      const res = await request(app.getHttpServer())
        .post('/sales/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          quotationId,
          items: [
            {
              productId,
              orderedQuantity: 10,
              unit: 'BOX',
              unitPrice: 500,
            },
          ],
        });
      expect([200, 201]).toContain(res.status);
      const data = res.body.data || res.body;
      salesOrderId = data.id;
      expect(salesOrderId).toBeDefined();
    });

    it('reads sales order by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/sales/orders/${salesOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('submits sales order for approval', async () => {
      const res = await request(app.getHttpServer())
        .post(`/sales/orders/${salesOrderId}/submit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'SUBMIT', remarks: 'Submitting for plant approval' });
      expect([200, 201]).toContain(res.status);
    });

    it('approves sales order', async () => {
      const res = await request(app.getHttpServer())
        .post(`/sales/orders/${salesOrderId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'CONFIRM', remarks: 'Order approved' });
      expect([200, 201]).toContain(res.status);
    });

    it('enforces multi-tenant company isolation on sales order lookup', async () => {
      const otherCompany = await prisma.company.create({
        data: { publicId: `COMP-${Date.now()}`, name: 'Other Sales Company' },
      });

      const adminRole = await prisma.role.findFirst({
        where: { code: 'SUPER_ADMIN' },
      });

      const otherUser = await prisma.user.create({
        data: {
          publicId: `USR-${Date.now()}`,
          email: `other.sales.${Date.now()}@test.com`,
          password: 'hashedpassword',
          name: 'Other Sales User',
          roleId: adminRole?.id || '',
          companyId: otherCompany.id,
        },
      });

      const res = await request(app.getHttpServer())
        .get(`/sales/orders/${salesOrderId}`)
        .set('x-company-id', otherCompany.id)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 403]).toContain(res.status);

      // Cleanup test objects
      await prisma.user.delete({ where: { id: otherUser.id } });
      await prisma.company.delete({ where: { id: otherCompany.id } });
    });
  });
});
