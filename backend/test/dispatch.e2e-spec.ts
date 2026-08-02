import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

const api = (app: INestApplication<App>) => request(app.getHttpServer());

async function login(app: INestApplication<App>, email: string): Promise<string> {
  const res = await api(app).post('/auth/login').send({ email, password: 'admin123' }).expect(201);
  return res.body?.data?.accessToken as string;
}

describe('Dispatch Workflow (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let dispatchToken: string;
  let dispatchId: string;

  beforeAll(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = mod.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    // Get tokens
    dispatchToken = await login(app, 'dispatch.executive@himalayaerp.com');
  });

  afterAll(async () => {
    await app.close();
  });

  it('should list dispatches', async () => {
    const res = await api(app)
      .get('/logistics/dispatches?status=IN_TRANSIT')
      .set('Authorization', `Bearer ${dispatchToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // Note: Full e2e test creating a dispatch would require a seeded Sales Order and Inventory
  // This verifies the endpoints are mounted and permissions are working correctly.
});
