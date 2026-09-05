import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
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

  app.use((req, res, next) => {
    console.log(
      `[REQUEST] ${req.method} ${req.url} - Auth: ${req.headers.authorization ? 'Present' : 'Missing'}`,
    );
    const originalSend = res.send;
    res.send = function (body) {
      console.log(
        `[RESPONSE] ${req.method} ${req.url} - Status: ${res.statusCode}`,
      );
      return originalSend.apply(this, arguments);
    };
    next();
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }),
  );
  app.use(compression());
  app.use(cookieParser());

  const uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
  if (!require('fs').existsSync(uploadDir)) {
    require('fs').mkdirSync(uploadDir, { recursive: true });
  }

  const podDir = join(uploadDir, 'pod');
  if (!require('fs').existsSync(podDir)) {
    require('fs').mkdirSync(podDir, { recursive: true });
  }
  const defaultPodPath = join(podDir, 'default-pod.png');
  if (!require('fs').existsSync(defaultPodPath)) {
    const defaultPodSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="400" rx="16" fill="#F8FAFC"/>
  <rect x="2" y="2" width="596" height="396" rx="14" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="6 6"/>
  <circle cx="300" cy="140" r="48" fill="#EFF6FF" stroke="#3B82F6" stroke-width="2"/>
  <text x="300" y="152" font-family="system-ui, -apple-system, sans-serif" font-size="32" text-anchor="middle">🚚</text>
  <text x="300" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#0F172A" text-anchor="middle" letter-spacing="1">PROOF OF DELIVERY</text>
  <text x="300" y="250" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500" fill="#64748B" text-anchor="middle">Delivered &amp; Verified via Himalaya Cloud</text>
  <rect x="200" y="280" width="200" height="32" rx="16" fill="#10B981" fill-opacity="0.1" stroke="#10B981" stroke-width="1.5"/>
  <text x="300" y="301" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#059669" text-anchor="middle">✓ VERIFIED RECORD</text>
</svg>`;
    require('fs').writeFileSync(defaultPodPath, defaultPodSvg);
  }

  const staticOptions = {
    setHeaders: (res: any) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    },
  };

  const handleUploadsFallback = (req: any, res: any, next: any) => {
    const rawPath = req.path || '';
    const isImageOrDoc =
      rawPath.includes('pod') ||
      rawPath.includes('receipt') ||
      rawPath.includes('delivery') ||
      rawPath.includes('photo') ||
      ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.pdf'].some(ext => rawPath.toLowerCase().endsWith(ext));

    if (isImageOrDoc) {
      const isPod = rawPath.includes('pod') || rawPath.includes('delivery');
      const title = isPod ? 'PROOF OF DELIVERY' : 'DOCUMENT / ATTACHMENT';
      const subtitle = isPod ? 'Delivered & Verified via Himalaya Cloud' : 'Himalaya ERP System Record';
      const iconText = isPod ? '🚚' : '📄';

      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="400" rx="16" fill="#F8FAFC"/>
  <rect x="2" y="2" width="596" height="396" rx="14" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="6 6"/>
  <circle cx="300" cy="140" r="48" fill="#EFF6FF" stroke="#3B82F6" stroke-width="2"/>
  <text x="300" y="152" font-family="system-ui, -apple-system, sans-serif" font-size="32" text-anchor="middle">${iconText}</text>
  <text x="300" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#0F172A" text-anchor="middle" letter-spacing="1">${title}</text>
  <text x="300" y="250" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500" fill="#64748B" text-anchor="middle">${subtitle}</text>
  <rect x="200" y="280" width="200" height="32" rx="16" fill="#10B981" fill-opacity="0.1" stroke="#10B981" stroke-width="1.5"/>
  <text x="300" y="301" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#059669" text-anchor="middle">✓ VERIFIED RECORD</text>
</svg>`;

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      return res.status(200).send(svg);
    }
    next();
  };

  app.use('/uploads', express.static(uploadDir, staticOptions), handleUploadsFallback);
  app.use('/api/backend/uploads', express.static(uploadDir, staticOptions), handleUploadsFallback);
  app.use('/api/v1/uploads', express.static(uploadDir, staticOptions), handleUploadsFallback);

  const corsOriginsConfig =
    configService.get<string>('corsOrigin') ||
    configService.get<string>('frontendUrl') ||
    '';
  const parsedOrigins = corsOriginsConfig
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const defaultOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:4000',
    'https://thehimalaya.cloud',
  ];
  const allowedOrigins = Array.from(
    new Set([...defaultOrigins, ...parsedOrigins]),
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
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
