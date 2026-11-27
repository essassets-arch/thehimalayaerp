import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const boundedDatabaseUrl = (databaseUrl?: string): string => {
  if (!databaseUrl) return '';

  try {
    const url = new URL(databaseUrl);
    // One NestJS process must not consume the whole PostgreSQL connection budget.
    url.searchParams.set(
      'connection_limit',
      process.env.DATABASE_CONNECTION_LIMIT || '20',
    );
    url.searchParams.set(
      'pool_timeout',
      process.env.DATABASE_POOL_TIMEOUT || '20',
    );
    return url.toString();
  } catch {
    // Let Prisma report malformed URLs using its normal, actionable error message.
    return databaseUrl;
  }
};

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      datasources: {
        db: { url: boundedDatabaseUrl(process.env.DATABASE_URL) },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('[PrismaService] Connected to PostgreSQL database.');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
