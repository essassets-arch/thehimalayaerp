import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is missing');
  }

  const parsed = new URL(databaseUrl);
  const databaseName = parsed.pathname.replace(/^\//, '');

  console.log('[STARTUP] Database configuration', {
    host: parsed.hostname,
    port: parsed.port,
    databaseName,
    schema: parsed.searchParams.get('schema') ?? 'public',
    nodeEnv: process.env.NODE_ENV,
  });

  if (
    process.env.NODE_ENV === 'test' &&
    !databaseName.endsWith('_browser_test')
  ) {
    throw new Error(
      `Unsafe test database "${databaseName}". Expected *_browser_test.`,
    );
  }

  const apiPrefix = configService.get<string>('apiPrefix') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  const frontendUrl =
    configService.get<string>('frontendUrl') || 'http://localhost:3000';
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  app.enableShutdownHooks();

  const port = configService.get<number>('port') || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend is running on: http://0.0.0.0:${port}/${apiPrefix}`);
}
bootstrap();
